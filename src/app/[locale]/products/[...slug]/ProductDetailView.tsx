import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import ProductDetailClient from '@/components/products/ProductDetailClient';
import ProductFaqSection from './ProductFaqSection';
import { Product } from '@/lib/api';
import { prisma } from '@/lib/prisma';
import { jsonLdFAQ } from '@/lib/seo';
import { buildDetailPageKeywords } from '@/lib/seo-keywords';

// Helper function to translate i18n objects
function translate(obj: any, locale: 'en' | 'zh' | 'ar'): string {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  if (typeof obj === 'object') {
    return obj[locale] || obj.en || obj.zh || obj.ar || '';
  }
  return '';
}

// V8.7: 规格参数名三语映射。docx `specs` 的 param 为英文标识，渲染时按 locale
// 翻译 key；value（型号/尺寸/功耗等）为通用标识符，保持原样不翻译。
const SPEC_PARAM_I18N: Record<string, Record<string, string>> = {
  'Model': { zh: '型号', ar: 'النموذج', en: 'Model' },
  'Product Type': { zh: '产品类型', ar: 'نوع المنتج', en: 'Product Type' },
  'Cabinet Configuration': { zh: '柜体配置', ar: 'تكوين الخزانة', en: 'Cabinet Configuration' },
  'Main Cabinet Dimensions': { zh: '主柜尺寸', ar: 'أبعاد الخزانة الرئيسية', en: 'Main Cabinet Dimensions' },
  'Locker Extension Cabinet Dimensions': { zh: '扩展柜尺寸', ar: 'أبعاد خزانة التوسيع', en: 'Locker Extension Cabinet Dimensions' },
  'Locker Extension Capacity': { zh: '扩展柜容量', ar: 'سعة خزانة التوسيع', en: 'Locker Extension Capacity' },
  'Locker Compartment Size': { zh: '隔间尺寸', ar: 'حجم المقصورة', en: 'Locker Compartment Size' },
  'Dispensing Method': { zh: '发放方式', ar: 'طريقة الإصدار', en: 'Dispensing Method' },
  'Standard Side-Push Channel Width': { zh: '标准侧推通道宽度', ar: 'عرض القناة الجانبية القياسية', en: 'Standard Side-Push Channel Width' },
  'Channel Design': { zh: '通道设计', ar: 'تصميم القناة', en: 'Channel Design' },
  'Power Consumption': { zh: '功耗', ar: 'استهلاك الطاقة', en: 'Power Consumption' },
  'Access Method': { zh: '访问方式', ar: 'طريقة الوصول', en: 'Access Method' },
  'Managed Items': { zh: '管理物品', ar: 'العناصر المدارة', en: 'Managed Items' },
  'Cabinet': { zh: '柜体', ar: 'الخزانة', en: 'Cabinet' },
  'Cabinet Type': { zh: '柜体类型', ar: 'نوع الخزانة', en: 'Cabinet Type' },
  'Machine size': { zh: '整机尺寸', ar: 'حجم الآلة', en: 'Machine size' },
  'Compartment Design': { zh: '隔间设计', ar: 'تصميم المقصورة', en: 'Compartment Design' },
  'Network Connection': { zh: '网络连接', ar: 'اتصال الشبكة', en: 'Network Connection' },
  'RFID Function': { zh: 'RFID功能', ar: 'وظيفة RFID', en: 'RFID Function' },
  'Application Scenarios': { zh: '应用场景', ar: 'سيناريوهات التطبيق', en: 'Application Scenarios' },
  'Single Compartment Size': { zh: '单隔间尺寸', ar: 'حجم المقصورة الواحدة', en: 'Single Compartment Size' },
  'Customization': { zh: '定制选项', ar: 'خيارات التخصيص', en: 'Customization' },
};

/** Translate a spec param name to the current locale; falls back to the raw key. */
function translateSpecParam(param: string, locale: 'en' | 'zh' | 'ar'): string {
  const entry = SPEC_PARAM_I18N[param];
  if (entry) return entry[locale] || entry.en || param;
  return param;
}

// Helper to get category IDs from categories array (handles both string[] and object[])
function getCategoryIds(categories: any[]): string[] {
  if (!categories || !Array.isArray(categories)) return [];
  return categories.map((c) => (typeof c === 'string' ? c : c.id)).filter(Boolean);
}

// Generate JSON-LD structured data for Product
function generateJsonLd(product: Product, locale: string) {
  const name = translate(product.name, locale as any);
  const description = translate(product.description, locale as any);

  const jsonLd: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image: product.images || [],
    brand: {
      '@type': 'Brand',
      name: 'WSToolCabinet',
    },
    sku: product.sku,
  };

  // Add price if available
  if (product.price > 0 && !product.hidePrice) {
    jsonLd.offers = {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: product.price.toString(),
      availability: 'https://schema.org/InStock',
    };
  }

  return jsonLd;
}

// JSON-LD component
function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

interface ProductDetailViewProps {
  locale: 'en' | 'zh' | 'ar';
  lookupSlug: string;
  canonicalPath: string;
}

/**
 * buildProductMetadata
 * 由各路由的 generateMetadata 调用。用 canonicalPath 拼绝对 URL（og:url 等）。
 * 与原有逻辑一致，仅把 openGraph url 改为 `${baseUrl}/${locale}/${canonicalPath}`，
 * 从而正确反映 /products/、/applications/、/solutions/ 三类可达路径。
 */
export async function buildProductMetadata(
  locale: 'en' | 'zh' | 'ar',
  product: any,
  canonicalPath: string,
): Promise<Metadata> {
  const productAny = product as any;
  const title = productAny.seoTitle?.[locale] || translate(productAny.name, locale) || 'Product';
  const description = productAny.seoDescription?.[locale] || translate(productAny.description, locale) || '';
  const image = productAny.images?.[0] || '';

  // SEO 关键词：兼容多种存储形态（{en:string[]|string, zh:..., ar:...}、纯字符串或纯数组）。
  // 关键词：强制走自动两级关键词系统（无视后台 seoKeywords，确保 ZH/AR 页显示本地化完整标题）。
  // 详情页：主 = 从【英文产品名 + URL slug】共同提炼词元，二级 = 本语言完整产品名。
  // 全站关键词以英文为主：提炼统一走英文；中文/阿语完整名仅作二级、只出现在本语言页。
  const productNameForKw = translate(productAny.name, locale);
  const productNameEn = translate(productAny.name, 'en');
  const urlSlug = (canonicalPath || '').split('/').pop() || '';
  const autoKeywords = buildDetailPageKeywords(productNameEn || '', productNameForKw || '', urlSlug);
  const keywords = autoKeywords.join(', ');

  // Dynamically determine the base URL from the request headers
  const headersList = await headers();
  const host = headersList.get('host') || 'www.wstoolcabinet.com';
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  // Construct absolute URL for og:image
  const ogImageUrl = image ? (image.startsWith('http') ? image : `${baseUrl}${image.startsWith('/') ? '' : '/'}${image}`) : '';

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/${canonicalPath}`,
      images: ogImageUrl ? [{ url: ogImageUrl }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImageUrl ? [ogImageUrl] : [],
    },
  };
}

/**
 * ProductDetailView（共享 server 组件）
 * 由 products / applications / solutions 三个路由复用。
 * 按 lookupSlug 查库，预解析 i18n 字段，渲染 JSON-LD / ProductDetailClient / ProductFaqSection。
 */
export default async function ProductDetailView({ locale, lookupSlug, canonicalPath }: ProductDetailViewProps) {
  void canonicalPath; // canonicalPath 仅用于 generateMetadata；此处便于统一签名
  let product: Product | null = null;
  let relatedProducts: Product[] = [];
  let resolvedFaqs: { question: string; answer: string; category: string }[] = [];

  try {
    // Fetch product directly from database
    const dbProduct = await prisma.product.findFirst({
      where: {
        OR: [
          { slug: lookupSlug },
          { id: lookupSlug },
        ],
        deletedAt: null,
      },
    });

    if (!dbProduct) {
      notFound();
    }

    // Also fetch related products (same category)
    const allProducts = await prisma.product.findMany({
      where: {
        status: 'active',
        deletedAt: null,
      },
      take: 100,
    });

    product = dbProduct as any;

    // v265: 取该产品已激活的 FAQ（按 order 升序），并预解析为纯字符串供客户端组件使用
    const faqRecords = await prisma.fAQ.findMany({
      where: { productId: dbProduct.id, status: 'active' },
      orderBy: { order: 'asc' },
    });
    resolvedFaqs = faqRecords.map((f) => ({
      question: translate(f.question, locale),
      answer: translate(f.answer, locale),
      category: f.category || 'product',
    }));

    // Find related products (same category)
    const productCatIds = getCategoryIds((dbProduct as any).categories || []);
    relatedProducts = allProducts
      .filter((p) => p.id !== dbProduct.id)
      .filter((p) => {
        const pCatIds = getCategoryIds((p as any).categories || []);
        return pCatIds.some((id) => productCatIds.includes(id));
      })
      .slice(0, 4) as any[];
  } catch (error: any) {
    // Only log unexpected errors; silent for missing products (crawlers, stale links)
    if (error?.code !== 'NOT_FOUND' && error?.message?.includes('NOT_FOUND') === false) {
      console.error('Failed to load product:', error);
    }
    notFound();
  }

  if (!product) {
    notFound();
  }

  // Generate JSON-LD data
  const jsonLdData = generateJsonLd(product, locale);

  const productAny = product as any;
  const resolvedProduct = {
    ...productAny,
    _resolvedName: translate(productAny.name, locale),
    _resolvedDescription: translate(productAny.description, locale),
    categories: (productAny.categories || []).map((cat: any) => ({
      ...cat,
      _resolvedName: typeof cat === 'string' ? cat : translate(cat.name, locale),
    })),
    _resolvedSpecs: (() => {
      // 优先使用 specs（V8.6 docx 数据源，[{param,value}] 数组）—— 这是用户文档逐产品对应的正确规格
      if (Array.isArray(productAny.specs) && productAny.specs.length > 0) {
        const result: Record<string, string> = {};
        for (const row of productAny.specs) {
          if (row && row.param) {
            const val = typeof row.value === 'object' ? translate(row.value, locale) : String(row.value ?? '');
            result[row.param] = val;
          }
        }
        if (Object.keys(result).length > 0) {
          // 三语 param 名映射（型号/尺寸值保持原样）
          const mapped: Record<string, string> = {};
          for (const [k, v] of Object.entries(result)) mapped[translateSpecParam(k, locale)] = v;
          return mapped;
        }
      }
      // fallback 到 specifications（旧字段，仅作兼容）
      if (!productAny.specifications) return null;
      if (typeof productAny.specifications === 'string') return productAny.specifications;
      if (typeof productAny.specifications === 'object' && !Array.isArray(productAny.specifications)) {
        const specValue = productAny.specifications[locale] || productAny.specifications.en || '';
        if (typeof specValue === 'string' && specValue.trim() !== '') return specValue;
      }
      if (typeof productAny.specifications === 'object') {
        const result: Record<string, string> = {};
        for (const [key, value] of Object.entries(productAny.specifications)) {
          result[key] = typeof value === 'object' ? translate(value, locale) : String(value);
        }
        return result;
      }
      return null;
    })(),
    _resolvedFeatures: (() => {
      if (!productAny.features) return [];
      return productAny.features[locale] || productAny.features.en || [];
    })(),
  };

  // Pre-resolve related products
  const resolvedRelatedProducts = relatedProducts.map((rp) => {
    const rpAny = rp as any;
    return {
      ...rpAny,
      _resolvedName: translate(rpAny.name, locale),
    };
  });

  // Static label map for the client component (no functions!)
  const labels = {
    productsTitle: locale === 'zh' ? '产品' : locale === 'ar' ? 'المنتجات' : 'Products',
    home: locale === 'zh' ? '首页' : locale === 'ar' ? 'الرئيسية' : 'Home',
    contactUs: locale === 'zh' ? '联系我们' : locale === 'ar' ? 'اتصل بنا' : 'Contact Us',
    share: locale === 'zh' ? '分享' : locale === 'ar' ? 'مشاركة' : 'Share',
    backToProducts: locale === 'zh' ? '返回产品列表' : locale === 'ar' ? 'العودة للمنتجات' : 'Back to Products',
    description: locale === 'zh' ? '描述' : locale === 'ar' ? 'الوصف' : 'Description',
    specifications: locale === 'zh' ? '规格' : locale === 'ar' ? 'المواصفات' : 'Specifications',
    features: locale === 'zh' ? '特点' : locale === 'ar' ? 'الميزات' : 'Features',
    reviews: locale === 'zh' ? '评论' : locale === 'ar' ? 'المراجعات' : 'Reviews',
    relatedProducts: locale === 'zh' ? '相关产品' : locale === 'ar' ? 'منتجات ذات صلة' : 'Related Products',
    clickToZoom: locale === 'zh' ? '点击放大' : locale === 'ar' ? 'تكبير' : 'Click to Zoom',
    linkCopied: locale === 'zh' ? '链接已复制' : locale === 'ar' ? 'تم نسخ الرابط!' : 'Link copied!',
    imageNotAvailable: locale === 'zh' ? '图片暂时无法显示' : locale === 'ar' ? 'الصورة غير متاحة' : 'Image not available',
    contactForPricing: locale === 'zh' ? '联系我们询价' : locale === 'ar' ? 'اتصل بالسعر' : 'Contact for Pricing',
    priceOnRequest: locale === 'zh' ? '价格面议' : locale === 'ar' ? 'السعر قابل للتفاوض' : 'Price on Request',
    clickImageToZoom: locale === 'zh' ? '点击图片放大' : locale === 'ar' ? 'انقر لتكبير الصورة' : 'Click image to zoom',
  };

  return (
    <>
      {/* JSON-LD structured data for SEO */}
      <JsonLd data={jsonLdData} />

      {/* v265: FAQ JSON-LD (FAQPage schema) */}
      {resolvedFaqs.length > 0 && (
        <JsonLd
          data={jsonLdFAQ(
            resolvedFaqs.map((f) => ({ question: f.question, answer: f.answer })),
          )}
        />
      )}

      {/* Product Detail Client Component - only receives serializable data */}
      <ProductDetailClient
        product={resolvedProduct}
        locale={locale}
        labels={labels}
        relatedProducts={resolvedRelatedProducts}
      />

      {/* v265: 产品 FAQ 区块 */}
      <ProductFaqSection faqs={resolvedFaqs} locale={locale} />
    </>
  );
}

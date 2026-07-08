import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import ProductDetailClient from '@/components/products/ProductDetailClient';
import ProductFaqSection from './ProductFaqSection';
import { Product } from '@/lib/api';
import { prisma } from '@/lib/prisma';
import { jsonLdFAQ } from '@/lib/seo';

// Helper function to translate i18n objects
function translate(obj: any, locale: 'en' | 'zh' | 'ar'): string {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  if (typeof obj === 'object') {
    return obj[locale] || obj.en || obj.zh || obj.ar || '';
  }
  return '';
}

// Helper to get category IDs from categories array (handles both string[] and object[])
function getCategoryIds(categories: any[]): string[] {
  if (!categories || !Array.isArray(categories)) return [];
  return categories.map((c) => (typeof c === 'string' ? c : c.id)).filter(Boolean);
}

/**
 * V8.6: 将 Product.specs（文档规格参数表）归一为 [{ param, value }] 数组，供 <table> 渲染。
 * 兼容两种存储形态：
 *   - [{ param: string, value: string }, ...]
 *   - [[param, value], ...]（文档原始二维数组）
 * 空值 / 非数组返回 []，详情页据此决定是否渲染“暂无规格”。
 */
function resolveSpecTable(specs: any): { param: string; value: string }[] {
  if (!specs) return [];
  if (!Array.isArray(specs)) return [];
  const rows: { param: string; value: string }[] = [];
  for (const item of specs) {
    if (Array.isArray(item) && item.length >= 2) {
      const param = String(item[0] ?? '').trim();
      const value = String(item[1] ?? '').trim();
      if (!param && !value) continue;
      rows.push({ param, value });
    } else if (item && typeof item === 'object' && 'param' in item) {
      const param = String((item as any).param ?? '').trim();
      const value = String((item as any).value ?? '').trim();
      if (!param && !value) continue;
      rows.push({ param, value });
    }
  }
  return rows;
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
  // 取当前 locale 的关键词，缺省时回退到 en；无论源头是 string 还是 string[] 都归一为 string[]。
  const kwSource = productAny.seoKeywords;
  const normalizeKw = (raw: any): string[] => {
    if (Array.isArray(raw)) return raw.filter((x: any) => typeof x === 'string');
    if (typeof raw === 'string') return raw.split(',').map((s: string) => s.trim()).filter(Boolean);
    return [];
  };
  let kwArr: string[] = [];
  if (typeof kwSource === 'string') {
    kwArr = normalizeKw(kwSource);
  } else {
    const locKwRaw = kwSource?.[locale];
    const enKwRaw = kwSource?.en;
    kwArr = normalizeKw(locKwRaw).length ? normalizeKw(locKwRaw) : normalizeKw(enKwRaw);
  }
  const keywords = kwArr.length ? kwArr.join(', ') : undefined;

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
  } catch (error) {
    console.error('Failed to load product:', error);
    notFound();
  }

  if (!product) {
    notFound();
  }

  // Generate JSON-LD data
  const jsonLdData = generateJsonLd(product, locale);

  const productAny = product as any;
  // V8.6: 文档规格参数表（结构化数组），用于详情页 <table> 渲染
  const resolvedSpecTable = resolveSpecTable(productAny.specs);
  const specTitle =
    locale === 'zh' ? '产品规格参数' : locale === 'ar' ? 'مواصفات المنتج' : 'Product Specifications';
  const resolvedProduct = {
    ...productAny,
    _resolvedName: translate(productAny.name, locale),
    _resolvedDescription: translate(productAny.description, locale),
    categories: (productAny.categories || []).map((cat: any) => ({
      ...cat,
      _resolvedName: typeof cat === 'string' ? cat : translate(cat.name, locale),
    })),
    _resolvedSpecs: (() => {
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

      {/* V8.6: 文档规格参数表（结构化 <table> 渲染，响应式） */}
      {resolvedSpecTable.length > 0 && (
        <section className="bg-gradient-to-br from-slate-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <div className="w-10 h-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full" />
              {specTitle}
            </h2>
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse min-w-[420px]">
                  <tbody>
                    {resolvedSpecTable.map((row, index) => (
                      <tr
                        key={`${row.param}-${index}`}
                        className={index % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-gray-50 dark:bg-slate-700/40'}
                      >
                        <th
                          scope="row"
                          className="w-2/5 sm:w-1/3 text-left align-top px-5 py-3.5 font-semibold text-gray-800 dark:text-gray-100 border-b border-gray-100 dark:border-slate-700"
                        >
                          {row.param}
                        </th>
                        <td className="px-5 py-3.5 text-gray-600 dark:text-gray-300 align-top border-b border-gray-100 dark:border-slate-700 leading-relaxed">
                          {row.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* v265: 产品 FAQ 区块 */}
      <ProductFaqSection faqs={resolvedFaqs} locale={locale} />
    </>
  );
}

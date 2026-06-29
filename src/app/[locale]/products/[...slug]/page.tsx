import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import ProductDetailClient from '@/components/products/ProductDetailClient';
import { Product } from '@/lib/api';
import { prisma } from '@/lib/prisma';

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
  return categories.map(c => typeof c === 'string' ? c : c.id).filter(Boolean);
}

interface PageProps {
  params: {
    locale: string;
    slug: string[];
  };
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const slug = params.slug.join('/');
  const locale = params.locale as 'en' | 'zh' | 'ar';

  try {
    // Fetch product directly from database
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { slug: slug },
          { id: slug },
        ],
        deletedAt: null,
      },
    });

    if (!product) {
      return {};
    }

    // Safely access seoTitle and seoDescription
    const productAny = product as any;
    const title = productAny.seoTitle?.[locale] || translate(product.name, locale) || 'Product';
    const description = productAny.seoDescription?.[locale] || translate(product.description, locale) || '';
    const image = product.images?.[0] || '';

    // Dynamically determine the base URL from the request headers
    // This ensures og:image and other absolute URLs use the correct domain
    const headersList = await headers();
    const host = headersList.get('host') || 'www.wstoolcabinet.com';
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    // Construct absolute URL for og:image
    const ogImageUrl = image ? (image.startsWith('http') ? image : `${baseUrl}${image.startsWith('/') ? '' : '/'}${image}`) : '';

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${baseUrl}/${locale}/products/${slug}`,
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
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {};
  }
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

export default async function ProductDetailPage({ params }: PageProps) {
  const slug = params.slug.join('/');
  const locale = params.locale as 'en' | 'zh' | 'ar';

  let product: Product | null = null;
  let relatedProducts: Product[] = [];

  try {
    // Fetch product directly from database
    const dbProduct = await prisma.product.findFirst({
      where: {
        OR: [
          { slug: slug },
          { id: slug },
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

    // Find related products (same category)
    const productCatIds = getCategoryIds((dbProduct as any).categories || []);
    relatedProducts = allProducts
      .filter(p => p.id !== dbProduct.id)
      .filter(p => {
        const pCatIds = getCategoryIds((p as any).categories || []);
        return pCatIds.some(id => productCatIds.includes(id));
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

  // === CRITICAL: Pre-resolve all i18n data on the server side ===
  // Next.js does NOT allow passing functions from Server Components to Client Components.
  // We must resolve all translations here and pass only plain serializable data.
  const productAny = product as any;
  const resolvedProduct = {
    ...productAny,
    // Pre-translate all i18n fields to plain strings
    _resolvedName: translate(productAny.name, locale),
    _resolvedDescription: translate(productAny.description, locale),
    // Pre-translate categories
    categories: (productAny.categories || []).map((cat: any) => ({
      ...cat,
      _resolvedName: typeof cat === 'string' ? cat : translate(cat.name, locale),
    })),
    // Pre-translate specifications if it's an i18n object
    _resolvedSpecs: (() => {
      if (!productAny.specifications) return null;
      if (typeof productAny.specifications === 'string') return productAny.specifications;
      if (typeof productAny.specifications === 'object' && !Array.isArray(productAny.specifications)) {
        const specValue = productAny.specifications[locale] || productAny.specifications.en || '';
        if (typeof specValue === 'string') return specValue;
      }
      // For key-value format specs, pre-translate values
      if (typeof productAny.specifications === 'object') {
        const result: Record<string, string> = {};
        for (const [key, value] of Object.entries(productAny.specifications)) {
          result[key] = typeof value === 'object' ? translate(value, locale) : String(value);
        }
        return result;
      }
      return null;
    })(),
    // Pre-translate features
    _resolvedFeatures: (() => {
      if (!productAny.features) return [];
      return productAny.features[locale] || productAny.features.en || [];
    })(),
  };

  // Pre-resolve related products
  const resolvedRelatedProducts = relatedProducts.map(rp => {
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

      {/* Product Detail Client Component - only receives serializable data */}
      <ProductDetailClient
        product={resolvedProduct}
        locale={locale}
        labels={labels}
        relatedProducts={resolvedRelatedProducts}
      />
    </>
  );
}

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductDetailClient from '@/components/products/ProductDetailClient';
import { Product } from '@/lib/api';

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
    // Fetch product data
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/products?slug=${encodeURIComponent(slug)}&status=all`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      return {};
    }

    const json = await res.json();
    const product: Product = json.data?.[0];

    if (!product) {
      return {};
    }

    // Safely access seoTitle and seoDescription (may not be in Product type yet)
    const productAny = product as any;
    const title = productAny.seoTitle?.[locale] || translate(product.name, locale) || 'Product';
    const description = productAny.seoDescription?.[locale] || translate(product.description, locale) || '';
    const image = product.images?.[0] || '';

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: image ? [{ url: image }] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: image ? [image] : [],
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

  // Add aggregate rating if reviews exist (using any to access potential reviews field)
  const productAny = product as any;
  if (productAny.reviews && productAny.reviews.length > 0) {
    const avgRating = productAny.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / productAny.reviews.length;
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: avgRating.toFixed(1),
      reviewCount: productAny.reviews.length,
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
  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        'products.title': 'Products',
      },
      zh: {
        'products.title': '产品',
      },
      ar: {
        'products.title': 'المنتجات',
      },
    };
    return translations[locale]?.[key] || key;
  };

  let product: Product | null = null;
  let relatedProducts: Product[] = [];

  try {
    // Fetch product directly from API
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/products?slug=${encodeURIComponent(slug)}&status=all`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      notFound();
    }

    const json = await res.json();
    product = json.data?.[0];

    if (!product) {
      notFound();
    }

    // Get related products (same category)
    const allRes = await fetch(`${baseUrl}/api/products?status=active`, {
      cache: 'no-store',
    });

    if (allRes.ok) {
      const allJson = await allRes.json();
      const allProducts: Product[] = allJson.data || [];

      const productCatIds = getCategoryIds(product.categories as any[]);
      relatedProducts = allProducts
        .filter(p => p.id !== product!.id)
        .filter(p => {
          const pCatIds = getCategoryIds(p.categories as any[]);
          return pCatIds.some(id => productCatIds.includes(id));
        })
        .slice(0, 4);
    }
  } catch (error) {
    console.error('Failed to load product:', error);
    notFound();
  }

  if (!product) {
    notFound();
  }

  // Generate JSON-LD data
  const jsonLdData = generateJsonLd(product, locale);

  return (
    <>
      {/* JSON-LD structured data for SEO */}
      <JsonLd data={jsonLdData} />

      {/* Product Detail Client Component for interactive parts */}
      <ProductDetailClient
        product={product}
        locale={locale}
        t={t}
        relatedProducts={relatedProducts}
        translate={translate}
        getCategoryIds={getCategoryIds}
      />
    </>
  );
}

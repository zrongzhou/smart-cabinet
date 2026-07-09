/**
 * SEO Utilities - Centralized SEO metadata generation
 *
 * Provides helpers for generating consistent SEO metadata across all pages,
 * including Open Graph, Twitter Cards, JSON-LD structured data, and multilingual support.
 *
 * NOTE: All absolute URLs are generated dynamically using getBaseUrl()
 * which reads from request headers (in Server Components) or uses relative URLs (in Client Components).
 */

import { Metadata } from 'next';
import { headers } from 'next/headers';
import { getProductPublicPath } from './product-url';

// ============================================================
// Dynamic Base URL Helper
// ============================================================

/**
 * Get the base URL dynamically from request headers (Server Component)
 * Falls back to relative URL (empty string) for client components
 */
export function getBaseUrl(): string {
  try {
    const headersList = headers();
    const host = headersList.get('host');
    if (host) {
      const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
      return `${protocol}://${host}`;
    }
  } catch {
    // headers() throws if called in Client Component or during build
  }
  // Fallback: use relative URL (empty string = same origin)
  return '';
}

// ============================================================
// Default Site Configuration (can be overridden by admin settings)
// NOTE: url is no longer hardcoded - use getBaseUrl() for absolute URLs
// ============================================================

export const SITE_CONFIG = {
  name: 'WS Tool Cabinet',
  nameZh: '智能工具柜',
  locale: 'en_US',
  alternateLocale: 'zh_CN,ar_SA',
  defaultTitle: 'Smart Cabinet - Intelligent Tool Management Solutions',
  defaultTitleZh: '智能工具柜 - 智能化刀具管理解决方案',
  defaultDescription: 'Professional smart tool cabinet and vending machine manufacturer. RFID tracking, real-time inventory, automated management for modern manufacturing.',
  defaultDescriptionZh: '专业智能工具柜和自动售货机制造商。RFID 追踪、实时库存、自动化管理，为现代制造业提供完整的智能存储解决方案。',
  keywords: [
    'smart cabinet','tool cabinet','vending machine','RFID','CNC tool management',
    'intelligent locker','tool storage','智能柜','智能工具柜','刀具管理',
    'CNC Tool Smart Cabinet','CNC刀具智能柜',
    'tool expansion cabinet','扩展柜',
    'drawer material cabinet','抽屉式物料柜',
    'smart file cabinet','智能文件柜',
    'weighing cabinet','称重柜',
    'employee locker','员工储物柜',
    'micro warehousing','微仓储柜',
    'liquid material cabinet','液体管理柜',
    'RFID tool tracking','automated tool management','intelligent storage solution',
    'CNC cutting tool management','end mill cabinet','tap management',
    '广州秋彦科技','Qiuyan Technology','smart tool management system'
  ],
  ogImage: '/images/og-default.svg',
  twitterHandle: '@wstoolcabinet',
  sameAs: [
    'https://www.facebook.com/profile.php?id=61574959611170',
    'https://x.com/merinzhou',
  ],
};

// ============================================================
// Page-specific SEO Metadata Generators
// ============================================================

interface PageSEOOptions {
  title?: string;
  titleZh?: string;
  titleAr?: string;
  description?: string;
  descriptionZh?: string;
  descriptionAr?: string;
  path: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
  noindex?: boolean;
  keywords?: string[];
}

/**
 * Generate full Metadata object for a page
 * Uses dynamic base URL from request headers (Server Component) or relative URL (Client Component)
 */
export function generatePageMetadata(options: PageSEOOptions): Metadata {
  const {
    title,
    description,
    path,
    image,
    type = 'website',
    publishedTime,
    modifiedTime,
    author,
    section,
    tags,
    noindex = false,
  } = options;

  // Dynamically get base URL (works in Server Components; returns '' in Client Components)
  const baseUrl = getBaseUrl();

  const fullTitle = title ? `${title} | ${SITE_CONFIG.name}` : SITE_CONFIG.defaultTitle;
  const fullDescription = description || SITE_CONFIG.defaultDescription;
  const ogImageUrl = image ? (image.startsWith('http') ? image : `${baseUrl}${image.startsWith('/') ? '' : '/'}${image}`) : `${baseUrl}${SITE_CONFIG.ogImage}`;
  const pageUrl = path.startsWith('http') ? path : `${baseUrl}${path}`;

  return {
    title: fullTitle,
    description: fullDescription,
    keywords: options.keywords && options.keywords.length ? options.keywords.join(', ') : SITE_CONFIG.keywords.join(', '),
    ...(noindex && { robots: { index: false, follow: true } }),
    openGraph: {
      title: fullTitle,
      description: fullDescription,
      url: pageUrl,
      siteName: SITE_CONFIG.name,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title || SITE_CONFIG.name }],
      locale: SITE_CONFIG.locale,
      alternateLocale: SITE_CONFIG.alternateLocale,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type: type as any,
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(author && { authors: [author] }),
      ...(section && { section }),
      ...(tags && { tags }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: fullDescription,
      images: [ogImageUrl],
      creator: SITE_CONFIG.twitterHandle,
    },
    alternates: {
      canonical: pageUrl,
      languages: {
        'en': `/en${path}`,
        'zh': `/zh${path}`,
        'ar': `/ar${path}`,
      },
    },
  };
}

// ============================================================
// JSON-LD Structured Data Generators
// ============================================================

/**
 * Generate WebSite schema
 */
export function jsonLdWebsite() {
  const baseUrl = getBaseUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_CONFIG.name,
    ...(baseUrl && { url: baseUrl }),
    description: SITE_CONFIG.defaultDescription,
    inLanguage: ['en', 'zh', 'ar'],
    ...(baseUrl && {
      potentialAction: {
        '@type': 'SearchAction',
        target: `${baseUrl}/en/products?search={search_term_input}`,
        'query-input': 'required name=search_term_input',
      },
    }),
    publisher: {
      '@type': 'Organization',
      name: 'Guangzhou Qiuyan Technology Co., Ltd.',
      ...(baseUrl && { url: baseUrl }),
    },
  };
}

/**
 * Generate Organization schema
 */
export function jsonLdOrganization() {
  const baseUrl = getBaseUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Guangzhou Qiuyan Technology Co., Ltd.',
    alternateName: '广州秋彦科技有限公司 / WS Tool Cabinet',
    ...(baseUrl && { url: baseUrl }),
    ...(baseUrl && { logo: `${baseUrl}/images/logo.png` }),
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+86-156-2216-0659',
      contactType: 'sales',
      email: 'sabina@wstoolcabinet.com',
      availableLanguage: ['English', 'Chinese', 'Arabic'],
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'No.131 Jinlong Road, Dalong Street',
      addressLocality: 'Panyu District',
      addressRegion: 'Guangzhou',
      postalCode: '511494',
      addressCountry: 'CN',
    },
    sameAs: SITE_CONFIG.sameAs || [],
  };
}

/**
 * Generate Product schema
 */
export function jsonLdProduct(product: {
  name: string;
  description: string;
  image: string;
  slug: string;
  price?: string;
  currency?: string;
  availability?: 'InStock' | 'OutOfStock';
  category?: string;
}) {
  const baseUrl = getBaseUrl();
  // 公开路径按 store slug 决定（柜体在 /products/，物料/行业在 /applications/、/solutions/）
  const imageUrl = product.image.startsWith('http') ? product.image : `${baseUrl}${product.image.startsWith('/') ? '' : '/'}${product.image}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: imageUrl,
    ...(baseUrl && { url: `${baseUrl}/en/${getProductPublicPath(product.slug)}` }),
    brand: {
      '@type': 'Brand',
      name: SITE_CONFIG.name,
    },
    ...(product.price && {
      offers: {
        '@type': 'Offer',
        price: product.price,
        priceCurrency: product.currency || 'USD',
        availability: `https://schema.org/${product.availability || 'InStock'}`,
        seller: {
          '@type': 'Organization',
          name: 'Guangzhou Qiuyan Technology Co., Ltd.',
        },
      },
    }),
    ...(product.category && {
      category: product.category,
    }),
  };
}

/**
 * Generate FAQPage schema
 */
export function jsonLdFAQ(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate BreadcrumbList schema
 */
export function jsonLdBreadcrumb(items: { name: string; url: string }[]) {
  const baseUrl = getBaseUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`,
    })),
  };
}

/**
 * Generate Article/BlogPost schema
 */
export function jsonLdArticle(post: {
  title: string;
  description: string;
  image: string;
  slug: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
}) {
  const baseUrl = getBaseUrl();
  const imageUrl = post.image.startsWith('http') ? post.image : `${baseUrl}${post.image.startsWith('/') ? '' : '/'}${post.image}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    image: imageUrl,
    ...(baseUrl && { url: `${baseUrl}/en/blog/${post.slug}` }),
    datePublished: post.datePublished,
    dateModified: post.dateModified || post.datePublished,
    author: {
      '@type': 'Person',
      name: post.author || 'WS Tool Cabinet Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Guangzhou Qiuyan Technology Co., Ltd.',
      ...(baseUrl && { logo: { '@type': 'ImageObject', url: `${baseUrl}/images/logo.png` } }),
    },
  };
}

/**
 * Generate LocalBusiness schema (critical for local SEO)
 */
export function jsonLdLocalBusiness() {
  const baseUrl = getBaseUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    ...(baseUrl && { '@id': `${baseUrl}/#organization` }),
    name: 'Guangzhou Qiuyan Technology Co., Ltd.',
    alternateName: ['广州秋彦科技有限公司', 'WS Tool Cabinet', 'Qiuyan Technology'],
    description: SITE_CONFIG.defaultDescription,
    ...(baseUrl && { url: baseUrl }),
    ...(baseUrl && { logo: `${baseUrl}/images/about/company-logo.png` }),
    telephone: '+86-156-2216-0659',
    email: 'sabina@wstoolcabinet.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'No.131 Jinlong Road, Dalong Street',
      addressLocality: 'Panyu District',
      addressRegion: 'Guangzhou',
      postalCode: '511494',
      addressCountry: 'CN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 22.9343,
      longitude: 113.3842,
    },
    openingHoursSpecification: [
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '18:00' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '10:00', closes: '14:00' },
    ],
    priceRange: '$$$$',
    currenciesAccepted: 'USD,CNY,EUR',
    areaServed: {
      '@type': 'GeoCircle',
      geoMidpoint: { '@type': 'GeoCoordinates', latitude: 22.9343, longitude: 113.3842 },
      geoRadius: '500000',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Smart Cabinet Product Catalog',
      itemListElement: [
        { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'CNC Tool Smart Cabinets' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'RFID Tool Management Systems' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Tool Vending Machines' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Intelligent Storage Lockers' } },
      ],
    },
    sameAs: SITE_CONFIG.sameAs || [],
  };
}

/**
 * Generate Service schema (for solutions/services page)
 */
export function jsonLdService(service: {
  name: string;
  description: string;
  url: string;
  category?: string;
}) {
  const baseUrl = getBaseUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    ...(baseUrl && { url: `${baseUrl}${service.url}` }),
    provider: {
      '@type': 'Organization',
      name: 'Guangzhou Qiuyan Technology Co., Ltd.',
      ...(baseUrl && { url: baseUrl }),
    },
    serviceType: service.category || 'Manufacturing Support Service',
    areaServed: { '@type': 'Country', name: 'Worldwide' },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `${service.name} Solutions`,
    },
  };
}

/**
 * Generate i18n-aware page metadata (locale-specific titles, descriptions, keywords)
 */
export function generateI18nMetadata(locale: string, options: PageSEOOptions): Metadata {
  const base = generatePageMetadata(options);

  // Locale-specific overrides
  const localeTitles: Record<string, string> = {
    en: options.title || '',
    zh: options.titleZh || options.title || '',
    ar: options.titleAr || options.title || '',
  };

  const localeDescs: Record<string, string> = {
    en: options.description || '',
    zh: options.descriptionZh || options.description || '',
    ar: options.descriptionAr || options.description || '',
  };

  // Add product-title-based keywords if tags provided
  let keywords = options.keywords && options.keywords.length ? options.keywords.join(', ') : SITE_CONFIG.keywords.join(', ');
  if (options.tags && options.tags.length > 0) {
    keywords += ', ' + options.tags.join(', ');
  }

  return {
    ...base,
    title: localeTitles[locale] || base.title as string,
    description: localeDescs[locale] || base.description as string,
    keywords,
    ...(locale === 'ar' && {
      other: { dir: 'rtl' } as any,
    }),
  };
}

/**
 * Generate product-listing page JSON-LD (ItemList with Products)
 */
export function jsonLdProductList(products: Array<{ name: string; image: string; slug: string; description: string; price?: number }>) {
  const baseUrl = getBaseUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    numberOfItems: products.length,
    itemListElement: products.map((p, idx) => {
      const imageUrl = p.image.startsWith('http') ? p.image : `${baseUrl}${p.image.startsWith('/') ? '' : '/'}${p.image}`;
      return {
        '@type': 'ListItem',
        position: idx + 1,
        item: {
          '@type': 'Product',
          name: p.name,
          image: imageUrl,
          ...(baseUrl && { url: `${baseUrl}/en/${getProductPublicPath(p.slug)}` }),
          description: p.description,
          ...(p.price && {
            offers: {
              '@type': 'Offer',
              price: p.price,
              priceCurrency: 'CNY',
              availability: 'https://schema.org/InStock',
            },
          }),
        },
      };
    }),
  };
}

/**
 * Generate WebPage schema (generic page structured data)
 */
export function jsonLdWebPage(page: {
  name: string;
  description: string;
  path: string;
  datePublished?: string;
  dateModified?: string;
}) {
  const baseUrl = getBaseUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.name,
    description: page.description,
    ...(baseUrl && { url: `${baseUrl}${page.path}` }),
    ...(baseUrl && { isPartOf: { '@type': 'WebSite', name: SITE_CONFIG.name, url: baseUrl } }),
    about: { '@type': 'Thing', name: 'Smart Tool Cabinet Manufacturing' },
    ...(page.datePublished && { datePublished: page.datePublished }),
    ...(page.dateModified && { dateModified: page.dateModified }),
    publisher: {
      '@type': 'Organization',
      name: 'Guangzhou Qiuyan Technology Co., Ltd.',
      ...(baseUrl && { logo: { '@type': 'ImageObject', url: `${baseUrl}/images/about/company-logo.png` } }),
    },
  };
}

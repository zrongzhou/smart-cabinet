/**
 * SEO Utilities - Centralized SEO metadata generation
 *
 * Provides helpers for generating consistent SEO metadata across all pages,
 * including Open Graph, Twitter Cards, JSON-LD structured data, and multilingual support.
 */

import { Metadata } from 'next';

// ============================================================
// Default Site Configuration (can be overridden by admin settings)
// ============================================================

export const SITE_CONFIG = {
  name: 'WS Tool Cabinet',
  nameZh: '智能工具柜',
  url: 'https://test.wstoolcabinet.com',
  locale: 'en_US',
  alternateLocale: 'zh_CN,ar_SA',
  defaultTitle: 'Smart Cabinet - Intelligent Tool Management Solutions',
  defaultTitleZh: '智能工具柜 - 智能化刀具管理解决方案',
  defaultDescription: 'Professional smart tool cabinet and vending machine manufacturer. RFID tracking, real-time inventory, automated management for modern manufacturing.',
  defaultDescriptionZh: '专业智能工具柜和自动售货机制造商。RFID 追踪、实时库存、自动化管理，为现代制造业提供完整的智能存储解决方案。',
  keywords: [
    'smart cabinet','tool cabinet','vending machine','RFID','CNC tool management',
    'intelligent locker','tool storage','智能柜','智能工具柜','刀具管理',
    'CNC Tool Smart Cabinet','QT-DL80-48','DL64A','CNC刀具智能柜',
    'tool expansion cabinet','DL60B','DL80F','扩展柜',
    'drawer material cabinet','CTGJG-324','抽屉式物料柜',
    'smart file cabinet','RFG-500','智能文件柜',
    'weighing cabinet','SWC-300','称重柜',
    'employee locker','ELC-600','员工储物柜',
    'micro warehousing','MWC-150','微仓储柜',
    'liquid material cabinet','CLMC','液体管理柜',
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
}

/**
 * Generate full Metadata object for a page
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

  const fullTitle = title ? `${title} | ${SITE_CONFIG.name}` : SITE_CONFIG.defaultTitle;
  const fullDescription = description || SITE_CONFIG.defaultDescription;
  const ogImageUrl = image ? (image.startsWith('http') ? image : `${SITE_CONFIG.url}${image}`) : `${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`;
  const pageUrl = `${SITE_CONFIG.url}${path}`;

  return {
    title: fullTitle,
    description: fullDescription,
    keywords: SITE_CONFIG.keywords.join(', '),
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
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.defaultDescription,
    inLanguage: ['en', 'zh', 'ar'],
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_CONFIG.url}/en/products?search={search_term_input}`,
      'query-input': 'required name=search_term_input',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Guangzhou Qiuyan Technology Co., Ltd.',
      url: SITE_CONFIG.url,
    },
  };
}

/**
 * Generate Organization schema
 */
export function jsonLdOrganization() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Guangzhou Qiuyan Technology Co., Ltd.',
    alternateName: '广州秋彦科技有限公司 / WS Tool Cabinet',
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/images/logo.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+86-156-2216-0659',
      contactType: 'sales',
      email: 'sabrina@wstoolcabinet.com',
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
    sameAs: [
      'https://www.facebook.com/profile.php?id=61574959611170',
      'https://x.com/merinzhou',
    ],
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
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image.startsWith('http') ? product.image : `${SITE_CONFIG.url}${product.image}`,
    url: `${SITE_CONFIG.url}/en/products/${product.slug}`,
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
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_CONFIG.url}${item.url}`,
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
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    image: post.image.startsWith('http') ? post.image : `${SITE_CONFIG.url}${post.image}`,
    url: `${SITE_CONFIG.url}/en/blog/${post.slug}`,
    datePublished: post.datePublished,
    dateModified: post.dateModified || post.datePublished,
    author: {
      '@type': 'Person',
      name: post.author || 'WS Tool Cabinet Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Guangzhou Qiuyan Technology Co., Ltd.',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_CONFIG.url}/images/logo.png`,
      },
    },
  };
}

/**
 * Generate LocalBusiness schema (critical for local SEO)
 */
export function jsonLdLocalBusiness() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_CONFIG.url}/#organization`,
    name: 'Guangzhou Qiuyan Technology Co., Ltd.',
    alternateName: ['广州秋彦科技有限公司', 'WS Tool Cabinet', 'Qiuyan Technology'],
    description: SITE_CONFIG.defaultDescription,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/images/about/company-logo.png`,
    telephone: '+86-156-2216-0659',
    email: 'sabrina@wstoolcabinet.com',
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
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    url: `${SITE_CONFIG.url}${service.url}`,
    provider: {
      '@type': 'Organization',
      name: 'Guangzhou Qiuyan Technology Co., Ltd.',
      url: SITE_CONFIG.url,
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
  let keywords = SITE_CONFIG.keywords.join(', ');
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
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    numberOfItems: products.length,
    itemListElement: products.map((p, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'Product',
        name: p.name,
        image: p.image.startsWith('http') ? p.image : `${SITE_CONFIG.url}${p.image}`,
        url: `${SITE_CONFIG.url}/en/products/${p.slug}`,
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
    })),
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
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.name,
    description: page.description,
    url: `${SITE_CONFIG.url}${page.path}`,
    isPartOf: { '@type': 'WebSite', name: SITE_CONFIG.name, url: SITE_CONFIG.url },
    about: { '@type': 'Thing', name: 'Smart Tool Cabinet Manufacturing' },
    ...(page.datePublished && { datePublished: page.datePublished }),
    ...(page.dateModified && { dateModified: page.dateModified }),
    publisher: {
      '@type': 'Organization',
      name: 'Guangzhou Qiuyan Technology Co., Ltd.',
      logo: { '@type': 'ImageObject', url: `${SITE_CONFIG.url}/images/about/company-logo.png` },
    },
  };
}

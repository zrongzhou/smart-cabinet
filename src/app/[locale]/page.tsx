import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Metadata } from 'next';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import AdvantagesSection from '@/components/home/AdvantagesSection';
import SolutionsPreview from '@/components/home/SolutionsPreview';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import BlogPreview from '@/components/home/BlogPreview';
import TrustBadges from '@/components/home/TrustBadges';
import CtaSection from '@/components/home/CtaSection';
import Image from 'next/image';
import { getMergedBlogList } from '@/lib/blogs';

type PreviewBlog = {
  slug: string;
  title: { en: string; zh: string; ar: string };
  excerpt?: { en: string; zh: string; ar: string };
  publishedAt?: string;
  author?: string;
  image?: string;
  tags?: string[];
  featured?: boolean;
};

// HeroSection 包含 canvas/星空动画，SSR 时会触发 window is not defined
// 用 ssr: false 彻底禁用服务端渲染，仅客户端渲染
const HeroSection = dynamic(
  () => import('@/components/home/HeroSection'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[80vh] flex flex-col items-center justify-center relative overflow-hidden" style={{ background: 'linear-gradient(175deg, #03010a 0%, #0c1229 50%, #060e1f 100%)' }}>
        {/* Subtle animated gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl animate-pulse" style={{ backgroundColor: 'rgba(59,130,246,0.08)', animationDuration: '3s' }} />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full blur-3xl animate-pulse" style={{ backgroundColor: 'rgba(99,102,241,0.06)', animationDuration: '4s' }} />
        {/* Logo + Brand */}
        <div className="relative z-10 flex flex-col items-center gap-5">
          <Image 
            src="/images/logo.svg" 
            alt="Qtech" 
            width={120}
            height={48}
            className="h-12 w-auto opacity-90 animate-pulse" 
            style={{ animationDuration: '2s' }}
            priority={true}
          />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    ),
  }
);

const SITE_URL = 'https://test.wstoolcabinet.com';

const PAGE_META: Record<string, { title: string; description: string }> = {
  en: {
    title: 'Smart Tool Cabinet & Vending Machine Manufacturer | WS Tool Cabinet',
    description: 'Professional smart tool cabinet and vending machine manufacturer since 2010. IoT-enabled inventory management, industrial storage solutions for 60+ countries.',
  },
  zh: {
    title: '智能工具柜与自动售货机制造商 | 秋彦科技 WS Tool Cabinet',
    description: '专业智能工具柜和自动售货机制造商，始于2010年。IoT物联网库存管理、工业存储解决方案，服务全球60+国家。',
  },
  ar: {
    title: 'مصنع خزانات الأدوات الذكية وآلات البيع | WS Tool Cabinet',
    description: 'مصنع محترف لخزانات الأدوات الذكية وآليات البيع منذ 2010. إدارة مخزون IoT، حلول تخزين صناعية لأكثر من 60 دولة.',
  },
};

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const locale = params.locale;
  const meta = PAGE_META[locale] || PAGE_META.en;
  return {
    title: meta.title,
    description: meta.description,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: {
        en: `${SITE_URL}/en`,
        zh: `${SITE_URL}/zh`,
        ar: `${SITE_URL}/ar`,
      },
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `${SITE_URL}/${locale}`,
      siteName: 'WS Tool Cabinet | Qiuyan Technology',
      locale: locale === 'zh' ? 'zh_CN' : locale === 'ar' ? 'ar_SA' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
  };
}

interface HomePageProps {
  params: {
    locale: string;
  };
}

export default async function HomePage({ params: { locale } }: HomePageProps) {
  // 首页博客预览改为读取合并列表（DB + 静态 seed），这样后台新建并设为精选的
  // 博客也能出现在首页。失败时回退为空，BlogPreview 会改用静态数据兜底。
  let blogItems: PreviewBlog[] = [];
  try {
    const merged = await getMergedBlogList({ publishedOnly: true, pageSize: 30 });
    blogItems = merged.data.map((p) => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt || { en: '', zh: '', ar: '' },
      publishedAt: p.publishedAt,
      author: p.author,
      image: p.image || '',
      featured: p.featured,
      tags: (p.tags || []).map((t) => t.name?.en || t.slug || t.id),
    }));
  } catch {
    blogItems = [];
  }

  return (
    <>
      <HeroSection />
      <FeaturedProducts />
      <AdvantagesSection />
      <SolutionsPreview />
      <TestimonialsSection />
      <BlogPreview blogs={blogItems} />
      <TrustBadges />
      <CtaSection />
    </>
  );
}

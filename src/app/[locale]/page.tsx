import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Metadata } from 'next';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import AdvantagesSection from '@/components/home/AdvantagesSection';
import SolutionsPreview from '@/components/home/SolutionsPreview';
import HeroSection from '@/components/home/HeroSectionLazy';
import TestimonialsSection from '@/components/home/TestimonialsSectionLazy';
import Image from 'next/image';
import { getMergedBlogList } from '@/lib/blogs';
import { buildStaticPageKeywords } from '@/lib/seo-keywords';

// 静态内容页，ISR 重新校验
export const revalidate = 300;

// 首屏以下的重组件懒加载（减少首屏 JS bundle）
// 注意：HeroSection / TestimonialsSection 的 ssr:false 动态导入已移至对应的
// *Lazy 客户端包装组件（HeroSectionLazy / TestimonialsSectionLazy），因为 Next 15
// 禁止在 Server Component 内对 next/dynamic 使用 ssr:false。
const BlogPreview = dynamic(
  () => import('@/components/home/BlogPreview'),
  { loading: () => <div className="py-16" /> }
);
const TrustBadges = dynamic(
  () => import('@/components/home/TrustBadges'),
  { loading: () => <div className="py-12" /> }
);
const CtaSection = dynamic(
  () => import('@/components/home/CtaSection'),
  { loading: () => <div className="py-16" /> }
);

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

const SITE_URL = 'https://www.wstoolcabinet.com';

const PAGE_META: Record<string, { title: string; description: string }> = {
  en: {
    title: 'Smart Tool Cabinets & Industrial Vending Machines | Qtech',
    description: 'Smart cabinet manufacturer for CNC tool vending machines, PPE cabinets and MRO inventory management. Control access, track usage and reduce waste.',
  },
  zh: {
    title: '智能工具柜与工业自动售货机 | Qtech',
    description: 'Qtech 为工厂与机加工车间提供智能工具柜、CNC 刀具自动售货机、PPE 自动售货柜与 RFID 库存管理系统。',
  },
  ar: {
    title: 'خزانات الأدوات الذكية وآلات البيع الصناعية | Qtech',
    description: 'توفر Qtech خزانات أدوات ذكية، وآلات بيع أدوات CNC، وخزائن بيع PPE، وأنظمة جرد RFID للمصانع وورش الآلات.',
  },
};

// NEXT15: params is now a Promise
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = (await params).locale; // NEXT15
  const meta = PAGE_META[locale] || PAGE_META.en;
  // 全站关键词以英文为主：主词从英文标题提炼，二级用本语言标题核心（仅本语言页出现）
  const keywords = buildStaticPageKeywords(PAGE_META.en.title, meta.title).join(', ');
  return {
    title: meta.title,
    description: meta.description,
    keywords,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: {
        en: `${SITE_URL}/en`,
        'zh-CN': `${SITE_URL}/zh`,
        ar: `${SITE_URL}/ar`,
        'x-default': `${SITE_URL}/en`,
      },
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `${SITE_URL}/${locale}`,
      siteName: 'Qtech | Guangzhou Qiuyan Technology',
      locale: locale === 'zh' ? 'zh_CN' : locale === 'ar' ? 'ar_SA' : 'en_US',
      type: 'website',
      // N1: ensure the homepage has a shareable Open Graph image (absolute URL).
      images: [{ url: `${SITE_URL}/images/logo.svg`, width: 1200, height: 630, alt: meta.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      images: [`${SITE_URL}/images/logo.svg`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
  };
}

interface HomePageProps {
  // NEXT15: params is now a Promise
  params: Promise<{
    locale: string;
  }>;
}

// NEXT15: params is a Promise; await and destructure
export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params; // NEXT15
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

  // 首页 hero 是 ssr:false 的 client 组件，其 <h1> 不会进入服务端 HTML。
  // 这里补一个服务端渲染的 <h1>（视觉隐藏），保证 SSR 输出含唯一主标题，利于 SEO/可访问性。
  const meta = PAGE_META[locale] || PAGE_META.en;
  const homeH1 = meta.title.split(' | ')[0] || meta.title;

  return (
    <>
      <h1 className="sr-only">{homeH1}</h1>
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

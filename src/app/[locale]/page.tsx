import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import AdvantagesSection from '@/components/home/AdvantagesSection';
import SolutionsPreview from '@/components/home/SolutionsPreview';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import BlogPreview from '@/components/home/BlogPreview';
import TrustBadges from '@/components/home/TrustBadges';
import CtaSection from '@/components/home/CtaSection';

// HeroSection 包含 canvas/星空动画，SSR 时会触发 window is not defined
// 用 ssr: false 彻底禁用服务端渲染，仅客户端渲染
const HeroSection = dynamic(
  () => import('@/components/home/HeroSection'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[80vh] flex items-center justify-center" style={{ background: 'linear-gradient(175deg, #03010a 0%, #0c1229 50%, #060e1f 100%)' }}>
        <div className="text-white text-lg opacity-60">Loading...</div>
      </div>
    ),
  }
);

interface HomePageProps {
  params: {
    locale: string;
  };
}

export default function HomePage({ params: { locale } }: HomePageProps) {
  return (
    <>
      <HeroSection />
      <FeaturedProducts />
      <AdvantagesSection />
      <SolutionsPreview />
      <TestimonialsSection />
      <BlogPreview />
      <TrustBadges />
      <CtaSection />
    </>
  );
}

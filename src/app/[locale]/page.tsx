import HeroSection from '@/components/home/HeroSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import AdvantagesSection from '@/components/home/AdvantagesSection';
import SolutionsPreview from '@/components/home/SolutionsPreview';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import BlogPreview from '@/components/home/BlogPreview';
import TrustBadges from '@/components/home/TrustBadges';
import CtaSection from '@/components/home/CtaSection';

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

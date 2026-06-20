import type { Metadata } from 'next';
import HeroSection from '@/components/home/HeroSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import AdvantagesSection from '@/components/home/AdvantagesSection';
import CtaSection from '@/components/home/CtaSection';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Smart Cabinet - Intelligent Storage Solutions',
    description: 'Professional smart cabinets, vending machines, and lockers for modern businesses.',
    keywords: ['smart cabinet', 'vending machine', 'intelligent locker', 'storage solutions'],
  };
}

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <FeaturedProducts />
      <AdvantagesSection />
      <CtaSection />
    </main>
  );
}

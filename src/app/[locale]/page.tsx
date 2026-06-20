import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import HeroSection from '@/components/home/HeroSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import AdvantagesSection from '@/components/home/AdvantagesSection';
import CtaSection from '@/components/home/CtaSection';

interface Props {
  params: { locale: string };
}

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Home' });
  
  return {
    title: t('title'),
    description: t('description'),
    keywords: ['smart cabinet', 'vending machine', 'intelligent locker', 'storage solutions'],
  };
}

export default async function HomePage({ params: { locale } }: Props) {
  return (
    <main>
      <HeroSection locale={locale} />
      <FeaturedProducts locale={locale} />
      <AdvantagesSection />
      <CtaSection locale={locale} />
    </main>
  );
}

import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

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
  const t = await getTranslations({ locale, namespace: 'Home' });
  
  return (
    <main>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t('hero.heading')}
          </h1>
          <p className="text-xl mb-8">
            {t('hero.subheading')}
          </p>
          <a
            href={`/${locale}/products`}
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            {t('hero.cta')}
          </a>
        </div>
      </section>
      
      {/* Add more sections as needed */}
    </main>
  );
}

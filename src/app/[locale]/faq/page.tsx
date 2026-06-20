import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

interface Props {
  params: { locale: string };
}

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'FAQ' });
  
  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

// Mock FAQ data
const mockFAQs = [
  {
    id: '1',
    question: 'What is a smart cabinet?',
    answer: 'A smart cabinet is a storage solution with intelligent features...',
  },
  {
    id: '2',
    question: 'How do I install the vending machine?',
    answer: 'Our vending machines come with detailed installation guides...',
  },
  // Add more FAQs as needed
];

export default async function FAQPage({ params: { locale } }: Props) {
  const t = await getTranslations({ locale, namespace: 'FAQ' });
  
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{t('heading')}</h1>
      <p className="text-gray-600 mb-8">{t('subheading')}</p>
      
      <div className="space-y-6">
        {mockFAQs.map((faq) => (
          <div key={faq.id} className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-2">{faq.question}</h2>
            <p className="text-gray-600">{faq.answer}</p>
          </div>
        ))}
      </div>
    </main>
  );
}

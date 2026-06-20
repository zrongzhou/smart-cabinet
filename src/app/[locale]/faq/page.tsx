import type { Metadata } from 'next';

interface Props {
  params: { locale: string };
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'FAQ - Smart Cabinet',
    description: 'Frequently asked questions about our intelligent storage solutions.',
  };
}

// Mock FAQ data
const mockFAQs = [
  {
    id: '1',
    question: 'What is a smart cabinet?',
    answer: 'A smart cabinet is a storage solution with intelligent features like remote access, activity logs, and smart lock.',
  },
  {
    id: '2',
    question: 'How do I install the vending machine?',
    answer: 'Our vending machines come with detailed installation guides and our team provides full support.',
  },
  {
    id: '3',
    question: 'Can I customize the locker configuration?',
    answer: 'Yes, we offer fully customizable locker configurations to meet your specific needs.',
  },
];

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 px-4 py-12">
      <div className="container mx-auto max-w-4xl animate-fade-in-up">
        {/* Page header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Find answers to common questions about our products and services
          </p>
        </div>
        
        {/* FAQ List */}
        <div className="space-y-4">
          {mockFAQs.map((faq, index) => (
            <details
              key={faq.id}
              className="group rounded-xl bg-white p-6 shadow-sm transition-all duration-500 hover:shadow-lg animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <summary className="cursor-pointer text-lg font-semibold text-gray-900">
                {faq.question}
              </summary>
              <p className="mt-4 leading-relaxed text-gray-600">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </main>
  );
}

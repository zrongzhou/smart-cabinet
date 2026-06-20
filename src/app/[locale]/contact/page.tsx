import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

interface Props {
  params: { locale: string };
}

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Contact' });
  
  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

export default async function ContactPage({ params: { locale } }: Props) {
  const t = await getTranslations({ locale, namespace: 'Contact' });
  
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 px-4 py-12">
      <div className="container mx-auto max-w-4xl animate-fade-in-up">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="mb-6 text-4xl font-extrabold text-gray-900 sm:text-5xl">
            {t('title')}
          </h1>
          <p className="text-lg text-gray-600">
            {t('subtitle')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Contact Form */}
          <div className="rounded-3xl bg-white p-8 shadow-2xl">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Send us a message</h2>
            <form className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Message</label>
                <textarea
                  rows={6}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Your message..."
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-xl"
              >
                Send Message
              </button>
            </form>
          </div>
          
          {/* Contact Info */}
          <div className="rounded-3xl bg-white p-8 shadow-2xl">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Contact Information</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl">
                  📍
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Address</h3>
                  <p className="text-gray-600">123 Business Street, Shenzhen, China</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl">
                  📞
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Phone</h3>
                  <p className="text-gray-600">+86 123 4567 8900</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl">
                  ✉️
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Email</h3>
                  <p className="text-gray-600">info@smartcabinet.com</p>
                </div>
              </div>
            </div>
            
            {/* Google Maps Placeholder */}
            <div className="mt-8 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 p-8 text-center">
              <div className="text-6xl">🗺️</div>
              <p className="mt-4 font-semibold text-blue-800">Google Maps</p>
              <p className="text-sm text-blue-600">Integration coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

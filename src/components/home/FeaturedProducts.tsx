import { getTranslations } from 'next-intl/server';

export default async function FeaturedProducts({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'Home' });
  
  const products = [
    { id: 1, name: 'Smart Cabinet Pro', description: 'Advanced intelligent storage solution', image: '/products/pro.jpg' },
    { id: 2, name: 'Vending Machine Elite', description: 'Smart vending with AI recognition', image: '/products/elite.jpg' },
    { id: 3, name: 'Intelligent Locker', description: 'Secure storage with mobile access', image: '/products/locker.jpg' },
  ];
  
  return (
    <section className="bg-gradient-to-br from-gray-50 to-blue-50 px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl animate-fade-in-up">
        <h2 className="mb-4 text-center text-3xl font-bold text-gray-900 sm:text-4xl">
          {t('featured.title')}
        </h2>
        <p className="mb-12 text-center text-lg text-gray-600">
          {t('featured.subtitle')}
        </p>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="group overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-xl animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative h-48 overflow-hidden bg-gray-100">
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                  <span className="text-4xl">📦</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="mb-2 text-xl font-bold text-gray-900">{product.name}</h3>
                <p className="mb-4 text-gray-600">{product.description}</p>
                <a
                  href={`/${locale}/products`}
                  className="inline-block rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-blue-700 hover:to-blue-800"
                >
                  View Details
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { getTranslations } from 'next-intl/server';

export default async function HeroSection({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'Home' });
  
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 px-4 py-20 sm:py-28 lg:py-40">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-blue-400 blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-indigo-400 blur-3xl animate-pulse animation-delay-1000" />
      </div>
      
      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />
      
      <div className="relative mx-auto max-w-6xl text-center animate-fade-in-up">
        <h1 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
          {t('hero.heading')}
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-lg text-blue-100 sm:text-xl">
          {t('hero.subheading')}
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <a
            href={`/${locale}/products`}
            className="rounded-xl bg-white px-8 py-4 text-base font-semibold text-blue-600 shadow-lg transition-all hover:bg-blue-50 hover:shadow-xl hover:-translate-y-0.5"
          >
            {t('hero.cta')}
          </a>
          <a
            href={`/${locale}/about`}
            className="rounded-xl border-2 border-white px-8 py-4 text-base font-semibold text-white transition-all hover:bg-white/10"
          >
            Learn More
          </a>
        </div>
      </div>
    </section>
  );
}

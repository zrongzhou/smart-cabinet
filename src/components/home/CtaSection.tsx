export default function CtaSection({ locale }: { locale: string }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-blue-900 px-4 py-20 sm:py-28">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-blue-400 blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-indigo-400 blur-3xl animate-pulse animation-delay-1000" />
      </div>
      
      <div className="relative mx-auto max-w-4xl text-center animate-fade-in-up">
        <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
          Ready to Transform Your Storage?
        </h2>
        <p className="mb-10 text-lg text-blue-100 sm:text-xl">
          Contact us today to learn more about our intelligent storage solutions
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <a
            href={`/${locale}/contact`}
            className="rounded-xl bg-white px-8 py-4 text-base font-semibold text-blue-600 shadow-lg transition-all hover:bg-blue-50 hover:shadow-xl hover:-translate-y-0.5"
          >
            Contact Us
          </a>
          <a
            href={`/${locale}/products`}
            className="rounded-xl border-2 border-white px-8 py-4 text-base font-semibold text-white transition-all hover:bg-white/10"
          >
            View Products
          </a>
        </div>
      </div>
    </section>
  );
}

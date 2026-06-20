export default function AdvantagesSection() {
  const advantages = [
    { id: 1, title: 'Intelligent Management', description: 'AI-powered inventory tracking and management system', icon: '🤖' },
    { id: 2, title: 'Secure Storage', description: 'Advanced security features with real-time monitoring', icon: '🔒' },
    { id: 3, title: 'Easy Integration', description: 'Seamless integration with existing systems', icon: '🔗' },
    { id: 4, title: '24/7 Support', description: 'Round-the-clock technical support and maintenance', icon: '🛠️' },
  ];
  
  return (
    <section className="bg-white px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl animate-fade-in-up">
        <h2 className="mb-12 text-center text-3xl font-bold text-gray-900 sm:text-4xl">
          Why Choose Us
        </h2>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {advantages.map((advantage, index) => (
            <div
              key={advantage.id}
              className="rounded-2xl bg-gray-50 p-8 text-center transition-all duration-500 hover:-translate-y-2 hover:shadow-lg animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="mb-4 text-4xl">{advantage.icon}</div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">{advantage.title}</h3>
              <p className="text-gray-600">{advantage.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

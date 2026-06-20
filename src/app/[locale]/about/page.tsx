import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'About Us - Smart Cabinet',
    description: 'Learn about Smart Cabinet, our mission, and our team.',
  };
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 px-4 py-12">
      <div className="container mx-auto max-w-4xl animate-fade-in-up">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="mb-6 text-4xl font-extrabold text-gray-900 sm:text-5xl">
            About Smart Cabinet
          </h1>
          <p className="text-lg text-gray-600">
            Intelligent storage solutions for modern businesses
          </p>
        </div>
        
        {/* Content */}
        <div className="rounded-3xl bg-white p-8 shadow-2xl">
          <div className="prose max-w-none">
            <p className="text-lg leading-relaxed text-gray-700">
              Smart Cabinet is a leading provider of intelligent storage solutions, 
              specializing in smart cabinets, vending machines, and lockers.
            </p>
            
            <h2 className="mt-8 mb-4 text-2xl font-bold text-gray-900">Our Mission</h2>
            <p className="text-lg leading-relaxed text-gray-700">
              To provide intelligent storage solutions that transform how businesses manage their assets.
            </p>
            
            <h2 className="mt-8 mb-4 text-2xl font-bold text-gray-900">Our Team</h2>
            <p className="text-lg leading-relaxed text-gray-700">
              With over 10 years of experience and 500+ clients worldwide, we are committed to excellence.
            </p>
          </div>
          
          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-8 border-t border-gray-200 pt-8">
            <div className="text-center">
              <div className="text-4xl font-extrabold text-blue-600">10+</div>
              <div className="mt-2 text-sm text-gray-600">Years Experience</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-extrabold text-blue-600">500+</div>
              <div className="mt-2 text-sm text-gray-600">Clients Worldwide</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-extrabold text-blue-600">85+</div>
              <div className="mt-2 text-sm text-gray-600">Team Members</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

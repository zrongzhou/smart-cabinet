import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Contact Us - Smart Cabinet',
    description: 'Get in touch with our team for inquiries, support, or partnerships.',
  };
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 px-4 py-12">
      <div className="container mx-auto max-w-4xl animate-fade-in-up">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="mb-6 text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Contact Us
          </h1>
          <p className="text-lg text-gray-600">
            Get in touch with our team
          </p>
        </div>
        
        {/* Contact Form */}
        <div className="rounded-3xl bg-white p-8 shadow-2xl">
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input type="text" className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Message</label>
              <textarea className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2" rows={5} />
            </div>
            <button type="submit" className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-3 text-white">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

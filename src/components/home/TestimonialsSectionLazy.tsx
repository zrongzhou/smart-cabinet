'use client';

import dynamic from 'next/dynamic';

// Client-side wrapper for the TestimonialsSection.
// Next 15 disallows `ssr: false` with `next/dynamic` inside Server Components,
// so the dynamic import lives here instead of in the Server Component page.
const TestimonialsSection = dynamic(
  () => import('@/components/home/TestimonialsSection'),
  { ssr: false, loading: () => <div className="py-20 flex justify-center"><div className="w-8 h-8 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" /></div> }
);

export default TestimonialsSection;

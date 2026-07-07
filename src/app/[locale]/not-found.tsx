import NotFoundView from '@/components/common/NotFoundView';

// Locale-scoped 404 — rendered inside the `[locale]` layout (Navbar/Footer),
// replacing the default Next.js 404 that the browser would otherwise translate.
export default function NotFound() {
  return <NotFoundView />;
}

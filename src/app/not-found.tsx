import NotFoundView from '@/components/common/NotFoundView';

// Root-level 404 for any unmatched (non-locale) route.
export default function NotFound() {
  return <NotFoundView />;
}

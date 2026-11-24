import { lazy, Suspense } from 'react';
import { Landing } from './landing/Landing';
import { useRoute } from './router';

// The lab is a separate chunk. It never imports camera code.
const Lab = lazy(() => import('./lab/Lab'));

export function App() {
  const [route, navigate] = useRoute();
  if (route.page === 'lab') {
    return (
      <Suspense fallback={<p role="status">Loading the lab…</p>}>
        <Lab mode={route.mode} />
      </Suspense>
    );
  }
  return <Landing navigate={navigate} />;
}

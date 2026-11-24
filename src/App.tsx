import { lazy, Suspense } from 'react';
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
  return (
    <main>
      <h1>PaperFault: Learn by Breaking</h1>
      <p>Break a small order system on purpose and watch it recover.</p>
      <a
        href="/lab?mode=digital"
        onClick={(e) => {
          e.preventDefault();
          navigate('/lab?mode=digital');
        }}
      >
        Open the Digital Lab
      </a>
    </main>
  );
}

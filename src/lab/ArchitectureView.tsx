import { lazy, Suspense } from 'react';
import type { SimState } from '../simulation';
import { StatusList } from './StatusList';

const FlowGraph = lazy(() => import('./FlowGraph'));

/** Diagram (lazy) plus a text list. The list renders immediately and is the accessible source. */
export function ArchitectureView({ state }: { state: SimState }) {
  return (
    <section aria-labelledby="arch-h" className="panel">
      <h2 id="arch-h">System</h2>
      <Suspense fallback={<p>Loading diagram…</p>}>
        <FlowGraph state={state} />
      </Suspense>
      <StatusList state={state} />
    </section>
  );
}

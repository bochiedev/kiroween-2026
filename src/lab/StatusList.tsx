import { COMPONENT_LABELS, COMPONENT_ORDER, STATUS_LABELS } from './format';
import { queueDepth } from '../simulation';
import type { SimState } from '../simulation';

/** Text view of simulator state. Status is icon plus word plus color, never color alone. */
export function StatusList({ state }: { state: SimState }) {
  return (
    <div>
      <ul aria-label="Component status" className="status-list">
        {COMPONENT_ORDER.map((id) => {
          const up = state.components[id];
          return (
            <li key={id} className={up ? 'up' : 'down'} data-testid={`status-${id}`}>
              <span aria-hidden="true">{up ? '●' : '▲'}</span> {COMPONENT_LABELS[id]}: {up ? 'UP' : 'DOWN'}
            </li>
          );
        })}
      </ul>
      <h3>Queue ({queueDepth(state)})</h3>
      {state.queue.length === 0 ? (
        <p data-testid="queue-empty">Queue is empty.</p>
      ) : (
        <ol aria-label="Queue contents" className="queue-list">
          {state.queue.map((id) => {
            const order = state.orders[id];
            const s = STATUS_LABELS[order.status];
            return (
              <li key={id}>
                {id}: <span aria-hidden="true">{s.icon}</span> {s.text}, attempts {order.attempts}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

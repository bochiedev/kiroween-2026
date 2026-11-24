import { useState } from 'react';
import { STATUS_LABELS } from './format';
import { Timeline } from './Timeline';
import type { SimState } from '../simulation';

export function OrderInspector({ state }: { state: SimState }) {
  const ids = Object.keys(state.orders);
  const [chosen, setChosen] = useState<string>('');
  const selected = ids.includes(chosen) ? chosen : ids[0];
  const order = selected ? state.orders[selected] : undefined;
  return (
    <section aria-labelledby="inspect-h" className="panel">
      <h2 id="inspect-h">Order inspector</h2>
      {order === undefined ? (
        <p>No orders yet. Submit one.</p>
      ) : (
        <>
          <label>
            Order{' '}
            <select value={selected} onChange={(e) => setChosen(e.target.value)}>
              {ids.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </label>
          <p data-testid="inspector-status">
            {selected}: <span aria-hidden="true">{STATUS_LABELS[order.status].icon}</span> {STATUS_LABELS[order.status].text}, attempts {order.attempts}, saved{' '}
            {state.persisted[selected] ? 'yes' : 'no'}
          </p>
          <Timeline state={state} orderId={selected} />
        </>
      )}
    </section>
  );
}

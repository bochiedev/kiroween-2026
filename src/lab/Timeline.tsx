import { describeEvent, visibleEvents } from './format';
import type { SimState } from '../simulation';

/** Event log from the simulator. TICK_ADVANCED is filtered out of the trail. */
export function Timeline({ state, orderId }: { state: SimState; orderId?: string }) {
  const events = visibleEvents(state.events).filter((e) => orderId === undefined || e.orderId === orderId);
  return (
    <div>
      {events.length === 0 ? (
        <p data-testid="timeline-empty">No events yet.</p>
      ) : (
        <ol aria-label={orderId ? `Events for ${orderId}` : 'Event timeline'} className="timeline" tabIndex={0} data-testid="timeline">
          {events.map((e) => (
            <li key={e.seq}>
              <span className="tick">t{e.tick}</span> {describeEvent(e)}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

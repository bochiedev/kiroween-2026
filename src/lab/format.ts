import { COMPONENT_IDS } from '../simulation';
import type { ComponentId, OrderStatus, SimEvent } from '../simulation';

export const COMPONENT_LABELS: Record<ComponentId, string> = {
  api: 'API',
  queue: 'Queue',
  worker: 'Worker',
  database: 'Database',
};

export const COMPONENT_ORDER = COMPONENT_IDS;

export const STATUS_LABELS: Record<OrderStatus, { icon: string; text: string }> = {
  queued: { icon: '⏳', text: 'queued' },
  in_flight: { icon: '➜', text: 'in flight' },
  completed: { icon: '✔', text: 'completed' },
  parked: { icon: '⏸', text: 'parked' },
  rejected: { icon: '✖', text: 'rejected' },
};

/** Plain-language line for one event. Used by the timeline and the live region. */
export function describeEvent(event: SimEvent): string {
  const who = event.component ? COMPONENT_LABELS[event.component] : '';
  const id = event.orderId ?? '';
  const d = event.detail ?? {};
  switch (event.type) {
    case 'TICK_ADVANCED':
      return `Time advanced to tick ${event.tick}`;
    case 'COMPONENT_DOWN':
      return `${who} went down`;
    case 'COMPONENT_UP':
      return `${who} came back up`;
    case 'ORDER_ACCEPTED':
      return `${id} accepted and queued`;
    case 'ORDER_REJECTED':
      return `${id} rejected: ${String(d.reason ?? 'unavailable').replace('_', ' ')}`;
    case 'ORDER_DELIVERED':
      return `${id} delivered to the worker`;
    case 'PERSIST_FAILED':
      return `${id} could not be saved: Database is down (attempt ${String(d.attempts ?? '?')})`;
    case 'ORDER_RETRY_SCHEDULED':
      return `${id} will retry at tick ${String(d.nextAttemptTick ?? '?')}`;
    case 'ORDER_PARKED':
      return `${id} parked after ${String(d.attempts ?? '?')} attempts, kept safe`;
    case 'ORDER_REQUEUED':
      return `${id} put back in the queue (${String(d.reason ?? '').replace('_', ' ')})`;
    case 'ORDER_PERSISTED':
      return `${id} saved to the Database`;
    case 'ORDER_COMPLETED':
      return `${id} completed`;
    case 'DUPLICATE_SUPPRESSED':
      return `${id} duplicate ignored, nothing saved twice`;
  }
}

/** TICK_ADVANCED events are noise in trails. They are filtered from displayed lists. */
export function visibleEvents(events: readonly SimEvent[]): SimEvent[] {
  return events.filter((e) => e.type !== 'TICK_ADVANCED');
}

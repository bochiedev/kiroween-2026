import type { OrderRecord, SimEvent, SimState } from './types';

export function hasOrder(state: SimState, orderId: string): boolean {
  return Object.hasOwn(state.orders, orderId);
}

export function getOrder(state: SimState, orderId: string): OrderRecord | undefined {
  return hasOrder(state, orderId) ? state.orders[orderId] : undefined;
}

function withOrder(state: SimState, orderId: string, patch: Partial<OrderRecord>): SimState['orders'] {
  const current = getOrder(state, orderId);
  if (!current) throw new Error(`event refers to unknown order "${orderId}"`);
  return { ...state.orders, [orderId]: { ...current, ...patch } };
}

function requireOrderId(event: SimEvent): string {
  if (event.orderId === undefined) throw new Error(`${event.type} needs an orderId`);
  return event.orderId;
}

function numberDetail(event: SimEvent, key: string): number {
  const value = event.detail?.[key];
  if (typeof value !== 'number') throw new Error(`${event.type} needs numeric detail "${key}"`);
  return value;
}

/**
 * The only function that changes state. `step` decides events, then applies them.
 * `replayEvents` applies a stored log, so replay equals live state by construction.
 */
export function applyEvent(state: SimState, event: SimEvent): SimState {
  const next: SimState = { ...state, tick: event.tick, events: [...state.events, event] };
  switch (event.type) {
    case 'TICK_ADVANCED':
      return next;
    case 'COMPONENT_DOWN':
    case 'COMPONENT_UP': {
      if (!event.component) throw new Error(`${event.type} needs a component`);
      return { ...next, components: { ...state.components, [event.component]: event.type === 'COMPONENT_UP' } };
    }
    case 'ORDER_ACCEPTED': {
      const orderId = requireOrderId(event);
      const record: OrderRecord = { status: 'queued', attempts: 0, nextAttemptTick: event.tick, createdSeq: event.seq };
      return { ...next, orders: { ...state.orders, [orderId]: record }, queue: [...state.queue, orderId] };
    }
    case 'ORDER_REJECTED': {
      const orderId = requireOrderId(event);
      const record: OrderRecord = { status: 'rejected', attempts: 0, nextAttemptTick: event.tick, createdSeq: event.seq };
      return { ...next, orders: { ...state.orders, [orderId]: record } };
    }
    case 'ORDER_DELIVERED':
      return { ...next, orders: withOrder(state, requireOrderId(event), { status: 'in_flight' }) };
    case 'PERSIST_FAILED':
      return { ...next, orders: withOrder(state, requireOrderId(event), { attempts: numberDetail(event, 'attempts') }) };
    case 'ORDER_RETRY_SCHEDULED':
      return {
        ...next,
        orders: withOrder(state, requireOrderId(event), {
          status: 'queued',
          nextAttemptTick: numberDetail(event, 'nextAttemptTick'),
        }),
      };
    case 'ORDER_PARKED': {
      const orderId = requireOrderId(event);
      return {
        ...next,
        orders: withOrder(state, orderId, { status: 'parked' }),
        queue: state.queue.filter((id) => id !== orderId),
      };
    }
    case 'ORDER_REQUEUED': {
      const orderId = requireOrderId(event);
      return {
        ...next,
        orders: withOrder(state, orderId, {
          status: 'queued',
          attempts: numberDetail(event, 'attempts'),
          nextAttemptTick: event.tick,
        }),
        queue: state.queue.includes(orderId) ? state.queue : [...state.queue, orderId],
      };
    }
    case 'ORDER_PERSISTED':
      return { ...next, persisted: { ...state.persisted, [requireOrderId(event)]: true } };
    case 'ORDER_COMPLETED': {
      const orderId = requireOrderId(event);
      return {
        ...next,
        orders: withOrder(state, orderId, { status: 'completed' }),
        queue: state.queue.filter((id) => id !== orderId),
      };
    }
    case 'DUPLICATE_SUPPRESSED': {
      const orderId = requireOrderId(event);
      // detail.ack is true when the worker drops an already persisted order from the queue.
      if (event.detail?.ack === true) {
        return {
          ...next,
          orders: withOrder(state, orderId, { status: 'completed' }),
          queue: state.queue.filter((id) => id !== orderId),
        };
      }
      return next;
    }
  }
}

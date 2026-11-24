import { applyEvent, getOrder, hasOrder } from './apply';
import { validateConfig } from './state';
import type { Command, ComponentId, EventDetail, SimConfig, SimEvent, SimState } from './types';

/** Collects events while keeping a working state so later decisions see earlier events. */
class Draft {
  state: SimState;
  constructor(state: SimState) {
    this.state = state;
  }
  emit(type: SimEvent['type'], fields: { orderId?: string; component?: ComponentId; detail?: EventDetail; tick?: number } = {}): void {
    const { tick, ...rest } = fields;
    const event: SimEvent = { seq: this.state.events.length, tick: tick ?? this.state.tick, type, ...rest };
    this.state = applyEvent(this.state, event);
  }
}

function setComponent(draft: Draft, id: ComponentId, up: boolean): void {
  if (draft.state.components[id] === up) return;
  draft.emit(up ? 'COMPONENT_UP' : 'COMPONENT_DOWN', { component: id });
  if (id === 'database' && up) {
    // Parked orders are retained, so recovery puts them back in the queue in acceptance order.
    const parked = Object.entries(draft.state.orders)
      .filter(([, order]) => order.status === 'parked')
      .sort(([, a], [, b]) => a.createdSeq - b.createdSeq);
    for (const [orderId] of parked) {
      draft.emit('ORDER_REQUEUED', { orderId, detail: { reason: 'database_up', attempts: 0 } });
    }
  }
  if (id === 'worker' && !up) {
    // The worker lost its in-flight order. It goes back to the queue with its attempts intact.
    const flying = inFlightId(draft.state);
    if (flying !== undefined) {
      const attempts = getOrder(draft.state, flying)?.attempts ?? 0;
      draft.emit('ORDER_REQUEUED', { orderId: flying, detail: { reason: 'worker_down', attempts } });
    }
  }
}

function submitOrder(draft: Draft, orderId: string): void {
  const { state } = draft;
  const existing = getOrder(state, orderId);
  if (existing && existing.status !== 'rejected') {
    draft.emit('DUPLICATE_SUPPRESSED', { orderId, detail: { reason: 'already_accepted' } });
    return;
  }
  if (!state.components.api) {
    draft.emit('ORDER_REJECTED', { orderId, detail: { reason: 'api_down' } });
  } else if (!state.components.queue) {
    draft.emit('ORDER_REJECTED', { orderId, detail: { reason: 'queue_down' } });
  } else {
    draft.emit('ORDER_ACCEPTED', { orderId });
  }
}

function inFlightId(state: SimState): string | undefined {
  return state.queue.find((id) => getOrder(state, id)?.status === 'in_flight');
}

function nextEligibleId(state: SimState): string | undefined {
  return state.queue.find((id) => {
    const order = getOrder(state, id);
    return order?.status === 'queued' && order.nextAttemptTick <= state.tick;
  });
}

function persistInFlight(draft: Draft, orderId: string, config: SimConfig): void {
  const { state } = draft;
  if (hasOrder(state, orderId) && Object.hasOwn(state.persisted, orderId)) {
    draft.emit('DUPLICATE_SUPPRESSED', { orderId, detail: { reason: 'already_persisted', ack: true } });
    return;
  }
  if (state.components.database) {
    draft.emit('ORDER_PERSISTED', { orderId });
    draft.emit('ORDER_COMPLETED', { orderId });
    return;
  }
  const attempts = (getOrder(state, orderId)?.attempts ?? 0) + 1;
  draft.emit('PERSIST_FAILED', { orderId, component: 'database', detail: { attempts } });
  if (attempts >= config.maxAttempts) {
    draft.emit('ORDER_PARKED', { orderId, detail: { attempts } });
  } else {
    draft.emit('ORDER_RETRY_SCHEDULED', {
      orderId,
      detail: { nextAttemptTick: draft.state.tick + config.backoffTicks, attempts },
    });
  }
}

function tick(draft: Draft, config: SimConfig): void {
  draft.emit('TICK_ADVANCED', { tick: draft.state.tick + 1 });
  const { components } = draft.state;
  if (!components.worker || !components.queue) return;
  const flying = inFlightId(draft.state);
  if (flying !== undefined) {
    persistInFlight(draft, flying, config);
    return;
  }
  const next = nextEligibleId(draft.state);
  if (next !== undefined) draft.emit('ORDER_DELIVERED', { orderId: next });
}

/** Pure. Returns a new state with the events for this command appended. */
export function step(state: SimState, command: Command, config: SimConfig): SimState {
  validateConfig(config);
  const draft = new Draft(state);
  switch (command.type) {
    case 'SET_COMPONENT':
      setComponent(draft, command.id, command.up);
      break;
    case 'SUBMIT_ORDER':
      submitOrder(draft, command.orderId);
      break;
    case 'TICK':
      tick(draft, config);
      break;
  }
  return draft.state;
}

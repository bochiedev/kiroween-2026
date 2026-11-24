import type { SimEvent, SimState } from './types';

/** Events for one order, in log order. */
export function orderTimeline(state: SimState, orderId: string): SimEvent[] {
  return state.events.filter((event) => event.orderId === orderId);
}

export function queueDepth(state: SimState): number {
  return state.queue.length;
}

export interface LessonFacts {
  databaseDown: boolean;
  queueDepth: number;
  inFlightCount: number;
  completedCount: number;
  parkedCount: number;
  rejectedCount: number;
  duplicateSuppressedCount: number;
  persistFailureCount: number;
  /** Database is down and at least one order is waiting in the queue. */
  databaseDownWithPendingWork: boolean;
  /** Database is up, at least one order completed, and none are pending or parked. */
  recovered: boolean;
}

/** Facts for the Digital Lab to read. Contains no UI copy. */
export function lessonFacts(state: SimState): LessonFacts {
  const orders = Object.values(state.orders);
  const count = (status: string) => orders.filter((o) => o.status === status).length;
  const typeCount = (type: SimEvent['type']) => state.events.filter((e) => e.type === type).length;
  const pending = state.queue.length;
  const parkedCount = count('parked');
  const completedCount = count('completed');
  return {
    databaseDown: !state.components.database,
    queueDepth: pending,
    inFlightCount: count('in_flight'),
    completedCount,
    parkedCount,
    rejectedCount: count('rejected'),
    duplicateSuppressedCount: typeCount('DUPLICATE_SUPPRESSED'),
    persistFailureCount: typeCount('PERSIST_FAILED'),
    databaseDownWithPendingWork: !state.components.database && pending > 0,
    recovered: state.components.database && pending === 0 && parkedCount === 0 && completedCount > 0,
  };
}


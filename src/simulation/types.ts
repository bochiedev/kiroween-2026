export type ComponentId = 'api' | 'queue' | 'worker' | 'database';

export const COMPONENT_IDS: readonly ComponentId[] = ['api', 'queue', 'worker', 'database'];

export type Command =
  | { type: 'SET_COMPONENT'; id: ComponentId; up: boolean }
  | { type: 'SUBMIT_ORDER'; orderId: string }
  | { type: 'TICK' };

export type EventType =
  | 'TICK_ADVANCED'
  | 'COMPONENT_DOWN'
  | 'COMPONENT_UP'
  | 'ORDER_ACCEPTED'
  | 'ORDER_REJECTED'
  | 'ORDER_DELIVERED'
  | 'PERSIST_FAILED'
  | 'ORDER_RETRY_SCHEDULED'
  | 'ORDER_PARKED'
  | 'ORDER_REQUEUED'
  | 'ORDER_PERSISTED'
  | 'ORDER_COMPLETED'
  | 'DUPLICATE_SUPPRESSED';

export type EventDetail = Record<string, string | number | boolean>;

export interface SimEvent {
  seq: number;
  tick: number;
  type: EventType;
  orderId?: string;
  component?: ComponentId;
  detail?: EventDetail;
}

export type OrderStatus = 'queued' | 'in_flight' | 'completed' | 'parked' | 'rejected';

export interface OrderRecord {
  status: OrderStatus;
  attempts: number;
  nextAttemptTick: number;
  /** Sequence number of the event that created this record. Gives a stable order. */
  createdSeq: number;
}

export interface SimConfig {
  maxAttempts: number;
  backoffTicks: number;
}

export interface SimState {
  tick: number;
  components: Record<ComponentId, boolean>;
  orders: Record<string, OrderRecord>;
  /** Order ids, FIFO. An in-flight order stays here until acknowledged. */
  queue: string[];
  persisted: Record<string, true>;
  events: SimEvent[];
}

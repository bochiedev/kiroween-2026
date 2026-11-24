import type { SimConfig, SimState } from './types';

export const DEFAULT_CONFIG: SimConfig = { maxAttempts: 3, backoffTicks: 2 };

export function validateConfig(config: SimConfig): void {
  if (!Number.isInteger(config.maxAttempts) || config.maxAttempts < 1) {
    throw new RangeError('maxAttempts must be an integer >= 1');
  }
  if (!Number.isInteger(config.backoffTicks) || config.backoffTicks < 0) {
    throw new RangeError('backoffTicks must be an integer >= 0');
  }
}

/** Empty state: all components up, no orders, no events. */
export function createState(): SimState {
  return {
    tick: 0,
    components: { api: true, queue: true, worker: true, database: true },
    orders: {},
    queue: [],
    persisted: {},
    events: [],
  };
}

import { describe, expect, it } from 'vitest';
import { createState, DEFAULT_CONFIG, step } from '../simulation';
import { lastOrderId, nextOrderId } from './useSimulation';

describe('order id helpers', () => {
  it('numbers orders from state', () => {
    let s = createState();
    expect(nextOrderId(s)).toBe('order-1');
    expect(lastOrderId(s)).toBeUndefined();
    s = step(s, { type: 'SUBMIT_ORDER', orderId: nextOrderId(s) }, DEFAULT_CONFIG);
    expect(lastOrderId(s)).toBe('order-1');
    expect(nextOrderId(s)).toBe('order-2');
  });
});

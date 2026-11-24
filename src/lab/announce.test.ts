import { describe, expect, it } from 'vitest';
import { createState, DEFAULT_CONFIG, step } from '../simulation';
import { announcement } from './announce';

describe('announcement', () => {
  it('describes an empty lab', () => {
    expect(announcement(createState(), false)).toBe('Lab is empty. No events yet.');
  });
  it('announces the latest visible event, skipping ticks', () => {
    let s = step(createState(), { type: 'SET_COMPONENT', id: 'database', up: false }, DEFAULT_CONFIG);
    s = step(s, { type: 'TICK' }, DEFAULT_CONFIG);
    expect(announcement(s, false)).toBe('Database went down');
  });
  it('prefixes replay', () => {
    const s = step(createState(), { type: 'SUBMIT_ORDER', orderId: 'order-1' }, DEFAULT_CONFIG);
    expect(announcement(s, true)).toBe('Replay: order-1 accepted and queued');
  });
});

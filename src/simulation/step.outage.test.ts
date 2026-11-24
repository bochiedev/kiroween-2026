import { describe, expect, it } from 'vitest';
import { run, setC, submit, ticks, types } from './test-helpers';

const cfg = { maxAttempts: 3, backoffTicks: 2 };

describe('database outage (R4)', () => {
  it('records PERSIST_FAILED, keeps the order queued and does not ack it', () => {
    const s = run([setC('database', false), submit('o1'), ...ticks(2)], cfg);
    expect(types(s, 'o1')).toEqual(['ORDER_ACCEPTED', 'ORDER_DELIVERED', 'PERSIST_FAILED', 'ORDER_RETRY_SCHEDULED']);
    expect(s.queue).toEqual(['o1']);
    expect(s.persisted).toEqual({});
    expect(s.orders.o1.status).toBe('queued');
    expect(s.orders.o1.attempts).toBe(1);
  });

  it('schedules the retry using backoffTicks', () => {
    const s = run([setC('database', false), submit('o1'), ...ticks(2)], cfg);
    // failed at tick 2, so the retry is eligible at tick 4
    expect(s.orders.o1.nextAttemptTick).toBe(4);
    const before = run(ticks(1), cfg, s); // tick 3: not eligible
    expect(before.orders.o1.status).toBe('queued');
    const after = run(ticks(1), cfg, before); // tick 4: delivered
    expect(after.orders.o1.status).toBe('in_flight');
  });

  it('parks the order after maxAttempts failures and still retains it', () => {
    const s = run([setC('database', false), submit('o1'), ...ticks(20)], cfg);
    expect(s.orders.o1.status).toBe('parked');
    expect(s.orders.o1.attempts).toBe(3);
    expect(types(s, 'o1').filter((t) => t === 'PERSIST_FAILED')).toHaveLength(3);
    expect(types(s, 'o1').at(-1)).toBe('ORDER_PARKED');
    expect(s.queue).toEqual([]);
    expect(Object.hasOwn(s.orders, 'o1')).toBe(true);
    expect(s.persisted).toEqual({});
  });

  it('with maxAttempts 1 parks on the first failure', () => {
    const s = run([setC('database', false), submit('o1'), ...ticks(2)], { maxAttempts: 1, backoffTicks: 0 });
    expect(s.orders.o1.status).toBe('parked');
  });

  it('retains pending orders queued behind a failing order', () => {
    const s = run([setC('database', false), submit('a'), submit('b'), ...ticks(2)], cfg);
    expect(s.queue).toEqual(['a', 'b']);
  });

  it('with backoffTicks 0 retries on the very next tick', () => {
    const s = run([setC('database', false), submit('o1'), ...ticks(3)], { maxAttempts: 5, backoffTicks: 0 });
    expect(s.orders.o1.status).toBe('in_flight');
  });

  it('requeues an in-flight order when the worker goes down, keeping attempts', () => {
    const s = run([submit('o1'), ...ticks(1), setC('worker', false)], cfg);
    expect(s.orders.o1.status).toBe('queued');
    expect(s.queue).toEqual(['o1']);
    expect(types(s, 'o1').at(-1)).toBe('ORDER_REQUEUED');
  });
});

import { describe, expect, it } from 'vitest';
import { applyEvent } from './apply';
import { run, setC, submit, ticks, types } from './test-helpers';

const cfg = { maxAttempts: 3, backoffTicks: 2 };

describe('recovery and exactly-once (R5)', () => {
  it('completes a pending order after the database comes back before it parks', () => {
    const s = run([setC('database', false), submit('o1'), ...ticks(2), setC('database', true), ...ticks(6)], cfg);
    expect(s.orders.o1.status).toBe('completed');
    expect(types(s, 'o1')).toContain('PERSIST_FAILED');
    expect(types(s, 'o1').filter((t) => t === 'ORDER_COMPLETED')).toHaveLength(1);
    expect(s.persisted).toEqual({ o1: true });
  });

  it('requeues parked orders when the database comes back, then completes them', () => {
    let s = run([setC('database', false), submit('a'), submit('b'), ...ticks(30)], cfg);
    expect(s.orders.a.status).toBe('parked');
    expect(s.orders.b.status).toBe('parked');
    s = run([setC('database', true)], cfg, s);
    expect(s.queue).toEqual(['a', 'b']);
    expect(s.orders.a.attempts).toBe(0);
    s = run(ticks(6), cfg, s);
    expect(s.orders.a.status).toBe('completed');
    expect(s.orders.b.status).toBe('completed');
    expect(s.queue).toEqual([]);
  });

  it('suppresses a duplicate submit after completion without changing persisted data', () => {
    const done = run([submit('o1'), ...ticks(2)], cfg);
    const again = run([submit('o1'), ...ticks(3)], cfg, done);
    expect(again.persisted).toEqual(done.persisted);
    expect(types(again, 'o1').filter((t) => t === 'ORDER_PERSISTED')).toHaveLength(1);
    expect(types(again, 'o1').filter((t) => t === 'ORDER_COMPLETED')).toHaveLength(1);
    expect(types(again, 'o1')).toContain('DUPLICATE_SUPPRESSED');
  });

  it('suppresses a retry of an already persisted order and acknowledges it', () => {
    // Crafted state: persisted but still in flight (for example an ack that never arrived).
    let s = run([submit('o1'), ...ticks(1)], cfg);
    s = applyEvent(s, { seq: s.events.length, tick: s.tick, type: 'ORDER_PERSISTED', orderId: 'o1' });
    s = run(ticks(1), cfg, s);
    expect(types(s, 'o1').filter((t) => t === 'ORDER_PERSISTED')).toHaveLength(1);
    expect(types(s, 'o1').at(-1)).toBe('DUPLICATE_SUPPRESSED');
    expect(s.orders.o1.status).toBe('completed');
    expect(s.queue).toEqual([]);
  });

  it('keeps every accepted order in exactly one location after a full outage cycle', () => {
    const s = run(
      [submit('a'), setC('database', false), submit('b'), submit('c'), ...ticks(4), setC('database', true), ...ticks(1)],
      cfg,
    );
    for (const [id, o] of Object.entries(s.orders)) {
      const inQueue = s.queue.includes(id);
      if (o.status === 'completed' || o.status === 'parked') expect(inQueue).toBe(false);
      else expect(inQueue).toBe(true);
    }
    expect(Object.keys(s.orders).sort()).toEqual(['a', 'b', 'c']);
  });

  it('orders requeued parked work by acceptance, not by id', () => {
    const s = run([setC('database', false), submit('z'), submit('a'), ...ticks(30), setC('database', true)], cfg);
    expect(s.queue).toEqual(['z', 'a']);
  });
});

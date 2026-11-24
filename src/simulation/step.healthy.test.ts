import { describe, expect, it } from 'vitest';
import { run, setC, submit, ticks, types } from './test-helpers';

describe('healthy order (R3)', () => {
  it('accepts, delivers on next tick, persists and completes, then leaves the queue', () => {
    let s = run([submit('o1')]);
    expect(types(s)).toEqual(['ORDER_ACCEPTED']);
    expect(s.queue).toEqual(['o1']);
    s = run(ticks(1), undefined, s);
    expect(s.orders.o1.status).toBe('in_flight');
    expect(types(s)).toEqual(['ORDER_ACCEPTED', 'ORDER_DELIVERED']);
    s = run(ticks(1), undefined, s);
    expect(types(s)).toEqual(['ORDER_ACCEPTED', 'ORDER_DELIVERED', 'ORDER_PERSISTED', 'ORDER_COMPLETED']);
    expect(s.orders.o1.status).toBe('completed');
    expect(s.persisted).toEqual({ o1: true });
    expect(s.queue).toEqual([]);
  });

  it('does not deliver in the same step as the submit', () => {
    expect(run([submit('o1')]).orders.o1.status).toBe('queued');
  });

  it('processes orders in FIFO order, one at a time', () => {
    const s = run([submit('a'), submit('b'), ...ticks(4)]);
    expect(types(s).filter((t) => t === 'ORDER_COMPLETED')).toHaveLength(2);
    const completed = s.events.filter((e) => e.type === 'ORDER_COMPLETED').map((e) => e.orderId);
    expect(completed).toEqual(['a', 'b']);
  });

  it('rejects when the API is down and enqueues nothing', () => {
    const s = run([setC('api', false), submit('o1'), ...ticks(3)]);
    expect(s.events.find((e) => e.type === 'ORDER_REJECTED')?.detail).toEqual({ reason: 'api_down' });
    expect(s.queue).toEqual([]);
    expect(s.orders.o1.status).toBe('rejected');
  });

  it('rejects when the queue is down', () => {
    const s = run([setC('queue', false), submit('o1')]);
    expect(s.events[s.events.length - 1].detail).toEqual({ reason: 'queue_down' });
    expect(s.queue).toEqual([]);
  });

  it('allows resubmitting a rejected id once the API is back', () => {
    const s = run([setC('api', false), submit('o1'), setC('api', true), submit('o1'), ...ticks(2)]);
    expect(s.orders.o1.status).toBe('completed');
  });

  it('suppresses a duplicate submit of an accepted id', () => {
    const s = run([submit('o1'), submit('o1'), ...ticks(4)]);
    expect(types(s)).toEqual(['ORDER_ACCEPTED', 'DUPLICATE_SUPPRESSED', 'ORDER_DELIVERED', 'ORDER_PERSISTED', 'ORDER_COMPLETED']);
  });

  it('does not process while the worker is down, and resumes when it is up', () => {
    let s = run([setC('worker', false), submit('o1'), ...ticks(3)]);
    expect(s.orders.o1.status).toBe('queued');
    s = run([setC('worker', true), ...ticks(2)], undefined, s);
    expect(s.orders.o1.status).toBe('completed');
  });

  it('keeps queued orders while the queue is down', () => {
    let s = run([submit('o1'), setC('queue', false), ...ticks(3)]);
    expect(s.queue).toEqual(['o1']);
    s = run([setC('queue', true), ...ticks(2)], undefined, s);
    expect(s.orders.o1.status).toBe('completed');
  });

  it('is safe with ids like __proto__ and constructor', () => {
    const s = run([submit('__proto__'), submit('constructor'), ...ticks(4)]);
    expect(s.queue).toEqual([]);
    expect(Object.hasOwn(s.orders, '__proto__')).toBe(true);
    expect(s.orders['constructor'].status).toBe('completed');
  });

  it('is deterministic: same commands give identical state', () => {
    const cmds = [submit('a'), setC('database', false), ...ticks(3), setC('database', true), ...ticks(3)];
    expect(run(cmds)).toEqual(run(cmds));
  });
});

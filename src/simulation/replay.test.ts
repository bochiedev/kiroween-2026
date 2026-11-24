import { describe, expect, it } from 'vitest';
import { DEFAULT_CONFIG } from './state';
import { replay, replayEvents } from './replay';
import { lessonFacts, orderTimeline, queueDepth } from './selectors';
import { run, setC, submit, ticks } from './test-helpers';

const lesson = [
  submit('o1'),
  ...ticks(2),
  setC('database', false),
  submit('o2'),
  submit('o3'),
  ...ticks(4),
  setC('database', true),
  ...ticks(8),
];

describe('replay (R6)', () => {
  it('replay of commands equals folding step by hand', () => {
    expect(replay(lesson, DEFAULT_CONFIG)).toEqual(run(lesson));
  });

  it('replayEvents reconstructs the live state from the log alone', () => {
    const live = run(lesson);
    expect(replayEvents(live.events)).toEqual(live);
  });

  it('log has contiguous seq numbers, non-decreasing ticks and a type on each event', () => {
    const { events } = run(lesson);
    events.forEach((e, i) => {
      expect(e.seq).toBe(i);
      expect(typeof e.type).toBe('string');
      if (i > 0) expect(e.tick).toBeGreaterThanOrEqual(events[i - 1].tick);
    });
  });

  it('survives a JSON round trip of the log', () => {
    const live = run(lesson);
    expect(replayEvents(JSON.parse(JSON.stringify(live.events)))).toEqual(live);
  });

  it('builds a per-order timeline from the log', () => {
    const s = run(lesson);
    const types = orderTimeline(s, 'o1').map((e) => e.type);
    expect(types).toEqual(['ORDER_ACCEPTED', 'ORDER_DELIVERED', 'ORDER_PERSISTED', 'ORDER_COMPLETED']);
    expect(orderTimeline(s, 'missing')).toEqual([]);
  });
});

describe('selectors (R7)', () => {
  it('queueDepth counts queue entries', () => {
    expect(queueDepth(run([setC('worker', false), submit('a'), submit('b')]))).toBe(2);
  });

  it('reports database down with pending work', () => {
    const s = run([setC('database', false), submit('a'), ...ticks(1)]);
    const facts = lessonFacts(s);
    expect(facts.databaseDown).toBe(true);
    expect(facts.queueDepth).toBe(1);
    expect(facts.inFlightCount).toBe(1);
    expect(facts.databaseDownWithPendingWork).toBe(true);
    expect(facts.recovered).toBe(false);
  });

  it('reports recovery after the lesson', () => {
    const facts = lessonFacts(run(lesson));
    expect(facts.recovered).toBe(true);
    expect(facts.completedCount).toBe(3);
    expect(facts.persistFailureCount).toBeGreaterThan(0);
    expect(facts.databaseDownWithPendingWork).toBe(false);
  });

  it('counts rejected and duplicate events', () => {
    const facts = lessonFacts(run([setC('api', false), submit('x'), setC('api', true), submit('y'), submit('y')]));
    expect(facts.rejectedCount).toBe(1);
    expect(facts.duplicateSuppressedCount).toBe(1);
  });
});

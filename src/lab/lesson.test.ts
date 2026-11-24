import { describe, expect, it } from 'vitest';
import { createState, DEFAULT_CONFIG, step } from '../simulation';
import type { Command } from '../simulation';
import { currentStepIndex, lessonSteps } from './lesson';

const run = (...cmds: Command[]) => cmds.reduce((s, c) => step(s, c, DEFAULT_CONFIG), createState());
const TICK: Command = { type: 'TICK' };
const submit = (orderId: string): Command => ({ type: 'SUBMIT_ORDER', orderId });
const db = (up: boolean): Command => ({ type: 'SET_COMPONENT', id: 'database', up });
const done = (s: ReturnType<typeof run>) => lessonSteps(s).map((x) => x.done);

describe('lessonSteps', () => {
  it('starts with nothing done', () => {
    expect(done(createState())).toEqual([false, false, false, false, false]);
    expect(currentStepIndex(lessonSteps(createState()))).toBe(0);
  });

  it('does not mark the healthy step done on submit alone', () => {
    expect(done(run(submit('order-1')))[0]).toBe(false);
  });

  it('marks healthy done when the order completes', () => {
    expect(done(run(submit('order-1'), TICK, TICK))).toEqual([true, false, false, false, false]);
  });

  it('does not mark database down before a healthy order', () => {
    expect(done(run(db(false)))).toEqual([false, false, false, false, false]);
  });

  it('marks db-down, then queued-retry only after a persist failure', () => {
    const base = [submit('order-1'), TICK, TICK, db(false), submit('order-2')];
    expect(done(run(...base))).toEqual([true, true, false, false, false]);
    expect(done(run(...base, TICK, TICK))).toEqual([true, true, true, false, false]);
  });

  it('marks restore done when the database is back', () => {
    const s = run(submit('order-1'), TICK, TICK, db(false), submit('order-2'), TICK, TICK, db(true));
    expect(done(s)).toEqual([true, true, true, true, false]);
  });

  it('completes the lesson only after the queued order is saved exactly once', () => {
    const s = run(submit('order-1'), TICK, TICK, db(false), submit('order-2'), TICK, TICK, db(true), TICK, TICK, TICK, TICK);
    expect(done(s)).toEqual([true, true, true, true, true]);
    expect(currentStepIndex(lessonSteps(s))).toBe(5);
  });

  it('stays complete after a duplicate resubmit is suppressed', () => {
    const s = run(submit('order-1'), TICK, TICK, db(false), submit('order-2'), TICK, TICK, db(true), TICK, TICK, TICK, TICK, submit('order-2'));
    expect(done(s)[4]).toBe(true);
    expect(s.events.some((e) => e.type === 'DUPLICATE_SUPPRESSED')).toBe(true);
  });
});

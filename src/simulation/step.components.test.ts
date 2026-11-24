import { describe, expect, it } from 'vitest';
import { createState, DEFAULT_CONFIG } from './state';
import { step } from './step';
import { COMPONENT_IDS } from './types';

describe('step SET_COMPONENT (R2)', () => {
  it.each(COMPONENT_IDS)('records COMPONENT_DOWN then COMPONENT_UP for %s', (id) => {
    const down = step(createState(), { type: 'SET_COMPONENT', id, up: false }, DEFAULT_CONFIG);
    expect(down.components[id]).toBe(false);
    expect(down.events).toEqual([{ seq: 0, tick: 0, type: 'COMPONENT_DOWN', component: id }]);
    const up = step(down, { type: 'SET_COMPONENT', id, up: true }, DEFAULT_CONFIG);
    expect(up.components[id]).toBe(true);
    expect(up.events.map((e) => [e.seq, e.type])).toEqual([[0, 'COMPONENT_DOWN'], [1, 'COMPONENT_UP']]);
  });

  it('records no event when the component is already in that state', () => {
    const s = step(createState(), { type: 'SET_COMPONENT', id: 'api', up: true }, DEFAULT_CONFIG);
    expect(s.events).toEqual([]);
  });

  it('does not change other components or mutate the input state', () => {
    const before = createState();
    const snapshot = structuredClone(before);
    const after = step(before, { type: 'SET_COMPONENT', id: 'database', up: false }, DEFAULT_CONFIG);
    expect(before).toEqual(snapshot);
    expect(after.components).toEqual({ api: true, queue: true, worker: true, database: false });
  });

  it('throws on invalid config', () => {
    expect(() => step(createState(), { type: 'TICK' }, { maxAttempts: 0, backoffTicks: 0 })).toThrow(RangeError);
  });
});

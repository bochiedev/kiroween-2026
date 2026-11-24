import { describe, expect, it } from 'vitest';
import { COMPONENT_IDS } from '../simulation/types';
import { componentForMarker, MARKER_IDS } from './markers';
import { createSignalMapper, signalToCommand } from './mapping';
import { step } from '../simulation/step';
import { createState, DEFAULT_CONFIG } from '../simulation/state';

describe('markers (R4.3)', () => {
  it('maps each of the four ids to a distinct component and back', () => {
    const ids = COMPONENT_IDS.map((c) => MARKER_IDS[c]);
    expect(new Set(ids).size).toBe(4);
    for (const c of COMPONENT_IDS) expect(componentForMarker(MARKER_IDS[c])).toBe(c);
  });
  it('rejects other ids', () => {
    expect(componentForMarker(4)).toBeUndefined();
    expect(componentForMarker(-1)).toBeUndefined();
  });
});

describe('mapping (R5)', () => {
  it('turns a signal into SET_COMPONENT', () => {
    expect(signalToCommand({ id: 'queue', present: false })).toEqual({ type: 'SET_COMPONENT', id: 'queue', up: false });
    expect(signalToCommand({ id: 'queue', present: true })).toEqual({ type: 'SET_COMPONENT', id: 'queue', up: true });
  });
  it('drops duplicate signals', () => {
    const map = createSignalMapper();
    expect(map({ id: 'api', present: true })).not.toBeNull();
    expect(map({ id: 'api', present: true })).toBeNull();
    expect(map({ id: 'api', present: false })).not.toBeNull();
    expect(map({ id: 'worker', present: false })).not.toBeNull();
  });
  it('a produced command takes the component down in the simulation', () => {
    const cmd = signalToCommand({ id: 'worker', present: false });
    expect(step(createState(), cmd, DEFAULT_CONFIG).components.worker).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';
import { createState, DEFAULT_CONFIG, step } from '../simulation';
import type { Command } from '../simulation';
import { replayPositions, stateAtPosition, statesMatch } from './replayView';

const run = (...cmds: Command[]) => cmds.reduce((s, c) => step(s, c, DEFAULT_CONFIG), createState());
const live = run(
  { type: 'SUBMIT_ORDER', orderId: 'order-1' },
  { type: 'TICK' },
  { type: 'TICK' },
  { type: 'SET_COMPONENT', id: 'database', up: false },
  { type: 'SUBMIT_ORDER', orderId: 'order-2' },
  { type: 'TICK' },
  { type: 'TICK' },
  { type: 'TICK' },
);

describe('replayView', () => {
  it('starts at the empty lab and ends at the full log', () => {
    const positions = replayPositions(live.events);
    expect(positions[0]).toBe(0);
    expect(positions[positions.length - 1]).toBe(live.events.length);
    expect(stateAtPosition(live.events, positions, 0)).toEqual(createState());
  });

  it('stops only on visible events, except the final position', () => {
    const positions = replayPositions(live.events);
    for (const p of positions.slice(1, -1)) expect(live.events[p - 1].type).not.toBe('TICK_ADVANCED');
  });

  it('every position is a prefix of the live log and the last equals live state', () => {
    const positions = replayPositions(live.events);
    positions.forEach((p, i) => {
      expect(stateAtPosition(live.events, positions, i).events).toEqual(live.events.slice(0, p));
    });
    expect(statesMatch(stateAtPosition(live.events, positions, positions.length - 1), live)).toBe(true);
  });

  it('handles an empty log', () => {
    expect(replayPositions([])).toEqual([0]);
  });
});

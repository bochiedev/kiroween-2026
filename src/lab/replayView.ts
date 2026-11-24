import { replayEvents } from '../simulation';
import type { SimEvent, SimState } from '../simulation';

/**
 * Prefix lengths of the event log that the learner can stop at. Position 0 is the empty lab.
 * Each later position ends on a visible (non-TICK_ADVANCED) event. The last one is always the full log.
 */
export function replayPositions(events: readonly SimEvent[]): number[] {
  const positions = [0];
  events.forEach((e, i) => {
    if (e.type !== 'TICK_ADVANCED') positions.push(i + 1);
  });
  if (positions[positions.length - 1] !== events.length) positions.push(events.length);
  return positions;
}

/** State at a replay cursor. Uses the same engine fold as live replay, from the event log alone. */
export function stateAtPosition(events: readonly SimEvent[], positions: readonly number[], cursor: number): SimState {
  return replayEvents(events.slice(0, positions[cursor]));
}

export function statesMatch(a: SimState, b: SimState): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

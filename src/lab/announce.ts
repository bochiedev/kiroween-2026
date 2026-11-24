import { describeEvent, visibleEvents } from './format';
import type { SimState } from '../simulation';

/** Text for the polite live region: the latest visible event in the state being shown. */
export function announcement(state: SimState, replaying: boolean): string {
  const last = visibleEvents(state.events).at(-1);
  const text = last ? describeEvent(last) : 'Lab is empty. No events yet.';
  return replaying ? `Replay: ${text}` : text;
}

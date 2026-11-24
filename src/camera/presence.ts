import type { ComponentId } from '../simulation/types';
import { componentForMarker } from './markers';

export interface Signal {
  id: ComponentId;
  present: boolean;
}

export interface DebouncerOptions {
  presentFrames: number;
  absentFrames: number;
}

export const DEFAULT_DEBOUNCE: DebouncerOptions = { presentFrames: 3, absentFrames: 5 };

const IDS: readonly ComponentId[] = ['api', 'queue', 'worker', 'database'];

/**
 * Frame-count debouncer. Every component starts as "not reported present". A card seen in
 * `presentFrames` consecutive frames emits present. A reported card missing for
 * `absentFrames` consecutive frames emits absent. A card never seen emits nothing.
 */
export function createDebouncer(options: DebouncerOptions = DEFAULT_DEBOUNCE) {
  const { presentFrames, absentFrames } = options;
  const reported: Record<ComponentId, boolean> = { api: false, queue: false, worker: false, database: false };
  const seen: Record<ComponentId, number> = { api: 0, queue: 0, worker: 0, database: 0 };
  const missing: Record<ComponentId, number> = { api: 0, queue: 0, worker: 0, database: 0 };

  return {
    /** Feed the marker ids detected in one frame. Returns signals for changes only. */
    push(detectedMarkerIds: readonly number[]): Signal[] {
      const inFrame = new Set<ComponentId>();
      for (const m of detectedMarkerIds) {
        const c = componentForMarker(m);
        if (c) inFrame.add(c);
      }
      const out: Signal[] = [];
      for (const id of IDS) {
        if (inFrame.has(id)) {
          seen[id] += 1;
          missing[id] = 0;
          if (!reported[id] && seen[id] >= presentFrames) {
            reported[id] = true;
            out.push({ id, present: true });
          }
        } else {
          missing[id] += 1;
          seen[id] = 0;
          if (reported[id] && missing[id] >= absentFrames) {
            reported[id] = false;
            out.push({ id, present: false });
          }
        }
      }
      return out;
    },
  };
}

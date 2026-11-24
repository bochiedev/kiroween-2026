import type { ComponentId } from '../simulation/types';

/** Fixed ArUco dictionary ids for the four printed cards. */
export const MARKER_IDS: Readonly<Record<ComponentId, number>> = {
  api: 0,
  queue: 1,
  worker: 2,
  database: 3,
};

const BY_MARKER = new Map<number, ComponentId>(
  (Object.entries(MARKER_IDS) as [ComponentId, number][]).map(([component, marker]) => [marker, component]),
);

/** Returns the component for a marker id, or undefined for any other id. */
export function componentForMarker(markerId: number): ComponentId | undefined {
  return BY_MARKER.get(markerId);
}

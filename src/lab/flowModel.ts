import type { ComponentId, SimState } from '../simulation';
import { queueDepth } from '../simulation';
import { COMPONENT_LABELS, COMPONENT_ORDER } from './format';

export interface FlowNodeModel {
  id: ComponentId;
  label: string;
  up: boolean;
  x: number;
  detail: string;
}

export interface FlowEdgeModel {
  id: string;
  source: ComponentId;
  target: ComponentId;
  moving: boolean;
}

export function flowNodes(state: SimState): FlowNodeModel[] {
  return COMPONENT_ORDER.map((id, i) => ({
    id,
    label: COMPONENT_LABELS[id],
    up: state.components[id],
    x: i * 190,
    detail: id === 'queue' ? `${queueDepth(state)} waiting` : '',
  }));
}

/**
 * An edge is "moving" only when the most recent event in the log is an item crossing it.
 * Nothing here is timed. A TICK that did nothing leaves the TICK_ADVANCED event last, so nothing moves.
 */
export function flowEdges(state: SimState): FlowEdgeModel[] {
  const last = state.events[state.events.length - 1];
  const crossing: Partial<Record<string, string>> = {
    ORDER_ACCEPTED: 'api-queue',
    ORDER_DELIVERED: 'queue-worker',
    ORDER_PERSISTED: 'worker-database',
    ORDER_COMPLETED: 'worker-database',
    PERSIST_FAILED: 'worker-database',
  };
  const active = last ? crossing[last.type] : undefined;
  const pairs: [ComponentId, ComponentId][] = [
    ['api', 'queue'],
    ['queue', 'worker'],
    ['worker', 'database'],
  ];
  return pairs.map(([source, target]) => {
    const id = `${source}-${target}`;
    return { id, source, target, moving: id === active };
  });
}

import { applyEvent } from './apply';
import { validateConfig } from './state';
import type { Command, ComponentId, EventDetail, SimConfig, SimEvent, SimState } from './types';

/** Collects events while keeping a working state so later decisions see earlier events. */
class Draft {
  state: SimState;
  constructor(state: SimState) {
    this.state = state;
  }
  emit(type: SimEvent['type'], fields: { orderId?: string; component?: ComponentId; detail?: EventDetail; tick?: number } = {}): void {
    const { tick, ...rest } = fields;
    const event: SimEvent = { seq: this.state.events.length, tick: tick ?? this.state.tick, type, ...rest };
    this.state = applyEvent(this.state, event);
  }
}

function setComponent(draft: Draft, id: ComponentId, up: boolean): void {
  if (draft.state.components[id] === up) return;
  draft.emit(up ? 'COMPONENT_UP' : 'COMPONENT_DOWN', { component: id });
}

/** Pure. Returns a new state with the events for this command appended. */
export function step(state: SimState, command: Command, config: SimConfig): SimState {
  validateConfig(config);
  const draft = new Draft(state);
  switch (command.type) {
    case 'SET_COMPONENT':
      setComponent(draft, command.id, command.up);
      break;
    case 'SUBMIT_ORDER':
    case 'TICK':
      break;
  }
  return draft.state;
}

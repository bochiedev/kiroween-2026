import { applyEvent } from './apply';
import { createState } from './state';
import { step } from './step';
import type { Command, SimConfig, SimEvent, SimState } from './types';

/** Folds `step` over commands, starting from an empty state. */
export function replay(commands: readonly Command[], config: SimConfig): SimState {
  return commands.reduce((state, command) => step(state, command, config), createState());
}

/** Rebuilds state from the event log alone, with no config and no commands. */
export function replayEvents(events: readonly SimEvent[]): SimState {
  return events.reduce(applyEvent, createState());
}

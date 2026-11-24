import { createState, DEFAULT_CONFIG } from './state';
import { step } from './step';
import type { Command, ComponentId, SimConfig, SimEvent, SimState } from './types';

export function run(commands: Command[], config: SimConfig = DEFAULT_CONFIG, from: SimState = createState()): SimState {
  return commands.reduce((s, c) => step(s, c, config), from);
}
export const ticks = (n: number): Command[] => Array.from({ length: n }, () => ({ type: 'TICK' }));
export const submit = (orderId: string): Command => ({ type: 'SUBMIT_ORDER', orderId });
export const setC = (id: ComponentId, up: boolean): Command => ({ type: 'SET_COMPONENT', id, up });
export const types = (state: SimState, orderId?: string): string[] =>
  state.events.filter((e: SimEvent) => e.type !== 'TICK_ADVANCED' && (orderId === undefined || e.orderId === orderId)).map((e) => e.type);

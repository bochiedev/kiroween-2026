import type { Command } from '../simulation/types';
import type { Signal } from './presence';

/** Turns a presence signal into a simulation command. Lives outside the adapter. */
export function signalToCommand(signal: Signal): Command {
  return { type: 'SET_COMPONENT', id: signal.id, up: signal.present };
}

/** Maps signals to commands, dropping any that repeat the last known state. */
export function createSignalMapper() {
  const last = new Map<string, boolean>();
  return (signal: Signal): Command | null => {
    if (last.get(signal.id) === signal.present) return null;
    last.set(signal.id, signal.present);
    return signalToCommand(signal);
  };
}

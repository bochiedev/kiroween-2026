import { useCallback, useEffect, useState } from 'react';
import { createState, DEFAULT_CONFIG, step } from '../simulation';
import type { Command, ComponentId, SimState } from '../simulation';

export const AUTO_RUN_INTERVAL_MS = 1000;

export interface Simulation {
  state: SimState;
  autoRun: boolean;
  dispatch: (command: Command) => void;
  submitOrder: () => void;
  resubmitLast: () => void;
  setComponent: (id: ComponentId, up: boolean) => void;
  tick: () => void;
  setAutoRun: (on: boolean) => void;
  reset: () => void;
}

/** Id for the next new order, derived from state so it is stable under replay. */
export function nextOrderId(state: SimState): string {
  return `order-${Object.keys(state.orders).length + 1}`;
}

export function lastOrderId(state: SimState): string | undefined {
  const ids = Object.keys(state.orders);
  return ids[ids.length - 1];
}

/** Holds SimState. The only timer is the auto-run interval, which dispatches TICK. */
export function useSimulation(): Simulation {
  const [state, setState] = useState<SimState>(createState);
  const [autoRun, setAutoRun] = useState(false);

  const dispatch = useCallback((command: Command) => {
    setState((s) => step(s, command, DEFAULT_CONFIG));
  }, []);

  useEffect(() => {
    if (!autoRun) return;
    const id = window.setInterval(() => dispatch({ type: 'TICK' }), AUTO_RUN_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [autoRun, dispatch]);

  return {
    state,
    autoRun,
    dispatch,
    submitOrder: () => setState((s) => step(s, { type: 'SUBMIT_ORDER', orderId: nextOrderId(s) }, DEFAULT_CONFIG)),
    resubmitLast: () =>
      setState((s) => {
        const id = lastOrderId(s);
        return id === undefined ? s : step(s, { type: 'SUBMIT_ORDER', orderId: id }, DEFAULT_CONFIG);
      }),
    setComponent: (id, up) => dispatch({ type: 'SET_COMPONENT', id, up }),
    tick: () => dispatch({ type: 'TICK' }),
    setAutoRun,
    reset: () => {
      setAutoRun(false);
      setState(createState());
    },
  };
}

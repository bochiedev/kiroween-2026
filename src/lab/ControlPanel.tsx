import { COMPONENT_LABELS, COMPONENT_ORDER } from './format';
import { lastOrderId } from './useSimulation';
import type { Simulation } from './useSimulation';

/** All controls are native buttons: keyboard operable, visible focus, accessible names. */
export function ControlPanel({ sim, disabled }: { sim: Simulation; disabled: boolean }) {
  const { state } = sim;
  return (
    <section aria-labelledby="controls-h" className="panel">
      <h2 id="controls-h">Controls</h2>
      {disabled && <p className="note">Controls are paused while you replay the log.</p>}
      <div className="row">
        <button type="button" disabled={disabled} onClick={sim.submitOrder}>
          Submit order
        </button>
        <button type="button" disabled={disabled || lastOrderId(state) === undefined} onClick={sim.resubmitLast}>
          Resubmit last order
        </button>
      </div>
      <div className="row">
        {COMPONENT_ORDER.map((id) => {
          const up = state.components[id];
          return (
            <button
              key={id}
              type="button"
              disabled={disabled}
              onClick={() => sim.setComponent(id, !up)}
              aria-label={up ? `Take ${COMPONENT_LABELS[id]} down` : `Restore ${COMPONENT_LABELS[id]}`}
            >
              {up ? `Take ${COMPONENT_LABELS[id]} down` : `Restore ${COMPONENT_LABELS[id]}`}
            </button>
          );
        })}
      </div>
      <div className="row">
        <button type="button" disabled={disabled} onClick={sim.tick}>
          Advance one tick
        </button>
        <button type="button" disabled={disabled} aria-pressed={sim.autoRun} onClick={() => sim.setAutoRun(!sim.autoRun)}>
          {sim.autoRun ? 'Pause auto-run' : 'Start auto-run'}
        </button>
        <button type="button" disabled={disabled} onClick={sim.reset}>
          Reset lab
        </button>
      </div>
    </section>
  );
}

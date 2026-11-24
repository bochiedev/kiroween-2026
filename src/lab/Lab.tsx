import './lab.css';
import { useState } from 'react';
import { ArchitectureView } from './ArchitectureView';
import { ControlPanel } from './ControlPanel';
import { LessonPanel } from './LessonPanel';
import { OrderInspector } from './OrderInspector';
import { ReplayControls } from './ReplayControls';
import { replayPositions, stateAtPosition, statesMatch } from './replayView';
import { Timeline } from './Timeline';
import { useSimulation } from './useSimulation';

export default function Lab({ mode }: { mode: 'digital' | 'physical' }) {
  const sim = useSimulation();
  const [cursor, setCursor] = useState<number | null>(null);

  const positions = replayPositions(sim.state.events);
  const replaying = cursor !== null;
  const at = replaying ? Math.min(cursor, positions.length - 1) : positions.length - 1;
  const view = replaying ? stateAtPosition(sim.state.events, positions, at) : sim.state;

  return (
    <div className="lab">
      <main>
        <h1>PaperFault Lab</h1>
        {mode === 'physical' && <p className="note">Camera mode is not available yet. This is the Digital Lab.</p>}
        <p>Tick {view.tick}.</p>
        <div className="grid">
          <LessonPanel state={sim.state} />
          <ControlPanel sim={sim} disabled={replaying} />
          <ArchitectureView state={view} />
          <section aria-labelledby="timeline-h" className="panel">
            <h2 id="timeline-h">Timeline</h2>
            <ReplayControls
              active={replaying}
              cursor={at}
              last={positions.length - 1}
              matchesLive={replaying && at === positions.length - 1 ? statesMatch(view, sim.state) : null}
              onStart={() => {
                sim.setAutoRun(false);
                setCursor(0);
              }}
              onPrev={() => setCursor(Math.max(0, at - 1))}
              onNext={() => setCursor(Math.min(positions.length - 1, at + 1))}
              onExit={() => setCursor(null)}
            />
            <Timeline state={view} />
          </section>
          <OrderInspector state={view} />
        </div>
      </main>
    </div>
  );
}

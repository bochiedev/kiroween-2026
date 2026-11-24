import './lab.css';
import { ControlPanel } from './ControlPanel';
import { ArchitectureView } from './ArchitectureView';
import { useSimulation } from './useSimulation';

export default function Lab({ mode }: { mode: 'digital' | 'physical' }) {
  const sim = useSimulation();
  return (
    <div className="lab">
      <main>
        <h1>PaperFault Lab</h1>
        {mode === 'physical' && (
          <p className="note">Camera mode is not available yet. This is the Digital Lab.</p>
        )}
        <p>Tick {sim.state.tick}.</p>
        <div className="grid">
          <ControlPanel sim={sim} disabled={false} />
          <ArchitectureView state={sim.state} />
        </div>
      </main>
    </div>
  );
}

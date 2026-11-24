import { useSimulation } from './useSimulation';

export default function Lab({ mode }: { mode: 'digital' | 'physical' }) {
  const sim = useSimulation();
  return (
    <main>
      <h1>PaperFault Lab ({mode})</h1>
      <p>Tick {sim.state.tick}. Events logged: {sim.state.events.length}.</p>
    </main>
  );
}

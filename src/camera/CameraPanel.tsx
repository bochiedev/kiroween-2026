import { useEffect, useRef, useState } from 'react';
import type { Command } from '../simulation/types';
import { CameraError, FAILURE_MESSAGES, type CameraFailure } from './errors';
import { createSignalMapper } from './mapping';
import type { CameraSession } from './adapter';

type Status = { kind: 'idle' } | { kind: 'starting' } | { kind: 'running' } | { kind: 'failed'; failure: CameraFailure };

/**
 * Physical mode panel. The camera and detection code load only after the start click.
 * Implemented, not hardware-verified.
 */
export default function CameraPanel({ onCommand }: { onCommand: (command: Command) => void }) {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const videoRef = useRef<HTMLVideoElement>(null);
  const sessionRef = useRef<CameraSession | null>(null);
  const onCommandRef = useRef(onCommand);
  onCommandRef.current = onCommand;

  const aliveRef = useRef(true);
  // Bumped on every start and stop. A start that resolves under an older id is torn down.
  const startIdRef = useRef(0);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      startIdRef.current += 1;
      sessionRef.current?.stop();
      sessionRef.current = null;
    };
  }, []);

  const stop = () => {
    startIdRef.current += 1;
    sessionRef.current?.stop();
    sessionRef.current = null;
    setStatus({ kind: 'idle' });
  };

  const start = async () => {
    if (!videoRef.current) return;
    const id = ++startIdRef.current;
    const current = () => aliveRef.current && startIdRef.current === id;
    setStatus({ kind: 'starting' });
    try {
      const { startCamera } = await import('./adapter');
      const map = createSignalMapper();
      const session = await startCamera({
        video: videoRef.current,
        onSignal: (signal) => {
          if (!current()) return;
          const command = map(signal);
          if (command) onCommandRef.current(command);
        },
      });
      if (!current()) {
        session.stop();
        return;
      }
      sessionRef.current = session;
      setStatus({ kind: 'running' });
    } catch (err) {
      if (!current()) return;
      setStatus({ kind: 'failed', failure: err instanceof CameraError ? err.kind : 'error' });
    }
  };

  return (
    <section aria-labelledby="camera-h" className="panel camera-panel">
      <h2 id="camera-h">Physical mode (camera cards)</h2>
      <p className="note">Implemented, not hardware-verified.</p>
      <p>
        Print the <a href="/cards/index.html">four marker cards</a>, then start the camera. Once a card has been seen, removing it from view takes
        that component down. Video stays in your browser and is never stored or uploaded.
      </p>
      <div className="row">
        {status.kind === 'running' ? (
          <button type="button" onClick={stop}>Stop camera</button>
        ) : (
          <button type="button" onClick={start} disabled={status.kind === 'starting'}>
            Start camera
          </button>
        )}
      </div>
      <video ref={videoRef} className="camera-video" aria-label="Camera preview" hidden={status.kind !== 'running'} />
      <p role="status">
        {status.kind === 'idle' && 'The camera is off.'}
        {status.kind === 'starting' && 'Starting the camera…'}
        {status.kind === 'running' && 'The camera is on. Watching for cards.'}
        {status.kind === 'failed' && FAILURE_MESSAGES[status.failure]}
      </p>
      {status.kind === 'failed' && (
        <p>
          <a href="/lab?mode=digital">Continue in the Digital Lab</a>
        </p>
      )}
    </section>
  );
}

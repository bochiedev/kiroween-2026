export interface ReplayControlsProps {
  active: boolean;
  cursor: number;
  last: number;
  matchesLive: boolean | null;
  onStart: () => void;
  onPrev: () => void;
  onNext: () => void;
  onExit: () => void;
}

export function ReplayControls(p: ReplayControlsProps) {
  return (
    <div>
      <div className="row">
        {!p.active ? (
          <button type="button" onClick={p.onStart}>
            Start replay
          </button>
        ) : (
          <>
            <button type="button" onClick={p.onPrev} disabled={p.cursor <= 0}>
              Replay previous event
            </button>
            <button type="button" onClick={p.onNext} disabled={p.cursor >= p.last}>
              Replay next event
            </button>
            <button type="button" onClick={p.onExit}>
              Exit replay
            </button>
          </>
        )}
      </div>
      {p.active && (
        <p data-testid="replay-status">
          Replay position {p.cursor} of {p.last}.
          {p.matchesLive === null ? '' : p.matchesLive ? ' Replayed state matches live state.' : ' Replayed state differs from live state.'}
        </p>
      )}
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import './landing.css';
import { Portal } from './Portal';
import { isPlainClick, shouldAnimate, TRANSITION_MS } from './motion';

const LAB_PATH = '/lab?mode=digital';
const warmLab = () => {
  void import('../lab/Lab');
};

export function Landing({ navigate }: { navigate: (to: string) => void }) {
  const [entering, setEntering] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!isPlainClick(e)) return; // let the browser open a new tab or window
    e.preventDefault();
    if (entering) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!shouldAnimate(reduced, true)) {
      navigate(LAB_PATH);
      return;
    }
    setEntering(true);
    warmLab();
    timer.current = window.setTimeout(() => navigate(LAB_PATH), TRANSITION_MS);
  };

  return (
    <main className={entering ? 'landing portal-entering' : 'landing'} data-entering={entering}>
      <Portal />
      <div className="landing-copy">
        <h1>PaperFault: Learn by Breaking</h1>
        <p>Break a small order system on purpose, watch it fail, then watch it recover.</p>
        <a className="cta" href={LAB_PATH} onClick={onClick} onMouseEnter={warmLab} onFocus={warmLab}>
          ENTER THE LAB
        </a>
      </div>
    </main>
  );
}

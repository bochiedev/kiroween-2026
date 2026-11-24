import { useEffect, useState } from 'react';

export interface Route {
  page: 'home' | 'lab';
  mode: 'digital' | 'physical';
}

export function parseLocation(pathname: string, search: string): Route {
  const mode = new URLSearchParams(search).get('mode') === 'physical' ? 'physical' : 'digital';
  const clean = pathname.replace(/\/+$/, '') || '/';
  return { page: clean === '/lab' ? 'lab' : 'home', mode };
}

function current(): Route {
  return parseLocation(window.location.pathname, window.location.search);
}

/** Minimal history router. No dependency. */
export function useRoute(): [Route, (to: string) => void] {
  const [route, setRoute] = useState<Route>(current);
  useEffect(() => {
    const onPop = () => setRoute(current());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  const navigate = (to: string) => {
    window.history.pushState({}, '', to);
    setRoute(current());
  };
  return [route, navigate];
}

import { describe, expect, it } from 'vitest';
import { parseLocation } from './router';

describe('parseLocation', () => {
  it('routes / to home', () => {
    expect(parseLocation('/', '').page).toBe('home');
  });
  it('routes /lab?mode=digital to the digital lab', () => {
    expect(parseLocation('/lab', '?mode=digital')).toEqual({ page: 'lab', mode: 'digital' });
  });
  it('defaults the lab mode to digital and accepts a trailing slash', () => {
    expect(parseLocation('/lab/', '')).toEqual({ page: 'lab', mode: 'digital' });
  });
  it('reads physical mode', () => {
    expect(parseLocation('/lab', '?mode=physical').mode).toBe('physical');
  });
  it('treats unknown modes as digital', () => {
    expect(parseLocation('/lab', '?mode=zzz').mode).toBe('digital');
  });
});

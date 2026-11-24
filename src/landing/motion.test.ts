import { describe, expect, it } from 'vitest';
import { isPlainClick, shouldAnimate, TRANSITION_MS } from './motion';

const base = { button: 0, ctrlKey: false, metaKey: false, shiftKey: false, altKey: false };

describe('portal motion helpers', () => {
  it('transition length is within 1000 to 1500 ms', () => {
    expect(TRANSITION_MS).toBeGreaterThanOrEqual(1000);
    expect(TRANSITION_MS).toBeLessThanOrEqual(1500);
  });
  it('plain primary click is plain', () => expect(isPlainClick(base)).toBe(true));
  it('modified or non-primary clicks are not plain', () => {
    expect(isPlainClick({ ...base, ctrlKey: true })).toBe(false);
    expect(isPlainClick({ ...base, metaKey: true })).toBe(false);
    expect(isPlainClick({ ...base, shiftKey: true })).toBe(false);
    expect(isPlainClick({ ...base, button: 1 })).toBe(false);
  });
  it('animates only when plain and motion allowed', () => {
    expect(shouldAnimate(false, true)).toBe(true);
    expect(shouldAnimate(true, true)).toBe(false);
    expect(shouldAnimate(false, false)).toBe(false);
  });
});

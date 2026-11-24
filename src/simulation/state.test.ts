import { describe, expect, it } from 'vitest';
import { createState, DEFAULT_CONFIG, validateConfig } from './state';

describe('createState', () => {
  it('starts with all components up and nothing else', () => {
    expect(createState()).toEqual({
      tick: 0,
      components: { api: true, queue: true, worker: true, database: true },
      orders: {},
      queue: [],
      persisted: {},
      events: [],
    });
  });

  it('returns independent objects on each call', () => {
    const a = createState();
    const b = createState();
    expect(a).not.toBe(b);
    expect(a.components).not.toBe(b.components);
  });
});

describe('validateConfig', () => {
  it('accepts the default config', () => {
    expect(() => validateConfig(DEFAULT_CONFIG)).not.toThrow();
  });
  it('rejects bad values', () => {
    expect(() => validateConfig({ maxAttempts: 0, backoffTicks: 1 })).toThrow(RangeError);
    expect(() => validateConfig({ maxAttempts: 1.5, backoffTicks: 1 })).toThrow(RangeError);
    expect(() => validateConfig({ maxAttempts: 2, backoffTicks: -1 })).toThrow(RangeError);
  });
});

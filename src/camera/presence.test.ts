import { describe, expect, it } from 'vitest';
import { createDebouncer } from './presence';

const frames = (d: ReturnType<typeof createDebouncer>, seq: number[][]) => seq.flatMap((f) => d.push(f));

describe('createDebouncer (R4)', () => {
  it('reports present only after presentFrames consecutive frames', () => {
    const d = createDebouncer({ presentFrames: 3, absentFrames: 5 });
    expect(d.push([0])).toEqual([]);
    expect(d.push([0])).toEqual([]);
    expect(d.push([0])).toEqual([{ id: 'api', present: true }]);
  });

  it('a single noisy frame does not change a signal', () => {
    const d = createDebouncer({ presentFrames: 2, absentFrames: 3 });
    frames(d, [[1], [1]]);
    expect(frames(d, [[], [1], [], [1]])).toEqual([]);
  });

  it('a single stray detection does not report present', () => {
    const d = createDebouncer({ presentFrames: 3, absentFrames: 3 });
    expect(frames(d, [[2], [], [2], [], [2]])).toEqual([]);
  });

  it('reports absent after absentFrames consecutive missing frames', () => {
    const d = createDebouncer({ presentFrames: 1, absentFrames: 3 });
    expect(d.push([3])).toEqual([{ id: 'database', present: true }]);
    expect(d.push([])).toEqual([]);
    expect(d.push([])).toEqual([]);
    expect(d.push([])).toEqual([{ id: 'database', present: false }]);
  });

  it('emits only on change, never repeats', () => {
    const d = createDebouncer({ presentFrames: 1, absentFrames: 1 });
    const out = frames(d, [[0], [0], [0], [], [], [0]]);
    expect(out).toEqual([
      { id: 'api', present: true },
      { id: 'api', present: false },
      { id: 'api', present: true },
    ]);
  });

  it('ignores marker ids outside the four fixed cards', () => {
    const d = createDebouncer({ presentFrames: 1, absentFrames: 1 });
    expect(d.push([4, 99, -1, 1.5])).toEqual([]);
  });

  it('tracks components independently', () => {
    const d = createDebouncer({ presentFrames: 1, absentFrames: 2 });
    expect(d.push([0, 1, 2, 3])).toHaveLength(4);
    d.push([0, 1, 3]);
    expect(d.push([0, 1, 3])).toEqual([{ id: 'worker', present: false }]);
  });

  it('counts duplicate ids in one frame once', () => {
    const d = createDebouncer({ presentFrames: 2, absentFrames: 2 });
    expect(d.push([0, 0, 0])).toEqual([]);
  });

  it('uses defaults of 3 present and 5 absent frames', () => {
    const d = createDebouncer();
    expect(frames(d, [[0], [0], [0]])).toHaveLength(1);
    expect(frames(d, [[], [], [], []])).toEqual([]);
    expect(d.push([])).toEqual([{ id: 'api', present: false }]);
  });
});

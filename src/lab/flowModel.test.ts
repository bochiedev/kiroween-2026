import { describe, expect, it } from 'vitest';
import { createState, DEFAULT_CONFIG, step } from '../simulation';
import type { Command } from '../simulation';
import { flowEdges, flowNodes } from './flowModel';

const run = (...cmds: Command[]) => cmds.reduce((s, c) => step(s, c, DEFAULT_CONFIG), createState());
const moving = (s: ReturnType<typeof run>) => flowEdges(s).filter((e) => e.moving).map((e) => e.id);

describe('flowModel', () => {
  it('has four nodes whose up state comes from the simulator', () => {
    const s = run({ type: 'SET_COMPONENT', id: 'database', up: false });
    const nodes = flowNodes(s);
    expect(nodes.map((n) => n.id)).toEqual(['api', 'queue', 'worker', 'database']);
    expect(nodes.find((n) => n.id === 'database')?.up).toBe(false);
    expect(nodes.find((n) => n.id === 'api')?.up).toBe(true);
  });

  it('shows queue depth on the queue node', () => {
    const s = run({ type: 'SUBMIT_ORDER', orderId: 'a' });
    expect(flowNodes(s).find((n) => n.id === 'queue')?.detail).toBe('1 waiting');
  });

  it('moves nothing at rest', () => {
    expect(moving(createState())).toEqual([]);
  });

  it('moves api-queue on accept, queue-worker on delivery, worker-database on persist', () => {
    const accepted = run({ type: 'SUBMIT_ORDER', orderId: 'a' });
    expect(moving(accepted)).toEqual(['api-queue']);
    const delivered = step(accepted, { type: 'TICK' }, DEFAULT_CONFIG);
    expect(moving(delivered)).toEqual(['queue-worker']);
    const persisted = step(delivered, { type: 'TICK' }, DEFAULT_CONFIG);
    expect(moving(persisted)).toEqual(['worker-database']);
  });

  it('moves nothing on an idle tick', () => {
    expect(moving(run({ type: 'TICK' }))).toEqual([]);
  });
});

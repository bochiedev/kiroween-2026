import fc from 'fast-check';
import { describe, it } from 'vitest';
import { createState } from './state';
import { replay, replayEvents } from './replay';
import { step } from './step';
import { COMPONENT_IDS, type Command, type SimConfig, type SimState } from './types';

const configArb: fc.Arbitrary<SimConfig> = fc.record({
  maxAttempts: fc.integer({ min: 1, max: 5 }),
  backoffTicks: fc.integer({ min: 0, max: 4 }),
});

// Small id pool so duplicates and resubmits are common. Includes prototype-ish names on purpose.
const orderIdArb = fc.constantFrom('a', 'b', 'c', 'd', '__proto__', 'constructor');

const commandArb: fc.Arbitrary<Command> = fc.oneof(
  { weight: 3, arbitrary: fc.record({ type: fc.constant('SET_COMPONENT' as const), id: fc.constantFrom(...COMPONENT_IDS), up: fc.boolean() }) },
  { weight: 3, arbitrary: fc.record({ type: fc.constant('SUBMIT_ORDER' as const), orderId: orderIdArb }) },
  { weight: 5, arbitrary: fc.constant<Command>({ type: 'TICK' }) },
);

const commandsArb = fc.array(commandArb, { maxLength: 80 });
const runs = { numRuns: 500 };

function fold(commands: Command[], config: SimConfig, from: SimState = createState()): SimState {
  return commands.reduce((s, c) => step(s, c, config), from);
}

/** Checks `check` after every command, so a transient violation cannot hide behind a later fix. */
function everyPrefix(commands: Command[], config: SimConfig, check: (s: SimState) => boolean): boolean {
  let s = createState();
  for (const c of commands) {
    s = step(s, c, config);
    if (!check(s)) return false;
  }
  return true;
}

describe('fast-check properties (design, Testing)', () => {
  it('P1: no order has more than one ORDER_COMPLETED event', () => {
    fc.assert(
      fc.property(configArb, commandsArb, (config, commands) =>
        everyPrefix(commands, config, (s) => {
          const seen = new Set<string>();
          for (const e of s.events) {
            if (e.type !== 'ORDER_COMPLETED') continue;
            if (seen.has(e.orderId!)) return false;
            seen.add(e.orderId!);
          }
          return true;
        }),
      ),
      runs,
    );
  });

  it('P2: accepted orders never disappear (queued, in flight, parked or completed) and parked/completed are not in the queue', () => {
    fc.assert(
      fc.property(configArb, commandsArb, (config, commands) =>
        everyPrefix(commands, config, (s) => {
          const accepted = new Set(s.events.filter((e) => e.type === 'ORDER_ACCEPTED').map((e) => e.orderId!));
          for (const id of accepted) {
            if (!Object.hasOwn(s.orders, id)) return false;
            const { status } = s.orders[id];
            const inQueue = s.queue.includes(id);
            if (status === 'queued' || status === 'in_flight') {
              if (!inQueue) return false;
            } else if (status === 'parked' || status === 'completed') {
              if (inQueue) return false;
            } else return false; // rejected is not a valid state for an accepted order
          }
          return new Set(s.queue).size === s.queue.length;
        }),
      ),
      runs,
    );
  });

  it('P3: replaying the same commands gives equal state', () => {
    fc.assert(
      fc.property(configArb, commandsArb, (config, commands) => {
        const a = replay(commands, config);
        const b = replay(commands, config);
        return JSON.stringify(a) === JSON.stringify(b) && a.events.length === b.events.length;
      }),
      runs,
    );
  });

  it('P4: replayEvents(state.events) equals the live state', () => {
    fc.assert(
      fc.property(configArb, commandsArb, (config, commands) => {
        const live = fold(commands, config);
        const rebuilt = replayEvents(live.events);
        return JSON.stringify(rebuilt) === JSON.stringify(live);
      }),
      runs,
    );
  });

  it('P5: attempts never exceed maxAttempts', () => {
    fc.assert(
      fc.property(configArb, commandsArb, (config, commands) =>
        everyPrefix(commands, config, (s) => Object.values(s.orders).every((o) => o.attempts <= config.maxAttempts)),
      ),
      runs,
    );
  });

  it('P6: after the database is up and enough ticks pass, every accepted order is completed', () => {
    fc.assert(
      fc.property(configArb, commandsArb, (config, commands) => {
        let s = fold(commands, config);
        const heal: Command[] = COMPONENT_IDS.map((id) => ({ type: 'SET_COMPONENT', id, up: true }));
        s = fold(heal, config, s);
        // Each order needs at most 2 ticks plus backoff. The bound is generous on purpose.
        const budget = (Object.keys(s.orders).length + 1) * (3 + config.backoffTicks) + 5;
        s = fold(Array.from({ length: budget }, () => ({ type: 'TICK' as const })), config, s);
        const accepted = s.events.filter((e) => e.type === 'ORDER_ACCEPTED').map((e) => e.orderId!);
        return accepted.every((id) => s.orders[id].status === 'completed') && s.queue.length === 0;
      }),
      runs,
    );
  });
});

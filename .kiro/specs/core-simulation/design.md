# Core simulation: design

## Location
`src/simulation/` with no imports from React, DOM or camera code.

## Types (sketch)
```ts
type ComponentId = 'api' | 'queue' | 'worker' | 'database';
type Command =
  | { type: 'SET_COMPONENT'; id: ComponentId; up: boolean }
  | { type: 'SUBMIT_ORDER'; orderId: string }
  | { type: 'TICK' };           // no payload
type SimEvent = { seq: number; tick: number; type: EventType; orderId?: string; component?: ComponentId; detail?: Record<string, unknown> };
interface SimConfig  // not stored in state; passed to step { maxAttempts: number; backoffTicks: number }
interface SimState {
  tick: number;
  components: Record<ComponentId, boolean>;
  orders: Record<string, OrderRecord>;
  queue: string[];          // order ids, FIFO
  persisted: Record<string, true>;
  events: SimEvent[];
}
```
`OrderRecord` holds status (`queued | in_flight | completed | parked | rejected`), `attempts` and `nextAttemptTick`.

## API
- `createState(): SimState` (config is only needed by `step`, so it is not in state)
- `applyEvent(state, event): SimState` is the only state mutator; `step` decides events and applies them
- `step(state, command, config): SimState` is pure and returns a new state with appended events.
- `replay(commands, config): SimState` folds `step` over commands.
- `replayEvents(events): SimState` rebuilds state from events only (used to verify R6).
- Selectors: `orderTimeline`, `queueDepth`, `lessonFacts`.

## Event types
`TICK_ADVANCED`, `COMPONENT_DOWN`, `COMPONENT_UP`, `ORDER_ACCEPTED`, `ORDER_REJECTED`, `ORDER_DELIVERED`, `PERSIST_FAILED`, `ORDER_RETRY_SCHEDULED`, `ORDER_PARKED`, `ORDER_REQUEUED`, `ORDER_PERSISTED`, `ORDER_COMPLETED`, `DUPLICATE_SUPPRESSED`.

## Decisions
- Orders are looked up with `Object.hasOwn` so ids such as `__proto__` or `constructor` are safe.
- Config validation: `maxAttempts >= 1` and `backoffTicks >= 0`, both integers, else `step` throws `RangeError`.
- Time is a `TICK` command, so UI drives a clock outside the kernel (an interval in the UI layer) and tests drive it directly.
- Idempotency key is the order id. Persisted set is checked before every persist.
- One worker, one order in flight at a time, to keep the lesson readable.
- State is immutable, with structural copies per step. Order counts are tiny, so cost is not a concern.

## Testing
- Unit tests per requirement, written as scenarios: healthy, DB down, retry, park, recovery, duplicate suppression, API down.
- fast-check properties (R1, R4, R5, R6), over arbitrary command sequences:
  1. no order has more than one `ORDER_COMPLETED` event
  2. while the database is down, no accepted order disappears from queue, in flight or parked
  3. replaying the same commands gives equal state
  4. `replayEvents(state.events)` equals the live state
  5. attempts never exceed `maxAttempts`
  6. after the database is up and enough ticks pass, every accepted order is completed
- Any counterexample seed found is recorded in `docs/kiro-usage.md`.

# Core simulation: requirements

Status: spec reviewed before implementation (see docs/decision-log.md, 2026-11-25 entries).

## Introduction
A pure TypeScript engine that models one order flowing through API, Queue, Worker and Database. It has no dependency on React, the DOM or the camera. UI and camera input drive it only through commands. All displayed state derives from its events.

## Requirements

### R1. Deterministic engine
**User story:** As a learner, I want the same inputs to give the same result, so that the lesson is reproducible.
1. WHEN the same ordered command list and the same configuration are applied to an empty state THEN the engine SHALL produce identical state and identical event log.
2. The engine SHALL NOT call `Date.now`, `Math.random`, `setTimeout` or `setInterval`. Time advances only through an explicit `TICK` command. `TICK` carries no payload. Each `TICK` increments the tick counter by exactly one and records a `TICK_ADVANCED` event, so the UI clock lives outside the kernel and replay needs no clock.

### R2. Component availability
1. The engine SHALL track availability of `api`, `queue`, `worker` and `database` as up or down.
2. WHEN a `SET_COMPONENT` command changes availability THEN the engine SHALL record a `COMPONENT_DOWN` or `COMPONENT_UP` event. Setting a component to its current state SHALL record no event.

### R3. Healthy order
1. WHEN `SUBMIT_ORDER` is applied and the API is up THEN the engine SHALL record `ORDER_ACCEPTED` and enqueue the order.
2. WHEN the worker is up and an order is at the head of the queue THEN on the next tick the engine SHALL deliver it to the worker.
3. WHEN the database is up THEN the worker SHALL persist the order, record `ORDER_PERSISTED`, then `ORDER_COMPLETED`, and acknowledge it so it leaves the queue.
4. WHEN the API is down THEN `SUBMIT_ORDER` SHALL record `ORDER_REJECTED` (reason `api_down`) and SHALL NOT enqueue anything.
5. WHEN the API is up and the queue is down THEN `SUBMIT_ORDER` SHALL record `ORDER_REJECTED` (reason `queue_down`) and SHALL NOT enqueue anything. A rejected order was never accepted, so it is not pending work.
6. WHEN `SUBMIT_ORDER` carries an order id that is already accepted (any status other than rejected) THEN the engine SHALL record `DUPLICATE_SUPPRESSED` and SHALL NOT enqueue or change anything else. A previously rejected id MAY be submitted again.
7. Processing is one step per tick: with worker and queue both up, a tick either persists the in-flight order or delivers the next eligible queued order (first in FIFO order whose `nextAttemptTick` has been reached), never both. If the worker goes down, the in-flight order is requeued (`ORDER_REQUEUED`). If the queue is down, no delivery or persist happens, and queued orders are retained.

### R4. Database outage
1. WHEN the database is down and the worker tries to persist THEN the engine SHALL record `PERSIST_FAILED` and SHALL NOT acknowledge the order.
2. The order SHALL remain in the queue (pending work SHALL NOT be lost during an outage).
3. WHEN a persist fails THEN the engine SHALL schedule a retry using bounded backoff from configuration (`maxAttempts`, `backoffTicks`).
4. WHEN attempts reach `maxAttempts` THEN the engine SHALL record `ORDER_PARKED` and move the order to a parked state that is still retained, not dropped.

### R5. Recovery and exactly-once
1. WHEN the database comes back up THEN every parked order SHALL be requeued (`ORDER_REQUEUED`, attempts reset to 0, in acceptance order), and pending and requeued orders SHALL be retried and complete.
2. Each order SHALL be persisted at most once. A retry of an already persisted order SHALL record `DUPLICATE_SUPPRESSED` and SHALL NOT change the persisted data.
3. After recovery, every accepted order SHALL be in exactly one terminal or pending location: completed, queued, in flight, or parked.

### R6. Replay and inspection
1. The engine SHALL expose an append-only event log where each event has a sequence number, tick, type and payload.
2. Replaying the event log SHALL reconstruct a state equal to the live state. State changes happen only by applying events (`applyEvent`), so `step` decides events and `replayEvents` re-applies them.
3. The engine SHALL expose a per-order timeline derived from the log.

### R7. Guided lesson steps
1. The engine SHALL expose derived lesson facts (for example "database is down and queue depth is greater than 0") for the Digital Lab to read. It SHALL NOT own UI copy.

## Out of scope
Multiple concurrent workers, network partitions, real persistence, payments, randomness.

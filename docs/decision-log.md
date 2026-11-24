# Architecture and design decisions

| Date | Decision | Alternatives considered | Reason | Kiro assistance | Tests and trade-offs |
|---|---|---|---|---|---|
| 2026-11-24 | Prefer deterministic TypeScript simulation independent from UI | React-driven state/timeout simulation | Easier deterministic replay/property testing | Starter planning only; not an execution claim | To validate |
| 2026-11-24 | Digital Lab must work without webcam | Camera-only product | Ensures judges can test it | Starter planning only | To validate |
| 2026-11-25 | Core-simulation spec fixes before coding: `TICK` has no payload (requirements said it carried a tick number, design said it did not); state changes only via `applyEvent`, so `replayEvents` is exact by construction; `createState()` takes no config; queue-down submit is rejected; duplicate submit id is suppressed; parked orders requeue when the database comes back; worker-down requeues the in-flight order | Keeping tick number in the command; storing config in state | Resolves a requirements/design contradiction and fills behaviour gaps the tasks would otherwise leave undefined | Web agent edit of `.kiro/specs/core-simulation/` | Covered by unit tests and properties, see `docs/kiro-usage.md` |

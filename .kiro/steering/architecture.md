---
inclusion: always
---
# Architecture standards
- React + TypeScript + Vite; lean, accessible components.
- Pure deterministic simulation engine; domain events and state transitions are testable independently from UI.
- Camera adapter emits debounced marker-presence signals only. It must never directly mutate domain data.
- Digital Lab uses the same simulation engine and event model as Physical Lab.
- Event replay reconstructs state deterministically. Retries must not process an order twice. Pending work must not vanish on simulated DB outage.
- Avoid unnecessary server, authentication, payment, AI runtime, heavyweight animation engine.
- Make invalid states explicit. Avoid non-deterministic setTimeout logic inside the simulation kernel; time and random decisions are injected or scheduled as events.
- Create assertions and property-based tests before claiming fault recovery.

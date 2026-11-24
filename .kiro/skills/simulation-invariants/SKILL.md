---
name: simulation-invariants
description: Use when implementing or reviewing PaperFault transaction simulation, message queue processing, retries, recovery, event-sourced replay, or property-based tests.
---
# Deterministic simulation correctness
1. State invariants first: an order completes at most once; failure cannot create a success; queued work is retained across DB outage; replay produces the same final state for the same events; retries are bounded and scheduled explicitly.
2. Design pure event reducers and inject time; keep camera and React separate.
3. Write table-driven unit tests and fast-check properties. Run with generated seeds and record any shrinking counterexample.
4. For each discovered failure record the failing case, fix, and passing rerun in docs/kiro-usage.md.
5. Do not call any hypothetical simulation proof 'verified' without actual test output.

# Core simulation: tasks

- [x] 1. Define types, config and `createState` in `src/simulation/types.ts` and `state.ts` (R1, R2)
- [x] 2. Implement `step` for `SET_COMPONENT`, with unit tests (R2)
- [ ] 3. Implement `SUBMIT_ORDER` and healthy-path ticks to completion, with unit tests (R3)
- [ ] 4. Implement persist failure, bounded retry, parking, with unit tests (R4)
- [ ] 5. Implement recovery and duplicate suppression, with unit tests (R5)
- [ ] 6. Implement `replay`, `replayEvents` and selectors (R6, R7)
- [ ] 7. Write fast-check properties 1 to 6 in `src/simulation/properties.test.ts`
- [ ] 8. Run `npm run test:sim` and `npm run typecheck`; record real output in `docs/kiro-usage.md`

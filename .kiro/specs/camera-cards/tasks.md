# Camera cards: tasks

- [ ] 1. Verify the ArUco library (existence, size, license, maintenance) and record the decision in `docs/decision-log.md` (R3, R6)
- [ ] 2. Implement and unit-test `presence.ts` debouncer with fake frames (R4)
- [ ] 3. Implement and unit-test `markers.ts` and `mapping.ts` (R4, R5)
- [ ] 4. Implement `adapter.ts` and lazy `CameraPanel` with click-only permission and the three fallbacks (R1, R2, R3)
- [ ] 5. Generate printable marker cards and print instructions at a stable path (R6)
- [ ] 6. Tests: import boundary, no `getUserMedia` call without a click, fallback messages with a stubbed `getUserMedia` (R1, R2, R3)
- [ ] 7. Update README and `docs/compliance-checklist.md`: implemented, not hardware-verified (R7)

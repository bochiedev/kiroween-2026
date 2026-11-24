# Digital Lab: design

- Route `/lab` with query `mode=digital|physical`. Digital is the default. Use a minimal hash or history router, not a router dependency, unless needed.
- A `useSimulation` hook wraps `step` and holds `SimState`. Auto-run uses one interval in the hook that dispatches `TICK`. The kernel never sees timers.
- Components: `ArchitectureView` (XYFlow with four fixed nodes, added only when this task begins), `ControlPanel`, `LessonPanel` (reads `lessonFacts`), `Timeline`, `OrderInspector`, `LiveRegion`.
- XYFlow is loaded in the lab chunk only. Camera code is never imported here.
- Node status uses text plus icon plus color. Edges animate only when the simulator reports an item moving, and not under reduced motion.
- Tests: component tests for lesson step completion from state, and Playwright E2E for the full lesson using keyboard only.

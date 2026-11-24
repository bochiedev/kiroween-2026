# Digital Lab: requirements

Status: drafted, not yet implemented. Depends on `core-simulation`.

## Introduction
A camera-free lab at `/lab?mode=digital` where a learner runs the full guided lesson using on-screen controls.

## Requirements

### R1. Direct access
1. Opening `/lab?mode=digital` directly SHALL render the lab with no camera request and no landing page step.
2. The lab SHALL load without the camera module.

### R2. Architecture view
1. The lab SHALL show API, Queue, Worker and Database as four nodes with their up or down state, and the queue contents.
2. Every node state, queue entry and order status SHALL be read from the simulator state.

### R3. Controls
1. The learner SHALL be able to submit an order, toggle each component, advance time (single tick and auto-run with pause) and reset.
2. All controls SHALL be operable by keyboard with visible focus and accessible names.

### R4. Guided lesson
1. The lab SHALL present steps: run a healthy order, take the Database down, submit and observe queued retry, restore the Database, confirm exactly-once completion.
2. A step SHALL be marked done only when the matching lesson facts from the simulator are true.

### R5. Timeline and replay
1. The lab SHALL show the event log as a timeline and a per-order view.
2. The learner SHALL be able to replay the log step by step; replay SHALL use the same engine.

### R6. Accessibility and responsiveness
1. State changes SHALL be announced to assistive tech through a polite live region.
2. State SHALL NOT rely on color alone.
3. The layout SHALL be usable at 360px width.
4. Motion SHALL respect `prefers-reduced-motion`.

# Camera cards: requirements

Status: drafted, not implemented. Depends on `core-simulation` and `digital-lab`. Physical mode cannot be hardware-verified in the web agent environment.

## Introduction
Four fixed printed marker cards (API, Queue, Worker, Database). Removing a card from the camera view takes the matching component down. The camera adapter emits presence signals only.

## Requirements

### R1. Permission and privacy
1. The page SHALL NOT request the camera on load or on route entry. It SHALL request it only after the user clicks a clearly labelled start button.
2. Frames SHALL NOT be stored or uploaded.
3. Stopping the camera SHALL stop all tracks.

### R2. Fallback
1. Permission denied, no device and unsupported browser SHALL each show a distinct message and a link to the Digital Lab.
2. The Digital Lab SHALL remain fully usable in every failure case.

### R3. Lazy loading
1. Camera and detection code SHALL be loaded by dynamic `import()` only after the start click.
2. The landing page and `/lab?mode=digital` SHALL NOT request the camera chunk.

### R4. Marker presence signals
1. The adapter SHALL emit `{ id: ComponentId, present: boolean }` signals only, and SHALL NOT import the simulation.
2. A marker SHALL be reported present after it is seen in at least `presentFrames` consecutive frames and absent after it is missing for at least `absentFrames` consecutive frames (defaults chosen in design). A single noisy frame SHALL NOT change a signal.
3. Only the four fixed marker ids SHALL be accepted. Other ids SHALL be ignored.
4. A signal SHALL be emitted only when presence changes.

### R5. Mapping to commands
1. A mapper outside the adapter SHALL turn a signal into `SET_COMPONENT { id, up: present }`.
2. Duplicate signals SHALL NOT produce commands.

### R6. Printable cards
1. Four marker cards SHALL exist at a stable path with component labels and a short print instruction.
2. Marker patterns SHALL come from the chosen library's dictionary, not hand-drawn.

### R7. Honesty
1. README and `docs/compliance-checklist.md` SHALL describe physical mode as implemented, not hardware-verified, until a human tests it on a device.

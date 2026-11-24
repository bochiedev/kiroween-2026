# Kiro development evidence log

**Status: no executions verified in this starter kit.** Update this as you work. Link commits, terminal output, screenshots and tests. Do not backfill fictional evidence.

| Date | Feature/surface | Problem | Actual Kiro action | Evidence link/path | Result | Verified? |
|---|---|---|---|---|---|---|
| — | Steering | Project standards | Starter definitions added; not tested | `.kiro/steering/` | Pending validation | NO |
| — | Skills | Targeted workflows | Starter definitions added; not tested | `.kiro/skills/` | Pending validation | NO |
| — | Hooks | Automated checks | Configuration added; not executed | `.kiro/hooks/` | Pending validation | NO |
| — | MCP | Browser verification | Configuration added; connection untested | `.kiro/settings/mcp.json` | Pending validation | NO |
| 2026-11-24 | Specs | Plan core features | Agent drafted `core-simulation` and `digital-lab` spec files by hand in a Kiro chat session. The IDE's built-in Spec UI was not used. | `.kiro/specs/core-simulation/`, `.kiro/specs/digital-lab/` | Drafted, not implemented | NO |
| 2026-11-24 | Scaffold | Create app skeleton | `npm install`, `npm run typecheck`, `npm run test:unit` (no tests yet, passes with `--passWithNoTests`), `npm run build` all exited 0 | terminal | Scaffold builds; no features | YES (scaffold only) |
| 2026-11-25 | Web agent: spec review | Requirements said `TICK` carries a tick number, design said it has no payload; behaviour for queue-down submit, duplicate submit, parked-order recovery and worker-down was undefined | Edited `.kiro/specs/core-simulation/` by hand, logged in `docs/decision-log.md` | commit "core-simulation: review spec..." | Spec fixed before coding | YES (file edits only) |
| 2026-11-25 | Web agent: core-simulation tasks 1-8 | Implement engine | Wrote `src/simulation/`, one commit per task, tests run before each commit | `git log`, `src/simulation/*.test.ts` | 50 tests pass (see Phase A experiment below) | YES |
| 2026-11-25 | Skill `simulation-invariants` | Guide engine and tests | The agent read `.kiro/skills/simulation-invariants/SKILL.md` and applied its checklist by hand. The web surface did not auto-activate the skill, so this is NOT a verified skill activation | `.kiro/skills/simulation-invariants/SKILL.md` | Checklist followed manually | NO (activation not observed) |
| 2026-11-25 | Custom agent `simulation-reviewer` | Independent review after Phase A | Not run. No mechanism to invoke it on this surface | none | Not executed | NO |
| 2026-11-25 | Hooks scripts | Run configured checks | Ran `sh scripts/kiro-post-task-check.sh` and `sh scripts/kiro-sim-check.sh` by hand. Both exited 0 and ran typecheck and tests. The Kiro hook triggers (PostTaskExec, PostFileSave) did not fire automatically on this surface | output below | Scripts work; hook triggering unverified | Scripts YES, triggers NO |
| 2026-11-25 | Web agent: digital-lab tasks 1-8 | Implement the camera-free lab | Wrote `src/router.ts`, `src/lab/*`, `e2e/*`, one commit per task, `npm run typecheck && npm run test:unit` before each commit | `git log`, `src/lab/*.test.ts`, `e2e/*.spec.ts` | 76 unit tests and 7 Playwright tests pass (see Phase B experiment) | YES |
| 2026-11-25 | Custom agent `experience-qa` | Review lab after Phase B | Not run. No mechanism to invoke custom agents on this surface | none | Not executed | NO |
| 2026-11-25 | Specs | Draft `camera-cards`, `portal-experience`, `judge-readiness` | Agent wrote requirements, design and tasks by hand. The Kiro Spec UI was not used | `.kiro/specs/camera-cards/`, `.kiro/specs/portal-experience/`, `.kiro/specs/judge-readiness/` | Drafted | YES (file edits only, hand-written) |
| 2026-11-25 | Skill `portal-performance` | Guide portal build | The agent read `.kiro/skills/portal-performance/SKILL.md` and followed it by hand (inline SVG, transform/opacity only, static first frame, link to /lab, reduced motion). Not auto-activated, so NOT a verified skill activation | `.kiro/skills/portal-performance/SKILL.md` | Checklist followed manually | NO (activation not observed) |
| 2026-11-25 | Web agent: portal-experience tasks 1-5 | Implement landing page | Wrote `src/landing/*`, `e2e/portal.spec.ts` | `git log`, `src/landing/motion.test.ts`, `e2e/portal.spec.ts` | 80 unit and 16 Playwright tests pass (see Phase C experiment) | YES |

## Verified experiments

For each real experiment record hypothesis, Kiro surface, inputs, command/tool name, observed output, an issue, change to code/spec, and retest result. Note use of Powers and any custom agents only when they genuinely ran.

## Judge-facing summary

After implementation, turn evidence into a concise summary covering features actually used, why each mattered, and concrete effects. Remove unverified items.


### Phase A experiment: core simulation (2026-11-25, web agent, Node v22.23.4)

- Commands: `npm run typecheck`, `npm run test:sim`, `sh scripts/kiro-post-task-check.sh`, `sh scripts/kiro-sim-check.sh`. All exited 0.
- Result of `npm run test:sim`: 7 test files, 50 tests passed (state 4, step.components 7, step.healthy 11, step.outage 7, step.recovery 6, replay 9, properties 6). Duration about 250 ms.
- Properties P1 to P6 (design, Testing) each run 500 generated cases of up to 80 commands, with maxAttempts 1 to 5 and backoffTicks 0 to 4. Each property that has a per-step invariant is checked after every command, not just at the end. Order ids include `__proto__` and `constructor`.
- fast-check found no counterexample against the final engine. No real engine bug was discovered by the properties, so there is no counterexample to record.
- Sensitivity check (manual, deliberate, reverted, not committed): changing `attempts >= maxAttempts` to `>` made P5 fail with seed -1239051130, shrunk counterexample `maxAttempts 1, backoffTicks 0, [database down, submit a, 4x TICK]`. Disabling the parked-order requeue on database up made P6 fail with seed 701178456, shrunk counterexample `maxAttempts 1, backoffTicks 0, [database down, submit a, 2x TICK]`. These are injected faults, not product bugs. They show the properties can fail.
- Kernel purity: `grep -rnE "Date\.now|Math\.random|setTimeout|setInterval|from 'react|document\.|window\." src/simulation` (non-test files) returned no matches.
- Hook script output (abridged to the pass lines): `RUN: npm run typecheck`, `RUN: npm run test:unit` (50 passed), `RUN: npm run test:sim` (50 passed).


### Phase B experiment: Digital Lab (2026-11-25, web agent, Node v22.23.4, Chromium headless shell 159.0.8154.6 via Playwright)

- Commands: `npm run typecheck`, `npm run test:unit`, `npm run build`, `npm run test:e2e`. All exited 0.
- `npm run test:unit`: 13 test files, 76 tests passed (50 simulation plus router 5, useSimulation 1, flowModel 5, lesson 8, replayView 4, announce 3).
- `npm run test:e2e` (builds, serves `vite preview` on 127.0.0.1:4173, runs Chromium): 7 tests passed in about 7 s. `e2e/lesson.spec.ts` runs the full lesson using only Tab, Enter and Space (a `tabTo` helper presses Tab until the focused element has the wanted name): healthy order, Database down, queued retry (PERSIST_FAILED and retry scheduled in the timeline), restore, drain the queue, duplicate resubmit ignored, order-2 saved exactly once, replay step by step to a state equal to live. `e2e/controls.spec.ts`: keyboard operation and non-`none` focus outline. `e2e/responsive.spec.ts`: no horizontal overflow at 360x740, polite live region text, `▲ Database: DOWN` text marker, animated edge has `animation-name: none` under `reducedMotion: reduce`, and a control test showing it is not `none` without reduced motion.
- Direct load: the lesson test records all requests on `/lab?mode=digital` and asserts none match camera, aruco or getUserMedia. There is no camera code in the repo yet, so this is a weak check until Phase D.
- Bundle: `npm run build` output shows `index` 223.01 kB (70.09 kB gzip), `Lab` 15.17 kB (4.98 kB gzip), `FlowGraph` JS 248.18 kB (85.41 kB gzip). `@xyflow/react` 13.0.3 (MIT) is imported only in `src/lab/FlowGraph.tsx`, loaded with `React.lazy`, and ends up in its own chunk. The `react-flow` string count in the main `index` chunk is 0.
- Not measured: Lighthouse, axe, performance. The 360 px check is horizontal overflow and one button's bounding box only. No screenshots were taken.
- Not verified: the experience-qa agent did not run. Hooks did not fire automatically. The Playwright MCP was not tried in this phase.
- Test-quality notes: the first lesson E2E run failed on two test bugs (asserting "to do" on the current step; ambiguous `timeline` test id). Both were fixes to the test, not to the app. One earlier responsive run failed because Tab was pressed before the lazy lab chunk rendered; fixed with an `openLab` helper that waits for the heading.
- Known limitations: Physical mode (`?mode=physical`) shows a note and falls back to the Digital Lab. The `/` page is a plain placeholder until the portal-experience task. The diagram is `role="img"` with the text list as the accessible source of state.


### Phase C experiment: portal-experience (2026-11-25, web agent, Node v22.23.4, Chromium headless via Playwright)

- Commands: `npm run typecheck`, `npm run test:unit`, `npm run build`, `npm run test:e2e`. All exited 0.
- `npm run test:unit`: 80 tests passed (76 earlier plus 4 in `src/landing/motion.test.ts`).
- `npm run test:e2e`: 16 passed in 10.7 s (7 earlier plus 9 in `e2e/portal.spec.ts`): one h1 and one main, CTA href `/lab?mode=digital` and height at least 44 px, transition then navigation, double activation pushes history once, keyboard Tab and Enter, direct `/lab` has no portal, no Lab or FlowGraph chunk requested while on `/`, reduced motion (ring `animation-name` is `none`, no `portal-entering` class, immediate navigation), control without reduced motion (ring animates), 360x740 (no horizontal overflow, CTA inside viewport).
- Transition timing: the E2E measures wall time from click until the URL changes. It asserts at least 1000 ms and at most 2500 ms, because the timer is `TRANSITION_MS = 1200` and the upper bound includes Playwright overhead. The CSS duration is 1200 ms. The test does not measure frame rate.
- Bundle (`npm run build`): `index` JS 224.85 kB (70.73 kB gzip), `index` CSS 1.49 kB, `Lab` JS 15.20 kB, `FlowGraph` JS 248.18 kB. Landing added about 1.8 kB raw to the main chunk. The landing has no image, font or video request.
- Not measured: Lighthouse, LCP, CLS, CPU or network throttling, real device. Not verified: `?` hover preload behavior (not tested), Safari and Firefox.


### Phase D experiment: camera-cards (2026-11-25, web agent, Node v22.23.4, Chromium headless via Playwright)

- Commands: `npm run typecheck`, `npm run test:unit`, `npm run build`, `npm run test:e2e`. All exited 0.
- Library check (`npm view js-aruco2`, GitHub API): version 2.0.0, MIT, 424 KB unpacked, no dependencies. Details and trade-offs in `docs/decision-log.md`.
- `npm run test:unit`: 19 test files, 108 tests passed (80 earlier plus 28 in `src/camera`: presence 9, mapping 5, adapter failures 7, cards and a real `js-aruco2` round trip 3, import boundary 4). The round trip rasterises each generated marker to RGBA pixels in Node and checks that the library returns the expected id. It is a synthetic image, not a camera frame.
- Import boundary test: sensitivity checked once by temporarily adding a runtime `COMPONENT_IDS` import to `src/camera/mapping.ts`, which made the test fail. The change was reverted.
- `npm run test:e2e`: 23 passed in about 11 s (16 earlier plus 7 in `e2e/camera.spec.ts`): `/` and `/lab?mode=digital` make zero `getUserMedia` calls and request no CameraPanel, adapter or aruco chunk; `/lab?mode=physical` makes zero calls and loads no adapter or aruco chunk until the Start camera click; denied, no device and unsupported each show a distinct message and the Continue in the Digital Lab link works while the lab stays usable; the four card files are served at `/cards/` as `image/svg`; a synthetic camera (a canvas `captureStream` that redraws the four generated markers) goes through the real bundled `js-aruco2` and debouncer: all four components stay UP, removing the worker card makes Worker DOWN, redrawing it makes Worker UP, and Stop camera returns to idle.
- A real bug was found by that last test: in the production bundle `js-aruco2` exported nothing because its top-level `this` becomes `undefined`. Fixed with the `js-aruco2-exports` plugin (decision log).
- Bundle (`npm run build`): `aruco` chunk 25.61 kB (10.36 kB gzip), `adapter` 2.32 kB, `CameraPanel` 2.97 kB, `Lab` 15.46 kB (unchanged by the camera except a lazy import), `index` 224.21 kB. None of the camera chunks load outside physical mode (E2E above).
- Defaults: `presentFrames` 3, `absentFrames` 5 (design). Not tuned against a real camera.
- Not verified: any real camera, printed card, glare, lighting, distance, phone or tablet, Safari, Firefox, `npm run dev` (Vite dev server) with `js-aruco2`, real permission prompt UI, the `https` requirement on a deployed URL, detection accuracy and frame rate (not measured). Physical mode is labelled "implemented, not hardware-verified" in the UI, README and compliance checklist.
- Behaviour to know: a card that is never seen emits no signal, so its component stays as the lab has it (UP by default). A hung `video.play()` has no timeout.

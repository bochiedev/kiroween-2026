# PaperFault: Learn by Breaking

Kiroween 2026 entry, category **Frankenstein**.

PaperFault teaches why a simple distributed system fails and how it recovers. You run an order through four components (API, Queue, Worker, Database), remove the Database, watch work queue up and retry, then restore it and confirm the order completes exactly once.

## Status

| Area | State |
|---|---|
| Simulation (pure TypeScript, six fast-check properties) | Verified: 50 simulation tests pass |
| Digital Lab (`/lab?mode=digital`), keyboard-only full lesson | Verified in Chromium by Playwright |
| Landing portal, reduced motion, 360 px | Verified in Chromium by Playwright |
| Accessibility (axe, WCAG 2.1 A/AA) on `/` and `/lab?mode=digital` | 0 violations, Chromium only |
| Lighthouse (local, simulated throttling) | `/` 100/100/100/100, `/lab?mode=digital` 99/100/100/100 (performance, accessibility, best practices, SEO). Method in `docs/final-report.md` |
| Physical mode (camera and printed cards) | **Implemented, not hardware-verified.** Only a synthetic canvas camera was tested |
| Static-host config (`vercel.json`) | Written, never deployed or run on Vercel |
| Deployment URL, demo video, Devpost text | Not done (human tasks) |

Full evidence: [`docs/final-report.md`](docs/final-report.md) and [`docs/kiro-usage.md`](docs/kiro-usage.md).

## The lesson

1. Run a healthy order through API, Queue, Worker and Database.
2. Take the Database away (digitally, or by removing its physical marker card).
3. Observe persistence loss, queued work and bounded retries.
4. Restore the Database.
5. Inspect the result: exactly-once completion, and replay of the recorded events.

## Modes

- **Digital Lab** (`/lab?mode=digital`): fully functional with no camera. This is the primary mode.
- **Physical mode** (`/lab?mode=physical`): **implemented, not hardware-verified.** Four printed ArUco marker cards (API, Queue, Worker, Database) detected through the browser camera with `js-aruco2`. Print them from [`/cards/index.html`](public/cards/index.html) (regenerate with `npm run cards`). The camera and detection code are lazy-loaded, permission is requested only when you click **Start camera**, frames are never stored or uploaded, and denied, no-camera and unsupported browsers fall back to the Digital Lab. Tested only with a synthetic canvas camera in Chromium, never with a real camera, phone or printed card.

## Stack

Vite, React, TypeScript, XYFlow (React Flow), `js-aruco2` (lazy-loaded, physical mode only), Vitest, fast-check and Playwright with `@axe-core/playwright`. The simulator is pure TypeScript with time advanced only by a `TICK` command and a single event stream. In the Digital Lab the UI shows simulator state. In physical mode a component stays UP until its card has been seen and then removed.

## Repository layout

| Path | Purpose |
|------|---------|
| `.kiro/steering/` | Product, architecture, experience and quality rules for Kiro |
| `.kiro/specs/` | Per-feature requirements, design and tasks (hand-written, not from the Spec UI) |
| `.kiro/skills/` | On-demand skills: simulation invariants, portal performance, demo QA |
| `.kiro/agents/` | Custom agents: `simulation-reviewer`, `experience-qa` |
| `.kiro/hooks/` | Quality-gate hooks run after spec tasks and simulation saves |
| `.kiro/settings/mcp.json` | Playwright MCP configuration |
| `docs/` | Kiro usage evidence, decision log, compliance checklist, demo plan |
| `scripts/` | Helper scripts used by hooks |
| `AGENTS.md` | Guidance for AI agents working in this repo |
| `KIRO_MASTER_PROMPT.md` | The master prompt that drives development |

## How to run

Requirements: Node.js 20+ and npm. Verified on Node v22.23.4.

```bash
npm install
npm run dev          # local dev server
npm run typecheck    # TypeScript check
npm run test:unit    # all unit and property tests (Vitest)
npm run test:sim     # simulation and property-based tests only
npm run build        # typecheck and production build to dist/
npm run test:e2e     # builds, serves the build and runs Playwright (Chromium)
npm run cards        # regenerate printable marker cards in public/cards/
```

`npm run test:e2e` needs a Chromium for Playwright. If it is missing, run `npx playwright install chromium` once.

Judge path (no camera needed): open `/`, choose **ENTER THE LAB**, or go straight to `/lab?mode=digital`. The click-by-click script is in [`docs/demo-plan.md`](docs/demo-plan.md).

Deployment: `vercel.json` holds a static build and an SPA rewrite so `/lab` works on direct load. It contains no secrets. Deploying is a human task, and the config has not been run on Vercel. Camera access needs `https` (or localhost).

## Working with Kiro

Open this folder in Kiro (IDE 1.x or CLI 3.x). `.kiro/` is tracked in Git and must stay visible in the public repository. Check with `git ls-files .kiro`. The hooks in `scripts/` print `SKIP` until the matching npm scripts exist.

## Links

- Kiro documentation: https://kiro.dev/docs/
- Kiroween rules: https://kiroween.devpost.com/rules

# PaperFault: Learn by Breaking

Kiroween 2026 entry, category **Frankenstein**.

PaperFault teaches why a simple distributed system fails and how it recovers. You run an order through four components (API, Queue, Worker, Database), remove the Database, watch work queue up and retry, then restore it and confirm the order completes exactly once.

## Status

Early stage. The repository currently holds Kiro configuration, planning documents and helper scripts. The application has not been built yet, so there is nothing to run. This README will be updated as each part lands.

## The lesson

1. Run a healthy order through API, Queue, Worker and Database.
2. Take the Database away (digitally, or by removing its physical marker card).
3. Observe persistence loss, queued work and bounded retries.
4. Restore the Database.
5. Inspect the result: exactly-once completion, and replay of the recorded events.

## Modes

- **Digital Lab** (`/lab?mode=digital`): fully functional with no camera. This is the primary mode.
- **Physical mode** (`/lab?mode=physical`): **implemented, not hardware-verified.** Four printed ArUco marker cards (API, Queue, Worker, Database) detected through the browser camera with `js-aruco2`. Print them from [`/cards/index.html`](public/cards/index.html) (regenerate with `npm run cards`). The camera and detection code are lazy-loaded, permission is requested only when you click **Start camera**, frames are never stored or uploaded, and denied, no-camera and unsupported browsers fall back to the Digital Lab. Tested only with a synthetic canvas camera in Chromium, never with a real camera, phone or printed card.

## Planned stack

Vite, React, TypeScript, XYFlow (React Flow), a browser ArUco library (choice still to be verified), Vitest, fast-check and Playwright. The simulator is pure TypeScript with an injected clock and event stream, so UI state always reflects real simulator state.

## Repository layout

| Path | Purpose |
|------|---------|
| `.kiro/steering/` | Product, architecture, experience and quality rules for Kiro |
| `.kiro/specs/` | Per-feature requirements, design and tasks (to be generated with Kiro) |
| `.kiro/skills/` | On-demand skills: simulation invariants, portal performance, demo QA |
| `.kiro/agents/` | Custom agents: `simulation-reviewer`, `experience-qa` |
| `.kiro/hooks/` | Quality-gate hooks run after spec tasks and simulation saves |
| `.kiro/settings/mcp.json` | Playwright MCP configuration |
| `docs/` | Kiro usage evidence, decision log, compliance checklist, demo plan |
| `scripts/` | Helper scripts used by hooks |
| `AGENTS.md` | Guidance for AI agents working in this repo |
| `KIRO_MASTER_PROMPT.md` | The master prompt that drives development |

## How to run

The commands below apply once the app scaffold exists. They are the intended workflow, not yet verified.

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev          # local dev server
npm run typecheck    # TypeScript check
npm run test:unit    # unit tests
npm run test:sim     # simulation and property-based tests
npm run build        # production build
```

Open the dev server URL, then choose **Enter the Lab**, or go directly to `/lab?mode=digital`.

## Working with Kiro

Open this folder in Kiro (IDE 1.x or CLI 3.x). `.kiro/` is tracked in Git and must stay visible in the public repository. Check with `git ls-files .kiro`. The hooks in `scripts/` print `SKIP` until the matching npm scripts exist.

## Links

- Kiro documentation: https://kiro.dev/docs/
- Kiroween rules: https://kiroween.devpost.com/rules

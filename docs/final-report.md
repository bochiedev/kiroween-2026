# PaperFault final report (Kiroween 2026, Frankenstein)

Branch `web/implement-tasks`. Produced by the web agent on 2026-11-25. Node v22.23.4, Chromium 159.0.8154.6 (Playwright headless shell). Everything below was run in that environment. Nothing was run on a real device, on Vercel, or in the Kiro IDE.

## Completed

- **Core simulation** (`src/simulation/`): pure TypeScript engine with injected clock, idempotency by order id, bounded retries, replay. Tasks 1 to 8 of `core-simulation`.
- **Digital Lab** (`src/lab/`, `/lab?mode=digital`): works with no camera code. XYFlow diagram is lazy-loaded. Tasks 1 to 8 of `digital-lab`.
- **Portal** (`src/landing/`): CSS/SVG landing page, **ENTER THE LAB** link, 1.2 s transition, reduced-motion fallback, 360 px layout.
- **Camera cards** (`src/camera/`, `public/cards/`): `js-aruco2` adapter, debouncer, signal-to-command mapping, lazy `CameraPanel`, permission only after the **Start camera** click, fallbacks for denied, no device and unsupported, four printable SVG cards plus a print sheet.
- **Judge readiness**: `vercel.json` (no secrets), `public/robots.txt`, meta description, README run instructions and status, `docs/demo-plan.md` runnable script, `e2e/demo.spec.ts`, `e2e/a11y.spec.ts`, compliance checklist and decision log updated.
- **Fix found by axe**: `nested-interactive` (serious) on the lab diagram. The wrapper `role="img"` contained the focusable React Flow attribution link. Changed to `role="group"` in `src/lab/FlowGraph.tsx`.
- **Fix found by camera E2E** (earlier phase): `js-aruco2` exported nothing in the production bundle. Fixed with a small Vite plugin (decision log).
- Five specs exist (`core-simulation`, `digital-lab`, `camera-cards`, `portal-experience`, `judge-readiness`). The last three were written by hand, not with the Spec UI.

## Not completed

- No real-camera test of physical mode. It is labelled **implemented, not hardware-verified**.
- No deployment, no public URL, no check of `vercel.json` on Vercel.
- No demo video, no Devpost text, no screenshots.
- Safari, Firefox, mobile browsers and real touch devices were not tested. All browser tests ran in Chromium only.
- Kiro features that could not run on this surface: automatic skill activation, custom agents `simulation-reviewer` and `experience-qa`, automatic hook triggers, Spec UI. See `docs/kiro-usage.md` rows marked NO.

## Tests run and results

All commands exited 0 on the final tree.

| Command | Result |
|---|---|
| `npm run typecheck` | pass |
| `npm run test:unit` | 19 files, 108 tests passed |
| `npm run test:sim` | 7 files, 50 tests passed. Includes six fast-check properties (500 cases each, up to 80 commands, checked after every command) |
| `npm run build` | pass (`tsc --noEmit` then `vite build`) |
| `npm run test:e2e` | 27 passed, about 13 s, Chromium only |
| `sh scripts/kiro-post-task-check.sh` | ran typecheck, unit and sim tests, all passed (run by hand, not by a Kiro hook) |

The 27 Playwright tests: lesson by keyboard only (1), controls and focus outline (see `e2e/controls.spec.ts`), responsive and reduced motion (`e2e/responsive.spec.ts`), portal (9), camera (7, with stubbed and synthetic cameras), demo path (1, new), axe (3, new). Per-file counts for earlier phases are in `docs/kiro-usage.md`.

### Accessibility (axe)

`@axe-core/playwright`, tags `wcag2a, wcag2aa, wcag21a, wcag21aa`, Chromium, against `vite preview` of the production build.

| Page | Violations | Rules passed |
|---|---|---|
| `/` | 0 | 9 |
| `/lab?mode=digital` | 0 (first run: 1 `nested-interactive`, serious, then fixed) | 25 |
| `/lab?mode=digital` after Database down | 0 (same first-run violation, same fix) | 25 |

axe covers only part of WCAG. It does not replace a manual screen reader test, which was not done.

### Keyboard, 360 px, reduced motion

Real Playwright runs, all passing: full lesson with Tab, Enter and Space only (`e2e/lesson.spec.ts`, `e2e/demo.spec.ts`); 360x740 has no horizontal overflow on `/` and `/lab` and the controls stay inside the viewport; with `reducedMotion: reduce` the portal ring and lab edges have `animation-name: none` and navigation is immediate, and the same elements animate without it.

## Measurements and method

### Lighthouse (measured)

- Tool: `lighthouse@13.6.0` run with `npx -y`, not added to `package.json`.
- Environment: this sandbox (Linux x86_64), Chrome headless shell 159.0.8154.6 from the Playwright cache via `CHROME_PATH`, flags `--headless --no-sandbox --disable-gpu --disable-dev-shm-usage`. Default Lighthouse settings (mobile emulation, `simulate` throttling).
- Target: `vite preview` of `npm run build` output on `127.0.0.1:4173`.
- Command per page: `lighthouse <url> --chrome-flags="..." --only-categories=performance,accessibility,best-practices,seo --output=json --quiet`.
- One run per page. No repeats, so there is no variance estimate. Raw JSON was not kept.

| URL | Performance | Accessibility | Best practices | SEO | LCP | CLS | FCP | TBT |
|---|---|---|---|---|---|---|---|---|
| `/` | 100 | 100 | 100 | 100 | 1.2 s | 0 | 1.2 s | 0 ms |
| `/lab?mode=digital` | 99 | 100 | 100 | 100 | 2.3 s | 0.019 | 0.8 s | 0 ms |

An earlier run on `/` gave LCP 0.8 s, so LCP varies between runs. The Lab LCP of 2.3 s is under the 2.5 s goal by a small margin. These are local numbers on a fast machine with simulated throttling. They say nothing about a deployed URL, a real phone or a real network. SEO was 82 on the first run (no meta description), 91 after adding one, 100 after adding `public/robots.txt`.

### Other measurements

- Transition timing: E2E asserts navigation happens between 1000 and 2500 ms after the click (timer is 1200 ms). Frame rate was not measured.
- Bundle sizes (`vite build` output, earlier phases): `index` about 224 kB (70.7 kB gzip), `FlowGraph` 248 kB (85 kB gzip), `aruco` 25.6 kB (10.4 kB gzip). The E2E tests confirm Lab, FlowGraph and camera chunks are not requested on `/`, and camera chunks are not requested until **Start camera**.
- Not measured: detection accuracy, camera frame rate, memory, any real network.

## Playwright MCP check

Result: **server starts and answers; Kiro client connection not verified.**
- `npx -y @playwright/mcp@latest --version` printed `Version 0.0.86`.
- Sending a JSON-RPC `initialize` over stdio to `npx -y @playwright/mcp@latest --headless` (the exact command in `.kiro/settings/mcp.json`) returned `serverInfo` `Playwright` 1.66.0-alpha-2026-11-18 with the `tools` capability.
- No Kiro MCP client connected to it from this surface, and no MCP tool call was made to test PaperFault. Status for Kiro: unavailable here. Do not claim MCP-driven testing.
- Playwright Test (npm) is separate and did run.

## Kiro features: what actually ran

- Steering, skills, hooks, agents, MCP config files exist in `.kiro/`. None was activated by Kiro on this surface.
- `judge-demo-qa` skill: not auto-activated. The agent read `.kiro/skills/judge-demo-qa/SKILL.md` and followed steps 1, 3 and 4 by hand (landing to lab to replay, keyboard, reduced motion, mobile, exact commands). Not a verified activation.
- Hook scripts were run by hand and passed. The hooks did not fire.
- Property-based testing with fast-check is real (six properties, plus two deliberate fault injections that made P5 and P6 fail, recorded in `docs/kiro-usage.md`).

## Unverified items

- Physical mode on any real camera, printed card, phone or tablet.
- `vercel.json` rewrite behavior (E2E uses `vite preview`, which has its own fallback).
- Behavior in Safari, Firefox, iOS, Android.
- Screen reader behavior.
- Camera `https` requirement on a deployed URL.
- Whether the repository is public, and whether `.kiro/` appears in the public repository.
- Lighthouse on a deployed URL. Lighthouse variance.
- Any Kiro-side feature execution marked NO in `docs/kiro-usage.md`.

## Decisions for the human

1. Physical mode in the video: it is not hardware-verified. Test it with a real camera and printed cards first, or leave it out and say so. The storyboard's 0:00 to 0:15 hook depends on it.
2. Deployment host: `vercel.json` is ready. Choose Vercel or write an equivalent config for another host, then re-run Lighthouse on the live URL.
3. React Flow attribution is visible. Hiding it needs a Pro subscription per its terms. Confirm you want to keep it.
4. Detection thresholds (`presentFrames` 3, `absentFrames` 5) are untuned. Tune them on real hardware.
5. How to describe Kiro usage in Devpost: specs were hand-written, skills and hooks were not auto-activated here. If you want those claims, run them in the Kiro IDE and log the results.

## Blockers

- Lighthouse first attempt failed with `waiting for dynamic debugging port` using full Chrome headless. It ran with the headless shell and extra flags. Not a project problem.
- No mechanism on this surface to run custom agents, fire hooks, use the Spec UI or auto-activate skills.
- No other blockers. All commands passed.

## Human tasks

- Deploy (Vercel or other), confirm `/lab?mode=digital` loads directly on the live URL, run Lighthouse on it.
- Print the four cards from `/cards/index.html` and test physical mode on real hardware (desktop and phone, `https`).
- Record the under-3-minute video following `docs/demo-plan.md`, showing only what ran.
- Write the Devpost answers, using `docs/kiro-usage.md` rows marked YES only.
- Confirm the repository is public with `.kiro/` visible, and review `docs/compliance-checklist.md` before the December 4, 2026 2:00 PM PT deadline.

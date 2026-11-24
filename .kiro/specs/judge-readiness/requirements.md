# Judge readiness: requirements

Status: drafted, not implemented. Depends on all other specs.

## Introduction
A judge can open the project, run it in under five minutes, see the demo path, and check claims against real evidence.

## Requirements

### R1. Run instructions
1. README SHALL list the exact commands to install, run, test and build, and they SHALL work from a clean clone.
2. README status SHALL list what is verified, what is implemented but not hardware-verified, and what is not done.

### R2. Deployment config
1. The repo SHALL include a static-host config (for example `vercel.json` or `netlify.toml`) with an SPA fallback so `/lab` works on direct load.
2. No secrets or credentials SHALL be committed. Real deployment is a human task.

### R3. Demo alignment
1. `docs/demo-plan.md` SHALL match the shipped UI labels and routes. The script SHALL be runnable in the Digital Lab without a camera.
2. A smoke E2E SHALL follow the demo path and pass.

### R4. Quality evidence
1. The repo SHALL record real runs of typecheck, unit, property, E2E and build, with dates and counts.
2. An accessibility scan (axe) SHALL run on `/` and `/lab?mode=digital`, with violations recorded, or be marked not run.
3. Lighthouse numbers SHALL be recorded with exact command and environment, or marked "not measured".

### R5. Honest reporting
1. `docs/kiro-usage.md` SHALL mark every unverified item NO, and end with a final report covering completed, not completed, tests, measurements, unverified items and human decisions.
2. `docs/compliance-checklist.md` SHALL match reality.

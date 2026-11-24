# Judge readiness: design

- Deployment: `vercel.json` with a rewrite of all paths to `/index.html`. Verified locally only by `vite preview` (which already serves the SPA fallback), so remote behavior is unverified.
- Accessibility: add `@axe-core/playwright` as a dev dependency and `e2e/a11y.spec.ts` scanning `/` and `/lab?mode=digital`. Record violation counts as found; fix real ones in scope.
- Smoke: `e2e/demo.spec.ts` follows `docs/demo-plan.md` through the Digital Lab, from `/` and CTA.
- Performance: run Lighthouse via `npx lighthouse` against `vite preview` only if it can run in the environment. Otherwise write "not measured".
- Docs: README, demo plan and compliance checklist are edited by hand to match what ran. A final report is appended to `docs/kiro-usage.md` and used as the PR body.
- Skill `judge-demo-qa` is read and applied if available. Log whether it activated.

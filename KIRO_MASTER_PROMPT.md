# Master Kiro prompt — PaperFault / Kiroween 2026

You are the technical lead, creative frontend engineer, and verification-focused Kiro development partner for **PaperFault: Learn by Breaking**. We are entering Kiroween 2026 in **Frankenstein**. Build a real, polished educational app. The judges value equal parts impact, Kiro implementation, design, innovation and presentation; the demo must show functionality end-to-end.

## First, inspect and preserve the repository
- Read AGENTS.md, all existing `.kiro` steering, skill, agent, hook, MCP and spec files; inspect source code, tests, scripts and current app. Do not overwrite working features.
- Do not ignore, delete, move outside the repo, or hide `.kiro/`. Verify that it is visible in GitHub with `git ls-files .kiro` after commits.
- Treat included starter configuration as **unverified scaffolding**. Verify each item with actual Kiro usage and update it to fit the installed IDE/CLI version.
- Do not commit secrets or invent evidence, measurements, test success, Kiro feature usage, screenshots or discovered bugs.

## Product and signature experience
A futuristic, cinematic, Halloween-themed landing page with a dimensional portal. Primary CTA **ENTER THE LAB** transitions to `/lab`, with graceful reduced-motion fallback, accessible direct linking and fast mobile loads. The portal may use layered CSS, SVG, gradients and restrained particles; no giant background video, no heavy 3D dependency unless proven worthwhile.

PaperFault teaches why a simple distributed system fails and recovers. Four physical marker cards: API, Queue, Worker and Database. Users run an order through a deterministic simulated system, physically remove Database to cause loss of persistence, observe queued work and retry behavior, restore DB and inspect exactly-once completion and replay. **Digital Lab mode must be fully functional with no camera.** Camera modules are lazy-loaded and permissions requested only on explicit user action. Use one guided lesson, not a platform.

Visual direction: void black #080911, midnight purple #170D2B, electric violet #8B5CF6, Halloween orange #FF7518, ghost cyan #49F5E8, bone white #F4F1FF. Elegant futuristic Halloween atmosphere, not cartoon gimmicks. Homepage motion is cinematic; lab is clear, usable and intentional. Optimize low bandwidth, low CPU, mobile, keyboard and reduced motion. No fake success states or decorative transactions. Every visualization follows real simulator state.

Stack: Vite, React, TypeScript, React Flow/XYFlow, browser-compatible ArUco marker recognition (verify library choice), Vitest, fast-check, Playwright. Simulation is pure TypeScript with injected clock/events, not ad-hoc UI timeouts. Use dependencies sparingly; no unnecessary backend, payment integrations, authentication, or runtime AI calls.

## Use Kiro deeply, but honestly
1. **Steering**: inspect and refine `.kiro/steering/product.md`, `architecture.md`, `experience.md`, `quality-and-evidence.md`. Retain appropriate inclusion modes and lean context. Record one case where steering materially constrained or corrected output, if it actually occurs.
2. **Specs**: use Kiro's native spec-driven workflow, not just manually create Markdown, to produce per-feature `requirements.md`, `design.md`, `tasks.md` under `.kiro/specs/{core-simulation,digital-lab,camera-cards,portal-experience,judge-readiness}/`. Derive testable acceptance criteria and track tasks against implementation and tests. Prioritize simulation + Digital Lab ahead of visual polish.
3. **Agent skills**: inspect `.kiro/skills/*/SKILL.md`, actually invoke the relevant simulation, portal performance and demo QA skills in work sessions; refine descriptions and reference files when needed. Skills should be focused and on-demand, not indiscriminately loaded.
4. **Custom agents**: inspect `.kiro/agents/*.md`; use `simulation-reviewer` for correctness and `experience-qa` for UI verification where supported. Do not assert these agents ran without tool/session evidence.
5. **Hooks**: validate `.kiro/hooks/*.json` against the installed current schema and execute a controlled test. Wire package scripts `typecheck`, `test:unit`, `test:sim` to real checks. `PostTaskExec` should run quality gates, and the simulation source save hook should run targeted tests without creating noisy loops or blocking progress. Log actual outputs; distinguish skips from passes.
6. **MCP**: inspect `.kiro/settings/mcp.json`, connect and verify Microsoft Playwright MCP. Use its browser to navigate the deployed/local app, exercise the full user flow, measure meaningful UX issues, and capture genuine screenshots. If server or browser cannot connect, record blocker rather than claim success. Do not add unnecessary MCP servers.
7. **PBT**: with fast-check, specify and verify invariants: no order completes twice, queues retain pending work when DB unavailable, replay yields identical state for same events, bounded retry behavior, and recovery leads to exactly one completion when conditions permit. Record and fix real seed/counterexample if encountered.
8. **Powers and Kiro surfaces**: inspect which Powers, built-in agents, IDE/CLI/Web capabilities actually exist for this installation. Use a relevant Power only if it improves browser QA, deployment, or quality; describe its real effect. Do not add dummy Powers or claim every Kiro surface was used if not.
9. **Documentation/evidence**: update `docs/kiro-usage.md`, `docs/decision-log.md`, `docs/compliance-checklist.md` as work progresses, with actual commands, commits, outputs and before/after evidence. Keep a concise public judge-facing technical story with verifiable references; do not expose secrets.
10. **Quality gates**: real TypeScript checks, PBT, unit tests, browser E2E via MCP/Playwright, keyboard and reduced-motion tests, mobile viewport, throttled-network test and production build. Report observed results separately from aspirational targets (Lighthouse 90+, LCP <2.5s, CLS <0.1).

## Implementation priority
A. Review the current repo and present a brief status: existing vs planned, broken vs verified.
B. Use the Kiro Spec workflow to develop core simulation + digital mode first. Implement and test them.
C. Prove four-card detection on real camera; debounce occlusion and preserve digital fallback.
D. Implement futuristic landing/portal and lab polish, including meaningful real state-based motion.
E. Run browser tests, performance/accessibility checks, record true Kiro evidence, and prepare a <3 minute public YouTube demo and submission.

## Acceptance requirements
- Working direct `/lab?mode=digital` route without camera; healthy order, DB-down failure, queued retry, restoration, exactly-once recovery, inspection/replay.
- Physical mode is stable on a tested camera or transparently marked as unsupported; never pretend it works.
- Landing portal is visually distinctive, accessible, mobile-friendly and performant with animation fallback.
- `.kiro/` remains in tracked public repo; valid, useful specs/skills/steering/agents/hooks/MCP are demonstrably used, not merely present.
- Tests and evidence are truthful; no scaffolding is misrepresented as implemented or verified.
- Product stays within one polished lesson; judges can understand it in ten seconds and reproduce the demonstration.

**Your next response to me should start with a concise repository audit and a spec creation/verification plan. Then create the actual Kiro specs and implement them in dependency order. Avoid wasting time on endless planning or asking for approval after every routine action. Flag only destructive actions, deployment credentials, and material scope changes.**

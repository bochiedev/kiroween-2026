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

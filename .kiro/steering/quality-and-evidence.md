---
inclusion: always
---
# Engineering quality and competition evidence
- Define acceptance criteria and test each feature. No placeholder test output passed off as verified.
- Record real Kiro workflows and engineering changes in docs/kiro-usage.md: task, Kiro surface, config file, what happened, evidence, outcome.
- Never fabricate a discovered bug, screenshot, hook run, MCP call, performance score, or project history.
- Keep .kiro version-controlled; ensure gitignore does not hide any subfolder.
- No tokens/PII in committed files, screenshots, console logs, or demo.
- On each release candidate run TypeScript, unit/PBT, browser tests, accessibility checks, and an actual mobile network performance audit. Document device and conditions.
- If camera fails on hardware, preserve Digital Lab; do not market nonworking physical features.
- Prefer quality and scope control over adding Kiro tools only to increase a count.

---
name: judge-demo-qa
description: Use when preparing Kiroween judge testing, 3-minute demo videos, deployment, accessibility validation, and submission evidence.
---
# Judge-first QA workflow
1. Test landing -> Digital Lab -> run order -> DB unavailable -> retry waiting -> restore DB -> exactly-once completion -> replay.
2. Test optional camera mode only when real device and browser support are available; never require a webcam to understand the product.
3. Verify cold load, direct /lab URL, keyboard navigation, reduced-motion, responsive mobile and fallback errors.
4. Document exact commands, screenshots, test results and Kiro-specific contributions.
5. Build a <= 2:55 video plan: hook, problem, end-to-end working proof, relevant Kiro workflow, outcome.
6. Confirm public repository, license, .kiro root, working URL, public video and bonus answers before submitting.

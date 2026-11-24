# Three-minute demo storyboard (planned, not recorded)

0:00–0:15: physical card removal quick visual hook and consequence (only if working).
0:15–0:35: explain junior developer's failure/recovery learning problem.
0:35–1:45: real run order -> DB down -> queued retry -> DB restore -> exactly once completion -> replay.
1:45–2:05: digital fallback and direct judge URL.
2:05–2:40: show specific real Kiro spec, steering constraint, functioning hook, Playwright MCP run and one verified property-test result; omit features that did not run.
2:40–2:55: clear educational outcome and close.

Use real app captures, no mocked UI as actual functionality, no unlicensed third-party footage/music.


## Runnable script (Digital Lab, no camera)

Matches the shipped labels. `e2e/demo.spec.ts` follows these steps by keyboard and passes.

1. Open `/`. Activate **ENTER THE LAB**. The page moves to `/lab?mode=digital` (after a 1.2 s transition, or at once with reduced motion).
2. Activate **Take Database down**. The status shows `▲ Database: DOWN`.
3. Activate **Submit order**, then **Advance one tick** twice. The timeline shows `order-1 could not be saved` and `order-1 will retry`. The order stays in the queue.
4. Activate **Restore Database**, then **Advance one tick** until the queue is empty. The timeline shows `order-1 saved to the Database` once.
5. Activate **Resubmit last order**. The timeline shows `order-1 duplicate ignored, nothing saved twice`.
6. Activate **Start replay**, then **Replay next event** until the page shows `Replayed state matches live state.`, then **Exit replay**.

The storyboard above stays a plan. The video has not been recorded.

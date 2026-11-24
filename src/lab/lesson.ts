import { lessonFacts } from '../simulation';
import type { SimState } from '../simulation';

export interface LessonStep {
  id: 'healthy' | 'db-down' | 'queued-retry' | 'restore' | 'exactly-once';
  title: string;
  instruction: string;
  done: boolean;
}

/**
 * A step is done only when simulator facts say so. Each later step also needs the earlier one,
 * so the lesson cannot be finished out of order. Reset clears the log, which clears the progress.
 */
export function lessonSteps(state: SimState): LessonStep[] {
  const facts = lessonFacts(state);
  const count = (type: string) => state.events.filter((e) => e.type === type).length;
  const dbWentDown = state.events.some((e) => e.type === 'COMPONENT_DOWN' && e.component === 'database');
  const persistedEvents = count('ORDER_PERSISTED');

  const healthy = facts.completedCount > 0;
  const dbDown = healthy && dbWentDown;
  const queuedRetry = dbDown && facts.persistFailureCount > 0;
  const restore = queuedRetry && !facts.databaseDown;
  const exactlyOnce =
    restore &&
    facts.recovered &&
    facts.completedCount >= 2 &&
    persistedEvents === facts.completedCount &&
    Object.keys(state.persisted).length === facts.completedCount;

  return [
    { id: 'healthy', title: 'Run a healthy order', instruction: 'Submit an order, then advance time until it completes.', done: healthy },
    { id: 'db-down', title: 'Take the Database down', instruction: 'Use "Take Database down".', done: dbDown },
    { id: 'queued-retry', title: 'Submit and watch it queue and retry', instruction: 'Submit another order and advance time. The save fails and the order waits in the queue.', done: queuedRetry },
    { id: 'restore', title: 'Restore the Database', instruction: 'Use "Restore Database".', done: restore },
    { id: 'exactly-once', title: 'Confirm exactly-once completion', instruction: 'Advance time until the queue is empty. Each order is saved once. Try "Resubmit last order" to see a duplicate ignored.', done: exactlyOnce },
  ];
}

export function currentStepIndex(steps: LessonStep[]): number {
  const i = steps.findIndex((s) => !s.done);
  return i === -1 ? steps.length : i;
}

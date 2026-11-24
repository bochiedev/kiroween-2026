import { currentStepIndex, lessonSteps } from './lesson';
import type { SimState } from '../simulation';

export function LessonPanel({ state }: { state: SimState }) {
  const steps = lessonSteps(state);
  const current = currentStepIndex(steps);
  return (
    <section aria-labelledby="lesson-h" className="panel">
      <h2 id="lesson-h">Lesson</h2>
      <p data-testid="lesson-progress">
        {current === steps.length ? 'Lesson complete.' : `Step ${current + 1} of ${steps.length}: ${steps[current].title}`}
      </p>
      <ol className="lesson-list">
        {steps.map((s, i) => (
          <li key={s.id} data-testid={`lesson-${s.id}`} aria-current={i === current ? 'step' : undefined}>
            <span aria-hidden="true">{s.done ? '✔' : i === current ? '➜' : '○'}</span>{' '}
            <strong>{s.title}</strong> <span>({s.done ? 'done' : i === current ? 'current' : 'to do'})</span>
            {i === current && <p className="hint">{s.instruction}</p>}
          </li>
        ))}
      </ol>
    </section>
  );
}

import type { Habit } from './model';
import { elapsedSeconds, formatDuration } from './timer';

export function HabitTimer({ habit, day, now, canStart, toggle }: {
  habit: Habit; day: string; now: number; canStart: boolean; toggle: () => void;
}) {
  const goal = (habit.durationMinutes ?? 0) * 60;
  const elapsed = Math.min(goal, elapsedSeconds(habit, day, now));
  const running = habit.timerDays?.[day]?.startedAt !== undefined;
  return <div className="habit-timer">
    <div className="timer-readout">
      <span>{formatDuration(goal - elapsed)} remaining</span>
      <span className="muted small">{formatDuration(elapsed)} / {formatDuration(goal)}</span>
      <progress aria-label={`Time goal for ${habit.name}`} max={goal} value={elapsed} />
    </div>
    <button className="secondary" onClick={toggle}
      disabled={!running && (!canStart || !!habit.logs[day] || elapsed >= goal)}
      aria-label={`${running ? 'Pause' : 'Start'} timer for ${habit.name}`}>
      {running ? 'Pause' : elapsed > 0 ? 'Resume' : 'Start'}
    </button>
  </div>;
}

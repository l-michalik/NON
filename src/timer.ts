import type { Habit } from './model.ts';
import { key, shift } from './model.ts';

export function elapsedSeconds(habit: Habit, day: string, now: number) {
  const session = habit.timerDays?.[day];
  if (!session) return 0;
  const until = Math.min(now, session.stopAt ?? now);
  return session.seconds + (session.startedAt === undefined ? 0 : Math.max(0, Math.floor((until - session.startedAt) / 1000)));
}

export function settleTimer(habit: Habit, now: number, pause = false): Habit {
  let result = habit;
  for (const [day, session] of Object.entries(habit.timerDays ?? {})) {
    if (session.startedAt === undefined) continue;
    const goal = (habit.durationMinutes ?? 0) * 60;
    const seconds = Math.min(goal, elapsedSeconds(habit, day, now));
    if (!pause && seconds < goal && now < (session.stopAt ?? Infinity)) continue;
    result = {
      ...result,
      timerDays: { ...result.timerDays, [day]: { seconds } },
      logs: seconds >= goal && goal > 0
        ? { ...result.logs, [day]: { status: 'done' } }
        : result.logs,
    };
  }
  return result;
}

export function toggleTimer(habit: Habit, now: number): Habit {
  const day = key(new Date(now));
  const wasRunning = habit.timerDays?.[day]?.startedAt !== undefined;
  const settled = settleTimer(habit, now, true);
  if (wasRunning || !habit.durationMinutes || settled.logs[day]) return settled;
  const seconds = elapsedSeconds(settled, day, now);
  if (seconds >= habit.durationMinutes * 60) return settled;
  const midnight = shift(new Date(now), 1);
  midnight.setHours(0, 0, 0, 0);
  return {
    ...settled,
    timerDays: { ...settled.timerDays, [day]: { seconds, startedAt: now, stopAt: midnight.getTime() } },
  };
}

export function formatDuration(seconds: number) {
  const whole = Math.max(0, Math.floor(seconds));
  return [Math.floor(whole / 3600), Math.floor(whole / 60) % 60, whole % 60]
    .map(value => String(value).padStart(2, '0')).join(':');
}

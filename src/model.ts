export type Status = "done" | "skipped" | "missed";
export type Habit = {
  id: string;
  name: string;
  icon: string;
  time: string;
  start: string;
  days: number[];
  target: number;
  logs: Record<string, { status: Status; note?: string }>;
};
export type Rule = {
  id: string;
  name: string;
  note: string;
  from: string;
  to: string;
};
export type Store = {
  version: 1;
  demo: boolean;
  habits: Habit[];
  rules: Rule[];
};
export const key = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export const parse = (value: string) => new Date(`${value}T12:00:00`);
export const shift = (date: Date, n: number) => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
};
export const week = (date: Date) =>
  Array.from({ length: 7 }, (_, i) =>
    shift(date, i - ((date.getDay() + 6) % 7)),
  );
export const scheduled = (h: Habit, date: Date) =>
  key(date) >= h.start && (h.target > 0 || h.days.includes(date.getDay()));
export function weekly(h: Habit, date: Date) {
  const active = week(date).filter((d) => key(d) >= h.start);
  const done = active.filter((d) => h.logs[key(d)]?.status === "done").length;
  const skipped = active.filter(
    (d) => h.logs[key(d)]?.status === "skipped",
  ).length;
  return {
    done,
    goal: Math.max(0, Math.min(h.target, active.length) - skipped),
  };
}
export function onDay(h: Habit, date: Date) {
  if (h.logs[key(date)]) return true;
  if (!scheduled(h, date)) return false;
  if (!h.target) return true;
  const p = weekly(h, date);
  return p.goal - p.done >= 7 - ((date.getDay() + 6) % 7);
}
export function streak(h: Habit, today: Date) {
  let count = 0;
  if (h.target) {
    let d = today;
    if (weekly(h, d).done < weekly(h, d).goal) d = shift(d, -7);
    for (; key(week(d)[6]) >= h.start; d = shift(d, -7)) {
      const p = weekly(h, d);
      if (p.done < p.goal) break;
      if (p.done) count++;
    }
  } else {
    for (let d = today; key(d) >= h.start; d = shift(d, -1)) {
      if (!scheduled(h, d)) continue;
      const status = h.logs[key(d)]?.status;
      if (status === "done") count++;
      else if (status !== "skipped" && key(d) !== key(today)) break;
    }
  }
  return count;
}
export function stats(h: Habit, start: Date, end: Date, today: Date) {
  let done = 0,
    missed = 0,
    total = 0;
  if (h.target) {
    for (
      let d = week(start)[0];
      key(d) <= key(end) && key(d) <= key(today);
      d = shift(d, 7)
    ) {
      const p = weekly(h, d);
      done += Math.min(p.done, p.goal);
      if (key(shift(d, 6)) < key(today)) missed += Math.max(0, p.goal - p.done);
    }
  }
  for (
    let d = start;
    key(d) <= key(end) && key(d) <= key(today);
    d = shift(d, 1)
  ) {
    const status = h.logs[key(d)]?.status;
    if (status === "done") total++;
    if (h.target || (!scheduled(h, d) && !status)) continue;
    if (status === "done") done++;
    else if (status === "missed" || (!status && key(d) < key(today))) missed++;
  }
  return {
    done,
    missed,
    total,
    rate: done + missed ? Math.round((done / (done + missed)) * 100) : null,
  };
}
export function initialStore(): Store {
  return { version: 1, demo: false, habits: [], rules: [] };
}

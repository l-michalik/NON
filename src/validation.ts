import type { Store } from './model.ts';
const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const text = (v: unknown) => typeof v === 'string' && v.length <= 10000;
const date = (v: unknown) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));
const time = (v: unknown) => typeof v === 'string' && (v === '' || /^([01]\d|2[0-3]):[0-5]\d$/.test(v));
const nonnegative = (v: unknown) => Number.isSafeInteger(v) && Number(v) >= 0;
const timers = (v: unknown) => v === undefined || (object(v) && Object.entries(v).every(([day, entry]) =>
  date(day) && object(entry) && nonnegative(entry.seconds) && Number(entry.seconds) <= 86400 &&
  ((entry.startedAt === undefined && entry.stopAt === undefined) ||
    (nonnegative(entry.startedAt) && nonnegative(entry.stopAt) && Number(entry.stopAt) > Number(entry.startedAt) && Number(entry.stopAt) - Number(entry.startedAt) <= 90000000))));
export function validStore(v: unknown): v is Store {
  if (!object(v) || v.version !== 1 || v.demo !== false || !Array.isArray(v.habits) || !Array.isArray(v.rules)) return false;
  return v.habits.length <= 500 && v.rules.length <= 500 &&
    new Set(v.habits.map(h => h?.id)).size === v.habits.length &&
    new Set(v.rules.map(r => r?.id)).size === v.rules.length &&
    v.habits.every(h => object(h) && text(h.id) && text(h.name) && text(h.icon) && time(h.time) && date(h.start) &&
      (h.durationMinutes === undefined || (Number.isInteger(h.durationMinutes) && Number(h.durationMinutes) >= 0 && Number(h.durationMinutes) <= 1440)) &&
      timers(h.timerDays) &&
      Array.isArray(h.days) && h.days.every(d => Number.isInteger(d) && d >= 0 && d <= 6) &&
      Number.isInteger(h.target) && Number(h.target) >= 0 && Number(h.target) <= 7 && object(h.logs) &&
      Object.entries(h.logs).every(([day, log]) => date(day) && object(log) && ['done', 'skipped', 'missed'].includes(String(log.status)) && (log.note === undefined || text(log.note)))) &&
    v.rules.every(r => object(r) && text(r.id) && text(r.name) && text(r.note) && time(r.from) && time(r.to));
}

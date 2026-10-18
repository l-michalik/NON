import test from "node:test";
import assert from "node:assert/strict";
import {
  parse,
  stats,
  streak,
  weekly,
  onDay,
  week,
  key,
} from "../src/model.ts";
const daily = () => ({
  id: "test",
  name: "Reading",
  icon: "reading",
  time: "09:00",
  start: "2026-10-12",
  days: [0, 1, 2, 3, 4, 5, 6],
  target: 0,
  logs: {},
});
test("daily stats exclude justified skips and pending today, but count missing past days", () => {
  const h = daily();
  h.logs = {
    "2026-10-12": { status: "done" },
    "2026-10-13": { status: "skipped" },
  };
  assert.deepEqual(
    stats(h, parse("2026-10-12"), parse("2026-10-15"), parse("2026-10-15")),
    { done: 1, missed: 1, total: 1, rate: 50 },
  );
});
test("justified skip preserves a daily streak", () => {
  const h = daily();
  h.logs = {
    "2026-10-12": { status: "done" },
    "2026-10-13": { status: "skipped" },
    "2026-10-14": { status: "done" },
  };
  assert.equal(streak(h, parse("2026-10-15")), 2);
});
test("weekly target is capped by active days and reduced by skips", () => {
  const h = {
    ...daily(),
    target: 4,
    start: "2026-10-16",
    logs: { "2026-10-16": { status: "skipped" } },
  };
  assert.deepEqual(weekly(h, parse("2026-10-18")), { done: 0, goal: 2 });
});
test("weekly goal becomes due when remaining days equal required completions", () => {
  const h = { ...daily(), target: 4 };
  assert.equal(onDay(h, parse("2026-10-12")), false);
  assert.equal(onDay(h, parse("2026-10-15")), true);
});
test("weekly misses only count after the week closes; extra check-ins do not inflate rate", () => {
  const h = {
    ...daily(),
    target: 2,
    logs: { "2026-10-12": { status: "done" } },
  };
  assert.equal(
    stats(h, parse("2026-10-12"), parse("2026-10-18"), parse("2026-10-18"))
      .rate,
    100,
  );
  assert.equal(
    stats(h, parse("2026-10-12"), parse("2026-10-18"), parse("2026-10-19"))
      .rate,
    50,
  );
  h.logs["2026-10-13"] = { status: "done" };
  h.logs["2026-10-14"] = { status: "done" };
  assert.deepEqual(
    stats(h, parse("2026-10-12"), parse("2026-10-18"), parse("2026-10-19")),
    { done: 2, missed: 0, total: 3, rate: 100 },
  );
});
test("calendar arithmetic preserves local dates across month boundaries", () => {
  assert.deepEqual(week(parse("2026-11-01")).map(key), [
    "2026-10-26",
    "2026-10-27",
    "2026-10-28",
    "2026-10-29",
    "2026-10-30",
    "2026-10-31",
    "2026-11-01",
  ]);
});

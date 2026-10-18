import test from 'node:test';
import assert from 'node:assert/strict';
import { elapsedSeconds, settleTimer, toggleTimer } from '../src/timer.ts';
import { key, initialStore } from '../src/model.ts';
import { validStore } from '../src/validation.ts';
const start = new Date(2026, 9, 18, 10).getTime();
const day = key(new Date(start));
const habit = () => ({ id: 'timer', name: 'Study', icon: 'reading', time: '', start: day, days: [0,1,2,3,4,5,6], target: 0, durationMinutes: 120, logs: {} });
test('timer sums sessions and stays paused between them', () => {
  let h = toggleTimer(habit(), start);
  h = toggleTimer(h, start + 1800000);
  assert.equal(elapsedSeconds(h, day, start + 3600000), 1800);
  h = toggleTimer(h, start + 3600000);
  assert.equal(elapsedSeconds(h, day, start + 5400000), 3600);
  assert.equal(h.logs[day], undefined);
});
test('persisted running timer survives reload, caps at goal and completes once', () => {
  const h = JSON.parse(JSON.stringify(toggleTimer(habit(), start)));
  assert.equal(validStore({ ...initialStore(), habits: [h] }), true);
  const done = settleTimer(h, start + 10800000);
  assert.equal(done.timerDays[day].seconds, 7200);
  assert.equal(done.logs[day].status, 'done');
  assert.equal(done.timerDays[day].startedAt, undefined);
  assert.equal(settleTimer(done, start + 14400000), done);
});
test('timer stops at local midnight and never credits the following day', () => {
  const late = new Date(2026, 9, 18, 23, 50).getTime();
  const h = settleTimer(toggleTimer(habit(), late), late + 7200000);
  assert.equal(h.timerDays[day].seconds, 600);
  assert.equal(h.logs[day], undefined);
  assert.equal(Object.keys(h.timerDays).length, 1);
  assert.equal(h.timerDays[day].startedAt, undefined);
});
test('no writes while running below goal; pause at goal still completes', () => {
  const h = toggleTimer(habit(), start);
  assert.equal(settleTimer(h, start + 1000), h);
  assert.equal(toggleTimer(h, start + 7200000).logs[day].status, 'done');
});
test('legacy habits and blank times remain valid; malformed timer data is rejected', () => {
  const legacy = habit();
  delete legacy.durationMinutes;
  const valid = h => validStore({ ...initialStore(), habits: [h] });
  assert.equal(valid(legacy), true);
  assert.equal(valid({ ...habit(), durationMinutes: -1 }), false);
  assert.equal(valid({ ...habit(), durationMinutes: 1441 }), false);
  assert.equal(valid({ ...habit(), timerDays: { [day]: { seconds: -1 } } }), false);
  assert.equal(valid({ ...habit(), timerDays: { [day]: { seconds: 0, startedAt: start } } }), false);
});

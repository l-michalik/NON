import { useState } from "react";
import { Glyph, Icon } from "./Icon";
import { key, scheduled, shift, stats, week } from "./model";
import type { Habit } from "./model";
export function Summary({
  habits,
  today,
  edit,
}: {
  habits: Habit[];
  today: Date;
  edit: (h: Habit) => void;
}) {
  const [period, setPeriod] = useState<"Week" | "Month" | "Year">("Week");
  const [offset, setOffset] = useState(0);
  const anchor = new Date(today.getFullYear(), today.getMonth(), 1, 12);
  if (period === "Week") anchor.setTime(shift(today, offset * 7).getTime());
  else if (period === "Month") anchor.setMonth(anchor.getMonth() + offset);
  else anchor.setFullYear(anchor.getFullYear() + offset);
  const start =
    period === "Week"
      ? week(anchor)[0]
      : new Date(
          anchor.getFullYear(),
          period === "Year" ? 0 : anchor.getMonth(),
          1,
          12,
        );
  const end =
    period === "Week"
      ? week(anchor)[6]
      : new Date(
          anchor.getFullYear(),
          period === "Year" ? 12 : anchor.getMonth() + 1,
          0,
          12,
        );
  const days: Date[] = [];
  for (let d = start; key(d) <= key(end); d = shift(d, 1)) days.push(d);
  const results = habits.map((h) => ({
    habit: h,
    ...stats(h, start, end, today),
  }));
  const done = results.reduce((n, s) => n + s.done, 0),
    missed = results.reduce((n, s) => n + s.missed, 0);
  const perfect = days.filter((d) => {
    const hs = habits.filter((h) => !h.target && scheduled(h, d));
    return (
      key(d) <= key(today) &&
      hs.length &&
      hs.every((h) => h.logs[key(d)]?.status === "done")
    );
  }).length;
  return (
    <>
      <div className="summary-toolbar">
        <div className="segmented">
          {(["Week", "Month", "Year"] as const).map((p) => (
            <button
              key={p}
              aria-pressed={p === period}
              onClick={() => {
                setPeriod(p);
                setOffset(0);
              }}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="date-actions">
          <button
            className="icon-button"
            aria-label="Previous period"
            onClick={() => setOffset(offset - 1)}
          >
            <Icon name="left" />
          </button>
          <strong>
            {period === "Week"
              ? `${start.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – ${end.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
              : anchor.toLocaleDateString(
                  "en-GB",
                  period === "Year"
                    ? { year: "numeric" }
                    : { month: "long", year: "numeric" },
                )}
          </strong>
          <button
            className="icon-button"
            disabled={offset === 0}
            aria-label="Next period"
            onClick={() => setOffset(offset + 1)}
          >
            <Icon name="right" />
          </button>
        </div>
      </div>
      <div className="stat-grid">
        <div className="stat-card featured">
          <span>Completion rate</span>
          <strong>
            {done + missed
              ? `${Math.round((done / (done + missed)) * 100)}%`
              : "—"}
          </strong>
        </div>
        <div className="stat-card">
          <span>Perfect days</span>
          <strong>
            {perfect}
            <Icon name="sun" size={26} />
          </strong>
        </div>
        <div className="stat-card">
          <span>Total check-ins</span>
          <strong>
            {results.reduce((n, s) => n + s.total, 0)}
            <Icon name="check" size={26} />
          </strong>
        </div>
        <div className="stat-card">
          <span>Active habits</span>
          <strong>
            {habits.length}
            <Icon name="leaf" size={26} />
          </strong>
        </div>
      </div>
      <section className="summary-card">
        <div className="section-heading">
          <h2>
            {period === "Week"
              ? "Your week, one habit at a time"
              : "A little progress adds up"}
          </h2>
          <span className="muted small">
            {period === "Week" ? "Weekly check-ins" : "Daily habits"}
          </span>
        </div>
        {period === "Week" ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Habit</th>
                  {days.map((d) => (
                    <th key={key(d)}>
                      {d.toLocaleDateString("en-GB", { weekday: "short" })}
                      <small>{d.getDate()}</small>
                    </th>
                  ))}
                  <th>Met</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.habit.id}>
                    <th>
                      <button
                        className="table-habit"
                        onClick={() => edit(r.habit)}
                      >
                        <Glyph name={r.habit.icon} />
                        {r.habit.name}
                      </button>
                    </th>
                    {days.map((d) => {
                      const status = r.habit.logs[key(d)]?.status;
                      return (
                        <td key={key(d)}>
                          <span
                            className={`history-cell ${status || ""}`}
                            aria-label={`${r.habit.name}, ${key(d)}: ${status || "No entry"}`}
                          >
                            {status === "done" ? (
                              <Icon name="check" size={15} />
                            ) : status === "skipped" ? (
                              "–"
                            ) : status === "missed" ? (
                              "×"
                            ) : (
                              "·"
                            )}
                          </span>
                        </td>
                      );
                    })}
                    <td>
                      <strong>{r.rate === null ? "—" : `${r.rate}%`}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="heatmap">
            {days.map((d) => {
              const hs = habits.filter((h) => !h.target && scheduled(h, d));
              const n = hs.filter(
                (h) => h.logs[key(d)]?.status === "done",
              ).length;
              return (
                <div
                  key={key(d)}
                  title={`${key(d)}: ${n} / ${hs.length} completed`}
                  className={n ? "filled" : ""}
                  style={{
                    opacity: n && hs.length ? 0.35 + (0.65 * n) / hs.length : 1,
                  }}
                >
                  {period === "Month" ? d.getDate() : ""}
                </div>
              );
            })}
          </div>
        )}
        {!habits.length && (
          <p className="empty">
            Your progress will appear here when you add a habit.
          </p>
        )}
        <div className="history-legend">
          <span>
            <i className="filled" />
            Done
          </span>
          <span>– Justified skip</span>
          <span>× Not done</span>
          <span>· No entry</span>
        </div>
      </section>
      <section className="summary-card">
        <h2>By habit</h2>
        {results.map((r) => (
          <button
            className="by-habit"
            key={r.habit.id}
            onClick={() => edit(r.habit)}
          >
            <span className="habit-icon">
              <Glyph name={r.habit.icon} />
            </span>
            <span>
              <strong>{r.habit.name}</strong>
              <small>
                {r.total} check-ins
                {r.habit.target ? ` · ${r.habit.target}× a week` : ""}
              </small>
            </span>
            <span className="rate-track">
              <i style={{ width: `${r.rate || 0}%` }} />
            </span>
            <b>{r.rate === null ? "—" : `${r.rate}%`}</b>
          </button>
        ))}
      </section>
      <details className="counting">
        <summary>How it’s counted</summary>
        <p>
          Completion rate counts completed and missed scheduled days. An
          unlogged past day counts as missed; an unlogged today does not.
          Justified skips are excluded. Weekly habits use their weekly goal,
          reduced by justified skips; an unfinished week counts only completions
          so far. Perfect days include daily habits only. Month and year
          statistics include whole overlapping weeks for weekly habits.
        </p>
      </details>
    </>
  );
}

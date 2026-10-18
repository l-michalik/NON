import { useEffect, useState } from "react";
import { Glyph, Icon } from "./Icon";
import { HabitEditor, Modal, RuleEditor } from "./Editors";
import {
  key,
  onDay,
  parse,
  scheduled,
  shift,
  stats,
  streak,
  week,
  weekly,
} from "./model";
import type { Habit, Rule, Status } from "./model";
import { useWorkspace } from "./useWorkspace";
import { Summary } from "./Summary";
const pages = ["Home", "Habits", "Summary", "Rules"] as const;
function App() {
  const [today, setToday] = useState(() => new Date());
  const { store, setStore, status, error, ready, needsLogin, login, retry } = useWorkspace();
  const [password, setPassword] = useState("");
  const [page, setPage] = useState<(typeof pages)[number]>("Home");
  const [date, setDate] = useState(key(today));
  const [editor, setEditor] = useState<Habit | "new" | null>(null);
  const [ruleEditor, setRuleEditor] = useState<Rule | "new" | null>(null);
  const [settings, setSettings] = useState(false);
  const [logEditor, setLogEditor] = useState<Habit | null>(null);
  const [note, setNote] = useState("");
  const [notice, setNotice] = useState("");
  useEffect(() => {
    const id = setInterval(() => setToday(new Date()), 60000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (notice) {
      const id = setTimeout(() => setNotice(""), 3000);
      return () => clearTimeout(id);
    }
  }, [notice]);
  const selected = parse(date),
    days = week(selected),
    isToday = date === key(today);
  const dayHabits = store.habits.filter((h) => onDay(h, selected));
  const done = dayHabits.filter((h) => h.logs[date]?.status === "done");
  const pending = dayHabits.filter((h) => !h.logs[date]);
  const other = dayHabits.filter(
    (h) => h.logs[date] && h.logs[date].status !== "done",
  );
  const total = dayHabits.filter(
    (h) => h.logs[date]?.status !== "skipped",
  ).length;
  const weeklyHabits = store.habits.filter(
    (h) =>
      h.target &&
      scheduled(h, selected) &&
      !dayHabits.includes(h) &&
      weekly(h, selected).done < weekly(h, selected).goal,
  );
  const longest = Math.max(
    0,
    ...store.habits.filter((h) => !h.target).map((h) => streak(h, today)),
  );
  function setStatus(h: Habit, status?: Status) {
    if (date > key(today)) return;
    setStore((s) => ({
      ...s,
      habits: s.habits.map((item) => {
        if (item.id !== h.id) return item;
        const logs = { ...item.logs };
        if (status)
          logs[date] = {
            status,
            note: status === "skipped" ? note.trim() : undefined,
          };
        else delete logs[date];
        return {
          ...item,
          start: status && date < item.start ? date : item.start,
          logs,
        };
      }),
    }));
    setLogEditor(null);
    setNotice(
      status === "done" ? `${h.name} completed. Keep going!` : "Entry updated",
    );
  }
  function rows(list: Habit[]) {
    return list.map((h) => (
      <div
        className={`habit-row ${h.logs[date]?.status === "done" ? "completed" : ""}`}
        key={h.id}
      >
        <button className="habit-info" onClick={() => setEditor(h)}>
          <span className="habit-icon">
            <Glyph name={h.icon} />
          </span>
          <span>
            <strong>{h.name}</strong>
            <span className="habit-meta">
              {h.target
                ? `${weekly(h, selected).done} of ${weekly(h, selected).goal} this week`
                : h.days.length === 7
                  ? "Every day"
                  : "Selected days"}
              <span>·</span>
              {h.time}
            </span>
          </span>
        </button>
        <span className="streak">
          <Icon name="flame" size={15} /> {streak(h, today)}
          <span className="streak-unit"> {h.target ? "weeks" : "days"}</span>
        </span>
        <button
          className="more"
          aria-label={`More options for ${h.name}`}
          onClick={() => {
            setNote(h.logs[date]?.note || "");
            setLogEditor(h);
          }}
        >
          ···
        </button>
        <button
          className={`check-button ${h.logs[date]?.status || ""}`}
          disabled={date > key(today)}
          aria-label={`${h.logs[date]?.status === "done" ? "Undo" : "Complete"} ${h.name}`}
          aria-pressed={h.logs[date]?.status === "done"}
          onClick={() =>
            setStatus(h, h.logs[date]?.status === "done" ? undefined : "done")
          }
        >
          {h.logs[date]?.status === "done" ? (
            <Icon name="check" size={17} />
          ) : h.logs[date]?.status === "skipped" ? (
            "–"
          ) : h.logs[date]?.status === "missed" ? (
            "×"
          ) : null}
        </button>
      </div>
    ));
  }
  function section(title: string, list: Habit[]) {
    return list.length ? (
      <section className="habit-section">
        <div className="section-heading">
          <h2>
            {title} <span className="count">{list.length}</span>
          </h2>
          {title === "To do" && (
            <span className="muted small">One small step at a time</span>
          )}
        </div>
        <div className="habit-list">{rows(list)}</div>
      </section>
    ) : null;
  }
  function exportData() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(store, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `non-${key(today)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  if (!ready) return (
    <main className="workspace-gate">
      <h1>Your workspace.</h1>
      <p role="status">{needsLogin ? "Enter your password to open NON." : status}</p>
      {error && <p role="alert">{error}</p>}
      {needsLogin ? <form onSubmit={(event) => { event.preventDefault(); void login(password); }}>
        <label htmlFor="workspace-password">Password</label>
        <input id="workspace-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
        <button className="primary" type="submit">Open workspace</button>
      </form> : error && <button className="secondary" onClick={retry}>Try again</button>}
    </main>
  );
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#home" onClick={() => setPage("Home")}>
          <img src="/brand.png" alt="" />
          <span>
            NON<span className="brand-caption">MAKE TIME FOR YOU</span>
          </span>
        </a>
        <div className="workspace-label">YOUR SPACE</div>
        <nav aria-label="Main navigation">
          {pages.map((p) => (
            <button
              key={p}
              aria-current={page === p ? "page" : undefined}
              className={page === p ? "active" : ""}
              onClick={() => setPage(p)}
            >
              <Icon name={p.toLowerCase()} />
              <span>{p}</span>
              {p === "Habits" && (
                <span className="nav-count">{store.habits.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-quote">
            <Icon name="leaf" size={23} />
            <p>
              A little better.
              <br />
              Every single day.
            </p>
            <span>Progress is a practice.</span>
          </div>
          <button className="settings-button" onClick={() => setSettings(true)}>
            <Icon name="settings" size={18} /> Settings & data
          </button>
          <div className="local-status">
            <span /> {status}
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <span>
            My workspace <span className="breadcrumb">/</span>{" "}
            <strong>{page}</strong>
          </span>
          <button
            className="mobile-settings icon-button"
            aria-label="Settings and data"
            onClick={() => setSettings(true)}
          >
            <Icon name="settings" size={17} />
          </button>
          <span className="topbar-date">
            <Icon name="calendar" size={16} />
            {today.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </header>
        <main>
          {error && <div role="alert" className="error-banner">{error} <button className="text-button" onClick={retry}>Try again</button></div>}
          <p className="small muted" role="status">{status}</p>
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                {page === "Home"
                  ? "A LITTLE PROGRESS, EVERY DAY"
                  : "MAKE TIME FOR WHAT MATTERS"}
              </div>
              <h1>
                {page === "Home"
                  ? today.getHours() < 12
                    ? "Good morning."
                    : today.getHours() < 18
                      ? "Good afternoon."
                      : "Good evening."
                  : page === "Habits"
                    ? "Your habits."
                    : page === "Summary"
                      ? "The bigger picture."
                      : "Live by your own rules."}
              </h1>
              <p>
                {page === "Home"
                  ? "Small actions today. A better you tomorrow."
                  : page === "Habits"
                    ? "Build a routine that feels like you."
                    : page === "Summary"
                      ? "See the small steps adding up."
                      : "A few intentions to keep you grounded."}
              </p>
            </div>
            <button
              className="primary add-button"
              onClick={() =>
                page === "Rules" ? setRuleEditor("new") : setEditor("new")
              }
            >
              <Icon name="plus" size={18} />
              {page === "Rules" ? "New rule" : "New habit"}
            </button>
          </div>
          {(page === "Home" || page === "Habits") && (
            <>
              <div className="date-heading">
                <div>
                  <h2>
                    {isToday
                      ? "Today"
                      : selected.toLocaleDateString("en-GB", {
                          weekday: "long",
                        })}
                    <span>
                      {selected.toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                      })}
                    </span>
                  </h2>
                </div>
                <div className="date-actions">
                  {!isToday && (
                    <button
                      className="text-button"
                      onClick={() => setDate(key(today))}
                    >
                      Back to today
                    </button>
                  )}
                  <button
                    className="icon-button"
                    aria-label="Previous week"
                    onClick={() => setDate(key(shift(selected, -7)))}
                  >
                    <Icon name="left" size={17} />
                  </button>
                  <button
                    className="icon-button"
                    aria-label="Next week"
                    disabled={key(days[6]) >= key(today)}
                    onClick={() => setDate(key(shift(selected, 7)))}
                  >
                    <Icon name="right" size={17} />
                  </button>
                </div>
              </div>
              <div className="week-strip">
                {days.map((d) => {
                  const hs = store.habits.filter(
                    (h) => onDay(h, d) && h.logs[key(d)]?.status !== "skipped",
                  );
                  const n = hs.filter(
                    (h) => h.logs[key(d)]?.status === "done",
                  ).length;
                  return (
                    <button
                      key={key(d)}
                      className={date === key(d) ? "selected" : ""}
                      aria-pressed={date === key(d)}
                      onClick={() => setDate(key(d))}
                    >
                      <span>
                        {d.toLocaleDateString("en-GB", { weekday: "short" })}
                      </span>
                      <span
                        className="day-ring"
                        style={{
                          background: `conic-gradient(currentColor ${hs.length ? (n / hs.length) * 360 : 0}deg, var(--ring-track) 0deg)`,
                        }}
                      >
                        <b>{d.getDate()}</b>
                      </span>
                      <span className="today-dot">
                        {key(d) === key(today)
                          ? "TODAY"
                          : n && n === hs.length
                            ? "✓"
                            : "·"}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="dashboard">
                <div className="primary-column">
                  {page === "Home" && (
                    <div className="progress-card">
                      <div>
                        <span className="card-eyebrow">
                          YOUR DAILY MOMENTUM
                        </span>
                        <h2>
                          {total && done.length === total
                            ? "You showed up."
                            : done.length
                              ? "You’re making it happen."
                              : "Make today count."}
                        </h2>
                        <p>
                          {total
                            ? `${done.length} of ${total} habits completed. ${done.length === total ? "Enjoy the feeling." : "Keep a little time for yourself."}`
                            : "Your next chapter starts with one habit."}
                        </p>
                        <div className="progress-note">
                          <Icon name="flame" size={17} />
                          <strong>{longest}-day streak</strong>
                          <span>Keep the momentum going</span>
                        </div>
                      </div>
                      <div
                        className="big-ring"
                        style={{
                          background: `conic-gradient(#fff ${total ? (done.length / total) * 360 : 0}deg, #ffffff25 0deg)`,
                        }}
                      >
                        <div>
                          <strong>
                            {total
                              ? Math.round((done.length / total) * 100)
                              : 0}
                            <small>%</small>
                          </strong>
                          <span>complete</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {page === "Habits" ? (
                    <>
                      {section("All habits", store.habits)}
                      {!store.habits.length && (
                        <div className="empty">
                          <Icon name="leaf" size={32} />
                          <h2>Make space for a new habit.</h2>
                          <p>Start small. Make it yours.</p>
                          <button
                            className="primary"
                            onClick={() => setEditor("new")}
                          >
                            Create your first habit
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {section("To do", pending)}
                      {section("This week", weeklyHabits)}
                      {section("Completed", done)}
                      {section("Other entries", other)}
                      {!dayHabits.length && !weeklyHabits.length && (
                        <div className="empty">
                          <Icon name="sun" size={30} />
                          <h2>A little breathing room.</h2>
                          <p>No habits scheduled for this day.</p>
                          <button
                            className="text-button"
                            onClick={() => setEditor("new")}
                          >
                            Add a habit <Icon name="plus" size={16} />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <aside className="insights">
                  <div className="insight-card">
                    <div className="section-heading">
                      <h2>This week</h2>
                      <Icon name="summary" size={18} />
                    </div>
                    <WeeklyOverview
                      habits={store.habits}
                      today={today}
                      selected={selected}
                    />
                    <button
                      className="card-link"
                      onClick={() => setPage("Summary")}
                    >
                      See your summary <Icon name="arrow" size={16} />
                    </button>
                  </div>
                  <div className="insight-card rules-preview">
                    <div className="section-heading">
                      <h2>Your intentions</h2>
                      <Icon name="rules" size={18} />
                    </div>
                    {store.rules.slice(0, 2).map((r, i) => (
                      <button
                        key={r.id}
                        className="mini-rule"
                        onClick={() => setRuleEditor(r)}
                      >
                        <span className="mini-rule-icon">
                          <Icon name={i === 0 ? "moon" : "leaf"} size={19} />
                        </span>
                        <span>
                          <strong>{r.name}</strong>
                          <small>
                            {r.from ? `${r.from} – ${r.to}` : r.note}
                          </small>
                        </span>
                      </button>
                    ))}
                    {!store.rules.length && (
                      <p className="muted">Your day, your rules.</p>
                    )}
                    <button
                      className="card-link"
                      onClick={() => setPage("Rules")}
                    >
                      View all rules <Icon name="arrow" size={16} />
                    </button>
                  </div>
                  <div className="quiet-note">
                    <span>“</span>
                    <p>
                      You don’t have to be perfect.
                      <br />
                      You just have to keep showing up.
                    </p>
                    <div>A REMINDER, NOT A RULE</div>
                  </div>
                </aside>
              </div>
            </>
          )}
          {page === "Summary" && (
            <Summary habits={store.habits} today={today} edit={setEditor} />
          )}
          {page === "Rules" && (
            <div className="rules-grid">
              {store.rules.map((r, i) => (
                <button
                  className="rule-card"
                  key={r.id}
                  onClick={() => setRuleEditor(r)}
                >
                  <span className="rule-top">
                    <span className="habit-icon">
                      <Icon name={i === 0 ? "moon" : "leaf"} size={25} />
                    </span>
                    <Icon name="right" size={18} />
                  </span>
                  <h2>{r.name}</h2>
                  <p>{r.note}</p>
                  {r.from && (
                    <>
                      <div className="rule-time">
                        <Icon name="clock" size={17} />
                        {r.from} – {r.to}
                      </div>
                      <div className="time-track">
                        {Array.from({ length: 24 }, (_, h) => {
                          const min = h * 60,
                            from =
                              Number(r.from.slice(0, 2)) * 60 +
                              Number(r.from.slice(3)),
                            to =
                              Number(r.to.slice(0, 2)) * 60 +
                              Number(r.to.slice(3));
                          return (
                            <i
                              key={h}
                              className={
                                (
                                  from < to
                                    ? min >= from && min < to
                                    : min >= from || min < to
                                )
                                  ? "filled"
                                  : ""
                              }
                            />
                          );
                        })}
                      </div>
                      <div className="time-labels">
                        <span>00:00</span>
                        <span>12:00</span>
                        <span>24:00</span>
                      </div>
                    </>
                  )}
                </button>
              ))}
              <button
                className="rule-card add-rule"
                onClick={() => setRuleEditor("new")}
              >
                <Icon name="plus" size={28} />
                <h2>A new intention</h2>
                <p>Something you want to live by.</p>
              </button>
            </div>
          )}
          <footer>
            MAKE TIME. MAKE PROGRESS.<span>Built around you.</span>
          </footer>
        </main>
      </div>
      {notice && (
        <div className="toast" role="status">
          <Icon name="check" size={18} />
          {notice}
        </div>
      )}
      {editor && (
        <HabitEditor
          habit={editor === "new" ? undefined : editor}
          close={() => setEditor(null)}
          save={(h) => {
            setStore((s) => ({
              ...s,
              habits: s.habits.some((v) => v.id === h.id)
                ? s.habits.map((v) => (v.id === h.id ? h : v))
                : [...s.habits, h],
            }));
            setEditor(null);
          }}
          remove={(id) => {
            setStore((s) => ({
              ...s,
              habits: s.habits.filter((h) => h.id !== id),
            }));
            setEditor(null);
          }}
        />
      )}
      {ruleEditor && (
        <RuleEditor
          rule={ruleEditor === "new" ? undefined : ruleEditor}
          close={() => setRuleEditor(null)}
          save={(r) => {
            setStore((s) => ({
              ...s,
              rules: s.rules.some((v) => v.id === r.id)
                ? s.rules.map((v) => (v.id === r.id ? r : v))
                : [...s.rules, r],
            }));
            setRuleEditor(null);
          }}
          remove={(id) => {
            setStore((s) => ({
              ...s,
              rules: s.rules.filter((r) => r.id !== id),
            }));
            setRuleEditor(null);
          }}
        />
      )}
      {logEditor && (
        <Modal title={logEditor.name} close={() => setLogEditor(null)}>
          <p className="muted">
            {selected.toLocaleDateString("en-GB", { dateStyle: "full" })}
          </p>
          <label>
            Reason for a justified skip
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Rest is part of progress, too."
            />
          </label>
          <div className="entry-actions">
            <button
              className="primary"
              disabled={date > key(today)}
              onClick={() => setStatus(logEditor, "done")}
            >
              Done
            </button>
            <button
              className="secondary"
              disabled={date > key(today)}
              onClick={() => setStatus(logEditor, "skipped")}
            >
              Justified skip
            </button>
            <button
              className="secondary"
              disabled={date > key(today)}
              onClick={() => setStatus(logEditor, "missed")}
            >
              Not done
            </button>
            <button
              className="text-button"
              disabled={date > key(today)}
              onClick={() => setStatus(logEditor)}
            >
              Clear entry
            </button>
          </div>
        </Modal>
      )}
      {settings && (
        <Modal title="Your workspace" close={() => setSettings(false)}>
          <p className="muted">
            Your changes are saved online in your private workspace. Open this
            site on another device and enter your password to access your data.
            Export a backup to keep a copy.
          </p>
          <button className="secondary full" onClick={exportData}>
            Export data as JSON
          </button>
        </Modal>
      )}
    </div>
  );
}
function WeeklyOverview({
  habits,
  today,
  selected,
}: {
  habits: Habit[];
  today: Date;
  selected: Date;
}) {
  const days = week(selected);
  const results = habits.map((h) => stats(h, days[0], days[6], today));
  const done = results.reduce((a, s) => a + s.done, 0),
    missed = results.reduce((a, s) => a + s.missed, 0);
  return (
    <>
      <div className="weekly-number">
        {done + missed ? Math.round((done / (done + missed)) * 100) : 0}
        <span>%</span>
        <small>completion rate</small>
      </div>
      <div className="bar-chart">
        {days.map((d) => {
          const hs = habits.filter((h) => !h.target && scheduled(h, d));
          const n = hs.filter((h) => h.logs[key(d)]?.status === "done").length;
          return (
            <div
              key={key(d)}
              title={`${key(d)}: ${n} of ${hs.length} daily habits completed`}
            >
              <div className="bar-track">
                <i
                  style={{
                    height: `${hs.length ? (n / hs.length) * 100 : 0}%`,
                  }}
                  className={key(d) === key(today) ? "current" : ""}
                />
              </div>
              <span className={key(d) === key(today) ? "current-label" : ""}>
                {d.toLocaleDateString("en-GB", { weekday: "narrow" })}
              </span>
            </div>
          );
        })}
      </div>
      <div className="chart-caption">
        <span className="legend-dot" />
        Daily habits completed
      </div>
    </>
  );
}
export default App;

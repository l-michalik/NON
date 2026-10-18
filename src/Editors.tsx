import { useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Icon } from "./Icon";
import { HabitIconPicker } from "./HabitIconPicker";
import { key } from "./model";
import type { Habit, Rule } from "./model";
export function Modal({
  title,
  children,
  close,
}: {
  title: string;
  children: ReactNode;
  close: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const el = ref.current;
    el?.showModal();
    return () => el?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={close}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="modal-head">
        <h2 id={titleId}>{title}</h2>
        <button
          className="icon-button"
          aria-label="Close dialog"
          onClick={close}
        >
          <Icon name="close" />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function HabitEditor({
  habit,
  save,
  remove,
  close,
}: {
  habit?: Habit;
  save: (h: Habit) => void;
  remove: (id: string) => void;
  close: () => void;
}) {
  const [value, setValue] = useState<Habit>(
    () =>
      habit || {
        id: crypto.randomUUID(),
        name: "",
        icon: "reading",
        start: key(new Date()),
        time: "",
        target: 0,
        days: [0, 1, 2, 3, 4, 5, 6],
        logs: {},
      },
  );
  const [confirm, setConfirm] = useState(false);
  return (
    <Modal
      title={habit ? "Edit habit" : "A small step. A new habit."}
      close={close}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (value.name.trim()) save({ ...value, name: value.name.trim(), time: value.target ? "" : value.time });
        }}
      >
        <label>
          Habit name
          <input
            autoFocus
            required
            maxLength={70}
            value={value.name}
            placeholder="What would you like to make time for?"
            onChange={(e) => setValue({ ...value, name: e.target.value })}
          />
        </label>
        <HabitIconPicker
          value={value.icon}
          onChange={(icon) => setValue({ ...value, icon })}
        />
        <div className="form-grid">
          <label>
            Start date
            <input
              required
              type="date"
              value={value.start}
              onChange={(e) => setValue({ ...value, start: e.target.value })}
            />
          </label>
          {!value.target && <label>
            Time (optional)
            <input
              type="time"
              value={value.time}
              onChange={(e) => setValue({ ...value, time: e.target.value })}
            />
          </label>}
        </div>
        <label>
          Frequency
          <select
            value={value.target ? "weekly" : "days"}
            onChange={(e) =>
              setValue({
                ...value,
                target: e.target.value === "weekly" ? 4 : 0,
                time: e.target.value === "weekly" ? "" : value.time,
              })
            }
          >
            <option value="days">Specific days</option>
            <option value="weekly">Times a week</option>
          </select>
        </label>
        {value.target ? (
          <label>
            Weekly goal
            <input
              type="number"
              min="1"
              max="7"
              required
              value={value.target}
              onChange={(e) =>
                setValue({ ...value, target: Number(e.target.value) || 1 })
              }
            />
          </label>
        ) : (
          <div className="day-picker">
            {["M", "T", "W", "T", "F", "S", "S"].map((label, i) => {
              const day = (i + 1) % 7;
              return (
                <button
                  type="button"
                  key={i}
                  aria-label={
                    [
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                      "Sunday",
                    ][i]
                  }
                  aria-pressed={value.days.includes(day)}
                  onClick={() =>
                    setValue({
                      ...value,
                      days: value.days.includes(day)
                        ? value.days.filter((d) => d !== day)
                        : [...value.days, day],
                    })
                  }
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}
        <p className="muted small">
          {value.target
            ? "Choose any days, at any time. Each completed day counts once toward your weekly goal."
            : "The time helps organise your day. Browser reminders are not enabled."}
        </p>
        <label>
          Tracking
          <select value={value.durationMinutes ? "timer" : "check"}
            onChange={(e) => setValue({ ...value, durationMinutes: e.target.value === "timer" ? 120 : 0 })}>
            <option value="check">Check off</option>
            <option value="timer">Timer</option>
          </select>
        </label>
        {!!value.durationMinutes && <>
          <label>
            Time goal per day (minutes)
            <input type="number" min="1" max="1440" step="1" required
              value={value.durationMinutes}
              onChange={(e) => setValue({ ...value, durationMinutes: Number(e.target.value) || 1 })} />
          </label>
          <p className="muted small">120 minutes = 2 hours. Pause and resume throughout the day. Reaching the goal completes the habit. The timer continues after closing the page and stops at midnight.</p>
        </>}
        {confirm && (
          <p role="alert" className="small">
            Delete “{habit?.name}” and its entire history? This cannot be undone.
          </p>
        )}
        <div className="modal-actions">
          {habit && (
            <button
              type="button"
              className="text-button danger"
              onClick={() => (confirm ? remove(habit.id) : setConfirm(true))}
            >
              {confirm ? "Confirm deletion" : "Delete habit"}
            </button>
          )}
          <button type="button" className="secondary" onClick={() => confirm ? setConfirm(false) : close()}>
            Cancel
          </button>
          <button
            className="primary"
            disabled={
              confirm || !value.name.trim() || (!value.target && !value.days.length)
            }
          >
            Save habit
          </button>
        </div>
      </form>
    </Modal>
  );
}
export function RuleEditor({
  rule,
  save,
  remove,
  close,
}: {
  rule?: Rule;
  save: (r: Rule) => void;
  remove: (id: string) => void;
  close: () => void;
}) {
  const [value, setValue] = useState<Rule>(
    rule || { id: crypto.randomUUID(), name: "", note: "", from: "", to: "" },
  );
  const [confirm, setConfirm] = useState(false);
  return (
    <Modal
      title={rule ? "Edit rule" : "Make room for what matters"}
      close={close}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save({ ...value, name: value.name.trim() });
        }}
      >
        <label>
          Rule name
          <input
            autoFocus
            required
            maxLength={80}
            value={value.name}
            onChange={(e) => setValue({ ...value, name: e.target.value })}
          />
        </label>
        <label>
          A note to yourself
          <textarea
            value={value.note}
            maxLength={300}
            onChange={(e) => setValue({ ...value, note: e.target.value })}
          />
        </label>
        <div className="form-grid">
          <label>
            From (optional)
            <input
              type="time"
              required={!!value.to}
              value={value.from}
              onChange={(e) => setValue({ ...value, from: e.target.value })}
            />
          </label>
          <label>
            To (optional)
            <input
              type="time"
              required={!!value.from}
              value={value.to}
              onChange={(e) => setValue({ ...value, to: e.target.value })}
            />
          </label>
        </div>
        <div className="modal-actions">
          {rule && (
            <button
              className="text-button danger"
              type="button"
              onClick={() => (confirm ? remove(rule.id) : setConfirm(true))}
            >
              {confirm ? "Confirm deletion" : "Delete rule"}
            </button>
          )}
          <button type="button" className="secondary" onClick={close}>
            Cancel
          </button>
          <button className="primary" disabled={!value.name.trim()}>
            Save rule
          </button>
        </div>
      </form>
    </Modal>
  );
}

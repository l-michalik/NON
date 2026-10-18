import { useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Glyph, Icon } from "./Icon";
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
        time: "09:00",
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
          if (value.name.trim()) save({ ...value, name: value.name.trim() });
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
        <fieldset>
          <legend>Icon</legend>
          <div className="icon-picker">
            {[
              "gym",
              "reading",
              "skincare",
              "prayer",
              "creatine",
              "vitamins",
            ].map((icon) => (
              <button
                type="button"
                key={icon}
                aria-label={icon}
                aria-pressed={value.icon === icon}
                onClick={() => setValue({ ...value, icon })}
              >
                <Glyph name={icon} />
              </button>
            ))}
          </div>
        </fieldset>
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
          <label>
            Time
            <input
              required
              type="time"
              value={value.time}
              onChange={(e) => setValue({ ...value, time: e.target.value })}
            />
          </label>
        </div>
        <label>
          Frequency
          <select
            value={value.target ? "weekly" : "days"}
            onChange={(e) =>
              setValue({
                ...value,
                target: e.target.value === "weekly" ? 4 : 0,
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
              max="6"
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
          The time helps organise your day. Browser reminders are not enabled.
        </p>
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
          <button type="button" className="secondary" onClick={close}>
            Cancel
          </button>
          <button
            className="primary"
            disabled={
              !value.name.trim() || (!value.target && !value.days.length)
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

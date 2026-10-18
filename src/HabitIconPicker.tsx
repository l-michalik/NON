import { useState } from "react";
import { Glyph, Icon } from "./Icon";
import { findIcons, iconCategories, iconsById } from "./iconCatalog";
const pageSize = 72;
export function HabitIconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All icons");
  const [limit, setLimit] = useState(pageSize);
  const results = findIcons(query, category);
  const selected = iconsById.get(value);
  return (
    <fieldset className="habit-icon-field">
      <legend>Icon</legend>
      <div className="icon-library-heading">
        <span className="selected-icon">
          <Glyph name={value} />
          <span>{selected?.label || "Selected icon"}</span>
        </span>
      </div>
      <div className="icon-library">
        <label>
          Search icons
          <span className="icon-search">
            <input
              type="search"
              value={query}
              placeholder="Try guitar, cycling, książka…"
              onChange={(e) => {
                setQuery(e.target.value);
                setLimit(pageSize);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.preventDefault();
              }}
            />
            {query && (
              <button
                type="button"
                className="icon-button"
                aria-label="Clear icon search"
                onClick={() => {
                  setQuery("");
                  setLimit(pageSize);
                }}
              >
                <Icon name="close" size={15} />
              </button>
            )}
          </span>
        </label>
        <label>
          Category
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setLimit(pageSize);
            }}
          >
            {iconCategories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <p className="icon-result-count" role="status">
          {results.length.toLocaleString("en-GB")} icons
          {results.length > limit ? ` · showing ${limit}` : ""}
        </p>
        <div className="icon-results">
          {results.slice(0, limit).map((icon) => (
            <button
              key={icon.id}
              type="button"
              title={icon.label}
              aria-label={icon.label}
              aria-pressed={value === icon.id}
              onClick={() => onChange(icon.id)}
            >
              <Glyph name={icon.id} />
              <span>{icon.label}</span>
              {value === icon.id && (
                <span className="icon-selection-check">
                  <Icon name="check" size={12} />
                </span>
              )}
            </button>
          ))}
        </div>
        {!results.length && (
          <div className="icon-no-results">
            <p>No matching icons. Try another word or category.</p>
            <button
              type="button"
              className="text-button"
              onClick={() => {
                setQuery("");
                setCategory("All icons");
                setLimit(pageSize);
              }}
            >
              Show all icons
            </button>
          </div>
        )}
        {results.length > limit && (
          <button
            type="button"
            className="secondary full"
            onClick={() => setLimit(limit + pageSize)}
          >
            Show more icons
          </button>
        )}
      </div>
    </fieldset>
  );
}

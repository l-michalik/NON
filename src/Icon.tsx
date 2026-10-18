export function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, string> = {
    home: "m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z",
    habits: "M9 5h11M9 12h11M9 19h11M3 5l1 1 2-2M3 12l1 1 2-2M3 19l1 1 2-2",
    summary: "M4 20V10M12 20V4M20 20v-7",
    rules: "M6 3h12v18l-6-4-6 4Z",
    plus: "M12 5v14M5 12h14",
    left: "m14 6-6 6 6 6",
    right: "m10 6 6 6-6 6",
    check: "m5 12 4 4L19 6",
    close: "m6 6 12 12M6 18 18 6",
    flame:
      "M13 3c1 6 6 7 6 12a7 7 0 0 1-14 0c0-3 2-6 4-8 0 3 1 4 2 4 2-2 2-5 2-8Z",
    arrow: "M5 12h14m-5-5 5 5-5 5",
    sun: "M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1 1M18 18l1 1M5 19l1-1M18 6l1-1M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
    clock: "M12 8v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
    moon: "M20 14A8 8 0 0 1 10 4a9 9 0 1 0 10 10Z",
    calendar: "M4 5h16v16H4ZM8 3v4M16 3v4M4 10h16",
    settings:
      "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2",
    leaf: "M20 3C8 2 3 7 4 14s15 9 16-11ZM5 20 16 8",
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] || paths.rules} />
    </svg>
  );
}
export function Glyph({ name }: { name: string }) {
  if (name.startsWith("lucide:")) {
    return (
      <svg
        className="glyph lucide-glyph"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <use href={`/icons/lucide.svg#${name.slice(7)}`} />
      </svg>
    );
  }
  return (
    <span
      className="glyph"
      style={{ maskImage: `url(/icons/habit-${name}.svg)` }}
      aria-hidden="true"
    />
  );
}

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { findIcons, habitIcons, iconsById } from "../src/iconCatalog.ts";
test("every catalogue entry has an asset and a unique persistent identifier", () => {
  const sprite = readFileSync(
    new URL("../public/icons/lucide.svg", import.meta.url),
    "utf8",
  );
  assert.equal(iconsById.size, habitIcons.length);
  for (const icon of habitIcons) {
    if (icon.id.startsWith("lucide:"))
      assert.ok(sprite.includes(`id="${icon.id.slice(7)}"`), icon.id);
    else
      assert.ok(
        readFileSync(
          new URL(`../public/icons/habit-${icon.id}.svg`, import.meta.url),
        ).length,
      );
  }
});
test("Polish search supports diacritics and relevant hobby icons", () => {
  assert.ok(
    findIcons("rower", "All icons").some((i) => i.id === "lucide:bike"),
  );
  assert.ok(findIcons("książka", "All icons").some((i) => i.id === "reading"));
  assert.ok(findIcons("siłownia", "All icons").some((i) => i.id === "gym"));
  assert.ok(
    findIcons("gitara", "Art & music").some((i) => i.id === "lucide:guitar"),
  );
});
test("categories narrow results and an unknown query has an empty state", () => {
  assert.equal(findIcons("", "Original icons").length, 6);
  assert.equal(findIcons("zzzz-no-such-icon", "All icons").length, 0);
  assert.ok(findIcons("", "All icons").length > 1800);
});

import { copyFile } from "node:fs/promises";
const root = new URL("../", import.meta.url);
for (const [source, target] of [
  ["sprite.svg", "public/icons/lucide.svg"],
  ["tags.json", "src/data/icon-tags.json"],
  ["LICENSE", "public/icons/LUCIDE-LICENSE.txt"],
]) {
  await copyFile(
    new URL(`node_modules/lucide-static/${source}`, root),
    new URL(target, root),
  );
}

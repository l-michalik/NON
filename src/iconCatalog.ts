import tags from "./data/icon-tags.json" with { type: "json" };
export type HabitIcon = {
  id: string;
  label: string;
  terms: string;
  categories: string[];
};
export const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/ł/g, "l")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
const groups = [
  {
    name: "Sport & outdoors",
    terms:
      "sport fitness exercise gym cycling bike running walking hiking mountain swimming ball trophy racket camping tent fishing",
  },
  {
    name: "Health & wellbeing",
    terms:
      "health medical medicine heart pulse pill sleep moon meditation yoga wellness bath soap shower toothbrush",
  },
  {
    name: "Learning & work",
    terms:
      "book education school study learning science language pen pencil notebook work office business computer code laptop brain",
  },
  {
    name: "Art & music",
    terms:
      "art craft paint drawing brush palette music instrument guitar piano drum singing photography camera film video theatre scissors",
  },
  {
    name: "Food & drink",
    terms:
      "food cooking kitchen meal fruit vegetable drink coffee tea water nutrition baking cake soup utensils chef",
  },
  {
    name: "Home & nature",
    terms:
      "home house cleaning garden plant flower leaf tree animal dog cat bird nature environment recycle",
  },
  {
    name: "People & leisure",
    terms:
      "people family friends community social love game gaming puzzle travel plane train map compass ticket party",
  },
  {
    name: "Goals & money",
    terms:
      "goal target check achievement award medal star calendar time clock money saving wallet finance bank coin budget",
  },
];
export const iconCategories = [
  "All icons",
  "Original icons",
  ...groups.map((g) => g.name),
];
const aliases: Record<string, string> = {
  rower: "bike cycling",
  bieganie: "running fitness",
  bieg: "running",
  spacer: "walking footprints",
  silownia: "gym dumbbell fitness",
  trening: "exercise fitness",
  plywanie: "swimming waves",
  joga: "yoga meditation",
  pilka: "ball sport",
  tenis: "tennis racket",
  gory: "mountain hiking",
  taniec: "dance music",
  zdrowie: "health medical",
  sen: "sleep bed moon",
  spanie: "sleep bed",
  medytacja: "meditation brain",
  leki: "pill medicine",
  witaminy: "vitamins pill",
  pielegnacja: "skincare bath",
  zeby: "toothbrush",
  modlitwa: "prayer church",
  czytanie: "reading book",
  ksiazka: "book",
  nauka: "learning school",
  jezyk: "language",
  praca: "work briefcase",
  programowanie: "code computer",
  pisanie: "pen writing",
  muzyka: "music",
  gitara: "guitar",
  pianino: "piano",
  rysowanie: "drawing pencil",
  malowanie: "paint palette",
  fotografia: "camera photography",
  szycie: "scissors craft",
  film: "film video",
  gotowanie: "cooking chef",
  jedzenie: "food meal",
  dieta: "nutrition food",
  woda: "water droplet",
  kawa: "coffee",
  herbata: "tea cup",
  pieczenie: "cake baking",
  dom: "home house",
  sprzatanie: "cleaning brush",
  ogrod: "garden flower",
  kwiaty: "flower",
  rosliny: "plant leaf",
  pies: "dog",
  kot: "cat",
  rodzina: "family people",
  przyjaciele: "friends users",
  gry: "game gaming",
  szachy: "chess",
  podroze: "travel plane",
  podroz: "travel",
  cel: "goal target",
  oszczedzanie: "saving piggy bank",
  pieniadze: "money wallet",
  budzet: "budget finance",
  czas: "time clock",
  sport: "sport fitness",
  hobby: "craft game music",
};
const originals: HabitIcon[] = [
  ["gym", "Gym", "fitness exercise dumbbell"],
  ["reading", "Reading", "book learning"],
  ["skincare", "Skincare", "health beauty bath"],
  ["prayer", "Prayer", "spiritual meditation"],
  ["creatine", "Creatine", "health supplement fitness"],
  ["vitamins", "Vitamins", "health pill medicine"],
].map(([id, label, terms]) => ({
  id,
  label,
  terms: `${id} ${terms}`,
  categories: [
    "Original icons",
    ...groups
      .filter((g) =>
        g.terms.split(" ").some((t) => terms.split(" ").includes(t)),
      )
      .map((g) => g.name),
  ],
}));
export const habitIcons: HabitIcon[] = [
  ...originals,
  ...Object.entries(tags).map(([name, keywords]) => {
    const terms = `${name.replaceAll("-", " ")} ${keywords.join(" ")}`;
    const words = new Set(terms.split(/\W+/));
    return {
      id: `lucide:${name}`,
      label: name
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
      terms,
      categories: groups
        .filter((g) => g.terms.split(" ").some((t) => words.has(t)))
        .map((g) => g.name),
    };
  }),
];
export const iconsById = new Map(habitIcons.map((icon) => [icon.id, icon]));
export function findIcons(query: string, category: string) {
  const tokens = normalize(query.trim()).split(/\s+/).filter(Boolean);
  return habitIcons
    .filter(
      (icon) =>
        (category === "All icons" || icon.categories.includes(category)) &&
        tokens.every((token) => {
          const alternatives = [token, ...(aliases[token]?.split(" ") || [])];
          return alternatives.some((term) => icon.terms.includes(term));
        }),
    )
    .sort((a, b) => a.label.localeCompare(b.label, "en"));
}

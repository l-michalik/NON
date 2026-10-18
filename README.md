# NON

Desktopowa aplikacja webowa NON, oparta na aplikacji iOS z `../MTIME`.
React 19, TypeScript i Vite. Układ adaptuje się do szerokości okna.

## Uruchomienie

- `npm install`
- `npm run dev` — lokalny podgląd
- `npm run build` — kompilacja produkcyjna
- `npm run lint` — kontrola kodu
- `node --experimental-strip-types --test tests/model.test.mjs` — testy logiki, Node 22.6+

## Funkcje

- Home: wybór dnia, postęp, odhaczanie i uzasadnione pominięcia z notatką.
- Habits: tworzenie, edycja i usuwanie nawyków; wybrane dni lub cel tygodniowy.
- Summary: tydzień, miesiąc i rok; historia, skuteczność i zestawienie nawyków.
- Rules: własne zasady z opcjonalnym przedziałem czasu, również przez północ.
- Settings & data: eksport JSON i przejście z demonstracji do pustego obszaru.

Pierwsze uruchomienie pokazuje jawnie oznaczone dane demonstracyjne.
Dane są zapisywane lokalnie w przeglądarce pod kluczem `mtime.desktop.v1`.
Klucz zachowano po zmianie nazwy na NON, aby utrzymać istniejące wpisy.
Brak synchronizacji z iOS/SwiftData, systemowych powiadomień i natywnego pakietu
macOS. Eksport tworzy kopię JSON; import nie jest jeszcze dostępny.
Tydzień zaczyna się w poniedziałek, daty używają lokalnej strefy przeglądarki.

## Struktura i obliczenia

`src/model.ts` zawiera model danych i obliczenia. Komponenty edycji są w
`src/Editors.tsx`, podsumowanie w `src/Summary.tsx`, a nawigacja i dzień w
`src/App.tsx`. Style znajdują się w `src/index.css`.

Pominięcia nie obniżają skuteczności ani nie przerywają serii. Brak wpisu
w minionym zaplanowanym dniu liczy się jako niewykonanie. Cele tygodniowe
uwzględniają datę startu i pominięcia; brakujące wykonania obciążają statystykę
po zamknięciu tygodnia. Perfect days dotyczą wyłącznie nawyków dziennych.

Ikony i znak marki skopiowano z `../MTIME/MTIME/Assets.xcassets`.
Favicon `public/favicon.svg` zachowuje oryginalny znak nietoperza,
z zaokrąglonym tłem i przezroczystymi narożnikami.
Wytyczne projektu i lokalny Apple Design Skill są w `AGENTS.md` i `.agents/`.

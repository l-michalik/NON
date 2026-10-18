# NON

Desktopowa aplikacja webowa NON, oparta na aplikacji iOS z `../MTIME`.
React 19, TypeScript i Vite. Układ adaptuje się do szerokości okna.

## Uruchomienie

- `npm install`
- `npm run dev` — lokalny podgląd
- `npm run build` — kompilacja produkcyjna
- `npm run lint` — kontrola kodu
- `node --experimental-strip-types --test tests/*.test.mjs` — testy logiki, Node 22.6+

## Funkcje

- Home: wybór dnia, postęp, odhaczanie i uzasadnione pominięcia z notatką.
- Habits: tworzenie, edycja i usuwanie nawyków; wybrane dni z godziną lub cel 1–7 razy w tygodniu bez godziny.
- Summary: tydzień, miesiąc i rok; historia, skuteczność i zestawienie nawyków.
- Rules: własne zasady z opcjonalnym przedziałem czasu, również przez północ.
- Settings & data: eksport danych do JSON.

Pierwsze uruchomienie otwiera pustą listę. Nie ma danych demonstracyjnych.
Katalog obejmuje 1897 ikon z wyszukiwaniem i kategoriami. Najczęstsze hasła
wyszukiwarki obsługują również polskie synonimy. Ikony Lucide są lokalnym
zasobem SVG; licencja znajduje się w `public/icons/LUCIDE-LICENSE.txt`.
Po świadomej aktualizacji `lucide-static` uruchom `node scripts/sync-icons.mjs`.

Dane są zapisywane przez `/api/workspace` w Upstash Redis. Jedna prywatna lista
jest wspólna dla urządzeń właściciela, z dostępem na hasło. Przeglądarka otrzymuje
podpisane ciasteczko HttpOnly na 30 dni. Zmiana SESSION_SECRET unieważnia sesje.
Stare dane lokalne nie są wczytywane ani przesyłane do bazy.
Brak synchronizacji z iOS/SwiftData. Eksport tworzy kopię JSON; import nie jest
jeszcze dostępny. Równoczesne zapisy są kontrolowane numerem wersji: konflikt
wymaga eksportu niezapisanych zmian i odświeżenia strony, zamiast nadpisywania
nowszych danych. Inne urządzenie pobiera aktualny stan przy otwarciu/odświeżeniu.

## Vercel i baza

1. W projekcie Vercel podłącz bazę Upstash Redis z Marketplace.
2. Ustaw zmienne serwerowe z `.env.example`: adres REST i token bazy (integracja Vercel dodaje je automatycznie jako
   `KV_REST_API_URL` i `KV_REST_API_TOKEN`, które aplikacja również obsługuje),
   silne hasło `WORKSPACE_PASSWORD` i losowy `SESSION_SECRET` (minimum 32 bajty).
   Nie dodawaj do nich prefiksu `VITE_` ani nie umieszczaj sekretów w repozytorium.
3. Wdróż ponownie projekt jako Vite (`npm run build`, katalog `dist`).
4. Otwórz stronę, wpisz hasło, dodaj nawyk i odśwież stronę, aby sprawdzić zapis.
   Na drugim urządzeniu zaloguj się tym samym hasłem.

Lokalnie użyj `vercel dev` ze zmiennymi w `.env.local`, aby uruchomić również API.
Samo `npm run dev` uruchamia frontend bez API. Bez konfiguracji bazy aplikacja
pokazuje błąd połączenia; nie udaje udanego zapisu. Dla Preview używaj osobnej
bazy i sekretów, żeby testy nie modyfikowały danych produkcyjnych.
API ogranicza próby logowania do 20 na minutę, rozmiar zapisu do 1 MB i listy do
500 pozycji. Dane nie mają TTL. Włącz odpowiednie kopie zapasowe po stronie bazy.
Implementacja: [Vercel Functions](https://vercel.com/docs/functions/runtimes/node-js)
i [Upstash REST API](https://upstash.com/docs/redis/features/restapi).

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

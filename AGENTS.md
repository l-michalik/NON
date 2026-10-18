# Instrukcje projektu NON

## Obowiązująca podstawa projektowania interfejsu

Każdy nowy lub zmieniany element interfejsu tworzony przez AI musi bazować na
[Apple Design Skill](.agents/skills/apple-design/SKILL.md).
Dotyczy to komponentów, ekranów, układów, nawigacji, stylów, animacji i treści UI.
Stosuj te zasady podczas projektowania, implementacji i przeglądu zmian, również
gdy użytkownik nie wymienia skilla w poleceniu.

Przed pracą nad interfejsem:

1. Przeczytaj `.agents/skills/apple-design/SKILL.md`.
2. Użyj `.agents/skills/apple-design/references/hig-lookup.md`, aby wybrać
   materiały dotyczące danego elementu.
3. Przeczytaj wytyczne `accessibility.md`, `layout.md`, `typography.md` i
   `color.md` z katalogu `.agents/skills/apple-design/references/hig/` oraz
   odpowiednie wytyczne komponentów i interakcji. Przy tłumaczeniu pojęć
   platformowych korzystaj z `references/cross-platform.md` w katalogu skilla.
4. Zastosuj wytyczne w kodzie React, a przed zakończeniem sprawdź dostępność,
   responsywność, hierarchię wizualną, spójność i stany interakcji.

NON jest aplikacją webową React + TypeScript. Stosuj zasady HIG dotyczące
czytelności, prostoty, dostępności, układu i informacji zwrotnej w zgodzie
z semantyką HTML i zachowaniem przeglądarki. Wzorce przeznaczone wyłącznie
dla natywnych aplikacji Apple stosuj tylko wtedy, gdy pasują do platformy.
Nie dodawaj dekoracji ani efektów szkła bez uzasadnienia w funkcji elementu.

Bezpośrednie wymagania użytkownika mają pierwszeństwo. Nie przypisuj Apple
reguł, których nie potwierdzają przeczytane materiały.

## Źródło wiedzy

Lokalna kopia: `.agents/skills/apple-design/`.
Źródło: https://github.com/dickwu/apple-design-skill (gałąź `main`).
Pobrano 18 października 2026. Zachowaj informacje o pochodzeniu materiałów;
aktualizuj kopię świadomie, bez automatycznego pobierania przy każdej pracy.

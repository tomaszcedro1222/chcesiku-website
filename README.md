# Strona „Chcę Siku!”

Statyczna strona publikowana przez istniejący GitHub Pages. Na serwerze nie wymaga Node.js ani bazy danych. Wygenerowane pliki HTML i PNG są zapisane w repozytorium; workflow publikuje je bez dodatkowego budowania.

## Edycja i weryfikacja strony (22.10.2026)

- `content/articles.json` - źródło ośmiu poradników. Każdy zawiera opis, datę, sekcje i źródła.
- `scripts/build-site.mjs` - szablony głównej, Pobierz, poradnika, artykułów, strony redakcji i sitemap.
- `site.css` - wspólna szata graficzna; `styles.css` zachowany dla starszych odwołań.
- `scripts/render-social.cjs` - oryginalne karty SVG/PNG w proporcjach 1:1 i 1200:630. Zawartość poziomych kart mieści się w centralnym kwadratowym kadrze.

Po zmianie treści uruchom `npm run build`, a następnie `npm test` (Node.js 20+). Po zmianie grafik zainstaluj zależności przez `npm install` i uruchom `npm run build:social`. Zapisz w commicie źródła i wygenerowane wyniki. Przy kolejnych zmianach ustaw rzeczywistą datę aktualizacji oraz nową wersję URL grafiki, aby nie korzystać ze starej kopii podglądu w komunikatorach.

Testy chronią `polecenie/`, `.well-known/`, `analytics.js`, `404.html`, CNAME i workflow względem produkcyjnego commitu `a8d0628`. Nie aktualizuj tego punktu odniesienia bez osobnego audytu tych funkcji. Zmiany treści prawnych wymagają osobnego zakresu - generator aktualizuje tam tylko wspólny nagłówek, stopkę i styl.

Treść dla Google i wyszukiwarek AI znajduje się bezpośrednio w HTML. Artykuły mają canonicale, dane BlogPosting/BreadcrumbList, źródła, daty i linki tematyczne. Sitemap jest w `sitemap.xml`, a robots.txt dopuszcza indeksowanie. Strony poleceń celowo pozostają `noindex`. Nie ma mechanizmu gwarantującego indeksację, ranking ani cytowanie przez model.

## Zawartość

- `index.html` — strona główna aplikacji,
- `pobierz/index.html` — strona do udostępniania i pobierania aplikacji ze sklepów,
- `privacy.html` — publiczna polityka prywatności wymagana przez App Store i Google Play,
- `delete-account.html` — publiczna ścieżka żądania usunięcia konta wymagana przez Google Play,
- `support.html` — pomoc i kontakt dla użytkowników oraz recenzentów sklepów,
- `STORE_LISTING.md` — gotowe treści do paneli obu sklepów,
- `PUBLISHING_CHECKLIST.md` — lista rzeczy do potwierdzenia przed wysyłką.

## Publikacja przez GitHub Pages

Repozytorium zawiera workflow, który publikuje stronę automatycznie po każdej zmianie gałęzi `main`.

1. W GitHub otwórz `Settings` → `Pages`.
2. W sekcji `Build and deployment` jako źródło wybierz `GitHub Actions`.
3. Otwórz kartę `Actions` i poczekaj na zakończenie zadania „Publikacja GitHub Pages”.
4. Adres strony pojawi się w `Settings` → `Pages`.

Jeśli folder ma pozostać we wspólnym repozytorium aplikacji, można użyć katalogu `/docs` zamiast `/website`, a następnie wskazać `/docs` w GitHub Pages.

Instrukcja i zapis zastosowanej konfiguracji domeny `chcesiku.pl` znajdują się w `DOMAIN_SETUP.md`.

## Przed publikacją

Potwierdzone dane wydawcy i administratora: `AZ Tomasz Cedro`, NIP
`PL5361869704`, ul. Artura Grottgera 14/1, 05-120 Legionowo, telefon
`+48 536 800 099`, e-mail `chcesiku.cedrotomasz@gmail.com`. Przed wysłaniem
aplikacji trzeba jeszcze:

1. potwierdzić, czy produkcyjny projekt Supabase znajduje się w EOG czy poza EOG;
2. przed każdym wydaniem potwierdzić aktualność migracji i funkcji produkcyjnych;
3. naprawić certyfikat HTTPS domeny i sprawdzić wszystkie publiczne adresy.

Tekst polityki jest przygotowany pod aktualne funkcje projektu, ale nie zastępuje indywidualnej porady prawnej.

## Grafika

Aktualne podglądy linków są w `assets/social/`. To proste kompozycje typograficzne i wektorowe, bez generowanych zdjęć i fałszywych ekranów aplikacji. `/pobierz/` używa kwadratowej grafiki Open Graph, a Twitter - wersji poziomej. Pozostałe karty poziome mają centralną, bezpieczną strefę dla kwadratowego przycięcia. Wygląd karty i czas odświeżenia pamięci podręcznej zależą także od platformy.

Starszy `assets/og-chce-siku.png` pozostawiono, aby nie psuć wcześniej pobranych adresów. Nowe podstrony już go nie wskazują. `assets/map-route.svg` jest podpisanym schematem, nie zrzutem ekranu i nie mapą rzeczywistych obiektów.

# Strona „Chcę Siku!”

Statyczna strona publikowana przez istniejący GitHub Pages. Na serwerze nie wymaga Node.js ani bazy danych. Wygenerowane pliki HTML i PNG są zapisane w repozytorium; workflow publikuje je bez dodatkowego budowania.

## Wersja angielska (27.10.2026)

- `/en/`, `/en/download/`, `/en/guides/` i 9 poradników, w tym oryginalny przewodnik dla odwiedzających Polskę.
- `content/articles.en-practical.json`, `content/articles.en-health.json` i `content/pages.en-legal.json` są źródłami angielskich treści. Polskie treści pozostają w dotychczasowych plikach.
- `scripts/build-site.mjs` uruchamia również `scripts/build-english.mjs`: powstaje 16 stron angielskich, wzajemne `hreflang` PL/EN i przełączniki prowadzące do odpowiednika artykułu. Każdy język ma własny canonical. Nie ma przekierowań według IP ani języka przeglądarki.
- `sitemap.xml` obejmuje 31 stron, bez linków poleceń. `/en/feed.xml` udostępnia angielskie poradniki jako RSS.
- `npm run build:social:en` tworzy angielskie grafiki 1:1 i 1200:630. Osobny generator nie nadpisuje polskich grafik ani podglądu poleceń.
- Angielska witryna jasno informuje, że interfejs aplikacji jest obecnie polski. Instrukcje tłumaczą znaczenie istniejących etykiet.
- `analytics.js` zachowuje usługę `G-FXTJ25VR00` i klucz zgody. Dodaje angielską treść zgody, parametr `site_language` oraz zdarzenie `app_store_click` (parametry `store`, `site_language`, `page_path`) wyłącznie po zgodzie. To kliknięcie do sklepu, nie instalacja. Na localhost analityka nie jest wysyłana. Raporty według `/en/` nie wymagają rejestracji wymiaru niestandardowego; dla raportowania `site_language` jako wymiaru w GA4 trzeba go osobno zarejestrować.

Po publikacji: zweryfikuj publiczne `/en/`, `/en/download/`, artykuł i sitemapę; zgłoś zaktualizowaną mapę witryny w istniejącej usłudze Search Console. Oceniaj osobno wyświetlenia/kliknięcia `/en/`, kraje, zapytania niezwiązane z marką oraz kliknięcia do sklepów. Samo dodanie tłumaczeń nie gwarantuje ruchu ani cytowań AI. Nie dodajemy masowych stron miast, fikcyjnych ocen, ukrytego tekstu ani specjalnych plików obiecujących ranking w AI.

## Edycja i weryfikacja strony (22.10.2026)

- `content/articles.json` - źródło ośmiu poradników. Każdy zawiera opis, datę, sekcje i źródła.
- `scripts/build-site.mjs` - szablony głównej, Pobierz, poradnika, artykułów, strony redakcji i sitemap.
- `site.css` - wspólna szata graficzna; `styles.css` zachowany dla starszych odwołań.
- `scripts/render-social.cjs` - oryginalne karty SVG/PNG w proporcjach 1:1 i 1200:630. Zawartość poziomych kart mieści się w centralnym kwadratowym kadrze.

Po zmianie treści uruchom `npm run build`, a następnie `npm test` (Node.js 20+). Po zmianie grafik zainstaluj zależności przez `npm install` i uruchom `npm run build:social`. Zapisz w commicie źródła i wygenerowane wyniki. Przy kolejnych zmianach ustaw rzeczywistą datę aktualizacji oraz nową wersję URL grafiki, aby nie korzystać ze starej kopii podglądu w komunikatorach.

Testy chronią `polecenie/`, `.well-known/`, `404.html`, CNAME i workflow względem produkcyjnego commitu `a8d0628`. Nie aktualizuj tego punktu odniesienia bez osobnego audytu tych funkcji. Zachowanie Analytics po lokalizacji chronią osobne testy zgody, języka i izolacji podglądu. Generator zachowuje polskie treści prawne; angielskie wersje są tłumaczeniami tych samych zasad.

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

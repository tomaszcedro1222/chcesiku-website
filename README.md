# Strona „Chcę Siku!”

Gotowa statyczna strona do publikacji przez GitHub Pages. Nie wymaga Node.js, bazy danych ani procesu budowania.

## Zawartość

- `index.html` — strona główna aplikacji,
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

Instrukcja podłączenia domeny zewnętrznej znajduje się w `DOMAIN_SETUP.md`. Zalecany adres to `chcesiku.pluginsforlife.com`, ponieważ domena główna obecnie obsługuje WordPress.

## Przed publikacją

Strona `pluginsforlife.com` nie udostępniała pełnych danych prawnych AutoKamery. Dlatego użyto publicznej nazwy `Plugins for Life` i adresu `theseosavage@gmail.com`, widocznego w profilu autora domeny. Przed wysłaniem aplikacji potwierdź:

1. czy `Plugins for Life` jest właściwą nazwą administratora danych;
2. czy `theseosavage@gmail.com` jest właściwym publicznym adresem wsparcia;
3. czy strona będzie dostępna pod `https://pluginsforlife.com/chcesiku/` — jeśli nie, zmień adresy w `robots.txt`, `sitemap.xml` i metadanych;
4. czy produkcyjny projekt Supabase znajduje się w EOG czy poza EOG;
5. czy usuwanie konta zostało faktycznie wdrożone w aplikacji i backendzie.

Tekst polityki jest przygotowany pod aktualne funkcje projektu, ale nie zastępuje indywidualnej porady prawnej.

## Grafika

Grafika `assets/og-chce-siku.png` została wygenerowana specjalnie dla tej strony. Finalny prompt: social card aplikacji „Chcę Siku!” w palecie żółty/granat/niebieski, z mapą, trasą, telefonem i tekstem „Chcę Siku! — Najbliższa toaleta. Bez stresu.”; bez logotypów sklepów i zewnętrznych marek. Użyto wbudowanego generatora obrazów.

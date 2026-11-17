# Konto i polecenia na statycznej stronie

Stan lokalny z 17.11.2026, gałąź `codex/website-web-app` z opublikowanego `edf363d`.

Nie jest to pełna przeglądarkowa aplikacja Chcę Siku. GitHub Pages serwuje formularze, a istniejący Supabase Auth oraz nowa funkcja `referral-web` obsługują konto i nagrody. Migracja hostingu nie jest wymagana.

## Pliki i budowanie

- `scripts/build-account-pages.mjs`: generuje `/konto/`, `/konto/potwierdzenie/` i `/polecenie/`; wywoływany przez dotychczasowy `scripts/build-site.mjs`.
- `konto/account.mjs`: formularz, obsługa potwierdzenia, automatyczny odbiór i przycisk pobrania.
- `konto/referral-flow.mjs`: reguły oczekującego linku, jeden aktywny odbiór i interpretacja odpowiedzi serwera.
- `konto/config.mjs`: wyłącznie publiczny adres i klucz klienta. Nigdy nie dodawać klucza serwisowego.
- `assets/vendor/supabase-2.111.0.js`: lokalna wersja oficjalnego SDK, SHA-256 `7396012594aa6d23bb373ebc25d1080bf3672fa847c3713f756520b40fd13453`; licencja w `supabase-LICENSE.txt`.

Uruchom `node scripts/build-site.mjs`, następnie `node --test test/*.test.mjs` (45 testów na tym etapie). Stary parser `polecenie/link.mjs` i powiązania aplikacji z domeną zachowano dla zgodności. Nowy formularz nie próbuje otwierać nieobecnej aplikacji przez własny schemat URL.

## Testy i granice

Podgląd na localhost został otwarty i sprawdzony. `tool/preview_referral_account_fixture.py` w osobnym repozytorium aplikacji dostarcza wyłącznie lokalną atrapę API na 127.0.0.1:8151: brak wysyłki wiadomości i brak prawdziwych nagród. Katalog strony wskazuje zmienna `CHCESIKU_WEBSITE_PREVIEW_ROOT`. Skrypt nie jest częścią strony ani workflow publikującego; nie używać go jako serwera produkcyjnego. Do zwykłego podglądu służy statyczny serwer z katalogu repozytorium.

Kod zaproszenia pozostaje zapisany do 7 dni lub odpowiedzi końcowej. Rejestracja bez potwierdzenia e-maila nie przyznaje nagrody. Potwierdzenie w innej przeglądarce może wymagać zalogowania hasłem, ponieważ PKCE wymaga pierwotnego weryfikatora. Kod w adresie powrotu pozwala dokończyć odbiór bez ponownego klikania zaproszenia.

## Przed publikacją

Publikacja wymaga zatwierdzenia właściciela, wdrożenia przygotowanej migracji i funkcji w repozytorium aplikacji oraz dodania `https://chcesiku.pl/konto/potwierdzenie/**` do dozwolonych adresów Auth, bez zastępowania adresów mobilnych. Funkcja i konfiguracja bazy mają odrębne wyłączniki.

Uzupełnienie polityki PL/EN opisuje lokalną sesję, oczekujący kod, powiązanie nagród oraz skrót sieciowy do limitów. Nie dodano analityki do formularzy. Publikację tego opisu należy zatwierdzić wraz z funkcją, a nie na podstawie samego lokalnego testu.

Po wdrożeniu sprawdzić prawdziwą wiadomość potwierdzającą oraz odbiór miesiąca na kontrolowanym koncie. Nie testować podszywając się pod zgłaszającą użytkowniczkę. Dotychczasowa wersja strony jest punktem powrotu; zdobytych nagród nie usuwać podczas wyłączania nowego kanału.

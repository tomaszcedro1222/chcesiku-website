# Konto i polecenia na statycznej stronie

Stan z 17.11.2026. Bazowy moduł kont opublikowano z `ec7d85f` (GitHub Pages run 44123550731). W tej gałęzi przygotowano poprawkę potwierdzenia na innym urządzeniu; zapis szablonu i publikację zatwierdził właściciel. Stan końcowy potwierdza osobny wpis wdrożenia.

Nie jest to pełna przeglądarkowa aplikacja Chcę Siku. GitHub Pages serwuje formularze, a istniejący Supabase Auth oraz nowa funkcja `referral-web` obsługują konto i nagrody. Migracja hostingu nie jest wymagana.

## Pliki i budowanie

- `scripts/build-account-pages.mjs`: generuje `/konto/`, `/konto/potwierdzenie/` i `/polecenie/`; wywoływany przez dotychczasowy `scripts/build-site.mjs`.
- `konto/account.mjs`: formularz, obsługa potwierdzenia, automatyczny odbiór i przycisk pobrania.
- `konto/referral-flow.mjs`: reguły oczekującego linku, jeden aktywny odbiór i interpretacja odpowiedzi serwera.
- `konto/config.mjs`: wyłącznie publiczny adres i klucz klienta. Nigdy nie dodawać klucza serwisowego.
- `assets/vendor/supabase-2.111.0.js`: lokalna wersja oficjalnego SDK, SHA-256 `7396012594aa6d23bb373ebc25d1080bf3672fa847c3713f756520b40fd13453`; licencja w `supabase-LICENSE.txt`.

Uruchom `node scripts/build-site.mjs`, następnie `node --test test/*.test.mjs` (51 testów na etapie poprawki potwierdzenia). Stary parser `polecenie/link.mjs` i powiązania aplikacji z domeną zachowano dla zgodności. Nowy formularz nie próbuje otwierać nieobecnej aplikacji przez własny schemat URL.

## Testy i granice

Podgląd na localhost został otwarty i sprawdzony. `tool/preview_referral_account_fixture.py` w osobnym repozytorium aplikacji dostarcza wyłącznie lokalną atrapę API na 127.0.0.1:8151: brak wysyłki wiadomości i brak prawdziwych nagród. Katalog strony wskazuje zmienna `CHCESIKU_WEBSITE_PREVIEW_ROOT`. Skrypt nie jest częścią strony ani workflow publikującego; nie używać go jako serwera produkcyjnego. Do zwykłego podglądu służy statyczny serwer z katalogu repozytorium.

Kod zaproszenia pozostaje zapisany do 7 dni lub odpowiedzi końcowej. Rejestracja bez potwierdzenia e-maila nie przyznaje nagrody. Pierwsze wydanie używało automatycznej wymiany kodu PKCE, wymagającej pierwotnej przeglądarki. Poprawka obsługuje jednorazowy token z e-maila przez `verifyOtp`, bez pierwotnego weryfikatora. Tylko wiadomości rejestracji z adresem powrotu WWW dostają nowy link. Token jest we fragmencie adresu (nie trafia w żądaniu do GitHub Pages), usuwanym z paska przed weryfikacją. Kod polecenia odtwarzamy tylko z zaufanego adresu powrotu na chcesiku.pl. Starsze wiadomości PKCE nadal pozwalają zalogować się hasłem i dokończyć odbiór bez powrotu do zaproszenia.

## Przed publikacją

Publikacja wymaga zatwierdzenia właściciela, wdrożenia przygotowanej migracji i funkcji w repozytorium aplikacji oraz dodania `https://chcesiku.pl/konto/potwierdzenie/**` do dozwolonych adresów Auth, bez zastępowania adresów mobilnych. Funkcja i konfiguracja bazy mają odrębne wyłączniki.

Uzupełnienie polityki PL/EN opisuje lokalną sesję, oczekujący kod, powiązanie nagród oraz skrót sieciowy do limitów. Nie dodano analityki do formularzy. Publikację tego opisu należy zatwierdzić wraz z funkcją, a nie na podstawie samego lokalnego testu.

Po wdrożeniu sprawdzić prawdziwą wiadomość potwierdzającą oraz odbiór miesiąca na kontrolowanym koncie. Nie testować podszywając się pod zgłaszającą użytkowniczkę. Dotychczasowa wersja strony jest punktem powrotu; zdobytych nagród nie usuwać podczas wyłączania nowego kanału.

## Poprawka potwierdzenia - 17.11.2026

- Osobny, wyśrodkowany ekran potwierdzenia zastępuje ogólne „Miło Cię widzieć”. Gratulacje i obietnica przyznanego miesiąca wymagają potwierdzonej sesji i odpowiedzi `accepted` z serwera.
- Link otwarty na drugim urządzeniu może ustanowić własną sesję przez oficjalne `verifyOtp({token_hash,type:'email'})`. Nie wyłączamy potwierdzania poczty ani PKCE w dotychczasowych przepływach.
- Wygasły lub nieprawidłowy token nie przyznaje nagrody na konto poprzednio zalogowane w tej przeglądarce. Użytkownik może jawnie zalogować się i dokończyć odbiór.
- 51 testów Node zaliczonych, w tym trzy testy pełnego kontrolera na atrapie Auth: nowe urządzenie, wygasły token przy starej sesji oraz nieprawidłowy token. Lokalny podgląd potwierdził ekran i przyciski sklepów. To nadal nie dowodzi prawdziwego naliczenia nagrody.
- Szablon, kopia poprzedniej treści i test Go są w oddzielnym repozytorium aplikacji. Pełny test lokalny obejmuje 6 przypadków i potwierdza bajtową zgodność wiadomości mobilnych. Nie publikować plików szablonów ani lokalnej atrapy z repozytorium strony.

## Potwierdzony test rzeczywisty - 17.11.2026

Właściciel potwierdził, że po otwarciu nowego e-maila na telefonie, bez ponownego logowania, zobaczył gratulacje i przycisk pobrania. Odczyt produkcji przez Supabase MCP potwierdził jeden odbiór platformy `web`, zapisany 17.11.2026 o 16:55:09 UTC: potwierdzony e-mail odbiorcy, nagroda 1 miesiąca i 10 punktów dla nadawcy. Uprawnienie odbiorcy jest zgodne z zapisem nagrody i trwa do 17.12.2026, a okres nadawcy został przedłużony do 22.12.2026. Odczyt nie zmieniał danych. Nie jest to test późniejszego zalogowania w aplikacji mobilnej ani test podwójnego użycia rzeczywistego linku; te rozróżniamy od wcześniejszych testów bazy.

Opublikowana poprawka strony: `8e11ae6579ebf1783553d97cc8fd048430d228a1`, GitHub Pages run 44130000493, success. Niniejszy wpis zapisuje wynik testu lokalnie; sam nie oznacza kolejnej publikacji strony.

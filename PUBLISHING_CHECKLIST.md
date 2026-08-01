# Checklista przed publikacją

## Blokery wymagające poprawy w aplikacji

- [x] Działa trwałe usunięcie konta z aplikacji.
- [x] Backend usuwa lub anonimizuje dane i zdjęcia użytkownika.
- [x] Użytkownik może zgłosić komentarz, zdjęcie i inne treści.
- [x] Istnieje procedura moderacji i blokowania nadużyć.
- [x] Linki do polityki prywatności, pomocy i usuwania konta są dostępne w aplikacji.
- [ ] Android release nie jest podpisywany kluczem debugowym.
- [ ] Klucz Android i `key.properties` nie są zapisane w Git.
- [x] Wersja została ustawiona na `1.0.0+1` lub inną docelową wartość.
- [x] Produkcyjne reguły Supabase RLS i migracje moderacji zostały wdrożone.
- [x] Klucz `service_role` nie znajduje się w aplikacji.
- [ ] Zalecane: dodać pełny przepływ resetowania hasła.

## Materiały sklepowe

- [x] Ikona 1024×1024 dla Apple.
- [ ] Ikona 512×512 dla Google Play.
- [ ] Grafika Google Play 1024×500.
- [ ] Aktualne screeny z iPhone’a.
- [ ] Aktualne screeny z Androida.
- [ ] Opisy zostały sprawdzone językowo.
- [ ] Publiczny URL polityki prywatności działa po HTTPS bez błędu certyfikatu.
- [ ] Publiczny URL usuwania konta działa po HTTPS bez błędu certyfikatu.
- [ ] Publiczny URL pomocy działa po HTTPS bez błędu certyfikatu.

## Testy

- [ ] Świeża instalacja na prawdziwym iPhonie.
- [ ] Świeża instalacja na prawdziwym Androidzie.
- [ ] Odmowa lokalizacji nie powoduje awarii.
- [ ] Aparat i galeria działają.
- [ ] Rejestracja i potwierdzenie e-maila działają.
- [ ] Logowanie, wylogowanie i usuwanie konta działają.
- [ ] Tryb gościa działa.
- [ ] Dodawanie miejsca, zdjęcia, oceny i komentarza działa.
- [ ] Aplikacja zachowuje się poprawnie bez internetu.
- [ ] Link do Apple Maps i Google Maps działa.

## Apple

- [ ] Aktywne członkostwo Apple Developer Program.
- [x] Bundle ID: `pl.chcesiku.chcesiku`.
- [ ] Automatyczne podpisywanie w Xcode skonfigurowane.
- [ ] Build przesłany do TestFlight i przetestowany.
- [x] Manifest prywatności i deklaracja szyfrowania są dodane do builda iOS.
- [ ] Formularz App Privacy w App Store Connect odpowiada faktycznemu przepływowi danych.
- [ ] Podano konto testowe i instrukcję dla recenzenta.
- [ ] Uzupełniono klasyfikację wiekową i eksport szyfrowania.

## Google Play

- [ ] Konto i urządzenie właściciela zweryfikowane.
- [ ] Włączone Play App Signing.
- [ ] AAB podpisany produkcyjnym kluczem upload.
- [ ] Docelowy Android API spełnia aktualne wymagania.
- [ ] Formularz Data Safety odpowiada faktycznemu przepływowi danych.
- [ ] Wskazano zewnętrzny URL usuwania konta.
- [ ] Test zamknięty obejmuje co najmniej 12 testerów przez 14 kolejnych dni, jeśli dotyczy konta.
- [ ] Zebrano opis realnego feedbacku do wniosku o dostęp produkcyjny.

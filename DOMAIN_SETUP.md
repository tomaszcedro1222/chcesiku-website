# Podłączenie domeny chcesiku.pl

Docelową domeną strony jest `chcesiku.pl`. Repozytorium zawiera plik `CNAME`, a DNS w nazwa.pl wskazuje na GitHub Pages.

## Zastosowana konfiguracja

| Typ | Nazwa | Wartość | TTL |
|---|---|---|---|
| A | `chcesiku.pl` | `185.199.108.153` | 3600 |
| A | `chcesiku.pl` | `185.199.109.153` | 3600 |
| A | `chcesiku.pl` | `185.199.110.153` | 3600 |
| A | `chcesiku.pl` | `185.199.111.153` | 3600 |
| CNAME | `www.chcesiku.pl` | `tomaszcedro1222.github.io` | 3600 |
| A | `mail.chcesiku.pl` | `85.128.128.104` | 3600 |
| MX | `chcesiku.pl` | `10 mail.chcesiku.pl` | 3600 |

Następnie:

1. W repozytorium GitHub otwórz `Settings` → `Pages`.
2. W polu `Custom domain` wpisz `chcesiku.pl`.
3. Kliknij `Save`.
4. Poczekaj na sprawdzenie DNS.
5. Włącz `Enforce HTTPS`, gdy opcja stanie się aktywna.

GitHub utworzy w repozytorium plik `CNAME`. Jego zawartością powinien być wyłącznie pełny adres domeny, bez `https://`, np.:

```text
chcesiku.pl
```

Docelowe adresy:

```text
https://chcesiku.pl/
https://chcesiku.pl/privacy.html
https://chcesiku.pl/delete-account.html
https://chcesiku.pl/support.html
```

Te trzy ostatnie adresy należy wkleić odpowiednio do App Store Connect i Google Play Console.

# Podłączenie własnej domeny

Strona jest gotowa do działania zarówno pod adresem GitHub Pages, jak i pod własną domeną. Nie dodawaj pliku `CNAME`, dopóki nie wybierzesz ostatecznej domeny.

## Zalecany wariant: subdomena

Najprościej użyć adresu w rodzaju:

```text
chcesiku.pluginsforlife.com
```

W panelu DNS domeny `pluginsforlife.com` dodaj rekord:

| Typ | Nazwa/Host | Wartość/Target | TTL |
|---|---|---|---|
| CNAME | `chcesiku` | `tomaszcedro1222.github.io` | Auto lub 3600 |

Następnie:

1. W repozytorium GitHub otwórz `Settings` → `Pages`.
2. W polu `Custom domain` wpisz `chcesiku.pluginsforlife.com`.
3. Kliknij `Save`.
4. Poczekaj na sprawdzenie DNS.
5. Włącz `Enforce HTTPS`, gdy opcja stanie się aktywna.

GitHub utworzy w repozytorium plik `CNAME`. Jego zawartością powinien być wyłącznie pełny adres domeny, bez `https://`, np.:

```text
chcesiku.pluginsforlife.com
```

## Wariant: domena główna

Jeżeli strona ma działać bezpośrednio jako `pluginsforlife.com`, w DNS trzeba użyć rekordów GitHub Pages dla domeny apex:

| Typ | Nazwa/Host | Wartość |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| AAAA | `@` | `2606:50c0:8000::153` |
| AAAA | `@` | `2606:50c0:8001::153` |
| AAAA | `@` | `2606:50c0:8002::153` |
| AAAA | `@` | `2606:50c0:8003::153` |

Uwaga: domena `pluginsforlife.com` obecnie wskazuje na WordPress/Hostinger. Zmiana rekordów domeny głównej na GitHub Pages wyłączy obecną stronę WordPress. Dlatego bezpieczniejsza jest subdomena `chcesiku.pluginsforlife.com`.

## Po podłączeniu domeny

Zamień adresy `https://tomaszcedro1222.github.io/chcesiku-website/` w plikach:

- `robots.txt`,
- `sitemap.xml`,
- `STORE_LISTING.md`.

Dla subdomeny właściwe adresy będą następujące:

```text
https://chcesiku.pluginsforlife.com/
https://chcesiku.pluginsforlife.com/privacy.html
https://chcesiku.pluginsforlife.com/delete-account.html
https://chcesiku.pluginsforlife.com/support.html
```

Te trzy ostatnie adresy należy wkleić odpowiednio do App Store Connect i Google Play Console.

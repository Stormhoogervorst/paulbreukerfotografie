# Laadmeting mobiel, na de optimalisatie (stap 2)

Zelfde opzet als `scripts/prestatie-voor.md` (`node scripts/meet-prestatie.mjs`, 390 × 844, DPR 2, CPU 4×, Fast 4G, zonder cache, mediaan van 5 runs). Gemeten op een build met: canvas alleen AVIF (miniaturen 600 en 960, lightbox 2200), `BREEDTES_FOTO` 960 en 1440, canvasmarge 0,2 × schermhoogte (120 tot 300 px). De meting gebeurt tegen een lokale server zonder echte netwerkvertraging naast de emulatie: lees de tijden als relatief, niet als absolute veldwaarden.

## LCP en gewicht (Playwright)

| Pagina | LCP voor (ms) | LCP na (ms) | Verzoeken | Totaal KB voor → na | Afbeeldingen KB voor → na | LCP-element na | CLS |
|---|---|---|---|---|---|---|---|
| `/` | 524 | 540 (520-676) | 8 → 8 | 266 → 266 | 155 → 155 | Take me to the river 04-min.Dp_Gm4bU_Z201Xhr.avif | 0 |
| `/fotograaf-bruiloft` | 628 | 640 (624-652) | 9 → 9 | 223 → 223 | 89 → 89 | 01-bruiloft-20.CFhz9I5P_Z1I5Qxx.avif | 0 |
| `/portretfotos` | 684 | 684 (676-692) | 8 → 8 | 277 → 277 | 148 → 148 | _MG_0926.DTZlz7Ix_yQe9o.avif | 0 |
| `/series` | 1020 | 1000 (996-1016) | 9 → 9 | 683 → 683 | 600 → 600 | Take me to the river 06-min.DzPHuWC7_Z1YHJRO.avif | 0 |
| `/love-marriage` | 484 | 520 (508-524) | 11 → 11 | 550 → 837 | 452 → 743 | bruiloft 02-min.DNIaOkcT_Z1YCFKV.avif | 0 |
| `/portfolio` | 528 | 488 (484-488) | 27 → 27 | 1593 → 1914 | 1041 → 1526 | p | 0 |
| `/portfolio/portretten` | 984 | 1136 (1120-1156) | 26 → 26 | 1129 → 1517 | 913 → 1346 | oma en 52.axMX9hRW_Z1LLnEY.avif | 0 |

Opmerkingen:

- `/portfolio`, `/portfolio/portretten` en `/love-marriage` zijn op mobiel zwaarder geworden (afbeeldingen +47%, +47% en +64%). Oorzaak: de kleinste canvasvariant is nu 600 px (was 480) en de projectfoto's springen van 480 en 720 naar 960 px. De LCP blijft ver onder 2,5 s.
- De LCP van `/portfolio` is een tekst (`p`): het canvas laadt de foto's zonder `fetchpriority="high"`.

## Lighthouse (mobiel, standaardinstellingen met gesimuleerde "slow 4G", 1,6 Mbit/s)

Gemeten met `npx lighthouse <url> --form-factor=mobile --only-categories=performance,seo,accessibility` tegen dezelfde statische server. Let op: Lighthouse simuleert een veel tragere verbinding dan de Playwright-meting, daarom liggen de LCP-waarden hier hoger.

| Pagina | Performance | SEO | Accessibility | LCP | CLS |
|---|---|---|---|---|---|
| `/` | 93 | 100 | 100 | 3.2 s | 0 |
| `/fotograaf-bruiloft` | 97 | 100 | 100 | 2.6 s | 0 |
| `/portretfotos` | 95 | 100 | 100 | 2.9 s | 0 |
| `/series` | 98 | 100 | 96 | 2.3 s | 0 |
| `/love-marriage` | 93 | 100 | 100 | 3.2 s | 0 |
| `/portfolio` | 95 | 100 | 100 | 2.4 s | 0 |
| `/portfolio/portretten` | 81 | 100 | 100 | 5.0 s | 0 |

Doelen: LCP onder 2,5 s, Performance 90 of hoger, CLS onder 0,1. CLS en SEO voldoen overal; Performance voldoet op alle pagina's behalve `/portfolio/portretten` (81). LCP onder 2,5 s (Lighthouse, gesimuleerd) halen `/portfolio` (2,4 s) en `/series` (2,3 s); `/`, `/love-marriage` (3,2 s), `/portretfotos` (2,9 s) en `/fotograaf-bruiloft` (2,6 s) niet. `/series` heeft Accessibility 96: een `color-contrast`-melding.

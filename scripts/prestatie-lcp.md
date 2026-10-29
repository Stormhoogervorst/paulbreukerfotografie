# LCP-diagnose en afbeeldingsgewicht op mobiel (29 oktober 2026)

Meting: `node scripts/meet-lighthouse.mjs` (Lighthouse, mobiele standaardsimulatie: Moto G Power, 4× CPU, slow 4G, zonder cache) tegen de statische build via `node scripts/serveer-build.mjs`. De LCP-score is Lantern-gesimuleerd; de uitsplitsing (TTFB, laadvertraging, laadduur, render-vertraging) is waargenomen (ongesimuleerd) en dus in milliseconden van de lokale server. Ruwe uitvoer per pagina: `samenvatting.json` in de uitvoermap (`UIT=…`).

Let op: `serveer-build.mjs` comprimeert nu (brotli of gzip) zoals Vercel dat doet. Zonder compressie leverde het HTML-bestand van `/portfolio` (315 kB) een veel te pessimistische LCP op (2,41 s tegen 1,06 s). De "voor"-kolom hieronder is daarom opnieuw gemeten op de oude code met compressie.

## 1. Diagnose per pagina (voor de wijzigingen)

| Pagina | LCP-element | Bestand (bytes, pixels, getoond) | Vroeg ontdekt? | TTFB / laadvertraging / laadduur / render-vertraging (ms) | Conclusie |
|---|---|---|---|---|---|
| `/` | `img` hero (Take me to the river 04) | 104 895 B, 600×900, 367×550 css px | ja, `fetchpriority="high"` | 14 / 16 / 16 / 43 | Foto, niet render-blocking; bestand redelijk, kleiner kan |
| `/fotograaf-bruiloft` | `img` strookfoto 01-bruiloft-20 | 78 586 B, 960×637, 412×273 | ja, high | 12 / 17 / 14 / 88 | Bestand veel te breed (nodig: 721 px) |
| `/portretfotos` | `img` `_MG_0926` | 134 222 B, 960×1441, 412×618 | ja, high | 11 / 14 / 11 / 51 | Bestand te zwaar voor 412 px breed |
| `/love-marriage` | `img` bruiloft 02 | 96 925 B, 960×637, 367×243 | ja, high | 5 / 9 / 10 / 46 | Bestand veel te breed (nodig: 642 px) |
| `/series` (extra) | `img.kaart__foto` TTTR 06 | 135 716 B, 600×900, 367×550 | nee (`loading="lazy"`), geen high | 14 / 78 / 5 / 31 | Late ontdekking; Performance toch 99 |
| `/portfolio/portretten` | canvas-tegel a001 | 103 609 B, 600×898, 127×190 | in de HTML-lijst wel, geen `fetchpriority="high"` | 8 / 8 / 13 / 43 | Foto 4× te breed; veel concurrerende foto's; gesimuleerde LCP 6,17 s |
| `/portfolio/bruiloften` | canvas-tegel 029d | 46 373 B, 600×400, 130×87 | nee (alleen via JavaScript) | 11 / 39 / 14 / 203 | Late ontdekking en 200 ms render-vertraging; LCP 8,42 s |
| `/portfolio` (extra) | `p.portfolio__hint` (tekst) | n.v.t. | n.v.t. | 11 / n.v.t. / n.v.t. / 46 | Tekst-LCP, Satoshi: zie hieronder |

Geen enkele LCP-foto was render-blocking. De zwakke plekken waren dus te grote bestanden (alle vier de landingspagina's) en bij het canvas de late ontdekking plus concurrentie tussen tegels.

### Lettertype Satoshi (LCP van `/portfolio` is tekst)

- Self-hosted woff2, gewichten 500 en 700, beide gepreload in `BaseLayout.astro`, `font-display: swap`: aanwezig.
- Subset latin: **niet gedaan.** De Satoshi-licentie (`docs/licenties/satoshi-FFL.txt`) verbiedt het aanpassen van de lettertypebestanden; het bestand blijft daarom compleet.
- `size-adjust`-fallback: ontbrak, **toegevoegd** in `src/styles/global.css` (twee `@font-face`-regels "Satoshi Fallback" op `local('Arial')` en `local('Arial Bold')`; waarden gemeten in Chrome: 500: size-adjust 101,5 %, ascent 99,5 %, descent 23,6 %; 700: 97,3 %, 103,8 %, 24,7 %, line-gap 0) en opgenomen in `--font-sans`. CLS bleef 0; `/portfolio` LCP bleef 1,06 s (render-vertraging 46 → 54 ms, binnen de ruis).

## 2. Resultaat na de wijzigingen (definitieve build)

Lighthouse mobiel (Performance / SEO / Accessibility, LCP):

| Pagina | Voor | Na | LCP-bestand voor → na | LCP-uitsplitsing na (TTFB / vertraging / duur / render) |
|---|---|---|---|---|
| `/` | 95 / 100 / 100, 2,94 s | 97 / 100 / 100, 2,63 s | 104 895 → 85 703 B (zelfde 600 px-bronbestand, lagere AVIF-kwaliteit onder 800 px) | 9 / 14 / 10 / 48 |
| `/fotograaf-bruiloft` | 99, 2,19 s | 99, 1,97 s | 78 586 → 42 441 B (960 → 780 px) | 6 / 9 / 11 / 39 |
| `/portretfotos` | 98, 2,41 s | 99, 2,11 s | 134 222 → 69 920 B (960 → 780 px) | 11 / 24 / 22 / 41 |
| `/love-marriage` | 94, 3,08 s | 100, 1,88 s | 96 925 → 41 110 B (960 → 720 px) | 12 / 17 / 8 / 77 |
| `/series` | 99 (a11y 96), 2,18 s | 100 (a11y 100), 1,80 s | 135 716 → 106 687 B | 11 / 41 / 3 / 36 |
| `/portfolio` | 100, 1,06 s | 100, 1,06 s | tekst | 14 / – / – / 54 |
| `/portfolio/portretten` | 78, 6,17 s | 97, 2,56 s | 103 609 → 42 161 B (a001: 600 → 480 px) | 5 / 8 / 12 / 41 (de render-vertraging schommelt tussen runs, 41 tot 204 ms) |
| `/portfolio/bruiloften` | 76, 8,42 s | 96, 2,71 s | 46 373 → 19 059 B (029d: 600 → 480 px) | 5 / 29 / 2 / 184 |

SEO is overal 100 en CLS overal 0, voor en na. Doelen voor `/portfolio/portretten` (Performance ≥ 90 en LCP < 3,0 s): gehaald (97, 2,56 s).

Waarom de gesimuleerde LCP van de canvaspagina's eerst 3,6 s was terwijl de waargenomen LCP ongeveer 100 ms was: Lantern telt in de simulatie alle verzoeken mee die vóór het waargenomen LCP-moment binnen waren. Startten de zes eerste tegels tegelijk, dan telde de simulatie hun bytes allemaal op de gesimuleerde 1,6 Mbit/s mee. Daarom start nu alleen de LCP-tegel (`fetchpriority="high"`); de overige tegels wachten tot die LCP-tegel getekend is (PerformanceObserver; terugval 200 ms na de load van de foto, uiterlijk 3 s) en komen dan, gespreid op afstand tot het midden. Dat levert op het scherm hetzelfde beeld op, een fractie later voor tegel 2 tot 6.

Een proef om de HTML-lijstfoto (`bron="html"`) zelf `fetchpriority="high"` te geven en de LCP-tegel daarop te laten aansluiten verslechterde de LCP (`/portfolio/bruiloften`: Performance 81, LCP 5,12 s), omdat de layout van het script bij een andere schermbreedte een andere tegel kiest dan de server (twee high-verzoeken). Teruggedraaid; de lijstfoto's blijven eager met normale prioriteit (zes stuks) en alleen de LCP-tegel in het script krijgt high.

### Laadmeting mobiel in Playwright (390 px, DPR 2, CPU 4×, Fast 4G, mediaan van 5)

Vergelijking met `scripts/prestatie-voor.md`. Afbeeldingsgewicht:

| Pagina | Voor (KB) | Na (KB) | LCP voor → na (ms) |
|---|---|---|---|
| `/` | 155 | 127 | 524 → 512 |
| `/fotograaf-bruiloft` | 89 | 51 | 628 → 608 |
| `/portretfotos` | 148 | 81 | 684 → 620 |
| `/series` | 600 | 457 | 1020 → 932 |
| `/love-marriage` | 452 | 335 | 484 → 468 |
| `/portfolio` | 1041 | 680 | 528 → 488 |
| `/portfolio/portretten` | 913 | 591 | 984 → 920 |

Op alle zeven pagina's lager dan voor.

## 3. Opmerkingen en afwijkingen

- Hero-breedtes zijn 780, 1280, 1920 en 2560 en niet 720: 390 px × DPR 2 is 780 en 412 px × 1,75 is 721. Een variant van 720 px is dan net te klein, waarna de browser 1280 pakt.
- Projectfoto's `BREEDTES_FOTO = [720, 1280]` (960 en 1440 zijn vervallen om onder 1500 varianten te blijven); series-kaarten `[480, 720, 1280]`; foto van Paul `[200, 400]`.
- `/series`: de LCP-kaart staat nog op `loading="lazy"`. Performance is 100 en LCP 1,8 s, dus niet aangepast.

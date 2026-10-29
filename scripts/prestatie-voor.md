# Laadmeting mobiel, voor de optimalisatie

Gemeten met `scripts/meet-prestatie.mjs` (Playwright, 390 × 844, DPR 2, CPU 4× vertraagd, Fast 4G, zonder cache, mediaan van 5 runs, meting stopt 2 s na het load-event, niet gescrold) tegen de statische build (`scripts/serveer-build.mjs`).

Dit bestand bestond niet toen de optimalisatie begon. De waarden zijn gemeten op de build vóór de variantenreductie (canvas met WebP-fallback en 5 varianten per foto, projectfoto's 480 tot 1920 px); de bronfoto's waren toen al verkleind. De ruwe meting: `scripts/prestatie-voor.json`.

| Pagina | LCP (ms) | Spreiding | LCP-element | Verzoeken | Totaal (KB) | Afbeeldingen (KB) | CLS |
|---|---|---|---|---|---|---|---|
| `/` | 524 | 520-640 | Take me to the river 04-min.Dp_Gm4bU_Z201Xhr.avif | 8 | 266 | 155 | 0 |
| `/fotograaf-bruiloft` | 628 | 620-644 | 01-bruiloft-20.CFhz9I5P_Z1I5Qxx.avif | 9 | 223 | 89 | 0 |
| `/portretfotos` | 684 | 680-692 | _MG_0926.DTZlz7Ix_yQe9o.avif | 8 | 277 | 148 | 0 |
| `/series` | 1020 | 1004-1228 | Take me to the river 06-min.DzPHuWC7_Z1YHJRO.avif | 9 | 683 | 600 | 0 |
| `/love-marriage` | 484 | 472-508 | bruiloft 02-min.DNIaOkcT_1paTR8.avif | 11 | 550 | 452 | 0 |
| `/portfolio` | 528 | 492-580 | p | 27 | 1593 | 1041 | 0 |
| `/portfolio/portretten` | 984 | 968-1008 | oma en 52.axMX9hRW_2nx6ad.avif | 26 | 1129 | 913 | 0 |

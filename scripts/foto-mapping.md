# Foto-mapping: oude bestanden → nieuwe bestanden

Gemaakt met `node scripts/foto-mapping.mjs` (perceptuele dHash, 64 bit). Oude bestanden komen uit git (HEAD) en staan in /tmp/foto-scratch/oud. De vervanger komt altijd uit dezelfde serie (map), zie `scripts/portfolio-inventaris.md`.

Methode: afstand ≤ 10 = "zelfde foto" (nieuwe bewerking), 11–20 = "onzeker", > 20 = "gekozen vervanger" (zelfde oriëntatie, meest vergelijkbare beeldverhouding, dan kleinste afstand). Binnen één pagina komt een foto niet tweemaal voor. Op /portretfotos komen alleen bronnen van minstens 1000 px breed in aanmerking (hero en impressie). Regels met "onzeker" en "gekozen vervanger" staan bovenaan: die moet Paul beoordelen.

Verwijderde of vervangen oude bestanden: 18 (van 67). Oude bestanden die op dezelfde plek zijn blijven staan, zijn niet in de tabel opgenomen.

| Oud bestand (git) | Serie (oud → nieuw) | Nieuw bestand | Methode | Afstand | Beeldverhouding oud → nieuw | Gebruikt voor |
| --- | --- | --- | --- | ---: | --- | --- |
| `Asfalt/L1039810-min-2.jpg` | `Asfalt` → `Asfalt` | `Asfalt/L1039951.jpg` | gekozen vervanger | 21 | 600×900 → 5584×8368 | omslag van de kaart /asfalt op /series; /portfolio (canvas) |
| `Asfalt/L1039998-min-dba42075.jpg` | `Asfalt` → `Asfalt` | `Asfalt/L1062089.jpg` | gekozen vervanger | 24 | 600×900 → 5584×8368 | alt-tekst op de projectpagina (src/data/series.ts); /portfolio (canvas) |
| `asty-mwaka/ASTY 05-min.jpg` | `asty-mwaka` → `asty-mwaka` | `asty-mwaka/036.jpg` | gekozen vervanger | 29 | 600×900 → 2668×4002 | alt-tekst op de projectpagina (src/data/series.ts); /portfolio (canvas) |
| `het-gezicht-van-nijmegen/GEZICHT 08-min.jpg` | `het-gezicht-van-nijmegen` → `het-gezicht-van-nijmegen` | `het-gezicht-van-nijmegen/0017jpg.jpg` | gekozen vervanger | 22 | 1200×800 → 1200×800 | alt-tekst op de projectpagina (src/data/series.ts); /portfolio (canvas) |
| `portretten/Portret 1.jpg` | `portretten` → `portretten` | `portretten/58m.jpg` | gekozen vervanger | 21 | 600×900 → 1036×1575 | impressie 2 van /portretfotos; /portfolio (canvas) |
| `portretten/portret 5.jpg` | `portretten` → `portretten` | `portretten/_MG_0926.jpg` | gekozen vervanger | 22 | 600×900 → 2077×3116 | hero 2 van /portretfotos; /portfolio (canvas) |
| `portretten/PORTRET BEEK 03-min.jpg` | `portretten` → `portretten` | `portretten/_MG_1353.jpg` | gekozen vervanger | 22 | 600×900 → 2574×3861 | impressie 3 van /portretfotos; /portfolio (canvas) |
| `asty-mwaka/ASTY 03-min.jpg` | `asty-mwaka` → `asty-mwaka` | `asty-mwaka/a027.jpg` | onzeker | 18 | 600×900 → 512×768 | alt-tekst op de projectpagina (src/data/series.ts); /portfolio (canvas) |
| `asty-mwaka/ASTY 04-min.jpg` | `asty-mwaka` → `asty-mwaka` | `asty-mwaka/a019.jpg` | onzeker | 16 | 600×900 → 512×768 | alt-tekst op de projectpagina (src/data/series.ts); /portfolio (canvas) |
| `portretten/Portret 2.jpg` | `portretten` → `portretten` | `portretten/DSC04527.jpg` | onzeker | 17 | 600×900 → 5079×7619 | hero 3 van /portretfotos; /portfolio (canvas) |
| `portretten/PORTRET BEEK 08-min.jpg` | `portretten` → `portretten` | `portretten/3.jpg` | onzeker | 20 | 600×900 → 1500×1914 (**18% anders**) | hero 1 van /portretfotos (LCP en Open Graph); /portfolio (canvas) |
| `portretten/PORTRET BEEK 10-min.jpg` | `portretten` → `portretten` | `portretten/107A4529.jpg` | onzeker | 18 | 600×900 → 2880×4320 | impressie 1 van /portretfotos; /portfolio (canvas) |
| `Asfalt/L1039999-min-550ea5c5.jpg` | `Asfalt` → `Asfalt` | `Asfalt/L1039999.jpg` | zelfde foto | 1 | 600×900 → 5584×8368 | alt-tekst op de projectpagina (src/data/series.ts); /portfolio (canvas) |
| `asty-mwaka/ASTY 07-min.jpg` | `asty-mwaka` → `asty-mwaka` | `asty-mwaka/054.jpg` | zelfde foto | 1 | 600×900 → 2880×4320 | alt-tekst op de projectpagina (src/data/series.ts); /portfolio (canvas) |
| `het-gezicht-van-nijmegen/GEZICHT 03-min.jpg` | `het-gezicht-van-nijmegen` → `het-gezicht-van-nijmegen` | `het-gezicht-van-nijmegen/008kl.jpg` | zelfde foto | 2 | 1200×800 → 1200×800 | omslag van de kaart /het-gezicht-van-nijmegen op /series; /portfolio (canvas) |
| `huiskamers/HUISKAMERS 01-min.jpg` | `huiskamers` → `Groeten uit lent` | `Groeten uit lent/HUISKAMERS 01-min.jpg` | zelfde foto | 0 | 1200×800 → 1200×800 | /portfolio (canvas) |
| `huiskamers/HUISKAMERS 05-min.jpg` | `huiskamers` → `Groeten uit lent` | `Groeten uit lent/HUISKAMERS 05-min.jpg` | zelfde foto | 0 | 1200×800 → 1200×800 | /portfolio (canvas) |
| `portretten/PORTRET BEEK 04-min.jpg` | `portretten` → `portretten` | `portretten/107A2934.jpg` | zelfde foto | 1 | 600×900 → 2600×3900 | /portfolio (canvas) |

## Beeldverhouding meer dan 2% anders dan het origineel

- `portretten/PORTRET BEEK 08-min.jpg` → `portretten/3.jpg`: 600×900 → 1500×1914 (18%), onzeker

## Dubbelen op /portfolio

Zelfde foto in meer dan één map (identieke inhoud of dHash-afstand ≤ 2 met bijna gelijke beeldverhouding). De foto in de projectmap blijft, de andere wordt op /portfolio overgeslagen (`src/data/portfolio-dubbelen.json`; opnieuw genereren met dit script na het toevoegen van foto's).

| Overgeslagen | Blijft | Afstand |
| --- | --- | ---: |
| `groeten-uit-lent/breuker lent 07-min.jpg` | `Groeten uit lent/breuker lent 07-min.jpg` | 0 |
| `bruiloften portfolio/006.jpg` | `love-marriage/bruiloft 19-min.jpg` | 2 |
| `bruiloften portfolio/7.jpg` | `love-marriage/bruiloft 19-min.jpg` | 1 |
| `bruiloften portfolio/023t.jpg` | `love-marriage/bruiloft 21-min.jpg` | 1 |
| `bruiloften portfolio/55.jpg` | `love-marriage/bruiloft 09-min.jpg` | 2 |
| `bruiloften portfolio/109.jpg` | `love-marriage/bruiloft 22-min.jpg` | 2 |
| `bruiloften portfolio/123.jpg` | `love-marriage/bruiloft 04-min.jpg` | 1 |
| `bruiloften portfolio/155.jpg` | `bruiloften portfolio/20.jpg` | 1 |
| `bruiloften portfolio/167.jpg` | `bruiloften portfolio/0009e.JPG` | 2 |
| `experimenteel/005 asfalt 2.jpg` | `Asfalt/L1039951.jpg` | 0 |
| `experimenteel/047a.jpg` | `take-me-to-the-river/Take me to the river 08-min.jpg` | 2 |
| `portretten/10-28-2.jpg` | `de-gaarkeuken/Gaarkeuken 03-min.jpg` | 2 |
| `portretten/11-44-2.jpg` | `de-gaarkeuken/Gaarkeuken 09-min.jpg` | 2 |
| `portretten/a031.jpg` | `asty-mwaka/036.jpg` | 0 |

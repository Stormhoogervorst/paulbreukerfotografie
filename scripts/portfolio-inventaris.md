# Inventaris src/assets/portfolio

Gemaakt met `node scripts/portfolio-inventaris.mjs` op 2026-10-29. Bronbestanden zijn niet gewijzigd.

## Locatie

De foto's staan in `src/assets/portfolio/<map>/` (niet in `public/`): ze gaan via `astro:assets` (sharp) door de build. Er is dus geen overlap met een route in `src/pages` (`/portfolio/portretten` is een pagina; de bestanden staan in `src/assets`). Niet-afbeeldingsbestanden (`.DS_Store`) zijn genegeerd (staan in .gitignore).

Totaal nu: 318 afbeeldingsbestanden in 15 mappen, 4110.2 MB. Bij de laatste werkende commit (HEAD): 67 bestanden in 11 mappen.

## Mappen (recursief)

| Map | Classificatie | Aantal | Totaal | Kleinste (px) | Grootste (px) | Opmerking |
| --- | --- | ---: | ---: | --- | --- | --- |
| `Asfalt` | (a) projectmap (asfalt) | 24 | 1187.8 MB | 5472×3648 | 5584×8368 |  |
| `asty-mwaka` | (a) projectmap (asty-mwaka) | 13 | 76.3 MB | 512×768 | 3646×5469 |  |
| `bruiloften portfolio` | (c) nieuwe map | 83 | 631.5 MB | 426×640 | 8504×5648 | 1 × .tif (Astro kent alleen .tiff, zie hieronder) |
| `de-gaarkeuken` | (a) projectmap (de-gaarkeuken) | 14 | 2.0 MB | 599×900 | 600×900 |  |
| `experimenteel` | (c) nieuwe map | 25 | 738.2 MB | 849×1280 | 9933×14043 | 1 × .tif (Astro kent alleen .tiff, zie hieronder) |
| `Groeten uit lent` | (a) projectmap (groeten-uit-lent) | 7 | 1.9 MB | 1200×800 | 1200×800 |  |
| `groeten-uit-lent` | (a) projectmap (groeten-uit-lent) | 2 | 0.5 MB | 1200×800 | 1200×800 |  |
| `het-gezicht-van-nijmegen` | (a) projectmap (het-gezicht-van-nijmegen) | 7 | 6.6 MB | 1200×800 | 1200×800 |  |
| `love-marriage` | (a) projectmap (love-marriage) | 16 | 4.5 MB | 1200×796 | 2000×1334 |  |
| `oostblok reportage` | (c) nieuwe map | 12 | 59.8 MB | 1575×1041 | 5654×3767 | 1 × .tif (Astro kent alleen .tiff, zie hieronder) |
| `oude honden` | (c) nieuwe map | 13 | 64.3 MB | 1600×1066 | 6144×4096 |  |
| `portretten` | (b) portretmap | 82 | 1330.6 MB | 412×607 | 8607×10885 | 4 × .tif (Astro kent alleen .tiff, zie hieronder) |
| `promoties` | (c) nieuwe map | 1 | 1.0 MB | 1200×800 | 1200×800 |  |
| `take-me-to-the-river` | (a) projectmap (take-me-to-the-river) | 9 | 1.3 MB | 599×900 | 600×900 |  |
| `tradities` | (a) projectmap (tradities) | 10 | 3.9 MB | 1300×530 | 1300×530 |  |

### Nieuwe mappen (c)

- `bruiloften portfolio`: 82 foto's (+ 1 .tif) — echt nieuw
- `experimenteel`: 24 foto's (+ 1 .tif) — echt nieuw
- `oostblok reportage`: 11 foto's (+ 1 .tif) — echt nieuw
- `oude honden`: 13 foto's (+ 0 .tif) — echt nieuw
- `promoties`: 1 foto's (+ 0 .tif) — bestond al in HEAD (geen project; alleen op /portfolio)

Deze mappen leveren alleen foto's voor `/portfolio`. Ze worden geen project, pagina of kaart: een project bestaat pas als het in `src/data/series.ts` staat.

## Oude situatie (git HEAD) en koppeling oude map → nieuwe map

| Oude map | Aantal oud | Nieuwe map | Hoe | Verdeling van de terugkerende foto's (hash-afstand ≤ 10) |
| --- | ---: | --- | --- | --- |
| `Asfalt` | 3 | `Asfalt` | zelfde mapnaam | 1× `Asfalt` |
| `asty-mwaka` | 4 | `asty-mwaka` | zelfde mapnaam | 1× `asty-mwaka` |
| `de-gaarkeuken` | 14 | `de-gaarkeuken` | zelfde mapnaam | 14× `de-gaarkeuken` |
| `groeten-uit-lent` | 2 | `Groeten uit lent` | zelfde mapnaam (andere schrijfwijze) | 1× `groeten-uit-lent`, 1× `Groeten uit lent` |
| `het-gezicht-van-nijmegen` | 2 | `het-gezicht-van-nijmegen` | zelfde mapnaam | 1× `het-gezicht-van-nijmegen` |
| `huiskamers` | 2 | `Groeten uit lent` | meeste foto's terug (hernoemd of samengevoegd) | 2× `Groeten uit lent` |
| `love-marriage` | 13 | `love-marriage` | zelfde mapnaam | 13× `love-marriage` |
| `portretten` | 7 | `portretten` | zelfde mapnaam | 1× `portretten` |
| `promoties` | 1 | `promoties` | zelfde mapnaam | 1× `promoties` |
| `take-me-to-the-river` | 9 | `take-me-to-the-river` | zelfde mapnaam | 9× `take-me-to-the-river` |
| `tradities` | 10 | `tradities` | zelfde mapnaam | 10× `tradities` |

### Hernoemd, samengevoegd of nieuw

- `groeten-uit-lent` → `Groeten uit lent` (zelfde naam, andere schrijfwijze).
- `huiskamers` → `Groeten uit lent` (hernoemd of samengevoegd).
- Oude map `huiskamers` bestaat niet meer.
- Nieuw: `bruiloften portfolio`.
- Nieuw: `experimenteel`.
- Nieuw: `oostblok reportage`.
- Nieuw: `oude honden`.

## Wat is er van de oude bestanden geworden?

| Oud bestand | Staat nog op dezelfde plek | Inhoud (SHA-1) elders |
| --- | --- | --- |
| `Asfalt/L1039810-min-2.jpg` | nee (verwijderd) | nee |
| `Asfalt/L1039998-min-dba42075.jpg` | nee (verwijderd) | nee |
| `Asfalt/L1039999-min-550ea5c5.jpg` | nee (verwijderd) | nee |
| `asty-mwaka/ASTY 03-min.jpg` | nee (verwijderd) | nee |
| `asty-mwaka/ASTY 04-min.jpg` | nee (verwijderd) | nee |
| `asty-mwaka/ASTY 05-min.jpg` | nee (verwijderd) | nee |
| `asty-mwaka/ASTY 07-min.jpg` | nee (verwijderd) | nee |
| `het-gezicht-van-nijmegen/GEZICHT 03-min.jpg` | nee (verwijderd) | nee |
| `het-gezicht-van-nijmegen/GEZICHT 08-min.jpg` | nee (verwijderd) | nee |
| `huiskamers/HUISKAMERS 01-min.jpg` | nee (verwijderd) | `Groeten uit lent/HUISKAMERS 01-min.jpg` |
| `huiskamers/HUISKAMERS 05-min.jpg` | nee (verwijderd) | `Groeten uit lent/HUISKAMERS 05-min.jpg` |
| `portretten/PORTRET BEEK 03-min.jpg` | nee (verwijderd) | nee |
| `portretten/PORTRET BEEK 04-min.jpg` | nee (verwijderd) | nee |
| `portretten/PORTRET BEEK 08-min.jpg` | nee (verwijderd) | nee |
| `portretten/PORTRET BEEK 10-min.jpg` | nee (verwijderd) | nee |
| `portretten/Portret 1.jpg` | nee (verwijderd) | nee |
| `portretten/Portret 2.jpg` | nee (verwijderd) | nee |
| `portretten/portret 5.jpg` | nee (verwijderd) | nee |

## Waarschuwing: zware afbeeldingen

Regel: geoptimaliseerde bestanden in de repo (meer dan 1.5 MB of breder dan 4000 px is opvallend zwaar). Bronbestanden zijn niet aangepast; de build maakt er wel kleine varianten van, maar de repo wordt groot en de build traag. Verkleinen vóór livegang (zie README).

| Map | Bestanden | Waarvan zwaar | Zwaarste bestand | Totaal |
| --- | ---: | ---: | --- | ---: |
| `Asfalt` | 24 | 24 | `L1039989.jpg` (57.3 MB, 5584×8368) | 1187.8 MB |
| `asty-mwaka` | 13 | 11 | `a025.jpg` (10.7 MB, 3646×5469) | 76.3 MB |
| `bruiloften portfolio` | 83 | 57 | `20.jpg` (26.6 MB, 3684×5526) | 631.5 MB |
| `de-gaarkeuken` | 14 | 0 | `Gaarkeuken 07-min.jpg` (0.2 MB, 600×900) | 2.0 MB |
| `experimenteel` | 25 | 24 | `asfalt 1.jpg` (137.8 MB, 9933×14043) | 738.2 MB |
| `Groeten uit lent` | 7 | 0 | `breuker lent 07-min.jpg` (0.3 MB, 1200×800) | 1.9 MB |
| `groeten-uit-lent` | 2 | 0 | `breuker lent 07-min.jpg` (0.3 MB, 1200×800) | 0.5 MB |
| `het-gezicht-van-nijmegen` | 7 | 0 | `0016.jpg` (1.0 MB, 1200×800) | 6.6 MB |
| `love-marriage` | 16 | 0 | `bruiloft 22-min.jpg` (1.0 MB, 2000×1333) | 4.5 MB |
| `oostblok reportage` | 12 | 4 | `115.tif` (18.8 MB, 5366×3681) | 59.8 MB |
| `oude honden` | 13 | 11 | `205.jpg` (21.3 MB, 6144×4096) | 64.3 MB |
| `portretten` | 82 | 70 | `trees+joris.jpg` (57.6 MB, 6302×9453) | 1330.6 MB |
| `promoties` | 1 | 0 | `PROMOTIES 18.jpg` (1.0 MB, 1200×800) | 1.0 MB |
| `take-me-to-the-river` | 9 | 0 | `Take me to the river 15-min.jpg` (0.2 MB, 600×900) | 1.3 MB |
| `tradities` | 10 | 0 | `breuker tradities 18-min.jpg` (0.5 MB, 1300×530) | 3.9 MB |

<details><summary>Alle 201 zware bestanden</summary>

| Pad | Grootte | Afmeting |
| --- | ---: | --- |
| `experimenteel/asfalt 1.jpg` | 137.8 MB | 9933×14043 |
| `experimenteel/DSC04039.jpg` | 64.5 MB | 6336×9504 |
| `experimenteel/DSC04091.jpg` | 61.4 MB | 6336×9504 |
| `portretten/trees+joris.jpg` | 57.6 MB | 6302×9453 |
| `Asfalt/L1039989.jpg` | 57.3 MB | 5584×8368 |
| `experimenteel/047a.tif` | 56.7 MB | 3632×5456 |
| `Asfalt/L1039914.jpg` | 55.6 MB | 5584×8368 |
| `Asfalt/L1040017.jpg` | 54.3 MB | 8368×5584 |
| `portretten/mf-19 (7).jpg` | 54.3 MB | 8607×10885 |
| `portretten/DSC03479-2.jpg` | 54.2 MB | 6336×9504 |
| `Asfalt/L1039983.jpg` | 54.1 MB | 5584×8368 |
| `portretten/DSC03609-2.jpg` | 53.8 MB | 6325×9488 |
| `Asfalt/L1039999.jpg` | 53.4 MB | 5584×8368 |
| `Asfalt/L1039949.jpg` | 53.3 MB | 5584×8368 |
| `Asfalt/L1039991.jpg` | 53.0 MB | 5584×8368 |
| `portretten/DSC03654-2.jpg` | 52.9 MB | 5673×8510 |
| `portretten/mf-21 (17)47.jpg` | 52.5 MB | 8576×10785 |
| `portretten/DSC05053.jpg` | 52.1 MB | 6336×9504 |
| `Asfalt/L1062161.jpg` | 52.0 MB | 5584×8368 |
| `Asfalt/L1062121.jpg` | 51.9 MB | 5578×8367 |
| `experimenteel/023.jpg` | 51.5 MB | 5584×8368 |
| `Asfalt/L1039970.jpg` | 51.4 MB | 5584×8368 |
| `Asfalt/L1039953.jpg` | 51.1 MB | 5584×8368 |
| `Asfalt/L1062133.jpg` | 50.9 MB | 5584×8368 |
| `Asfalt/L1062117.jpg` | 50.7 MB | 5584×8368 |
| `portretten/beppy.jpg` | 50.7 MB | 6183×9274 |
| `Asfalt/L1062089.jpg` | 50.3 MB | 5584×8368 |
| `Asfalt/L1040007.jpg` | 50.3 MB | 5584×8368 |
| `Asfalt/L1039951.jpg` | 49.4 MB | 5584×8368 |
| `experimenteel/005 asfalt 2.jpg` | 49.4 MB | 5584×8368 |
| `Asfalt/L1062143.jpg` | 49.1 MB | 5290×7934 |
| `experimenteel/052.jpg` | 48.7 MB | 5995×8992 |
| `Asfalt/L1039939.jpg` | 47.6 MB | 5584×8368 |
| `Asfalt/L1062111.jpg` | 47.4 MB | 5584×8368 |
| `portretten/19269.jpg` | 47.3 MB | 7268×10903 |
| `Asfalt/L1039994.jpg` | 46.8 MB | 5584×8368 |
| `Asfalt/L1039954.jpg` | 46.6 MB | 5584×8368 |
| `portretten/DSC03808.jpg` | 46.5 MB | 6025×9037 |
| `Asfalt/L1062166.jpg` | 45.4 MB | 5322×8160 |
| `experimenteel/L1126319.jpg` | 45.0 MB | 8368×5578 |
| `Asfalt/L1039807.jpg` | 44.8 MB | 4806×7209 |
| `portretten/Bo.jpg` | 43.6 MB | 5315×7972 |
| `portretten/23066.jpg` | 39.0 MB | 7248×10871 |
| `portretten/DSC08072.jpg` | 37.3 MB | 5273×7910 |
| `portretten/01070.jpg` | 35.8 MB | 6517×9777 |
| `portretten/teije 2.jpg` | 35.7 MB | 5474×8211 |
| `experimenteel/009.jpg` | 34.1 MB | 8344×5563 |
| `portretten/DSC03911.jpg` | 33.5 MB | 4985×7478 |
| `portretten/josephine.jpg` | 32.7 MB | 5792×8688 |
| `portretten/22366.jpg` | 32.2 MB | 6758×10136 |
| `portretten/neg-002b 2.jpg` | 30.2 MB | 3704×5557 |
| `bruiloften portfolio/20.jpg` | 26.6 MB | 3684×5526 |
| `portretten/DSC06109.jpg` | 25.1 MB | 4549×6824 |
| `bruiloften portfolio/6733p.jpg` | 25.0 MB | 9152×3759 |
| `portretten/aart.jpg` | 25.0 MB | 4549×6824 |
| `experimenteel/eind.jpg` | 24.1 MB | 5285×5285 |
| `portretten/DSC08165.jpg` | 24.0 MB | 4475×6712 |
| `portretten/DSC08230.jpg` | 22.8 MB | 4259×6389 |
| `bruiloften portfolio/17-06 (9A-10-10A)81.jpg` | 22.2 MB | 9210×3762 |
| `bruiloften portfolio/c18.jpg` | 22.0 MB | 9181×3727 |
| `experimenteel/018.jpg` | 21.6 MB | 4000×4949 |
| `bruiloften portfolio/023t.jpg` | 21.5 MB | 8504×5648 |
| `oude honden/205.jpg` | 21.3 MB | 6144×4096 |
| `Asfalt/DSC01106.jpg` | 21.1 MB | 5472×3648 |
| `experimenteel/010.jpg` | 20.4 MB | 8368×5584 |
| `portretten/_MG_2665.jpg` | 20.3 MB | 3744×5616 |
| `bruiloften portfolio/0020a.jpg` | 20.3 MB | 3667×5500 |
| `oostblok reportage/115.tif` | 18.8 MB | 5366×3681 |
| `portretten/dia-007.jpg` | 16.3 MB | 3862×5748 |
| `bruiloften portfolio/127.jpg` | 16.3 MB | 5595×3730 |
| `portretten/DSC04527.jpg` | 16.0 MB | 5079×7619 |
| `experimenteel/030.jpg` | 15.7 MB | 3648×5472 |
| `bruiloften portfolio/95.jpg` | 15.6 MB | 3744×2598 |
| `bruiloften portfolio/55.jpg` | 15.6 MB | 5789×3859 |
| `bruiloften portfolio/083.jpg` | 15.1 MB | 5594×3729 |
| `portretten/04-7A-2.jpg` | 14.6 MB | 3652×5484 |
| `portretten/05-17A-2.jpg` | 14.5 MB | 3574×5367 |
| `bruiloften portfolio/40.jpg` | 13.8 MB | 3702×5553 |
| `bruiloften portfolio/bruiloft1a.tif` | 13.6 MB | 2609×1819 |
| `oostblok reportage/159.jpg` | 13.5 MB | 5654×3767 |
| `portretten/a007.jpg` | 13.3 MB | 3725×5623 |
| `bruiloften portfolio/81.JPG` | 13.3 MB | 4368×2912 |
| `bruiloften portfolio/0009e.JPG` | 13.3 MB | 2912×4368 |
| `bruiloften portfolio/109.jpg` | 13.0 MB | 5633×3755 |
| `portretten/_MG_7443.jpg` | 12.8 MB | 4096×6144 |
| `oude honden/026.jpg` | 12.7 MB | 4370×2913 |
| `bruiloften portfolio/029d.jpg` | 12.7 MB | 5570×3713 |
| `experimenteel/029.jpg` | 12.6 MB | 3648×5472 |
| `bruiloften portfolio/108.jpg` | 12.6 MB | 5625×3750 |
| `portretten/a001.jpg` | 12.5 MB | 3746×5607 |
| `portretten/a004.jpg` | 12.5 MB | 5611×3684 |
| `portretten/a006.jpg` | 12.5 MB | 3754×5659 |
| `oostblok reportage/161.jpg` | 12.4 MB | 5267×3511 |
| `portretten/blad-07-06 (20A-21)1.jpg` | 12.4 MB | 3729×5632 |
| `bruiloften portfolio/39.jpg` | 12.3 MB | 3750×5625 |
| `experimenteel/008.JPG` | 12.3 MB | 3632×5456 |
| `experimenteel/086.jpg` | 12.2 MB | 2980×3424 |
| `bruiloften portfolio/0007a.JPG` | 12.2 MB | 2912×4368 |
| `experimenteel/087.jpg` | 12.0 MB | 2976×3464 |
| `experimenteel/088.jpg` | 12.0 MB | 3188×3668 |
| `bruiloften portfolio/112.JPG` | 11.9 MB | 4368×2912 |
| `experimenteel/047.jpg` | 11.9 MB | 3129×5315 |
| `bruiloften portfolio/0012.JPG` | 11.8 MB | 2912×4368 |
| `bruiloften portfolio/0047.jpg` | 11.8 MB | 4368×2912 |
| `portretten/09-09-2.jpg` | 11.8 MB | 3352×5033 |
| `bruiloften portfolio/79.jpg` | 11.8 MB | 4368×2912 |
| `portretten/a011.jpg` | 11.7 MB | 3710×5622 |
| `bruiloften portfolio/0006.jpg` | 11.7 MB | 2912×4368 |
| `bruiloften portfolio/123.jpg` | 11.6 MB | 4368×2912 |
| `portretten/a010.jpg` | 11.6 MB | 3754×5620 |
| `portretten/a012.jpg` | 11.5 MB | 3722×5637 |
| `portretten/11-44-2.jpg` | 11.4 MB | 3302×4952 |
| `portretten/DSC04309.jpg` | 11.3 MB | 5117×7676 |
| `bruiloften portfolio/DSC03653.jpg` | 11.3 MB | 5472×3648 |
| `portretten/blad-08-15 (40-40A)3.jpg` | 11.3 MB | 3763×5651 |
| `bruiloften portfolio/0012a.JPG` | 11.2 MB | 2912×4368 |
| `portretten/45.tif` | 11.0 MB | 2815×4085 |
| `bruiloften portfolio/0007.JPG` | 10.9 MB | 2912×4368 |
| `bruiloften portfolio/0018.JPG` | 10.9 MB | 2912×4368 |
| `bruiloften portfolio/0024c.JPG` | 10.8 MB | 2912×4368 |
| `asty-mwaka/a025.jpg` | 10.7 MB | 3646×5469 |
| `bruiloften portfolio/18.jpg` | 10.6 MB | 4368×2912 |
| `portretten/10-28-2.jpg` | 10.2 MB | 3152×4727 |
| `bruiloften portfolio/15.JPG` | 10.1 MB | 4368×2912 |
| `bruiloften portfolio/0016a.jpg` | 10.0 MB | 2912×4368 |
| `asty-mwaka/054.jpg` | 9.4 MB | 2880×4320 |
| `bruiloften portfolio/107A1262.jpg` | 9.2 MB | 4320×2880 |
| `bruiloften portfolio/107A9256.jpg` | 9.2 MB | 4560×3120 |
| `experimenteel/021.ljpg.jpg` | 8.8 MB | 2908×4096 |
| `bruiloften portfolio/0029.jpg` | 8.7 MB | 2240×3360 |
| `asty-mwaka/040.jpg` | 8.4 MB | 2520×3780 |
| `bruiloften portfolio/80.JPG` | 8.3 MB | 4368×2912 |
| `bruiloften portfolio/DSC04464.jpg` | 7.9 MB | 5472×3648 |
| `asty-mwaka/a023.jpg` | 7.8 MB | 2416×3624 |
| `bruiloften portfolio/7.jpg` | 7.7 MB | 5646×3764 |
| `experimenteel/032.jpg` | 7.6 MB | 3258×4886 |
| `portretten/DSC08946.JPG` | 7.2 MB | 3648×5472 |
| `experimenteel/001.jpg` | 7.1 MB | 3798×1888 |
| `portretten/107A2013.jpg` | 7.0 MB | 2451×3677 |
| `portretten/DSC08944.JPG` | 7.0 MB | 3648×5472 |
| `bruiloften portfolio/0031a.jpg` | 6.9 MB | 1869×2763 |
| `bruiloften portfolio/0009c.JPG` | 6.7 MB | 2112×3168 |
| `bruiloften portfolio/DSC02797.jpg` | 6.7 MB | 3500×2333 |
| `asty-mwaka/005.jpg` | 6.7 MB | 2444×3667 |
| `bruiloften portfolio/0006a.JPG` | 6.6 MB | 2112×3168 |
| `asty-mwaka/107A5637.jpg` | 6.5 MB | 2878×4317 |
| `asty-mwaka/036.jpg` | 6.5 MB | 2668×4002 |
| `bruiloften portfolio/0013.jpg` | 6.4 MB | 2912×4368 |
| `portretten/DSC09096.JPG` | 6.3 MB | 3648×5472 |
| `asty-mwaka/037.jpg` | 6.3 MB | 2523×3784 |
| `portretten/107A4529.jpg` | 6.3 MB | 2880×4320 |
| `oude honden/grootlinks.JPG` | 6.2 MB | 4332×2888 |
| `bruiloften portfolio/0001.JPG` | 6.1 MB | 2112×3168 |
| `portretten/DSC09106.JPG` | 5.9 MB | 3648×5472 |
| `asty-mwaka/bruiloft kapselkoningin Asty, .jpg` | 5.9 MB | 2500×3748 |
| `bruiloften portfolio/42.jpg` | 5.9 MB | 2292×3543 |
| `bruiloften portfolio/107.jpg` | 5.7 MB | 1772×1162 |
| `asty-mwaka/032.jpg` | 5.7 MB | 2283×3424 |
| `portretten/107A204635.jpg` | 5.6 MB | 2311×3467 |
| `oude honden/141.jpg` | 5.6 MB | 4370×2911 |
| `portretten/DSC09109.JPG` | 5.6 MB | 3648×5472 |
| `oostblok reportage/115.jpg` | 5.5 MB | 5366×3681 |
| `bruiloften portfolio/0009d.JPG` | 5.5 MB | 2048×3072 |
| `portretten/107A2934.jpg` | 5.5 MB | 2600×3900 |
| `bruiloften portfolio/DSC03056.jpg` | 5.4 MB | 3500×2333 |
| `experimenteel/078.jpg` | 5.4 MB | 2683×3830 |
| `bruiloften portfolio/2a.jpg` | 5.4 MB | 2226×3490 |
| `bruiloften portfolio/0016.jpg` | 5.3 MB | 1848×2801 |
| `portretten/oma en 52.tif` | 5.2 MB | 1070×1682 |
| `portretten/_MG_0926.jpg` | 5.1 MB | 2077×3116 |
| `bruiloften portfolio/19.jpg` | 5.1 MB | 2557×1709 |
| `portretten/107A8379.jpg` | 4.9 MB | 2580×3870 |
| `portretten/DSC07678-2.jpg` | 4.9 MB | 2333×3500 |
| `bruiloften portfolio/0014.jpg` | 4.7 MB | 1860×2813 |
| `bruiloften portfolio/0032c.JPG` | 4.7 MB | 2912×4368 |
| `portretten/DSC07743-2.jpg` | 4.6 MB | 2333×3500 |
| `portretten/DSC07644-2.jpg` | 4.6 MB | 2333×3500 |
| `experimenteel/047a.jpg` | 4.6 MB | 3632×5456 |
| `portretten/45.jpg` | 4.3 MB | 2815×4085 |
| `portretten/DSC02372.jpg` | 4.2 MB | 2333×3500 |
| `portretten/DSC02275.jpg` | 4.0 MB | 2333×3500 |
| `bruiloften portfolio/0003a.jpg` | 3.7 MB | 2510×3600 |
| `portretten/DSC02234.jpg` | 3.6 MB | 2333×3500 |
| `portretten/R1177878-2.jpg` | 3.6 MB | 3264×2176 |
| `oude honden/IMG_7240.JPG` | 3.5 MB | 3072×2048 |
| `bruiloften portfolio/0010.JPG` | 3.4 MB | 2048×3072 |
| `portretten/_MG_1353.jpg` | 3.2 MB | 2574×3861 |
| `portretten/DSC07080.jpg` | 3.1 MB | 1754×2631 |
| `bruiloften portfolio/120.jpg` | 3.0 MB | 3072×2048 |
| `portretten/2m.tif` | 2.8 MB | 1510×1927 |
| `oude honden/rechts7.jpg` | 2.8 MB | 1546×2318 |
| `portretten/3.tif` | 2.7 MB | 1500×1914 |
| `oude honden/86.jpg` | 2.3 MB | 1600×1067 |
| `portretten/tled-1.jpg` | 2.1 MB | 2362×2287 |
| `portretten/led-15.jpg` | 2.1 MB | 1819×2080 |
| `asty-mwaka/004 2.jpg` | 2.0 MB | 1280×1920 |
| `oude honden/78.jpg` | 2.0 MB | 1600×1066 |
| `portretten/1018.jpg` | 2.0 MB | 2264×2896 |
| `oude honden/82.jpg` | 1.8 MB | 1600×1067 |
| `oude honden/file02082.JPG` | 1.7 MB | 3072×2048 |
| `oude honden/77.jpg` | 1.6 MB | 1600×1066 |

</details>

## `.tif`-bestanden

Astro (sharp) herkent `.tiff`, niet `.tif`: zulke bestanden worden door de glob niet gevonden en zijn dus onzichtbaar voor de site. Naast elke `.tif` staat daarom een `.jpg` met dezelfde naam (met `sips` geconverteerd, kwaliteit 92, zelfde afmetingen); de `.tif` blijft ongemoeid en ongebruikt staan.

- `bruiloften portfolio/bruiloft1a.tif` (13.6 MB, 2609×1819)
- `experimenteel/047a.tif` (56.7 MB, 3632×5456)
- `oostblok reportage/115.tif` (18.8 MB, 5366×3681)
- `portretten/2m.tif` (2.8 MB, 1510×1927)
- `portretten/3.tif` (2.7 MB, 1500×1914)
- `portretten/45.tif` (11.0 MB, 2815×4085)
- `portretten/oma en 52.tif` (5.2 MB, 1070×1682)

## Bestanden die Paul.* of paul.* heten (uitgesloten van /portfolio)

Geen gevonden. De uitsluiting (`/^paul[^/]*$/i` op de bestandsnaam) staat wel in `src/data/portfolio.ts`.

## Identieke bestanden (zelfde SHA-1) in meer dan één map

- `Asfalt/L1039951.jpg` = `experimenteel/005 asfalt 2.jpg`
- `Groeten uit lent/breuker lent 07-min.jpg` = `groeten-uit-lent/breuker lent 07-min.jpg`

Perceptuele dubbelen (andere bewerking van dezelfde foto) staan in `scripts/foto-mapping.md` onder "Dubbelen op /portfolio".

## Bestanden die er niet uitzien als werk

Gezocht op bestandsnaam (cover, omslag, logo, screenshot, scherm, boek, banner, icon):

- Geen op naam.

Visuele controle: zie "Handmatige bevindingen" hieronder.

## Handmatige bevindingen

Visueel gecontroleerd (contactbladen van alle foto's buiten `portretten/`; de portretten zijn eerder bekeken). Paul beslist; alles is wel meegenomen op /portfolio.

**Geen boekomslagen, logo's of schermafbeeldingen gevonden** (ook niet op bestandsnaam). Wel dit, dat er niet uitziet als fotografisch werk of dat een vraag oproept:

- `experimenteel/` bevat foto's van schilderijen en tekeningen: `001.jpg`, `018.jpg`, `021.ljpg.jpg` (let op de bestandsnaam: `.ljpg.jpg`), `032.jpg`, `078.jpg` en de drie schilderachtige gezichten `086.jpg`, `087.jpg`, `088.jpg`. Ik weet niet of dit Pauls eigen werk is en of het op /portfolio hoort.
- `experimenteel/` bevat ook losse natuurbeelden en abstracte beelden: `009.jpg`, `010.jpg` (schapen), `029.jpg`, `030.jpg` (boomstammen), `eind.jpg` (plant), `047.jpg`, `052.jpg` (abstract zwart-wit), `060.JPG` (portret in een schilderachtige tint, 849 × 1280 px).
- `experimenteel/008.JPG` en `experimenteel/047a.jpg` laten dezelfde soort beelden zien als Take me to the river (laadruim van een binnenvaartschip); `047a.jpg` is een perceptuele dubbel van `take-me-to-the-river/Take me to the river 08-min.jpg` (zie dubbelen).
- `oostblok reportage/115.jpg` toont een poortgebouw met zuilen achter een muur vol graffiti; plaats en jaar ontbreken (TODO(paul) in `src/data/alt-teksten.ts`).
- `promoties/PROMOTIES 18.jpg` is een foto uit de promotiefotografie (verwijst naar de Radboud-site); op /portfolio zonder link, want `/promoties` is geen pagina op deze site.
- `portretten/01_xusXd__please_credit[palette.fm].jpg` vraagt in de bestandsnaam om een credit aan palette.fm (kleurbewerking) en is maar 412 × 607 px.
- Kleine bronnen (onder 1000 px breed buiten de oude `-min`-bestanden): `portretten/a028.jpg`, `portretten/a031.jpg`, `asty-mwaka/a019.jpg`, `asty-mwaka/a027.jpg` (512 × 768), `portretten/DSC05220-2.jpg` (600 × 900), `portretten/Johan als Nar (1).jpg` (788 × 1181) en `experimenteel/060.JPG`.
- `.DS_Store`-bestanden in vier mappen: genegeerd (staan in .gitignore).
- `Groeten uit lent/` (met spaties) en `groeten-uit-lent/` zijn twee mappen van hetzelfde project; de eerste bevat ook de oude `huiskamers`-foto's.

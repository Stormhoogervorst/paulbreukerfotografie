# paulbreuker.nl

Website voor fotograaf Paul Breuker (Nijmegen). Astro 7 (TypeScript strict) op Vercel, statische output. Projectregels: `.cursor/rules/paulbreuker-regels.mdc`. Detailplan: `docs/seo-architectuur.md`.

Status: technisch skelet plus **header, hero, "(over paul)", "Projecten", "Diensten" en een fotospread** van de homepage (in die volgorde) (`src/pages/index.astro`, content in `src/data/home.ts`). De overige homepage-secties staan bewust niet op de pagina (vorige versie: `design/archief/`). Overige pagina's volgen.

## Scripts

| Script | Doel |
| :-- | :-- |
| `npm run dev` | Dev-server op `localhost:4321` |
| `npm run build` | Productiebuild naar `dist/` (en `.vercel/output`) |
| `npm run preview` | Build lokaal bekijken |
| `npm run check` | `astro check` (TypeScript en Astro-diagnostiek) |

Marquee-test (WebKit en Chromium, mobiele emulatie): `npm run build`, dan `npm run preview` in een tweede terminal, daarna `node scripts/marquee-test.mjs`. Eenmalig nodig: `npx playwright install webkit chromium`. Het script draait op iPhone 14 (WebKit) en Pixel 7 (Chromium) zes controles: stilstand zonder scrollen, meescrollen (300 px), terugscrollen, naadloze wrap, `prefers-reduced-motion: reduce` en zonder JavaScript. Het print een tabel en faalt met exit-code 1 als een controle mislukt. WebKit start niet in een gesandboxte omgeving (Cursor-agent); draai het dan buiten de sandbox.

## Structuur

```text
src/
├── components/
│   ├── SEOHead.astro      title, description, canonical, robots, OG, Twitter, JSON-LD
│   ├── JsonLd.astro       <script type="application/ld+json">, één per node
│   ├── Header.astro       desktop: 3 kolommen (wordmark, contact, navigatie; socials alleen in de footer); mobiel: <details>-menu (geen JavaScript)
│   ├── Footer.astro       drie lagen: tekstblok + navigatie, wordmark (cqw, marge tot marge), contactregel
│   ├── BeeldDuo.astro     fotospread (twee foto's, geen tekst) onder Diensten, laatste sectie
│   ├── Marquee.astro      gedeelde titelbalk (scroll-gekoppeld, klein inline script; zonder JS statisch) voor Projecten, Diensten en Exposities
│   └── ContactLinks.astro telefoon en e-mail als tekst met tel:/mailto:
├── layouts/BaseLayout.astro   <html lang="nl">, skip-link, header, <main>, footer
├── data/
│   ├── home.ts            teksten homepage
│   └── site.ts            bron voor header en footer: sitegegevens, contact, socials, navigatie, footertekst, @id's
├── lib/schema.ts          getypeerde JSON-LD-helpers
├── pages/                 index, 404, robots.txt.ts
└── styles/global.css      CSS-variabelen en basisstijl
vercel.json                redirects
```

- `title` en `description` zijn verplichte props van `BaseLayout`/`SEOHead` zonder standaardwaarde. Ontbreken ze, dan geeft `astro check` een fout en faalt `astro build`.
- `WebSite`-JSON-LD staat automatisch op elke pagina. Andere nodes geef je mee via `jsonLd={[...]}`.
- `/bedankt` en `/404` zijn `noindex` en staan niet in de sitemap (filter in `astro.config.mjs`). Voeg nieuwe niet-indexeerbare pagina's toe aan `NOT_INDEXABLE` en geef ze `noindex`.
- Lettertype: Satoshi (Fontshare, ITF Free Font License), gewichten 500 (tekst, navigatie) en 700 (wordmark, koppen). Self-hosted als WOFF2 in `src/assets/fonts/`, **onaangepaste** bestanden van Fontshare (de licentie verbiedt subsetten en formaatconversie), `font-display: swap`, beide gepreload. Licentietekst: `docs/licenties/satoshi-FFL.txt`. Zelf hosten voor de eigen site is toegestaan.
- Tokens staan bovenaan `src/styles/global.css`: `--ink`, `--paper`, `--gutter`, `--font-size-small`, `--font-size-body`, `--wordmark-width`.
- Hero-wordmark: `--wordmark-size` in `src/pages/index.astro` (desktop `clamp(4rem, 15.5vw, 26rem)`, mobiel `27vw`). Met `letter-spacing: -0.04em` is "Paul Breuker" 5,36em ink breed; 15,5vw geeft dus 83vw. Wijzig je lettertype, meet dan opnieuw.

## Homepage: content en foto's

- Alle teksten, links, prijzen en alt-teksten staan in `src/data/home.ts`, niet in de markup. Lege optionele velden (jaar, serie, pull quote) worden niet getoond.
- Foto's: plaats ze (geoptimaliseerd, geen ongecomprimeerde originelen) in `src/assets/home/` met onderstaande bestandsnamen. Extensies `jpg`, `jpeg`, `png`, `webp` of `avif`. `astro:assets` maakt er AVIF en WebP van en snijdt ze bij op de vaste verhouding (`fit: cover`).
- Ontbreekt een bestand, dan toont de pagina een neutraal blok met dezelfde verhouding en "TODO(paul): foto … ontbreekt". De build faalt dan niet. Alleen `tentoonstelling` is optioneel: ontbreekt die, dan vervalt het beeld en de sectie gaat over de volle breedte.
- Aanbevolen bronformaat: minimaal 1280 px breed voor de hero (portret, 4:5), 800 px voor de overige beelden (4:5 uitsnede).

| Bestand | Waar |
| :-- | :-- |
| `hero-take-me-to-the-river-1` (LCP-beeld, eager, staand 2:3, ongecropt, links tegen de schermrand) | Hero (was `public/Take me to the river 1.jpg`; bron 600 × 900 px, zie TODO). De vorige hero-foto staat als `gaarkeuken-3` in dezelfde map. |
| `anekdote` | Anekdote over Paul |
| `project-asty-mwaka` (staand, 5 / 6, links), `project-love-marriage` (liggend, 6 / 5, rechts), `project-het-gezicht-van-nijmegen` (breed liggend, 4 / 3, rij 2) | Sectie "Projecten" (`src/components/Projecten.astro`, data: `home.projecten`). Verplaatst uit `public/` (`Asty 1.jpg`, `Bruiloft 3.jpg`, `Gezicht nijmegen 1.jpg`). |
| `beeld-duo-bruiloft-4` (links, breed, 1200 × 796), `beeld-duo-gaarkeuken-1` (rechts, staand, 600 × 900) | Fotospread (`src/components/BeeldDuo.astro`, data: `home.beeldDuo`). Verplaatst uit `public/` (`Bruiloft 4.jpg`, `Gaarkeuken 1.jpg`). |
| `tentoonstelling` (optioneel) | Sectie Tentoonstellingen |

## Nog te bouwen (links vanaf de homepage die nu een 404 geven)

- `/trouwfotograaf-nijmegen`
- `/zakelijke-portretfoto`
- `/werk`
- `/over-paul`
- `/contact` (alleen in navigatie en voettekst)
- `/exposities`
- `/pers`
- `/privacy` (alleen gelinkt vanuit de footer)
- `/asty-mwaka`, `/love-marriage`, `/het-gezicht-van-nijmegen`, `/groeten-uit-lent`, `/take-me-to-the-river`

## Redirects (`vercel.json`)

- `/promoties` naar https://www.fotograafpromotiesradboud.nl/ (`permanent: true`).
- Joomla-cv (`/?view=article&id=141:curriculum-vitae&catid=8`) naar `/over-paul`: redirect met `source: "/"` en `has`-voorwaarden op de queryparameters `view` (exact `article`) en `id` (regex `141:curriculum-vitae`, ook als `%3A`). Zonder die parameters matcht de regel niet, dus de gewone homepage blijft ongemoeid.
- `permanent: true` levert bij Vercel status 308 op (niet 301). Voor Google is 308 gelijkwaardig aan 301.

## Vóór livegang

- [ ] **www naar apex**: stel in de Vercel-domeininstellingen in dat `www.paulbreuker.nl` permanent doorstuurt naar `paulbreuker.nl`. Dit gebeurt niet in code.
- [ ] Bevestig dat `https://paulbreuker.nl` de canonieke host is (nu ingesteld als `site`).
- [ ] Test de redirects op een preview-deployment (het cv-redirect werkt niet met `vercel dev`).
- [ ] Controleer dat preview-deployments `noindex` serveren en productie niet (nog niet ingericht).
- [ ] Redirectlijst aanvullen met oude Joomla-URL's uit Search Console.
- [ ] Sitemap indienen in Search Console na livegang.

## TODO(paul)

Zoek in de code op `TODO(paul)` voor de actuele lijst. Stand van de site:

- [ ] **Telefoon** `+31 6 51 47 54 06` bevestigen (komt van de oude site; `src/data/site.ts`).
- [x] Lettertype: Satoshi (gratis licentie, commercieel gebruik toegestaan). MADE TOMMY is vervangen; de OTF-bronnen staan nog in `design/fonts/` en zijn niet meer in gebruik.
- [ ] **Bedrijfsnaam** voor titels en schema bevestigen (`SITE_NAME`, nu "Paul Breuker Fotografie").
- [ ] **Alle homepage-foto's** aanleveren (zie tabel hierboven). Tot die tijd tonen de beelden een placeholder.
- [ ] **Controleer alt** hero-foto (`home.hero.photo.alt` in `src/data/home.ts`): "Bovenaanzicht van rood poeder in een lange, smalle bak met witte wanden: donkerrode heuvels met daartussen een roze, tegelachtig oppervlak." Gebaseerd op wat op de foto te zien is; vul naam/plaats/serie in als Paul die wil noemen.
- [ ] **Hero-foto in hogere resolutie**: de bron is 600 × 900 px (143 kB). Op 1856 px breed wordt de foto 668 px getoond (opgeschaald), op 2560 px 922 px. Lever een origineel van minimaal 1200 px breed aan (staand 2:3, 1200 × 1800).
- [ ] **Alt-teksten overige foto's** (nog niet op de pagina): `tentoonstelling` in `src/data/home.ts` heeft nog `TODO(paul): beschrijf foto`. Vervang door een Nederlandse beschrijving van wie/wat/waar.
- [ ] **Sectie Projecten**: controleer de alt-teksten van `project-asty-mwaka`, `project-love-marriage` en `project-het-gezicht-van-nijmegen` (beschreven naar wat op de foto te zien is, zonder namen) en bevestig dat deze foto's de juiste keuze zijn. De bronnen zijn klein (600 × 900, 1200 × 796 en 1200 × 683 px): lever grotere bestanden aan voor schermen boven circa 1500 px.
- [ ] **Fotospread** (`home.beeldDuo` in `src/data/home.ts`): controleer de alt-teksten van `beeld-duo-bruiloft-4` en `beeld-duo-gaarkeuken-1` (beschreven naar wat op de foto te zien is, zonder namen) en bevestig de keuze. De bronnen zijn klein (1200 px en 600 px breed) voor een bijna schermvullende spread: lever grotere bestanden aan (links minimaal 2400 px breed).
- [ ] **Over Paul-sectie** (`home.overPaul.tekst`): tekst staat er letterlijk zoals aangeleverd (circa 45 woorden, bewust kort, zonder foto). Bevestig de jaartallen 1984 en 1995 en vergelijk met "35 jaar" en 1992.
- [ ] **Sectie Exposities** (`home.exposities` in `src/data/home.ts`): controleer de spelling van namen (Oude Maria kerk, Eén vandaag, Museum het Valkhof, Museum de Fundatie) en bevestig dat de titels voor 2017 en 2022 ("Waterexpo", "Klimaatexpo", "750 jaar St. Stevenskerk") kloppen.
- [ ] **Tentoonstellingen**: jaar en serie per item (Kunsthal, Photoville, Museum Het Valkhof). Zonder invoer worden ze niet getoond.
- [ ] **Controle jaartallen**: "Al 35 jaar", "sinds 1984" (kunstenaar), "vanaf 1995" (fotograaf) en "sinds 1992" (bruiloften) zijn zo aangeleverd. Bevestig dat ze samen kloppen.
- [ ] **Adres en openingstijden** voor het `LocalBusiness`-schema (nu alleen plaats Nijmegen en land NL, werkgebied Nijmegen en Arnhem).
- [ ] **Singulart-URL** voor `sameAs` (Instagram, LinkedIn en Facebook staan erin).
- [ ] **404-tekst** definitief maken (`src/pages/404.astro`).
- [ ] **Navigatie**: placeholder-links controleren zodra de pagina's bestaan (`NAV` in `src/data/site.ts`). Op dit moment geven ze een 404.
- [ ] **Standaard deelafbeelding** (1200x630, eigen foto) voor Open Graph/Twitter (`DEFAULT_OG_IMAGE`). Zonder afbeelding gebruikt Twitter de kaart `summary`.
- [ ] **Adres en KvK** voor de voettekst. `LocalBusiness` staat op de homepage; `Person` (waar `founder` naar verwijst) komt op `/over-paul`.
- [ ] **Privacyverklaring en cookiebeleid**: teksten en links in de voettekst.
- [ ] Bruiloftprijs en vanaf-prijs portretten voor `Service` + `Offer` (de helper bestaat, de bedragen komen van Paul).

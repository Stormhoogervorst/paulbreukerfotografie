# paulbreuker.nl

Website voor fotograaf Paul Breuker (Nijmegen). Astro 7 (TypeScript strict) op Vercel, statische output. Projectregels: `.cursor/rules/paulbreuker-regels.mdc`. Detailplan: `docs/seo-architectuur.md`.

Status: technisch skelet plus de landingspagina's `/fotograaf-bruiloft` en `/portretfotos` plus **header, hero, "(over paul)", "Projecten", "Diensten" en een fotospread** van de homepage (in die volgorde) (`src/pages/index.astro`, content in `src/data/home.ts`). De overige homepage-secties staan bewust niet op de pagina (vorige versie: `design/archief/`). Overige pagina's volgen.

## Scripts

| Script | Doel |
| :-- | :-- |
| `npm run dev` | Dev-server op `localhost:4321` |
| `npm run build` | Productiebuild naar `dist/` (en `.vercel/output`) |
| `npm run preview` | Build lokaal bekijken |
| `npm run check` | `astro check` (TypeScript en Astro-diagnostiek) |

Marquee-test (WebKit en Chromium, mobiele emulatie): `npm run build`, dan `npm run preview` in een tweede terminal, daarna `node scripts/marquee-test.mjs`. Eenmalig nodig: `npx playwright install webkit chromium`. Het script draait op iPhone 14 (WebKit) en Pixel 7 (Chromium) zes controles: stilstand zonder scrollen, meescrollen (300 px), terugscrollen, naadloze wrap, `prefers-reduced-motion: reduce` en zonder JavaScript. Het print een tabel en faalt met exit-code 1 als een controle mislukt. WebKit start niet in een gesandboxte omgeving (Cursor-agent); draai het dan buiten de sandbox.

Portfolio-test (`/portfolio`, WebKit iPhone 14, Chromium Pixel 7 en Chromium desktop 1440 × 900): `npm run build`, dan `npm run preview` in een tweede terminal, daarna `node scripts/portfolio-test.mjs` (andere poort: `BASE_URL=http://127.0.0.1:4322 node scripts/portfolio-test.mjs`; één apparaat: `APPARAAT=pixel`). Controles: laden (minder dan 150 foto-elementen, minstens 15 zichtbaar, aantal beeldverzoeken, overdracht en tijd tot het eerste scherm compleet is), slepen (offset verandert, foto's komen bij en verdwijnen), uitloop, een lange sleep van 20 000 px (minstens 60% van 5 × 5 meetpunten binnen 150 px van een foto), klik versus sleep (dialog met serietitel, Esc sluit, focus terug), toetsenbord, `prefers-reduced-motion: reduce` (geen uitloop, geen fade-in) en zonder JavaScript (h1, noscript-raster, home-knop). Exit-code 1 bij een mislukte controle. Touch-slepen gaat in Chromium via CDP; in WebKit met synthetische pointer-events (Playwright heeft daar geen CDP of touch-sleep). WebKit draait niet in de sandbox van de Cursor-agent: draai het script dan buiten de sandbox.

Aanvraagtest (`/api/aanvraag`, bruiloft en portret): `node scripts/aanvraag-test.mjs`. Het script start zelf een dev-server op poort 4398 (`astro dev --ignore-lock`, dus naast een draaiende dev-server, zonder `RESEND_API_KEY`) en leest het dry-run-log. Controles: geldige aanvraag (API, zonder JavaScript en in de browser met de cta van Kunstportret, inclusief het veld "locatie" in het log), lege verzending toont fouten, honeypot, te snelle verzending en vreemde Origin loggen niets, ongeldig e-mailadres, pakket of bericht geeft 400, `/bedankt?type=portret` toont de stappen van het portret, plus regressiecontroles voor de bruiloft. Draai het buiten de sandbox van de Cursor-agent (Playwright).

Voor/na-vergelijking van een pagina: `node scripts/vergelijk/schermafdruk.mjs voor` (en later `na`, optioneel met een pad als tweede argument) maakt `scripts/vergelijk/<voor|na>-<slug>-<1440|390>.png`; `node scripts/vergelijk/diff.mjs <slug>` telt de afwijkende pixels. Draai het buiten de sandbox.

## Portfolio (`/portfolio`)

Oneindig, sleepbaar canvas met alle foto's. Zonder header en footer: linksboven een knop "← home", onderaan de h1, een hint en links naar `/werk` en `/contact`.

- **Foto's toevoegen**: zet het bestand (geoptimaliseerd, geen ongecomprimeerd origineel) in `src/assets/portfolio/<serie>/`, bijvoorbeeld `src/assets/portfolio/love-marriage/bruiloft-21.jpg`. De mapnaam is de serie. Bekende series (titel en link) staan in `src/data/portfolio-series.ts`; een onbekende mapnaam krijgt een titel uit de mapnaam en geen link. Bestanden direct in `src/assets/portfolio/` hebben geen serie (alt "Foto van Paul Breuker"). Niet in `public/` zetten: daar optimaliseert `astro:assets` niets.
- **Alt-tekst**: standaard "Foto uit de serie {titel}". Eigen tekst per foto in `src/data/portfolio-alt.json`, sleutel `serie/bestandsnaam`, bijvoorbeeld `{ "love-marriage/bruiloft 02-min.jpg": "Bruid en bruidegom ..." }`.
- **Varianten** (bij de build, sharp): 360w en 720w AVIF voor het canvas (in `npm run dev` WebP, omdat de dev-server AVIF per verzoek codeert en dat seconden per foto kost), 1600w en 2400w WebP voor de grote weergave. Breedtes boven het origineel worden niet opgeschaald.
- **Code**: manifest `src/data/portfolio.ts` (bron wisselbaar via `localSource()`), layout `src/lib/portfolio-layout.ts` (geseed, zonder DOM), varianten `src/lib/portfolio-images.ts`, gedrag `src/scripts/portfolio-canvas.ts`, pagina `src/pages/portfolio.astro`, afbeeldingensitemap `src/pages/sitemap-images.xml.ts`.
- **Laden**: eerst de foto's van het eerste scherm (`fetchpriority="high"`), daarna de marge eromheen, daarna in rustige momenten de overige miniaturen (maximaal 100, niet bij Data Saver), zodat slepen direct beeld geeft.
- Cellen: desktop 290 × 230 px, mobiel (onder 700 px) 150 × 130 px.

## Structuur

```text
src/
├── components/
│   ├── SEOHead.astro      title, description, canonical, robots, OG, Twitter, JSON-LD
│   ├── JsonLd.astro       <script type="application/ld+json">, één per node
│   ├── Header.astro       desktop: 3 kolommen (wordmark, contact, navigatie; socials alleen in de footer); mobiel: <details>-menu (geen JavaScript)
│   ├── Footer.astro       drie lagen: tekstblok + navigatie, wordmark (cqw, marge tot marge), contactregel
│   ├── BeeldDuo.astro     fotospread (twee foto's, geen tekst) onder Diensten, laatste sectie
│   ├── Statement.astro    haarlijn, label tussen haakjes, grote tekst met ingesprongen eerste regel, kleine link ("(over paul)" op de homepage, Werkwijze op landingspagina's)
│   ├── Marquee.astro      gedeelde titelbalk (scroll-gekoppeld, klein inline script; zonder JS statisch) voor Projecten, Diensten en Exposities
│   └── ContactLinks.astro telefoon en e-mail als tekst met tel:/mailto:
├── components/landing/
│   ├── LandingHero.astro  hero van een landingspagina (rij met H1 en inleiding, daaronder een statische fotostrip; de eerste foto is het LCP-beeld)
│   ├── LandingBeeld.astro  Beeld: één foto van rand tot rand onder het Aanvraagformulier (laatste sectie), uitsnede 5:2 (mobiel 16:9), geen kop
│   ├── LandingVragen.astro  Vragen: marquee-titel en uitklapbare lijst (native `<details>`, eerste vraag open, plus/min van CSS-lijnen); antwoorden beginnen op `--kolom-tekst`; JSON-LD `FAQPage` komt uit dezelfde data (in `LandingLayout.astro`)
│   ├── LandingOverPaul.astro  OverPaul: haarlijn, foto van Paul links, rechts grote openingsalinea, alinea's en één kleine link (label alleen als verborgen h2); tekstkolom op dezelfde positie als Werkwijze (`--statement-kolommen`)
│   ├── LandingFormulier.astro  Aanvraagformulier: vóór Beeld (anker `#aanvragen`), marquee-titel, links intro met contactgegevens, rechts het formulier uit het register in `src/lib/formulieren/`
│   └── LandingImpressie.astro  Impressie: zonder zichtbare titel; vier foto's in twee rijen van twee (`indeling: 'diagonaal'`, standaard) of drie staande foto's in één rij (`indeling: 'rij'`, portretfotos), elk met een andere breedte (configuratie in de frontmatter), foto's uit `src/assets/landing/impressie/`
├── layouts/
│   ├── BaseLayout.astro   <html lang="nl">, skip-link, header, <main>, footer (props `header` en `footer`, standaard true)
│   └── LandingLayout.astro  commerciële landingspagina: SEO, JSON-LD en secties in de vaste volgorde
├── data/
│   ├── landing/           types.ts (interface `LandingPagina`) en één databestand per landingspagina (fotograaf-bruiloft.ts, portretfotos.ts; pakketten in bruiloft-pakketten.ts en portret-pakketten.ts)
│   ├── home.ts            teksten homepage
│   ├── paul.ts            volledige bio van Paul (constanten), hergebruik op /over-paul; de bruiloftpagina gebruikt een selectie
│   └── site.ts            bron voor header en footer: sitegegevens, contact, socials, navigatie, footertekst, @id's
├── lib/schema.ts          getypeerde JSON-LD-helpers
├── lib/segmenten.ts       `linkSegmenten()`: splitst één tekst in Segmenten (tekst of link) op opgegeven woorden; `segmentenTekst()`: platte tekst van Segmenten
├── lib/prijs.ts           `euro()`: "€3.250" (zelfde formaat als Pakketten)
├── lib/formulieren/       types.ts (veldconfiguratie), gedeeld.ts (gedeelde velden, schema-hulpen en mailhulpen), bruiloft.ts en portret.ts (velden, Zod-schema, mailteksten, bedankstappen), index.ts (register `{ bruiloft, portret }`), respons.ts (JSON- en HTML-antwoorden van de API)
├── scripts/formulier.ts   enhancement van het formulier (validatie, fetch, pakketkeuze; ruim onder 3 KB)
├── pages/                 index, fotograaf-bruiloft, portretfotos, bedankt, 404, robots.txt.ts, api/aanvraag.ts (de enige on-demand route)
└── styles/global.css      CSS-variabelen en basisstijl
vercel.json                redirects
```

- `title` en `description` zijn verplichte props van `BaseLayout`/`SEOHead` zonder standaardwaarde. Ontbreken ze, dan geeft `astro check` een fout en faalt `astro build`.
- `WebSite`-JSON-LD staat automatisch op elke pagina. Andere nodes geef je mee via `jsonLd={[...]}`.
- `/bedankt` en `/404` zijn `noindex` en staan niet in de sitemap (filter in `astro.config.mjs`). Voeg nieuwe niet-indexeerbare pagina's toe aan `NOT_INDEXABLE` en geef ze `noindex`.
- Lettertype: Satoshi (Fontshare, ITF Free Font License), gewichten 500 (tekst, navigatie) en 700 (wordmark, koppen). Self-hosted als WOFF2 in `src/assets/fonts/`, **onaangepaste** bestanden van Fontshare (de licentie verbiedt subsetten en formaatconversie), `font-display: swap`, beide gepreload. Licentietekst: `docs/licenties/satoshi-FFL.txt`. Zelf hosten voor de eigen site is toegestaan.
- Tokens staan bovenaan `src/styles/global.css`: `--ink`, `--paper`, `--canvas` (lichtgrijs, /portfolio), `--gutter`, `--font-size-small`, `--font-size-body`, `--wordmark-width`.
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
| `project-asty-mwaka` (staand, 5 / 6, links), `project-love-marriage` (liggend, 6 / 5, midden), `project-take-me-to-the-river` (hoog, natuurlijke verhouding, rechts) | Sectie "Projecten" (`src/components/Projecten.astro`, data: `home.projecten`). Eerste twee verplaatst uit `public/` (`Asty 1.jpg`, `Bruiloft 3.jpg`); de derde is een kopie van `src/assets/portfolio/take-me-to-the-river/Take me to the river 06-min.jpg`. `project-het-gezicht-van-nijmegen` wordt niet meer gebruikt. |
| `beeld-duo-bruiloft-4` (links, breed, 1200 × 796), `beeld-duo-gaarkeuken-1` (rechts, staand, 600 × 900) | Fotospread (`src/components/BeeldDuo.astro`, data: `home.beeldDuo`). Verplaatst uit `public/` (`Bruiloft 4.jpg`, `Gaarkeuken 1.jpg`). |
| `tentoonstelling` (optioneel) | Sectie Tentoonstellingen |

## Nieuwe landingspagina toevoegen

Commerciële landingspagina's (`/fotograaf-bruiloft`, `/portretfotos`, later `/zakelijke-portretfoto` en `/linkedin-foto-laten-maken`) zijn datagedreven: een databestand en een paginabestand van een paar regels. De volgorde van de secties staat vast in `src/layouts/LandingLayout.astro` en in de regel "Volgorde commerciële landingspagina (bindend)" in `.cursor/rules/paulbreuker-regels.mdc`.

1. Zet de hero-foto's (vijf, geoptimaliseerd, verhouding tussen 2:3 en 3:2, geen ongecomprimeerd origineel) in `src/assets/landing/`.
2. Maak `src/data/landing/<slug>.ts` met een `LandingPagina` (zie `src/data/landing/types.ts` en `fotograaf-bruiloft.ts` als voorbeeld): `slug`, `seo` (title rond 60, description rond 155 tekens), `breadcrumb`, `hero` (H1, intro-alinea's, CTA's, `fotos`: afbeelding en alt per foto) en `schema` (`dienstNaam`, `vanPrijs`, `werkgebied`).
3. Maak `src/pages/<slug>.astro`: importeer de data en render `<LandingLayout pagina={...} />` (zie `src/pages/fotograaf-bruiloft.astro`).
4. Zet de data neer met `TODO(paul)` waar iets niet vaststaat (alt, tekst, werkgebied, prijs) en voeg dat toe aan de lijst hieronder.
5. Controleer: één `<h1>`, canonical, JSON-LD (`BreadcrumbList` en `Service` met `Offer`), de pagina staat in de sitemap, minstens drie interne links in en uit, en `npm run check` en `npm run build` slagen.

De layout levert zelf: `BaseLayout` met `SEOHead` (canonical `https://paulbreuker.nl/<slug>`, Open Graph met de eerste hero-foto bijgesneden op 1200 x 630), `BreadcrumbList` (Home > breadcrumb) en `Service` + `Offer` (alleen als `vanPrijs` is gezet; `provider` verwijst via `@id` naar het `LocalBusiness` van de homepage).

## Nog te bouwen (links vanaf de homepage die nu een 404 geven)

- `/zakelijke-portretfoto` (gelinkt vanaf `/portretfotos` en de homepage)
- `/werk`
- `/over-paul`
- `/contact` (alleen in navigatie en voettekst)
- `/exposities`
- `/pers`
- `/privacy` (gelinkt vanuit de footer en onder het aanvraagformulier)
- Spamwering met Turnstile of vergelijkbaar (nu alleen honeypot en tijdstempel)
- Reviews bij het formulier (sectie Reviews, vóór het Aanvraagformulier)
- Voor `/zakelijke-portretfoto` en `/linkedin-foto-laten-maken`: een eigen formulier (of hergebruik van `portret.ts`; dat heeft een veld "Zakelijk of LinkedIn")
- Conversiemeting op `/bedankt` (de pagina zet al `data-aanvraag-type` op `<main>`; er is nog geen analytics) en op klikken op telefoon en e-mail
- `/asty-mwaka`, `/love-marriage`, `/het-gezicht-van-nijmegen`, `/groeten-uit-lent`, `/take-me-to-the-river`
- Vanaf `/fotograaf-bruiloft` (sectie Vragen): `/contact`. `/portfolio` en `#aanvragen` bestaan al.
- Vanaf `/fotograaf-bruiloft` (sectie OverPaul): `/over-paul`, `/love-marriage` en `/take-me-to-the-river` (de links staan er al; ze geven nu een 404)
- Vanaf `/portretfotos` (nu 404): `/zakelijke-portretfoto` (Vragen), `/de-gaarkeuken` en `/portretten` (OverPaul), `/over-paul`, `/love-marriage` en `/take-me-to-the-river` (OverPaul), `/privacy` (onder het formulier). `/portfolio` en `#aanvragen` bestaan. `/contact` staat op de pagina alleen in de header en footer (nog een 404), niet in de inhoud.
- Vanaf `/portfolio` (overlay en dialog): `/werk`, `/contact` en de seriepagina's `/de-gaarkeuken`, `/portretten`, `/asfalt`, `/panoramas` (naast de series hierboven)

### Nog te bouwen op de landingspagina's

Gebouwd: de hero, Werkwijze (`Statement.astro`, dezelfde component als "(over paul)" op de homepage), Impressie (`LandingImpressie.astro`, data-veld `impressie`: geen zichtbare titel, alleen een visueel verborgen `<h2>`; vier foto's in twee rijen van twee met verschillende breedtes, optionele link) en Pakketten (`LandingPakketten.astro`, data-veld `pakketten`: titel in de gedeelde `Marquee`, drie pakketten naast elkaar met subgrid, optionele voetnoot; anker `#pakketten`). Daarna is OverPaul gebouwd (`LandingOverPaul.astro`, data-veld `overPaul`: foto links, rechts grote openingsalinea, alinea's en één kleine link, label alleen als visueel verborgen `<h2>`; teksten uit `src/data/paul.ts`; typografie gedeeld met Statement via `.statement-label`, `.statement-tekst` en `.statement-link` in `global.css`). Daarna is Vragen gebouwd (`LandingVragen.astro`, data-veld `vragen`: titel in de gedeelde `Marquee`, vier vragen als native `<details>`; anker `#vragen`; de prijzen in de antwoorden komen uit de `pakketten`-data via `pakketPrijs()` in `fotograaf-bruiloft.ts`; de JSON-LD krijgt een `FAQPage` uit dezelfde data). Daarna is het Aanvraagformulier gebouwd (zie "Formulier en e-mail (Resend)"). Daarna is Beeld gebouwd (`LandingBeeld.astro`, data-veld `beeld`: één foto van rand tot rand, bijgesneden op 5:2 (mobiel 16:9), geen kop of tekst; nu een kopie van `bruiloft 02` uit Love & Marriage in `src/assets/landing/beeld-bruiloft-02.jpg`). Bindende volgorde van de pagina: Hero, Werkwijze, Pakketten, Impressie, OverPaul, Vragen, Uitleg, Reviews, Aanvraagformulier, Beeld (foto van rand tot rand, geen kop), daarna de gedeelde footer; `LandingLayout.astro` rendert dit zo (de oude volgorde met Impressie vóór Pakketten vervalt). In `LandingLayout.astro` staat een commentaarlijst met wat nog ontbreekt, in deze vaste volgorde: Uitleg en Reviews (de data-velden staan al optioneel in `types.ts`; beide komen na Vragen en vóór het formulier). Het Aanvraagformulier komt na Reviews en vóór Beeld; Beeld is de laatste sectie, vóór de footer.

- Op `/fotograaf-bruiloft` verwijst de link in Werkwijze ("bekijk de pakketten") naar `#pakketten`, en de hero-CTA's naar `#aanvragen` (Aanvraagformulier) en `#pakketten` (Pakketten). Beide ankers bestaan.
- **Aanvraagformulier**: de cta's in Pakketten ("Aanvragen") verwijzen naar `#aanvragen` en hebben `data-pakket` (slug). Heeft het formulier een veld `pakket` (het portretformulier), dan kiest `src/scripts/formulier.ts` bij een klik dat pakket. Het bruiloftformulier heeft geen pakketveld (een extra veld zou het uiterlijk van `/fotograaf-bruiloft` veranderen), dus daar is het attribuut ongebruikt. Een pakket zonder `prijs` (`prijs?: number`) toont geen prijsregel en komt niet in de JSON-LD.
- **Offers per pakket in JSON-LD**: gebouwd. De `Service` op `/fotograaf-bruiloft` heeft een `OfferCatalog` (`hasOfferCatalog`) met per pakket met een prijs één `Offer`; `Offer.minPrice` is de laagste pakketprijs. Pakketten zonder prijs (`prijs: null`) komen er niet in. Wijzigen de prijzen, dan klopt de JSON-LD vanzelf; pas dan wel de vanaf-prijs in `seo.title`, `seo.description` en `hero.intro` met de hand aan.
- `/portretfotos`: gebouwd met dezelfde layout en componenten; data in `src/data/landing/portretfotos.ts` en `portret-pakketten.ts`, formulier in `src/lib/formulieren/portret.ts`. Title en description schakelen vanzelf om zodra een pakket een prijs krijgt (`portretTitle()` en `portretDescription()`); tot die tijd geeft `npm run dev` per pakket zonder prijs een `console.warn`.
- De pagina `/fotograaf-bruiloft` heeft nu nog minder dan drie interne links in de inhoud; die komen met Uitleg en de serie-pagina's (Impressie levert één link, naar `/portfolio`). `/fotograaf-bruiloft` wordt wel gelinkt vanuit de navigatie, de footer, Diensten (homepage) en de 404.

## Formulier en e-mail (Resend)

Het bruiloftformulier (sectie Aanvraagformulier, `#aanvragen`) post naar `src/pages/api/aanvraag.ts`: de enige on-demand route (`export const prerender = false`; de rest van de site blijft statisch, `output: 'static'` met `@astrojs/vercel`). De route valideert met Zod, stuurt via Resend een mail naar Paul (reply-to: de aanvrager) en een bevestiging naar de aanvrager (reply-to: Paul), en stuurt door naar `/bedankt?type=bruiloft` of `/bedankt?type=portret` (zonder JavaScript een 303-redirect; met het script `{ ok: true }` en `window.location.assign`). Er zijn twee formulieren: `bruiloft` (`/fotograaf-bruiloft`) en `portret` (`/portretfotos`).

**Nodig voor productie**

1. Een Resend-account.
2. Het domein `paulbreuker.nl` verifiëren in Resend (Domains): voeg de SPF- en DKIM-records toe bij de DNS-provider en wacht tot de status "Verified" is. Zonder geverifieerd domein weigert Resend andere afzenderadressen.
3. Een API-key aanmaken (Resend, API Keys; "Sending access" volstaat).
4. Drie omgevingsvariabelen (zie `.env.example`), in Vercel (Settings, Environment Variables) voor **Production én Preview**, en lokaal in `.env`:

| Variabele | Betekenis |
| :-- | :-- |
| `RESEND_API_KEY` | De API-key uit stap 3. |
| `FORM_TO_EMAIL` | Ontvanger van de aanvragen (Paul). Leeg of afwezig: `CONTACT.email` uit `src/data/site.ts`. |
| `FORM_FROM_EMAIL` | Afzender van beide mails, bijvoorbeeld `Paul Breuker <aanvraag@paulbreuker.nl>`. Het domein moet geverifieerd zijn. Zonder deze variabele geeft de route ook een 503. |

De variabelen staan in het Astro env-schema (`astro.config.mjs`, `astro:env/server`, allemaal optioneel en geheim) en worden bij elk verzoek gelezen. Na het aanpassen van variabelen in Vercel is een nieuwe deployment nodig.

**Dev-modus (zonder sleutel)**: draait `npm run dev` zonder `RESEND_API_KEY`, dan verstuurt de route niets. De gevalideerde aanvraag en beide mails (onderwerp en tekst) staan in de terminal, en het formulier meldt succes (dry-run). Zo is het hele traject tot `/bedankt` lokaal te testen.

**Productie en preview zonder sleutel**: de route antwoordt 503 `{ ok: false, code: "niet_geconfigureerd" }`. Het script toont dan de melding boven de knop met e-mailadres en telefoonnummer; zonder JavaScript staat er een kleine pagina met uitleg en dezelfde contactgegevens. Zo verdwijnt een aanvraag nooit stilletjes. Mislukt het versturen naar Paul, dan volgt een 502 `verzenden_mislukt` (nooit een succesmelding); mislukt alleen de bevestiging, dan wordt dat gelogd en krijgt de bezoeker toch succes. In productie worden geen persoonsgegevens gelogd.

**Resend-testadres**: het testafzenderadres van Resend (`onboarding@resend.dev`) mailt alleen naar het adres van het eigen Resend-account. Controleer dit in de Resend-documentatie voordat je ermee test; gebruik anders het geverifieerde domein.

**Spamwering**: honeypotveld `website` (verborgen met CSS), een tijdstempelveld dat het script invult (formulier in minder dan 3 seconden verzonden telt als bot; het veld bevat milliseconden sinds laden, dus klokverschillen spelen geen rol) en een controle op de `Origin`-header. Bij spam doet de route alsof het gelukt is en verstuurt niets. `/api/` staat in `robots.txt` op `Disallow`; `/bedankt` is `noindex` en staat niet in de sitemap.

**Formulier uitbreiden**: een nieuw formulier is een nieuw bestand in `src/lib/formulieren/` (velden, Zod-schema, `onderwerp`, `tekst`, `bevestiging`, `stappen`, `type`; gedeelde onderdelen uit `gedeeld.ts`), een regel in het register `index.ts` en een `formulier`-veld in de landingdata (`type` in `types.ts`). De bedankstappen op `/bedankt` komen per type uit `stappen`; de pagina is statisch, dus een klein inline script toont het blok van het type uit de querystring (zonder JavaScript of bij een onbekend type blijft "Wat gebeurt er nu?" verborgen). Het bruiloftformulier heeft geen pakket-, gasten- of berichtveld; het portretformulier heeft wel een pakketveld (de opties komen uit `portret-pakketten.ts`) en een berichtveld.

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
- [ ] **Sectie Projecten**: controleer de alt-teksten van `project-asty-mwaka`, `project-love-marriage` en `project-take-me-to-the-river` (beschreven naar wat op de foto te zien is, zonder namen) en bevestig dat deze foto's de juiste keuze zijn. De bronnen zijn klein (600 × 900, 1200 × 796 en 600 × 900 px): lever grotere bestanden aan voor schermen boven circa 1500 px. De hoge foto van Take me to the river is 600 × 900 px (2:3), geen lange smalle foto: op een scherm van 1440 px breed is de kaart 259 px breed (scherp tot ruim 2×), op 2560 px breed 461 px. Lever je een langere, smallere foto aan (bijvoorbeeld 1:2,5), dan past de kaart zich vanzelf aan (verhouding komt uit het bestand) en wordt hij hoger; lever hem dan minimaal 1000 px breed aan.
- [x] **Projecten, Take me to the river**: geen jaartal of plaats onder de titel (bewust weggelaten). `project-het-gezicht-van-nijmegen.jpg` staat nog in `src/assets/home/` maar wordt niet meer gebruikt.
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
- [ ] **/fotograaf-bruiloft**: (1) intro-tekst laten goedkeuren (`hero.intro`); (2) werkgebied bevestigen of aanvullen (`seo.description` en `schema.werkgebied`: nu Nijmegen en Arnhem); (3) hero-fotostrip: zie het punt hieronder.
- [ ] **/fotograaf-bruiloft, hero-fotostrip** (`hero.fotos`): alt-teksten laten controleren door Paul, alle drie (`bruiloft 18` bruid in het toilet, `20` aankleden, `16` bruidegom in de auto). Desktop toont alle drie, mobiel de eerste twee (`DESKTOP_AANTAL` en `MOBIEL_AANTAL` in `LandingHero.astro`). Bevestig de keuze: `18` is de eerste foto en dus ook de Open Graph-afbeelding en het LCP-beeld, en `20` en `16` staan alleen in de hero (niet meer in Impressie). De verhoudingen zijn allemaal 3:2; met drie foto's is de strip op 1440 px circa 308 px hoog (circa 21vw), op mobiel circa 32vw. Lever staande bruiloftfoto's aan (600 × 900 of groter) en bronnen van minimaal 1400 px breed voor de liggende; de bronnen zijn 1200 px.
- [ ] **/fotograaf-bruiloft, Werkwijze** (`werkwijze.tekst`): tekst laten goedkeuren.
- [ ] **/fotograaf-bruiloft, Impressie** (`impressie` in `src/data/landing/fotograaf-bruiloft.ts`): alt-teksten laten controleren door Paul, alle vier (beschreven naar wat op de foto's te zien is, zonder namen of plaatsen: `bruiloft 15`, `11`, `07` en `14` uit Love & Marriage, in die volgorde). Bevestig ook de keuze: alle vier zijn liggend (3:2) en de bronnen zijn 1200 px breed (de breedste foto staat op 51vw: scherp tot een scherm van circa 2350 px, bij 2× tot circa 1200 px). `bruiloft 14` staat ook als hero op de homepage. Ongebruikt in `src/assets/landing/impressie/`: `01-bruiloft-20` en `02-bruiloft-16` (wel in de hero-fotostrip), `03-bruiloft-05`, `05-bruiloft-08` en `06-bruiloft-02`.
- [ ] **/fotograaf-bruiloft, OverPaul** (`overPaul` in `src/data/landing/fotograaf-bruiloft.ts`, teksten in `src/data/paul.ts`): tekst laten goedkeuren; bevestig de jaartallen 1984 en 1995 en maak ze gelijk met ‘al 35 jaar’ op de homepage; laat de spelling van Museum het Valkhof, Museum de Bastei en de kranten controleren; controleer de alt-tekst van de foto ("Zwart-witportret van fotograaf Paul Breuker"; het bestand lijkt licht gekleurd, sepia). De alinea's ‘promoties’ en ‘radboud’ staan bewust niet op deze pagina (ze blijven in `paul.ts` voor `/over-paul`).
- [ ] **TODO(paul): foto van Paul in hogere resolutie aanleveren (minimaal 1200 px breed).** `src/assets/landing/paul.webp` (was `public/paul.webp`) is 400 × 400 px en wordt gebruikt zoals het is (niet opgeschaald). Op desktop staat de foto op 17vw (245 px op 1440 px breed): op scherpe schermen (2×) te klein.
- [ ] **/fotograaf-bruiloft, Vragen** (`vragen` in `src/data/landing/fotograaf-bruiloft.ts`): antwoorden door Paul laten goedkeuren, in het bijzonder het antwoord op de uurtarief-vraag (is het waar dat Paul voor bruiloften geen uurtarief hanteert en geen korte opdrachten doet?). Overweeg extra vragen waarop alleen Paul het antwoord weet: wanneer ontvang je de foto’s, werk je ook buiten Nijmegen en Arnhem en tegen welke reiskosten, hoe ver van tevoren moet ik boeken, wat gebeurt er bij slecht weer. De zichtbare antwoorden en de `FAQPage` in de JSON-LD komen uit dezelfde data, dus wijzigingen hoeven maar op één plek.
- [ ] **/fotograaf-bruiloft, Beeld** (`beeld` in `src/data/landing/fotograaf-bruiloft.ts`): alt-tekst laten controleren door Paul (beschreven naar wat op de foto te zien is, zonder namen of plaatsen) en een versie van minimaal 2400 px breed aanleveren: de bron is 1200 × 796 px en wordt van rand tot rand boven 1200 px breed opgeschaald (op 1440 px is dat 1,2×, op 2560 px 2,1×).
- [ ] **/fotograaf-bruiloft, Pakketten** (`pakketten` in `src/data/landing/fotograaf-bruiloft.ts`; Reportage €3.250, Album €3.950, Collectie €4.450; de inhoud is aangeleverd maar nog niet bevestigd door Paul):
  - Zijn dit vaste prijzen of ‘vanaf’-prijzen? Bij ‘vanaf’: zet `prijsLabel: 'vanaf'` bij het pakket (nu staat er alleen het bedrag).
  - Prijzen inclusief of exclusief btw? Vul daarna de `voetnoot` in (nu bewust weggelaten).
  - Reportage: aantal foto’s ("ruim 400") en online galerij, kennismaking vooraf, tweede fotograaf als optie (staat in kenmerk 3).
  - Album: formaat, aantal pagina’s en ontwerpproces.
  - Collectie: portretsessie (duur en locatie; "vooraf of de dag erna") en kunstafdrukken (formaat, papier, aantal).
  - Controleer of "vanaf €3.250" in `seo.title`, `seo.description` en `hero.intro` en `schema.vanPrijs` (3250) blijft kloppen met de laagste pakketprijs.
- [ ] **Aanvraagformulier en /bedankt**: (1) Resend instellen (zie "Formulier en e-mail (Resend)"); (2) mailteksten laten goedkeuren (`src/lib/formulieren/bruiloft.ts`); (3) introtekst en privacytekst (`formulier` in `src/data/landing/fotograaf-bruiloft.ts`) laten kloppen met de privacyverklaring die nog geschreven moet worden (`/privacy`); (4) het proces en de reactietijd op `/bedankt` bevestigen (drie stappen). De opdracht noemde op `/bedankt` "binnen 48 uur", maar het formulier, de mails en de projectregels zeggen "binnen 24 uur": de pagina zegt nu ook 24 uur. Pas aan als dat niet klopt.
- [ ] Bruiloftprijs en vanaf-prijs portretten voor `Service` + `Offer` (de helper bestaat, de bedragen komen van Paul).
- [ ] **Portfolio, series bevestigen**: de foto's kwamen plat uit `public/` en zijn op bestandsnaam ingedeeld. Zeker: `ASTY` (Asty Mwaka), `GEZICHT` (Het Gezicht van Nijmegen), `Gaarkeuken`, `Take me to the river`, `breuker lent` (Groeten uit Lent), `bruiloft` (Love & Marriage), `Portret 1/2` en `PORTRET BEEK` (samen in Portretten). Onzeker, nu zonder link: `huiskamers`, `tradities` (panoramaformaat: hoort dit bij /panoramas?), `promoties` (bewust geen link). Zonder serie: `L1039810-min-2`, `L1039998-min-dba42075`, `L1039999-min-550ea5c5`.
- [ ] **Portfolio, grotere bronnen**: de originelen zijn 600 tot 1300 px breed, dus de "1600w" en "2400w" voor de grote weergave zijn nu het origineel. Lever bestanden van minimaal 2400 px breed aan voor een scherpe grote weergave.
- [ ] **Portfolio, alt-teksten**: nu overal de standaardtekst. Beschrijvende teksten per foto in `src/data/portfolio-alt.json`.
- [ ] **Portfolio, contact**: op /portfolio staan e-mail en telefoon nu niet als tekst (geen header en footer, op verzoek); alleen de link "Contact →".
- [ ] **/portretfotos, prijzen** (`prijs` per pakket in `src/data/landing/portret-pakketten.ts`; Portret, Duo en gezin, Kunstportret): nog geen prijzen. Zodra een pakket een prijs heeft verschijnt de prijsregel, komt het pakket in de JSON-LD (`OfferCatalog` en `Offer.minPrice`), krijgen title (`Portretfoto laten maken | Paul Breuker, vanaf €X`), description, hero (tweede alinea), de eerste vraag en de opties van het formulierveld "Wat voor portret wil je?" de prijs. Is het een vanaf-prijs: zet `prijsLabel: 'vanaf'`.
- [ ] **/portretfotos, duur en aantal foto's**: werkgebied, reiskosten, duur van de sessie en aantal bewerkte foto's per pakket (kenmerken in `portret-pakketten.ts`; pagina's die in Google scoren noemen die gegevens). Voeg werkgebied en reiskosten ook toe aan het antwoord op "Waar vindt de portretsessie plaats?".
- [ ] **/portretfotos, werkgebied**: bevestig "Nijmegen en omgeving" in de description en `schema.werkgebied` (Nijmegen, Arnhem).
- [ ] **/portretfotos, conceptteksten** (`src/data/landing/portretfotos.ts`): laat alle teksten in de ik-vorm goedkeuren, vooral elke bewering over de werkwijze: hero-intro, Werkwijze, OverPaul (de zinnen "zonder studio en met natuurlijk licht, op de plek waar jij bent" en "ik neem de tijd voor de persoon voor de camera"), de vijf antwoorden bij Vragen (kleding, plek, keuze van een fotograaf) en de pakketomschrijvingen. In het antwoord op "Waar vindt de portretsessie plaats?" staat één zin die niet in de opdracht stond ("Geef je wens door in het aanvraagformulier."), alleen om naar `#aanvragen` te kunnen linken.
- [ ] **/portretfotos, De Gaarkeuken**: bevestig dat `/de-gaarkeuken` het project is van de portretserie bij een gaarkeuken in Rusland en voeg jaartal en plaats van de serie toe (OverPaul en hero-intro).
- [ ] **/portretfotos, foto's** (`hero.fotos` en `impressie.fotos` in `src/data/landing/portretfotos.ts`; bronnen in `src/assets/portfolio/portretten/`, allemaal staand 600 × 900 px): (1) alt-teksten laten controleren (beschreven naar wat te zien is; geen plek benoemd, want op deze close-ups is die nauwelijks te zien); (2) foto's van een sessie op locatie (thuis, op het werk, buiten) aanleveren: alle zeven zijn close-ups met een onscherpe achtergrond; (3) bronnen van minimaal 1400 px breed: de Open Graph-afbeelding (1200 × 630, uit de eerste hero-foto) wordt nu uit 600 px opgeschaald, en op desktop staat elke hero-foto op circa 32vw (463 px op 1440 px breed); (4) op mobiel toont de hero alleen de tweede foto (`MOBIEL_FOTOS` in `LandingHero.astro`), rand tot rand; een staande foto is daar 1,5 × de schermbreedte hoog (585 px op 390 px breed), veel hoger dan de liggende foto op de bruiloftpagina. Bevestig dat dat de bedoeling is. (Voor staande foto's is in `LandingHero.astro` de mobiele `flex` op `1 1 0` gezet, zodat de foto de hele breedte vult; voor liggende foto's, dus de bruiloftpagina, verandert er niets: pixel-identiek gecontroleerd.)
- [ ] **/portretfotos, formulier en /bedankt**: laat de mailtekst (`src/lib/formulieren/portret.ts`), de intro en privacytekst (`formulier` in `portretfotos.ts`) en de drie bedankstappen voor het portret ("Ik lees je aanvraag." / "Ik stuur je een voorstel voor een moment en een plek." / "Daarna maken we de afspraken definitief.", export `stappen` in `portret.ts`) goedkeuren. Het veld "Aantal personen" is optioneel gemaakt (de opdracht noemde het niet als verplicht): bevestig dat dat de bedoeling is.
- [ ] **Portretingang**: "portret" in de navigatie (`NAV`) en "Portret" in de footer (`FOOTER_NAV`) wijzen naar `/portretfotos`. De dienst "Portretten" bij Diensten, "Portret aanvragen" in `home.cta` (nog niet getoond) en de 404-pagina wijzen nog naar `/zakelijke-portretfoto` (bestaat nog niet, 404). Beslis of die ook naar `/portretfotos` moeten tot die pagina er is.

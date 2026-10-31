# SEO-architectuur paulbreuker.nl

Opgesteld op 28 oktober 2026 op basis van de briefing en een check van de huidige homepage.

## 1. Uitgangssituatie (huidige site)

- Platform: Joomla met YOOtheme. De nieuwe site vervangt dit volledig.
- Alleen de homepage is bekeken. Subpagina's, rankings en backlinks nog niet: haal die uit Search Console voordat de redirectlijst definitief is.
- De navigatie bestaat uit 10 serie-pagina's, platte URL's zonder submap. Deze URL's bestaan al en kunnen backlinks en rankings hebben:
  - /asty-mwaka
  - /love-marriage
  - /de-gaarkeuken
  - /groeten-uit-lent
  - /take-me-to-the-river
  - /asfalt
  - /panoramas
  - /portretten
  - /het-gezicht-van-nijmegen
  - /promoties

  Van deze tien paden op de oude site zijn zeven projecten. De nieuwe site heeft tien projecten en voegt /tradities, /oude-honden en /elaia toe. /panoramas is geen project, /portretten is een oude URL met een 301 naar /portretfotos (de galerij met alle portretten staat op /portfolio/portretten) en /promoties is een redirect. Zie de tabel in sectie 2 (laag 2).
- Het cv staat op een Joomla-URL met querystring (`/?view=article&id=141:curriculum-vitae&catid=8`). Er is geen /over-paul-pagina; de URL toont de homepage en heeft geen eigen redirect.
- Het e-mailadres zit achter JavaScript-bescherming en is voor crawlers onzichtbaar. In de nieuwe site staat het gewoon als tekst met `mailto:`.
- De homepage heeft voor zover te zien geen commerciële zoekintentie: geen prijzen, geen "trouwfotograaf", geen "zakelijke portretfoto". Dat is de grootste SEO-winst.
- Host: www.paulbreuker.nl stuurt nu door naar paulbreuker.nl (zonder www). Kies bewust één canonieke host. Advies: houd paulbreuker.nl aan, want alle bestaande interne links wijzen daarheen. Redirect www naar apex in Vercel.

## 2. Sitestructuur en URL's

Principe: één primair zoekwoord per URL. Commerciële pagina's en kunstseries hebben bewust verschillende URL's en intenties, zodat ze elkaar niet kannibaliseren.

### Laag 1: geld-pagina's (aanvragen)

| URL | Doel / primair zoekwoord | Eindigt in |
|---|---|---|
| `/` | Merk + wie is Paul + drie ingangen (bruiloft, portret, kunst) | Doorverwijzen + contact |
| `/fotograaf-bruiloft` | fotograaf bruiloft (algemene bruiloftpagina). Twee opties: Digitaal vanaf €3.950 en Volledig analoog €6.950, combinatie op aanvraag (bedragen uit `bruiloft-pakketten.ts`; nergens een aantal foto's), werkwijze, reviews, FAQ | Bruiloftformulier |
| `/trouwfotograaf-nijmegen` | trouwfotograaf nijmegen. Gereserveerd voor een latere lokale pagina met eigen inhoud | Bruiloftformulier |
| `/trouwfotograaf-arnhem` | trouwfotograaf arnhem. Lokale bruiloftspagina, dezelfde indeling als /trouwfotograaf-nijmegen | Bruiloftformulier |
| `/trouwlocaties/[locatie]` | trouwen op/in [locatie] + fotograaf. Alleen locaties waar Paul echt heeft gefotografeerd | Bruiloftformulier |
| `/portretfotos` | portretfoto laten maken (particulier, zakelijk en LinkedIn; op locatie, natuurlijk licht). Geen aparte pagina /zakelijke-portretfoto | Portretformulier |
| `/linkedin-foto-laten-maken` | linkedin foto laten maken. Eigen pagina, want andere intentie dan teams | Portretformulier |
| `/teamfoto-laten-maken` | teamfoto / personeelsfoto. Pas in fase 3 | Portretformulier |

/trouwfotograaf-nijmegen en /trouwfotograaf-arnhem zijn lokale bruiloftspagina's met eigen inhoud; /fotograaf-bruiloft is de algemene bruiloftpagina. Geen sjabloonpagina's waarbij alleen de plaatsnaam wisselt.

/trouwfotograaf-nijmegen bestaat: de lokale bruiloftspagina (primair zoekwoord "trouwfotograaf nijmegen"; data in `src/data/landing/trouwfotograaf-nijmegen.ts`); /fotograaf-bruiloft blijft de algemene pagina. /trouwfotograaf-arnhem bestaat: de lokale bruiloftspagina (primair zoekwoord "trouwfotograaf arnhem"; data in `src/data/landing/trouwfotograaf-arnhem.ts`), met dezelfde indeling als /trouwfotograaf-nijmegen.

### Laag 2: autoriteit en kunst

| URL | Inhoud |
|---|---|
| `/series` | Overzicht van de tien projecten (kaarten met foto en titel). Blijft het zoekmachinevriendelijke serie-overzicht. Hernoemd van `/werk`, dat een 301 naar `/series` heeft |
| `/portfolio` | Beleving: alle foto's op één oneindig, sleepbaar canvas. Indexeerbaar, in de sitemap en in de afbeeldingensitemap (`/sitemap-images.xml`), maar lage SEO-prioriteit: geen eigen zoekwoorddoel naast /series en de seriepagina's. Zonder header en footer (home-knop en link naar contact) De foto's komen uit alle mappen onder `src/assets/portfolio/` (ook nieuwe mappen, ontdubbeld); een nieuwe map levert alleen foto's voor /portfolio en wordt nooit automatisch een project, pagina of kaart: een project bestaat pas in `src/data/series.ts`. |
| `/portfolio/bruiloften` | Galerij-pagina: alle bruiloftfoto's van Paul (map `bruiloften portfolio`) op hetzelfde canvas als /portfolio (gedeeld component `FotoCanvas`; alle foto's als gewone `<img>` met alt in de HTML). Gelinkt vanaf /fotograaf-bruiloft ("meer werk in het portfolio") en vanaf /portfolio. Indexeerbaar, in de sitemap en de afbeeldingensitemap, lage SEO-prioriteit: geen eigen zoekwoorddoel naast /fotograaf-bruiloft en /love-marriage. JSON-LD: `CollectionPage` met `ImageGallery` |
| `/portfolio/portretten` | Galerij-pagina: alle portretten van Paul op hetzelfde canvas als /portfolio (gedeeld component `FotoCanvas`; alle foto's als gewone `<img>` met alt in de HTML). Gelinkt vanaf /portfolio en vanaf /portretfotos ("bekijk meer portretten →"). Indexeerbaar, in de sitemap en de afbeeldingensitemap, lage SEO-prioriteit: geen eigen zoekwoorddoel naast /portretfotos. JSON-LD: `CollectionPage` met `ImageGallery` |
| Tien projecten: `/asfalt`, `/asty-mwaka`, `/de-gaarkeuken`, `/elaia`, `/groeten-uit-lent`, `/het-gezicht-van-nijmegen`, `/love-marriage`, `/oude-honden`, `/take-me-to-the-river`, `/tradities` | Bestaande slugs behouden (platte structuur), nieuwe teksten en schema. `/tradities`, `/oude-honden` en `/elaia` zijn nieuw: geen oude URL, dus geen redirect nodig. De foto's van `/elaia` staan in de map Olijfbomen. `/panoramas` is geen project en staat niet op /series; per URL beslissen we later (zie README, open punten). `/portretten` is geen eigen pagina meer: oude URL met een 301 (`permanent: true` in `vercel.json`) naar /portretfotos |
| `/exposities` | Kunsthal, Valkhof, Photoville New York, nieuwe exposities als Event |
| `/pers` | Volkskrant, Telegraaf, EenVandaag met link naar het bronartikel |
| `/boek` | Boek, voorintekening of e-maillijst (naam + e-mail) |
| `/contact` | E-mail, telefoon, WhatsApp (optioneel), formulier |
| `/bedankt` | Bedankpagina, `noindex` |

### Laag 3: content (fase 2)

Blogartikelen onder `/blog/[slug]`, elk met één doelpagina uit laag 1 waarnaar het linkt:

- Wat kost een trouwfotograaf? (linkt naar /fotograaf-bruiloft)
- Hoe kies je een trouwfotograaf? (zelfde doelpagina)
- Trouwlocatiegidsen per locatie (linkt naar de bijbehorende /trouwlocaties/-pagina)
- Een goede LinkedIn-foto: waar let je op? (linkt naar /linkedin-foto-laten-maken)

### /promoties: 301 naar de Radboud-site

De Radboud-site voor promotiefotografie blijft apart. De bestaande `/promoties` krijgt een permanente 301 naar https://www.fotograafpromotiesradboud.nl/ en komt dus niet terug als pagina op de nieuwe site.

- Haal `/promoties` ook uit de navigatie, de sitemap en de interne links van de nieuwe site.
- Controleer in Search Console of `/promoties` backlinks of rankings heeft. Via de 301 gaat die waarde naar de Radboud-site.
- Links in de andere richting (Radboud-site naar paulbreuker.nl) zijn waardevol: plaats ze contextueel (bijvoorbeeld bij "portretten voor wetenschappers"), niet alleen in een voettekst.
- Op `/portretfotos` staat een tekstlink naar de Radboud-site voor wie een promotiefoto zoekt, zodat bezoekers met die intentie het juiste aanbod vinden.

## 3. Technische setup (Astro op Vercel)

- Astro met statische output, standaard vrijwel zonder JavaScript. Alleen het formulier-endpoint draait on-demand (`prerender = false`). Alle content staat in de initiële HTML. Interactieve onderdelen (galerij, lightbox) zijn islands met `client:visible` of `client:idle`.
- Eén `BaseLayout` met een `SEOHead`-component die per pagina zorgt voor: unieke `title` (rond 60 tekens), `description` (rond 155 tekens), `canonical`, Open Graph en Twitter-kaarten, en JSON-LD.
- Eén H1 per pagina, logische H2/H3-hiërarchie.
- `@astrojs/sitemap` (met filter voor `/bedankt`) en `src/pages/robots.txt.ts`. De sitemap bevat alleen indexeerbare, canonieke URL's. Stel `lastmod` in waar je echte wijzigingsdata hebt. Afbeeldingensitemap: `src/pages/sitemap-images.xml.ts` (alle foto's van /portfolio en /portfolio/portretten, grootste variant), vermeld in `robots.txt`.
- Afbeeldingen: `<Image>` of `<Picture>` uit `astro:assets`, AVIF/WebP, vaste `width`/`height`, `loading="eager"` met `fetchpriority="high"` alleen op het LCP-beeld, `sizes` correct instellen, lazy loading voor de rest. Alt-teksten in het Nederlands en beschrijvend, geen keyword stuffing.
- Prestatiedoelen (mobiel, veldmeting): LCP onder 2,5 s, CLS onder 0,1, INP onder 200 ms. Een beeld-eerst site wint of verliest hier.
- Lettertypen self-hosted (bijvoorbeeld Fontsource) met `font-display: swap`, geen render-blocking externe CSS.
- Animatie: CSS (scroll-driven animations, fade-ins) en Astro View Transitions eerst. Alleen waar dat tekortschiet een island met een animatiebibliotheek. Geen zware scroll-animatie op het LCP-beeld boven de vouw.
- Previews niet indexeerbaar: controleer dat preview-deployments `noindex` serveren. Productie niet.
- 404-pagina met links naar de drie ingangen.
- IndexNow of handmatige indexering via Search Console na livegang voor de laag 1-pagina's.
- AI-crawlers (GPTBot, ClaudeBot, PerplexityBot e.d.) niet blokkeren in `robots.txt`. Optioneel een `llms.txt` met de belangrijkste pagina's.

## 4. Structured data (JSON-LD)

| Waar | Type |
|---|---|
| Overal | `WebSite`, `BreadcrumbList` |
| Home / contact | `LocalBusiness` (of `ProfessionalService`) met adres, telefoon, e-mail, werkgebied, `sameAs` (Instagram, LinkedIn, Facebook, Singulart) |
| Bruiloft- en portretpagina's | `Service` met `Offer` en `priceSpecification` (vanaf-prijs), `areaServed` |
| Serie-pagina's | `ImageGallery` / `ImageObject` met `creator`, `copyrightNotice`, `creditText`; optioneel `license` en `acquireLicensePage` |
| /exposities | `Event` alleen voor aankomende exposities met echte data; verleden als gewone tekst |
| /boek | `Book` met `Offer` zodra het te koop is |
| FAQ-blokken | `FAQPage` is optioneel: de rich result is beperkt, maar de Q&A-structuur helpt AI-antwoorden |

Let op: geen `AggregateRating` of `Review`-markup op Pauls eigen pagina's voor zijn eigen bedrijf. Google toont daar geen sterren voor (self-serving reviews). Zet echte reviews zichtbaar op de pagina en verzamel Google-reviews via het bedrijfsprofiel.

## 5. Interne linking

- Home linkt naar de drie ingangen: /fotograaf-bruiloft, /portretfotos, /series.
- Elke serie-pagina linkt naar de relevante commerciële pagina. Voorbeeld: /love-marriage naar /fotograaf-bruiloft met een beschrijvende ankertekst ("fotograaf voor je bruiloft"), en /portfolio/portretten naar /portretfotos.
- Elke commerciële pagina linkt terug naar 2 tot 3 relevante series als bewijs.
- Blog en locatiepagina's linken omhoog naar hun doelpagina en sideways naar verwante locaties.
- Header en footer: e-mail en telefoon zichtbaar op elke pagina; navigatie met maximaal 6 items.
- Geen orphan pages: elke indexeerbare pagina krijgt minstens drie interne links.

## 6. Tekst op een beeld-eerst site

De toon is rustig en visueel, maar Google en AI-systemen hebben tekst nodig om een pagina te begrijpen. Oplossing: beeld boven de vouw, daaronder 300 tot 600 woorden echte tekst op de geld-pagina's.

- Bruiloftpagina: wat Paul anders doet, hoe een dag eruitziet, pakketten en prijzen, locaties, FAQ, reviews.
- Portretpagina: voor wie, hoe een sessie werkt, vanaf-prijs, wat je krijgt, formulier.
- Serie-pagina's: een korte inleiding van Paul in de ik-vorm, bijschriften en jaartal/plaats per serie.
- Houd de toon aan uit de briefing: persoonlijk, bewijs in plaats van claims, geen superlatieven.

Volgorde commerciële landingspagina (bindend): De secties op een landingspagina staan altijd in deze volgorde: Hero, Werkwijze, Pakketten, Impressie, OverPaul, Vragen, Uitleg, Reviews, Aanvraagformulier, Beeld (foto van rand tot rand, geen kop). Daarna volgt de gedeelde footer. Een sectie wordt alleen getoond als de data ervoor bestaat; de volgorde verandert nooit. (De oude volgorde met Impressie vóór Pakketten en Uitleg vóór Pakketten vervalt.) Elke sectie zit in een eigen wrapper met --sectie-ruimte; geen margins die van buren afhangen. Werkwijze is een korte statement-sectie (geen kop); Pakketten heeft als titel (marquee) de eerste H2 en Impressie de tweede; de overige H2's van de pagina staan in Uitleg.

Paul werkt voor klantsessies niet in een studio. Gebruik de woorden studio, fotostudio en studiosessie niet voor het aanbod aan klanten. In teksten over bestaande projecten (zoals Asty Mwaka en Take me to the river) mag het woord voorkomen als het zo in Pauls eigen tekst staat. Controleer het woord "studio" alleen op de pagina's met aanbod (/portretfotos, /fotograaf-bruiloft). Hij fotografeert in natuurlijk licht, bij de klant thuis, op het werk, buiten of op een plek die de klant kiest. Hij maakte een portretserie bij een gaarkeuken in Rusland (project De Gaarkeuken, /de-gaarkeuken).

Elke commerciële portretpagina (/portretfotos) verwijst terug naar /portfolio/portretten en /de-gaarkeuken als bewijs.

## 7. Conversie

- Elke bruiloft- en portretpagina eindigt in een kort formulier. Bruiloftformulier: datum en locatie bovenaan.
- Verzenden leidt naar /bedankt (`noindex`) met uitleg wat er nu gebeurt, plus een automatische bevestigingsmail. Paul reageert binnen 3 werkdagen.
- Meet formulierverzendingen als conversie (GA4-event `generate_lead`, met type bruiloft/portret/editie). Meet ook klikken op telefoon, e-mail en WhatsApp.
- Spamwering: honeypot of Cloudflare Turnstile, geen zware CAPTCHA.
- Vertrouwen bij het formulier: 2 tot 3 echte reviews en het aantal bruidsparen. Controleer de "rond 200 in 2014"-claim (Kunsthal) en zet er het jaartal bij.

## 8. Migratie en lancering

1. Voor livegang: exporteer uit Search Console de top-pagina's en -zoekopdrachten, inclusief afbeeldingsverkeer. Inventariseer backlinks.
2. Bouw een redirectmap (in `vercel.json`, met `permanent: true`) voor elke oude URL die niet 1:1 terugkomt. Behoud de serie-slugs waar mogelijk. Vaste regels: `/promoties` naar https://www.fotograafpromotiesradboud.nl/, `/werk` naar `/series`, `/portretten` naar `/portretfotos` (ook met trailing slash, in één stap). De Joomla-cv-URL krijgt geen redirect (er is geen cv-pagina; de URL toont de homepage).
3. Test redirects op een preview voordat het domein wordt omgezet. Geen redirectketens.
4. Na livegang: sitemap indienen, URL's laten inspecteren, 4 weken lang wekelijks dekking en rankings bekijken.
5. Controleer of oude afbeeldings-URL's (`/images/...`) significant verkeer hadden. Zo ja, redirect de belangrijkste.

## 9. Fasering

- Fase 1 (lancering): home, /fotograaf-bruiloft, /portretfotos, 8 projecten, /series, /exposities, /pers, /boek, /contact, /bedankt, redirects, schema, sitemap, meting.
- Fase 2 (maand 1 tot 3): 5 tot 10 trouwlocatiepagina's, eerste 5 blogartikelen, Google-reviews opbouwen.
- Fase 3 (daarna): teamfoto's, uitbreiding blog en locaties op basis van wat Search Console laat zien. /trouwfotograaf-arnhem bestaat (lokale bruiloftspagina, primair "trouwfotograaf arnhem", dezelfde indeling als /trouwfotograaf-nijmegen).

## 10. Risico's en open punten

- Locatiepagina's alleen publiceren met echte, eigen foto's en feiten. Sjabloonpagina's met alleen een andere plaatsnaam zijn dunne content.
- Google Bedrijfsprofiel (lokale pakket bij "trouwfotograaf nijmegen") is voor lokale zichtbaarheid minstens zo belangrijk als de site. Claim of optimaliseer het profiel en vraag reviews aan.
- Zoekvolumes en concurrentie zijn nog niet gemeten. Doe keywordonderzoek voordat de titels en H1's vastliggen.
- Bevestig de canonieke host (met of zonder www).

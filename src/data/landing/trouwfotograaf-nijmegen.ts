/**
 * Data voor /trouwfotograaf-nijmegen (lokale bruiloftspagina, primair zoekwoord "trouwfotograaf nijmegen"; bijzoekwoorden
 * "bruidsfotograaf nijmegen", "fotograaf bruiloft nijmegen" en "trouwreportage nijmegen"). /fotograaf-bruiloft blijft de
 * algemene bruiloftpagina; /trouwfotograaf-arnhem volgt later volgens hetzelfde patroon, met eigen inhoud.
 *
 * Alle lopende tekst, de titel, de H1, de inleiding, de vragen en de fotoselectie zijn eigen inhoud: er staat geen alinea
 * van /fotograaf-bruiloft in en geen foto uit de hero, de Impressie of het Beeld van die pagina. Uitzondering: de
 * Werkwijze-sectie is dezelfde als op /fotograaf-bruiloft (`bruiloftWerkwijze`).
 *
 * Sectievolgorde (op uitdrukkelijk verzoek afwijkend van de bindende landingsvolgorde; zie `pakkettenPlek`, `overPaulPlek` en `uitlegPlek` hieronder en
 * LandingLayout.astro): Hero, Werkwijze, Impressie, OverPaul, Pakketten, twee Uitleg-blokken (Trouwen in Nijmegen, Plekken in
 * Nijmegen voor trouwfoto's), Locaties
 * (leeg: niet getoond), Vragen, Reviews (ontbreekt: geen echte reviews), Aanvraagformulier. Beeld ontbreekt bewust.
 *
 * De Uitleg-blokken zijn eigen inhoud in de jullie-vorm (feiten over trouwen in Nijmegen) of de ik-vorm (Paul). Ze bedienen
 * elk een eigen zoekvraag naast het hoofdzoekwoord "trouwfotograaf nijmegen": "trouwen in Nijmegen" en "trouwfoto's Nijmegen
 * locaties". De pagina heeft geen FAQPage in de JSON-LD
 * (`schema.faqSchema: false`); de vragen blijven zichtbaar.
 *
 * Pakketten en prijzen (Digitaal, Volledig analoog) komen uit `bruiloft-pakketten.ts`, dezelfde bron als /fotograaf-bruiloft.
 * Het formulier is het bruiloftformulier (src/lib/formulieren/bruiloft.ts), met het veld "pakket".
 *
 * TODO(paul): bevestig dat Paul in Nijmegen woont en werkt (vestiging, gemeente; Lent valt onder Nijmegen).
 * De hero-intro is de tekst van Paul (30 oktober 2026): bruiloftsfoto's op Photoville en in de Kunsthal, plus de drie
 * series (Het gezicht van Nijmegen in Museum het Valkhof, Take me to the river op de Waalbrug in de lente van 2016,
 * Groeten uit Lent "al zestien jaar").
 * TODO(paul): werkgebied bevestigen ("heel Gelderland" in OverPaul en het antwoord op de vraag over bruiloften buiten Nijmegen).
 * TODO(paul): alle teksten op deze pagina zijn concepten in de ik-vorm; laat ze door Paul goedkeuren.
 */
import type { LandingPagina, LandingUitlegBlok } from './types';
import { bruiloftPakketPrijs, bruiloftVanPrijs, pakketten, pakkettenNoot, pakkettenNootPakket } from './bruiloft-pakketten';
import { bruiloftWerkwijze } from './fotograaf-bruiloft';
import { PRIVACY } from '../site';
import { euro } from '../../lib/prijs';
import paulFoto from '../../assets/landing/paul.webp';
import heroFoto1 from '../../assets/portfolio/bruiloften portfolio/029d.jpg';
import heroFoto2 from '../../assets/portfolio/bruiloften portfolio/083.jpg';
import heroFoto3 from '../../assets/portfolio/bruiloften portfolio/127.jpg';
import impressie1 from '../../assets/portfolio/bruiloften portfolio/123.jpg';
import impressie2 from '../../assets/portfolio/bruiloften portfolio/023t.jpg';
import impressie3 from '../../assets/portfolio/bruiloften portfolio/7.jpg';
import impressie4 from '../../assets/landing/nijmegen/DSC06207.jpg';
import trouwenFoto from '../../assets/landing/nijmegen/DSC05996.jpg';
import plekkenFoto from '../../assets/landing/nijmegen/DSC07297.jpg';

/** Prijs van een pakket uit `pakketten` als "€3.950"; title, description, tekstblokken en vragen gebruiken dit, zodat de prijzen nooit kunnen afwijken. */
function pakketPrijs(naam: string): string {
  return euro(bruiloftPakketPrijs(naam));
}

/** Laagste pakketprijs in euro's (de vanaf-prijs in title, description en JSON-LD). */
const laagste = bruiloftVanPrijs;

// ---------------------------------------------------------------------------
// Uitleg-blokken (zie LandingUitleg.astro). Elk blok is een eigen sectie met een <h2>; subkoppen zijn <h3>.
// ---------------------------------------------------------------------------

const GEMEENTE_TROUWEN_URL = 'https://www.nijmegen.nl/trouwen-scheiden/trouwen/';

/**
 * Blok 1: "Trouwen in Nijmegen: wat je moet weten" (zoekvraag "trouwen in Nijmegen"). Jullie-vorm.
 *
 * Bron: sdg.government.nl (Municipality of Nijmegen: applying to get married), opgehaald 30 oktober 2026. De regels over de
 * locatie, het reserveren (tot een jaar vooruit) en de duur van een uitgebreide ceremonie (30 tot 45 minuten) zijn op
 * dezelfde dag ook op nijmegen.nl gecontroleerd (Trouwen, Trouwlocaties). De link
 * gaat naar https://www.nijmegen.nl/trouwen-scheiden/trouwen/ (status 200, 30 oktober 2026; de oudere URL
 * /diensten/trouwen-partnerschap-scheiden/trouwen toont dezelfde inhoud).
 * TODO(paul): controleer deze alinea vlak voor livegang op nijmegen.nl (locaties, tarieven en regels kunnen veranderen).
 */
const blokTrouwen: LandingUitlegBlok = {
  id: 'trouwen-in-nijmegen',
  label: '(trouwen)',
  // Kleine foto linksonder, uit `bruiloften recent` (niet een van de hero- of impressiefoto's).
  foto: {
    afbeelding: trouwenFoto,
    alt: 'Een kind in een witte kanten jurk kijkt binnen in de camera. De vlechten zijn met een oranje elastiek bijeengebonden.',
  },
  kop: 'Trouwen in Nijmegen: wat je moet weten',
  inhoud: [
    // De tekst is één alinea in de opdracht; hier op zinsgrenzen in drie korte alinea's gesplitst (maximaal 5 regels op desktop).
    {
      soort: 'alinea',
      tekst: [
        'In Nijmegen kunnen jullie trouwen in het stadhuis of in de Stadswinkel, maar ook op een andere plek in de stad. Die plek moet een bestaand gebouw zijn, voor iedereen toegankelijk, en door de gemeente zijn aangewezen als trouwlocatie.',
      ],
    },
    {
      soort: 'alinea',
      tekst: [
        'Kiezen jullie voor een andere locatie dan het stadhuis, dan reserveren jullie die eerst zelf bij de organisatie en geven jullie dat daarna door in de aanvraag bij de gemeente.',
      ],
    },
    {
      soort: 'alinea',
      tekst: ['Een datum kunnen jullie tot een jaar vooruit reserveren. Een uitgebreide ceremonie duurt ongeveer 30 tot 45 minuten.'],
    },
    {
      soort: 'alinea',
      tekst: [
        'Boek jullie fotograaf zodra de datum en de locatie vaststaan. Dan kunnen we de tijden van de ceremonie, de borrel en de portretten op elkaar afstemmen. De actuele locaties, tarieven en regels staan op de website van de ',
        { tekst: 'gemeente Nijmegen', href: GEMEENTE_TROUWEN_URL, extern: true },
        '; die kunnen veranderen.',
      ],
    },
  ],
};

/**
 * Blok 2: "Plekken in Nijmegen voor trouwfoto's" (zoekvraag "trouwfoto's Nijmegen locaties").
 *
 * Bron voor de parken: intonijmegen.com (3x parks in Nijmegen's city centre,
 * https://en.intonijmegen.com/discover/the-best-of-nijmegen/x-parks-in-nijmegens-city-centre; Nederlandse versie:
 * https://www.intonijmegen.com/ontdek-nijmegen/wijken-in-nijmegen/binnenstad/parken-nijmegen), opgehaald 30 oktober 2026.
 * Het tramwachthuisje van de kiosk in het Hunnerpark en de resten van de stadsmuur zijn ook bevestigd op
 * nijmegen.nl/evenementen/evenementenlocaties/hunnerpark/. De Waalbrug-zin is Pauls eigen werk (Take me to the river, 2016).
 * TODO(paul): vervang de intro "Een paar die ik ken" zo nodig door Pauls eigen ervaring op deze plekken en voeg zijn eigen
 * tips en plekken toe; verzin ze niet.
 */
const blokPlekken: LandingUitlegBlok = {
  id: 'plekken-in-nijmegen',
  label: '(plekken)',
  // Kleine foto linksonder, uit `bruiloften recent`, zelfde plek als bij "Trouwen in Nijmegen".
  foto: {
    afbeelding: plekkenFoto,
    alt: 'Op de achterbank van een auto zitten een vrouw met een bril en een gele bloemenjurk en een man in een lichtblauw pak met een bloem op de revers. Ze lachen.',
  },
  kop: 'Plekken in Nijmegen voor trouwfoto’s',
  inhoud: [
    {
      soort: 'alinea',
      tekst: ['Nijmegen heeft in het centrum meerdere plekken die goed werken voor trouwfoto’s. Een paar die ik ken:'],
    },
    { soort: 'kop', tekst: 'Valkhofpark' },
    {
      soort: 'alinea',
      tekst: [
        'Het oudste park van Nijmegen, op een heuvel aan de Waal en naast Museum Het Valkhof. In het park staat de Sint-Nicolaaskapel, die van 1 april tot het laatste weekend van oktober open is.',
      ],
    },
    { soort: 'kop', tekst: 'Hunnerpark' },
    {
      soort: 'alinea',
      tekst: ['Ligt direct naast het Valkhofpark. Je ziet er nog een deel van de oude stadsmuur en een kiosk in een verbouwd tramwachthuisje.'],
    },
    { soort: 'kop', tekst: 'Kronenburgerpark' },
    { soort: 'alinea', tekst: ['Met een vijver, een oude stadsmuur en de Kronenburgertoren.'] },
    { soort: 'kop', tekst: 'Waalbrug en de Waal' },
    {
      soort: 'alinea',
      tekst: [
        'De Waalbrug ken ik van dichtbij: in de lente van 2016 fotografeerde ik er voor ',
        { tekst: 'Take me to the river', href: '/take-me-to-the-river' },
        '.',
      ],
    },
    {
      soort: 'alinea',
      tekst: [
        'Welke plek past, hangt af van jullie dag, het licht en de tijd die er is. Dat bespreken we tijdens de kennismaking.',
      ],
    },
  ],
};

export const trouwfotograafNijmegen: LandingPagina = {
  slug: 'trouwfotograaf-nijmegen',

  seo: {
    title: `Trouwfotograaf Nijmegen | Paul Breuker, vanaf ${euro(laagste)}`,
    // TODO(paul): bevestig "Nijmegen" als vestigingsplaats en werkgebied.
    description: `Trouwfotograaf in Nijmegen. Paul Breuker is de hele dag aanwezig en maakt een ingebonden fotoboek. Digitaal ${pakketPrijs('Digitaal')}, volledig analoog ${pakketPrijs('Volledig analoog')}.`,
  },

  breadcrumb: 'Trouwfotograaf Nijmegen',

  /**
   * Hero. De H1 breekt niet af op 390 px (gecontroleerd; zie README).
   * TODO(paul): bevestig dat Paul in Nijmegen woont en werkt (vestiging, gemeente). De intro is de tekst van Paul.
   * Hero-fotostrip: drie liggende foto's (3:2) uit de map `bruiloften portfolio` (src/assets/portfolio/bruiloften portfolio/),
   * in volgorde (desktop alle drie, mobiel alleen de tweede, zie MOBIEL_FOTOS in LandingHero.astro):
   *  1. 029d.jpg = zwart-witfoto van een bruid die over een dijkje wordt geholpen (LCP en Open Graph)
   *  2. 083.jpg  = zwart-witfoto van twee bruidsmeisjes en een bruid in een park
   *  3. 127.jpg  = een oude vrouw en een jonge vrouw reiken door een autoraam naar elkaar toe
   * Geen van deze drie staat op /fotograaf-bruiloft.
   * TODO(paul): keuring van de hero-foto's en hun alt-teksten (beschreven naar wat te zien is, zonder namen of plaatsen).
   */
  hero: {
    h1: 'Trouwfotograaf Nijmegen',
    intro: [
      [
        'Ik woon en werk in Nijmegen en fotografeer hier bruiloften. Mijn bruiloftsfoto’s hingen onder meer op Photoville in New York en in de Kunsthal in Rotterdam. De stad ken ik ook uit mijn eigen werk: ',
        { tekst: 'Het gezicht van Nijmegen', href: '/het-gezicht-van-nijmegen' },
        ' hing in Museum het Valkhof, voor ',
        { tekst: 'Take me to the river', href: '/take-me-to-the-river' },
        ' fotografeerde ik in de lente van 2016 op de Waalbrug, en ik maak al zestien jaar ',
        { tekst: 'Groeten uit Lent', href: '/groeten-uit-lent' },
        '.',
      ],
    ],
    // #aanvragen (Aanvraagformulier) en #pakketten (Pakketten) bestaan.
    ctaPrimair: { label: 'Bruiloft aanvragen', href: '#aanvragen' },
    ctaSecundair: { label: 'Bekijk de pakketten', href: '#pakketten' },
    fotos: [
      {
        afbeelding: heroFoto1,
        alt: 'Zwart-witfoto aan het water: een man in pak helpt een bruid in een lichte jurk over een dijkje van aarde, met bomen die weerspiegelen in het water.',
      },
      {
        afbeelding: heroFoto2,
        alt: 'Zwart-witfoto in een park: een bruid en bruidegom lopen weg, terwijl op de voorgrond twee kleine meisjes in lichte jurkjes staan en op de achtergrond twee mensen op scootmobielen voorbijkomen.',
      },
      {
        afbeelding: heroFoto3,
        alt: 'Een oudere vrouw met wit haar en een bril reikt vanaf een bospad naar de hand van een jonge vrouw, die vanuit een auto door het open raam naar buiten reikt.',
      },
    ],
  },

  werkwijze: bruiloftWerkwijze,

  pakketten,
  // Noot onder de pakketten; "op aanvraag" is de link naar #aanvragen en vult "combinatie" in het formulier in.
  pakkettenNoot,
  pakkettenNootPakket,

  /**
   * Locaties ("Waar ik fotografeer in Nijmegen"): bewust leeg, dus de sectie verschijnt niet.
   * TODO(paul): locaties in en rond Nijmegen waar Paul echt heeft gefotografeerd (naam, plaats en eventueel een slug voor
   * een latere /trouwlocaties/[slug]-pagina). Verzin geen plekken.
   */
  locaties: {
    titel: 'Waar ik fotografeer',
    items: [],
  },

  /**
   * Impressie: vier liggende foto's (3:2) in de diagonale indeling (twee rijen van twee, zie LandingImpressie.astro).
   * De eerste drie komen uit `bruiloften portfolio` en staan niet op /fotograaf-bruiloft. De vierde (rechtsonder) komt
   * uit `bruiloften recent`. Volgorde:
   *  1. 123.jpg    = ceremonie op een zandstrand aan de rivier
   *  2. 023t.jpg   = twee kinderen in een geopende zwarte oldtimer
   *  3. 7.jpg      = een baby wordt in de gootsteen gewassen
   *  4. DSC06207.jpg = een bruid tilt haar sluier op, met gasten eromheen
   * TODO(paul): keuring van deze vier foto's en hun alt-teksten (beschreven naar wat te zien is, zonder namen of plaatsen).
   */
  impressie: {
    titel: 'Impressie',
    fotos: [
      {
        afbeelding: impressie1,
        alt: 'Op een zandstrand aan de rivier omhelzen gasten elkaar naast een tafel met roze en blauwe linten en een man in een donkere toga; op de achtergrond ligt een boot.',
      },
      {
        afbeelding: impressie2,
        alt: 'Een jongen in een donker pak en een meisje in een wit jurkje zitten in een geopende zwarte oldtimer op het gras; naast haar ligt een boeket.',
      },
      {
        afbeelding: impressie3,
        alt: 'In een keuken wast een vrouw in een bloemetjesjurk een baby in de gootsteen. Achter haar filmt een man met een videocamera en staat een man in pak bij de open deur.',
      },
      {
        afbeelding: impressie4,
        alt: 'Op de voorgrond lacht een man in een donker pak in de camera. Achter hem tilt een bruid in een witte jurk haar sluier op; een vrouw met een oranje sjaal staat met de rug naar de camera en rechts kijkt een vrouw met gouden oorringen toe.',
      },
    ],
    // /portfolio/bruiloften bestaat: alle bruiloftfoto's op het canvas.
    link: { label: 'Meer bruiloftfoto’s', href: '/portfolio/bruiloften' },
  },

  /**
   * Uitleg: twee blokken met elk een eigen zoekvraag (zie de consten hierboven), direct na Pakketten.
   * `pakkettenPlek`, `overPaulPlek` en `uitlegPlek` zijn de uitdrukkelijk gevraagde afwijking van de bindende
   * landingsvolgorde (zie LandingLayout.astro); andere pagina's hebben deze velden niet.
   */
  pakkettenPlek: 'na-impressie',
  overPaulPlek: 'voor-pakketten',
  uitleg: [blokTrouwen, blokPlekken],
  uitlegPlek: 'na-impressie',

  /**
   * OverPaul: dezelfde twee alinea's als "(over paul)" op de homepage (tekst van Paul, 30 oktober 2026).
   * TODO(paul): de foto van Paul in hogere resolutie aanleveren (nu 400 × 400 px, zie README).
   */
  overPaul: {
    label: 'Over Paul',
    lead: [
      'Ik ben fotograaf in Nijmegen en woon in Lent. Mijn hele fotografieleven werk ik aan series over thema’s die mij raken: leven, dood en geboorte, sociale reportages en rituelen. Sinds 1992 fotografeer ik bruiloften, en dat doe ik nog steeds. Daarnaast maak ik experimenten, tekeningen en schilderijen waarin droedels en organische vormen de basis zijn.',
    ],
    alineas: [
      [
        'Ook portretteer ik graag: staand, half en close-up, alleen, als duo, in een groepje of als groepsportret. Zo werk ik al 35 jaar: bruiloften, kunstseries en portretten.',
      ],
    ],
    links: [],
    foto: {
      afbeelding: paulFoto,
      alt: 'Zwart-witportret van fotograaf Paul Breuker',
    },
  },

  /**
   * Vragen: tien vragen, elk als <h3> onder de <h2> "Veelgestelde vragen" (`vraagAlsKop`). Antwoorden van 30 tot 80
   * woorden. De prijzen komen uit `pakketten`. Waar een feit ontbreekt, noemt de zichtbare tekst alleen wat bekend is;
   * het ontbrekende staat hieronder als TODO(paul). Er is bewust geen FAQPage in de JSON-LD (`schema.faqSchema: false`).
   */
  // TODO(paul): antwoorden door Paul laten goedkeuren.
  vragen: {
    titel: 'Veelgestelde vragen',
    vraagAlsKop: true,
    items: [
      {
        vraag: 'Wat kost een trouwfotograaf in Nijmegen?',
        // TODO(paul): reiskosten binnen Nijmegen (nu niet genoemd); inclusief of exclusief btw.
        antwoord: [
          [
            `Een bruiloft fotograferen kost bij mij ${pakketPrijs('Digitaal')} (Digitaal): ik ben dan van ’s ochtends vroeg tot ’s avonds laat aanwezig en maak er een ingebonden fotoboek bij. Volledig analoog kost het ${pakketPrijs('Volledig analoog')}. Een combinatie van digitaal en analoog is op aanvraag mogelijk.`,
          ],
          [
            'Wat er per pakket bij hoort, zie je bij ',
            { tekst: 'de pakketten', href: '#pakketten' },
            '.',
          ],
        ],
      },
      {
        vraag: 'Is een trouwfotograaf hetzelfde als een bruidsfotograaf?',
        antwoord: [
          [
            'Meestal wel. De woorden trouwfotograaf, bruidsfotograaf en bruiloftfotograaf worden door elkaar gebruikt voor een fotograaf die een bruiloft vastlegt. Zelf spreek ik van trouwfotograaf of bruiloftfotograaf.',
          ],
          [
            'Waar jullie ook op zoeken: het gaat om hetzelfde werk, het fotograferen van jullie trouwdag. Een trouwreportage noemen sommigen het resultaat: een reeks foto’s van de hele dag.',
          ],
        ],
      },
      {
        vraag: 'Welke plekken in Nijmegen zijn mooi voor trouwfoto’s?',
        // TODO(paul): eigen plekken in Nijmegen waar Paul echt heeft gefotografeerd (ook voor de sectie Locaties).
        antwoord: [
          [
            'Dat hangt af van jullie dag en van het licht. In het centrum zijn dat bijvoorbeeld het Valkhofpark, het Hunnerpark en het Kronenburgerpark; meer daarover staat bij ',
            { tekst: 'plekken in Nijmegen voor trouwfoto’s', href: '#plekken-in-nijmegen' },
            '.',
          ],
          [
            'De Waalbrug ken ik van dichtbij: in de lente van 2016 fotografeerde ik er voor ',
            { tekst: 'Take me to the river', href: '/take-me-to-the-river' },
            '.',
          ],
        ],
      },
      {
        vraag: 'Hoe lang vooraf kunnen we bij de gemeente een datum reserveren?',
        antwoord: [
          [
            'Een datum kunnen jullie bij de gemeente tot een jaar vooruit reserveren. Kiezen jullie voor een andere plek dan het stadhuis, dan reserveren jullie die eerst zelf bij de organisatie.',
          ],
          [
            'Wat er verder bij komt kijken, lees je bij ',
            { tekst: 'trouwen in Nijmegen: wat je moet weten', href: '#trouwen-in-nijmegen' },
            '. De actuele regels staan op de website van de ',
            { tekst: 'gemeente Nijmegen', href: GEMEENTE_TROUWEN_URL, extern: true },
            '.',
          ],
        ],
      },
      {
        vraag: 'Fotografeer je ook in plaatsen rond Nijmegen, zoals Lent, Wijchen, Beuningen of Groesbeek?',
        // TODO(paul): bevestig in welke plaatsen rond Nijmegen Paul bruiloften fotografeert (Wijchen, Beuningen, Groesbeek) en met welke reiskosten.
        antwoord: [
          [
            'Lent ken ik uit eigen werk: voor ',
            { tekst: 'Groeten uit Lent', href: '/groeten-uit-lent' },
            ' fotografeerde ik zestien jaar lang het dorp en de mensen die er wonen.',
          ],
          [
            'Vind je bruiloft ergens anders in de buurt plaats, bijvoorbeeld in Wijchen, Beuningen of Groesbeek? Geef de plaats dan door in het ',
            { tekst: 'aanvraagformulier', href: '#aanvragen' },
            ', dan laat ik je binnen 24 uur weten of het kan.',
          ],
        ],
      },
      {
        vraag: 'Kunnen we kennismaken voordat we boeken?',
        // TODO(paul): waar en hoe de kennismaking plaatsvindt (bij jullie thuis, bij Paul, online) en hoe lang ze duurt.
        antwoord: [
          [
            'Ja, een kennismaking vooraf hoort erbij. Stuur je ',
            { tekst: 'aanvraag', href: '#aanvragen' },
            ', dan reageer ik binnen 24 uur en plannen we een moment. Wil je eerst iets vragen of weten? Neem dan ',
            { tekst: 'contact', href: '/contact' },
            ' met me op.',
          ],
        ],
      },
      {
        vraag: 'Kan ik je boeken voor een bruiloft buiten Nijmegen?',
        // TODO(paul): werkgebied en reiskosten buiten Nijmegen (zie ook /fotograaf-bruiloft).
        antwoord: [
          [
            'Ja, vraag het gerust aan. Ik fotografeer bruiloften ook buiten Nijmegen. Meer daarover lees je op mijn pagina als ',
            { tekst: 'fotograaf voor je bruiloft', href: '/fotograaf-bruiloft' },
            '. Geef de locatie van jullie bruiloft door in het aanvraagformulier, dan laat ik je binnen 24 uur weten of ik die dag kan.',
          ],
        ],
      },
      {
        vraag: 'Hoe lang van tevoren moeten we jou boeken?',
        // TODO(paul): hoe lang van tevoren je moet boeken (en hoe snel populaire data vol zitten).
        antwoord: [
          [
            'Boek me zodra de datum en de locatie vaststaan. Dan kunnen we de tijden van de ceremonie, de borrel en de portretten op elkaar afstemmen.',
          ],
          [
            'Heb je een trouwdatum, vraag dan snel of die nog vrij is: vul in het ',
            { tekst: 'aanvraagformulier', href: '#aanvragen' },
            ' de datum en de locatie in. Ik reageer binnen 24 uur.',
          ],
        ],
      },
      {
        vraag: 'Wat onderscheidt jou van andere trouwfotografen in Nijmegen?',
        antwoord: [
          [
            'Ik maak al 35 jaar beelden van mensen en plekken. Sinds 1992 fotografeer ik bruiloften voor ',
            { tekst: 'Love & Marriage', href: '/love-marriage' },
            ', een serie die onder meer in de Kunsthal in Rotterdam en op Photoville in New York werd getoond.',
          ],
          [
            'Nijmegen ken ik uit mijn series over de stad. En ik ben de hele dag bij jullie, van ’s ochtends vroeg tot ’s avonds laat. Waar ik verder heb geëxposeerd, lees je bij ',
            { tekst: 'exposities', href: '/exposities' },
            '.',
          ],
        ],
      },
      {
        vraag: 'Wanneer krijgen we de foto’s van onze bruiloft?',
        // TODO(paul): levertijd van het fotoboek, digitale levering (bestanden of online galerij), afdrukken en wat de analoge optie oplevert.
        antwoord: [
          [
            'Na de trouwdag maak ik een ingebonden fotoboek van jullie bruiloft.',
          ],
          [
            'Hoe lang het duurt voordat het fotoboek klaar is, en of jullie ook digitale bestanden of een online galerij krijgen, kun je in het ',
            { tekst: 'aanvraagformulier', href: '#aanvragen' },
            ' aan me vragen. Ook vragen over de analoge optie beantwoord ik graag.',
          ],
        ],
      },
    ],
  },

  /**
   * Aanvraagformulier: het bestaande bruiloftformulier, ongewijzigd (zie LandingFormulier.astro en
   * src/lib/formulieren/bruiloft.ts); anker #aanvragen, kop "Bruiloft aanvragen". Reviews ontbreken (nog geen echte reviews).
   */
  // TODO(paul): intro en privacytekst laten goedkeuren (gelijk aan die van /fotograaf-bruiloft).
  formulier: {
    type: 'bruiloft',
    titel: 'Bruiloft aanvragen',
    intro: [['Vertel me kort over jullie dag. Ik reageer binnen 24 uur en dan plannen we een kennismaking.']],
    verzendLabel: 'Aanvraag versturen',
    privacy: [
      'Ik gebruik je gegevens alleen om te reageren op je aanvraag. Lees de ',
      { tekst: 'privacyverklaring', href: PRIVACY.href },
      '.',
    ],
  },

  schema: {
    dienstNaam: 'Trouwfotografie in Nijmegen',
    serviceType: 'Bruiloftfotografie',
    vanPrijs: laagste,
    // Geen FAQPage in de JSON-LD (op verzoek); de vragen blijven zichtbaar.
    faqSchema: false,
    // TODO(paul): werkgebied bevestigen (alleen Nijmegen of ook de omliggende plaatsen).
    werkgebied: ['Nijmegen'],
    werkgebiedType: 'City',
  },
};

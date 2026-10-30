/**
 * Data voor /trouwfotograaf-nijmegen (lokale bruiloftspagina, primair zoekwoord "trouwfotograaf nijmegen"; bijzoekwoorden
 * "bruidsfotograaf nijmegen", "fotograaf bruiloft nijmegen" en "trouwreportage nijmegen"). /fotograaf-bruiloft blijft de
 * algemene bruiloftpagina; /trouwfotograaf-arnhem volgt later volgens hetzelfde patroon, met eigen inhoud.
 *
 * Alle lopende tekst, de titel, de H1, de inleiding, de vragen en de fotoselectie zijn eigen inhoud: er staat geen alinea
 * van /fotograaf-bruiloft in en geen foto uit de hero, de Impressie of het Beeld van die pagina. De werkwijzetekst is
 * eigen aan deze pagina (niet `bruiloftWerkwijze`).
 *
 * TODO(paul): levertijd en opleverformaat van de foto's (in het antwoord op "Wat krijgen we na de bruiloft?").
 * TODO(paul): inhoud van Volledig analoog (wat erbij hoort; op de pagina alleen "bespreken we tijdens de kennismaking").
 * TODO(paul): zijn reiskosten in heel Nederland inbegrepen? Noem ze nergens op de pagina.
 * TODO(paul): startjaar. Deze pagina zegt bruiloften sinds 1992; /fotograaf-bruiloft zegt fotograaf vanaf 1995 (paul.ts).
 * TODO(paul): "Kunsthal" op deze pagina tegenover "Kunsthallen" op /fotograaf-bruiloft.
 *
 * Sectievolgorde (op uitdrukkelijk verzoek afwijkend van de bindende landingsvolgorde; zie `pakkettenPlek`, `overPaulPlek` en `uitlegPlek` hieronder en
 * LandingLayout.astro): Hero, Werkwijze, Impressie, OverPaul, Pakketten, één Uitleg-blok (Plekken in
 * Nijmegen voor trouwfoto's), Locaties
 * (leeg: niet getoond), Vragen, Reviews (ontbreekt: geen echte reviews), Aanvraagformulier. Beeld ontbreekt bewust.
 *
 * Het Uitleg-blok is eigen inhoud in de ik-vorm (Paul) en bedient de zoekvraag "trouwfoto's Nijmegen
 * locaties" naast het hoofdzoekwoord "trouwfotograaf nijmegen". De pagina heeft geen FAQPage in de JSON-LD
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
import type { LandingPagina, LandingUitlegBlok, LandingWerkwijze } from './types';
import { bruiloftPakketPrijs, bruiloftVanPrijs, pakketten, pakkettenNoot, pakkettenNootPakket } from './bruiloft-pakketten';
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
import plekkenFoto from '../../assets/landing/nijmegen/DSC07297.jpg';

/** Prijs van een pakket uit `pakketten` als "€3.950"; title, description, tekstblokken en vragen gebruiken dit, zodat de prijzen nooit kunnen afwijken. */
function pakketPrijs(naam: string): string {
  return euro(bruiloftPakketPrijs(naam));
}

/** Laagste pakketprijs in euro's (de vanaf-prijs in title, description en JSON-LD). */
const laagste = bruiloftVanPrijs;

/**
 * Eigen tekst (niet `bruiloftWerkwijze`). Label en link naar #pakketten blijven de opbouw van de sectie.
 */
const werkwijzeNijmegen = {
  label: '(werkwijze)',
  tekst:
    'Ik ben van ’s ochtends vroeg tot ’s avonds laat aanwezig, van de voorbereidingen in de ochtend tot het feest ’s avonds. Ik fotografeer de dag zoals hij verloopt.',
  link: { label: 'bekijk de pakketten', href: '#pakketten' },
} satisfies LandingWerkwijze;

// ---------------------------------------------------------------------------
// Uitleg-blokken (zie LandingUitleg.astro). Elk blok is een eigen sectie met een <h2>; subkoppen zijn <h3>.
// ---------------------------------------------------------------------------

/**
 * "Plekken in Nijmegen voor trouwfoto's" (zoekvraag "trouwfoto's Nijmegen locaties").
 *
 * Bron voor de parken: intonijmegen.com (3x parks in Nijmegen's city centre,
 * https://en.intonijmegen.com/discover/the-best-of-nijmegen/x-parks-in-nijmegens-city-centre; Nederlandse versie:
 * https://www.intonijmegen.com/ontdek-nijmegen/wijken-in-nijmegen/binnenstad/parken-nijmegen), opgehaald 30 oktober 2026.
 * Het tramwachthuisje van de kiosk in het Hunnerpark en de resten van de stadsmuur zijn ook bevestigd op
 * nijmegen.nl/evenementen/evenementenlocaties/hunnerpark/. De Waalbrug-zin is Pauls eigen werk (Take me to the river, 2016).
 * TODO(paul): eigen tips en plekken alleen toevoegen waar hij heeft gefotografeerd; verzin ze niet. De inleidende regel
 * blijft "Vier plekken in het centrum van Nijmegen." Niets over lokale ervaring op de pagina, behalve de Waalbrug-zin.
 */
const blokPlekken: LandingUitlegBlok = {
  id: 'plekken-in-nijmegen',
  label: '(plekken)',
  // Kleine foto linksonder, uit `bruiloften recent` (niet een van de hero- of impressiefoto's).
  foto: {
    afbeelding: plekkenFoto,
    alt: 'Op de achterbank van een auto zitten een vrouw met een bril en een gele bloemenjurk en een man in een lichtblauw pak met een bloem op de revers. Ze lachen.',
  },
  kop: 'Plekken in Nijmegen voor trouwfoto’s',
  inhoud: [
    {
      soort: 'alinea',
      tekst: ['Vier plekken in het centrum van Nijmegen.'],
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
        'Ik woon en werk in Nijmegen en fotografeer hier bruiloften: de mensen, de plek en het moment, zoals ze zijn. De stad ken ik uit mijn eigen werk. ',
        { tekst: 'Het gezicht van Nijmegen', href: '/het-gezicht-van-nijmegen' },
        ' hing in Museum het Valkhof, voor ',
        { tekst: 'Take me to the river', href: '/take-me-to-the-river' },
        ' fotografeerde ik in de lente van 2016 op de Waalbrug, en ik maak al zestien jaar ',
        { tekst: 'Groeten uit Lent', href: '/groeten-uit-lent' },
        '. Mijn bruiloftsfoto’s hingen op Photoville in New York en in de Kunsthal in Rotterdam.',
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

  werkwijze: werkwijzeNijmegen,

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
  uitleg: [blokPlekken],
  uitlegPlek: 'na-impressie',

  /**
   * OverPaul: één alinea, eigen aan deze pagina.
   * TODO(paul): de foto van Paul in hogere resolutie aanleveren (nu 400 × 400 px, zie README).
   */
  overPaul: {
    label: 'Over Paul',
    lead: [
      'Sinds 1984 werk ik als kunstenaar, eerst als schilder, later ook als fotograaf. Sinds 1992 fotografeer ik bruiloften, en dat doe ik nog steeds. Daarnaast werk ik aan series over thema’s die mij raken: leven, dood en geboorte, sociale reportages en rituelen. Ik maak ook portretten. Mijn werk is getoond op Photoville in New York, in de Kunsthal in Rotterdam, in Museum het Valkhof en in Museum de Bastei, en verscheen in onder meer de Volkskrant, de Telegraaf, De Standaard en de Gelderlander. Ik ben lid van Dupho, Dutch Photographers.',
    ],
    alineas: [],
    links: [],
    foto: {
      afbeelding: paulFoto,
      alt: 'Zwart-witportret van fotograaf Paul Breuker',
    },
  },

  /**
   * Vragen: zeven, elk als <h3> onder de <h2> "Veelgestelde vragen" (`vraagAlsKop`). De prijzen komen uit `pakketten`.
   * Geen vraag over regels van de gemeente. Geen FAQPage in de JSON-LD (`schema.faqSchema: false`).
   */
  // TODO(paul): antwoorden door Paul laten goedkeuren.
  vragen: {
    titel: 'Veelgestelde vragen',
    vraagAlsKop: true,
    items: [
      {
        vraag: 'Wat kost een trouwfotograaf in Nijmegen?',
        antwoord: [
          [
            `Een trouwfotograaf wordt ook wel bruidsfotograaf genoemd. Een bruiloft kost bij mij ${pakketPrijs('Digitaal')} (Digitaal) of ${pakketPrijs('Volledig analoog')} (Volledig analoog). Ik ben dan van ’s ochtends vroeg tot ’s avonds laat aanwezig, en bij beide pakketten hoort een ingebonden fotoboek. Een combinatie van digitaal en analoog kan op aanvraag.`,
          ],
        ],
      },
      {
        vraag: 'Waarom is een trouwfotograaf zo duur?',
        antwoord: [
          [
            'Een bruiloft is meer dan de dag zelf. Er gaat voorbereiding aan vooraf, er is een kennismaking, en na afloop selecteer en bewerk ik de foto’s. Daarvoor gebruik ik betrouwbare apparatuur, en ik ben de hele dag aanwezig.',
          ],
        ],
      },
      {
        vraag: 'Welke plekken in Nijmegen zijn mooi voor trouwfoto’s?',
        antwoord: [
          [
            'In het centrum liggen het Valkhofpark, het Hunnerpark en het Kronenburgerpark dicht bij elkaar, en de Waalbrug en de Waal zijn een plek op zich. Welke past, hangt af van jullie dag en van het licht. Vertel me waar jullie trouwen, dan denk ik mee.',
          ],
        ],
      },
      {
        vraag: 'Fotografeer je ook in Lent, Wijchen, Beuningen of Groesbeek, of buiten Nijmegen?',
        antwoord: [
          [
            'Ja. Lent ken ik uit eigen werk: ik maak er al zestien jaar Groeten uit Lent. Ik fotografeer bruiloften ook in andere plaatsen en door heel Nederland. Doe een aanvraag met de plaats en de datum, dan reageer ik binnen 3 werkdagen.',
          ],
        ],
      },
      {
        vraag: 'Kunnen we kennismaken voordat we boeken, en hoe lang van tevoren moeten we boeken?',
        antwoord: [
          [
            'Ja, een kennismaking vooraf hoort erbij. Boek me zodra de datum en de locatie vaststaan. Stuur een aanvraag, dan reageer ik binnen 3 werkdagen en plannen we de kennismaking.',
          ],
        ],
      },
      {
        vraag: 'Wat voor fotograaf ben je?',
        antwoord: [
          [
            'Ik werk sinds 1984 als kunstenaar en fotografeer sinds 1992 bruiloften. Mijn werk hing op Photoville in New York en in de Kunsthal in Rotterdam. In het portfolio zien jullie hoe ik kijk. Past dat bij jullie, dan plannen we een kennismaking.',
          ],
        ],
      },
      {
        vraag: 'Wat krijgen we na de bruiloft?',
        // TODO(paul): levertijd en opleverformaat in dit antwoord opnemen.
        antwoord: [
          [
            'Bij het pakket Digitaal ontvangen jullie de foto’s digitaal en maak ik een ingebonden fotoboek van jullie bruiloft. Bij Volledig analoog hoort ook een ingebonden fotoboek. Wat er verder bij hoort, bespreken we tijdens de kennismaking.',
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
    intro: [['Vertel me kort over jullie dag. Ik reageer binnen 3 werkdagen en dan plannen we een kennismaking.']],
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

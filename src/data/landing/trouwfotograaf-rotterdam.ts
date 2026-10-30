/**
 * Data voor /trouwfotograaf-rotterdam (lokale bruiloftspagina, primair zoekwoord "trouwfotograaf rotterdam").
 * Zelfde indeling als /trouwfotograaf-nijmegen: Hero, Werkwijze, Impressie, OverPaul, Pakketten, één Uitleg-blok (Plekken),
 * Locaties (leeg), Vragen, Aanvraagformulier. Reviews en Beeld ontbreken, net als op Nijmegen.
 *
 * Pakketten en prijzen komen uit `bruiloft-pakketten.ts`. De lopende tekst is voor Rotterdam geschreven.
 * Geen FAQPage in de JSON-LD (`schema.faqSchema: false`).
 *
 * TODO(paul): levertijd en opleverformaat van de foto's (in het antwoord op "Wat krijgen we na de bruiloft?").
 * TODO(paul): inhoud van Volledig analoog (wat erbij hoort; op de pagina alleen "bespreken we tijdens de kennismaking").
 * TODO(paul): zijn reiskosten in heel Nederland inbegrepen? Noem ze nergens op de pagina.
 * TODO(paul): startjaar. Deze pagina zegt bruiloften sinds 1992; /fotograaf-bruiloft zegt fotograaf vanaf 1995 (paul.ts).
 * TODO(paul): "Kunsthal" op deze pagina tegenover "Kunsthallen" op /fotograaf-bruiloft.
 * TODO(paul): welke foto's uit de Kunsthal-expositie mogen hier getoond worden?
 * TODO(paul): alle teksten op deze pagina zijn concepten; laat ze door Paul goedkeuren.
 * TODO(paul): keuring van de foto's en alt-teksten.
 */
import type { LandingPagina, LandingUitlegBlok, LandingWerkwijze } from './types';
import { bruiloftPakketPrijs, bruiloftVanPrijs, pakketten, pakkettenNoot, pakkettenNootPakket } from './bruiloft-pakketten';
import { PRIVACY } from '../site';
import { euro } from '../../lib/prijs';
import paulFoto from '../../assets/landing/paul.webp';
import heroFoto1 from '../../assets/portfolio/bruiloften portfolio/DSC02797.jpg';
import heroFoto2 from '../../assets/portfolio/bruiloften portfolio/023t.jpg';
import heroFoto3 from '../../assets/portfolio/bruiloften portfolio/19.jpg';
import impressie1 from '../../assets/portfolio/bruiloften portfolio/108.jpg';
import impressie2 from '../../assets/portfolio/bruiloften portfolio/109.jpg';
import impressie3 from '../../assets/portfolio/bruiloften portfolio/7.jpg';
import impressie4 from '../../assets/portfolio/bruiloften portfolio/127.jpg';
import plekkenFoto from '../../assets/portfolio/bruiloften portfolio/0032c.JPG';

/** Prijs van een pakket uit `pakketten` als "€3.950"; title, description en vragen gebruiken dit. */
function pakketPrijs(naam: string): string {
  return euro(bruiloftPakketPrijs(naam));
}

/** Laagste pakketprijs in euro's (de vanaf-prijs in title, description en JSON-LD). */
const laagste = bruiloftVanPrijs;

/**
 * Zelfde opbouw als `bruiloftWerkwijze` (label, één alinea, link naar #pakketten), eigen tekst.
 * TODO(paul): kennismaking (waar en hoe), digitale levering en levertijd van het fotoboek.
 */
const werkwijzeRotterdam = {
  label: '(werkwijze)',
  tekst:
    'Van ’s ochtends vroeg tot ’s avonds laat ben ik erbij: bij de voorbereidingen, de plechtigheid en het feest. Ik fotografeer de dag zoals die verloopt.',
  link: { label: 'bekijk de pakketten', href: '#pakketten' },
} satisfies LandingWerkwijze;

// ---------------------------------------------------------------------------
// Uitleg-blokken (zie LandingUitleg.astro). Elk blok is een eigen sectie met een <h2>; subkoppen zijn <h3>.
// ---------------------------------------------------------------------------

/**
 * "Plekken in Rotterdam voor trouwfoto's". Inleiding en vier plekken.
 * Per plek staat hieronder TODO(paul): heb je hier gefotografeerd?
 */
const blokPlekken: LandingUitlegBlok = {
  id: 'plekken-in-rotterdam',
  label: '(plekken)',
  foto: {
    afbeelding: plekkenFoto,
    alt: 'Een man in een donker pak met een lichtblauwe stropdas en een vrouw in een turquoise pak staan op een gazon, met een vijver en een stenen trap achter hen.',
  },
  kop: 'Plekken in Rotterdam voor trouwfoto’s',
  inhoud: [
    {
      soort: 'alinea',
      tekst: ['Vier plekken in Rotterdam, aan het water.'],
    },
    // TODO(paul): heb je hier gefotografeerd?
    { soort: 'kop', tekst: 'Delfshaven bij de Aelbrechtskolk' },
    {
      soort: 'alinea',
      tekst: [
        'Een jachthaven in een van de weinige oude stadsdelen die het bombardement van 1940 overleefden.',
      ],
    },
    // TODO(paul): heb je hier gefotografeerd?
    { soort: 'kop', tekst: 'Kralingse Plas en Kralingse Bos' },
    {
      soort: 'alinea',
      tekst: ['Een meer, bos en molens, met uitzicht op de skyline van de stad.'],
    },
    // TODO(paul): heb je hier gefotografeerd?
    { soort: 'kop', tekst: 'Oude Haven en de Willemsbrug' },
    {
      soort: 'alinea',
      tekst: ['Een kleine haven met houten schepen, met uitzicht op het Witte Huis en de Willemsbrug.'],
    },
    // TODO(paul): heb je hier gefotografeerd?
    { soort: 'kop', tekst: 'Erasmusbrug en De Rotterdam' },
    {
      soort: 'alinea',
      tekst: ['De brug zie je het best vanaf de Willemsbrug, met De Rotterdam erachter.'],
    },
  ],
};

export const trouwfotograafRotterdam: LandingPagina = {
  slug: 'trouwfotograaf-rotterdam',

  seo: {
    title: `Trouwfotograaf Rotterdam | Paul Breuker, vanaf ${euro(laagste)}`,
    description: `Trouwfotograaf Rotterdam: Paul Breuker, wiens bruiloftsfoto’s in de Kunsthal hingen. De hele dag aanwezig, ingebonden fotoboek, digitaal ${pakketPrijs('Digitaal')}.`,
  },

  breadcrumb: 'Trouwfotograaf Rotterdam',

  /**
   * Hero-fotostrip: drie liggende foto's uit `bruiloften portfolio`:
   *  1. DSC02797.jpg = poppenkast op het gras (LCP en Open Graph)
   *  2. 023t.jpg     = kinderen in een oldtimer (mobiel)
   *  3. 19.jpg       = bruidspaar in hoge stoelen
   */
  hero: {
    h1: 'Trouwfotograaf Rotterdam',
    intro: [
      [
        'Mijn bruiloftsfoto’s hingen in de Kunsthal in Rotterdam en op Photoville in New York. Nu fotografeer ik jullie bruiloft in Rotterdam. Ik woon in Lent, bij Nijmegen, en fotografeer sinds 1992 bruiloften, onder meer voor de serie Love & Marriage.',
      ],
    ],
    ctaPrimair: { label: 'Bruiloft aanvragen', href: '#aanvragen' },
    ctaSecundair: { label: 'Bekijk de pakketten', href: '#pakketten' },
    fotos: [
      {
        afbeelding: heroFoto1,
        alt: 'Kinderen reiken naar een houten poppenkast met rode doeken. Een bruid in een witte jurk zit op een stoel tussen de gasten, en een vrouw houdt een microfoon vast.',
      },
      {
        afbeelding: heroFoto2,
        alt: 'Een jongen in een donker pak en een meisje in een wit jurkje zitten in de open deuren van een zwarte oldtimer op het gras. Naast haar ligt een boeket lelies.',
      },
      {
        afbeelding: heroFoto3,
        alt: 'Voor een kast met glas en beeldjes zitten een bruid in een kanten jurk met witte handschoenen en een bruidegom in een bruin driedelig pak in hoge stoelen.',
      },
    ],
  },

  werkwijze: werkwijzeRotterdam,

  pakketten,
  pakkettenNoot,
  pakkettenNootPakket,

  /**
   * Locaties: bewust leeg, dus de sectie verschijnt niet.
   * TODO(paul): locaties in Rotterdam waar Paul echt heeft gefotografeerd. Verzin geen plekken.
   */
  locaties: {
    titel: 'Waar ik fotografeer',
    items: [],
  },

  /**
   * Impressie: vier liggende foto's, diagonale indeling.
   *  1. 108.jpg
   *  2. 109.jpg
   *  3. 7.jpg
   *  4. 127.jpg
   */
  impressie: {
    titel: 'Impressie',
    fotos: [
      {
        afbeelding: impressie1,
        alt: 'Zwart-witfoto op de achterbank: links een man in pak, in het midden een bruid met een sluier en een parelkrans, rechts een vrouw die een in folie verpakt boeket vasthoudt.',
      },
      {
        afbeelding: impressie2,
        alt: 'Zwart-witfoto langs een zandpad: bruid en bruidegom staan bij een lichte auto waarvan de kofferbak openstaat. Een man hurkt bij het achterwiel.',
      },
      {
        afbeelding: impressie3,
        alt: 'Een vrouw in een bloemetjesjurk wast een baby in de gootsteen van een keuken. Achter haar filmt een man, en in de deuropening staat een man in pak.',
      },
      {
        afbeelding: impressie4,
        alt: 'Door een open autoraam houdt een jonge vrouw in een witte jurk de hand vast van een oudere vrouw die buiten staat, tussen de bomen.',
      },
    ],
    link: { label: 'Meer bruiloftfoto’s', href: '/portfolio/bruiloften' },
  },

  pakkettenPlek: 'na-impressie',
  overPaulPlek: 'voor-pakketten',
  uitleg: [blokPlekken],
  uitlegPlek: 'na-impressie',

  /**
   * OverPaul: dezelfde foto als op Nijmegen, eigen tekst.
   * TODO(paul): de foto van Paul in hogere resolutie aanleveren (nu 400 × 400 px).
   */
  overPaul: {
    label: 'Over Paul',
    lead: [
      'Ik werk sinds 1984 als kunstenaar. Sinds 1992 fotografeer ik bruiloften, en daarnaast maak ik series over leven, dood en geboorte, sociale reportages, rituelen en portretten. Mijn werk is getoond in de Kunsthal in Rotterdam, op Photoville in New York, in Museum het Valkhof en in Museum de Bastei. Het verscheen in de Volkskrant, de Telegraaf, De Standaard en de Gelderlander. Ik ben lid van Dupho, Dutch Photographers.',
    ],
    alineas: [],
    links: [],
    foto: {
      afbeelding: paulFoto,
      alt: 'Zwart-witportret van fotograaf Paul Breuker',
    },
  },

  /**
   * Vragen: zeven, elk als <h3>. Geen vraag over regels van de gemeente. Geen FAQPage (`faqSchema: false`).
   */
  // TODO(paul): antwoorden door Paul laten goedkeuren.
  vragen: {
    titel: 'Veelgestelde vragen',
    vraagAlsKop: true,
    items: [
      {
        vraag: 'Wat kost een trouwfotograaf in Rotterdam?',
        antwoord: [
          [
            `Een bruiloft in Rotterdam fotografeer ik voor ${pakketPrijs('Digitaal')} (Digitaal) of ${pakketPrijs('Volledig analoog')} (Volledig analoog). Ik ben dan van ’s ochtends vroeg tot ’s avonds laat aanwezig, bij beide pakketten met een ingebonden fotoboek. Een trouwfotograaf wordt ook bruidsfotograaf genoemd. Een combinatie van digitaal en analoog kan op aanvraag.`,
          ],
        ],
      },
      {
        vraag: 'Waarom is een trouwfotograaf zo duur?',
        antwoord: [
          [
            'De trouwdag is een deel van het werk. Ervoor liggen de voorbereiding en de kennismaking, erna het selecteren en bewerken van de foto’s. Daar komt betrouwbare apparatuur bij.',
          ],
        ],
      },
      {
        vraag: 'Welke plekken in Rotterdam zijn mooi voor trouwfoto’s?',
        antwoord: [
          [
            'Delfshaven bij de Aelbrechtskolk, de Kralingse Plas, de Oude Haven en de Erasmusbrug liggen allemaal aan het water, maar ze zien er heel verschillend uit. Welke past, hangt af van jullie dag en het licht. Vertel me waar jullie trouwen, dan denk ik mee.',
          ],
        ],
      },
      {
        vraag: 'Fotografeer je ook in Rotterdam als je in Lent woont, en in plaatsen rond Rotterdam?',
        antwoord: [
          [
            'Ja. Mijn bruiloftsfoto’s hingen al in de Kunsthal in Rotterdam, en ik fotografeer bruiloften door heel Nederland. Voor Schiedam, Delft, Dordrecht of een andere plaats rond Rotterdam doen jullie een aanvraag met de plaats en de datum. Ik reageer binnen 3 werkdagen.',
          ],
        ],
      },
      {
        vraag: 'Kunnen we kennismaken voordat we boeken, en hoe lang van tevoren moeten we boeken?',
        antwoord: [
          [
            'Ja, een kennismaking hoort erbij. Boek me zodra de datum en de locatie vaststaan. Ik reageer binnen 3 werkdagen op jullie aanvraag, en dan plannen we de kennismaking.',
          ],
        ],
      },
      {
        vraag: 'Wat voor fotograaf ben je?',
        antwoord: [
          [
            'Ik ben kunstenaar en fotograaf. Mijn bruiloftswerk hing in de Kunsthal in Rotterdam en op Photoville in New York. In het portfolio zien jullie hoe ik werk.',
          ],
        ],
      },
      {
        vraag: 'Wat krijgen we na de bruiloft?',
        // TODO(paul): levertijd en opleverformaat; welke Kunsthal-foto’s hier getoond mogen worden.
        antwoord: [
          [
            'Bij het pakket Digitaal krijgen jullie de foto’s digitaal en een ingebonden fotoboek van jullie bruiloft. Bij Volledig analoog hoort ook een ingebonden fotoboek. Wat er verder bij hoort, bespreken we tijdens de kennismaking.',
          ],
        ],
      },
    ],
  },

  formulier: {
    type: 'bruiloft',
    titel: 'Bruiloft aanvragen',
    intro: [['Vertel me kort over jullie dag. Ik reageer binnen 3 werkdagen en dan plannen we een kennismaking.']],
    verzendLabel: 'Aanvraag versturen',
    privacy: [
      'Deze gegevens dienen alleen om je aanvraag te beantwoorden. Lees de ',
      { tekst: 'privacyverklaring', href: PRIVACY.href },
      '.',
    ],
  },

  schema: {
    dienstNaam: 'Trouwfotografie in Rotterdam',
    serviceType: 'Bruiloftfotografie',
    vanPrijs: laagste,
    faqSchema: false,
    werkgebied: ['Rotterdam'],
    werkgebiedType: 'City',
  },
};

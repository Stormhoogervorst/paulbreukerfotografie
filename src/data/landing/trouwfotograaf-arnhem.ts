/**
 * Data voor /trouwfotograaf-arnhem (lokale bruiloftspagina, primair zoekwoord "trouwfotograaf arnhem"; bijzoekwoorden
 * "bruidsfotograaf arnhem", "fotograaf bruiloft arnhem", "trouwreportage arnhem", "trouwen in arnhem" en "trouwfoto's
 * arnhem locaties"). Zelfde indeling als /trouwfotograaf-nijmegen (Hero, Werkwijze, Impressie, OverPaul, Pakketten,
 * één Uitleg-blok (Plekken), Vragen, Aanvraagformulier). Locaties is leeg en wordt niet getoond. Reviews en Beeld ontbreken,
 * net als op Nijmegen. /fotograaf-bruiloft blijft de algemene bruiloftpagina.
 *
 * Alle lopende tekst is nieuw voor Arnhem: geen alinea van /trouwfotograaf-nijmegen of /fotograaf-bruiloft.
 * Pakketten en prijzen komen uit `bruiloft-pakketten.ts` (import, geen kopie). Het formulier is het bestaande
 * bruiloftformulier. Geen FAQPage in de JSON-LD (`schema.faqSchema: false`).
 *
 * TODO(paul): bevestig dat Paul bruiloften in Arnhem fotografeert (met welke ervaring), de reistijd vanuit Lent, en of er
 * Arnhemse bruiloften of exposities zijn om te noemen. Verzin geen band met Arnhem. Reiskosten noem je nergens op de pagina.
 * TODO(paul): levertijd en opleverformaat van de foto's (in het antwoord op "Wat krijgen we na de bruiloft?").
 * TODO(paul): inhoud van Volledig analoog (wat erbij hoort; op de pagina alleen "bespreken we tijdens de kennismaking").
 * TODO(paul): zijn reiskosten in heel Nederland inbegrepen? Noem ze nergens op de pagina.
 * TODO(paul): startjaar. Deze pagina zegt bruiloften sinds 1992; /fotograaf-bruiloft zegt fotograaf vanaf 1995 (paul.ts).
 * TODO(paul): alle teksten op deze pagina zijn concepten; laat ze door Paul goedkeuren.
 * TODO(paul): een echte Arnhemse bruiloft, met toestemming, als reportage (nu staan er geen Arnhemse bruiloftfoto's op).
 */
import type { LandingPagina, LandingUitlegBlok, LandingWerkwijze } from './types';
import { bruiloftPakketPrijs, bruiloftVanPrijs, pakketten, pakkettenNoot, pakkettenNootPakket } from './bruiloft-pakketten';
import { PRIVACY } from '../site';
import { euro } from '../../lib/prijs';
import paulFoto from '../../assets/landing/paul.webp';
import heroFoto1 from '../../assets/portfolio/bruiloften portfolio/79.jpg';
import heroFoto2 from '../../assets/portfolio/bruiloften portfolio/108.jpg';
import heroFoto3 from '../../assets/portfolio/bruiloften portfolio/109.jpg';
import impressie1 from '../../assets/portfolio/bruiloften portfolio/0047.jpg';
import impressie2 from '../../assets/portfolio/bruiloften portfolio/18.jpg';
import impressie3 from '../../assets/portfolio/bruiloften portfolio/DSC02797.jpg';
import impressie4 from '../../assets/portfolio/bruiloften portfolio/DSC04464.jpg';
import plekkenFoto from '../../assets/portfolio/bruiloften portfolio/19.jpg';

/** Prijs van een pakket uit `pakketten` als "€3.950"; title, description en vragen gebruiken dit. */
function pakketPrijs(naam: string): string {
  return euro(bruiloftPakketPrijs(naam));
}

/** Laagste pakketprijs in euro's (de vanaf-prijs in title, description en JSON-LD). */
const laagste = bruiloftVanPrijs;

/**
 * Zelfde opbouw als `bruiloftWerkwijze` (label, één alinea, link naar #pakketten), maar een eigen tekst.
 * TODO(paul): kennismaking (waar en hoe), digitale levering (bestanden of galerij) en levertijd van het fotoboek.
 */
const werkwijzeArnhem = {
  label: '(werkwijze)',
  tekst:
    'Ik ben van ’s ochtends vroeg tot ’s avonds laat aanwezig, van de voorbereidingen tot het feest. Ik fotografeer de dag zoals hij verloopt.',
  link: { label: 'bekijk de pakketten', href: '#pakketten' },
} satisfies LandingWerkwijze;

// ---------------------------------------------------------------------------
// Uitleg-blokken (zie LandingUitleg.astro). Elk blok is een eigen sectie met een <h2>; subkoppen zijn <h3>.
// ---------------------------------------------------------------------------

/**
 * "Plekken in Arnhem voor trouwfoto's" (zoekvraag "trouwfoto's Arnhem locaties").
 * Zelfde opbouw als Nijmegen: label, kleine foto, <h2>, inleiding, vier <h3>'s met een alinea, afsluiting.
 * De kennismaking blijft in de afsluiting, omdat die op Nijmegen ook genoemd wordt.
 *
 * Bron: reischeck.nl (16 x de leukste bezienswaardigheden van Arnhem), opgehaald 30 oktober 2026.
 * TODO(paul): voeg zijn eigen tips en plekken in Arnhem toe en schrap plekken die hij niet kent of niet wil noemen.
 * Verzin ze niet.
 */
const blokPlekken: LandingUitlegBlok = {
  id: 'plekken-in-arnhem',
  label: '(plekken)',
  foto: {
    afbeelding: plekkenFoto,
    alt: 'Een bruid in een witte kanten jurk en een bruidegom in een bruin pak zitten naast elkaar in hoge stoelen met blauwe bekleding, voor een kast met glaswerk.',
  },
  kop: 'Plekken in Arnhem voor trouwfoto’s',
  inhoud: [
    {
      soort: 'alinea',
      tekst: ['Vier plekken in Arnhem, aan het water en in het groen.'],
    },
    { soort: 'kop', tekst: 'Park Sonsbeek' },
    {
      soort: 'alinea',
      tekst: [
        'Een heuvelachtig stadspark van 67 hectare, op ongeveer vijf minuten lopen van het station. In het park staan onder meer een werkende molen (de Witte Watermolen), een waterval en de Belvédère, een uitkijktoren.',
      ],
    },
    { soort: 'kop', tekst: 'John Frostbrug en de Rijn' },
    {
      soort: 'alinea',
      tekst: [
        'De brug is genoemd naar luitenant-kolonel John Frost, die de brug in 1944 tijdens Operatie Market Garden bereikte. Naast de brug staat het museum Airborne at the Bridge.',
      ],
    },
    { soort: 'kop', tekst: 'Museum Arnhem' },
    {
      soort: 'alinea',
      tekst: [
        'Het museum ligt op een heuvelrug langs de Nederrijn, met uitzicht over het water. De beeldentuin is gratis toegankelijk.',
      ],
    },
    { soort: 'kop', tekst: 'Sabelspoort en Rijnkade' },
    {
      soort: 'alinea',
      tekst: [
        'De Sabelspoort is de enige overgebleven middeleeuwse stadspoort van Arnhem. Vanaf de Rijnkade is hij binnen een paar minuten lopen te bereiken.',
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

export const trouwfotograafArnhem: LandingPagina = {
  slug: 'trouwfotograaf-arnhem',

  seo: {
    // Zelfde patroon als Nijmegen: "Trouwfotograaf [plaats] | Paul Breuker, vanaf €…".
    title: `Trouwfotograaf Arnhem | Paul Breuker, vanaf ${euro(laagste)}`,
    // Nijmegen zegt "Trouwfotograaf in [plaats]. … de hele dag … Digitaal €…, volledig analoog €…".
    // Dat patroon wijkt af van "voor Arnhem en omgeving / van ochtend tot avond / analoog", dus volgt Arnhem Nijmegen.
    description: `Trouwfotograaf in Arnhem. Paul Breuker is de hele dag aanwezig en maakt een ingebonden fotoboek. Digitaal ${pakketPrijs('Digitaal')}, volledig analoog ${pakketPrijs('Volledig analoog')}.`,
  },

  breadcrumb: 'Trouwfotograaf Arnhem',

  /**
   * Hero. De H1 is korter dan "Trouwfotograaf Nijmegen" (die niet afbreekt op 390 px).
   * TODO(paul): bevestig dat Paul bruiloften in Arnhem fotografeert, de reistijd vanuit Lent, en of er
   * Arnhemse bruiloften of exposities zijn om te noemen. De hero linkt niet naar /exposities: de Nijmegen-hero doet dat ook niet.
   * Hero-fotostrip: drie liggende foto's (3:2) uit `bruiloften portfolio`, niet gebruikt op /trouwfotograaf-nijmegen:
   *  1. 79.jpg   = bruid springt in een wit zaaltje (LCP en Open Graph)
   *  2. 108.jpg  = zwart-wit, bruid in de auto (mobiel)
   *  3. 109.jpg  = bruidspaar bij een auto met open kofferbak
   * TODO(paul): keuring van de hero-foto's en hun alt-teksten.
   */
  hero: {
    h1: 'Trouwfotograaf Arnhem',
    intro: [
      [
        'Ik woon in Lent, bij Nijmegen, dus Arnhem ligt dichtbij. Ik fotografeer er bruiloften zoals ze zijn: de mensen, de plek en het moment. Foto’s uit Love & Marriage, mijn serie over bruiloften, hingen op Photoville in New York en in de Kunsthal in Rotterdam.',
      ],
    ],
    ctaPrimair: { label: 'Bruiloft aanvragen', href: '#aanvragen' },
    ctaSecundair: { label: 'Bekijk de pakketten', href: '#pakketten' },
    fotos: [
      {
        afbeelding: heroFoto1,
        alt: 'In een wit zaaltje met banken en hoge ramen springt een bruid in een witte jurk in het middenpad, met een arm omhoog. Op een bank ligt een boeket.',
      },
      {
        afbeelding: heroFoto2,
        alt: 'Zwart-witfoto in een auto: een bruid met een kanten sluier en een bloemenkroon zit tussen een man in pak en een vrouw met een boeket.',
      },
      {
        afbeelding: heroFoto3,
        alt: 'Zwart-witfoto langs een zandweg: een bruidspaar staat naast een lichte auto met open kofferbak, terwijl een man gehurkt een wiel verwisselt.',
      },
    ],
  },

  werkwijze: werkwijzeArnhem,

  pakketten,
  pakkettenNoot,
  pakkettenNootPakket,

  /**
   * Locaties ("Waar ik fotografeer"): bewust leeg, dus de sectie verschijnt niet, net als op Nijmegen.
   * TODO(paul): locaties in en rond Arnhem waar Paul echt heeft gefotografeerd. Verzin geen plekken.
   */
  locaties: {
    titel: 'Waar ik fotografeer',
    items: [],
  },

  /**
   * Impressie: vier liggende foto's (3:2), diagonale indeling. Geen van deze staat in de hero, de sfeerfoto's of op
   * /trouwfotograaf-nijmegen. Volgorde:
   *  1. 0047.jpg  = ceremonie op twee hoge witte stoelen
   *  2. 18.jpg    = woonkamer, bruidspaar in de deuropening
   *  3. DSC02797.jpg = bruid en gasten bij een poppenkast
   *  4. DSC04464.jpg = gezelschap in lange jurken op een steiger
   * TODO(paul): keuring van deze vier foto's en hun alt-teksten.
   */
  impressie: {
    titel: 'Impressie',
    fotos: [
      {
        afbeelding: impressie1,
        alt: 'Tijdens een ceremonie in een lichte zaal leunen een bruid en bruidegom met gebogen hoofd op twee witte hoge stoelen, terwijl twee mannen in pak een tekst voorlezen.',
      },
      {
        afbeelding: impressie2,
        alt: 'In een woonkamer met roze banken ligt een man in een wit overhemd op de vloer. In de deuropening staan een bruid met een boeket en een bruidegom in een zwart pak.',
      },
      {
        afbeelding: impressie3,
        alt: 'Buiten op het gras zit een bruid in een witte jurk tussen gasten, terwijl kinderen naar een houten poppenkast met rode doeken reiken.',
      },
      {
        afbeelding: impressie4,
        alt: 'Op een houten steiger bij het water staan vrouwen in lange turquoise jurken en een vrouw in een rode jurk, met een wolkenkrabberlijn op de achtergrond.',
      },
    ],
    link: { label: 'Meer bruiloftfoto’s', href: '/portfolio/bruiloften' },
  },

  pakkettenPlek: 'na-impressie',
  overPaulPlek: 'voor-pakketten',
  uitleg: [blokPlekken],
  uitlegPlek: 'na-impressie',

  /**
   * OverPaul: één alinea, eigen aan deze pagina. Dezelfde foto als op Nijmegen.
   * TODO(paul): de foto van Paul in hogere resolutie aanleveren (nu 400 × 400 px, dezelfde als op Nijmegen).
   */
  overPaul: {
    label: 'Over Paul',
    lead: [
      'Ik werk sinds 1984 als kunstenaar. Sinds 1992 fotografeer ik bruiloften en maak ik daarnaast series over leven, dood en geboorte, sociale reportages, rituelen en portretten. Mijn werk is getoond op Photoville in New York, in de Kunsthal in Rotterdam, in Museum het Valkhof en in Museum de Bastei, en verscheen in de Volkskrant, de Telegraaf, De Standaard en de Gelderlander. Ik ben lid van Dupho, Dutch Photographers.',
    ],
    alineas: [],
    links: [],
    foto: {
      afbeelding: paulFoto,
      alt: 'Zwart-witportret van fotograaf Paul Breuker',
    },
  },

  /**
   * Vragen: zeven, elk als <h3> onder de <h2> "Veelgestelde vragen". Geen vraag over regels van de gemeente.
   * Geen FAQPage in de JSON-LD (`schema.faqSchema: false`).
   */
  // TODO(paul): antwoorden door Paul laten goedkeuren.
  vragen: {
    titel: 'Veelgestelde vragen',
    vraagAlsKop: true,
    items: [
      {
        vraag: 'Wat kost een trouwfotograaf in Arnhem?',
        antwoord: [
          [
            `Een bruiloft in Arnhem kost bij mij ${pakketPrijs('Digitaal')} (Digitaal) of ${pakketPrijs('Volledig analoog')} (Volledig analoog). Ik ben dan van ’s ochtends vroeg tot ’s avonds laat aanwezig, en bij beide pakketten hoort een ingebonden fotoboek. Trouwfotograaf en bruidsfotograaf is hetzelfde werk. Een combinatie van digitaal en analoog kan op aanvraag.`,
          ],
        ],
      },
      {
        vraag: 'Waarom is een trouwfotograaf zo duur?',
        antwoord: [
          [
            'Naast de trouwdag zelf zit er werk voor en na: de voorbereiding, de kennismaking en het selecteren en bewerken van de foto’s. Betrouwbare apparatuur is ook onderdeel van de prijs.',
          ],
        ],
      },
      {
        vraag: 'Welke plekken in Arnhem zijn mooi voor trouwfoto’s?',
        antwoord: [
          [
            'Park Sonsbeek, de John Frostbrug en de Rijn, Museum Arnhem en de Sabelspoort met de Rijnkade zijn plekken om uit te kiezen. Wat het best werkt, hangt af van jullie dag en het licht. Laat me weten waar jullie trouwen, dan denk ik mee.',
          ],
        ],
      },
      {
        vraag: 'Fotografeer je ook in Arnhem en omgeving?',
        antwoord: [
          [
            'Ja. Ik woon in Lent, bij Nijmegen, en fotografeer bruiloften door heel Nederland. Voor Velp, Oosterbeek, Rheden of een andere plaats rond Arnhem doen jullie een aanvraag met de plaats en de datum. Ik reageer binnen 3 werkdagen.',
          ],
        ],
      },
      {
        vraag: 'Kunnen we kennismaken voordat we boeken, en hoe lang van tevoren moeten we boeken?',
        antwoord: [
          [
            'Ja, een kennismaking vooraf hoort erbij. Boek me zodra de datum en de locatie vaststaan. Na jullie aanvraag reageer ik binnen 3 werkdagen en plannen we de kennismaking.',
          ],
        ],
      },
      {
        vraag: 'Wat voor fotograaf ben je?',
        antwoord: [
          [
            'Ik werk sinds 1984 als kunstenaar en fotografeer sinds 1992 bruiloften. Foto’s uit Love & Marriage hingen op Photoville in New York en in de Kunsthal in Rotterdam. In het portfolio zien jullie hoe ik kijk.',
          ],
        ],
      },
      {
        vraag: 'Wat krijgen we na de bruiloft?',
        // TODO(paul): levertijd en opleverformaat.
        antwoord: [
          [
            'Bij het pakket Digitaal krijgen jullie de foto’s digitaal en een ingebonden fotoboek van jullie bruiloft. Bij Volledig analoog hoort ook een ingebonden fotoboek. Wat er verder bij hoort, bespreken we tijdens de kennismaking.',
          ],
        ],
      },
    ],
  },

  /**
   * Aanvraagformulier: het bestaande bruiloftformulier, ongewijzigd. Zelfde kop en afsluiting als op Nijmegen.
   */
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
    dienstNaam: 'Trouwfotografie in Arnhem',
    serviceType: 'Bruiloftfotografie',
    vanPrijs: laagste,
    faqSchema: false,
    // TODO(paul): werkgebied bevestigen (alleen Arnhem of ook Velp, Oosterbeek, Renkum en Wageningen).
    werkgebied: ['Arnhem'],
    werkgebiedType: 'City',
  },
};

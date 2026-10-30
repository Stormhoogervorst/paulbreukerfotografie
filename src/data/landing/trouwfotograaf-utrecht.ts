/**
 * Data voor /trouwfotograaf-utrecht (lokale bruiloftspagina, primair zoekwoord "trouwfotograaf utrecht").
 * Zelfde indeling als /trouwfotograaf-nijmegen: Hero, Werkwijze, Impressie, OverPaul, Pakketten, één Uitleg-blok (Plekken),
 * Locaties (leeg), Vragen, Aanvraagformulier. Reviews en Beeld ontbreken, net als op Nijmegen.
 *
 * Pakketten en prijzen komen uit `bruiloft-pakketten.ts`. De lopende tekst is voor Utrecht geschreven.
 * Geen FAQPage in de JSON-LD (`schema.faqSchema: false`).
 *
 * TODO(paul): levertijd en opleverformaat van de foto's (in het antwoord op "Wat krijgen we na de bruiloft?").
 * TODO(paul): inhoud van Volledig analoog (wat erbij hoort; op de pagina alleen "bespreken we tijdens de kennismaking").
 * TODO(paul): zijn reiskosten in heel Nederland inbegrepen? Noem ze nergens op de pagina.
 * TODO(paul): startjaar. Deze pagina zegt bruiloften sinds 1992; /fotograaf-bruiloft zegt fotograaf vanaf 1995 (paul.ts).
 * TODO(paul): "Kunsthal" op deze pagina tegenover "Kunsthallen" op /fotograaf-bruiloft.
 * TODO(paul): alle teksten op deze pagina zijn concepten; laat ze door Paul goedkeuren.
 * TODO(paul): keuring van de foto's en alt-teksten. Geen van deze staat op /trouwfotograaf-nijmegen of /trouwfotograaf-arnhem.
 */
import type { LandingPagina, LandingUitlegBlok, LandingWerkwijze } from './types';
import { bruiloftPakketPrijs, bruiloftVanPrijs, pakketten, pakkettenNoot, pakkettenNootPakket } from './bruiloft-pakketten';
import { PRIVACY } from '../site';
import { euro } from '../../lib/prijs';
import paulFoto from '../../assets/landing/paul.webp';
import heroFoto1 from '../../assets/portfolio/bruiloften portfolio/80.JPG';
import heroFoto2 from '../../assets/portfolio/bruiloften portfolio/112.JPG';
import heroFoto3 from '../../assets/portfolio/bruiloften portfolio/120.jpg';
import impressie1 from '../../assets/portfolio/bruiloften portfolio/81.JPG';
import impressie2 from '../../assets/portfolio/bruiloften portfolio/95.jpg';
import impressie3 from '../../assets/portfolio/bruiloften portfolio/DSC03056.jpg';
import impressie4 from '../../assets/portfolio/bruiloften portfolio/bruiloft1a.jpg';
import plekkenFoto from '../../assets/portfolio/bruiloften portfolio/0020a.jpg';

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
const werkwijzeUtrecht = {
  label: '(werkwijze)',
  tekst:
    'Ik ben van ’s ochtends vroeg tot ’s avonds laat aanwezig, bij de voorbereidingen, de plechtigheid en het feest. Wat er gebeurt, fotografeer ik zoals het gebeurt.',
  link: { label: 'bekijk de pakketten', href: '#pakketten' },
} satisfies LandingWerkwijze;

// ---------------------------------------------------------------------------
// Uitleg-blokken (zie LandingUitleg.astro). Elk blok is een eigen sectie met een <h2>; subkoppen zijn <h3>.
// ---------------------------------------------------------------------------

/**
 * "Plekken in Utrecht voor trouwfoto's". Inleiding en vier plekken.
 * Per plek staat hieronder TODO(paul): heb je hier gefotografeerd?
 */
const blokPlekken: LandingUitlegBlok = {
  id: 'plekken-in-utrecht',
  label: '(plekken)',
  foto: {
    afbeelding: plekkenFoto,
    alt: 'Een oudere vrouw met een hoed, een bloemetjesjas en een donkere rok staat op het gras naast een oudere man in een geruit colbert. Zijn arm ligt om haar schouder, achter hen staat een boom.',
  },
  kop: 'Plekken in Utrecht voor trouwfoto’s',
  inhoud: [
    {
      soort: 'alinea',
      tekst: ['Vier plekken in en rond het centrum van Utrecht.'],
    },
    // TODO(paul): heb je hier gefotografeerd?
    { soort: 'kop', tekst: 'Domplein, Pandhof en Flora’s Hof' },
    {
      soort: 'alinea',
      tekst: [
        'Naast de Domtoren liggen de Pandhof, een historische binnenplaats met een gotische kloostergang, en Flora’s Hof, een groene hof.',
      ],
    },
    // TODO(paul): heb je hier gefotografeerd?
    { soort: 'kop', tekst: 'Oudegracht en Nieuwegracht' },
    {
      soort: 'alinea',
      tekst: ['Twee bekende grachten, met aan het water de werfkelders.'],
    },
    // TODO(paul): heb je hier gefotografeerd?
    { soort: 'kop', tekst: 'De Zeven Steegjes' },
    {
      soort: 'alinea',
      tekst: ['Een buurt met steegjes en kleine straten met arbeidershuizen uit het midden van de 19e eeuw.'],
    },
    // TODO(paul): heb je hier gefotografeerd?
    { soort: 'kop', tekst: 'Wilhelminapark' },
    {
      soort: 'alinea',
      tekst: ['Een park voor rust en groen.'],
    },
  ],
};

export const trouwfotograafUtrecht: LandingPagina = {
  slug: 'trouwfotograaf-utrecht',

  seo: {
    title: `Trouwfotograaf Utrecht | Paul Breuker, vanaf ${euro(laagste)}`,
    description: `Trouwfotograaf Utrecht: Paul Breuker fotografeert jullie bruiloft van ochtend tot avond, met een ingebonden fotoboek. Digitaal ${pakketPrijs('Digitaal')}, analoog ${pakketPrijs('Volledig analoog')}.`,
  },

  breadcrumb: 'Trouwfotograaf Utrecht',

  /**
   * Hero. H1 zoals opgegeven.
   * Hero-fotostrip: drie liggende foto's (3:2) uit `bruiloften portfolio`:
   *  1. 80.JPG  = bruid en bruidegom bij een vijver (LCP en Open Graph)
   *  2. 112.JPG = stel in de opening van een tent (mobiel)
   *  3. 120.jpg = plein voor een kerk
   */
  hero: {
    h1: 'Trouwfotograaf Utrecht',
    intro: [
      [
        'Trouwen jullie in Utrecht? Ik fotografeer de bruiloft zoals die is: de mensen, de plek en het moment. Ik woon in Lent, bij Nijmegen, en kom voor jullie dag naar Utrecht. Foto’s uit Love & Marriage, mijn serie over bruiloften, hingen op Photoville in New York en in de Kunsthal in Rotterdam.',
      ],
    ],
    ctaPrimair: { label: 'Bruiloft aanvragen', href: '#aanvragen' },
    ctaSecundair: { label: 'Bekijk de pakketten', href: '#pakketten' },
    fotos: [
      {
        afbeelding: heroFoto1,
        alt: 'Een bruid in een witte jurk met een lange sleep en een bruidegom in een licht pak staan op het gras naast een klinkerpad. Achter hen ligt een lange vijver, met een hoge naaldboom en gasten bij de auto’s.',
      },
      {
        afbeelding: heroFoto2,
        alt: 'Een man in een zwart pak en een vrouw in een lichte jurk staan in de opening van een grote beige tent met twee rode ballonnen, in een grasveld met een caravan en een tweede tent.',
      },
      {
        afbeelding: heroFoto3,
        alt: 'Op een plein voor een bakstenen kerk lopen twee oudere vrouwen voorbij. Achter hen staat een jong stel in het zwart, en links schrobt iemand de klinkers met een emmer ernaast.',
      },
    ],
  },

  werkwijze: werkwijzeUtrecht,

  pakketten,
  pakkettenNoot,
  pakkettenNootPakket,

  /**
   * Locaties: bewust leeg, dus de sectie verschijnt niet.
   * TODO(paul): locaties in Utrecht waar Paul echt heeft gefotografeerd. Verzin geen plekken.
   */
  locaties: {
    titel: 'Waar ik fotografeer',
    items: [],
  },

  /**
   * Impressie: vier liggende foto's (3:2), diagonale indeling. Geen van deze staat in de hero of de sfeerfoto's.
   *  1. 81.JPG        = bruidspaar voor een houten huisje
   *  2. 95.jpg        = bruidspaar in een cafetaria
   *  3. DSC03056.jpg  = dansen op een grasveld
   *  4. bruiloft1a.jpg = dansen in een feestzaal
   */
  impressie: {
    titel: 'Impressie',
    fotos: [
      {
        afbeelding: impressie1,
        alt: 'Een bruid in een witte strapless jurk en een bruidegom in een grijs pak met een lichtgroene stropdas staan op de treden van een houten huisje. Naast hen een groene afvalbak, stapels stoelen en een toiletcabine.',
      },
      {
        afbeelding: impressie2,
        alt: 'In een cafetaria met speelautomaten zitten een bruid in een witte jurk en een man in een zwart pak op een bank. Achter hen staat de toonbank, en rechts speelt een jongen een arcadespel.',
      },
      {
        afbeelding: impressie3,
        alt: 'Op een grasveld danst een man met een meisje in een witte jurk, dat achterover hangt. Daaromheen dansen andere gasten; op de achtergrond staan tenten tussen de bomen.',
      },
      {
        afbeelding: impressie4,
        alt: 'In een feestzaal danst een bruid in een witte satijnen jurk met gasten in een rij, onder wie een man in een licht colbert en een jonge vrouw in een zwart leren rokje.',
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
   * TODO(paul): de foto van Paul in hogere resolutie aanleveren (nu 400 × 400 px, dezelfde als op Nijmegen).
   */
  overPaul: {
    label: 'Over Paul',
    lead: [
      'Ik ben kunstenaar en werk sinds 1984, eerst als schilder. Sinds 1992 fotografeer ik bruiloften; die vormen onder meer de serie Love & Marriage. Verder maak ik series over leven, dood en geboorte, sociale reportages en rituelen, en portretten. Mijn werk hing op Photoville in New York, in de Kunsthal in Rotterdam, in Museum het Valkhof en in Museum de Bastei. Het verscheen in de Volkskrant, de Telegraaf, De Standaard en de Gelderlander. Ik ben lid van Dupho, Dutch Photographers.',
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
        vraag: 'Wat kost een trouwfotograaf in Utrecht?',
        antwoord: [
          [
            `Een bruiloft in Utrecht fotografeer ik voor ${pakketPrijs('Digitaal')} (Digitaal) of ${pakketPrijs('Volledig analoog')} (Volledig analoog). Ik ben dan van ’s ochtends vroeg tot ’s avonds laat aanwezig, bij beide pakketten met een ingebonden fotoboek erbij. Een trouwfotograaf heet ook wel bruidsfotograaf. Een combinatie van digitaal en analoog kan op aanvraag.`,
          ],
        ],
      },
      {
        vraag: 'Waarom is een trouwfotograaf zo duur?',
        antwoord: [
          [
            'Jullie betalen niet alleen voor de trouwdag. De voorbereiding, de kennismaking, het selecteren en bewerken van de foto’s en betrouwbare apparatuur horen er ook bij.',
          ],
        ],
      },
      {
        vraag: 'Welke plekken in Utrecht zijn mooi voor trouwfoto’s?',
        antwoord: [
          [
            'Rond de Dom liggen de Pandhof en Flora’s Hof. Langs de Oudegracht en de Nieuwegracht liggen werfkelders, in de Zeven Steegjes staan arbeidershuizen uit het midden van de 19e eeuw en het Wilhelminapark is een groene plek. Welke past, hangt af van jullie dag en het licht. Vertel me waar jullie trouwen, dan denk ik mee.',
          ],
        ],
      },
      {
        vraag: 'Fotografeer je ook in Utrecht als je in Lent woont, en in plaatsen rond Utrecht?',
        antwoord: [
          [
            'Ja. Lent ligt bij Nijmegen en ik fotografeer bruiloften door heel Nederland. Voor Zeist, Nieuwegein, Houten of een andere plaats rond Utrecht doen jullie een aanvraag met de plaats en de datum. Ik reageer binnen 3 werkdagen.',
          ],
        ],
      },
      {
        vraag: 'Kunnen we kennismaken voordat we boeken, en hoe lang van tevoren moeten we boeken?',
        antwoord: [
          [
            'Ja, een kennismaking hoort erbij. Boek me zodra de datum en de locatie van jullie bruiloft vaststaan. Na jullie aanvraag reageer ik binnen 3 werkdagen en plannen we de kennismaking.',
          ],
        ],
      },
      {
        vraag: 'Wat voor fotograaf ben je?',
        antwoord: [
          [
            'Ik ben kunstenaar en fotograaf. Foto’s uit Love & Marriage hingen op Photoville in New York en in de Kunsthal in Rotterdam. In het portfolio zien jullie mijn manier van kijken.',
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

  formulier: {
    type: 'bruiloft',
    titel: 'Bruiloft aanvragen',
    intro: [['Vertel me kort over jullie dag. Ik reageer binnen 3 werkdagen en dan plannen we een kennismaking.']],
    verzendLabel: 'Aanvraag versturen',
    privacy: [
      'Je gegevens gebruik ik alleen voor een reactie op deze aanvraag. Meer staat in de ',
      { tekst: 'privacyverklaring', href: PRIVACY.href },
      '.',
    ],
  },

  schema: {
    dienstNaam: 'Trouwfotografie in Utrecht',
    serviceType: 'Bruiloftfotografie',
    vanPrijs: laagste,
    faqSchema: false,
    werkgebied: ['Utrecht'],
    werkgebiedType: 'City',
  },
};

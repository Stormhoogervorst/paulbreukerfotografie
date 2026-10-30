/**
 * Data voor /trouwfotograaf-amsterdam (lokale bruiloftspagina, primair zoekwoord "trouwfotograaf amsterdam").
 * Zelfde indeling als /trouwfotograaf-nijmegen: Hero, Werkwijze, Impressie, OverPaul, Pakketten, één Uitleg-blok (Plekken),
 * Locaties (leeg), Vragen, Aanvraagformulier. Reviews en Beeld ontbreken, net als op Nijmegen.
 *
 * Pakketten en prijzen komen uit `bruiloft-pakketten.ts`. De lopende tekst is voor Amsterdam geschreven.
 * Geen FAQPage in de JSON-LD (`schema.faqSchema: false`).
 *
 * TODO(paul): levertijd en opleverformaat van de foto's (in het antwoord op "Wat krijgen we na de bruiloft?").
 * TODO(paul): inhoud van Volledig analoog (wat erbij hoort; op de pagina alleen "bespreken we in de kennismaking").
 * TODO(paul): zijn reiskosten in heel Nederland inbegrepen? Noem ze nergens op de pagina.
 * TODO(paul): startjaar. Deze pagina zegt bruiloften sinds 1992; /fotograaf-bruiloft zegt fotograaf vanaf 1995 (paul.ts).
 * TODO(paul): "Kunsthal" op deze pagina tegenover "Kunsthallen" op /fotograaf-bruiloft.
 * TODO(paul): alle teksten op deze pagina zijn concepten; laat ze door Paul goedkeuren.
 * TODO(paul): keuring van de foto's en alt-teksten.
 */
import type { LandingPagina, LandingUitlegBlok, LandingWerkwijze } from './types';
import { bruiloftPakketPrijs, bruiloftVanPrijs, pakketten, pakkettenNoot, pakkettenNootPakket } from './bruiloft-pakketten';
import { PRIVACY } from '../site';
import { euro } from '../../lib/prijs';
import paulFoto from '../../assets/landing/paul.webp';
import heroFoto1 from '../../assets/portfolio/bruiloften portfolio/107A1262.jpg';
import heroFoto2 from '../../assets/portfolio/love-marriage/bruiloft 14-min.jpg';
import heroFoto3 from '../../assets/portfolio/bruiloften portfolio/DSC03653.jpg';
import impressie1 from '../../assets/portfolio/bruiloften portfolio/0047.jpg';
import impressie2 from '../../assets/portfolio/bruiloften portfolio/18.jpg';
import impressie3 from '../../assets/portfolio/bruiloften portfolio/123.jpg';
import impressie4 from '../../assets/portfolio/bruiloften portfolio/DSC04464.jpg';
import plekkenFoto from '../../assets/portfolio/bruiloften portfolio/42.jpg';

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
const werkwijzeAmsterdam = {
  label: '(werkwijze)',
  tekst:
    'Ik ben de hele dag aanwezig, van ’s ochtends vroeg tot ’s avonds laat, van de voorbereidingen tot het feest. Bij Digitaal en bij Volledig analoog maak ik er een ingebonden fotoboek bij.',
  link: { label: 'bekijk de pakketten', href: '#pakketten' },
} satisfies LandingWerkwijze;

// ---------------------------------------------------------------------------
// Uitleg-blokken (zie LandingUitleg.astro). Elk blok is een eigen sectie met een <h2>; subkoppen zijn <h3>.
// ---------------------------------------------------------------------------

/**
 * "Plekken in Amsterdam voor trouwfoto's". Inleiding en vier plekken.
 * Per plek staat hieronder TODO(paul): heb je hier gefotografeerd?
 */
const blokPlekken: LandingUitlegBlok = {
  id: 'plekken-in-amsterdam',
  label: '(plekken)',
  foto: {
    afbeelding: plekkenFoto,
    alt: 'Drie mensen staan onder een boog van rode en witte ballonnen voor een voordeur. In het midden een man in een donker pak met een boeket, links een vrouw in een zwart pak, rechts een man in een licht colbert. Boven de deur hangt een bord met de tekst Hulde aan het bruidspaar.',
  },
  kop: 'Plekken in Amsterdam voor trouwfoto’s',
  inhoud: [
    {
      soort: 'alinea',
      tekst: ['Vier plekken aan de grachten.'],
    },
    // TODO(paul): heb je hier gefotografeerd?
    { soort: 'kop', tekst: 'Brouwersgracht' },
    {
      soort: 'alinea',
      tekst: [
        'Een bekende gracht. Vanaf de Papiermolensluis springt het hoekpand tussen de andere huizen uit.',
      ],
    },
    // TODO(paul): heb je hier gefotografeerd?
    { soort: 'kop', tekst: 'Zuiderkerk en de Groenburgwal' },
    {
      soort: 'alinea',
      tekst: ['Al lang een fotogenieke plek. Monet schilderde de Zuiderkerk in 1874.'],
    },
    // TODO(paul): heb je hier gefotografeerd?
    { soort: 'kop', tekst: 'Keizersgracht bij de Leidsegracht' },
    {
      soort: 'alinea',
      tekst: [
        'Brede grachten en vier bruggen met ronde openingen, waarin het water weerspiegelingen vormt.',
      ],
    },
    // TODO(paul): heb je hier gefotografeerd?
    { soort: 'kop', tekst: 'Spiegelgracht' },
    {
      soort: 'alinea',
      tekst: ['Een gracht waar in december feestverlichting hangt.'],
    },
  ],
};

export const trouwfotograafAmsterdam: LandingPagina = {
  slug: 'trouwfotograaf-amsterdam',

  seo: {
    title: `Trouwfotograaf Amsterdam | Paul Breuker, vanaf ${euro(laagste)}`,
    description: `Trouwen in Amsterdam? Paul Breuker is de hele dag aanwezig en maakt een ingebonden fotoboek. Digitaal ${pakketPrijs('Digitaal')}, volledig analoog ${pakketPrijs('Volledig analoog')}.`,
  },

  breadcrumb: 'Trouwfotograaf Amsterdam',

  /**
   * Hero-fotostrip: drie liggende foto's. De eerste en derde komen uit `bruiloften portfolio`, de middelste uit Love & Marriage.
   *  1. 107A1262.jpg = feest in een zaal (LCP en Open Graph)
   *  2. bruiloft 14-min.jpg = bruid en vrouw met strohoed bij een autoraam (mobiel)
   *  3. DSC03653.jpg = achterbank van een auto
   */
  hero: {
    h1: 'Trouwfotograaf Amsterdam',
    intro: [
      [
        'Jullie bruiloft in Amsterdam fotografeer ik vanuit Lent, bij Nijmegen. Ik fotografeer wie er zijn, waar het gebeurt en wat er op dat moment gebeurt. Bruiloften zijn sinds 1992 mijn werk. Ze vormen onder meer de serie Love & Marriage, die hing op Photoville in New York en in de Kunsthal in Rotterdam.',
      ],
    ],
    ctaPrimair: { label: 'Bruiloft aanvragen', href: '#aanvragen' },
    ctaSecundair: { label: 'Bekijk de pakketten', href: '#pakketten' },
    fotos: [
      {
        afbeelding: heroFoto1,
        alt: 'In een zaal houdt een vrouw in een paarse jurk met gouden borduursel en een rode sluier de hand vast van een gast met een groene sjaal en een geborduurde hoofddoek. Op haar handen zit henna.',
      },
      {
        afbeelding: heroFoto2,
        alt: 'Een lachende bruid met sluier en een parelketting zit in een oude auto. Door het open raam kijkt een vrouw met een strohoed lachend naar binnen.',
      },
      {
        afbeelding: heroFoto3,
        alt: 'Op de achterbank van een auto zitten twee meisjes in witte kanten jurken. Achter hen kijkt een vrouw met kort haar toe, en rechts belt een bruid in een witte off-shoulder jurk.',
      },
    ],
  },

  werkwijze: werkwijzeAmsterdam,

  pakketten,
  pakkettenNoot,
  pakkettenNootPakket,

  /**
   * Locaties: bewust leeg, dus de sectie verschijnt niet.
   * TODO(paul): locaties in Amsterdam waar Paul echt heeft gefotografeerd. Verzin geen plekken.
   */
  locaties: {
    titel: 'Waar ik fotografeer',
    items: [],
  },

  /**
   * Impressie: vier liggende foto's, diagonale indeling.
   *  1. 0047.jpg
   *  2. 18.jpg
   *  3. 123.jpg
   *  4. DSC04464.jpg
   */
  impressie: {
    titel: 'Impressie',
    fotos: [
      {
        afbeelding: impressie1,
        alt: 'In een lichte zaal leunen bruid en bruidegom voorover op twee hoge witte stoelen. Twee mannen in pak lezen een tekst voor.',
      },
      {
        afbeelding: impressie2,
        alt: 'Een man in een wit overhemd ligt op de vloer van een woonkamer met roze banken. In de deuropening staan de bruid, met een boeket, en de bruidegom in een zwart pak.',
      },
      {
        afbeelding: impressie3,
        alt: 'Gasten omhelzen elkaar op een zandstrand langs de rivier, naast een tafel met roze en blauwe linten en een man in een donkere toga. Verderop ligt een boot.',
      },
      {
        afbeelding: impressie4,
        alt: 'Vrouwen in lange turquoise jurken en één vrouw in het rood staan op een houten steiger aan het water. Aan de overkant een rij wolkenkrabbers.',
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
      'Sinds 1992 fotografeer ik bruiloften. Daarvoor en daarnaast werk ik als kunstenaar, sinds 1984: series over leven, dood en geboorte, sociale reportages, rituelen en portretten. Mijn werk is getoond op Photoville in New York, in de Kunsthal in Rotterdam, in Museum het Valkhof en in Museum de Bastei. Het verscheen in de Volkskrant, de Telegraaf, De Standaard en de Gelderlander. Ik ben lid van Dupho, Dutch Photographers.',
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
        vraag: 'Wat kost een trouwfotograaf in Amsterdam?',
        antwoord: [
          [
            `Een bruiloft in Amsterdam kost bij mij ${pakketPrijs('Digitaal')} (Digitaal) of ${pakketPrijs('Volledig analoog')} (Volledig analoog). Daarvoor ben ik van ’s ochtends vroeg tot ’s avonds laat aanwezig, bij beide pakketten inclusief een ingebonden fotoboek. Wie een trouwfotograaf zoekt, zoekt ook wel een bruidsfotograaf: dat is hetzelfde werk. Een combinatie van digitaal en analoog kan op aanvraag.`,
          ],
        ],
      },
      {
        vraag: 'Waarom is een trouwfotograaf zo duur?',
        antwoord: [
          [
            'Het werk begint voor de trouwdag en eindigt erna. Voorbereiding, kennismaking, het selecteren en bewerken van de foto’s en betrouwbare apparatuur zitten in de prijs, naast de hele dag fotograferen.',
          ],
        ],
      },
      {
        vraag: 'Welke plekken in Amsterdam zijn mooi voor trouwfoto’s?',
        antwoord: [
          [
            'Aan de Brouwersgracht en de Spiegelgracht, bij de Zuiderkerk en op de Keizersgracht bij de Leidsegracht ligt veel water in beeld. Welke plek past, hangt af van jullie dag, het seizoen en het licht. Vertel me waar jullie trouwen, dan denk ik mee.',
          ],
        ],
      },
      {
        vraag: 'Fotografeer je ook in Amsterdam als je in Lent woont, en in plaatsen rond Amsterdam?',
        antwoord: [
          [
            'Ja. Ik fotografeer bruiloften door heel Nederland. Voor Amstelveen, Haarlem, Zaandam of een andere plaats rond Amsterdam doen jullie een aanvraag met de plaats en de datum. Ik reageer binnen 3 werkdagen.',
          ],
        ],
      },
      {
        vraag: 'Kunnen we kennismaken voordat we boeken, en wanneer moeten we boeken?',
        antwoord: [
          [
            'Ja, de kennismaking hoort erbij. Boek me zodra de datum en de locatie vaststaan. Ik reageer binnen 3 werkdagen op jullie aanvraag en dan plannen we de kennismaking.',
          ],
        ],
      },
      {
        vraag: 'Wat voor fotograaf ben je?',
        antwoord: [
          [
            'Een kunstenaar die bruiloften fotografeert, sinds 1992. Mijn werk is getoond op Photoville in New York en in de Kunsthal in Rotterdam. In het portfolio zien jullie hoe ik kijk.',
          ],
        ],
      },
      {
        vraag: 'Wat krijgen we na de bruiloft?',
        // TODO(paul): levertijd en opleverformaat.
        antwoord: [
          [
            'Bij Digitaal ontvangen jullie de foto’s digitaal en een ingebonden fotoboek van jullie bruiloft. Bij Volledig analoog hoort ook een ingebonden fotoboek. Wat er verder bij hoort, bespreken we in de kennismaking.',
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
      'Alleen om op je aanvraag te reageren gebruik ik deze gegevens. De ',
      { tekst: 'privacyverklaring', href: PRIVACY.href },
      ' legt dat uit.',
    ],
  },

  schema: {
    dienstNaam: 'Trouwfotografie in Amsterdam',
    serviceType: 'Bruiloftfotografie',
    vanPrijs: laagste,
    faqSchema: false,
    werkgebied: ['Amsterdam'],
    werkgebiedType: 'City',
  },
};

/**
 * Data voor /privacy (src/pages/privacy.astro): SEO, inleiding en de secties van de privacyverklaring.
 *
 * Vaste opbouw van de pagina (verandert nooit): header, H1 "Privacyverklaring", korte inleiding, secties (elk met
 * haarlijn, titel links, tekst rechts), Panorama (foto van rand tot rand, geen kop, tegen de footer aan), footer. Geen formulier.
 *
 * De tekst is definitief aangeleverd (ik-vorm van Paul) en staat hier letterlijk. Plaatshouders in de tekst:
 * {email} en {telefoon} (mailto:- en tel:-links uit CONTACT in src/data/site.ts), {vestigingsplaats} en {kvk} (BEDRIJF in
 * site.ts) en {LAATST_BIJGEWERKT} (hieronder). Een onbekende plaatshouder laat de build falen.
 *
 * Een blok is een alinea (`Segment[]`) of een lijst (`Segment[][]`, één `Segment[]` per item).
 */
import { BEDRIJF, CONTACT } from './site';
import { linkSegmenten } from '../lib/segmenten';
import type { Segment } from './landing/types';
import panoramaFoto from '../assets/portfolio/tradities/breuker tradities 18-min.jpg';

export const seo = {
  title: 'Privacyverklaring | Paul Breuker',
  description:
    'Zo ga ik om met je gegevens als je een formulier invult of contact met me opneemt: wat ik bewaar, hoe lang en welke rechten je hebt.',
};

/** Laatste kruimel (Home > Privacyverklaring) in de BreadcrumbList. */
export const breadcrumb = 'Privacyverklaring';

/** Tekst van de H1. Het zachte afbreekteken (U+00AD) laat de lange titel op twee regels breken ("Privacy-" / "verklaring"). */
export const h1 = 'Privacy\u00ADverklaring';

/** Datum van de laatste wijziging van de tekst. Pas aan bij elke inhoudelijke wijziging. */
export const LAATST_BIJGEWERKT = '28 oktober 2026';

/**
 * Cookies en tracking: de sectie "Cookies en tracking" staat alleen op de pagina als dit `true` is.
 * Zet op `true` alleen als de meting (`node scripts/privacy-meting.mjs`, zie README) op de productiebuild geen cookies, geen
 * opslag in de browser en geen verzoeken aan derde partijen laat zien. Anders: `false`, dan toont de pagina niets over cookies.
 * Laatste meting: 28 oktober 2026 op de statische productiebuild (acht pagina's, desktop en mobiel): niets gevonden, dus `true`.
 * Draai de meting opnieuw na elke nieuwe dienst, script of embed, en voor livegang ook op een Vercel-preview-URL.
 */
export const GEEN_COOKIES_GEMETEN = true;

/**
 * Panorama onder de laatste sectie, van rand tot rand tegen de footer (component: src/components/Panorama.astro). Geen kop.
 * Bron: `breuker tradities 18` uit Tradities (src/assets/portfolio/tradities/, 1300 x 530 px).
 * TODO(paul): bevestig de foto en de alt-tekst (plaats en gebeurtenis komen uit Pauls bijschrift bij Tradities), en lever
 * een bron van minimaal 2400 px breed aan: boven 1300 px breed wordt de foto opgerekt.
 */
export const panorama = {
  afbeelding: panoramaFoto,
  alt: 'Demonstratie van studenten in Belgrado: een dichte menigte op een plein voor grote kantoorgebouwen, met hier en daar een bord boven de hoofden.',
};

export type Blok = Segment[] | Segment[][];

export interface PrivacySectie {
  /** Anker (#wie, #bewaren enzovoort) en basis voor de id van de kop. */
  id: string;
  /** H2 van de sectie. */
  titel: string;
  blokken: Blok[];
}

/** Waarden voor de plaatshouders. `kvk` ontbreekt zolang het nummer niet is ingevuld in site.ts. */
const WAARDEN: Record<string, Segment | undefined> = {
  email: { tekst: CONTACT.email, href: `mailto:${CONTACT.email}` },
  telefoon: { tekst: CONTACT.phoneDisplay, href: CONTACT.phoneHref },
  vestigingsplaats: BEDRIJF.vestigingsplaats,
  kvk: BEDRIJF.kvk,
  LAATST_BIJGEWERKT,
};

/** Zet een tekst met plaatshouders om in Segmenten (tekst en links). */
function vul(tekst: string): Segment[] {
  return tekst
    .split(/(\{[A-Za-z_]+\})/)
    .filter((deel) => deel !== '')
    .map((deel) => {
      const plaatshouder = /^\{([A-Za-z_]+)\}$/.exec(deel);
      if (!plaatshouder) return deel;
      const waarde = WAARDEN[plaatshouder[1]];
      if (waarde === undefined) {
        throw new Error(`privacy: plaatshouder {${plaatshouder[1]}} heeft geen waarde (zie src/data/site.ts).`);
      }
      return waarde;
    });
}

export const inleiding: Segment[] = vul(
  'Ik vind het belangrijk dat je weet wat ik met je gegevens doe. Hieronder lees je dat zo kort en duidelijk mogelijk. Heb je een vraag? Mail me gerust.',
);

const alleSecties: PrivacySectie[] = [
  {
    id: 'wie',
    titel: 'Wie is verantwoordelijk?',
    blokken: [
      vul(
        'Paul Breuker Fotografie, gevestigd in {vestigingsplaats}, is verantwoordelijk voor de verwerking van je gegevens. Je bereikt me via {email} of {telefoon}.',
      ),
      // Alleen met een KvK-nummer (BEDRIJF.kvk in site.ts); zonder nummer verschijnt de regel niet.
      ...(BEDRIJF.kvk ? [vul('KvK-nummer: {kvk}.')] : []),
    ],
  },
  {
    id: 'wat',
    titel: 'Wat ik verwerk en waarom',
    blokken: [
      [
        vul(
          "Als je een formulier invult. Ik ontvang je naam, e-mailadres en eventueel je telefoonnummer, plus wat je zelf invult. Bij een bruiloft zijn dat de trouwdatum, de locatie, het aantal gasten, het gewenste pakket en hoe je me kent. Bij een portret zijn dat het soort portret, de locatie, het aantal personen, waarvoor je de foto's wilt gebruiken en je gewenste periode. Daarnaast je bericht. Ik gebruik dit om op je aanvraag te reageren en een afspraak te maken, en je krijgt een automatische bevestiging per e-mail. Dat is nodig om op jouw verzoek een overeenkomst voor te bereiden (artikel 6 lid 1 onder b AVG). Bij een algemeen bericht is het mijn gerechtvaardigd belang om je vraag te beantwoorden (onder f).",
        ),
        vul(
          'Als je me mailt of belt. Ik bewaar je bericht en je gegevens om je te kunnen antwoorden. Dat doe ik op grond van mijn gerechtvaardigd belang (onder f).',
        ),
        vul(
          'Als je opdracht geeft. Voor de opdracht en de facturatie verwerk ik je naam, je adres- en contactgegevens, onze afspraken en je betaalgegevens. Dat is nodig om de overeenkomst uit te voeren (onder b) en om aan mijn wettelijke administratieplicht te voldoen (onder c).',
        ),
        vul(
          "Foto's van jou. Maak ik in opdracht foto's van jou, dan bewaar ik ze en lever ik ze aan je via een online galerij. Wil ik ze gebruiken voor mijn eigen werk, zoals mijn website, social media, exposities of publicaties, dan doe ik dat alleen als je daar toestemming voor hebt gegeven (onder a). Je kunt die toestemming altijd intrekken.",
        ),
        vul(
          'Als je mijn website bezoekt. Mijn hostingpartij Vercel legt technische gegevens vast, zoals je IP-adres, het tijdstip, de pagina die je bekijkt en je browser. Dat is nodig om de website veilig en bereikbaar te houden (gerechtvaardigd belang, onder f).',
        ),
      ],
    ],
  },
  {
    id: 'cookies',
    titel: 'Cookies en tracking',
    blokken: [
      vul(
        'Mijn website plaatst zelf geen cookies en gebruikt geen analytics of advertentietrackers. Ook de lettertypen host ik zelf, dus je browser maakt daarvoor geen verbinding met andere partijen.',
      ),
      vul(
        'Op de site staan gewone links naar Instagram, LinkedIn en Facebook. Pas als je die aanklikt, kom je op hun website, waar hun eigen privacyregels gelden.',
      ),
    ],
  },
  {
    id: 'delen',
    titel: 'Met wie ik gegevens deel',
    blokken: [
      vul(
        'Ik verkoop je gegevens niet. Ik schakel wel een paar partijen in die gegevens voor mij verwerken. Met hen heb ik afspraken over de bescherming van je gegevens.',
      ),
      [
        vul('Vercel Inc. (Verenigde Staten) host de website en verwerkt de formulieren.'),
        vul(
          'Resend, Inc. (Verenigde Staten) verstuurt de e-mails van de formulieren: de melding aan mij en de bevestiging aan jou. Resend bewaart die e-mails en de bijbehorende logs volgens de standaardinstellingen 30 dagen.',
        ),
        vul(
          "Mijn e-mailaanbieder, de aanbieder van de online galerij waarin ik foto's aan je lever en mijn boekhoudprogramma.",
        ),
        vul(
          'Bestel je een album of afdrukken, dan krijgen de drukker of leverancier de gegevens die nodig zijn om het te maken en te leveren.',
        ),
        vul('Instanties als de Belastingdienst, als de wet me dat verplicht.'),
      ],
    ],
  },
  {
    id: 'buiten-eer',
    titel: 'Gegevens buiten de Europese Economische Ruimte',
    blokken: [
      vul(
        'Vercel en Resend zitten in de Verenigde Staten en slaan gegevens daar op of verwerken ze daar. Beide gebruiken de standaardcontractbepalingen van de Europese Commissie en nemen deel aan het EU-U.S. Data Privacy Framework. Daarmee zijn je gegevens ook buiten de Europese Economische Ruimte beschermd.',
      ),
    ],
  },
  {
    id: 'bewaren',
    titel: 'Hoe lang ik je gegevens bewaar',
    blokken: [
      [
        vul('Aanvragen en berichten waar geen opdracht uit volgt: uiterlijk 12 maanden na mijn laatste reactie.'),
        vul('Gegevens van opdrachten en facturen: 7 jaar, omdat de wet dat voor mijn administratie vraagt.'),
        vul(
          "Foto's van een opdracht: ik bewaar ze in mijn archief, zodat ik ze later opnieuw kan leveren. Wil je dat ik ze verwijder, dan doe ik dat.",
        ),
        vul("Foto's die ik met jouw toestemming gebruik: zolang je die toestemming niet intrekt."),
        vul('Technische gegevens van de website: kort, volgens de instellingen van Vercel.'),
      ],
    ],
  },
  {
    id: 'beveiliging',
    titel: 'Beveiliging',
    blokken: [
      vul(
        'Mijn website gebruikt een beveiligde verbinding (https), ook voor de formulieren. Ik werk alleen met partijen waarmee ik afspraken heb over de verwerking van je gegevens (een verwerkersovereenkomst) en ik geef alleen door wat nodig is.',
      ),
    ],
  },
  {
    id: 'rechten',
    titel: 'Jouw rechten',
    blokken: [
      vul(
        'Je mag me vragen om inzage in je gegevens, om ze te corrigeren of te verwijderen, om de verwerking te beperken en om je gegevens over te dragen. Je mag ook bezwaar maken tegen een verwerking die ik doe op grond van mijn gerechtvaardigd belang, en je toestemming intrekken als je die hebt gegeven. Mail me op {email}. Ik reageer binnen één maand. Soms vraag ik je eerst te bevestigen dat jij het bent.',
      ),
      vul('Ik neem geen besluiten die alleen door een computer worden genomen en ik maak geen profielen van bezoekers.'),
      linkSegmenten(
        'Ben je niet tevreden over hoe ik met je gegevens omga? Neem dan eerst contact met me op. Je kunt ook een klacht indienen bij de Autoriteit Persoonsgegevens.',
        [{ tekst: 'Autoriteit Persoonsgegevens', href: 'https://autoriteitpersoonsgegevens.nl' }],
      ),
    ],
  },
  {
    id: 'kinderen',
    titel: 'Kinderen',
    blokken: [
      vul(
        "Foto's van kinderen maak ik alleen in overleg met hun ouders of verzorgers. De formulieren op mijn website zijn bedoeld voor volwassenen.",
      ),
    ],
  },
  {
    id: 'wijzigingen',
    titel: 'Wijzigingen',
    blokken: [
      vul(
        'Ik kan deze verklaring aanpassen, bijvoorbeeld als ik een nieuwe dienst ga gebruiken. De nieuwste versie staat altijd op deze pagina. Laatst bijgewerkt: {LAATST_BIJGEWERKT}.',
      ),
    ],
  },
];

/** De secties zoals ze op de pagina komen. "Cookies en tracking" alleen als de meting dat toelaat (GEEN_COOKIES_GEMETEN). */
export const secties: PrivacySectie[] = alleSecties.filter((sectie) => sectie.id !== 'cookies' || GEEN_COOKIES_GEMETEN);

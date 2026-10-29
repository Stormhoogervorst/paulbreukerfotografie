/**
 * Data voor /portretfotos (landingspagina voor particuliere portretten: één persoon, duo, gezin, kunstportret; primair
 * zoekwoord "portretfoto laten maken"). Zakelijke portretten, teams en LinkedIn-foto's staan op /zakelijke-portretfoto;
 * de galerij met alle portretten (/portfolio/portretten) en het project /de-gaarkeuken zijn aparte pagina's (contextuele links vanuit OverPaul).
 *
 * Paul werkt niet in een studio: hij fotografeert in natuurlijk licht, op een plek die de klant kiest. Gebruik de
 * woorden studio, studiosessie en fotostudio nooit voor zijn eigen aanbod (alleen in de ontkenning "zonder studio").
 *
 * TODO(paul): alle teksten op deze pagina zijn concepten in de ik-vorm; elke bewering over zijn werkwijze moet Paul
 * bevestigen (zie ook de README, lijst TODO(paul)).
 * TODO(paul): werkgebied, reiskosten, duur van de sessie en aantal bewerkte foto's per pakket; pagina's die in Google
 * scoren noemen die gegevens (zie ook portret-pakketten.ts).
 */
import type { LandingPagina } from './types';
import { pakketten } from './portret-pakketten';
import { kunstenaar, exposities, lidmaatschap, specialisatie } from '../paul';
import { PRIVACY } from '../site';
import { euro } from '../../lib/prijs';
import { linkSegmenten } from '../../lib/segmenten';
import paulFoto from '../../assets/landing/paul.webp';
import hero1 from '../../assets/portfolio/portretten/3.jpg';
import hero2 from '../../assets/portfolio/portretten/_MG_0926.jpg';
import hero3 from '../../assets/portfolio/portretten/DSC04527.jpg';
import impressie1 from '../../assets/portfolio/portretten/107A4529.jpg';
import impressie2 from '../../assets/portfolio/portretten/58m.jpg';
import impressie3 from '../../assets/portfolio/portretten/_MG_1353.jpg';

// ---------------------------------------------------------------------------
// Prijzen uit de pakketten (nu nog geen: zie portret-pakketten.ts)
// ---------------------------------------------------------------------------

const prijzen = pakketten.items.flatMap((pakket) => (pakket.prijs === undefined ? [] : [pakket.prijs]));
/** Laagste pakketprijs in euro's, of `undefined` zolang geen enkel pakket een prijs heeft. */
const laagste: number | undefined = prijzen.length > 0 ? Math.min(...prijzen) : undefined;

/** Title: zonder prijzen "… op locatie", met minstens één prijs "… vanaf €{laagste prijs}". */
export function portretTitle(laagstePrijs: number | undefined): string {
  return laagstePrijs === undefined
    ? 'Portretfoto laten maken op locatie | Paul Breuker'
    : `Portretfoto laten maken | Paul Breuker, vanaf ${euro(laagstePrijs)}`;
}

/** Description (onder 160 tekens): met een prijs komt "vanaf €X" erbij en is het einde ingekort. */
// TODO(paul): bevestig "Nijmegen en omgeving" als werkgebied.
export function portretDescription(laagstePrijs: number | undefined): string {
  return laagstePrijs === undefined
    ? 'Portretfoto laten maken in natuurlijk licht, bij jou thuis of op een plek naar keuze. Paul Breuker fotografeert zonder studio, in Nijmegen en omgeving.'
    : `Portretfoto laten maken in natuurlijk licht, bij jou thuis of op een plek naar keuze. Paul Breuker, zonder studio, in Nijmegen en omgeving. Vanaf ${euro(laagstePrijs)}.`;
}

/** Antwoord op "Wat kost een portretfoto laten maken?": uit de pakkettendata, dus de prijzen kunnen nooit afwijken. */
function kostenTekst(): string {
  if (laagste === undefined) {
    return 'De prijs hangt af van het soort portret en het aantal personen. Vertel me in het aanvraagformulier wat je zoekt, dan laat ik je binnen 24 uur weten wat het kost.';
  }
  const lijst = pakketten.items
    .flatMap((pakket) => (pakket.prijs === undefined ? [] : [`${pakket.naam} ${euro(pakket.prijs)}`]))
    .join(', ');
  return `Een portretsessie bij mij kost vanaf ${euro(laagste)}. De prijs hangt af van het soort portret en het aantal personen: ${lijst}. Wat erbij hoort lees je bij de pakketten.`;
}

// Bewaking: een description boven de 160 tekens wordt in Google afgekapt.
const description = portretDescription(laagste);
if (description.length > 160) {
  console.warn(`[portretfotos] description is ${description.length} tekens (maximaal 160). Kort hem in.`);
}

// Eerste zin van `kunstenaar` (jaartallen 1984 en 1995 komen uit paul.ts), met een eigen slot over portret.
const eindeEersteDeel = kunstenaar.indexOf(' Die twee');
const kunstenaarKort = kunstenaar.slice(0, eindeEersteDeel);
if (eindeEersteDeel === -1) throw new Error('portretfotos: de tekst `kunstenaar` in paul.ts is gewijzigd; pas de openingsalinea aan.');

export const portretfotos: LandingPagina = {
  slug: 'portretfotos',

  seo: {
    title: portretTitle(laagste),
    description,
  },

  breadcrumb: 'Portretfoto’s',

  hero: {
    h1: 'Portretfoto\nlaten maken', // \n = vaste regelbreuk in de H1 (zie LandingHero.astro)
    // TODO(paul): intro laten goedkeuren (werkwijze: natuurlijk licht, bij de klant, "zonder studio"; werkgebied "Nijmegen en omgeving" staat in de description).
    intro: [
      'Ik fotografeer mensen in natuurlijk licht, zonder studio. Ik kom naar je toe: thuis, op je werk, buiten of op een plek die iets over jou zegt.',
      `Mijn werk is getoond in onder meer de Kunsthal in Rotterdam en op Photoville in New York. Ik maakte ook een portretserie bij een gaarkeuken in Rusland.${laagste === undefined ? '' : ` Een portretsessie kost vanaf ${euro(laagste)}.`}`,
    ],
    // #aanvragen (Aanvraagformulier) en #pakketten (Pakketten) bestaan.
    ctaPrimair: { label: 'Portretfoto aanvragen', href: '#aanvragen' },
    ctaSecundair: { label: 'Bekijk de pakketten', href: '#pakketten' },
    /**
     * Fotostrip (drie foto's, in volgorde; desktop alle drie, mobiel alleen de tweede, rand tot rand; zie MOBIEL_FOTOS in
     * LandingHero.astro). Alle bronnen staan in src/assets/portfolio/portretten/ (de galerij /portfolio/portretten). De
     * oude bronnen (PORTRET BEEK 08-min.jpg, portret 5.jpg, Portret 2.jpg; 600 × 900 px) zijn uit die map verdwenen. De
     * vervangers komen uit dezelfde serie en zijn gekozen met een perceptuele hash (zie scripts/foto-mapping.md):
     *  1. 3.jpg         = oudere vrouw, zwart-wit (LCP en Open Graph; was PORTRET BEEK 08-min.jpg; "onzeker", afstand 20)
     *  2. _MG_0926.jpg  = jonge man met capuchon (op mobiel de enige foto in de hero; was portret 5.jpg; "gekozen vervanger")
     *  3. DSC04527.jpg  = kind in groene trui (was Portret 2.jpg; "onzeker", afstand 17)
     * De overige foto's staan in Impressie (zie daar). Wisselen: vervang de import bovenin en de `afbeelding` hieronder.
     * TODO(paul): keuze van deze drie foto's beoordelen (de inhoud wijkt af van de oude foto's, zie scripts/foto-mapping.md) en
     * alt-teksten laten controleren. Foto's van een sessie op locatie (thuis, op het werk, buiten) aanleveren: dit zijn
     * close-ups en laten de plek nauwelijks zien.
     */
    fotos: [
      {
        afbeelding: hero1,
        alt: 'Zwart-witportret van een oudere vrouw met een getinte bril, kettingen en een blouse met bloemenprint, tegen een zwarte achtergrond. Ze kijkt rustig in de camera.',
      },
      {
        afbeelding: hero2,
        alt: 'Portret van een jonge man met een brede lach, in een grijs-blauw jack met capuchon en een beige muts. De achtergrond is licht en onscherp.',
      },
      {
        afbeelding: hero3,
        alt: 'Portret van een kind met warrig lichtbruin haar in een donkergroene trui. Het kijkt rustig in de camera; de achtergrond is licht en onscherp.',
      },
    ],
  },

  // TODO(paul): tekst laten goedkeuren (werkwijze: natuurlijk licht, bij de klant, eerst een gesprek, rustig en zonder haast).
  werkwijze: {
    label: '(werkwijze)',
    tekst:
      'Ik werk met natuurlijk licht en zonder studio. Ik kom naar jou toe, of naar een plek die jij kiest: thuis, op je werk of buiten. We beginnen met een gesprek over wat je met de foto’s wilt. Daarna fotografeer ik rustig en zonder haast, zodat je portret lijkt op wie je bent.',
    link: { label: 'bekijk de pakketten', href: '#pakketten' },
  },

  pakketten,

  /**
   * Impressie: drie staande foto's uit de serie Portretten op één rij (indeling "rij", zie LandingImpressie.astro), van
   * links naar rechts (relatieve hoogtes 0,88 / 1 / 0,76). Alle drie zijn staand. Bronnen
   * (src/assets/portfolio/portretten/); geen enkele staat in de hero. De oude bronnen (PORTRET BEEK 10-min.jpg,
   * Portret 1.jpg, PORTRET BEEK 03-min.jpg) staan niet meer in die map; vervangen door foto's uit dezelfde serie, gekozen
   * met een perceptuele hash (zie scripts/foto-mapping.md):
   *  1. 107A4529.jpg  = meisje met donker haar (was PORTRET BEEK 10-min.jpg; "onzeker", afstand 18)
   *  2. 58m.jpg       = oude vrouw met hoofddoek, zwart-wit (was Portret 1.jpg; "gekozen vervanger")
   *  3. _MG_1353.jpg  = meisje met staartjes (was PORTRET BEEK 03-min.jpg; "gekozen vervanger")
   * (PORTRET BEEK 04-min.jpg, meisje met bloemenkrans, werd hier niet gebruikt.)
   */
  // TODO(paul): alt-teksten laten controleren door Paul (beschreven naar wat op de foto's te zien is).
  impressie: {
    titel: 'Impressie',
    indeling: 'rij',
    fotos: [
      {
        afbeelding: impressie1,
        alt: 'Portret van een meisje met donker haar tot op haar schouders en een donkerblauw shirt met bloemetjes. Ze kijkt in de camera; achter haar is een raam onscherp te zien.',
      },
      {
        afbeelding: impressie2,
        alt: 'Zwart-witfoto van een oude vrouw met een hoofddoek en een donkere jas, die met haar handen op haar knieën voor een muur zit.',
      },
      {
        afbeelding: impressie3,
        alt: 'Portret van een meisje met blond haar in twee staartjes met roze elastiekjes, in een rode jurk met stippen. Ze kijkt opzij in de camera.',
      },
    ],
    // /portfolio/portretten bestaat (src/pages/portfolio/portretten.astro). De pijl → tekent LandingImpressie zelf (svg).
    link: { label: 'bekijk meer portretten', href: '/portfolio/portretten' },
  },

  /**
   * OverPaul: dezelfde foto en indeling als op /fotograaf-bruiloft. Teksten uit src/data/paul.ts waar dat kan (kunstenaar,
   * specialisatie, exposities, lidmaatschap); ‘promoties’ en ‘radboud’ staan er bewust niet in.
   */
  // TODO(paul): tekst laten goedkeuren (jaartallen 1984/1995, de werkwijze "zonder studio en met natuurlijk licht, op de plek waar jij bent", de zin over de portretserie bij een gaarkeuken in Rusland).
  // TODO(paul): bevestig dat /de-gaarkeuken dit project is (portretserie bij een gaarkeuken in Rusland) en voeg jaartal en plaats van de serie toe.
  // TODO(paul): /de-gaarkeuken, /love-marriage en /take-me-to-the-river bestaan nog niet (404); zie README, "Nog te bouwen".
  overPaul: {
    label: 'Over Paul',
    lead: [
      `${kunstenaarKort} Die twee disciplines voeden elkaar: schilders kijken naar licht, compositie en gebaar, en dat neem ik mee in elk portret.`,
    ],
    alineas: [
      [
        specialisatie,
        ' Ik werk zonder studio en met natuurlijk licht, op de plek waar jij bent. Bij een gaarkeuken in Rusland maakte ik een portretserie: ',
        { tekst: 'De Gaarkeuken', href: '/de-gaarkeuken' },
        '. Mijn vrije portretten vind je in de serie ',
        { tekst: 'Portretten', href: '/portfolio/portretten' },
        '. Of het nu daar is of bij jou thuis, ik neem de tijd voor de persoon voor de camera.',
      ],
      [
        ...linkSegmenten(exposities, [
          { tekst: 'Love & Marriage', href: '/love-marriage' },
          { tekst: 'Take me to the river', href: '/take-me-to-the-river' },
        ]),
        ' ',
        lidmaatschap,
      ],
    ],
    links: [],
    foto: {
      afbeelding: paulFoto,
      alt: 'Zwart-witportret van fotograaf Paul Breuker',
    },
  },

  /**
   * Vragen: vijf veelgestelde vragen (zie LandingVragen.astro). De prijzen in het antwoord op de eerste vraag komen uit
   * `pakketten`. De platte tekst van de antwoorden is ook de bron voor de FAQPage in de JSON-LD (zie LandingLayout.astro).
   */
  // TODO(paul): antwoorden door Paul laten goedkeuren (alle vijf zijn concepten over zijn werkwijze).
  // TODO(paul): /portfolio, /zakelijke-portretfoto en #aanvragen: /zakelijke-portretfoto bestaat nog niet (404); zie README, "Nog te bouwen".
  vragen: {
    titel: 'Veelgestelde vragen',
    items: [
      {
        vraag: 'Wat kost een portretfoto laten maken?',
        antwoord: [
          linkSegmenten(
            kostenTekst(),
            laagste === undefined
              ? [{ tekst: 'het aanvraagformulier', href: '#aanvragen' }]
              : [{ tekst: 'de pakketten', href: '#pakketten' }],
          ),
        ],
      },
      {
        vraag: 'Waar vindt de portretsessie plaats?',
        antwoord: [
          // TODO(paul): werkgebied en reiskosten: voeg dat hier toe zodra het bekend is.
          linkSegmenten(
            'Ik werk zonder studio en met natuurlijk licht. Ik kom naar je toe: bij jou thuis, op je werk, buiten of op een andere plek die jij kiest. Vooraf bespreken we welke plek bij jou past. Geef je wens door in het aanvraagformulier.',
            [{ tekst: 'het aanvraagformulier', href: '#aanvragen' }],
          ),
        ],
      },
      {
        vraag: 'Wat trek ik aan voor een portretfoto?',
        antwoord: [
          // TODO(paul): advies over kleding laten goedkeuren.
          [
            'Kies kleding waarin je je prettig voelt en die bij je past. Effen kleuren en rustige stoffen leiden het minst af van je gezicht. Twijfel je, neem dan een tweede outfit mee; dan kijken we samen wat het beste werkt.',
          ],
        ],
      },
      {
        vraag: 'Hoe kies ik een portretfotograaf?',
        antwoord: [
          linkSegmenten(
            'Kijk eerst of je jezelf herkent in de beelden. Bekijk het portfolio en let op of de sfeer bij je past: rustig, direct, artistiek of juist informeel. Past mijn werk bij je, dan hoor ik graag wat je zoekt via het aanvraagformulier.',
            [
              { tekst: 'het portfolio', href: '/portfolio' },
              { tekst: 'het aanvraagformulier', href: '#aanvragen' },
            ],
          ),
        ],
      },
      {
        vraag: 'Maak je ook zakelijke portretten en LinkedIn-foto’s?',
        antwoord: [
          linkSegmenten(
            'Ja. Voor zakelijke portretten, teams en LinkedIn-foto’s heb ik een eigen pagina: zakelijke portretfoto. Zoek je een promotiefoto bij de Radboud Universiteit, kijk dan op fotograafpromotiesradboud.nl.',
            [
              { tekst: 'zakelijke portretfoto', href: '/zakelijke-portretfoto' },
              { tekst: 'fotograafpromotiesradboud.nl', href: 'https://www.fotograafpromotiesradboud.nl/' },
            ],
          ),
        ],
      },
    ],
  },

  /**
   * Aanvraagformulier (zie LandingFormulier.astro): anker #aanvragen. De velden en de validatie staan in
   * src/lib/formulieren/portret.ts; de opties van het veld "pakket" komen uit `pakketten`.
   */
  // TODO(paul): intro en privacytekst laten goedkeuren; de privacytekst moet kloppen met de privacyverklaring (/privacy) die nog geschreven moet worden.
  formulier: {
    type: 'portret',
    titel: 'Portretfoto aanvragen',
    intro: [['Vertel me kort wat je zoekt. Ik reageer binnen 24 uur.']],
    verzendLabel: 'Aanvraag versturen',
    privacy: [
      'Ik gebruik je gegevens alleen om te reageren op je aanvraag. Lees de ',
      { tekst: 'privacyverklaring', href: PRIVACY.href },
      '.',
    ],
  },

  schema: {
    dienstNaam: 'Portretfotografie',
    serviceType: 'Portretfotografie op locatie',
    // Geen vanPrijs: die komt uit de pakketprijzen zodra Paul ze aanlevert (zie LandingLayout.astro).
    // TODO(paul): werkgebied aanvullen of bevestigen.
    werkgebied: ['Nijmegen', 'Arnhem'],
  },
};

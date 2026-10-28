/**
 * Data voor /fotograaf-bruiloft (algemene bruiloftpagina, primair zoekwoord "fotograaf bruiloft").
 * /trouwfotograaf-nijmegen en /trouwfotograaf-arnhem zijn gereserveerd voor latere lokale pagina's met eigen inhoud.
 */
import type { LandingPagina } from './types';
import { pakketten } from './bruiloft-pakketten';
import { exposities, kunstenaar, lidmaatschap, specialisatie } from '../paul';
import { PRIVACY } from '../site';
import { euro } from '../../lib/prijs';
import { linkSegmenten } from '../../lib/segmenten';
import beeldBruiloft02 from '../../assets/landing/beeld-bruiloft-02.jpg';
import paulFoto from '../../assets/landing/paul.webp';
import heroBruiloft18 from '../../assets/landing/hero-bruiloft-18.jpg';
import impressie01 from '../../assets/landing/impressie/01-bruiloft-20.jpg';
import impressie02 from '../../assets/landing/impressie/02-bruiloft-16.jpg';
import impressie04 from '../../assets/landing/impressie/04-bruiloft-15.jpg';
import impressie07 from '../../assets/landing/impressie/07-bruiloft-07.jpg';
import impressie08 from '../../assets/landing/impressie/08-bruiloft-11.jpg';
import impressie09 from '../../assets/landing/impressie/09-bruiloft-14.jpg';

/** Prijs van een pakket uit `pakketten` als "€3.250"; de FAQ gebruikt dit, zodat de prijzen nooit kunnen afwijken. */
function pakketPrijs(naam: string): string {
  const prijs = pakketten.items.find((pakket) => pakket.naam === naam)?.prijs;
  if (prijs === null || prijs === undefined) throw new Error(`Pakket "${naam}" heeft geen prijs.`);
  return euro(prijs);
}

export const fotograafBruiloft: LandingPagina = {
  slug: 'fotograaf-bruiloft',

  seo: {
    title: 'Fotograaf bruiloft | Paul Breuker, vanaf €3.250',
    // TODO(paul): werkgebied bevestigen (Nijmegen, Arnhem en "daarbuiten").
    description:
      'Ik ben Paul Breuker, bruiloftfotograaf. Ik fotografeer bruiloften in Nijmegen, Arnhem en daarbuiten, met aandacht voor de mensen en het moment. Vanaf €3.250.',
  },

  breadcrumb: 'Fotograaf bruiloft',

  hero: {
    h1: 'Fotograaf bruiloft',
    intro: [
      'Ik fotografeer je bruiloft zoals die is: de mensen, de plek en het moment. Mijn werk is onder meer getoond in de Kunsthallen en Photoville New York (VS). Pakketten voor een bruiloft starten vanaf €3.250.',
    ],
    // #pakketten (sectie Pakketten) en #aanvragen (Aanvraagformulier) bestaan.
    ctaPrimair: { label: 'Bruiloft aanvragen', href: '#aanvragen' },
    ctaSecundair: { label: 'Bekijk de pakketten', href: '#pakketten' },
    /**
     * Fotostrip (drie foto's, in volgorde; desktop alle drie, mobiel alleen de tweede, bruiloft 20, rand tot rand; zie MOBIEL_FOTOS in LandingHero.astro). Bronnen zijn kopieën uit
     * src/assets/portfolio/love-marriage/ (de portfoliokopieën blijven staan), 1200 px breed en liggend (3:2):
     *  1. hero-bruiloft-18.jpg          = bruiloft 18 (LCP en Open Graph)
     *  2. impressie/01-bruiloft-20.jpg  = bruiloft 20 (staat ook in Impressie, zelfde bestand)
     *  3. impressie/02-bruiloft-16.jpg  = bruiloft 16 (staat ook in Impressie, zelfde bestand)
     * TODO(paul): alt-teksten laten controleren door Paul (beschreven naar wat op de foto's te zien is, zonder namen of plaatsen).
     * TODO(paul): staande bruiloftfoto's aanleveren; met alleen liggende foto's wordt de strip laag en breed.
     */
    fotos: [
      {
        afbeelding: heroBruiloft18,
        alt: 'Een bruid met een lange sluier zit gehurkt in een klein toilet, gezien vanuit de gang met witte deuren.',
      },
      {
        afbeelding: impressie01,
        alt: 'Een bruid in een witte jurk wordt in een slaapkamer geholpen door twee vrouwen, terwijl een meisje in een witte jurk toekijkt en een jonge vrouw in een witte jurk bij de deur staat.',
      },
      {
        afbeelding: impressie02,
        alt: 'Een bruidegom in pak met corsage kijkt vanaf de achterbank van een auto over zijn schouder naar de camera; naast hem zit de bruid met opgestoken haar, met haar rug naar ons toe.',
      },
    ],
  },

  // TODO(paul): tekst laten goedkeuren
  werkwijze: {
    label: '(werkwijze)',
    tekst:
      'Ik ben van ’s ochtends vroeg tot ’s avonds laat aanwezig. Zo krijg je een echte fotoreportage van de hele dag: van de voorbereidingen tot het feest ’s avonds. Ik fotografeer de dag zoals hij verloopt.',
    // #pakketten is de sectie Pakketten (op de pagina staat die vóór Impressie).
    link: { label: 'bekijk de pakketten', href: '#pakketten' },
  },

  /**
   * Impressie: vier foto's uit de serie Love & Marriage, in vaste volgorde (twee rijen van twee, zie LandingImpressie.astro).
   * Alle vier zijn liggend (3:2, 1200 px breed). Bronnen (de portfoliokopieën in src/assets/portfolio/love-marriage/ blijven staan):
   *  1. impressie/04-bruiloft-15.jpg = bruiloft 15
   *  2. impressie/08-bruiloft-11.jpg = bruiloft 11
   *  3. impressie/07-bruiloft-07.jpg = bruiloft 07
   *  4. impressie/09-bruiloft-14.jpg = bruiloft 14 (staat ook als hero op de homepage)
   * De andere bestanden in src/assets/landing/impressie/ (01, 02, 03, 05, 06) zijn hier niet meer in gebruik; 01 en 02
   * staan nog in de hero-fotostrip.
   */
  // TODO(paul): alt-teksten laten controleren door Paul (beschreven naar wat op de foto's te zien is, zonder namen of plaatsen).
  impressie: {
    titel: 'Impressie',
    fotos: [
      {
        afbeelding: impressie04,
        alt: 'Zwart-witfoto op een bosweg: een man met een hoed kleedt zich om bij een open auto, terwijl een bruid met een boeket lelietjes-van-dalen op de voorgrond toekijkt.',
      },
      {
        afbeelding: impressie08,
        alt: 'Een bruid in een witte jurk en een vrouw in een bordeauxrode jurk zitten op een bed en houden de hand vast van een man die op een kussen ligt; naast het bed staat een schoen met een beenprothese.',
      },
      {
        afbeelding: impressie07,
        alt: 'Een bruid in een witte jurk en een bruidegom in een donker pak zitten naast elkaar op een bank in een snackbar, terwijl rechts iemand aan een speelautomaat staat.',
      },
      {
        afbeelding: impressie09,
        alt: 'Een lachende bruid met sluier zit achter in een oude auto; door het open raam kijkt een vrouw met een strohoed met wijd open mond naar binnen.',
      },
    ],
    // /portfolio bestaat (src/pages/portfolio.astro).
    link: { label: 'meer werk in het portfolio', href: '/portfolio' },
  },

  /**
   * OverPaul: selectie uit de volledige bio in src/data/paul.ts (kunstenaar, specialisatie, exposities, lidmaatschap).
   * ‘promoties’ en ‘radboud’ staan er bewust niet in (ze gaan over promotiefotografie; ze blijven voor /over-paul).
   * Geen link naar promoties of de Radboud-site. Het label ("Over Paul") is alleen voor schermlezers (visueel verborgen h2).
   */
  // TODO(paul): tekst laten goedkeuren (jaartallen 1984/1995, spelling van de musea en kranten, zie paul.ts), de alt-tekst van de foto controleren en de foto in hogere resolutie aanleveren (minimaal 1200 px breed; nu 400 × 400 px).
  // TODO(paul): /over-paul, /love-marriage en /take-me-to-the-river bestaan nog niet (404); zie README, "Nog te bouwen".
  overPaul: {
    label: 'Over Paul',
    lead: [kunstenaar],
    alineas: [
      [
        specialisatie,
        ' ',
        ...linkSegmenten(exposities, [
          { tekst: 'Love & Marriage', href: '/love-marriage' },
          { tekst: 'Take me to the river', href: '/take-me-to-the-river' },
        ]),
      ],
      [lidmaatschap],
    ],
    links: [
      { label: 'meer over paul', href: '/over-paul' },
    ],
    foto: {
      afbeelding: paulFoto,
      alt: 'Zwart-witportret van fotograaf Paul Breuker',
    },
  },

  /**
   * Vragen: vier veelgestelde vragen (zie LandingVragen.astro). De prijzen komen uit `pakketten` hierboven. De platte
   * tekst van de antwoorden is ook de bron voor de FAQPage in de JSON-LD (zie LandingLayout.astro).
   */
  // TODO(paul): antwoorden door Paul laten goedkeuren, in het bijzonder het antwoord op de uurtarief-vraag (is het waar dat Paul voor bruiloften geen uurtarief hanteert en geen korte opdrachten doet?).
  // TODO(paul): overweeg extra vragen waarop alleen Paul het antwoord weet: wanneer ontvang je de foto’s, werk je ook buiten Nijmegen en Arnhem en tegen welke reiskosten, hoe ver van tevoren moet ik boeken, wat gebeurt er bij slecht weer.
  // TODO(paul): /portfolio en #aanvragen bestaan; /contact nog niet (404).
  vragen: {
    titel: 'Veelgestelde vragen',
    items: [
      {
        vraag: 'Hoeveel kost een trouwfotograaf?',
        antwoord: [
          [
            'Dat verschilt per fotograaf en per pakket. Bij mij kost een bruiloft ',
            pakketPrijs('Reportage'),
            ' (Reportage), ',
            pakketPrijs('Album'),
            ' (Album) of ',
            pakketPrijs('Collectie'),
            ' (Collectie). In alle drie fotografeer ik de hele dag, van ’s ochtends vroeg tot ’s avonds laat. Wat er per pakket bij zit, zie je bij ',
            { tekst: 'de pakketten', href: '#pakketten' },
            '.',
          ],
        ],
      },
      {
        vraag: 'Waarom is een trouwfotograaf zo duur?',
        antwoord: [
          [
            'Je betaalt niet alleen voor de uren op de dag zelf. Een hele dag fotograferen levert honderden foto’s op, die ik daarna selecteer en bewerk. Daarnaast gaat er tijd zitten in het kennismaken, het voorbereiden van de dag en het opleveren van de galerij. En de apparatuur en het reservemateriaal moeten betrouwbaar zijn op een dag die je maar één keer hebt.',
          ],
        ],
      },
      {
        vraag: 'Hoe kies ik een trouwfotograaf?',
        antwoord: [
          [
            'Kijk eerst of de stijl je aanspreekt, bijvoorbeeld in ',
            { tekst: 'mijn portfolio', href: '/portfolio' },
            '. Je bent een hele dag samen, dus het moet ook klikken. Daarom begin ik altijd met een kennismaking: dan vertel je hoe jullie dag eruitziet en zie je hoe ik werk. Wil je dat? ',
            { tekst: 'Vraag een bruiloft aan', href: '#aanvragen' },
            '.',
          ],
        ],
      },
      {
        vraag: 'Wat kost een fotograaf voor 1 uur?',
        antwoord: [
          [
            'Voor een bruiloft werk ik niet met een uurtarief. Mijn pakketten dekken de hele dag, zodat je een echte fotoreportage krijgt in plaats van een paar losse momenten. Zoek je iets anders, bijvoorbeeld een portretsessie? Neem dan ',
            { tekst: 'contact', href: '/contact' },
            ' op, dan kijk ik wat mogelijk is.',
          ],
        ],
      },
    ],
  },

  /**
   * Beeld: één foto van rand tot rand onder het formulier (zie LandingBeeld.astro). Bron: kopie van
   * src/assets/portfolio/love-marriage/bruiloft 02-min.jpg (de portfoliokopie blijft staan), liggend, 1200 × 796 px.
   */
  // TODO(paul): alt-tekst laten controleren (beschreven naar wat op de foto te zien is, zonder namen of plaatsen) en een versie van minimaal 2400 px breed aanleveren: van rand tot rand wordt de foto boven 1200 px breed opgeschaald.
  beeld: {
    afbeelding: beeldBruiloft02,
    alt: 'Zwart-witfoto van een bruiloftsfeest in een zaal met lampionnen: de gasten dansen door elkaar en zijn onscherp door de beweging, terwijl een meisje in een jurkje aan de rand toekijkt.',
  },

  pakketten,

  /**
   * Aanvraagformulier (zie LandingFormulier.astro): anker #aanvragen; staat vóór Beeld. De velden en de
   * validatie staan in src/lib/formulieren/bruiloft.ts; de pakketkeuzes komen uit `pakketten`.
   */
  // TODO(paul): intro en privacytekst laten goedkeuren; de privacytekst moet kloppen met de privacyverklaring (/privacy) die nog geschreven moet worden.
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
    dienstNaam: 'Bruiloftfotografie',
    vanPrijs: 3250,
    // TODO(paul): werkgebied aanvullen of bevestigen.
    werkgebied: ['Nijmegen', 'Arnhem'],
  },
};

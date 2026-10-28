/**
 * Content van de homepage. Alles wat op de pagina staat komt hieruit.
 *
 * Regels:
 * - Alleen teksten en feiten die Paul heeft aangeleverd. Ontbreekt iets: TODO(paul).
 * - Afbeeldingen staan in src/assets/home/<name>.<jpg|jpeg|png|webp|avif>.
 *   Bestaat het bestand niet, dan toont de pagina een neutraal blok met dezelfde verhouding.
 * - Optionele velden (jaar, serie, pull quote) die leeg zijn worden niet getoond.
 */

/** Alt-tekst zolang Paul de foto's niet heeft beschreven. Staat in de README-lijst. */
const TODO_ALT = 'TODO(paul): beschrijf foto';

export interface HomePhoto {
  /** Bestandsnaam zonder extensie, in src/assets/home/. */
  name: string;
  /** Nederlandse, beschrijvende alt-tekst (wie/wat/waar). */
  alt: string;
}

export interface HomeHeroFoto {
  /** Bestandsnaam zonder extensie, in src/assets/home/. */
  afbeelding: string;
  /** Nederlandse, beschrijvende alt-tekst (wie/wat/waar). */
  alt: string;
  /** "A": groot (LCP), "B": middel (liggend), "C": klein (staand). */
  rol: 'A' | 'B' | 'C';
}

export interface HomeLink {
  label: string;
  href: string;
}

export interface HomeDienst {
  /** Decoratief nummer ("01"), aria-hidden. */
  nummer: string;
  title: string;
  href: string;
  /** Externe link: opent in een nieuw tabblad (rel="noopener") met verborgen tekst voor schermlezers. */
  extern: boolean;
  /** Optioneel, rechts in de rij (bijvoorbeeld een prijs). Leeg of weggelaten: het veld wordt niet getoond. */
  meta?: string;
}

export interface HomeProject {
  title: string;
  href: string;
  photo: HomePhoto;
  /** Optioneel, onder de titel (bijvoorbeeld "2018 – 2021"). Leeg of weggelaten: het veld wordt niet getoond. */
  jaar?: string;
  /**
   * Kaartpositie in de rij van drie (component: src/components/Projecten.astro), van links naar rechts:
   * "links" = staande foto (5 / 6) op de linkermarge, "midden" = liggende foto (6 / 5, de grootste), lager,
   * "rechts" = hoge, smalle foto in natuurlijke verhouding op de rechtermarge.
   * De volgorde in de lijst is ook de volgorde op mobiel (onder elkaar).
   */
  positie: 'links' | 'midden' | 'rechts';
}

export interface HomeBeeldDuoItem {
  /** Bestandsnaam zonder extensie, in src/assets/home/. */
  afbeelding: string;
  /** Nederlandse, beschrijvende alt-tekst (wie/wat/waar). */
  alt: string;
  /** "links": brede foto, ongeveer tweederde van de breedte. "rechts": aanvullende, bij voorkeur staande foto. */
  positie: 'links' | 'rechts';
}

export interface HomeExpositie {
  /** Jaar of periode, zoals het getoond wordt ("2014 – 2018", met en-streep en spaties). */
  jaar: string;
  /** Titel van de expositie of serie; H3 in de rij. */
  titel: string;
  /** Eén regel per plek, inclusief plaats tussen haakjes. Meer dan 4: de lijst gaat op desktop in twee kolommen. */
  locaties: string[];
  /** Optioneel. Leeg of weggelaten: het veld wordt niet getoond. */
  publicaties?: string;
}

export interface HomeExhibition {
  name: string;
  place: string;
  /** TODO(paul): jaar. Leeg laten tot Paul het aanlevert. */
  year?: string;
  /** TODO(paul): serie. Leeg laten tot Paul het aanlevert. */
  series?: string;
}

export const home = {
  seo: {
    title: 'Paul Breuker | Bruiloft, portret en kunst in Nijmegen',
    description:
      'Paul Breuker fotografeert bruiloften, portretten en kunstseries. Al 35 jaar werk, getoond in onder meer de Kunsthal en het Valkhof. Bruiloften vanaf €3.250.',
  },

  hero: {
    /** Alleen de naam. De trefwoordcontext zit in title, description en de eerste zin van `lead`. */
    h1: 'Paul Breuker',
    lead: 'Fotograaf in Nijmegen. Ik fotografeer bruiloften, portretten en kunstseries. Al 35 jaar maak ik beelden van mensen en plekken.',
    /** Knop onder de lead. De commerciële pagina's staan in de sectie "Diensten". */
    knop: { label: 'Portfolio', href: '/portfolio' } satisfies HomeLink,
    /**
     * Drie foto's in de hero (component: hero in src/pages/index.astro), links tegen de schermrand.
     * rol "A": groot, LCP-beeld (eager, fetchpriority high). Mobiel staand (2:3, ongecropt), desktop 4 / 5.
     *   Bron: src/assets/home/hero-take-me-to-the-river-1.jpg (was public/Take me to the river 1.jpg).
     *   De vorige hero-foto staat als src/assets/home/gaarkeuken-3.jpg.
     * rol "B": middel, liggend (5 / 4). Alleen vanaf 900 px zichtbaar (daaronder display: none, dus geen download).
     *   Bron: src/assets/home/hero-bruiloft-2.jpg (was public/bruiloft 2.jpg).
     * rol "C": klein, staand (4 / 5). Alleen vanaf 900 px zichtbaar.
     *   Bron: src/assets/home/hero-portret-1.jpg (was public/Portret 1.jpg).
     * De volgorde in de lijst is de volgorde in de HTML. Niet in Projecten of BeeldDuo gebruikt.
     * TODO(paul): controleer de alt-teksten (beschreven naar wat op de foto te zien is); vul naam, plaats en jaar in
     * als je die wilt noemen. Bij B en C ontbreekt ook de serie (B hoort waarschijnlijk bij Love & Marriage, C bij Portretten).
     */
    fotos: [
      {
        afbeelding: 'hero-take-me-to-the-river-1',
        alt: 'Bovenaanzicht van rood poeder in een lange, smalle bak met witte wanden: donkerrode heuvels met daartussen een roze, tegelachtig oppervlak.',
        rol: 'A',
      },
      {
        afbeelding: 'hero-bruiloft-2',
        alt: 'Een bruid in een witte kanten jurk met parelketting lacht in de auto, terwijl een lachende gast met een strohoed door het open raam naar binnen leunt.',
        rol: 'B',
      },
      {
        afbeelding: 'hero-portret-1',
        alt: 'Portret van een oudere man met een kaal hoofd, blauwe ogen en een grote grijze snor, in een grijsblauw colbert met een zwart overhemd.',
        rol: 'C',
      },
    ] satisfies HomeHeroFoto[],
  },

  /** Sectie direct onder de hero (component: src/components/OverPaul.astro). Vervangt de eerdere anekdote. */
  overPaul: {
    /** Visueel klein label; dit is de H2 van de sectie. */
    label: '(over paul)',
    // TODO(paul): jaartallen bevestigen (1984, 1995) en vergelijken met "35 jaar" elders op de site en met 1992 (start Love & Marriage).
    tekst:
      'Sinds 1984 werk ik als kunstenaar. Eerst als schilder, vanaf 1995 ook als fotograaf. Die twee disciplines voeden elkaar — schilders kijken naar licht, compositie en gebaar; fotografen leggen vast wat ze zien. In mijn werk komen ze samen.',
  },

  /**
   * Sectie "Diensten" (component: src/components/Diensten.astro), direct onder "(over paul)".
   * Bewust zonder prijzen (geen `meta`); de prijzen staan op de pagina van de dienst zelf.
   */
  diensten: {
    titel: 'Diensten',
    items: [
      {
        nummer: '01',
        title: 'Bruiloftfotografie',
        href: '/fotograaf-bruiloft',
        extern: false,
      },
      {
        nummer: '02',
        title: 'Portretten',
        href: '/zakelijke-portretfoto',
        extern: false,
      },
      {
        nummer: '03',
        title: 'Promotiefotografie',
        // Eigen site van Paul voor promotiefotografie (geen pagina op deze site, zie projectregels).
        href: 'https://www.fotograafpromotiesradboud.nl/',
        extern: true,
      },
    ] as HomeDienst[],
  },

  /**
   * Fotospread (component: src/components/BeeldDuo.astro), direct onder "Diensten", laatste sectie voor de voettekst.
   * Twee foto's zonder tekst, bijschrift of link; geen kop (visueel tussenstuk).
   * Bronnen: src/assets/home/beeld-duo-bruiloft-4.jpg (1200 x 796, was public/Bruiloft 4.jpg)
   * en src/assets/home/beeld-duo-gaarkeuken-1.jpg (600 x 900, was public/Gaarkeuken 1.jpg).
   * TODO(paul): controleer de alt-teksten (beschreven naar wat op de foto te zien is).
   * TODO(paul): de bronfoto's zijn klein (1200 px en 600 px breed) voor een bijna schermvullende spread;
   * lever grotere bestanden aan (links minimaal 2400 px breed).
   */
  beeldDuo: [
    {
      afbeelding: 'beeld-duo-bruiloft-4',
      alt: 'Een jonge vrouw in een wit topje zit in een rode auto en strekt haar arm door het open raam om de hand vast te houden van een oudere vrouw met wit haar en bril, die buiten tussen de bomen staat te glimlachen.',
      positie: 'links',
    },
    {
      afbeelding: 'beeld-duo-gaarkeuken-1',
      alt: 'Zwart-witportret van een oudere man met een zwarte baret en een jas met open kraag. Hij kijkt ernstig recht in de camera.',
      positie: 'rechts',
    },
  ] satisfies HomeBeeldDuoItem[],

  /**
   * Sectie "Projecten" (component: src/components/Projecten.astro; zichtbare titel "Series"), direct onder "Exposities".
   * Foto's: src/assets/home/project-*.jpg (verplaatst uit public/).
   * Eén rij van drie: links de staande foto (Asty Mwaka, 600 x 900), midden de liggende (Love & Marriage, 1200 x 796),
   * rechts de hoge foto (Take me to the river, 600 x 900, natuurlijke verhouding; kopie van
   * src/assets/portfolio/take-me-to-the-river/Take me to the river 06-min.jpg, dat daar blijft staan voor /portfolio).
   * `project-het-gezicht-van-nijmegen.jpg` staat nog in de map maar wordt hier niet meer gebruikt (de serie blijft bestaan in Exposities en /het-gezicht-van-nijmegen).
   * De oude tekst en foto's van "Uitgelicht werk" (vier series) staan in design/archief/.
   * TODO(paul): bronfoto's zijn 600 px (Asty Mwaka) en 1200 px breed; lever grotere bestanden aan voor schermen boven 1500 px.
   * TODO(paul): controleer de alt-teksten (beschreven naar wat op de foto te zien is).
   */
  projecten: {
    titel: 'Series',
    items: [
      {
        title: 'Asty Mwaka',
        href: '/asty-mwaka',
        photo: {
          name: 'project-asty-mwaka',
          alt: 'Portret van een jonge vrouw met een volle afrokrullen, zilverkleurige oogschaduw en paarse lippenstift, in een glanzend lichtblauw shirt. Ze kijkt ernstig recht in de camera.',
        },
        positie: 'links',
      },
      {
        title: 'Love & Marriage',
        href: '/love-marriage',
        photo: {
          name: 'project-love-marriage',
          alt: 'Zwart-witfoto in een woonkamer: een vrouw in een witte trouwjurk strijkt de rok op een strijkplank, terwijl een man met ontbloot bovenlijf naast haar toekijkt.',
        },
        positie: 'midden',
      },
      {
        title: 'Take me to the river',
        href: '/take-me-to-the-river',
        photo: {
          name: 'project-take-me-to-the-river',
          alt: 'Bovenaanzicht van een lang, smal laadruim van een binnenvaartschip, omringd door groen water: in het midden ligt donkere aarde met een smalle strook licht water ertussen.',
        },
        // Bewust zonder jaar onder de titel (op verzoek van Paul). Het optionele veld `jaar` bestaat nog voor later.
        positie: 'rechts',
      },
    ] satisfies HomeProject[],
    allLink: { label: 'alle series', href: '/series' } satisfies HomeLink,
  },

  /**
   * Sectie "Exposities" (component: src/components/Exposities.astro), direct onder de fotospread en boven "Projecten".
   * Alleen verleden exposities, als gewone tekst: bewust geen Event-markup (alleen voor aankomende exposities met echte data).
   * TODO(paul): spelling van namen controleren (Oude Maria kerk, Eén vandaag, Museum het Valkhof, Museum de Fundatie)
   * en bevestigen dat de titels voor 2017 en 2022 ("Waterexpo", "Klimaatexpo", "750 jaar St. Stevenskerk") kloppen.
   */
  exposities: {
    titel: 'Exposities',
    items: [
      {
        jaar: '2014 – 2018',
        titel: 'Love & Marriage',
        locaties: [
          'Photoville (New York, USA)',
          'Kunsthal (Rotterdam)',
          'Cultuurhuis van de stad Nijmegen, Filmhuis Lux (Nijmegen)',
          'Oude Maria kerk (Deventer)',
          'Kunsthuis Secretarie (Meppel)',
          'Galerie Foto21 (Bredevoort)',
          'Noordkade (Veghel)',
        ],
        publicaties: 'Publicaties in de Telegraaf, de Standaard, Gelderlander, TV: Eén vandaag en Koffietijd.',
      },
      {
        jaar: '2018 – 2021',
        titel: 'Take me to the river',
        locaties: [
          'Museum de Bastei (Nijmegen)',
          'Ahoy (Rotterdam)',
          'Radboud Universiteit (Nijmegen)',
          'Noordkade (Veghel)',
        ],
        publicaties: 'Publicaties in de Volkskrant, de Standaard en de Gelderlander.',
      },
      {
        jaar: '2017',
        titel: 'Waterexpo',
        locaties: ['Kasteel Nijenhuis i.s.m. Museum de Fundatie (Heino)'],
      },
      {
        jaar: '2020',
        titel: 'Het gezicht van Nijmegen',
        locaties: ['Museum het Valkhof (Nijmegen)'],
      },
      {
        jaar: '2022',
        titel: '750 jaar St. Stevenskerk',
        locaties: ['Nijmegen'],
      },
      {
        jaar: '2022',
        titel: 'Klimaatexpo',
        locaties: ['Grote kerk Zwolle i.s.m. Museum de Fundatie (Zwolle)'],
      },
      {
        jaar: '2022 – 2023',
        titel: 'Groeten uit Lent, deel 1',
        locaties: ['Expositie op 10 verschillende plekken (Lent)'],
      },
    ] satisfies HomeExpositie[],
  },

  /**
   * Panoramafoto (component: src/components/Panorama.astro), direct onder "Exposities". Edge to edge, geen kop, geen tekst.
   * Bron: src/assets/home/panorama.jpg (1300 x 530, was public/Panorama.jpg).
   * TODO(paul): titel, plaats en jaar van deze foto aanleveren (alt bevat bewust geen plaatsnaam of serie).
   * TODO(paul): de bron is 1300 px breed; op schermen boven 1300 px wordt de foto opgerekt. Lever minimaal 2400 px breed aan.
   * TODO(paul): controleer de alt-tekst (beschreven naar wat op de foto te zien is).
   */
  panorama: {
    afbeelding: 'panorama',
    alt: 'Zwart-witpanorama in stoffig tegenlicht: mannen met hoeden en lange staven lopen in een groep, rechts zitten twee vrouwen in jurken met stippen en ruches te paard.',
  },

  exhibitions: {
    heading: 'Tentoonstellingen',
    intro: 'Eerder getoond in de Kunsthal, op Photoville in New York en in het Valkhof.',
    items: [
      { name: 'Kunsthal', place: 'Rotterdam' },
      { name: 'Photoville', place: 'New York' },
      { name: 'Museum Het Valkhof', place: 'Nijmegen' },
    ] as HomeExhibition[],
    press: 'In de media: de Volkskrant, de Telegraaf en EenVandaag.',
    links: [
      { label: 'Alle tentoonstellingen', href: '/exposities' },
      { label: 'Pers', href: '/pers' },
    ] satisfies HomeLink[],
    /** Optioneel beeld: bestaat het bestand niet, dan wordt het weggelaten. */
    photo: { name: 'tentoonstelling', alt: TODO_ALT } satisfies HomePhoto,
  },

  cta: {
    heading: 'Een bruiloft of portret aanvragen',
    buttons: [
      { label: 'Bruiloft aanvragen', href: '/fotograaf-bruiloft' },
      { label: 'Portret aanvragen', href: '/zakelijke-portretfoto' },
    ] satisfies HomeLink[],
    response: 'Ik reageer binnen 24 uur.',
    promo: {
      before: 'Op zoek naar een promotiefoto? Ga naar ',
      link: {
        label: 'fotograafpromotiesradboud.nl',
        href: 'https://www.fotograafpromotiesradboud.nl/',
      },
      after: '.',
    },
  },

  /** JSON-LD-gegevens voor de homepage. */
  schema: {
    // TODO(paul): straat en postcode. Tot die tijd alleen plaats en land.
    address: { addressLocality: 'Nijmegen', addressCountry: 'NL' },
    // TODO(paul): openingstijden, alleen toevoegen als ze bekend zijn.
    areaServed: ['Nijmegen', 'Arnhem'],
  },
};

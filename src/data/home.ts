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
  /**
   * Kaartpositie in de verspringende opstelling (component: src/components/Projecten.astro).
   * Rij 1: "links" = staande foto (5 / 6) op de linkermarge, "rechts" = liggende foto (6 / 5) op de rechtermarge, lager.
   * Rij 2: "onder" = brede liggende foto (4 / 3) op de linkermarge, met rechts ervan de link "alle series".
   * De volgorde in de lijst is ook de volgorde op mobiel (onder elkaar).
   */
  positie: 'links' | 'rechts' | 'onder';
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
      'Paul Breuker fotografeert bruiloften, portretten en kunstseries. Al 35 jaar werk, getoond in onder meer de Kunsthal en het Valkhof. Bruiloften vanaf €2.450.',
  },

  hero: {
    /** Alleen de naam. De trefwoordcontext zit in title, description en de eerste zin van `lead`. */
    h1: 'Paul Breuker',
    lead: 'Fotograaf in Nijmegen. Ik fotografeer bruiloften, portretten en kunstseries. Al 35 jaar maak ik beelden van mensen en plekken.',
    /** Knop onder de lead. De commerciële pagina's staan in de sectie "Diensten". */
    knop: { label: 'Portfolio', href: '/werk' } satisfies HomeLink,
    /**
     * LCP-beeld (eager, fetchpriority high), staand en ongecropt (2:3), links tegen de schermrand.
     * Bron: src/assets/home/hero-take-me-to-the-river-1.jpg (was public/Take me to the river 1.jpg).
     * De vorige hero-foto staat als src/assets/home/gaarkeuken-3.jpg.
     * TODO(paul): controleer alt (beschrijving gebaseerd op wat op de foto te zien is).
     */
    photo: {
      name: 'hero-take-me-to-the-river-1',
      alt: 'Bovenaanzicht van rood poeder in een lange, smalle bak met witte wanden: donkerrode heuvels met daartussen een roze, tegelachtig oppervlak.',
    } satisfies HomePhoto,
  },

  /** Sectie direct onder de hero (component: src/components/OverPaul.astro). Vervangt de eerdere anekdote. */
  overPaul: {
    /** Visueel klein label; dit is de H2 van de sectie. */
    label: '(over paul)',
    // TODO(paul): jaartallen bevestigen (1984, 1995) en vergelijken met "35 jaar" elders op de site en met 1992 (start Love & Marriage).
    tekst:
      'Sinds 1984 werk ik als kunstenaar. Eerst als schilder, vanaf 1995 ook als fotograaf. Die twee disciplines voeden elkaar — schilders kijken naar licht, compositie en gebaar; fotografen leggen vast wat ze zien. In mijn werk komen ze samen.',
    link: { label: 'meer over paul', href: '/over-paul' } satisfies HomeLink,
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
        href: '/trouwfotograaf-nijmegen',
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
   * Sectie "Projecten" (component: src/components/Projecten.astro), direct onder "Exposities".
   * Foto's: src/assets/home/project-*.jpg (verplaatst uit public/).
   * Rij 1: links de staande foto (Asty Mwaka, 600 x 900), rechts de liggende (Love & Marriage, 1200 x 796).
   * Rij 2: Het gezicht van Nijmegen (1200 x 683, uitsnede 4 / 3), bron was public/Gezicht nijmegen 1.jpg.
   * De oude tekst en foto's van "Uitgelicht werk" (vier series) staan in design/archief/.
   * TODO(paul): bronfoto's zijn 600 px (Asty Mwaka) en 1200 px breed; lever grotere bestanden aan voor schermen boven 1500 px.
   * TODO(paul): controleer de alt-teksten (beschreven naar wat op de foto te zien is).
   */
  projecten: {
    titel: 'Projecten',
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
        positie: 'rechts',
      },
      {
        title: 'Het gezicht van Nijmegen',
        href: '/het-gezicht-van-nijmegen',
        photo: {
          name: 'project-het-gezicht-van-nijmegen',
          alt: 'Een metalen hoofd met een diadeem, veel groter dan de mensen om hem heen, staat in een hoge industriële hal. Op de achtergrond werken mensen aan staal.',
        },
        positie: 'onder',
      },
    ] satisfies HomeProject[],
    allLink: { label: 'alle series', href: '/werk' } satisfies HomeLink,
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
      { label: 'Bruiloft aanvragen', href: '/trouwfotograaf-nijmegen' },
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

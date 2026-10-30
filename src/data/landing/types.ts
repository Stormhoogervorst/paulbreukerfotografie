/**
 * Datamodel voor commerciële landingspagina's (/fotograaf-bruiloft, later /zakelijke-portretfoto enz.).
 *
 * Een nieuwe landingspagina is een databestand in `src/data/landing/` plus een paginabestand van een paar
 * regels in `src/pages/` (zie README, "Nieuwe landingspagina toevoegen").
 *
 * De volgorde van de secties ligt vast in `src/layouts/LandingLayout.astro` (zie de regel "Volgorde commerciële
 * landingspagina (bindend)" in `.cursor/rules/paulbreuker-regels.mdc`): Hero, Werkwijze, Pakketten, Impressie, OverPaul,
 * Vragen, Uitleg, Reviews, Aanvraagformulier, Beeld. Een sectie verschijnt alleen als de data ervoor bestaat. Alles na
 * de hero is optioneel; Reviews is nog niet gebouwd. Uitzondering op uitdrukkelijk verzoek: /trouwfotograaf-nijmegen zet
 * Pakketten na Impressie (`pakkettenPlek`), OverPaul direct vóór Pakketten (`overPaulPlek`) en Uitleg daarna
 * (`uitlegPlek`). Locaties staat na Uitleg (geen andere pagina gebruikt Locaties).
 */
import type { ImageMetadata } from 'astro';

export interface LandingLink {
  label: string;
  /** Pad, anker of URL. */
  href: string;
}

export interface LandingHero {
  /** De enige <h1> van de pagina. Sentence case, maximaal drie regels. */
  h1: string; // \n geeft een vaste regelbreuk
  /**
   * Alinea's van de inleiding (ik-vorm van Paul, geen superlatieven). Een alinea is gewone tekst (string) of een lijst
   * Segmenten (tekst en links, bijvoorbeeld naar series); zonder links blijft de uitvoer gelijk.
   */
  intro: Array<string | Segment[]>;
  ctaPrimair: LandingLink;
  ctaSecundair?: LandingLink;
  /**
   * Fotostrip onder de tekstrij: alle foto's naast elkaar, even hoog, elk in zijn eigen verhouding (geen uitsnede).
   * Verhoudingen tussen 2:3 en 3:2. LandingHero toont op desktop de eerste drie en op mobiel de eerste twee
   * (aantallen bovenin LandingHero.astro); de rest is reserve.
   * De eerste foto is het LCP-beeld en de Open Graph-afbeelding van de pagina.
   */
  fotos: LandingHeroFoto[];
}

export interface LandingHeroFoto {
  /** Bronbestand uit `src/assets/landing/`. */
  afbeelding: ImageMetadata;
  /** Nederlandse, beschrijvende alt-tekst (wie of wat, waar), voor elke foto verschillend. */
  alt: string;
}

export interface LandingSchema {
  /** Naam van de dienst in JSON-LD (`Service.name`). */
  dienstNaam: string;
  /** Soort dienst in JSON-LD (`Service.serviceType`), bijvoorbeeld "Portretfotografie op locatie". Ontbreekt het, dan staat er niets. */
  serviceType?: string;
  /**
   * Vanaf-prijs in euro's. Nooit verzinnen: komt van Paul. Ontbreekt hij, dan komt er geen `Offer`.
   * Heeft de pagina `pakketten` met prijzen, dan is de laagste pakketprijs leidend voor `Offer.minPrice` (zie
   * LandingLayout.astro); dit veld is dan alleen de terugval.
   */
  vanPrijs?: number;
  /**
   * `false` laat de FAQPage weg uit de JSON-LD (de vragen blijven zichtbaar). Ontbreekt het veld, dan komt er een FAQPage
   * uit `pagina.vragen` (de standaard).
   */
  faqSchema?: boolean;
  /** Plaatsen of regio's voor `areaServed`. */
  werkgebied: string[];
  /**
   * Ontbreekt het, dan zijn de namen in `werkgebied` gewone teksten in `areaServed`. Met "City" wordt elke naam een
   * `{ "@type": "City", name }` (voor pagina's over één plaats, zoals /trouwfotograaf-nijmegen).
   */
  werkgebiedType?: 'City';
}

// ---------------------------------------------------------------------------
// Secties na de hero (Werkwijze, Impressie en Pakketten zijn gebouwd; de overige vormen zijn voorlopig)
// ---------------------------------------------------------------------------

/**
 * Onderdeel van een Uitleg-blok, in de volgorde waarin het getoond wordt:
 * - "alinea": gewone alinea (Segmenten: tekst en links);
 * - "kop": subkop (<h3>) binnen het blok;
 * - "lijst": opsomming; met `genummerd` een genummerde lijst (<ol>), anders een lijst met streepjes (<ul>).
 */
export type UitlegOnderdeel =
  | { soort: 'alinea'; tekst: Segment[] }
  | { soort: 'kop'; tekst: string }
  | { soort: 'lijst'; genummerd?: boolean; items: Segment[][] };

/**
 * Uitleg: lange tekst met een kop (component: src/components/landing/LandingUitleg.astro). `pagina.uitleg` is een lijst
 * van blokken; elk blok is een eigen sectie met een eigen <h2> (subkoppen zijn <h3>). Zonder `uitlegPlek` staan de blokken
 * op hun vaste plek na Vragen en vóór Reviews; zie `LandingPagina.uitlegPlek` voor de uitzondering.
 */
export interface LandingUitlegBlok {
  /** Anker van het blok (zonder #), bijvoorbeeld "kosten". Ontbreekt het, dan is het "uitleg-1", "uitleg-2" enz. */
  id?: string;
  /** Klein label links (alleen visueel, voor schermlezers verborgen; de <h2> is de toegankelijke naam). Ontbreekt het, dan is de linkerkolom leeg. */
  label?: string;
  /**
   * Kleine foto linksonder, met de onderkant gelijk aan de onderkant van de tekst rechts. Alleen LandingUitleg.astro
   * toont dit veld.
   */
  foto?: { afbeelding: ImageMetadata; alt: string };
  /** De <h2> van het blok. */
  kop: string;
  inhoud: UitlegOnderdeel[];
}

/** CTA van een pakket: springt naar het formulier en kiest daar dit pakket (via `data-pakket`). */
export interface LandingPakketCta extends LandingLink {
  /**
   * Slug van de pakketnaam ("reportage", "portret", "kunstportret" enz.), als `data-pakket` op de cta. Heeft het formulier
   * een veld met de naam "pakket" (een `select` met de slugs als waarden), dan kiest een klik op de cta daar dit pakket
   * (src/scripts/formulier.ts). Heeft het formulier dat veld niet (het bruiloftformulier), dan gebeurt er niets.
   */
  pakket: string;
}

export interface LandingPakket {
  naam: string;
  /**
   * Prijs in euro's. Nooit verzinnen: komt van Paul. Ontbreekt hij, dan toont de kaart geen prijsregel, komt het pakket
   * niet in de JSON-LD (OfferCatalog) en telt het niet mee voor de laagste prijs.
   */
  prijs?: number;
  /** Klein label boven het bedrag, bijvoorbeeld "vanaf". Ontbreekt het, dan staat er alleen het bedrag. */
  prijsLabel?: string;
  omschrijving: string;
  /** Een lijst zonder items wordt niet getoond. */
  kenmerken: string[];
  cta: LandingPakketCta;
}

/**
 * Pakketten: drie pakketten naast elkaar, direct na Werkwijze en vóór Impressie (component: src/components/landing/LandingPakketten.astro).
 * Het anker #pakketten verwijst naar deze sectie.
 */
export interface LandingPakketten {
  /** Titel in de marquee; de eerste herhaling is de <h2> van de sectie. */
  titel: string;
  /** Eén regel kleine tekst onder de kolommen (bijvoorbeeld "inclusief btw"). Ontbreekt hij, dan komt er niets. */
  voetnoot?: string;
  items: LandingPakket[];
}

/** Een plek waar Paul heeft gefotografeerd (alleen echte plekken; nooit verzinnen). */
export interface LandingLocatie {
  naam: string;
  plaats: string;
  /** Slug van een /trouwlocaties/[slug]-pagina. Zonder slug is de naam gewone tekst; met slug een link. */
  slug?: string;
}

/**
 * Locaties ("Waar ik fotografeer"): lijst plekken, direct na OverPaul en vóór Vragen
 * (component: src/components/landing/LandingLocaties.astro). Zonder items rendert de sectie niets.
 */
export interface LandingLocaties {
  /** Titel in de marquee; de eerste herhaling is de <h2> van de sectie. */
  titel: string;
  items: LandingLocatie[];
}

export interface LandingImpressieFoto {
  /** Bronbestand uit `src/assets/landing/impressie/`. Behoudt zijn eigen verhouding (geen uitsnede). */
  afbeelding: ImageMetadata;
  /** Nederlandse, beschrijvende alt-tekst (wie of wat, waar), voor elke foto verschillend. */
  alt: string;
}

/**
 * Impressie: selectie foto's in rijen van twee met verschillende breedtes, direct onder Pakketten
 * (component: src/components/landing/LandingImpressie.astro). Het patroon is gemaakt voor vier foto's, herhaalt
 * zich bij meer en wordt afgekapt bij minder.
 */
export interface LandingImpressie {
  /** Titel in de marquee; de eerste herhaling is de <h2> van de sectie. */
  titel: string;
  /**
   * Indeling van de foto's. Ontbreekt het veld, dan is het "diagonaal": twee rijen van twee met verschillende breedtes
   * (de standaard, voor liggende foto's). "rij": één rij van drie foto's van gutter tot gutter, met relatieve hoogtes
   * (`rijHoogtes` in LandingImpressie.astro); bedoeld voor staande foto's. Bij "rij" worden alleen de eerste drie foto's
   * getoond; geef er dan precies drie.
   */
  indeling?: 'diagonaal' | 'rij';
  fotos: LandingImpressieFoto[];
  /** Staat onder de laatste rij, rechts uitgelijnd. */
  link?: LandingLink;
}

/** Statement-sectie direct onder de hero (component: src/components/Statement.astro). */
export interface LandingWerkwijze {
  /** Klein label tussen haakjes, bijvoorbeeld "(werkwijze)". Geen kop. */
  label: string;
  tekst: string;
  link?: LandingLink;
}

/**
 * Stuk lopende tekst: een gewone string of een link ({ tekst, href }). Wordt zonder `set:html` gerenderd.
 * `extern: true` zet `rel="noopener"` op de link (voor links naar andere sites); alleen LandingUitleg.astro leest dit veld.
 */
export type Segment = string | { tekst: string; href: string; extern?: boolean };

/**
 * OverPaul: links een foto van Paul, rechts label, grote openingsalinea, gewone alinea's en kleine links, direct onder
 * Impressie (component: src/components/landing/LandingOverPaul.astro). Teksten komen uit `src/data/paul.ts`.
 */
export interface LandingOverPaul {
  /** Klein label; <h2> van de sectie. De haakjes en kleine letters zet de CSS, de toegankelijke naam is dit label. */
  label: string;
  /** Grote openingsalinea. */
  lead: Segment[];
  /** Gewone alinea's onder de lead. */
  alineas: Segment[][];
  /** Kleine links onder de alinea's. */
  links: LandingLink[];
  foto: {
    /** Bronbestand uit `src/assets/landing/`. Behoudt zijn eigen verhouding (geen uitsnede). */
    afbeelding: ImageMetadata;
    /** Nederlandse, beschrijvende alt-tekst (wie of wat, waar). */
    alt: string;
  };
}

/**
 * Beeld: één foto van rand tot rand, zonder kop of tekst, onder het Aanvraagformulier (laatste sectie vóór de footer)
 * (component: src/components/landing/LandingBeeld.astro). Bijgesneden op 5:2 (mobiel 16:9) met object-fit: cover.
 */
export interface LandingBeeld {
  /** Bronbestand uit `src/assets/landing/`. */
  afbeelding: ImageMetadata;
  /** Nederlandse, beschrijvende alt-tekst (wie of wat, waar). */
  alt: string;
}

export interface LandingReview {
  /** Alleen echte reviews, met toestemming van de schrijver. */
  tekst: string;
  naam: string;
  jaar?: string;
}

export interface LandingVraag {
  /** Sentence case, eindigt op een vraagteken. Staat in de <summary>. */
  vraag: string;
  /** Alinea's van het antwoord; elke alinea is een lijst Segmenten (tekst of link). */
  antwoord: Segment[][];
}

/**
 * Vragen: veelgestelde vragen als uitklapbare lijst (native <details>), direct na OverPaul en vóór Uitleg
 * (component: src/components/landing/LandingVragen.astro). Het anker #vragen verwijst naar deze sectie. De platte tekst
 * van de antwoorden is ook de bron voor de FAQPage in de JSON-LD (zie LandingLayout.astro).
 */
export interface LandingVragen {
  /** Titel in de marquee; de eerste herhaling is de <h2> van de sectie. */
  titel: string;
  /**
   * Met `true` staat elke vraag als <h3> in de <summary> (voor pagina's met een H2-H3-opbouw voor de vragen). Ontbreekt
   * het, dan is de vraag gewone tekst in de <summary> en blijft de uitvoer gelijk.
   */
  vraagAlsKop?: boolean;
  items: LandingVraag[];
}

/**
 * Aanvraagformulier: na Reviews en vóór Beeld (component: src/components/landing/LandingFormulier.astro).
 * Het anker #aanvragen verwijst naar deze sectie. De velden, de validatie en de mails staan per type in
 * `src/lib/formulieren/` (register in index.ts); hier alleen de teksten van de sectie. Types: "bruiloft", "portret" en
 * "contact" (/contact, zie src/data/contact.ts).
 */
export interface LandingFormulier {
  /** Formuliertype: kiest de velden, het schema en de mails uit het register in `src/lib/formulieren/index.ts`. */
  type: 'bruiloft' | 'portret' | 'contact';
  /** Titel in de marquee; de eerste herhaling is de <h2> van de sectie. */
  titel: string;
  /** Alinea's van het introblok links (ik-vorm van Paul). Daaronder komen "Liever bellen of mailen?" en de contactgegevens. */
  intro: Segment[][];
  /** Tekst op de verzendknop. */
  verzendLabel: string;
  /** Korte privacytekst onder de knop (met een link naar de privacyverklaring). Geen verplichte checkbox. */
  privacy: Segment[];
}

export interface LandingPagina {
  /** URL-slug zonder slash, bijvoorbeeld "fotograaf-bruiloft". */
  slug: string;
  seo: {
    /** Rond 60 tekens. */
    title: string;
    /** Rond 155 tekens. */
    description: string;
  };
  /** Label van de laatste kruimel (Home > label) in de BreadcrumbList. */
  breadcrumb: string;
  hero: LandingHero;
  schema: LandingSchema;

  // Secties na de hero, in de volgorde waarin ze op de pagina komen.
  werkwijze?: LandingWerkwijze;
  pakketten?: LandingPakketten;
  /**
   * Plek van Pakketten. Standaard direct na Werkwijze en vóór Impressie (de bindende volgorde). Met
   * `pakkettenPlek: 'na-impressie'` staan ze direct na Impressie (nu alleen /trouwfotograaf-nijmegen, op uitdrukkelijk
   * verzoek).
   */
  pakkettenPlek?: 'na-impressie';
  /**
   * Plek van OverPaul. Standaard na Impressie (of na Uitleg, als die na Impressie staat). Met
   * `overPaulPlek: 'voor-pakketten'` staat OverPaul direct vóór Pakketten (nu alleen /trouwfotograaf-nijmegen, op
   * uitdrukkelijk verzoek).
   */
  overPaulPlek?: 'voor-pakketten';
  /**
   * Kleine noot onder de pakketten (gedempte kleur, kleiner dan de omschrijving). Alleen gerenderd als het veld gevuld
   * is en de pagina `pakketten` heeft. De eerste voorkomende tekst "op aanvraag" wordt een gewone tekstlink naar
   * #aanvragen (met `data-pakket={pakkettenNootPakket}` als dat gevuld is).
   */
  pakkettenNoot?: string;
  /** Slug die de link "op aanvraag" in `pakkettenNoot` vooraf invult in het veld "pakket" van het formulier. */
  pakkettenNootPakket?: string;
  impressie?: LandingImpressie;
  /**
   * Uitleg-blokken. Standaard na Vragen en vóór Reviews (de bindende volgorde). Met `uitlegPlek: 'na-impressie'` staan ze
   * direct na Impressie (of na Pakketten, als die ook na Impressie staat). Op /trouwfotograaf-nijmegen staat OverPaul
   * vóór Pakketten (`overPaulPlek`), op uitdrukkelijk verzoek.
   */
  uitleg?: LandingUitlegBlok[];
  uitlegPlek?: 'na-impressie';
  overPaul?: LandingOverPaul;
  locaties?: LandingLocaties;
  vragen?: LandingVragen;
  beeld?: LandingBeeld;
  reviews?: LandingReview[];
  formulier?: LandingFormulier;
}

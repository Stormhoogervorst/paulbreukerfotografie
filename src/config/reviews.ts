// Echte score uit het Google Bedrijfsprofiel van Paul Breuker Fotografie.
// Werk dit maandelijks bij: de cijfers moeten altijd gelijk zijn aan Google.
export const googleRating = {
  value: 5.0, // gemiddelde score op Google
  count: 3, // aantal Google-reviews
  url: 'https://www.google.com/maps?cid=2245019097591408759',
  updated: '2026-11-09',
};

export type ReviewCategory = 'bruiloft' | 'portret' | 'zakelijk' | 'promotie';

export interface GoogleReview {
  author: string;
  rating: number; // 1-5
  date: string; // 'YYYY-MM'
  text: string; // letterlijk van Google, niet herschrijven
  categories: ReviewCategory[];
  context?: string; // optioneel, bijv. 'Promotie, Radboud Universiteit'
}

export const googlePlaceId = 'ChIJjwmxYEUIx0cRd2jngfnoJx8';
export const writeReviewUrl = `https://search.google.com/local/writereview?placeid=${googlePlaceId}`;

export const googleReviews: GoogleReview[] = [
  {
    author: 'Bas Adriaansen',
    rating: 5,
    date: '2026-11',
    text: 'Ik had Paul als fotograaf bij mijn promotie, erg aardige man en fijne communicatie. Hij weet de weg in de aula in Nijmegen en heeft ook foto\'s gemaakt van het tekenen van mijn bul wat extra bijzonder is. Ik kreeg de foto\'s de volgende dag al in mijn mail. Zeer tevreden met Paul.',
    categories: ['promotie', 'portret'],
    context: 'Promotie, Radboud Universiteit',
  },
  {
    author: 'Storm Hoogervorst',
    rating: 5,
    date: '2026-11',
    text: 'Paul heeft foto\'s gemaakt voor onze recruitment site. We zijn erg tevreden met de foto\'s. Hij dacht goed mee over wat passend was, waardoor onze site een professionele uitstraling heeft gekregen.',
    categories: ['zakelijk', 'portret'],
    context: 'Zakelijke foto\'s',
  },
  {
    author: 'Legal Talents Recruitment',
    rating: 5,
    date: '2026-11',
    text: 'Paul heeft portret foto\'s gemaakt van het team. Erg tevreden, wij raden hem zeker aan!',
    categories: ['zakelijk', 'portret'],
    context: 'Teamportretten',
  },
];

/**
 * Ervaringen van klanten uit e-mails aan Paul (geen Google-reviews). Ingekort en licht herschreven tot een korte tekst,
 * zonder iets toe te voegen wat de klant niet schreef. Anoniem: alleen de soort shoot. Geen sterren en geen datum (de klant
 * gaf geen score) en geen structured data.
 */
export interface KlantErvaring {
  text: string;
  categories: ReviewCategory[];
  /** Soort shoot, in plaats van een naam, bijv. 'Promotie'. */
  context: string;
}

// Volgorde = volgorde op de pagina (afwisselend soorten shoots; de portretpagina toont er maar drie).
// TODO(paul): controleer per ervaring de soort shoot (context en categorieën); die is afgeleid uit de e-mail.
export const klantErvaringen: KlantErvaring[] = [
  {
    text: 'Bedankt voor de foto\'s, wat super snel! Een dag na de shoot had ik ze al binnen en heb ik er meteen een LinkedIn-post mee gemaakt.',
    categories: ['zakelijk', 'portret'],
    context: 'Zakelijk portret',
  },
  {
    text: 'Ik heb de foto\'s net bekeken en ze zijn fantastisch. Heel erg bedankt dat je deze onvergetelijke dag hebt vastgelegd.',
    categories: ['promotie', 'portret'],
    context: 'Promotie',
  },
  {
    text: 'Hele leuke foto\'s geworden! Bedankt voor de foto\'s, het fijne contact en de goede sfeer.',
    categories: ['zakelijk', 'portret'],
    context: 'Zakelijk portret',
  },
  {
    text: 'Het zijn hele mooie foto\'s; ik heb ze de afgelopen dagen vaak bekeken. Het was een mooie dag die ik me, mede dankzij al het beeldmateriaal, nog lang zal heugen.',
    categories: ['promotie', 'portret'],
    context: 'Promotie',
  },
  {
    text: 'Heel erg bedankt, ik ben super blij met de foto\'s!',
    categories: ['portret'],
    context: 'Portretshoot',
  },
  {
    text: 'Van verschillende (oud-)collega\'s hoorde ik lovende woorden over Paul en zijn fotografie, dus ik wilde hem graag als fotograaf inhuren. Hij reageerde snel en wat hij schreef klonk goed.',
    categories: ['promotie', 'portret'],
    context: 'Promotie',
  },
];

/** Ervaringen uit e-mails van één categorie, in de volgorde van de lijst, maximaal `limit`. */
export function ervaringenVoorCategorie(category: ReviewCategory, limit = 6): KlantErvaring[] {
  return klantErvaringen.filter((ervaring) => ervaring.categories.includes(category)).slice(0, limit);
}

/** Reviews van één categorie, nieuwste eerst, maximaal `limit`. Eén bron voor GoogleReviews.astro en LandingLayout.astro. */
export function reviewsVoorCategorie(category: ReviewCategory, limit = 6): GoogleReview[] {
  return googleReviews
    .filter((review) => review.categories.includes(category))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}

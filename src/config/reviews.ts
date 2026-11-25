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
 * Ervaringen van klanten uit e-mails aan Paul (geen Google-reviews), herschreven tot korte, algemene reviews over zijn werk
 * (niet specifiek voor bruiloften, portretten of promoties). Anoniem en zonder soort shoot: ze staan in elk reviewsblok, na de
 * Google-reviews van die categorie. Geen sterren en geen datum (de klant gaf geen score) en geen structured data.
 */
export interface KlantErvaring {
  text: string;
}

// Volgorde = volgorde op de pagina (een blok toont samen met de Google-reviews maximaal zes items).
export const klantErvaringen: KlantErvaring[] = [
  {
    text: 'Wat super snel! Ik had de foto\'s al een dag later binnen en heb ze meteen gedeeld. Echt blij mee.',
  },
  {
    text: 'Fantastische foto\'s. Heel erg bedankt dat je dit onvergetelijke moment zo mooi hebt vastgelegd.',
  },
  {
    text: 'Hele leuke foto\'s geworden! Bedankt voor het fijne contact en de goede sfeer tijdens de shoot.',
  },
  {
    text: 'Prachtige foto\'s; ik heb ze de afgelopen dagen vaak bekeken. Dankzij de beelden zal ik me dit moment nog lang herinneren.',
  },
  {
    text: 'Heel erg bedankt, ik ben super blij met de foto\'s!',
  },
  {
    text: 'Ik hoorde van verschillende mensen lovende woorden over Paul en zijn fotografie. Hij reageerde snel en zijn voorstel klonk meteen goed, dus de keuze was makkelijk.',
  },
];

/** Ervaringen uit e-mails, in de volgorde van de lijst, maximaal `limit`. */
export function klantErvaringenTonen(limit = 6): KlantErvaring[] {
  return klantErvaringen.slice(0, limit);
}

/** Reviews van één categorie, nieuwste eerst, maximaal `limit`. Eén bron voor GoogleReviews.astro en LandingLayout.astro. */
export function reviewsVoorCategorie(category: ReviewCategory, limit = 6): GoogleReview[] {
  return googleReviews
    .filter((review) => review.categories.includes(category))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}

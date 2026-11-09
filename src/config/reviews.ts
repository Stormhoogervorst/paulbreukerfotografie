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

/** Reviews van één categorie, nieuwste eerst, maximaal `limit`. Eén bron voor GoogleReviews.astro en LandingLayout.astro. */
export function reviewsVoorCategorie(category: ReviewCategory, limit = 6): GoogleReview[] {
  return googleReviews
    .filter((review) => review.categories.includes(category))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}

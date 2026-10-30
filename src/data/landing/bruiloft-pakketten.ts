/**
 * Bruiloftsaanbod (zie LandingPakketten.astro). Eén bron voor:
 * - de sectie Pakketten op /fotograaf-bruiloft en /trouwfotograaf-nijmegen en de OfferCatalog in de JSON-LD (via de
 *   landingsdata en LandingLayout.astro);
 * - de prijzen in title, description, FAQ en tekstblokken van die pagina's;
 * - de homepage (meta description, "Bruiloften vanaf €…") via `bruiloftVanPrijs`;
 * - de opties van het veld "pakket" in het bruiloftformulier (src/lib/formulieren/bruiloft.ts).
 *
 * Aanbod sinds 30 oktober 2026 (nieuwe feiten van Paul): twee opties, Digitaal (€3.950) en Volledig analoog (€6.950);
 * een combinatie van digitaal en analoog is op aanvraag mogelijk (geen eigen pakket en geen Offer). De eerdere
 * drie pakketten zijn vervallen. Bij het bruiloftaanbod wordt nergens een aantal foto's genoemd, en we gebruiken
 * "ingebonden fotoboek" (niet "fotoalbum" of "album").
 *
 * De cta's verwijzen naar #aanvragen; `cta.pakket` is de slug en de waarde van het veld "pakket" in het formulier.
 *
 * TODO(paul): wat is er bij de analoge optie inbegrepen (afdrukken, fotoboek, bewerking) en wat is de levertijd?
 * TODO(paul): inclusief of exclusief btw? (Zet dan `voetnoot` hieronder.)
 * TODO(paul): is een tweede fotograaf nog mogelijk? Zo ja, noem hem opnieuw (hij staat nergens meer in de tekst).
 * TODO(paul): wordt bij Digitaal ook een online galerij of worden digitale bestanden meegeleverd, en wat is de levertijd?
 * TODO(paul): is de kennismaking vooraf nog onderdeel van het aanbod (nu alleen genoemd in de tekst van /trouwfotograaf-nijmegen)?
 * TODO(paul): vaste prijzen of ‘vanaf’-prijzen? Bij ‘vanaf’: zet `prijsLabel: 'vanaf'` bij het pakket (nu alleen het bedrag).
 */
import type { LandingPakketten } from './types';

export const pakketten: LandingPakketten = {
  titel: 'Pakketten',
  items: [
    {
      naam: 'Digitaal',
      prijs: 3950,
      omschrijving:
        'Ik ben van ’s ochtends vroeg tot ’s avonds laat aanwezig en fotografeer jullie bruiloft digitaal. Jullie krijgen er een ingebonden fotoboek bij.',
      kenmerken: ['Aanwezig van ’s ochtends vroeg tot ’s avonds laat', 'Ingebonden fotoboek erbij'],
      cta: { label: 'Aanvragen', href: '#aanvragen', pakket: 'digitaal' },
    },
    {
      // TODO(paul): wat is er bij de analoge optie inbegrepen (afdrukken, fotoboek, bewerking) en de levertijd. Verzin dit niet.
      naam: 'Volledig analoog',
      prijs: 6950,
      omschrijving: 'Ik fotografeer jullie bruiloft volledig analoog, van ’s ochtends vroeg tot ’s avonds laat.',
      kenmerken: ['Volledig analoog gefotografeerd', 'Aanwezig van ’s ochtends vroeg tot ’s avonds laat'],
      cta: { label: 'Aanvragen', href: '#aanvragen', pakket: 'analoog' },
    },
  ],
};

/** Noot onder de pakketten (veld `pakkettenNoot` van beide bruiloftspagina's). "op aanvraag" wordt de link naar #aanvragen. */
export const pakkettenNoot = 'Een combinatie van digitaal en analoog is op aanvraag ook mogelijk.';
/** Waarde van het veld "pakket" die de link "op aanvraag" in de noot vooraf invult. */
export const pakkettenNootPakket = 'combinatie';

/** Laagste pakketprijs in euro's: de vanaf-prijs in title, description, JSON-LD en op de homepage. */
const prijzen = pakketten.items.flatMap((pakket) => (pakket.prijs === undefined ? [] : [pakket.prijs]));
if (prijzen.length === 0) throw new Error('bruiloft-pakketten: geen enkel pakket heeft een prijs.');
export const bruiloftVanPrijs = Math.min(...prijzen);

/** Prijs van een pakket (op naam) in euro's; gooit een fout als het pakket of de prijs ontbreekt. */
export function bruiloftPakketPrijs(naam: string): number {
  const prijs = pakketten.items.find((pakket) => pakket.naam === naam)?.prijs;
  if (prijs === undefined) throw new Error(`Pakket "${naam}" heeft geen prijs.`);
  return prijs;
}

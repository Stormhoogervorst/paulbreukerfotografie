/**
 * Pakketten van /fotograaf-bruiloft (zie LandingPakketten.astro). Eén bron voor:
 * - de sectie Pakketten en de OfferCatalog in de JSON-LD (via fotograaf-bruiloft.ts en LandingLayout.astro);
 * - de prijzen in de antwoorden bij Vragen.
 *
 * De inhoud is aangeleverd en nog niet bevestigd door Paul. De cta's verwijzen naar #aanvragen (Aanvraagformulier);
 * `cta.pakket` is de slug van de naam (het formulier heeft nu geen pakketveld; zie LandingPakketten.astro).
 */
import type { LandingPakketten } from './types';

export const pakketten: LandingPakketten = {
  titel: 'Pakketten',
  // TODO(paul): voetnoot invullen (inclusief of exclusief btw) en pas dan toevoegen
  items: [
    {
      // TODO(paul): inhoud bevestigen (aantal foto’s, online galerij, kennismaking, tweede fotograaf als optie) en of de prijs vast is of ‘vanaf’
      naam: 'Reportage',
      prijs: 3250,
      omschrijving: 'Ik fotografeer de hele dag en lever de foto’s digitaal.',
      kenmerken: [
        'Fotografie van ’s ochtends vroeg tot ’s avonds laat',
        'Ruim 400 bewerkte foto’s in hoge resolutie, in een online galerij',
        'Kennismaking vooraf; een tweede fotograaf is optioneel',
      ],
      cta: { label: 'Aanvragen', href: '#aanvragen', pakket: 'reportage' },
    },
    {
      // TODO(paul): inhoud bevestigen (album: formaat, aantal pagina’s, ontwerpproces)
      naam: 'Album',
      prijs: 3950,
      omschrijving: 'De reportage, aangevuld met een album om in handen te houden.',
      kenmerken: [
        'Alles uit Reportage',
        'Ingebonden fotoalbum met een selectie van jullie dag',
        'Het ontwerp bepalen we samen',
      ],
      cta: { label: 'Aanvragen', href: '#aanvragen', pakket: 'album' },
    },
    {
      // TODO(paul): inhoud bevestigen (portretsessie: duur en locatie; kunstafdrukken: formaat, papier, aantal)
      naam: 'Collectie',
      prijs: 4450,
      omschrijving: 'De reportage en het album, plus een portretsessie en twee kunstafdrukken.',
      kenmerken: [
        'Alles uit Album',
        'Portretsessie met jullie tweeën, vooraf of de dag erna',
        'Twee kunstafdrukken naar keuze, op fine-art papier',
      ],
      cta: { label: 'Aanvragen', href: '#aanvragen', pakket: 'collectie' },
    },
  ],
};

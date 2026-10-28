/**
 * Pakketten van /portretfotos (zie LandingPakketten.astro). Eén bron voor:
 * - de sectie Pakketten en de OfferCatalog in de JSON-LD (via portretfotos.ts en LandingLayout.astro; alleen pakketten
 *   met een prijs komen in de OfferCatalog);
 * - de prijzen in title, description, hero en Vragen (de functies in portretfotos.ts);
 * - de opties van het veld "pakket" in het portretformulier (src/lib/formulieren/portret.ts).
 *
 * De inhoud is een concept en nog niet bevestigd door Paul. De cta's verwijzen naar #aanvragen; `cta.pakket` is de slug,
 * waarmee een klik het pakket voorselecteert in het formulier.
 *
 * TODO(paul): werkgebied, reiskosten, duur van de sessie en aantal bewerkte foto's per pakket; pagina's die in Google
 * scoren noemen die gegevens.
 * TODO(paul): prijzen per pakket. Zolang `prijs` ontbreekt, toont de kaart geen prijsregel en staat er geen prijs in
 * title, description, hero, Vragen en JSON-LD. Zodra een pakket een prijs heeft, passen die teksten zich vanzelf aan.
 */
import type { LandingPakketten } from './types';

export const pakketten: LandingPakketten = {
  titel: 'Pakketten',
  items: [
    {
      // TODO(paul): prijs invullen (en `prijsLabel: 'vanaf'` als het een vanaf-prijs is); inhoud bevestigen (duur van de sessie, aantal bewerkte foto's, plaatsen).
      naam: 'Portret',
      prijs: undefined,
      omschrijving: 'Een sessie voor één persoon, op een plek naar keuze.',
      kenmerken: [
        'Een gesprek vooraf over wat je met de foto’s wilt',
        'Een sessie in natuurlijk licht, bij jou thuis, op je werk of buiten',
        'Een selectie bewerkte foto’s in hoge resolutie, in een online galerij',
      ],
      cta: { label: 'Aanvragen', href: '#aanvragen', pakket: 'portret' },
    },
    {
      // TODO(paul): prijs invullen; inhoud bevestigen (aantal personen, duur van de sessie, aantal bewerkte foto's).
      naam: 'Duo en gezin',
      prijs: undefined,
      omschrijving: 'Een sessie voor twee of meer personen.',
      kenmerken: [
        'Alles uit Portret',
        'Voor stellen, ouder en kind, familie of vrienden',
        'Groepsfoto’s en losse portretten in dezelfde sessie, bij jullie thuis of buiten',
      ],
      cta: { label: 'Aanvragen', href: '#aanvragen', pakket: 'duo-en-gezin' },
    },
    {
      // TODO(paul): prijs invullen; inhoud bevestigen (kunstafdruk: papier, formaat, aantal, inclusief of los te koop).
      naam: 'Kunstportret',
      prijs: undefined,
      omschrijving: 'Een portret als kunstwerk.',
      kenmerken: [
        'Alles uit Portret',
        'Een kunstafdruk naar keuze, op fine-art papier',
        'Papier en formaat bepalen we samen',
      ],
      cta: { label: 'Aanvragen', href: '#aanvragen', pakket: 'kunstportret' },
    },
  ],
};

// Alleen tijdens het ontwikkelen: een pakket zonder prijs is bewust, maar mag niet ongemerkt live gaan.
if (import.meta.env.DEV) {
  for (const pakket of pakketten.items) {
    if (pakket.prijs === undefined) {
      console.warn(`[portret-pakketten] Pakket "${pakket.naam}" heeft nog geen prijs (TODO(paul)): de kaart toont geen prijsregel.`);
    }
  }
}

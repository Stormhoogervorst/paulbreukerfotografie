/**
 * Enhancement van het aanvraagformulier (src/components/landing/LandingFormulier.astro). Zonder dit script werkt het
 * formulier als gewone POST (de server valideert altijd). Met dit script:
 * - browservalidatie (required, type, pattern, maxlength, min) met eigen meldingen onder het veld ("Let op: …"),
 *   focus op het eerste ongeldige veld;
 * - verzenden via fetch (Accept: application/json), daarna door naar /bedankt; bij een serverfout een melding boven de
 *   knop (met mail en telefoon) en blijft de ingevulde data staan;
 * - het tijdstempelveld (milliseconden sinds laden, voor de spamwering), de min-datum (vandaag) en "We hebben nog geen
 *   datum" (schakelt het datumveld uit);
 * - de pakketkeuze: een klik op een link met `data-pakket` (de cta's in Pakketten) kiest dat pakket in het veld "pakket"
 *   en de link springt daarna zelf naar #aanvragen. Heeft het formulier geen veld "pakket" (bruiloft), dan gebeurt er niets.
 * Geen libraries.
 */
type Veld = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const form = document.querySelector<HTMLFormElement>('form[data-aanvraag]');

if (form) {
  const geladen = performance.now();
  const knop = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const serverfout = form.querySelector<HTMLElement>('[data-serverfout]');
  const invoer = (naam: string) => form.elements.namedItem(naam) as HTMLInputElement | null;
  const velden = () => form.querySelectorAll<Veld>('.veld__invoer');

  form.noValidate = true; // eigen meldingen in plaats van die van de browser

  const toon = (veld: Veld, melding: string) => {
    const fout = document.getElementById(`${veld.id}-fout`);
    if (!fout) return;
    fout.textContent = `Let op: ${melding}`;
    veld.setAttribute('aria-invalid', 'true');
    veld.setAttribute('aria-describedby', [veld.dataset.hulp, fout.id].filter(Boolean).join(' '));
  };

  const wis = (veld: Veld) => {
    const fout = document.getElementById(`${veld.id}-fout`);
    if (fout) fout.textContent = '';
    veld.removeAttribute('aria-invalid');
    if (veld.dataset.hulp) veld.setAttribute('aria-describedby', veld.dataset.hulp);
    else veld.removeAttribute('aria-describedby');
  };

  /** `true` als het veld klopt (en wist dan de melding). */
  const controleer = (veld: Veld) => {
    if (veld.disabled || veld.validity.valid) {
      wis(veld);
      return true;
    }
    const { foutLeeg, foutOngeldig } = veld.dataset;
    toon(veld, (veld.validity.valueMissing ? foutLeeg : foutOngeldig) || veld.validationMessage);
    return false;
  };

  const bezig = (aan: boolean) => {
    if (!knop) return;
    knop.disabled = aan;
    knop.textContent = aan ? 'Bezig met versturen…' : (knop.dataset.label ?? knop.textContent);
  };

  // Min-datum (vandaag, lokale tijd) en "nog geen datum".
  const datum = invoer('datum');
  const geenDatum = invoer('geenDatum');
  if (datum) {
    const nu = new Date();
    const twee = (n: number) => String(n).padStart(2, '0');
    datum.min = `${nu.getFullYear()}-${twee(nu.getMonth() + 1)}-${twee(nu.getDate())}`;
  }
  const synchroniseerDatum = () => {
    if (!datum || !geenDatum) return;
    datum.disabled = geenDatum.checked;
    datum.required = !geenDatum.checked;
    if (geenDatum.checked) {
      datum.value = '';
      wis(datum);
    }
  };
  geenDatum?.addEventListener('change', synchroniseerDatum);
  synchroniseerDatum();

  // Pakketkeuze: de browser doet de sprong naar #aanvragen, wij kiezen alleen het pakket.
  document.addEventListener('click', (gebeurtenis) => {
    const cta = (gebeurtenis.target as Element | null)?.closest<HTMLElement>('a[data-pakket]');
    const keuze = cta?.dataset.pakket;
    const pakket = form.elements.namedItem('pakket');
    if (!keuze || !(pakket instanceof HTMLSelectElement)) return;
    if (!Array.from(pakket.options).some((optie) => optie.value === keuze)) return;
    pakket.value = keuze;
    pakket.dispatchEvent(new Event('change', { bubbles: true })); // wist een eventuele foutmelding
  });

  // Een melding verdwijnt zodra het veld weer klopt.
  const opnieuw = (gebeurtenis: Event) => {
    const veld = gebeurtenis.target as Veld;
    if (veld.getAttribute('aria-invalid') === 'true') controleer(veld);
  };
  form.addEventListener('input', opnieuw);
  form.addEventListener('change', opnieuw);

  form.addEventListener('submit', async (gebeurtenis) => {
    gebeurtenis.preventDefault();
    if (serverfout) serverfout.hidden = true;

    let eerste: Veld | undefined;
    for (const veld of velden()) if (!controleer(veld)) eerste ??= veld;
    if (eerste) {
      eerste.focus();
      return;
    }

    const tijd = invoer('tijd');
    if (tijd) tijd.value = String(Math.round(performance.now() - geladen));
    bezig(true);

    try {
      const antwoord = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      const json = await antwoord.json().catch(() => null);

      if (json?.ok) {
        window.location.assign(`/bedankt?type=${encodeURIComponent(invoer('type')?.value ?? '')}`);
        return;
      }

      // De server vond een veld ongeldig (bijvoorbeeld een datum die net in het verleden ligt): toon dat bij het veld.
      if (json?.fouten) {
        let eersteFout: Veld | undefined;
        for (const [naam, melding] of Object.entries<string>(json.fouten)) {
          const veld = invoer(naam);
          if (veld?.classList.contains('veld__invoer')) {
            toon(veld, melding);
            eersteFout ??= veld;
          }
        }
        if (eersteFout) {
          bezig(false);
          eersteFout.focus();
          return;
        }
      }
    } catch {
      // Netwerkfout: valt door naar de melding hieronder.
    }

    if (serverfout) serverfout.hidden = false;
    bezig(false);
  });

  // Terug naar de pagina via de terugknop (bfcache): de knop is dan weer bruikbaar.
  window.addEventListener('pageshow', (gebeurtenis) => {
    if (gebeurtenis.persisted) bezig(false);
  });
}

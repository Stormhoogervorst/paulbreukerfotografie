/**
 * POST /api/aanvraag: verwerkt een aanvraag uit het formulier (type "bruiloft" of "portret", zie src/lib/formulieren/).
 *
 * Dit is het enige on-demand deel van de site (`prerender = false`); de rest is statisch.
 *
 * Volgorde: body lezen, formulier kiezen op `type`, spamcontroles (honeypot, tijdstempel, Origin; bij spam doen we alsof
 * het gelukt is en versturen we niets), valideren met Zod, dan mailen via Resend.
 * - Zonder RESEND_API_KEY: in dev een dry-run (niets versturen, aanvraag loggen, succes); in productie en preview een 503,
 *   zodat een aanvraag nooit stilletjes verdwijnt.
 * - Mislukt de mail naar Paul: 502, nooit een succesmelding. Mislukt alleen de bevestiging: loggen en toch succes.
 * - Met `Accept: application/json` (het script) antwoordt de route met JSON, anders met een redirect of een kleine
 *   HTML-pagina (formulier zonder JavaScript).
 * - In productie loggen we geen persoonsgegevens.
 */
import type { APIRoute } from 'astro';
import { getSecret } from 'astro:env/server';
import { Resend } from 'resend';
import { CONTACT } from '../../data/site';
import { kiesFormulier } from '../../lib/formulieren';
import { fout, succes } from '../../lib/formulieren/respons';

export const prerender = false;

/** Veldnaam van de honeypot (verborgen voor mensen, zie LandingFormulier.astro). */
const HONEYPOT = 'website';
/** Milliseconden tussen laden en verzenden (ingevuld door het script); korter dan dit is een bot. */
const MIN_TIJD_MS = 3000;
const MAX_BODY_BYTES = 50_000;

type Invoer = Record<string, unknown>;

/** Leest formulierdata of JSON naar een platte lijst; `undefined` als het verzoek onleesbaar is. */
async function leesInvoer(request: Request): Promise<Invoer | undefined> {
  const lengte = Number(request.headers.get('content-length') ?? 0);
  if (lengte > MAX_BODY_BYTES) return undefined;

  try {
    if ((request.headers.get('content-type') ?? '').includes('application/json')) {
      const body: unknown = await request.json();
      return typeof body === 'object' && body !== null && !Array.isArray(body) ? (body as Invoer) : undefined;
    }
    const invoer: Invoer = {};
    for (const [naam, waarde] of await request.formData()) {
      if (typeof waarde === 'string') invoer[naam] = waarde;
    }
    return invoer;
  } catch {
    return undefined;
  }
}

/** Origin aanwezig en niet van onze eigen site? Een ontbrekende Origin (bijvoorbeeld curl) laten we door. */
function vreemdeOrigin(request: Request, site: URL | undefined): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  const toegestaan = [new URL(request.url).origin, site?.origin];
  return !toegestaan.includes(origin);
}

function isBot(invoer: Invoer): boolean {
  const honeypot = invoer[HONEYPOT];
  if (typeof honeypot === 'string' ? honeypot.trim() !== '' : honeypot != null) return true;

  // Alleen controleren als het veld aanwezig en numeriek is (zonder JavaScript is het leeg).
  const tijd = invoer.tijd;
  if (tijd === undefined || tijd === null || tijd === '') return false;
  const ms = Number(tijd);
  return Number.isFinite(ms) && ms < MIN_TIJD_MS;
}

/** Eén mail versturen; `true` als Resend hem heeft aangenomen. Logt nooit adressen of inhoud. */
async function verstuur(resend: Resend, label: string, mail: Parameters<Resend['emails']['send']>[0]): Promise<boolean> {
  try {
    const { error } = await resend.emails.send(mail);
    if (error) {
      console.error(`[aanvraag] ${label} mislukt: ${error.name} (${error.statusCode ?? 'geen status'})`);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[aanvraag] ${label} mislukt: ${err instanceof Error ? err.name : 'onbekende fout'}`);
    return false;
  }
}

export const POST: APIRoute = async ({ request, site }) => {
  const invoer = await leesInvoer(request);
  if (!invoer) {
    return fout(request, {
      status: 400,
      code: 'ongeldig_verzoek',
      titel: 'Dit verzoek kon ik niet lezen',
      uitleg: 'Er ging iets mis bij het versturen. Probeer het formulier opnieuw.',
    });
  }

  const formulier = kiesFormulier(invoer.type);
  if (!formulier) {
    return fout(request, {
      status: 400,
      code: 'ongeldig_verzoek',
      titel: 'Dit verzoek kon ik niet lezen',
      uitleg: 'Het soort aanvraag is onbekend. Probeer het formulier opnieuw.',
    });
  }

  // Spam: doen alsof het gelukt is, niets versturen.
  if (isBot(invoer) || vreemdeOrigin(request, site)) return succes(request, formulier.type);

  const resultaat = formulier.schema.safeParse(invoer);
  if (!resultaat.success) {
    const fouten: Record<string, string> = {};
    for (const probleem of resultaat.error.issues) {
      const veld = String(probleem.path[0] ?? 'formulier');
      fouten[veld] ??= probleem.message;
    }
    return fout(request, {
      status: 400,
      code: 'validatie',
      titel: 'Controleer je aanvraag',
      uitleg: 'Een of meer velden zijn niet goed ingevuld.',
      fouten,
    });
  }
  const data = resultaat.data;

  const sleutel = getSecret('RESEND_API_KEY')?.trim();
  const van = getSecret('FORM_FROM_EMAIL')?.trim();
  const naar = getSecret('FORM_TO_EMAIL')?.trim() || CONTACT.email;

  if (!sleutel) {
    if (import.meta.env.DEV) {
      // Dry-run: lokaal ontwikkelen zonder Resend-account.
      const bevestiging = formulier.bevestiging(data);
      console.info(
        [
          '[aanvraag] dry-run (geen RESEND_API_KEY): niets verstuurd.',
          `--- Mail naar ${naar} (reply-to ${data.email})`,
          `Onderwerp: ${formulier.onderwerp(data)}`,
          '',
          formulier.tekst(data),
          `--- Bevestiging naar ${data.email} (reply-to ${naar})`,
          `Onderwerp: ${bevestiging.onderwerp}`,
          '',
          bevestiging.tekst,
        ].join('\n'),
      );
      return succes(request, formulier.type);
    }
    console.error('[aanvraag] RESEND_API_KEY ontbreekt: aanvraag niet verwerkt.');
    return notConfigured(request);
  }
  if (!van) {
    console.error('[aanvraag] FORM_FROM_EMAIL ontbreekt: aanvraag niet verwerkt.');
    return notConfigured(request);
  }

  const resend = new Resend(sleutel);

  // 1. Mail naar Paul. Mislukt dit, dan nooit een succesmelding.
  const naarPaul = await verstuur(resend, 'mail naar Paul', {
    from: van,
    to: [naar],
    subject: formulier.onderwerp(data),
    text: formulier.tekst(data),
    replyTo: data.email,
  });
  if (!naarPaul) {
    return fout(request, {
      status: 502,
      code: 'verzenden_mislukt',
      titel: 'Het versturen is niet gelukt',
      uitleg: 'Je aanvraag is niet aangekomen. Probeer het later nog eens, of neem direct contact met me op.',
    });
  }

  // 2. Bevestiging aan de aanvrager. Mislukt dit, dan is de aanvraag zelf wel aangekomen: loggen en toch succes.
  const bevestiging = formulier.bevestiging(data);
  await verstuur(resend, 'bevestiging', {
    from: van,
    to: [data.email],
    subject: bevestiging.onderwerp,
    text: bevestiging.tekst,
    replyTo: naar,
  });

  return succes(request, formulier.type);
};

function notConfigured(request: Request): Response {
  return fout(request, {
    status: 503,
    code: 'niet_geconfigureerd',
    titel: 'Het formulier werkt nu nog niet',
    uitleg: 'Het versturen van aanvragen is nog niet ingesteld op deze website. Je aanvraag is niet verstuurd.',
  });
}

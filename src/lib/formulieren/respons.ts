/**
 * Responses van de API-route: JSON voor het script (Accept: application/json), anders een kleine server-gerenderde
 * HTML-pagina (formulier zonder JavaScript). Alle tekst in de pagina wordt ge-escaped.
 */
import { CONTACT } from '../../data/site';

export type FoutCode =
  | 'ongeldig_verzoek'
  | 'validatie'
  | 'verzenden_mislukt'
  | 'niet_geconfigureerd';

interface Fout {
  status: number;
  code: FoutCode;
  /** Kop van de HTML-pagina. */
  titel: string;
  /** Uitleg op de HTML-pagina. */
  uitleg: string;
  /** Alleen bij `validatie`: melding per veld. */
  fouten?: Record<string, string>;
}

const NO_STORE = { 'Cache-Control': 'no-store' };

export function wilJson(request: Request): boolean {
  return (request.headers.get('accept') ?? '').includes('application/json');
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...NO_STORE },
  });
}

const escape = (tekst: string): string =>
  tekst.replace(/[&<>"']/g, (teken) => `&#${teken.charCodeAt(0)};`);

/** Succes: { ok: true } voor het script, anders een 303 naar de bedankpagina. */
export function succes(request: Request, type: string): Response {
  if (wilJson(request)) return json(200, { ok: true });
  return new Response(null, {
    status: 303,
    headers: { Location: `/bedankt?type=${encodeURIComponent(type)}`, ...NO_STORE },
  });
}

export function fout(request: Request, melding: Fout): Response {
  if (wilJson(request)) {
    return json(
      melding.status,
      melding.fouten ? { ok: false, fouten: melding.fouten } : { ok: false, code: melding.code },
    );
  }

  const lijst = melding.fouten
    ? `<ul>${Object.values(melding.fouten)
        .map((tekst) => `<li>Let op: ${escape(tekst)}</li>`)
        .join('')}</ul>`
    : '';
  const mail = escape(CONTACT.email);
  const html = `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${escape(melding.titel)} | Paul Breuker Fotografie</title>
<style>
body{margin:0;padding:6vw 5.5vw;font:20px/1.4 Satoshi,system-ui,-apple-system,"Segoe UI",Helvetica,Arial,sans-serif;color:#151515;background:#fff}
h1{margin:0 0 .5em;font-size:clamp(2rem,6vw,4rem);line-height:1;letter-spacing:-.04em}
p,ul{max-width:32em}ul{padding-left:1.2em}a{color:inherit;text-underline-offset:.2em}
</style>
</head>
<body>
<main>
<h1>${escape(melding.titel)}</h1>
<p>${escape(melding.uitleg)}</p>
${lijst}
<p><a href="/fotograaf-bruiloft#aanvragen">Terug naar het formulier</a>. Gebruik je de terugknop van je browser, dan blijft wat je invulde meestal staan.</p>
<p>Liever mailen of bellen? <a href="mailto:${mail}">${mail}</a> of <a href="${escape(CONTACT.phoneHref)}">${escape(CONTACT.phoneDisplay)}</a>.</p>
</main>
</body>
</html>`;

  return new Response(html, {
    status: melding.status,
    headers: { 'Content-Type': 'text/html; charset=utf-8', ...NO_STORE },
  });
}

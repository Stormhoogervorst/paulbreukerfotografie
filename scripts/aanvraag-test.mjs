/**
 * Test van de aanvraagformulieren (bruiloft, portret en contact) en /api/aanvraag.
 *
 * Gebruik: `node scripts/aanvraag-test.mjs`. Het script start zelf een dev-server op poort 4398 (`astro dev --ignore-lock`,
 * dus naast een draaiende dev-server) zonder RESEND_API_KEY: de route doet dan een dry-run en logt de mails, en dat
 * log leest dit script om te controleren wat er "verstuurd" is. Eenmalig nodig: `npx playwright install chromium`.
 * Een andere poort: `PORT=4400 node scripts/aanvraag-test.mjs`. Exit-code 1 bij een mislukte controle.
 *
 * Controles (portret): geldige aanvraag leidt naar /bedankt?type=portret (met de stappen van het portret), lege
 * verzending toont fouten, honeypot gevuld logt niets, ongeldig e-mailadres geeft 400, een klik op de cta van
 * "Kunstportret" scrolt naar #aanvragen met dat pakket voorgeselecteerd en het veld "locatie" staat in de gelogde
 * aanvraag. Daarnaast regressiecontroles voor het bruiloftformulier.
 *
 * Controles (contact, /contact): geldige aanvraag leidt naar /bedankt?type=contact (met de stappen van het contactformulier)
 * en wordt gelogd, lege verzending toont fouten en zet de focus op het eerste ongeldige veld, honeypot gevuld logt niets,
 * ongeldig e-mailadres en een onbekend (of leeg) onderwerp geven 400, en hetzelfde zonder JavaScript geeft een 303 naar
 * /bedankt?type=contact. /contact toont "Liever bellen of mailen?" en de bewegende titel niet (de landingspagina's wel), en heeft de opbouw H1, formulier, contactregels (telefoon, e-mail, LinkedIn), panorama van rand tot rand tegen de footer.
 */
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const PORT = Number(process.env.PORT ?? 4398);
const BASE = `http://localhost:${PORT}`;
const wacht = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ---------------------------------------------------------------------------
// Dev-server
// ---------------------------------------------------------------------------

const env = { ...process.env, FORCE_COLOR: '0' };
delete env.RESEND_API_KEY;
const server = spawn('npx', ['astro', 'dev', '--port', String(PORT), '--ignore-lock'], { env, stdio: ['ignore', 'pipe', 'pipe'] });
let log = '';
server.stdout.on('data', (deel) => (log += deel));
server.stderr.on('data', (deel) => (log += deel));

const stop = () => server.kill();
process.on('exit', stop);

for (let i = 0; i < 120 && !log.includes(`localhost:${PORT}`); i++) await wacht(500);
if (!log.includes(`localhost:${PORT}`)) {
  console.error('De dev-server startte niet:\n' + log);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Hulpfuncties
// ---------------------------------------------------------------------------

const resultaten = [];
async function controle(naam, functie) {
  try {
    await functie();
    resultaten.push([naam, true, '']);
  } catch (fout) {
    resultaten.push([naam, false, fout instanceof Error ? fout.message : String(fout)]);
  }
}
function eis(voorwaarde, melding) {
  if (!voorwaarde) throw new Error(melding);
}

const aantalMails = () => (log.match(/\[aanvraag\] dry-run/g) ?? []).length;
const postJson = async (body, headers = {}) => {
  const antwoord = await fetch(`${BASE}/api/aanvraag`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...headers },
    body: JSON.stringify(body),
  });
  return { status: antwoord.status, json: await antwoord.json().catch(() => null) };
};
/** Verzenden zoals een formulier zonder JavaScript: urlencoded, geen Accept: application/json. */
const postFormulier = async (velden) => {
  const antwoord = await fetch(`${BASE}/api/aanvraag`, {
    method: 'POST',
    redirect: 'manual',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(velden),
  });
  return { status: antwoord.status, location: antwoord.headers.get('location') };
};

const geldigPortret = {
  type: 'portret',
  naam: 'Test Persoon',
  email: 'test@example.com',
  telefoon: '06 12345678',
  pakket: 'duo-en-gezin',
  locatie: 'Thuis in Lent',
  personen: '3-5',
  bericht: 'Een gezin met twee kinderen.\nGraag in de tuin.',
  tijd: '5000',
};
const geldigContact = {
  type: 'contact',
  naam: 'Jan de Boer',
  email: 'jan@example.com',
  telefoon: '+31 6 12345678',
  onderwerp: 'boek',
  bericht: 'Ik wil graag een boek bestellen.\nKan dat ook als cadeau?',
  tijd: '5000',
};
const geldigBruiloft = {
  type: 'bruiloft',
  datum: '2099-06-12',
  locatie: 'Kasteel Doorwerth',
  namen: 'Anna en Bram',
  email: 'anna@example.com',
  tijd: '5000',
};

// ---------------------------------------------------------------------------
// API (zonder browser)
// ---------------------------------------------------------------------------

await controle('portret API: geldige aanvraag geeft { ok: true } en logt mails met alle velden', async () => {
  const voor = aantalMails();
  const antwoord = await postJson(geldigPortret);
  eis(antwoord.status === 200 && antwoord.json?.ok === true, `status ${antwoord.status}`);
  await wacht(500);
  eis(aantalMails() === voor + 1, 'er is geen dry-run gelogd');
  for (const verwacht of [
    'Onderwerp: Nieuwe portretaanvraag: Test Persoon, Duo en gezin',
    'Waar wil je dat ik kom?: Thuis in Lent',
    'Aantal personen: 3 tot 5',
    'Verstuurd via paulbreuker.nl/portretfotos',
    'Onderwerp: Bedankt voor je aanvraag, ik reageer binnen 24 uur',
    'Hoi Test Persoon,',
  ]) {
    eis(log.includes(verwacht), `ontbreekt in het log: ${verwacht}`);
  }
});

await controle('portret zonder JavaScript: 303 naar /bedankt?type=portret', async () => {
  const { website: _w, tijd: _t, ...velden } = geldigPortret;
  const antwoord = await postFormulier(velden);
  eis(antwoord.status === 303 && antwoord.location === '/bedankt?type=portret', `${antwoord.status} ${antwoord.location}`);
});

await controle('portret API: ongeldig e-mailadres geeft 400 met melding bij e-mail', async () => {
  const voor = aantalMails();
  const antwoord = await postJson({ ...geldigPortret, email: 'geen-adres' });
  eis(antwoord.status === 400 && antwoord.json?.fouten?.email, `status ${antwoord.status} ${JSON.stringify(antwoord.json)}`);
  await wacht(300);
  eis(aantalMails() === voor, 'er is toch een mail gelogd');
});

await controle('portret API: lege of onbekende pakketkeuze en te lang bericht geven 400', async () => {
  const leeg = await postJson({ ...geldigPortret, pakket: '' });
  eis(leeg.status === 400 && leeg.json?.fouten?.pakket, `leeg: ${JSON.stringify(leeg.json)}`);
  const onbekend = await postJson({ ...geldigPortret, pakket: 'studiosessie' });
  eis(onbekend.status === 400 && onbekend.json?.fouten?.pakket, `onbekend: ${JSON.stringify(onbekend.json)}`);
  const lang = await postJson({ ...geldigPortret, bericht: 'x'.repeat(2001) });
  eis(lang.status === 400 && lang.json?.fouten?.bericht, `bericht: ${JSON.stringify(lang.json)}`);
  const naam = await postJson({ ...geldigPortret, naam: '   ' });
  eis(naam.status === 400 && naam.json?.fouten?.naam, `naam: ${JSON.stringify(naam.json)}`);
});

await controle('portret API: honeypot gevuld, te snel of vreemde Origin geeft schijnsucces en logt niets', async () => {
  const voor = aantalMails();
  const honeypot = await postJson({ ...geldigPortret, website: 'https://spam.example' });
  const snel = await postJson({ ...geldigPortret, tijd: '500' });
  const vreemd = await postJson(geldigPortret, { Origin: 'https://spam.example' });
  for (const antwoord of [honeypot, snel, vreemd]) eis(antwoord.status === 200 && antwoord.json?.ok === true, `status ${antwoord.status}`);
  await wacht(800);
  eis(aantalMails() === voor, 'er is toch een mail gelogd');
});

await controle('onbekend type geeft 400', async () => {
  const antwoord = await postJson({ ...geldigPortret, type: 'studio' });
  eis(antwoord.status === 400, `status ${antwoord.status}`);
});

await controle('contact API: geldige aanvraag geeft { ok: true } en logt mails met alle velden', async () => {
  const voor = aantalMails();
  const antwoord = await postJson(geldigContact);
  eis(antwoord.status === 200 && antwoord.json?.ok === true, `status ${antwoord.status}`);
  await wacht(500);
  eis(aantalMails() === voor + 1, 'er is geen dry-run gelogd');
  for (const verwacht of [
    'Onderwerp: Nieuw bericht via contactformulier: Jan de Boer, Een boek of magazine bestellen',
    'reply-to jan@example.com',
    'Waar gaat het over?: Een boek of magazine bestellen',
    'Vertel me waar ik je mee kan helpen: Ik wil graag een boek bestellen.\nKan dat ook als cadeau?',
    'Verstuurd via paulbreuker.nl/contact',
    'Onderwerp: Bedankt voor je bericht, ik reageer binnen 24 uur',
    'Hoi Jan de Boer,\n\nBedankt voor je bericht. Ik heb het ontvangen en reageer binnen 24 uur.\n\nDit heb ik genoteerd:',
    'Groet,\nPaul Breuker\n+31 6 51 47 54 06 | info@paulbreuker.nl\nhttps://paulbreuker.nl',
  ]) {
    eis(log.includes(verwacht), `ontbreekt in het log: ${verwacht}`);
  }
});

await controle('contact zonder JavaScript: 303 naar /bedankt?type=contact', async () => {
  const { tijd: _t, ...velden } = geldigContact;
  const antwoord = await postFormulier(velden);
  eis(antwoord.status === 303 && antwoord.location === '/bedankt?type=contact', `${antwoord.status} ${antwoord.location}`);
});

await controle('contact API: ongeldig e-mailadres geeft 400 met melding bij e-mail en logt niets', async () => {
  const voor = aantalMails();
  const antwoord = await postJson({ ...geldigContact, email: 'geen-adres' });
  eis(antwoord.status === 400 && antwoord.json?.fouten?.email, `status ${antwoord.status} ${JSON.stringify(antwoord.json)}`);
  await wacht(300);
  eis(aantalMails() === voor, 'er is toch een mail gelogd');
});

await controle('contact API: onbekend of leeg onderwerp, leeg of te kort of te lang bericht geven 400', async () => {
  const onbekend = await postJson({ ...geldigContact, onderwerp: 'studiosessie' });
  eis(onbekend.status === 400 && onbekend.json?.fouten?.onderwerp, `onbekend: ${JSON.stringify(onbekend.json)}`);
  const leeg = await postJson({ ...geldigContact, onderwerp: '' });
  eis(leeg.status === 400 && leeg.json?.fouten?.onderwerp, `leeg: ${JSON.stringify(leeg.json)}`);
  const kort = await postJson({ ...geldigContact, bericht: 'Hoi' });
  eis(kort.status === 400 && kort.json?.fouten?.bericht, `kort: ${JSON.stringify(kort.json)}`);
  const geen = await postJson({ ...geldigContact, bericht: '   ' });
  eis(geen.status === 400 && geen.json?.fouten?.bericht, `leeg bericht: ${JSON.stringify(geen.json)}`);
  const lang = await postJson({ ...geldigContact, bericht: 'x'.repeat(2001) });
  eis(lang.status === 400 && lang.json?.fouten?.bericht, `lang: ${JSON.stringify(lang.json)}`);
  const naam = await postJson({ ...geldigContact, naam: 'n'.repeat(121) });
  eis(naam.status === 400 && naam.json?.fouten?.naam, `naam: ${JSON.stringify(naam.json)}`);
});

await controle('contact API: honeypot gevuld, te snel of vreemde Origin geeft schijnsucces en logt niets', async () => {
  const voor = aantalMails();
  const honeypot = await postJson({ ...geldigContact, website: 'https://spam.example' });
  const snel = await postJson({ ...geldigContact, tijd: '500' });
  const vreemd = await postJson(geldigContact, { Origin: 'https://spam.example' });
  for (const antwoord of [honeypot, snel, vreemd]) eis(antwoord.status === 200 && antwoord.json?.ok === true, `status ${antwoord.status}`);
  await wacht(800);
  eis(aantalMails() === voor, 'er is toch een mail gelogd');
});

await controle('contact zonder JavaScript: een fout geeft een foutpagina met een link terug naar /contact#formulier', async () => {
  const antwoord = await fetch(`${BASE}/api/aanvraag`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ type: 'contact', naam: 'Jan', email: 'geen-adres', onderwerp: 'boek', bericht: 'Een bericht van genoeg tekens.' }),
  });
  const html = await antwoord.text();
  eis(antwoord.status === 400, `status ${antwoord.status}`);
  eis(html.includes('href="/contact#formulier"'), 'de link terug naar het contactformulier ontbreekt');
});

await controle('bruiloft API (regressie): geldige aanvraag, 303 zonder JavaScript en validatiefouten', async () => {
  const voor = aantalMails();
  const ok = await postJson(geldigBruiloft);
  eis(ok.status === 200 && ok.json?.ok === true, `status ${ok.status}`);
  await wacht(500);
  eis(aantalMails() === voor + 1, 'geen dry-run gelogd');
  eis(log.includes('Onderwerp: Nieuwe bruiloftaanvraag: Anna en Bram, 12 juni 2099'), 'onderwerp ontbreekt');
  eis(log.includes('Verstuurd via paulbreuker.nl/fotograaf-bruiloft'), 'bron ontbreekt');
  const { tijd: _t, ...velden } = geldigBruiloft;
  const redirect = await postFormulier(velden);
  eis(redirect.status === 303 && redirect.location === '/bedankt?type=bruiloft', `${redirect.status} ${redirect.location}`);
  const fout = await postJson({ ...geldigBruiloft, email: 'x', namen: '' });
  eis(fout.status === 400 && fout.json?.fouten?.email && fout.json?.fouten?.namen, JSON.stringify(fout.json));
});

// ---------------------------------------------------------------------------
// Browser
// ---------------------------------------------------------------------------

const browser = await chromium.launch();

async function nieuwePagina(pad) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const pagina = await context.newPage();
  await pagina.goto(BASE + pad, { waitUntil: 'domcontentloaded' });
  await pagina.waitForSelector('form[data-aanvraag]', { state: 'attached' });
  // Het script (formulier.ts) hangt zijn handlers bij het laden; geef het en de spamwering (minimaal 3 s) de tijd.
  await pagina.waitForTimeout(3500);
  return { context, pagina };
}

await controle('portret UI: klik op de cta van "Kunstportret" scrolt naar #aanvragen en kiest dat pakket', async () => {
  const { context, pagina } = await nieuwePagina('/portretfotos');
  try {
    await pagina.locator('a[data-pakket="kunstportret"]').click();
    await pagina.waitForFunction(() => location.hash === '#aanvragen');
    const waarde = await pagina.locator('#aanvraag-pakket').inputValue();
    eis(waarde === 'kunstportret', `pakketveld = "${waarde}"`);
    await pagina.waitForTimeout(600);
    const top = await pagina.locator('#aanvragen').evaluate((el) => Math.round(el.getBoundingClientRect().top));
    eis(Math.abs(top) < 200, `#aanvragen staat ${top}px van de bovenkant`);
  } finally {
    await context.close();
  }
});

await controle('portret UI: lege verzending toont fouten en verstuurt niets', async () => {
  const { context, pagina } = await nieuwePagina('/portretfotos');
  try {
    const voor = aantalMails();
    await pagina.locator('form[data-aanvraag] button[type="submit"]').click();
    await pagina.waitForTimeout(500);
    for (const veld of ['naam', 'email', 'pakket']) {
      const tekst = (await pagina.locator(`#aanvraag-${veld}-fout`).textContent()) ?? '';
      eis(tekst.startsWith('Let op:'), `geen foutmelding bij ${veld}: "${tekst}"`);
    }
    eis(new URL(pagina.url()).pathname === '/portretfotos', `url is ${pagina.url()}`);
    eis(aantalMails() === voor, 'er is toch een mail gelogd');
  } finally {
    await context.close();
  }
});

await controle('portret UI: geldige aanvraag (via de cta) leidt naar /bedankt?type=portret, locatie staat in het log', async () => {
  const { context, pagina } = await nieuwePagina('/portretfotos');
  try {
    const voor = aantalMails();
    await pagina.locator('a[data-pakket="kunstportret"]').click();
    await pagina.fill('#aanvraag-naam', 'Ine Jansen');
    await pagina.fill('#aanvraag-email', 'ine@example.com');
    await pagina.fill('#aanvraag-locatie', 'Buiten, bij de Waal');
    await pagina.selectOption('#aanvraag-personen', '1');
    await pagina.fill('#aanvraag-bericht', 'Een portret voor aan de muur.');
    await pagina.locator('form[data-aanvraag] button[type="submit"]').click();
    await pagina.waitForURL(/\/bedankt\?type=portret$/, { timeout: 15000 });
    eis(aantalMails() === voor + 1, 'geen dry-run gelogd');
    eis(log.includes('Onderwerp: Nieuwe portretaanvraag: Ine Jansen, Kunstportret'), 'onderwerp ontbreekt of pakket klopt niet');
    eis(log.includes('Waar wil je dat ik kom?: Buiten, bij de Waal'), 'locatie ontbreekt in het gelogde verzoek');
    // Bedankpagina: de stappen van het portret zijn zichtbaar, die van de bruiloft niet.
    const portret = pagina.locator('[data-stappen="portret"]');
    const bruiloft = pagina.locator('[data-stappen="bruiloft"]');
    eis(await portret.isVisible(), 'stappen van het portret zijn niet zichtbaar');
    eis(!(await bruiloft.isVisible()), 'stappen van de bruiloft zijn zichtbaar');
    eis((await portret.textContent())?.includes('Ik stuur je een voorstel voor een moment en een plek.'), 'stap 2 klopt niet');
    eis((await pagina.locator('#main').getAttribute('data-aanvraag-type')) === 'portret', 'data-aanvraag-type ontbreekt');
  } finally {
    await context.close();
  }
});

await controle('contact UI: geen blok "Liever bellen of mailen?", anker #formulier en links naar de aanvraagformulieren', async () => {
  const { context, pagina } = await nieuwePagina('/contact');
  try {
    eis((await pagina.locator('#formulier').count()) === 1, 'anker #formulier ontbreekt');
    eis((await pagina.locator('#aanvragen').count()) === 0, 'er staat een #aanvragen op /contact');
    eis((await pagina.locator('.formulier__contact-kop').count()) === 0, '"Liever bellen of mailen?" staat op /contact');
    // `main h1`: de dev-toolbar van Astro heeft zelf ook een h1.
    eis((await pagina.locator('main h1').count()) === 1, 'niet precies één h1 in main');
    for (const href of ['/fotograaf-bruiloft#aanvragen', '/portretfotos#aanvragen']) {
      eis((await pagina.locator(`#formulier a[href="${href}"]`).count()) === 1, `link ${href} ontbreekt in de intro`);
    }
    // Opbouw: H1, formulier, contactregels (geen bewegende titel; geen Instagram of Facebook).
    eis((await pagina.locator('.marquee').count()) === 0, 'er staat een bewegende titel op /contact');
    eis((await pagina.locator('#formulier > h2.visually-hidden').count()) === 1, 'de verborgen h2 van het formulier ontbreekt');
    eis((await pagina.locator('[data-conversie="instagram"], [data-conversie="facebook"]').count()) === 0, 'Instagram of Facebook staat nog als regel');
    const soorten = await pagina.locator('.regel').evaluateAll((els) => els.map((el) => el.getAttribute('data-conversie')));
    eis(soorten.join(',') === 'telefoon,email,linkedin', `regels: ${soorten.join(',')}`);
    const volgorde = await pagina.evaluate(() => {
      const top = (selector) => document.querySelector(selector).getBoundingClientRect().top;
      return [top('main h1'), top('#formulier'), top('.regels')];
    });
    eis(volgorde[0] < volgorde[1] && volgorde[1] < volgorde[2], `volgorde klopt niet: ${volgorde.join(' / ')}`);
    // Panorama: onder de regels, van rand tot rand en direct tegen de footer.
    const panorama = await pagina.evaluate(() => {
      const p = document.querySelector('.panorama').getBoundingClientRect();
      const f = document.querySelector('footer').getBoundingClientRect();
      const r = document.querySelector('.regels').getBoundingClientRect();
      return { links: p.left, rechts: p.right, breedte: innerWidth, naarFooter: Math.round(f.top - p.bottom), naRegels: p.top >= r.bottom };
    });
    eis(panorama.links === 0 && panorama.rechts === panorama.breedte, `panorama loopt niet van rand tot rand: ${JSON.stringify(panorama)}`);
    eis(Math.abs(panorama.naarFooter) <= 1 && panorama.naRegels, `panorama staat niet onder de regels en tegen de footer: ${JSON.stringify(panorama)}`);
    const knop = (await pagina.locator('form[data-aanvraag] button[type="submit"]').textContent())?.trim();
    eis(knop === 'Bericht versturen', `verzendlabel is "${knop}"`);
  } finally {
    await context.close();
  }
});

await controle('contact UI: lege verzending toont fouten, zet de focus op het eerste ongeldige veld en verstuurt niets', async () => {
  const { context, pagina } = await nieuwePagina('/contact');
  try {
    const voor = aantalMails();
    await pagina.locator('form[data-aanvraag] button[type="submit"]').click();
    await pagina.waitForTimeout(500);
    for (const veld of ['naam', 'email', 'onderwerp', 'bericht']) {
      const tekst = (await pagina.locator(`#aanvraag-${veld}-fout`).textContent()) ?? '';
      eis(tekst.startsWith('Let op:'), `geen foutmelding bij ${veld}: "${tekst}"`);
    }
    eis(((await pagina.locator('#aanvraag-telefoon-fout').textContent()) ?? '') === '', 'het optionele telefoonveld toont een fout');
    const actief = await pagina.evaluate(() => document.activeElement?.id);
    eis(actief === 'aanvraag-naam', `focus staat op "${actief}", niet op het eerste ongeldige veld`);
    eis(new URL(pagina.url()).pathname === '/contact', `url is ${pagina.url()}`);
    eis(aantalMails() === voor, 'er is toch een mail gelogd');
    // Een te kort bericht geeft de melding over het minimum, met de focus op dat veld.
    await pagina.fill('#aanvraag-naam', 'Ine');
    await pagina.fill('#aanvraag-email', 'ine@example.com');
    await pagina.selectOption('#aanvraag-onderwerp', 'anders');
    await pagina.fill('#aanvraag-bericht', 'Hoi');
    await pagina.locator('form[data-aanvraag] button[type="submit"]').click();
    await pagina.waitForTimeout(300);
    eis((await pagina.locator('#aanvraag-bericht-fout').textContent()) === 'Let op: Schrijf minimaal 10 tekens.', 'melding bij een te kort bericht klopt niet');
    eis((await pagina.evaluate(() => document.activeElement?.id)) === 'aanvraag-bericht', 'focus staat niet op het bericht');
  } finally {
    await context.close();
  }
});

await controle('contact UI: geldige aanvraag leidt naar /bedankt?type=contact met de stappen van het contactformulier', async () => {
  const { context, pagina } = await nieuwePagina('/contact');
  try {
    const voor = aantalMails();
    await pagina.fill('#aanvraag-naam', 'Ine Jansen');
    await pagina.fill('#aanvraag-email', 'ine@example.com');
    await pagina.selectOption('#aanvraag-onderwerp', 'pers');
    await pagina.fill('#aanvraag-bericht', 'Een vraag over de expositie in het Valkhof.');
    await pagina.locator('form[data-aanvraag] button[type="submit"]').click();
    await pagina.waitForURL(/\/bedankt\?type=contact$/, { timeout: 15000 });
    eis(aantalMails() === voor + 1, 'geen dry-run gelogd');
    eis(log.includes('Onderwerp: Nieuw bericht via contactformulier: Ine Jansen, Exposities of pers'), 'onderwerp ontbreekt of klopt niet');
    const contact = pagina.locator('[data-stappen="contact"]');
    eis(await contact.isVisible(), 'stappen van het contactformulier zijn niet zichtbaar');
    eis(!(await pagina.locator('[data-stappen="portret"]').isVisible()), 'stappen van het portret zijn zichtbaar');
    eis(!(await pagina.locator('[data-stappen="bruiloft"]').isVisible()), 'stappen van de bruiloft zijn zichtbaar');
    const tekst = (await contact.textContent()) ?? '';
    for (const stap of ['Ik lees je bericht.', 'Ik antwoord je binnen 24 uur per e-mail.', 'Wil je iets toevoegen? Beantwoord dan de bevestigingsmail.']) {
      eis(tekst.includes(stap), `stap ontbreekt: ${stap}`);
    }
    eis((await pagina.locator('#main').getAttribute('data-aanvraag-type')) === 'contact', 'data-aanvraag-type ontbreekt');
  } finally {
    await context.close();
  }
});

await controle('landingspagina (regressie): bruiloft en portret tonen "Liever bellen of mailen?" en hebben #aanvragen', async () => {
  for (const pad of ['/fotograaf-bruiloft', '/portretfotos']) {
    const { context, pagina } = await nieuwePagina(pad);
    try {
      eis((await pagina.locator('#aanvragen').count()) === 1, `${pad}: #aanvragen ontbreekt`);
      eis((await pagina.locator('.formulier__contact-kop').count()) === 1, `${pad}: "Liever bellen of mailen?" ontbreekt`);
    } finally {
      await context.close();
    }
  }
});

await controle('bruiloft UI (regressie): /bedankt?type=bruiloft toont de stappen van de bruiloft; onbekend type toont geen stappen', async () => {
  const { context, pagina } = await nieuwePagina('/fotograaf-bruiloft');
  try {
    await pagina.goto(`${BASE}/bedankt?type=bruiloft`, { waitUntil: 'domcontentloaded' });
    eis(await pagina.locator('[data-stappen="bruiloft"]').isVisible(), 'stappen van de bruiloft niet zichtbaar');
    eis((await pagina.locator('[data-stappen="bruiloft"]').textContent())?.includes('kijk of de datum nog vrij is'), 'stap 1 klopt niet');
    await pagina.goto(`${BASE}/bedankt?type=onzin`, { waitUntil: 'domcontentloaded' });
    eis((await pagina.locator('[data-stappen]:visible').count()) === 0, 'er zijn stappen zichtbaar bij een onbekend type');
    eis((await pagina.locator('#main').getAttribute('data-aanvraag-type')) === null, 'data-aanvraag-type gezet bij onbekend type');
  } finally {
    await context.close();
  }
});

await controle('bruiloft UI (regressie): klik op een pakket-cta springt naar #aanvragen en laat het formulier ongemoeid', async () => {
  const { context, pagina } = await nieuwePagina('/fotograaf-bruiloft');
  try {
    await pagina.locator('a[data-pakket="album"]').click();
    await pagina.waitForFunction(() => location.hash === '#aanvragen');
    eis((await pagina.locator('#aanvraag-pakket').count()) === 0, 'het bruiloftformulier heeft ineens een pakketveld');
  } finally {
    await context.close();
  }
});

await browser.close();
stop();

// ---------------------------------------------------------------------------
// Uitslag
// ---------------------------------------------------------------------------

let mislukt = 0;
for (const [naam, gelukt, melding] of resultaten) {
  console.log(`${gelukt ? 'OK    ' : 'FOUT  '}${naam}${gelukt ? '' : `\n        ${melding}`}`);
  if (!gelukt) mislukt++;
}
console.log(`\n${resultaten.length - mislukt} van ${resultaten.length} controles geslaagd.`);
process.exit(mislukt > 0 ? 1 : 0);

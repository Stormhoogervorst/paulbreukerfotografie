// Meting voor de privacyverklaring (src/data/privacy.ts, constante GEEN_COOKIES_GEMETEN): laadt de belangrijkste pagina's
// op de productiebuild en meldt per pagina cookies, browseropslag, Set-Cookie-headers en verzoeken aan andere hosts.
// Gebruik: npm run build, daarna
//   node scripts/privacy-meting.mjs
// `astro preview` werkt niet met de Vercel-adapter ("does not support the preview command"). Zonder BASE_URL serveert dit
// script daarom zelf de statische productiebuild (.vercel/output/static, dezelfde bestanden als op Vercel, zonder
// Vercel-headers). Set-Cookie-headers van Vercel zelf zijn zo niet zichtbaar: draai de meting voor livegang ook op een
// preview- of productie-URL: BASE_URL=https://<preview>.vercel.app node scripts/privacy-meting.mjs
// Exitcode 0: niets gevonden (GEEN_COOKIES_GEMETEN mag op true). Exitcode 1: er is iets gevonden (laat het op false).
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';

const STATISCH = join(process.cwd(), '.vercel', 'output', 'static');
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
};

/** Eenvoudige statische server met "clean URLs" (/privacy wordt privacy/index.html), zoals Vercel dat doet. */
function startServer() {
  if (!existsSync(STATISCH)) {
    console.error(`${STATISCH} bestaat niet. Draai eerst: npm run build`);
    process.exit(2);
  }
  const server = createServer((verzoek, antwoord) => {
    const pad = normalize(decodeURIComponent(new URL(verzoek.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
    const kandidaten = [join(STATISCH, pad), join(STATISCH, pad, 'index.html'), join(STATISCH, `${pad}.html`)];
    const bestand = kandidaten.find((kandidaat) => existsSync(kandidaat) && statSync(kandidaat).isFile());
    if (!bestand) {
      antwoord.writeHead(404, { 'content-type': TYPES['.html'] });
      antwoord.end(readFileSync(join(STATISCH, '404.html')));
      return;
    }
    antwoord.writeHead(200, { 'content-type': TYPES[extname(bestand)] ?? 'application/octet-stream' });
    antwoord.end(readFileSync(bestand));
  });
  return new Promise((klaar) => server.listen(0, '127.0.0.1', () => klaar({ server, url: `http://127.0.0.1:${server.address().port}` })));
}

const eigenServer = process.env.BASE_URL ? undefined : await startServer();
const BASE_URL = process.env.BASE_URL ?? eigenServer.url;
const EIGEN_HOST = new URL(BASE_URL).host;

// Homepage, de projectenpagina (/series, voorheen /werk), een projectpagina, de twee aanbodpagina's, contact, bedankt en privacy.
const PAGINAS = ['/', '/series', '/love-marriage', '/fotograaf-bruiloft', '/portretfotos', '/contact', '/bedankt', '/privacy'];
const VIEWPORTS = [
  { naam: 'desktop', width: 1440, height: 900 },
  { naam: 'mobiel', width: 390, height: 844 },
];

/** Scrollt de hele pagina door, zodat lazy afbeeldingen en scroll-gekoppelde onderdelen alles laden. */
async function scrollDoor(page) {
  await page.evaluate(async () => {
    const stap = Math.max(window.innerHeight * 0.8, 300);
    for (let y = 0; y < document.documentElement.scrollHeight; y += stap) {
      window.scrollTo(0, y);
      await new Promise((klaar) => setTimeout(klaar, 120));
    }
    window.scrollTo(0, 0);
  });
}

const browser = await chromium.launch();
const rijen = [];
let gevonden = false;

for (const viewport of VIEWPORTS) {
  for (const pad of PAGINAS) {
    // Elke pagina in een schone context: geen cookies of opslag van een eerdere pagina.
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
    const page = await context.newPage();

    const setCookieHeaders = [];
    const derdePartijen = new Set();
    page.on('response', async (response) => {
      try {
        const headers = await response.allHeaders();
        if (headers['set-cookie']) setCookieHeaders.push(`${response.url()}: ${headers['set-cookie']}`);
      } catch {
        /* response al weg (redirect of afgebroken verzoek) */
      }
    });
    page.on('request', (request) => {
      const url = new URL(request.url());
      if (url.protocol === 'data:' || url.protocol === 'blob:') return;
      if (url.host !== EIGEN_HOST) derdePartijen.add(url.host);
    });

    const antwoord = await page.goto(BASE_URL + pad, { waitUntil: 'networkidle' });
    await scrollDoor(page);
    await page.waitForLoadState('networkidle');

    const pagina = await page.evaluate(() => ({
      documentCookie: document.cookie,
      localStorage: Object.keys(window.localStorage),
      sessionStorage: Object.keys(window.sessionStorage),
      // Externe scripts en Vercel-analytics of speed-insights (script-src of verwijzing naar /_vercel/insights of /_vercel/speed-insights).
      scriptSrc: [...document.querySelectorAll('script[src]')].map((script) => script.getAttribute('src')),
      analytics: [...document.querySelectorAll('script')].some((script) =>
        /_vercel\/(insights|speed-insights)|va\.vercel-scripts|@vercel\/analytics|@vercel\/speed-insights/.test(
          (script.getAttribute('src') ?? '') + (script.textContent ?? ''),
        ),
      ),
      iframes: document.querySelectorAll('iframe').length,
    }));
    const contextCookies = (await context.cookies()).map((cookie) => cookie.name);

    const rij = {
      pagina: pad,
      scherm: viewport.naam,
      status: antwoord?.status(),
      documentCookie: pagina.documentCookie || '-',
      contextCookies: contextCookies.length ? contextCookies.join(', ') : '-',
      setCookieHeaders: setCookieHeaders.length,
      localStorage: pagina.localStorage.length ? pagina.localStorage.join(', ') : '-',
      sessionStorage: pagina.sessionStorage.length ? pagina.sessionStorage.join(', ') : '-',
      derdePartijen: derdePartijen.size ? [...derdePartijen].join(', ') : '-',
      analytics: pagina.analytics ? 'JA' : 'nee',
      externeScripts: pagina.scriptSrc.filter((src) => /^https?:\/\//.test(src) && new URL(src).host !== EIGEN_HOST).join(', ') || '-',
      iframes: pagina.iframes,
    };
    if (setCookieHeaders.length) rij.setCookieDetail = setCookieHeaders;
    rijen.push(rij);

    if (
      rij.documentCookie !== '-' ||
      rij.contextCookies !== '-' ||
      rij.setCookieHeaders > 0 ||
      rij.localStorage !== '-' ||
      rij.sessionStorage !== '-' ||
      rij.derdePartijen !== '-' ||
      rij.analytics === 'JA' ||
      rij.externeScripts !== '-' ||
      rij.iframes > 0 ||
      (rij.status !== 200 && rij.status !== undefined)
    ) {
      gevonden = true;
    }
    await context.close();
  }
}
await browser.close();
eigenServer?.server.close();

console.table(
  rijen.map(({ setCookieDetail, ...rest }) => rest),
);
for (const rij of rijen) {
  if (rij.setCookieDetail) console.log(`Set-Cookie op ${rij.pagina} (${rij.scherm}):`, rij.setCookieDetail);
}

console.log(
  gevonden
    ? '\nGEVONDEN: er is iets gevonden (of een pagina gaf geen 200). Laat GEEN_COOKIES_GEMETEN op false (src/data/privacy.ts).'
    : '\nNiets gevonden: geen cookies, geen opslag in de browser, geen verzoeken aan andere hosts, geen analytics. GEEN_COOKIES_GEMETEN mag op true.',
);
process.exit(gevonden ? 1 : 0);

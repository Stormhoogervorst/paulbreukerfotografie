// Meet of een <link rel="preload" as="image" imagesrcset imagesizes> de LCP van een pagina meetbaar verbetert.
// Per pagina: mobiel (390 px, devicePixelRatio 2), CPU 4x vertraagd, netwerk "slow 4G" (1,6 Mbit/s, 150 ms), zonder cache.
// Variant A = de pagina zoals ze is; variant B = dezelfde pagina met een preload-link voor het LCP-beeld, in de <head>
// ingevoegd door deze test (de site zelf wordt niet aangepast). De runs wisselen elkaar af, zodat drift de uitkomst niet kleurt.
// Gebruik: npm run build, npm run preview (tweede terminal), daarna node scripts/meet-lcp.mjs
// Optioneel: BASE_URL=http://localhost:4321, PAGINAS=/,/series, RUNS=10
import { chromium } from 'playwright';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:4321';
const PAGINAS = process.env.PAGINAS ? process.env.PAGINAS.split(',') : ['/', '/fotograaf-bruiloft', '/portretfotos', '/love-marriage', '/series'];
const RUNS = Number(process.env.RUNS ?? 10);

const mediaan = (lijst) => {
  const gesorteerd = [...lijst].sort((a, b) => a - b);
  const m = Math.floor(gesorteerd.length / 2);
  return gesorteerd.length % 2 ? gesorteerd[m] : (gesorteerd[m - 1] + gesorteerd[m]) / 2;
};
const gemiddelde = (lijst) => lijst.reduce((som, x) => som + x, 0) / lijst.length;

const escapeAttr = (waarde) => waarde.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

/** Bouwt de preload-link uit het eerste beeld met fetchpriority="high" (het LCP-beeld): AVIF-bron als die er is. */
function preloadLink(html) {
  const img = html.match(/<img\b[^>]*fetchpriority="high"[^>]*>/i);
  if (!img) return null;
  const voor = html.slice(0, img.index);
  const pictureStart = voor.lastIndexOf('<picture');
  const stuk = pictureStart === -1 ? '' : html.slice(pictureStart, img.index);
  const bron = stuk.match(/<source\b[^>]*type="image\/avif"[^>]*>/i)?.[0];
  const tag = bron ?? img[0];
  const srcset = tag.match(/\bsrcset="([^"]+)"/i)?.[1];
  const sizes = tag.match(/\bsizes="([^"]+)"/i)?.[1] ?? '100vw';
  if (!srcset) return null;
  const type = bron ? ' type="image/avif"' : '';
  return `<link rel="preload" as="image"${type} imagesrcset="${escapeAttr(srcset)}" imagesizes="${escapeAttr(sizes)}" fetchpriority="high">`;
}

async function meetEenRun(browser, pad, metPreload) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 150,
    downloadThroughput: (1.6 * 1024 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
  });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });

  // Beide varianten lopen via dezelfde route-onderschepping (route.fetch buiten de netwerkthrottling om), anders heeft de variant
  // met onderschepping een voorsprong van de latency van het HTML-document en lijkt een preload sneller dan hij is.
  // A: bestaande preload-links voor afbeeldingen weggehaald. B: precies één preload-link, direct na <meta name="generator">.
  let link = null;
  await page.route(`${BASE_URL}${pad}`, async (route) => {
    const response = await route.fetch();
    let html = await response.text();
    html = html.replace(/<link\b[^>]*rel="preload"[^>]*as="image"[^>]*>/gi, (bestaand) => {
      link ??= bestaand;
      return '';
    });
    if (metPreload) {
      const nieuw = link ?? preloadLink(html);
      link = nieuw;
      if (nieuw) html = html.replace(/(<meta name="generator"[^>]*>)/i, (kop) => `${kop}${nieuw}`);
    } else {
      link = null;
    }
    await route.fulfill({ response, body: html });
  });

  await page.addInitScript(() => {
    window.__lcp = { tijd: 0, element: '' };
    new PerformanceObserver((lijst) => {
      const laatste = lijst.getEntries().at(-1);
      if (laatste) {
        window.__lcp = {
          tijd: laatste.startTime,
          element: `${laatste.element?.tagName ?? '?'}${laatste.url ? ' ' + laatste.url.split('/').pop().slice(0, 40) : ''}`,
        };
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  });
  await page.goto(`${BASE_URL}${pad}`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForTimeout(1500);
  // LCP wordt pas definitief na interactie of zichtbaarheidswijziging; de laatste waarde na 'load' + 1,5 s is hier voldoende.
  const lcp = await page.evaluate(() => window.__lcp);
  await context.close();
  return { ...lcp, link: Boolean(link) };
}

const browser = await chromium.launch();
const rijen = [];
for (const pad of PAGINAS) {
  const zonder = [];
  const met = [];
  let element = '';
  let linkGemaakt = false;
  for (let i = 0; i < RUNS; i += 1) {
    const a = await meetEenRun(browser, pad, false);
    const b = await meetEenRun(browser, pad, true);
    zonder.push(a.tijd);
    met.push(b.tijd);
    element = a.element;
    linkGemaakt = linkGemaakt || b.link;
  }
  const verschil = mediaan(zonder) - mediaan(met);
  rijen.push({
    pagina: pad,
    lcpElement: element,
    linkGevonden: linkGemaakt,
    zonderMediaan: Math.round(mediaan(zonder)),
    metMediaan: Math.round(mediaan(met)),
    zonderGem: Math.round(gemiddelde(zonder)),
    metGem: Math.round(gemiddelde(met)),
    winstMs: Math.round(verschil),
    spreiding: `${Math.round(Math.min(...zonder))}-${Math.round(Math.max(...zonder))} / ${Math.round(Math.min(...met))}-${Math.round(Math.max(...met))}`,
  });
  console.log(JSON.stringify(rijen.at(-1)));
}
await browser.close();
console.table(rijen);

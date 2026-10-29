// Mobiele laadmeting per pagina: LCP (tijd en element), CLS, aantal verzoeken en overdracht (totaal en alleen afbeeldingen).
// Instellingen: 390 × 844 px, devicePixelRatio 2, CPU 4× vertraagd, netwerk "Fast 4G" (zoals DevTools: 9 Mbit/s omlaag,
// 1,5 Mbit/s omhoog, 165 ms vertraging), zonder cache. Elke run opent een nieuwe browsercontext. De mediaan van RUNS runs telt.
// Meting stopt 2 s na het load-event; er wordt niet gescrold (alleen wat bij het openen laadt).
// Gebruik: npm run build, node scripts/serveer-build.mjs (andere terminal), daarna
//   BASE_URL=http://127.0.0.1:4322 node scripts/meet-prestatie.mjs
// Optioneel: PAGINAS=/,/series  RUNS=5  UIT=pad/naar/bestand.json (resultaten als JSON)
import { writeFileSync } from 'node:fs';
import { chromium } from 'playwright';

const BASE_URL = process.env.BASE_URL ?? 'http://127.0.0.1:4322';
const PAGINAS = process.env.PAGINAS
  ? process.env.PAGINAS.split(',')
  : ['/', '/fotograaf-bruiloft', '/portretfotos', '/series', '/love-marriage', '/portfolio', '/portfolio/portretten'];
const RUNS = Number(process.env.RUNS ?? 5);

const mediaan = (lijst) => {
  const gesorteerd = [...lijst].sort((a, b) => a - b);
  const m = Math.floor(gesorteerd.length / 2);
  return gesorteerd.length % 2 ? gesorteerd[m] : (gesorteerd[m - 1] + gesorteerd[m]) / 2;
};

async function eenRun(browser, pad) {
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
    latency: 165,
    downloadThroughput: (9 * 1024 * 1024) / 8,
    uploadThroughput: (1.5 * 1024 * 1024) / 8,
  });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });

  const typen = new Map();
  let verzoeken = 0;
  let bytes = 0;
  let beeldVerzoeken = 0;
  let beeldBytes = 0;
  cdp.on('Network.requestWillBeSent', (e) => typen.set(e.requestId, e.type));
  cdp.on('Network.loadingFinished', (e) => {
    verzoeken += 1;
    bytes += e.encodedDataLength;
    if (typen.get(e.requestId) === 'Image') {
      beeldVerzoeken += 1;
      beeldBytes += e.encodedDataLength;
    }
  });

  await page.addInitScript(() => {
    window.__meting = { lcp: 0, element: '', cls: 0 };
    new PerformanceObserver((lijst) => {
      const laatste = lijst.getEntries().at(-1);
      if (laatste) {
        const el = laatste.element;
        const url = laatste.url ? decodeURIComponent(laatste.url.split('/').pop() ?? '').slice(0, 50) : '';
        window.__meting.lcp = laatste.startTime;
        window.__meting.element = `${el?.tagName?.toLowerCase() ?? '?'}${url ? ` ${url}` : ''}`;
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((lijst) => {
      for (const entry of lijst.getEntries()) if (!entry.hadRecentInput) window.__meting.cls += entry.value;
    }).observe({ type: 'layout-shift', buffered: true });
  });

  await page.goto(`${BASE_URL}${pad}`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForTimeout(2000);
  const meting = await page.evaluate(() => window.__meting);
  await context.close();
  return { ...meting, verzoeken, kb: bytes / 1024, beeldVerzoeken, beeldKb: beeldBytes / 1024 };
}

const browser = await chromium.launch();
const rijen = [];
for (const pad of PAGINAS) {
  const runs = [];
  for (let i = 0; i < RUNS; i += 1) runs.push(await eenRun(browser, pad));
  const rij = {
    pagina: pad,
    lcpMs: Math.round(mediaan(runs.map((r) => r.lcp))),
    lcpSpreiding: `${Math.round(Math.min(...runs.map((r) => r.lcp)))}-${Math.round(Math.max(...runs.map((r) => r.lcp)))}`,
    lcpElement: runs[Math.floor(runs.length / 2)].element,
    cls: Number(mediaan(runs.map((r) => r.cls)).toFixed(4)),
    verzoeken: Math.round(mediaan(runs.map((r) => r.verzoeken))),
    kb: Math.round(mediaan(runs.map((r) => r.kb))),
    beeldVerzoeken: Math.round(mediaan(runs.map((r) => r.beeldVerzoeken))),
    beeldKb: Math.round(mediaan(runs.map((r) => r.beeldKb))),
  };
  rijen.push(rij);
  console.log(JSON.stringify(rij));
}
await browser.close();
console.table(rijen);
if (process.env.UIT) writeFileSync(process.env.UIT, JSON.stringify(rijen, null, 2));

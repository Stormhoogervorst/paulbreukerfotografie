// Meet de afbeeldingsverzoeken en de overdracht van het foto-canvas: pagina laden, daarna 20 seconden slepen.
// Gebruik: npm run build, npm run preview (tweede terminal), daarna
//   node scripts/meet-canvas.mjs                      (alle pagina's, desktop en mobiel)
//   PAGINA=/portfolio APPARAAT=desktop node scripts/meet-canvas.mjs
// Optioneel: BASE_URL=http://localhost:4321, SLEEP_SECONDEN=20.
// De overdracht komt uit CDP (`Network.loadingFinished`: encodedDataLength, dus bytes over de lijn, zonder cache). Bij het openen
// staat de afbeeldingsoverdracht apart van de totale overdracht (HTML met de fotolijst, CSS, JS en lettertype).
// Lege tegels: tijdens het slepen telt een sampler in de pagina elke 100 ms de tegels die (deels) in beeld staan zonder
// geladen afbeelding (gemiddelde kleur zonder foto). Uitkomst: maximum, 95e percentiel en gemiddelde over de samples.
import { chromium, devices } from 'playwright';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:4321';
const PAGINAS = process.env.PAGINA ? [process.env.PAGINA] : ['/portfolio', '/portfolio/portretten', '/portfolio/bruiloften'];
const SLEEP_MS = Number(process.env.SLEEP_SECONDEN ?? 20) * 1000;

const apparaten = [
  { naam: 'desktop', context: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }, touch: false },
  { naam: 'mobiel', context: { ...devices['Pixel 7'] }, touch: true },
].filter((a) => a.naam.includes(process.env.APPARAAT ?? ''));

const wacht = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function meetPagina(browser, pad, apparaat) {
  const context = await browser.newContext(apparaat.context);
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });

  const typen = new Map();
  const verzoeken = [];
  let totaalBytes = 0;
  cdp.on('Network.requestWillBeSent', (e) => typen.set(e.requestId, { type: e.type, url: e.request.url, t: Date.now() }));
  cdp.on('Network.loadingFinished', (e) => {
    const info = typen.get(e.requestId);
    totaalBytes += e.encodedDataLength;
    if (info?.type === 'Image') verzoeken.push({ url: info.url, bytes: e.encodedDataLength, t: Date.now() });
  });

  const start = Date.now();
  await page.goto(`${BASE_URL}${pad}`, { waitUntil: 'load' });
  await page.waitForSelector('[data-portfolio][data-ready]', { timeout: 15000 });
  // Zichtbaar canvas: eerste tegel met geladen afbeelding.
  await page.waitForFunction(() => document.querySelector('.portfolio__tile.is-loaded'), null, { timeout: 15000 });
  const tijdTotBruikbaar = Date.now() - start;
  await wacht(2500); // rust: eerste schermvulling en eventuele vervolglading
  const naLaden = { verzoeken: verzoeken.length, bytes: verzoeken.reduce((som, v) => som + v.bytes, 0), totaal: totaalBytes };

  const zichtbaar = await page.evaluate(() => {
    const c = document.querySelector('.portfolio__canvas').getBoundingClientRect();
    return [...document.querySelectorAll('.portfolio__tile')].filter((el) => {
      const r = el.getBoundingClientRect();
      return r.right > c.left && r.left < c.right && r.bottom > c.top && r.top < c.bottom;
    }).length;
  });
  const zichtbaarGeladen = await page.evaluate(() => {
    const c = document.querySelector('.portfolio__canvas').getBoundingClientRect();
    return [...document.querySelectorAll('.portfolio__tile')].filter((el) => {
      const r = el.getBoundingClientRect();
      return r.right > c.left && r.left < c.right && r.bottom > c.top && r.top < c.bottom && el.classList.contains('is-loaded');
    }).length;
  });

  // 20 seconden slepen: afwisselend naar links, boven, rechts en onder, met korte pauzes (inertie uitgeschakeld door
  // vasthouden voor loslaten).
  const middelpunt = await page.evaluate(() => {
    const r = document.querySelector('.portfolio__canvas').getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height * 0.4 };
  });
  const richtingen = [
    [-1, 0],
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, -1],
    [1, -1],
  ];
  await page.evaluate(() => {
    const leeg = (window.__leeg = { samples: [] });
    const telLeeg = () => {
      const c = document.querySelector('.portfolio__canvas').getBoundingClientRect();
      let n = 0;
      for (const el of document.querySelectorAll('.portfolio__tile')) {
        const r = el.getBoundingClientRect();
        if (r.right > c.left && r.left < c.right && r.bottom > c.top && r.top < c.bottom && !el.classList.contains('is-loaded')) n += 1;
      }
      leeg.samples.push(n);
    };
    leeg.timer = setInterval(telLeeg, 100);
  });
  const sleepStart = Date.now();
  let afstand = 0;
  let nr = 0;
  const fouten = [];
  page.on('pageerror', (fout) => fouten.push(fout.message));
  while (Date.now() - sleepStart < SLEEP_MS) {
    const [rx, ry] = richtingen[nr % richtingen.length];
    nr += 1;
    const lengte = apparaat.touch ? 250 : 500;
    const dx = rx * lengte;
    const dy = ry * lengte;
    const stappen = 12;
    if (apparaat.touch) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: middelpunt.x - dx / 2, y: middelpunt.y - dy / 2 }] });
      for (let i = 1; i <= stappen; i += 1) {
        await cdp.send('Input.dispatchTouchEvent', {
          type: 'touchMove',
          touchPoints: [{ x: middelpunt.x - dx / 2 + (dx * i) / stappen, y: middelpunt.y - dy / 2 + (dy * i) / stappen }],
        });
        await wacht(16);
      }
      await wacht(120);
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    } else {
      await page.mouse.move(middelpunt.x - dx / 2, middelpunt.y - dy / 2);
      await page.mouse.down();
      for (let i = 1; i <= stappen; i += 1) {
        await page.mouse.move(middelpunt.x - dx / 2 + (dx * i) / stappen, middelpunt.y - dy / 2 + (dy * i) / stappen);
        await wacht(16);
      }
      await wacht(120);
      await page.mouse.up();
    }
    afstand += Math.hypot(dx, dy);
    await wacht(500);
  }
  await wacht(1500);
  const leegSamples = await page.evaluate(() => {
    clearInterval(window.__leeg.timer);
    return window.__leeg.samples;
  });
  const gesorteerd = [...leegSamples].sort((a, b) => a - b);
  const leeg = {
    max: gesorteerd.at(-1) ?? 0,
    p95: gesorteerd[Math.min(gesorteerd.length - 1, Math.floor(gesorteerd.length * 0.95))] ?? 0,
    gem: Number((leegSamples.reduce((som, n) => som + n, 0) / Math.max(1, leegSamples.length)).toFixed(2)),
    samplesMetMeerDan2: leegSamples.filter((n) => n > 2).length,
    samples: leegSamples.length,
  };

  const naSleep = { verzoeken: verzoeken.length, bytes: verzoeken.reduce((som, v) => som + v.bytes, 0) };

  // Lightbox: klik op een foto in beeld; daarna mogen alleen de grote versie van die foto en van de vorige en volgende laden.
  const grote = await page.evaluate(() => {
    const payload = JSON.parse(document.getElementById('portfolio-data').textContent);
    const urls = [];
    for (const foto of payload.photos) {
      for (const srcset of [foto.largeSrcset]) {
        for (const kandidaat of (srcset || '').split(',')) urls.push(kandidaat.trim().split(' ')[0]);
      }
    }
    return urls;
  });
  const groteVerzoeken = () => verzoeken.filter((v) => grote.some((u) => v.url.endsWith(u))).length;
  const voorLightbox = groteVerzoeken();
  const doel = await page.evaluate(() => {
    const c = document.querySelector('.portfolio__canvas').getBoundingClientRect();
    const o = document.querySelector('.portfolio__overlay').getBoundingClientRect();
    for (const el of document.querySelectorAll('.portfolio__tile')) {
      const r = el.getBoundingClientRect();
      if (r.left > c.left + 10 && r.right < c.right - 10 && r.top > 80 && r.bottom < o.top - 10 && r.width > 30) {
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
    }
    return null;
  });
  let lightbox = 'geen foto om op te klikken';
  if (doel) {
    if (apparaat.touch) await page.touchscreen.tap(doel.x, doel.y);
    else await page.mouse.click(doel.x, doel.y);
    await page.waitForSelector('.lightbox__stage.is-ready', { timeout: 15000 }).catch(() => {});
    await wacht(2000);
    const naOpenen = groteVerzoeken() - voorLightbox;
    await page.keyboard.press('ArrowRight');
    await wacht(2500);
    const naVolgende = groteVerzoeken() - voorLightbox;
    lightbox = `na openen ${naOpenen} grote bestanden (huidige + vorige + volgende), na "volgende" ${naVolgende}`;
  }

  const vervolg = { verzoeken: naSleep.verzoeken - naLaden.verzoeken, bytes: naSleep.bytes - naLaden.bytes };
  const tegels = await page.evaluate(() => ({
    dom: document.querySelectorAll('.portfolio__tile').length,
    max: Number(document.querySelector('[data-portfolio]').dataset.maxMounted),
  }));
  const kb = (bytes) => Math.round(bytes / 1024);
  const uit = {
    pagina: pad,
    apparaat: apparaat.naam,
    bruikbaarMs: tijdTotBruikbaar,
    zichtbaar: `${zichtbaarGeladen}/${zichtbaar} geladen`,
    laden: `${naLaden.verzoeken} verzoeken, ${kb(naLaden.bytes)} KB afbeeldingen (${kb(naLaden.totaal)} KB totaal)`,
    ladenMB: Number((naLaden.bytes / 1048576).toFixed(2)),
    leegTegels: `max ${leeg.max}, p95 ${leeg.p95}, gem ${leeg.gem}; ${leeg.samplesMetMeerDan2}/${leeg.samples} samples met meer dan 2`,
    slepen: `${vervolg.verzoeken} verzoeken, ${kb(vervolg.bytes)} KB (${Math.round(afstand)} px in ${Math.round((Date.now() - sleepStart) / 1000)} s)`,
    totaal: `${naSleep.verzoeken} verzoeken, ${kb(naSleep.bytes)} KB`,
    gemiddeldKB: naSleep.verzoeken ? Math.round(naSleep.bytes / naSleep.verzoeken / 1024) : 0,
    maxTegelsInDom: tegels.max,
    lightbox,
    fouten: fouten.length,
  };
  await context.close();
  return uit;
}

const browser = await chromium.launch();
const rijen = [];
for (const pad of PAGINAS) {
  for (const apparaat of apparaten) {
    const rij = await meetPagina(browser, pad, apparaat);
    rijen.push(rij);
    console.log(JSON.stringify(rij));
  }
}
await browser.close();
console.table(rijen);

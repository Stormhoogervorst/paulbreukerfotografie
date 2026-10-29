// Controleert het oneindige canvas op /portfolio (en met PAGINA=/portfolio/portretten op de portretten-galerij) in WebKit
// (iPhone 14), Chromium (Pixel 7) en Chromium desktop (1440 × 900).
// Gebruik: npm run build, npm run preview (in een tweede terminal), daarna node scripts/portfolio-test.mjs
// Optioneel: BASE_URL=http://localhost:4321 node scripts/portfolio-test.mjs, PAGINA=/portfolio/portretten
import { chromium, devices, webkit } from 'playwright';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:4321';
const PAGINA = process.env.PAGINA ?? '/portfolio';
const URL_PORTFOLIO = `${BASE_URL}${PAGINA}`;
/** /portfolio/portretten: alle foto's staan als <img> in de HTML (geen noscript-raster) en hebben geen serietitel. */
const GALERIJ = PAGINA === '/portfolio/portretten';
const H1 = GALERIJ ? 'Portretten' : 'Portfolio';
const MAX_BYTES_MOBIEL = 1.5 * 1024 * 1024; // eerste laadronde op 390 px (alleen galerij)
const MAX_NODES = 150; // gelijk aan MAX_NODES in src/scripts/foto-canvas.ts: daar worden tegels op afstand tot het midden afgekapt, dus precies 150 is toegestaan
const MIN_VISIBLE = GALERIJ ? 10 : 12; // /portfolio: gemengde liggende en staande foto's (was 15 met alleen de oude, bijna alleen liggende foto's); /portfolio/portretten: staande tegels van 150 × 210
const LANGE_SLEEP = 20000; // px in totaal
const VUL_AFSTAND = 150; // px: meetpunt telt als "gevuld" binnen deze afstand van een foto
const VUL_MINIMUM = 0.6;

const alleApparaten = [
  { naam: 'iPhone 14 (WebKit)', browserType: webkit, device: devices['iPhone 14'], touch: 'synthetisch', mobiel: true },
  { naam: 'Pixel 7 (Chromium)', browserType: chromium, device: devices['Pixel 7'], touch: 'cdp', mobiel: true },
  {
    naam: 'Desktop 1440 × 900 (Chromium)',
    browserType: chromium,
    device: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
    touch: null,
  },
];
// Optioneel: APPARAAT=pixel (deel van de naam, hoofdletterongevoelig) om één apparaat te draaien.
const apparaten = alleApparaten.filter((a) =>
  a.naam.toLowerCase().includes((process.env.APPARAAT ?? '').toLowerCase()),
);

const rijen = [];
let mislukt = false;
const wacht = (page, ms) => page.waitForTimeout(ms);

const oordeel = (ok, tekst) => {
  if (!ok) mislukt = true;
  return `${ok ? 'OK' : 'FOUT'} ${tekst}`;
};

function verzamelFouten(page) {
  const fouten = [];
  page.on('pageerror', (fout) => fouten.push(fout.message));
  page.on('console', (bericht) => {
    if (bericht.type() === 'error') fouten.push(bericht.text());
  });
  return fouten;
}

function meetBeelden(page) {
  const stand = { verzoeken: 0, bytes: 0, wachtrij: [] };
  page.on('requestfinished', (request) => {
    if (request.resourceType() !== 'image') return;
    stand.verzoeken += 1;
    stand.wachtrij.push(
      request
        .sizes()
        .then((s) => {
          stand.bytes += s.responseBodySize + s.responseHeadersSize;
        })
        .catch(() => {}),
    );
  });
  return stand;
}

/** Offset van de wereld-container (translate3d). */
const offset = (page) =>
  page.evaluate(() => {
    const m = new DOMMatrixReadOnly(getComputedStyle(document.querySelector('.portfolio__world')).transform);
    return { x: m.m41, y: m.m42 };
  });

/** Wacht tot uitloop en uitgestelde aanmeldingen klaar zijn. */
async function wachtOpRust(page, max = 8000) {
  const start = Date.now();
  let vorige = null;
  let stabiel = 0;
  while (Date.now() - start < max) {
    const nu = await page.evaluate(() => ({
      t: getComputedStyle(document.querySelector('.portfolio__world')).transform,
      bezig: document.querySelector('[data-portfolio]').hasAttribute('data-moving'),
    }));
    stabiel = !nu.bezig && vorige === nu.t ? stabiel + 1 : 0;
    if (stabiel >= 3) return;
    vorige = nu.t;
    await wacht(page, 50);
  }
}

/** Aantal foto-elementen, aantal zichtbaar en het gemeten maximum. */
const telling = (page) =>
  page.evaluate(() => {
    const canvas = document.querySelector('.portfolio__canvas').getBoundingClientRect();
    const tegels = [...document.querySelectorAll('.portfolio__tile')];
    const zichtbaar = tegels.filter((el) => {
      const r = el.getBoundingClientRect();
      return r.right > canvas.left && r.left < canvas.right && r.bottom > canvas.top && r.top < canvas.bottom;
    }).length;
    const root = document.querySelector('[data-portfolio]');
    return {
      dom: tegels.length,
      zichtbaar,
      max: Number(root.dataset.maxMounted),
      tegel: root.dataset.tile,
      plaatsen: Number(root.dataset.places),
    };
  });

/** Volgt aan- en afmeldingen van foto's. */
const startTeller = (page) =>
  page.evaluate(() => {
    window.__teller = { bij: 0, af: 0 };
    new MutationObserver((lijst) => {
      for (const m of lijst) {
        window.__teller.bij += [...m.addedNodes].filter((n) => n.classList?.contains('portfolio__tile')).length;
        window.__teller.af += [...m.removedNodes].filter((n) => n.classList?.contains('portfolio__tile')).length;
      }
    }).observe(document.querySelector('.portfolio__world'), { childList: true });
  });
const leesTeller = (page) => page.evaluate(() => window.__teller);

/** Midden van het canvas, boven de overlay. */
const middelpunt = (page) =>
  page.evaluate(() => {
    const r = document.querySelector('.portfolio__canvas').getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height * 0.4 };
  });

/**
 * Sleept van (x, y) over (dx, dy) in `stappen` stappen.
 * Desktop: muis. Pixel 7: CDP-touch. iPhone/WebKit: synthetische PointerEvents (pointerType touch),
 * omdat Playwright in WebKit geen CDP en geen sleepbare touchscreen-API heeft.
 */
async function sleep(page, ctx, x, y, dx, dy, { stappen = 10, pauzeVoorLos = 0, stapMs = 16 } = {}) {
  if (ctx.touch === 'cdp') {
    const cdp = ctx.cdp;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    for (let i = 1; i <= stappen; i += 1) {
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: x + (dx * i) / stappen, y: y + (dy * i) / stappen }],
      });
      await wacht(page, stapMs);
    }
    if (pauzeVoorLos) await wacht(page, pauzeVoorLos);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  } else if (ctx.touch === 'synthetisch') {
    await page.evaluate(
      async ({ x, y, dx, dy, stappen, pauzeVoorLos, stapMs }) => {
        const canvas = document.querySelector('.portfolio__canvas');
        const basis = { bubbles: true, cancelable: true, pointerId: 42, pointerType: 'touch', isPrimary: true };
        const doel = document.elementFromPoint(x, y) ?? canvas;
        doel.dispatchEvent(new PointerEvent('pointerdown', { ...basis, clientX: x, clientY: y, buttons: 1 }));
        for (let i = 1; i <= stappen; i += 1) {
          await new Promise((r) => setTimeout(r, stapMs));
          canvas.dispatchEvent(
            new PointerEvent('pointermove', {
              ...basis,
              clientX: x + (dx * i) / stappen,
              clientY: y + (dy * i) / stappen,
              buttons: 1,
            }),
          );
        }
        if (pauzeVoorLos) await new Promise((r) => setTimeout(r, pauzeVoorLos));
        canvas.dispatchEvent(new PointerEvent('pointerup', { ...basis, clientX: x + dx, clientY: y + dy }));
      },
      { x, y, dx, dy, stappen, pauzeVoorLos, stapMs },
    );
  } else {
    await page.mouse.move(x, y);
    await page.mouse.down();
    for (let i = 1; i <= stappen; i += 1) {
      await page.mouse.move(x + (dx * i) / stappen, y + (dy * i) / stappen);
      await wacht(page, stapMs);
    }
    if (pauzeVoorLos) await wacht(page, pauzeVoorLos);
    await page.mouse.up();
  }
}

/** Tik of klik op (x, y). */
async function tik(page, ctx, x, y) {
  if (ctx.touch) await page.touchscreen.tap(x, y);
  else await page.mouse.click(x, y);
}

/** Een foto die volledig in beeld staat (boven de overlay) en bij een bekende serie hoort. */
const kiesFoto = (page) =>
  page.evaluate(() => {
    const payload = JSON.parse(document.getElementById('portfolio-data').textContent);
    const data = Array.isArray(payload) ? payload : payload.photos;
    const metTitel = !data.every((foto) => !foto.title);
    const canvas = document.querySelector('.portfolio__canvas').getBoundingClientRect();
    const overlay = document.querySelector('.portfolio__overlay').getBoundingClientRect();
    const nav = document.querySelector('.portfolio__nav').getBoundingClientRect();
    const home = { bottom: nav.bottom };
    for (const el of document.querySelectorAll('.portfolio__tile')) {
      const r = el.getBoundingClientRect();
      const foto = data[Number(el.dataset.index)];
      const binnen =
        r.left > canvas.left + 10 &&
        r.right < canvas.right - 10 &&
        r.top > home.bottom + 10 &&
        r.bottom < overlay.top - 10;
      if (binnen && (foto.title || !metTitel) && r.width > 30 && r.height > 30) {
        el.dataset.testDoel = '';
        return { x: r.left + r.width / 2, y: r.top + r.height / 2, titel: foto.title };
      }
    }
    return null;
  });

const dialogStand = (page) =>
  page.evaluate(() => {
    const dialog = document.querySelector('.lightbox');
    return {
      open: dialog.open,
      titel: dialog.querySelector('.lightbox__series')?.textContent?.trim() ?? null,
      focusTerug: document.activeElement?.hasAttribute('data-test-doel') ?? false,
    };
  });

/** 5 × 5 meetpunten: aandeel binnen of nabij (VUL_AFSTAND px) een foto. */
const vulgraad = (page, afstand) =>
  page.evaluate((afstand) => {
    const c = document.querySelector('.portfolio__canvas').getBoundingClientRect();
    const rects = [...document.querySelectorAll('.portfolio__tile')].map((el) => el.getBoundingClientRect());
    let raak = 0;
    for (let i = 0; i < 5; i += 1) {
      for (let j = 0; j < 5; j += 1) {
        const x = c.left + ((i + 0.5) / 5) * c.width;
        const y = c.top + ((j + 0.5) / 5) * c.height;
        const dichtbij = rects.some((r) => {
          const dx = Math.max(r.left - x, 0, x - r.right);
          const dy = Math.max(r.top - y, 0, y - r.bottom);
          return Math.hypot(dx, dy) <= afstand;
        });
        if (dichtbij) raak += 1;
      }
    }
    return raak / 25;
  }, afstand);

async function nieuweContext(browser, device, opties = {}) {
  const context = await browser.newContext({ ...device, ...opties });
  const page = await context.newPage();
  return { context, page };
}

for (const apparaat of apparaten) {
  const { naam, browserType, device } = apparaat;
  const browser = await browserType.launch();
  const r = { apparaat: naam };
  const fouten = [];

  // ---------- Laden, slepen, klikken, toetsenbord (beweging aan) ----------
  {
    const { context, page } = await nieuweContext(browser, device, { reducedMotion: 'no-preference' });
    const ctx = { touch: apparaat.touch, cdp: apparaat.touch === 'cdp' ? await context.newCDPSession(page) : null };
    fouten.push(...[verzamelFouten(page)]);
    const beelden = meetBeelden(page);
    await page.goto(URL_PORTFOLIO, { waitUntil: 'load' });
    const eersteScherm = await page.evaluate(
      () =>
        new Promise((resolve) => {
          const c = document.querySelector('.portfolio__canvas').getBoundingClientRect();
          const check = () => {
            const inBeeld = [...document.querySelectorAll('.portfolio__tile')].filter((el) => {
              const r = el.getBoundingClientRect();
              return r.right > c.left && r.left < c.right && r.bottom > c.top && r.top < c.bottom;
            });
            if (inBeeld.length && inBeeld.every((el) => el.classList.contains('is-loaded'))) {
              resolve(Math.round(performance.now()));
            } else requestAnimationFrame(check);
          };
          check();
          setTimeout(() => resolve(-1), 10000);
        }),
    );
    await page.waitForLoadState('networkidle');
    await Promise.all(beelden.wachtrij);
    const t0 = await telling(page);
    r.laden = oordeel(
      t0.dom <= MAX_NODES && t0.zichtbaar >= MIN_VISIBLE,
      `${t0.dom} in DOM, ${t0.zichtbaar} zichtbaar (tegel ${t0.tegel}, ${t0.plaatsen} plaatsen)`,
    );
    r.beelden = `${beelden.verzoeken} verzoeken, ${(beelden.bytes / 1024 / 1024).toFixed(2)} MB (incl. vooraf ophalen); eerste scherm compleet na ${eersteScherm} ms`;
    if (eersteScherm < 0) r.beelden = oordeel(false, r.beelden);
    if (apparaat.mobiel) {
      r.beelden = oordeel(
        beelden.bytes <= MAX_BYTES_MOBIEL && eersteScherm >= 0,
        `${r.beelden} (maximaal ${(MAX_BYTES_MOBIEL / 1024 / 1024).toFixed(1)} MB)`,
      );
    }

    // Slepen
    await startTeller(page);
    const m = await middelpunt(page);
    const voor = await offset(page);
    await sleep(page, ctx, m.x, m.y, -260, -180, { stappen: 12 });
    await wachtOpRust(page);
    const na = await offset(page);
    const teller = await leesTeller(page);
    const verschoven = Math.hypot(na.x - voor.x, na.y - voor.y);
    r.slepen = oordeel(
      verschoven > 100 && teller.bij > 0 && teller.af > 0,
      `${verschoven.toFixed(0)} px, +${teller.bij}/−${teller.af} foto's`,
    );

    // Uitloop: na een vlotte sleep loopt het canvas door na loslaten.
    const losA = await offset(page);
    await sleep(page, ctx, m.x, m.y, -200, 0, { stappen: 6, stapMs: 16 });
    const losB = await offset(page);
    await wachtOpRust(page);
    const losC = await offset(page);
    r.uitloop = oordeel(Math.abs(losC.x - losB.x) > 5, `${(losC.x - losB.x).toFixed(0)} px na loslaten`);

    // Lange sleep: 20 000 px in stappen, daarna moet het beeld nog gevuld zijn.
    const stap = { dx: -400, dy: -300 }; // 500 px per sleep
    const aantal = Math.ceil(LANGE_SLEEP / Math.hypot(stap.dx, stap.dy));
    let maxDom = 0;
    for (let i = 0; i < aantal; i += 1) {
      const richting = i % 4 === 3 ? -1 : 1; // af en toe terug, zodat de route niet recht is
      await sleep(page, ctx, m.x, m.y, stap.dx * richting, stap.dy, { stappen: 5, stapMs: 8, pauzeVoorLos: 60 });
      if (i % 5 === 0) maxDom = Math.max(maxDom, (await telling(page)).dom);
    }
    await wachtOpRust(page);
    const ver = await offset(page);
    const vul = await vulgraad(page, VUL_AFSTAND);
    const tLang = await telling(page);
    maxDom = Math.max(maxDom, tLang.dom, tLang.max);
    r.langeSleep = oordeel(
      vul >= VUL_MINIMUM && maxDom <= MAX_NODES,
      `offset (${ver.x.toFixed(0)}, ${ver.y.toFixed(0)}), ${Math.round(vul * 100)}% gevuld, max ${maxDom} in DOM`,
    );
    r.maxDom = maxDom;

    // Klik versus sleep
    const doel = await kiesFoto(page);
    if (!doel) {
      r.klik = oordeel(false, 'geen geschikte foto in beeld');
    } else {
      await page.evaluate(() => {
        window.__pointerLog = [];
        for (const type of ['pointerdown', 'pointerup', 'pointercancel', 'click']) {
          document.addEventListener(
            type,
            (e) => window.__pointerLog.push(`${type}#${e.pointerId ?? ''}@${e.target.className}:${e.timeStamp.toFixed(0)}`),
            true,
          );
        }
      });
      await tik(page, ctx, doel.x, doel.y);
      await wacht(page, 400);
      const open = await dialogStand(page);
      if (!open.open) r.klikLog = await page.evaluate(() => window.__pointerLog.join(' '));
      await page.keyboard.press('Escape');
      await wacht(page, 200);
      const dicht = await dialogStand(page);

      const doel2 = await kiesFoto(page);
      await sleep(page, ctx, doel2.x, doel2.y, 30, 0, { stappen: 6, pauzeVoorLos: 80 });
      await wacht(page, 400);
      const naSleep = await dialogStand(page);
      if (naSleep.open) await page.keyboard.press('Escape');
      r.klik = oordeel(
        open.open && open.titel === doel.titel && !dicht.open && dicht.focusTerug && !naSleep.open,
        `klik: ${open.open ? `open, "${open.titel}"` : 'dicht'}; Esc: ${dicht.open ? 'open' : 'dicht'}, focus ${dicht.focusTerug ? 'terug' : 'niet terug'}; sleep 30 px: ${naSleep.open ? 'open' : 'dicht'}`,
      );
    }

    // Toetsenbord
    await page.evaluate(() => document.querySelector('.portfolio__canvas').focus());
    const k0 = await offset(page);
    await page.keyboard.press('ArrowRight');
    await wachtOpRust(page);
    const k1 = await offset(page);
    await page.keyboard.press('Shift+ArrowDown');
    await wachtOpRust(page);
    const k2 = await offset(page);
    await page.keyboard.press('Enter');
    await wacht(page, 300);
    const kOpen = await dialogStand(page);
    await page.keyboard.press('Escape');
    await wacht(page, 200);
    const kDicht = await dialogStand(page);
    r.toetsenbord = oordeel(
      Math.round(k0.x - k1.x) === 120 && Math.round(k1.y - k2.y) === 360 && kOpen.open && !kDicht.open,
      `→ ${(k1.x - k0.x).toFixed(0)} px, Shift+↓ ${(k2.y - k1.y).toFixed(0)} px, Enter ${kOpen.open ? 'opent' : 'opent niet'}, Esc ${kDicht.open ? 'sluit niet' : 'sluit'}`,
    );
    await context.close();
  }

  // ---------- Minder beweging ----------
  {
    const { context, page } = await nieuweContext(browser, device, { reducedMotion: 'reduce' });
    const ctx = { touch: apparaat.touch, cdp: apparaat.touch === 'cdp' ? await context.newCDPSession(page) : null };
    fouten.push(...[verzamelFouten(page)]);
    await page.goto(URL_PORTFOLIO, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.portfolio__tile');
    const fade = await page.evaluate(() =>
      [...document.querySelectorAll('.portfolio__tile img')].every((img) => {
        const s = getComputedStyle(img);
        return s.opacity === '1' && (s.transitionDuration === '0s' || s.transitionProperty === 'none');
      }),
    );
    const m = await middelpunt(page);
    await sleep(page, ctx, m.x, m.y, -200, 0, { stappen: 6, stapMs: 16 });
    await wacht(page, 50); // laatste beweging is pas na het volgende frame zichtbaar
    const a = await offset(page);
    await wacht(page, 500);
    const b = await offset(page);
    r.reduce = oordeel(
      fade && Math.abs(b.x - a.x) < 0.5,
      `fade-in ${fade ? 'uit (opacity 1)' : 'aan'}, ${(b.x - a.x).toFixed(1)} px na loslaten`,
    );
    await context.close();
  }

  // ---------- Zonder JavaScript ----------
  {
    const { context, page } = await nieuweContext(browser, device, { javaScriptEnabled: false });
    const foutenZonderJs = verzamelFouten(page);
    fouten.push(foutenZonderJs);
    const antwoord = await page.goto(URL_PORTFOLIO, { waitUntil: 'load' });
    const stand = await page.evaluate((galerij) => {
      const fotos = [...document.querySelectorAll('.portfolio__bron img')];
      const h1 = document.querySelector('h1');
      const rect = h1?.getBoundingClientRect();
      const eerste = fotos[0]?.getBoundingClientRect();
      return {
        h1: h1?.textContent?.trim(),
        h1Zichtbaar: Boolean(rect && rect.width > 0 && rect.height > 0),
        aantalH1: document.querySelectorAll('h1').length,
        fotos: fotos.length,
        fotoZichtbaar: Boolean(eerste && eerste.width > 20 && eerste.height > 20 && eerste.left >= 0),
        altOk: fotos.every((img) => img.alt.length > 0),
        werk: Boolean(document.querySelector(galerij ? '.portfolio__links a[href="/portretfotos"]' : '.portfolio__links a[href="/series"]')),
        geenHeader: document.querySelector('.site-header') === null,
        home: Boolean(document.querySelector('a.portfolio__home[href="/"]')),
      };
    }, GALERIJ);
    const fotosOk = stand.fotos >= 30 && stand.fotoZichtbaar;
    r.zonderJs = oordeel(
      antwoord?.ok() &&
        stand.h1 === H1 &&
        stand.h1Zichtbaar &&
        stand.aantalH1 === 1 &&
        fotosOk &&
        stand.altOk &&
        stand.werk &&
        stand.geenHeader &&
        stand.home,
      `h1 "${stand.h1}" (${stand.aantalH1}×), ${stand.fotos} foto's als raster, link ${GALERIJ ? '/portretfotos' : '/series'} ${stand.werk ? 'ja' : 'nee'}, header ${stand.geenHeader ? 'weg' : 'aanwezig'}, home-knop ${stand.home ? 'ja' : 'nee'}`,
    );
    await context.close();
  }

  // 404-meldingen van de browser (bijvoorbeeld nog niet gebouwde pagina's) zijn geen scriptfouten.
  const alleFouten = fouten.flat().filter((tekst) => !/status of 404/.test(tekst));
  r.console = oordeel(alleFouten.length === 0, alleFouten.length ? alleFouten.join(' | ') : 'geen fouten');
  rijen.push(r);
  await browser.close();
}

const kolommen = [
  ['apparaat', 'Apparaat'],
  ['laden', 'Laden'],
  ['beelden', 'Beelden bij laden'],
  ['slepen', 'Slepen'],
  ['uitloop', 'Uitloop'],
  ['langeSleep', 'Lange sleep (20 000 px)'],
  ['klik', 'Klik versus sleep'],
  ['toetsenbord', 'Toetsenbord'],
  ['reduce', 'Reduced motion'],
  ['zonderJs', 'Zonder JavaScript'],
  ['console', 'Console'],
];

for (const rij of rijen) {
  console.log(`\n## ${rij.apparaat}`);
  for (const [sleutel, kop] of kolommen.slice(1)) console.log(`- ${kop}: ${rij[sleutel] ?? ''}`);
  if (rij.klikLog) console.log(`  (pointer-events bij de klik: ${rij.klikLog})`);
}
console.log(`\nMaximum aantal foto-elementen in de DOM: ${Math.max(...rijen.map((r) => r.maxDom ?? 0))}`);
console.log(mislukt ? '\nMISLUKT: zie de regels met FOUT.' : '\nGESLAAGD: alle controles.');
process.exit(mislukt ? 1 : 0);

// Controleert de scroll-gekoppelde marquee-titels in WebKit (iPhone 14) en Chromium (Pixel 7).
// Gebruik: npm run build, npm run preview (in een tweede terminal), daarna node scripts/marquee-test.mjs
// Optioneel: BASE_URL=http://localhost:4321 node scripts/marquee-test.mjs
import { chromium, devices, webkit } from 'playwright';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:4321';
const WOORDEN = ['Projecten', 'Diensten', 'Exposities'];
const STAP = 300; // px scrollen voor mee- en terugscrollen
const RUST_MS = 600; // demping uitgewerkt
const SWEEP = 3000; // px voor de wrapcontrole over een groot stuk

const apparaten = [
  { naam: 'iPhone 14 (WebKit)', browserType: webkit, device: devices['iPhone 14'] },
  { naam: 'Pixel 7 (Chromium)', browserType: chromium, device: devices['Pixel 7'] },
];

const rijen = [];
let mislukt = false;
const wacht = (page, ms) => page.waitForTimeout(ms);

/** Verschil a − b modulo w, in (−w/2, w/2]. */
const circulair = (a, b, w) => {
  const d = (((a - b) % w) + w) % w;
  return d > w / 2 ? d - w : d;
};

function verzamelFouten(page) {
  const fouten = [];
  page.on('pageerror', (fout) => fouten.push(fout.message));
  page.on('console', (bericht) => {
    if (bericht.type() === 'error') fouten.push(bericht.text());
  });
  return fouten;
}

/** Leest per marquee: translateX van de track, periode w, top, snelheid en aantal zichtbare woorden. */
function lees(page, woord) {
  return page.evaluate((woord) => {
    const marquee = [...document.querySelectorAll('.marquee')].find(
      (el) => el.querySelector('h2')?.textContent?.trim() === woord,
    );
    if (!marquee) return null;
    const track = marquee.querySelector('.marquee__track');
    const groep = track.querySelector('.marquee__groep');
    const kopie = track.querySelector('.marquee__groep--kopie');
    const transform = getComputedStyle(track).transform;
    return {
      transform,
      tx: transform === 'none' ? 0 : new DOMMatrixReadOnly(transform).m41,
      w: kopie.getBoundingClientRect().left - groep.getBoundingClientRect().left,
      top: marquee.getBoundingClientRect().top,
      snelheid: Number.parseFloat(marquee.dataset.snelheid),
      zichtbaar: [...marquee.querySelectorAll('.marquee__woord')].filter((el) => el.getClientRects().length > 0).length,
      hoogte: window.innerHeight,
    };
  }, woord);
}

/** Scrollt zo dat de bovenkant van de marquee op `doelTop` (px vanaf de bovenkant van het beeld) staat. */
async function zetTop(page, woord, doelTop) {
  await page.evaluate(
    ([woord, doelTop]) => {
      const marquee = [...document.querySelectorAll('.marquee')].find(
        (el) => el.querySelector('h2')?.textContent?.trim() === woord,
      );
      const top = marquee.getBoundingClientRect().top;
      window.scrollTo({ top: window.scrollY + top - doelTop, behavior: 'instant' });
    },
    [woord, doelTop],
  );
}

async function scrollDoor(page, dy) {
  return page.evaluate((dy) => {
    const voor = window.scrollY;
    window.scrollBy({ top: dy, behavior: 'instant' });
    return window.scrollY - voor;
  }, dy);
}

const oordeel = (ok, tekst) => {
  if (!ok) mislukt = true;
  return `${ok ? 'OK' : 'FOUT'} ${tekst}`;
};

for (const { naam, browserType, device } of apparaten) {
  const browser = await browserType.launch();
  const resultaat = Object.fromEntries(WOORDEN.map((w) => [w, {}]));

  // ---------- Beweging aan ----------
  const context = await browser.newContext({ ...device, reducedMotion: 'no-preference' });
  const page = await context.newPage();
  const fouten = verzamelFouten(page);
  await page.goto(BASE_URL, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);

  for (const woord of WOORDEN) {
    const r = resultaat[woord];
    const { hoogte } = await lees(page, woord);

    // Stilstand
    await zetTop(page, woord, hoogte * 0.8);
    await wacht(page, 500);
    const a = await lees(page, woord);
    await wacht(page, 1500);
    const b = await lees(page, woord);
    r.stilstand = oordeel(Math.abs(a.tx - b.tx) < 0.5, `${a.tx.toFixed(1)} → ${b.tx.toFixed(1)}`);

    // Meescrollen
    const dy = await scrollDoor(page, STAP);
    await wacht(page, RUST_MS);
    const c = await lees(page, woord);
    const verwacht = dy * c.snelheid;
    const verschuiving = circulair(b.tx, c.tx, c.w); // positief = naar links
    r.mee = oordeel(
      verschuiving > 0 && Math.abs(verschuiving - verwacht) <= verwacht * 0.2,
      `${verschuiving.toFixed(1)} px links (verwacht ${verwacht.toFixed(0)})`,
    );

    // Terugscrollen
    await scrollDoor(page, -dy);
    await wacht(page, RUST_MS);
    const d = await lees(page, woord);
    const terug = Math.abs(circulair(d.tx, b.tx, d.w));
    r.terug = oordeel(terug <= 2, `verschil ${terug.toFixed(2)} px`);

    // Wrapgrens: vlak onder het beeld (doel < 0) en vlak erin (doel > 0) ligt de wrap.
    await zetTop(page, woord, hoogte + 10);
    await wacht(page, RUST_MS);
    const e = await lees(page, woord);
    const dyWrap = await scrollDoor(page, 20);
    await wacht(page, RUST_MS);
    const f = await lees(page, woord);
    const gewrapt = e.tx < -e.w / 2 && f.tx > -f.w / 2;
    // Zichtbare positie van het eerste woord is periodiek met w; de sprong is de afwijking van dy × snelheid.
    const sprong = Math.abs(circulair(e.tx, f.tx, f.w) - dyWrap * f.snelheid);
    r.wrap = oordeel(gewrapt && sprong <= 2, `${gewrapt ? 'gewrapt' : 'geen wrap'}, sprong ${sprong.toFixed(2)} px`);
    r.w = f.w;
  }

  // Groot stuk scrollen: transform blijft binnen 0 tot −w.
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  const buiten = Object.fromEntries(WOORDEN.map((w) => [w, 0]));
  for (let gescrold = 0; gescrold < SWEEP; gescrold += 100) {
    await scrollDoor(page, 100);
    await wacht(page, 60);
    for (const woord of WOORDEN) {
      const g = await lees(page, woord);
      if (g.tx > 0.01 || g.tx < -g.w - 0.01) buiten[woord] += 1;
    }
  }
  for (const woord of WOORDEN) {
    resultaat[woord].wrap += `; ${oordeel(buiten[woord] === 0, `binnen 0..−w over ${SWEEP} px`)}`;
  }
  resultaat.foutenAan = fouten;
  await context.close();

  // ---------- Minder beweging ----------
  const contextRustig = await browser.newContext({ ...device, reducedMotion: 'reduce' });
  const pageRustig = await contextRustig.newPage();
  const foutenRustig = verzamelFouten(pageRustig);
  await pageRustig.goto(BASE_URL, { waitUntil: 'load' });
  for (const woord of WOORDEN) {
    await zetTop(pageRustig, woord, 200);
    await scrollDoor(pageRustig, STAP);
    await wacht(pageRustig, RUST_MS);
    const g = await lees(pageRustig, woord);
    resultaat[woord].reduce = oordeel(
      g.transform === 'none' && g.zichtbaar === 1,
      `${g.transform}, ${g.zichtbaar} woord`,
    );
  }
  await contextRustig.close();

  // ---------- Zonder JavaScript (ook de 404-pagina, zonder marquee) ----------
  const contextZonderJs = await browser.newContext({ ...device, javaScriptEnabled: false });
  const pageZonderJs = await contextZonderJs.newPage();
  const foutenZonderJs = verzamelFouten(pageZonderJs);
  const antwoord = await pageZonderJs.goto(BASE_URL, { waitUntil: 'load' });
  for (const woord of WOORDEN) {
    const g = await lees(pageZonderJs, woord);
    const ok = antwoord?.ok() && g !== null && g.tx === 0 && g.transform !== 'none';
    resultaat[woord].zonderJs = oordeel(ok, g ? `${g.transform}` : 'kop ontbreekt');
  }
  await contextZonderJs.close();

  const context404 = await browser.newContext({ ...device });
  const page404 = await context404.newPage();
  const fouten404 = verzamelFouten(page404);
  await page404.goto(`${BASE_URL}/bestaat-niet`, { waitUntil: 'load' });
  await wacht(page404, 300);
  await context404.close();

  // 404-statusmeldingen van de browser zelf zijn geen scriptfouten.
  const alleFouten = [...fouten, ...foutenRustig, ...foutenZonderJs, ...fouten404].filter(
    (tekst) => !/status of 404/.test(tekst),
  );
  const foutRegel = oordeel(alleFouten.length === 0, alleFouten.length ? alleFouten.join(' | ') : 'geen console-fouten');

  for (const woord of WOORDEN) {
    rijen.push({ apparaat: naam, marquee: woord, ...resultaat[woord], console: foutRegel });
  }
  await browser.close();
}

const kolommen = [
  ['apparaat', 'Apparaat'],
  ['marquee', 'Marquee'],
  ['stilstand', 'Stilstand'],
  ['mee', 'Meescrollen'],
  ['terug', 'Terugscrollen'],
  ['wrap', 'Naadloze wrap'],
  ['reduce', 'Reduced motion'],
  ['zonderJs', 'Zonder JavaScript'],
  ['console', 'Console'],
];

console.log(`| ${kolommen.map(([, kop]) => kop).join(' | ')} |`);
console.log(`| ${kolommen.map(() => '---').join(' | ')} |`);
for (const rij of rijen) {
  console.log(`| ${kolommen.map(([sleutel]) => String(rij[sleutel] ?? '')).join(' | ')} |`);
}
console.log(`\nPeriode w per marquee (px): ${rijen.map((r) => `${r.apparaat} ${r.marquee} ${r.w?.toFixed(2)}`).join(', ')}`);
console.log(mislukt ? '\nMISLUKT: zie de cellen met FOUT.' : '\nGESLAAGD: alle controles.');
process.exit(mislukt ? 1 : 0);

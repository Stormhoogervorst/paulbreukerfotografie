// Controleert per pagina en per schermbreedte (390, 1024, 1440 en 2000 px) of er geen afbeelding wordt geladen die meer dan
// 1,5x breder is dan nodig: geladen bestand (naturalWidth van de gekozen srcset-kandidaat) tegenover de getoonde breedte
// maal devicePixelRatio (2 op mobiel, 1 op desktop). Meldt ook per pagina het aantal eager afbeeldingen, afbeeldingen zonder
// width/height (layoutverschuiving) en de overdracht.
// Gebruik: npm run build, npm run preview (tweede terminal), daarna node scripts/meet-afbeeldingen.mjs
// Optioneel: BASE_URL=http://localhost:4321, PAGINAS=/,/series, MAX_RATIO=1.5, DPR_DESKTOP=1
import { chromium } from 'playwright';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:4321';
const MAX_RATIO = Number(process.env.MAX_RATIO ?? 1.5);
const STANDAARD = [
  '/',
  '/series',
  '/love-marriage',
  '/take-me-to-the-river',
  '/de-gaarkeuken',
  '/asfalt',
  '/fotograaf-bruiloft',
  '/portretfotos',
  '/contact',
  '/privacy',
];
const PAGINAS = process.env.PAGINAS ? process.env.PAGINAS.split(',') : STANDAARD;
const BREEDTES = [
  { breedte: 390, hoogte: 844, dpr: 2 },
  { breedte: 1024, hoogte: 768, dpr: Number(process.env.DPR_DESKTOP ?? 1) },
  { breedte: 1440, hoogte: 900, dpr: Number(process.env.DPR_DESKTOP ?? 1) },
  { breedte: 2000, hoogte: 1100, dpr: Number(process.env.DPR_DESKTOP ?? 1) },
];

const wacht = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function scrollAlles(page) {
  const hoogte = await page.evaluate(() => document.documentElement.scrollHeight);
  const stap = await page.evaluate(() => Math.round(window.innerHeight * 0.7));
  for (let y = 0; y < hoogte + stap; y += stap) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await wacht(120);
  }
  await wacht(800);
  await page.evaluate(() => window.scrollTo(0, 0));
}

const browser = await chromium.launch();
const problemen = [];
const samenvatting = [];

for (const pad of PAGINAS) {
  for (const { breedte, hoogte, dpr } of BREEDTES) {
    const context = await browser.newContext({ viewport: { width: breedte, height: hoogte }, deviceScaleFactor: dpr });
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    await cdp.send('Network.enable');
    const typen = new Map();
    let bytes = 0;
    let verzoeken = 0;
    cdp.on('Network.requestWillBeSent', (e) => typen.set(e.requestId, e.type));
    cdp.on('Network.loadingFinished', (e) => {
      if (typen.get(e.requestId) === 'Image') {
        bytes += e.encodedDataLength;
        verzoeken += 1;
      }
    });
    await page.goto(`${BASE_URL}${pad}`, { waitUntil: 'load' });
    await scrollAlles(page);

    const beelden = await page.evaluate(() =>
      [...document.querySelectorAll('img')]
        .filter((img) => !img.closest('.portfolio__bron, noscript'))
        .map((img) => {
          const r = img.getBoundingClientRect();
          return {
            alt: (img.alt || '').slice(0, 50),
            klasse: img.className,
            src: img.currentSrc ? img.currentSrc.replace(location.origin, '') : '',
            natuurlijk: img.naturalWidth,
            getoond: r.width,
            loading: img.getAttribute('loading'),
            fetchpriority: img.getAttribute('fetchpriority'),
            decoding: img.getAttribute('decoding'),
            heeftMaat: img.hasAttribute('width') && img.hasAttribute('height'),
            inPicture: img.parentElement?.tagName === 'PICTURE',
            zichtbaar: r.width > 0 && r.height > 0 && getComputedStyle(img).visibility !== 'hidden',
          };
        }),
    );

    const zichtbaar = beelden.filter((b) => b.zichtbaar);
    const eager = beelden.filter((b) => b.loading === 'eager' && b.zichtbaar);
    const teGroot = zichtbaar
      .filter((b) => b.natuurlijk > 0 && b.natuurlijk / (b.getoond * dpr) > MAX_RATIO)
      .map((b) => ({ ...b, ratio: Number((b.natuurlijk / (b.getoond * dpr)).toFixed(2)) }));
    const zonderMaat = zichtbaar.filter((b) => !b.heeftMaat);
    const nietGeladen = zichtbaar.filter((b) => b.natuurlijk === 0);
    const hoogsteRatio = zichtbaar.reduce((max, b) => (b.natuurlijk ? Math.max(max, b.natuurlijk / (b.getoond * dpr)) : max), 0);

    samenvatting.push({
      pagina: pad,
      scherm: `${breedte}@${dpr}x`,
      beelden: zichtbaar.length,
      eager: eager.length,
      zonderMaat: zonderMaat.length,
      nietGeladen: nietGeladen.length,
      hoogsteRatio: Number(hoogsteRatio.toFixed(2)),
      teGroot: teGroot.length,
      verzoeken,
      kb: Math.round(bytes / 1024),
    });
    for (const b of teGroot) problemen.push({ pagina: pad, scherm: `${breedte}@${dpr}x`, ratio: b.ratio, geladen: b.natuurlijk, getoond: Math.round(b.getoond), src: b.src.slice(0, 80) });
    await context.close();
  }
}
await browser.close();

console.table(samenvatting);
if (problemen.length) {
  console.log(`\n${problemen.length} afbeeldingen meer dan ${MAX_RATIO}x te breed:`);
  console.table(problemen);
} else {
  console.log(`\nGeen afbeelding is meer dan ${MAX_RATIO}x te breed geladen.`);
}

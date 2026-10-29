// Lighthouse mobiel (standaardsimulatie: Moto G Power, DPR 1,75, "slow 4G") per pagina, met een samenvatting per pagina:
// Performance, SEO, Accessibility, LCP, CLS, LCP-element, LCP-uitsplitsing (TTFB, load delay, load duration, render
// delay) en de bytegrootte van het LCP-bestand.
// Gebruik: node scripts/serveer-build.mjs (andere terminal, bijvoorbeeld PORT=4390), daarna
//   BASE_URL=http://127.0.0.1:4390 UIT=/tmp/lh-na node scripts/meet-lighthouse.mjs
// Optioneel: PAGINAS=/,/series  CHROME_PATH=...  OPNIEUW=0 (bestaande JSON in UIT hergebruiken)
// Lighthouse wordt met `npx --yes lighthouse` gestart (geen dependency van het project) en heeft Chrome nodig.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const BASE_URL = process.env.BASE_URL ?? 'http://127.0.0.1:4322';
const UIT = process.env.UIT ?? '/tmp/lighthouse';
const PAGINAS = process.env.PAGINAS
  ? process.env.PAGINAS.split(',')
  : ['/', '/fotograaf-bruiloft', '/portretfotos', '/series', '/love-marriage', '/portfolio', '/portfolio/portretten', '/portfolio/bruiloften'];
const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

mkdirSync(UIT, { recursive: true });
const bestand = (pad) => join(UIT, (pad === '/' ? 'home' : pad.slice(1).replaceAll('/', '_')) + '.json');

const rijen = [];
for (const pad of PAGINAS) {
  const json = bestand(pad);
  if (process.env.OPNIEUW === '0' && existsSync(json)) {
    // hergebruiken
  } else {
    execFileSync(
      'npx',
      [
        '--yes', 'lighthouse', BASE_URL + pad,
        '--form-factor=mobile',
        '--only-categories=performance,seo,accessibility',
        '--chrome-flags=--headless=new --no-sandbox',
        '--output=json', `--output-path=${json}`, '--quiet',
      ],
      { env: { ...process.env, CHROME_PATH: CHROME }, stdio: 'ignore' },
    );
  }
  const d = JSON.parse(readFileSync(json, 'utf8'));
  const a = d.audits;
  const score = (c) => Math.round(d.categories[c].score * 100);
  const breakdown = Object.fromEntries(
    (a['lcp-breakdown-insight']?.details?.items?.[0]?.items ?? []).map((i) => [i.subpart, Math.round(i.duration)]),
  );
  const node = (a['lcp-breakdown-insight']?.details?.items ?? []).find((i) => i.type === 'node');
  const lcpDetails = a['lcp-discovery-insight']?.details?.items ?? [];
  const lcpNode = node ?? lcpDetails.find((i) => i.type === 'node');
  const snippet = lcpNode?.snippet ?? '';
  // LCP-bestand: het snippet kapt de URL af ("…"), dus zoek het verzoek met dezelfde (gedecodeerde) beginletters.
  // Het snippet toont de <img src> (de WebP-fallback); bij AVIF-ondersteuning laadt de <source>. Neem daarom het
  // afbeeldingsverzoek met dezelfde bronnaam (tot de eerste punt na de naam) dat het grootst is en als eerste kwam.
  const src = /src="([^"]+)"/.exec(snippet)?.[1] ?? null;
  const verzoeken = a['network-requests']?.details?.items ?? [];
  const naam = src ? decodeURIComponent(src.replace(/…$/, '')).split('/').pop().split('.')[0] : null;
  const beeldVerzoeken = verzoeken.filter((v) => /\.(avif|webp|jpe?g|png)(\?|$)/.test(v.url));
  const lcpVerzoek = naam
    ? beeldVerzoeken.find((v) => decodeURIComponent(v.url).split('/').pop().startsWith(naam))
    : null;
  let lcpPixels = null;
  if (lcpVerzoek) {
    try {
      const pad = join(process.cwd(), '.vercel', 'output', 'static', decodeURIComponent(new URL(lcpVerzoek.url).pathname));
      const m = await sharp(pad).metadata();
      lcpPixels = `${m.width}x${m.height}`;
    } catch {}
  }
  const rect = lcpNode?.boundingRect;
  const diagnose = a['lcp-discovery-insight']?.details?.items?.[0]?.items ?? {};
  rijen.push({
    pagina: pad,
    performance: score('performance'),
    seo: score('seo'),
    accessibility: score('accessibility'),
    lcpS: Number((a['largest-contentful-paint'].numericValue / 1000).toFixed(2)),
    cls: Number(a['cumulative-layout-shift'].numericValue.toFixed(3)),
    lcpElement: lcpNode ? `${lcpNode.selector ?? ''} ${snippet}`.trim().slice(0, 400) : null,
    uitsplitsingMs: breakdown,
    lcpBestand: lcpVerzoek
      ? { url: lcpVerzoek.url.replace(BASE_URL, ''), bytes: lcpVerzoek.transferSize ?? lcpVerzoek.resourceSize, pixels: lcpPixels, getoondCssPx: rect ? `${rect.width}x${rect.height}` : null }
      : src,
    lcpOntdekking: diagnose,
  });
}

writeFileSync(join(UIT, 'samenvatting.json'), JSON.stringify(rijen, null, 1));
for (const r of rijen) {
  console.log(
    `${r.pagina.padEnd(24)} perf ${r.performance} seo ${r.seo} a11y ${r.accessibility} LCP ${r.lcpS}s CLS ${r.cls} ` +
      JSON.stringify(r.uitsplitsingMs),
  );
}

// Koppelt verwijderde of vervangen foto's aan een vervanger UIT DEZELFDE SERIE (map) en schrijft scripts/foto-mapping.md.
// Daarnaast schrijft het script src/data/portfolio-dubbelen.json: foto's die op /portfolio niet nogmaals getoond worden
// omdat dezelfde foto al in een andere map staat.
// Gebruik: node scripts/portfolio-inventaris.mjs (eenmalig, maakt SCRATCH/analyse.json), daarna node scripts/foto-mapping.mjs.
//
// Methode (perceptuele 64-bit dHash op een 9×8 grijswaardebeeld, afstand 0 tot 64):
//   ≤ 10  "zelfde foto" (nieuwe bewerking)         11–20  "onzeker"            > 20  "gekozen vervanger"
// Bij "gekozen vervanger" geldt: dezelfde oriëntatie, dan de meest vergelijkbare beeldverhouding, dan de kleinste afstand.
// Een foto wordt binnen één groep (pagina) maar één keer gebruikt; de beste koppelingen gaan voor.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { ROOT, SCRATCH, afstand, oriëntatie } from './lib/foto-tools.mjs';

const { nieuw, oud } = JSON.parse(readFileSync(`${SCRATCH}/analyse.json`, 'utf8'));
const slugify = (waarde) =>
  waarde
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const isTif = (f) => /\.tif$/i.test(f.bestand);
/** Een .tif met een .jpg-tweeling is dezelfde foto; alleen de .jpg is voor de site zichtbaar. */
const bruikbaar = nieuw.filter((f) => !isTif(f));
const bestaatNog = (o) => nieuw.some((n) => n.pad === o.pad);

/** Oude map → nieuwe map(pen) van dezelfde serie (zie scripts/portfolio-inventaris.md). */
const SERIE = {
  asfalt: ['Asfalt'],
  'asty-mwaka': ['asty-mwaka'],
  'het-gezicht-van-nijmegen': ['het-gezicht-van-nijmegen'],
  huiskamers: ['Groeten uit lent', 'groeten-uit-lent'],
  portretten: ['portretten'],
};
const seriesVan = (oudeMap) => SERIE[slugify(oudeMap)] ?? [oudeMap];

/** Waar de oude bestanden in HEAD werden gebruikt (rol per bestand, aanvullend op git grep). */
const ROL = {
  'Asfalt/L1039810-min-2.jpg': 'omslag van de kaart /asfalt op /series',
  'het-gezicht-van-nijmegen/GEZICHT 03-min.jpg': 'omslag van de kaart /het-gezicht-van-nijmegen op /series',
  'portretten/PORTRET BEEK 08-min.jpg': 'hero 1 van /portretfotos (LCP en Open Graph)',
  'portretten/portret 5.jpg': 'hero 2 van /portretfotos',
  'portretten/Portret 2.jpg': 'hero 3 van /portretfotos',
  'portretten/PORTRET BEEK 10-min.jpg': 'impressie 1 van /portretfotos',
  'portretten/Portret 1.jpg': 'impressie 2 van /portretfotos',
  'portretten/PORTRET BEEK 03-min.jpg': 'impressie 3 van /portretfotos',
};
/** Groepen = pagina's waar dezelfde foto niet tweemaal mag voorkomen. */
const GROEP = (o) => (o.map === 'portretten' ? '/portretfotos' : `serie ${o.map}`);

function gebruik(o) {
  const delen = [];
  if (ROL[o.pad]) delen.push(ROL[o.pad]);
  let treffers = '';
  try {
    treffers = execFileSync('git', ['grep', '-n', '-F', o.bestand, 'HEAD', '--', 'src'], { cwd: ROOT, encoding: 'utf8' });
  } catch {
    /* geen treffer */
  }
  const bestanden = [...new Set(treffers.split('\n').filter(Boolean).map((r) => r.replace(/^HEAD:/, '').split(':').slice(0, 2).join(':')))];
  const altLijst = bestanden.filter((b) => b.startsWith('src/data/series.ts'));
  const andere = bestanden.filter((b) => !/^src\/data\/(series\.ts|home\.ts|landing\/portretfotos\.ts)/.test(b));
  if (altLijst.length && !ROL[o.pad]) delen.push('alt-tekst op de projectpagina (src/data/series.ts)');
  if (andere.length) delen.push(...andere);
  delen.push('/portfolio (canvas)');
  return delen.join('; ');
}

function kandidatenVoor(o) {
  const mappen = seriesVan(o.map);
  return bruikbaar.filter((n) => mappen.includes(n.map));
}

const verhouding = (f) => f.width / f.height;

// ---- 1. alle koppelingen berekenen (afstand per oud bestand × kandidaat)
const verwijderd = oud.filter((o) => !bestaatNog(o));
const opdrachten = [];
for (const o of verwijderd) {
  const kandidaten = kandidatenVoor(o);
  const lijst = kandidaten
    .map((n) => ({ n, d: n.sha1 === o.sha1 ? 0 : afstand(n.hash, o.hash) }))
    .sort((a, b) => a.d - b.d);
  opdrachten.push({ o, lijst, groep: GROEP(o) });
}

// ---- 2. toewijzen: eerst de duidelijke matches (kleinste afstand eerst), daarna de rest, per groep unieke foto's
const gebruikt = new Map(); // groep -> Set(pad)
const resultaat = new Map();
const kiesBeste = (opdracht, vrij) => {
  const { o, lijst } = opdracht;
  const nodig = lijst.filter((x) => vrij(x.n));
  const beste = nodig[0];
  return beste;
};
const vrijVoor = (groep) => (n) => !(gebruikt.get(groep)?.has(n.pad));
const markeer = (groep, n) => gebruikt.set(groep, (gebruikt.get(groep) ?? new Set()).add(n.pad));

// Pagina's met hero/impressie moeten bruikbare resoluties hebben: kleine bronnen (< 1000 px breed) komen niet in aanmerking.
const MIN_BREEDTE = (groep) => (groep === '/portretfotos' ? 1000 : 0);

let open = [...opdrachten];
for (;;) {
  let beste = null;
  for (const op of open) {
    const kandidaat = op.lijst.find((x) => vrijVoor(op.groep)(x.n) && x.n.width >= MIN_BREEDTE(op.groep));
    if (kandidaat && kandidaat.d <= 20 && (!beste || kandidaat.d < beste.kandidaat.d)) beste = { op, kandidaat };
  }
  if (!beste) break;
  markeer(beste.op.groep, beste.kandidaat.n);
  resultaat.set(beste.op.o.pad, { nieuw: beste.kandidaat.n, d: beste.kandidaat.d, methode: beste.kandidaat.d <= 10 ? 'zelfde foto' : 'onzeker' });
  open = open.filter((x) => x !== beste.op);
}
// Geen match: zelfde oriëntatie, meest vergelijkbare beeldverhouding (afgerond op 5%), dan kleinste afstand.
for (const op of open) {
  const { o } = op;
  const vrij = op.lijst.filter((x) => vrijVoor(op.groep)(x.n) && x.n.width >= MIN_BREEDTE(op.groep));
  const zelfdeOrientatie = vrij.filter((x) => oriëntatie(x.n) === oriëntatie(o));
  const pool = zelfdeOrientatie.length ? zelfdeOrientatie : vrij;
  const rang = [...pool].sort((a, b) => {
    const da = Math.round((Math.abs(verhouding(a.n) - verhouding(o)) / verhouding(o)) / 0.05);
    const db = Math.round((Math.abs(verhouding(b.n) - verhouding(o)) / verhouding(o)) / 0.05);
    return da - db || a.d - b.d;
  });
  const gekozen = rang[0];
  if (!gekozen) {
    resultaat.set(o.pad, { nieuw: null, d: null, methode: 'geen kandidaat' });
    continue;
  }
  markeer(op.groep, gekozen.n);
  resultaat.set(o.pad, { nieuw: gekozen.n, d: gekozen.d, methode: 'gekozen vervanger' });
}

// ---- 3. dubbelen op /portfolio (zelfde foto in meer dan één map): houd de foto in de projectmap, daarna op naam
const slugsProjecten = JSON.parse(readFileSync(`${SCRATCH}/analyse.json`, 'utf8')).projectSlugs;
const rangVanMap = (map) => (map === 'portretten' ? 2 : slugsProjecten.includes(slugify(map)) ? 0 : 1);
const volgorde = [...bruikbaar].sort(
  (a, b) => rangVanMap(a.map) - rangVanMap(b.map) || a.pad.localeCompare(b.pad, 'nl', { numeric: true, sensitivity: 'base' }),
);
const DUBBEL_AFSTAND = 2;
const behouden = [];
const dubbelen = []; // { weg, blijft, d }
for (const f of volgorde) {
  const twin = behouden.find((b) => b.sha1 === f.sha1 || (afstand(b.hash, f.hash) <= DUBBEL_AFSTAND && Math.abs(verhouding(b) - verhouding(f)) / verhouding(b) < 0.03));
  if (twin) dubbelen.push({ weg: f, blijft: twin, d: twin.sha1 === f.sha1 ? 0 : afstand(twin.hash, f.hash) });
  else behouden.push(f);
}
writeFileSync(`${ROOT}/src/data/portfolio-dubbelen.json`, `${JSON.stringify(dubbelen.map((d) => d.weg.pad).sort(), null, 2)}\n`);

// ---- 4. markdown
const mapMd = (o) => {
  const oudeMap = o.map;
  const nieuweMap = resultaat.get(o.pad)?.nieuw?.map;
  return `\`${oudeMap}\` → \`${nieuweMap ?? '—'}\``;
};
const rijen = [...resultaat.entries()].map(([pad, r]) => ({ o: oud.find((x) => x.pad === pad), ...r }));
const orde = { 'gekozen vervanger': 0, onzeker: 1, 'geen kandidaat': 0, 'zelfde foto': 2 };
rijen.sort((a, b) => orde[a.methode] - orde[b.methode] || a.o.pad.localeCompare(b.o.pad, 'nl'));
const afwijking = (o, n) => (n ? Math.abs(verhouding(n) - verhouding(o)) / verhouding(o) : 0);

const md = [];
md.push(
  '# Foto-mapping: oude bestanden → nieuwe bestanden',
  '',
  `Gemaakt met \`node scripts/foto-mapping.mjs\` (perceptuele dHash, 64 bit). Oude bestanden komen uit git (HEAD) en staan in ${SCRATCH}/oud. De vervanger komt altijd uit dezelfde serie (map), zie \`scripts/portfolio-inventaris.md\`.`,
  '',
  'Methode: afstand ≤ 10 = "zelfde foto" (nieuwe bewerking), 11–20 = "onzeker", > 20 = "gekozen vervanger" (zelfde oriëntatie, meest vergelijkbare beeldverhouding, dan kleinste afstand). Binnen één pagina komt een foto niet tweemaal voor. Op /portretfotos komen alleen bronnen van minstens 1000 px breed in aanmerking (hero en impressie). Regels met "onzeker" en "gekozen vervanger" staan bovenaan: die moet Paul beoordelen.',
  '',
  `Verwijderde of vervangen oude bestanden: ${verwijderd.length} (van ${oud.length}). Oude bestanden die op dezelfde plek zijn blijven staan, zijn niet in de tabel opgenomen.`,
  '',
  '| Oud bestand (git) | Serie (oud → nieuw) | Nieuw bestand | Methode | Afstand | Beeldverhouding oud → nieuw | Gebruikt voor |',
  '| --- | --- | --- | --- | ---: | --- | --- |',
);
for (const r of rijen) {
  const af = afwijking(r.o, r.nieuw);
  md.push(
    `| \`${r.o.pad}\` | ${mapMd(r.o)} | ${r.nieuw ? `\`${r.nieuw.pad}\`` : '—'} | ${r.methode} | ${r.d ?? '—'} | ${r.o.width}×${r.o.height} → ${r.nieuw ? `${r.nieuw.width}×${r.nieuw.height}` : '—'}${af > 0.02 ? ` (**${(af * 100).toFixed(0)}% anders**)` : ''} | ${gebruik(r.o)} |`,
  );
}
const afwijkend = rijen.filter((r) => afwijking(r.o, r.nieuw) > 0.02);
md.push(
  '',
  '## Beeldverhouding meer dan 2% anders dan het origineel',
  '',
  afwijkend.length ? afwijkend.map((r) => `- \`${r.o.pad}\` → \`${r.nieuw.pad}\`: ${r.o.width}×${r.o.height} → ${r.nieuw.width}×${r.nieuw.height} (${(afwijking(r.o, r.nieuw) * 100).toFixed(0)}%), ${r.methode}`).join('\n') : 'Geen.',
  '',
  '## Dubbelen op /portfolio',
  '',
  `Zelfde foto in meer dan één map (identieke inhoud of dHash-afstand ≤ ${DUBBEL_AFSTAND} met bijna gelijke beeldverhouding). De foto in de projectmap blijft, de andere wordt op /portfolio overgeslagen (\`src/data/portfolio-dubbelen.json\`; opnieuw genereren met dit script na het toevoegen van foto's).`,
  '',
  dubbelen.length
    ? ['| Overgeslagen | Blijft | Afstand |', '| --- | --- | ---: |', ...dubbelen.map((d) => `| \`${d.weg.pad}\` | \`${d.blijft.pad}\` | ${d.d} |`)].join('\n')
    : 'Geen gevonden.',
  '',
);
writeFileSync(`${ROOT}/scripts/foto-mapping.md`, md.join('\n'));
writeFileSync(
  `${SCRATCH}/mapping.json`,
  JSON.stringify(rijen.map((r) => ({ oud: r.o.pad, nieuw: r.nieuw?.pad ?? null, methode: r.methode, d: r.d })), null, 1),
);
console.log(`foto-mapping.md geschreven: ${rijen.length} koppelingen, ${dubbelen.length} dubbelen.`);

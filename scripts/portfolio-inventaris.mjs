// Inventariseert de foto's onder src/assets/portfolio en schrijft scripts/portfolio-inventaris.md.
// Gebruik: node scripts/portfolio-inventaris.mjs
//
// Het script
//  - leest elke afbeelding (afmetingen, bestandsgrootte, SHA-1 en perceptuele dHash) en bewaart de uitkomst in
//    SCRATCH/analyse.json (/tmp/foto-scratch; buiten de repo) voor scripts/foto-mapping.mjs;
//  - haalt de oude bestanden uit git (HEAD) naar SCRATCH/oud/ voor vergelijking;
//  - koppelt elke oude map aan een nieuwe map (zelfde naam, anders de map waar de meeste oude foto's terugkomen);
//  - classificeert elke map: (a) projectmap (slug staat in src/data/series.ts), (b) portretmap, (c) nieuwe map.
// Er worden geen bronbestanden gewijzigd.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import {
  PORTFOLIO,
  ROOT,
  SCRATCH,
  afmetingen,
  afstand,
  dhash,
  mb,
  oudeBestandenUitGit,
  oriëntatie,
  rel,
  sha1,
  statBytes,
  walk,
} from './lib/foto-tools.mjs';

const slugify = (waarde) =>
  waarde
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const ZWAAR_BYTES = 1.5 * 1024 * 1024;
const ZWAAR_BREEDTE = 4000;
/** Bestanden die Paul.* of paul.* heten zijn zijn eigen portret (OverPaul) en horen niet in het portfolio. */
const PAUL = /^paul[^/]*$/i;

// ---- projecten uit src/data/series.ts (alleen daar bestaat een project)
const seriesBron = readFileSync(`${ROOT}/src/data/series.ts`, 'utf8');
const projectSlugs = [...seriesBron.matchAll(/^\s{4}slug:\s*'([^']+)'/gm)].map((m) => m[1]);

async function analyseer(pad, basis) {
  const dims = await afmetingen(pad);
  return {
    pad: pad.slice(basis.length + 1),
    map: dirname(pad.slice(basis.length + 1)),
    bestand: basename(pad),
    bytes: statBytes(pad),
    ...dims,
    sha1: sha1(pad),
    hash: await dhash(pad),
  };
}

console.log('Nieuwe bestanden analyseren…');
const nieuwePaden = walk(PORTFOLIO);
const nieuw = [];
for (const pad of nieuwePaden) nieuw.push(await analyseer(pad, PORTFOLIO));

console.log('Oude bestanden uit git ophalen en analyseren…');
const oudePaden = oudeBestandenUitGit();
const oudBasis = join(SCRATCH, 'oud', 'src/assets/portfolio');
const oud = [];
for (const pad of oudePaden) oud.push(await analyseer(join(SCRATCH, 'oud', pad), oudBasis));

mkdirSync(SCRATCH, { recursive: true });
writeFileSync(join(SCRATCH, 'analyse.json'), JSON.stringify({ nieuw, oud, projectSlugs }, null, 1));

// ---- mappen
const nieuweMappen = [...new Set(nieuw.map((f) => f.map))].sort((a, b) => a.localeCompare(b, 'nl'));
const oudeMappen = [...new Set(oud.map((f) => f.map))].sort((a, b) => a.localeCompare(b, 'nl'));
const isTif = (f) => /\.tif$/i.test(f.bestand);

function classificeer(map) {
  if (map === 'portretten') return '(b) portretmap';
  if (projectSlugs.includes(slugify(map))) return `(a) projectmap (${slugify(map)})`;
  return '(c) nieuwe map';
}

// ---- koppeling oude map -> nieuwe map
const koppelingen = oudeMappen.map((oudeMap) => {
  const bestanden = oud.filter((f) => f.map === oudeMap);
  const zelfde = nieuweMappen.find((m) => slugify(m) === slugify(oudeMap));
  const stemmen = new Map();
  const per = bestanden.map((o) => {
    let beste = null;
    for (const n of nieuw) {
      if (isTif(n) && nieuw.some((x) => x.map === n.map && x.bestand.replace(/\.[^.]+$/, '') === n.bestand.replace(/\.[^.]+$/, '') && !isTif(x))) continue;
      const d = n.sha1 === o.sha1 ? 0 : afstand(n.hash, o.hash);
      if (!beste || d < beste.d) beste = { n, d };
    }
    if (beste && beste.d <= 10) stemmen.set(beste.n.map, (stemmen.get(beste.n.map) ?? 0) + 1);
    return { o, beste };
  });
  const meerderheid = [...stemmen.entries()].sort((a, b) => b[1] - a[1]);
  const doel = zelfde ?? meerderheid[0]?.[0] ?? null;
  const verspreid = new Map();
  for (const { beste } of per) if (beste && beste.d <= 10) verspreid.set(beste.n.map, (verspreid.get(beste.n.map) ?? 0) + 1);
  return { oudeMap, doel, zelfdeNaam: Boolean(zelfde), stemmen: [...verspreid.entries()], aantalOud: bestanden.length };
});

// ---- aanvullende detectie
const dubbel = [];
const gezien = new Map();
for (const f of nieuw.filter((x) => !/\.tif$/i.test(x.bestand))) {
  const sleutel = f.sha1;
  if (gezien.has(sleutel)) dubbel.push([gezien.get(sleutel), f]);
  else gezien.set(sleutel, f);
}
const paulBestanden = nieuw.filter((f) => PAUL.test(f.bestand));
const verdacht = nieuw.filter((f) => /cover|omslag|logo|screenshot|schermafbeelding|scherm|boek|banner|favicon|icon/i.test(f.bestand));

// ---- markdown
const regels = [];
const w = (...r) => regels.push(...r);
w(
  '# Inventaris src/assets/portfolio',
  '',
  `Gemaakt met \`node scripts/portfolio-inventaris.mjs\` op ${new Date().toISOString().slice(0, 10)}. Bronbestanden zijn niet gewijzigd.`,
  '',
  '## Locatie',
  '',
  'De foto\'s staan in `src/assets/portfolio/<map>/` (niet in `public/`): ze gaan via `astro:assets` (sharp) door de build. Er is dus geen overlap met een route in `src/pages` (`/portfolio/portretten` is een pagina; de bestanden staan in `src/assets`). Niet-afbeeldingsbestanden (`.DS_Store`) zijn genegeerd (staan in .gitignore).',
  '',
  `Totaal nu: ${nieuw.length} afbeeldingsbestanden in ${nieuweMappen.length} mappen, ${mb(nieuw.reduce((s, f) => s + f.bytes, 0))}. Bij de laatste werkende commit (HEAD): ${oud.length} bestanden in ${oudeMappen.length} mappen.`,
  '',
  '## Mappen (recursief)',
  '',
  '| Map | Classificatie | Aantal | Totaal | Kleinste (px) | Grootste (px) | Opmerking |',
  '| --- | --- | ---: | ---: | --- | --- | --- |',
);
for (const map of nieuweMappen) {
  const lijst = nieuw.filter((f) => f.map === map);
  const op = [...lijst].sort((a, b) => a.width * a.height - b.width * b.height);
  const tifs = lijst.filter(isTif).length;
  w(
    `| \`${map}\` | ${classificeer(map)} | ${lijst.length} | ${mb(lijst.reduce((s, f) => s + f.bytes, 0))} | ${op[0].width}×${op[0].height} | ${op.at(-1).width}×${op.at(-1).height} | ${tifs ? `${tifs} × .tif (Astro kent alleen .tiff, zie hieronder)` : ''} |`,
  );
}
const nieuweC = nieuweMappen.filter((m) => classificeer(m).startsWith('(c)'));
w('', '### Nieuwe mappen (c)', '');
if (nieuweC.length === 0) w('Geen.');
for (const map of nieuweC) {
  const bestondAl = oudeMappen.includes(map);
  w(
    `- \`${map}\`: ${nieuw.filter((f) => f.map === map && !isTif(f)).length} foto's (+ ${nieuw.filter((f) => f.map === map && isTif(f)).length} .tif)${bestondAl ? ' — bestond al in HEAD (geen project; alleen op /portfolio)' : ' — echt nieuw'}`,
  );
}
w('', 'Deze mappen leveren alleen foto\'s voor `/portfolio`. Ze worden geen project, pagina of kaart: een project bestaat pas als het in `src/data/series.ts` staat.');

w('', '## Oude situatie (git HEAD) en koppeling oude map → nieuwe map', '', '| Oude map | Aantal oud | Nieuwe map | Hoe | Verdeling van de terugkerende foto\'s (hash-afstand ≤ 10) |', '| --- | ---: | --- | --- | --- |');
for (const k of koppelingen) {
  const hoe = !k.doel ? 'geen' : k.zelfdeNaam ? (k.doel === k.oudeMap ? 'zelfde mapnaam' : 'zelfde mapnaam (andere schrijfwijze)') : 'meeste foto\'s terug (hernoemd of samengevoegd)';
  w(`| \`${k.oudeMap}\` | ${k.aantalOud} | ${k.doel ? `\`${k.doel}\`` : '—'} | ${hoe} | ${k.stemmen.map(([m, n]) => `${n}× \`${m}\``).join(', ') || '—'} |`);
}
w('');
const verdwenenMappen = koppelingen.filter((k) => !nieuweMappen.includes(k.oudeMap));
const hernoemd = koppelingen.filter((k) => k.doel && k.doel !== k.oudeMap);
w(
  '### Hernoemd, samengevoegd of nieuw',
  '',
  ...(hernoemd.length ? hernoemd.map((k) => `- \`${k.oudeMap}\` → \`${k.doel}\` (${k.zelfdeNaam ? 'zelfde naam, andere schrijfwijze' : 'hernoemd of samengevoegd'}).`) : ['- Geen oude map is hernoemd.']),
  ...(verdwenenMappen.length ? verdwenenMappen.map((k) => `- Oude map \`${k.oudeMap}\` bestaat niet meer.`) : []),
  ...nieuweC.filter((m) => !oudeMappen.includes(m)).map((m) => `- Nieuw: \`${m}\`.`),
  '',
);

w('## Wat is er van de oude bestanden geworden?', '', '| Oud bestand | Staat nog op dezelfde plek | Inhoud (SHA-1) elders |', '| --- | --- | --- |');
for (const o of oud) {
  const zelfdePlek = nieuw.some((n) => n.pad === o.pad);
  const elders = nieuw.filter((n) => n.sha1 === o.sha1 && n.pad !== o.pad).map((n) => `\`${n.pad}\``).join(', ');
  if (!zelfdePlek) w(`| \`${o.pad}\` | nee (verwijderd) | ${elders || 'nee'} |`);
}

w('', '## Waarschuwing: zware afbeeldingen', '', `Regel: geoptimaliseerde bestanden in de repo (meer dan ${mb(ZWAAR_BYTES)} of breder dan ${ZWAAR_BREEDTE} px is opvallend zwaar). Bronbestanden zijn niet aangepast; de build maakt er wel kleine varianten van, maar de repo wordt groot en de build traag. Verkleinen vóór livegang (zie README).`, '');
w('| Map | Bestanden | Waarvan zwaar | Zwaarste bestand | Totaal |', '| --- | ---: | ---: | --- | ---: |');
for (const map of nieuweMappen) {
  const lijst = nieuw.filter((f) => f.map === map);
  const zwaar = lijst.filter((f) => f.bytes > ZWAAR_BYTES || f.width > ZWAAR_BREEDTE);
  const top = [...lijst].sort((a, b) => b.bytes - a.bytes)[0];
  w(`| \`${map}\` | ${lijst.length} | ${zwaar.length} | \`${top.bestand}\` (${mb(top.bytes)}, ${top.width}×${top.height}) | ${mb(lijst.reduce((s, f) => s + f.bytes, 0))} |`);
}
const zwaarAlles = nieuw.filter((f) => f.bytes > ZWAAR_BYTES || f.width > ZWAAR_BREEDTE);
w('', `<details><summary>Alle ${zwaarAlles.length} zware bestanden</summary>`, '', '| Pad | Grootte | Afmeting |', '| --- | ---: | --- |');
for (const f of [...zwaarAlles].sort((a, b) => b.bytes - a.bytes)) w(`| \`${f.pad}\` | ${mb(f.bytes)} | ${f.width}×${f.height} |`);
w('', '</details>');

w('', '## `.tif`-bestanden', '', 'Astro (sharp) herkent `.tiff`, niet `.tif`: zulke bestanden worden door de glob niet gevonden en zijn dus onzichtbaar voor de site. Naast elke `.tif` staat daarom een `.jpg` met dezelfde naam (met `sips` geconverteerd, kwaliteit 92, zelfde afmetingen); de `.tif` blijft ongemoeid en ongebruikt staan.', '');
for (const f of nieuw.filter(isTif)) w(`- \`${f.pad}\` (${mb(f.bytes)}, ${f.width}×${f.height})`);

w('', '## Bestanden die Paul.* of paul.* heten (uitgesloten van /portfolio)', '', paulBestanden.length ? paulBestanden.map((f) => `- \`${f.pad}\``).join('\n') : 'Geen gevonden. De uitsluiting (`/^paul[^/]*$/i` op de bestandsnaam) staat wel in `src/data/portfolio.ts`.');

w('', '## Identieke bestanden (zelfde SHA-1) in meer dan één map', '', dubbel.length ? dubbel.map(([a, b]) => `- \`${a.pad}\` = \`${b.pad}\``).join('\n') : 'Geen.', '', 'Perceptuele dubbelen (andere bewerking van dezelfde foto) staan in `scripts/foto-mapping.md` onder "Dubbelen op /portfolio".');

w('', '## Bestanden die er niet uitzien als werk', '', 'Gezocht op bestandsnaam (cover, omslag, logo, screenshot, scherm, boek, banner, icon):', '', verdacht.length ? verdacht.map((f) => `- \`${f.pad}\``).join('\n') : '- Geen op naam.', '', 'Visuele controle: zie "Handmatige bevindingen" hieronder.');

let handmatig = '';
try {
  handmatig = readFileSync(`${ROOT}/scripts/portfolio-inventaris-bevindingen.md`, 'utf8').trim();
} catch {
  /* optioneel */
}
w('', '## Handmatige bevindingen', '', handmatig || '_Geen._');

writeFileSync(`${ROOT}/scripts/portfolio-inventaris.md`, `${regels.join('\n')}\n`);
console.log(`Geschreven: scripts/portfolio-inventaris.md (${nieuw.length} nieuw, ${oud.length} oud)`);

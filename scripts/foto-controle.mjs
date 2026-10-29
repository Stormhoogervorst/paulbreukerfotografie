// Controleert dat niets in de repo verwijst naar bestanden die git als verwijderd ziet (`git status`), en dat elke
// bestandsnaam in src/data/alt-teksten.ts en in de `altTeksten` van src/data/series.ts nog een foto heeft.
//
// 1. Verwijderd: de bestanden met status " D" of "D " (verwijderd in de werkmap of in de index). Per bestand zoekt het script de
//    bestandsnaam (met extensie) en het pad (zonder src/assets/portfolio/) in alle tekstbestanden onder src, public, docs en
//    scripts en in de bestanden in de projectmap. Een treffer is een fout als hij in code staat die de foto zou laden
//    of koppelen: dus niet in commentaar (regels met //, * of /*), niet in documentatie (*.md), niet in de analysescripts
//    over de oude HEAD (foto-mapping.mjs, portfolio-inventaris.mjs), en niet als de bestandsnaam nog elders onder
//    src/assets bestaat (de foto is dan verhuisd, zoals HUISKAMERS naar "Groeten uit lent"). De rest wordt wel getoond.
// 2. Alt-teksten: elke sleutel in alt-teksten.ts (`<bestand>.jpg`) en elke naam in `altTeksten` per project moet voorkomen als
//    bestand ergens onder src/assets/portfolio (hoofdletters genegeerd).
//
// Gebruik: node scripts/foto-controle.mjs        (afsluitcode 1 bij een treffer in code of een alt-tekst zonder foto)
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, extname, join, relative } from 'node:path';

const ROOT = new URL('../', import.meta.url).pathname.replace(/\/$/, '');
const TEKST = /\.(astro|ts|tsx|js|mjs|json|md|mdx|css|html|txt|yml|yaml)$/i;
const MAPPEN = ['src', 'public', 'docs', 'scripts'];
const LOSSE_BESTANDEN = ['README.md', 'AGENTS.md', 'astro.config.mjs', 'vercel.json', 'package.json', 'tsconfig.json'];
const NEGEER = new Set(['node_modules', '.git', '.astro', '.vercel', 'dist', '_originelen', 'vergelijk']);

function loop(map) {
  const uit = [];
  for (const entry of readdirSync(map, { withFileTypes: true })) {
    if (NEGEER.has(entry.name)) continue;
    const pad = join(map, entry.name);
    if (entry.isDirectory()) uit.push(...loop(pad));
    else if (TEKST.test(entry.name)) uit.push(pad);
  }
  return uit;
}

const tekstbestanden = [
  ...MAPPEN.filter((map) => existsSync(join(ROOT, map))).flatMap((map) => loop(join(ROOT, map))),
  ...LOSSE_BESTANDEN.map((naam) => join(ROOT, naam)).filter((pad) => existsSync(pad)),
];
const inhoud = new Map(tekstbestanden.map((pad) => [pad, readFileSync(pad, 'utf8')]));
const ditScript = join(ROOT, 'scripts/foto-controle.mjs');
const ANALYSE = new Set(['scripts/foto-mapping.mjs', 'scripts/portfolio-inventaris.mjs']);
const COMMENTAAR = /^\s*(\/\/|\*|\/\*|<!--)/;

/** Alle bestandsnamen die nu onder src/assets bestaan (kleine letters), voor de test "verhuisd". */
const bestaandeNamen = new Set();
(function verzamel(map) {
  for (const entry of readdirSync(map, { withFileTypes: true })) {
    const pad = join(map, entry.name);
    if (entry.isDirectory()) verzamel(pad);
    else bestaandeNamen.add(entry.name.toLowerCase());
  }
})(join(ROOT, 'src/assets'));

// ---- 1. Verwijderd volgens git
const status = execFileSync('git', ['status', '--porcelain', '-z'], { cwd: ROOT, encoding: 'utf8' })
  .split('\0')
  .filter(Boolean);
const verwijderd = status
  .filter((regel) => regel[0] === 'D' || regel[1] === 'D')
  .map((regel) => regel.slice(3));

console.log(`Door git als verwijderd gezien: ${verwijderd.length} bestanden`);
for (const pad of verwijderd) console.log(`  ${pad}`);
console.log('');

let fouten = 0;
for (const pad of verwijderd) {
  const naam = basename(pad);
  const zonderRoot = pad.replace(/^src\/assets\/portfolio\//, '');
  const zoek = [...new Set([naam, zonderRoot])];
  const treffers = [];
  for (const [bestand, tekst] of inhoud) {
    if (bestand === ditScript) continue;
    for (const term of zoek) {
      if (!tekst.includes(term)) continue;
      const regels = tekst.split('\n');
      regels.forEach((regel, i) => {
        if (regel.includes(term)) treffers.push({ bestand: relative(ROOT, bestand), regel: i + 1, tekst: regel.trim().slice(0, 110) });
      });
    }
  }
  const verhuisd = bestaandeNamen.has(naam.toLowerCase());
  const docs = treffers.filter((t) => t.bestand.endsWith('.md'));
  const analyse = treffers.filter((t) => ANALYSE.has(t.bestand));
  const commentaar = treffers.filter((t) => !t.bestand.endsWith('.md') && !ANALYSE.has(t.bestand) && COMMENTAAR.test(t.tekst));
  const code = treffers.filter((t) => !docs.includes(t) && !analyse.includes(t) && !commentaar.includes(t));
  const echt = verhuisd ? [] : code;
  if (echt.length > 0) {
    fouten += echt.length;
    console.log(`VERWIJZING IN CODE naar ${pad}`);
    for (const t of echt) console.log(`  ${t.bestand}:${t.regel}  ${t.tekst}`);
  }
  const notities = [
    verhuisd && code.length > 0 ? `${code.length}x bestandsnaam bestaat nog elders (verhuisd)` : '',
    commentaar.length > 0 ? `${commentaar.length}x commentaar (${[...new Set(commentaar.map((t) => t.bestand))].join(', ')})` : '',
    analyse.length > 0 ? `${new Set(analyse.map((t) => t.bestand)).size} analysescript(s) over de oude HEAD` : '',
    docs.length > 0 ? `documentatie: ${[...new Set(docs.map((t) => t.bestand))].join(', ')}` : '',
  ].filter(Boolean);
  if (echt.length === 0) console.log(`ok  ${pad.replace('src/assets/portfolio/', '')}${notities.length ? `  [${notities.join('; ')}]` : ''}`);
}
if (fouten === 0) console.log('Geen verwijzing in code naar een verwijderd bestand.');
console.log('');

// ---- 2. Alt-teksten zonder foto
const fotoNamen = new Set();
(function verzamel(map) {
  for (const entry of readdirSync(map, { withFileTypes: true })) {
    const pad = join(map, entry.name);
    if (entry.isDirectory()) verzamel(pad);
    else if (/\.(jpe?g|png|webp|avif|tiff)$/i.test(entry.name)) fotoNamen.add(entry.name.toLowerCase());
  }
})(join(ROOT, 'src/assets/portfolio'));

const altBronnen = [join(ROOT, 'src/data/alt-teksten.ts'), join(ROOT, 'src/data/series.ts')];
const losseAlt = [];
for (const bron of altBronnen) {
  const tekst = readFileSync(bron, 'utf8');
  // Sleutels als '01070.jpg': of "naam met spatie.jpg":, aan het begin van een regel.
  for (const treffer of tekst.matchAll(/^\s*(?:'([^']+\.(?:jpe?g|png|webp|avif|tiff))'|"([^"]+\.(?:jpe?g|png|webp|avif|tiff))")\s*:/gim)) {
    const sleutel = (treffer[1] ?? treffer[2]).split('/').pop();
    if (!fotoNamen.has(sleutel.toLowerCase())) losseAlt.push(`${relative(ROOT, bron)}: ${treffer[1] ?? treffer[2]}`);
  }
}
if (losseAlt.length > 0) {
  fouten += losseAlt.length;
  console.log(`Alt-tekst zonder foto (${losseAlt.length}):`);
  for (const regel of losseAlt) console.log(`  ${regel}`);
} else {
  console.log('Elke alt-tekstsleutel heeft een foto onder src/assets/portfolio.');
}

console.log('');
console.log(fouten === 0 ? 'OK' : `${fouten} probleem(en)`);
process.exit(fouten === 0 ? 0 : 1);

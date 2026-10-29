// Controleert .vercel/output/static/_astro na een build:
//  - aantal bestanden en totale grootte (varianten, MB);
//  - bestanden groter dan DREMPEL_KB (standaard 600) met per bestand de pagina's die ernaar verwijzen;
//  - originelen (jpg, jpeg, png) groter dan 500 kB: die horen er niet te staan (alles hoort via astro:assets te lopen).
// Gebruik: npm run build, daarna node scripts/controleer-astro-map.mjs
// Optioneel: DREMPEL_KB=600, UITVOER=.vercel/output/static. Exitcode 1 als er een origineel van meer dan 500 kB staat.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const UITVOER = join(process.cwd(), process.env.UITVOER ?? '.vercel/output/static');
const ASTRO = join(UITVOER, '_astro');
const DREMPEL = Number(process.env.DREMPEL_KB ?? 600) * 1024;
const ORIGINEEL_MAX = 500 * 1024;

const bestanden = readdirSync(ASTRO).map((naam) => ({ naam, bytes: statSync(join(ASTRO, naam)).size }));
const totaal = bestanden.reduce((som, b) => som + b.bytes, 0);
console.log(
  `${bestanden.length} bestanden in _astro, ${(totaal / 1048576).toFixed(1)} MiB (${(totaal / 1e6).toFixed(1)} MB)`,
);

function alleTekstBestanden(map, lijst = []) {
  for (const naam of readdirSync(map)) {
    const pad = join(map, naam);
    if (statSync(pad).isDirectory()) {
      if (naam !== '_astro') alleTekstBestanden(pad, lijst);
    } else if (/\.(html|xml|txt|json)$/.test(naam)) {
      lijst.push(pad);
    }
  }
  return lijst;
}

const paginas = alleTekstBestanden(UITVOER).map((pad) => {
  const rel = relative(UITVOER, pad).replace(/\\/g, '/');
  const url = rel.endsWith('index.html') ? '/' + rel.replace(/index\.html$/, '').replace(/\/$/, '') : '/' + rel.replace(/\.html$/, '');
  return { url: url === '/' ? '/' : url, inhoud: readFileSync(pad, 'utf8') };
});

const groot = bestanden.filter((b) => b.bytes > DREMPEL).sort((a, b) => b.bytes - a.bytes);
console.log(`\nBestanden groter dan ${(DREMPEL / 1024).toFixed(0)} kB: ${groot.length}`);
for (const b of groot) {
  const sleutel = b.naam.replace(/ /g, '%20');
  const verwijzers = paginas.filter((p) => p.inhoud.includes(`/_astro/${sleutel}`) || p.inhoud.includes(`/_astro/${b.naam}`)).map((p) => p.url);
  console.log(`${(b.bytes / 1024).toFixed(0).padStart(6)} kB  ${b.naam}  ->  ${verwijzers.length ? verwijzers.join(', ') : '(geen pagina)'}`);
}

const originelen = bestanden.filter((b) => /\.(jpe?g|png)$/i.test(b.naam) && b.bytes > ORIGINEEL_MAX);
if (originelen.length) {
  console.log(`\nORIGINELEN van meer dan 500 kB in _astro: ${originelen.map((o) => o.naam).join(', ')}`);
  process.exit(1);
}
console.log('\nGeen origineel (jpg, jpeg, png) van meer dan 500 kB in _astro.');

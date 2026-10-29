// Verkleint de bronfoto's in src/assets (home, landing, portfolio), alleen waar dat nodig is.
//
// Regels:
//   - Een foto blijft ongemoeid als hij kleiner is dan 1,2 MB én zijn lange zijde hoogstens 2560 px is.
//   - Anders: lange zijde maximaal 2560 px (nooit vergroten), zelfde beeldverhouding en uitsnede, EXIF-oriëntatie
//     toegepast, sRGB, alle metadata weg (geen GPS), progressieve JPEG met mozjpeg (kwaliteit 82; 88 voor de bestanden
//     in KWALITEIT_HOOG). PNG, WebP en AVIF worden in hun eigen formaat teruggeschreven.
//   - Bestandsnamen en mappen blijven exact gelijk. `.tif`-bestanden worden niet aangeraakt: de site gebruikt ze niet
//     (Astro herkent `.tif` niet; naast elk gebruikt bestand staat een .jpg) en een andere extensie zou namen veranderen.
//
// Veiligheid: het script weigert te draaien zonder complete backup in _originelen/ (zelfde mappenstructuur, zelfde
// bestandsgroottes). De backup staat in .gitignore. Een bestand wordt eerst naar een tijdelijk bestand geschreven en
// vervangt het origineel pas als dat gelukt is.
//
// Gebruik:
//   node scripts/optimaliseer-bronfotos.mjs --droog          alleen rapporteren wat er zou gebeuren
//   node scripts/optimaliseer-bronfotos.mjs                  uitvoeren (na backup)
//   node scripts/optimaliseer-bronfotos.mjs --bestand=pad    één bestand (pad relatief aan de projectmap, voor tests)
//   --uit=map            schrijf de resultaten naar een andere map (src/assets/... blijft ongemoeid; voor voor/na-tests)
//   --kwaliteit=86       overschrijf de kwaliteit (alleen met --bestand, voor tests)
//   --hoge-kwaliteit     alleen de bestanden in KWALITEIT_HOOG, opnieuw gemaakt vanaf het origineel in _originelen/ (niet vanaf
//                        het al verkleinde bronbestand) met kwaliteit 88; het resultaat vervangt het bronbestand
// Het rapport staat ook in _originelen/rapport.json.
import { existsSync, mkdirSync, readdirSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import sharp from 'sharp';

const ROOT = new URL('../', import.meta.url).pathname.replace(/\/$/, '');
const BACKUP = join(ROOT, '_originelen');
const MAPPEN = ['src/assets/home', 'src/assets/landing', 'src/assets/portfolio'];

const MAX_ZIJDE = 2560;
const MAX_BYTES = 1.2 * 1024 * 1024;
const KWALITEIT = 82;
/**
 * Bestanden (pad relatief aan de projectmap) die met een hogere kwaliteit (88) worden bewaard: zwart-witfoto's waarvan
 * de korrel in de donkere, vlakke delen bij kwaliteit 82 zichtbaar gladder wordt (mozjpeg verwijdert fijne ruis eerst).
 * Selectie (gemeten op de 44 zwart-witfoto's die verkleind zijn): referentiekorrel in donkere vlakke delen minstens 4
 * (standaarddeviatie op 0-255), minstens 15% van de foto is zo'n vlak donker deel, en bij kwaliteit 82 blijft hooguit
 * 78% van die korrel over. Bij kwaliteit 88 blijft 77 tot 85% over (82: 68 tot 78%), bij een bestand dat ongeveer 30% groter is.
 * 6733p is de foto waarmee dit begon. Eerder gold hier 86 voor een lege lijst (banding in egale lucht).
 */
const KWALITEIT_HOOG = new Set(
  [
    'bruiloften portfolio/6733p.jpg',
    'bruiloften portfolio/108.jpg',
    'bruiloften portfolio/39.jpg',
    'experimenteel/052.jpg',
    'oostblok reportage/157.jpg',
    'portretten/01070.jpg',
    'portretten/10-28-2.jpg',
    'portretten/11-44-2.jpg',
    'portretten/a001.jpg',
    'portretten/a006.jpg',
    'portretten/a007.jpg',
    'portretten/blad-07-06 (20A-21)1.jpg',
    'portretten/tled-1.jpg',
  ].map((pad) => `src/assets/portfolio/${pad}`),
);
const KWALITEIT_HOGE_WAARDE = 88;

const args = process.argv.slice(2);
const vlag = (naam) => args.includes(`--${naam}`);
const waarde = (naam) => args.find((a) => a.startsWith(`--${naam}=`))?.slice(naam.length + 3);
const droog = vlag('droog');
const enkel = waarde('bestand');
const uitMap = waarde('uit');
const kwaliteitTest = waarde('kwaliteit') ? Number(waarde('kwaliteit')) : undefined;
const hoog = vlag('hoge-kwaliteit');

const AFBEELDING = /\.(jpe?g|png|webp|avif)$/i;

function walk(dir) {
  const uit = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const pad = join(dir, entry.name);
    if (entry.isDirectory()) uit.push(...walk(pad));
    else if (AFBEELDING.test(entry.name)) uit.push(pad);
  }
  return uit.sort((a, b) => a.localeCompare(b, 'nl', { numeric: true, sensitivity: 'base' }));
}

const mb = (bytes) => (bytes / 1024 / 1024).toFixed(2);

function controleerBackup(bestanden) {
  const ontbreekt = [];
  for (const pad of bestanden) {
    const kopie = join(BACKUP, relative(ROOT, pad));
    // Bij een eerdere run is het bronbestand al kleiner geworden; de backup mag dan niet kleiner zijn dan het bronbestand.
    if (!existsSync(kopie) || statSync(kopie).size < statSync(pad).size) ontbreekt.push(relative(ROOT, pad));
  }
  if (ontbreekt.length > 0) {
    console.error(`Geen complete backup in _originelen/ (${ontbreekt.length} bestanden ontbreken of wijken af). Eerste:`);
    for (const pad of ontbreekt.slice(0, 5)) console.error(`  ${pad}`);
    console.error('Maak eerst een backup: cp -cR src/assets _originelen/src/assets (of rsync -a), en probeer opnieuw.');
    process.exit(1);
  }
}

function kwaliteitVoor(relPad) {
  if (kwaliteitTest) return kwaliteitTest;
  return KWALITEIT_HOOG.has(relPad) ? KWALITEIT_HOGE_WAARDE : KWALITEIT;
}

async function verwerk(pad) {
  const relPad = relative(ROOT, pad);
  // Met --hoge-kwaliteit is het origineel de bron (de backup); het resultaat gaat naar `pad`.
  const bron = hoog ? join(BACKUP, relPad) : pad;
  const voor = statSync(bron).size;
  const meta = await sharp(bron, { limitInputPixels: false, failOn: 'none' }).metadata();
  // Oriëntatie 5 t/m 8 wisselt breedte en hoogte.
  const gedraaid = (meta.orientation ?? 1) >= 5;
  const breedte = gedraaid ? meta.height : meta.width;
  const hoogte = gedraaid ? meta.width : meta.height;
  const lang = Math.max(breedte, hoogte);
  const basis = { pad: relPad, voor, breedteVoor: breedte, hoogteVoor: hoogte };

  if (voor < MAX_BYTES && lang <= MAX_ZIJDE && !uitMap) {
    return { ...basis, actie: 'ongemoeid', na: voor, breedteNa: breedte, hoogteNa: hoogte };
  }

  const kwaliteit = kwaliteitVoor(relPad);
  let beeld = sharp(bron, { limitInputPixels: false, failOn: 'none' })
    .rotate() // past de EXIF-oriëntatie toe (en verwijdert die uit de uitvoer)
    .resize({ width: MAX_ZIJDE, height: MAX_ZIJDE, fit: 'inside', withoutEnlargement: true });
  // Grijswaardefoto's blijven één kanaal (zelfde uiterlijk, kleiner bestand); alles anders wordt sRGB.
  if (meta.space !== 'b-w') beeld = beeld.toColourspace('srgb');

  const ext = pad.slice(pad.lastIndexOf('.')).toLowerCase();
  if (ext === '.jpg' || ext === '.jpeg') beeld = beeld.jpeg({ quality: kwaliteit, progressive: true, mozjpeg: true });
  else if (ext === '.png') beeld = beeld.png({ compressionLevel: 9, palette: false });
  else if (ext === '.webp') beeld = beeld.webp({ quality: kwaliteit });
  else if (ext === '.avif') beeld = beeld.avif({ quality: kwaliteit });

  const { data, info } = await beeld.toBuffer({ resolveWithObject: true });
  const resultaat = { ...basis, kwaliteit, na: data.length, breedteNa: info.width, hoogteNa: info.height };
  // Bij --hoge-kwaliteit is `voor` de grootte van het origineel; `huidig` is het bronbestand dat nu in src/assets staat.
  if (hoog) resultaat.huidig = statSync(pad).size;

  const moetSchrijven = uitMap ? true : lang > MAX_ZIJDE || data.length < voor;
  if (!moetSchrijven) return { ...resultaat, actie: 'niet-kleiner', na: voor };
  if (droog) return { ...resultaat, actie: 'zou-verkleinen' };

  const doel = uitMap ? join(ROOT, uitMap, relPad) : pad;
  mkdirSync(dirname(doel), { recursive: true });
  const tijdelijk = `${doel}.tmp-optimaliseer`;
  writeFileSync(tijdelijk, data);
  renameSync(tijdelijk, doel);
  return { ...resultaat, actie: 'verkleind' };
}

const alle = hoog
  ? [...KWALITEIT_HOOG].map((pad) => join(ROOT, pad))
  : enkel
    ? [join(ROOT, enkel)]
    : MAPPEN.flatMap((map) => walk(join(ROOT, map)));
if (hoog) {
  const ontbreekt = alle.filter((pad) => !existsSync(join(BACKUP, relative(ROOT, pad))));
  if (ontbreekt.length > 0) {
    console.error(`Origineel ontbreekt in _originelen/ voor ${ontbreekt.length} bestanden, bijvoorbeeld ${relative(ROOT, ontbreekt[0])}.`);
    process.exit(1);
  }
} else if (!droog && !uitMap) controleerBackup(alle);

const resultaten = [];
const PARALLEL = 3;
let volgende = 0;
async function werker() {
  while (volgende < alle.length) {
    const pad = alle[volgende++];
    try {
      const r = await verwerk(pad);
      resultaten.push(r);
      if (r.actie !== 'ongemoeid') {
        console.log(
          `${r.actie.padEnd(15)} ${mb(r.voor).padStart(7)} → ${mb(r.na).padStart(6)} MB  ${r.breedteVoor}×${r.hoogteVoor} → ${r.breedteNa}×${r.hoogteNa}  ${r.pad}`,
        );
      }
    } catch (fout) {
      console.error(`FOUT ${relative(ROOT, pad)}: ${fout.message}`);
      resultaten.push({ pad: relative(ROOT, pad), actie: 'fout', voor: statSync(pad).size, na: statSync(pad).size });
    }
  }
}
await Promise.all(Array.from({ length: PARALLEL }, werker));

const verkleind = resultaten.filter((r) => r.actie === 'verkleind' || r.actie === 'zou-verkleinen');
const totaalVoor = resultaten.reduce((som, r) => som + r.voor, 0);
const totaalNa = resultaten.reduce((som, r) => som + r.na, 0);
const winsten = [...verkleind].sort((a, b) => b.voor - b.na - (a.voor - a.na)).slice(0, 10);

console.log('');
console.log(`Bestanden bekeken:   ${resultaten.length}`);
console.log(`${droog ? 'Zouden verkleinen:  ' : 'Verkleind:           '} ${verkleind.length}`);
console.log(`Ongemoeid:           ${resultaten.filter((r) => r.actie === 'ongemoeid').length}`);
console.log(`Niet kleiner:        ${resultaten.filter((r) => r.actie === 'niet-kleiner').length}`);
console.log(`Fouten:              ${resultaten.filter((r) => r.actie === 'fout').length}`);
console.log(`Totaal voor: ${mb(totaalVoor)} MB, na: ${mb(totaalNa)} MB (${mb(totaalVoor - totaalNa)} MB winst)`);
console.log('10 grootste winsten:');
for (const r of winsten) console.log(`  ${mb(r.voor - r.na).padStart(7)} MB  ${mb(r.voor)} → ${mb(r.na)} MB  ${r.pad}`);

if (hoog) {
  console.log('');
  console.log('Nieuwe grootte (kwaliteit 88, vanaf het origineel) tegenover het bronbestand van daarvoor (kwaliteit 82):');
  for (const r of resultaten.filter((x) => x.huidig !== undefined)) {
    console.log(`  ${(r.huidig / 1024).toFixed(0).padStart(5)} KB → ${(r.na / 1024).toFixed(0).padStart(5)} KB  ${r.pad}`);
  }
}

if (!droog && !enkel && !uitMap && !hoog) {
  mkdirSync(BACKUP, { recursive: true });
  writeFileSync(
    join(BACKUP, 'rapport.json'),
    JSON.stringify({ datum: new Date().toISOString(), totaalVoor, totaalNa, winsten, resultaten }, null, 2),
  );
}

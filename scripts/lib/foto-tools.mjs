// Gedeelde hulpmiddelen voor de foto-scripts (inventaris, mapping): bestanden zoeken, afmetingen, inhoudshash en een
// perceptuele hash (64-bit dHash op een verkleinde grijswaardeversie).
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import sharp from 'sharp';

export const ROOT = new URL('../../', import.meta.url).pathname.replace(/\/$/, '');
export const PORTFOLIO = `${ROOT}/src/assets/portfolio`;
export const SCRATCH = process.env.FOTO_SCRATCH ?? '/tmp/foto-scratch';

/** Extensies die Astro (sharp) als afbeelding kent. `.tif` hoort er niet bij (alleen `.tiff`), zie de inventaris. */
export const ASTRO_EXT = /\.(jpe?g|png|webp|avif|tiff)$/i;
export const ALLE_EXT = /\.(jpe?g|png|webp|avif|tiff?)$/i;

export function walk(dir, filter = ALLE_EXT) {
  const uit = [];
  for (const naam of readdirSync(dir, { withFileTypes: true })) {
    const pad = join(dir, naam.name);
    if (naam.isDirectory()) uit.push(...walk(pad, filter));
    else if (filter.test(naam.name)) uit.push(pad);
  }
  return uit.sort((a, b) => a.localeCompare(b, 'nl', { numeric: true, sensitivity: 'base' }));
}

export const sha1 = (pad) => createHash('sha1').update(readFileSync(pad)).digest('hex');

/** 64-bit dHash als hexstring (16 tekens): vergelijkt in een 9×8 grijswaardebeeld elke pixel met zijn rechterbuur. */
export async function dhash(bron) {
  const { data } = await sharp(bron, { limitInputPixels: false, failOn: 'none' })
    .rotate()
    .greyscale()
    .resize(9, 8, { fit: 'fill' })
    .raw()
    .toBuffer({ resolveWithObject: true });
  let bits = 0n;
  for (let y = 0; y < 8; y += 1) {
    for (let x = 0; x < 8; x += 1) {
      bits = (bits << 1n) | (data[y * 9 + x] > data[y * 9 + x + 1] ? 1n : 0n);
    }
  }
  return bits.toString(16).padStart(16, '0');
}

export function afstand(a, b) {
  let x = BigInt(`0x${a}`) ^ BigInt(`0x${b}`);
  let n = 0;
  while (x) {
    n += Number(x & 1n);
    x >>= 1n;
  }
  return n;
}

/** Breedte en hoogte zoals de browser ze toont (EXIF-oriëntatie meegerekend, zoals Astro). */
export async function afmetingen(bron) {
  const meta = await sharp(bron, { limitInputPixels: false, failOn: 'none' }).metadata();
  const gedraaid = (meta.orientation ?? 1) >= 5;
  return gedraaid ? { width: meta.height, height: meta.width } : { width: meta.width, height: meta.height };
}

export const oriëntatie = ({ width, height }) => {
  const v = width / height;
  return v > 1.05 ? 'liggend' : v < 0.95 ? 'staand' : 'vierkant';
};

export const kb = (bytes) => `${(bytes / 1024).toFixed(0)} KB`;
export const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

/** Haalt de bestanden onder `prefix` uit HEAD (git) en schrijft ze naar SCRATCH/oud/<pad>. Geeft de relatieve paden terug. */
export function oudeBestandenUitGit(prefix = 'src/assets/portfolio/', ref = 'HEAD') {
  const lijst = execFileSync('git', ['ls-tree', '-r', '--name-only', ref, '--', prefix], { cwd: ROOT, encoding: 'utf8' })
    .split('\n')
    .filter((p) => ALLE_EXT.test(p));
  for (const pad of lijst) {
    const doel = join(SCRATCH, 'oud', pad);
    mkdirSync(dirname(doel), { recursive: true });
    writeFileSync(doel, execFileSync('git', ['show', `${ref}:${pad}`], { cwd: ROOT, maxBuffer: 1 << 30 }));
  }
  return lijst;
}

export const rel = (pad) => relative(ROOT, pad);
export const statBytes = (pad) => statSync(pad).size;

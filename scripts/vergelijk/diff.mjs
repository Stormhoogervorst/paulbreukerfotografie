// Vergelijkt voor-*.png met na-*.png (pixelverschil) met sharp. Gebruik: node scripts/vergelijk/diff.mjs <slug>
import sharp from 'sharp';
const slug = process.argv[2] ?? 'fotograaf-bruiloft';
for (const breedte of [1440, 390]) {
  const a = sharp(`scripts/vergelijk/voor-${slug}-${breedte}.png`);
  const b = sharp(`scripts/vergelijk/na-${slug}-${breedte}.png`);
  const [ma, mb] = [await a.metadata(), await b.metadata()];
  if (ma.width !== mb.width || ma.height !== mb.height) {
    console.log(`${breedte}: afmetingen verschillen ${ma.width}x${ma.height} vs ${mb.width}x${mb.height}`);
    continue;
  }
  const [ra, rb] = [await a.raw().toBuffer(), await b.raw().toBuffer()];
  let verschil = 0;
  let eerste = -1;
  for (let i = 0; i < ra.length; i += ma.channels) {
    if (Math.abs(ra[i] - rb[i]) + Math.abs(ra[i + 1] - rb[i + 1]) + Math.abs(ra[i + 2] - rb[i + 2]) > 12) {
      verschil++;
      if (eerste < 0) eerste = Math.floor(i / ma.channels / ma.width);
    }
  }
  console.log(`${breedte}: ${ma.width}x${ma.height}, ${verschil} afwijkende pixels${eerste >= 0 ? ` (eerste op y=${eerste})` : ''}`);
}

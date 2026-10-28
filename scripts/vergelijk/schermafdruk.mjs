/**
 * Schermafdrukken van een pagina op 1440 en 390 px breed, voor een voor/na-vergelijking.
 * Gebruik: node scripts/vergelijk/schermafdruk.mjs <voor|na> [pad]   (standaard /fotograaf-bruiloft)
 * Env: BASE_URL (standaard http://localhost:4321). Schrijft scripts/vergelijk/<voor|na>-<slug>-<breedte>.png.
 * `prefers-reduced-motion: reduce` houdt de scroll-gekoppelde marquee stil, zodat afdrukken vergelijkbaar zijn.
 */
import { chromium } from 'playwright';

const fase = process.argv[2] ?? 'voor';
const pad = process.argv[3] ?? '/fotograaf-bruiloft';
const base = process.env.BASE_URL ?? 'http://localhost:4321';
const slug = pad.replace(/^\//, '').replace(/\//g, '-') || 'home';
const maten = [
  { breedte: 1440, hoogte: 900 },
  { breedte: 390, hoogte: 844 },
];

const browser = await chromium.launch();
for (const { breedte, hoogte } of maten) {
  const context = await browser.newContext({ viewport: { width: breedte, height: hoogte }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(base + pad, { waitUntil: 'networkidle' });
  // Door de pagina scrollen zodat lazy afbeeldingen laden, daarna terug naar boven.
  const totaal = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < totaal; y += hoogte / 2) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(250);
  }
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  const bestand = `scripts/vergelijk/${fase}-${slug}-${breedte}.png`;
  await page.screenshot({ path: bestand, fullPage: true });
  console.log(bestand);
  await context.close();
}
await browser.close();

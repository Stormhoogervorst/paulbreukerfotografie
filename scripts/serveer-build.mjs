// Serveert de statische productiebuild (.vercel/output/static) zoals Vercel dat doet: clean URLs en de headers uit
// .vercel/output/config.json (onder andere Cache-Control: immutable voor /_astro/*). `astro preview` werkt niet met de
// Vercel-adapter, dus dit is de lokale vervanger voor de meetscripts (meet-canvas, meet-afbeeldingen, meet-lcp, portfolio-test).
// Gebruik: npm run build, daarna
//   node scripts/serveer-build.mjs            (poort 4322; andere poort: PORT=4400)
import { createServer } from 'node:http';
import { brotliCompressSync, constants, gzipSync } from 'node:zlib';
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';

const UITVOER = join(process.cwd(), '.vercel', 'output');
const STATISCH = join(UITVOER, 'static');
const PORT = Number(process.env.PORT ?? 4322);
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
};

const COMPRIMEER = new Set(['.html', '.css', '.js', '.svg', '.xml', '.txt', '.json', '.ico']);

if (!existsSync(STATISCH)) {
  console.error(`${STATISCH} bestaat niet. Draai eerst: npm run build`);
  process.exit(2);
}

// Alleen de routes met `headers` en `continue: true` (zo schrijft de adapter Cache-Control voor /_astro).
const config = JSON.parse(readFileSync(join(UITVOER, 'config.json'), 'utf8'));
const headerRoutes = (config.routes ?? [])
  .filter((route) => route.headers && route.continue && route.src)
  .map((route) => ({ regex: new RegExp(route.src), headers: route.headers }));

createServer((verzoek, antwoord) => {
  const url = new URL(verzoek.url, 'http://x');
  const pad = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '');
  const kandidaten = [join(STATISCH, pad), join(STATISCH, pad, 'index.html'), join(STATISCH, `${pad}.html`)];
  const bestand = kandidaten.find((kandidaat) => existsSync(kandidaat) && statSync(kandidaat).isFile());
  const headers = {};
  for (const route of headerRoutes) if (route.regex.test(url.pathname)) Object.assign(headers, route.headers);
  if (!bestand) {
    antwoord.writeHead(404, { ...headers, 'content-type': TYPES['.html'] });
    antwoord.end(readFileSync(join(STATISCH, '404.html')));
    return;
  }
  const extensie = extname(bestand);
  const type = TYPES[extensie] ?? 'application/octet-stream';
  // Vercel comprimeert tekstbestanden (brotli of gzip); doe dat hier ook, anders meten HTML, CSS en JS veel te zwaar.
  if (COMPRIMEER.has(extensie)) {
    const accepteert = String(verzoek.headers['accept-encoding'] ?? '');
    const inhoud = readFileSync(bestand);
    const brotli = /\bbr\b/.test(accepteert);
    const gzip = /\bgzip\b/.test(accepteert);
    const body = brotli
      ? brotliCompressSync(inhoud, { params: { [constants.BROTLI_PARAM_QUALITY]: 5 } })
      : gzip
        ? gzipSync(inhoud)
        : inhoud;
    antwoord.writeHead(200, {
      ...headers,
      'content-type': type,
      'content-length': body.length,
      vary: 'Accept-Encoding',
      ...(brotli ? { 'content-encoding': 'br' } : gzip ? { 'content-encoding': 'gzip' } : {}),
    });
    antwoord.end(body);
    return;
  }
  antwoord.writeHead(200, { ...headers, 'content-type': type, 'content-length': statSync(bestand).size });
  createReadStream(bestand).pipe(antwoord);
}).listen(PORT, '127.0.0.1', () => console.log(`Build op http://127.0.0.1:${PORT} (${STATISCH})`));

/**
 * Deterministische layout voor het oneindige canvas op /portfolio (zonder DOM, ook in Node bruikbaar).
 *
 * Eén tegel = kolommen × rijen cellen in een verspringend raster (oneven rijen een halve cel naar
 * rechts). Elke foto staat er één keer in; is de tegel kleiner dan 2 × 2 schermen of zijn er minder
 * dan `minCount` foto's, dan worden de foto's herhaald tot hij groot genoeg is en zijn alle cellen
 * gevuld. Zonder aanvulling blijven de restcellen van de laatste rij(en) leeg. De tegel herhaalt
 * zich naadloos: daarvoor is het aantal rijen altijd even.
 */

export interface LayoutPhoto {
  id: string;
  series: string | null;
  width: number;
  height: number;
}

export interface LayoutOptions {
  cellW: number;
  cellH: number;
  viewportW: number;
  viewportH: number;
  seed?: number;
  /** Minimale ruimte tussen buren in px. */
  gap?: number;
  minCount?: number;
}

export interface LayoutItem {
  /** Index in de foto-array. */
  photo: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Layout {
  cols: number;
  rows: number;
  cellW: number;
  cellH: number;
  tileW: number;
  tileH: number;
  items: LayoutItem[];
}

const SCALES = [0.55, 0.75, 1, 1.25];
const SCALE_WEIGHTS = [0.25, 0.35, 0.27, 0.13];
const MAX_SCALE = 1.25;

/** Mulberry32: klein, snel en deterministisch. */
export function createRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(list: T[], random: () => number): T[] {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function pickScale(random: () => number): number {
  let r = random();
  for (let i = 0; i < SCALES.length; i += 1) {
    r -= SCALE_WEIGHTS[i];
    if (r <= 0) return SCALES[i];
  }
  return SCALES[SCALES.length - 1];
}

function gridFor(count: number): { cols: number; rows: number } {
  const cols = Math.max(1, Math.ceil(Math.sqrt(count * 1.3)));
  const rows = Math.ceil(count / cols);
  return { cols, rows: rows + (rows % 2) };
}

export function generateLayout(photos: LayoutPhoto[], options: LayoutOptions): Layout {
  const { cellW, cellH, viewportW, viewportH, seed = 20261028, gap = 20, minCount = 60 } = options;
  const random = createRandom(seed);
  const total = photos.length;
  if (total === 0) return { cols: 0, rows: 0, cellW, cellH, tileW: 0, tileH: 0, items: [] };

  // Aantal plaatsen: minstens alle foto's één keer, aangevuld tot de tegel 2 × 2 schermen dekt.
  let count = total;
  for (;;) {
    const { cols, rows } = gridFor(count);
    const bigEnough = cols * cellW >= viewportW * 2 && rows * cellH >= viewportH * 2;
    if ((bigEnough && count >= Math.min(minCount, total * 20)) || count >= total * 20) break;
    count += 1;
  }
  const { cols, rows } = gridFor(count);
  const cells = cols * rows;
  // Wordt er aangevuld, dan meteen alle cellen; anders blijven de restcellen leeg.
  if (count > total) count = cells;

  // Volgorde: opeenvolgende geschudde rondes, zodat herhalingen ver uit elkaar liggen.
  const queue: number[] = [];
  while (queue.length < count) {
    const indices = photos.map((_, i) => i);
    queue.push(...shuffle(indices, random).slice(0, count - queue.length));
  }

  // Lege cellen verspreid over de tegel.
  const empty = new Set(shuffle([...Array(cells).keys()], random).slice(0, cells - count));

  const grid: number[] = new Array(cells).fill(-1);
  const at = (c: number, r: number) =>
    grid[(((r % rows) + rows) % rows) * cols + (((c % cols) + cols) % cols)];

  /** Buren die al geplaatst zijn (links, rij erboven, en via de wrap rechts/onder). */
  const neighbours = (c: number, r: number): number[] => {
    const shifted = r % 2 === 1;
    const above = shifted ? [c, c + 1] : [c - 1, c];
    const below = shifted ? [c, c + 1] : [c - 1, c];
    const list = [at(c - 1, r), at(c + 1, r), ...above.map((x) => at(x, r - 1))];
    if (r === rows - 1) list.push(...below.map((x) => at(x, 0)));
    return list.filter((value) => value >= 0);
  };

  for (let cell = 0; cell < cells; cell += 1) {
    if (empty.has(cell)) continue;
    const c = cell % cols;
    const r = Math.floor(cell / cols);
    const near = neighbours(c, r);
    const nearIds = new Set(near.map((i) => photos[i].id));
    const nearSeries = new Set(near.map((i) => photos[i].series).filter(Boolean));

    let pick = queue.findIndex(
      (i) => !nearIds.has(photos[i].id) && !(photos[i].series && nearSeries.has(photos[i].series)),
    );
    if (pick === -1) pick = queue.findIndex((i) => !nearIds.has(photos[i].id));
    if (pick === -1) pick = 0;
    grid[cell] = queue.splice(pick, 1)[0];
  }

  const boxW = cellW - gap;
  const boxH = cellH - gap;
  const items: LayoutItem[] = [];
  for (let cell = 0; cell < cells; cell += 1) {
    const index = grid[cell];
    if (index < 0) continue;
    const c = cell % cols;
    const r = Math.floor(cell / cols);
    const photo = photos[index];
    const fit = Math.min(boxW / photo.width, boxH / photo.height) * (pickScale(random) / MAX_SCALE);
    const w = Math.max(1, Math.round(photo.width * fit));
    const h = Math.max(1, Math.round(photo.height * fit));
    const slackX = boxW - w;
    const slackY = boxH - h;
    const x0 = c * cellW + (r % 2 === 1 ? cellW / 2 : 0) + gap / 2;
    const y0 = r * cellH + gap / 2;
    items.push({
      photo: index,
      x: Math.round(x0 + slackX / 2 + (random() - 0.5) * slackX * 0.8),
      y: Math.round(y0 + slackY / 2 + (random() - 0.5) * slackY * 0.8),
      w,
      h,
    });
  }

  return { cols, rows, cellW, cellH, tileW: cols * cellW, tileH: rows * cellH, items };
}

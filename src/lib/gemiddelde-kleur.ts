import sharp from 'sharp';

/**
 * Gemiddeld kleurvlak van een bronfoto als `#rrggbb`, voor de achtergrond van een foto tijdens het laden (canvas).
 * Berekend bij de build: de foto wordt (met "shrink on load", dus snel) verkleind tot 32 px en sharp-`stats()` geeft
 * het gemiddelde per kanaal. Het resultaat wordt per bestand onthouden.
 */
const FALLBACK = '#e6e6e6';
const cache = new Map<string, Promise<string>>();

const hex = (waarde: number) => Math.max(0, Math.min(255, Math.round(waarde))).toString(16).padStart(2, '0');

export function gemiddeldeKleur(image: { src: string; fsPath?: string } | object): Promise<string> {
  const pad = (image as { fsPath?: string }).fsPath;
  if (!pad) return Promise.resolve(FALLBACK);
  let kleur = cache.get(pad);
  if (!kleur) {
    kleur = (async () => {
      try {
        const klein = await sharp(pad, { failOn: 'none', limitInputPixels: false })
          .rotate()
          .resize(32, 32, { fit: 'inside' })
          .toColourspace('srgb')
          .removeAlpha()
          .png()
          .toBuffer();
        const { channels } = await sharp(klein).stats();
        const [r, g, b] = channels.length >= 3 ? channels : [channels[0], channels[0], channels[0]];
        return `#${hex(r.mean)}${hex(g.mean)}${hex(b.mean)}`;
      } catch {
        return FALLBACK;
      }
    })();
    cache.set(pad, kleur);
  }
  return kleur;
}

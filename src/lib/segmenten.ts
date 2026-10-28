import type { Segment } from '../data/landing/types';

/** Platte tekst van een lijst Segmenten (zonder opmaak en zonder links), voor bijvoorbeeld JSON-LD. */
export function segmentenTekst(segmenten: Segment[]): string {
  return segmenten.map((segment) => (typeof segment === 'string' ? segment : segment.tekst)).join('');
}

/**
 * Splitst één lopende tekst in Segmenten: de opgegeven woorden worden links, de rest blijft gewone tekst.
 * De tekst blijft in de bron één string en wordt letterlijk gelijk teruggegeven (alle segmenten achter elkaar
 * geven weer de originele tekst). De links moeten in de volgorde van de tekst staan; ontbreekt een woord in de tekst,
 * dan faalt de build.
 */
export function linkSegmenten(tekst: string, links: Array<{ tekst: string; href: string }>): Segment[] {
  const segmenten: Segment[] = [];
  let rest = tekst;

  for (const link of links) {
    const index = rest.indexOf(link.tekst);
    if (index === -1) {
      throw new Error(`linkSegmenten: "${link.tekst}" komt niet (meer) voor in de tekst "${rest}".`);
    }
    if (index > 0) segmenten.push(rest.slice(0, index));
    segmenten.push({ tekst: link.tekst, href: link.href });
    rest = rest.slice(index + link.tekst.length);
  }

  if (rest.length > 0) segmenten.push(rest);
  return segmenten;
}

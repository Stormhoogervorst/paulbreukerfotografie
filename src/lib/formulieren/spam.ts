/**
 * Spamwering voor /api/aanvraag, in twee lagen naast de honeypot en de Origin-controle:
 *
 * 1. Formuliertoken: het script haalt bij het formulier een token op (GET /api/aanvraag) met de servertijd en een
 *    HMAC-handtekening. Een bot kan de tijd dus niet vervalsen. Ongeldig of binnen MIN_TIJD_MS verzonden: bot. Een
 *    verzending zonder token (formulier zonder JavaScript, of een bot die direct post) mag wel, maar telt mee in de score.
 * 2. Inhoudsfilter: een score op de tekst (links, reclamewoorden, vreemd schrift, enzovoort). Vanaf SPAM_SCORE gaat er
 *    niets weg (schijnsucces); vanaf VERDACHT_SCORE krijgt Paul de mail met "[Mogelijk reclame]" in het onderwerp en
 *    krijgt de afzender geen bevestiging. Bij twijfel liever doorsturen dan weggooien: een gemiste bruiloft kost meer dan
 *    een reclamemail.
 *
 * Woorden en gewichten aanpassen: zie REGELS hieronder. Elke regel telt één keer, hoe vaak het woord ook voorkomt.
 */
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

// ---------------------------------------------------------------------------
// Formuliertoken
// ---------------------------------------------------------------------------

/** Minimale tijd tussen het ophalen van het token en het verzenden; sneller is een bot. */
export const MIN_TIJD_MS = 3000;
/** Na deze tijd is een token verlopen (tabblad lang open laten staan); dan telt het als "geen token". */
export const MAX_TIJD_MS = 24 * 60 * 60 * 1000;

export type TokenStatus = 'geldig' | 'ontbreekt' | 'verlopen' | 'te-snel' | 'ongeldig';

/**
 * Sleutel voor de handtekening: FORM_SECRET, anders afgeleid van de Resend-sleutel (dan is er geen extra variabele
 * nodig), anders (alleen in dev) een vaste waarde. `undefined` als er niets is.
 */
export function tokenSleutel(formSecret?: string, resendKey?: string, dev = false): string | undefined {
  if (formSecret) return formSecret;
  if (resendKey) return createHash('sha256').update(`formuliertoken:${resendKey}`).digest('hex');
  return dev ? 'dev-formuliertoken' : undefined;
}

const handtekening = (sleutel: string, tijd: string): string =>
  createHmac('sha256', sleutel).update(tijd).digest('base64url');

export function maakToken(sleutel: string, nu = Date.now()): string {
  const tijd = String(nu);
  return `${tijd}.${handtekening(sleutel, tijd)}`;
}

export function controleerToken(sleutel: string | undefined, token: unknown, nu = Date.now()): TokenStatus {
  if (typeof token !== 'string' || token === '') return 'ontbreekt';
  if (!sleutel) return 'ontbreekt';

  const [tijd, hmac, ...rest] = token.split('.');
  if (!tijd || !hmac || rest.length > 0 || !/^\d{10,16}$/.test(tijd)) return 'ongeldig';

  const verwacht = Buffer.from(handtekening(sleutel, tijd));
  const gekregen = Buffer.from(hmac);
  if (verwacht.length !== gekregen.length || !timingSafeEqual(verwacht, gekregen)) return 'ongeldig';

  const leeftijd = nu - Number(tijd);
  if (leeftijd < MIN_TIJD_MS) return 'te-snel'; // ook een tijd in de toekomst
  if (leeftijd > MAX_TIJD_MS) return 'verlopen';
  return 'geldig';
}

// ---------------------------------------------------------------------------
// Inhoudsfilter
// ---------------------------------------------------------------------------

/** Vanaf deze score: niets versturen (schijnsucces). */
export const SPAM_SCORE = 5;
/** Vanaf deze score: wel naar Paul, met "[Mogelijk reclame]" in het onderwerp en zonder bevestiging aan de afzender. */
export const VERDACHT_SCORE = 3;

export type Oordeel = 'ok' | 'verdacht' | 'spam';

export interface Beoordeling {
  oordeel: Oordeel;
  score: number;
  /** Namen van de regels die raakten (geen persoonsgegevens, mag in het log). */
  redenen: string[];
}

interface Regel {
  naam: string;
  gewicht: number;
  patroon: RegExp;
}

/**
 * Reclamewoorden (Engels en Nederlands). De tekst is vooraf naar kleine letters gezet en ontdaan van accenten.
 * Gewicht 3: komt in een echte aanvraag voor een fotograaf eigenlijk nooit voor. Gewicht 2: sterk verdacht. Gewicht 1: zwak.
 */
const REGELS: Regel[] = [
  // SEO, links en vindbaarheid
  { naam: 'seo', gewicht: 3, patroon: /\bseo\b|search engine optimi[sz]ation|zoekmachine ?optimali[sz]atie/ },
  { naam: 'backlinks', gewicht: 3, patroon: /\bback ?links?\b|link ?building|guest ?post|gastblog|sponsored (post|article)|domain authority|\bda\s?\/\s?dr\b/ },
  { naam: 'google-ranking', gewicht: 3, patroon: /(first|1st|top) page (of|on) google|eerste pagina (van|in) google|(rank|ranking|ranked|hoger) (higher |beter )?(in|on|op) google|google (ranking|positie)/ },
  { naam: 'verkeer', gewicht: 2, patroon: /(website|organic|more|meer) (traffic|verkeer|bezoekers)|traffic to your (site|website)/ },
  // Webdesign, apps, marketing
  { naam: 'webdesign', gewicht: 2, patroon: /web ?design|website (re)?design|redesign (of )?your website|(app|website|web|software) development|wordpress (developer|expert)/ },
  { naam: 'marketing', gewicht: 2, patroon: /digital marketing|online marketing|(social media|smm) (marketing|management|manager)|marketing (agency|bureau|services|diensten)|lead ?gen(eration)?|(more|meer) (leads|klanten|customers|clients|sales)|grow your business|increase your (sales|revenue|bookings)|conversion rate/ },
  { naam: 'outsourcing', gewicht: 2, patroon: /outsourc|virtual assistant|offshore|white ?label|dropshipping|freelancers? (from|in) (india|pakistan|bangladesh|the philippines)/ },
  { naam: 'ai-dienst', gewicht: 2, patroon: /\bai (chatbot|agent|receptionist|assistant|automation)s?\b|automate your (business|bookings|sales)/ },
  { naam: 'reviews-kopen', gewicht: 3, patroon: /(buy|kopen|koop) (google )?reviews|(more|meer) (google )?reviews|(instagram|tiktok|youtube) (followers|volgers|likes)/ },
  // Financieel en klassieke spam
  { naam: 'crypto-geld', gewicht: 3, patroon: /crypto|bitcoin|\bbtc\b|forex|investment opportunit|binary option|\bloan\b|lening aanbod|passive income/ },
  { naam: 'klassieke-spam', gewicht: 3, patroon: /viagra|cialis|\bcbd\b|porn|\bsex\b|dating site|escort service/ },
  { naam: 'gokken', gewicht: 2, patroon: /online casino|casino bonus|\bbetting\b|sportsbook|gokken/ },
  // Verkooptaal
  { naam: 'aanbieding', gewicht: 2, patroon: /free (trial|audit|consultation|quote|analysis|report)|gratis (seo|website)?-?(analyse|audit|scan)|limited time|special offer|(\d+ ?% )(off|discount|korting)|per month|\/ ?month|\bper maand\b.*\b(pakket|abonnement)/ },
  { naam: 'afmelden', gewicht: 3, patroon: /unsubscribe|opt[ -]?out|reply (with )?["']?(stop|no|remove)|reageer met ["']?(stop|nee)|niet (meer )?geinteresseerd\?? (antwoord|reageer)/ },
  { naam: 'dollar', gewicht: 1, patroon: /\$\s?\d|\d\s?(usd|dollars?)\b/ },
  // Typische openingszinnen van reclamemails
  { naam: 'aanhef', gewicht: 2, patroon: /dear (sir|madam|website owner|business owner|team|owner)|hello (sir|team|there,? i)|hi team\b|beste (website ?eigenaar|ondernemer|eigenaar)|geachte (heer|mevrouw|ondernemer)/ },
  { naam: 'jouw-website', gewicht: 1, patroon: /(your|uw|jouw|je) (website|site|webshop)\b|came across your|i (was|have been) (checking|looking at|reviewing|browsing)|kwam (jullie|uw|jouw|je) (website|bedrijf)/ },
  { naam: 'bel-mij', gewicht: 1, patroon: /whats ?app( me| us| \+| at)|schedule a (quick )?(call|meeting)|book a (call|demo)|15[- ]min(ute)? (call|chat)|calendly\.com/ },
];

/** Links: http(s), www. of een kale domeinnaam met een veelgebruikte extensie. */
const LINK = /\bhttps?:\/\/\S+|\bwww\.\S+|\b[a-z0-9-]+\.(com|net|org|io|co|biz|info|xyz|online|site|store|shop|top|ru|cn|in|pk|ai|app|agency|digital|marketing|nl|be|de|eu)\b(\/\S*)?/g;
const HTML_LINK = /<a\s[^>]*href|\[url[=\]]|\[link[=\]]/i;
const EMAIL = /[^\s@]+@[^\s@]+\.[a-z]{2,}/g;
/** Letters uit schriften die een Nederlandse aanvraag niet gebruikt (Cyrillisch, Chinees, Japans, Koreaans, Arabisch, Hebreeuws, Thai, Devanagari). */
const VREEMD_SCHRIFT = /[Ѐ-ӿ֐-ۿऀ-ॿ฀-๿぀-ヿ㐀-鿿가-힯]/g;

const normaliseer = (tekst: string): string =>
  tekst
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

export interface SpamInvoer {
  /** Naam (of namen) van de afzender. */
  naam?: string;
  /** Alle vrije tekst uit het formulier (bericht, locatie, enzovoort). */
  teksten: string[];
  token: TokenStatus;
}

export function beoordeel({ naam = '', teksten, token }: SpamInvoer): Beoordeling {
  const redenen: string[] = [];
  let score = 0;
  const raak = (reden: string, punten: number) => {
    redenen.push(reden);
    score += punten;
  };

  const ruw = [naam, ...teksten].join('\n');
  const tekst = normaliseer(ruw);

  // Geen (geldig) token: geen JavaScript, of een bot die direct naar de API post. Op zich geen spam.
  if (token === 'ontbreekt' || token === 'verlopen') raak(`token-${token}`, 1);

  if (HTML_LINK.test(ruw)) raak('html-link', SPAM_SCORE);

  const links = tekst.match(LINK)?.length ?? 0;
  if (links >= 3) raak('links-3+', 4);
  else if (links === 2) raak('links-2', 2);
  else if (links === 1) raak('link', 1);

  if ((normaliseer(naam).match(LINK)?.length ?? 0) > 0) raak('link-in-naam', SPAM_SCORE);

  if ((normaliseer(teksten.join('\n')).match(EMAIL)?.length ?? 0) > 0) raak('mailadres-in-bericht', 1);

  const letters = ruw.match(/\p{L}/gu)?.length ?? 0;
  const vreemd = ruw.match(VREEMD_SCHRIFT)?.length ?? 0;
  if (letters > 0 && vreemd / letters > 0.2) raak('vreemd-schrift', 4);

  for (const regel of REGELS) if (regel.patroon.test(tekst)) raak(regel.naam, regel.gewicht);

  const oordeel: Oordeel = score >= SPAM_SCORE ? 'spam' : score >= VERDACHT_SCORE ? 'verdacht' : 'ok';
  return { oordeel, score, redenen };
}

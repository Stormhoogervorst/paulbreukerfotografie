/**
 * Oneindig canvas voor /portfolio en /portfolio/portretten (gedeeld; markup en data komen van
 * src/components/canvas/FotoCanvas.astro).
 * - Wereld: een tegel uit generateLayout die via modulo in beide richtingen herhaalt.
 * - Virtualisatie: alleen foto's binnen het beeld plus een halve schermhoogte marge staan in de DOM (Map met sleutel
 *   `${fotoId}:${kx}:${ky}`), met een maximum per frame en in totaal. Een tegel krijgt zijn afbeelding op het moment dat hij
 *   wordt aangemeld, dus alleen foto's in of vlak bij het beeld laden; bij slepen laden nieuwe foto's mee. (Native
 *   `loading="lazy"` is hier niet bruikbaar: gemeten met 30 lazy-afbeeldingen in een getransformeerde wereld binnen een
 *   container met overflow: hidden (800 px breed, venster 1440 px): Chromium laadde er 8 en WebKit 6, dus de drempel is de
 *   afstand tot het venster (niet tot het canvas) en verschilt per browser. De geometrie hierboven is voorspelbaar.)
 *   Er is geen vooraf laden.
 * - Tegels: achtergrond = gemiddelde kleur van de foto, miniatuur (alleen AVIF) die in 150 ms invaagt (alleen opacity).
 * - Lightbox: de grote versie laadt pas na een klik, met de miniatuur als tijdelijke weergave; daarna laden alleen de vorige
 *   en volgende foto voor. Vorige/volgende: knoppen en pijltjestoetsen, in de volgorde van de lijst.
 * - Lus: requestAnimationFrame alleen tijdens slepen, uitloop of achterstallig werk.
 */
import { generateLayout, type Layout, type LayoutItem } from '../lib/portfolio-layout';

/** Instellingen per pagina; niet gezette waarden vallen terug op de standaard van /portfolio. */
export interface CanvasConfig {
  /** Cel van het verspringende raster in px, [breedte, hoogte]. Een foto past met behoud van zijn verhouding in de cel. */
  cellDesktop?: [number, number];
  /** Idem, op schermen smaller dan MOBILE_BREAKPOINT. */
  cellMobile?: [number, number];
  /** Minimale ruimte tussen buren in px. */
  gap?: number;
  /**
   * Op schermen smaller dan MOBILE_BREAKPOINT: de foto's in de marge rond het eerste scherm laden pas bij de eerste
   * aanraking, scroll of toets (standaard direct na het eerste scherm). Houdt de eerste lading klein bij veel foto's.
   */
  holdMarginMobile?: boolean;
}

export interface CanvasPayload {
  photos: ClientPhoto[];
  config?: CanvasConfig;
}

export interface ClientPhoto {
  id: string;
  series: string | null;
  title: string | null;
  href: string | null;
  width: number;
  height: number;
  alt: string;
  /** Gemiddelde kleur van de foto (`#rrggbb`), achtergrond tot de foto binnen is. */
  color: string;
  /** Kleinste miniatuur: `src` van de <img> (AVIF; WebP in dev). */
  thumbSrc: string;
  /** Miniaturen als srcset. */
  thumbSrcset: string;
  /** Grote versie: `src` van de <img> in de lightbox. */
  largeSrc: string;
  /** Grote versie(s) als srcset. */
  largeSrcset: string;
}

const MAX_NODES = 150;
const MAX_CHANGES_PER_FRAME = 30;
const CLICK_DISTANCE = 6;
const CLICK_TIME = 250;
const VELOCITY_WINDOW = 100;
const DAMPING = 0.94;
const STOP_SPEED = 0.05; // px per frame van 16 ms
const KEY_STEP = 120;
const KEY_STEP_LARGE = 360;
const MOBILE_BREAKPOINT = 700;
const FIRST_SCREEN_WAIT = 1500; // ms
/** Aantal tegels dat bij het openen meteen laadt (de LCP-tegel plus de naastgelegen); de rest wacht op het load-event. */
const START_TEGELS = 6;
/** Als het load-event uitblijft, gaat het wachten na zoveel ms toch door. */
const START_MAX_WACHT = 3000; // ms
/** Als de LCP-foto uitblijft, beginnen de andere tegels van de eerste zes na zoveel ms toch te laden. */
const START_GOLF_WACHT = 800; // ms
const CELL_DESKTOP: [number, number] = [290, 230];
const CELL_MOBILE: [number, number] = [150, 130];
/**
 * Marge rond het beeld waarbinnen tegels staan en laden: MARGE_FACTOR keer de schermhoogte, begrensd door MARGE_MIN en
 * MARGE_MAX. Groter laadt bij het openen onnodig veel foto's (op 1440x900 laadt 0,5 al 62 foto's, 4,4 MB); kleiner laat
 * bij normaal slepen lege tegels zien. Gemeten (Playwright, 20 s slepen): 0,2 geeft 0 lege tegels, README: 'Canvas'.
 */
const MARGE_FACTOR = 0.2;
const MARGE_MIN = 120;
const MARGE_MAX = 300;
/** Ruimte voor de lightbox (px) boven en onder de foto: 90svh min 4rem. */
const LIGHTBOX_VERTICAAL = 64;

interface Mounted {
  el: HTMLButtonElement;
  item: LayoutItem;
  kx: number;
  ky: number;
}

/** Een tegel waarvan de afbeelding (nog) niet is aangezet. */
interface LoadTarget {
  img: HTMLImageElement;
  photo: ClientPhoto;
  sizes: string;
}

interface Wanted {
  key: string;
  item: LayoutItem;
  kx: number;
  ky: number;
  dist: number;
}

const root = document.querySelector<HTMLElement>('[data-portfolio]');
const dataEl = document.getElementById('portfolio-data');

if (root && dataEl) {
  const parsed = JSON.parse(dataEl.textContent ?? '[]') as CanvasPayload | ClientPhoto[];
  const payload: CanvasPayload = Array.isArray(parsed) ? { photos: parsed } : parsed;
  const photos = payload.photos;
  const config = payload.config ?? {};
  const canvas = root.querySelector<HTMLElement>('.portfolio__canvas')!;
  const world = root.querySelector<HTMLElement>('.portfolio__world')!;
  const hint = root.querySelector<HTMLElement>('.portfolio__hint');
  const dialog = root.querySelector<HTMLDialogElement>('.lightbox')!;
  const dialogImg = dialog.querySelector<HTMLImageElement>('.lightbox__img')!;
  const dialogCaption = dialog.querySelector<HTMLElement>('.lightbox__caption')!;
  const dialogClose = dialog.querySelector<HTMLButtonElement>('.lightbox__close')!;
  const dialogPrev = dialog.querySelector<HTMLButtonElement>('.lightbox__nav--vorige')!;
  const dialogNext = dialog.querySelector<HTMLButtonElement>('.lightbox__nav--volgende')!;
  const stage = dialog.querySelector<HTMLElement>('.lightbox__stage')!;
  const smallImg = dialog.querySelector<HTMLImageElement>('.lightbox__klein')!;
  const preloadBox = dialog.querySelector<HTMLElement>('.lightbox__voorladen')!;

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const loaded = new Set<string>();
  const mounted = new Map<string, Mounted>();

  let layout!: Layout;
  let viewW = 0;
  let viewH = 0;
  let offX = 0;
  let offY = 0;
  let vx = 0;
  let vy = 0;
  let inertia = false;
  let pending = false;
  let raf = 0;
  let lastFrame = 0;
  let interacted = false;
  let maxMounted = 0;
  /** Tot het eerste scherm binnen is, wachten foto's buiten beeld met laden. */
  let holdOffscreen = true;
  const held: LoadTarget[] = [];
  /**
   * Opstartfase (tot het load-event): alleen de LCP-tegel en de volgende START_TEGELS - 1 tegels in beeld (op afstand tot
   * het midden) laden meteen, de rest (ook tegels in beeld) wacht in `held` en laadt daarna, op afstand tot het midden.
   */
  let startupGate = true;
  let startupSlots = START_TEGELS - 1;
  /**
   * De tegels naast de LCP-tegel (de rest van de eerste zes) beginnen pas te laden als de LCP-foto binnen is (of na
   * START_GOLF_WACHT ms): zo delen ze de bandbreedte niet met de LCP-foto en komt die als eerste.
   */
  const golf: LoadTarget[] = [];
  let golfGestart = false;
  /** Sleutel van de tegel die de LCP wordt: de tegel met het grootste zichtbare oppervlak bij het openen. */
  let lcpKey: string | null = null;

  const measure = () => {
    viewW = canvas.clientWidth;
    viewH = canvas.clientHeight;
  };

  const buildLayout = () => {
    const mobile = viewW < MOBILE_BREAKPOINT;
    const [cellW, cellH] = mobile ? (config.cellMobile ?? CELL_MOBILE) : (config.cellDesktop ?? CELL_DESKTOP);
    layout = generateLayout(photos, {
      cellW,
      cellH,
      viewportW: viewW,
      viewportH: viewH,
      ...(config.gap !== undefined ? { gap: config.gap } : {}),
    });
    root.dataset.tile = `${layout.cols}x${layout.rows}`;
    root.dataset.places = String(layout.items.length);
  };

  // ---------- DOM ----------

  /** Geeft de <img> zijn srcset, sizes en src: vanaf hier begint het laden. */
  const setImageSources = (img: HTMLImageElement, srcset: string, src: string, sizes: string) => {
    img.sizes = sizes;
    img.srcset = srcset;
    img.src = src;
  };

  const startLoad = ({ img, photo, sizes }: LoadTarget) => {
    setImageSources(img, photo.thumbSrcset, photo.thumbSrc, sizes);
  };

  /**
   * Wacht tot de LCP-tegel getekend is (PerformanceObserver; de LCP-meting telt alles wat daarvóór binnenkomt mee) en laat
   * daarna de rest van de eerste tegels laden. Zonder LCP-ondersteuning (of bij een fout) gebeurt dat 200 ms na de load van
   * de foto; in elk geval na START_MAX_WACHT.
   */
  const watchLcp = (img: HTMLImageElement) => {
    const klaar = () => naLoadEvent();
    img.addEventListener('load', () => setTimeout(klaar, 200), { once: true });
    img.addEventListener('error', klaar, { once: true });
    try {
      const observer = new PerformanceObserver((list) => {
        if (list.getEntries().some((entry) => (entry as PerformanceEntry & { element?: Element }).element === img)) {
          observer.disconnect();
          klaar();
        }
      });
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch {
      // niet ondersteund: de timer na de load van de foto doet het werk
    }
  };

  const startGolf = () => {
    golfGestart = true;
    for (const target of golf.splice(0)) {
      if (target.img.isConnected && !target.img.src) startLoad(target);
    }
  };

  const createTile = (item: LayoutItem, kx: number, ky: number, inView: boolean, isLcp: boolean) => {
    const photo = photos[item.photo];
    const el = document.createElement('button');
    el.type = 'button';
    el.tabIndex = -1;
    el.className = 'portfolio__tile';
    el.dataset.index = String(item.photo);
    el.style.width = `${item.w}px`;
    el.style.height = `${item.h}px`;
    el.style.transform = `translate3d(${item.x + kx * layout.tileW}px, ${item.y + ky * layout.tileH}px, 0)`;

    // Vaste maat en aspect-ratio: de tegel heeft zijn afmeting al, dus niets verspringt tijdens het laden.
    el.style.backgroundColor = photo.color;
    el.style.aspectRatio = `${item.w} / ${item.h}`;

    const picture = document.createElement('picture');
    const img = document.createElement('img');
    picture.append(img);
    img.alt = photo.alt;
    img.width = item.w;
    img.height = item.h;
    img.decoding = 'async';
    img.draggable = false;
    // Precies één tegel (de LCP) krijgt fetchpriority="high"; alle andere laden met normale prioriteit.
    if (inView) img.loading = 'eager';
    if (isLcp) img.fetchPriority = 'high';
    const target: LoadTarget = { img, photo, sizes: `${item.w}px` };
    if (isLcp) {
      startLoad(target);
      watchLcp(img);
    } else if (startupGate && inView) {
      if (startupSlots > 0) {
        startupSlots -= 1;
        if (golfGestart) startLoad(target);
        else golf.push(target);
      } else {
        held.push(target);
      }
    } else if (holdOffscreen && !inView) {
      held.push(target);
    } else {
      startLoad(target);
    }

    if (loaded.has(photo.id) || (img.complete && img.naturalWidth > 0)) {
      el.classList.add('is-loaded');
    } else {
      img.addEventListener(
        'load',
        () => {
          loaded.add(photo.id);
          el.classList.add('is-loaded');
        },
        { once: true },
      );
    }

    el.append(picture);
    return el;
  };

  const applyTransform = () => {
    world.style.transform = `translate3d(${offX}px, ${offY}px, 0)`;
  };

  /** Zet de DOM gelijk aan wat zichtbaar moet zijn. `limit` = max. aan- en afmeldingen elk. */
  const reconcile = (limit: number) => {
    const { tileW, tileH, items, cellW } = layout;
    if (!tileW || !tileH) return;
    // Marge: ongeveer een halve schermhoogte (rondom, maar horizontaal niet meer dan het scherm breed is). Binnen deze marge
    // staan en laden de tegels; erbuiten niet.
    const marge = Math.min(Math.max(viewH * MARGE_FACTOR, MARGE_MIN), MARGE_MAX);
    const marginX = Math.min(marge, Math.max(viewW, MARGE_MIN));
    const marginY = marge;
    const left = -offX - marginX;
    const right = -offX + viewW + marginX;
    const top = -offY - marginY;
    const bottom = -offY + viewH + marginY;
    const centerX = -offX + viewW / 2;
    const centerY = -offY + viewH / 2;

    const wanted: Wanted[] = [];
    const kx0 = Math.floor((left - cellW) / tileW);
    const kx1 = Math.floor(right / tileW);
    const ky0 = Math.floor(top / tileH) - 1;
    const ky1 = Math.floor(bottom / tileH);
    for (let ky = ky0; ky <= ky1; ky += 1) {
      for (let kx = kx0; kx <= kx1; kx += 1) {
        const baseX = kx * tileW;
        const baseY = ky * tileH;
        for (const item of items) {
          const x = baseX + item.x;
          const y = baseY + item.y;
          if (x > right || x + item.w < left || y > bottom || y + item.h < top) continue;
          const dx = x + item.w / 2 - centerX;
          const dy = y + item.h / 2 - centerY;
          wanted.push({
            key: `${photos[item.photo].id}:${kx}:${ky}`,
            item,
            kx,
            ky,
            dist: dx * dx + dy * dy,
          });
        }
      }
    }
    wanted.sort((a, b) => a.dist - b.dist);
    if (wanted.length > MAX_NODES) wanted.length = MAX_NODES;
    const wantedKeys = new Set(wanted.map((w) => w.key));

    let removed = 0;
    let complete = true;
    for (const [key, entry] of mounted) {
      if (wantedKeys.has(key)) continue;
      if (removed >= limit) {
        complete = false;
        break;
      }
      entry.el.remove();
      mounted.delete(key);
      removed += 1;
    }

    if (startupGate && lcpKey === null) {
      let beste = -1;
      for (const w of wanted) {
        const x = w.kx * tileW + w.item.x + offX;
        const y = w.ky * tileH + w.item.y + offY;
        const zichtbaar =
          Math.max(0, Math.min(x + w.item.w, viewW) - Math.max(x, 0)) *
          Math.max(0, Math.min(y + w.item.h, viewH) - Math.max(y, 0));
        if (zichtbaar > beste) {
          beste = zichtbaar;
          lcpKey = w.key;
        }
      }
    }

    let added = 0;
    const fragment = document.createDocumentFragment();
    for (const w of wanted) {
      if (mounted.has(w.key)) continue;
      if (added >= limit || mounted.size >= MAX_NODES) {
        complete = false;
        break;
      }
      const x = w.kx * tileW + w.item.x + offX;
      const y = w.ky * tileH + w.item.y + offY;
      const inView = x < viewW && x + w.item.w > 0 && y < viewH && y + w.item.h > 0;
      const el = createTile(w.item, w.kx, w.ky, inView, w.key === lcpKey);
      fragment.append(el);
      mounted.set(w.key, { el, item: w.item, kx: w.kx, ky: w.ky });
      added += 1;
    }
    if (added) world.append(fragment);
    pending = !complete;
    maxMounted = Math.max(maxMounted, mounted.size);
    root.dataset.maxMounted = String(maxMounted);
  };

  const clearAll = () => {
    for (const entry of mounted.values()) entry.el.remove();
    mounted.clear();
    if (startupGate) {
      // Het canvas veranderde van maat voor het load-event: de opstartkeuze opnieuw maken.
      lcpKey = null;
      startupSlots = START_TEGELS - 1;
      held.length = 0;
      golf.length = 0;
      golfGestart = false;
    }
  };

  // ---------- Lus ----------

  const frame = (now: number) => {
    raf = 0;
    const dt = lastFrame ? Math.min(now - lastFrame, 64) : 16;
    lastFrame = now;

    if (inertia) {
      offX += vx * dt;
      offY += vy * dt;
      const decay = Math.pow(DAMPING, dt / 16);
      vx *= decay;
      vy *= decay;
      if (Math.hypot(vx, vy) * 16 < STOP_SPEED) {
        inertia = false;
        vx = 0;
        vy = 0;
      }
    }

    applyTransform();
    reconcile(MAX_CHANGES_PER_FRAME);

    if (inertia || pending) {
      raf = requestAnimationFrame(frame);
    } else {
      lastFrame = 0;
      delete root.dataset.moving;
    }
  };

  const requestFrame = () => {
    if (raf) return;
    root.dataset.moving = '';
    raf = requestAnimationFrame(frame);
  };

  const stopInertia = () => {
    inertia = false;
    vx = 0;
    vy = 0;
  };

  const markInteracted = () => {
    if (interacted) return;
    interacted = true;
    // Wie slaat voor het load-event al aan het slepen: niet langer wachten met laden.
    if (startupGate) naLoadEvent();
    hint?.classList.add('is-faded');
  };

  // ---------- Dialog ----------

  let opener: HTMLElement | null = null;
  let openedAt = 0;
  let current = -1;
  let token = 0;

  /** Breedte (px) waarin de foto in de lightbox staat: past in 90vw en in 90svh min 4rem. Bepaalt welke variant laadt. */
  const lightboxWidth = (photo: ClientPhoto) => {
    const ratio = photo.width / photo.height;
    const w = Math.min(window.innerWidth * 0.9, (window.innerHeight * 0.9 - LIGHTBOX_VERTICAAL) * ratio);
    return Math.max(1, Math.round(w));
  };

  /** Laadt de vorige en volgende foto voor (alleen die twee; nooit alle grote versies tegelijk). */
  const preloadNeighbours = (index: number) => {
    preloadBox.replaceChildren();
    if (photos.length < 2) return;
    const indices = new Set([(index - 1 + photos.length) % photos.length, (index + 1) % photos.length]);
    indices.delete(index);
    for (const i of indices) {
      const photo = photos[i];
      const picture = document.createElement('picture');
      const img = document.createElement('img');
      picture.append(img);
      img.alt = '';
      img.decoding = 'async';
      setImageSources(img, photo.largeSrcset, photo.largeSrc, `${lightboxWidth(photo)}px`);
      preloadBox.append(picture);
    }
  };

  /** Toont een foto: eerst de kleinste miniatuur (staat in de cache), daarna de grote versie zodra die binnen is. */
  const showPhoto = (index: number) => {
    const photo = photos[index];
    if (!photo) return;
    current = index;
    token += 1;
    const mine = token;

    stage.classList.remove('is-ready');
    stage.style.setProperty('--ratio', String(photo.width / photo.height));
    stage.style.setProperty('--kleur', photo.color);

    smallImg.width = photo.width;
    smallImg.height = photo.height;
    setImageSources(smallImg, photo.thumbSrcset, photo.thumbSrc, '1px');

    dialogImg.alt = photo.alt;
    dialogImg.width = photo.width;
    dialogImg.height = photo.height;
    const ready = () => {
      if (mine !== token) return;
      stage.classList.add('is-ready');
      preloadNeighbours(index);
    };
    dialogImg.addEventListener('load', ready, { once: true });
    setImageSources(dialogImg, photo.largeSrcset, photo.largeSrc, `${lightboxWidth(photo)}px`);
    if (dialogImg.complete && dialogImg.naturalWidth > 0) ready();

    dialogCaption.replaceChildren();
    if (photo.title) {
      const label = photo.href ? document.createElement('a') : document.createElement('span');
      label.className = 'lightbox__series';
      label.textContent = photo.title;
      if (photo.href && label instanceof HTMLAnchorElement) label.href = photo.href;
      dialogCaption.append(label);
    }
    dialogCaption.hidden = !photo.title;
    dialogPrev.hidden = dialogNext.hidden = photos.length < 2;
  };

  const step = (delta: number) => {
    if (photos.length < 2) return;
    showPhoto((current + delta + photos.length) % photos.length);
  };

  const openPhoto = (tile: HTMLElement) => {
    const index = Number(tile.dataset.index);
    if (!photos[index]) return;
    opener = tile;
    openedAt = performance.now();
    showPhoto(index);
    dialog.showModal();
  };

  dialogPrev.addEventListener('click', () => step(-1));
  dialogNext.addEventListener('click', () => step(1));
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      step(-1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      step(1);
    }
  });

  dialog.addEventListener('click', (event) => {
    if (performance.now() - openedAt < 350) return;
    const target = event.target as Element;
    if (!target.closest('img, a, button')) dialog.close();
  });
  dialogClose.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    token += 1; // laadt een foto die nog binnenkomt niet meer in beeld
    preloadBox.replaceChildren();
    if (opener?.isConnected) opener.focus({ preventScroll: true });
    else canvas.focus({ preventScroll: true });
    opener = null;
  });

  // ---------- Slepen ----------

  let pointerId: number | null = null;
  let startX = 0;
  let startY = 0;
  let lastX = 0;
  let lastY = 0;
  let startTime = 0;
  let travelled = 0;
  let downTile: HTMLElement | null = null;
  let samples: { t: number; x: number; y: number }[] = [];

  canvas.addEventListener('pointerdown', (event) => {
    if (pointerId !== null) {
      // Tweede vinger: laat de browser het knijpzoomen afhandelen.
      endDrag(false);
      return;
    }
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    pointerId = event.pointerId;
    try {
      canvas.setPointerCapture(event.pointerId);
    } catch {
      // Pointer al niet meer actief: slepen werkt dan zonder capture.
    }
    startX = lastX = event.clientX;
    startY = lastY = event.clientY;
    startTime = event.timeStamp;
    travelled = 0;
    samples = [{ t: event.timeStamp, x: event.clientX, y: event.clientY }];
    downTile = (event.target as Element).closest<HTMLElement>('.portfolio__tile');
    stopInertia();
    canvas.classList.add('is-dragging');
    markInteracted();
  });

  canvas.addEventListener('pointermove', (event) => {
    if (event.pointerId !== pointerId) return;
    offX += event.clientX - lastX;
    offY += event.clientY - lastY;
    lastX = event.clientX;
    lastY = event.clientY;
    travelled = Math.max(travelled, Math.hypot(lastX - startX, lastY - startY));
    samples.push({ t: event.timeStamp, x: lastX, y: lastY });
    while (samples.length > 2 && event.timeStamp - samples[0].t > VELOCITY_WINDOW) samples.shift();
    requestFrame();
  });

  function endDrag(release: boolean, event?: PointerEvent) {
    if (pointerId === null) return;
    if (canvas.hasPointerCapture(pointerId)) canvas.releasePointerCapture(pointerId);
    pointerId = null;
    canvas.classList.remove('is-dragging');
    if (!release || !event) return;

    const isClick = travelled < CLICK_DISTANCE && event.timeStamp - startTime < CLICK_TIME;
    if (isClick && downTile) {
      openPhoto(downTile);
      return;
    }

    const last = samples[samples.length - 1];
    const first = samples.find((s) => last.t - s.t <= VELOCITY_WINDOW) ?? samples[0];
    const dt = last.t - first.t;
    if (motionQuery.matches || dt <= 0 || event.timeStamp - last.t > 50) return;
    vx = (last.x - first.x) / dt;
    vy = (last.y - first.y) / dt;
    if (Math.hypot(vx, vy) * 16 >= STOP_SPEED) {
      inertia = true;
      requestFrame();
    }
  }

  canvas.addEventListener('pointerup', (event) => {
    if (event.pointerId === pointerId) endDrag(true, event);
  });
  canvas.addEventListener('pointercancel', (event) => {
    if (event.pointerId === pointerId) endDrag(false);
  });
  canvas.addEventListener('lostpointercapture', (event) => {
    // Alleen het canvas zelf; impliciete touch-capture op een foto bubbelt hier ook langs.
    if (event.target === canvas && event.pointerId === pointerId) endDrag(false);
  });
  canvas.addEventListener('dragstart', (event) => event.preventDefault());

  // ---------- Wiel en trackpad ----------

  canvas.addEventListener(
    'wheel',
    (event) => {
      if (event.ctrlKey) return; // knijpzoomen op een trackpad
      event.preventDefault();
      const unit =
        event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? (viewH || window.innerHeight) : 1;
      let dx = event.deltaX * unit;
      let dy = event.deltaY * unit;
      if (event.shiftKey && dx === 0) {
        dx = dy;
        dy = 0;
      }
      offX -= dx;
      offY -= dy;
      stopInertia();
      markInteracted();
      requestFrame();
    },
    { passive: false },
  );

  // ---------- Toetsenbord ----------

  const tileNearestCenter = (): HTMLElement | null => {
    let best: HTMLElement | null = null;
    let bestDist = Infinity;
    for (const entry of mounted.values()) {
      const x = entry.kx * layout.tileW + entry.item.x + offX + entry.item.w / 2 - viewW / 2;
      const y = entry.ky * layout.tileH + entry.item.y + offY + entry.item.h / 2 - viewH / 2;
      const dist = x * x + y * y;
      if (dist < bestDist) {
        bestDist = dist;
        best = entry.el;
      }
    }
    return best;
  };

  canvas.addEventListener('keydown', (event) => {
    const step = event.shiftKey ? KEY_STEP_LARGE : KEY_STEP;
    let dx = 0;
    let dy = 0;
    switch (event.key) {
      case 'ArrowLeft':
        dx = step;
        break;
      case 'ArrowRight':
        dx = -step;
        break;
      case 'ArrowUp':
        dy = step;
        break;
      case 'ArrowDown':
        dy = -step;
        break;
      case 'Enter':
      case ' ': {
        const target = (event.target as Element).closest<HTMLElement>('.portfolio__tile');
        const tile = target ?? tileNearestCenter();
        if (tile) {
          event.preventDefault();
          openPhoto(tile);
        }
        return;
      }
      default:
        return;
    }
    event.preventDefault();
    offX += dx;
    offY += dy;
    stopInertia();
    markInteracted();
    requestFrame();
  });

  // Focus mag de container nooit native laten scrollen.
  canvas.addEventListener('scroll', () => {
    canvas.scrollLeft = 0;
    canvas.scrollTop = 0;
  });

  // ---------- Formaat ----------

  const resizeObserver = new ResizeObserver(() => {
    const previousW = viewW;
    measure();
    if (Math.abs(viewW - previousW) >= 1) {
      clearAll();
      buildLayout();
    }
    reconcile(Infinity);
    applyTransform();
    releaseHeldInView();
  });

  // ---------- Laadvolgorde ----------

  /**
   * Foto's die bij het aanmaken buiten beeld lagen (vastgehouden) maar nu in beeld staan, omdat het canvas na het eerste
   * meten van maat veranderde (bijvoorbeeld de hoogte op mobiel), laden meteen. Zonder dit bleef zo'n tegel leeg.
   */
  function releaseHeldInView() {
    if (startupGate || !held.length) return;
    const c = canvas.getBoundingClientRect();
    const rest: LoadTarget[] = [];
    const nu: LoadTarget[] = [];
    // In de volgorde van `held` (op afstand tot het midden, dichtstbij eerst).
    for (const target of held) {
      if (!target.img.isConnected) continue;
      const r = target.img.getBoundingClientRect();
      if (r.right > c.left && r.left < c.right && r.bottom > c.top && r.top < c.bottom) nu.push(target);
      else rest.push(target);
    }
    held.splice(0, held.length, ...rest);
    for (const target of nu) {
      if (target.img.src) continue;
      target.img.loading = 'eager';
      startLoad(target);
    }
  }

  /** Laat de vastgehouden foto's (marge rond het eerste scherm) alsnog laden. */
  const releaseHeld = () => {
    holdOffscreen = false;
    for (const target of held.splice(0)) {
      if (!target.img.isConnected || target.img.src) continue;
      startLoad(target);
    }
  };

  /** Wacht tot de foto's van het eerste scherm binnen zijn (maximaal FIRST_SCREEN_WAIT ms). */
  const whenFirstScreenLoaded = () => {
    const pendingImages = [...world.querySelectorAll<HTMLImageElement>('img[src]')].filter(
      (img) => !img.complete,
    );
    const all = Promise.all(
      pendingImages.map(
        (img) =>
          new Promise<void>((resolve) => {
            img.addEventListener('load', () => resolve(), { once: true });
            img.addEventListener('error', () => resolve(), { once: true });
          }),
      ),
    );
    return Promise.race([all, new Promise<void>((r) => setTimeout(r, FIRST_SCREEN_WAIT))]);
  };

  // ---------- Start ----------

  measure();
  buildLayout();
  offX = -Math.round(layout.cellW * 0.25);
  offY = -Math.round(layout.cellH * 0.15);
  applyTransform();
  reconcile(Infinity);
  resizeObserver.observe(canvas);
  root.dataset.ready = '';
  setTimeout(startGolf, START_GOLF_WACHT);
  const naLoadEvent = () => {
    if (!startupGate) return;
    startupGate = false;
    startGolf();
    // Eerst de tegels in beeld die buiten de eerste zes vielen, daarna (als die binnen zijn) de marge.
    releaseHeldInView();
    void whenFirstScreenLoaded().then(() => {
      releaseHeldInView();
      if (config.holdMarginMobile && viewW < MOBILE_BREAKPOINT) {
        const release = () => {
          canvas.removeEventListener('pointerdown', release);
          canvas.removeEventListener('wheel', release);
          canvas.removeEventListener('keydown', release);
          releaseHeld();
        };
        canvas.addEventListener('pointerdown', release, { passive: true });
        canvas.addEventListener('wheel', release, { passive: true });
        canvas.addEventListener('keydown', release);
      } else {
        releaseHeld();
      }
    });
  };
  // Met een LCP-tegel gaat de rest laden zodra die getekend is (watchLcp); zonder tegel in beeld bij het load-event.
  if (lcpKey === null) {
    if (document.readyState === 'complete') {
      naLoadEvent();
    } else {
      window.addEventListener('load', naLoadEvent, { once: true });
    }
  }
  setTimeout(naLoadEvent, START_MAX_WACHT);
}

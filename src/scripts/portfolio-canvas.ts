/**
 * Oneindig canvas voor /portfolio.
 * - Wereld: een tegel uit generateLayout die via modulo in beide richtingen herhaalt.
 * - Virtualisatie: alleen foto's binnen het beeld plus marge staan in de DOM (Map met sleutel
 *   `${fotoId}:${kx}:${ky}`), met een maximum per frame en in totaal.
 * - Lus: requestAnimationFrame alleen tijdens slepen, uitloop of achterstallig werk.
 */
import { generateLayout, type Layout, type LayoutItem } from '../lib/portfolio-layout';

export interface ClientPhoto {
  id: string;
  series: string | null;
  title: string | null;
  href: string | null;
  width: number;
  height: number;
  alt: string;
  thumbSrc: string;
  thumbSrcset: string;
  largeSrc: string;
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
const PREFETCH_MAX = 100; // foto's; houdt de overdracht bij grote aantallen beperkt
const PREFETCH_PARALLEL = 4;

interface Mounted {
  el: HTMLButtonElement;
  item: LayoutItem;
  kx: number;
  ky: number;
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
  const photos = JSON.parse(dataEl.textContent ?? '[]') as ClientPhoto[];
  const canvas = root.querySelector<HTMLElement>('.portfolio__canvas')!;
  const world = root.querySelector<HTMLElement>('.portfolio__world')!;
  const hint = root.querySelector<HTMLElement>('.portfolio__hint');
  const dialog = root.querySelector<HTMLDialogElement>('.lightbox')!;
  const dialogImg = dialog.querySelector<HTMLImageElement>('.lightbox__img')!;
  const dialogCaption = dialog.querySelector<HTMLElement>('.lightbox__caption')!;
  const dialogClose = dialog.querySelector<HTMLButtonElement>('.lightbox__close')!;

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
  let firstScreen = true;
  let interacted = false;
  let maxMounted = 0;
  /** Tot het eerste scherm binnen is, wachten foto's buiten beeld met laden. */
  let holdOffscreen = true;
  const held: { img: HTMLImageElement; photo: ClientPhoto }[] = [];

  const measure = () => {
    viewW = canvas.clientWidth;
    viewH = canvas.clientHeight;
  };

  const buildLayout = () => {
    const mobile = viewW < MOBILE_BREAKPOINT;
    layout = generateLayout(photos, {
      cellW: mobile ? 150 : 290,
      cellH: mobile ? 130 : 230,
      viewportW: viewW,
      viewportH: viewH,
    });
    root.dataset.tile = `${layout.cols}x${layout.rows}`;
    root.dataset.places = String(layout.items.length);
  };

  // ---------- DOM ----------

  const createTile = (item: LayoutItem, kx: number, ky: number, inView: boolean) => {
    const photo = photos[item.photo];
    const el = document.createElement('button');
    el.type = 'button';
    el.tabIndex = -1;
    el.className = 'portfolio__tile';
    el.dataset.index = String(item.photo);
    el.style.width = `${item.w}px`;
    el.style.height = `${item.h}px`;
    el.style.transform = `translate3d(${item.x + kx * layout.tileW}px, ${item.y + ky * layout.tileH}px, 0)`;

    const img = document.createElement('img');
    img.alt = photo.alt;
    img.width = item.w;
    img.height = item.h;
    img.decoding = 'async';
    img.draggable = false;
    img.setAttribute('fetchpriority', firstScreen && inView ? 'high' : 'low');
    img.sizes = `${item.w}px`;
    if (holdOffscreen && !inView) {
      held.push({ img, photo });
    } else {
      img.srcset = photo.thumbSrcset;
      img.src = photo.thumbSrc;
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

    el.append(img);
    return el;
  };

  const applyTransform = () => {
    world.style.transform = `translate3d(${offX}px, ${offY}px, 0)`;
  };

  /** Zet de DOM gelijk aan wat zichtbaar moet zijn. `limit` = max. aan- en afmeldingen elk. */
  const reconcile = (limit: number) => {
    const { tileW, tileH, items, cellW } = layout;
    if (!tileW || !tileH) return;
    const marginX = Math.min(viewW * 0.75, 700);
    const marginY = Math.min(viewH * 0.75, 700);
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
      const el = createTile(w.item, w.kx, w.ky, inView);
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
    hint?.classList.add('is-faded');
  };

  // ---------- Dialog ----------

  let opener: HTMLElement | null = null;
  let openedAt = 0;

  const openPhoto = (tile: HTMLElement) => {
    const photo = photos[Number(tile.dataset.index)];
    if (!photo) return;
    opener = tile;
    dialogImg.removeAttribute('src');
    dialogImg.srcset = photo.largeSrcset;
    dialogImg.sizes = '90vw';
    dialogImg.src = photo.largeSrc;
    dialogImg.alt = photo.alt;
    dialogImg.width = photo.width;
    dialogImg.height = photo.height;
    dialogImg.style.setProperty('--ratio', String(photo.width / photo.height));

    dialogCaption.replaceChildren();
    if (photo.title) {
      const label = photo.href ? document.createElement('a') : document.createElement('span');
      label.className = 'lightbox__series';
      label.textContent = photo.title;
      if (photo.href && label instanceof HTMLAnchorElement) label.href = photo.href;
      dialogCaption.append(label);
    }
    dialogCaption.hidden = !photo.title;
    openedAt = performance.now();
    dialog.showModal();
  };

  dialog.addEventListener('click', (event) => {
    if (performance.now() - openedAt < 350) return;
    const target = event.target as Element;
    if (!target.closest('img, a, button')) dialog.close();
  });
  dialogClose.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
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
  });

  // ---------- Laadvolgorde ----------

  /** Laat de vastgehouden foto's (marge rond het eerste scherm) alsnog laden. */
  const releaseHeld = () => {
    holdOffscreen = false;
    for (const { img, photo } of held.splice(0)) {
      if (!img.isConnected || img.src) continue;
      img.srcset = photo.thumbSrcset;
      img.src = photo.thumbSrc;
    }
  };

  /**
   * Haalt in rustige momenten de miniaturen op die nog niet in beeld zijn geweest, dichtstbij eerst,
   * met de maat waarin ze in de layout staan (dan kiest de browser bij het tonen dezelfde variant).
   */
  const prefetchRest = () => {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (connection?.saveData) return;

    const { tileW, tileH } = layout;
    const centerX = -offX + viewW / 2;
    const centerY = -offY + viewH / 2;
    const wrap = (d: number, size: number) => {
      const m = ((d % size) + size) % size;
      return m > size / 2 ? m - size : m;
    };
    const best = new Map<number, { dist: number; w: number }>();
    for (const item of layout.items) {
      const dx = wrap(item.x + item.w / 2 - centerX, tileW);
      const dy = wrap(item.y + item.h / 2 - centerY, tileH);
      const dist = dx * dx + dy * dy;
      const current = best.get(item.photo);
      if (!current || dist < current.dist) best.set(item.photo, { dist, w: item.w });
    }
    const queue = [...best.entries()]
      .filter(([index]) => !loaded.has(photos[index].id))
      .sort((a, b) => a[1].dist - b[1].dist)
      .slice(0, PREFETCH_MAX);

    // Safari kent requestIdleCallback niet.
    const idle = (callback: () => void) =>
      typeof window.requestIdleCallback === 'function'
        ? window.requestIdleCallback(callback, { timeout: 1000 })
        : setTimeout(callback, 50);

    let active = 0;
    const next = () => {
      while (active < PREFETCH_PARALLEL && queue.length) {
        const [index, { w }] = queue.shift()!;
        const photo = photos[index];
        if (loaded.has(photo.id)) continue;
        active += 1;
        const img = new Image();
        img.decoding = 'async';
        img.setAttribute('fetchpriority', 'low');
        img.sizes = `${w}px`;
        img.srcset = photo.thumbSrcset;
        img.src = photo.thumbSrc;
        const done = () => {
          active -= 1;
          idle(next);
        };
        img.addEventListener('load', done, { once: true });
        img.addEventListener('error', done, { once: true });
      }
    };
    idle(next);
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
  firstScreen = false;
  resizeObserver.observe(canvas);
  root.dataset.ready = '';
  void whenFirstScreenLoaded().then(() => {
    releaseHeld();
    prefetchRest();
  });
}

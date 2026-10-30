/**
 * Gedeelde lightbox (grote weergave van een foto), gebruikt door het canvas (src/scripts/foto-canvas.ts: /portfolio,
 * /portfolio/portretten, /portfolio/bruiloften) en door de projectpagina's (src/scripts/serie-lightbox.ts). De markup en de
 * stijl staan in src/components/Lightbox.astro; hier staat het gedrag. Geen bibliotheek: een <dialog> met showModal().
 *
 * - Eén lightbox per pagina. De module doet niets tot `createLightbox` wordt aangeroepen en `open` wordt gebruikt.
 * - Tonen: eerst de kleinste weergave die al in de cache staat (`thumbSrc`), daarna de grote versie zodra die binnen is
 *   (twee lagen op dezelfde plek, opacity 150 ms). Er is geen vooraf laden vóór het openen; na het openen laden alleen de
 *   vorige en volgende foto voor.
 * - Vorige/volgende: knoppen, pijltjestoetsen en (alleen met `swipe`) vegen op touch. Met `wrap` (canvas) loopt de lijst rond;
 *   zonder (projectpagina's) is de pijl bij de eerste of laatste foto uitgeschakeld.
 * - Sluiten: knop, Escape (native) of een klik naast de foto. Focus keert terug naar het element dat de lightbox opende.
 * - De pagina erachter scrolt niet: `overflow: hidden` op <html>, met de scrollbarbreedte als padding zodat niets verspringt.
 */

export interface LightboxItem {
  /** Afmetingen van het bronbestand (alleen de verhouding telt). */
  width: number;
  height: number;
  alt: string;
  /** Gemiddelde kleur van de foto (`#rrggbb`): achtergrond tot de foto binnen is. */
  color: string;
  /** Tijdelijke weergave: een afbeelding die al geladen is (bijvoorbeeld de miniatuur). Leeg: alleen het kleurvlak. */
  thumbSrc?: string;
  thumbSrcset?: string;
  /** Grote versie: `src` (en eventueel `srcset`) van de <img> in de lightbox. */
  largeSrc: string;
  largeSrcset?: string;
  /** Bijschrift (serienaam), optioneel met link. */
  title?: string | null;
  href?: string | null;
}

export interface LightboxOptions {
  /** Na de laatste foto weer naar de eerste (en andersom). Standaard ja. */
  wrap?: boolean;
  /** Focus bij het openen naar de sluitknop (anders de eerste focusbare knop van de dialoog). Standaard nee. */
  focusSluiten?: boolean;
  /** Vegen naar links/rechts op touch. Standaard nee. */
  swipe?: boolean;
  /** Waar de focus heen gaat als het element dat opende er niet meer is. */
  terugFocus?: () => HTMLElement | null;
}

export interface Lightbox {
  open: (index: number, opener: HTMLElement) => void;
  close: () => void;
}

/** Ruimte voor de lightbox (px) boven en onder de foto: 90svh min 4rem. */
const LIGHTBOX_VERTICAAL = 64;
/** Klikken kort na het openen (de klik die opende, een spookklik) sluiten niet. */
const NEGEER_KLIK = 350; // ms
const SWIPE_AFSTAND = 50; // px

/** Geeft de <img> zijn srcset, sizes en src: vanaf hier begint het laden. Zonder srcset alleen `src`. */
const setImageSources = (img: HTMLImageElement, srcset: string | undefined, src: string, sizes: string) => {
  if (srcset) {
    img.sizes = sizes;
    img.srcset = srcset;
  } else {
    img.removeAttribute('sizes');
    img.removeAttribute('srcset');
  }
  img.src = src;
};

const clearImage = (img: HTMLImageElement) => {
  img.removeAttribute('srcset');
  img.removeAttribute('sizes');
  img.removeAttribute('src');
};

/** Breedte (px) waarin de foto in de lightbox staat: past in 90vw en in 90svh min 4rem. Bepaalt welke variant laadt. */
const lightboxWidth = (item: LightboxItem) => {
  const ratio = item.width / item.height;
  const w = Math.min(window.innerWidth * 0.9, (window.innerHeight * 0.9 - LIGHTBOX_VERTICAAL) * ratio);
  return Math.max(1, Math.round(w));
};

export function createLightbox(dialog: HTMLDialogElement, items: LightboxItem[], options: LightboxOptions = {}): Lightbox {
  const { wrap = true, focusSluiten = false, swipe = false, terugFocus } = options;

  const dialogImg = dialog.querySelector<HTMLImageElement>('.lightbox__img')!;
  const dialogCaption = dialog.querySelector<HTMLElement>('.lightbox__caption')!;
  const dialogClose = dialog.querySelector<HTMLButtonElement>('.lightbox__close')!;
  const dialogPrev = dialog.querySelector<HTMLButtonElement>('.lightbox__nav--vorige')!;
  const dialogNext = dialog.querySelector<HTMLButtonElement>('.lightbox__nav--volgende')!;
  const stage = dialog.querySelector<HTMLElement>('.lightbox__stage')!;
  const smallImg = dialog.querySelector<HTMLImageElement>('.lightbox__klein')!;
  const preloadBox = dialog.querySelector<HTMLElement>('.lightbox__voorladen')!;
  const teller = dialog.querySelector<HTMLElement>('.lightbox__teller');

  let opener: HTMLElement | null = null;
  let openedAt = 0;
  let current = -1;
  let token = 0;
  let vergrendeld: { overflow: string; paddingRight: string } | null = null;

  // ---------- Pagina vastzetten ----------

  const lockScroll = () => {
    if (vergrendeld) return;
    const html = document.documentElement;
    // Eerst meten (met scrollbar), dan verbergen: de scrollbarbreedte komt als padding terug, zodat de pagina niet verspringt.
    const scrollbar = window.innerWidth - html.clientWidth;
    vergrendeld = { overflow: html.style.overflow, paddingRight: html.style.paddingRight };
    if (scrollbar > 0) html.style.paddingRight = `${scrollbar + (parseFloat(getComputedStyle(html).paddingRight) || 0)}px`;
    html.style.overflow = 'hidden';
  };

  const unlockScroll = () => {
    if (!vergrendeld) return;
    const html = document.documentElement;
    html.style.overflow = vergrendeld.overflow;
    html.style.paddingRight = vergrendeld.paddingRight;
    vergrendeld = null;
  };

  // ---------- Vorige en volgende voorladen ----------

  /** Laadt de vorige en volgende foto voor (alleen die twee; nooit alle grote versies tegelijk). */
  const preloadNeighbours = (index: number) => {
    preloadBox.replaceChildren();
    if (items.length < 2) return;
    const indices = new Set<number>();
    for (const i of [index - 1, index + 1]) {
      if (wrap) indices.add((i + items.length) % items.length);
      else if (i >= 0 && i < items.length) indices.add(i);
    }
    indices.delete(index);
    for (const i of indices) {
      const item = items[i];
      const picture = document.createElement('picture');
      const img = document.createElement('img');
      picture.append(img);
      img.alt = '';
      img.decoding = 'async';
      setImageSources(img, item.largeSrcset, item.largeSrc, `${lightboxWidth(item)}px`);
      preloadBox.append(picture);
    }
  };

  // ---------- Foto tonen ----------

  /** Toont een foto: eerst de tijdelijke weergave (staat in de cache), daarna de grote versie zodra die binnen is. */
  const showPhoto = (index: number) => {
    const item = items[index];
    if (!item) return;
    current = index;
    token += 1;
    const mine = token;

    stage.classList.remove('is-ready');
    stage.style.setProperty('--ratio', String(item.width / item.height));
    stage.style.setProperty('--kleur', item.color);

    smallImg.width = item.width;
    smallImg.height = item.height;
    if (item.thumbSrc) setImageSources(smallImg, item.thumbSrcset, item.thumbSrc, '1px');
    else clearImage(smallImg);

    dialogImg.alt = item.alt;
    dialogImg.width = item.width;
    dialogImg.height = item.height;
    const ready = () => {
      if (mine !== token) return;
      stage.classList.add('is-ready');
      preloadNeighbours(index);
    };
    dialogImg.addEventListener('load', ready, { once: true });
    setImageSources(dialogImg, item.largeSrcset, item.largeSrc, `${lightboxWidth(item)}px`);
    if (dialogImg.complete && dialogImg.naturalWidth > 0) ready();

    dialogCaption.replaceChildren();
    if (item.title) {
      const label = item.href ? document.createElement('a') : document.createElement('span');
      label.className = 'lightbox__series';
      label.textContent = item.title;
      if (item.href && label instanceof HTMLAnchorElement) label.href = item.href;
      dialogCaption.append(label);
    }
    dialogCaption.hidden = !item.title;

    const meerdere = items.length > 1;
    dialogPrev.hidden = dialogNext.hidden = !meerdere;
    if (!wrap) {
      dialogPrev.disabled = index <= 0;
      dialogNext.disabled = index >= items.length - 1;
      // Een uitgeschakelde knop verliest de focus: die gaat dan naar de sluitknop, zodat hij in de dialoog blijft.
      if (document.activeElement === dialogPrev && dialogPrev.disabled) dialogClose.focus();
      if (document.activeElement === dialogNext && dialogNext.disabled) dialogClose.focus();
    }
    if (teller) {
      teller.hidden = !meerdere;
      teller.textContent = meerdere ? `${index + 1} / ${items.length}` : '';
    }
  };

  const step = (delta: number) => {
    if (items.length < 2) return;
    const next = wrap ? (current + delta + items.length) % items.length : current + delta;
    if (next < 0 || next >= items.length) return;
    showPhoto(next);
  };

  // ---------- Openen en sluiten ----------

  const open = (index: number, from: HTMLElement) => {
    if (!items[index] || dialog.open) return;
    opener = from;
    openedAt = performance.now();
    showPhoto(index);
    lockScroll();
    dialog.showModal();
    if (focusSluiten) dialogClose.focus();
  };

  const close = () => {
    if (dialog.open) dialog.close();
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
    if (performance.now() - openedAt < NEGEER_KLIK) return;
    const target = event.target as Element;
    if (!target.closest('img, a, button')) dialog.close();
  });
  dialogClose.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    token += 1; // laadt een foto die nog binnenkomt niet meer in beeld
    preloadBox.replaceChildren();
    unlockScroll();
    if (opener?.isConnected) opener.focus({ preventScroll: true });
    else terugFocus?.()?.focus({ preventScroll: true });
    opener = null;
  });

  // ---------- Vegen (touch) ----------

  if (swipe) {
    let startX = 0;
    let startY = 0;
    let actief = false;
    dialog.addEventListener(
      'touchstart',
      (event) => {
        actief = event.touches.length === 1;
        if (!actief) return;
        startX = event.touches[0].clientX;
        startY = event.touches[0].clientY;
      },
      { passive: true },
    );
    dialog.addEventListener(
      'touchend',
      (event) => {
        if (!actief || event.changedTouches.length !== 1) return;
        actief = false;
        const dx = event.changedTouches[0].clientX - startX;
        const dy = event.changedTouches[0].clientY - startY;
        if (Math.abs(dx) >= SWIPE_AFSTAND && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1);
      },
      { passive: true },
    );
    dialog.addEventListener('touchcancel', () => {
      actief = false;
    });
  }

  return { open, close };
}

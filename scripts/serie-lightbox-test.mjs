// Controleert de lightbox op de projectpagina's (src/pages/[project].astro, src/scripts/serie-lightbox.ts) in Chromium
// (desktop 1440 × 900 en Pixel 7 met touch) en WebKit (iPhone 14): links in de HTML, niets vooraf laden, openen, navigeren
// (knoppen, toetsenbord, swipe), sluiten, focus, scrollbehoud, modifier-klikken, zonder JavaScript en minder beweging.
// Gebruik: npm run build, node scripts/serveer-build.mjs (andere terminal, bijvoorbeeld PORT=4390), daarna
//   BASE_URL=http://127.0.0.1:4390 node scripts/serie-lightbox-test.mjs
// Optioneel: PROJECTEN=love-marriage,asfalt (komma's), APPARAAT=pixel (deel van de naam).
import { chromium, devices, webkit } from 'playwright';

const BASE_URL = process.env.BASE_URL ?? 'http://127.0.0.1:4322';
const ALLE = [
  'asfalt',
  'asty-mwaka',
  'de-gaarkeuken',
  'groeten-uit-lent',
  'het-gezicht-van-nijmegen',
  'love-marriage',
  'take-me-to-the-river',
  'tradities',
  'oude-honden',
];
const PROJECTEN = process.env.PROJECTEN ? process.env.PROJECTEN.split(',') : ALLE;
const alleApparaten = [
  { naam: 'Desktop 1440 × 900 (Chromium)', browserType: chromium, device: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }, touch: false },
  { naam: 'Pixel 7 (Chromium)', browserType: chromium, device: devices['Pixel 7'], touch: true },
  { naam: 'iPhone 14 (WebKit)', browserType: webkit, device: devices['iPhone 14'], touch: true },
];
const apparaten = alleApparaten.filter((a) => a.naam.toLowerCase().includes((process.env.APPARAAT ?? '').toLowerCase()));

let mislukt = false;
const regels = [];
const check = (ok, tekst) => {
  if (!ok) mislukt = true;
  regels.push(`${ok ? 'OK  ' : 'FOUT'} ${tekst}`);
  return ok;
};
const wacht = (page, ms) => page.waitForTimeout(ms);

const stand = (page) =>
  page.evaluate(() => {
    const d = document.querySelector('dialog.lightbox');
    const stage = d.querySelector('.lightbox__stage').getBoundingClientRect();
    const img = d.querySelector('.lightbox__img');
    const teller = d.querySelector('.lightbox__teller');
    const prev = d.querySelector('.lightbox__nav--vorige');
    const next = d.querySelector('.lightbox__nav--volgende');
    return {
      open: d.open,
      teller: teller && !teller.hidden ? teller.textContent : null,
      prevDisabled: prev.disabled,
      nextDisabled: next.disabled,
      prevHidden: prev.hidden,
      nextHidden: next.hidden,
      src: img.currentSrc || img.src,
      alt: img.alt,
      ready: d.querySelector('.lightbox__stage').classList.contains('is-ready'),
      focusClose: document.activeElement?.classList.contains('lightbox__close') ?? false,
      stage: { l: stage.left, t: stage.top, r: stage.right, b: stage.bottom, w: stage.width, h: stage.height },
      htmlOverflow: getComputedStyle(document.documentElement).overflow,
      scrollY: Math.round(scrollY),
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
      viewW: innerWidth,
      viewH: innerHeight,
    };
  });

const wachtOpGrote = async (page) => {
  await page.waitForFunction(() => document.querySelector('dialog.lightbox .lightbox__stage')?.classList.contains('is-ready'), null, { timeout: 15000 });
};

/** Veegt met één vinger (CDP touch, alleen Chromium) of met synthetische TouchEvents (WebKit). */
async function veeg(page, ctx, van, naar) {
  if (ctx.cdp) {
    await ctx.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: van, y: 400 }] });
    for (let i = 1; i <= 8; i += 1) {
      await ctx.cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: van + ((naar - van) * i) / 8, y: 400 }] });
      await wacht(page, 12);
    }
    await ctx.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  } else {
    await page.evaluate(
      ({ van, naar }) => {
        const d = document.querySelector('dialog.lightbox');
        const doel = d.querySelector('.lightbox__img');
        // WebKit heeft geen Touch-constructor: een gewoon Event met de velden die de lightbox leest.
        const t = (x) => ({ identifier: 1, target: doel, clientX: x, clientY: 400 });
        const stuur = (type, x, lijst) => {
          const event = new Event(type, { bubbles: true, cancelable: true });
          Object.defineProperties(event, {
            touches: { value: lijst ? [t(x)] : [] },
            targetTouches: { value: lijst ? [t(x)] : [] },
            changedTouches: { value: [t(x)] },
          });
          doel.dispatchEvent(event);
        };
        stuur('touchstart', van, true);
        stuur('touchmove', (van + naar) / 2, true);
        stuur('touchend', naar, false);
      },
      { van, naar },
    );
  }
  await wacht(page, 150);
}

for (const apparaat of apparaten) {
  regels.push(`\n## ${apparaat.naam}`);
  const browser = await apparaat.browserType.launch({ ignoreDefaultArgs: apparaat.browserType === chromium ? ['--hide-scrollbars'] : [] });

  for (const slug of PROJECTEN) {
    const context = await browser.newContext({ ...apparaat.device, reducedMotion: 'no-preference' });
    const page = await context.newPage();
    const fouten = [];
    page.on('pageerror', (f) => fouten.push(f.message));
    page.on('console', (b) => b.type() === 'error' && !/status of 404/.test(b.text()) && fouten.push(b.text()));
    const beeldVerzoeken = [];
    page.on('request', (r) => r.resourceType() === 'image' && beeldVerzoeken.push(r.url()));
    const cdp = apparaat.touch && apparaat.browserType === chromium ? await context.newCDPSession(page) : null;
    const ctx = { cdp };
    const k = `/${slug}`;

    await page.goto(`${BASE_URL}${k}`, { waitUntil: 'load' });
    await page.waitForLoadState('networkidle');

    // ---- HTML: elke foto is een link naar de grote versie; niets van de grote versies laadt vooraf
    const html = await page.evaluate(() => {
      const links = [...document.querySelectorAll('a[data-lightbox]')];
      const imgs = [...document.querySelectorAll('.foto__beeld')];
      return {
        aantal: links.length,
        imgs: imgs.length,
        alleMetImg: links.every((a) => a.querySelector('img.foto__beeld') !== null && a.querySelector('img').alt.length > 0),
        haspopup: links.every((a) => a.getAttribute('aria-haspopup') === 'dialog'),
        hrefs: links.map((a) => a.href),
        eagerLink: links.filter((a) => a.querySelector('img').loading === 'eager').length,
        h1: document.querySelectorAll('h1').length,
        dialogen: document.querySelectorAll('dialog.lightbox').length,
        label: document.querySelector('dialog.lightbox')?.getAttribute('aria-label'),
        role: document.querySelector('dialog.lightbox')?.getAttribute('role'),
        modal: document.querySelector('dialog.lightbox')?.getAttribute('aria-modal'),
        titel: document.querySelector('h1')?.textContent?.trim(),
        eersteLink: document.querySelector('.foto__link')?.getAttribute('href'),
      };
    });
    const n = html.aantal;
    check(n > 0 && n === html.imgs && html.alleMetImg && html.haspopup, `${k}: ${n} foto's, elk een link met <img> (alt) en aria-haspopup`);
    check(html.h1 === 1 && html.dialogen === 1 && html.role === 'dialog' && html.modal === 'true' && html.label === `Foto's van ${html.titel}`, `${k}: één H1, één dialoog (role, aria-modal, aria-label "${html.label}")`);
    const voorGeladen = html.hrefs.filter((h) => beeldVerzoeken.includes(h));
    check(voorGeladen.length === 0, `${k}: ${voorGeladen.length} grote versies geladen vóór de eerste klik`);

    // ---- Modifier-klik en middelste muisknop openen de lightbox niet
    const eerste = page.locator('a[data-lightbox]').first();
    await eerste.scrollIntoViewIfNeeded();
    if (!apparaat.touch) {
      const nieuwePaginas = [];
      context.on('page', (p) => nieuwePaginas.push(p));
      await eerste.click({ modifiers: ['Shift'] });
      await wacht(page, 300);
      const naShift = await stand(page);
      await eerste.click({ button: 'middle' });
      await wacht(page, 300);
      const naMidden = await stand(page);
      check(!naShift.open && !naMidden.open, `${k}: Shift-klik en middelklik openen de lightbox niet (${nieuwePaginas.length} nieuw tabblad/venster)`);
      for (const p of nieuwePaginas) await p.close();
    }

    // ---- Openen: miniatuur direct, grote versie neemt over; alleen vorige en volgende laden voor
    const voorKlik = beeldVerzoeken.length;
    const y0 = await page.evaluate(() => scrollY);
    if (apparaat.touch) await eerste.tap();
    else await eerste.click();
    await wachtOpGrote(page);
    await wacht(page, 600);
    let s = await stand(page);
    const nieuw = beeldVerzoeken.slice(voorKlik).filter((u) => html.hrefs.includes(u));
    const verwacht = new Set(html.hrefs.slice(0, Math.min(2, n)));
    check(
      s.open && s.src === html.hrefs[0] && (n < 2 || (s.teller === `1 / ${n}` && s.prevDisabled && !s.nextDisabled)) && (n >= 2 || (s.prevHidden && s.nextHidden && s.teller === null)),
      `${k}: opent met foto 1 (teller ${s.teller ?? 'verborgen'}, vorige ${s.prevDisabled ? 'uit' : 'aan'}, alt "${s.alt.slice(0, 40)}…")`,
    );
    check(nieuw.length === verwacht.size && nieuw.every((u) => verwacht.has(u)), `${k}: na het openen ${nieuw.length} grote versies geladen (foto 1 en 2)`);
    check(s.htmlOverflow === 'hidden' && s.scrollW <= s.clientW + 1, `${k}: pagina vergrendeld, geen horizontale scroll`);
    check(
      s.stage.l >= -0.5 && s.stage.t >= -0.5 && s.stage.r <= s.viewW + 0.5 && s.stage.b <= s.viewH + 0.5 && s.stage.w <= s.viewW * 0.9 + 1,
      `${k}: foto past in beeld (${Math.round(s.stage.w)} × ${Math.round(s.stage.h)} in ${s.viewW} × ${s.viewH})`,
    );
    check(s.focusClose, `${k}: focus op de sluitknop`);

    // ---- Navigeren
    if (n >= 2) {
      await page.keyboard.press('ArrowLeft');
      await wacht(page, 100);
      const eerstePijl = await stand(page);
      await page.keyboard.press('ArrowRight');
      await wacht(page, 100);
      const naRechts = await stand(page);
      await page.locator('.lightbox__nav--vorige').click();
      await wacht(page, 100);
      const naVorige = await stand(page);
      check(eerstePijl.teller === `1 / ${n}` && naRechts.teller === `2 / ${n}` && naVorige.teller === `1 / ${n}`, `${k}: ← bij de eerste foto doet niets, → en knop vorige werken`);
      // swipe
      if (apparaat.touch) {
        await veeg(page, ctx, 300, 60);
        const naVeeg = await stand(page);
        await veeg(page, ctx, 60, 300);
        const terug = await stand(page);
        check(naVeeg.teller === `2 / ${n}` && terug.teller === `1 / ${n}`, `${k}: swipe links = volgende, rechts = vorige`);
      }
      // naar de laatste
      for (let i = 1; i < n; i += 1) await page.locator('.lightbox__nav--volgende').click({ force: false });
      await wacht(page, 200);
      s = await stand(page);
      const naLaatste = await (async () => {
        await page.keyboard.press('ArrowRight');
        await wacht(page, 100);
        return stand(page);
      })();
      check(s.teller === `${n} / ${n}` && s.nextDisabled && !s.prevDisabled && naLaatste.teller === `${n} / ${n}`, `${k}: bij de laatste foto (${s.teller}) is volgende uitgeschakeld, geen wrap-around`);
      check(s.focusClose || (await page.evaluate(() => document.querySelector('dialog.lightbox').contains(document.activeElement))), `${k}: focus blijft in de dialoog bij een uitgeschakelde pijl`);
    }

    // ---- Sluiten: Escape; focus terug naar de aangeklikte foto; scrollpositie ongewijzigd
    await page.keyboard.press('Escape');
    await wacht(page, 200);
    const gesloten = await page.evaluate(() => ({
      open: document.querySelector('dialog.lightbox').open,
      focusOpLink: document.activeElement?.matches('a[data-lightbox]') ?? false,
      focusHref: document.activeElement?.getAttribute('href') ?? null,
      overflow: document.documentElement.style.overflow,
      pad: document.documentElement.style.paddingRight,
      y: Math.round(scrollY),
    }));
    check(
      !gesloten.open && gesloten.focusOpLink && gesloten.focusHref === html.eersteLink,
      `${k}: Escape sluit; focus terug op de aangeklikte foto`,
    );
    check(gesloten.overflow === '' && gesloten.pad === '' && Math.abs(gesloten.y - y0) <= 1, `${k}: scrollpositie ${gesloten.y} (was ${y0}), vergrendeling opgeheven`);

    // ---- Sluiten met de knop en met een klik naast de foto; opnieuw openen
    await eerste.click();
    await wachtOpGrote(page);
    await wacht(page, 400);
    await page.locator('.lightbox__close').click();
    await wacht(page, 150);
    const naKnop = await stand(page);
    await eerste.click();
    await wacht(page, 600);
    await page.mouse.click(5, apparaat.device.viewport?.height ? apparaat.device.viewport.height / 2 : 400);
    await wacht(page, 200);
    const naBuiten = await stand(page);
    check(!naKnop.open && !naBuiten.open, `${k}: sluiten met de knop en met een klik buiten de foto`);

    check(fouten.length === 0, `${k}: geen consolefouten${fouten.length ? `: ${fouten.join(' | ')}` : ''}`);
    await context.close();
  }

  // ---- Midden in de pagina: openen bij de laatste foto, sluiten; de pagina scrolt niet weg en de focus keert terug
  {
    const context = await browser.newContext({ ...apparaat.device });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/${PROJECTEN[0]}`, { waitUntil: 'load' });
    const laatste = page.locator('a[data-lightbox]').last();
    const n = await page.locator('a[data-lightbox]').count();
    await laatste.scrollIntoViewIfNeeded();
    await wacht(page, 300);
    const y0 = await page.evaluate(() => Math.round(scrollY));
    if (apparaat.touch) await laatste.tap();
    else await laatste.click();
    await wachtOpGrote(page);
    const open = await stand(page);
    await page.keyboard.press('Escape');
    await wacht(page, 200);
    const na = await page.evaluate(() => ({ y: Math.round(scrollY), href: document.activeElement?.getAttribute('href') }));
    const href = await laatste.getAttribute('href');
    check(
      y0 > 500 && open.teller === `${n} / ${n}` && open.nextDisabled && Math.abs(na.y - y0) <= 1 && na.href === href,
      `laatste foto op scrollpositie ${y0}: opent (${open.teller}), na sluiten scrollpositie ${na.y} en focus op dezelfde foto`,
    );
    await context.close();
  }

  // ---- Zonder JavaScript: de link opent de grote foto
  {
    const context = await browser.newContext({ ...apparaat.device, javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/${PROJECTEN[0]}`, { waitUntil: 'load' });
    const href = await page.locator('a[data-lightbox]').first().getAttribute('href');
    const antwoord = await page.goto(new URL(href, BASE_URL).toString());
    check(antwoord?.ok() && /image\//.test(antwoord.headers()['content-type'] ?? ''), `zonder JavaScript opent de link de grote foto (${antwoord?.headers()['content-type']})`);
    await context.close();
  }

  // ---- Minder beweging: alleen de opacity-fade van 150 ms
  {
    const context = await browser.newContext({ ...apparaat.device, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/${PROJECTEN[0]}`, { waitUntil: 'load' });
    const t = await page.evaluate(() => {
      const el = document.querySelector('dialog.lightbox .lightbox__laag--groot');
      const s = getComputedStyle(el);
      return { duur: s.transitionDuration, eigenschap: s.transitionProperty };
    });
    check(t.duur === '0.15s' && t.eigenschap === 'opacity', `minder beweging: overgang ${t.eigenschap} ${t.duur}`);
    await context.close();
  }

  // ---- Scrollbarbreedte: de pagina verspringt niet bij openen (alleen met klassieke scrollbars, dus Chromium desktop)
  if (!apparaat.touch) {
    const context = await browser.newContext({ ...apparaat.device });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/${PROJECTEN[0]}`, { waitUntil: 'load' });
    // Headless Chromium heeft overlay-scrollbars (0 px); dit stijlblok forceert een klassieke scrollbar van 15 px.
    await page.addStyleTag({ content: '::-webkit-scrollbar { width: 15px; background: #ccc; } ::-webkit-scrollbar-thumb { background: #888; }' });
    const meet = () =>
      page.evaluate(() => ({
        scrollbar: innerWidth - document.documentElement.clientWidth,
        links: Math.round(document.querySelector('.titelblok__titel').getBoundingClientRect().left * 10) / 10,
        raster: Math.round(document.querySelector('.raster').getBoundingClientRect().width * 10) / 10,
      }));
    const voor = await meet();
    await page.locator('a[data-lightbox]').first().click();
    await wacht(page, 400);
    const open = await meet();
    check(voor.scrollbar === 15 && voor.raster === open.raster && voor.links === open.links, `scrollbar ${voor.scrollbar} px: rasterbreedte ${voor.raster} → ${open.raster}, H1 links ${voor.links} → ${open.links}`);
    await context.close();
  }

  await browser.close();
}

console.log(regels.join('\n'));
console.log(mislukt ? '\nMISLUKT: zie de regels met FOUT.' : '\nGESLAAGD: alle controles.');
process.exit(mislukt ? 1 : 0);

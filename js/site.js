/* ==========================================================================
   EXPOSUL — comportamento e movimento
   Stack travada: GSAP 3.15.0 + ScrollTrigger, Lenis 1.3.26 (vendorizados).
   Princípios:
   - Só `transform` e `opacity` são animados.
   - Se o GSAP não carregar, a página continua completa e utilizável.
   - `prefers-reduced-motion` desliga todo o movimento.
   ========================================================================== */
(function () {
  'use strict';

  /* ---------------------------------------------------------------- setup */
  const html = document.documentElement;
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const HAS_GSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const ANIM = HAS_GSAP && !REDUCED;
  const WA_NUMBER = '5541996910019';

  if (HAS_GSAP) {
    gsap.registerPlugin(ScrollTrigger);
    // Só escondemos coisas se realmente vamos poder revelá-las.
    if (!REDUCED) html.classList.add('js-anim');
  }

  const $  = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

  const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const money = (n) => BRL.format(n);
  const int = (n) => n.toLocaleString('pt-BR');

  /* ------------------------------------------------------------ preloader
     Sai por três caminhos: load, timeout de segurança, ou erro. Nunca trava. */
  const preloader = $('#preloader');
  const preFill = $('#preloaderFill');
  const prePct = $('#preloaderPct');
  let preDone = false;

  function finishPreloader() {
    if (preDone) return;
    preDone = true;
    if (prePct) prePct.textContent = '100';
    if (preFill) preFill.style.transform = 'scaleX(1)';

    const done = () => {
      preloader.style.display = 'none';
      preloader.classList.add('is-done');
      document.body.classList.remove('is-locked');
      startHero();
      // Entra só depois do hero: no mobile ele cobria o CTA principal.
      const wa = $('#waFloat');
      if (wa) {
        if (ANIM) {
          ScrollTrigger.create({
            trigger: '.hero', start: 'bottom 80%',
            onEnter: () => wa.classList.add('is-in'),
            onLeaveBack: () => wa.classList.remove('is-in')
          });
        } else {
          wa.classList.add('is-in');
        }
      }
    };

    if (ANIM) {
      gsap.to(preloader, {
        yPercent: -100, duration: 0.9, ease: 'expo.inOut', delay: 0.25, onComplete: done
      });
    } else {
      done();
    }
  }

  // Progresso sintético: nunca depende de um asset específico terminar.
  let pct = 0;
  const preTimer = setInterval(() => {
    pct = Math.min(96, pct + Math.random() * 18);
    if (prePct) prePct.textContent = String(Math.floor(pct)).padStart(2, '0');
    if (preFill) preFill.style.transform = 'scaleX(' + (pct / 100) + ')';
  }, 140);

  function endPreloader() { clearInterval(preTimer); finishPreloader(); }
  window.addEventListener('load', endPreloader);
  setTimeout(endPreloader, 2600);          // rede lenta
  setTimeout(endPreloader, 6000);          // rede quebrada
  document.body.classList.add('is-locked');

  /* ----------------------------------------------------------------- lenis */
  let lenis = null;
  if (ANIM && typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false      // no toque, o scroll nativo é melhor e mais estável
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const stopScroll = () => { if (lenis) lenis.stop(); document.body.classList.add('is-locked'); };
  const startScroll = () => { if (lenis) lenis.start(); document.body.classList.remove('is-locked'); };

  // Âncoras internas passam pelo Lenis para manter a suavidade
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      closeMobileNav();
      if (lenis) lenis.scrollTo(target, { offset: -70 });
      else target.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth' });
    });
  });

  /* -------------------------------------------------- split de caracteres */
  function splitChars(el) {
    const text = el.textContent;
    const frag = document.createDocumentFragment();
    // Preserva marcação simples de <em> quebrando por nós filhos
    const build = (str, em) => {
      Array.from(str).forEach((ch) => {
        if (ch === ' ') { frag.appendChild(document.createTextNode(' ')); return; }
        const wrap = document.createElement('span');
        wrap.className = 'char-wrap';
        const inner = document.createElement(em ? 'em' : 'span');
        inner.className = 'char';
        inner.textContent = ch;
        wrap.appendChild(inner);
        frag.appendChild(wrap);
      });
    };
    Array.from(el.childNodes).forEach((node) => {
      if (node.nodeType === 3) build(node.textContent, false);
      else build(node.textContent, node.tagName === 'EM');
    });
    el.textContent = '';
    el.appendChild(frag);
    return Array.from(el.querySelectorAll('.char'));
  }

  /* ------------------------------------------------------------ hero
     Um único momento orquestrado — é aqui que gastamos a ousadia. */
  const heroLines = $$('[data-split]');
  let heroChars = [];
  if (HAS_GSAP) heroLines.forEach((l) => { heroChars = heroChars.concat(splitChars(l)); });

  function startHero() {
    if (!ANIM) return;
    const piece = $('.hero__piece');
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

    tl.from(piece, { yPercent: 12, scale: 1.06, opacity: 0, duration: 1.5 }, 0)
      .to(heroChars, { y: 0, duration: 1.15, stagger: 0.035 }, 0.15)   // 35ms: o stagger "caro"
      .from('.hero__key', { scale: 0.7, opacity: 0, duration: 1.8, ease: 'power2.out' }, 0)
      .from('.hero__rim', { scale: 0.6, opacity: 0, duration: 2.0, ease: 'power2.out' }, 0.1)
      .from('.hero__floor', { scaleX: 0.3, opacity: 0, duration: 1.4, ease: 'power2.out' }, 0.3)
      .from('.hero__blurb > *', { y: 26, opacity: 0, duration: 0.9, stagger: 0.08 }, 0.55)
      .from('.hero__scroll', { opacity: 0, duration: 0.8 }, 0.9)
      .from('.nav__inner > *', { y: -18, opacity: 0, duration: 0.8, stagger: 0.07 }, 0.35);

    // Separação em profundidade no scroll: cada camada em velocidade própria
    gsap.to('.hero__line--back', {
      yPercent: -68, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 }
    });
    gsap.to('.hero__line--front', {
      yPercent: 42, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 }
    });
    gsap.to(piece, {
      yPercent: 14, scale: 1.05, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.8 }
    });
    gsap.to('.hero__aside', {
      opacity: 0, y: -30, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: '55% top', scrub: 0.5 }
    });
  }

  /* ------------------------------------------------------------- parallax */
  if (ANIM) {
    $$('[data-parallax]').forEach((el) => {
      const amt = parseFloat(el.dataset.parallax) || 0.1;
      gsap.to(el, {
        yPercent: -amt * 100, ease: 'none',
        scrollTrigger: { trigger: el.closest('section') || el, start: 'top bottom', end: 'bottom top', scrub: 0.7 }
      });
    });
  }

  /* ------------------------------------------------------------------ nav */
  const nav = $('#nav');
  if (nav) {
    const setStuck = () => nav.classList.toggle('is-stuck', window.scrollY > 40);
    setStuck();
    window.addEventListener('scroll', setStuck, { passive: true });
  }

  const menuToggle = $('#menuToggle');
  const mobilenav = $('#mobilenav');
  function openMobileNav() {
    mobilenav.classList.add('is-open');
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Fechar menu');
    stopScroll();
  }
  function closeMobileNav() {
    if (!mobilenav || !mobilenav.classList.contains('is-open')) return;
    mobilenav.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Abrir menu');
    startScroll();
  }
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      mobilenav.classList.contains('is-open') ? closeMobileNav() : openMobileNav();
    });
  }

  /* -------------------------------------------------------------- marquee */
  const track = $('#marqueeTrack');
  if (track) {
    const words = ['Manequins', 'Cabides', 'Araras', 'Expositores', 'Aramados', 'Painéis', 'Balcões'];
    // Dois conjuntos idênticos: o wrap de -100% a 0 fica contínuo.
    const build = () => words.map((w) => '<span class="marquee__item">' + w + '<i></i></span>').join('');
    track.innerHTML = build() + build() + build() + build();

    if (ANIM) {
      const items = $$('.marquee__item', track);
      const loop = gsap.to(items, {
        xPercent: -100, repeat: -1, ease: 'none', duration: 22,
        modifiers: { xPercent: gsap.utils.wrap(-100, 0) }
      });
      // A velocidade e a direção do marquee seguem o scroll: detalhe que
      // vale mais que um hover em cada card.
      const setScale = gsap.quickTo(loop, 'timeScale', { duration: 0.5, ease: 'power2.out' });
      ScrollTrigger.create({
        onUpdate: (self) => {
          const v = Math.abs(self.getVelocity());
          setScale(self.direction * Math.min(6, 1 + v / 600));
        }
      });
    }
  }

  /* ------------------------------------------------------------ manifesto
     Reveal palavra a palavra amarrado ao progresso do scroll (scrub). */
  const mText = $('#manifestoText');
  if (mText) {
    const KEY = ['vendedor', 'vendedor.'];
    const words = mText.textContent.trim().split(/\s+/);
    mText.innerHTML = words.map((w) => {
      const bare = w.toLowerCase().replace(/[.,]/g, '');
      const key = KEY.indexOf(bare) > -1 ? ' word--key' : '';
      return '<span class="word' + key + '">' + w + '</span>';
    }).join(' ');

    if (ANIM) {
      const spans = $$('.word', mText);
      let litCount = 0;
      ScrollTrigger.create({
        trigger: '#manifestoPin',
        start: 'top 78%',
        end: 'bottom 62%',
        scrub: 0.4,
        onUpdate: (self) => {
          const lit = Math.min(spans.length, Math.round(self.progress * spans.length * 1.25));
          if (lit === litCount) return;          // sem isso, recalcula estilo a cada frame
          const from = Math.min(lit, litCount), to = Math.max(lit, litCount);
          for (let i = from; i < to; i++) spans[i].classList.toggle('is-lit', i < lit);
          litCount = lit;
        }
      });
    } else {
      $$('.word', mText).forEach((s) => s.classList.add('is-lit'));
    }
  }

  /* =========================================================== COMÉRCIO === */

  function tierFor(product, qty) {
    for (let i = 0; i < product.tiers.length; i++) {
      const t = product.tiers[i];
      if (qty >= t.min && (t.max === null || qty <= t.max)) return t;
    }
    return product.tiers[product.tiers.length - 1];
  }
  const basePrice = (p) => p.tiers[0].price;
  const priceFor = (p, q) => tierFor(p, q).price;
  const byId = (id) => CATALOG.filter((p) => p.id === id)[0];

  /* -------------------------------------------------------------- carrinho */
  const STORE_KEY = 'exposul.cart.v1';
  let cart = [];
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) cart = JSON.parse(raw).filter((l) => byId(l.id) && l.qty > 0);
  } catch (e) { cart = []; }

  function persist() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(cart)); } catch (e) { /* modo privado */ }
  }
  function cartUnits() { return cart.reduce((s, l) => s + l.qty, 0); }
  function cartTotals() {
    let total = 0, retail = 0;
    cart.forEach((l) => {
      const p = byId(l.id);
      total += priceFor(p, l.qty) * l.qty;
      retail += basePrice(p) * l.qty;
    });
    return { total: total, retail: retail, saved: retail - total };
  }
  function addToCart(id, qty) {
    const line = cart.filter((l) => l.id === id)[0];
    if (line) line.qty = Math.min(999, line.qty + qty);
    else cart.push({ id: id, qty: qty });
    persist(); renderCart();
  }
  function setQty(id, qty) {
    const line = cart.filter((l) => l.id === id)[0];
    if (!line) return;
    if (qty <= 0) cart = cart.filter((l) => l.id !== id);
    else line.qty = Math.min(999, qty);
    persist(); renderCart();
  }

  /* -------------------------------------------------------------- whatsapp */
  function waLink(text) {
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text);
  }
  function waForProduct(p, qty) {
    const unit = priceFor(p, qty);
    return waLink(
      'Olá! Vim pelo site da Exposul.\n\n' +
      '*' + p.name + '* (ref. ' + p.ref + ')\n' +
      'Quantidade: ' + qty + ' ' + (qty > 1 ? 'un.' : 'un.') + '\n' +
      'Valor unitário: ' + money(unit) + '\n' +
      'Total: ' + money(unit * qty) + '\n\n' +
      'Consegue confirmar disponibilidade, frete e prazo?'
    );
  }
  function waForCart() {
    const t = cartTotals();
    let msg = 'Olá! Vim pelo site da Exposul e montei este pedido:\n\n';
    cart.forEach((l) => {
      const p = byId(l.id);
      const unit = priceFor(p, l.qty);
      msg += '• ' + p.name + ' (ref. ' + p.ref + ')\n';
      msg += '  ' + l.qty + ' × ' + money(unit) + ' = ' + money(unit * l.qty) + '\n';
    });
    msg += '\nTotal: *' + money(t.total) + '*';
    if (t.saved > 0) msg += '\n(Desconto de lojista aplicado: ' + money(t.saved) + ')';
    msg += '\n\nConsegue confirmar disponibilidade, frete e prazo de entrega?';
    return waLink(msg);
  }
  $$('[data-wa-generic]').forEach((a) => {
    a.setAttribute('href', waLink('Olá! Vim pelo site da Exposul e gostaria de falar com o comercial.'));
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener');
  });

  /* ---------------------------------------------------------------- toast */
  const toast = $('#toast');
  const toastText = $('#toastText');
  let toastTimer;
  function say(msg) {
    if (!toast) return;
    toastText.textContent = msg;
    toast.classList.add('is-up');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-up'), 2600);
  }

  /* ------------------------------------------------------------- catálogo */
  const grid = $('#grid');
  const filtersEl = $('#filters');

  function artMarkup(p, cls) {
    // Soquete para foto real: se o produto tiver `photo`, ela entra no lugar
    // do desenho vetorial sem mudar mais nada.
    if (p.photo) {
      return '<img class="' + cls + '" src="' + p.photo + '" alt="' + p.name + '" loading="lazy" decoding="async">';
    }
    const tone = p.artTone ? ' art--' + p.artTone : '';
    const vb = p.art.indexOf('mannequin') > -1 || p.art === 'art-bust' ? '0 0 200 560'
             : p.art.indexOf('hanger') > -1 ? '0 0 400 260' : '0 0 400 520';
    return '<svg class="' + cls + ' art' + tone + '" viewBox="' + vb + '" role="img" aria-label="' + p.name + '">' +
           '<use href="#' + p.art + '"></use></svg>';
  }

  function cardMarkup(p) {
    const base = basePrice(p);
    const best = p.tiers[p.tiers.length - 1].price;
    const bestMin = p.tiers[p.tiers.length - 1].min;
    return '' +
      '<article class="card" data-cat="' + p.cat + '" data-id="' + p.id + '">' +
        '<button class="card__media" data-open="' + p.id + '" data-cursor="Ver ficha" aria-label="Abrir ficha de ' + p.name + '">' +
          (p.tag ? '<span class="card__tag">' + p.tag + '</span>' : '') +
          artMarkup(p, 'card__art') +
        '</button>' +
        '<div class="card__body">' +
          '<span class="card__cat">' + p.catLabel + ' · <span class="card__ref">' + p.ref + '</span></span>' +
          '<h3 class="card__name">' + p.name + '</h3>' +
          '<div class="card__prices">' +
            '<span class="card__price">' + money(base) + ' <small>/ ' + p.unit + '</small></span>' +
            '<span class="card__wholesale">' + money(best) + ' a partir de ' + bestMin + ' un.</span>' +
          '</div>' +
          '<div class="card__actions">' +
            '<button class="btn btn--sm" data-add="' + p.id + '">Adicionar</button>' +
            '<button class="card__spec" data-open="' + p.id + '" aria-label="Ver ficha técnica de ' + p.name + '">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">' +
              '<path d="M4 6h16M4 12h16M4 18h10"/></svg>' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</article>';
  }

  if (grid) {
    grid.innerHTML = CATALOG.map(cardMarkup).join('') +
      '<p class="empty" id="gridEmpty" hidden>Nada nesta categoria por enquanto.</p>';
  }

  if (filtersEl) {
    filtersEl.innerHTML = CATEGORIES.map((c) => {
      const n = c.id === 'todos' ? CATALOG.length : CATALOG.filter((p) => p.cat === c.id).length;
      return '<button class="filter" data-filter="' + c.id + '" aria-pressed="' + (c.id === 'todos') + '">' +
             c.label + '<span>' + n + '</span></button>';
    }).join('');

    filtersEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-filter]');
      if (!btn) return;
      const cat = btn.dataset.filter;
      $$('.filter', filtersEl).forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));

      const cards = $$('.card', grid);
      let shown = 0;
      cards.forEach((card) => {
        const match = cat === 'todos' || card.dataset.cat === cat;
        card.classList.toggle('is-out', !match);
        if (match) shown++;
      });
      $('#gridEmpty').hidden = shown > 0;

      if (ANIM) {
        gsap.fromTo(cards.filter((c) => !c.classList.contains('is-out')),
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.03, ease: 'power2.out', overwrite: true });
      }
      if (HAS_GSAP) ScrollTrigger.refresh();
    });
  }

  const footerCats = $('#footerCats');
  if (footerCats) {
    footerCats.innerHTML = CATEGORIES.filter((c) => c.id !== 'todos')
      .map((c) => '<li><a href="#catalogo" data-jump="' + c.id + '">' + c.label + '</a></li>').join('');
    footerCats.addEventListener('click', (e) => {
      const a = e.target.closest('[data-jump]');
      if (!a) return;
      const btn = $('[data-filter="' + a.dataset.jump + '"]');
      if (btn) setTimeout(() => btn.click(), 500);
    });
  }

  /* ------------------------------------------------------- foco em overlay */
  let lastFocus = null;
  function trapFocus(panel, e) {
    if (e.key !== 'Tab') return;
    const f = $$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', panel)
      .filter((el) => !el.disabled && el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  const scrim = $('#scrim');
  function openPanel(panel, focusEl) {
    lastFocus = document.activeElement;
    scrim.classList.add('is-open');
    panel.classList.add('is-open');
    stopScroll();
    setTimeout(() => {
      if (!focusEl) return;
      // focus() rola o ancestral rolável até o alvo — sem preventScroll o topo
      // da ficha (categoria e nome) ficava fora de vista ao abrir.
      try { focusEl.focus({ preventScroll: true }); } catch (e) { focusEl.focus(); }
    }, 80);
  }
  function closePanel(panel) {
    panel.classList.remove('is-open');
    if (!$('.panel.is-open')) { scrim.classList.remove('is-open'); startScroll(); }
    if (lastFocus) { try { lastFocus.focus(); } catch (e) {} }
  }
  scrim.addEventListener('click', () => $$('.panel.is-open').forEach(closePanel));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      $$('.panel.is-open').forEach(closePanel);
      closeMobileNav();
    }
  });

  /* --------------------------------------------------------- modal produto */
  const productPanel = $('#product');
  let current = null, currentQty = 1;

  function renderTiers(p, qty) {
    const active = tierFor(p, qty);
    $('#pTiers').innerHTML = p.tiers.map((t) => {
      const label = t.max === null ? t.min + '+ un.' : (t.min === t.max ? t.min + ' un.' : t.min + '–' + t.max + ' un.');
      const off = Math.round((1 - t.price / basePrice(p)) * 100);
      return '<div class="tier' + (t === active ? ' is-active' : '') + '">' +
             '<span class="tier__qty">' + label + '</span>' +
             '<span class="tier__val">' + money(t.price) +
             (off > 0 ? '<span class="tier__off">−' + off + '%</span>' : '') + '</span></div>';
    }).join('');
  }

  function renderProductPrice() {
    const p = current, q = currentQty;
    const unit = priceFor(p, q);
    $('#pTotal').textContent = money(unit * q);
    $('#pUnitPrice').textContent = money(unit) + ' por ' + p.unit;
    const saved = (basePrice(p) - unit) * q;
    $('#pSaved').textContent = saved > 0 ? 'Você economiza ' + money(saved) + ' na condição de lojista' : '';
    renderTiers(p, q);
    $('#pMinus').disabled = q <= 1;
  }

  function openProduct(id) {
    current = byId(id); currentQty = 1;
    if (!current) return;
    const p = current;

    $('#pCat').textContent = p.catLabel + ' · ' + p.ref;
    $('#pName').textContent = p.name;
    $('#pDesc').textContent = p.desc;
    $('#pUnit').textContent = 'valor por ' + p.unit;
    $('#pQty').value = 1;

    $('#pSpecs').innerHTML = Object.keys(p.specs).map((k) =>
      '<div><dt>' + k + '</dt><dd>' + p.specs[k] + '</dd></div>').join('');

    const media = $('.product__media');
    media.innerHTML = artMarkup(p, 'product__art');

    renderProductPrice();
    $('.product__info').scrollTop = 0;
    openPanel(productPanel, $('#productClose'));
    if (ANIM) {
      gsap.fromTo('.product__info > *', { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.045, delay: 0.2, ease: 'power2.out' });
    }
  }

  document.addEventListener('click', (e) => {
    const open = e.target.closest('[data-open]');
    if (open) { openProduct(open.dataset.open); return; }
    const add = e.target.closest('[data-add]');
    if (add) {
      const p = byId(add.dataset.add);
      addToCart(p.id, 1);
      say(p.name.split('—')[0].trim() + ' adicionado');
      if (ANIM) gsap.fromTo('#cartCount', { scale: 1 }, { scale: 1.35, duration: 0.18, yoyo: true, repeat: 1, ease: 'power2.out' });
    }
  });

  $('#productClose').addEventListener('click', () => closePanel(productPanel));
  productPanel.addEventListener('keydown', (e) => trapFocus(productPanel, e));

  $('#pMinus').addEventListener('click', () => { currentQty = Math.max(1, currentQty - 1); $('#pQty').value = currentQty; renderProductPrice(); });
  $('#pPlus').addEventListener('click', () => { currentQty = Math.min(999, currentQty + 1); $('#pQty').value = currentQty; renderProductPrice(); });
  $('#pQty').addEventListener('input', () => {
    const v = parseInt($('#pQty').value, 10);
    currentQty = isNaN(v) || v < 1 ? 1 : Math.min(999, v);
    renderProductPrice();
  });
  $('#pQty').addEventListener('blur', () => { $('#pQty').value = currentQty; });

  $('#pAdd').addEventListener('click', () => {
    addToCart(current.id, currentQty);
    say(currentQty + ' × ' + current.name.split('—')[0].trim() + ' no pedido');
    closePanel(productPanel);
    openCart();
  });
  $('#pBuy').addEventListener('click', () => {
    window.open(waForProduct(current, currentQty), '_blank', 'noopener');
  });

  /* ---------------------------------------------------------- painel carrinho */
  const cartPanel = $('#cart');
  function openCart() { openPanel(cartPanel, $('#cartClose')); }
  $('#cartOpen').addEventListener('click', openCart);
  $('#cartClose').addEventListener('click', () => closePanel(cartPanel));
  cartPanel.addEventListener('keydown', (e) => trapFocus(cartPanel, e));
  $('#cartCheckout').addEventListener('click', () => {
    if (!cart.length) return;
    window.open(waForCart(), '_blank', 'noopener');
  });

  function renderCart() {
    const items = $('#cartItems');
    const units = cartUnits();
    $('#cartCount').textContent = units;
    $('#cartCount').setAttribute('data-empty', String(units === 0));
    $('#cartQty').textContent = units === 0 ? 'vazio' : units + (units === 1 ? ' item' : ' itens');

    if (!cart.length) {
      items.innerHTML =
        '<div class="cart__empty">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">' +
        '<path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.55L21 8H6"/>' +
        '<circle cx="10" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/></svg>' +
        '<p>Seu pedido está vazio.<br>Escolha no catálogo e o valor de lojista aparece sozinho.</p></div>';
      $('#cartFoot').hidden = true;
      return;
    }

    items.innerHTML = cart.map((l) => {
      const p = byId(l.id);
      const unit = priceFor(p, l.qty);
      return '<div class="citem" data-line="' + p.id + '">' +
        '<div class="citem__art">' + artMarkup(p, 'citem__svg') + '</div>' +
        '<div>' +
          '<div class="citem__name">' + p.name + '</div>' +
          '<div class="citem__meta">' + money(unit) + ' / ' + p.unit + ' · ref. ' + p.ref + '</div>' +
          '<div class="citem__row">' +
            '<div class="stepper">' +
              '<button type="button" data-dec="' + p.id + '" aria-label="Diminuir">−</button>' +
              '<input type="number" value="' + l.qty + '" min="1" max="999" data-qty="' + p.id + '" aria-label="Quantidade de ' + p.name + '">' +
              '<button type="button" data-inc="' + p.id + '" aria-label="Aumentar">+</button>' +
            '</div>' +
            '<span class="citem__price">' + money(unit * l.qty) + '</span>' +
          '</div>' +
          '<button class="citem__drop" data-del="' + p.id + '">Remover</button>' +
        '</div>' +
      '</div>';
    }).join('');

    const t = cartTotals();
    $('#cartRetail').textContent = money(t.retail);
    $('#cartSaved').textContent = t.saved > 0 ? '− ' + money(t.saved) : money(0);
    $('#cartTotal').textContent = money(t.total);
    $('#cartFoot').hidden = false;
  }

  $('#cartItems').addEventListener('click', (e) => {
    const inc = e.target.closest('[data-inc]');
    const dec = e.target.closest('[data-dec]');
    const del = e.target.closest('[data-del]');
    if (inc) { const l = cart.filter((x) => x.id === inc.dataset.inc)[0]; setQty(l.id, l.qty + 1); }
    if (dec) { const l = cart.filter((x) => x.id === dec.dataset.dec)[0]; setQty(l.id, l.qty - 1); }
    if (del) { setQty(del.dataset.del, 0); say('Item removido'); }
  });
  $('#cartItems').addEventListener('change', (e) => {
    const inp = e.target.closest('[data-qty]');
    if (!inp) return;
    const v = parseInt(inp.value, 10);
    setQty(inp.dataset.qty, isNaN(v) ? 1 : v);
  });

  renderCart();

  /* ------------------------------------------------------- reveals gerais */
  if (ANIM) {
    $$('.reveal').forEach((el) => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
      gsap.set(el, { y: 34 });
    });
    $$('.stagger').forEach((group) => {
      const kids = Array.from(group.children);
      gsap.set(kids, { y: 30 });
      gsap.to(kids, {
        opacity: 1, y: 0, duration: 0.85, stagger: 0.07, ease: 'power3.out',
        scrollTrigger: { trigger: group, start: 'top 85%', once: true }
      });
    });

    // Cards do catálogo: reveal por recorte, escalonado
    gsap.set('.card', { opacity: 0, y: 40 });
    ScrollTrigger.batch('.card', {
      start: 'top 92%',
      onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.8, stagger: 0.04, ease: 'power3.out', overwrite: true }),
      once: true
    });
  }

  /* ------------------------------------------------------------ contadores */
  $$('[data-count]').forEach((el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const paint = (v) => {
      el.innerHTML = int(Math.round(v)) + (suffix ? '<i>' + suffix + '</i>' : '');
    };
    if (!ANIM) { paint(target); return; }
    const obj = { v: 0 };
    paint(0);
    gsap.to(obj, {
      v: target, duration: 1.6, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      onUpdate: () => paint(obj.v)
    });
  });

  /* ------------------------------------------------ cursor + magnetismo */
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (ANIM && canHover) {
    html.classList.add('has-cursor');
    const cur = $('#cursor');
    const label = $('#cursorLabel');
    const xTo = gsap.quickTo(cur, 'x', { duration: 0.35, ease: 'power3' });
    const yTo = gsap.quickTo(cur, 'y', { duration: 0.35, ease: 'power3' });

    window.addEventListener('mousemove', (e) => { xTo(e.clientX); yTo(e.clientY); }, { passive: true });
    document.addEventListener('mouseleave', () => cur.classList.add('is-hidden'));
    document.addEventListener('mouseenter', () => cur.classList.remove('is-hidden'));

    document.addEventListener('mouseover', (e) => {
      const hot = e.target.closest('[data-cursor]');
      if (hot) { label.textContent = hot.dataset.cursor; cur.classList.add('is-hot'); }
      else cur.classList.remove('is-hot');
    });

    // Botões magnéticos: puxam levemente na direção do mouse
    $$('[data-magnetic]').forEach((el) => {
      const mx = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' });
      const my = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' });
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        mx((e.clientX - (r.left + r.width / 2)) * 0.28);
        my((e.clientY - (r.top + r.height / 2)) * 0.4);
      });
      el.addEventListener('mouseleave', () => { mx(0); my(0); });
    });
  }

  /* ----------------------------------------------------------------- misc */
  const y = $('#year');
  if (y) y.textContent = new Date().getFullYear();

  // Recalcula posições quando fontes e imagens assentam
  if (HAS_GSAP) {
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
    window.addEventListener('load', () => ScrollTrigger.refresh());
  }
})();

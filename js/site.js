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
      if (HAS_GSAP) ScrollTrigger.refresh();
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
      duration: 0.95,       // 1.15 parecia "página lenta" em máquina modesta
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

  /* ------------------------------------------------------------ hero
     Sequência de frames em <canvas>, presa (sticky) e amarrada ao scroll. É
     O momento do site: toda a ousadia mora aqui e o resto fica quieto.

     Dois conjuntos do mesmo clipe:
       assets/hero-frames/    f_049…f_240 inteiros, 1120×720  → telas ≥ 900px (2,3 MB)
       assets/hero-frames-m/  f_049…f_239 de 2 em 2, recorte central 640×720
                              → celular em pé (< 600px), ~0,8 MB
     Tablet em pé (600–899px) usa os inteiros numa caixa menor: ver CSS.
     O recorte é exatamente o que cabe na tela em pé (100vw, quando o frame
     inteiro teria 175vw): a composição é a mesma nos dois conjuntos, e o
     poster inteiro com object-fit: cover na mesma caixa dá o mesmo recorte.

     Portões, todos obrigatórios para a sequência rodar:
       GSAP presente · sem prefers-reduced-motion · frames encontrados ·
       tela ≥ 900px, ou tela < 900px EM PÉ (celular deitado fica no poster:
       um recorte 640×720 coberto num 844×390 mostraria só o peito).
     Falhou qualquer um: poster estático, conteúdo completo, sem pin.
     Carregamento lento não é falha: ver heroPreload. Usuário que já rolou
     não é falha: ver heroBuildPin.

     O que a sequência mostra, medido frame a frame (não pela descrição):
       f_001–f_060  close no torso e recuo da câmera (o recuo acaba no 60)
       f_060–f_150  plano parado, cena aberta: arcos, base, busto frontal
       f_150–f_240  o busto gira até 3/4 */
  const hero = $('.hero');
  const heroCanvas = $('#heroCanvas');
  const HERO_FRAMES = 240;
  const HAS_SPLIT = HAS_GSAP && typeof window.SplitText !== 'undefined';
  if (HAS_SPLIT) gsap.registerPlugin(SplitText);

  // Abre no frame 48, não no 1: o clipe começa num close do peito e só no
  // 45–50 a câmera mostra o busto inteiro. Com o close coberto por altura
  // numa tela vertical, a primeira tela era um peito de três metros.
  const HERO_FIRST = 48;
  const heroState = { frame: HERO_FIRST };
  window.__heroState = heroState;    // só leitura, para o harness de verificação

  // 900px, não 1024: notebook de 1366px com 150% de escala no Windows tem
  // 910px CSS de largura, e janela não maximizada fica abaixo de 1024 fácil.
  // Precisa bater com os @media do CSS.
  const HERO_MIN_W = 900;
  // Abaixo de 600px (celular) entra o conjunto leve; tablet em pé (600–899)
  // usa os frames inteiros numa caixa que cabe na altura: o frame inteiro
  // pode ser mais estreito que 175vw sem mostrar borda, o recorte não.
  const HERO_CROP_W = 600;
  const MQ_DESKTOP = '(min-width: ' + HERO_MIN_W + 'px)';
  const MQ_TABLET = '(min-width: ' + HERO_CROP_W + 'px) and (max-width: ' + (HERO_MIN_W - 1) + 'px) and (orientation: portrait)';
  const MQ_PHONE = '(max-width: ' + (HERO_CROP_W - 1) + 'px) and (orientation: portrait)';
  const heroWantsSequence = ANIM && !!heroCanvas &&
    (window.matchMedia(MQ_DESKTOP).matches || window.matchMedia(MQ_TABLET).matches || window.matchMedia(MQ_PHONE).matches);

  // Os dois conjuntos. `idx` são os índices (0-based) que existem em cada
  // um; `loaded` e `imgs` são indexados por frame, como sempre, e o desenho
  // usa o frame mais próximo já carregado — no conjunto leve, que só tem os
  // pares, isso rende o giro de 2 em 2 sem nenhum caso especial.
  const heroSets = {
    d: { key: 'd', w: 1120, h: 720, dir: 'assets/hero-frames/',   embed: 'EXPOSUL_FRAMES',   idx: [], imgs: new Array(HERO_FRAMES), loaded: new Uint8Array(HERO_FRAMES), promise: null, ok: null },
    m: { key: 'm', w: 640,  h: 720, dir: 'assets/hero-frames-m/', embed: 'EXPOSUL_FRAMES_M', idx: [], imgs: new Array(HERO_FRAMES), loaded: new Uint8Array(HERO_FRAMES), promise: null, ok: null }
  };
  for (let i = HERO_FIRST; i < HERO_FRAMES; i++) {
    heroSets.d.idx.push(i);
    if ((i - HERO_FIRST) % 2 === 0) heroSets.m.idx.push(i);
  }
  let heroCur = heroSets[window.matchMedia('(max-width: ' + (HERO_CROP_W - 1) + 'px)').matches ? 'm' : 'd'];
  window.__heroLoaded = heroCur.loaded;   // harness
  window.__heroSet = () => heroCur.key;   // harness
  let heroCtx = null, heroDrawn = -1, heroLive = false, heroST = null;

  // A versão hospedada (build-artifact.js) embute os frames como data: URI
  // em window.EXPOSUL_FRAMES / EXPOSUL_FRAMES_M (objeto índice → URI); a
  // versão em pastas lê dos diretórios.
  const heroSrc = (set, i) => (window[set.embed] && window[set.embed][i]) ||
    (set.dir + 'f_' + String(i + 1).padStart(3, '0') + '.webp');

  /* O canvas fica no tamanho NATIVO dos frames do conjunto e o CSS o estica
     com object-fit: cover. Assim o drawImage é uma cópia 1:1, sem
     reamostragem — a escala acontece no compositor, uma vez por frame, de
     graça na GPU. Desenhar num canvas do tamanho da viewport reamostrava
     0,8 MP a cada frame; medido em software, era a maior parte do custo. */
  function heroResize() {
    if (!heroCanvas || !hero) return;
    if (heroCanvas.width !== heroCur.w || heroCanvas.height !== heroCur.h) {
      heroCanvas.width = heroCur.w;
      heroCanvas.height = heroCur.h;
    }
    heroCtx = heroCanvas.getContext('2d', { alpha: false });
    heroCtx.imageSmoothingEnabled = false;   // cópia 1:1: suavização só custaria
    heroDrawn = -1;
    heroDraw(Math.round(heroState.frame));
  }

  /* Bitmaps decodificados numa janela deslizante em volta do frame atual.
     Sem isto o navegador re-decodifica frames que o próprio cache de
     imagens descartou (240 × 1120×720 não cabem nele) — medido: 8 frames
     acima de 33 ms na primeira passada, nenhum na segunda, e de volta na
     quarta. createImageBitmap decodifica fora da thread principal; a
     janela mantém ~40 frames prontos e libera o resto. */
  const HERO_USE_BITMAPS = false;   // medido: em rasterização por software piorou; ver README
  const HERO_WINDOW = 20;
  const heroBitmaps = new Map();
  const heroPending = new Set();
  function heroEnsureWindow(center) {
    if (!HERO_USE_BITMAPS || typeof createImageBitmap !== 'function') return;
    const set = heroCur;
    const lo = Math.max(0, center - HERO_WINDOW), hi = Math.min(HERO_FRAMES - 1, center + HERO_WINDOW);
    heroBitmaps.forEach((bm, k) => { if (k < lo - 8 || k > hi + 8) { bm.close(); heroBitmaps.delete(k); } });
    for (let d = 0; d <= HERO_WINDOW; d++) {
      for (const k of [center + d, center - d]) {
        if (k < lo || k > hi || heroBitmaps.has(k) || heroPending.has(k) || !set.loaded[k]) continue;
        heroPending.add(k);
        createImageBitmap(set.imgs[k]).then((bm) => {
          heroPending.delete(k);
          if (set === heroCur && Math.abs(k - Math.round(heroState.frame)) <= HERO_WINDOW + 8) heroBitmaps.set(k, bm); else bm.close();
        }).catch(() => heroPending.delete(k));
      }
    }
  }

  // Desenha o frame pedido ou o mais próximo já carregado, para nunca
  // mostrar um buraco. Só redesenha quando o índice muda.
  function heroDraw(i) {
    if (!heroCtx) return;
    const L = heroCur.loaded;
    let k = Math.max(0, Math.min(HERO_FRAMES - 1, i));
    while (k > 0 && !L[k]) k--;
    if (!L[k] || k === heroDrawn) return;
    const t0 = window.__heroProfile ? performance.now() : 0;
    heroCtx.drawImage(heroBitmaps.get(k) || heroCur.imgs[k], 0, 0);   // 1:1
    if (window.__heroProfile) window.__heroProfile.push(performance.now() - t0);
    heroDrawn = k;
    heroEnsureWindow(k);
  }
  function heroTick() { if (heroLive) heroDraw(Math.round(heroState.frame)); }

  // Carrega e decodifica um conjunto. Política: falha rápido, espera com
  // paciência. Resolve true quando dá para ligar a sequência:
  //   · 90% dos frames prontos — o caminho normal, 1 a 4 s; ou
  //   · passaram 5 s sem nenhuma falha e já há 10%: liga em modo
  //     progressivo. O desenho usa o frame mais próximo já carregado e os
  //     demais vão entrando (disco lento, antivírus varrendo os arquivos
  //     recém-extraídos, 4G). Desistir aos 5 s, como antes, era trocar o
  //     hero por um poster justamente em quem mais demora.
  // Resolve false se 8+ frames falharam (pasta ausente: todos falham em
  // milissegundos) ou se em 20 s ainda não chegou a 10%.
  function heroPreload(set) {
    if (set.promise) return set.promise;
    set.promise = new Promise((resolve) => {
      const N = set.idx.length, t0 = performance.now();
      let settled = 0, loaded = 0, errors = 0, finished = false;
      const finish = (ok) => {
        if (finished) return;
        finished = true; clearTimeout(t5); clearTimeout(t20);
        set.ok = ok;
        resolve(ok);
      };
      const check = () => {
        if (finished) return;
        if (errors >= 8) return finish(false);
        if (loaded >= N * 0.9) return finish(true);
        if (performance.now() - t0 >= 5000 && loaded >= N * 0.1) return finish(true);
        if (settled === N) return finish(loaded >= N * 0.1);
      };
      const t5 = setTimeout(check, 5000);
      const t20 = setTimeout(() => finish(loaded >= N * 0.1), 20000);
      set.idx.forEach((i) => {
        const img = new Image();
        img.decoding = 'async';
        set.imgs[i] = img;
        const mark = (ok) => {
          settled++;
          if (ok) { set.loaded[i] = 1; loaded++; } else errors++;
          check();
        };
        img.onload = () => (img.decode ? img.decode().catch(() => {}) : Promise.resolve()).then(() => mark(true));
        img.onerror = () => mark(false);
        img.src = heroSrc(set, i);
      });
    });
    return set.promise;
  }

  // Troca de conjunto quando a tela cruza os 900px com a sequência viva
  // (tablet girando, janela redimensionada). Até o outro conjunto chegar, o
  // atual continua na tela: object-fit: cover recorta o inteiro na caixa do
  // recorte, e o recorte esticado na caixa do inteiro perde as bordas por
  // alguns segundos — melhor que um buraco.
  function heroUseSet(key) {
    const set = heroSets[key];
    if (heroCur === set) return;
    const apply = () => {
      heroCur = set;
      window.__heroLoaded = set.loaded;
      heroBitmaps.forEach((bm) => bm.close()); heroBitmaps.clear();
      heroDrawn = -1;
      if (heroLive) heroResize();
    };
    if (set.ok) return apply();
    heroPreload(set).then((ok) => { if (ok && heroSets[key] !== heroCur) apply(); });
  }

  // Sem sequência (celular deitado, reduced-motion, falha de carregamento):
  // mostra o conteúdo que a coreografia teria revelado.
  function heroFallback() {
    if (heroLive || !HAS_GSAP) return;
    gsap.to(['#heroP1', '#heroP2', '#heroCta'], { autoAlpha: 1, opacity: 1, y: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out', delay: 0.2 });
  }

  const heroMM = HAS_GSAP ? gsap.matchMedia() : null;

  function heroBuildPin() {
    if (heroST || !heroMM) return false;
    // A pista tem 4 telas; o hero estático, uma. Se o usuário já rolou
    // (recarregou no meio da página — o Chrome devolve à mesma posição —,
    // chegou por âncora, ou o carregamento foi lento), crescer o hero
    // embaixo dele empurraria tudo 3 telas para baixo. Antes a sequência
    // desistia nesse caso, e "recarregar para ver de novo" virava poster.
    // Agora liga e compensa o scroll na mesma medida: o que estava na tela
    // continua na tela.
    const yBefore = window.scrollY, hBefore = hero.offsetHeight;

    // Objeto de condições: a função roda quando qualquer uma casa e roda de
    // novo (depois da limpeza) quando o estado muda — tela cruzando 900px,
    // celular girando. Nenhuma casando (celular deitado): desmonta, poster.
    heroMM.add({
      desktop: MQ_DESKTOP + ' and (prefers-reduced-motion: no-preference)',
      tablet: MQ_TABLET + ' and (prefers-reduced-motion: no-preference)',
      phone: MQ_PHONE + ' and (prefers-reduced-motion: no-preference)'
    }, (ctx) => {
      heroUseSet(ctx.conditions.phone ? 'm' : 'd');
      hero.classList.add('is-live');       // vira a pista de 4 telas (CSS)
      heroLive = true;
      heroResize();
      heroEnsureWindow(HERO_FIRST);
      gsap.ticker.add(heroTick);          // redesenho no ticker, nunca no evento de scroll

      // O título entra no carregamento (startHero), nos dois modos. Aqui o
      // scroll só o tira de cena.
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom bottom',           // a pista inteira: sticky segura o palco
          scrub: 0.8,
          invalidateOnRefresh: true,
          // grão e blur da nav saem enquanto o busto está na tela: ver CSS
          onToggle: (self) => document.body.classList.toggle('hero-pinned', self.isActive)
        }
      });
      heroST = tl.scrollTrigger;
      window.__heroST = heroST;           // exposto para o harness de verificação

      /* Os frames, remapeados ao que o clipe tem de verdade (medido):
           f_048–f_060  busto inteiro, câmera assenta →  6% da pista
           f_060–f_150  plano parado                  →  8%, comprimido: ninguém nota
           f_150–f_240  o busto gira até 3/4          → 86%: o giro domina o scroll
         O close do início (f_001–f_047) ficou de fora: ver HERO_FIRST. */
      tl.to(heroState, { frame: 59,  duration: 0.06 }, 0)
        .to(heroState, { frame: 149, duration: 0.08 }, 0.06)
        .to(heroState, { frame: 239, duration: 0.86 }, 0.14);

      tl.to('#heroScroll', { autoAlpha: 0, duration: 0.04 }, 0.02);

      // Título: já está na tela (entrou no carregamento); sai antes da
      // primeira frase. Opacidade, não visibility: fica na árvore de
      // acessibilidade o tempo todo.
      tl.to('#heroTitle', { opacity: 0, y: -28, duration: 0.06, ease: 'power2.in' }, 0.26);

      // Uma frase por vez, no mesmo lugar do título (área preta à esquerda
      // no desktop; embaixo do busto no celular), enquanto o busto gira.
      tl.fromTo('#heroP1', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.06, ease: 'power3.out' }, 0.34);
      tl.to('#heroP1', { opacity: 0, y: -24, duration: 0.05, ease: 'power2.in' }, 0.54);
      tl.fromTo('#heroP2', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.06, ease: 'power3.out' }, 0.60);
      tl.to('#heroP2', { opacity: 0, y: -24, duration: 0.05, ease: 'power2.in' }, 0.80);

      // Fim: um CTA só, e o degradê fecha em --ink-2 para emendar no marquee.
      tl.fromTo('#heroCta', { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.06, ease: 'power3.out' }, 0.88);
      tl.to('#heroFade', { opacity: 1, duration: 0.1 }, 0.90);

      return () => {                      // condições mudaram: desmonta tudo
        gsap.ticker.remove(heroTick);
        heroBitmaps.forEach((bm) => bm.close()); heroBitmaps.clear();
        document.body.classList.remove('hero-pinned');
        hero.classList.remove('is-live');
        heroLive = false; heroST = null; window.__heroST = null;
      };
    });
    if (heroST && yBefore > hBefore * 0.5) {
      const y = yBefore + (hero.offsetHeight - hBefore);
      if (lenis) lenis.scrollTo(y, { immediate: true, force: true }); else window.scrollTo(0, y);
    }
    return !!heroST;
  }

  if (heroWantsSequence) {
    // Escondidos desde já (o preloader cobre a tela): a coreografia revela.
    gsap.set(['#heroP1', '#heroP2'], { opacity: 0 });
    gsap.set('#heroCta', { autoAlpha: 0 });
    const heroT0 = performance.now();
    heroPreload(heroCur).then((ok) => {
      window.__heroPreload = { ok: ok, ms: Math.round(performance.now() - heroT0), carregados: heroCur.loaded.reduce((a, b) => a + b, 0), conjunto: heroCur.key, total: heroCur.idx.length };   // só leitura, harness
      if (!ok || !heroBuildPin()) heroFallback();
      ScrollTrigger.refresh();
    });
  }

  // Entrada no carregamento (tempo, não scroll): quem não rola ainda vê a
  // headline. Linhas via SplitText com máscara, escalonadas em 55 ms.
  function startHero() {
    if (!ANIM || !hero) return;
    const play = () => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
      tl.from('.nav__inner > *', { y: -18, opacity: 0, duration: 0.8, stagger: 0.07 }, 0.1);
      // Título entra por linha no carregamento, nos DOIS modos: quem não
      // rola vê a headline, e a primeira tela (miniatura, link compartilhado)
      // já é busto + headline. No modo vivo o scroll só a tira (heroBuildPin).
      // A máscara é HTML fixo (.hero__ln-mask > .hero__ln): o SplitText
      // devolvia, para a metade direita, um nó diferente do que ficava no DOM.
      // Estado inicial via set(): from() com stagger só renderiza de
      // imediato o PRIMEIRO alvo e o segundo piscava.
      const lines = ['#heroTitleL .hero__ln', '#heroTitleR .hero__ln'];
      gsap.set(lines, { yPercent: 108 });
      tl.to(lines, { yPercent: 0, duration: 1.2, stagger: 0.055 }, 0);
      ScrollTrigger.refresh();
    };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(play); else play();
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
    setTimeout(() => {
      const first = mobilenav.querySelector('a');
      if (first) { try { first.focus({ preventScroll: true }); } catch (e) { first.focus(); } }
    }, 320);
  }
  function closeMobileNav() {
    if (!mobilenav || !mobilenav.classList.contains('is-open')) return;
    mobilenav.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Abrir menu');
    startScroll();
    try { menuToggle.focus({ preventScroll: true }); } catch (e) {}
  }
  if (mobilenav) mobilenav.addEventListener('keydown', (e) => trapFocus(mobilenav, e));
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
    const q = (typeof qty === 'number' && isFinite(qty)) ? Math.max(1, Math.floor(qty)) : 1;
    for (let i = 0; i < product.tiers.length; i++) {
      const t = product.tiers[i];
      if (q >= t.min && (t.max === null || q <= t.max)) return t;
    }
    return product.tiers[product.tiers.length - 1];
  }
  const basePrice = (p) => p.tiers[0].price;

  /* A faixa vale pelo VOLUME DO PEDIDO, não por item isolado.
     O comprador real da Exposul monta cesta larga e rasa — 3 manequins,
     1 arara, 2 pacotes de cabide. Calculando por item, esse pedido de mais
     de dois mil reais caía inteiro no varejo e o carrinho exibia
     "Desconto de lojista R$ 0,00" — justamente para o cliente-alvo. */
  const priceFor = (p, lineQty, orderUnits) =>
    tierFor(p, Math.max(lineQty || 1, orderUnits || 0)).price;

  const byId = (id) => CATALOG.filter((p) => p.id === id)[0];
  const unitLabel = (p) => (typeof unitShort === 'function' ? unitShort(p.unit) : 'un.');

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

  function cartTotals(extraUnits) {
    const units = cartUnits() + (extraUnits || 0);
    let total = 0, retail = 0;
    cart.forEach((l) => {
      const p = byId(l.id);
      total += priceFor(p, l.qty, units) * l.qty;
      retail += basePrice(p) * l.qty;
    });
    return { total: total, retail: retail, saved: retail - total, units: units };
  }

  /* Próximo degrau do pedido: quantos itens faltam e quanto isso devolve.
     O ganho de ticket na venda por escada vem do empurrão, não da tabela. */
  function nextStep() {
    const units = cartUnits();
    if (!cart.length) return null;
    let target = null;
    cart.forEach((l) => {
      byId(l.id).tiers.forEach((t) => {
        if (t.min > units && (target === null || t.min < target)) target = t.min;
      });
    });
    if (target === null) return null;
    const now = cartTotals().total;
    const then = cartTotals(target - units).total;
    const gain = now - then;
    if (gain <= 0) return null;
    return { missing: target - units, gain: gain };
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
  /* A ficha cota SEMPRE pela quantidade do próprio item, nunca pelo carrinho.
     Cotar a faixa do pedido inteiro numa mensagem que lista uma peça só é
     prometer um preço que a mensagem não justifica. O desconto por volume
     aparece no carrinho, onde os itens que o sustentam estão à vista — e lá
     ele só pode melhorar, nunca piorar. */
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
      const unit = priceFor(p, l.qty, t.units);
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
    const wide = p.art.indexOf('hanger') > -1 ? ' art--wide' : '';
    // viewBox apertado no conteúdo: com o quadro cheio, o desenho usava só
    // ~56% da própria largura e a peça boiava dentro do card.
    const vb = p.art.indexOf('mannequin') > -1 || p.art === 'art-bust' ? '36 0 128 552'
             : p.art.indexOf('hanger') > -1 ? '34 38 332 158' : '28 24 344 476';
    return '<svg class="' + cls + ' art' + tone + wide + '" viewBox="' + vb + '" role="img" aria-label="' + p.name + '">' +
           '<use href="#' + p.art + '"></use></svg>';
  }

  function cardMarkup(p) {
    const base = basePrice(p);
    const best = p.tiers[p.tiers.length - 1].price;
    const bestMin = p.tiers[p.tiers.length - 1].min;
    return '' +
      '<article class="card" data-cat="' + p.cat + '" data-id="' + p.id + '">' +
        '<button class="card__media" data-open="' + p.id + '" aria-label="Abrir ficha de ' + p.name + '">' +
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

    let activeCat = 'todos';
    let query = '';

    const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    function applyFilters(animate) {
      const q = norm(query.trim());
      const cards = $$('.card', grid);
      let shown = 0;
      cards.forEach((card) => {
        const p = byId(card.dataset.id);
        const hitCat = activeCat === 'todos' || card.dataset.cat === activeCat;
        const hitQ = !q || norm(p.name + ' ' + p.ref + ' ' + p.catLabel).indexOf(q) > -1;
        const match = hitCat && hitQ;
        card.classList.toggle('is-out', !match);
        if (match) shown++;
      });
      const status = $('#gridStatus');
      if (status) {
        status.textContent = shown === 0 ? 'Nenhum item encontrado.'
          : shown + (shown === 1 ? ' item encontrado.' : ' itens encontrados.');
      }
      const empty = $('#gridEmpty');
      empty.hidden = shown > 0;
      empty.textContent = q
        ? 'Nada encontrado para "' + query.trim() + '". Tente o nome ou a referência, como MQ-1140.'
        : 'Nada nesta categoria por enquanto.';

      if (animate && ANIM) {
        gsap.fromTo(cards.filter((c) => !c.classList.contains('is-out')),
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.03, ease: 'power2.out', overwrite: true });
      } else if (!ANIM || !animate) {
        // Sem isso, um card filtrado antes de revelar ficaria invisível para sempre.
        if (HAS_GSAP) cards.forEach((c) => { if (!c.classList.contains('is-out')) gsap.set(c, { opacity: 1, y: 0 }); });
      }
      if (HAS_GSAP) ScrollTrigger.refresh();
    }

    filtersEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-filter]');
      if (!btn) return;
      activeCat = btn.dataset.filter;
      $$('.filter', filtersEl).forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      applyFilters(true);
    });

    const searchEl = $('#search');
    if (searchEl) {
      let t;
      searchEl.addEventListener('input', () => {
        query = searchEl.value;
        clearTimeout(t);
        t = setTimeout(() => applyFilters(true), 140);
      });
    }
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
    document.body.classList.add('has-panel');
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
    if (!$('.panel.is-open')) {
      scrim.classList.remove('is-open');
      document.body.classList.remove('has-panel');
      // Só destrava se o menu mobile também estiver fechado, senão a página
      // rolava atrás de um painel opaco de tela cheia.
      if (!mobilenav || !mobilenav.classList.contains('is-open')) startScroll();
    }
    if (panel === cartPanel) $('#cartOpen').setAttribute('aria-expanded', 'false');
    if (panel === productPanel && location.hash.indexOf('#produto/') === 0) {
      try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}   // iframe com origem opaca lança
    }
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
    const u = unitLabel(p);   // "30 un." de um pacote de 50 era lido como 30 peças
    $('#pTiers').innerHTML = p.tiers.map((t) => {
      const label = t.max === null ? t.min + '+ ' + u : (t.min === t.max ? t.min + ' ' + u : t.min + '–' + t.max + ' ' + u);
      const off = Math.round((1 - t.price / basePrice(p)) * 100);
      return '<div class="tier' + (t === active ? ' is-active' : '') + '">' +
             '<span class="tier__qty">' + label + '</span>' +
             '<span class="tier__val">' + money(t.price) +
             (off > 0 ? '<span class="tier__off">−' + off + '%</span>' : '') + '</span></div>';
    }).join('');
  }

  function renderProductPrice() {
    const p = current, q = currentQty;
    const unit = priceFor(p, q);                 // faixa do próprio item
    $('#pTotal').textContent = money(unit * q);
    $('#pUnitPrice').textContent = money(unit) + ' por ' + p.unit;

    const saved = (basePrice(p) - unit) * q;
    $('#pSaved').textContent = saved > 0
      ? 'Economia de ' + money(saved) + ' na condição de lojista'
      : 'A partir de ' + p.tiers[1].min + ' ' + unitLabel(p) + ' o preço de lojista entra sozinho';

    // No carrinho a faixa vale pelo volume do pedido inteiro, então o preço
    // só pode melhorar. Mostramos isso como ganho, sem cotá-lo aqui.
    const jaNoPedido = cartUnits();
    const noPedido = priceFor(p, q, q + jaNoPedido);
    $('#pCartNote').textContent = (jaNoPedido > 0 && noPedido < unit)
      ? 'Com o pedido atual (' + jaNoPedido + (jaNoPedido === 1 ? ' item' : ' itens') + '), cai para ' +
        money(noPedido) + ' por ' + p.unit + ' no carrinho.'
      : '';

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
    // Rota por produto: o vendedor precisa colar o link do item na conversa.
    try { history.replaceState(null, '', '#produto/' + p.id); } catch (e) {}
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
  function openCart() { openPanel(cartPanel, $('#cartClose')); $('#cartOpen').setAttribute('aria-expanded', 'true'); }
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
      const unit = priceFor(p, l.qty, units);
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

    const step = nextStep();
    const nudge = $('#cartNudge');
    if (step) {
      nudge.innerHTML = 'Faltam <b>' + step.missing + (step.missing === 1 ? ' item' : ' itens') +
        '</b> para a próxima faixa — economia de <b>' + money(step.gain) + '</b> neste pedido.';
      nudge.hidden = false;
    } else {
      nudge.hidden = true;
    }
    $('#cartSavedRow').hidden = t.saved <= 0;
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
    const id = inp.dataset.qty;
    const v = parseInt(inp.value, 10);
    setQty(id, isNaN(v) ? 1 : v);
    // renderCart() reescreve a lista inteira: sem devolver o foco, ele caía
    // no <body>, fora do diálogo, furando a armadilha de foco.
    const again = $('[data-qty="' + id + '"]');
    if (again) { try { again.focus({ preventScroll: true }); again.select(); } catch (e) {} }
  });

  renderCart();

  // Link compartilhado abre a ficha direto.
  function openFromHash() {
    const m = /^#produto\/(.+)$/.exec(location.hash);
    if (m && byId(m[1])) setTimeout(() => openProduct(m[1]), 400);
  }
  openFromHash();
  window.addEventListener('hashchange', openFromHash);

  /* ------------------------------------------------------- reveals
     Depois do hero, o site fica quieto. Sobram dois movimentos ligados ao
     scroll: os cards do catálogo (um reveal por recorte, escalonado) e o
     manifesto (palavra a palavra, acima). Section-heads, listas, contadores
     e parallax não animam mais — o mesmo fade-up em toda seção era o tell
     clássico de página gerada. */
  if (ANIM) {
    gsap.set('.card', { opacity: 0, y: 40 });
    ScrollTrigger.batch('.card', {
      start: 'top 92%',
      onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.8, stagger: 0.04, ease: 'power3.out', overwrite: true }),
      once: true
    });
  }

  /* ------------------------------------------------------------ contadores */
  $$('[data-count]').forEach((el) => {
    const suffix = el.dataset.suffix || '';
    el.innerHTML = int(Math.round(parseFloat(el.dataset.count))) + (suffix ? '<i>' + suffix + '</i>' : '');
  });

  /* Cursor customizado e botões magnéticos foram removidos: um tween por
     movimento do mouse sobre um canvas que já troca de frame a cada scroll
     custava caro em máquina modesta, e os dois são o tique mais reconhecível
     de site-template. O mouse do sistema basta. */

  /* ----------------------------------------------------------------- misc */
  const y = $('#year');
  if (y) y.textContent = new Date().getFullYear();

  // Recalcula posições quando fontes e imagens assentam
  if (HAS_GSAP) {
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
    window.addEventListener('load', () => ScrollTrigger.refresh());
  }
})();

/* ==========================================================================
   BIANCA BREDA — comportamento e movimento
   Stack travada: GSAP 3.15.0 + ScrollTrigger, Lenis 1.3.26 (vendorizados).
   Princípios herdados do projeto anterior:
   - Só `transform` e `opacity` são animados.
   - Se o GSAP não carregar, a página continua completa e utilizável.
   - `prefers-reduced-motion` desliga todo o movimento.
   O Raio-X roda 100% local: nenhuma resposta sai do navegador sem clique.
   ========================================================================== */
(function () {
  'use strict';

  /* ---------------------------------------------------------------- setup */
  const html = document.documentElement;
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const HAS_GSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const ANIM = HAS_GSAP && !REDUCED;

  /* ÚNICO lugar onde o número aparece. Trocar aqui troca o site inteiro. */
  const WA_NUMBER = '5541991948545';

  if (HAS_GSAP) {
    gsap.registerPlugin(ScrollTrigger);
    if (!REDUCED) html.classList.add('js-anim');
  }

  const $  = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

  const waLink = (msg) => 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg);

  /* Todo CTA com data-wa vira link de WhatsApp com mensagem própria: ela
     recebe a conversa já sabendo de onde a pessoa veio. */
  function wireWhatsApp(scope) {
    $$('[data-wa]', scope).forEach((el) => {
      el.setAttribute('href', waLink(el.getAttribute('data-wa')));
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener');
    });
  }
  wireWhatsApp(document);

  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ------------------------------------------------------------ preloader
     Sai por três caminhos: load, timeout curto, timeout longo. Nunca trava. */
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
      // O botão flutuante só entra depois do hero: no celular ele cobria o CTA.
      const wa = $('#waFloat');
      if (!wa) return;
      if (ANIM) {
        ScrollTrigger.create({
          trigger: '.hero', start: 'bottom 85%',
          onEnter: () => wa.classList.add('is-in'),
          onLeaveBack: () => wa.classList.remove('is-in')
        });
      } else {
        wa.classList.add('is-in');
      }
    };

    if (ANIM) {
      gsap.to(preloader, { yPercent: -100, duration: 0.9, ease: 'expo.inOut', delay: 0.2, onComplete: done });
    } else {
      done();
    }
  }

  let pct = 0;
  const preTimer = setInterval(() => {
    pct = Math.min(96, pct + Math.random() * 20);
    if (prePct) prePct.textContent = String(Math.floor(pct)).padStart(2, '0');
    if (preFill) preFill.style.transform = 'scaleX(' + (pct / 100) + ')';
  }, 130);

  function endPreloader() { clearInterval(preTimer); finishPreloader(); }
  window.addEventListener('load', endPreloader);
  setTimeout(endPreloader, 2400);   // rede lenta
  setTimeout(endPreloader, 6000);   // rede quebrada
  document.body.classList.add('is-locked');

  /* ---------------------------------------------------------------- lenis */
  let lenis = null;
  if (ANIM && typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false   // no toque o scroll nativo é melhor e mais estável
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      closeNav();
      if (lenis) lenis.scrollTo(target, { offset: -(parseInt(getComputedStyle(html).getPropertyValue('--nav-h')) || 72) - 16 });
      else target.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth' });
    });
  });

  /* ------------------------------------------------------------------ nav */
  const nav = $('#nav');
  const burger = $('#navBurger');
  function closeNav() {
    if (!nav) return;
    nav.classList.remove('is-open');
    if (burger) burger.setAttribute('aria-expanded', 'false');
  }
  if (burger) {
    burger.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
    });
  }
  const onScrollNav = () => {
    if (nav) nav.classList.toggle('is-stuck', window.scrollY > 24);
  };
  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeNav(); });

  /* ------------------------------------------------- split de caracteres */
  function splitChars(el) {
    const text = el.textContent;
    el.textContent = '';
    const frag = document.createDocumentFragment();
    for (const ch of text) {
      const s = document.createElement('span');
      s.className = 'hero__char';
      s.textContent = ch === ' ' ? ' ' : ch;
      frag.appendChild(s);
    }
    el.appendChild(frag);
    return Array.from(el.children);
  }

  /* ------------------------------------------------------------ hero + carimbo */
  let heroStarted = false;
  function startHero() {
    if (heroStarted) return;
    heroStarted = true;
    const stamp = $('#stamp');

    if (!ANIM) {
      if (stamp) stamp.style.opacity = '0.92';
      return;
    }

    const lines = $$('[data-split]');
    const chars = [];
    lines.forEach((l) => {
      // Preserva o <em> colorido: divide só o texto puro de cada linha.
      const em = l.querySelector('em');
      if (em) {
        const inner = splitChars(em);
        chars.push(inner);
      } else {
        chars.push(splitChars(l));
      }
    });

    /* Armadilha: o GSAP lê o transform COMPUTADO, que o navegador já resolveu
       em pixels. O `translateY(105%)` do CSS chega como y:106px, yPercent:0 —
       tweenar yPercent para 0 não moveria nada. Normalizamos o estado inicial
       nos termos do próprio GSAP antes de animar. */
    chars.forEach((group) => gsap.set(group, { yPercent: 105, y: 0 }));

    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    chars.forEach((group, i) => {
      tl.to(group, { yPercent: 0, duration: 1.1, stagger: 0.022 }, i * 0.09);
    });
    tl.from('.hero__lead', { opacity: 0, y: 22, duration: 0.9 }, 0.35)
      .from('.hero__cta > *', { opacity: 0, y: 18, duration: 0.8, stagger: 0.08 }, 0.48)
      .from('.hero__note li', { opacity: 0, y: 12, duration: 0.7, stagger: 0.06 }, 0.62)
      .from('.passport', { opacity: 0, y: 40, rotateZ: -3, duration: 1.3 }, 0.12);

    /* O carimbo bate: vem de cima, grande e torto, e assenta. É o único
       momento de exagero do site — e é o que resume a proposta. */
    if (stamp) {
      tl.fromTo(stamp,
        { opacity: 0, scale: 2.6, rotate: -34, y: -60 },
        { opacity: 0.92, scale: 1, rotate: -13, y: 0, duration: 0.62, ease: 'back.out(2.2)' },
        0.95
      ).to(stamp, { rotate: -12.2, duration: 0.24, ease: 'power2.out' }, '>-0.05');
    }

    // Parênteses de profundidade: o passaporte anda devagar contra a rolagem.
    gsap.to('#passport', {
      yPercent: -9,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 }
    });
  }
  // Se o preloader já tiver terminado antes deste ponto, garante a entrada.
  if (preDone) startHero();

  /* -------------------------------------------------------------- marquee */
  const MARQUEE = [
    'Turismo B1/B2',
    'DS-160 revisado linha a linha',
    'Simulação de entrevista gravada',
    'Dossiê de vínculo',
    'Preparo de família',
    'Negativa anterior',
    'Renovação',
    'On-line para todo o Brasil'
  ];
  const mTrack = $('#marqueeTrack');
  if (mTrack) {
    const makeItem = (t) => {
      const d = document.createElement('div');
      d.className = 'marquee__item';
      const i = document.createElement('i');
      const s = document.createElement('span');
      s.textContent = t;
      d.append(i, s);
      return d;
    };
    const build = () => {
      const g = document.createElement('div');
      g.style.display = 'flex';
      g.style.flex = 'none';
      MARQUEE.forEach((t) => g.appendChild(makeItem(t)));
      return g;
    };
    // Duas cópias: o wrap do GSAP precisa de 100% de largura duplicada.
    mTrack.append(build(), build());

    if (ANIM) {
      const items = Array.from(mTrack.children);
      const loop = gsap.to(items, {
        xPercent: -100,
        repeat: -1,
        duration: 26,
        ease: 'none',
        modifiers: { xPercent: gsap.utils.wrap(-100, 0) }
      });
      // A faixa acelera com a rolagem: dá sensação de matéria, não de enfeite.
      const setScale = gsap.quickTo(loop, 'timeScale', { duration: 0.5, ease: 'power2.out' });
      ScrollTrigger.create({
        onUpdate: (self) => {
          const v = gsap.utils.clamp(-4, 4, self.getVelocity() / 260);
          setScale(1 + Math.abs(v));
          loop.timeScale(loop.timeScale());
        }
      });
    }
  }

  /* ==========================================================================
     RAIO-X — triagem de 7 perguntas
     Modelo simples e explicável de propósito: pontos por resposta, mais um
     "piso" de faixa para respostas que sozinhas já mudam a natureza do caso
     (negativa anterior, parente irregular nos EUA, ausência total de vínculo).
     Não é previsão. Serve para colocar o visitante no degrau certo da esteira
     e para ela receber o lead já triado.
     ========================================================================== */
  const QUESTIONS = [
    {
      id: 'situacao',
      q: 'Qual é a sua situação hoje?',
      hint: 'Histórico conta: o consulado enxerga tudo o que já aconteceu antes.',
      opts: [
        { t: 'Nunca tive visto americano', p: 1, s: 'Primeira solicitação' },
        { t: 'Já tive visto americano — vencido ou vencendo', p: 0, s: 'Renovação', tag: 'renov' },
        { t: 'Já fui negado uma vez', p: 5, s: 'Uma negativa', force: 'amarelo',
          why: 'Uma negativa anterior fica no histórico. A pergunta “o que mudou desde então?” vai aparecer, e ela precisa ter resposta concreta.' },
        { t: 'Já fui negado duas ou mais vezes', p: 8, s: 'Duas ou mais negativas', force: 'vermelho',
          why: 'Duas ou mais negativas mudam a natureza do caso. Repetir a tentativa sem mudar nada tende a repetir o resultado — e a custar outros US$ 185.' }
      ]
    },
    {
      id: 'viagens',
      q: 'Você saiu do Brasil nos últimos 5 anos?',
      hint: 'Histórico de viagem e de retorno é uma das poucas provas objetivas de que você volta.',
      opts: [
        { t: 'Sim, três vezes ou mais', p: 0, s: '3+ viagens' },
        { t: 'Sim, uma ou duas vezes', p: 1, s: '1–2 viagens' },
        { t: 'Não, nunca saí do país', p: 3, s: 'Nunca viajou',
          why: 'Sem histórico de viagem internacional, falta a prova mais simples de que você entra e volta. Dá para compensar, mas exige que o resto do dossiê esteja impecável.' }
      ]
    },
    {
      id: 'renda',
      q: 'Como você comprova a sua renda hoje?',
      hint: 'Não é sobre ganhar muito. É sobre conseguir demonstrar de onde vem e que é estável.',
      opts: [
        { t: 'CLT ou servidor público, com holerite', p: 0, s: 'CLT/servidor' },
        { t: 'Empresário, com pró-labore e faturamento declarado', p: 1, s: 'Empresário' },
        { t: 'Autônomo, sem comprovação formal', p: 4, s: 'Autônomo informal', force: 'amarelo',
          why: 'Renda informal é o ponto que mais trava caso bom. Existe caminho — mas ele se monta com antecedência, não na véspera.' },
        { t: 'Não tenho renda própria', p: 3, s: 'Sem renda própria',
          why: 'Sem renda própria, o vínculo precisa vir de quem banca a viagem e da sua situação aqui. É montável, mas a história tem que fechar.' }
      ]
    },
    {
      id: 'parente',
      q: 'Tem parente de primeiro grau morando nos Estados Unidos?',
      hint: 'Pai, mãe, filho, cônjuge ou irmão. Não é impedimento — mas muda as perguntas.',
      opts: [
        { t: 'Não', p: 0, s: 'Sem parente nos EUA' },
        { t: 'Sim, em situação migratória regular', p: 2, s: 'Parente regular nos EUA',
          why: 'Parente próximo morando lá é sempre assunto na entrevista. Precisa ser dito com naturalidade e com a documentação certa em mãos.' },
        { t: 'Sim, sem situação regular — ou não sei dizer', p: 5, s: 'Parente irregular ou indefinido nos EUA', force: 'vermelho',
          why: 'Parente em situação irregular é o fator que mais pesa contra em visto de turismo. Não inviabiliza, mas exige preparo específico — e nunca, jamais, omissão no formulário.' }
      ]
    },
    {
      id: 'tempo',
      q: 'Quanto tempo você pretende ficar?',
      hint: 'Viagem longa demais sem motivo claro levanta a pergunta de por que você voltaria.',
      opts: [
        { t: 'Até 15 dias, com data de volta definida', p: 0, s: 'Até 15 dias' },
        { t: 'De 16 a 30 dias', p: 1, s: '16–30 dias' },
        { t: 'Mais de 30 dias, ou ainda sem data de volta', p: 4, s: 'Mais de 30 dias / sem data', force: 'amarelo',
          why: 'Permanência longa sem roteiro e sem data de volta é lida como intenção de ficar. O roteiro precisa explicar o tempo.' }
      ]
    },
    {
      id: 'vinculo',
      q: 'O que te prende ao Brasil hoje?',
      hint: 'Pode marcar mais de uma. É literalmente o que o oficial tenta medir.',
      multi: true,
      base: 4,
      opts: [
        { t: 'Emprego formal ou empresa em andamento', p: -2, s: 'Trabalho' },
        { t: 'Imóvel próprio ou financiamento em curso', p: -1, s: 'Imóvel' },
        { t: 'Cônjuge e/ou filhos que ficam no Brasil', p: -1, s: 'Família aqui' },
        { t: 'Faculdade ou curso em andamento', p: -1, s: 'Estudo' },
        { t: 'Nenhum desses', p: 1, s: 'Nenhum vínculo forte', exclusive: true, force: 'amarelo',
          why: 'Sem emprego, imóvel, família ou estudo prendendo você aqui, o oficial não tem onde se apoiar. Esse é o item que mais vale a pena construir antes de marcar a entrevista.' }
      ]
    },
    {
      id: 'grupo',
      q: 'Quantas pessoas vão solicitar o visto com você?',
      hint: 'Desde setembro de 2025, criança e idoso também são entrevistados.',
      opts: [
        { t: 'Só eu', p: 0, s: 'Sozinho(a)', group: 1 },
        { t: 'De 2 a 4 pessoas', p: 0, s: '2 a 4 pessoas', group: 3,
          why: 'Com a família inteira sendo entrevistada, a história precisa bater entre todo mundo. Resposta desencontrada entre casal derruba caso bom.' },
        { t: '5 ou mais pessoas', p: 0, s: '5 ou mais pessoas', group: 5,
          why: 'Grupo grande multiplica o risco e o custo: são US$ 185 por cabeça, todos entrevistados, todos precisando contar a mesma história.' }
      ]
    }
  ];

  const BANDS = {
    verde:    { rank: 0, label: 'Faixa verde',    h: 'Seu perfil aparenta ser de baixo risco.' },
    amarelo:  { rank: 1, label: 'Faixa amarela',  h: 'Dá para ir — mas não do jeito que está.' },
    vermelho: { rank: 2, label: 'Faixa vermelha', h: 'Marcar a entrevista agora sai caro.' }
  };

  const TIERS = {
    renovacao: { name: 'Renovação Assistida', price: 'R$ 250', per: 'por pessoa' },
    curso:     { name: 'Entrevista Sem Susto', price: 'R$ 147', per: 'curso gravado' },
    completo:  { name: 'Preparo Completo',     price: 'R$ 400', per: 'por pessoa' },
    familia:   { name: 'Preparo Família',      price: 'R$ 1.200', per: 'até 4 pessoas' },
    sensivel:  { name: 'Caso Sensível',        price: 'R$ 1.200', per: 'por pessoa' }
  };

  const quizBody = $('#quizBody');
  const quizRail = $('#quizRail');
  const quizBack = $('#quizBack');
  const quizCount = $('#quizCount');

  if (quizBody) {
    const answers = new Array(QUESTIONS.length).fill(null);
    let idx = 0;
    const steps = [];

    const fallback = $('#quizFallback');
    if (fallback) fallback.remove();

    /* ---- construção dos passos ---- */
    QUESTIONS.forEach((Q, qi) => {
      const step = document.createElement('div');
      step.className = 'step';
      step.setAttribute('aria-hidden', 'true');

      const n = document.createElement('span');
      n.className = 'step__n';
      n.textContent = 'Pergunta ' + (qi + 1) + ' de ' + QUESTIONS.length;

      const h = document.createElement('h3');
      h.className = 'step__q';
      h.tabIndex = -1;
      h.textContent = Q.q;

      const hint = document.createElement('p');
      hint.className = 'step__hint';
      hint.textContent = Q.hint;

      const opts = document.createElement('div');
      opts.className = 'opts';

      Q.opts.forEach((O, oi) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'opt';
        b.innerHTML = '<span class="opt__k"><span>' + String.fromCharCode(65 + oi) + '</span></span>';
        const label = document.createElement('span');
        label.textContent = O.t;
        b.appendChild(label);

        b.addEventListener('click', () => {
          if (Q.multi) {
            const sel = answers[qi] || [];
            if (O.exclusive) {
              answers[qi] = sel.indexOf(oi) > -1 ? [] : [oi];
            } else {
              const ex = Q.opts.findIndex((x) => x.exclusive);
              const next = sel.filter((i) => i !== ex);
              const at = next.indexOf(oi);
              if (at > -1) next.splice(at, 1); else next.push(oi);
              answers[qi] = next;
            }
            paintMulti(qi);
          } else {
            answers[qi] = oi;
            Array.from(opts.children).forEach((c, ci) => c.classList.toggle('is-on', ci === oi));
            setTimeout(() => go(qi + 1), 180);
          }
        });
        opts.appendChild(b);
      });

      step.append(n, h, hint, opts);

      if (Q.multi) {
        const next = document.createElement('button');
        next.type = 'button';
        next.className = 'btn btn--block';
        next.style.marginTop = '0.35rem';
        next.textContent = 'Continuar';
        next.addEventListener('click', () => {
          if (!answers[qi] || !answers[qi].length) {
            // Nada marcado ainda: "Nenhum desses" é uma resposta válida também.
            answers[qi] = [Q.opts.findIndex((x) => x.exclusive)];
            paintMulti(qi);
          }
          go(qi + 1);
        });
        step.appendChild(next);
      }

      quizBody.appendChild(step);
      steps.push(step);
    });

    function paintMulti(qi) {
      const sel = answers[qi] || [];
      const btns = steps[qi].querySelectorAll('.opt');
      btns.forEach((b, i) => b.classList.toggle('is-on', sel.indexOf(i) > -1));
    }

    /* ---- resultado ---- */
    const result = document.createElement('div');
    result.className = 'step result';
    result.setAttribute('aria-hidden', 'true');
    result.setAttribute('aria-live', 'polite');
    quizBody.appendChild(result);
    steps.push(result);

    function score() {
      let pts = 0;
      let floor = 'verde';
      const whys = [];
      const summary = [];
      let group = 1;
      let renov = false;

      QUESTIONS.forEach((Q, qi) => {
        const a = answers[qi];
        if (a === null) return;
        const chosen = Q.multi ? a.map((i) => Q.opts[i]) : [Q.opts[a]];

        if (Q.multi) pts += Q.base;
        chosen.forEach((O) => {
          if (!O) return;
          pts += O.p;
          if (O.force && BANDS[O.force].rank > BANDS[floor].rank) floor = O.force;
          if (O.why) whys.push(O.why);
          if (O.group) group = O.group;
          if (O.tag === 'renov') renov = true;
        });
        const labels = chosen.filter(Boolean).map((O) => O.s).join(', ');
        summary.push((qi + 1) + '. ' + Q.q + ' → ' + (labels || '—'));
      });

      pts = Math.max(0, pts);
      let band = pts <= 4 ? 'verde' : (pts <= 11 ? 'amarelo' : 'vermelho');
      if (BANDS[floor].rank > BANDS[band].rank) band = floor;

      // Degrau recomendado: a faixa escolhe a linha, o tamanho do grupo escolhe
      // se é individual ou família.
      let tier;
      if (band === 'vermelho') tier = TIERS.sensivel;
      else if (group > 1)      tier = TIERS.familia;
      else if (renov && band === 'verde') tier = TIERS.renovacao;
      else                     tier = TIERS.completo;

      return { pts, band, whys, summary, group, renov, tier };
    }

    function renderResult() {
      const r = score();
      const B = BANDS[r.band];
      result.setAttribute('data-band', r.band);

      const allWhys = r.whys.length ? r.whys : [
        'Nenhum dos pontos que costumam derrubar um pedido apareceu nas suas respostas.',
        'Isso não é aprovação: coerência entre formulário, dossiê e o que você fala na hora ainda decide o caso.'
      ];
      // Teto de 4: lista longa demais vira parede de texto e ninguém lê.
      // O que sobra é justamente o que puxa a conversa.
      const MAXW = 4;
      const whys = allWhys.slice(0, MAXW);
      const rest = allWhys.length - whys.length;
      if (rest > 0) {
        whys.push('<b>E mais ' + rest + (rest === 1 ? ' ponto' : ' pontos') +
          '</b> que aparecem no seu caso — a gente vê um a um na conversa.');
      }

      const extra = r.group > 1
        ? '<p class="small" style="margin-top:0.55rem">Vocês são ' + (r.group >= 5 ? '5 ou mais' : '2 a 4') + '. Lembre que desde setembro de 2025 <b>todo mundo é entrevistado</b>, criança e idoso incluídos — e são US$ 185 por cabeça.</p>'
        : (r.band === 'verde'
            ? '<p class="small" style="margin-top:0.55rem">Perfil tranquilo e orçamento curto? O curso <b>Entrevista Sem Susto (R$ 147)</b> já resolve a maior parte. O crédito vale integralmente se depois quiser subir para o preparo.</p>'
            : '');

      result.innerHTML =
        '<span class="result__flag"><i></i>' + B.label + ' · ' + r.pts + (r.pts === 1 ? ' ponto' : ' pontos') + '</span>' +
        '<h3 class="result__h">' + B.h + '</h3>' +
        '<ul class="result__why">' + whys.map((w) => '<li>' + w + '</li>').join('') + '</ul>' +
        '<div class="result__rec">' +
          '<b>Degrau recomendado:</b> ' + r.tier.name +
          ' <span class="price">' + r.tier.price + '</span> ' +
          '<span class="small">(' + r.tier.per + ')</span>' + extra +
        '</div>' +
        '<div class="result__cta">' +
          '<a class="btn" id="resultWa" href="#">Levar esse resultado para a Bianca</a>' +
          '<button class="btn btn--ghost" type="button" id="resultAgain">Refazer</button>' +
        '</div>' +
        '<p class="result__disc">Isto é uma triagem, não uma previsão. A concessão do visto é decisão exclusiva do oficial consular, e ninguém — consultor, advogado ou despachante — pode garanti-la ou antecipá-la. A pontuação serve só para indicar onde o seu caso é frágil.</p>';

      const msg =
        'Oi, Bianca! Fiz o Raio-X no seu site.\n\n' +
        'RESULTADO: ' + B.label.toUpperCase() + ' (' + r.pts + (r.pts === 1 ? ' ponto' : ' pontos') + ')\n' +
        'Degrau sugerido: ' + r.tier.name + ' — ' + r.tier.price + ' (' + r.tier.per + ')\n\n' +
        'MINHAS RESPOSTAS:\n' + r.summary.join('\n') +
        '\n\nQuero conversar sobre o meu caso.';

      const waBtn = $('#resultWa', result);
      waBtn.setAttribute('href', waLink(msg));
      waBtn.setAttribute('target', '_blank');
      waBtn.setAttribute('rel', 'noopener');

      $('#resultAgain', result).addEventListener('click', () => {
        answers.fill(null);
        steps.forEach((s) => s.querySelectorAll && s.querySelectorAll('.opt').forEach((o) => o.classList.remove('is-on')));
        go(0);
      });

      hotspots(result);
    }

    /* ---- navegação ---- */
    function go(next) {
      const last = steps.length - 1;
      idx = Math.max(0, Math.min(last, next));
      if (idx === last) renderResult();

      steps.forEach((s, i) => {
        const on = i === idx;
        s.classList.toggle('is-active', on);
        s.setAttribute('aria-hidden', String(!on));
      });

      const progress = (idx / (steps.length - 1)) * 100;
      if (quizRail) quizRail.style.width = progress + '%';
      if (quizBack) quizBack.hidden = idx === 0;
      if (quizCount) {
        quizCount.textContent = idx === last
          ? 'Resultado'
          : ('Pergunta ' + (idx + 1) + ' de ' + QUESTIONS.length);
      }

      // Foco no título do passo para quem navega por teclado ou leitor de tela.
      const h = steps[idx].querySelector('.step__q, .result__h');
      if (h && document.activeElement !== document.body) {
        h.tabIndex = -1;
        try { h.focus({ preventScroll: true }); } catch (e) { /* noop */ }
      }
    }

    if (quizBack) quizBack.addEventListener('click', () => go(idx - 1));
    go(0);
  }

  /* ------------------------------------------------------------- acordeão */
  $$('#acc .acc__item').forEach((item) => {
    const q = $('.acc__q', item);
    const a = $('.acc__a', item);
    q.setAttribute('aria-expanded', 'false');

    q.addEventListener('click', () => {
      const open = item.classList.contains('is-open');

      // Um por vez: a coluna fica curta e ninguém se perde na rolagem.
      $$('#acc .acc__item.is-open').forEach((other) => {
        if (other === item) return;
        other.classList.remove('is-open');
        $('.acc__q', other).setAttribute('aria-expanded', 'false');
        const oa = $('.acc__a', other);
        if (ANIM) gsap.to(oa, { height: 0, duration: 0.45, ease: 'power3.inOut' });
        else oa.style.height = '0px';
      });

      item.classList.toggle('is-open', !open);
      q.setAttribute('aria-expanded', String(!open));

      const target = open ? 0 : a.firstElementChild.offsetHeight;
      if (ANIM) {
        gsap.to(a, {
          height: target, duration: 0.5, ease: 'power3.inOut',
          onComplete: () => { if (!open) a.style.height = 'auto'; ScrollTrigger.refresh(); }
        });
      } else {
        a.style.height = open ? '0px' : 'auto';
      }
    });
  });

  /* -------------------------------------------------------------- reveals */
  if (ANIM) {
    ScrollTrigger.batch('[data-reveal]', {
      start: 'top 88%',
      once: true,
      onEnter: (batch) => gsap.to(batch, {
        opacity: 1, y: 0, duration: 0.85, stagger: 0.06, ease: 'power3.out', overwrite: true
      })
    });
    gsap.set('[data-reveal]', { y: 26 });

    // Guilhoché gira devagar enquanto o hero está em tela: o papel "respira".
    const guilloche = $('[data-guilloche]');
    if (guilloche) {
      gsap.to(guilloche, {
        rotation: 12,
        transformOrigin: '222px 258px',
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.2 }
      });
    }

    // Faixa de fatos: os números sobem contra a rolagem, bem de leve.
    $$('.fact').forEach((f, i) => {
      gsap.from(f, {
        y: 34, ease: 'none',
        scrollTrigger: { trigger: '.facts', start: 'top bottom', end: 'top 40%', scrub: 0.8 },
        delay: i * 0.02
      });
    });
  } else {
    $$('[data-reveal]').forEach((el) => { el.style.opacity = '1'; });
  }

  /* -------------------------------------------------- cursor + magnetismo */
  function hotspots(scope) {
    const cur = $('#cursor');
    if (!cur || !ANIM || window.matchMedia('(pointer: coarse)').matches) return;
    $$('a, button, .opt', scope).forEach((el) => {
      if (el.dataset.hot) return;
      el.dataset.hot = '1';
      el.addEventListener('mouseenter', () => cur.classList.add('is-hot'));
      el.addEventListener('mouseleave', () => cur.classList.remove('is-hot'));
    });
  }

  if (ANIM && !window.matchMedia('(pointer: coarse)').matches) {
    const cur = $('#cursor');
    const xTo = gsap.quickTo(cur, 'x', { duration: 0.32, ease: 'power3' });
    const yTo = gsap.quickTo(cur, 'y', { duration: 0.32, ease: 'power3' });
    window.addEventListener('mousemove', (e) => {
      cur.classList.add('is-on');
      xTo(e.clientX);
      yTo(e.clientY);
    }, { passive: true });
    document.addEventListener('mouseleave', () => cur.classList.remove('is-on'));
    hotspots(document);

    // Botões marcados puxam o ponteiro de leve. Só transform, nada de layout.
    $$('[data-magnetic]').forEach((el) => {
      const mx = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' });
      const my = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' });
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        mx((e.clientX - (r.left + r.width / 2)) * 0.26);
        my((e.clientY - (r.top + r.height / 2)) * 0.36);
      });
      el.addEventListener('mouseleave', () => { mx(0); my(0); });
    });
  }

  /* ---------------------------------------------------------- housekeeping */
  if (HAS_GSAP) {
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
    window.addEventListener('load', () => ScrollTrigger.refresh());
    let rt;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => ScrollTrigger.refresh(), 220);
    });
  }
})();

import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium', args:['--no-sandbox'] });
const jobs = [['anuncio-1-custo.html',1080,1350],['anuncio-2-familia.html',1080,1920],['anuncio-3-metodo.html',1080,1350]];
let bad = 0;
for (const [f, w, h] of jobs) {
  const p = await b.newPage({ viewport:{width:w,height:h}, deviceScaleFactor:1 });
  const errs = []; p.on('pageerror', e=>errs.push(e.message));
  await p.goto('http://127.0.0.1:8099/anuncios/'+f, { waitUntil:'load' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(700);
  // Todo elemento de texto/CTA precisa caber inteiro dentro do quadro.
  const clipped = await p.evaluate((H) => {
    const out = [];
    document.querySelectorAll('.ad *').forEach(el => {
      if (el.classList.contains('glow') || el.classList.contains('grain')) return;
      if (!el.textContent.trim() && !el.classList.contains('cta')) return;
      const r = el.getBoundingClientRect();
      if (r.height === 0) return;
      if (r.bottom > H + 0.5 || r.top < -0.5 || r.right > window.innerWidth + 0.5 || r.left < -0.5) {
        out.push({ el: el.className || el.tagName, top:+r.top.toFixed(0), bottom:+r.bottom.toFixed(0), left:+r.left.toFixed(0), right:+r.right.toFixed(0) });
      }
    });
    return out;
  }, h);
  await p.screenshot({ path: f.replace('.html','.png') });
  const ok = clipped.length === 0 && errs.length === 0;
  if (!ok) bad++;
  console.log((ok?'OK  ':'FALHA ') + f.replace('.html','.png') + ' ' + w+'x'+h +
    (clipped.length ? ' RECORTADO: ' + JSON.stringify(clipped) : '') + (errs.length?' ERR '+errs:''));
  await p.close();
}
await b.close();
process.exit(bad ? 1 : 0);

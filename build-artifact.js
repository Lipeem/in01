/* ==========================================================================
   Gera a versão HOSPEDÁVEL do site (claude.ai Artifact ou qualquer host que
   embrulhe o conteúdo no próprio <html>/<head>/<body>).

   Diferenças para build-single.js:
   · sai sem <!doctype>, <html>, <head> e <body> — o host fornece;
   · <title> e <style> vão no topo do arquivo (o host lê o título nos
     primeiros 8 KB);
   · os frames do hero entram embutidos como data: URI — os 192 inteiros em
     window.EXPOSUL_FRAMES e os 96 do recorte (celular) em EXPOSUL_FRAMES_M,
     ~4 MB em base64. Nada depende de pasta ao lado: o hero gira em
     qualquer lugar onde o arquivo abrir.

   Uso:  node build-artifact.js [saida.html]
   ========================================================================== */
const fs = require('fs');
const path = require('path');

const root = __dirname;
const out = process.argv[2] || path.join(root, 'exposul-artifact.html');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const safe = (js) => js.replace(/<\/script>/gi, '<\\/script>');
const dataUri = (rel, mime) => 'data:' + mime + ';base64,' + fs.readFileSync(path.join(root, rel)).toString('base64');

let html = read('index.html');

/* 1. Cabeça: só o que o host não fornece. */
const headStart = html.indexOf('<head>');
const headEnd = html.indexOf('</head>') + '</head>'.length;
if (headStart === -1 || headEnd < headStart) { console.error('ERRO: <head> não encontrado.'); process.exit(1); }
const css = '/* ---- css/fonts.css ---- */\n' + read('css/fonts.css') + '\n\n/* ---- css/site.css ---- */\n' + read('css/site.css');
const head =
  '<title>Exposul Expositores</title>\n' +
  '<style>\n' + css + '\n</style>\n' +
  '<script>document.documentElement.classList.remove(\'no-js\');</script>';
html = html.slice(0, headStart) + head + html.slice(headEnd);

/* 2. Sem doctype/html/body: o host embrulha. */
html = html
  .replace(/^\s*<!doctype html>\s*/i, '')
  .replace(/<html[^>]*>\s*/i, '')
  .replace(/<body>\s*/i, '')
  .replace(/\s*<\/body>\s*<\/html>\s*$/i, '\n');

/* 3. Scripts embutidos, frames antes do site.js. Os dois conjuntos entram:
      o inteiro (f_049…f_240, telas >= 900px) e o leve (recorte central,
      celular em pé). Objeto índice → data: URI, no mesmo índice 0-based que
      js/site.js usa. Os 47 frames do close inicial não entram: ninguém os
      vê (ver HERO_FIRST). */
const embedSet = (dir, name, expect) => {
  const files = fs.readdirSync(path.join(root, dir)).filter((f) => /^f_\d{3}\.webp$/.test(f)).sort();
  const use = files.filter((f) => parseInt(f.slice(2, 5), 10) - 1 >= 48);
  if (use.length !== expect) { console.error('ERRO: ' + dir + ': esperava ' + expect + ' frames a partir do f_049, achei ' + use.length); process.exit(1); }
  const entries = use.map((f) => JSON.stringify(String(parseInt(f.slice(2, 5), 10) - 1)) + ':' + JSON.stringify(dataUri(dir + '/' + f, 'image/webp')));
  return 'window.' + name + '={\n' + entries.join(',\n') + '\n};';
};
const framesJs = '<script>/* ---- frames do hero (assets/hero-frames/ e assets/hero-frames-m/) ---- */\n' +
  embedSet('assets/hero-frames', 'EXPOSUL_FRAMES', 192) + '\n' +
  embedSet('assets/hero-frames-m', 'EXPOSUL_FRAMES_M', 96) + '</script>';

const js = [
  ['vendor/gsap.min.js', read('vendor/gsap.min.js')],
  ['vendor/ScrollTrigger.min.js', read('vendor/ScrollTrigger.min.js')],
  ['vendor/SplitText.min.js', read('vendor/SplitText.min.js')],
  ['vendor/lenis.min.js', read('vendor/lenis.min.js')],
  ['js/products.js', read('js/products.js')],
  ['js/site.js', read('js/site.js')]
].map(([name, src]) => '<script>/* ---- ' + name + ' ---- */\n' + safe(src) + '\n</script>').join('\n');

const jsTags = [
  '<script src="vendor/gsap.min.js"><' + '/script>',
  '<script src="vendor/ScrollTrigger.min.js"><' + '/script>',
  '<script src="vendor/SplitText.min.js"><' + '/script>',
  '<script src="vendor/lenis.min.js"><' + '/script>',
  '<script src="js/products.js"><' + '/script>',
  '<script src="js/site.js"><' + '/script>'
].join('\n');
if (html.indexOf(jsTags) === -1) { console.error('ERRO: não achei as tags de script esperadas.'); process.exit(1); }
// Função como substituto: o JS usa `$` e uma string interpretaria `$&`.
html = html.replace(jsTags, () => framesJs + '\n' + js);

/* 4. Logo e poster. */
html = html.split('src="assets/exposul-logo.png"').join('src="' + dataUri('assets/exposul-logo.png', 'image/png') + '"');
html = html.split('src="assets/hero-poster.webp"').join('src="' + dataUri('assets/hero-poster.webp', 'image/webp') + '"');

/* 5. Nada pode apontar para fora. */
if (/href="css\/|src="js\/|src="vendor\/|src="assets\//.test(html)) {
  console.error('ERRO: sobrou referência externa.');
  process.exit(1);
}
if (/<html|<\/html>|<body>|<\/body>|<!doctype/i.test(html.slice(0, 200) + html.slice(-200))) {
  console.error('ERRO: sobrou tag de documento — o host embrulha o arquivo.');
  process.exit(1);
}

fs.writeFileSync(out, html);
console.log(path.basename(out) + ' gerado —', (Buffer.byteLength(html) / 1048576).toFixed(2), 'MB, frames embutidos: 192 inteiros + 96 do recorte.');

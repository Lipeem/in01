/* ==========================================================================
   Gera `exposul-site.html`: a página inteira num arquivo só.

   Por que existe: o site em pastas é melhor para manter e publicar, mas não
   sobrevive a um "baixa esse arquivo e abre". Esta versão embute CSS, JS,
   GSAP, Lenis e as fontes — abre por duplo clique, sem servidor e sem
   internet.

   Uso:  node build-single.js
   Rode de novo depois de editar qualquer arquivo em css/ ou js/.
   ========================================================================== */
const fs = require('fs');
const path = require('path');

const root = __dirname;
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

// `</script>` dentro de uma string JS fecharia a tag do documento.
const safe = (js) => js.replace(/<\/script>/gi, '<\\/script>');

let html = read('index.html');

const css = [
  '/* ---- css/fonts.css ---- */\n' + read('css/fonts.css'),
  '/* ---- css/site.css ---- */\n' + read('css/site.css')
].join('\n\n');

const cssTags = '<link rel="stylesheet" href="css/fonts.css">\n<link rel="stylesheet" href="css/site.css">';
if (html.indexOf(cssTags) === -1) { console.error('ERRO: não achei as tags de CSS esperadas.'); process.exit(1); }
// Função como substituto, não string: numa string, `$&` e `$'` seriam
// interpretados como referências ao match — e tanto o CSS quanto o JS do
// site usam `$` à vontade (o helper de seletor, por exemplo).
html = html.replace(cssTags, () => '<style>\n' + css + '\n</style>');

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
html = html.replace(jsTags, () => js);

// Logo e poster entram como data: URI — o arquivo único abre sozinho, com o
// hero em poster. Os 240 frames ficam em assets/hero-frames/: se a pasta
// estiver do lado, a sequência liga; se não estiver, o site degrada para o
// poster por conta própria (o carregamento falha e o código já trata isso).
const inline = (rel, mime) => 'data:' + mime + ';base64,' + fs.readFileSync(path.join(root, rel)).toString('base64');
html = html.split('src="assets/exposul-logo.png"').join('src="' + inline('assets/exposul-logo.png', 'image/png') + '"');
html = html.split('src="assets/hero-poster.webp"').join('src="' + inline('assets/hero-poster.webp', 'image/webp') + '"');

// Aviso no topo do arquivo, para quem abrir no editor
html = html.replace(
  '<!doctype html>',
  '<!doctype html>\n<!--\n  Exposul — versão de arquivo único, gerada por build-single.js.\n  NÃO EDITE ESTE ARQUIVO: as alterações se perdem na próxima geração.\n  Edite css/site.css e js/site.js e rode `node build-single.js`.\n\n  A sequência do hero (240 frames) precisa da pasta assets/hero-frames/ ao\n  lado deste arquivo. Sem ela, o hero fica no poster estático — de propósito.\n-->'
);

if (/href="css\/|src="js\/|src="vendor\/|src="assets\//.test(html)) {
  console.error('ERRO: sobrou referência externa — a versão única não ficaria autossuficiente.');
  process.exit(1);
}

fs.writeFileSync(path.join(root, 'exposul-site.html'), html);
console.log('exposul-site.html gerado —', Math.round(Buffer.byteLength(html) / 1024), 'KB. Só assets/hero-frames/ fica de fora, de propósito.');

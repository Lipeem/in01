# Exposul — site vitrine (MVP)

Site one-page para a Exposul Expositores (Curitiba/PR): manequins, cabides,
araras, expositores e aramados. Catálogo com escada de preço de atacado,
ficha de produto e pedido fechado no WhatsApp.

Substitui o protótipo anterior, preservado em `_legado/`.

---

## Como abrir

Há duas formas do mesmo site:

**`exposul-site.html`** — arquivo único, tudo embutido (CSS, JS, GSAP, Lenis e
as fontes). Baixe só ele, dê duplo clique e roda: sem servidor, sem instalar
nada, sem internet. É a versão para testar e para mandar por e-mail.

**`index.html` + pastas** — a mesma coisa em arquivos separados. É a versão
para editar e para publicar. Também abre por duplo clique, mas precisa das
pastas `css/`, `js/` e `vendor/` do lado.

Depois de editar `css/site.css` ou `js/site.js`, regenere o arquivo único:

```bash
node build-single.js
```

Para servir por HTTP (recomendado para testar como ficará publicado):

```bash
npx serve .        # ou: python3 -m http.server 8000
```

## Como publicar

É um site estático. Sobe em qualquer lugar sem configuração: Vercel, Netlify,
GitHub Pages, Cloudflare Pages, ou uma pasta no servidor atual. Basta enviar o
conteúdo do repositório.

---

## Estrutura

```
exposul-site.html   Arquivo único gerado, com tudo embutido (não editar)
build-single.js     Gera o arquivo único a partir dos arquivos separados
index.html          Página inteira + sprite SVG dos produtos (inline)
css/fonts.css       Bodoni Moda e Archivo embutidas em base64
css/site.css        Todo o estilo, comentado por seção
js/products.js      Catálogo: produtos, preços e escada de atacado
js/site.js          Movimento, filtros, ficha, carrinho e WhatsApp
vendor/             GSAP 3.15.0, ScrollTrigger e Lenis 1.3.26
_legado/            Protótipo anterior, preservado
```

Sem passo de build. Editar arquivo e recarregar a página.

---

## ⚠️ Dados que PRECISAM ser confirmados antes de publicar

O site foi montado com dados de demonstração plausíveis. Publicar número
errado gera problema comercial e de direito do consumidor. **Confirme tudo
desta lista com a Exposul antes de colocar no ar.**

| Onde | O quê |
|---|---|
| `js/products.js` | **Todos os preços**, referências (`ref`), medidas, materiais e composição dos pacotes |
| `js/products.js` | **Escada de atacado**: os degraus (2 / 4 / 10 un. para item caro; 5 / 20 / 50 pacotes para consumível) e os percentuais de desconto |
| `index.html` — seção Números | `700+ itens`, `48h de expedição`, `5.000 lojas`, `12× sem juros` |
| `index.html` — Showroom | Horário de atendimento |
| `index.html` — Manifesto | "começa na segunda peça — no quinto pacote, em cabides e ganchos" |
| `index.html` — Condições | Prazo de expedição, prazo de produção sob medida, parcelamento, desconto à vista e prazo de garantia (marcados como `[confirmar]` na própria página) |
| `index.html` — Rodapé | CNPJ e razão social |
| `js/products.js` | Afirmações técnicas: capacidade de carga das araras (60/80/120 kg), "40% mais peça na mesma arara", "4,8 m lineares" da torre, regulagem do busto |
| `js/products.js` | O balcão vitrine é anunciado como sob medida **e** tem preço fixo com escada de atacado — decidir se é de linha ou sob medida |
| Etiquetas dos cards | "Mais vendido", "Novidade", "Linha premium", "Sob medida" — confirmar se refletem a realidade comercial |

Trechos com dado de demonstração estão marcados com `<!-- PLACEHOLDER: ... -->`
no HTML e com um bloco de aviso no topo de `js/products.js`.

**Sobre a escada de atacado:** as faixas foram desenhadas por natureza do
item — manequim, arara e balcão abrem o desconto na **segunda** peça (a
compra real de abertura de loja são duas ou três, não cinco); cabide e
gancho abrem no **quinto** pacote, que é onde o lojista compara centavo. A
faixa vale pelo **volume do pedido inteiro**, não item por item. Os
percentuais (10/18/28% e 12/22/32%) são plausíveis para fábrica direta, mas
**precisam ser confirmados**: publicar um spread menor que o real entrega o
lojista ao concorrente; maior que o real, vende o que não se honra.

**Já são reais e conferidos:** razão social, endereço (Rua 24 de Maio, 1423 —
Rebouças, Curitiba/PR), telefones ((41) 3029-4456 e (41) 99691-0019), e as
cinco categorias de produto.

O rodapé exibe "Protótipo de demonstração — preços e prazos ilustrativos".
**Remova esse aviso somente depois de substituir os dados acima.**

---

## Imagens dos produtos

O site não usa foto: os 16 produtos são **SVG desenhados**, com uma única
fonte de luz atravessando cada peça. Isso mantém a página leve, deixa
tudo nítido em qualquer tela e permite animar as peças.

Quando houver fotografia profissional, a troca é de uma linha por produto.
Em `js/products.js`, acrescente `photo` ao item:

```js
{
  id: 'mq-smart-f',
  photo: 'assets/produtos/manequim-smart-feminino.webp',   // <-- só isso
  ...
}
```

O código já trata os dois casos (`artMarkup()` em `js/site.js`): havendo
`photo`, entra um `<img>` com `loading="lazy"`; não havendo, entra o vetor.
Use WebP ou AVIF, fundo escuro ou recortado, proporção 4:5.

---

## Decisões técnicas e o porquê

**Sem framework e sem build.** O entregável precisa abrir por duplo clique e
subir em qualquer hospedagem. Cada dependência a mais seria um risco sem
contrapartida nesta escala.

**Bibliotecas vendorizadas em vez de CDN.** GSAP e Lenis vivem em `vendor/`.
O site não quebra se um CDN cair, não depende de rede externa e as versões
ficam travadas — GSAP e Three mudam de API entre versões.

**Fontes em base64.** Fonte servida como arquivo local é bloqueada por CORS
quando a página abre em `file://` (origem `null`). Como `data:` URI, funciona
por duplo clique, por servidor e offline, com zero requisição de fonte.

**`overflow-x: clip` no `<html>`, não no `<body>`.** A regra de propagação de
viewport do CSS transfere o overflow do body para o viewport e devolve
`visible` ao próprio body — nada recorta. Medido: o viewport de layout
esticava para 685px num aparelho de 390px.

**Grão sem `mix-blend-mode`.** O blend obriga o compositor a re-mesclar a
viewport inteira a cada frame. Medido em A/B: derrubava o p95 de 59 para
30 fps. A textura chapada em opacidade baixa entrega quase o mesmo efeito
de graça.

**Uma luz só por figura.** Os gradientes das peças usam
`gradientUnits="userSpaceOnUse"`. Com o padrão (`objectBoundingBox`) cada
`<path>` recebia a própria rampa de luz e o manequim ficava remendado.

---

## Acessibilidade e degradação

- **Sem JavaScript**: a página continua completa e legível. O estado revelado
  é o padrão no CSS; nada é escondido a menos que o GSAP tenha carregado.
- **`prefers-reduced-motion`**: desliga todo o movimento, inclusive o scroll
  suave. Conteúdo permanece inteiro.
- **Teclado**: foco visível em tudo, `Esc` fecha ficha e carrinho, foco preso
  dentro do painel aberto e devolvido ao elemento de origem ao fechar.
- **Preloader**: sai por timeout mesmo se algum asset falhar. Nunca trava.
- **Texto no DOM**, nunca só dentro de canvas — indexa normalmente.

## Desempenho medido

Chromium via Playwright, com scroll programático de ponta a ponta:

| | Desktop 1440×900 | Mobile 390×844 |
|---|---|---|
| FPS mediano | 60 | 60 |
| FPS p95 | 59,5 | 59,9 |
| Frames acima de 33 ms | 3 | 0 |
| Overflow horizontal | nenhum | nenhum |
| Erros de console | nenhum | nenhum |

Peso total: ~394 KB (inclui 117 KB de fontes embutidas e 136 KB de GSAP +
Lenis), sem nenhuma requisição a terceiros.

O hero foi verificado sem colisão entre o manequim, o título e o texto de
apoio em nove proporções, de 1024×700 a 2560×1440.

---

## O que este MVP ainda não faz

- Busca por nome e por referência existe; **ordenação e paginação não**. Com
  700+ itens reais, ambas passam a ser necessárias, junto com subcategorias
  (Manequins → Feminino / Masculino / Infantil / Plus / Busto).
- A ficha tem rota própria (`#produto/<id>`) para compartilhar o link, mas
  não são páginas de verdade — para SEO de cauda longa ("manequim plus size
  atacado"), cada produto precisa de uma URL indexável.
- Sem gateway de pagamento: o pedido é montado no site e fechado no WhatsApp.
- Sem cálculo de frete.
- Sem cadastro de lojista nem preço por cliente.
- Sem CMS: o catálogo é editado em `js/products.js`.

# Exposul — site vitrine (MVP)

Site one-page para a Exposul Expositores (Curitiba/PR): manequins, cabides,
araras, expositores e aramados. Catálogo com escada de preço de atacado,
ficha de produto e pedido fechado no WhatsApp.

Substitui o protótipo anterior, preservado em `_legado/`.

---

## Como abrir

**Duplo clique em `index.html`.** É só isso — não precisa de build, servidor,
Node nem internet. Todas as dependências estão dentro do repositório.

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
| `js/products.js` | **Escada de atacado**: os degraus (5 / 10 / 30 un.) e os percentuais de desconto |
| `index.html` — seção Números | `700+ itens`, `48h de expedição`, `5.000 lojas`, `12× sem juros` |
| `index.html` — Showroom | Horário de atendimento |
| `index.html` — Manifesto | "A escada de atacado começa em cinco peças" |

Trechos com dado de demonstração estão marcados com `<!-- PLACEHOLDER: ... -->`
no HTML e com um bloco de aviso no topo de `js/products.js`.

**Já são reais e conferidos:** razão social, endereço (Rua 24 de Maio, 1423 —
Rebouças, Curitiba/PR), telefones ((41) 3029-4456 e (41) 99691-0019), e as
cinco categorias de produto.

O rodapé exibe "Protótipo de demonstração — preços e prazos ilustrativos".
**Remova esse aviso somente depois de substituir os dados acima.**

---

## Imagens dos produtos

O site não usa foto: os 16 produtos são **SVG desenhados**, com uma única
fonte de luz atravessando cada peça. Isso mantém a página em ~260 KB, deixa
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
| Frames acima de 33 ms | 4 | 0 |
| Overflow horizontal | nenhum | nenhum |
| Erros de console | nenhum | nenhum |

Peso total da página: ~260 KB, sem nenhuma requisição a terceiros.

---

## O que este MVP ainda não faz

- Sem busca, ordenação ou paginação — com 700+ itens reais, isso passa a ser
  necessário.
- Sem gateway de pagamento: o pedido é montado no site e fechado no WhatsApp.
- Sem cálculo de frete.
- Sem cadastro de lojista nem preço por cliente.
- Sem CMS: o catálogo é editado em `js/products.js`.

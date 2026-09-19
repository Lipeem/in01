# Bianca Breda — Preparo para o visto americano

Site one-page + três criativos para redes sociais. Todo o material comercial
está em [`ESTEIRA-DE-PRODUTO.md`](ESTEIRA-DE-PRODUTO.md) — leia esse primeiro,
ele explica o porquê de cada preço e de cada seção do site.

## Como abrir

**Duplo clique em `index.html`.** Não precisa de build, servidor, Node nem
internet. Tudo que a página usa está dentro do repositório.

Para testar como ficará publicado:

```bash
npx serve .        # ou: python3 -m http.server 8000
```

## Como publicar

É um site estático. Sobe sem configuração em Vercel, Netlify, GitHub Pages,
Cloudflare Pages ou numa pasta de servidor. Envie o conteúdo desta pasta.

## Estrutura

```
index.html              Página inteira, incluindo o passaporte em SVG
css/fonts.css           Bodoni Moda e Archivo embutidas em base64
css/site.css            Todo o estilo, comentado por seção
js/site.js              Movimento, Raio-X, acordeão e links de WhatsApp
vendor/                 GSAP 3.15.0, ScrollTrigger e Lenis 1.3.26
anuncios/               Os três criativos (.html fonte + .png pronto) e COPY.md
ESTEIRA-DE-PRODUTO.md   Estratégia comercial, matemática e limites jurídicos
```

## O que trocar antes de publicar

| Onde | O quê |
|---|---|
| `js/site.js`, constante `WA_NUMBER` | **O número do WhatsApp.** Está em um lugar só (`5541991948545`) e alimenta o site inteiro. |
| `index.html` — rodapé | E-mail e LinkedIn |
| `index.html` — rodapé | CNPJ e razão social, assim que abrir a empresa |
| `index.html` — seção Esteira | Os preços, se ela mudar a tabela |
| `anuncios/*.html` | Mesma coisa: número e preços |

Tudo que é **fato verificável** no site (US$ 185, 15–45 dias, regra de
02/09/2025) está com fonte no rodapé. Se for atualizar um número, atualize a
fonte junto — e confira a data.

## Os anúncios

`anuncios/anuncio-1-custo.png` (1080×1350) · `anuncio-2-familia.png`
(1080×1920) · `anuncio-3-metodo.png` (1080×1350).

Os `.html` são a fonte. Para regerar os PNGs depois de editar o texto:

```bash
npm install playwright        # só na primeira vez
python3 -m http.server 8099 & # servidor local
node anuncios/_render.mjs
```

O `_render.mjs` **falha de propósito** se algum texto estourar o quadro — foi
assim que o CTA cortado do anúncio 1 apareceu antes de virar arquivo final.

## O Raio-X

A triagem de sete perguntas é o centro do site: é isca, qualificador e a razão
de alguém mandar o link para um amigo.

- **Roda 100% no navegador.** Nenhuma resposta é enviada, salva ou registrada.
  Só vira mensagem quando o visitante clica em "Levar esse resultado para a
  Bianca" — e aí vai como texto de WhatsApp, com todas as respostas
  organizadas. **Ela recebe o lead já triado.**
- **O modelo é simples de propósito** (`QUESTIONS` em `js/site.js`): pontos por
  resposta, mais um "piso de faixa" para respostas que sozinhas mudam a
  natureza do caso — negativa anterior, parente em situação irregular nos EUA,
  ausência total de vínculo. Dá para ler o código e entender a lógica inteira,
  o que importa num assunto em que a pessoa precisa confiar no resultado.
- **Editar as perguntas é editar um array.** Nada mais precisa mudar.
- O resultado sempre carrega o aviso de que é triagem, não previsão.

## Decisões técnicas e o porquê

**Mesmo motor do site da Exposul, identidade oposta.** GSAP + ScrollTrigger +
Lenis vendorizados, sem build, fontes em base64 — o que já estava resolvido e
medido continua valendo. O que mudou é a paleta (tinta azul-noite, papel e
carimbo vermelhão no lugar do dourado sobre preto) e o ritmo: aqui as seções
alternam tinta e papel, como páginas de passaporte.

**O carimbo é HTML sobre o SVG, não parte do desenho.** Precisa de texto real,
rotação própria e de bater com escala e recuo no fim da abertura. É o único
exagero da página, e é o que resume a proposta numa imagem: *preparada*.

**O título do hero anima `yPercent`, com o estado inicial fixado por
`gsap.set`.** Armadilha real, que custou uma rodada: o GSAP lê o transform
**computado**, que o navegador já resolveu em pixels. O `translateY(105%)` do
CSS chega como `y: 106px, yPercent: 0`, e tweenar `yPercent` para 0 não move
nada — o título fica invisível dentro da máscara. O estado inicial precisa ser
declarado nos termos do GSAP antes de animar.

**Grão sem `mix-blend-mode`.** O blend obriga o compositor a re-mesclar a
viewport inteira a cada frame. Textura chapada em opacidade baixa entrega
quase o mesmo efeito de graça.

**`overflow-x: clip` no `<html>`, não no `<body>`.** A regra de propagação de
viewport do CSS transfere o overflow do body para o viewport e devolve
`visible` ao próprio body — nada recorta.

**Uma luz só por figura**, com `gradientUnits="userSpaceOnUse"`. Com o padrão,
cada `<path>` recebe a própria rampa e a peça fica remendada.

## Acessibilidade e degradação

- **Sem JavaScript**: a página continua completa e legível. O Raio-X mostra um
  bloco explicando e manda a pessoa fazer a mesma triagem pelo WhatsApp.
- **`prefers-reduced-motion`**: desliga todo o movimento, inclusive o scroll
  suave e o cursor. Conteúdo permanece inteiro.
- **Teclado**: foco visível, `Esc` fecha o menu, e o foco vai para o título de
  cada pergunta do Raio-X ao avançar.
- **Preloader** sai por timeout mesmo se algum asset falhar. Nunca trava.
- Texto no DOM, nunca só dentro de canvas.

## Desempenho medido

Chromium via Playwright, rolagem programática de ponta a ponta:

| | Desktop 1440×900 | Mobile 390×844 |
|---|---|---|
| Quadro mediano | 16,7 ms (60 fps) | 16,7 ms (60 fps) |
| Quadro p95 | 16,8 ms | 16,8 ms |
| Quadros acima de 33 ms | 0 | 0 |
| Overflow horizontal | nenhum | nenhum |
| Erros de console | nenhum | nenhum |

O fluxo do Raio-X foi percorrido nos dois extremos em ambas as larguras:
pior caso devolve faixa vermelha e Caso Sensível; melhor caso devolve faixa
verde e Renovação Assistida.

## O que este MVP não faz

- Sem pagamento no site: o fechamento é no WhatsApp.
- Sem CRM. A lista de vencimento de visto (a recorrência de daqui a dez anos)
  precisa ser mantida à mão por enquanto.
- Sem blog. Para SEO de cauda longa ("visto americano negado o que fazer",
  "visto para criança 2026") vai faltar conteúdo indexável.
- O Raio-X não guarda nada — o que é uma escolha de privacidade, mas significa
  que não há estatística de quantas pessoas começaram e abandonaram.
- Sem agendamento integrado.

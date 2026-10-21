# Estúdio de conteúdo da Exposul

Esta pasta é a produção de conteúdo de Instagram da Exposul Expositores.
Sempre carregue a skill **marca-exposul** antes de escrever qualquer texto.

## Pastas
- `00-pauta/` — calendário da semana (`semana-AAAA-MM-DD.md`) e roteiros.
- `01-brutos/` — material original enviado pela equipe. **Nunca altere nem apague nada aqui.**
  Subpastas: `videos/`, `fotos/`, `depoimentos/`, `lojas/<nome-da-loja>/`.
- `02-em-edicao/` — arquivos de trabalho seus (cortes, legendas .srt, testes).
- `03-para-aprovar/<data>-<slug>/` — cada peça pronta numa pasta com:
  `video.mp4` ou `slide-01.jpg…`, `capa.jpg`, `legenda.txt`, `alt.txt`, `ficha.md`.
- `04-aprovados/` — o dono move para cá o que aprovou.
- `05-publicados/` — depois de agendado, mova a pasta para cá e anote a data.
- `99-marca/` — logo, fontes, `trilhas/` (só áudio licenciado para uso comercial), `motion/`,
  `dados-confirmados.md`, `autorizacoes.md`.

## Padrões técnicos de vídeo
- Saída: MP4 H.264, AAC 48 kHz, 1080x1920 (9:16), 30 fps, até 60 s, loudness ~ -14 LUFS.
- Reenquadrar vídeo horizontal para 9:16 com corte centrado no produto (ou fundo desfocado
  do próprio vídeo quando o corte perder o produto).
- Legenda embutida: transcrever com faster-whisper (modelo `small` ou `medium`, idioma pt),
  revisar nomes de produto, queimar com fonte Archivo branca, contorno preto, terço inferior,
  no máximo 2 linhas e ~32 caracteres por linha.
- Texto de gancho no primeiro segundo, grande, terço superior.
- Logo pequeno no fim (últimos 2 s) com o CTA da peça. Nunca logo na abertura.
- Áudio: som original, narração ou trilha de `99-marca/trilhas/`. Nunca música comercial.
- Cortes e reenquadramento do material real: ffmpeg. Motion graphics (títulos animados,
  listas, mapas, encerramento): HyperFrames, com as cores e fontes de `99-marca/`.
- Capa: frame mais forte do vídeo + título de até 5 palavras, área segura 3:4.

## Fluxo para cada peça
1. Ler a ficha da pauta em `00-pauta/`.
2. Escolher o material em `01-brutos/` e copiar para `02-em-edicao/`.
3. **Antes de renderizar, mostrar o roteiro de cortes (tempo → trecho do arquivo) e esperar
   aprovação.** Depois editar (ffmpeg / HyperFrames), gerar capa, legenda e alt text
   (alt text só para foto e carrossel).
4. Rodar o checklist da skill marca-exposul.
5. Salvar em `03-para-aprovar/` e escrever `ficha.md` com: formato, pilar, gancho,
   CTA/palavra-chave, data e horário sugeridos, `rotulo_ia: sim/não`, origem de cada
   trecho de áudio, e qualquer `[CONFIRMAR: ...]`.
6. Só enviar ao Buffer **como rascunho** e **só** o que estiver em `04-aprovados/`.

## Proibido
- Publicar ou agendar direto. Sempre rascunho.
- Apagar arquivos de `01-brutos/`.
- Usar número (preço, prazo, desconto) fora de `99-marca/dados-confirmados.md`.
- Usar imagem gerada por IA como se fosse loja ou cliente real.
- Deixar visível nome, telefone ou endereço de cliente (etiquetas, conversas, notas).

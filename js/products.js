/* ==========================================================================
   Catálogo — dados de demonstração (MVP)

   ATENÇÃO: preços, referências, medidas e prazos abaixo são PLACEHOLDER
   plausíveis, criados para o protótipo. Substituir pelos dados reais da
   Exposul antes de qualquer publicação. Endereço, telefones e categorias
   são os reais da empresa.

   Estrutura de preço: `tiers` é a escada de atacado. `tiers[0]` é sempre o
   preço de varejo (1 unidade), o que mantém o site vendendo para consumidor
   final sem esconder a condição de lojista.
   ========================================================================== */

const CATEGORIES = [
  { id: 'todos',       label: 'Tudo' },
  { id: 'manequins',   label: 'Manequins' },
  { id: 'cabides',     label: 'Cabides' },
  { id: 'araras',      label: 'Araras' },
  { id: 'expositores', label: 'Expositores' },
  { id: 'aramados',    label: 'Aramados' }
];

const CATALOG = [
  /* ---------------------------------------------------------------- MANEQUINS */
  {
    id: 'mq-smart-f', ref: 'MQ-1140', cat: 'manequins', catLabel: 'Manequins',
    name: 'Manequim Feminino Corpo Inteiro — Linha Smart',
    art: 'art-mannequin-f', tag: 'Mais vendido',
    unit: 'unidade',
    desc: 'A silhueta que sustenta a vitrine. Proporção manequim 38, ombro estreito e cintura marcada — a peça cai como cai no corpo. Acabamento perolado fosco que não devolve reflexo de spot.',
    specs: { 'Altura': '1,78 m', 'Manequim': '38', 'Material': 'Fibra reforçada', 'Base': 'Disco de aço · 30 cm' },
    tiers: [
      { min: 1,  max: 4,    price: 389.00 },
      { min: 5,  max: 9,    price: 359.00 },
      { min: 10, max: 29,   price: 328.00 },
      { min: 30, max: null, price: 297.00 }
    ]
  },
  {
    id: 'mq-smart-m', ref: 'MQ-1210', cat: 'manequins', catLabel: 'Manequins',
    name: 'Manequim Masculino Bombado — Linha Smart',
    art: 'art-mannequin-m',
    unit: 'unidade',
    desc: 'Peitoral e dorsal ampliados para estruturar camisaria e malha pesada. Resolve o problema clássico do masculino: camisa que murcha no manequim e some da vitrine.',
    specs: { 'Altura': '1,88 m', 'Manequim': '42', 'Material': 'Fibra reforçada', 'Base': 'Disco de aço · 32 cm' },
    tiers: [
      { min: 1,  max: 4,    price: 429.00 },
      { min: 5,  max: 9,    price: 396.00 },
      { min: 10, max: 29,   price: 362.00 },
      { min: 30, max: null, price: 329.00 }
    ]
  },
  {
    id: 'mq-veludo', ref: 'MQ-1155', cat: 'manequins', catLabel: 'Manequins',
    name: 'Manequim Feminino Veludo Grafite',
    art: 'art-mannequin-f', artTone: 'velvet', tag: 'Linha premium',
    unit: 'unidade',
    desc: 'Revestimento aveludado grafite sobre a base Smart. Absorve luz em vez de refletir, o que empurra a peça de roupa para a frente. Indicado para alfaiataria e festa.',
    specs: { 'Altura': '1,78 m', 'Manequim': '38', 'Revestimento': 'Veludo aderido', 'Base': 'Disco escovado · 30 cm' },
    tiers: [
      { min: 1,  max: 4,    price: 549.00 },
      { min: 5,  max: 9,    price: 512.00 },
      { min: 10, max: 29,   price: 474.00 },
      { min: 30, max: null, price: 439.00 }
    ]
  },
  {
    id: 'mq-plus', ref: 'MQ-1180', cat: 'manequins', catLabel: 'Manequins',
    name: 'Manequim Plus Size Feminino 48',
    art: 'art-mannequin-f', artTone: 'plus',
    unit: 'unidade',
    desc: 'Manequim 48 com quadril e busto proporcionais de verdade — não é o 38 escalado. Quem vende plus size sabe a diferença que isso faz na prova visual.',
    specs: { 'Altura': '1,76 m', 'Manequim': '48', 'Material': 'Fibra reforçada', 'Base': 'Disco de aço · 34 cm' },
    tiers: [
      { min: 1,  max: 4,    price: 469.00 },
      { min: 5,  max: 9,    price: 435.00 },
      { min: 10, max: 29,   price: 398.00 },
      { min: 30, max: null, price: 366.00 }
    ]
  },
  {
    id: 'mq-busto', ref: 'MQ-0420', cat: 'manequins', catLabel: 'Manequins',
    name: 'Busto Feminino com Pedestal Regulável',
    art: 'art-bust',
    unit: 'unidade',
    desc: 'Meio corpo em haste regulável de 90 cm a 1,45 m. Ocupa 1/3 do espaço de um corpo inteiro e resolve balcão, mesa de exposição e vitrine de passagem estreita.',
    specs: { 'Altura útil': '0,90 – 1,45 m', 'Manequim': '38', 'Haste': 'Aço cromado', 'Base': 'Disco · 28 cm' },
    tiers: [
      { min: 1,  max: 4,    price: 219.00 },
      { min: 5,  max: 9,    price: 202.00 },
      { min: 10, max: 29,   price: 185.00 },
      { min: 30, max: null, price: 169.00 }
    ]
  },
  {
    id: 'mq-infantil', ref: 'MQ-0610', cat: 'manequins', catLabel: 'Manequins',
    name: 'Manequim Infantil 6 Anos',
    art: 'art-mannequin-child',
    unit: 'unidade',
    desc: 'Proporção real de criança de 6 anos, sem a caricatura de manequim adulto reduzido. Base ampliada para resistir ao esbarrão — que em loja infantil é regra, não exceção.',
    specs: { 'Altura': '1,16 m', 'Idade ref.': '6 anos', 'Material': 'Fibra reforçada', 'Base': 'Disco de aço · 26 cm' },
    tiers: [
      { min: 1,  max: 4,    price: 279.00 },
      { min: 5,  max: 9,    price: 258.00 },
      { min: 10, max: 29,   price: 236.00 },
      { min: 30, max: null, price: 214.00 }
    ]
  },

  /* ------------------------------------------------------------------ CABIDES */
  {
    id: 'cb-acrilico', ref: 'CB-2010', cat: 'cabides', catLabel: 'Cabides',
    name: 'Cabide Acrílico Cavado Cristal — pacote 50',
    art: 'art-hanger-curve', tag: 'Mais vendido',
    unit: 'pacote de 50',
    desc: 'Cavado profundo que segura decote sem deformar. O acrílico cristal some na arara e deixa a arara parecer só roupa — que é exatamente o ponto.',
    specs: { 'Largura': '42 cm', 'Espessura': '8 mm', 'Material': 'Acrílico cristal', 'Gancho': 'Cromado giratório' },
    tiers: [
      { min: 1,  max: 4,    price: 179.00 },
      { min: 5,  max: 9,    price: 164.00 },
      { min: 10, max: 29,   price: 149.00 },
      { min: 30, max: null, price: 134.00 }
    ]
  },
  {
    id: 'cb-veludo', ref: 'CB-2140', cat: 'cabides', catLabel: 'Cabides',
    name: 'Cabide Veludo Slim Antideslizante — pacote 50',
    art: 'art-hanger-slim',
    unit: 'pacote de 50',
    desc: 'Perfil de 5 mm: cabe 40% mais peça na mesma arara. O veludo trava alça fina e malha escorregadia, o que elimina o chão de peça caída no fim do dia.',
    specs: { 'Largura': '42 cm', 'Espessura': '5 mm', 'Revestimento': 'Veludo flocado', 'Gancho': 'Cromado giratório' },
    tiers: [
      { min: 1,  max: 4,    price: 149.00 },
      { min: 5,  max: 9,    price: 137.00 },
      { min: 10, max: 29,   price: 124.00 },
      { min: 30, max: null, price: 112.00 }
    ]
  },
  {
    id: 'cb-presilha', ref: 'CB-2320', cat: 'cabides', catLabel: 'Cabides',
    name: 'Cabide com Presilhas Reguláveis — pacote 50',
    art: 'art-hanger-clip',
    unit: 'pacote de 50',
    desc: 'Presilha com borracha interna que corre no trilho inteiro. Segura saia, short e calça sem marcar o tecido — inclusive alfaiataria clara, onde a marca é prejuízo.',
    specs: { 'Largura': '36 cm', 'Presilhas': '2 · corrediças', 'Material': 'Polímero + aço', 'Gancho': 'Cromado giratório' },
    tiers: [
      { min: 1,  max: 4,    price: 199.00 },
      { min: 5,  max: 9,    price: 183.00 },
      { min: 10, max: 29,   price: 166.00 },
      { min: 30, max: null, price: 149.00 }
    ]
  },
  {
    id: 'cb-infantil', ref: 'CB-2450', cat: 'cabides', catLabel: 'Cabides',
    name: 'Cabide Infantil Colorido — pacote 100',
    art: 'art-hanger-kids',
    unit: 'pacote de 100',
    desc: 'Vão de 30 cm na escala certa da peça infantil. Sortido em quatro cores para quem separa arara por faixa etária e quer que a criança ache sozinha.',
    specs: { 'Largura': '30 cm', 'Cores': '4 · sortidas', 'Material': 'Polipropileno', 'Gancho': 'Integrado' },
    tiers: [
      { min: 1,  max: 4,    price: 129.00 },
      { min: 5,  max: 9,    price: 118.00 },
      { min: 10, max: 29,   price: 107.00 },
      { min: 30, max: null, price: 96.00 }
    ]
  },

  /* ------------------------------------------------------------------- ARARAS */
  {
    id: 'ar-reta', ref: 'AR-3010', cat: 'araras', catLabel: 'Araras',
    name: 'Arara de Chão Reta Cromada',
    art: 'art-rack-straight',
    unit: 'unidade',
    desc: 'O cavalo de batalha da loja. Tubo de 1" com regulagem de altura e rodízio opcional. Monta em dois minutos e aguenta 60 kg de peça pendurada sem entortar.',
    specs: { 'Altura': '1,40 – 1,90 m', 'Comprimento': '1,20 m', 'Carga': 'até 60 kg', 'Tubo': '1" cromado' },
    tiers: [
      { min: 1,  max: 4,    price: 259.00 },
      { min: 5,  max: 9,    price: 239.00 },
      { min: 10, max: 29,   price: 218.00 },
      { min: 30, max: null, price: 198.00 }
    ]
  },
  {
    id: 'ar-industrial', ref: 'AR-3220', cat: 'araras', catLabel: 'Araras',
    name: 'Arara Industrial Tubo Preto com Prateleira',
    art: 'art-rack-industrial', tag: 'Novidade',
    unit: 'unidade',
    desc: 'Estrutura em tubo preto fosco com prateleira superior em MDF. Vira móvel de composição, não só suporte — funciona no meio da loja sem precisar de parede atrás.',
    specs: { 'Altura': '1,60 m', 'Comprimento': '1,20 m', 'Carga': 'até 80 kg', 'Prateleira': 'MDF 18 mm' },
    tiers: [
      { min: 1,  max: 4,    price: 489.00 },
      { min: 5,  max: 9,    price: 452.00 },
      { min: 10, max: 29,   price: 414.00 },
      { min: 30, max: null, price: 379.00 }
    ]
  },
  {
    id: 'ar-gondola', ref: 'AR-3410', cat: 'araras', catLabel: 'Araras',
    name: 'Arara Gôndola Dupla Face com Rodízios',
    art: 'art-rack-gondola',
    unit: 'unidade',
    desc: 'Dupla face sobre rodízios com trava. Reposiciona a loja inteira em cinco minutos — o que importa mais do que parece em troca de coleção e liquidação.',
    specs: { 'Altura': '1,55 m', 'Comprimento': '1,50 m', 'Carga': 'até 120 kg', 'Rodízios': '4 · 2 com trava' },
    tiers: [
      { min: 1,  max: 4,    price: 899.00 },
      { min: 5,  max: 9,    price: 832.00 },
      { min: 10, max: 29,   price: 762.00 },
      { min: 30, max: null, price: 698.00 }
    ]
  },

  /* -------------------------------------------------------------- EXPOSITORES */
  {
    id: 'ex-painel', ref: 'EX-4010', cat: 'expositores', catLabel: 'Expositores',
    name: 'Painel Canaletado 1,20 × 2,00 m',
    art: 'art-panel',
    unit: 'unidade',
    desc: 'Canaletas a cada 10 cm com perfil de alumínio embutido. A parede vira sistema: gancho, prateleira e braço mudam de lugar sem furar nada de novo.',
    specs: { 'Medida': '1,20 × 2,00 m', 'Canaletas': 'a cada 10 cm', 'Perfil': 'Alumínio', 'Acabamento': 'Branco / Preto' },
    tiers: [
      { min: 1,  max: 4,    price: 349.00 },
      { min: 5,  max: 9,    price: 322.00 },
      { min: 10, max: 29,   price: 294.00 },
      { min: 30, max: null, price: 268.00 }
    ]
  },
  {
    id: 'ex-torre', ref: 'EX-4230', cat: 'expositores', catLabel: 'Expositores',
    name: 'Expositor Torre Giratório 4 Faces',
    art: 'art-tower',
    unit: 'unidade',
    desc: 'Quatro faces canaletadas girando sobre rolamento. Cabe em 60 × 60 cm de chão e entrega 4,8 m lineares de exposição — a melhor troca de metro quadrado da linha.',
    specs: { 'Altura': '1,80 m', 'Base': '0,60 × 0,60 m', 'Faces': '4 · canaletadas', 'Giro': 'Rolamento axial' },
    tiers: [
      { min: 1,  max: 4,    price: 639.00 },
      { min: 5,  max: 9,    price: 591.00 },
      { min: 10, max: 29,   price: 542.00 },
      { min: 30, max: null, price: 496.00 }
    ]
  },
  {
    id: 'ex-balcao', ref: 'EX-4520', cat: 'expositores', catLabel: 'Expositores',
    name: 'Balcão Vitrine Caixa com Vidro Temperado',
    art: 'art-counter', tag: 'Sob medida',
    unit: 'unidade',
    desc: 'Caixa e vitrine no mesmo móvel, com vidro temperado de 6 mm e gaveteiro fechado. Feito sob medida na fábrica — a medida da sua loja, não a medida do catálogo.',
    specs: { 'Medida': '1,50 × 0,60 m', 'Altura': '1,00 m', 'Vidro': 'Temperado 6 mm', 'Estrutura': 'MDF 18 mm' },
    tiers: [
      { min: 1,  max: 4,    price: 1290.00 },
      { min: 5,  max: 9,    price: 1196.00 },
      { min: 10, max: 29,   price: 1098.00 },
      { min: 30, max: null, price: 998.00 }
    ]
  },

  /* ----------------------------------------------------------------- ARAMADOS */
  {
    id: 'am-cesto', ref: 'AM-5010', cat: 'aramados', catLabel: 'Aramados',
    name: 'Cesto Aramado Promocional com Placa',
    art: 'art-basket',
    unit: 'unidade',
    desc: 'Cesto de queima com suporte de placa de preço já integrado. É onde a loja gira estoque parado — e onde a placa some se o suporte não vier junto.',
    specs: { 'Medida': '0,60 × 0,60 m', 'Altura': '0,80 m', 'Fio': 'Aço 4,2 mm', 'Placa': 'Suporte incluso' },
    tiers: [
      { min: 1,  max: 4,    price: 189.00 },
      { min: 5,  max: 9,    price: 174.00 },
      { min: 10, max: 29,   price: 159.00 },
      { min: 30, max: null, price: 144.00 }
    ]
  },
  {
    id: 'am-ganchos', ref: 'AM-5220', cat: 'aramados', catLabel: 'Aramados',
    name: 'Kit Ganchos para Painel Canaletado — 20 peças',
    art: 'art-hooks',
    unit: 'kit com 20',
    desc: 'Sortido de 10, 15, 20 e 30 cm com ponta de segurança. É o consumível do painel canaletado: quem compra painel compra gancho de novo em seis meses.',
    specs: { 'Comprimentos': '10 / 15 / 20 / 30 cm', 'Peças': '20 · sortidas', 'Material': 'Aço cromado', 'Encaixe': 'Canaleta padrão' },
    tiers: [
      { min: 1,  max: 4,    price: 89.00 },
      { min: 5,  max: 9,    price: 82.00 },
      { min: 10, max: 29,   price: 74.00 },
      { min: 30, max: null, price: 67.00 }
    ]
  }
];

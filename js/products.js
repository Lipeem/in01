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

// Rótulo curto da unidade, usado nos degraus da escada. Sem isso "30 un."
// de um item vendido em pacote de 50 é lido como 30 peças.
function unitShort(unit) {
  if (unit.indexOf('pacote') > -1) return 'pacotes';
  if (unit.indexOf('kit') > -1) return 'kits';
  return 'un.';
}

const CATALOG = [
  /* ---------------------------------------------------------------- MANEQUINS */
  {
    id: 'mq-smart-f', ref: 'MQ-1140', cat: 'manequins', catLabel: 'Manequins',
    name: 'Manequim Feminino Corpo Inteiro — Linha Smart',
    art: 'art-mannequin-f', tag: 'Mais vendido',
    unit: 'unidade',
    desc: 'A silhueta que sustenta a vitrine. Proporção manequim 38, ombro estreito e cintura marcada — a peça cai como cai no corpo. Acabamento perolado fosco que não devolve reflexo de spot.',
    specs: { 'Altura': '1,78 m', 'Manequim': '38', 'Material': 'Fibra reforçada', 'Base': 'Disco de aço · 30 cm' },
    tiers: [
      { min: 1,   max: 1,     price: 389.00 },
      { min: 2,   max: 3,     price: 350.00 },
      { min: 4,   max: 9,     price: 319.00 },
      { min: 10,  max: null,  price: 280.00 }
    ]
  },
  {
    id: 'mq-smart-m', ref: 'MQ-1210', cat: 'manequins', catLabel: 'Manequins',
    name: 'Manequim Masculino Bombado — Linha Smart',
    art: 'art-mannequin-m',
    unit: 'unidade',
    desc: 'Peitoral e dorsal ampliados para estruturar camisaria e malha pesada. Resolve o problema clássico do masculino: camisa que murcha no manequim e some da vitrine.',
    specs: { 'Altura': '1,88 m', 'Manequim': '42', 'Material': 'Fibra reforçada', 'Base': 'Disco de aço · 32 cm' },
    tiers: [
      { min: 1,   max: 1,     price: 429.00 },
      { min: 2,   max: 3,     price: 386.00 },
      { min: 4,   max: 9,     price: 352.00 },
      { min: 10,  max: null,  price: 309.00 }
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
      { min: 1,   max: 1,     price: 549.00 },
      { min: 2,   max: 3,     price: 494.00 },
      { min: 4,   max: 9,     price: 450.00 },
      { min: 10,  max: null,  price: 395.00 }
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
      { min: 1,   max: 1,     price: 469.00 },
      { min: 2,   max: 3,     price: 422.00 },
      { min: 4,   max: 9,     price: 385.00 },
      { min: 10,  max: null,  price: 338.00 }
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
      { min: 1,   max: 1,     price: 219.00 },
      { min: 2,   max: 3,     price: 197.00 },
      { min: 4,   max: 9,     price: 180.00 },
      { min: 10,  max: null,  price: 158.00 }
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
      { min: 1,   max: 1,     price: 279.00 },
      { min: 2,   max: 3,     price: 251.00 },
      { min: 4,   max: 9,     price: 229.00 },
      { min: 10,  max: null,  price: 201.00 }
    ]
  },

  /* ------------------------------------------------------------------ CABIDES */
  {
    id: 'cb-acrilico', ref: 'CB-2010', cat: 'cabides', catLabel: 'Cabides',
    name: 'Cabide Acrílico Cavado Cristal — pacote 50',
    art: 'art-hanger-curve', tag: 'Mais vendido',
    unit: 'pacote de 50',
    desc: 'Cavado profundo que segura decote sem deformar. O acrílico cristal some na arara: quem olha a vitrine vê a roupa, não o cabide.',
    specs: { 'Largura': '42 cm', 'Espessura': '8 mm', 'Material': 'Acrílico cristal', 'Gancho': 'Cromado giratório' },
    tiers: [
      { min: 1,   max: 4,     price: 179.00 },
      { min: 5,   max: 19,    price: 158.00 },
      { min: 20,  max: 49,    price: 140.00 },
      { min: 50,  max: null,  price: 122.00 }
    ]
  },
  {
    id: 'cb-veludo', ref: 'CB-2140', cat: 'cabides', catLabel: 'Cabides',
    name: 'Cabide Veludo Slim Antideslizante — pacote 50',
    art: 'art-hanger-slim',
    unit: 'pacote de 50',
    desc: 'Perfil de 5 mm: cabe 40% mais peça na mesma arara. O veludo trava alça fina e malha escorregadia, o que elimina o chão de peça caída no fim do dia.',
    specs: { 'Largura': '42 cm', 'Espessura': '5 mm', 'Revestimento': 'Veludo flocado', 'Gancho': 'Cromado giratório' },
    tiers: [
      { min: 1,   max: 4,     price: 149.00 },
      { min: 5,   max: 19,    price: 131.00 },
      { min: 20,  max: 49,    price: 116.00 },
      { min: 50,  max: null,  price: 101.00 }
    ]
  },
  {
    id: 'cb-presilha', ref: 'CB-2320', cat: 'cabides', catLabel: 'Cabides',
    name: 'Cabide com Presilhas Reguláveis — pacote 50',
    art: 'art-hanger-clip',
    unit: 'pacote de 50',
    desc: 'Presilha com borracha interna que corre no trilho inteiro. Segura saia, short e calça sem marcar o tecido — inclusive alfaiataria clara, onde a marca é prejuízo.',
    specs: { 'Largura': '36 cm', 'Presilhas': '2 · corrediças', 'Material': 'Polímero + aço', 'Gancho': 'Cromado giratório' },
    tiers: [
      { min: 1,   max: 4,     price: 199.00 },
      { min: 5,   max: 19,    price: 175.00 },
      { min: 20,  max: 49,    price: 155.00 },
      { min: 50,  max: null,  price: 135.00 }
    ]
  },
  {
    id: 'cb-infantil', ref: 'CB-2450', cat: 'cabides', catLabel: 'Cabides',
    name: 'Cabide Infantil Colorido — pacote 100',
    art: 'art-hanger-kids',
    unit: 'pacote de 100',
    desc: 'Vão de 30 cm na escala certa da peça infantil. Sortido em quatro cores para quem separa arara por faixa etária e quer que a criança ache sozinha.',
    specs: { 'Largura': '30 cm', 'Cores': '4 · sortidas', 'Material': 'Polipropileno', 'Gancho': 'Integrado' },
    tiers: [
      { min: 1,   max: 4,     price: 129.00 },
      { min: 5,   max: 19,    price: 114.00 },
      { min: 20,  max: 49,    price: 101.00 },
      { min: 50,  max: null,  price: 88.00 }
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
      { min: 1,   max: 1,     price: 259.00 },
      { min: 2,   max: 3,     price: 233.00 },
      { min: 4,   max: 9,     price: 212.00 },
      { min: 10,  max: null,  price: 186.00 }
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
      { min: 1,   max: 1,     price: 489.00 },
      { min: 2,   max: 3,     price: 440.00 },
      { min: 4,   max: 9,     price: 401.00 },
      { min: 10,  max: null,  price: 352.00 }
    ]
  },
  {
    id: 'ar-gondola', ref: 'AR-3410', cat: 'araras', catLabel: 'Araras',
    name: 'Arara Gôndola Dupla Face com Rodízios',
    art: 'art-rack-gondola',
    unit: 'unidade',
    desc: 'Dupla face sobre rodízios com trava. Reposiciona a loja inteira em cinco minutos, sem desmontar nada — o que resolve troca de coleção e liquidação.',
    specs: { 'Altura': '1,55 m', 'Comprimento': '1,50 m', 'Carga': 'até 120 kg', 'Rodízios': '4 · 2 com trava' },
    tiers: [
      { min: 1,   max: 1,     price: 899.00 },
      { min: 2,   max: 3,     price: 809.00 },
      { min: 4,   max: 9,     price: 737.00 },
      { min: 10,  max: null,  price: 647.00 }
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
      { min: 1,   max: 1,     price: 349.00 },
      { min: 2,   max: 3,     price: 314.00 },
      { min: 4,   max: 9,     price: 286.00 },
      { min: 10,  max: null,  price: 251.00 }
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
      { min: 1,   max: 1,     price: 639.00 },
      { min: 2,   max: 3,     price: 575.00 },
      { min: 4,   max: 9,     price: 524.00 },
      { min: 10,  max: null,  price: 460.00 }
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
      { min: 1,   max: 1,     price: 1290.00 },
      { min: 2,   max: 3,     price: 1161.00 },
      { min: 4,   max: 9,     price: 1058.00 },
      { min: 10,  max: null,  price: 929.00 }
    ]
  },

  /* ----------------------------------------------------------------- ARAMADOS */
  {
    id: 'am-cesto', ref: 'AM-5010', cat: 'aramados', catLabel: 'Aramados',
    name: 'Cesto Aramado Promocional com Placa',
    art: 'art-basket',
    unit: 'unidade',
    desc: 'Cesto de queima com suporte de placa de preço já integrado. É onde a loja gira estoque parado. O suporte de placa vem junto, então o preço não fica preso com fita na grade.',
    specs: { 'Medida': '0,60 × 0,60 m', 'Altura': '0,80 m', 'Fio': 'Aço 4,2 mm', 'Placa': 'Suporte incluso' },
    tiers: [
      { min: 1,   max: 4,     price: 189.00 },
      { min: 5,   max: 19,    price: 166.00 },
      { min: 20,  max: 49,    price: 147.00 },
      { min: 50,  max: null,  price: 129.00 }
    ]
  },
  {
    id: 'am-ganchos', ref: 'AM-5220', cat: 'aramados', catLabel: 'Aramados',
    name: 'Kit Ganchos para Painel Canaletado — 20 peças',
    art: 'art-hooks',
    unit: 'kit com 20',
    desc: 'Sortido de 10, 15, 20 e 30 cm com ponta de segurança. É o consumível do painel canaletado: gancho entorta, some e muda de lugar toda troca de coleção.',
    specs: { 'Comprimentos': '10 / 15 / 20 / 30 cm', 'Peças': '20 · sortidas', 'Material': 'Aço cromado', 'Encaixe': 'Canaleta padrão' },
    tiers: [
      { min: 1,   max: 4,     price: 89.00 },
      { min: 5,   max: 19,    price: 78.00 },
      { min: 20,  max: 49,    price: 69.00 },
      { min: 50,  max: null,  price: 61.00 }
    ]
  }
];

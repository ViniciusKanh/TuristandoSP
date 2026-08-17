import type { Exploration, PhotoRef } from '../types/index';

function demoPhoto(
  id: string,
  alt: string,
  hue: number,
  order: number,
  orientation: 'h' | 'v' = 'h',
  caption?: string,
): PhotoRef {
  const w = orientation === 'h' ? 1600 : 1067;
  const h = orientation === 'h' ? 1067 : 1600;
  return { id, url: '', demo: true, width: w, height: h, alt, order, hue, caption };
}

const now = '2026-08-16T12:00:00-03:00';

/** EXPLORAÇÕES — experiências do autor (dados demo). */
export const explorations: Exploration[] = [
  {
    id: 'e-0042',
    number: 42,
    slug: 'primeira-visita-ao-museu-da-lingua-portuguesa',
    placeSlug: 'museu-da-lingua-portuguesa',
    title: 'Uma viagem pelas histórias de quem construiu São Paulo',
    subtitle:
      'Visitei a antiga Hospedaria de Imigrantes, conheci histórias de quem chegou de diferentes partes do mundo e do Brasil, e terminei o passeio embarcando no histórico Trem dos Imigrantes.',
    date: '2026-08-14',
    durationMinutes: 160,
    transport: [
      { mode: 'metro', detail: 'Linha Azul até a Luz' },
      { mode: 'a-pe', detail: 'Estação Luz → museu, 1 min' },
    ],
    expenses: [
      { label: 'Entrada', category: 'entrada', amount: 24 },
      { label: 'Metrô (ida e volta)', category: 'transporte', amount: 9.6 },
      { label: 'Café e pão de queijo', category: 'alimentacao', amount: 12 },
    ],
    rating: {
      overall: 5,
      experience: 5,
      costBenefit: 5,
      infrastructure: 4,
      accessibility: 4,
      photography: 5,
      wouldReturn: 'com-certeza',
    },
    photos: [
      demoPhoto('mlp-1', 'Fachada da Estação da Luz sob céu azul', 30, 0, 'h'),
      demoPhoto('mlp-2', 'Projeções na galeria principal do museu', 300, 1, 'h', 'A galeria principal é uma parede de luz e palavra.'),
      demoPhoto('mlp-3', 'Detalhe da estrutura de ferro da estação', 210, 2, 'v', 'Estrutura de ferro importada, montada no século 19.'),
      demoPhoto('mlp-4', 'Trem dos Imigrantes na plataforma', 25, 3, 'h'),
    ],
    article: [
      {
        type: 'paragraph',
        text: 'Comecei o dia como quem não quer nada: metrô até a Luz, o centro ainda acordando. A Estação da Luz aparece antes do museu — e ela já é meio museu. Ferro fundido trazido da Inglaterra, relógio no alto, aquele ar de São Paulo que enriqueceu com o café e quis parecer europeia.',
      },
      { type: 'heading', level: 2, text: 'A língua como coisa viva' },
      {
        type: 'paragraph',
        text: 'O Museu da Língua Portuguesa não tem quase objeto nenhum. É som, projeção e texto. Você anda por dentro do idioma. A galeria principal, uma parede enorme de imagens em movimento, é daquelas coisas que te fazem sentar no chão e ficar.',
      },
      {
        type: 'image',
        photo: demoPhoto('mlp-inline-1', 'Instalação interativa de palavras projetadas', 285, 10, 'h', 'Cada palavra puxa uma história.'),
      },
      {
        type: 'tip',
        title: 'Minha dica',
        text: 'Chegue quando abre, principalmente aos finais de semana. A galeria principal fica bem melhor com pouca gente — dá pra ouvir.',
      },
      {
        type: 'paragraph',
        text: 'Tem uma parte sobre a Hospedaria dos Imigrantes que me pegou. São histórias de gente que desembarcou aqui do lado, no Brás, vinda de todos os cantos. A cidade que eu ando hoje foi construída por essas pessoas.',
      },
      {
        type: 'info',
        title: 'Vale saber',
        text: 'A entrada é gratuita aos sábados. Nos outros dias custa R$ 24 (inteira). Fecha às segundas.',
      },
      { type: 'heading', level: 2, text: 'O Trem dos Imigrantes' },
      {
        type: 'paragraph',
        text: 'Terminei embarcando no Trem dos Imigrantes, um vagão histórico que faz um trajeto curto. É bobo e é lindo ao mesmo tempo — dá pra imaginar a chegada de quem não falava a língua e ia aprender no susto.',
      },
      {
        type: 'warning',
        title: 'Atenção',
        text: 'Algumas atividades e o trem podem exigir agendamento ou ter horário fixo. Confira no site antes de ir.',
      },
      {
        type: 'gallery',
        photos: [
          demoPhoto('mlp-g1', 'Escadaria interna da estação', 210, 20, 'v'),
          demoPhoto('mlp-g2', 'Vitral colorido da Estação da Luz', 40, 21, 'v'),
          demoPhoto('mlp-g3', 'Plataforma com o trem histórico', 25, 22, 'h'),
        ],
      },
      {
        type: 'transport',
        legs: [
          { mode: 'metro', detail: 'Linha Azul → Luz' },
          { mode: 'a-pe', detail: '1 min da estação' },
        ],
        totalMinutes: 35,
      },
      {
        type: 'costs',
        items: [
          { label: 'Entrada', category: 'entrada', amount: 24 },
          { label: 'Metrô', category: 'transporte', amount: 9.6 },
          { label: 'Café e pão de queijo', category: 'alimentacao', amount: 12 },
        ],
      },
      { type: 'separator' },
      {
        type: 'paragraph',
        text: 'Saí de lá achando que conheço menos São Paulo do que imaginava — e isso, pra este projeto, é o melhor elogio possível.',
      },
      { type: 'relatedPlaces', placeSlugs: ['pinacoteca', 'mercado-municipal', 'farol-santander'] },
    ],
    categories: ['museus', 'cultura', 'historia'],
    tags: ['luz', 'interativo', 'perto-do-metro', 'imperdivel'],
    status: 'publicado',
    publishedAt: '2026-08-15T09:00:00-03:00',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'e-0041',
    number: 41,
    slug: 'a-paulista-vista-de-baixo-do-masp',
    placeSlug: 'masp',
    title: 'A Paulista vista de baixo do MASP',
    subtitle: 'Voltei ao vão livre num domingo de feira de antiguidades e reparei no que nunca tinha reparado.',
    date: '2026-08-03',
    durationMinutes: 130,
    transport: [{ mode: 'metro', detail: 'Linha Verde → Trianon-Masp' }],
    expenses: [
      { label: 'Entrada', category: 'entrada', amount: 0 },
      { label: 'Metrô', category: 'transporte', amount: 9.6 },
      { label: 'Café na Paulista', category: 'alimentacao', amount: 18 },
    ],
    rating: {
      overall: 5,
      experience: 5,
      costBenefit: 5,
      infrastructure: 5,
      accessibility: 5,
      photography: 5,
      wouldReturn: 'com-certeza',
    },
    photos: [
      demoPhoto('masp-1', 'Vão livre vermelho do MASP', 20, 0, 'h'),
      demoPhoto('masp-2', 'Cavaletes de vidro na galeria', 300, 1, 'h'),
    ],
    article: [
      {
        type: 'paragraph',
        text: 'Todo paulistano já passou embaixo do MASP mil vezes. Mas parar debaixo daquele vão de 74 metros num domingo, com a feira montada e a Paulista fechada pra carro, é outra história.',
      },
      {
        type: 'tip',
        title: 'Minha dica',
        text: 'Terça a entrada é gratuita — e lotada. Se puder, vá num dia de semana pela manhã pra ver os cavaletes de vidro com calma.',
      },
      {
        type: 'paragraph',
        text: 'Os cavaletes de vidro da Lina Bo Bardi mudam tudo. A obra fica suspensa, sem parede atrás, e você vê a moldura, o verso, a etiqueta. É arte sem o teatro do museu.',
      },
      { type: 'relatedPlaces', placeSlugs: ['japan-house', 'pinacoteca'] },
    ],
    categories: ['museus', 'cultura', 'arquitetura'],
    tags: ['paulista', 'imperdivel', 'arte-moderna'],
    status: 'publicado',
    publishedAt: '2026-08-04T10:00:00-03:00',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'e-0040',
    number: 40,
    slug: 'um-dia-inteiro-no-ibirapuera',
    placeSlug: 'parque-ibirapuera',
    title: 'Um dia inteiro no Ibirapuera sem gastar quase nada',
    subtitle: 'Do MAM à marquise, provando que dá pra ter um domingo cheio em São Paulo de graça.',
    date: '2026-07-27',
    durationMinutes: 300,
    transport: [
      { mode: 'metro', detail: 'Linha Verde → AACD-Servidor' },
      { mode: 'a-pe', detail: 'Portão 10, ~15 min' },
    ],
    expenses: [
      { label: 'Metrô', category: 'transporte', amount: 9.6 },
      { label: 'Água de coco', category: 'alimentacao', amount: 8 },
    ],
    rating: {
      overall: 5,
      experience: 5,
      costBenefit: 5,
      infrastructure: 4,
      photography: 4,
      wouldReturn: 'com-certeza',
    },
    photos: [demoPhoto('ibira-1', 'Marquise curva do Ibirapuera', 140, 0, 'h')],
    article: [
      {
        type: 'paragraph',
        text: 'O plano era simples: chegar cedo, andar muito, gastar pouco. O Ibirapuera entrega exatamente isso. A marquise de Niemeyer costura o parque inteiro e te leva de museu em museu sem pegar sol.',
      },
      {
        type: 'info',
        title: 'Vale saber',
        text: 'O parque é gratuito e abre das 5h à meia-noite. Vários museus dentro têm dias de entrada franca.',
      },
      { type: 'relatedPlaces', placeSlugs: ['museu-do-ipiranga'] },
    ],
    categories: ['parques', 'passeios-gratuitos', 'arquitetura'],
    tags: ['gratis', 'ao-ar-livre', 'niemeyer'],
    status: 'publicado',
    publishedAt: '2026-07-28T09:00:00-03:00',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'e-0039',
    number: 39,
    slug: 'o-por-do-sol-do-farol-santander',
    placeSlug: 'farol-santander',
    title: 'O pôr do sol do Farol Santander',
    subtitle: 'Subi no antigo Banespa pra ver o centro acender.',
    date: '2026-07-19',
    durationMinutes: 90,
    transport: [{ mode: 'metro', detail: 'Linha Azul → São Bento' }],
    expenses: [
      { label: 'Entrada (mirante)', category: 'entrada', amount: 30 },
      { label: 'Metrô', category: 'transporte', amount: 9.6 },
    ],
    rating: {
      overall: 4,
      experience: 5,
      costBenefit: 4,
      infrastructure: 4,
      photography: 5,
      wouldReturn: 'com-certeza',
    },
    photos: [demoPhoto('farol-1', 'Skyline de São Paulo do mirante', 190, 0, 'h')],
    article: [
      {
        type: 'paragraph',
        text: 'A dica de ouro é o horário: chegue uns 40 minutos antes do pôr do sol. Você vê a cidade de dia, o céu virar laranja e depois o mar de prédios acender tudo de uma vez. Vale cada real.',
      },
      {
        type: 'tip',
        title: 'Minha dica',
        text: 'O vento no topo é forte no inverno. Leva um casaco, mesmo que embaixo esteja calor.',
      },
    ],
    categories: ['mirantes', 'arquitetura', 'cultura'],
    tags: ['mirante', 'vista', 'centro'],
    status: 'publicado',
    publishedAt: '2026-07-20T20:00:00-03:00',
    createdAt: now,
    updatedAt: now,
  },
];

export const explorationBySlug = new Map(explorations.map((e) => [e.slug, e]));

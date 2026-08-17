import type { Neighborhood } from '../types/index';

/** Bairros da capital (seção 15/16). Descrições autorais, dados demo. */
export const neighborhoods: Neighborhood[] = [
  {
    id: 'n-bela-vista',
    slug: 'bela-vista',
    name: 'Bela Vista',
    region: 'centro',
    description:
      'A Bela Vista, ou Bexiga, é ladeira, cantina e história italiana. Do MASP flutuando na Paulista às ruas que descem pro centro, é um bairro que muda de assunto a cada quarteirão.',
    center: { lat: -23.5613, lng: -46.6565 },
  },
  {
    id: 'n-luz',
    slug: 'luz',
    name: 'Luz',
    region: 'centro',
    description:
      'A Luz guarda a São Paulo do café e da ferrovia. Estação, parque, pinacoteca e a antiga hospedaria dos imigrantes num raio de poucos quarteirões — concentração rara de memória urbana.',
    center: { lat: -23.5347, lng: -46.6355 },
  },
  {
    id: 'n-liberdade',
    slug: 'liberdade',
    name: 'Liberdade',
    region: 'centro',
    description:
      'Lampiões, arcos e o maior bairro oriental fora do Japão. A Liberdade se come, se cheira e se anda devagar, principalmente na feira de domingo.',
    center: { lat: -23.5588, lng: -46.6353 },
  },
  {
    id: 'n-republica',
    slug: 'republica',
    name: 'República',
    region: 'centro',
    description:
      'República é o centro pulsando: edifícios modernistas, o Minhocão que vira parque no domingo e uma densidade que só a São Paulo de verdade tem.',
    center: { lat: -23.5439, lng: -46.6419 },
  },
  {
    id: 'n-se',
    slug: 'se',
    name: 'Sé',
    region: 'centro',
    description:
      'O marco zero. Da Catedral ao Pátio do Colégio, a Sé é onde a cidade começou — e onde ela ainda decide muita coisa.',
    center: { lat: -23.5505, lng: -46.6333 },
  },
  {
    id: 'n-ipiranga',
    slug: 'ipiranga',
    name: 'Ipiranga',
    region: 'zona-sul',
    description:
      'O Ipiranga do "grito" e do Museu do Ipiranga reformado. Bairro de parque, memória e uma São Paulo mais respirável.',
    center: { lat: -23.5859, lng: -46.6098 },
  },
  {
    id: 'n-vila-mariana',
    slug: 'vila-mariana',
    name: 'Vila Mariana',
    region: 'zona-sul',
    description:
      'Residencial, arborizada e cheia de cultura discreta — do MIS ao Parque do Ibirapuera logo ali. Uma Zona Sul que anda a pé.',
    center: { lat: -23.5893, lng: -46.6349 },
  },
  {
    id: 'n-pinheiros',
    slug: 'pinheiros',
    name: 'Pinheiros',
    region: 'zona-oeste',
    description:
      'Pinheiros virou destino: bar, feira, galeria e restaurante premiado. Mas ainda tem a esquina antiga resistindo entre um prédio novo e outro.',
    center: { lat: -23.5666, lng: -46.7018 },
  },
  {
    id: 'n-vila-madalena',
    slug: 'vila-madalena',
    name: 'Vila Madalena',
    region: 'zona-oeste',
    description:
      'Ladeiras grafitadas, o Beco do Batman e uma boemia que insiste. A Vila é o retrato da São Paulo que se pinta nas paredes.',
    center: { lat: -23.5546, lng: -46.6912 },
  },
  {
    id: 'n-santana',
    slug: 'santana',
    name: 'Santana',
    region: 'zona-norte',
    description:
      'A porta da Zona Norte: Parque da Juventude sobre a antiga Casa de Detenção, Horto Florestal ao fundo e uma vida de bairro que o centro perdeu.',
    center: { lat: -23.5045, lng: -46.6255 },
  },
];

export const neighborhoodBySlug = new Map(neighborhoods.map((n) => [n.slug, n]));

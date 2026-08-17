/**
 * Cadastra lugares direto no SEU banco (Turso, ou arquivo local se não houver conexão).
 * Lê as credenciais de .data/connection.json (salvas pelo painel) ou das variáveis
 * de ambiente. Idempotente: se o slug já existe, pula. Rode com:
 *
 *   npm run seed:places
 */
import { createClient } from '@libsql/client';
import { readFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', '.data');

function slugify(input) {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function connection() {
  if (process.env.TURSO_DATABASE_URL) {
    return { url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN };
  }
  // conexão do painel (nova) ou config antiga (legado) — ambas guardam tursoUrl/tursoToken
  for (const file of ['connection.json', 'config.json']) {
    try {
      const c = JSON.parse(readFileSync(join(dataDir, file), 'utf8'));
      if (c.tursoUrl) return { url: c.tursoUrl, authToken: c.tursoToken };
    } catch {}
  }
  try { mkdirSync(dataDir, { recursive: true }); } catch {}
  return { url: `file:${join(dataDir, 'local.db')}` };
}

const now = new Date().toISOString();

// name, short, hood (nome do bairro), region, lat, lng, cats[], station{name,type,min}, free, priceMax, minutes, tags[]
const SPECS = [
  { name: 'Museu do Ipiranga', short: 'O Museu Paulista, no Parque da Independência — palácio, jardins à francesa e a memória da independência.', hood: 'Ipiranga', region: 'zona-sul', lat: -23.58516, lng: -46.60918, cats: ['museus', 'historia', 'arquitetura'], station: { name: 'Alto do Ipiranga', type: 'metro', min: 20 }, free: false, priceMax: 30, minutes: 150, tags: ['historia', 'independencia', 'jardins'] },
  { name: 'Museu de Zoologia da USP', short: 'Um dos maiores acervos zoológicos da América Latina, na divisa do Ipiranga com a Água Funda.', hood: 'Ipiranga', region: 'zona-sul', lat: -23.58937, lng: -46.61639, cats: ['museus', 'historia'], station: { name: 'Alto do Ipiranga', type: 'metro', min: 15 }, free: false, priceMax: 10, minutes: 120, tags: ['ciencia', 'familia'] },
  { name: 'Museu Histórico da Imigração Japonesa', short: 'A história da imigração japonesa no Brasil, no coração da Liberdade.', hood: 'Liberdade', region: 'centro', lat: -23.55779, lng: -46.63447, cats: ['museus', 'cultura', 'historia'], station: { name: 'São Joaquim', type: 'metro', min: 6 }, free: false, priceMax: 15, minutes: 120, tags: ['liberdade', 'cultura-japonesa', 'perto-do-metro'] },
  { name: 'Parque Santo Dias', short: 'Área verde, quadras e lazer no Campo Limpo, zona sul.', hood: 'Campo Limpo', region: 'zona-sul', lat: -23.64328, lng: -46.75722, cats: ['parques', 'passeios-gratuitos'], station: { name: 'Campo Limpo', type: 'metro', min: 22 }, free: true, priceMax: 0, minutes: 90, tags: ['gratis', 'ao-ar-livre'] },
  { name: 'Igreja Matriz de Santo Amaro', short: 'A tradicional matriz no Largo Treze, marco histórico de Santo Amaro.', hood: 'Santo Amaro', region: 'zona-sul', lat: -23.65243, lng: -46.70849, cats: ['historia', 'arquitetura'], station: { name: 'Largo Treze', type: 'metro', min: 4 }, free: true, priceMax: 0, minutes: 45, tags: ['historia', 'perto-do-metro'] },
  { name: 'Casa das Rosas', short: 'Casarão histórico na Avenida Paulista, espaço de poesia e literatura, com jardim.', hood: 'Paulista', region: 'centro', lat: -23.57206, lng: -46.64110, cats: ['cultura', 'historia', 'arquitetura'], station: { name: 'Brigadeiro', type: 'metro', min: 3 }, free: true, priceMax: 0, minutes: 75, tags: ['gratis', 'paulista', 'literatura', 'perto-do-metro'] },
  { name: 'Rua Oscar Freire', short: 'A rua mais famosa dos Jardins — arquitetura, vitrines e cafés.', hood: 'Oscar Freire', region: 'zona-oeste', lat: -23.56289, lng: -46.66936, cats: ['lugares-curiosos', 'arquitetura', 'cafes'], station: { name: 'Oscar Freire', type: 'metro', min: 2 }, free: true, priceMax: 0, minutes: 90, tags: ['compras', 'jardins', 'perto-do-metro'] },
  { name: 'Edifício Copan', short: 'A onda de Niemeyer na República — um dos edifícios mais icônicos de São Paulo.', hood: 'República', region: 'centro', lat: -23.54622, lng: -46.64365, cats: ['arquitetura', 'historia'], station: { name: 'República', type: 'metro', min: 5 }, free: true, priceMax: 0, minutes: 40, tags: ['niemeyer', 'centro', 'arquitetura', 'perto-do-metro'] },

  // ---- Cadastro em massa: pontos icônicos por toda a cidade ----
  // Centro
  { name: 'Theatro Municipal', short: 'A joia da belle époque paulistana, palco de ópera e concertos desde 1911.', hood: 'República', region: 'centro', lat: -23.5454, lng: -46.6386, cats: ['teatros', 'historia', 'arquitetura'], station: { name: 'Anhangabaú', type: 'metro', min: 3 }, free: false, priceMax: 40, minutes: 90, tags: ['centro', 'perto-do-metro', 'arquitetura'] },
  { name: 'Sala São Paulo', short: 'A casa da Osesp, na antiga estação Júlio Prestes — acústica de tirar o fôlego.', hood: 'Luz', region: 'centro', lat: -23.5344, lng: -46.6402, cats: ['teatros', 'cultura', 'arquitetura'], station: { name: 'Luz', type: 'metro', min: 6 }, free: false, priceMax: 90, minutes: 120, tags: ['musica', 'luz', 'perto-do-metro'] },
  { name: 'Mosteiro de São Bento', short: 'Mosteiro beneditino do centro velho, com canto gregoriano e pães famosos.', hood: 'Sé', region: 'centro', lat: -23.5449, lng: -46.6335, cats: ['historia', 'arquitetura', 'passeios-gratuitos'], station: { name: 'São Bento', type: 'metro', min: 1 }, free: true, priceMax: 0, minutes: 60, tags: ['gratis', 'centro', 'perto-do-metro'] },
  { name: 'Catedral da Sé', short: 'A catedral neogótica no marco zero da cidade, com sua cripta monumental.', hood: 'Sé', region: 'centro', lat: -23.5503, lng: -46.6339, cats: ['historia', 'arquitetura', 'passeios-gratuitos'], station: { name: 'Sé', type: 'metro', min: 2 }, free: true, priceMax: 0, minutes: 50, tags: ['gratis', 'centro', 'perto-do-metro'] },
  { name: 'Pátio do Colégio', short: 'Onde São Paulo nasceu, em 1554 — igreja, museu e um respiro no centro.', hood: 'Sé', region: 'centro', lat: -23.5479, lng: -46.6339, cats: ['historia', 'museus'], station: { name: 'Sé', type: 'metro', min: 6 }, free: false, priceMax: 12, minutes: 60, tags: ['historia', 'centro', 'perto-do-metro'] },
  { name: 'Biblioteca Mário de Andrade', short: 'A segunda maior biblioteca pública do país, num prédio art déco na Consolação.', hood: 'República', region: 'centro', lat: -23.5461, lng: -46.6428, cats: ['bibliotecas', 'historia', 'passeios-gratuitos'], station: { name: 'República', type: 'metro', min: 5 }, free: true, priceMax: 0, minutes: 75, tags: ['gratis', 'leitura', 'perto-do-metro'] },
  { name: 'Museu de Arte Sacra', short: 'Acervo sacro riquíssimo no antigo Mosteiro da Luz, na Av. Tiradentes.', hood: 'Luz', region: 'centro', lat: -23.5241, lng: -46.6350, cats: ['museus', 'historia', 'arquitetura'], station: { name: 'Tiradentes', type: 'metro', min: 3 }, free: false, priceMax: 12, minutes: 90, tags: ['luz', 'perto-do-metro'] },
  { name: 'Galeria do Rock', short: 'O templo da cultura alternativa paulistana — discos, tatuagem e streetwear.', hood: 'República', region: 'centro', lat: -23.5439, lng: -46.6410, cats: ['lugares-curiosos', 'cultura'], station: { name: 'República', type: 'metro', min: 4 }, free: true, priceMax: 0, minutes: 60, tags: ['centro', 'musica', 'perto-do-metro'] },
  { name: 'Sesc 24 de Maio', short: 'O Sesc vertical de Paulo Mendes da Rocha, com piscina e mirante no topo.', hood: 'República', region: 'centro', lat: -23.5455, lng: -46.6424, cats: ['cultura', 'arquitetura', 'mirantes', 'passeios-gratuitos'], station: { name: 'República', type: 'metro', min: 4 }, free: true, priceMax: 0, minutes: 90, tags: ['gratis', 'arquitetura', 'perto-do-metro'] },
  { name: 'Parque Trianon', short: 'Mata atlântica no meio da Paulista, em frente ao MASP.', hood: 'Bela Vista', region: 'centro', lat: -23.5615, lng: -46.6520, cats: ['parques', 'passeios-gratuitos'], station: { name: 'Trianon-MASP', type: 'metro', min: 2 }, free: true, priceMax: 0, minutes: 60, tags: ['gratis', 'paulista', 'perto-do-metro'] },

  // Zona Oeste
  { name: 'Instituto Tomie Ohtake', short: 'Centro cultural e de arte contemporânea em Pinheiros, com fachada marcante.', hood: 'Pinheiros', region: 'zona-oeste', lat: -23.5746, lng: -46.6935, cats: ['museus', 'arquitetura', 'exposicoes'], station: { name: 'Faria Lima', type: 'metro', min: 6 }, free: true, priceMax: 0, minutes: 90, tags: ['arte', 'gratis', 'perto-do-metro'] },
  { name: 'Instituto Butantan', short: 'Ciência, serpentes e história da saúde pública num campus arborizado.', hood: 'Butantã', region: 'zona-oeste', lat: -23.5686, lng: -46.7300, cats: ['museus', 'historia', 'parques'], station: { name: 'Butantã', type: 'metro', min: 25 }, free: false, priceMax: 20, minutes: 150, tags: ['ciencia', 'familia'] },
  { name: 'Parque Villa-Lobos', short: 'Grande parque da Zona Oeste, com ciclovia, gramados e a Biblioteca de SP.', hood: 'Alto de Pinheiros', region: 'zona-oeste', lat: -23.5466, lng: -46.7229, cats: ['parques', 'passeios-gratuitos'], station: { name: 'Villa-Lobos-Jaguaré', type: 'trem', min: 8 }, free: true, priceMax: 0, minutes: 180, tags: ['gratis', 'ao-ar-livre', 'ciclovia'] },
  { name: 'Praça Benedito Calixto', short: 'A feira de antiguidades e a roda de choro aos sábados, em Pinheiros.', hood: 'Pinheiros', region: 'zona-oeste', lat: -23.5658, lng: -46.6861, cats: ['lugares-curiosos', 'mercados', 'gastronomia'], station: { name: 'Fradique Coutinho', type: 'metro', min: 7 }, free: true, priceMax: 0, minutes: 120, tags: ['feira', 'sabado', 'perto-do-metro'] },
  { name: 'Memorial da América Latina', short: 'O conjunto de Niemeyer na Barra Funda, com a mão de concreto icônica.', hood: 'Barra Funda', region: 'zona-oeste', lat: -23.5270, lng: -46.6660, cats: ['arquitetura', 'cultura', 'historia', 'passeios-gratuitos'], station: { name: 'Barra Funda', type: 'metro', min: 5 }, free: true, priceMax: 0, minutes: 120, tags: ['niemeyer', 'gratis', 'perto-do-metro'] },

  // Zona Sul
  { name: 'Museu Afro Brasil', short: 'Acervo dedicado à história e cultura afro-brasileira, no Ibirapuera.', hood: 'Vila Mariana', region: 'zona-sul', lat: -23.5852, lng: -46.6575, cats: ['museus', 'historia', 'cultura'], station: { name: 'AACD-Servidor', type: 'metro', min: 16 }, free: false, priceMax: 12, minutes: 150, tags: ['ibirapuera', 'cultura'] },
  { name: 'Planetário do Ibirapuera', short: 'Sessões de céu estrelado no primeiro planetário do hemisfério sul.', hood: 'Vila Mariana', region: 'zona-sul', lat: -23.5906, lng: -46.6555, cats: ['museus', 'cultura'], station: { name: 'AACD-Servidor', type: 'metro', min: 18 }, free: false, priceMax: 18, minutes: 90, tags: ['ibirapuera', 'familia'] },
  { name: 'MIS — Museu da Imagem e do Som', short: 'Exposições imersivas de fotografia, cinema e música no Jardim Europa.', hood: 'Jardim Paulista', region: 'zona-oeste', lat: -23.5762, lng: -46.6717, cats: ['museus', 'cultura', 'exposicoes'], station: { name: 'Oscar Freire', type: 'metro', min: 20 }, free: false, priceMax: 20, minutes: 120, tags: ['exposicao', 'fotografia'] },
  { name: 'Jardim Botânico de São Paulo', short: 'Estufas, trilhas e nascente do Ipiranga na Água Funda.', hood: 'Vila Mariana', region: 'zona-sul', lat: -23.6395, lng: -46.6210, cats: ['parques', 'passeios-gratuitos'], station: { name: 'São Judas', type: 'metro', min: 35 }, free: false, priceMax: 15, minutes: 180, tags: ['natureza', 'trilha'] },
  { name: 'Zoológico de São Paulo', short: 'O maior zoológico do país, cercado pela mata da Cantareira do sul.', hood: 'Vila Mariana', region: 'zona-sul', lat: -23.6490, lng: -46.6195, cats: ['parques', 'lugares-curiosos'], station: null, free: false, priceMax: 55, minutes: 240, tags: ['familia', 'natureza'] },

  // Zona Norte
  { name: 'Parque da Juventude', short: 'Parque sobre o antigo Carandiru, com a Biblioteca de São Paulo.', hood: 'Santana', region: 'zona-norte', lat: -23.5030, lng: -46.6255, cats: ['parques', 'passeios-gratuitos', 'bibliotecas'], station: { name: 'Carandiru', type: 'metro', min: 5 }, free: true, priceMax: 0, minutes: 120, tags: ['gratis', 'ao-ar-livre', 'perto-do-metro'] },
  { name: 'Horto Florestal', short: 'Parque Estadual Alberto Löfgren, aos pés da Serra da Cantareira.', hood: 'Tremembé', region: 'zona-norte', lat: -23.4560, lng: -46.6330, cats: ['parques', 'passeios-gratuitos'], station: null, free: true, priceMax: 0, minutes: 180, tags: ['gratis', 'trilha', 'natureza'] },

  // Zona Leste
  { name: 'Parque do Carmo', short: 'Um dos maiores parques da cidade, com bosque de cerejeiras em Itaquera.', hood: 'Itaquera', region: 'zona-leste', lat: -23.5808, lng: -46.4720, cats: ['parques', 'passeios-gratuitos'], station: null, free: true, priceMax: 0, minutes: 180, tags: ['gratis', 'cerejeiras', 'ao-ar-livre'] },
  { name: 'Sesc Belenzinho', short: 'Centro cultural com shows, teatro e piscina no coração da Zona Leste.', hood: 'Belém', region: 'zona-leste', lat: -23.5388, lng: -46.5772, cats: ['cultura', 'teatros'], station: { name: 'Belém', type: 'metro', min: 12 }, free: true, priceMax: 0, minutes: 120, tags: ['cultura', 'shows'] },
];

function buildPlace(s) {
  const slug = slugify(s.name);
  return {
    id: `p-${slug}`,
    slug,
    name: s.name,
    shortDescription: s.short,
    description: s.short,
    address: { street: '', zip: '' },
    neighborhood: slugify(s.hood),
    neighborhoodName: s.hood,
    region: s.region,
    geo: { lat: s.lat, lng: s.lng },
    nearestStations: s.station && s.station.name ? [{ type: s.station.type ?? 'metro', name: s.station.name, walkingMinutes: s.station.min ?? 0 }] : [],
    categories: s.cats,
    tags: s.tags,
    price: { min: 0, max: s.free ? 0 : s.priceMax, free: s.free },
    hours: undefined,
    accessibility: { wheelchair: false },
    status: 'ativo',
    coverImage: { id: `img-${slug}`, url: '', demo: true, width: 1600, height: 1067, alt: s.name, order: 0 },
    favorite: false,
    wantToReturn: false,
    rating: 4,
    recommendedMinutes: s.minutes,
    createdAt: now,
    updatedAt: now,
  };
}

const DDL = `CREATE TABLE IF NOT EXISTS places (
  slug TEXT PRIMARY KEY, name TEXT NOT NULL, short_desc TEXT NOT NULL DEFAULT '',
  neighborhood TEXT NOT NULL, region TEXT NOT NULL, lat REAL NOT NULL, lng REAL NOT NULL,
  is_free INTEGER NOT NULL DEFAULT 0, price_max REAL NOT NULL DEFAULT 0,
  favorite INTEGER NOT NULL DEFAULT 0, want_to_return INTEGER NOT NULL DEFAULT 0,
  recommended_minutes INTEGER, status TEXT NOT NULL DEFAULT 'ativo',
  categories TEXT NOT NULL DEFAULT '[]', data TEXT NOT NULL,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL
)`;

async function main() {
  const conn = connection();
  const db = createClient(conn.authToken ? { url: conn.url, authToken: conn.authToken } : { url: conn.url });
  const onTurso = conn.url.startsWith('libsql') || conn.url.startsWith('http');
  console.log(`Banco: ${onTurso ? 'Turso (' + conn.url + ')' : 'arquivo local'}`);
  await db.execute(DDL);

  let added = 0, skipped = 0;
  for (const spec of SPECS) {
    const p = buildPlace(spec);
    const exists = await db.execute({ sql: 'SELECT 1 FROM places WHERE slug = ?', args: [p.slug] });
    if (exists.rows.length) { console.log(`= já existe: ${p.name} (${p.slug})`); skipped++; continue; }
    await db.execute({
      sql: `INSERT INTO places (slug,name,short_desc,neighborhood,region,lat,lng,is_free,price_max,favorite,want_to_return,recommended_minutes,status,categories,data,created_at,updated_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [p.slug, p.name, p.shortDescription, p.neighborhood, p.region, p.geo.lat, p.geo.lng, p.price.free ? 1 : 0, p.price.max, 0, 0, p.recommendedMinutes, p.status, JSON.stringify(p.categories), JSON.stringify(p), p.createdAt, p.updatedAt],
    });
    console.log(`+ cadastrado: ${p.name} — bairro ${p.neighborhoodName} — ${p.geo.lat},${p.geo.lng} — ★4`);
    added++;
  }
  console.log(`\nPronto: ${added} cadastrados, ${skipped} já existiam.`);
}

main().catch((e) => { console.error('Falha:', e.message); process.exit(1); });

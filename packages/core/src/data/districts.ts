/**
 * Os 96 distritos oficiais da cidade de São Paulo (fonte: IBGE, município 3550308).
 * Usado como fallback quando a API do IBGE não estiver acessível, e para
 * autocompletar o bairro no cadastro. A API busca a versão sempre atual.
 */
export const SP_DISTRICTS: string[] = [
  'Água Rasa', 'Alto de Pinheiros', 'Anhanguera', 'Aricanduva', 'Artur Alvim',
  'Barra Funda', 'Bela Vista', 'Belém', 'Bom Retiro', 'Brás', 'Brasilândia',
  'Butantã', 'Cachoeirinha', 'Cambuci', 'Campo Belo', 'Campo Grande', 'Campo Limpo',
  'Cangaíba', 'Capão Redondo', 'Carrão', 'Casa Verde', 'Cidade Ademar', 'Cidade Dutra',
  'Cidade Líder', 'Cidade Tiradentes', 'Consolação', 'Cursino', 'Ermelino Matarazzo',
  'Freguesia do Ó', 'Grajaú', 'Guaianases', 'Iguatemi', 'Ipiranga', 'Itaim Bibi',
  'Itaim Paulista', 'Itaquera', 'Jabaquara', 'Jaçanã', 'Jaguara', 'Jaguaré', 'Jaraguá',
  'Jardim Ângela', 'Jardim Helena', 'Jardim Paulista', 'Jardim São Luís', 'José Bonifácio',
  'Lajeado', 'Lapa', 'Liberdade', 'Limão', 'Mandaqui', 'Marsilac', 'Moema', 'Mooca',
  'Morumbi', 'Parelheiros', 'Pari', 'Parque do Carmo', 'Pedreira', 'Penha', 'Perdizes',
  'Perus', 'Pinheiros', 'Pirituba', 'Ponte Rasa', 'Raposo Tavares', 'República',
  'Rio Pequeno', 'Sacomã', 'Santa Cecília', 'Santana', 'Santo Amaro', 'São Domingos',
  'São Lucas', 'São Mateus', 'São Miguel Paulista', 'São Rafael', 'Sapopemba', 'Saúde',
  'Sé', 'Socorro', 'Tatuapé', 'Tremembé', 'Tucuruvi', 'Vila Andrade', 'Vila Curuçá',
  'Vila Formosa', 'Vila Guilherme', 'Vila Jacuí', 'Vila Leopoldina', 'Vila Maria',
  'Vila Mariana', 'Vila Matilde', 'Vila Medeiros', 'Vila Prudente', 'Vila Sônia',
];

/** Zona (região) provável de cada distrito — para sugerir a região no cadastro. */
export const DISTRICT_REGION: Record<string, string> = {
  // Centro
  'Bela Vista': 'centro', 'Bom Retiro': 'centro', 'Cambuci': 'centro', 'Consolação': 'centro',
  'Liberdade': 'centro', 'República': 'centro', 'Santa Cecília': 'centro', 'Sé': 'centro',
  'Brás': 'centro', 'Pari': 'centro',
  // Zona Norte
  'Anhanguera': 'zona-norte', 'Brasilândia': 'zona-norte', 'Cachoeirinha': 'zona-norte',
  'Casa Verde': 'zona-norte', 'Freguesia do Ó': 'zona-norte', 'Jaçanã': 'zona-norte',
  'Jaraguá': 'zona-norte', 'Limão': 'zona-norte', 'Mandaqui': 'zona-norte', 'Perus': 'zona-norte',
  'Pirituba': 'zona-norte', 'Santana': 'zona-norte', 'São Domingos': 'zona-norte',
  'Tremembé': 'zona-norte', 'Tucuruvi': 'zona-norte', 'Vila Maria': 'zona-norte',
  'Vila Guilherme': 'zona-norte', 'Vila Medeiros': 'zona-norte', 'Jaguara': 'zona-norte',
  // Zona Sul
  'Campo Belo': 'zona-sul', 'Campo Grande': 'zona-sul', 'Campo Limpo': 'zona-sul',
  'Capão Redondo': 'zona-sul', 'Cidade Ademar': 'zona-sul', 'Cidade Dutra': 'zona-sul',
  'Cursino': 'zona-sul', 'Grajaú': 'zona-sul', 'Ipiranga': 'zona-sul', 'Jabaquara': 'zona-sul',
  'Jardim Ângela': 'zona-sul', 'Jardim São Luís': 'zona-sul', 'Marsilac': 'zona-sul',
  'Moema': 'zona-sul', 'Morumbi': 'zona-sul', 'Parelheiros': 'zona-sul', 'Pedreira': 'zona-sul',
  'Sacomã': 'zona-sul', 'Santo Amaro': 'zona-sul', 'Saúde': 'zona-sul', 'Socorro': 'zona-sul',
  'Vila Andrade': 'zona-sul', 'Vila Mariana': 'zona-sul', 'Cidade Líder': 'zona-sul',
  // Zona Leste
  'Água Rasa': 'zona-leste', 'Aricanduva': 'zona-leste', 'Artur Alvim': 'zona-leste',
  'Belém': 'zona-leste', 'Cangaíba': 'zona-leste', 'Carrão': 'zona-leste',
  'Cidade Tiradentes': 'zona-leste', 'Ermelino Matarazzo': 'zona-leste', 'Guaianases': 'zona-leste',
  'Iguatemi': 'zona-leste', 'Itaim Paulista': 'zona-leste', 'Itaquera': 'zona-leste',
  'Jardim Helena': 'zona-leste', 'José Bonifácio': 'zona-leste', 'Lajeado': 'zona-leste',
  'Mooca': 'zona-leste', 'Parque do Carmo': 'zona-leste', 'Penha': 'zona-leste',
  'Ponte Rasa': 'zona-leste', 'São Lucas': 'zona-leste', 'São Mateus': 'zona-leste',
  'São Miguel Paulista': 'zona-leste', 'São Rafael': 'zona-leste', 'Sapopemba': 'zona-leste',
  'Tatuapé': 'zona-leste', 'Vila Curuçá': 'zona-leste', 'Vila Formosa': 'zona-leste',
  'Vila Jacuí': 'zona-leste', 'Vila Matilde': 'zona-leste', 'Vila Prudente': 'zona-leste',
  // Zona Oeste
  'Alto de Pinheiros': 'zona-oeste', 'Barra Funda': 'zona-oeste', 'Butantã': 'zona-oeste',
  'Itaim Bibi': 'zona-oeste', 'Jaguaré': 'zona-oeste', 'Jardim Paulista': 'zona-oeste',
  'Lapa': 'zona-oeste', 'Perdizes': 'zona-oeste', 'Pinheiros': 'zona-oeste',
  'Raposo Tavares': 'zona-oeste', 'Rio Pequeno': 'zona-oeste', 'Vila Leopoldina': 'zona-oeste',
  'Vila Sônia': 'zona-oeste',
};

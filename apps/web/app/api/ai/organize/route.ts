import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { ArticleBlock, PhotoRef } from '@turistando/core';
import { SESSION_COOKIE, verifySession } from '@/lib/auth';
import { getSetting } from '@/lib/repo';
import { fallbackArticle } from '@/lib/explorationInput';

interface Body {
  placeName?: string;
  neighborhood?: string;
  category?: string;
  date?: string;
  rawText?: string;
  photos?: PhotoRef[];
}

const PROMPT = (b: Body) => {
  const nFotos = (b.photos ?? []).length;
  return `Você é editor(a) de um caderno de viagem autoral e elegante — pense nas grandes reportagens de jornal e nas colunas de crônica urbana. Recebe o relato bruto de uma visita e o transforma num artigo bonito, envolvente e bem ritmado, em português do Brasil, na primeira pessoa e preservando a voz e as opiniões do autor.

CONTEXTO
Lugar: ${b.placeName ?? ''}${b.category ? ` (tipo: ${b.category})` : ''}
Bairro: ${b.neighborhood ?? ''}
Data da visita: ${b.date ?? ''}
O autor subiu ${nFotos} foto(s). O site posiciona as fotos sozinho no texto — você NÃO cria blocos de imagem, mas VAI escrever as legendas delas (ver TAREFA 2).

RELATO BRUTO DO AUTOR:
"""
${b.rawText ?? ''}
"""

TAREFA 1 — O ARTIGO
Reescreva com clareza, ritmo e sensibilidade, SEM inventar fatos (só reorganize, corrija ortografia/gramática e enriqueça a linguagem do que o autor disse). Produza:
1) um TÍTULO curto e marcante (máx. ~70 caracteres), evocativo, específico do lugar, sem clichê;
2) um SUBTÍTULO (linha fina) de uma frase que dê vontade de ler;
3) o corpo em BLOCOS de TEXTO.

REGRAS DE ESCRITA
- Abertura: um parágrafo-lide que coloca o leitor DENTRO da cena (um detalhe concreto, um som, uma luz) — nunca comece com "Visitei" nem "Fui".
- Concretude e sentidos: prefira detalhes específicos a adjetivos vagos. PROIBIDO clichê ("cidade que nunca dorme", "pulsante", "de tirar o fôlego", "joia escondida", "imperdível").
- Ritmo: alterne parágrafos curtos e médios. Escreva de ${Math.max(4, Math.min(10, Math.round((b.rawText ?? '').length / 220) || 5))} a 10 parágrafos, proporcional ao relato.
- Use de 2 a 4 subtítulos (heading level 2) temáticos, que soem como manchetes pequenas.
- Inclua exatamente 1 "quote" — uma frase de destaque, forte, tirada ou destilada do relato.
- Inclua 1 "tip" ("Minha dica", prática e específica: melhor horário, o que não perder, como chegar) e, se fizer sentido, 1 "info" ("Vale saber": preço, funcionamento, curiosidade verdadeira do relato).
- Feche com um parágrafo curto de arremate — uma impressão que fica.
- NÃO gere blocos de imagem nem galeria.

TAREFA 2 — AS LEGENDAS
Gere um array "captions" com EXATAMENTE ${nFotos} legenda(s), uma por foto, na ordem.
- Cada legenda: curta (3 a 9 palavras), em português, sem ponto final, sem numerar, sem aspas.
- Específicas ao tipo do lugar (${b.category || b.placeName || 'o lugar'}) e coerentes com o relato — variando o ângulo entre: fachada/chegada, detalhe/arquitetura, acervo ou obra, ambiente/atmosfera, vista/paisagem, público/movimento, um momento pessoal.
- Nada de repetir a mesma legenda. Se não houver fotos (${nFotos} = 0), devolva [].

FORMATO DE SAÍDA — responda SOMENTE com JSON válido, sem markdown, nesta forma exata:
{
  "title": "...",
  "subtitle": "...",
  "blocks": [
    {"type":"paragraph","text":"..."},
    {"type":"heading","level":2,"text":"..."},
    {"type":"quote","text":"..."},
    {"type":"tip","title":"Minha dica","text":"..."},
    {"type":"info","title":"Vale saber","text":"..."}
  ],
  "captions": ["...", "..."]
}`;
};

function resolveBlocks(rawBlocks: unknown[]): ArticleBlock[] {
  const out: ArticleBlock[] = [];
  for (const r of Array.isArray(rawBlocks) ? rawBlocks : []) {
    if (!r || typeof r !== 'object') continue;
    const b = r as Record<string, unknown>;
    switch (String(b.type)) {
      case 'paragraph': if (b.text) out.push({ type: 'paragraph', text: String(b.text) }); break;
      case 'heading': out.push({ type: 'heading', level: b.level === 3 ? 3 : 2, text: String(b.text ?? '') }); break;
      case 'quote': if (b.text) out.push({ type: 'quote', text: String(b.text) }); break;
      case 'tip': if (b.text) out.push({ type: 'tip', title: b.title ? String(b.title) : 'Minha dica', text: String(b.text) }); break;
      case 'info': if (b.text) out.push({ type: 'info', title: b.title ? String(b.title) : 'Vale saber', text: String(b.text) }); break;
      case 'warning': if (b.text) out.push({ type: 'warning', title: b.title ? String(b.title) : 'Atenção', text: String(b.text) }); break;
      default: break;
    }
  }
  return out;
}

function cleanCaption(s: unknown): string {
  return String(s ?? '').replace(/^["'\d.\-\s]+/, '').replace(/["']+$/, '').replace(/\.$/, '').trim().slice(0, 90);
}
function resolveCaptions(raw: unknown, n: number): string[] {
  const arr = (Array.isArray(raw) ? raw : []).map(cleanCaption).filter(Boolean);
  return Array.from({ length: n }, (_, i) => arr[i] ?? '');
}

/** Legendas locais (sem IA): variadas e adequadas ao tipo do lugar. */
function fallbackCaptions(place: string, category: string, n: number): string[] {
  const c = `${category} ${place}`.toLowerCase();
  const pick = (): string[] => {
    if (/museu|expos|arte|cultur/.test(c)) return ['A fachada que anuncia o museu', 'Primeiras salas do acervo', 'Um detalhe que me parou', 'A obra que mais me marcou', 'A luz entrando pelas janelas', 'Corredores entre as salas', 'Gente parada diante das peças', 'Um recanto mais silencioso'];
    if (/parque|jardim|praça|natur/.test(c)) return ['A entrada do parque', 'O verde se abrindo à frente', 'Uma trilha mais escondida', 'Sombra boa pra sentar', 'A água refletindo o céu', 'Gente aproveitando o dia', 'Um detalhe da paisagem', 'O fim da tarde chegando'];
    if (/mirante|farol|vista|torre|edif/.test(c)) return ['A subida até o alto', 'A cidade se abrindo lá embaixo', 'O horizonte de São Paulo', 'Detalhe da estrutura', 'A vista que valeu a espera', 'A luz mudando sobre os prédios'];
    if (/mercado|gastr|comida|restaur|bar|caf/.test(c)) return ['A entrada e o movimento', 'As bancas coloridas', 'O que eu provei por ali', 'Cheiros e cores misturados', 'Um canto pra sentar e comer', 'Gente circulando entre os corredores'];
    if (/igreja|catedral|templo|históric|patrim/.test(c)) return ['A fachada imponente', 'A nave vista de dentro', 'Detalhes do teto e das paredes', 'A luz pelos vitrais', 'Um canto de recolhimento', 'A história nas pedras'];
    return ['A chegada ao lugar', 'Primeiras impressões', 'Um detalhe que chamou atenção', 'O ambiente por dentro', 'A atmosfera do lugar', 'Um momento da visita', 'A vista daqui', 'Antes de ir embora'];
  };
  const pool = pick();
  return Array.from({ length: n }, (_, i) => pool[i % pool.length]!);
}

async function candidateModels(key: string, preferred: string): Promise<string[]> {
  const ordered: string[] = [];
  const push = (n?: string) => { if (n && !ordered.includes(n)) ordered.push(n); };
  push(preferred);
  let listed: string[] = [];
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`);
    if (r.ok) {
      const j = (await r.json()) as { models?: { name: string; supportedGenerationMethods?: string[] }[] };
      listed = (j.models ?? [])
        .filter((m) => (m.supportedGenerationMethods ?? []).includes('generateContent'))
        .map((m) => m.name.replace(/^models\//, ''));
    }
  } catch { /* segue com os hardcoded */ }
  const prefs: RegExp[] = [
    /^gemini-2\.0-flash$/, /^gemini-flash-latest$/, /^gemini-2\.0-flash-001$/,
    /^gemini-2\.0-flash-lite$/, /gemini-2\.0-flash/, /flash-latest/,
    /gemini-flash/, /gemini-2\.\d.*flash/, /flash/, /gemini-2\.0-pro|pro-latest|gemini-pro|pro/,
  ];
  for (const re of prefs) for (const n of listed) if (re.test(n)) push(n);
  ['gemini-2.0-flash', 'gemini-flash-latest', 'gemini-2.0-flash-001', 'gemini-2.0-flash-lite'].forEach(push);
  return ordered.slice(0, 6);
}

async function callGemini(model: string, key: string, prompt: string): Promise<{ ok: true; text: string } | { ok: false; status: number; detail: string }> {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.78, maxOutputTokens: 8192 },
    }),
  });
  if (!res.ok) return { ok: false, status: res.status, detail: (await res.text()).slice(0, 200) };
  const json = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  return { ok: true, text: json.candidates?.[0]?.content?.parts?.[0]?.text ?? '' };
}

export async function POST(req: Request) {
  if (!(await verifySession(cookies().get(SESSION_COOKIE)?.value))) {
    return NextResponse.json({ error: { message: 'Não autenticado' } }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as Body;
  const photos = body.photos ?? [];
  const nFotos = photos.length;
  const key = await getSetting('geminiApiKey');
  const preferred = (await getSetting('geminiModel')) || '';

  const local = (message: string) =>
    NextResponse.json({
      data: {
        blocks: fallbackArticle(body.rawText ?? '', photos),
        captions: fallbackCaptions(body.placeName ?? '', body.category ?? '', nFotos),
        source: 'fallback',
        message,
      },
    });

  if (!key) return local('Sem chave do Gemini — organizei localmente e gerei legendas simples. Configure a chave em Configurações para um resultado melhor.');

  const models = await candidateModels(key, preferred);
  const prompt = PROMPT(body);
  let lastErr = '';
  for (const model of models) {
    let r;
    try {
      r = await callGemini(model, key, prompt);
    } catch (e) {
      lastErr = `${model}: ${(e as Error).message}`;
      continue;
    }
    if (!r.ok) {
      lastErr = `${model} → ${r.status}`;
      if (r.status === 404 || r.status === 400 || r.status === 403) continue;
      break;
    }
    try {
      const parsed = JSON.parse(r.text) as { title?: string; subtitle?: string; blocks?: unknown[]; captions?: unknown };
      const blocks = resolveBlocks(parsed.blocks ?? []);
      if (blocks.length === 0) { lastErr = `${model}: sem blocos`; continue; }
      let captions = resolveCaptions(parsed.captions, nFotos);
      // completa lacunas com legendas locais, se a IA devolveu menos do que o esperado
      if (nFotos && captions.some((c) => !c)) {
        const fb = fallbackCaptions(body.placeName ?? '', body.category ?? '', nFotos);
        captions = captions.map((c, i) => c || fb[i]!);
      }
      return NextResponse.json({ data: { title: parsed.title, subtitle: parsed.subtitle, blocks, captions, source: 'gemini', model } });
    } catch {
      lastErr = `${model}: JSON inválido`;
      continue;
    }
  }
  return local(`Não consegui usar o Gemini (${lastErr || 'sem modelo compatível'}). Organizei no modo local com legendas simples.`);
}

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { ArticleBlock, PhotoRef } from '@turistando/core';
import { SESSION_COOKIE, verifySession } from '@/lib/auth';
import { getSetting } from '@/lib/repo';
import { fallbackArticle } from '@/lib/explorationInput';

interface Body {
  placeName?: string;
  neighborhood?: string;
  date?: string;
  rawText?: string;
  photos?: PhotoRef[];
}

const PROMPT = (b: Body) => {
  const photos = (b.photos ?? []).map((p, i) => `Foto ${i}: ${p.alt || p.caption || 'sem descrição'}`).join('\n');
  return `Você é editor(a) de um caderno de viagem elegante, no estilo de grandes reportagens de jornal. Recebe o relato bruto de uma visita e transforma num artigo bonito, envolvente e bem estruturado, em português do Brasil, mantendo a voz do autor em primeira pessoa.

CONTEXTO
Lugar: ${b.placeName ?? ''} — ${b.neighborhood ?? ''}
Data: ${b.date ?? ''}
Fotos disponíveis (use o índice para posicioná-las):
${photos || '(nenhuma)'}

RELATO BRUTO DO AUTOR:
"""
${b.rawText ?? ''}
"""

TAREFA
Reescreva com clareza e ritmo de reportagem, SEM inventar fatos (só reorganize, corrija e enriqueça a linguagem do que o autor disse). Produza:
1) um TÍTULO curto e marcante (máx. ~70 caracteres, evocativo, sem clichê);
2) um SUBTÍTULO (linha fina) de uma frase que dê vontade de ler;
3) o corpo em BLOCOS bem distribuídos.

REGRAS DE COMPOSIÇÃO
- Abra com um parágrafo-lide forte, que situa o leitor na cena (não comece com "Visitei...").
- Use de 2 a 4 subtítulos (heading level 2) temáticos para dar respiro à leitura.
- Varie o tamanho dos parágrafos; prefira frases concretas e sensoriais.
- Inclua exatamente 1 "quote" (uma frase de destaque, tirada ou inspirada no relato).
- Inclua 1 "tip" ("Minha dica", prática e útil) e, se fizer sentido, 1 "info" ("Vale saber").
- Distribua as fotos ao longo do texto: a Foto 0 é a CAPA (já aparece no topo, NÃO use no corpo). Use as fotos de 1 em diante, cada uma UMA vez, entre parágrafos onde combinam; as que sobrarem entram numa "gallery" perto do fim.
- Feche com um parágrafo curto de arremate/reflexão.

FORMATO DE SAÍDA — responda SOMENTE com JSON válido, sem markdown, nesta forma:
{
  "title": "...",
  "subtitle": "...",
  "blocks": [
    {"type":"paragraph","text":"..."},
    {"type":"heading","level":2,"text":"..."},
    {"type":"quote","text":"..."},
    {"type":"tip","title":"Minha dica","text":"..."},
    {"type":"info","title":"Vale saber","text":"..."},
    {"type":"image","photo": <índice>},
    {"type":"gallery","photos":[<índices>]}
  ]
}`;
};

function resolveBlocks(rawBlocks: unknown[], photos: PhotoRef[]): ArticleBlock[] {
  const out: ArticleBlock[] = [];
  const at = (i: unknown) => {
    const idx = Number(i);
    return Number.isFinite(idx) ? photos[idx] : undefined;
  };
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
      case 'image': { const p = at(b.photo); if (p?.url) out.push({ type: 'image', photo: p }); break; }
      case 'gallery': {
        const ps = (Array.isArray(b.photos) ? b.photos : []).map(at).filter((p): p is PhotoRef => Boolean(p?.url));
        if (ps.length) out.push({ type: 'gallery', photos: ps });
        break;
      }
      default: break;
    }
  }
  return out;
}

/** Lista de modelos candidatos, em ordem de preferência, tentados um a um. */
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
  // fallbacks caso a listagem falhe
  ['gemini-2.0-flash', 'gemini-flash-latest', 'gemini-2.0-flash-001', 'gemini-2.0-flash-lite'].forEach(push);
  return ordered.slice(0, 6);
}

async function callGemini(model: string, key: string, prompt: string): Promise<{ ok: true; text: string } | { ok: false; status: number; detail: string }> {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.75, maxOutputTokens: 4096 },
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
  const key = await getSetting('geminiApiKey');
  const preferred = (await getSetting('geminiModel')) || '';

  const local = (message: string) =>
    NextResponse.json({ data: { blocks: fallbackArticle(body.rawText ?? '', photos), source: 'fallback', message } });

  if (!key) return local('Sem chave do Gemini — organizei localmente. Configure a chave em Configurações.');

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
      // 404/400 = modelo indisponível pra conta → tenta o próximo
      if (r.status === 404 || r.status === 400 || r.status === 403) continue;
      // outros erros (ex.: 429) → para e cai no local
      break;
    }
    try {
      const parsed = JSON.parse(r.text) as { title?: string; subtitle?: string; blocks?: unknown[] };
      const blocks = resolveBlocks(parsed.blocks ?? [], photos);
      if (blocks.length === 0) { lastErr = `${model}: sem blocos`; continue; }
      return NextResponse.json({ data: { title: parsed.title, subtitle: parsed.subtitle, blocks, source: 'gemini', model } });
    } catch {
      lastErr = `${model}: JSON inválido`;
      continue;
    }
  }
  return local(`Não consegui usar o Gemini (${lastErr || 'sem modelo compatível'}). Organizei no modo local.`);
}

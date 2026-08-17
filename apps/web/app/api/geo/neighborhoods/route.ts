import { NextResponse } from 'next/server';
import { SP_DISTRICTS, DISTRICT_REGION, slugify } from '@turistando/core';

// Lista de bairros/distritos da cidade de São Paulo.
// Fonte primária: IBGE (município 3550308). Fallback: lista embutida no core.
export const revalidate = 86400; // 1 dia

interface District {
  name: string;
  slug: string;
  region: string;
}

function fromNames(names: string[]): District[] {
  return names
    .map((name) => ({ name, slug: slugify(name), region: DISTRICT_REGION[name] ?? '' }))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

export async function GET() {
  try {
    const res = await fetch(
      'https://servicodados.ibge.gov.br/api/v1/localidades/municipios/3550308/distritos',
      { next: { revalidate: 86400 } },
    );
    if (!res.ok) throw new Error(`IBGE ${res.status}`);
    const data = (await res.json()) as { nome: string }[];
    const names = data.map((d) => d.nome).filter(Boolean);
    if (names.length === 0) throw new Error('IBGE vazio');
    return NextResponse.json({ data: fromNames(names), source: 'ibge' });
  } catch {
    return NextResponse.json({ data: fromNames(SP_DISTRICTS), source: 'fallback' });
  }
}

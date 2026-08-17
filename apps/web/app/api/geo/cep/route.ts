import { NextResponse } from 'next/server';

// Consulta CEP na ViaCEP e devolve bairro/logradouro (só cidade de São Paulo).
export async function GET(req: Request) {
  const cep = (new URL(req.url).searchParams.get('cep') ?? '').replace(/\D/g, '');
  if (cep.length !== 8) {
    return NextResponse.json({ error: { message: 'CEP inválido (8 dígitos).' } }, { status: 400 });
  }
  try {
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`, { cache: 'no-store' });
    const data = (await res.json()) as {
      erro?: boolean;
      logradouro?: string;
      bairro?: string;
      localidade?: string;
      uf?: string;
    };
    if (data.erro) return NextResponse.json({ error: { message: 'CEP não encontrado.' } }, { status: 404 });
    if (data.localidade !== 'São Paulo' || data.uf !== 'SP') {
      return NextResponse.json({ error: { message: `Este CEP é de ${data.localidade}/${data.uf}, não da capital.` } }, { status: 422 });
    }
    return NextResponse.json({
      data: { bairro: data.bairro ?? '', logradouro: data.logradouro ?? '', localidade: data.localidade, uf: data.uf },
    });
  } catch (e) {
    return NextResponse.json({ error: { message: `Falha ao consultar o CEP: ${(e as Error).message}` } }, { status: 502 });
  }
}

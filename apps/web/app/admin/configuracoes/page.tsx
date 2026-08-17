import type { Metadata } from 'next';
import { getConnection, tursoConfigured, envTurso } from '@/lib/config';
import { getSettings, getSetting } from '@/lib/repo';
import { siteConfig } from '@turistando/core';
import { UrbanLabel } from '@/components/brand';
import { TestConnection } from '@/components/feature/TestConnection';
import { HeroImageField } from '@/components/feature/HeroImageField';
import { AboutPhotoField } from '@/components/feature/AboutPhotoField';

export const metadata: Metadata = { title: 'Configurações', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function ConfiguracoesPage({ searchParams }: { searchParams: { saved?: string } }) {
  const conn = getConnection();
  const [s, geminiKey] = await Promise.all([getSettings(), getSetting('geminiApiKey')]);
  const geminiSaved = Boolean(geminiKey);
  const usingEnvTurso = envTurso();

  return (
    <div className="section container container-wide" style={{ maxWidth: '920px' }}>
      <UrbanLabel>Painel · Tudo no banco (menos a conexão)</UrbanLabel>
      <h1 className="display title-lg" style={{ marginTop: '0.6rem' }}>Configurações</h1>
      <p className="lead" style={{ marginTop: '0.75rem' }}>
        Identidade, Gemini, senha e imagens ficam <strong>no banco de dados</strong>. A única exceção é a conexão do Turso (URL + token) — ela precisa ficar num arquivo local, porque é ela que abre o banco.
      </p>
      {searchParams.saved ? <p className="mono" style={{ color: 'var(--green)', marginTop: '0.75rem' }}>✓ Salvo.</p> : null}

      {/* BANCO TURSO */}
      <Card title="Banco de dados — Turso" desc="Cole a URL e o token do seu banco e salve — a conexão passa a valer na hora. É a única config que fica fora do banco.">
        <div style={{ marginBottom: '1rem' }}>
          <span className="tag" style={{ borderColor: tursoConfigured() ? 'var(--green)' : 'var(--border-strong)', color: tursoConfigured() ? 'var(--green)' : 'var(--text-faint)' }}>
            {tursoConfigured() ? 'Turso conectado' : 'Banco local (arquivo)'}
          </span>
        </div>
        {usingEnvTurso ? (
          <p className="muted" style={{ fontSize: '0.9rem' }}>Detectei credenciais do Turso nas variáveis de ambiente — elas têm prioridade sobre o que for salvo aqui.</p>
        ) : (
          <form action="/api/settings" method="post" className="stack">
            <Field label="TURSO_DATABASE_URL"><input className="input mono" name="tursoUrl" defaultValue={conn.tursoUrl} placeholder="libsql://seu-banco.turso.io" /></Field>
            <Field label="TURSO_AUTH_TOKEN"><input className="input mono" name="tursoToken" type="password" placeholder={conn.tursoToken ? '•••••••• (salvo — deixe em branco para manter)' : 'eyJ...'} /></Field>
            <button className="btn btn-sm" type="submit">Salvar conexão do Turso</button>
          </form>
        )}
        <TestConnection target="turso" label="Testar conexão do banco" />
      </Card>

      {/* GEMINI */}
      <Card title="Google Gemini" desc="A chave organiza texto e fotos ao publicar. Guardada no banco (nunca vai para o navegador nem para o Git).">
        <form action="/api/settings" method="post" className="stack">
          <Field label="API Key do Gemini"><input className="input mono" name="geminiApiKey" type="password" placeholder={geminiSaved ? '•••••••• (salva — deixe em branco para manter)' : 'AIza…'} /></Field>
          <Field label="Modelo (deixe em branco para escolher automático)"><input className="input" name="geminiModel" defaultValue={s.geminiModel || ''} placeholder="automático (ex.: gemini-2.0-flash)" /></Field>
          <button className="btn btn-sm" type="submit">Salvar chave</button>
        </form>
        <TestConnection target="gemini" label="Testar chave do Gemini" />
      </Card>

      {/* IDENTIDADE */}
      <Card title="Identidade do site" desc="Guardada no banco. Troque aqui e vale no site inteiro.">
        <form action="/api/settings" method="post" className="stack">
          <Field label="Nome do site"><input className="input" name="siteName" defaultValue={s.siteName || siteConfig.siteName} /></Field>
          <Field label="Tagline"><input className="input" name="tagline" defaultValue={s.tagline || siteConfig.tagline} /></Field>
          <Field label="Manchete da Home"><input className="input" name="heroHeadline" defaultValue={s.heroHeadline || 'São Paulo é grande demais para conhecer de uma vez.'} /></Field>
          <Field label="Instagram"><input className="input" name="instagram" defaultValue={s.instagram || ''} placeholder="@turistandosp" /></Field>
          <Field label="Km rodados (aparece na Home)"><input className="input" name="kmWalked" defaultValue={s.kmWalked || ''} placeholder="312" /></Field>
          <button className="btn btn-sm" type="submit">Salvar identidade</button>
        </form>
      </Card>

      {/* IMAGEM DE FUNDO — upload para o banco */}
      <Card title="Imagem de fundo (Home)" desc="Envie uma foto sua (fica guardada no banco). Sem imagem, usamos um fundo tipográfico limpo.">
        <HeroImageField initial={s.heroImageUrl || ''} />
      </Card>

      {/* PÁGINA SOBRE — foto, título e conteúdo */}
      <Card title="Página “Sobre mim”" desc="Sua foto, o título e o texto que aparecem na página Sobre. Tudo guardado no banco. Deixe em branco para usar o texto padrão.">
        <div style={{ marginBottom: '1.25rem' }}>
          <span className="field__label" style={{ display: 'block', marginBottom: '0.5rem' }}>Sua foto</span>
          <AboutPhotoField initial={s.aboutPhotoUrl || ''} />
        </div>
        <form action="/api/settings" method="post" className="stack">
          <Field label="Título"><input className="input" name="aboutTitle" defaultValue={s.aboutTitle || ''} placeholder="Um cara, a cidade, as ruas de São Paulo" /></Field>
          <Field label="Chamada (primeiro parágrafo, em destaque)"><textarea className="input" name="aboutLead" defaultValue={s.aboutLead || ''} rows={3} placeholder="Sou eu quem anda, fotografa e escreve…" /></Field>
          <Field label="Conteúdo (um parágrafo por linha)"><textarea className="input" name="aboutBody" defaultValue={s.aboutBody || ''} rows={6} placeholder="Escreva sua história. Cada linha em branco separa um parágrafo." /></Field>
          <button className="btn btn-sm" type="submit">Salvar página Sobre</button>
        </form>
      </Card>

      {/* SENHA */}
      <Card title="Senha do painel" desc="Guardada no banco. Padrão inicial: turistando.">
        <form action="/api/settings" method="post" className="stack">
          <Field label="Nova senha"><input className="input" name="adminPassword" type="password" placeholder="deixe em branco para manter a atual" /></Field>
          <button className="btn btn-sm" type="submit">Salvar senha</button>
        </form>
      </Card>
    </div>
  );
}

function Card({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <section style={{ border: '1px solid var(--border)', background: 'var(--surface)', padding: 'clamp(1.25rem, 3vw, 2rem)', marginTop: '1.5rem' }}>
      <h2 className="heading h3" style={{ fontSize: '1.25rem' }}>{title}</h2>
      <p className="muted" style={{ fontSize: '0.92rem', margin: '0.4rem 0 1.25rem', maxWidth: '62ch' }}>{desc}</p>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      {children}
    </label>
  );
}

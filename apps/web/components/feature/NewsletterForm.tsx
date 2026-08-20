'use client';

import { useState } from 'react';

/**
 * Inscrição em newsletter. Envia o e-mail para o endpoint configurado em
 * NEXT_PUBLIC_NEWSLETTER_ACTION (ex.: Buttondown, Formspree). Sem endpoint,
 * não renderiza nada.
 */
export function NewsletterForm() {
  const action = process.env.NEXT_PUBLIC_NEWSLETTER_ACTION;
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  if (!action) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setBusy(true);
    setMsg('');
    try {
      await fetch(action!, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' },
        body: new URLSearchParams({ email }),
      });
      setMsg('✓ Prontinho! Se pedir confirmação, confere seu e-mail.');
      setEmail('');
    } catch {
      setMsg('Não deu pra inscrever agora. Tente de novo mais tarde.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="newsletter" onSubmit={submit}>
      <input className="input" type="email" required placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Seu e-mail" />
      <button className="btn" type="submit" disabled={busy}>{busy ? 'Enviando…' : 'Receber novidades'}</button>
      {msg ? <span className="coord" style={{ flexBasis: '100%' }}>{msg}</span> : null}
    </form>
  );
}

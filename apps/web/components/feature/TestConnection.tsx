'use client';

import { useState } from 'react';

export function TestConnection({ target, label }: { target: 'turso' | 'gemini'; label: string }) {
  const [state, setState] = useState<'idle' | 'loading' | 'ok' | 'fail'>('idle');
  const [msg, setMsg] = useState('');

  async function test() {
    setState('loading');
    setMsg('');
    try {
      const res = await fetch('/api/integrations/test', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ target }),
      });
      const data = await res.json();
      setState(data.ok ? 'ok' : 'fail');
      setMsg(data.message ?? (data.ok ? 'OK' : 'Falhou'));
    } catch (e) {
      setState('fail');
      setMsg((e as Error).message);
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
      <button type="button" className="btn btn-ghost btn-sm" onClick={test} disabled={state === 'loading'}>
        {state === 'loading' ? 'Testando…' : label}
      </button>
      {msg ? (
        <span className="mono" style={{ fontSize: '0.8rem', color: state === 'ok' ? 'var(--green)' : 'var(--error)' }}>
          {state === 'ok' ? '✓ ' : '✕ '}{msg}
        </span>
      ) : null}
    </div>
  );
}

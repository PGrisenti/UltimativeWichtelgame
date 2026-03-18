'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function JoinByCodeForm() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const normalizedCode = code.trim().toUpperCase();

    const res = await fetch(`/api/sessions/${normalizedCode}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ via: 'code' }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? 'Beitritt fehlgeschlagen');
      return;
    }

    router.push(`/session/${data.sessionId}`);
    router.refresh();
  }

  return (
    <div className="card">
      <h2>Session beitreten</h2>
      <form className="form-grid" onSubmit={handleSubmit}>
        <div>
          <label>Raumcode</label>
          <input required value={code} onChange={(e) => setCode(e.target.value)} />
        </div>
        <button className="btn" type="submit">Beitreten</button>
        {error ? <div className="error small">{error}</div> : null}
      </form>
    </div>
  );
}
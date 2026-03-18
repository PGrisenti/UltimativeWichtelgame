'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateSessionForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch('/api/sessions/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, budget, deadline }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? 'Session konnte nicht erstellt werden.');
      return;
    }

    router.push(`/session/${data.sessionId}`);
    router.refresh();
  }

  return (
    <div className="card">
      <h2>Neue Session erstellen</h2>
      <form className="form-grid" onSubmit={handleSubmit}>
        <div>
          <label>Name der Session</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label>Budget</label>
          <input placeholder="z.B. CHF 20" value={budget} onChange={(e) => setBudget(e.target.value)} />
        </div>
        <div>
          <label>Deadline</label>
          <input type="datetime-local" required value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </div>
        <button className="btn" disabled={loading} type="submit">{loading ? 'Erstelle...' : 'Session erstellen'}</button>
        {error ? <div className="error small">{error}</div> : null}
      </form>
    </div>
  );
}

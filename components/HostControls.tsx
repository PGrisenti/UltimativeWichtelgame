'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Props = {
  sessionId: string;
  initialBudget: string | null;
  initialDeadline: string | null;
  phase: string;
};

export default function HostControls({ sessionId, initialBudget, initialDeadline, phase }: Props) {
  const router = useRouter();
  const [budget, setBudget] = useState(initialBudget ?? '');
  const [deadline, setDeadline] = useState(initialDeadline ? initialDeadline.slice(0, 16) : '');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function post(path: string, body?: Record<string, unknown>) {
    setMessage(null);
    setError(null);
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : '{}',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? 'Aktion fehlgeschlagen');
      return;
    }
    setMessage(data.message ?? 'Gespeichert');
    router.refresh();
  }

  async function deleteSession() {
    const ok = window.confirm('Session wirklich löschen?');
    if (!ok) return;
    const res = await fetch(`/api/sessions/${sessionId}/delete`, { method: 'POST' });
    if (res.ok) {
      router.push('/dashboard');
      router.refresh();
      return;
    }
    const data = await res.json();
    setError(data.error ?? 'Löschen fehlgeschlagen');
  }

  return (
    <div className="card stack">
      <h2>Host-Steuerung</h2>

      <div className="form-grid">
        <div>
          <label>Budget</label>
          <input value={budget} onChange={(e) => setBudget(e.target.value)} />
        </div>
        <div>
          <label>Deadline</label>
          <input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </div>
        <button className="btn" onClick={() => post(`/api/sessions/${sessionId}/update`, { budget, deadline })}>Sessiondaten speichern</button>
      </div>

      {phase === 'setup' ? <button className="btn" onClick={() => post(`/api/sessions/${sessionId}/draw`)}>Phase 1 starten: Auslosen + Mail senden</button> : null}
      {phase === 'gifting' || phase === 'drawn' ? <button className="btn btn-secondary" onClick={() => post(`/api/sessions/${sessionId}/phase`, { phase: 'guessing' })}>Phase 4 starten: Ratephase</button> : null}
      {phase === 'guessing' ? <button className="btn btn-secondary" onClick={() => post(`/api/sessions/${sessionId}/reveal`)}>Phase 5/6: Auflösung starten</button> : null}
      {phase === 'revealed' ? <button className="btn btn-danger" onClick={deleteSession}>Phase 7: Session löschen</button> : null}

      {message ? <div className="success small">{message}</div> : null}
      {error ? <div className="error small">{error}</div> : null}
    </div>
  );
}

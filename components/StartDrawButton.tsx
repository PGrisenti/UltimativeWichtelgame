'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Props = {
  sessionId: string;
};

export default function StartDrawButton({ sessionId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStartDraw() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/sessions/${sessionId}/draw`, {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Auslosung konnte nicht gestartet werden');
        setLoading(false);
        return;
      }

      router.refresh();
    } catch {
      setError('Netzwerkfehler');
    }

    setLoading(false);
  }

  return (
    <div style={{ marginTop: '1rem' }}>
      <button className="btn" onClick={handleStartDraw} disabled={loading}>
        {loading ? 'Auslosung läuft...' : 'Auslosung starten'}
      </button>
      {error ? <div className="error small">{error}</div> : null}
    </div>
  );
}
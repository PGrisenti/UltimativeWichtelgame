'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

type Member = {
  id: string;
  username: string;
};

type ExistingGuess = {
  target_member_id: string;
  guessed_gifter_member_id: string;
};

export default function GuessBoard({
  sessionId,
  members,
  currentMemberId,
  existingGuesses,
}: {
  sessionId: string;
  members: Member[];
  currentMemberId: string;
  existingGuesses: ExistingGuess[];
}) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const guess of existingGuesses) {
      map[guess.target_member_id] = guess.guessed_gifter_member_id;
    }
    return map;
  });
  const [status, setStatus] = useState<string | null>(null);

  const selectableGifters = useMemo(() => members, [members]);

  async function save() {
    const payload = Object.entries(values).map(([target_member_id, guessed_gifter_member_id]) => ({
      target_member_id,
      guessed_gifter_member_id,
    }));

    const res = await fetch(`/api/sessions/${sessionId}/guesses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guesses: payload }),
    });

    const data = await res.json();
    if (!res.ok) {
      setStatus(data.error ?? 'Speichern fehlgeschlagen');
      return;
    }

    setStatus('Guesses gespeichert.');
    router.refresh();
  }

  return (
    <div className="card">
      <h2>Meine Guesses</h2>
      <p>Ordne jedem Spieler den Wichtel zu. Du darfst auch dich selbst zuordnen, falls du das vermutest.</p>
      <div className="stack">
        {members.map((member) => (
          <div key={member.id}>
            <label>Wer hat {member.username} beschenkt?</label>
            <select
              value={values[member.id] ?? ''}
              onChange={(e) => setValues((prev) => ({ ...prev, [member.id]: e.target.value }))}
            >
              <option value="">Bitte wählen</option>
              {selectableGifters.map((gifter) => (
                <option key={gifter.id} value={gifter.id}>{gifter.username}{gifter.id === currentMemberId ? ' (ich)' : ''}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
      <div className="row" style={{ marginTop: 16 }}>
        <button className="btn" onClick={save}>Guesses speichern</button>
        {status ? <span className="small">{status}</span> : null}
      </div>
    </div>
  );
}

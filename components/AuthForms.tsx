'use client';

import { useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';

export default function AuthForms() {
  const supabase = createBrowserSupabase();
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: { username },
          },
        });
        if (error) throw error;
        setMessage('Konto erstellt. Bitte bestätige deine E-Mail.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <div className="row" style={{ marginBottom: 16 }}>
        <button className="btn btn-secondary" type="button" onClick={() => setMode('login')}>Login</button>
        <button className="btn btn-secondary" type="button" onClick={() => setMode('signup')}>Profil erstellen</button>
      </div>
      <form className="form-grid" onSubmit={handleSubmit}>
        {mode === 'signup' && (
          <div>
            <label>Benutzername</label>
            <input required value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
        )}
        <div>
          <label>E-Mail</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label>Passwort</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button className="btn" disabled={loading} type="submit">
          {loading ? 'Lädt...' : mode === 'signup' ? 'Konto erstellen' : 'Einloggen'}
        </button>
        {message ? <div className="success small">{message}</div> : null}
        {error ? <div className="error small">{error}</div> : null}
      </form>
    </div>
  );
}

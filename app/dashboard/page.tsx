import Link from 'next/link';
import { redirect } from 'next/navigation';
import CreateSessionForm from '@/components/CreateSessionForm';
import JoinByCodeForm from '@/components/JoinByCodeForm';
import LogoutButton from '@/components/LogoutButton';
import { createServerSupabase } from '@/lib/auth';
import { formatDate, phaseLabel } from '@/lib/utils';

export default async function DashboardPage() {
  const supabase = await createServerSupabase();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;

  if (!user) redirect('/');

  const [{ data: profile }, { data: sessions }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('session_members')
      .select('session_id, sessions(*)')
      .eq('user_id', user.id),
  ]);

  return (
    <main className="page">
      <section className="container grid" style={{ gap: 20 }}>
        <div className="header">
          <div>
            <span className="badge">Dashboard</span>
            <h1>Hallo {profile?.username ?? user.email}</h1>
            <p>{user.email}</p>
          </div>
          <LogoutButton />
        </div>

        <div className="grid grid-2">
          <CreateSessionForm />
          <JoinByCodeForm />
        </div>

        <div className="card">
          <h2>Meine Sessions</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phase</th>
                <th>Deadline</th>
                <th>Aktion</th>
              </tr>
            </thead>
            <tbody>
              {sessions?.length ? sessions.map((row: any) => {
                const session = Array.isArray(row.sessions) ? row.sessions[0] : row.sessions;
                if (!session) return null;
                return (
                  <tr key={session.id}>
                    <td>{session.name}</td>
                    <td>{phaseLabel(session.phase)}</td>
                    <td>{formatDate(session.gift_deadline)}</td>
                    <td><Link href={`/session/${session.id}`}>Öffnen</Link></td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={4}>Du bist noch in keiner Session.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

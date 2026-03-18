import Link from 'next/link';
import { redirect } from 'next/navigation';
import GuessBoard from '@/components/GuessBoard';
import HostControls from '@/components/HostControls';
import MyAssignmentCard from '@/components/MyAssignmentCard';
import RevealBoard from '@/components/RevealBoard';
import StartDrawButton from '@/components/StartDrawButton';
import { createServerSupabase } from '@/lib/auth';
import { buildInviteLink, formatDate, phaseLabel } from '@/lib/utils';

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;
  if (!user) redirect('/');

  const { data: session } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', id)
    .single();

  if (!session) {
    return (
      <main className="page">
        <section className="container">
          <div className="card">
            <h1>Session nicht gefunden</h1>
          </div>
        </section>
      </main>
    );
  }

  const [
    { data: myMembership },
    { data: members },
    { data: assignments },
    { data: guesses },
    { data: scores }
  ] = await Promise.all([
    supabase.from('session_members').select('*').eq('session_id', id).eq('user_id', user.id).single(),
    supabase.from('session_members').select('id, user_id, profiles(username, email)').eq('session_id', id),
    supabase.from('session_assignments').select('*').eq('session_id', id),
    supabase.from('session_guesses').select('*').eq('session_id', id).eq('guesser_user_id', user.id),
    supabase.from('session_scores').select('*').eq('session_id', id).order('score', { ascending: false }),
  ]);

  if (!myMembership) {
    return (
      <main className="page">
        <section className="container">
          <div className="card">
            <h1>Kein Zugriff auf diese Session</h1>
            <Link href="/dashboard">Zurück</Link>
          </div>
        </section>
      </main>
    );
  }

  const normalizedMembers = (members ?? []).map((member: any) => ({
    id: member.id,
    user_id: member.user_id,
    username: Array.isArray(member.profiles) ? member.profiles[0]?.username : member.profiles?.username,
    email: Array.isArray(member.profiles) ? member.profiles[0]?.email : member.profiles?.email,
  }));

  const myAssignment = (assignments ?? []).find((row: any) => row.gifter_member_id === myMembership.id);
  const recipient = normalizedMembers.find((member) => member.id === myAssignment?.receiver_member_id);

  const revealRows = (assignments ?? []).map((row: any) => ({
    gifter: normalizedMembers.find((m) => m.id === row.gifter_member_id)?.username ?? '—',
    receiver: normalizedMembers.find((m) => m.id === row.receiver_member_id)?.username ?? '—',
  }));

  const podium = (scores ?? []).map((row: any) => ({
    username: normalizedMembers.find((m) => m.user_id === row.user_id)?.username ?? '—',
    score: row.score,
  }));

  const isHost = session.host_user_id === user.id;
  const inviteLink = buildInviteLink(session.invite_slug);

  return (
    <main className="page">
      <section className="container grid" style={{ gap: 20 }}>
        <div className="header">
          <div>
            <Link href="/dashboard">← Dashboard</Link>
            <h1>{session.name}</h1>
            <span className="badge">{phaseLabel(session.phase)}</span>
          </div>
        </div>

        <div className="grid grid-2">
          <div className="card">
            <h2>Session Übersicht</h2>
            <table className="table">
              <tbody>
                <tr><td>Budget</td><td>{session.budget ?? '—'}</td></tr>
                <tr><td>Deadline</td><td>{formatDate(session.gift_deadline)}</td></tr>
                <tr><td>Anzahl Mitglieder</td><td>{normalizedMembers.length}</td></tr>
                <tr><td>Raumcode</td><td>{session.join_code}</td></tr>
              </tbody>
            </table>
            <div style={{ marginTop: 16 }}>
              <label>Beitrittslink</label>
              <div className="codebox">{inviteLink}</div>
            </div>
          </div>

          <MyAssignmentCard
            visible={['drawn', 'gifting', 'deadline_reached', 'guessing', 'revealed'].includes(session.phase)}
            recipientName={recipient?.username ?? null}
          />
        </div>

        <div className="card">
          <h2>Mitglieder</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Benutzername</th>
                <th>E-Mail</th>
                <th>Rolle</th>
              </tr>
            </thead>
            <tbody>
              {normalizedMembers.map((member) => (
                <tr key={member.id}>
                  <td>{member.username}</td>
                  <td>{member.email}</td>
                  <td>{member.user_id === session.host_user_id ? 'Host' : 'Spieler'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isHost ? (
          <>
            {session.phase === 'setup' ? (
              <div className="card">
                <h2>Auslosung</h2>
                <p>Wenn alle Mitglieder beigetreten sind, kannst du die Auslosung starten.</p>
                <StartDrawButton sessionId={session.id} />
              </div>
            ) : null}

            <HostControls
              sessionId={session.id}
              initialBudget={session.budget}
              initialDeadline={session.gift_deadline}
              phase={session.phase}
            />
          </>
        ) : null}

        {session.phase === 'guessing' ? (
          <GuessBoard
            sessionId={session.id}
            members={normalizedMembers.map((m) => ({ id: m.id, username: m.username }))}
            currentMemberId={myMembership.id}
            existingGuesses={(guesses ?? []).map((g: any) => ({
              target_member_id: g.target_member_id,
              guessed_gifter_member_id: g.guessed_gifter_member_id,
            }))}
          />
        ) : null}

        {session.phase === 'revealed' ? (
          <RevealBoard results={revealRows} podium={podium} />
        ) : null}
      </section>
    </main>
  );
}
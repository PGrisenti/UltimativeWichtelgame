import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/auth';

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();

  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;

  if (!user) {
    return NextResponse.json({ error: 'Nicht eingeloggt' }, { status: 401 });
  }

  const { data: session } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', id)
    .single();

  if (!session) {
    return NextResponse.json({ error: 'Session nicht gefunden' }, { status: 404 });
  }

  if (session.host_user_id !== user.id) {
    return NextResponse.json({ error: 'Nur der Host' }, { status: 403 });
  }

  if (session.phase !== 'guessing') {
    return NextResponse.json({ error: 'Auflösung ist nur in der Ratephase möglich' }, { status: 400 });
  }

  const [{ data: members }, { data: assignments }, { data: guesses }] = await Promise.all([
    supabase.from('session_members').select('id, user_id').eq('session_id', id),
    supabase.from('session_assignments').select('*').eq('session_id', id),
    supabase.from('session_guesses').select('*').eq('session_id', id),
  ]);

  if (!members || members.length === 0) {
    return NextResponse.json({ error: 'Keine Mitglieder gefunden' }, { status: 400 });
  }

  const assignmentMap = new Map<string, string>();
  for (const row of assignments ?? []) {
    assignmentMap.set(row.receiver_member_id, row.gifter_member_id);
  }

  const scores = new Map<string, number>();

  // Alle Spieler zuerst mit 0 Punkten initialisieren
  for (const member of members) {
    scores.set(member.user_id, 0);
  }

  for (const guess of guesses ?? []) {
    const correct = assignmentMap.get(guess.target_member_id) === guess.guessed_gifter_member_id;
    if (correct) {
      scores.set(guess.guesser_user_id, (scores.get(guess.guesser_user_id) ?? 0) + 1);
    }
  }

  const scoreRows = Array.from(scores.entries()).map(([user_id, score]) => ({
    session_id: id,
    user_id,
    score,
  }));

  await supabase.from('session_scores').delete().eq('session_id', id);

  if (scoreRows.length > 0) {
    const { error: scoreInsertError } = await supabase
      .from('session_scores')
      .insert(scoreRows);

    if (scoreInsertError) {
      return NextResponse.json({ error: scoreInsertError.message }, { status: 400 });
    }
  }

  const { error } = await supabase
    .from('sessions')
    .update({
      phase: 'revealed',
      revealed_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ message: 'Auflösung abgeschlossen' });
}
import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/auth';
import { sendAssignmentEmails } from '@/lib/email';
import { derangement } from '@/lib/session';

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;
  if (!user) return NextResponse.json({ error: 'Nicht eingeloggt' }, { status: 401 });

  const { data: session } = await supabase.from('sessions').select('*').eq('id', id).single();
  if (!session) return NextResponse.json({ error: 'Session nicht gefunden' }, { status: 404 });
  if (session.host_user_id !== user.id) return NextResponse.json({ error: 'Nur der Host darf auslosen' }, { status: 403 });
  if (session.phase !== 'setup') return NextResponse.json({ error: 'Auslosung wurde bereits gestartet' }, { status: 400 });

  const { data: members } = await supabase
    .from('session_members')
    .select('id, profiles(username, email)')
    .eq('session_id', id);

  const normalized = (members ?? []).map((m: any) => ({
    id: m.id,
    username: Array.isArray(m.profiles) ? m.profiles[0]?.username : m.profiles?.username,
    email: Array.isArray(m.profiles) ? m.profiles[0]?.email : m.profiles?.email,
  }));

  if (normalized.length < 2) return NextResponse.json({ error: 'Mindestens 2 Mitglieder nötig' }, { status: 400 });

  const pairs = derangement(normalized.map((m) => m.id)).map((pair) => ({ ...pair, session_id: id }));

  const { error: deleteError } = await supabase.from('session_assignments').delete().eq('session_id', id);
  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 400 });

  const { error: insertError } = await supabase.from('session_assignments').insert(pairs);
  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 400 });

  const { error: phaseError } = await supabase
    .from('sessions')
    .update({ phase: 'gifting', draw_started_at: new Date().toISOString() })
    .eq('id', id);

  if (phaseError) return NextResponse.json({ error: phaseError.message }, { status: 400 });

  const mails = pairs.map((pair) => {
    const gifter = normalized.find((m) => m.id === pair.gifter_member_id)!;
    const receiver = normalized.find((m) => m.id === pair.receiver_member_id)!;
    return {
      to: gifter.email,
      username: gifter.username,
      sessionName: session.name,
      recipientName: receiver.username,
      deadline: session.gift_deadline,
    };
  });

  await sendAssignmentEmails(mails);

  return NextResponse.json({ message: 'Auslosung gestartet und E-Mails versendet (oder übersprungen, falls nicht konfiguriert).' });
}

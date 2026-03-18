import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/auth';

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;
  if (!user) return NextResponse.json({ error: 'Nicht eingeloggt' }, { status: 401 });

  const { data: session } = await supabase.from('sessions').select('host_user_id').eq('id', id).single();
  if (!session || session.host_user_id !== user.id) return NextResponse.json({ error: 'Nur der Host' }, { status: 403 });

  await supabase.from('session_guesses').delete().eq('session_id', id);
  await supabase.from('session_assignments').delete().eq('session_id', id);
  await supabase.from('session_scores').delete().eq('session_id', id);
  await supabase.from('session_members').delete().eq('session_id', id);
  const { error } = await supabase.from('sessions').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ message: 'Session gelöscht' });
}

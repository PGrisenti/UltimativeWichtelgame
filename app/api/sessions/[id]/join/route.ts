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

  const normalizedCode = id.trim().toUpperCase();

  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('id, phase, join_code')
    .eq('join_code', normalizedCode)
    .maybeSingle();

  if (sessionError) {
    return NextResponse.json({ error: sessionError.message }, { status: 400 });
  }

  if (!session) {
    return NextResponse.json({ error: 'Session nicht gefunden' }, { status: 404 });
  }

  if (session.phase !== 'setup') {
    return NextResponse.json({ error: 'Beitritt ist nicht mehr möglich' }, { status: 400 });
  }

  const { data: existingMembership, error: existingError } = await supabase
    .from('session_members')
    .select('id')
    .eq('session_id', session.id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 400 });
  }

  if (existingMembership) {
    return NextResponse.json({
      sessionId: session.id,
      message: 'Bereits beigetreten',
    });
  }

  const { error: insertError } = await supabase
    .from('session_members')
    .insert({
      session_id: session.id,
      user_id: user.id,
    });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  return NextResponse.json({
    sessionId: session.id,
    message: 'Beigetreten',
  });
}
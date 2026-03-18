import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabase } from '@/lib/auth';

const schema = z.object({
  guesses: z.array(z.object({
    target_member_id: z.string().uuid(),
    guessed_gifter_member_id: z.string().uuid(),
  })),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = schema.parse(await request.json());
  const supabase = await createServerSupabase();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;
  if (!user) return NextResponse.json({ error: 'Nicht eingeloggt' }, { status: 401 });

  const { data: session } = await supabase.from('sessions').select('phase').eq('id', id).single();
  if (!session || session.phase !== 'guessing') return NextResponse.json({ error: 'Ratephase ist nicht aktiv' }, { status: 400 });

  await supabase.from('session_guesses').delete().eq('session_id', id).eq('guesser_user_id', user.id);
  const payload = body.guesses.map((guess) => ({ ...guess, session_id: id, guesser_user_id: user.id }));
  const { error } = await supabase.from('session_guesses').insert(payload);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ message: 'Guesses gespeichert' });
}

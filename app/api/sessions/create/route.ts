import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabase } from '@/lib/auth';
import { makeInviteSlug, makeJoinCode } from '@/lib/session';

const schema = z.object({
  name: z.string().min(2),
  budget: z.string().optional().nullable(),
  deadline: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const supabase = await createServerSupabase();
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;
    if (!user) return NextResponse.json({ error: 'Nicht eingeloggt' }, { status: 401 });

    let joinCode = makeJoinCode();
    for (let i = 0; i < 5; i++) {
      const { data: existing } = await supabase.from('sessions').select('id').eq('join_code', joinCode).maybeSingle();
      if (!existing) break;
      joinCode = makeJoinCode();
    }

    const inviteSlug = makeInviteSlug();

    const { data: session, error } = await supabase
      .from('sessions')
      .insert({
        name: body.name,
        budget: body.budget || null,
        gift_deadline: new Date(body.deadline).toISOString(),
        host_user_id: user.id,
        join_code: joinCode,
        invite_slug: inviteSlug,
        phase: 'setup',
      })
      .select('id')
      .single();

    if (error || !session) {
      return NextResponse.json({ error: error?.message ?? 'Session konnte nicht erstellt werden' }, { status: 400 });
    }

    const { error: memberError } = await supabase.from('session_members').insert({
      session_id: session.id,
      user_id: user.id,
    });

    if (memberError) {
      return NextResponse.json({ error: memberError.message }, { status: 400 });
    }

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Ungültige Anfrage' }, { status: 400 });
  }
}

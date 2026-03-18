import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabase } from '@/lib/auth';

const schema = z.object({
  budget: z.string().optional(),
  deadline: z.string().optional(),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = schema.parse(await request.json());
  const supabase = await createServerSupabase();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;
  if (!user) return NextResponse.json({ error: 'Nicht eingeloggt' }, { status: 401 });

  const { data: session } = await supabase.from('sessions').select('host_user_id').eq('id', id).single();
  if (!session || session.host_user_id !== user.id) {
    return NextResponse.json({ error: 'Nur der Host darf ändern' }, { status: 403 });
  }

  const { error } = await supabase.from('sessions').update({
    budget: body.budget || null,
    gift_deadline: body.deadline ? new Date(body.deadline).toISOString() : null,
  }).eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ message: 'Sessiondaten gespeichert' });
}

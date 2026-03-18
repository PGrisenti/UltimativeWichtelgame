import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/auth';

export default async function JoinByLinkPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const supabase = await createServerSupabase();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect('/');

  const { data: session } = await supabase
    .from('sessions')
    .select('id, phase')
    .eq('invite_slug', code)
    .single();

  if (!session) {
    return <main className="page"><section className="container"><div className="card"><h1>Einladungslink ungültig</h1></div></section></main>;
  }

  if (session.phase !== 'setup') {
    return <main className="page"><section className="container"><div className="card"><h1>Beitritt nicht mehr möglich</h1></div></section></main>;
  }

  await supabase
    .from('session_members')
    .upsert({ session_id: session.id, user_id: authData.user.id }, { onConflict: 'session_id,user_id' });

  redirect(`/session/${session.id}`);
}

import { redirect } from 'next/navigation';
import AuthForms from '@/components/AuthForms';
import { createServerSupabase } from '@/lib/auth';

export default async function HomePage() {
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getUser();

  if (data.user) {
    redirect('/dashboard');
  }

  return (
    <main className="page">
      <section className="container hero grid grid-2">
        <div className="card">
          <span className="badge">Wichtelwebseite</span>
          <h1>Einloggen, Session erstellen, auslosen und den Gewinner küren.</h1>
          <p>
            Diese Wichtelwebsetie ist eine digitale Plattform zur Organisation von Wichtelaktionen. 
            Nutzer*Innen können eigene Sessions erstellen, andere Personen per Link einladen und das 
            gesamte Spiel strukturiert in mehrere Phasen durchführen, von Auslosung bis Auflösung und 
            Auswertung der Tipps.
            Die Webseite wurde aus einer spontanen Idee und aus Langeweile heraus entwickelt, mit dem Ziel,
            den Wichtelprozess einfacher, übersichtlicher und interaktiver zu gestalten. 
            Viel Spass beim Spielen!
          </p>
          <div className="notice small">
            Nach der Registrierung bestätigt Supabase die E-Mail. Danach kannst du dich einloggen und loslegen.
          </div>
        </div>
        <AuthForms />
      </section>
    </main>
  );
}

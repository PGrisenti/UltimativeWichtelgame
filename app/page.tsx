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
            Diese Wichtelwebseite ist eine digitale Plattform zur Organisation von Wichtelaktionen. 
            Nutzer*Innen können eigene Sessions erstellen, andere Personen per Link einladen und das 
            gesamte Spiel strukturiert in mehrere Phasen durchführen.
          </p>

          {/* 👉 Phasen als Liste */}
          <ol className="list-decimal pl-5 space-y-1">
            <li>Einladung</li>
            <li>Auslosung</li>
            <li>Raten</li>
            <li>Auflösung & Punkte</li>
          </ol>

          <p className="mt-4">
            Die Webseite wurde aus einer spontanen Idee und aus Langeweile heraus entwickelt, mit dem Ziel,
            den Wichtelprozess einfacher, übersichtlicher und interaktiver zu gestalten. 
            Viel Spass beim Spielen!
          </p>

          <div className="notice small">
            Speichere dein Passwort, denn es ist keine Account wiederherstellung möglich!
            Nach der Registrierung bestätigt Supabase die E-Mail. Danach kannst du dich einloggen und loslegen.
          </div>
        </div>

        <AuthForms />
      </section>
    </main>
  );
}
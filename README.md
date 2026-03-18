# Wichtel App (Next.js + Supabase + Vercel)

Diese Vorlage bildet deine gewünschte Wichtelwebseite ab:

- Startseite mit Login / Profil erstellen (E-Mail + Benutzername)
- Dashboard für eingeloggte Nutzer
- Session erstellen mit Name, Budget und Deadline
- Session-Übersicht mit Mitgliedern, Raumcode und Beitrittslink
- Host-Rechte: Nur der Host darf Sessiondaten ändern, auslosen, Ratephase starten, auflösen und löschen
- Auslosung ohne Selbstzuweisung
- Ratephase mit individuellen Guesses pro Spieler
- Auflösung mit Punktestand / Podest
- Session-Löschung durch den Host

## Technik

- **Frontend / Backend:** Next.js App Router
- **Auth + Datenbank:** Supabase
- **Deployment:** Vercel
- **Mailversand für Zuteilung:** optional über Resend

## Projektstruktur

- `app/` – Seiten und API-Routen
- `components/` – UI-Komponenten
- `lib/` – Supabase, Sessionlogik, E-Mail
- `supabase/schema.sql` – Datenbanktabellen + Policies

## 1. Repository anlegen

1. Neues GitHub-Repository erstellen, z. B. `wichtel-app`
2. ZIP entpacken
3. Ordner in VS Code öffnen
4. Terminal im Projektordner öffnen

```bash
git init
git add .
git commit -m "Initial Wichtel App"
git branch -M main
git remote add origin https://github.com/DEIN-NAME/wichtel-app.git
git push -u origin main
```

## 2. Abhängigkeiten installieren

```bash
npm install
```

## 3. Supabase einrichten

1. Neues Supabase-Projekt erstellen
2. In **SQL Editor** den Inhalt von `supabase/schema.sql` ausführen
3. In **Authentication > Providers** E-Mail/Passwort aktiv lassen
4. In **Authentication > URL Configuration** setzen:
   - Site URL: `http://localhost:3000`
   - Redirect URL lokal: `http://localhost:3000/auth/callback`
   - später zusätzlich deine Vercel-URL: `https://DEIN-PROJEKT.vercel.app/auth/callback`

## 4. Umgebungsvariablen

`.env.local` anlegen:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
RESEND_API_KEY=
MAIL_FROM=Wichteln <onboarding@resend.dev>
```

### Hinweis zu den Mails

Die Zuteilungs-Mails laufen in dieser Vorlage über **Resend**. Wenn `RESEND_API_KEY` leer bleibt, funktioniert die App weiterhin, aber die E-Mails werden übersprungen. Die Zuteilung bleibt dann trotzdem im Dashboard sichtbar.

## 5. Lokal starten

```bash
npm run dev
```

Dann im Browser öffnen:

```text
http://localhost:3000
```

## 6. Deployment auf Vercel

1. Repository mit Vercel verbinden
2. Alle Environment Variables aus `.env.local` in Vercel eintragen
3. Deploy auslösen
4. Danach in Supabase die Vercel-URL als Redirect URL ergänzen

## 7. Wichtige Logik

### Rollen
- Der Ersteller einer Session ist `host_user_id`
- Nur der Host darf:
  - Sessiondaten ändern
  - Auslosung starten
  - Ratephase starten
  - Auflösen
  - Session löschen

### Phasen
- `setup` – Mitglieder treten bei
- `gifting` – Auslosung erfolgt, Wichtelphase aktiv
- `guessing` – Ratephase aktiv
- `revealed` – Auflösung + Podest sichtbar

### Auslosung
- Jeder erhält genau eine Person
- Niemand zieht sich selbst
- Gegenseitige Ziehungen sind erlaubt

## 8. Noch sinnvolle Erweiterungen

- automatische Erkennung "Deadline erreicht"
- E-Mail-Erinnerungen kurz vor Deadline
- Profilbild
- Gastgeber kann Mitglieder entfernen
- öffentliches Ergebnisboard mit schönerem Podest
- bessere Validierung für vollständige Guess-Abgabe vor Auflösung

## 9. Typische nächste Schritte in VS Code

```bash
npm install
npm run dev
```

Wenn du danach weiterbauen willst, sind die wichtigsten Stellen:

- `app/page.tsx` → Startseite
- `app/dashboard/page.tsx` → Benutzer-Dashboard
- `app/session/[id]/page.tsx` → Session-Ansicht
- `supabase/schema.sql` → Datenbank
- `app/api/sessions/...` → Spiel-Logik

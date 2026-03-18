import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wichtel App',
  description: 'Wichtel Sessions mit Supabase und Vercel',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}

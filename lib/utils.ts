export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(date: string | null | undefined) {
  if (!date) return '—';
  return new Intl.DateTimeFormat('de-CH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date));
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function phaseLabel(phase: string) {
  const map: Record<string, string> = {
    setup: 'Vorbereitung',
    drawn: 'Auslosung erfolgt',
    gifting: 'Wichtelphase',
    deadline_reached: 'Deadline erreicht',
    guessing: 'Ratephase',
    revealed: 'Auflösung',
    archived: 'Archiviert',
  };

  return map[phase] ?? phase;
}

export function buildInviteLink(slug: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL}/join/${slug}`;
}

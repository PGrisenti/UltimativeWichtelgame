import { randomUUID } from 'crypto';

export function makeJoinCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function makeInviteSlug() {
  return randomUUID();
}

export function shuffle<T>(items: T[]) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function derangement(ids: string[]) {
  if (ids.length < 2) {
    throw new Error('Mindestens 2 Mitglieder nötig.');
  }

  for (let attempt = 0; attempt < 300; attempt++) {
    const shuffled = shuffle(ids);
    const valid = ids.every((id, index) => id !== shuffled[index]);
    if (valid) {
      return ids.map((gifterId, index) => ({
        gifter_member_id: gifterId,
        receiver_member_id: shuffled[index],
      }));
    }
  }

  throw new Error('Auslosung konnte nicht erzeugt werden.');
}

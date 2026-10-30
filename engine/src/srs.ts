/**
 * SM-2 spaced repetition scheduling (pure functions, no storage).
 * Grades: 1 = Again, 3 = Hard, 4 = Good, 5 = Easy.
 */

export type SrsGrade = 1 | 3 | 4 | 5;

export interface SrsCard {
  /** Easiness factor, never below 1.3. */
  ease: number;
  /** Current interval in days. */
  interval: number;
  /** Consecutive successful reviews. */
  reps: number;
  /** Epoch milliseconds when the card is next due. */
  due: number;
}

export const DAY_MS = 24 * 60 * 60 * 1000;

export function newCard(now: number): SrsCard {
  return { ease: 2.5, interval: 0, reps: 0, due: now };
}

export function reviewCard(card: SrsCard, grade: SrsGrade, now: number): SrsCard {
  if (grade < 3) {
    // Lapse: restart the repetition sequence and see the card again soon.
    return { ease: Math.max(1.3, card.ease - 0.2), interval: 0, reps: 0, due: now + 10 * 60 * 1000 };
  }
  const reps = card.reps + 1;
  let interval: number;
  if (reps === 1) interval = 1;
  else if (reps === 2) interval = grade === 3 ? 3 : 6;
  else interval = Math.max(1, Math.round(card.interval * card.ease * (grade === 3 ? 0.85 : grade === 5 ? 1.3 : 1)));
  const ease = Math.max(1.3, card.ease + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)));
  return { ease, interval, reps, due: now + interval * DAY_MS };
}

export function isDue(card: SrsCard | undefined, now: number): boolean {
  return !card || card.due <= now;
}

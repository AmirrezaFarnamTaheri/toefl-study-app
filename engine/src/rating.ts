import type { Difficulty } from "./types";

/** Starting rating for both learners and items (= difficulty 3/5 midpoint). */
export const DEFAULT_RATING = 1000;

/** Rating gap per difficulty step (1–5). Same scale as chess Elo. */
export const RATING_STEP = 200;

/** K-factor for topic-level rating updates: fast to react to local performance. */
export const TOPIC_K_FACTOR = 40;

/** K-factor for section-level rating: slow-moving prior for unseen topics. */
export const SECTION_K_FACTOR = 10;

/**
 * Target success probability during adaptive practice.
 * 0.65 = slightly favourable — keeps sessions motivating without being trivial.
 */
export const TARGET_SUCCESS_PROBABILITY = 0.65;

export function difficultyToRating(difficulty: Difficulty): number {
  return DEFAULT_RATING + (difficulty - 3) * RATING_STEP;
}

/** Standard logistic expected-score function (same form as Elo). */
export function expectedScore(learnerRating: number, itemRating: number): number {
  return 1 / (1 + Math.pow(10, (itemRating - learnerRating) / 400));
}

export function updateRating(
  rating: number,
  expected: number,
  actualScore: 0 | 1,
  k: number = TOPIC_K_FACTOR
): number {
  return rating + k * (actualScore - expected);
}

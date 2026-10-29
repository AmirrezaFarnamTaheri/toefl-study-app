import { describe, it, expect } from "vitest";
import { DEFAULT_RATING, RATING_STEP, expectedScore, updateRating, difficultyToRating } from "../rating.js";

describe("difficultyToRating", () => {
  it("difficulty 3 maps to DEFAULT_RATING", () => {
    expect(difficultyToRating(3)).toBe(DEFAULT_RATING);
  });
  it("difficulty 1 is 2 steps below default", () => {
    expect(difficultyToRating(1)).toBe(DEFAULT_RATING - 2 * RATING_STEP);
  });
  it("difficulty 5 is 2 steps above default", () => {
    expect(difficultyToRating(5)).toBe(DEFAULT_RATING + 2 * RATING_STEP);
  });
});

describe("expectedScore", () => {
  it("equal ratings yield 0.5", () => {
    expect(expectedScore(1000, 1000)).toBeCloseTo(0.5, 5);
  });
  it("learner 200 above item gives > 0.5", () => {
    expect(expectedScore(1200, 1000)).toBeGreaterThan(0.5);
  });
  it("learner 200 below item gives < 0.5", () => {
    expect(expectedScore(800, 1000)).toBeLessThan(0.5);
  });
});

describe("updateRating", () => {
  it("correct answer raises rating", () => {
    const before = 1000;
    const after = updateRating(before, 0.5, 1, 40);
    expect(after).toBeGreaterThan(before);
  });
  it("incorrect answer lowers rating", () => {
    const before = 1000;
    const after = updateRating(before, 0.5, 0, 40);
    expect(after).toBeLessThan(before);
  });
  it("correct on easy item raises less than correct on hard item", () => {
    const base = 1000;
    const gainEasy = updateRating(base, 0.9, 1, 40) - base; // expected high → small gain
    const gainHard = updateRating(base, 0.1, 1, 40) - base; // expected low → big gain
    expect(gainHard).toBeGreaterThan(gainEasy);
  });
});

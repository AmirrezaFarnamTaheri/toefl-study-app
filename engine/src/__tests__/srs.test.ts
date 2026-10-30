import { describe, it, expect } from "vitest";
import { newCard, reviewCard, isDue, DAY_MS } from "../srs";

describe("SRS (SM-2)", () => {
  it("newCard is due immediately", () => {
    const now = Date.now();
    const card = newCard(now);
    expect(isDue(card, now)).toBe(true);
  });

  it("grade=1 (Again) lapses card and reschedules in 10 min", () => {
    const now = Date.now();
    const card = newCard(now);
    const next = reviewCard(card, 1, now);
    expect(next.reps).toBe(0);
    expect(next.due).toBe(now + 10 * 60 * 1000);
    expect(isDue(next, now + 9 * 60 * 1000)).toBe(false);
    expect(isDue(next, now + 11 * 60 * 1000)).toBe(true);
  });

  it("grade=4 (Good) first rep → interval 1 day", () => {
    const now = Date.now();
    let card = newCard(now);
    card = reviewCard(card, 4, now);
    expect(card.reps).toBe(1);
    expect(card.interval).toBe(1);
    expect(isDue(card, now + DAY_MS + 1)).toBe(true);
    expect(isDue(card, now + DAY_MS - 1)).toBe(false);
  });

  it("grade=4 second rep → interval 6 days", () => {
    const now = Date.now();
    let card = newCard(now);
    card = reviewCard(card, 4, now);
    card = reviewCard(card, 4, now + DAY_MS);
    expect(card.reps).toBe(2);
    expect(card.interval).toBe(6);
  });

  it("ease increases on Easy, decreases on Again", () => {
    const now = Date.now();
    const base = newCard(now);
    const easy = reviewCard(base, 5, now);
    const hard = reviewCard(base, 1, now);
    expect(easy.ease).toBeGreaterThan(base.ease);
    expect(hard.ease).toBeLessThan(base.ease);
  });

  it("isDue returns true for undefined card", () => {
    expect(isDue(undefined, Date.now())).toBe(true);
  });
});

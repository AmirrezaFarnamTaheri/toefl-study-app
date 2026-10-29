import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { buildSentenceAnswer, completeWordsAnswers, makeCompleteWords } from "../writingTasks";

const root = resolve(__dirname, "../../../data/questions");
const read = (f: string) => JSON.parse(readFileSync(resolve(root, f), "utf8"));

describe("2026-format question data", () => {
  it("Complete the Words paragraphs produce exactly ten gaps", () => {
    for (const q of read("reading/complete_words.json")) {
      const tokens = makeCompleteWords(q.paragraph, 10);
      expect(completeWordsAnswers(tokens), q.id).toHaveLength(10);
      const words = q.paragraph.split(/\s+/).length;
      expect(words, q.id).toBeGreaterThanOrEqual(55);
      expect(words, q.id).toBeLessThanOrEqual(85);
    }
  });

  it("Build a Sentence items have consistent tiles, 4-8 blanks and a unique tile set", () => {
    const items = read("writing/build_sentence.json");
    expect(items.length).toBeGreaterThanOrEqual(10);
    for (const q of items) {
      const answer = buildSentenceAnswer(q.segments);
      expect(answer.length, q.id).toBeGreaterThanOrEqual(4);
      expect(answer.length, q.id).toBeLessThanOrEqual(8);
      const expected = [...answer, ...(q.distractor ? [q.distractor] : [])].sort();
      expect([...q.tiles].sort(), q.id).toEqual(expected);
      expect(new Set(q.tiles).size, q.id).toBe(q.tiles.length);
      expect(q.tiles.slice(0, answer.length).join("|") === answer.join("|") && !q.distractor, q.id).toBe(false);
      expect(["?", "."]).toContain(q.punctuation);
    }
  });

  it("Write an Email prompts have three bullets and a rubric", () => {
    for (const q of read("writing/email.json")) {
      expect(q.bullets, q.id).toHaveLength(3);
      expect(q.rubric_checklist.length, q.id).toBeGreaterThanOrEqual(5);
      expect(q.to).toMatch(/@/);
    }
  });
});

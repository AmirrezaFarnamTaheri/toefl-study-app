import { describe, expect, it } from "vitest";
import {
  buildSentenceAnswer,
  completeWordsAnswers,
  gradeBuildSentence,
  gradeCompleteWords,
  makeCompleteWords,
  renderBuildSentence,
  type BuildSegment,
} from "../writingTasks";

describe("Build a Sentence", () => {
  const segments: BuildSegment[] = [
    { text: "do" },
    { text: "you" },
    { text: "know" },
    { text: "if" },
    { text: "we can", fixed: true },
    { text: "hand in" },
    { text: "the report" },
    { text: "on Monday" },
  ];

  it("lists only the tiles the learner must place", () => {
    expect(buildSentenceAnswer(segments)).toEqual(["do", "you", "know", "if", "hand in", "the report", "on Monday"]);
  });

  it("is all-or-nothing", () => {
    const right = ["do", "you", "know", "if", "hand in", "the report", "on Monday"];
    expect(gradeBuildSentence(segments, right)).toBe(true);
    const swapped = [...right];
    [swapped[0], swapped[1]] = [swapped[1], swapped[0]];
    expect(gradeBuildSentence(segments, swapped)).toBe(false);
    expect(gradeBuildSentence(segments, right.slice(0, 6))).toBe(false);
    expect(gradeBuildSentence(segments, [...right.slice(0, 6), null])).toBe(false);
  });

  it("renders the finished sentence with fixed words and punctuation", () => {
    const placed = buildSentenceAnswer(segments);
    expect(renderBuildSentence(segments, "?", placed)).toBe("do you know if we can hand in the report on Monday?");
  });
});

describe("Complete the Words", () => {
  const paragraph =
    "Many students study abroad every year. They often discover that daily life feels different from what they expected. " +
    "Simple tasks such as shopping, travelling, or ordering food require new vocabulary and patience. " +
    "Over several months, most learners become more confident and begin to enjoy their new surroundings.";

  it("leaves the first sentence whole and gaps every second eligible word after it", () => {
    const tokens = makeCompleteWords(paragraph, 10);
    const gaps = tokens.filter((t) => t.kind === "gap");
    expect(gaps).toHaveLength(10);
    const rebuilt = tokens
      .map((t) => (t.kind === "text" ? t.text : " " + t.prefix + t.missing + t.after))
      .join("");
    expect(rebuilt.replace(/\s+/g, " ").trim()).toBe(paragraph);
    expect(tokens[0].kind).toBe("text");
    expect((tokens[0] as { text: string }).text.startsWith("Many students study abroad every year.")).toBe(true);
  });

  it("keeps floor(n/2) letters and hides the rest", () => {
    const tokens = makeCompleteWords(paragraph, 10);
    const first = tokens.find((t) => t.kind === "gap");
    expect(first && first.kind === "gap" ? first.prefix.length : -1).toBe(
      first && first.kind === "gap" ? Math.floor((first.prefix.length + first.missing.length) / 2) : -2
    );
    expect(first && first.kind === "gap" ? first.missing.length : 0).toBeGreaterThan(0);
  });

  it("grades each gap on the missing letters only", () => {
    const tokens = makeCompleteWords(paragraph, 10);
    const missing = completeWordsAnswers(tokens).map((full, i) => {
      const g = tokens.filter((t) => t.kind === "gap")[i];
      return g.kind === "gap" ? g.missing : full;
    });
    expect(gradeCompleteWords(tokens, missing).every(Boolean)).toBe(true);
    const wrong = [...missing];
    wrong[0] = "zzz";
    expect(gradeCompleteWords(tokens, wrong)[0]).toBe(false);
    expect(gradeCompleteWords(tokens, wrong).slice(1).every(Boolean)).toBe(true);
  });

  it("skips names and numbers", () => {
    const tokens = makeCompleteWords("It started in the city. Then Maria moved in 2020 and started working near Boston with eleven new friends every week.", 4);
    const answers = completeWordsAnswers(tokens);
    expect(answers).not.toContain("Maria");
    expect(answers).not.toContain("Boston");
    expect(answers.join(" ")).not.toMatch(/\d/);
  });
});

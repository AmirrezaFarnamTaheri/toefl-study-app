import { describe, it, expect } from "vitest";
import { createInitialState, selectNextQuestion, recordAnswer, getTopicSummary, topicsForSection } from "../engine.js";
import type { AnyToeflQuestion } from "../types.js";

// Minimal deterministic question bank for tests
const READING_Q: AnyToeflQuestion = {
  id: "r1",
  section: "reading",
  qtype: "factual",
  topic: "biology",
  difficulty: 3,
  explanation: "Test explanation.",
  source: "seed",
  tags: [],
  passage_id: "p1",
  question: "What does the passage say?",
  choices: ["A", "B", "C", "D"],
  correct: "A",
};

const LISTENING_Q: AnyToeflQuestion = {
  id: "l1",
  section: "listening",
  qtype: "listening_detail",
  topic: "lecture_science",
  difficulty: 2,
  explanation: "Test explanation.",
  source: "seed",
  tags: [],
  script_id: "s1",
  question: "What is the main point?",
  choices: ["A", "B", "C", "D"],
  correct: "B",
};

const WRITING_Q: AnyToeflQuestion = {
  id: "w1",
  section: "writing",
  qtype: "writing_discussion",
  topic: "writing_discussion",
  difficulty: 3,
  explanation: "Self-assessed.",
  source: "seed",
  tags: [],
  professor_prompt: "Should universities be free?",
  student_a: { name: "Alex", post: "Yes, because access to education..." },
  student_b: { name: "Jamie", post: "No, because funding..." },
  rubric_checklist: ["Add own opinion", "Use evidence", "Address both students"],
};

const BANK: AnyToeflQuestion[] = [READING_Q, LISTENING_Q, WRITING_Q];
const DET_RNG = () => 0.3; // deterministic rng for tests

describe("createInitialState", () => {
  it("has version 1", () => expect(createInitialState().version).toBe(1));
  it("initializes all 3 TOEFL section ratings", () => {
    const s = createInitialState();
    expect(s.sectionRatings.reading).toBeDefined();
    expect(s.sectionRatings.listening).toBeDefined();
    expect(s.sectionRatings.writing).toBeDefined();
  });
  it("starts with empty attempts", () => expect(createInitialState().attempts).toHaveLength(0));
});

describe("topicsForSection", () => {
  it("returns reading topics", () => {
    const topics = topicsForSection(BANK, "reading");
    expect(topics).toContain("biology");
    expect(topics).not.toContain("lecture_science");
  });
  it("returns listening topics", () => {
    const topics = topicsForSection(BANK, "listening");
    expect(topics).toContain("lecture_science");
  });
});

describe("selectNextQuestion", () => {
  it("returns a question from the bank", () => {
    const state = createInitialState();
    const q = selectNextQuestion(state, BANK, { rng: DET_RNG });
    expect(q).not.toBeNull();
  });
  it("respects section filter", () => {
    const state = createInitialState();
    const q = selectNextQuestion(state, BANK, { section: "reading", rng: DET_RNG });
    expect(q?.section).toBe("reading");
  });
  it("returns null for empty pool", () => {
    const state = createInitialState();
    expect(selectNextQuestion(state, [], {})).toBeNull();
  });
});

describe("recordAnswer", () => {
  it("increments attempts", () => {
    const s0 = createInitialState();
    const s1 = recordAnswer(s0, READING_Q, true);
    expect(s1.topicStats["biology"]?.attempts).toBe(1);
    expect(s1.attempts).toHaveLength(1);
  });
  it("raises rating on correct answer", () => {
    const s0 = createInitialState();
    const s1 = recordAnswer(s0, READING_Q, true);
    expect(s1.topicStats["biology"]!.rating).toBeGreaterThan(s0.sectionRatings.reading);
  });
  it("lowers rating on incorrect answer", () => {
    const s0 = createInitialState();
    const s1 = recordAnswer(s0, READING_Q, false);
    expect(s1.topicStats["biology"]!.rating).toBeLessThan(s0.sectionRatings.reading);
  });
  it("records recentQuestionIds for repeat-avoidance", () => {
    const s0 = createInitialState();
    const s1 = recordAnswer(s0, READING_Q, true);
    expect(s1.topicStats["biology"]!.recentQuestionIds).toContain("r1");
  });
  it("does not mutate original state", () => {
    const s0 = createInitialState();
    recordAnswer(s0, READING_Q, true);
    expect(s0.attempts).toHaveLength(0);
  });
});

describe("getTopicSummary", () => {
  it("returns weakest first after a wrong answer", () => {
    let state = createInitialState();
    state = recordAnswer(state, READING_Q, false);
    state = recordAnswer(state, LISTENING_Q, true);
    const topics = topicsForSection(BANK, "reading").concat(topicsForSection(BANK, "listening"));
    const summary = getTopicSummary(state, topics);
    expect(summary[0].topic).toBe("biology"); // biology was answered wrong → lowest rating
  });
  it("shows null accuracy for unseen topics", () => {
    const state = createInitialState();
    const summary = getTopicSummary(state, ["biology"]);
    expect(summary[0].accuracy).toBeNull();
  });
});

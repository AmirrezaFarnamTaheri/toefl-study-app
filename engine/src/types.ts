/**
 * TOEFL Adaptive Engine — Types
 * Sections: reading | listening | writing
 * Question types: factual | negative_factual | inference | rhetorical_purpose |
 *   vocabulary | reference | sentence_simplification | insert_text |
 *   prose_summary | listening_detail | listening_main_idea | listening_function |
 *   listening_attitude | listening_inference | writing_discussion | writing_integrated |
 *   writing_build_sentence | writing_email | complete_words |
 *   listening_choose_response
 */

export type ToeflSection = "reading" | "listening" | "writing";
export type Difficulty = 1 | 2 | 3 | 4 | 5;
export type QuestionSource = "seed" | "adapted";

// ─── Shared base ─────────────────────────────────────────────────────────────

interface QuestionBase {
  id: string;
  section: ToeflSection;
  qtype: string;
  topic: string;
  difficulty: Difficulty;
  explanation: string;
  source: QuestionSource;
  tags: string[];
}

// ─── Reading passage ──────────────────────────────────────────────────────────

export interface ToeflPassage {
  id: string;
  title: string;
  text: string;
  source: "original" | "public_domain";
}

// ─── Reading question types ───────────────────────────────────────────────────

/** Factual / Negative Factual — single correct answer */
export interface FactualQuestion extends QuestionBase {
  section: "reading";
  qtype: "factual" | "negative_factual";
  passage_id: string;
  question: string;
  choices: string[];
  correct: string;
}

/** Inference, Rhetorical Purpose, Reference — single correct answer */
export interface InferenceQuestion extends QuestionBase {
  section: "reading";
  qtype: "inference" | "rhetorical_purpose" | "reference";
  passage_id: string;
  question: string;
  choices: string[];
  correct: string;
}

/** Vocabulary in context — single correct answer */
export interface VocabularyQuestion extends QuestionBase {
  section: "reading";
  qtype: "vocabulary";
  passage_id: string;
  target_word: string;
  context_sentence: string;
  question: string;
  choices: string[];
  correct: string;
}

/** Sentence Simplification — single correct answer */
export interface SentenceSimplificationQuestion extends QuestionBase {
  section: "reading";
  qtype: "sentence_simplification";
  passage_id: string;
  highlighted_sentence: string;
  question: string;
  choices: string[];
  correct: string;
}

/** Insert Text — choose one of 4 insertion points [A], [B], [C], [D] */
export interface InsertTextQuestion extends QuestionBase {
  section: "reading";
  qtype: "insert_text";
  passage_id: string;
  sentence_to_insert: string;
  /** Passage text with [A] [B] [C] [D] markers showing insertion candidates */
  passage_with_markers: string;
  correct: "A" | "B" | "C" | "D";
}

/** Prose Summary — select 3 of 6 major ideas (2 points) */
export interface ProseSummaryQuestion extends QuestionBase {
  section: "reading";
  qtype: "prose_summary";
  passage_id: string;
  question: string;
  intro_sentence: string;
  choices: string[];
  /** Exactly 3 correct answers */
  correct: string[];
}

// ─── Listening question types ─────────────────────────────────────────────────

export interface ToeflListeningScript {
  id: string;
  title: string;
  type: "lecture" | "conversation";
  transcript: string;
}

/** All listening questions reference a script and are single-select MC */
export interface ListeningQuestion extends QuestionBase {
  section: "listening";
  qtype:
    | "listening_detail"
    | "listening_main_idea"
    | "listening_function"
    | "listening_attitude"
    | "listening_inference"
    | "listening_choose_response";
  script_id: string;
  question: string;
  choices: string[];
  correct: string;
}

// ─── Writing question types ───────────────────────────────────────────────────

/** Academic Discussion — 10 min, ≥100 words, respond to professor + 2 students */
export interface WritingDiscussionQuestion extends QuestionBase {
  section: "writing";
  qtype: "writing_discussion";
  professor_prompt: string;
  student_a: { name: string; post: string };
  student_b: { name: string; post: string };
  /** Rubric guidance shown after timer */
  rubric_checklist: string[];
}

/** Integrated Writing — read passage + listen to lecture, 20 min */
export interface WritingIntegratedQuestion extends QuestionBase {
  section: "writing";
  qtype: "writing_integrated";
  reading_passage: string;
  lecture_transcript: string;
  prompt: string;
  rubric_checklist: string[];
}

// ─── Union type ───────────────────────────────────────────────────────────────

/** 2026 Build a Sentence: arrange tiles to reply to a context sentence. All-or-nothing. */
export interface WritingBuildSentenceQuestion extends QuestionBase {
  section: "writing";
  qtype: "writing_build_sentence";
  context: string;
  /** Reply frame in order; fixed segments are pre-printed, the rest are blanks. */
  segments: { text: string; fixed?: boolean }[];
  /** Closing punctuation shown after the last segment. */
  punctuation: "?" | ".";
  /** Scrambled tiles, including the distractor when present. */
  tiles: string[];
  distractor?: string;
}

/** 2026 Write an Email: situation, recipient, three bullet points, 7 minutes. */
export interface WritingEmailQuestion extends QuestionBase {
  section: "writing";
  qtype: "writing_email";
  scenario: string;
  to: string;
  subject: string;
  bullets: string[];
  rubric_checklist: string[];
}

/** 2026 Complete the Words: one paragraph, ten gaps built by makeCompleteWords(). */
export interface CompleteWordsQuestion extends QuestionBase {
  section: "reading";
  qtype: "complete_words";
  paragraph: string;
}

export type AnyToeflQuestion =
  | FactualQuestion
  | InferenceQuestion
  | VocabularyQuestion
  | SentenceSimplificationQuestion
  | InsertTextQuestion
  | ProseSummaryQuestion
  | ListeningQuestion
  | WritingDiscussionQuestion
  | WritingIntegratedQuestion
  | WritingBuildSentenceQuestion
  | WritingEmailQuestion
  | CompleteWordsQuestion;

// ─── Adaptive state ───────────────────────────────────────────────────────────

export interface TopicStat {
  rating: number;
  attempts: number;
  correct: number;
  lastSeenAt: number | null;
  recentQuestionIds: string[];
}

export interface AttemptRecord {
  questionId: string;
  section: ToeflSection;
  topic: string;
  difficulty: Difficulty;
  correct: boolean;
  timestamp: number;
  ratingBefore: number;
  ratingAfter: number;
}

export interface AdaptiveState {
  version: 1;
  sectionRatings: Record<ToeflSection, number>;
  topicStats: Record<string, TopicStat>;
  attempts: AttemptRecord[];
}

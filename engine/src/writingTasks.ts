/**
 * TOEFL iBT 2026-format writing/reading helpers: Build a Sentence grading and
 * Complete the Words generation/grading. Pure functions, no I/O.
 */

export interface BuildSegment {
  text: string;
  /** Printed in the frame already; the learner does not place it. */
  fixed?: boolean;
}

/** The tiles that must be placed, in the correct order. */
export function buildSentenceAnswer(segments: BuildSegment[]): string[] {
  return segments.filter((s) => !s.fixed).map((s) => s.text);
}

/** All-or-nothing: every blank must hold exactly the right tile. */
export function gradeBuildSentence(segments: BuildSegment[], placed: Array<string | null | undefined>): boolean {
  const answer = buildSentenceAnswer(segments);
  if (placed.length !== answer.length) return false;
  return answer.every((tile, i) => placed[i] === tile);
}

/** Renders the finished reply, e.g. for the answer reveal. */
export function renderBuildSentence(segments: BuildSegment[], punctuation: string, placed?: string[]): string {
  let k = 0;
  const parts = segments.map((s) => (s.fixed ? s.text : placed ? placed[k++] ?? "_____" : s.text));
  return parts.join(" ") + punctuation;
}

// ---- Complete the Words ---------------------------------------------------

export type CompleteWordsToken =
  | { kind: "text"; text: string }
  | { kind: "gap"; prefix: string; missing: string; before: string; after: string };

const CORE = /^([^A-Za-z]*)([A-Za-z]+)([^A-Za-z]*)$/;

function isSentenceEnd(word: string): boolean {
  return /[.!?]["')\]]*$/.test(word);
}

/**
 * Applies the 2026 Complete the Words rule: the first sentence stays whole; from the
 * second sentence on, the second half of every second eligible word is removed
 * (a word of n letters keeps floor(n / 2) letters) until `gaps` words are gapped.
 * Words with digits, one-letter words, and capitalised words that do not start a
 * sentence (names) are never gapped and do not count toward "every second word".
 */
export function makeCompleteWords(paragraph: string, gaps = 10): CompleteWordsToken[] {
  const words = paragraph.trim().split(/\s+/);
  const tokens: CompleteWordsToken[] = [];
  let inFirstSentence = true;
  let sentenceStart = true;
  let eligibleSeen = 0;
  let gapped = 0;
  let pendingText = "";

  const flush = () => {
    if (pendingText) {
      tokens.push({ kind: "text", text: pendingText });
      pendingText = "";
    }
  };

  words.forEach((word, idx) => {
    const m = word.match(CORE);
    const sep = idx === 0 ? "" : " ";
    let eligible = false;
    if (!inFirstSentence && gapped < gaps && m) {
      const core = m[2];
      const capitalisedName = /^[A-Z]/.test(core) && !sentenceStart;
      eligible = core.length >= 2 && !capitalisedName && !/\d/.test(word);
    }
    if (eligible && m) {
      eligibleSeen++;
      if (eligibleSeen % 2 === 0) {
        const core = m[2];
        const keep = Math.floor(core.length / 2);
        pendingText += sep + m[1];
        flush();
        tokens.push({ kind: "gap", prefix: core.slice(0, keep), missing: core.slice(keep), before: "", after: m[3] });
        gapped++;
      } else {
        pendingText += sep + word;
      }
    } else {
      pendingText += sep + word;
    }
    if (isSentenceEnd(word)) {
      inFirstSentence = false;
      sentenceStart = true;
    } else {
      sentenceStart = false;
    }
  });
  flush();
  return tokens;
}

export function completeWordsAnswers(tokens: CompleteWordsToken[]): string[] {
  return tokens.filter((t): t is Extract<CompleteWordsToken, { kind: "gap" }> => t.kind === "gap").map((t) => t.prefix + t.missing);
}

/** Per-gap result: the learner types only the missing letters (case-insensitive, exact spelling). */
export function gradeCompleteWords(tokens: CompleteWordsToken[], typed: string[]): boolean[] {
  const gapsOnly = tokens.filter((t): t is Extract<CompleteWordsToken, { kind: "gap" }> => t.kind === "gap");
  return gapsOnly.map((g, i) => (typed[i] ?? "").trim().toLowerCase() === g.missing.toLowerCase());
}

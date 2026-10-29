import type { AnyToeflQuestion, ToeflPassage, ToeflListeningScript } from "./types";

interface RawBank {
  factual?: unknown[];
  negative_factual?: unknown[];
  inference?: unknown[];
  rhetorical_purpose?: unknown[];
  vocabulary?: unknown[];
  reference?: unknown[];
  sentence_simplification?: unknown[];
  insert_text?: unknown[];
  prose_summary?: unknown[];
  listening?: unknown[];
  writing_discussion?: unknown[];
  writing_integrated?: unknown[];
  writing_build_sentence?: unknown[];
  writing_email?: unknown[];
  complete_words?: unknown[];
}

export function loadQuestionBank(raw: RawBank): AnyToeflQuestion[] {
  const allArrays = Object.values(raw).filter(Array.isArray);
  const questions: AnyToeflQuestion[] = [];
  for (const arr of allArrays) {
    for (const item of arr) {
      if (item && typeof item === "object" && "id" in item && "qtype" in item && "topic" in item) {
        questions.push(item as AnyToeflQuestion);
      }
    }
  }
  return questions;
}

export function loadPassages(raw: unknown[]): ToeflPassage[] {
  return (raw as ToeflPassage[]).filter((p) => p?.id && p?.text);
}

export function loadScripts(raw: unknown[]): ToeflListeningScript[] {
  return (raw as ToeflListeningScript[]).filter((s) => s?.id && s?.transcript);
}

export function getPassageById(passages: ToeflPassage[], id: string): ToeflPassage {
  const p = passages.find((p) => p.id === id);
  if (!p) throw new Error(`Passage not found: ${id}`);
  return p;
}

export function getScriptById(scripts: ToeflListeningScript[], id: string): ToeflListeningScript {
  const s = scripts.find((s) => s.id === id);
  if (!s) throw new Error(`Script not found: ${id}`);
  return s;
}

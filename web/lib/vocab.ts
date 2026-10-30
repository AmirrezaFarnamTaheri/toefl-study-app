import { newCard, type SrsCard } from "toefl-adaptive-engine";
import words from "../../data/vocab/words.json";

export interface VocabWord {
  id: string;
  word: string;
  definition: string;
  example: string;
  pos: string;
  forms: string;
  sublist: number;
  list: string;
  difficulty: number;
}

export const VOCAB: VocabWord[] = words as VocabWord[];

const KEY = "toefl-study-vocab-srs-v1";

export type VocabProgress = Record<string, SrsCard>;

export function loadVocabProgress(): VocabProgress {
  if (typeof localStorage === "undefined") return {};
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "{}");
    return parsed && typeof parsed === "object" ? (parsed as VocabProgress) : {};
  } catch {
    return {};
  }
}

export function saveVocabProgress(progress: VocabProgress): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(progress));
}

export function cardFor(progress: VocabProgress, id: string, now: number): SrsCard {
  return progress[id] ?? newCard(now);
}

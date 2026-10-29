import type { AdaptiveState } from "./types";
import { createInitialState } from "./engine";

const STORAGE_KEY = "toefl-adaptive-state";

export function loadState(): AdaptiveState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw) as AdaptiveState;
    if (parsed.version !== 1) return createInitialState();
    return parsed;
  } catch {
    return createInitialState();
  }
}

export function saveState(state: AdaptiveState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage full or unavailable — fail silently
  }
}

export function exportState(state: AdaptiveState): string {
  return JSON.stringify(state, null, 2);
}

export function importState(text: string): AdaptiveState {
  const parsed = JSON.parse(text) as AdaptiveState;
  if (parsed.version !== 1 || !parsed.sectionRatings || !parsed.topicStats) {
    throw new Error("Invalid TOEFL progress export file.");
  }
  return parsed;
}

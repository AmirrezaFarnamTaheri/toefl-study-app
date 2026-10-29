"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createInitialState,
  loadState,
  saveState,
  recordAnswer as engineRecordAnswer,
} from "toefl-adaptive-engine";
import type { AdaptiveState, AnyToeflQuestion } from "toefl-adaptive-engine";

export function useAdaptiveState() {
  const [state, setState] = useState<AdaptiveState>(() => createInitialState());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  const recordAnswer = useCallback((question: AnyToeflQuestion, correct: boolean) => {
    setState((prev) => engineRecordAnswer(prev, question, correct));
  }, []);

  const replaceState = useCallback((next: AdaptiveState) => {
    setState(next);
  }, []);

  return { state, recordAnswer, replaceState, hydrated };
}

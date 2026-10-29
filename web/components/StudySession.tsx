"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { selectNextQuestion } from "toefl-adaptive-engine";
import type { AnyToeflQuestion, ToeflSection } from "toefl-adaptive-engine";
import { BANK } from "@/lib/questionBank";
import { useAdaptiveState } from "@/lib/useAdaptiveState";
import QuestionRenderer from "@/components/questions/QuestionRenderer";

export default function StudySession({ section }: { section: ToeflSection | undefined }) {
  const { state, recordAnswer, hydrated } = useAdaptiveState();
  const [question, setQuestion] = useState<AnyToeflQuestion | null>(null);
  const [answered, setAnswered] = useState(false);

  const pickNext = useCallback(() => {
    setQuestion(selectNextQuestion(state, BANK, { section }));
    setAnswered(false);
  }, [state, section]);

  useEffect(() => {
    if (hydrated && !question) pickNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  function handleAnswered(correct: boolean) {
    if (!question) return;
    recordAnswer(question, correct);
    setAnswered(true);
  }

  if (!hydrated) {
    return (
      <main className="container">
        <p>Loading session...</p>
      </main>
    );
  }

  const heading = section
    ? `TOEFL ${section[0].toUpperCase()}${section.slice(1)} Practice`
    : "TOEFL Mixed Adaptive Practice";

  return (
    <main className="container">
      <div className="session-header">
        <Link href="/">&larr; Back to Dashboard</Link>
        <h1>{heading}</h1>
      </div>

      {question ? (
        <QuestionRenderer key={question.id} question={question} onAnswered={handleAnswered} />
      ) : (
        <p>No questions available for this selection.</p>
      )}

      {answered && (
        <button className="button next-button" onClick={pickNext}>
          Next Question &rarr;
        </button>
      )}
    </main>
  );
}

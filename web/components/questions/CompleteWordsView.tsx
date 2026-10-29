"use client";

import { useMemo, useState } from "react";
import { gradeCompleteWords, makeCompleteWords } from "toefl-adaptive-engine";
import type { CompleteWordsQuestion } from "toefl-adaptive-engine";
import CompleteWordsBoard, { COMPLETE_WORDS_PASS } from "./CompleteWordsBoard";

export default function CompleteWordsView({
  question,
  onAnswered,
}: {
  question: CompleteWordsQuestion;
  onAnswered: (correct: boolean) => void;
}) {
  const tokens = useMemo(() => makeCompleteWords(question.paragraph, 10), [question.paragraph]);
  const total = tokens.filter((t) => t.kind === "gap").length;
  const [typed, setTyped] = useState<string[]>(() => Array(total).fill(""));
  const [results, setResults] = useState<boolean[] | undefined>(undefined);

  function check() {
    const r = gradeCompleteWords(tokens, typed);
    setResults(r);
    onAnswered(r.filter(Boolean).length >= COMPLETE_WORDS_PASS);
  }

  const score = results ? results.filter(Boolean).length : 0;

  return (
    <div className="question">
      <span className="qtype-badge">Reading &bull; Complete the Words (10 gaps)</span>
      <CompleteWordsBoard question={question} typed={typed} onChange={setTyped} results={results} locked={!!results} />
      {results ? (
        <div className={`feedback ${score >= COMPLETE_WORDS_PASS ? "correct" : "incorrect"}`} style={{ marginTop: "1rem" }}>
          <strong>
            {score}/{total} gaps correct
          </strong>
          <p className="explanation">{question.explanation}</p>
        </div>
      ) : (
        <div style={{ marginTop: "1rem" }}>
          <button onClick={check} disabled={typed.every((v) => !v.trim())}>
            Check Answers
          </button>
        </div>
      )}
    </div>
  );
}

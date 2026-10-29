"use client";

import { useState } from "react";
import { gradeBuildSentence, renderBuildSentence, buildSentenceAnswer } from "toefl-adaptive-engine";
import type { WritingBuildSentenceQuestion } from "toefl-adaptive-engine";
import BuildSentenceBoard, { emptyPlaced, type BuildPlaced } from "./BuildSentenceBoard";

export default function WritingBuildSentenceView({
  question,
  onAnswered,
}: {
  question: WritingBuildSentenceQuestion;
  onAnswered: (correct: boolean) => void;
}) {
  const [placed, setPlaced] = useState<BuildPlaced>(() => emptyPlaced(question));
  const [result, setResult] = useState<boolean | null>(null);
  const complete = placed.every((p) => p !== null);

  function check() {
    const correct = gradeBuildSentence(question.segments, placed);
    setResult(correct);
    onAnswered(correct);
  }

  return (
    <div className="question">
      <span className="qtype-badge">Writing &bull; Build a Sentence (1 point, all-or-nothing)</span>
      <BuildSentenceBoard question={question} placed={placed} onChange={setPlaced} locked={result !== null} />

      {result === null ? (
        <div style={{ marginTop: "1rem", display: "flex", gap: "0.75rem" }}>
          <button onClick={check} disabled={!complete}>
            Check Answer
          </button>
          <button onClick={() => setPlaced(emptyPlaced(question))} style={{ background: "transparent", color: "var(--fg)", borderColor: "var(--border)" }}>
            Reset
          </button>
        </div>
      ) : (
        <div className={`feedback ${result ? "correct" : "incorrect"}`} style={{ marginTop: "1rem" }}>
          <strong>{result ? "Correct" : "Not quite"}</strong>
          {!result && (
            <p style={{ margin: "0.4rem 0 0" }}>
              Correct reply: <em>{renderBuildSentence(question.segments, question.punctuation, buildSentenceAnswer(question.segments))}</em>
            </p>
          )}
          <p className="explanation">{question.explanation}</p>
        </div>
      )}
    </div>
  );
}

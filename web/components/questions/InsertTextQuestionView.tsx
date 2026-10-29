"use client";

import { useState } from "react";
import type { InsertTextQuestion } from "toefl-adaptive-engine";

type MarkerLetter = "A" | "B" | "C" | "D";
const MARKERS: MarkerLetter[] = ["A", "B", "C", "D"];

export default function InsertTextQuestionView({
  question,
  onAnswered,
}: {
  question: InsertTextQuestion;
  onAnswered: (correct: boolean) => void;
}) {
  const [selected, setSelected] = useState<MarkerLetter | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const isCorrect = selected === question.correct;

  function handleSubmit() {
    if (!selected || submitted) return;
    setSubmitted(true);
    onAnswered(selected === question.correct);
  }

  // Split passage_with_markers on [A], [B], [C], [D]
  const parts = question.passage_with_markers.split(/(\[[ABCD]\])/g);

  return (
    <div className="question">
      <span className="qtype-badge">Reading • Insert a Sentence</span>

      <div className="highlight-box">
        <strong>Sentence to Insert:</strong>
        <div style={{ marginTop: "0.3rem", fontWeight: 700 }}>
          &ldquo;{question.sentence_to_insert}&rdquo;
        </div>
      </div>

      <p className="prompt">
        Click on one of the four squares [A], [B], [C], or [D] in the passage below to insert the sentence:
      </p>

      <div className="passage-box" style={{ maxHeight: "none" }}>
        {parts.map((part, idx) => {
          const match = part.match(/^\[([ABCD])\]$/);
          if (match) {
            const letter = match[1] as MarkerLetter;
            const isSelected = selected === letter;
            return (
              <button
                key={idx}
                type="button"
                disabled={submitted}
                onClick={() => setSelected(letter)}
                className={`insert-slot ${isSelected ? "selected" : ""}`}
              >
                [{letter}]
                {isSelected ? ` "${question.sentence_to_insert}" ` : ""}
              </button>
            );
          }
          return <span key={idx}>{part}</span>;
        })}
      </div>

      {!submitted && (
        <button onClick={handleSubmit} disabled={!selected}>
          Submit Answer {selected ? `(Position [${selected}])` : ""}
        </button>
      )}

      {submitted && (
        <div className={`feedback ${isCorrect ? "correct" : "incorrect"}`}>
          <strong>
            {isCorrect
              ? `Correct! Position [${question.correct}] is the right placement.`
              : `Incorrect. Correct position: [${question.correct}]`}
          </strong>
          <p className="explanation">{question.explanation}</p>
        </div>
      )}
    </div>
  );
}

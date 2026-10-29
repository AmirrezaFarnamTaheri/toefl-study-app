"use client";

import { useState } from "react";
import type { ProseSummaryQuestion } from "toefl-adaptive-engine";
import { getPassageById } from "@/lib/questionBank";

export default function ProseSummaryQuestionView({
  question,
  onAnswered,
}: {
  question: ProseSummaryQuestion;
  onAnswered: (correct: boolean) => void;
}) {
  const passage = getPassageById(question.passage_id);
  const [selected, setSelected] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  function toggleChoice(choice: string) {
    if (submitted) return;
    setSelected((prev) => {
      if (prev.includes(choice)) return prev.filter((c) => c !== choice);
      if (prev.length >= 3) return prev;
      return [...prev, choice];
    });
  }

  const isCorrect =
    selected.length === 3 &&
    question.correct.every((c) => selected.includes(c));

  function handleSubmit() {
    if (selected.length !== 3 || submitted) return;
    setSubmitted(true);
    onAnswered(isCorrect);
  }

  return (
    <div className="question">
      <span className="qtype-badge">Reading • Prose Summary (Select 3 of 6)</span>
      <div className="passage-box">
        <div className="passage-title">{passage.title}</div>
        <div>{passage.text}</div>
      </div>

      <p className="prompt">{question.question}</p>

      <div className="highlight-box">
        <strong>Introductory Summary Sentence:</strong>
        <div style={{ marginTop: "0.25rem", fontWeight: 700 }}>{question.intro_sentence}</div>
      </div>

      <p style={{ fontSize: "0.9rem", color: "var(--muted)" }}>
        Selected: <strong>{selected.length} / 3</strong>
      </p>

      <ul className="choice-list">
        {question.choices.map((choice) => {
          const checked = selected.includes(choice);
          const isAnswer = question.correct.includes(choice);
          let cls = "choice";
          if (submitted) {
            if (isAnswer) cls += " correct";
            else if (checked) cls += " incorrect";
          }
          return (
            <li key={choice}>
              <label className={cls}>
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={submitted || (!checked && selected.length >= 3)}
                  onChange={() => toggleChoice(choice)}
                />
                <span>{choice}</span>
              </label>
            </li>
          );
        })}
      </ul>

      {!submitted && (
        <button onClick={handleSubmit} disabled={selected.length !== 3}>
          Submit Summary (Select 3)
        </button>
      )}

      {submitted && (
        <div className={`feedback ${isCorrect ? "correct" : "incorrect"}`}>
          <strong>
            {isCorrect
              ? "Correct! All 3 major ideas selected."
              : "Incorrect. Review the 3 highlighted correct choices above."}
          </strong>
          <p className="explanation">{question.explanation}</p>
        </div>
      )}
    </div>
  );
}

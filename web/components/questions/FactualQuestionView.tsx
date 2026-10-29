"use client";

import { useState } from "react";
import type { FactualQuestion } from "toefl-adaptive-engine";
import { getPassageById } from "@/lib/questionBank";

export default function FactualQuestionView({
  question,
  onAnswered,
}: {
  question: FactualQuestion;
  onAnswered: (correct: boolean) => void;
}) {
  const passage = getPassageById(question.passage_id);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const isCorrect = selected === question.correct;

  function handleSubmit() {
    if (!selected || submitted) return;
    setSubmitted(true);
    onAnswered(selected === question.correct);
  }

  return (
    <div className="question">
      <span className="qtype-badge">Reading • Factual Information</span>
      <div className="passage-box">
        <div className="passage-title">{passage.title}</div>
        <div>{passage.text}</div>
      </div>

      <p className="prompt">{question.question}</p>

      <ul className="choice-list">
        {question.choices.map((choice) => {
          let cls = "choice";
          if (submitted) {
            if (choice === question.correct) cls += " correct";
            else if (choice === selected) cls += " incorrect";
          }
          return (
            <li key={choice}>
              <label className={cls}>
                <input
                  type="radio"
                  name={question.id}
                  checked={selected === choice}
                  disabled={submitted}
                  onChange={() => setSelected(choice)}
                />
                <span>{choice}</span>
              </label>
            </li>
          );
        })}
      </ul>

      {!submitted && (
        <button onClick={handleSubmit} disabled={!selected}>
          Submit Answer
        </button>
      )}

      {submitted && (
        <div className={`feedback ${isCorrect ? "correct" : "incorrect"}`}>
          <strong>{isCorrect ? "Correct!" : `Incorrect. Correct answer: ${question.correct}`}</strong>
          <p className="explanation">{question.explanation}</p>
        </div>
      )}
    </div>
  );
}

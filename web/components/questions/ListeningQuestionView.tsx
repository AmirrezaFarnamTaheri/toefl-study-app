"use client";

import { useState } from "react";
import type { ListeningQuestion } from "toefl-adaptive-engine";
import { getScriptById } from "@/lib/questionBank";

export default function ListeningQuestionView({
  question,
  onAnswered,
}: {
  question: ListeningQuestion;
  onAnswered: (correct: boolean) => void;
}) {
  const script = getScriptById(question.script_id);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const isCorrect = selected === question.correct;

  function handleSubmit() {
    if (!selected || submitted) return;
    setSubmitted(true);
    onAnswered(selected === question.correct);
  }

  const labelMap: Record<ListeningQuestion["qtype"], string> = {
    listening_main_idea: "Listening • Gist-Content / Main Idea",
    listening_detail: "Listening • Detail",
    listening_function: "Listening • Pragmatic Function",
    listening_attitude: "Listening • Speaker Attitude",
    listening_inference: "Listening • Inference",
  };

  return (
    <div className="question">
      <span className="qtype-badge">{labelMap[question.qtype]}</span>
      <div className="passage-box">
        <div className="passage-title">
          🎧 {script.title} ({script.type.toUpperCase()})
        </div>
        <div>{script.transcript}</div>
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

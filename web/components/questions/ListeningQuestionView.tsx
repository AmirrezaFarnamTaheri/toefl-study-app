"use client";

import { useState } from "react";
import type { ListeningQuestion } from "toefl-adaptive-engine";
import { getScriptById } from "@/lib/questionBank";
import ScriptPlayer from "./ScriptPlayer";

const labelMap: Record<ListeningQuestion["qtype"], string> = {
  listening_main_idea: "Listening \u2022 Gist-Content / Main Idea",
  listening_detail: "Listening \u2022 Detail",
  listening_function: "Listening \u2022 Pragmatic Function",
  listening_attitude: "Listening \u2022 Speaker Attitude",
  listening_inference: "Listening \u2022 Inference",
  listening_choose_response: "Listening \u2022 Listen and Choose a Response",
};

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
  const [showTranscript, setShowTranscript] = useState(false);

  const isCorrect = selected === question.correct;

  function handleSubmit() {
    if (!selected || submitted) return;
    setSubmitted(true);
    onAnswered(selected === question.correct);
  }

  return (
    <div className="question">
      <span className="qtype-badge">{labelMap[question.qtype]}</span>
      <div className="passage-box">
        <div className="passage-title">
          {script.title} ({script.type.toUpperCase()})
        </div>
        <ScriptPlayer transcript={script.transcript} />
        {submitted || showTranscript ? (
          <div>{script.transcript}</div>
        ) : (
          <button
            type="button"
            onClick={() => setShowTranscript(true)}
            style={{ background: "transparent", color: "var(--fg)", borderColor: "var(--border)" }}
          >
            Show transcript
          </button>
        )}
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

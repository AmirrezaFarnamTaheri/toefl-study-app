"use client";

import { useEffect, useState } from "react";
import type { WritingEmailQuestion } from "toefl-adaptive-engine";

export default function WritingEmailView({
  question,
  onAnswered,
}: {
  question: WritingEmailQuestion;
  onAnswered: (correct: boolean) => void;
}) {
  const [response, setResponse] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(7 * 60);
  const [phase, setPhase] = useState<"writing" | "rubric" | "done">("writing");
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (phase !== "writing") return;
    const t = setInterval(() => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [phase]);

  const wordCount = response.trim() ? response.trim().split(/\s+/).length : 0;
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const checkedCount = Object.values(checked).filter(Boolean).length;

  function selfGrade(passed: boolean) {
    setPhase("done");
    onAnswered(passed);
  }

  return (
    <div className="question">
      <span className="qtype-badge">Writing &bull; Write an Email (7 Min)</span>

      <div className="timer-bar">
        <span>
          Time Remaining:{" "}
          <strong>
            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </strong>
        </span>
        <span>
          Word Count: <strong>{wordCount}</strong> (write as much as you can)
        </span>
      </div>

      <div className="passage-box" style={{ maxHeight: "none" }}>
        <div className="passage-title">Situation</div>
        <div>{question.scenario}</div>
        <p style={{ marginBottom: 4 }}>Write an email that should:</p>
        <ul style={{ marginTop: 0 }}>
          {question.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        <div>
          <strong>To:</strong> {question.to}
        </div>
        <div>
          <strong>Subject:</strong> {question.subject}
        </div>
      </div>

      <textarea
        className="writing-textarea"
        placeholder="Start with a greeting and write your email in complete sentences..."
        value={response}
        disabled={phase !== "writing"}
        onChange={(e) => setResponse(e.target.value)}
      />

      {phase === "writing" && (
        <div style={{ marginTop: "1rem" }}>
          <button onClick={() => setPhase("rubric")} disabled={wordCount < 10}>
            Finish Writing &amp; Evaluate with Rubric
          </button>
        </div>
      )}

      {phase !== "writing" && (
        <div className="feedback" style={{ marginTop: "1.25rem" }}>
          <h3 style={{ marginTop: 0 }}>
            Self-Assessment Rubric Checklist ({checkedCount}/{question.rubric_checklist.length})
          </h3>
          <ul className="choice-list">
            {question.rubric_checklist.map((item, idx) => (
              <li key={idx}>
                <label className="choice">
                  <input
                    type="checkbox"
                    checked={!!checked[idx]}
                    disabled={phase === "done"}
                    onChange={() => setChecked((p) => ({ ...p, [idx]: !p[idx] }))}
                  />
                  <span>{item}</span>
                </label>
              </li>
            ))}
          </ul>
          {phase === "rubric" && (
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
              <button onClick={() => selfGrade(true)}>Met Rubric Standards (Pass)</button>
              <button onClick={() => selfGrade(false)} style={{ backgroundColor: "#dc2626", borderColor: "#dc2626" }}>
                Needs Improvement (Mark for Review)
              </button>
            </div>
          )}
          {phase === "done" && (
            <p className="explanation">
              Self-evaluation recorded ({checkedCount}/{question.rubric_checklist.length} criteria met, {wordCount} words written).
            </p>
          )}
        </div>
      )}
    </div>
  );
}

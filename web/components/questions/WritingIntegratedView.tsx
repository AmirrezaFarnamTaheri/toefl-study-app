"use client";

import { useEffect, useState } from "react";
import type { WritingIntegratedQuestion } from "toefl-adaptive-engine";

export default function WritingIntegratedView({
  question,
  onAnswered,
}: {
  question: WritingIntegratedQuestion;
  onAnswered: (correct: boolean) => void;
}) {
  const [response, setResponse] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(20 * 60); // 20 minutes
  const [phase, setPhase] = useState<"writing" | "rubric" | "done">("writing");
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (phase !== "writing") return;
    const t = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  const wordCount = response.trim() ? response.trim().split(/\s+/).length : 0;
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  function toggleChecklist(idx: number) {
    setCheckedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  }

  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const totalRubric = question.rubric_checklist.length;

  function handleSelfGrade(passed: boolean) {
    setPhase("done");
    onAnswered(passed);
  }

  return (
    <div className="question">
      <span className="qtype-badge">Writing • Integrated Task (20 Min • 150–225 Words) (legacy, retired in 2026)</span>

      <div className="timer-bar">
        <span>
          ⏱️ Time Remaining:{" "}
          <strong>
            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </strong>
        </span>
        <span>
          Word Count:{" "}
          <strong style={{ color: wordCount >= 150 ? "var(--correct-border)" : "inherit" }}>
            {wordCount}
          </strong>{" "}
          (Target: 150–225 words)
        </span>
      </div>

      <div className="student-posts">
        <div className="passage-box" style={{ marginBottom: 0 }}>
          <div className="passage-title">📖 Reading Passage</div>
          <div>{question.reading_passage}</div>
        </div>
        <div className="passage-box" style={{ marginBottom: 0 }}>
          <div className="passage-title">🎧 Lecture Transcript</div>
          <div>{question.lecture_transcript}</div>
        </div>
      </div>

      <p className="prompt">{question.prompt}</p>

      <textarea
        className="writing-textarea"
        placeholder="Write your integrated response summarizing how the lecture challenges the reading passage (150–225 words)..."
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
          <h3 style={{ marginTop: 0 }}>Self-Assessment Rubric Checklist ({checkedCount}/{totalRubric})</h3>
          <ul className="choice-list">
            {question.rubric_checklist.map((item, idx) => (
              <li key={idx}>
                <label className="choice">
                  <input
                    type="checkbox"
                    checked={!!checkedItems[idx]}
                    disabled={phase === "done"}
                    onChange={() => toggleChecklist(idx)}
                  />
                  <span>{item}</span>
                </label>
              </li>
            ))}
          </ul>

          {phase === "rubric" && (
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
              <button onClick={() => handleSelfGrade(true)}>
                ✓ Met Rubric Standards (Pass)
              </button>
              <button
                onClick={() => handleSelfGrade(false)}
                style={{ backgroundColor: "#dc2626", borderColor: "#dc2626" }}
              >
                ✗ Needs Improvement (Mark for Review)
              </button>
            </div>
          )}

          {phase === "done" && (
            <p className="explanation">
              Self-evaluation recorded ({checkedCount}/{totalRubric} rubric criteria met, {wordCount} words written).
            </p>
          )}
        </div>
      )}
    </div>
  );
}

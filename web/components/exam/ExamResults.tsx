"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import type { AnyToeflQuestion } from "toefl-adaptive-engine";
import { useAdaptiveState } from "@/lib/useAdaptiveState";

interface ExamResultsProps {
  questions: AnyToeflQuestion[];
  userAnswers: Record<string, any>;
  timeSpentSec: number;
  sectionTitle: string;
  onRetake: () => void;
  onRetakeFresh: () => void;
}

export function gradeToeflQuestion(q: AnyToeflQuestion, ans: any): boolean {
  if (ans === undefined || ans === null || ans === "") return false;
  if (q.section === "writing") {
    const words = typeof ans === "string" && ans.trim() ? ans.trim().split(/\s+/).length : 0;
    return q.qtype === "writing_discussion" ? words >= 100 : words >= 150;
  }
  if (q.qtype === "prose_summary") {
    if (!Array.isArray(ans) || ans.length !== 3) return false;
    return q.correct.every((c) => ans.includes(c));
  }
  return ans === q.correct;
}

export default function ExamResults({
  questions,
  userAnswers,
  timeSpentSec,
  sectionTitle,
  onRetake,
  onRetakeFresh,
}: ExamResultsProps) {
  const { recordAnswer, hydrated } = useAdaptiveState();
  const recordedRef = useRef(false);

  const results = questions.map((q) => ({
    question: q,
    userAnswer: userAnswers[q.id],
    correct: gradeToeflQuestion(q, userAnswers[q.id]),
  }));

  useEffect(() => {
    if (!hydrated || recordedRef.current) return;
    recordedRef.current = true;
    for (const r of results) {
      recordAnswer(r.question, r.correct);
    }
  }, [hydrated, results, recordAnswer]);

  const correctCount = results.filter((r) => r.correct).length;
  const accuracy =
    questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
  const scaledScore = Math.round((correctCount / Math.max(1, questions.length)) * 30);

  const mins = Math.floor(timeSpentSec / 60);
  const secs = timeSpentSec % 60;

  return (
    <main className="container">
      <div className="session-header">
        <Link href="/">&larr; Back to Dashboard</Link>
        <h1>{sectionTitle} — Official Diagnostic Report</h1>
      </div>

      <section className="section-ratings">
        <div className="rating-card">
          <h2>Raw Score</h2>
          <p className="rating-value">
            {correctCount} / {questions.length}
          </p>
        </div>
        <div className="rating-card">
          <h2>Estimated Section Score</h2>
          <p className="rating-value">{scaledScore} / 30</p>
        </div>
        <div className="rating-card">
          <h2>Accuracy</h2>
          <p className="rating-value">{accuracy}%</p>
        </div>
        <div className="rating-card">
          <h2>Time Used</h2>
          <p className="rating-value">
            {mins}m {secs}s
          </p>
        </div>
      </section>

      <div className="study-links">
        <button onClick={onRetake}>Retry Same Questions</button>
        <button onClick={onRetakeFresh}>New Timed Section</button>
        <Link href="/" className="button">
          Return to Dashboard
        </Link>
      </div>

      <h2>Question-by-Question Review</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {results.map(({ question, userAnswer, correct }, idx) => (
          <div
            key={question.id}
            className={`feedback ${correct ? "correct" : "incorrect"}`}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>
                Q{idx + 1} • {question.qtype.replace(/_/g, " ").toUpperCase()}
              </strong>
              <span>{correct ? "✓ Correct / Complete" : "✗ Incorrect / Incomplete"}</span>
            </div>

            {"question" in question && <p style={{ margin: "0.5rem 0" }}>{question.question}</p>}

            {question.section !== "writing" ? (
              <div style={{ fontSize: "0.92rem" }}>
                <div>
                  <strong>Your Answer:</strong>{" "}
                  {Array.isArray(userAnswer)
                    ? userAnswer.join(" | ")
                    : userAnswer || "(Unanswered)"}
                </div>
                <div>
                  <strong>Correct Answer:</strong>{" "}
                  {Array.isArray(question.correct)
                    ? question.correct.join(" | ")
                    : question.correct}
                </div>
              </div>
            ) : (
              <div style={{ fontSize: "0.92rem" }}>
                <div>
                  <strong>Your Response:</strong> {userAnswer || "(No response written)"}
                </div>
                <div style={{ marginTop: "0.5rem" }}>
                  <strong>Rubric Checklist:</strong>
                  <ul>
                    {question.rubric_checklist.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <p className="explanation">{question.explanation}</p>
          </div>
        ))}
      </div>
    </main>
  );
}

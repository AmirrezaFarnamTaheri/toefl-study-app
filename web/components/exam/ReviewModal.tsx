"use client";

import React from "react";
import type { AnyToeflQuestion } from "toefl-adaptive-engine";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: AnyToeflQuestion[];
  userAnswers: Record<string, any>;
  markedQuestions: Record<string, boolean>;
  onSelectQuestion: (idx: number) => void;
  currentIndex: number;
}

export default function ReviewModal({
  isOpen,
  onClose,
  questions,
  userAnswers,
  markedQuestions,
  onSelectQuestion,
  currentIndex,
}: ReviewModalProps) {
  if (!isOpen) return null;

  function isAnswered(q: AnyToeflQuestion) {
    const ans = userAnswers[q.id];
    if (ans === undefined || ans === null || ans === "") return false;
    if (q.qtype === "prose_summary") return Array.isArray(ans) && ans.length === 3;
    return true;
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        backgroundColor: "rgba(0,0,0,0.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        style={{
          backgroundColor: "var(--bg)",
          color: "var(--fg)",
          borderRadius: "10px",
          border: "1px solid var(--border)",
          maxWidth: "640px",
          width: "100%",
          padding: "1.5rem",
          maxHeight: "85vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <h2 style={{ margin: 0 }}>Review Section Questions</h2>
          <button onClick={onClose}>Close</button>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Type</th>
              <th>Status</th>
              <th>Marked</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q, idx) => {
              const answered = isAnswered(q);
              const marked = !!markedQuestions[q.id];
              return (
                <tr
                  key={q.id}
                  style={{
                    backgroundColor:
                      idx === currentIndex ? "rgba(20, 184, 166, 0.12)" : "transparent",
                  }}
                >
                  <td>{idx + 1}</td>
                  <td style={{ textTransform: "capitalize" }}>
                    {q.qtype.replace(/_/g, " ")}
                  </td>
                  <td
                    style={{
                      fontWeight: 600,
                      color: answered ? "var(--correct-border)" : "var(--muted)",
                    }}
                  >
                    {answered ? "Answered" : "Incomplete"}
                  </td>
                  <td>{marked ? "🚩 Marked" : "—"}</td>
                  <td>
                    <button
                      onClick={() => {
                        onSelectQuestion(idx);
                        onClose();
                      }}
                      style={{ padding: "0.3rem 0.65rem", fontSize: "0.85rem" }}
                    >
                      Go to Q{idx + 1}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

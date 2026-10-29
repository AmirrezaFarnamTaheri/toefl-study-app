"use client";

import React from "react";
import type { AnyToeflQuestion } from "toefl-adaptive-engine";
import { getPassageById, getScriptById } from "@/lib/questionBank";

interface ExamQuestionRendererProps {
  question: AnyToeflQuestion;
  currentAnswer: any;
  onAnswerChange: (ans: any) => void;
}

export default function ExamQuestionRenderer({
  question,
  currentAnswer,
  onAnswerChange,
}: ExamQuestionRendererProps) {
  if (question.section === "reading") {
    if (question.qtype === "insert_text") {
      const parts = question.passage_with_markers.split(/(\[[ABCD]\])/g);
      return (
        <div>
          <span className="qtype-badge">Reading • Insert a Sentence</span>
          <div className="highlight-box">
            <strong>Look at the four squares [A], [B], [C], and [D] that indicate where the following sentence could be added to the passage:</strong>
            <div style={{ marginTop: "0.4rem", fontWeight: 700 }}>
              &ldquo;{question.sentence_to_insert}&rdquo;
            </div>
          </div>
          <div className="passage-box" style={{ maxHeight: "none" }}>
            {parts.map((part, idx) => {
              const m = part.match(/^\[([ABCD])\]$/);
              if (m) {
                const letter = m[1];
                const isSelected = currentAnswer === letter;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onAnswerChange(letter)}
                    className={`insert-slot ${isSelected ? "selected" : ""}`}
                  >
                    [{letter}]{isSelected ? ` "${question.sentence_to_insert}" ` : ""}
                  </button>
                );
              }
              return <span key={idx}>{part}</span>;
            })}
          </div>
        </div>
      );
    }

    const passage = getPassageById(question.passage_id);

    if (question.qtype === "prose_summary") {
      const selected: string[] = Array.isArray(currentAnswer) ? currentAnswer : [];
      function toggleChoice(c: string) {
        if (selected.includes(c)) {
          onAnswerChange(selected.filter((x) => x !== c));
        } else if (selected.length < 3) {
          onAnswerChange([...selected, c]);
        }
      }
      return (
        <div>
          <span className="qtype-badge">Reading • Prose Summary (Select 3 of 6)</span>
          <div className="passage-box">
            <div className="passage-title">{passage.title}</div>
            <div>{passage.text}</div>
          </div>
          <p className="prompt">{question.question}</p>
          <div className="highlight-box">
            <strong>Introductory Sentence:</strong> {question.intro_sentence}
          </div>
          <p style={{ fontSize: "0.9rem", color: "var(--muted)" }}>
            Selected: <strong>{selected.length} / 3</strong>
          </p>
          <ul className="choice-list">
            {question.choices.map((c) => {
              const checked = selected.includes(c);
              return (
                <li key={c}>
                  <label className="choice">
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={!checked && selected.length >= 3}
                      onChange={() => toggleChoice(c)}
                    />
                    <span>{c}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      );
    }

    return (
      <div>
        <span className="qtype-badge">Reading • {question.qtype.replace(/_/g, " ")}</span>
        <div className="passage-box">
          <div className="passage-title">{passage.title}</div>
          <div>{passage.text}</div>
        </div>

        {question.qtype === "vocabulary" && (
          <div className="highlight-box">
            <strong>Target Word:</strong> &ldquo;{question.target_word}&rdquo; —{" "}
            <em>{question.context_sentence}</em>
          </div>
        )}

        {question.qtype === "sentence_simplification" && (
          <div className="highlight-box">
            <strong>Highlighted Sentence:</strong> {question.highlighted_sentence}
          </div>
        )}

        <p className="prompt">{question.question}</p>
        <ul className="choice-list">
          {question.choices.map((c) => (
            <li key={c}>
              <label className="choice">
                <input
                  type="radio"
                  name={question.id}
                  checked={currentAnswer === c}
                  onChange={() => onAnswerChange(c)}
                />
                <span>{c}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (question.section === "listening") {
    const script = getScriptById(question.script_id);
    return (
      <div>
        <span className="qtype-badge">Listening • {question.qtype.replace("listening_", "").replace(/_/g, " ")}</span>
        <div className="passage-box">
          <div className="passage-title">
            🎧 {script.title} ({script.type.toUpperCase()})
          </div>
          <div>{script.transcript}</div>
        </div>
        <p className="prompt">{question.question}</p>
        <ul className="choice-list">
          {question.choices.map((c) => (
            <li key={c}>
              <label className="choice">
                <input
                  type="radio"
                  name={question.id}
                  checked={currentAnswer === c}
                  onChange={() => onAnswerChange(c)}
                />
                <span>{c}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // Writing tasks in Exam Mode
  const textVal = typeof currentAnswer === "string" ? currentAnswer : "";
  const wordCount = textVal.trim() ? textVal.trim().split(/\s+/).length : 0;

  if (question.qtype === "writing_discussion") {
    return (
      <div>
        <span className="qtype-badge">Writing • Academic Discussion (Target ≥100 Words)</span>
        <div className="passage-box" style={{ maxHeight: "none" }}>
          <div className="passage-title">Professor&apos;s Prompt</div>
          <div>{question.professor_prompt}</div>
        </div>
        <div className="student-posts">
          <div className="student-card">
            <strong>{question.student_a.name}:</strong>
            <p style={{ margin: "0.35rem 0 0 0" }}>{question.student_a.post}</p>
          </div>
          <div className="student-card">
            <strong>{question.student_b.name}:</strong>
            <p style={{ margin: "0.35rem 0 0 0" }}>{question.student_b.post}</p>
          </div>
        </div>
        <div style={{ marginBottom: "0.5rem", fontSize: "0.9rem" }}>
          Word Count: <strong>{wordCount}</strong>
        </div>
        <textarea
          className="writing-textarea"
          placeholder="Type your Academic Discussion response here..."
          value={textVal}
          onChange={(e) => onAnswerChange(e.target.value)}
        />
      </div>
    );
  }

  return (
    <div>
      <span className="qtype-badge">Writing • Integrated Task (Target 150–225 Words)</span>
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
      <div style={{ marginBottom: "0.5rem", fontSize: "0.9rem" }}>
        Word Count: <strong>{wordCount}</strong>
      </div>
      <textarea
        className="writing-textarea"
        placeholder="Type your Integrated Writing essay here..."
        value={textVal}
        onChange={(e) => onAnswerChange(e.target.value)}
      />
    </div>
  );
}

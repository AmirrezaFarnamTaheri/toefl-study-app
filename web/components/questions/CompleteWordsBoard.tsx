"use client";

import { useMemo } from "react";
import { makeCompleteWords } from "toefl-adaptive-engine";
import type { CompleteWordsQuestion } from "toefl-adaptive-engine";

/** Number of correct gaps needed to count a paragraph as passed. */
export const COMPLETE_WORDS_PASS = 8;

export function gapCount(question: CompleteWordsQuestion): number {
  return makeCompleteWords(question.paragraph, 10).filter((t) => t.kind === "gap").length;
}

export default function CompleteWordsBoard({
  question,
  typed,
  onChange,
  results,
  locked = false,
}: {
  question: CompleteWordsQuestion;
  typed: string[];
  onChange: (next: string[]) => void;
  /** Per-gap correctness once checked. */
  results?: boolean[];
  locked?: boolean;
}) {
  const tokens = useMemo(() => makeCompleteWords(question.paragraph, 10), [question.paragraph]);
  let gap = -1;

  return (
    <div className="passage-box" style={{ maxHeight: "none", lineHeight: 2.2 }}>
      <div className="passage-title">Fill in the missing letters of each word</div>
      <p style={{ margin: 0 }}>
        {tokens.map((t, i) => {
          if (t.kind === "text") return <span key={i}>{t.text}</span>;
          gap += 1;
          const g = gap;
          const ok = results ? results[g] : undefined;
          return (
            <span key={i}>
              <span style={{ fontWeight: 700 }}>{t.prefix}</span>
              <input
                aria-label={`Gap ${g + 1}`}
                value={typed[g] ?? ""}
                maxLength={t.missing.length}
                disabled={locked}
                size={Math.max(2, t.missing.length)}
                spellCheck={false}
                autoComplete="off"
                onChange={(e) => {
                  const next = [...typed];
                  next[g] = e.target.value;
                  onChange(next);
                }}
                style={{
                  font: "inherit",
                  textAlign: "center",
                  borderTop: "none",
                  borderLeft: "none",
                  borderRight: "none",
                  borderBottom: `2px solid ${ok === undefined ? "var(--accent)" : ok ? "var(--correct-border)" : "var(--incorrect-border)"}`,
                  background: ok === undefined ? "transparent" : ok ? "var(--correct-bg)" : "var(--incorrect-bg)",
                  color: "var(--fg)",
                  margin: "0 1px",
                }}
              />
              {results && !results[g] && (
                <small style={{ color: "var(--muted)" }}> ({t.missing})</small>
              )}
              {t.after}
            </span>
          );
        })}
      </p>
    </div>
  );
}

"use client";

import type { WritingBuildSentenceQuestion } from "toefl-adaptive-engine";

/** Slot state: one entry per blank (non-fixed segment), holding the placed tile or null. */
export type BuildPlaced = Array<string | null>;

export function emptyPlaced(question: WritingBuildSentenceQuestion): BuildPlaced {
  return question.segments.filter((s) => !s.fixed).map(() => null);
}

const slotStyle: React.CSSProperties = {
  minWidth: 74,
  padding: "0.35rem 0.6rem",
  borderRadius: 6,
  border: "2px dashed var(--border)",
  textAlign: "center",
  background: "transparent",
  color: "var(--fg)",
  cursor: "pointer",
  font: "inherit",
};

export default function BuildSentenceBoard({
  question,
  placed,
  onChange,
  locked = false,
}: {
  question: WritingBuildSentenceQuestion;
  placed: BuildPlaced;
  onChange: (next: BuildPlaced) => void;
  locked?: boolean;
}) {
  const used = new Set(placed.filter((p): p is string => p !== null));
  let slotIndex = -1;

  function placeTile(tile: string) {
    if (locked) return;
    const first = placed.findIndex((p) => p === null);
    if (first === -1) return;
    const next = [...placed];
    next[first] = tile;
    onChange(next);
  }

  function clearSlot(i: number) {
    if (locked || placed[i] === null) return;
    const next = [...placed];
    next[i] = null;
    onChange(next);
  }

  return (
    <div>
      <div className="passage-box" style={{ maxHeight: "none", marginBottom: "1rem" }}>
        <div className="passage-title">Read the sentence, then build the reply</div>
        <div>{question.context}</div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center", margin: "1rem 0" }} aria-label="Reply frame">
        {question.segments.map((seg, i) => {
          if (seg.fixed) {
            return (
              <span key={`f${i}`} style={{ fontWeight: 700 }}>
                {seg.text}
              </span>
            );
          }
          slotIndex += 1;
          const idx = slotIndex;
          const tile = placed[idx];
          return (
            <button
              key={`s${i}`}
              type="button"
              disabled={locked}
              onClick={() => clearSlot(idx)}
              title={tile ? "Click to remove" : "Empty blank"}
              style={{
                ...slotStyle,
                borderStyle: tile ? "solid" : "dashed",
                borderColor: tile ? "var(--accent)" : "var(--border)",
                opacity: locked && !tile ? 0.6 : 1,
              }}
            >
              {tile ?? "\u00a0\u00a0\u00a0\u00a0\u00a0"}
            </button>
          );
        })}
        <span style={{ fontWeight: 700 }}>{question.punctuation}</span>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }} aria-label="Word tiles">
        {question.tiles.map((tile) => (
          <button
            key={tile}
            type="button"
            disabled={locked || used.has(tile)}
            onClick={() => placeTile(tile)}
            style={{ opacity: used.has(tile) ? 0.35 : 1 }}
          >
            {tile}
          </button>
        ))}
      </div>
    </div>
  );
}

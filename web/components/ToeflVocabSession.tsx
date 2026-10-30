"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { isDue, reviewCard, type SrsGrade } from "toefl-adaptive-engine";
import { VOCAB, cardFor, loadVocabProgress, saveVocabProgress, type VocabProgress } from "@/lib/vocab";

const NEW_PER_SESSION = 15;

export default function ToeflVocabSession() {
  const [progress, setProgress] = useState<VocabProgress>({});
  const [hydrated, setHydrated] = useState(false);
  const [queue, setQueue] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [reviewed, setReviewed] = useState(0);

  useEffect(() => {
    const saved = loadVocabProgress();
    const now = Date.now();
    const due = VOCAB.filter((w) => saved[w.id] && isDue(saved[w.id], now)).map((w) => w.id);
    const fresh = VOCAB.filter((w) => !saved[w.id]).slice(0, NEW_PER_SESSION).map((w) => w.id);
    setProgress(saved);
    setQueue([...due, ...fresh]);
    setHydrated(true);
  }, []);

  const byId = useMemo(() => new Map(VOCAB.map((w) => [w.id, w])), []);
  const learned = Object.keys(progress).length;
  const current = queue.length ? byId.get(queue[0]) : undefined;

  function grade(g: SrsGrade) {
    if (!current) return;
    const now = Date.now();
    const next = reviewCard(cardFor(progress, current.id, now), g, now);
    const updated = { ...progress, [current.id]: next };
    setProgress(updated);
    saveVocabProgress(updated);
    setReviewed((n) => n + 1);
    setRevealed(false);
    // A lapsed card goes to the back of this session's queue.
    setQueue((q) => (g === 1 ? [...q.slice(1), q[0]] : q.slice(1)));
  }

  if (!hydrated) {
    return (
      <main className="container">
        <p>Loading your vocabulary progress...</p>
      </main>
    );
  }

  return (
    <main className="container">
      <p>
        <Link href="/">&larr; Dashboard</Link>
      </p>
      <h1>TOEFL Academic Word List &middot; Spaced Repetition</h1>
      <p style={{ color: "var(--muted)" }}>
        {learned} of {VOCAB.length} words started &middot; {queue.length} left this session &middot; {reviewed}{" "}
        reviewed
      </p>
      <p style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
        570 headwords from the Academic Word List (Coxhead 2000) — the words most likely to appear in TOEFL Reading and
        Listening passages.
      </p>

      {current ? (
        <section
          style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "1.5rem", margin: "1rem 0" }}
        >
          <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
            {current.list} {current.pos && <>&middot; {current.pos}</>}
          </div>
          <h2 style={{ fontSize: "2rem", margin: "0.25rem 0 1rem" }}>{current.word}</h2>
          {revealed ? (
            <>
              <p style={{ fontSize: "1.1rem" }}>{current.definition}</p>
              {current.example && (
                <p style={{ color: "var(--muted)", fontStyle: "italic" }}>&ldquo;{current.example}&rdquo;</p>
              )}
              {current.forms && (
                <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                  <strong>Forms:</strong> {current.forms}
                </p>
              )}
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "1rem" }}>
                <button className="button" onClick={() => grade(1)}>
                  Again
                </button>
                <button className="button" onClick={() => grade(3)}>
                  Hard
                </button>
                <button className="button" onClick={() => grade(4)}>
                  Good
                </button>
                <button className="button" onClick={() => grade(5)}>
                  Easy
                </button>
              </div>
            </>
          ) : (
            <button className="button" onClick={() => setRevealed(true)}>
              Show definition
            </button>
          )}
        </section>
      ) : (
        <section
          style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "1.5rem", margin: "1rem 0" }}
        >
          <h2>Session complete</h2>
          <p>
            No more cards are due right now. Reload for {NEW_PER_SESSION} more new words, or come back tomorrow for
            reviews.
          </p>
        </section>
      )}

      {/* Sublist progress overview */}
      <details style={{ marginTop: "2rem" }}>
        <summary style={{ cursor: "pointer", color: "var(--muted)", fontSize: "0.9rem" }}>
          Sublist progress ({Object.keys(progress).length} / {VOCAB.length} started)
        </summary>
        <table style={{ marginTop: "0.5rem", fontSize: "0.85rem", borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "4px 8px" }}>Sublist</th>
              <th style={{ textAlign: "right", padding: "4px 8px" }}>Total</th>
              <th style={{ textAlign: "right", padding: "4px 8px" }}>Started</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((sl) => {
              const slWords = VOCAB.filter((w) => w.sublist === sl);
              const started = slWords.filter((w) => progress[w.id]).length;
              return (
                <tr key={sl}>
                  <td style={{ padding: "4px 8px" }}>SL {sl}</td>
                  <td style={{ textAlign: "right", padding: "4px 8px" }}>{slWords.length}</td>
                  <td style={{ textAlign: "right", padding: "4px 8px" }}>{started}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </details>
    </main>
  );
}

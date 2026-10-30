"use client";

import Link from "next/link";
import { useRef } from "react";
import {
  exportState,
  getTopicSummary,
  importState,
  topicsForSection,
} from "toefl-adaptive-engine";
import { BANK } from "@/lib/questionBank";
import { useAdaptiveState } from "@/lib/useAdaptiveState";

export default function Dashboard() {
  const { state, hydrated, replaceState } = useAdaptiveState();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!hydrated) {
    return (
      <main className="container">
        <p>Loading your TOEFL progress...</p>
      </main>
    );
  }

  const readingTopics = topicsForSection(BANK, "reading");
  const listeningTopics = topicsForSection(BANK, "listening");
  const writingTopics = topicsForSection(BANK, "writing");

  const readingSummary = getTopicSummary(state, readingTopics);
  const listeningSummary = getTopicSummary(state, listeningTopics);
  const writingSummary = getTopicSummary(state, writingTopics);

  function handleExport() {
    const blob = new Blob([exportState(state)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `toefl-study-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      replaceState(importState(text));
    } catch {
      alert("That file does not look like a valid TOEFL progress export.");
    }
    e.target.value = "";
  }

  return (
    <main className="container">
      <h1>TOEFL iBT Adaptive Study &amp; Exam Simulator</h1>
      <p style={{ color: "var(--muted)", marginTop: "-0.5rem", marginBottom: "1.25rem" }}>
        Adaptive Elo Engine • {BANK.length} Questions Across Reading, Listening &amp; Writing
      </p>

      <section className="section-ratings">
        <div className="rating-card">
          <h2>Reading Rating</h2>
          <p className="rating-value">{Math.round(state.sectionRatings.reading)}</p>
        </div>
        <div className="rating-card">
          <h2>Listening Rating</h2>
          <p className="rating-value">{Math.round(state.sectionRatings.listening)}</p>
        </div>
        <div className="rating-card">
          <h2>Writing Rating</h2>
          <p className="rating-value">{Math.round(state.sectionRatings.writing)}</p>
        </div>
      </section>

      {/* ETS Real Exam Simulator Modes */}
      <section
        style={{
          backgroundColor: "#134e4a",
          color: "#fff",
          padding: "1.5rem",
          borderRadius: "10px",
          margin: "1.5rem 0",
          boxShadow: "0 4px 6px rgba(0,0,0,0.12)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
          <span
            style={{
              backgroundColor: "#f59e0b",
              color: "#000",
              fontSize: "11px",
              fontWeight: 900,
              padding: "2px 6px",
              borderRadius: "4px",
            }}
          >
            ETS EXAM SIMULATOR
          </span>
          <h2 style={{ fontSize: "1.25rem", margin: 0, fontWeight: "bold" }}>
            Timed Section Mode
          </h2>
        </div>
        <p style={{ fontSize: "0.85rem", color: "#ccfbf1", margin: "0 0 1rem 0" }}>
          Official ETS test conditions: countdown timer (Hide/Show), Mark for Review, Review Grid, and post-exam diagnostic review.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1rem",
          }}
        >
          <Link
            href="/exam/reading"
            style={{
              display: "block",
              padding: "1rem",
              backgroundColor: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: "8px",
              textDecoration: "none",
              color: "#fff",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontWeight: "bold",
                fontSize: "1rem",
              }}
            >
              <span>Reading Section &rarr;</span>
              <span
                style={{
                  backgroundColor: "#10b981",
                  fontSize: "11px",
                  padding: "2px 6px",
                  borderRadius: "4px",
                }}
              >
                10 Q • 18 Min
              </span>
            </div>
            <div style={{ fontSize: "0.8rem", color: "#e2e8f0", marginTop: "4px" }}>
              Academic passages, Vocabulary, Insert Text &amp; Prose Summary
            </div>
          </Link>

          <Link
            href="/exam/listening"
            style={{
              display: "block",
              padding: "1rem",
              backgroundColor: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: "8px",
              textDecoration: "none",
              color: "#fff",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontWeight: "bold",
                fontSize: "1rem",
              }}
            >
              <span>Listening Section &rarr;</span>
              <span
                style={{
                  backgroundColor: "#10b981",
                  fontSize: "11px",
                  padding: "2px 6px",
                  borderRadius: "4px",
                }}
              >
                8 Q • 16 Min
              </span>
            </div>
            <div style={{ fontSize: "0.8rem", color: "#e2e8f0", marginTop: "4px" }}>
              Lectures &amp; Campus Conversations (Main Idea, Detail, Inference, Attitude)
            </div>
          </Link>

          <Link
            href="/exam/writing"
            style={{
              display: "block",
              padding: "1rem",
              backgroundColor: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: "8px",
              textDecoration: "none",
              color: "#fff",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontWeight: "bold",
                fontSize: "1rem",
              }}
            >
              <span>Writing Section &rarr;</span>
              <span
                style={{
                  backgroundColor: "#10b981",
                  fontSize: "11px",
                  padding: "2px 6px",
                  borderRadius: "4px",
                }}
              >
                12 Items &middot; 23 Min
              </span>
            </div>
            <div style={{ fontSize: "0.8rem", color: "#e2e8f0", marginTop: "4px" }}>
              10 Build a Sentence + Write an Email + Academic Discussion (2026 format)
            </div>
          </Link>
        </div>
      </section>

      <h3 style={{ marginTop: "1.5rem", marginBottom: "0.5rem", fontSize: "1.1rem", fontWeight: "bold" }}>
        Untimed Adaptive Practice
      </h3>
      <nav className="study-links">
        <Link href="/study/reading" className="button">
          Study Reading
        </Link>
        <Link href="/study/listening" className="button">
          Study Listening
        </Link>
        <Link href="/study/writing" className="button">
          Study Writing
        </Link>
        <Link href="/study/mixed" className="button">
          Study Mixed
        </Link>
        <Link href="/vocab" className="button" style={{ backgroundColor: "#0f766e", borderColor: "#0f766e" }}>
          Academic Word List (SRS)
        </Link>
        <a
          href="http://localhost:5173"
          target="_blank"
          rel="noreferrer"
          className="button"
          style={{ backgroundColor: "#1e40af", borderColor: "#1e40af" }}
        >
          Speaking Lab (VoxPilot :5173) &nearr;
        </a>
      </nav>

      <TopicTable title="Reading Question Types" rows={readingSummary} />
      <TopicTable title="Listening Topics" rows={listeningSummary} />
      <TopicTable title="Writing Tasks" rows={writingSummary} />

      <section className="backup-actions">
        <button onClick={handleExport}>Export progress</button>
        <button onClick={handleImportClick}>Import progress</button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          style={{ display: "none" }}
          onChange={handleImportFile}
        />
      </section>
    </main>
  );
}

function TopicTable({
  title,
  rows,
}: {
  title: string;
  rows: ReturnType<typeof getTopicSummary>;
}) {
  return (
    <section className="topic-table">
      <h2>{title}</h2>
      <table>
        <thead>
          <tr>
            <th>Topic / Skill</th>
            <th>Rating</th>
            <th>Attempts</th>
            <th>Accuracy</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.topic}>
              <td style={{ textTransform: "capitalize" }}>{r.topic.replace(/_/g, " ")}</td>
              <td>{Math.round(r.rating)}</td>
              <td>{r.attempts}</td>
              <td>{r.accuracy === null ? "—" : `${Math.round(r.accuracy * 100)}%`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

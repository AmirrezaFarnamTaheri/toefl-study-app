"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { AnyToeflQuestion, ToeflSection } from "toefl-adaptive-engine";
import { BANK } from "@/lib/questionBank";
import ReviewModal from "./ReviewModal";
import ExamQuestionRenderer from "./ExamQuestionRenderer";
import ExamResults from "./ExamResults";

interface ExamSessionProps {
  section: ToeflSection;
  questionCount?: number;
  durationMinutes?: number;
}

export default function ExamSession({
  section,
  questionCount = 10,
  durationMinutes = 18,
}: ExamSessionProps) {
  const router = useRouter();

  const [questions, setQuestions] = useState<AnyToeflQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [markedQuestions, setMarkedQuestions] = useState<Record<string, boolean>>({});
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const totalSeconds = durationMinutes * 60;
  const [secondsRemaining, setSecondsRemaining] = useState(totalSeconds);
  const [isTimerHidden, setIsTimerHidden] = useState(false);

  function sampleQuestions() {
    if (section === "writing") {
      const integrated = BANK.filter((q) => q.qtype === "writing_integrated");
      const discussion = BANK.filter((q) => q.qtype === "writing_discussion");
      const pickInt = integrated[Math.floor(Math.random() * integrated.length)];
      const pickDisc = discussion[Math.floor(Math.random() * discussion.length)];
      return [pickInt, pickDisc].filter(Boolean);
    }
    const pool = BANK.filter((q) => q.section === section);
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, questionCount);
  }

  useEffect(() => {
    setQuestions(sampleQuestions());
    setSecondsRemaining(durationMinutes * 60);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section, questionCount, durationMinutes]);

  useEffect(() => {
    if (isFinished || questions.length === 0) return;
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isFinished, questions.length]);

  if (questions.length === 0) {
    return (
      <main className="container">
        <h2>Initializing ETS TOEFL Section...</h2>
      </main>
    );
  }

  const currentQ = questions[currentIndex];
  const isMarked = !!markedQuestions[currentQ.id];
  const minutesLeft = Math.floor(secondsRemaining / 60);
  const secondsLeft = secondsRemaining % 60;

  function handleAnswerChange(ans: any) {
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: ans,
    }));
  }

  function toggleMark() {
    setMarkedQuestions((prev) => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id],
    }));
  }

  function handleNext() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowSubmitConfirm(true);
    }
  }

  function handleBack() {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }

  function handleRetake(fresh = false) {
    if (fresh) setQuestions(sampleQuestions());
    setIsFinished(false);
    setSecondsRemaining(totalSeconds);
    setUserAnswers({});
    setMarkedQuestions({});
    setCurrentIndex(0);
  }

  const unansweredCount = questions.filter((q) => {
    const ans = userAnswers[q.id];
    if (ans === undefined || ans === null || ans === "") return true;
    if (q.qtype === "prose_summary") return !Array.isArray(ans) || ans.length !== 3;
    return false;
  }).length;

  const sectionTitle = `TOEFL iBT ${section[0].toUpperCase()}${section.slice(1)} Section`;

  if (isFinished) {
    return (
      <ExamResults
        questions={questions}
        userAnswers={userAnswers}
        timeSpentSec={totalSeconds - secondsRemaining}
        sectionTitle={sectionTitle}
        onRetake={() => handleRetake(false)}
        onRetakeFresh={() => handleRetake(true)}
      />
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* ETS Top Toolbar */}
      <header
        style={{
          backgroundColor: "#134e4a",
          color: "#fff",
          padding: "0.75rem 1.25rem",
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        }}
      >
        <div
          style={{
            maxWidth: "1024px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <button
              onClick={() => {
                if (confirm("Quit this timed TOEFL section? Progress will not be saved.")) {
                  router.push("/");
                }
              }}
              style={{
                backgroundColor: "#991b1b",
                borderColor: "#991b1b",
                padding: "0.35rem 0.75rem",
                fontSize: "0.8rem",
              }}
            >
              Quit Section
            </button>
            <strong>{sectionTitle}</strong>
          </div>

          <div style={{ fontWeight: 700 }}>
            Question {currentIndex + 1} of {questions.length}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                cursor: "pointer",
                fontSize: "0.85rem",
                padding: "0.3rem 0.6rem",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: "4px",
              }}
            >
              <input type="checkbox" checked={isMarked} onChange={toggleMark} />
              <span>Mark</span>
            </label>

            <button
              onClick={() => setIsReviewOpen(true)}
              style={{
                backgroundColor: "rgba(255,255,255,0.15)",
                borderColor: "rgba(255,255,255,0.3)",
                padding: "0.35rem 0.75rem",
                fontSize: "0.85rem",
              }}
            >
              Review Grid
            </button>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                backgroundColor: "rgba(0,0,0,0.25)",
                padding: "0.3rem 0.65rem",
                borderRadius: "4px",
              }}
            >
              {!isTimerHidden && (
                <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: "1rem" }}>
                  {String(minutesLeft).padStart(2, "0")}:{String(secondsLeft).padStart(2, "0")}
                </span>
              )}
              <button
                onClick={() => setIsTimerHidden(!isTimerHidden)}
                style={{
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  fontSize: "0.75rem",
                  textDecoration: "underline",
                  color: "#ccfbf1",
                }}
              >
                {isTimerHidden ? "Show Time" : "Hide Time"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Question Canvas */}
      <main className="container" style={{ flex: 1, width: "100%" }}>
        <div className="question">
          <ExamQuestionRenderer
            question={currentQ}
            currentAnswer={userAnswers[currentQ.id]}
            onAnswerChange={handleAnswerChange}
          />
        </div>
      </main>

      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        questions={questions}
        userAnswers={userAnswers}
        markedQuestions={markedQuestions}
        onSelectQuestion={(idx) => setCurrentIndex(idx)}
        currentIndex={currentIndex}
      />

      {showSubmitConfirm && (
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
              maxWidth: "440px",
              width: "100%",
              padding: "1.5rem",
              textAlign: "center",
            }}
          >
            <h3 style={{ marginTop: 0 }}>Submit This Section?</h3>
            {unansweredCount > 0 ? (
              <p>
                ⚠️ You have <strong>{unansweredCount} unanswered or incomplete</strong> item(s).
              </p>
            ) : (
              <p>You have completed all {questions.length} items in this section.</p>
            )}
            <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem", marginTop: "1.25rem" }}>
              <button
                onClick={() => setShowSubmitConfirm(false)}
                style={{ backgroundColor: "transparent", color: "var(--fg)", borderColor: "var(--border)" }}
              >
                Return to Section
              </button>
              <button
                onClick={() => {
                  setShowSubmitConfirm(false);
                  setIsFinished(true);
                }}
              >
                Submit &amp; Score
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Toolbar */}
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          backgroundColor: "var(--card-bg)",
          padding: "0.85rem 1.25rem",
        }}
      >
        <div
          style={{
            maxWidth: "860px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <button onClick={handleBack} disabled={currentIndex === 0}>
            &larr; Back
          </button>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              onClick={() => setShowSubmitConfirm(true)}
              style={{ backgroundColor: "transparent", color: "var(--fg)", borderColor: "var(--border)" }}
            >
              End Section
            </button>
            <button onClick={handleNext}>
              {currentIndex === questions.length - 1 ? "Review & Finish" : "Next \u2192"}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

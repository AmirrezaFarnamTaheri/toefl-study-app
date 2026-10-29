import type { ToeflSection } from "toefl-adaptive-engine";
import ExamSession from "@/components/exam/ExamSession";

export default function ExamPage({ params }: { params: { section: string } }) {
  const sec = params.section;
  const section: ToeflSection =
    sec === "listening" || sec === "writing" ? sec : "reading";

  // ETS TOEFL iBT Section Simulation Parameters:
  // Reading: 10 questions, 18 minutes
  // Listening: 8 questions, 16 minutes
  // Writing (2026 format): 10 Build a Sentence + Write an Email + Academic Discussion, 23 minutes
  const config: Record<ToeflSection, { count: number; minutes: number }> = {
    reading: { count: 10, minutes: 18 },
    listening: { count: 8, minutes: 16 },
    writing: { count: 12, minutes: 23 },
  };

  return (
    <ExamSession
      section={section}
      questionCount={config[section].count}
      durationMinutes={config[section].minutes}
    />
  );
}

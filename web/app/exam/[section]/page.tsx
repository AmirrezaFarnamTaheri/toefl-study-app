import type { ToeflSection } from "toefl-adaptive-engine";
import ExamSession from "@/components/exam/ExamSession";

export default function ExamPage({ params }: { params: { section: string } }) {
  const sec = params.section;
  const section: ToeflSection =
    sec === "listening" || sec === "writing" ? sec : "reading";

  // ETS TOEFL iBT Section Simulation Parameters:
  // Reading: 10 questions, 18 minutes
  // Listening: 8 questions, 16 minutes
  // Writing: 2 tasks (1 Integrated 20m + 1 Academic Discussion 10m), 30 minutes
  const config: Record<ToeflSection, { count: number; minutes: number }> = {
    reading: { count: 10, minutes: 18 },
    listening: { count: 8, minutes: 16 },
    writing: { count: 2, minutes: 30 },
  };

  return (
    <ExamSession
      section={section}
      questionCount={config[section].count}
      durationMinutes={config[section].minutes}
    />
  );
}

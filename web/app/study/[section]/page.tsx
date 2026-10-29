import type { ToeflSection } from "toefl-adaptive-engine";
import StudySession from "@/components/StudySession";

export default function StudyPage({ params }: { params: { section: string } }) {
  const validSections: ToeflSection[] = ["reading", "listening", "writing"];
  const section: ToeflSection | undefined = validSections.includes(
    params.section as ToeflSection
  )
    ? (params.section as ToeflSection)
    : undefined;

  return <StudySession section={section} />;
}

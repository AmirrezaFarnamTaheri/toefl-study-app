"use client";

import type { AnyToeflQuestion } from "toefl-adaptive-engine";
import FactualQuestionView from "./FactualQuestionView";
import NegativeFactualQuestionView from "./NegativeFactualQuestionView";
import InferenceQuestionView from "./InferenceQuestionView";
import VocabularyQuestionView from "./VocabularyQuestionView";
import SentenceSimplificationQuestionView from "./SentenceSimplificationQuestionView";
import InsertTextQuestionView from "./InsertTextQuestionView";
import ProseSummaryQuestionView from "./ProseSummaryQuestionView";
import ListeningQuestionView from "./ListeningQuestionView";
import WritingDiscussionView from "./WritingDiscussionView";
import WritingIntegratedView from "./WritingIntegratedView";

export default function QuestionRenderer({
  question,
  onAnswered,
}: {
  question: AnyToeflQuestion;
  onAnswered: (correct: boolean) => void;
}) {
  switch (question.qtype) {
    case "factual":
      return <FactualQuestionView question={question} onAnswered={onAnswered} />;
    case "negative_factual":
      return <NegativeFactualQuestionView question={question} onAnswered={onAnswered} />;
    case "inference":
    case "rhetorical_purpose":
    case "reference":
      return <InferenceQuestionView question={question} onAnswered={onAnswered} />;
    case "vocabulary":
      return <VocabularyQuestionView question={question} onAnswered={onAnswered} />;
    case "sentence_simplification":
      return <SentenceSimplificationQuestionView question={question} onAnswered={onAnswered} />;
    case "insert_text":
      return <InsertTextQuestionView question={question} onAnswered={onAnswered} />;
    case "prose_summary":
      return <ProseSummaryQuestionView question={question} onAnswered={onAnswered} />;
    case "listening_detail":
    case "listening_main_idea":
    case "listening_function":
    case "listening_attitude":
    case "listening_inference":
      return <ListeningQuestionView question={question} onAnswered={onAnswered} />;
    case "writing_discussion":
      return <WritingDiscussionView question={question} onAnswered={onAnswered} />;
    case "writing_integrated":
      return <WritingIntegratedView question={question} onAnswered={onAnswered} />;
  }
}

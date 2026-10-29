import {
  loadPassages,
  loadQuestionBank,
  loadScripts,
  getPassageById as engineGetPassageById,
  getScriptById as engineGetScriptById,
} from "toefl-adaptive-engine";

import passagesRaw from "../../data/questions/reading/passages.json";
import factual from "../../data/questions/reading/factual.json";
import negative_factual from "../../data/questions/reading/negative_factual.json";
import inference from "../../data/questions/reading/inference.json";
import vocabulary from "../../data/questions/reading/vocabulary.json";
import reference from "../../data/questions/reading/reference.json";
import sentence_simplification from "../../data/questions/reading/sentence_simplification.json";
import insert_text from "../../data/questions/reading/insert_text.json";
import prose_summary from "../../data/questions/reading/prose_summary.json";

import scriptsRaw from "../../data/questions/listening/scripts.json";
import listening from "../../data/questions/listening/questions.json";

import writing_discussion from "../../data/questions/writing/discussion.json";
import writing_integrated from "../../data/questions/writing/integrated.json";
import writing_build_sentence from "../../data/questions/writing/build_sentence.json";
import writing_email from "../../data/questions/writing/email.json";
import complete_words from "../../data/questions/reading/complete_words.json";

export const BANK = loadQuestionBank({
  factual,
  negative_factual,
  inference,
  vocabulary,
  reference,
  sentence_simplification,
  insert_text,
  prose_summary,
  listening,
  writing_discussion,
  writing_integrated,
  writing_build_sentence,
  writing_email,
  complete_words,
});

export const PASSAGES = loadPassages(passagesRaw);
export const SCRIPTS = loadScripts(scriptsRaw);

export function getPassageById(id: string) {
  return engineGetPassageById(PASSAGES, id);
}

export function getScriptById(id: string) {
  return engineGetScriptById(SCRIPTS, id);
}

const fs = require("fs");
const path = require("path");

const dataRoot = path.join(__dirname, "..", "data", "questions");

function readJson(relPath) {
  const full = path.join(dataRoot, relPath);
  if (!fs.existsSync(full)) {
    throw new Error(`Missing file: ${relPath}`);
  }
  return JSON.parse(fs.readFileSync(full, "utf8"));
}

function audit() {
  const errors = [];

  const passages = readJson("reading/passages.json");
  const passageIds = new Set(passages.map((p) => p.id));

  const scripts = readJson("listening/scripts.json");
  const scriptIds = new Set(scripts.map((s) => s.id));

  const files = [
    "reading/factual.json",
    "reading/negative_factual.json",
    "reading/inference.json",
    "reading/vocabulary.json",
    "reading/reference.json",
    "reading/sentence_simplification.json",
    "reading/insert_text.json",
    "reading/prose_summary.json",
    "listening/questions.json",
    "writing/discussion.json",
    "writing/integrated.json",
    "writing/build_sentence.json",
    "writing/email.json",
    "reading/complete_words.json",
  ];

  const seenIds = new Set();
  let totalQuestions = 0;
  const countsBySection = { reading: 0, listening: 0, writing: 0 };

  for (const file of files) {
    const items = readJson(file);
    if (!Array.isArray(items)) {
      errors.push(`${file}: root must be array`);
      continue;
    }

    for (const q of items) {
      totalQuestions++;
      if (!q.id) {
        errors.push(`${file}: question missing id`);
      } else if (seenIds.has(q.id)) {
        errors.push(`${file}: duplicate id '${q.id}'`);
      } else {
        seenIds.add(q.id);
      }

      if (!["reading", "listening", "writing"].includes(q.section)) {
        errors.push(`${q.id}: invalid section '${q.section}'`);
      } else {
        countsBySection[q.section]++;
      }

      if (q.qtype === "complete_words") {
        if (typeof q.paragraph !== "string" || q.paragraph.split(/\s+/).length < 55) {
          errors.push(`${q.id}: complete_words paragraph missing or too short`);
        }
      } else if (q.section === "reading") {
        if (!q.passage_id || !passageIds.has(q.passage_id)) {
          errors.push(`${q.id}: unknown passage_id '${q.passage_id}'`);
        }
        if (q.qtype === "prose_summary") {
          if (!Array.isArray(q.correct) || q.correct.length !== 3) {
            errors.push(`${q.id}: prose_summary must have exactly 3 correct choices`);
          }
          if (!Array.isArray(q.choices) || q.choices.length !== 6) {
            errors.push(`${q.id}: prose_summary must have 6 choices`);
          }
          for (const c of q.correct || []) {
            if (!q.choices.includes(c)) {
              errors.push(`${q.id}: prose_summary correct answer '${c}' not in choices`);
            }
          }
        } else if (q.qtype === "insert_text") {
          if (!["A", "B", "C", "D"].includes(q.correct)) {
            errors.push(`${q.id}: insert_text correct must be A, B, C, or D`);
          }
          for (const marker of ["[A]", "[B]", "[C]", "[D]"]) {
            if (!q.passage_with_markers || !q.passage_with_markers.includes(marker)) {
              errors.push(`${q.id}: insert_text passage_with_markers missing ${marker}`);
            }
          }
        } else {
          if (!Array.isArray(q.choices) || q.choices.length < 4) {
            errors.push(`${q.id}: must have at least 4 choices`);
          }
          if (!q.choices.includes(q.correct)) {
            errors.push(`${q.id}: correct answer not found in choices`);
          }
        }
      }

      if (q.section === "listening") {
        if (!q.script_id || !scriptIds.has(q.script_id)) {
          errors.push(`${q.id}: unknown script_id '${q.script_id}'`);
        }
        if (!Array.isArray(q.choices) || !q.choices.includes(q.correct)) {
          errors.push(`${q.id}: listening correct answer not found in choices`);
        }
      }

      if (q.qtype === "writing_build_sentence") {
        const slots = (q.segments || []).filter((s) => !s.fixed).map((s) => s.text);
        const expected = [...slots, ...(q.distractor ? [q.distractor] : [])].sort();
        if (slots.length < 4 || slots.length > 8) errors.push(`${q.id}: build_sentence needs 4-8 blanks`);
        if (JSON.stringify([...(q.tiles || [])].sort()) !== JSON.stringify(expected)) errors.push(`${q.id}: tiles do not match answer + distractor`);
        if (!["?", "."].includes(q.punctuation)) errors.push(`${q.id}: bad punctuation`);
        if (!q.context) errors.push(`${q.id}: build_sentence missing context sentence`);
      } else if (q.qtype === "writing_email") {
        if (!Array.isArray(q.bullets) || q.bullets.length !== 3) errors.push(`${q.id}: email needs exactly 3 bullets`);
        if (!q.to || !q.subject || !q.scenario) errors.push(`${q.id}: email missing to/subject/scenario`);
      }

      if (q.section === "writing" && q.qtype !== "writing_build_sentence") {
        if (!Array.isArray(q.rubric_checklist) || q.rubric_checklist.length === 0) {
          errors.push(`${q.id}: writing question missing rubric_checklist`);
        }
      }
    }
  }

  if (errors.length > 0) {
    console.error("AUDIT FAILED:");
    for (const e of errors) console.error("  - " + e);
    process.exit(1);
  } else {
    console.log(
      `SUCCESS: Audited ${totalQuestions} questions (Reading: ${countsBySection.reading}, Listening: ${countsBySection.listening}, Writing: ${countsBySection.writing}), ${passages.length} passages, ${scripts.length} scripts. Zero errors.`
    );
  }
}

audit();

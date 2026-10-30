#!/usr/bin/env node
/**
 * Absorbs reading passages and listening scripts from F:\StudyTools\toefl\src\data\
 * into the TOEFL study app's question bank.
 *
 * Reading: 5 passages × 10 MCQ → factual / inference / vocabulary / negative_factual / prose_summary
 * Listening: 5 scripts × 5-6 MCQ → listening_factual / listening_inference / listening_attitude
 *
 * Matches the existing question schema:
 *   { id, section, qtype, topic, difficulty, passage_id/script_id, source, question, choices, correct, tags }
 *   where `correct` is the full text of the correct option (NOT a letter index).
 */
"use strict";
const fs   = require("fs");
const path = require("path");

const SRC_READING   = "F:/StudyTools/toefl/src/data/reading.json";
const SRC_LISTENING = "F:/StudyTools/toefl/src/data/listening.json";

const TOEFL_ROOT  = path.join(__dirname, "..");
const PASSAGES_FILE = path.join(TOEFL_ROOT, "data", "questions", "reading", "passages.json");
const SCRIPTS_FILE  = path.join(TOEFL_ROOT, "data", "questions", "listening", "scripts.json");
const READING_DIR   = path.join(TOEFL_ROOT, "data", "questions", "reading");
const LISTENING_DIR = path.join(TOEFL_ROOT, "data", "questions", "listening");

// ── helpers ──────────────────────────────────────────────────────────────────

function classifyReadingQ(text) {
  const t = text.toLowerCase();
  if (t.includes("closest in meaning") || t.includes("the word ") || t.includes("the term ")) return "vocabulary";
  if (t.includes("infer") || t.includes("suggest") || t.includes("imply") || t.includes("conclude")) return "inference";
  if (/\bnot\b/.test(t) && (t.includes("mentioned") || t.includes("stated") || t.includes("true"))) return "negative_factual";
  // prose_summary in our bank requires 6 choices + 3 correct array format — source has 4-choice MCQ;
  // reclassify "primary purpose" as inference (closest match)
  if (t.includes("primary purpose") || t.includes("mainly discuss") || t.includes("best title") || t.includes("passage is mainly")) return "inference";
  return "factual";
}

function classifyListeningQ(text) {
  const t = text.toLowerCase();
  if (t.includes("attitude") || t.includes("feel") || t.includes("thinks") || t.includes("tone")) return "listening_attitude";
  if (t.includes("infer") || t.includes("suggest") || t.includes("imply") || t.includes("conclude")) return "listening_inference";
  return "listening_factual";
}

function slug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

// ── load existing data ────────────────────────────────────────────────────────
const existingPassages  = JSON.parse(fs.readFileSync(PASSAGES_FILE, "utf8"));
const existingScripts   = JSON.parse(fs.readFileSync(SCRIPTS_FILE, "utf8"));
const existingPassageIds = new Set(existingPassages.map((p) => p.id));
const existingScriptIds  = new Set(existingScripts.map((s) => s.id));
const existingQIds = new Set();

for (const dir of [READING_DIR, LISTENING_DIR]) {
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith(".json")) continue;
    try {
      const items = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
      if (Array.isArray(items)) items.forEach((q) => q.id && existingQIds.add(q.id));
    } catch {}
  }
}

// ── process reading ───────────────────────────────────────────────────────────
const srcReading = JSON.parse(fs.readFileSync(SRC_READING, "utf8"));
const newPassages = [];
const newReadingByType = {};
let newReadingCount = 0;

for (const passage of srcReading) {
  const pid = "toefl_app_" + slug(passage.title);
  if (existingPassageIds.has(pid)) { console.log(`SKIP passage: ${pid}`); continue; }

  const wordCount = passage.passage.split(/\s+/).length;
  newPassages.push({
    id: pid,
    title: passage.title,
    text: passage.passage,
    word_count: wordCount,
    source: "adapted",
  });
  existingPassageIds.add(pid);

  for (const q of passage.questions) {
    const qtype = classifyReadingQ(q.text);
    const qid   = `${pid}_q${String(q.id).padStart(2, "0")}`;
    if (existingQIds.has(qid)) continue;

    const correctText = q.options[q.answer]; // full text of correct option
    const entry = {
      id:         qid,
      section:    "reading",
      qtype,
      topic:      qtype,
      difficulty: 3,
      passage_id: pid,
      source:     "adapted",
      question:   q.text,
      choices:    q.options,
      correct:    correctText,
      tags:       [slug(passage.title).split("_")[0]],
    };

    if (!newReadingByType[qtype]) newReadingByType[qtype] = [];
    newReadingByType[qtype].push(entry);
    existingQIds.add(qid);
    newReadingCount++;
  }
}

// ── process listening ─────────────────────────────────────────────────────────
const srcListening = JSON.parse(fs.readFileSync(SRC_LISTENING, "utf8"));
const newScripts   = [];
const newListeningByType = {};
let newListeningCount = 0;

for (const script of srcListening) {
  const sid = "toefl_app_" + slug(script.title);
  if (existingScriptIds.has(sid)) { console.log(`SKIP script: ${sid}`); continue; }

  const transcript = Array.isArray(script.transcript)
    ? script.transcript.join("\n")
    : String(script.transcript);

  newScripts.push({
    id:         sid,
    title:      script.title,
    type:       script.type === "conversation" ? "conversation" : "lecture",
    subject:    script.subject || "",
    transcript,
    source:     "adapted",
  });
  existingScriptIds.add(sid);

  for (const q of script.questions) {
    const qtype = classifyListeningQ(q.text);
    const qid   = `${sid}_q${String(q.id).padStart(2, "0")}`;
    if (existingQIds.has(qid)) continue;

    const correctText = q.options[q.answer];
    const entry = {
      id:        qid,
      section:   "listening",
      qtype,
      topic:     script.type === "conversation" ? "conversation" : "lecture",
      difficulty: 3,
      script_id: sid,
      source:    "adapted",
      question:  q.text,
      choices:   q.options,
      correct:   correctText,
      tags:      [script.type, slug(script.title).split("_")[0]],
    };

    if (!newListeningByType[qtype]) newListeningByType[qtype] = [];
    newListeningByType[qtype].push(entry);
    existingQIds.add(qid);
    newListeningCount++;
  }
}

// ── write ─────────────────────────────────────────────────────────────────────
if (newPassages.length) {
  const all = [...existingPassages, ...newPassages];
  fs.writeFileSync(PASSAGES_FILE, JSON.stringify(all, null, 2) + "\n");
  console.log(`passages.json: +${newPassages.length} → ${all.length} total`);
}

if (newScripts.length) {
  const all = [...existingScripts, ...newScripts];
  fs.writeFileSync(SCRIPTS_FILE, JSON.stringify(all, null, 2) + "\n");
  console.log(`scripts.json: +${newScripts.length} → ${all.length} total`);
}

for (const [qtype, qs] of Object.entries(newReadingByType)) {
  const file = path.join(READING_DIR, qtype + ".json");
  const existing = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : [];
  const merged = [...existing, ...qs];
  fs.writeFileSync(file, JSON.stringify(merged, null, 2) + "\n");
  console.log(`  reading/${qtype}.json: +${qs.length} → ${merged.length} total`);
}

for (const [qtype, qs] of Object.entries(newListeningByType)) {
  const file = path.join(LISTENING_DIR, qtype + ".json");
  const existing = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : [];
  const merged = [...existing, ...qs];
  fs.writeFileSync(file, JSON.stringify(merged, null, 2) + "\n");
  console.log(`  listening/${qtype}.json: +${qs.length} → ${merged.length} total`);
}

console.log(`\nDone. New reading: ${newReadingCount}, new listening: ${newListeningCount}`);

#!/usr/bin/env node
/**
 * Builds data/vocab/words.json from toefl-learn/vocab-data.js (Academic Word List, 570 headwords).
 * The source file exports a const AWL array; we wrap it for Node require.
 */
"use strict";
const fs = require("fs");
const path = require("path");

const srcFile = "F:/StudyTools/toefl-learn/vocab-data.js";
const outFile = path.join(__dirname, "..", "data", "vocab", "words.json");

// Read the AWL source with UTF-8 encoding
let raw = fs.readFileSync(srcFile, "utf8");

// Strip BOM if present
if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);

// Extract just the array literal: everything from the first "[" to last "]"
const start = raw.indexOf("[");
const end = raw.lastIndexOf("]");
if (start === -1 || end === -1) {
  throw new Error("Could not find AWL array brackets in vocab-data.js");
}
const arrayStr = raw.slice(start, end + 1);

let AWL;
try {
  AWL = JSON.parse(
    arrayStr
      // The source uses unquoted JS object keys; parse as JS via Function
      .replace(/'/g, '"') // won't work perfectly for strings with apostrophes
  );
} catch {
  // Fall back to safe eval via Function
  AWL = new Function("return " + arrayStr)();
}

if (!Array.isArray(AWL) || AWL.length === 0) {
  throw new Error("Failed to parse AWL array from vocab-data.js");
}

// Sublist labels
const SUBLIST_LABEL = {
  1: "AWL Sublist 1 (Most Frequent)",
  2: "AWL Sublist 2",
  3: "AWL Sublist 3",
  4: "AWL Sublist 4",
  5: "AWL Sublist 5",
  6: "AWL Sublist 6",
  7: "AWL Sublist 7",
  8: "AWL Sublist 8",
  9: "AWL Sublist 9",
  10: "AWL Sublist 10 (Least Frequent)",
};

const words = AWL.filter((e) => e.w && e.en).map((entry) => ({
  id: "awl_" + String(entry.w).replace(/[^a-z0-9]+/g, "_"),
  word: String(entry.w).trim(),
  definition: String(entry.en).trim(),
  example: entry.ex ? String(entry.ex).trim() : "",
  pos: entry.pos ? String(entry.pos).trim() : "",
  forms: entry.forms ? String(entry.forms).trim() : "",
  sublist: Number(entry.sl) || 1,
  list: SUBLIST_LABEL[Number(entry.sl)] || "AWL",
  difficulty: Math.round((Number(entry.sl) / 10) * 5), // sl 1=easiest→5, sl 10=hardest→1 — invert
}));

// difficulty: sublist 1 = most common = lower difficulty (2), sublist 10 = least common = higher difficulty (5)
for (const w of words) {
  const sl = w.sublist;
  w.difficulty = sl <= 2 ? 2 : sl <= 5 ? 3 : sl <= 8 ? 4 : 5;
}

// Sort by sublist then alpha
words.sort((a, b) => a.sublist - b.sublist || a.word.localeCompare(b.word));

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(words, null, 1) + "\n");

console.log(
  `Wrote ${words.length} AWL words to ${outFile};`,
  `${words.filter((w) => w.example).length} with examples`
);

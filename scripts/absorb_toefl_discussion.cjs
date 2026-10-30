#!/usr/bin/env node
/**
 * Converts toefl Vite app's independent writing prompts into 2026
 * Academic Discussion Board items and adds them to discussion.json.
 *
 * The source prompts are opinion essay prompts; we convert each into a
 * professor + two student posts format matching the 2026 TOEFL writing task.
 */
"use strict";
const fs   = require("fs");
const path = require("path");

const SRC  = "F:/StudyTools/toefl/src/data/writing.json";
const OUT  = path.join(__dirname, "..", "data", "questions", "writing", "discussion.json");

const srcAll  = JSON.parse(fs.readFileSync(SRC, "utf8"));
const existing = JSON.parse(fs.readFileSync(OUT, "utf8"));
const existingIds = new Set(existing.map((q) => q.id));

// Only use independent prompts, and convert them
const items = srcAll.filter((w) => w.type === "independent");

// Pre-built student pairs for each prompt to make realistic discussion posts
const PAIRS = [
  { // Internet isolation
    a: { name: "Sofia", post: "I think the internet actually increases isolation. Even when people are 'connected' online, they miss the depth of face-to-face interaction. Research shows higher rates of loneliness in heavy social media users." },
    b: { name: "David", post: "I disagree. The internet connects people across huge distances who would never meet otherwise. For introverts, online communities provide real social bonds. The isolation comes from misuse, not the technology itself." },
  },
  { // Government responsibility
    a: { name: "Amara", post: "A government's primary obligation is to its own citizens first. If domestic needs go unmet — healthcare, poverty, infrastructure — prioritizing foreign aid seems difficult to justify politically or ethically." },
    b: { name: "James", post: "But in a globalized world, crises abroad affect everyone. Pandemics, climate change, and conflict don't respect borders. Helping other countries is also helping ourselves long-term." },
  },
  { // TV and video games
    a: { name: "Yuki", post: "Excessive screen time clearly harms children's development — reduced attention spans, less physical activity, and social skill deficits are all documented. Moderation is key, and many families don't enforce it." },
    b: { name: "Carlos", post: "Not all screen time is equal. Educational programs and age-appropriate games can build problem-solving skills. The issue is content quality and parental guidance, not hours alone." },
  },
  { // Environment individual vs government
    a: { name: "Fatima", post: "Individual actions like recycling and reducing consumption are necessary but insufficient alone. Only government regulation and corporate accountability can achieve the scale needed to address climate change." },
    b: { name: "Ethan", post: "I believe individuals have real power. Consumer pressure has already shifted industries toward sustainability. Cultural change starts with individual choices, which then drive political and corporate action." },
  },
  { // Teamwork vs individual talent
    a: { name: "Priya", post: "In most modern workplaces, collaboration is essential. Even brilliant individuals need to communicate, persuade, and coordinate. I've seen talented people fail because they couldn't work on a team." },
    b: { name: "Lucas", post: "Individual creativity and expertise are the foundation of innovation. Teamwork can dilute bold ideas. The most transformative breakthroughs often come from singular visionaries, even if they later need teams to execute." },
  },
  { // Practical vs academic skills
    a: { name: "Maria", post: "Academic knowledge builds critical thinking that's applicable anywhere. Practical skills can be learned on the job; the ability to analyze, reason, and write clearly is what school uniquely provides." },
    b: { name: "Noah", post: "Too many graduates can't balance a budget, cook a meal, or manage conflict effectively. Schools should teach both — but if forced to choose, practical life skills prevent real harm to students' futures." },
  },
  { // Remote work
    a: { name: "Aisha", post: "Remote work has dramatically improved work-life balance and opened opportunities for people who couldn't commute. Companies that mandate office return are losing talent to more flexible competitors." },
    b: { name: "Tom", post: "But collaboration, mentorship, and culture suffer remotely. Junior employees especially need in-person environments to learn and grow. The office isn't obsolete — it just needs reinvention." },
  },
  { // Social media age restrictions
    a: { name: "Elena", post: "Minimum age requirements for social media are necessary. Adolescent brains are especially vulnerable to social comparison and cyberbullying. Waiting until 16 or 18 could reduce documented mental health harms." },
    b: { name: "Marcus", post: "Age restrictions are nearly unenforceable and push teens to less monitored platforms. Better approaches include digital literacy education and platform design reforms to reduce harmful content." },
  },
  { // Higher education
    a: { name: "Layla", post: "A college degree signals discipline, broad knowledge, and the ability to complete long-term goals — qualities employers value regardless of major. The credential still opens doors vocational training doesn't." },
    b: { name: "Ryan", post: "For many careers, apprenticeships, coding bootcamps, or certification programs provide equivalent or better preparation at a fraction of the cost and time. We've over-credentialed society to everyone's detriment." },
  },
  { // Urban vs rural living
    a: { name: "Mei", post: "Cities offer unparalleled opportunities — career diversity, cultural exposure, social networks. The density that makes cities noisy and expensive also makes them innovative and dynamic in ways rural areas can't match." },
    b: { name: "Jack", post: "Rural life provides community, space, lower cost, and a slower pace that many people find more fulfilling. Remote work is making it possible to have career options without urban tradeoffs." },
  },
];

const DEFAULT_RUBRIC = [
  "I stated a clear personal opinion on the professor's question.",
  "I provided at least one specific reason or example supporting my position.",
  "I engaged with or responded to at least one point made by a classmate.",
  "My response is at least 100 words.",
  "My writing is organized and free of major grammatical errors.",
  "I added my own perspective rather than merely summarizing others' posts.",
];

// Tags derived from prompt content
function extractTags(prompt) {
  const keywords = [
    "technology", "internet", "AI", "social media", "digital",
    "environment", "climate", "sustainability",
    "education", "school", "university", "academic",
    "government", "policy", "political",
    "work", "career", "employment",
    "society", "community", "culture",
  ];
  const found = keywords.filter((k) =>
    prompt.toLowerCase().includes(k.toLowerCase())
  );
  return ["writing", "discussion", ...(found.length ? found.slice(0, 2) : ["opinion"])];
}

const added = [];
let nextId = Math.max(...existing.map((q) => parseInt(q.id.replace(/[^0-9]/g, ""), 10) || 0)) + 1;

for (let i = 0; i < items.length; i++) {
  const src = items[i];
  const pair = PAIRS[i] || {
    a: { name: "Alex", post: "I think the statement has significant merit based on my experience and what I've read about the topic." },
    b: { name: "Jordan", post: "I see it differently. While the point has some validity, there are important counter-examples we should consider." },
  };

  const qid = `wd_${String(nextId).padStart(3, "0")}`;
  if (existingIds.has(qid)) { nextId++; continue; }

  // Strip "You have 30 minutes..." boilerplate from prompt
  const cleanPrompt = src.prompt
    .replace(/\s*You have \d+ minutes.*$/i, "")
    .replace(/\s*A response of \d+ words.*$/i, "")
    .trim();

  added.push({
    id: qid,
    section: "writing",
    qtype: "writing_discussion",
    topic: "writing_discussion",
    difficulty: 3,
    source: "adapted",
    tags: extractTags(cleanPrompt),
    explanation: "Self-assessed against rubric. No automated grading.",
    professor_prompt: cleanPrompt,
    student_a: pair.a,
    student_b: pair.b,
    rubric_checklist: DEFAULT_RUBRIC,
  });

  existingIds.add(qid);
  nextId++;
}

const merged = [...existing, ...added];
fs.writeFileSync(OUT, JSON.stringify(merged, null, 2) + "\n");
console.log(`discussion.json: +${added.length} → ${merged.length} total`);

const fs = require("fs");
const dir = "F:/StudyTools/toefl-study-app/data/questions/";
const base = (id, section, qtype, diff, tags, explanation) => ({ id, section, qtype, topic: qtype, difficulty: diff, explanation, source: "adapted", tags });

// ---------- Build a Sentence ----------
const raw = [
  ["The lab is closed on Friday.", "do | you | know | if | [we can] | hand in | the report | on Monday ?", "does"],
  ["I'm thinking of joining the hiking club.", "how often | do | they | organise | trips | [in winter] ?"],
  ["Our flight leaves at six tomorrow morning.", "could | you | [tell me] | what time | we | need to | leave | the hotel ?"],
  ["How was the conference?", "[The] speaker | who | opened it | was | really | [inspiring] .", "were"],
  ["I can't find my student card anywhere.", "have | you | looked | in the jacket | that | you wore | yesterday ?"],
  ["The new café on the corner opened last week.", "what kind | of food | do | they | serve | there ?"],
  ["I need to print my essay before class.", "[Is there] a printer | that | students | can | use | for free ?"],
  ["Where did you get that bag?", "[It] was | made | by | a friend | of mine ."],
  ["The bus was twenty minutes late again.", "do | you | think | we should | take | the train | [instead] ?"],
  ["What did the landlord say about the heating?", "[He] promised | that | it | would be | fixed | [by Friday] ."],
  ["The registration deadline is next Tuesday.", "do | you | know | if | [we can] | register | online ?", "does"],
  ["I just moved into a new apartment.", "how far | away | is | it | from | [the campus] ?"],
  ["My laptop stopped working this morning.", "have | you | tried | [restarting] | it | in safe mode ?"],
  ["The professor wants us to submit the draft early.", "could | you | tell | me | [when] | it | is | due ?"],
  ["How did you like the museum?", "[The] exhibit | that | we | saw | was | [fascinating] .", "were"],
  ["Where can I buy a train ticket?", "tickets | are | sold | at | the | [main] | entrance .", "is"],
  ["I'd like to join a study group.", "do | you | know | whether | there | is | one | [for biology] ?"],
  ["Why is the library so crowded today?", "[Many] students | are | studying | for | their | final exams .", "is"],
  ["The cafeteria closes early on weekends.", "what time | does | it | [close] | on | weekdays ?", "do"],
  ["I forgot to bring my notes.", "[I] | would | be | happy | to | lend | you | mine ."],
];
function seeded(id) { let s = 0; for (const c of id) s = (s * 31 + c.charCodeAt(0)) >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const build = raw.map(([context, answer, distractor], i) => {
  const id = "wbs_" + String(i + 1).padStart(3, "0");
  const m = answer.match(/^(.*?)\s*([?.])$/);
  const punctuation = m[2];
  const segments = m[1].split(" | ").map((p) => {
    const f = p.match(/^\[(.*)\]$/);
    return f ? { text: f[1], fixed: true } : { text: p.trim() };
  });
  const answerTiles = segments.filter((s) => !s.fixed).map((s) => s.text);
  const tiles = [...answerTiles, ...(distractor ? [distractor] : [])];
  const rnd = seeded(id);
  let shuffled;
  do {
    shuffled = [...tiles];
    for (let k = shuffled.length - 1; k > 0; k--) { const j = Math.floor(rnd() * (k + 1)); [shuffled[k], shuffled[j]] = [shuffled[j], shuffled[k]]; }
  } while (shuffled.join("|") === answerTiles.join("|"));
  const q = {
    ...base(id, "writing", "writing_build_sentence", answerTiles.length >= 7 ? 3 : 2, ["writing", "build-a-sentence", punctuation === "?" ? "question" : "statement"],
      "Correct reply: " + segments.map((s) => s.text).join(" ") + punctuation + (distractor ? ` The tile "${distractor}" is the extra tile and is not used.` : "")),
    context, segments, punctuation, tiles: shuffled,
  };
  if (distractor) q.distractor = distractor;
  return q;
});
fs.writeFileSync(dir + "writing/build_sentence.json", JSON.stringify(build, null, 2) + "\n");

// ---------- Write an Email ----------
const rubric = [
  "I used an appropriate greeting and a polite closing with my name.",
  "I addressed all three bullet points, each in its own clear part of the email.",
  "I gave specific details (what, when, how) rather than general statements.",
  "I used complete sentences and a polite, formal-neutral register.",
  "The purpose of the email is clear in the first two sentences.",
  "My email is free of major grammatical errors and I wrote as much as I could in 7 minutes.",
];
const emailItems = [
  ["media", "You borrowed a projector from the campus media office for a student club evening. When you packed it away, you noticed that one of its cables had been damaged, and you are not sure whether you will be charged for it.", "media.office@northfield-college.example", "Damaged projector cable", ["explain what happened to the cable", "describe what you have already done about it", "ask what you should do next"]],
  ["missed-lab", "You missed an important chemistry lab on Thursday because of a medical appointment that could not be moved. The lab counts toward your final grade.", "dr.alvarez@riverside-university.example", "Missed lab session on Thursday", ["explain why you missed the lab", "describe what you have already done to catch up", "ask whether you can make up the lab"]],
  ["heating", "You live in a university residence. The heating in your room has not worked for a week, and nights have become very cold.", "housing@lakeview-university.example", "Heating problem in Room 214", ["explain the problem with the heating", "describe what you have already tried", "ask when the heating will be repaired"]],
  ["volunteer", "You were accepted into a student volunteer program that starts next month, but you have just learned that you have an exam on the first day of training.", "volunteers@eastgate-college.example", "Conflict with first training day", ["explain the scheduling conflict", "describe how you plan to complete the missed training", "ask whether you can join the second session instead"]],
].map(([tag, scenario, to, subject, bullets], i) => ({
  ...base("we_" + String(i + 1).padStart(3, "0"), "writing", "writing_email", 3, ["writing", "email", tag], "Self-assessed against the rubric checklist. Aim to cover all three bullet points in full sentences."),
  scenario, to, subject, bullets, rubric_checklist: rubric,
}));
fs.writeFileSync(dir + "writing/email.json", JSON.stringify(emailItems, null, 2) + "\n");

// ---------- Complete the Words ----------
const paragraphs = [
  ["community-gardens", "Community gardens have become popular in many large cities. They give residents a place to grow fresh vegetables and herbs in neighborhoods with little open space. Volunteers usually share tools, water, and advice, which helps newcomers learn quickly. Studies suggest that these gardens also reduce stress and strengthen friendships among neighbors. As a result, several city councils now offer small grants to groups that want to start a new garden."],
  ["sleep", "Sleep plays an important role in how well students learn. During the night, the brain organizes new information and moves it into long-term memory. Students who stay awake until dawn often struggle to recall details the next day. Researchers therefore recommend a regular bedtime and a quiet room without bright screens. Even a short nap in the afternoon can improve attention for several hours."],
  ["bicycles", "Bicycles are returning to the center of urban transportation planning. Many cities are building protected lanes that separate riders from heavy traffic. These changes make cycling safer and encourage people who were previously afraid to ride. Commuters also save money on fuel, parking, and public transit fares. In addition, fewer cars on the road means cleaner air and quieter streets for everyone."],
  ["libraries", "Modern libraries offer much more than shelves of books. Many of them lend laptops, host language classes, and provide quiet rooms for group projects. Librarians help visitors search databases and evaluate whether online sources are reliable. Because these services are free, they support students who cannot afford expensive materials. For this reason, communities continue to value libraries even as more reading moves online."],
].map(([tag, paragraph], i) => ({
  ...base("cw_" + String(i + 1).padStart(3, "0"), "reading", "complete_words", 2, ["reading", "complete-the-words", tag], "Each gap hides the second half of a word. Use the surrounding sentence to decide which word fits, then type only the missing letters."),
  paragraph,
}));
fs.writeFileSync(dir + "reading/complete_words.json", JSON.stringify(paragraphs, null, 2) + "\n");
console.log("build", build.length, "email", emailItems.length, "cw", paragraphs.length);

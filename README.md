# TOEFL iBT Adaptive Study App & Exam Simulator

A standalone, offline-first TypeScript & Next.js 14 application for mastering **TOEFL iBT Reading, Listening, and Writing** through both **Adaptive Elo Practice** and **Timed ETS Section Simulation**.

Pairs alongside **VoxPilot Speaking Lab** (`http://localhost:5173`) and **GRE Adaptive Study App** (`http://localhost:3000`).

---

## Architecture

- **`engine/` (`toefl-adaptive-engine`)**: Pure TypeScript Elo rating and item-selection engine (`DEFAULT_RATING = 1000`, `TARGET_SUCCESS_PROBABILITY = 0.65`, weak-topic prioritization, recent-question exclusion, `localStorage` persistence under key `toefl-adaptive-state`).
- **`data/questions/`**: Verified JSON question bank audited by `scripts/audit_bank.cjs`:
  - **Reading (33 questions across 5 academic passages)**: Factual, Negative Factual, Inference, Rhetorical Purpose, Vocabulary in Context, Reference, Sentence Simplification, Insert a Sentence (`[A]`–`[D]`), and Prose Summary (Select 3 of 6).
  - **Listening (12 questions across 3 lectures & campus conversations)**: Main Idea / Gist, Detail, Pragmatic Function, Speaker Attitude, and Inference.
  - **Writing (10 prompts)**: Academic Discussion (10-minute timer, ≥100 words, professor prompt + 2 student posts + interactive rubric checklist) and Integrated Writing (20-minute timer, 150–225 words, side-by-side reading passage + lecture transcript + interactive rubric checklist).
- **`web/` (`toefl-web`)**: Next.js 14 App Router interface running on `http://localhost:3001`.

---

## Quick Start

```powershell
cd F:\StudyTools\toefl-study-app
npm install

# Run engine unit tests (24 tests)
npm --workspace=toefl-adaptive-engine test

# Audit question bank integrity
node scripts/audit_bank.cjs

# Start web app on http://localhost:3001
cd web
npm run dev
```

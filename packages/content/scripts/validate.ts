// ── Content integrity validator ───────────────────────────────────────────────
// Enforces the curriculum rules established in the July 2026 content audit:
//   1. Every id (unit / lesson / exercise / flashcard) is unique across ALL dialects.
//   2. Every unit's prep has ≥ 10 flashcards.
//   3. Every lesson has ≥ 1 exercise, and every exercise has a positive xp value.
//   4. Every letter_trace card has character, romanization, AND exampleWord.
//   5. Vocab-before-testing (warning): every bangla term tested in match_pairs /
//      multiple_choice appears in the unit's flashcards or grammar examples.
//
// Errors exit 1 (fails CI); warnings print but pass.
// Run: npm run validate   (from packages/content)

import { allCurricula } from "../src/index";
import type { DialectCurriculum, Unit } from "@bangla-learn/types";

let errors = 0;
let warnings = 0;

function err(msg: string)  { errors++;   console.error(`  ✗ ERROR   ${msg}`); }
function warn(msg: string) { warnings++; console.warn(`  ⚠ warning ${msg}`); }

const seenIds = new Map<string, string>(); // id → "dialect:where"
function checkId(id: string | undefined, where: string) {
  if (!id) { err(`${where}: missing id`); return; }
  const prev = seenIds.get(id);
  if (prev) err(`duplicate id "${id}" in ${where} (already used in ${prev})`);
  else seenIds.set(id, where);
}

// Strip punctuation for loose vocab matching (এখন? → এখন)
const norm = (s: string) => s.replace(/[?।!,.'"]/g, "").trim();

function validateUnit(dialect: string, unit: Unit) {
  const uWhere = `${dialect}/${unit.id}`;
  checkId(unit.id, uWhere);

  // Rule 2: ≥10 flashcards
  const flashcards = unit.prep?.flashcards ?? [];
  if (flashcards.length < 10) {
    err(`${uWhere}: only ${flashcards.length} flashcards (minimum 10)`);
  }
  for (const fc of flashcards) checkId(fc.id, `${uWhere}/flashcard`);

  // Build the "introduced vocab" set for rule 5
  const introduced = new Set<string>();
  for (const fc of flashcards) introduced.add(norm(fc.bangla));
  for (const g of unit.prep?.grammar ?? []) {
    for (const ex of g.examples ?? []) {
      // count every word of grammar example sentences as exposure
      for (const w of ex.bangla.split(/\s+/)) introduced.add(norm(w));
      introduced.add(norm(ex.bangla));
    }
  }
  for (const ch of unit.prep?.characters ?? []) {
    introduced.add(norm((ch as { char?: string; character?: string }).char ??
                        (ch as { character?: string }).character ?? ""));
  }

  for (const lesson of unit.lessons) {
    const lWhere = `${uWhere}/${lesson.id}`;
    checkId(lesson.id, lWhere);

    // Rule 3
    if (!lesson.exercises || lesson.exercises.length === 0) {
      err(`${lWhere}: lesson has no exercises`);
      continue;
    }

    for (const ex of lesson.exercises) {
      const eWhere = `${lWhere}/${(ex as { id?: string }).id ?? "?"}`;
      checkId((ex as { id?: string }).id, eWhere);
      if (!("xp" in ex) || typeof ex.xp !== "number" || ex.xp <= 0) {
        err(`${eWhere}: missing or non-positive xp`);
      }

      // Rule 4
      if (ex.type === "letter_trace") {
        if (!ex.character)                 err(`${eWhere}: letter_trace missing character`);
        if (!ex.romanization)              err(`${eWhere}: letter_trace missing romanization`);
        if (!("exampleWord" in ex) || !ex.exampleWord) {
          err(`${eWhere}: letter_trace missing exampleWord (learner sees no meaning)`);
        }
        // Letter cards also count as introductions
        if (ex.character) introduced.add(norm(ex.character));
      }

      // Rule 5 (warning-level)
      if (ex.type === "match_pairs") {
        for (const p of ex.pairs) {
          if (!introduced.has(norm(p.bangla))) {
            warn(`${eWhere}: match_pairs tests "${p.bangla}" before any flashcard/grammar intro`);
          }
          introduced.add(norm(p.bangla)); // earlier exercises introduce for later ones
        }
      }
      if (ex.type === "multiple_choice" && (ex as { promptBangla?: string }).promptBangla) {
        const pb = norm((ex as { promptBangla?: string }).promptBangla!);
        // sentences are fine; only flag single-word prompts never introduced
        if (!pb.includes(" ") && !introduced.has(pb)) {
          warn(`${eWhere}: multiple_choice tests "${pb}" before any intro`);
        }
        introduced.add(pb);
      }
    }
  }
}

console.log("BhashaLoop content validator\n============================");
for (const [dialect, curriculum] of Object.entries(allCurricula) as [string, DialectCurriculum][]) {
  const before = errors;
  for (const unit of curriculum.units) validateUnit(dialect, unit);
  const unitCount = curriculum.units.length;
  const lessonCount = curriculum.units.reduce((s, u) => s + u.lessons.length, 0);
  console.log(`${dialect.padEnd(13)} ${unitCount} units, ${lessonCount} lessons — ${errors - before === 0 ? "OK" : `${errors - before} error(s)`}`);
}

console.log(`\n${seenIds.size} unique ids · ${errors} error(s) · ${warnings} warning(s)`);
if (errors > 0) process.exit(1);
console.log("Content validation passed ✔");

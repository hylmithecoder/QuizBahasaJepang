import { toRomaji } from "wanakana";
import type { Question } from "./types";

function dedupe(arr: string[]): string[] {
  return [...new Set(arr.filter(Boolean))];
}

/** Lowercase, NFKC-normalize, and strip whitespace/punctuation for comparison. */
function canon(value: string): string {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[\s。、，．,!?！？「」『』()（）・]/g, "");
}

/** Convert to a romaji-only canonical form so kana/romaji answers can be compared. */
function romajiCanon(value: string): string {
  let romaji = value;
  try {
    romaji = toRomaji(value);
  } catch {
    /* keep original on failure */
  }
  return canon(romaji).replace(/[^a-z0-9]/g, "");
}

/**
 * Check a user's answer against a question. Handles typing, multiple-choice,
 * listening, and speaking. For spoken answers, matching is lenient (containment),
 * since speech recognition may return surrounding words.
 */
export function checkAnswer(question: Question, userInput: string): boolean {
  const input = userInput ?? "";
  if (!input.trim()) return false;

  if (question.format === "multiple-choice") {
    return canon(input) === canon(question.answer);
  }

  const candidates = dedupe([question.answer, ...question.acceptableAnswers]);
  const inputCanon = canon(input);
  const inputRomaji = romajiCanon(input);
  const lenient = question.format === "speaking";

  for (const candidate of candidates) {
    const cc = canon(candidate);
    const cr = romajiCanon(candidate);
    if (cc && cc === inputCanon) return true;
    if (cr && inputRomaji && cr === inputRomaji) return true;
    if (lenient && cc && inputCanon.includes(cc)) return true;
    if (lenient && cr && inputRomaji && inputRomaji.includes(cr)) return true;
  }

  return false;
}

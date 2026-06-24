import {
  isHiragana,
  isKatakana,
  isRomaji,
  toHiragana,
  toKatakana,
  toRomaji,
} from "wanakana";
import type { Category, InputMode, Question, QuestionFormat } from "./types";

const FORMATS: QuestionFormat[] = ["typing", "multiple-choice", "speaking", "listening"];
const INPUT_MODES: InputMode[] = ["hiragana", "katakana", "romaji", "none"];
const CATEGORIES: Category[] = ["hiragana", "katakana", "kanji", "vocabulary"];

const DEFAULT_INSTRUCTION: Record<QuestionFormat, string> = {
  typing: "Ketik jawaban yang benar.",
  "multiple-choice": "Pilih jawaban yang benar.",
  speaking: "Ucapkan jawaban dengan mikrofon.",
  listening: "Dengarkan audio, lalu ketik jawabannya.",
};

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function dedupe(arr: string[]): string[] {
  return [...new Set(arr.filter(Boolean))];
}

function deriveInputMode(answer: string, fallback: InputMode): InputMode {
  if (isHiragana(answer)) return "hiragana";
  if (isKatakana(answer)) return "katakana";
  if (isRomaji(answer)) return "romaji";
  return fallback === "none" ? "romaji" : fallback;
}

/** Auto-extend acceptable answers with romaji/kana equivalents so checking is robust. */
function buildAcceptable(answer: string, given: unknown): string[] {
  const list = Array.isArray(given) ? given.map(str) : [];
  const out = [answer, ...list];
  if (isHiragana(answer) || isKatakana(answer)) {
    out.push(toRomaji(answer));
  }
  if (isRomaji(answer)) {
    out.push(toHiragana(answer), toKatakana(answer));
  }
  return dedupe(out);
}

/** Ensure listening/speaking questions have Japanese text for the TTS engine to speak. */
function deriveAudio(answer: string, given: string): string | undefined {
  if (given) return given;
  if (isHiragana(answer) || isKatakana(answer)) return answer;
  if (isRomaji(answer)) return toHiragana(answer);
  return undefined;
}

/**
 * Parse the raw Groq output (string or object) into validated, normalized questions.
 * Drops malformed entries and throws if nothing usable remains (caller shows retry).
 */
export function parseAndNormalize(raw: unknown, expectedCategory?: Category): Question[] {
  let data: unknown = raw;
  if (typeof raw === "string") {
    data = JSON.parse(raw);
  }

  const obj = data as { questions?: unknown };
  const list: unknown[] = Array.isArray(data)
    ? data
    : Array.isArray(obj?.questions)
      ? (obj.questions as unknown[])
      : [];

  const questions: Question[] = [];

  list.forEach((entry, i) => {
    if (!entry || typeof entry !== "object") return;
    const item = entry as Record<string, unknown>;

    let answer = str(item.answer);
    if (!answer) return;

    const format: QuestionFormat = FORMATS.includes(item.format as QuestionFormat)
      ? (item.format as QuestionFormat)
      : "typing";
    const category: Category =
      expectedCategory ??
      (CATEGORIES.includes(item.category as Category) ? (item.category as Category) : "hiragana");

    let promptText = str(item.promptText) || str(item.prompt);
    // A non-listening question with no visible prompt is unanswerable — drop it.
    if (format !== "listening" && !promptText) return;
    const instruction = str(item.instruction) || DEFAULT_INSTRUCTION[format];
    let explanation = str(item.explanation);
    let correctedAudioText = str(item.audioText) || undefined;

    // Programmatic corrections for Hiragana/Katakana categories to prevent LLM hallucinations
    if (category === "hiragana" || category === "katakana") {
      // 1. Single character kana reading correction
      if (promptText && promptText.length === 1 && (isHiragana(promptText) || isKatakana(promptText))) {
        const expectedRomaji = toRomaji(promptText).toLowerCase();

        if (format === "multiple-choice") {
          const looksLikeRomajiMC = isRomaji(answer) || (Array.isArray(item.options) && item.options.map(str).every(opt => !opt || isRomaji(opt)));
          if (looksLikeRomajiMC && answer.toLowerCase() !== expectedRomaji) {
            answer = expectedRomaji;
            explanation = `${promptText} dibaca「${expectedRomaji}」.`;

            let opts = Array.isArray(item.options) ? (item.options as unknown[]).map(str) : [];
            opts = dedupe(opts);
            if (opts.includes(item.answer as string)) {
              if (opts.includes(expectedRomaji)) {
                const candidates = ["a", "i", "u", "e", "o", "ka", "ki", "ku", "ke", "ko", "sa", "shi", "su", "se", "so"];
                const distractor = candidates.find(c => !opts.includes(c)) || "a";
                opts = opts.map(o => o === (item.answer as string) ? distractor : o);
              } else {
                opts = opts.map(o => o === (item.answer as string) ? expectedRomaji : o);
              }
            } else {
              if (!opts.includes(expectedRomaji)) {
                opts.push(expectedRomaji);
              }
            }
            item.options = opts;
          }
        } else if (format === "typing") {
          if (answer !== promptText) {
            answer = promptText;
            explanation = `${promptText} dibaca「${expectedRomaji}」.`;
          }
        } else if (format === "listening") {
          if (answer !== promptText) {
            answer = promptText;
            explanation = `Bunyi tersebut adalah ${promptText}「${expectedRomaji}」.`;
          }
          correctedAudioText = promptText;
        }
      }

      // 2. Speaking format correction: ensure promptText is the Japanese character/sentence, not romaji
      if (format === "speaking" && answer) {
        const expectedRomaji = toRomaji(answer).toLowerCase();
        // If the AI put romaji as the prompt, replace it with the actual Japanese answer
        if (isRomaji(promptText) || promptText.toLowerCase() === expectedRomaji) {
          promptText = answer;
          explanation = `Ucapkan「${answer}」yang dibaca「${expectedRomaji}」.`;
        }
        correctedAudioText = answer;
      }
    }

    let options: string[] | undefined;
    if (format === "multiple-choice") {
      const opts = dedupe(Array.isArray(item.options) ? (item.options as unknown[]).map(str) : []);
      if (!opts.includes(answer)) opts.unshift(answer);
      if (opts.length < 2) return; // unusable multiple-choice question
      options = opts.slice(0, 4);
      if (!options.includes(answer)) options[0] = answer;
    }

    let inputMode: InputMode;
    if (format === "multiple-choice" || format === "speaking") {
      inputMode = "none";
    } else {
      const declared = INPUT_MODES.includes(item.inputMode as InputMode)
        ? (item.inputMode as InputMode)
        : "none";
      inputMode = deriveInputMode(answer, declared);
    }

    const acceptableAnswers = buildAcceptable(answer, item.acceptableAnswers);
    const audioText =
      format === "listening" || format === "speaking"
        ? deriveAudio(answer, correctedAudioText || "")
        : correctedAudioText;

    questions.push({
      id: `q${i}-${Math.random().toString(36).slice(2, 8)}`,
      category,
      format,
      instruction,
      promptText,
      answer,
      acceptableAnswers,
      options,
      inputMode,
      audioText,
      explanation,
    });
  });

  if (questions.length === 0) {
    throw new Error("Tidak ada soal valid yang dihasilkan.");
  }

  return questions;
}

// Shared types for the dynamic Japanese quiz feature.

export type Category = "hiragana" | "katakana" | "kanji" | "vocabulary";
export type JlptLevel = "N5" | "N4" | "N3" | "N2" | "N1";
export type HiraganaKatakanaLevel = "easy" | "normal" | "hard" | "infinity";
export type QuestionFormat = "typing" | "multiple-choice" | "speaking" | "listening";

/** Which typing helper to use for the answer field. */
export type InputMode = "hiragana" | "katakana" | "romaji" | "none";

export interface Question {
  id: string;
  category: Category;
  format: QuestionFormat;
  /** Instruction shown to the learner, in Bahasa Indonesia. */
  instruction: string;
  /** The main item displayed (e.g. "ka", "か", "水"). Empty for listening. */
  promptText: string;
  /** Canonical correct answer. */
  answer: string;
  /** Alternative accepted answers (romaji/kana variants, synonyms). */
  acceptableAnswers: string[];
  /** For multiple-choice: 2-4 options including the answer. */
  options?: string[];
  /** Typing helper for the answer field. */
  inputMode: InputMode;
  /** Japanese text spoken via TTS (listening) or the expected spoken answer (speaking). */
  audioText?: string;
  /** Short explanation shown after answering, in Bahasa Indonesia. */
  explanation: string;
}

export interface QuizRequest {
  category: Category;
  level?: HiraganaKatakanaLevel | JlptLevel;
  count: number;
}

export interface QuizResponse {
  questions: Question[];
}

export const CATEGORIES: Category[] = ["hiragana", "katakana", "kanji", "vocabulary"];
export const JLPT_LEVELS: JlptLevel[] = ["N5", "N4", "N3", "N2", "N1"];
export const QUESTION_FORMATS: QuestionFormat[] = [
  "typing",
  "multiple-choice",
  "speaking",
  "listening",
];

export const CATEGORY_LABELS: Record<Category, string> = {
  hiragana: "Hiragana",
  katakana: "Katakana",
  kanji: "Kanji",
  vocabulary: "Kosakata",
};

export const FORMAT_LABELS: Record<QuestionFormat, string> = {
  typing: "Ketik",
  "multiple-choice": "Pilihan Ganda",
  speaking: "Bicara",
  listening: "Menyimak",
};

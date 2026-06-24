"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  JLPT_LEVELS,
  type Category,
  type JlptLevel,
  type Question,
} from "@/app/lib/quiz/types";
import { QuestionCard } from "@/app/components/quiz/QuestionCard";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { ProgressBar } from "@/app/components/ui/ProgressBar";
import { parseJapaneseText } from "@/app/lib/quiz/ruby";

type Phase = "setup" | "loading" | "playing" | "results";

const COUNTS = [5, 10, 15];
const CATEGORY_SAMPLE: Record<Category, string> = {
  hiragana: "あ",
  katakana: "ア",
  kanji: "水",
  vocabulary: "単語",
};

function isCategory(value: string | null): value is Category {
  return value === "hiragana" || value === "katakana" || value === "kanji" || value === "vocabulary";
}

export function QuizClient() {
  const params = useSearchParams();
  const categoryParam = params.get("category");

  const [phase, setPhase] = useState<Phase>("setup");
  const [category, setCategory] = useState<Category>(
    isCategory(categoryParam) ? categoryParam : "hiragana",
  );

  // Set default level based on category: easy for kana, N5 for kanji
  const [level, setLevel] = useState<string>(
    categoryParam === "kanji" ? "N5" : "easy"
  );

  const [count, setCount] = useState(10);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);

  // Setup phase error
  const [error, setError] = useState<string | null>(null);

  // Infinity background loading states
  const [fetchingNext, setFetchingNext] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  function handleCategoryChange(c: Category) {
    setCategory(c);
    setLevel(c === "kanji" ? "N5" : "easy");
  }

  async function startQuiz() {
    setPhase("loading");
    setError(null);
    setFetchError(null);
    try {
      const isVocab = category === "vocabulary";
      const initialCount = level === "infinity" ? (isVocab ? 10 : 5) : count;
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, level, count: initialCount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Gagal memuat kuis.");
      if (!Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error("Kuis kosong. Coba lagi.");
      }
      setQuestions(data.questions);
      setCurrent(0);
      setScore(0);
      setAnswers([]);
      setPhase("playing");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan tak terduga.");
      setPhase("setup");
    }
  }

  async function fetchNextBatch() {
    if (fetchingNext) return;
    setFetchingNext(true);
    setFetchError(null);
    try {
      const batchSize = category === "vocabulary" ? 10 : 5;
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, level, count: batchSize }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Gagal memuat soal berikutnya.");
      if (!Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error("Gagal memuat soal baru.");
      }
      setQuestions((prev) => [...prev, ...data.questions]);
    } catch (e) {
      console.error("Gagal memuat soal berikutnya di latar belakang:", e);
      setFetchError(e instanceof Error ? e.message : "Gagal memuat soal berikutnya.");
    } finally {
      setFetchingNext(false);
    }
  }

  function handleAnswered(isCorrect: boolean) {
    if (isCorrect) setScore((s) => s + 1);
    setAnswers((a) => [...a, isCorrect]);

    // If Infinity Mode, check if we need to load more in the background
    if (level === "infinity") {
      const triggerThreshold = category === "vocabulary" ? 4 : 2;
      const remaining = questions.length - 1 - current;
      if (remaining <= triggerThreshold && !fetchingNext) {
        fetchNextBatch();
      }
    }
  }

  function handleNext() {
    if (current + 1 >= questions.length) {
      if (level === "infinity") {
        // If we are at the end but it's infinity mode, wait for the background fetch.
        return;
      }
      setPhase("results");
    } else {
      setCurrent((c) => c + 1);
    }
  }

  function handleRetryFetch() {
    fetchNextBatch();
  }

  if (phase === "setup") {
    return (
      <Card className="flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-bold text-zinc-900">Mulai Kuis</h2>
          <p className="mt-1 text-sm text-zinc-500">Soal dibuat otomatis oleh AI (Groq).</p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-150">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-zinc-700">Kategori</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => handleCategoryChange(c)}
                className={`flex flex-col items-center gap-2 rounded-xl border px-3 py-4 cursor-pointer transition-all duration-200 ${category === c
                  ? "border-red-500 bg-red-50/40 text-red-700 font-bold"
                  : "border-zinc-200 hover:bg-zinc-50 text-zinc-600"
                  }`}
              >
                <span className="text-3xl">{CATEGORY_SAMPLE[c]}</span>
                <span className="text-xs sm:text-sm font-medium">{CATEGORY_LABELS[c]}</span>
              </button>
            ))}
          </div>
        </div>

        {category === "kanji" ? (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-zinc-700">Level JLPT</span>
            <div className="flex flex-wrap gap-2">
              {JLPT_LEVELS.map((lv) => (
                <button
                  key={lv}
                  type="button"
                  onClick={() => setLevel(lv)}
                  className={`rounded-full border px-4 py-2 text-sm cursor-pointer transition-all duration-200 ${level === lv
                    ? "border-red-600 bg-red-600 text-white font-medium shadow-sm shadow-red-600/15"
                    : "border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700"
                    }`}
                >
                  {lv}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setLevel("infinity")}
                className={`rounded-full border px-4 py-2 text-sm cursor-pointer transition-all duration-200 ${level === "infinity"
                  ? "border-red-600 bg-red-600 text-white font-medium shadow-sm shadow-red-600/15"
                  : "border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700"
                  }`}
              >
                Infinity ♾️
              </button>
            </div>
            <span className="text-xs text-zinc-500">
              N5 paling mudah, N1 paling sulit, atau Infinity (soal tanpa batas).
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-zinc-700">Tingkat Kesulitan</span>
            <div className="flex flex-wrap gap-2">
              {["easy", "normal", "hard", "infinity"].map((lv) => {
                const labels: Record<string, string> = {
                  easy: "Mudah",
                  normal: "Normal",
                  hard: "Sulit",
                  infinity: "Infinity ♾️",
                };
                return (
                  <button
                    key={lv}
                    type="button"
                    onClick={() => setLevel(lv)}
                    className={`rounded-full border px-4 py-2 text-sm cursor-pointer transition-all duration-200 ${level === lv
                      ? "border-red-600 bg-red-600 text-white font-medium shadow-sm shadow-red-600/15"
                      : "border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700"
                      }`}
                  >
                    {labels[lv]}
                  </button>
                );
              })}
            </div>
            <span className="text-xs text-zinc-500">
              {level === "easy" && "Karakter dasar tunggal (Gojuon)."}
              {level === "normal" && "Kombinasi bunyi (dakuten/yoon) dan kata pendek sederhana."}
              {level === "hard" && "Kalimat utuh bahasa Jepang."}
              {level === "infinity" && "Kuis tanpa batas, otomatis memuat soal baru di latar belakang."}
            </span>
          </div>
        )}

        {level !== "infinity" && (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-zinc-700">Jumlah Soal</span>
            <div className="flex gap-2">
              {COUNTS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setCount(n)}
                  className={`rounded-full border px-4 py-2 text-sm cursor-pointer transition-all duration-200 ${count === n
                    ? "border-red-600 bg-red-600 text-white font-medium shadow-sm shadow-red-600/15"
                    : "border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700"
                    }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}

        <Button type="button" onClick={startQuiz} className="w-full mt-2">
          {error ? "Coba lagi" : "Mulai Kuis"}
        </Button>

        <p className="text-xs text-zinc-400 leading-relaxed">
          Format soal: ketik (konversi kana otomatis), pilihan ganda, menyimak (audio), dan bicara
          (mikrofon — paling baik di Chrome/Edge/Safari).
        </p>
      </Card>
    );
  }

  if (phase === "loading") {
    return (
      <Card className="flex flex-col items-center gap-4 py-16">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-zinc-200 border-t-red-600" />
        <p className="text-sm text-zinc-500 font-medium">Membuat kuis dengan AI…</p>
      </Card>
    );
  }

  if (phase === "playing" && questions[current]) {
    const isInfinity = level === "infinity";
    return (
      <div className="flex flex-col gap-5">
        {isInfinity ? (
          <div className="flex flex-col gap-2 px-1">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-500">
              <span className="flex items-center gap-1.5">
                <span>Skor:</span>
                <span className="text-red-600 text-sm font-extrabold bg-red-50 border border-red-100 rounded-md px-1.5 py-0.5">
                  {score}
                </span>
              </span>
              <span>Milestone ke-{Math.floor(current / (category === "vocabulary" ? 10 : 5)) + 1} 🏆</span>
            </div>
            <ProgressBar value={current % (category === "vocabulary" ? 10 : 5)} max={category === "vocabulary" ? 10 : 5} />
          </div>
        ) : (
          <ProgressBar value={current} max={questions.length} />
        )}
        <Card>
          <QuestionCard
            key={questions[current].id}
            question={questions[current]}
            index={current}
            total={questions.length}
            onAnswered={handleAnswered}
            onNext={handleNext}
            isLast={!isInfinity && current + 1 >= questions.length}
            isNextLoading={isInfinity && current + 1 >= questions.length && fetchingNext}
            fetchError={isInfinity ? fetchError : null}
            onRetryFetch={handleRetryFetch}
            onEndQuiz={isInfinity ? () => setPhase("results") : undefined}
          />
        </Card>
      </div>
    );
  }

  const answeredQuestions = level === "infinity" ? questions.slice(0, answers.length) : questions;
  const pct = answeredQuestions.length > 0 ? Math.round((score / answeredQuestions.length) * 100) : 0;

  return (
    <Card className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-2xl font-extrabold text-zinc-900">Hasil Kuis</h2>
        <p className="mt-3 text-5xl font-black text-red-600">
          {score} / {answeredQuestions.length}
        </p>
        <p className="mt-2 text-sm text-zinc-500 font-medium">
          {pct}% benar — {resultMessage(pct)}
        </p>
      </div>

      <ul className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
        {answeredQuestions.map((q, i) => (
          <li
            key={q.id}
            className="flex items-center justify-between rounded-xl border border-zinc-200/80 bg-zinc-50/50 px-4 py-3 text-sm transition-all hover:bg-zinc-50"
          >
            <span className="flex items-center gap-3">
              <span className="text-base">{answers[i] ? "✅" : "❌"}</span>
              <span className="text-zinc-600 font-medium">{parseJapaneseText(q.promptText || q.audioText || "—")}</span>
            </span>
            <span className="font-bold text-zinc-800 bg-white border border-zinc-150 rounded-lg px-2.5 py-1 text-xs inline-flex items-center gap-0.5">
              {parseJapaneseText(q.answer)}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-3 sm:flex-row mt-2">
        <Button type="button" onClick={startQuiz} className="flex-1">
          Ulangi ({CATEGORY_LABELS[category]})
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setPhase("setup")}
          className="flex-1"
        >
          Ubah pengaturan
        </Button>
      </div>
    </Card>
  );
}

function resultMessage(pct: number): string {
  if (pct >= 90) return "Luar biasa! 🎉";
  if (pct >= 70) return "Bagus, terus berlatih!";
  if (pct >= 50) return "Lumayan, jangan menyerah.";
  return "Ayo coba lagi, kamu pasti bisa!";
}

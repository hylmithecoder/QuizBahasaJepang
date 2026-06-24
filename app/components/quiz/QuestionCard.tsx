"use client";

import { useState } from "react";
import { checkAnswer } from "@/app/lib/quiz/check";
import { isSpeechSynthesisSupported, speakJapanese } from "@/app/lib/speech/tts";
import { useSpeechRecognition } from "@/app/lib/speech/useSpeechRecognition";
import { FORMAT_LABELS, type InputMode, type Question } from "@/app/lib/quiz/types";
import { Button } from "@/app/components/ui/Button";
import { KanaInput } from "./KanaInput";
import { parseJapaneseText } from "@/app/lib/quiz/ruby";

interface QuestionCardProps {
  question: Question;
  index: number;
  total: number;
  onAnswered: (correct: boolean) => void;
  onNext: () => void;
  isLast: boolean;
  isNextLoading?: boolean;
  fetchError?: string | null;
  onRetryFetch?: () => void;
  onEndQuiz?: () => void;
}

export function QuestionCard({
  question,
  index,
  total,
  onAnswered,
  onNext,
  isLast,
  isNextLoading,
  fetchError,
  onRetryFetch,
  onEndQuiz,
}: QuestionCardProps) {
  const [typed, setTyped] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const speech = useSpeechRecognition("ja-JP");

  const speakingWithMic = question.format === "speaking" && speech.supported;
  const ttsSupported = isSpeechSynthesisSupported();
  const audioText = question.audioText;

  const currentAnswer =
    question.format === "multiple-choice"
      ? selected ?? ""
      : speakingWithMic
        ? typed || speech.transcript
        : typed;

  function evaluate(answer: string) {
    if (submitted) return;
    const ok = checkAnswer(question, answer);
    setCorrect(ok);
    setSubmitted(true);
    onAnswered(ok);
    if (speech.listening) speech.stop();
  }

  function handleSelect(option: string) {
    if (submitted) return;
    setSelected(option);
    evaluate(option);
  }

  function handleSubmit() {
    if (submitted || !currentAnswer.trim()) return;
    evaluate(currentAnswer);
  }

  function handleSkip() {
    if (submitted) return;
    setSkipped(true);
    setCorrect(false);
    setSubmitted(true);
    onAnswered(false);
    if (speech.listening) speech.stop();
  }

  const showPrompt = question.format !== "listening" && Boolean(question.promptText);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between text-xs font-semibold text-zinc-500">
        <span>
          {onEndQuiz ? `Soal ${index + 1} (Endless ♾️)` : `Soal ${index + 1} / ${total}`}
        </span>
        <div className="flex items-center gap-2">
          {onEndQuiz && (
            <button
              type="button"
              onClick={onEndQuiz}
              className="rounded-full bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-600 font-bold px-3 py-1 cursor-pointer transition-colors border border-red-100"
            >
              Akhiri Kuis
            </button>
          )}
          <span className="rounded-full bg-zinc-100 border border-zinc-200/50 px-2.5 py-1 text-[10px] font-bold text-zinc-600 uppercase tracking-wider">
            {FORMAT_LABELS[question.format]}
          </span>
        </div>
      </div>

      <p className="text-base font-semibold text-zinc-800 leading-relaxed">{question.instruction}</p>

      {showPrompt && (
        <div className="text-center rounded-2xl bg-zinc-50 border border-zinc-200/40 py-10 px-6 text-3xl sm:text-4xl font-extrabold text-zinc-800 select-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] leading-[2] sm:leading-[2.2]">
          {parseJapaneseText(question.promptText)}
        </div>
      )}

      {question.format === "listening" && (
        <div className="flex flex-col items-center gap-2 py-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => speakJapanese(audioText ?? question.answer)}
            disabled={!ttsSupported}
          >
            🔊 Putar suara
          </Button>
          {!ttsSupported && (
            <span className="text-xs text-amber-600 font-medium">Browser ini tidak mendukung audio.</span>
          )}
        </div>
      )}

      {question.format === "multiple-choice" && question.options && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {question.options.map((option) => {
            const isAnswer = option === question.answer;
            const isPicked = option === selected;

            let cls =
              "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 active:bg-zinc-100 hover:border-zinc-300 font-medium cursor-pointer shadow-xs active:scale-[0.99]";
            if (submitted && isAnswer) {
              cls = "border-green-500 bg-green-50 text-green-800 font-bold shadow-xs";
            } else if (submitted && isPicked) {
              cls = "border-red-500 bg-red-50 text-red-800 font-bold shadow-xs";
            }

            return (
              <button
                key={option}
                type="button"
                disabled={submitted}
                onClick={() => handleSelect(option)}
                className={`rounded-xl border px-4 py-3.5 text-left text-lg transition-all duration-200 disabled:cursor-default disabled:pointer-events-none ${cls}`}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}

      {(question.format === "typing" || question.format === "listening") && (
        <KanaInput
          mode={question.inputMode}
          disabled={submitted}
          autoFocus
          placeholder={placeholderFor(question.inputMode)}
          onChange={setTyped}
          onEnter={handleSubmit}
        />
      )}

      {question.format === "speaking" && (
        <div className="flex flex-col gap-4">
          {speakingWithMic && (
            <div className="flex flex-col items-center gap-3 py-2">
              <Button
                type="button"
                variant={speech.listening ? "secondary" : "primary"}
                onClick={() => (speech.listening ? speech.stop() : speech.start())}
                disabled={submitted}
              >
                {speech.listening ? "⏹ Berhenti" : "🎙 Bicara"}
              </Button>
              <div className="min-h-[2.5rem] text-2xl font-bold text-zinc-800 text-center px-4">
                {speech.transcript || (
                  <span className="text-sm font-medium text-zinc-400">
                    Tekan tombol lalu ucapkan jawabannya…
                  </span>
                )}
              </div>
              {speech.error && (
                <span className="text-xs text-red-500 font-medium">Mikrofon bermasalah: {speech.error}</span>
              )}
              <span className="text-xs text-zinc-400 font-medium">— atau ketik jawaban di bawah —</span>
            </div>
          )}
          {!speakingWithMic && (
            <span className="text-xs text-amber-600 font-semibold bg-amber-50 border border-amber-100 rounded-lg px-3 py-1.5 self-start">
              Browser tidak mendukung mikrofon — silakan ketik jawabanmu.
            </span>
          )}
          <KanaInput
            mode={
              question.format === "speaking"
                ? (question.category === "katakana" ? "katakana" : "hiragana")
                : (question.inputMode === "none" ? "romaji" : question.inputMode)
            }
            disabled={submitted}
            autoFocus
            onChange={setTyped}
            onEnter={handleSubmit}
          />
        </div>
      )}

      {!submitted && question.format !== "multiple-choice" && (
        <div className="flex gap-2.5">
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!currentAnswer.trim()}
            className="flex-1"
          >
            Periksa
          </Button>
          {question.format === "speaking" && (
            <Button type="button" variant="secondary" onClick={handleSkip}>
              Lewati
            </Button>
          )}
        </div>
      )}

      {submitted && (
        <div className="flex flex-col gap-4.5 mt-2">
          <div
            className={`rounded-xl px-4 py-3 text-sm font-bold border transition-all ${correct
              ? "bg-green-50/60 border-green-200 text-green-800"
              : skipped
                ? "bg-amber-50/60 border-amber-200 text-amber-800"
                : "bg-red-50/60 border-red-200 text-red-800"
              }`}
          >
            {correct ? "✓ Benar!" : skipped ? "↷ Dilewati." : "✗ Kurang tepat."}
            {!correct && (
              <>
                {" "}
                Jawaban: <strong className="font-extrabold text-base ml-1 inline-flex items-center gap-0.5">{parseJapaneseText(question.answer)}</strong>
              </>
            )}
          </div>
          {question.explanation && (
            <p className="text-sm leading-relaxed text-zinc-600 bg-zinc-50 border border-zinc-150 rounded-xl px-4 py-3 font-medium">
              {parseJapaneseText(question.explanation)}
            </p>
          )}
          {audioText && ttsSupported && (
            <button
              type="button"
              onClick={() => speakJapanese(audioText)}
              className="self-start text-sm text-red-600 hover:text-red-700 font-semibold underline underline-offset-3 cursor-pointer"
            >
              🔊 Dengar pelafalan
            </button>
          )}

          {fetchError && (
            <div className="text-xs text-red-600 font-semibold bg-red-50/60 border border-red-200 rounded-xl px-4 py-2.5 flex items-center justify-between">
              <span>{fetchError}</span>
              <button
                type="button"
                onClick={onRetryFetch}
                className="underline font-bold text-red-800 hover:text-red-900 cursor-pointer ml-2"
              >
                Coba lagi
              </button>
            </div>
          )}

          <Button
            type="button"
            onClick={fetchError ? onRetryFetch : onNext}
            disabled={isNextLoading}
            className="w-full"
          >
            {isNextLoading ? "Memuat soal..." : fetchError ? "Coba Lagi" : isLast ? "Lihat hasil" : "Lanjut"}
          </Button>
        </div>
      )}
    </div>
  );
}

function placeholderFor(mode: InputMode): string {
  switch (mode) {
    case "hiragana":
      return "Ketik romaji → otomatis jadi hiragana";
    case "katakana":
      return "Ketik romaji → otomatis jadi katakana";
    case "romaji":
      return "Ketik romaji…";
    default:
      return "Ketik jawaban…";
  }
}

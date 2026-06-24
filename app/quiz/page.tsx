import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { QuizClient } from "./QuizClient";

export const metadata: Metadata = {
  title: "Kuis — Belajar Bahasa Jepang",
  description: "Kuis hiragana, katakana, dan kanji yang dibuat otomatis oleh AI.",
};

export default function QuizPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10 sm:py-16">
      <Link href="/" className="text-sm text-zinc-500 hover:underline">
        ← Beranda
      </Link>
      <Suspense
        fallback={<div className="text-center text-sm text-zinc-500">Memuat…</div>}
      >
        <QuizClient />
      </Suspense>
    </main>
  );
}

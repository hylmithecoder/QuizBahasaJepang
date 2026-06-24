"use client";

import Link from "next/link";

const CATEGORIES = [
    {
        key: "hiragana",
        label: "Hiragana",
        sample: "あいうえお",
        desc: "Aksara dasar untuk kata-kata Jepang asli.",
    },
    {
        key: "katakana",
        label: "Katakana",
        sample: "アイウエオ",
        desc: "Aksara untuk kata serapan dan nama asing.",
    },
    {
        key: "kanji",
        label: "Kanji",
        sample: "日本語",
        desc: "Aksara logografis — pilih level JLPT N5-N1.",
    },
    {
        key: "vocabulary",
        label: "Kosakata",
        sample: "単語 (たんご)",
        desc: "Kumpulan kosa kata lengkap sehari-hari (gabungan aksara).",
    },
];

export default function Home() {
    return (
        <div className="flex flex-1 flex-col items-center bg-transparent px-4 py-16">
            <main className="flex w-full max-w-3xl flex-1 flex-col items-center gap-14">
                <header className="flex flex-col items-center gap-5 text-center">
                    <span className="text-6xl animate-bounce duration-1000">🇯🇵</span>
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                        Belajar Bahasa Jepang
                    </h1>
                    <p className="max-w-xl text-base sm:text-lg leading-relaxed text-zinc-600">
                        Kuis hiragana, katakana, dan kanji yang dibuat otomatis oleh AI. Ketik dengan konversi
                        kana otomatis, pilihan ganda, dengarkan audio, hingga menjawab dengan suara.
                    </p>
                    <Link
                        href="/quiz"
                        className="mt-4 inline-flex h-12 items-center justify-center rounded-full bg-red-600 px-8 text-base font-semibold text-white shadow-lg shadow-red-600/25 transition-all duration-200 hover:bg-red-700 hover:shadow-xl hover:shadow-red-600/30 hover:scale-[1.03] active:scale-[0.98]"
                    >
                        Mulai Kuis →
                    </Link>
                </header>

                <section className="grid w-full gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {CATEGORIES.map((c) => (
                        <Link
                            key={c.key}
                            href={`/quiz?category=${c.key}`}
                            className="group flex flex-col gap-3 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] transition-all duration-300 hover:border-red-500 hover:shadow-md hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.99]"
                        >
                            <span className="text-3xl font-semibold tracking-wide text-zinc-800 transition-colors group-hover:text-red-600">
                                {c.sample}
                            </span>
                            <span className="text-lg font-bold text-zinc-900">{c.label}</span>
                            <span className="text-sm leading-relaxed text-zinc-500">{c.desc}</span>
                        </Link>
                    ))}
                </section>
            </main>
        </div>
    );
}

# Belajar Bahasa Jepang 🇯🇵

Aplikasi kuis bahasa Jepang interaktif berbasis AI. Soal dibuat otomatis oleh Groq (Llama) atau Gemma, mencakup Hiragana, Katakana, Kanji, dan Kosakata.

## Fitur

- **4 Kategori**: Hiragana, Katakana, Kanji (level JLPT N5–N1), Kosakata
- **4 Format Soal**:
  - **Ketik** — jawab dengan mengetik (konversi romaji → kana otomatis via Wanakana)
  - **Pilihan Ganda** — pilih jawaban dari 4 opsi
  - **Bicara** — jawab dengan suara (Web Speech API) **atau ketik**, bisa dilewati
  - **Menyimak** — dengarkan audio TTS lalu ketik jawaban
- **Tingkat Kesulitan**: Easy (Gojuon), Normal (dakuten/yoon), Hard (kalimat), Infinity (soal tak terbatas, auto-load di background)
- **AI Dual-Provider**: Groq (Llama 3.3 70B) sebagai primer, Gemma (Google) sebagai fallback
- **Furigana Ruby**: Kanji ditampilkan dengan furigana menggunakan tag HTML `<ruby>`
- **Responsive**: Tailwind CSS, mobile-friendly

## Tech Stack

- **Framework**: Next.js 16 (Turbopack)
- **Bahasa**: TypeScript
- **Styling**: Tailwind CSS v4
- **Font**: Noto Sans JP + Geist
- **Kana IME**: [Wanakana](https://github.com/wanakana/wanakana) (konversi romaji ↔ kana)
- **Speech**: Web Speech API (SpeechRecognition + SpeechSynthesis)
- **AI API**: Groq (Llama 3.3 70B) + Gemma (Google Gemini) sebagai fallback

## Persiapan

Buat file `.env` di root proyek:

```env
GROQ_API_KEY=gsk_...
GEMINI_API_KEY=AIza...
```

Salah satu API key wajib diisi. Groq diprioritaskan, Gemma sebagai fallback jika Groq gagal.

## Memulai

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Struktur Proyek

```
app/
├── api/quiz/route.ts       # API route — generate soal via Groq/Gemma
├── quiz/
│   ├── page.tsx            # Halaman kuis (server)
│   └── QuizClient.tsx      # State & flow kuis (client)
├── components/
│   ├── quiz/
│   │   ├── QuestionCard.tsx # Card soal — handle semua format input
│   │   └── KanaInput.tsx    # Input teks dengan konversi kana otomatis
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       └── ProgressBar.tsx
├── lib/
│   ├── quiz/
│   │   ├── types.ts        # Tipe data (Category, Question, QuestionFormat, dll)
│   │   ├── prompt.ts       # Prompt builder untuk AI
│   │   ├── check.ts        # Validasi jawaban (dengan toleransi romaji/kana)
│   │   ├── validate.ts     # Parse & validasi JSON dari AI
│   │   └── ruby.tsx        # Render furigana HTML ruby
│   └── speech/
│       ├── tts.ts           # Text-to-speech Jepang
│       └── useSpeechRecognition.ts # Hook speech recognition
├── pages/Home.tsx           # Halaman beranda
├── layout.tsx               # Root layout + font loading
└── globals.css              # Tailwind + custom style
```

## Build

```bash
npm run build
```

## Lisensi

Proyek pribadi — bebas dimodifikasi.

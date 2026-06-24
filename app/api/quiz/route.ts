import { buildGroqMessages } from "@/app/lib/quiz/prompt";
import { parseAndNormalize } from "@/app/lib/quiz/validate";
import type { Category, JlptLevel, QuizRequest } from "@/app/lib/quiz/types";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

const CATEGORIES: Category[] = ["hiragana", "katakana", "kanji", "vocabulary"];
const LEVELS: JlptLevel[] = ["N5", "N4", "N3", "N2", "N1"];

async function callGroq(category: Category, level: any, count: number, apiKey: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.8,
        response_format: { type: "json_object" },
        messages: buildGroqMessages({ category, level, count }),
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Status ${res.status}: ${await res.text()}`);
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== "string" || !content.trim()) {
      throw new Error("Respons dari Groq kosong.");
    }
    return content;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      throw new Error("Koneksi Groq timeout (melebihi 3.5 detik).");
    }
    throw err;
  }
}

async function callGemma(category: Category, level: any, count: number, apiKey: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemma-4-31b-it:generateContent?key=${apiKey}`;

  const messages = buildGroqMessages({ category, level, count });
  const systemPrompt = messages.find(m => m.role === "system")?.content || "";
  const userPrompt = messages.find(m => m.role === "user")?.content || "";

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [
        {
          parts: [{ text: userPrompt }]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.8,
      }
    }),
  });

  if (!res.ok) {
    throw new Error(`Status ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts || [];
  // Model Gemma dapat mengembalikan pemikiran/reasoning pada part berlabel thought: true.
  // Kita cari part yang tidak memiliki thought: true untuk mendapatkan JSON bersih.
  const contentPart = parts.find((p: any) => !p.thought);
  const content = contentPart?.text;
  if (typeof content !== "string" || !content.trim()) {
    throw new Error("Respons dari Gemma kosong.");
  }
  return content;
}

export async function POST(request: Request) {
  let body: Partial<QuizRequest>;
  try {
    body = (await request.json()) as Partial<QuizRequest>;
  } catch {
    return Response.json({ error: "Permintaan tidak valid." }, { status: 400 });
  }

  const category: Category = CATEGORIES.includes(body.category as Category)
    ? (body.category as Category)
    : "hiragana";

  let level: any;
  if (category === "kanji") {
    level = LEVELS.includes(body.level as JlptLevel) ? (body.level as JlptLevel) : "N5";
  } else {
    const validLevels = ["easy", "normal", "hard", "infinity"];
    level = validLevels.includes(body.level as string) ? body.level : "easy";
  }
  const count = Math.min(Math.max(Math.round(Number(body.count) || 10), 3), 20);

  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  let content = "";
  let usedModel = "";
  let errorMsg = "";

  // 1. Try Groq first if key exists
  if (groqKey) {
    try {
      content = await callGroq(category, level, count, groqKey);
      usedModel = "Groq (Llama)";
    } catch (groqErr: any) {
      console.warn("Groq request failed, trying Gemma fallback...", groqErr.message);
      errorMsg += `Groq error: ${groqErr.message}. `;
    }
  } else {
    errorMsg += "GROQ_API_KEY belum diatur. ";
  }

  // 2. Try Gemma fallback if Groq failed or key was missing
  if (!content && geminiKey) {
    try {
      content = await callGemma(category, level, count, geminiKey);
      usedModel = "Gemma";
    } catch (gemmaErr: any) {
      console.error("Gemma fallback also failed", gemmaErr.message);
      errorMsg += `Gemma error: ${gemmaErr.message}. `;
    }
  } else if (!content) {
    errorMsg += "GEMINI_API_KEY belum diatur. ";
  }

  // If both failed, return an error
  if (!content) {
    return Response.json(
      { error: `Gagal membuat kuis. Kedua penyedia AI (Groq & Gemma) mengalami gangguan atau kuota habis. Detail: ${errorMsg}` },
      { status: 502 },
    );
  }

  try {
    const questions = parseAndNormalize(content, category);
    console.log(`Successfully generated ${questions.length} questions using ${usedModel}`);
    return Response.json({ questions });
  } catch (err: any) {
    console.error("Failed parsing generated questions", err);
    return Response.json(
      { error: `Gagal memproses hasil dari ${usedModel}. Silakan coba lagi.` },
      { status: 500 },
    );
  }
}

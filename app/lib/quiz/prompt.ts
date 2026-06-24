import type { Category, QuizRequest } from "./types";

/** Describes how to construct each of the 4 formats for a given category and level. */
function getCategoryGuide(category: Category, level: string): string {
  if (category === "kanji") {
    return `KANJI sesuai level JLPT ${level} yang diminta. Selalu sertakan cara baca dalam hiragana dan arti dalam Bahasa Indonesia. Buat variasi soal: JANGAN hanya menguji karakter kanji tunggal (seperti '水' atau '火'), tetapi buat juga gabungan kata dari 2-4 karakter Kanji (Jukugo, contoh: '日本', '日本語', '学生', '電気', '大学', '先生') agar lebih bervariasi dan melatih pemahaman kosakata kanji majemuk.`;
  }

  if (category === "vocabulary") {
    const rubyExample = "<ruby>先生<rt>せんせい</rt></ruby>";
    const rubyRule = `Jika kamu menulis aksara Kanji di field "promptText", kamu WAJIB menyertakan furigana (cara baca hiragana) di atas kanji tersebut menggunakan tag HTML ruby, contoh: "${rubyExample}". JANGAN gunakan tag ruby pada field "answer", "acceptableAnswers", atau "options" (gunakan teks biasa).`;
    return `Kategori kuis saat ini adalah KOSAKATA (VOCABULARY) bahasa Jepang. Fokus kuis adalah pada pengenalan kata, arti kata, atau penulisan kosakata bahasa Jepang sehari-hari (menggabungkan Hiragana, Katakana, dan Kanji). JANGAN buat kuis mencocokkan karakter tunggal saja. Soal harus menguji kosa kata lengkap seperti kata kerja (makan, minum), kata benda (mobil, buku), kata sifat (panas, lezat), dll. ${rubyRule}`;
  }

  const isHiragana = category === "hiragana";
  const kana = isHiragana ? "HIRAGANA" : "KATAKANA";
  const forbidKana = isHiragana ? "KATAKANA" : "HIRAGANA";

  const rubyRule = `PENTING: Kamu WAJIB menyertakan furigana (cara baca hiragana) di atas SETIAP aksara KANJI tanpa pengecualian (termasuk kanji satu suku kata/karakter seperti <ruby>行<rt>い</rt></ruby> dalam 行きました, atau <ruby>本<rt>ほん</rt></ruby>) menggunakan tag HTML ruby. Pengguna belum menguasai Kanji sama sekali, jadi jika ada satu saja karakter Kanji tanpa furigana di atasnya, kuis akan rusak karena pengguna tidak bisa membacanya. JANGAN membungkus aksara Hiragana/Katakana asli (seperti partikel "は", "に", atau "で") dengan tag ruby.`;

  const categoryRestriction = `PENTING: Kategori kuis saat ini adalah ${kana}. Kamu HANYA boleh menggunakan karakter ${kana} dan Kanji dasar (yang diberi furigana). JANGAN SEKALI-KALI menggunakan aksara atau kata ${forbidKana} (misal: ${isHiragana ? "JANGAN gunakan テレビ, カメラ, パソコン, コーヒー" : "JANGAN gunakan ねこ, さくら, すし, いぬ"}). Semua soal harus konsisten 100% menggunakan karakter ${kana}.`;

  if (level === "easy") {
    const examples = isHiragana ? "あ, い, う, え, お, か" : "ア, イ, ウ, エ, オ, カ";
    const wordExamples = isHiragana
      ? "あお (biru), あか (merah), いぬ (anjing), うmi (laut), かさ (payung)"
      : "アオ (biru), アカ (merah), イヌ (anjing), ウミ (laut), カサ (payung)";
    return `Kuis tingkat EASY fokus pada karakter dasar ${kana} tunggal (Gojuon, contoh: ${examples}) ATAU kosakata sederhana terdiri dari 2-4 karakter dasar yang HANYA tersusun dari karakter dasar tersebut (contoh: ${wordExamples}). JANGAN gunakan dakuten (dakuon seperti が, ば), handakuten (ぱ), yoon (suku kata kecil seperti きゃ), atau kata panjang (chouon). Buat variasi soal yang acak, jangan berurutan monoton (seperti 'a, i, u, e, o'). ${categoryRestriction}`;
  } else if (level === "normal") {
    const dakuten = isHiragana ? "が, ざ, だ, ば, ぱ" : "ガ, ザ, ダ, バ, パ";
    const yoon = isHiragana ? "きゃ, しゃ, ちょ" : "キャ, シャ, チョ";
    const words = isHiragana ? "ねこ, さくら, すし, いぬ, たべる" : "テレビ, カメラ, パン, コーヒー, ノート";
    return `Gunakan gabungan dakuten (contoh: ${dakuten}), yoon (contoh: ${yoon}), dan kata-kata pendek sederhana sehari-hari dalam ${kana} (contoh: ${words}). Soal menguji karakter modifikasi dan kosa kata dasar. ${rubyRule} ${categoryRestriction}`;
  } else if (level === "hard") {
    return `Gunakan kalimat bahasa Jepang pendek lengkap yang ditulis dalam ${kana} (boleh memakai Kanji dengan furigana/cara baca agar mempermudah). Soal harus menguji pemahaman kalimat, penulisan kata sandang/kata serapan, partikel, atau terjemahan kalimat lengkap dalam Bahasa Indonesia. ${rubyRule} ${categoryRestriction}`;
  } else {
    // infinity level
    return `Berikan campuran soal yang bervariasi antara tingkat mudah (karakter dasar tunggal ${kana} atau kosakata 2-4 suku kata dasar), tingkat normal (kosa kata pendek dengan modifikasi), dan tingkat sulit (kalimat bahasa Jepang pendek menggunakan ${kana}). ${rubyRule} ${categoryRestriction}`;
  }
}

function formatRules(category: Category, level: string): string {
  if (category === "kanji") {
    return [
      '- "typing": WAJIB tampilkan kanji di "promptText" (mis. "水" atau "日本"); "instruction" = "Tulis cara baca kanji berikut dalam hiragana:"; "answer" = cara bacanya dalam HIRAGANA (mis. "みず" atau "にっぽん"); "inputMode" = "hiragana".',
      '- "multiple-choice": WAJIB tampilkan kanji di "promptText"; "options" = 4 ARTI berbeda dalam Bahasa Indonesia; "answer" = arti yang benar; "inputMode" = "none".',
      '- "speaking": WAJIB tampilkan kanji di "promptText"; "answer" = cara baca dalam HIRAGANA; "audioText" = cara baca dalam hiragana; "inputMode" = "none".',
      '- "listening": "audioText" = cara baca kanji dalam HIRAGANA (yang diucapkan); "promptText" = ""; "instruction" = "Dengarkan audio, lalu ketik cara bacanya dalam hiragana:"; "answer" = cara baca dalam hiragana; "inputMode" = "hiragana".',
    ].join("\n");
  }

  if (category === "vocabulary") {
    return [
      '- "typing": "promptText" = kosa kata dalam bahasa Jepang (misal: "たべる" atau "<ruby>先生<rt>せんせい</rt></ruby>"); "answer" = arti kata dalam Bahasa Indonesia (mis. "makan") atau cara bacanya dalam romaji; "inputMode" = "none" atau "romaji".',
      '- "multiple-choice": "promptText" = kosa kata dalam bahasa Jepang; "options" = 4 pilihan ARTI dalam Bahasa Indonesia yang berbeda; "answer" = arti kata yang benar; "inputMode" = "none".',
      '- "speaking": "promptText" = arti kosa kata dalam Bahasa Indonesia (mis. "mobil" atau "guru") (JANGAN gunakan romaji); "answer" = kosa kata Jepang tersebut; "audioText" = kosa kata Jepang tersebut; "inputMode" = "none".',
      '- "listening": "audioText" = kosa kata Jepang tersebut (yang akan diucapkan); "promptText" = ""; "answer" = arti kosa kata dalam Bahasa Indonesia atau cara bacanya; "inputMode" = "none" atau "romaji".',
    ].join("\n");
  }

  const categoryMode = category;
  const kana = category === "hiragana" ? "HIRAGANA" : "KATAKANA";
  const sampleChar = category === "hiragana" ? "か" : "カ";
  const sampleWord = category === "hiragana" ? "ねこ" : "カメラ";
  const sampleSentence = category === "hiragana" ? "わたしは<ruby>東京<rt>とうきょう</rt></ruby>にすんでいます" : "<ruby>テレビ<rt>てれび</rt></ruby>をみます";
  const sampleSentenceKana = category === "hiragana" ? "わたしはとうきょうにすんでいます" : "てれびをみます";

  if (level === "easy") {
    return [
      `- "typing": "promptText" = satu karakter atau kata 2-4 suku kata dasar ${kana} (mis. "${sampleChar}" atau "${category === "hiragana" ? "あお" : "アオ"}"); "instruction" = "Ketik ulang aksara/kata berikut:"; "answer" = kata/karakter ${kana} tersebut; "inputMode" = "${categoryMode}". Pelajar mengetik romaji yang otomatis dikonversi ke ${kana}.`,
      `- "multiple-choice": "promptText" = satu karakter atau kata 2-4 suku kata dasar ${kana}; "options" = 4 pilihan ROMAJI yang berbeda; "answer" = romaji cara baca yang benar (mis. "ao"); "inputMode" = "none".`,
      `- "speaking": "promptText" = satu karakter atau kata 2-4 suku kata dasar ${kana} tersebut (JANGAN gunakan romaji); "answer" = kata/karakter ${kana} tersebut; "audioText" = kata/karakter ${kana} tersebut; "inputMode" = "none".`,
      `- "listening": "audioText" = kata/karakter ${kana} (yang diucapkan); "promptText" = ""; "instruction" = "Dengarkan audio, lalu ketik jawabannya dalam ${kana}:"; "answer" = kata/karakter ${kana} tersebut; "inputMode" = "${categoryMode}".`,
    ].join("\n");
  } else if (level === "normal") {
    return [
      `- "typing": "promptText" = kata dalam ${kana} (mis. "${sampleWord}"); "instruction" = "Ketik ulang kata berikut:"; "answer" = kata ${kana} tersebut; "inputMode" = "${categoryMode}". Pelajar mengetik romaji yang otomatis dikonversi ke ${kana}.`,
      `- "multiple-choice": "promptText" = kata dalam ${kana}; "options" = 4 pilihan arti kata dalam Bahasa Indonesia; "answer" = arti kata yang benar; "inputMode" = "none".`,
      `- "speaking": "promptText" = kata dalam ${kana} tersebut atau arti kata dalam Bahasa Indonesia (JANGAN gunakan romaji); "answer" = kata dalam ${kana}; "audioText" = kata dalam ${kana}; "inputMode" = "none".`,
      `- "listening": "audioText" = kata dalam ${kana} (yang diucapkan); "promptText" = ""; "instruction" = "Dengarkan audio, lalu ketik katanya dalam ${kana}:"; "answer" = kata ${kana} tersebut; "inputMode" = "${categoryMode}".`,
    ].join("\n");
  } else {
    // hard or infinity
    return [
      `- "typing": "promptText" = kalimat Jepang (mis. "${sampleSentence}"); "instruction" = "Ketik cara baca/salinan kalimat berikut dalam aksara ${kana}:"; "answer" = kalimat lengkap dalam aksara ${kana} tanpa kanji (mis. "${sampleSentenceKana}"); "inputMode" = "${categoryMode}".`,
      `- "multiple-choice": "promptText" = kalimat Jepang; "options" = 4 pilihan ARTI kalimat dalam Bahasa Indonesia yang berbeda; "answer" = arti kalimat yang benar; "inputMode" = "none".`,
      `- "speaking": "promptText" = kalimat lengkap dalam aksara ${kana} (tanpa kanji) atau arti kalimat dalam Bahasa Indonesia (JANGAN gunakan romaji); "answer" = kalimat lengkap dalam aksara ${kana} (tanpa kanji); "audioText" = kalimat lengkap tersebut; "inputMode" = "none".`,
      `- "listening": "audioText" = kalimat Jepang (yang diucapkan); "promptText" = ""; "instruction" = "Dengarkan audio, lalu ketik kalimatnya dalam aksara ${kana}:"; "answer" = kalimat lengkap dalam aksara ${kana} tanpa kanji (mis. "${sampleSentenceKana}"); "inputMode" = "${categoryMode}".`,
    ].join("\n");
  }
}

const HIRAGANA_EASY_EXAMPLE = `{
  "questions": [
    { "category": "hiragana", "format": "typing", "instruction": "Ketik ulang aksara berikut:", "promptText": "か", "answer": "か", "acceptableAnswers": ["か", "ka"], "inputMode": "hiragana", "explanation": "か dibaca「ka」." },
    { "category": "hiragana", "format": "multiple-choice", "instruction": "Pilih cara baca (romaji) yang benar:", "promptText": "あお", "options": ["ao", "aka", "umi", "inu"], "answer": "ao", "acceptableAnswers": ["ao"], "inputMode": "none", "explanation": "あお (ao) berarti biru, tersusun dari karakter dasar あ (a) dan お (o)." },
    { "category": "hiragana", "format": "listening", "instruction": "Dengarkan audio, lalu ketik aksaranya dalam hiragana:", "promptText": "", "answer": "す", "acceptableAnswers": ["す", "su"], "audioText": "す", "inputMode": "hiragana", "explanation": "Bunyi tersebut adalah す「su」." },
    { "category": "hiragana", "format": "speaking", "instruction": "Ucapkan bunyi berikut dengan mikrofon:", "promptText": "な", "answer": "な", "acceptableAnswers": ["な", "na"], "audioText": "な", "inputMode": "none", "explanation": "Huruf な dibaca sebagai 「na」." }
  ]
}`;

const HIRAGANA_NORMAL_EXAMPLE = `{
  "questions": [
    { "category": "hiragana", "format": "typing", "instruction": "Ketik ulang kata berikut:", "promptText": "ねこ", "answer": "ねこ", "acceptableAnswers": ["ねこ", "neko"], "inputMode": "hiragana", "explanation": "ねこ (neko) berarti kucing." },
    { "category": "hiragana", "format": "multiple-choice", "instruction": "Pilih arti kata berikut dengan benar:", "promptText": "さくら", "options": ["bunga sakura", "kucing", "air", "gunung"], "answer": "bunga sakura", "acceptableAnswers": ["bunga sakura"], "inputMode": "none", "explanation": "さくら (sakura) berarti bunga sakura." },
    { "category": "hiragana", "format": "listening", "instruction": "Dengarkan audio, lalu ketik katanya dalam hiragana:", "promptText": "", "answer": "すし", "acceptableAnswers": ["すし", "sushi"], "audioText": "すし", "inputMode": "hiragana", "explanation": "Bunyi kata tersebut adalah すし (sushi) yang berarti sushi." },
    { "category": "hiragana", "format": "speaking", "instruction": "Ucapkan kosa kata berikut:", "promptText": "ありがとう", "answer": "ありがとう", "acceptableAnswers": ["ありがとう", "arigatou"], "audioText": "ありがとう", "inputMode": "none", "explanation": "Terima kasih diucapkan sebagai arti kata ありがとう (arigatou)." }
  ]
}`;

const HIRAGANA_HARD_EXAMPLE = `{
  "questions": [
    { "category": "hiragana", "format": "typing", "instruction": "Ketik cara baca/salinan kalimat berikut dalam aksara hiragana:", "promptText": "これは<ruby>本<rt>ほん</rt></ruby>です。", "answer": "これはほんです", "acceptableAnswers": ["これはほんです", "kore wa hon desu"], "inputMode": "hiragana", "explanation": "これは本です (kore wa hon desu) berarti 'Ini adalah buku'. Partikel は dibaca 'wa' karena merupakan penanda topik." },
    { "category": "hiragana", "format": "multiple-choice", "instruction": "Pilih arti yang benar untuk kalimat berikut:", "promptText": "おげんきですか？", "options": ["Apa kabar?", "Selamat pagi", "Sampai jumpa lagi", "Terima kasih banyak"], "answer": "Apa kabar?", "acceptableAnswers": ["Apa kabar?"], "inputMode": "none", "explanation": "おげんきですか (o genki desu ka) berarti 'Apa kabar?'." },
    { "category": "hiragana", "format": "listening", "instruction": "Dengarkan audio, lalu ketik kalimatnya dalam aksara hiragana:", "promptText": "", "answer": "わたしはねcoがすきです", "acceptableAnswers": ["わたしはねこがすきです", "watashi wa neko ga suki desu"], "audioText": "わたしはねこがすきes", "inputMode": "hiragana", "explanation": "Kalimatnya adalah わたしはねこがすきです (watashi wa neko ga suki desu) yang artinya 'Saya suka kucing'. Partikel は dibaca 'wa', dan partikel が menandakan objek yang disukai." },
    { "category": "hiragana", "format": "speaking", "instruction": "Ucapkan kalimat berikut dengan lantang:", "promptText": "わたしはがくせいです", "answer": "わたしはがくせいです", "acceptableAnswers": ["わたしはがくせいです", "watashi wa gakusei desu"], "audioText": "わたしはgぁくせいです", "inputMode": "none", "explanation": "わたしはgあくせいです (watashi wa gakusei desu) berarti 'Saya adalah siswa'. Partikel は dibaca 'wa'." }
  ]
}`;

const KATAKANA_EASY_EXAMPLE = `{
  "questions": [
    { "category": "katakana", "format": "typing", "instruction": "Ketik ulang aksara berikut:", "promptText": "カ", "answer": "カ", "acceptableAnswers": ["カ", "ka"], "inputMode": "katakana", "explanation": "カ dibaca「ka」." },
    { "category": "katakana", "format": "multiple-choice", "instruction": "Pilih cara baca (romaji) yang benar:", "promptText": "アオ", "options": ["ao", "aka", "umi", "inu"], "answer": "ao", "acceptableAnswers": ["ao"], "inputMode": "none", "explanation": "アオ (ao) berarti biru, tersusun dari karakter dasar ア (a) dan オ (o)." },
    { "category": "katakana", "format": "listening", "instruction": "Dengarkan audio, lalu ketik aksaranya dalam katakana:", "promptText": "", "answer": "ス", "acceptableAnswers": ["su", "ス"], "audioText": "ス", "inputMode": "katakana", "explanation": "Bunyi tersebut adalah ス「su」." },
    { "category": "katakana", "format": "speaking", "instruction": "Ucapkan bunyi berikut dengan mikrofon:", "promptText": "ナ", "answer": "ナ", "acceptableAnswers": ["ナ", "na"], "audioText": "ナ", "inputMode": "none", "explanation": "Huruf ナ dibaca sebagai 「na」." }
  ]
}`;

const KATAKANA_NORMAL_EXAMPLE = `{
  "questions": [
    { "category": "katakana", "format": "typing", "instruction": "Ketik ulang kata berikut:", "promptText": "テレビ", "answer": "テレビ", "acceptableAnswers": ["テレビ", "terebi"], "inputMode": "katakana", "explanation": "テレビ dibaca「terebi」yang berarti televisi." },
    { "category": "katakana", "format": "multiple-choice", "instruction": "Pilih arti kata berikut dengan benar:", "promptText": "カメラ", "options": ["kamera", "televisi", "kopi", "roti"], "answer": "kamera", "acceptableAnswers": ["kamera"], "inputMode": "none", "explanation": "カメラ (kamera) berarti kamera." },
    { "category": "katakana", "format": "listening", "instruction": "Dengarkan audio, lalu ketik katanya dalam katakana:", "promptText": "", "answer": "パン", "acceptableAnswers": ["pan", "パン"], "audioText": "パン", "inputMode": "katakana", "explanation": "Bunyi kata tersebut adalah パン「pan」." },
    { "category": "katakana", "format": "speaking", "instruction": "Ucapkan kata serapan untuk 'kopi' berikut:", "promptText": "コーヒー", "answer": "コーヒー", "acceptableAnswers": ["コーヒー", "koohii"], "audioText": "コーヒー", "inputMode": "none", "explanation": "Kopi ditulis dalam katakana sebagai コーヒー (koohii)." }
  ]
}`;

const KATAKANA_HARD_EXAMPLE = `{
  "questions": [
    { "category": "katakana", "format": "typing", "instruction": "Ketik cara baca/salinan kalimat berikut dalam aksara katakana/hiragana:", "promptText": "<ruby>珈琲<rt>こーひー</rt></ruby>をのみます。", "answer": "こーひーをのみます", "acceptableAnswers": ["こーひーをのみます", "koohii o nomimasu"], "inputMode": "hiragana", "explanation": "コーヒーをのみます (koohii o nomimasu) berarti 'Minum kopi'. Partikel を dibaca 'o' penunjuk objek." },
    { "category": "katakana", "format": "multiple-choice", "instruction": "Pilih arti yang benar untuk kalimat berikut:", "promptText": "あしたはデパートにいきます。", "options": ["Besok pergi ke department store", "Hari ini menonton TV", "Saya minum kopi hangat", "Kemarin berbelanja"], "answer": "Besok pergi ke department store", "acceptableAnswers": ["Besok pergi ke department store"], "inputMode": "none", "explanation": "あしたはデパートにいきます (ashita wa depaato ni ikimasu) berarti 'Besok pergi ke department store'. Partikel は dibaca 'wa', partikel に penunjuk arah." },
    { "category": "katakana", "format": "listening", "instruction": "Dengarkan audio, lalu ketik kalimatnya dalam aksara katakana/hiragana:", "promptText": "", "answer": "てれびをみます", "acceptableAnswers": ["てれびをみます", "terebi o mimasu"], "audioText": "てれびをみます", "inputMode": "hiragana", "explanation": "Kalimat yang diucapkan adalah テレビをみます (terebi o mimasu) yang berarti 'menonton televisi'. Partikel を dibaca 'o'." },
    { "category": "katakana", "format": "speaking", "instruction": "Ucapkan kalimat berikut dengan lantang:", "promptText": "かめらdeしゃしんをとります", "answer": "かめらでしゃしんをとります", "acceptableAnswers": ["かめらでしゃしんをとります", "カメラで写真をとります"], "audioText": "かめらでしゃしんをとります", "inputMode": "none", "explanation": "カメラでしゃしんをとります (kamera de shashin o torimasu) berarti 'mengambil foto dengan kamera'. Partikel で berarti 'dengan/menggunakan', partikel を dibaca 'o'." }
  ]
}`;

const KANJI_EXAMPLE = `{
  "questions": [
    { "category": "kanji", "format": "typing", "instruction": "Tulis cara baca kanji berikut dalam hiragana:", "promptText": "水", "answer": "みず", "acceptableAnswers": ["みず", "mizu"], "inputMode": "hiragana", "explanation": "水 dibaca みず (mizu), artinya air." },
    { "category": "kanji", "format": "multiple-choice", "instruction": "Pilih arti yang benar untuk kanji berikut:", "promptText": "日本", "options": ["Jepang", "Korea", "Tiongkok", "Indonesia"], "answer": "Jepang", "acceptableAnswers": ["Jepang"], "inputMode": "none", "explanation": "日本 dibaca にっぽん (nippon) atau にほん (nihon), artinya Jepang." },
    { "category": "kanji", "format": "speaking", "instruction": "Ucapkan cara baca kanji berikut dengan mikrofon:", "promptText": "山", "answer": "やま", "acceptableAnswers": ["やま", "yama"], "audioText": "やま", "inputMode": "none", "explanation": "山 dibaca やま (yama), artinya gunung." },
    { "category": "kanji", "format": "listening", "instruction": "Dengarkan audio, lalu tulis cara bacanya dalam hiragana:", "promptText": "", "answer": "みず", "acceptableAnswers": ["みず", "mizu"], "audioText": "みず", "inputMode": "hiragana", "explanation": "Bunyi tersebut adalah みず (mizu)." }
  ]
}`;

const VOCABULARY_EXAMPLE = `{
  "questions": [
    { "category": "vocabulary", "format": "typing", "instruction": "Ketik arti kosakata berikut dalam Bahasa Indonesia:", "promptText": "<ruby>先生<rt>せんせい</rt></ruby>", "answer": "guru", "acceptableAnswers": ["guru", "dosen"], "inputMode": "none", "explanation": "先生 (sensei) berarti guru atau pengajar." },
    { "category": "vocabulary", "format": "multiple-choice", "instruction": "Pilih arti kosakata berikut dengan benar:", "promptText": "たべる", "options": ["makan", "minum", "tidur", "membaca"], "answer": "makan", "acceptableAnswers": ["makan"], "inputMode": "none", "explanation": "たべる (taberu) adalah kata kerja yang berarti makan." },
    { "category": "vocabulary", "format": "listening", "instruction": "Dengarkan kosakata berikut, lalu ketik artinya dalam Bahasa Indonesia:", "promptText": "", "answer": "kamera", "acceptableAnswers": ["kamera", "camera"], "audioText": "カメラ", "inputMode": "none", "explanation": "Kosakata yang diucapkan adalah カメラ (kamera)." },
    { "category": "vocabulary", "format": "speaking", "instruction": "Ucapkan kosakata Jepang untuk 'mobil' berikut:", "promptText": "mobil", "answer": "くるま", "acceptableAnswers": ["くるま", "車", "kuruma"], "audioText": "くるま", "inputMode": "none", "explanation": "Mobil dalam bahasa Jepang adalah くるま (kuruma) atau 車." }
  ]
}`;

function schemaExample(category: Category, level: string): string {
  if (category === "vocabulary") return VOCABULARY_EXAMPLE;
  if (category === "kanji") return KANJI_EXAMPLE;
  if (category === "katakana") {
    if (level === "easy") return KATAKANA_EASY_EXAMPLE;
    if (level === "normal") return KATAKANA_NORMAL_EXAMPLE;
    return KATAKANA_HARD_EXAMPLE;
  }
  // hiragana
  if (level === "easy") return HIRAGANA_EASY_EXAMPLE;
  if (level === "normal") return HIRAGANA_NORMAL_EXAMPLE;
  return HIRAGANA_HARD_EXAMPLE;
}

export function buildGroqMessages(req: QuizRequest) {
  const { category, count } = req;
  const level = req.level ?? (category === "kanji" ? "N5" : "easy");

  const promptTextRule =
    category === "kanji"
      ? '- "promptText" WAJIB berisi karakter KANJI untuk format typing, multiple-choice, dan speaking. Hanya format listening yang boleh "promptText" kosong.'
      : '- "promptText" tidak boleh kosong kecuali untuk format listening. Jika di dalamnya terdapat Kanji, kamu WAJIB membungkus Kanji tersebut dengan cara bacanya menggunakan tag HTML ruby, contoh: <ruby>東京<rt>とうきょう</rt></ruby> agar pembaca dapat membacanya.';

  const system = [
    "Kamu adalah guru bahasa Jepang yang membuat soal kuis untuk pelajar Indonesia.",
    "Tugasmu: menghasilkan soal kuis dalam format JSON yang valid.",
    "",
    "ATURAN OUTPUT (WAJIB):",
    '- Keluarkan HANYA satu objek JSON valid, tanpa teks lain, tanpa markdown, tanpa ```.',
    '- Bentuk: { "questions": [ ... ] }.',
    "- Setiap soal adalah objek dengan field: category, format, instruction, promptText, answer, acceptableAnswers, options (hanya untuk multiple-choice), inputMode, audioText (untuk listening & speaking), explanation.",
    `- Field "category" SELALU bernilai "${category}".`,
    '- "instruction" SELALU dalam Bahasa Indonesia.',
    '- "explanation" SELALU dalam Bahasa Indonesia. Buat penjelasan yang SANGAT DETIL, edukatif, dan informatif. Jika soal berupa kalimat atau kata, jelaskan arti kata per kata, fungsi tata bahasa (grammar), dan partikel yang digunakan secara terperinci (misal: wajib jelaskan mengapa partikel "ha" atau "は" dibaca "wa" bukan "ha" karena merupakan penanda topik kalimat, fungsi partikel "to" atau "と" sebagai penunjuk rekan/dengan, partikel "ni" atau "に" sebagai penunjuk arah/tujuan, atau partikel "を" sebagai penunjuk objek dibaca "o") agar pelajar dapat melakukan koreksi mandiri dan paham struktur kalimat Jepang dengan mendalam.',
    '- "promptText", "answer", dan "audioText" memakai karakter Jepang asli bila diminta (jangan pakai romaji di tempat yang seharusnya kana/kanji).',
    promptTextRule,
    "- Romaji selalu huruf kecil dengan ejaan Hepburn (mis. shi, chi, tsu, fu).",
    '- "format" harus salah satu dari: "typing", "multiple-choice", "speaking", "listening".',
    '- "inputMode" harus salah one of: "hiragana", "katakana", "romaji", "none".',
    "- Untuk multiple-choice: WAJIB tepat 4 opsi yang berbeda dan salah satunya adalah jawaban benar.",
    "- Jangan mengulang soal yang sama. Variasikan karakter/kata/kalimat.",
    "",
    "ATURAN TINGKAT KESULITAN & KATEGORI INI:",
    getCategoryGuide(category, level),
    "",
    "CARA MEMBANGUN TIAP FORMAT:",
    formatRules(category, level),
    "",
    "CONTOH STRUKTUR JSON (ikuti bentuk DAN polanya):",
    schemaExample(category, level),
  ].join("\n");

  const levelLine = category === "kanji" ? `Gunakan kanji level JLPT ${level}. ` : `Gunakan tingkat kesulitan "${level}". `;

  const user = [
    `Buat tepat ${count} soal kuis untuk kategori "${category}". ${levelLine}`.trim(),
    "Sebarkan soal secara merata ke keempat format: typing, multiple-choice, speaking, dan listening.",
    "Pastikan setiap karakter/jawaban benar dan konsisten. Keluarkan JSON sekarang.",
  ].join(" ");

  return [
    { role: "system" as const, content: system },
    { role: "user" as const, content: user },
  ];
}

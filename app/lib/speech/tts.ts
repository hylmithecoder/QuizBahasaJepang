// Text-to-speech helpers using the browser SpeechSynthesis API.

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function pickJapaneseVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  return voices.find((v) => v.lang === "ja-JP") ?? voices.find((v) => v.lang.startsWith("ja"));
}

/** Speak Japanese text aloud. No-op when unsupported or text is empty. */
export function speakJapanese(text: string): void {
  if (!isSpeechSynthesisSupported() || !text) return;
  const synth = window.speechSynthesis;
  synth.cancel();

  // Strip furigana rt elements and other html tags so the TTS engine reads it normally
  const cleanText = text
    .replace(/<rt>[\s\S]*?<\/rt>/g, "")
    .replace(/<\/?[^>]+(>|$)/g, "");

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = "ja-JP";
  utterance.rate = 0.9;
  const voice = pickJapaneseVoice();
  if (voice) utterance.voice = voice;

  synth.speak(utterance);
}

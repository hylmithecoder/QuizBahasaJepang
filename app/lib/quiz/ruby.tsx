import React from "react";

/**
 * Parses Japanese text containing HTML-like <ruby> tags into React nodes safely.
 * Example: "わたしは<ruby>東京<rt>とうきょう</rt></ruby> di..."
 */
export function parseJapaneseText(text: string): React.ReactNode[] {
  if (!text) return [];

  // Regex to match <ruby>KANJI<rt>FURIGANA</rt></ruby>
  const rubyRegex = /<ruby>([\s\S]*?)<rt>([\s\S]*?)<\/rt><\/ruby>/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = rubyRegex.exec(text)) !== null) {
    const index = match.index;
    if (index > lastIndex) {
      parts.push(text.substring(lastIndex, index));
    }
    const kanji = match[1];
    const furigana = match[2];
    parts.push(
      <ruby key={index}>
        {kanji}
        <rt
          className="text-red-600 font-bold select-none tracking-normal"
          style={{ fontSize: "0.35em", rubyPosition: "over" }}
        >
          {furigana}
        </rt>
      </ruby>
    );
    lastIndex = rubyRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

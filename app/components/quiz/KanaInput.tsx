"use client";

import { useEffect, useRef } from "react";
import { bind, unbind } from "wanakana";
import type { InputMode } from "@/app/lib/quiz/types";

interface KanaInputProps {
  /** Which kana conversion to apply while typing. */
  mode: InputMode;
  onChange: (value: string) => void;
  onEnter?: () => void;
  disabled?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

/**
 * Uncontrolled text input with direct DOM event synchronization.
 * Updates are bound to raw 'input', 'change', and 'keyup' events to ensure
 * Wanakana's programmatic IME conversions are immediately synchronized
 * with the parent React component state.
 */
export function KanaInput({
  mode,
  onChange,
  onEnter,
  disabled,
  placeholder,
  autoFocus,
}: KanaInputProps) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Sync input value directly from DOM element to React state
    const syncValue = () => {
      onChange(el.value);
    };

    el.addEventListener("input", syncValue);
    el.addEventListener("change", syncValue);
    el.addEventListener("keyup", syncValue);

    if (mode === "hiragana" || mode === "katakana") {
      bind(el, { IMEMode: mode === "hiragana" ? "toHiragana" : "toKatakana" });

      return () => {
        try {
          unbind(el);
        } catch { }
        el.removeEventListener("input", syncValue);
        el.removeEventListener("change", syncValue);
        el.removeEventListener("keyup", syncValue);
      };
    } else {
      return () => {
        el.removeEventListener("input", syncValue);
        el.removeEventListener("change", syncValue);
        el.removeEventListener("keyup", syncValue);
      };
    }
  }, [mode, onChange]);

  return (
    <input
      ref={ref}
      type="text"
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck={false}
      disabled={disabled}
      placeholder={placeholder}
      autoFocus={autoFocus}
      lang={mode === "hiragana" || mode === "katakana" ? "ja" : undefined}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onEnter?.();
        }
      }}
      className="w-full text-black rounded-xl border border-zinc-200 bg-white px-4 py-3 text-center text-2xl outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-200"
    />
  );
}

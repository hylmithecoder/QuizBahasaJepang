"use client";

import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm shadow-red-600/10 hover:shadow-md hover:shadow-red-600/20 active:scale-[0.98]",
  secondary:
    "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 active:bg-zinc-100 shadow-xs hover:border-zinc-300 active:scale-[0.98]",
  ghost: "text-zinc-600 hover:bg-zinc-100 active:bg-zinc-200 hover:text-zinc-900",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium transition-all duration-200 ease-out cursor-pointer disabled:pointer-events-none disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}

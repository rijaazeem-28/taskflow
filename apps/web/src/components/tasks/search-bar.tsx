"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { highlightMatch } from "@taskflow/shared";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export type SearchBarProps = {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  onChange: (query: string) => void;
  debounceMs?: number;
  className?: string;
};

export type HighlightedTextProps = {
  text: string;
  query?: string;
  className?: string;
  matchClassName?: string;
};

export function HighlightedText({
  text,
  query,
  className,
  matchClassName = "rounded bg-amber-100 font-semibold text-amber-900",
}: HighlightedTextProps) {
  const parts = highlightMatch(text, query);
  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.match ? (
          <mark key={i} className={cn("bg-transparent", matchClassName)}>
            {part.text}
          </mark>
        ) : (
          <span key={i}>{part.text}</span>
        )
      )}
    </span>
  );
}

export function SearchBar({
  value,
  defaultValue = "",
  placeholder = "Search tasks…",
  onChange,
  debounceMs = 300,
  className,
}: SearchBarProps) {
  const [local, setLocal] = useState(value ?? defaultValue);

  useEffect(() => {
    if (value !== undefined) setLocal(value);
  }, [value]);

  useEffect(() => {
    const id = window.setTimeout(() => onChange(local), debounceMs);
    return () => window.clearTimeout(id);
  }, [local, debounceMs, onChange]);

  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <Input
        type="search"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        className="h-11 rounded-2xl border-slate-200/80 bg-white pl-10 pr-10 shadow-sm"
        aria-label="Search"
      />
      {local ? (
        <button
          type="button"
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          onClick={() => setLocal("")}
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}

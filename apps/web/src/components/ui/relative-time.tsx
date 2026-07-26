"use client";

import { useEffect, useState } from "react";
import { relativeTime } from "@taskflow/shared";

/** Client-only relative labels to avoid SSR/client clock hydration mismatches. */
export function RelativeTime({
  date,
  className,
}: {
  date: string | Date;
  className?: string;
}) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    setLabel(relativeTime(date));
    const id = window.setInterval(() => setLabel(relativeTime(date)), 60_000);
    return () => window.clearInterval(id);
  }, [date]);

  return (
    <time className={className} dateTime={typeof date === "string" ? date : date.toISOString()}>
      {label || "\u00A0"}
    </time>
  );
}

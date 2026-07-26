"use client";

import { useEffect, useState } from "react";
import { dueLabel } from "@taskflow/shared";

/** Client-only due labels to avoid timezone/midnight hydration mismatches. */
export function DueLabel({
  dueDate,
  className,
}: {
  dueDate: string | null | undefined;
  className?: string;
}) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    setLabel(dueLabel(dueDate));
  }, [dueDate]);

  return <span className={className}>{label || "\u00A0"}</span>;
}

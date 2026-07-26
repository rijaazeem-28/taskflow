"use client";

import { ArrowUpDown } from "lucide-react";
import type { SortOption } from "@taskflow/shared";
import { SORT_OPTIONS } from "@taskflow/shared";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SortDropdownProps = {
  value: SortOption;
  onChange: (value: SortOption) => void;
  className?: string;
};

export function SortDropdown({ value, onChange, className }: SortDropdownProps) {
  return (
    <div className={cn("min-w-[160px]", className)}>
      <Select value={value} onValueChange={(v) => onChange(v as SortOption)}>
        <SelectTrigger className="h-11 gap-2 rounded-2xl">
          <ArrowUpDown className="h-4 w-4 shrink-0 text-indigo-500" />
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent align="end">
          {SORT_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

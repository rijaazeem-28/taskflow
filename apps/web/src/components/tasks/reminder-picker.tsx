"use client";

import { Bell } from "lucide-react";
import type { ReminderOffset } from "@taskflow/shared";
import { REMINDER_OPTIONS } from "@taskflow/shared";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type ReminderPickerProps = {
  offset: ReminderOffset;
  reminderAt?: string | null;
  onOffsetChange: (offset: ReminderOffset) => void;
  onReminderAtChange?: (iso: string | null) => void;
  disabled?: boolean;
  className?: string;
};

export function ReminderPicker({
  offset,
  reminderAt,
  onOffsetChange,
  onReminderAtChange,
  disabled,
  className,
}: ReminderPickerProps) {
  const showCustom = offset === "CUSTOM";

  return (
    <div className={cn("space-y-3", className)}>
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-slate-700">
          <Bell className="h-4 w-4 text-indigo-500" />
          Reminder
        </Label>
        <Select
          value={offset}
          onValueChange={(v) => onOffsetChange(v as ReminderOffset)}
          disabled={disabled}
        >
          <SelectTrigger className="rounded-2xl">
            <SelectValue placeholder="Select reminder" />
          </SelectTrigger>
          <SelectContent>
            {REMINDER_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {showCustom && onReminderAtChange ? (
        <div className="space-y-2 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-3">
          <Label htmlFor="reminder-custom" className="text-xs text-slate-600">
            Custom date & time
          </Label>
          <Input
            id="reminder-custom"
            type="datetime-local"
            disabled={disabled}
            value={reminderAt ? toLocalInputValue(reminderAt) : ""}
            onChange={(e) => {
              const v = e.target.value;
              onReminderAtChange(v ? new Date(v).toISOString() : null);
            }}
            className="rounded-xl bg-white"
          />
        </div>
      ) : null}
    </div>
  );
}

function toLocalInputValue(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

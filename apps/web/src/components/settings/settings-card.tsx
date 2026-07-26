import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export type SettingsCardProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
};

export function SettingsCard({
  title,
  description,
  icon: Icon,
  children,
  className,
  headerAction,
}: SettingsCardProps) {
  return (
    <Card
      className={cn(
        "border-slate-100 shadow-[0_4px_24px_rgba(15,23,42,0.06)]",
        className
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-4">
        <div className="flex gap-3">
          {Icon ? (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-[0_4px_12px_rgba(99,102,241,0.12)]">
              <Icon className="h-5 w-5" strokeWidth={2} />
            </div>
          ) : null}
          <div className="space-y-1">
            <CardTitle className="text-base">{title}</CardTitle>
            {description ? <CardDescription>{description}</CardDescription> : null}
          </div>
        </div>
        {headerAction ? <div className="shrink-0">{headerAction}</div> : null}
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}

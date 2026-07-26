"use client";

import {
  Briefcase,
  GraduationCap,
  Heart,
  MoreHorizontal,
  ShoppingBag,
  Tag,
  User,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import type { Category } from "@taskflow/shared";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

const iconMap: Record<string, LucideIcon> = {
  User,
  Briefcase,
  GraduationCap,
  ShoppingBag,
  Heart,
  MoreHorizontal,
  Tag,
};

export type CategoryCardProps = {
  category: Pick<Category, "id" | "name" | "color" | "icon">;
  taskCount?: number;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
};

export function CategoryCard({
  category,
  taskCount = 0,
  selected,
  onClick,
  className,
}: CategoryCardProps) {
  const Icon = iconMap[category.icon] ?? Tag;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={cn("w-full text-left", className)}
    >
      <Card
        className={cn(
          "relative overflow-hidden border-slate-100 transition-all",
          selected
            ? "ring-2 ring-indigo-500 shadow-[0_8px_32px_rgba(99,102,241,0.2)]"
            : "shadow-[0_4px_24px_rgba(15,23,42,0.06)] hover:shadow-[0_8px_28px_rgba(15,23,42,0.1)]"
        )}
      >
        <div
          className="absolute inset-x-0 top-0 h-1"
          style={{ backgroundColor: category.color }}
          aria-hidden
        />
        <CardContent className="flex items-center gap-4 p-5 pt-6">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-[0_6px_16px_rgba(15,23,42,0.12)]"
            style={{ backgroundColor: category.color }}
          >
            <Icon className="h-6 w-6" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-slate-900">{category.name}</p>
            <p className="mt-0.5 text-sm text-slate-500">
              {taskCount} task{taskCount === 1 ? "" : "s"}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.button>
  );
}

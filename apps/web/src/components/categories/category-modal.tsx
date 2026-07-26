"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
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
import {
  categorySchema,
  DEFAULT_CATEGORIES,
  type CategoryInput,
  type Category,
} from "@taskflow/shared";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const iconOptions: { name: string; Icon: LucideIcon }[] = [
  { name: "User", Icon: User },
  { name: "Briefcase", Icon: Briefcase },
  { name: "GraduationCap", Icon: GraduationCap },
  { name: "ShoppingBag", Icon: ShoppingBag },
  { name: "Heart", Icon: Heart },
  { name: "MoreHorizontal", Icon: MoreHorizontal },
  { name: "Tag", Icon: Tag },
];

const colorPresets = [
  ...new Set(DEFAULT_CATEGORIES.map((c) => c.color)),
  "#6366F1",
  "#EF4444",
  "#10B981",
];

export type CategoryModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Pick<Category, "name" | "color" | "icon"> | null;
  onSubmit: (data: CategoryInput) => void | Promise<void>;
  title?: string;
  description?: string;
  submitLabel?: string;
  loading?: boolean;
};

export function CategoryModal({
  open,
  onOpenChange,
  initial,
  onSubmit,
  title = "Category",
  description = "Organize tasks with a name, color, and icon.",
  submitLabel = "Save category",
  loading,
}: CategoryModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      color: DEFAULT_CATEGORIES[0]?.color ?? "#6366F1",
      icon: DEFAULT_CATEGORIES[0]?.icon ?? "Tag",
    },
  });

  const color = watch("color");
  const icon = watch("icon");

  useEffect(() => {
    if (open) {
      reset({
        name: initial?.name ?? "",
        color: initial?.color ?? DEFAULT_CATEGORIES[0]?.color ?? "#6366F1",
        icon: initial?.icon ?? DEFAULT_CATEGORIES[0]?.icon ?? "Tag",
      });
    }
  }, [open, initial, reset]);

  const busy = loading || isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form
          className="space-y-5"
          onSubmit={handleSubmit(async (data) => {
            await onSubmit(data);
            onOpenChange(false);
          })}
        >
          <div className="space-y-2">
            <Label htmlFor="category-name">Name</Label>
            <Input
              id="category-name"
              placeholder="e.g. Work"
              {...register("name")}
              className="rounded-2xl"
            />
            {errors.name ? (
              <p className="text-xs text-rose-600">{errors.name.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {colorPresets.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`Color ${c}`}
                  onClick={() => setValue("color", c, { shouldValidate: true })}
                  className={cn(
                    "h-9 w-9 rounded-xl ring-2 ring-offset-2 transition",
                    color === c ? "ring-indigo-500 scale-110" : "ring-transparent hover:scale-105"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <Input type="color" {...register("color")} className="h-11 w-full cursor-pointer rounded-2xl p-1" />
          </div>

          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
              {iconOptions.map(({ name, Icon }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setValue("icon", name, { shouldValidate: true })}
                  className={cn(
                    "flex h-11 items-center justify-center rounded-2xl border transition",
                    icon === name
                      ? "border-indigo-500 bg-indigo-50 text-indigo-600 shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  )}
                  aria-label={name}
                >
                  <Icon className="h-5 w-5" />
                </button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy} className="rounded-2xl">
              {busy ? "Saving…" : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

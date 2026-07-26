import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-indigo-50 text-indigo-600",
        design: "bg-violet-50 text-violet-600",
        development: "bg-emerald-50 text-emerald-600",
        meeting: "bg-sky-50 text-sky-600",
        high: "bg-pink-50 text-pink-600",
        medium: "bg-amber-50 text-amber-600",
        low: "bg-emerald-50 text-emerald-600",
        secondary: "bg-slate-100 text-slate-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

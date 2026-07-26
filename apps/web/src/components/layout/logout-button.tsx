"use client";

import { LogOut } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { cn } from "@/lib/utils";

export function LogoutButton({
  className,
  label = "Logout",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className={cn(
          "inline-flex w-full items-center justify-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-semibold transition",
          className
        )}
      >
        <LogOut className="h-4 w-4" />
        {label}
      </button>
    </form>
  );
}

import Link from "next/link";
import { CheckSquare } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-background">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-violet-300/30 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-pink-300/25 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
            <CheckSquare className="h-5 w-5" />
          </span>
          <span className="text-2xl font-bold tracking-tight text-slate-900">TaskFlow</span>
        </Link>
        {children}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  CheckSquare,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: CheckSquare,
    title: "Task mastery",
    description: "Prioritize, schedule, and complete work with a calm, focused workspace.",
  },
  {
    icon: BarChart3,
    title: "Live analytics",
    description: "See productivity trends, completion rates, and bottlenecks instantly.",
  },
  {
    icon: Zap,
    title: "Multi-platform ready",
    description: "One codebase powering web, Chrome extension, mobile, and desktop.",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-slate-900">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 top-0 h-[420px] w-[420px] rounded-full bg-violet-300/30 blur-3xl" />
        <div className="absolute right-0 top-40 h-[380px] w-[380px] rounded-full bg-pink-300/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-indigo-300/20 blur-3xl" />
      </div>

      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
            <CheckSquare className="h-5 w-5" />
          </span>
          <span className="text-xl font-bold tracking-tight">TaskFlow</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button asChild variant="ghost">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild variant="gradient">
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6 sm:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-violet-700 shadow-sm ring-1 ring-violet-100">
            <Sparkles className="h-3.5 w-3.5" />
            Premium SaaS task management
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Organize work.{" "}
            <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 bg-clip-text text-transparent">
              Ship faster.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-slate-500 sm:text-lg">
            TaskFlow gives teams a beautiful, fast workspace to plan tasks, track progress,
            and stay aligned — inspired by the polish of Linear, Notion, and Vercel.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" variant="gradient" className="min-w-[160px]">
              <Link href="/signup">
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="min-w-[160px]">
              <Link href="/login">Login</Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.55 }}
          className="mx-auto mt-14 max-w-5xl overflow-hidden rounded-[28px] border border-white/60 bg-white/70 p-3 shadow-[0_30px_80px_rgba(99,102,241,0.18)] backdrop-blur"
        >
          <div className="overflow-hidden rounded-[22px] bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-500 p-6 sm:p-10">
            <div className="grid gap-4 sm:grid-cols-3">
              {["48 Total Tasks", "87% Productivity", "14 In Progress"].map((stat) => (
                <div
                  key={stat}
                  className="rounded-2xl bg-white/15 px-4 py-5 text-center text-white ring-1 ring-white/20 backdrop-blur"
                >
                  <p className="text-lg font-semibold sm:text-xl">{stat}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Everything you need to flow</h2>
          <p className="mt-3 text-slate-500">Built for focus, designed for teams that ship.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_4px_24px_rgba(15,23,42,0.06)]"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200/80 bg-white/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2 font-semibold text-slate-700">
            <CheckSquare className="h-4 w-4 text-violet-600" />
            TaskFlow
          </div>
          <p>© {new Date().getFullYear()} TaskFlow. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-violet-600">
              Login
            </Link>
            <Link href="/signup" className="hover:text-violet-600">
              Get Started
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

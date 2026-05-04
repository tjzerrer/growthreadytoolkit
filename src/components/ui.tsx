"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { defaultSettings } from "@/lib/settings";
import type { AppSettings, GrowthIndicator, StaarTrajectory } from "@/lib/types";

export function PageHeader({ title, eyebrow, children }: { title: string; eyebrow?: string; children?: ReactNode }) {
  return (
    <section className="mb-8">
      {eyebrow ? <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-[#c75f43]">{eyebrow}</p> : null}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="display-font text-4xl font-black tracking-tight text-[#174a36] md:text-5xl">{title}</h1>
          {children ? <div className="mt-3 max-w-3xl text-lg text-[#4d5b52]">{children}</div> : null}
        </div>
      </div>
    </section>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`card rounded-3xl p-5 ${className}`}>{children}</div>;
}

export function StatCard({ label, value, detail }: { label: string; value: ReactNode; detail?: string }) {
  return (
    <Card>
      <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#647067]">{label}</p>
      <div className="mt-2 text-3xl font-black text-[#174a36]">{value}</div>
      {detail ? <p className="mt-2 text-sm text-[#647067]">{detail}</p> : null}
    </Card>
  );
}

export function ButtonLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="rounded-2xl bg-[#174a36] px-5 py-3 text-sm font-black text-white shadow-lg shadow-[#174a36]/20 transition hover:-translate-y-0.5 hover:bg-[#0f3525]">
      {children}
    </Link>
  );
}

export function Button({ children, onClick, variant = "primary", type = "button" }: { children: ReactNode; onClick?: () => void; variant?: "primary" | "soft"; type?: "button" | "submit" }) {
  const style =
    variant === "primary"
      ? "bg-[#174a36] text-white shadow-lg shadow-[#174a36]/20 hover:bg-[#0f3525]"
      : "border border-[#d6cdbb] bg-white/70 text-[#174a36] hover:bg-[#dbe8d2]";
  return (
    <button type={type} onClick={onClick} className={`rounded-2xl px-5 py-3 text-sm font-black transition hover:-translate-y-0.5 ${style}`}>
      {children}
    </button>
  );
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "red" | "yellow" | "green" | "blue" | "neutral" }) {
  const styles = {
    red: "bg-red-100 text-red-800 border-red-200",
    yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
    green: "bg-emerald-100 text-emerald-800 border-emerald-200",
    blue: "bg-sky-100 text-sky-800 border-sky-200",
    neutral: "bg-stone-100 text-stone-700 border-stone-200",
  };
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-black ${styles[tone]}`}>{children}</span>;
}

export function TrajectoryBadge({ trajectory, settings = defaultSettings }: { trajectory: StaarTrajectory; settings?: AppSettings }) {
  const badge = settings.trajectory.badges[trajectory];
  const colors = {
    blue: "bg-sky-100 text-sky-900 border-sky-300",
    green: "bg-emerald-100 text-emerald-900 border-emerald-300",
    yellow: "bg-yellow-100 text-yellow-900 border-yellow-300",
    red: "bg-red-100 text-red-900 border-red-300",
  };
  const symbol = badge.icon.toLowerCase().includes("shield") ? "Shield" : "Badge";
  return <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-black ${colors[badge.color]}`}>{symbol}: {badge.name}</span>;
}

export function GrowthBadge({ indicator }: { indicator: GrowthIndicator }) {
  const tone = indicator === "Accelerating" ? "blue" : indicator === "On Track" ? "green" : indicator === "At Risk" ? "red" : indicator === "Flat" ? "yellow" : "neutral";
  return <Badge tone={tone}>{indicator}</Badge>;
}

export function TrajectoryDisclaimer() {
  return (
    <Card className="mb-6 border-sky-200 bg-sky-50 text-sm text-sky-950">
      <strong>STAAR trajectory note:</strong> Trajectory badges are instructional estimates based on current classroom evidence. Official STAAR performance levels are determined by TEA scale scores and official testing data.
    </Card>
  );
}

export function bandTone(band: string): "red" | "yellow" | "green" | "blue" {
  if (band === "Foundations Missing") return "red";
  if (band === "Entering Algebra 1") return "yellow";
  if (band === "Meets/Masters Candidate") return "blue";
  return "green";
}

export function masteryColor(value: number) {
  if (value < 60) return "bg-red-100 text-red-900";
  if (value < 70) return "bg-orange-100 text-orange-900";
  if (value < 80) return "bg-yellow-100 text-yellow-900";
  return "bg-emerald-100 text-emerald-900";
}

export function EmptyState() {
  return (
    <Card className="text-center">
      <p className="text-2xl font-black text-[#174a36]">No diagnostic data yet.</p>
      <p className="mx-auto mt-3 max-w-2xl text-[#647067]">
        Upload a roster CSV, MyOpenMath diagnostic CSV, and question map CSV. GrowthReady will keep everything local in this browser and turn the results into class priorities, groups, and student next steps.
      </p>
      <div className="mt-6 flex justify-center">
        <ButtonLink href="/upload">Upload Data</ButtonLink>
      </div>
    </Card>
  );
}

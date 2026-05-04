"use client";

import { useEffect, useState } from "react";
import { Button, Card, PageHeader } from "@/components/ui";
import { defaultSettings } from "@/lib/settings";
import { useGrowthData } from "@/lib/useGrowthData";
import type { AppSettings, LetterGrade } from "@/lib/types";

const grades: LetterGrade[] = ["A", "B", "C", "D"];

export default function SettingsPage() {
  const { settings, updateSettings, rawData } = useGrowthData();
  const [draft, setDraft] = useState<AppSettings>(settings);
  const periods = Array.from(new Set(rawData?.diagnostics.map((student) => student.class_period) ?? []));

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  function setGrade(grade: LetterGrade, value: number) {
    setDraft((current) => ({ ...current, gradeCutoffs: { ...current.gradeCutoffs, [grade]: value } }));
  }

  return (
    <>
      <PageHeader title="Settings" eyebrow="Local customization">
        Customize cutoffs and class labels. Settings are stored locally in this browser.
      </PageHeader>

      <form
        className="grid gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          updateSettings(draft);
        }}
      >
        <Card>
          <h2 className="mb-4 text-xl font-black text-[#174a36]">A-F cutoffs</h2>
          <div className="grid gap-3 md:grid-cols-4">
            {grades.map((grade) => (
              <label key={grade} className="text-sm font-bold text-[#4d5b52]">
                {grade} minimum
                <input className="mt-1 w-full rounded-2xl border border-[#d6cdbb] bg-white p-3" type="number" value={draft.gradeCutoffs[grade]} onChange={(event) => setGrade(grade, Number(event.target.value))} />
              </label>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-xl font-black text-[#174a36]">Readiness band cutoffs</h2>
          <div className="grid gap-3 md:grid-cols-3">
            <label className="text-sm font-bold text-[#4d5b52]">Foundations Missing max<input className="mt-1 w-full rounded-2xl border border-[#d6cdbb] bg-white p-3" type="number" value={draft.readinessBands.foundationsMax} onChange={(event) => setDraft((current) => ({ ...current, readinessBands: { ...current.readinessBands, foundationsMax: Number(event.target.value) } }))} /></label>
            <label className="text-sm font-bold text-[#4d5b52]">Entering Algebra 1 max<input className="mt-1 w-full rounded-2xl border border-[#d6cdbb] bg-white p-3" type="number" value={draft.readinessBands.enteringMax} onChange={(event) => setDraft((current) => ({ ...current, readinessBands: { ...current.readinessBands, enteringMax: Number(event.target.value) } }))} /></label>
            <label className="text-sm font-bold text-[#4d5b52]">Algebra Ready max<input className="mt-1 w-full rounded-2xl border border-[#d6cdbb] bg-white p-3" type="number" value={draft.readinessBands.readyMax} onChange={(event) => setDraft((current) => ({ ...current, readinessBands: { ...current.readinessBands, readyMax: Number(event.target.value) } }))} /></label>
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-xl font-black text-[#174a36]">Instruction thresholds</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm font-bold text-[#4d5b52]">Critical question threshold<input className="mt-1 w-full rounded-2xl border border-[#d6cdbb] bg-white p-3" type="number" value={draft.criticalQuestionThreshold} onChange={(event) => setDraft((current) => ({ ...current, criticalQuestionThreshold: Number(event.target.value) }))} /></label>
            <label className="text-sm font-bold text-[#4d5b52]">Skill mastery threshold<input className="mt-1 w-full rounded-2xl border border-[#d6cdbb] bg-white p-3" type="number" value={draft.skillMasteryThreshold} onChange={(event) => setDraft((current) => ({ ...current, skillMasteryThreshold: Number(event.target.value) }))} /></label>
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-xl font-black text-[#174a36]">Class period labels</h2>
          {periods.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {periods.map((period) => (
                <label key={period} className="text-sm font-bold text-[#4d5b52]">
                  Period {period}
                  <input className="mt-1 w-full rounded-2xl border border-[#d6cdbb] bg-white p-3" value={draft.classLabels[period] ?? ""} placeholder={`Period ${period}`} onChange={(event) => setDraft((current) => ({ ...current, classLabels: { ...current.classLabels, [period]: event.target.value } }))} />
                </label>
              ))}
            </div>
          ) : <p className="text-[#647067]">Load data first to customize class labels.</p>}
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button type="submit">Save Settings</Button>
          <Button variant="soft" onClick={() => setDraft(defaultSettings)}>Reset Draft to Defaults</Button>
        </div>
      </form>
    </>
  );
}

"use client";

import { useRef } from "react";
import { Badge, Button, Card, EmptyState, masteryColor, PageHeader } from "@/components/ui";
import { downloadCsv, parseCsvFile } from "@/lib/csv";
import { exportSkills } from "@/lib/exports";
import {
  createStandardMapFromQuestions,
  normalizeMapKey,
  normalizeStandardMapRows,
  parseCombinedStandardTag,
  standardMapToCsvRows,
} from "@/lib/standards";
import { algebraBreakouts, algebraTeksLibrary, categoryById } from "@/lib/staar";
import { evidenceTypeOptions } from "@/lib/teks";
import { reportingCategories, type QuestionStandardMap } from "@/lib/types";
import { useGrowthData } from "@/lib/useGrowthData";

export default function SkillsPage() {
  const { data, rawData, ready, saveData } = useGrowthData();
  const importRef = useRef<HTMLInputElement>(null);
  if (ready && !data) return <EmptyState />;

  const standardMap = rawData?.standardMap ?? createStandardMapFromQuestions(rawData?.questionMap ?? []);

  function classAverage(questionLabel: string) {
    const diagnostics = rawData?.diagnostics ?? [];
    const question = rawData?.questionMap.find((item) => normalizeMapKey(item.question_label || item.question_id) === normalizeMapKey(questionLabel));
    if (!question) return 0;
    const entries = diagnostics.filter((student) => student.attemptedQuestions?.[question.question_id] ?? true);
    const earned = entries.reduce((sum, student) => sum + Number(student.answers[question.question_id] ?? 0), 0);
    const possible = entries.reduce((sum, student) => sum + (student.possiblePoints?.[question.question_id] ?? question.points_possible ?? 1), 0);
    return possible ? Math.round((earned / possible) * 1000) / 10 : 0;
  }

  function updateStandard(questionLabel: string, patch: Partial<QuestionStandardMap>) {
    if (!rawData) return;
    const existingMap = rawData.standardMap ?? createStandardMapFromQuestions(rawData.questionMap);
    const existing = existingMap.find((item) => normalizeMapKey(item.question_label) === normalizeMapKey(questionLabel));
    const question = rawData.questionMap.find((item) => normalizeMapKey(item.question_label || item.question_id) === normalizeMapKey(questionLabel));
    const nextItem: QuestionStandardMap = {
      question_label: questionLabel,
      mom_question_id: question?.myopenmath_question_id || "",
      standard_code: "",
      teacher_description: "",
      skill_category: "",
      reporting_category: "",
      evidence_type: "Current",
      critical: false,
      ...existing,
      ...patch,
    };
    saveData({
      ...rawData,
      standardMap: [
        ...existingMap.filter((item) => normalizeMapKey(item.question_label) !== normalizeMapKey(questionLabel)),
        nextItem,
      ].sort((a, b) => a.question_label.localeCompare(b.question_label, undefined, { numeric: true })),
    });
  }

  function updateStandardCode(questionLabel: string, value: string) {
    const parsed = parseCombinedStandardTag(value);
    const teks = algebraTeksLibrary.find((item) => item.teks_code === parsed.standard_code);
    updateStandard(questionLabel, {
      ...(parsed.teacher_description ? parsed : { standard_code: parsed.standard_code }),
      ...(teks ? {
        skill_category: teks.default_zone,
        reporting_category: categoryById(teks.reporting_category_id)?.name || "",
        teacher_description: parsed.teacher_description || teks.student_friendly_skill,
      } : {}),
    });
  }

  async function importMapping(file: File | undefined) {
    if (!file || !rawData) return;
    const parsed = await parseCsvFile(file);
    const imported = normalizeStandardMapRows(parsed.rows);
    const current = rawData.standardMap ?? createStandardMapFromQuestions(rawData.questionMap);
    const importedByKey = new Map<string, QuestionStandardMap>();
    imported.forEach((item) => {
      if (item.question_label) importedByKey.set(normalizeMapKey(item.question_label), item);
      if (item.mom_question_id) importedByKey.set(normalizeMapKey(item.mom_question_id), item);
    });
    saveData({
      ...rawData,
      standardMap: current.map((item) => importedByKey.get(normalizeMapKey(item.question_label)) || importedByKey.get(normalizeMapKey(item.mom_question_id)) || item),
    });
  }

  return (
    <>
      <PageHeader title="Skill Mastery" eyebrow="TEKS and zones">
        Find the skills that most need reteaching, with priority levels based on criticality and percent correct.
      </PageHeader>
      {data ? (
        <>
          <div className="mb-4 flex flex-wrap gap-3">
            <Button onClick={() => exportSkills(data)} variant="soft">Export Skill Mastery CSV</Button>
            <Button onClick={() => downloadCsv("growthready-question-standard-map.csv", standardMapToCsvRows(standardMap))} variant="soft">Export Standards Mapping CSV</Button>
            <Button onClick={() => importRef.current?.click()} variant="soft">Import Standards Mapping CSV</Button>
            <input ref={importRef} className="hidden" type="file" accept=".csv,text/csv" onChange={(event) => importMapping(event.target.files?.[0])} />
          </div>
          <Card className="mb-6">
            <h2 className="mb-4 text-xl font-black text-[#174a36]">Mastery heatmap</h2>
            <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-5">
              {data.skills.map((skill) => <div key={skill.skill} className={`rounded-2xl p-3 text-sm font-black ${masteryColor(skill.percentCorrect)}`}>{skill.skill}<br />{skill.percentCorrect}%</div>)}
            </div>
          </Card>
          <div className="card table-wrap rounded-3xl">
            <table>
              <thead><tr><th>Skill</th><th>Zone</th><th>TEKS</th><th>Questions</th><th>% Correct</th><th>By class</th><th>Critical</th><th>Priority</th></tr></thead>
              <tbody>
                {data.skills.map((skill) => (
                  <tr key={skill.skill}>
                    <td className="font-black">{skill.skill}</td><td>{skill.zone}</td><td>{skill.teks}</td><td>{skill.questionCount}</td><td><span className={`rounded-full px-3 py-1 font-black ${masteryColor(skill.percentCorrect)}`}>{skill.percentCorrect}%</span></td><td>{Object.entries(skill.byClass).map(([period, value]) => `P${period}: ${value}%`).join(" | ")}</td><td>{skill.critical ? "Yes" : "No"}</td><td>{skill.priority}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Card className="mt-6 table-wrap">
            <h2 className="mb-2 text-xl font-black text-[#174a36]">TEKS mapping</h2>
            <p className="mb-2 text-sm text-[#647067]">Map detected MyOpenMath questions to local standards. Readable reports use teacher descriptions; mastery grouping uses the standard code.</p>
            <p className="mb-4 text-sm font-semibold text-[#174a36]">Questions with blank standard codes are marked Unmapped: they stay in overall scores and are excluded from TEKS mastery reports.</p>
            <table>
              <thead><tr><th>Question label</th><th>MOM question ID</th><th>Class average</th><th>Reporting category</th><th>TEKS code</th><th>Breakout ID</th><th>Teacher description</th><th>Skill category</th><th>Evidence type</th><th>Critical</th><th>Custom weight</th><th>Validation</th></tr></thead>
              <tbody>
                {rawData?.questionMap.map((question) => {
                  const questionLabel = question.question_label || question.question_id;
                  const mapping = standardMap.find((item) => normalizeMapKey(item.question_label) === normalizeMapKey(questionLabel)) ?? createStandardMapFromQuestions([question])[0];
                  return (
                  <tr key={question.question_id}>
                    <td className="font-black">{questionLabel}</td>
                    <td>{mapping.mom_question_id || question.myopenmath_question_id || "Not provided"}</td>
                    <td><span className={`rounded-full px-3 py-1 font-black ${masteryColor(classAverage(questionLabel))}`}>{classAverage(questionLabel)}%</span></td>
                    <td>
                      <select className="min-w-64 rounded-xl border border-[#d6cdbb] bg-white p-2" value={mapping.reporting_category} onChange={(event) => updateStandard(questionLabel, { reporting_category: event.target.value })}>
                        {Array.from(new Set([...reportingCategories, mapping.reporting_category].filter(Boolean))).map((category) => <option key={category} value={category}>{category}</option>)}
                      </select>
                    </td>
                    <td><input className="w-36 rounded-xl border border-[#d6cdbb] bg-white p-2" list="teks-codes" value={mapping.standard_code} onChange={(event) => updateStandardCode(questionLabel, event.target.value)} placeholder="A.11A" /></td>
                    <td>
                      <select className="min-w-56 rounded-xl border border-[#d6cdbb] bg-white p-2" value={mapping.breakout_id || ""} onChange={(event) => {
                        const breakout = algebraBreakouts.find((item) => item.breakout_id === event.target.value);
                        updateStandard(questionLabel, { breakout_id: event.target.value, ...(breakout ? { standard_code: breakout.teks_code, teacher_description: breakout.teacher_friendly_description } : {}) });
                      }}>
                        <option value="">No breakout</option>
                        {algebraBreakouts.filter((breakout) => !mapping.standard_code || breakout.teks_code === mapping.standard_code).map((breakout) => <option key={breakout.breakout_id} value={breakout.breakout_id}>{breakout.breakout_id}</option>)}
                      </select>
                    </td>
                    <td><input className="min-w-72 rounded-xl border border-[#d6cdbb] bg-white p-2" value={mapping.teacher_description} onChange={(event) => updateStandard(questionLabel, { teacher_description: event.target.value })} placeholder="Simplify square roots..." /></td>
                    <td><input className="min-w-40 rounded-xl border border-[#d6cdbb] bg-white p-2" value={mapping.skill_category} onChange={(event) => updateStandard(questionLabel, { skill_category: event.target.value })} placeholder="Radicals" /></td>
                    <td>
                      <select className="rounded-xl border border-[#d6cdbb] bg-white p-2" value={mapping.evidence_type} onChange={(event) => updateStandard(questionLabel, { evidence_type: event.target.value as QuestionStandardMap["evidence_type"] })}>
                        {evidenceTypeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    </td>
                    <td>
                      <select className="rounded-xl border border-[#d6cdbb] bg-white p-2" value={mapping.critical ? "yes" : "no"} onChange={(event) => updateStandard(questionLabel, { critical: event.target.value === "yes" })}>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </td>
                    <td><input className="w-24 rounded-xl border border-[#d6cdbb] bg-white p-2" type="number" min="0.1" step="0.1" value={mapping.custom_weight ?? 1} onChange={(event) => updateStandard(questionLabel, { custom_weight: Number(event.target.value) || 1 })} /></td>
                    <td>
                      {!mapping.standard_code.trim() ? <Badge tone="neutral">Unmapped</Badge> : null}
                      {mapping.standard_code.trim() && !mapping.teacher_description.trim() ? <Badge tone="yellow">Description missing</Badge> : null}
                      {mapping.standard_code.trim() && mapping.teacher_description.trim() ? <Badge tone="green">Mapped</Badge> : null}
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
            <datalist id="teks-codes">
              {algebraTeksLibrary.map((teks) => <option key={teks.teks_code} value={teks.teks_code}>{teks.student_friendly_skill}</option>)}
            </datalist>
          </Card>
        </>
      ) : null}
    </>
  );
}

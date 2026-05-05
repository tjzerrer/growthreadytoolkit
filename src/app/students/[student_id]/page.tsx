"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Badge, bandTone, Card, EmptyState, GrowthBadge, masteryColor, movementTone, PageHeader, StatCard, teksStatusTone, TrajectoryBadge, TrajectoryDisclaimer } from "@/components/ui";
import { loadNotes, saveNote } from "@/lib/storage";
import type { TeksStatus } from "@/lib/types";
import { useGrowthData } from "@/lib/useGrowthData";

const teksStatusOptions: TeksStatus[] = ["Not Enough Evidence", "Struggling", "Approaching", "Proficient", "Mastered"];

export default function StudentProfilePage() {
  const params = useParams<{ student_id: string }>();
  const studentId = params?.student_id ?? "";
  const { data, rawData, ready, saveData, settings } = useGrowthData();
  const [note, setNote] = useState("");

  useEffect(() => {
    setNote(loadNotes()[studentId] ?? "");
  }, [studentId]);

  if (ready && !data) return <EmptyState />;
  const student = data?.students.find((item) => item.student_id === studentId);

  function setTeacherOverride(teks: string, status: TeksStatus | "") {
    if (!rawData) return;
    const remaining = (rawData.teksOverrides ?? []).filter((override) => !(override.student_id === studentId && override.teks === teks));
    saveData({
      ...rawData,
      teksOverrides: status ? [...remaining, { student_id: studentId, teks, status }] : remaining,
    });
  }

  return (
    <>
      <PageHeader title={student ? `${student.first_name} ${student.last_name}` : "Student Profile"} eyebrow="Individual student">
        Diagnostic profile, flags, teacher notes, reflection data, and a parent-friendly deterministic summary.
      </PageHeader>
      <TrajectoryDisclaimer />
      {student ? (
        <>
          <section className="mb-6 grid gap-4 md:grid-cols-4">
            <StatCard label="Class period" value={student.class_period} />
            <StatCard label="Diagnostic" value={`${student.totalScore}/${student.totalPossible}`} detail={`${student.percentage}%`} />
            <StatCard label="Algebra readiness index" value={`${student.algebraReadinessIndex}%`} />
            <StatCard label="A-F equivalent" value={student.letterGrade} />
            <StatCard label="Readiness" value={<Badge tone={student.incomplete ? "neutral" : bandTone(student.readinessBand)}>{student.incomplete ? "No Data / Not Started" : student.readinessBand}</Badge>} />
            <StatCard label="STAAR trajectory" value={<TrajectoryBadge trajectory={student.staarTrajectory} settings={settings} />} />
            <StatCard label="Prior STAAR" value={student.priorStaar?.prior_performance_level || "Not uploaded"} detail={student.priorStaar?.prior_staar_year} />
            <StatCard label="Growth indicator" value={<GrowthBadge indicator={student.growthIndicator} />} />
          </section>

          <section className="mb-6 grid gap-4 lg:grid-cols-2">
            <Card>
              <h2 className="mb-3 text-xl font-black text-[#174a36]">Instructional profile</h2>
              <p><strong>Strongest zone:</strong> {student.strongestZone}</p>
              <p><strong>Weakest zone:</strong> {student.weakestZone}</p>
              <p><strong>Strongest TEKS:</strong> {student.strongestTeks}</p>
              <p><strong>Weakest TEKS:</strong> {student.weakestTeks}</p>
              <p><strong>Strongest reporting category:</strong> {student.strongestReportingCategory}</p>
              <p><strong>Weakest reporting category:</strong> {student.weakestReportingCategory}</p>
              <p><strong>Highest-priority TEKS:</strong> {student.highestPriorityTeks}</p>
              <p><strong>Highest-priority breakout:</strong> {student.highestPriorityBreakout}</p>
              <p><strong>Next recommended skill:</strong> {student.nextRecommendedSkill}</p>
              {student.email ? <p><strong>Email:</strong> {student.email}</p> : null}
              <p><strong>Attempted questions:</strong> {student.attemptedQuestionCount}</p>
              <p><strong>Missed critical questions:</strong> {student.missedCriticalQuestions.join(", ") || "None"}</p>
              <p><strong>Intervention flags:</strong> {student.interventionFlags.join(", ") || "None"}</p>
              <p><strong>Enrichment:</strong> {student.enrichment ? "Yes" : "No"}</p>
              <p className="mt-3 rounded-2xl bg-[#dbe8d2] p-3 font-semibold text-[#174a36]">{student.recommendedNextMove}</p>
            </Card>
            <Card>
              <h2 className="mb-3 text-xl font-black text-[#174a36]">Parent-friendly summary</h2>
              <p className="text-[#4d5b52]">{student.parentSummary}</p>
            </Card>
          </section>

          <Card className="mb-6 table-wrap">
            <h2 className="mb-4 text-xl font-black text-[#174a36]">Reporting category status</h2>
            <table>
              <thead><tr><th>Category</th><th>Average</th><th>Priority</th><th>Suggested action</th></tr></thead>
              <tbody>
                {student.reportingCategoryStatus.map((row) => <tr key={row.category}><td className="font-black">{row.category}</td><td>{row.average}%</td><td>{row.priority}</td><td>{row.suggestedNextAction}</td></tr>)}
              </tbody>
            </table>
          </Card>

          <Card className="mb-6 table-wrap">
            <h2 className="mb-4 text-xl font-black text-[#174a36]">TEKS progress</h2>
            <table>
              <thead><tr><th>TEKS</th><th>Status</th><th>Movement</th><th>Evidence count</th><th>Recent average</th><th>Teacher override</th><th>Next recommended skill</th></tr></thead>
              <tbody>
                {student.teksProgress.map((row) => (
                  <tr key={row.teks}>
                    <td className="font-black">{row.teks}<br /><span className="text-xs font-normal text-[#647067]">{row.teacherDescription || row.skill}</span></td>
                    <td><Badge tone={teksStatusTone(row.status)}>{row.status}</Badge></td>
                    <td><Badge tone={movementTone(row.movement)}>{row.movement}</Badge></td>
                    <td>{row.evidenceCount}</td>
                    <td>{row.recentAverage}%</td>
                    <td>
                      <select className="rounded-xl border border-[#d6cdbb] bg-white p-2" value={row.teacherOverride ?? ""} onChange={(event) => setTeacherOverride(row.teks, event.target.value as TeksStatus | "")}>
                        <option value="">Use rule</option>
                        {teksStatusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                    </td>
                    <td>{row.recommendedNextSkill}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card className="mb-6 table-wrap">
            <h2 className="mb-4 text-xl font-black text-[#174a36]">Breakout progress</h2>
            <table>
              <thead><tr><th>Breakout</th><th>TEKS</th><th>Status</th><th>Evidence</th><th>Average</th></tr></thead>
              <tbody>
                {student.breakoutProgress.map((row) => <tr key={row.breakoutId}><td className="font-black">{row.breakoutId}<br /><span className="text-xs font-normal text-[#647067]">{row.teacherDescription}</span></td><td>{row.teks}</td><td><Badge tone={teksStatusTone(row.status)}>{row.status}</Badge></td><td>{row.evidenceCount}</td><td>{row.average}%</td></tr>)}
              </tbody>
            </table>
          </Card>

          <Card className="mb-6 table-wrap">
            <h2 className="mb-4 text-xl font-black text-[#174a36]">Skill mastery</h2>
            <table>
              <thead><tr><th>Skill</th><th>Zone</th><th>TEKS</th><th>% Correct</th><th>Priority</th></tr></thead>
              <tbody>
                {student.skillMastery.map((skill) => <tr key={skill.skill}><td>{skill.skill}</td><td>{skill.zone}</td><td>{skill.teks}</td><td><span className={`rounded-full px-3 py-1 font-black ${masteryColor(skill.percentCorrect)}`}>{skill.percentCorrect}%</span></td><td>{skill.priority}</td></tr>)}
              </tbody>
            </table>
          </Card>

          <Card className="mb-6 table-wrap">
            <h2 className="mb-4 text-xl font-black text-[#174a36]">STAAR trajectory evidence</h2>
            <table>
              <thead><tr><th>Evidence</th><th>Value</th><th>Note</th></tr></thead>
              <tbody>
                {student.evidenceTable.map((row) => <tr key={row.evidence}><td>{row.evidence}</td><td>{row.value}</td><td>{row.note}</td></tr>)}
              </tbody>
            </table>
          </Card>

          <section className="grid gap-4 lg:grid-cols-2">
            <Card>
              <h2 className="mb-3 text-xl font-black text-[#174a36]">Reflection data</h2>
              {student.reflection ? (
                <div className="space-y-2 text-[#4d5b52]">
                  <p><strong>Confidence:</strong> {student.reflection.confidence_rating || "Not provided"}</p>
                  <p><strong>Goal:</strong> {student.reflection.goal || "Not provided"}</p>
                  <p><strong>Concern:</strong> {student.reflection.concern || "Not provided"}</p>
                  <p><strong>Preferred support:</strong> {student.reflection.preferred_support || "Not provided"}</p>
                </div>
              ) : <p>No reflection uploaded for this student.</p>}
            </Card>
            <Card>
              <h2 className="mb-3 text-xl font-black text-[#174a36]">Teacher notes</h2>
              <textarea className="min-h-36 w-full rounded-2xl border border-[#d6cdbb] bg-white p-3" value={note} onChange={(event) => setNote(event.target.value)} />
              <button className="mt-3 rounded-2xl bg-[#174a36] px-5 py-3 text-sm font-black text-white" onClick={() => saveNote(student.student_id, note)}>Save Note Locally</button>
            </Card>
          </section>
        </>
      ) : null}
    </>
  );
}

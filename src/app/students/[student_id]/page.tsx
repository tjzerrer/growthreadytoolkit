"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Badge, bandTone, Card, EmptyState, masteryColor, PageHeader, StatCard } from "@/components/ui";
import { loadNotes, saveNote } from "@/lib/storage";
import { useGrowthData } from "@/lib/useGrowthData";

export default function StudentProfilePage() {
  const params = useParams<{ student_id: string }>();
  const studentId = params?.student_id ?? "";
  const { data, ready } = useGrowthData();
  const [note, setNote] = useState("");

  useEffect(() => {
    setNote(loadNotes()[studentId] ?? "");
  }, [studentId]);

  if (ready && !data) return <EmptyState />;
  const student = data?.students.find((item) => item.student_id === studentId);

  return (
    <>
      <PageHeader title={student ? `${student.first_name} ${student.last_name}` : "Student Profile"} eyebrow="Individual student">
        Diagnostic profile, flags, teacher notes, reflection data, and a parent-friendly deterministic summary.
      </PageHeader>
      {student ? (
        <>
          <section className="mb-6 grid gap-4 md:grid-cols-4">
            <StatCard label="Class period" value={student.class_period} />
            <StatCard label="Diagnostic" value={`${student.totalScore}/${student.totalPossible}`} detail={`${student.percentage}%`} />
            <StatCard label="A-F equivalent" value={student.letterGrade} />
            <StatCard label="Readiness" value={<Badge tone={bandTone(student.readinessBand)}>{student.readinessBand}</Badge>} />
          </section>

          <section className="mb-6 grid gap-4 lg:grid-cols-2">
            <Card>
              <h2 className="mb-3 text-xl font-black text-[#174a36]">Instructional profile</h2>
              <p><strong>Strongest zone:</strong> {student.strongestZone}</p>
              <p><strong>Weakest zone:</strong> {student.weakestZone}</p>
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
            <h2 className="mb-4 text-xl font-black text-[#174a36]">Skill mastery</h2>
            <table>
              <thead><tr><th>Skill</th><th>Zone</th><th>TEKS</th><th>% Correct</th><th>Priority</th></tr></thead>
              <tbody>
                {student.skillMastery.map((skill) => <tr key={skill.skill}><td>{skill.skill}</td><td>{skill.zone}</td><td>{skill.teks}</td><td><span className={`rounded-full px-3 py-1 font-black ${masteryColor(skill.percentCorrect)}`}>{skill.percentCorrect}%</span></td><td>{skill.priority}</td></tr>)}
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

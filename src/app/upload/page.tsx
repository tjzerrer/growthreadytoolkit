"use client";

import { useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { Button, Card, PageHeader } from "@/components/ui";
import { parseCsvMatrixFile, parseMyOpenMathDetailedRows } from "@/lib/csv";
import type { MyOpenMathParseResult } from "@/lib/types";

type AssignmentType = "Diagnostic" | "Practice" | "Quiz" | "Test" | "Review" | "Other";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [assignmentName, setAssignmentName] = useState("");
  const [assignmentType, setAssignmentType] = useState<AssignmentType>("Diagnostic");
  const [dateAdministered, setDateAdministered] = useState(new Date().toISOString().slice(0, 10));
  const [preview, setPreview] = useState<MyOpenMathParseResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  async function parsePreview() {
    setErrors([]);
    setStatus("");
    if (!file) {
      setErrors(["Choose a MyOpenMath detailed CSV export first."]);
      return;
    }
    const matrix = await parseCsvMatrixFile(file);
    const parsed = parseMyOpenMathDetailedRows(matrix.rows);
    setPreview(parsed);
    setErrors([...matrix.errors, ...parsed.errors]);
    if (!assignmentName) setAssignmentName(file.name.replace(/\.csv$/i, ""));
  }

  return (
    <>
      <PageHeader title="Upload MyOpenMath CSV" eyebrow="Evidence import">
        Upload the detailed MyOpenMath CSV. GrowthReady parses it locally, previews it, then stores dated question evidence under your teacher account.
      </PageHeader>
      <AuthGate>
        {(db) => {
          async function confirmImport() {
            if (!preview || !db.teacher || !db.supabase) return;
            setSaving(true);
            setErrors([]);
            setStatus("Creating assignment...");
            const totalPoints = preview.detectedQuestions.reduce((sum, question) => sum + question.points_possible, 0);
            try {
            const assignment = await db.supabase.from("assignments").insert({
              teacher_id: db.teacher.id,
              assignment_name: assignmentName || "MyOpenMath Assignment",
              source: "MyOpenMath",
              assignment_type: assignmentType,
              date_administered: dateAdministered,
              total_points: totalPoints,
              raw_file_name: file?.name ?? null,
            }).select("*").single();
            if (assignment.error) {
              setErrors([assignment.error.message]);
              setSaving(false);
              setStatus("");
              return;
            }

            setStatus("Creating classes...");
            const classBySection = new Map<string, string>();
            for (const section of Array.from(new Set(preview.diagnostics.map((row) => row.class_period || "Unassigned")))) {
              const existing = db.snapshot.classes.find((item) => item.period_label === section);
              if (existing) {
                classBySection.set(section, existing.id);
              } else {
                const inserted = await db.supabase.from("classes").insert({
                  teacher_id: db.teacher.id,
                  class_name: section === "Unassigned" ? "Unassigned" : `Period ${section}`,
                  period_label: section,
                  term: null,
                  school_year: db.teacher.school_year,
                }).select("*").single();
                if (inserted.error) throw inserted.error;
                if (inserted.data) classBySection.set(section, inserted.data.id);
              }
            }

            setStatus("Creating students...");
            const studentIdByImportId = new Map<string, string>();
            for (const row of preview.diagnostics) {
              const classId = classBySection.get(row.class_period || "Unassigned") ?? null;
              const displayName = row.student_name || `${row.first_name} ${row.last_name}`;
              const existing = db.snapshot.students.find((student) => student.display_name === displayName && student.class_id === classId);
              if (existing) {
                studentIdByImportId.set(row.student_id, existing.id);
              } else {
                const inserted = await db.supabase.from("students").insert({
                  teacher_id: db.teacher.id,
                  class_id: classId,
                  local_student_id: row.email || row.student_id,
                  display_name: displayName,
                  first_name: row.first_name,
                  last_name: row.last_name,
                  email: row.email || null,
                  active: true,
                }).select("*").single();
                if (inserted.error) throw inserted.error;
                if (inserted.data) studentIdByImportId.set(row.student_id, inserted.data.id);
              }
            }

            setStatus("Creating questions...");
            const questionRows = await db.supabase.from("questions").insert(preview.detectedQuestions.map((question) => ({
              teacher_id: db.teacher?.id,
              assignment_id: assignment.data.id,
              mom_question_label: question.question_label,
              mom_question_id: question.myopenmath_question_id,
              points_possible: question.points_possible,
            }))).select("*");
            if (questionRows.error) {
              setErrors([questionRows.error.message]);
              setSaving(false);
              setStatus("");
              return;
            }
            const questionIdByLabel = new Map((questionRows.data ?? []).map((question) => [question.mom_question_label, question.id]));
            setStatus("Saving evidence rows...");
            const evidenceRows = preview.diagnostics.flatMap((student) => preview.detectedQuestions.map((question) => {
              const score = Number(student.answers[question.question_id] ?? 0);
              const possible = Number(student.possiblePoints?.[question.question_id] ?? question.points_possible);
              return {
                teacher_id: db.teacher?.id,
                student_id: studentIdByImportId.get(student.student_id),
                class_id: classBySection.get(student.class_period || "Unassigned"),
                assignment_id: assignment.data.id,
                question_id: questionIdByLabel.get(question.question_label),
                teks_code: null,
                score,
                points_possible: possible,
                percent: possible ? Math.round((score / possible) * 1000) / 10 : 0,
                date_administered: dateAdministered,
              };
            }).filter((row) => row.student_id && row.question_id));
            if (!evidenceRows.length) throw new Error("No evidence rows could be created from the preview.");
            const evidence = await db.supabase.from("evidence").insert(evidenceRows);
            if (evidence.error) throw evidence.error;
            setStatus(`Import complete: ${preview.diagnostics.length} students, ${preview.detectedQuestions.length} questions, ${evidenceRows.length} evidence rows saved.`);
            await db.refresh();
            } catch (error) {
              setErrors([error instanceof Error ? error.message : "Import failed."]);
              setStatus("");
            }
            setSaving(false);
          }

          return (
            <>
              <Card className="mb-6">
                <div className="grid gap-4 md:grid-cols-4">
                  <input className="rounded-2xl border border-[#d6cdbb] bg-white p-3" value={assignmentName} onChange={(event) => setAssignmentName(event.target.value)} placeholder="Assignment name" />
                  <select className="rounded-2xl border border-[#d6cdbb] bg-white p-3" value={assignmentType} onChange={(event) => setAssignmentType(event.target.value as AssignmentType)}>
                    {["Diagnostic", "Practice", "Quiz", "Test", "Review", "Other"].map((option) => <option key={option}>{option}</option>)}
                  </select>
                  <input className="rounded-2xl border border-[#d6cdbb] bg-white p-3" type="date" value={dateAdministered} onChange={(event) => setDateAdministered(event.target.value)} />
                  <input className="rounded-2xl border border-[#d6cdbb] bg-white p-3" type="file" accept=".csv,text/csv" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
                </div>
                <div className="mt-4 flex gap-3">
                  <Button onClick={parsePreview} variant="soft">Preview CSV</Button>
                  <Button onClick={confirmImport} disabled={saving || !preview}>{saving ? "Importing..." : "Confirm Import"}</Button>
                </div>
              </Card>
              {db.message ? <Card className="mb-6 border-yellow-200 bg-yellow-50 text-yellow-900">{db.message}</Card> : null}
              {status ? <Card className="mb-6 border-emerald-200 bg-emerald-50 text-emerald-950">{status}</Card> : null}
              {errors.length ? <Card className="mb-6 border-red-200 bg-red-50"><ul>{errors.map((error) => <li key={error}>{error}</li>)}</ul></Card> : null}
              {preview ? (
                <section className="grid gap-6">
                  <Card><strong>{preview.previewStudents.length}</strong> students, <strong>{preview.detectedQuestions.length}</strong> scored questions detected.</Card>
                  <Card className="table-wrap">
                    <h2 className="mb-4 text-xl font-black text-[#174a36]">Question preview</h2>
                    <table><thead><tr><th>Question</th><th>MOM ID</th><th>Points</th></tr></thead><tbody>{preview.detectedQuestions.map((question) => <tr key={question.question_label}><td>{question.question_label}</td><td>{question.myopenmath_question_id}</td><td>{question.points_possible}</td></tr>)}</tbody></table>
                  </Card>
                </section>
              ) : null}
            </>
          );
        }}
      </AuthGate>
    </>
  );
}

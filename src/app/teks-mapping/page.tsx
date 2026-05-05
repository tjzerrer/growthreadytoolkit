"use client";

import { useRef, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { Button, Card, PageHeader } from "@/components/ui";
import { downloadCsv, parseCsvFile } from "@/lib/csv";
import { parsePipeTag } from "@/lib/dbMastery";

export default function TeksMappingPage() {
  const [assignmentId, setAssignmentId] = useState("all");
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <PageHeader title="TEKS Mapping" eyebrow="Question tagging">
        Enter pipe-separated tags like A.5A | Solve equations with variables on both sides | Readiness | Critical | Multi-Step.
      </PageHeader>
      <AuthGate>
        {(db) => {
          const questions = db.snapshot.questions.filter((question) => assignmentId === "all" || question.assignment_id === assignmentId);
          const tagByQuestion = new Map(db.snapshot.questionTags.map((tag) => [tag.question_id, tag]));

          async function saveTag(questionId: string, rawTag: string) {
            if (!db.teacher || !db.supabase) return;
            const parsed = parsePipeTag(rawTag);
            const question = db.snapshot.questions.find((item) => item.id === questionId);
            const payload = {
              teacher_id: db.teacher.id,
              question_id: questionId,
              raw_tag: rawTag,
              teks_code: parsed.teksCode || null,
              skill_description: parsed.skillDescription || null,
              standard_type: parsed.standardType || null,
              priority: parsed.priority || null,
              complexity: parsed.complexity || null,
              reporting_category_id: null,
              reporting_category_name: null,
            };
            await db.supabase.from("question_tags").upsert(payload, { onConflict: "question_id" });
            if (question) {
              await db.supabase.from("evidence").update({ teks_code: parsed.teksCode || null }).eq("question_id", question.id).eq("teacher_id", db.teacher.id);
            }
            await db.refresh();
          }

          function exportMap() {
            downloadCsv("growthready-question-map.csv", questions.map((question) => {
              const tag = tagByQuestion.get(question.id);
              return {
                assignment: db.snapshot.assignments.find((assignment) => assignment.id === question.assignment_id)?.name,
                mom_question_label: question.mom_question_label,
                mom_question_id: question.mom_question_id || "",
                points_possible: question.points_possible,
                raw_tag: tag?.raw_tag || "",
                teks_code: tag?.teks_code || "",
                skill_description: tag?.skill_description || "",
                standard_type: tag?.standard_type || "",
                priority: tag?.priority || "",
                complexity: tag?.complexity || "",
              };
            }));
          }

          async function importMap(file: File | undefined) {
            if (!file || !db.teacher || !db.supabase) return;
            const parsed = await parseCsvFile(file);
            for (const row of parsed.rows) {
              const question = db.snapshot.questions.find((item) => item.mom_question_label === row.mom_question_label || item.mom_question_id === row.mom_question_id);
              if (question) await saveTag(question.id, row.raw_tag || [row.teks_code, row.skill_description, row.standard_type, row.priority, row.complexity].filter(Boolean).join(" | "));
            }
          }

          return (
            <>
              <div className="mb-4 flex flex-wrap gap-3">
                <select className="rounded-2xl border border-[#d6cdbb] bg-white p-3" value={assignmentId} onChange={(event) => setAssignmentId(event.target.value)}>
                  <option value="all">All assignments</option>
                  {db.snapshot.assignments.map((assignment) => <option key={assignment.id} value={assignment.id}>{assignment.name}</option>)}
                </select>
                <Button onClick={exportMap} variant="soft">Export Question Map CSV</Button>
                <Button onClick={() => fileRef.current?.click()} variant="soft">Import Question Map CSV</Button>
                <input ref={fileRef} className="hidden" type="file" accept=".csv,text/csv" onChange={(event) => importMap(event.target.files?.[0])} />
              </div>
              <Card className="table-wrap">
                <table>
                  <thead><tr><th>Assignment</th><th>Question</th><th>MOM ID</th><th>Points</th><th>Pipe tag</th><th>Parsed</th></tr></thead>
                  <tbody>
                    {questions.map((question) => {
                      const tag = tagByQuestion.get(question.id);
                      const parsed = parsePipeTag(tag?.raw_tag || "");
                      return (
                        <tr key={question.id}>
                          <td>{db.snapshot.assignments.find((assignment) => assignment.id === question.assignment_id)?.name}</td>
                          <td className="font-black">{question.mom_question_label}</td>
                          <td>{question.mom_question_id}</td>
                          <td>{question.points_possible}</td>
                          <td><input className="min-w-96 rounded-xl border border-[#d6cdbb] bg-white p-2" defaultValue={tag?.raw_tag || ""} onBlur={(event) => saveTag(question.id, event.target.value)} /></td>
                          <td>{parsed.teksCode || "Unmapped"} | {parsed.skillDescription}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Card>
            </>
          );
        }}
      </AuthGate>
    </>
  );
}

"use client";

import { useRef, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { Button, Card, PageHeader } from "@/components/ui";
import { downloadCsv, parseCsvFile } from "@/lib/csv";
import { buildPipeTag, parsedTagFromRow, parsePipeTag, problemIdFromRow } from "@/lib/parsePipeTag";

export default function TeksMappingPage() {
  const [assignmentId, setAssignmentId] = useState("all");
  const [message, setMessage] = useState("");
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
          const mappingByProblemId = new Map(db.snapshot.problemMappings.map((mapping) => [mapping.mom_question_id, mapping]));

          async function saveTag(questionId: string, rawTag: string) {
            if (!db.teacher || !db.supabase) return;
            const parsed = parsePipeTag(rawTag);
            const question = db.snapshot.questions.find((item) => item.id === questionId);
            const payload = {
              teacher_id: db.teacher.id,
              question_id: questionId,
              raw_tag: rawTag,
              teks_code: parsed.teks_code || null,
              skill_description: parsed.skill_description || null,
              standard_type: parsed.standard_type || null,
              priority: parsed.priority || null,
              complexity: parsed.complexity || null,
              reporting_category_id: null,
              reporting_category_name: null,
            };
            await db.supabase.from("question_tags").upsert(payload, { onConflict: "question_id" });
            if (question?.mom_question_id) {
              await db.supabase.from("problem_mappings").upsert({
                teacher_id: db.teacher.id,
                mom_question_id: question.mom_question_id,
                raw_tag: rawTag,
                teks_code: parsed.teks_code || null,
                skill_description: parsed.skill_description || null,
                standard_type: parsed.standard_type || null,
                priority: parsed.priority || null,
                complexity: parsed.complexity || null,
                reporting_category_id: null,
                reporting_category_name: null,
              }, { onConflict: "teacher_id,mom_question_id" });
            }
            if (question) {
              await db.supabase.from("evidence").update({ teks_code: parsed.teks_code || null }).eq("question_id", question.id).eq("teacher_id", db.teacher.id);
            }
            await db.refresh();
          }

          function exportMap() {
            downloadCsv("growthready-question-map.csv", questions.map((question) => {
              const tag = tagByQuestion.get(question.id);
              return {
                assignment: db.snapshot.assignments.find((assignment) => assignment.id === question.assignment_id)?.assignment_name,
                mom_question_label: question.mom_question_label,
                mom_question_id: question.mom_question_id || "",
                points_possible: question.points_possible ?? 0,
                raw_tag: tag?.raw_tag || "",
                teks_code: tag?.teks_code || "",
                skill_description: tag?.skill_description || "",
                standard_type: tag?.standard_type || "",
                priority: tag?.priority || "",
                complexity: tag?.complexity || "",
              };
            }));
          }

          function exportProblemBank() {
            downloadCsv("growthready-problem-bank.csv", db.snapshot.problemMappings.map((mapping) => ({
              problem_id: mapping.mom_question_id,
              teks_code: mapping.teks_code || "",
              skill_description: mapping.skill_description || "",
              standard_type: mapping.standard_type || "",
              priority: mapping.priority || "",
              complexity: mapping.complexity || "",
              raw_tag: mapping.raw_tag || "",
            })));
          }

          async function importMap(file: File | undefined) {
            if (!file || !db.teacher || !db.supabase) return;
            setMessage("Importing problem map...");
            const parsed = await parseCsvFile(file);
            let savedMappings = 0;
            let appliedQuestions = 0;
            for (const row of parsed.rows) {
              const problemId = problemIdFromRow(row);
              const tag = parsedTagFromRow(row);
              const rawTag = row.raw_tag || row.pipe_tag || row.tag || buildPipeTag(tag);
              if (!problemId || !tag.teks_code) continue;

              const mappingPayload = {
                teacher_id: db.teacher.id,
                mom_question_id: problemId,
                raw_tag: rawTag,
                teks_code: tag.teks_code || null,
                skill_description: tag.skill_description || null,
                standard_type: tag.standard_type || null,
                priority: tag.priority || null,
                complexity: tag.complexity || null,
                reporting_category_id: null,
                reporting_category_name: null,
              };
              const mapping = await db.supabase.from("problem_mappings").upsert(mappingPayload, { onConflict: "teacher_id,mom_question_id" });
              if (!mapping.error) savedMappings += 1;

              const matchingQuestions = db.snapshot.questions.filter((item) => item.mom_question_id === problemId || item.mom_question_label === row.mom_question_label);
              for (const question of matchingQuestions) {
                const questionPayload = {
                  teacher_id: db.teacher.id,
                  question_id: question.id,
                  raw_tag: rawTag,
                  teks_code: tag.teks_code || null,
                  skill_description: tag.skill_description || null,
                  standard_type: tag.standard_type || null,
                  priority: tag.priority || null,
                  complexity: tag.complexity || null,
                  reporting_category_id: null,
                  reporting_category_name: null,
                };
                const result = await db.supabase.from("question_tags").upsert(questionPayload, { onConflict: "question_id" });
                if (!result.error) {
                  await db.supabase.from("evidence").update({ teks_code: tag.teks_code || null }).eq("question_id", question.id).eq("teacher_id", db.teacher.id);
                  appliedQuestions += 1;
                }
              }
            }
            await db.refresh();
            setMessage(`Problem map imported: ${savedMappings} problem mappings saved, ${appliedQuestions} existing questions updated.`);
          }

          return (
            <>
              <div className="mb-4 flex flex-wrap gap-3">
                <select className="rounded-2xl border border-[#d6cdbb] bg-white p-3" value={assignmentId} onChange={(event) => setAssignmentId(event.target.value)}>
                  <option value="all">All assignments</option>
                  {db.snapshot.assignments.map((assignment) => <option key={assignment.id} value={assignment.id}>{assignment.assignment_name}</option>)}
                </select>
                <Button onClick={exportMap} variant="soft">Export Question Map CSV</Button>
                <Button onClick={exportProblemBank} variant="soft">Export Problem Bank CSV</Button>
                <Button onClick={() => fileRef.current?.click()} variant="soft">Import Question Map CSV</Button>
                <input ref={fileRef} className="hidden" type="file" accept=".csv,text/csv" onChange={(event) => importMap(event.target.files?.[0])} />
              </div>
              {message ? <Card className="mb-4 border-emerald-200 bg-emerald-50 text-emerald-950">{message}</Card> : null}
              <Card className="mb-4 border-sky-200 bg-sky-50 text-sky-950">
                Problem-bank CSV headers can be: <strong>problem_id</strong>, <strong>teks_code</strong>, <strong>skill_description</strong>, <strong>standard_type</strong>, <strong>priority</strong>, <strong>complexity</strong>. The MyOpenMath problem ID is matched against the imported MOM ID.
              </Card>
              <Card className="table-wrap">
                <table>
                  <thead><tr><th>Assignment</th><th>Question</th><th>MOM ID</th><th>Points</th><th>Pipe tag</th><th>Parsed</th></tr></thead>
                  <tbody>
                    {questions.map((question) => {
                      const tag = tagByQuestion.get(question.id) || (question.mom_question_id ? mappingByProblemId.get(question.mom_question_id) : undefined);
                      const parsed = parsePipeTag(tag?.raw_tag || "");
                      return (
                        <tr key={question.id}>
                          <td>{db.snapshot.assignments.find((assignment) => assignment.id === question.assignment_id)?.assignment_name}</td>
                          <td className="font-black">{question.mom_question_label}</td>
                          <td>{question.mom_question_id}</td>
                          <td>{question.points_possible}</td>
                          <td><input className="min-w-96 rounded-xl border border-[#d6cdbb] bg-white p-2" defaultValue={tag?.raw_tag || ""} onBlur={(event) => saveTag(question.id, event.target.value)} /></td>
                          <td>{parsed.teks_code || "Unmapped"} | {parsed.skill_description}</td>
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

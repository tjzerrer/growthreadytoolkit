"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, PageHeader } from "@/components/ui";
import {
  createUnmappedQuestionMap,
  mergeQuestionMapWithDetected,
  normalizeDiagnostic,
  normalizeQuestionMap,
  normalizeReflections,
  normalizeRoster,
  parseCsvFile,
  parseCsvMatrixFile,
  parseMyOpenMathDetailedRows,
} from "@/lib/csv";
import { createDemoData } from "@/lib/demoData";
import { useGrowthData } from "@/lib/useGrowthData";
import type { MyOpenMathParseResult, QuestionMapItem, RawAppData } from "@/lib/types";

type FileKey = "roster" | "diagnostic" | "questionMap" | "reflections";
type UploadType = "myopenmath" | "simple";

const samples = {
  roster: "student_id, first_name, last_name, class_period",
  diagnostic: "student_id, first_name, last_name, class_period, Q1, Q2, ... Q20",
  questionMap: "question_id, skill, teks, zone, critical",
  reflections: "student_id, confidence_rating, goal, concern, preferred_support",
};

export default function UploadPage() {
  const router = useRouter();
  const { saveData } = useGrowthData();
  const [files, setFiles] = useState<Partial<Record<FileKey, File>>>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState("");
  const [uploadType, setUploadType] = useState<UploadType>("myopenmath");
  const [preview, setPreview] = useState<MyOpenMathParseResult | null>(null);
  const [previewMap, setPreviewMap] = useState<QuestionMapItem[]>([]);

  async function parseMyOpenMathPreview() {
    setErrors([]);
    setSuccess("");
    if (!files.diagnostic) {
      setErrors(["MyOpenMath detailed export CSV is required."]);
      return null;
    }
    const matrix = await parseCsvMatrixFile(files.diagnostic);
    const parsed = parseMyOpenMathDetailedRows(matrix.rows);
    const mapRows = files.questionMap ? await parseCsvFile(files.questionMap) : { rows: [], errors: [] };
    const normalizedMap = files.questionMap ? normalizeQuestionMap(mapRows.rows) : { data: [], errors: [] };
    const questionMap = normalizedMap.data.length
      ? mergeQuestionMapWithDetected(normalizedMap.data, parsed.detectedQuestions)
      : createUnmappedQuestionMap(parsed.detectedQuestions);
    setPreview(parsed);
    setPreviewMap(questionMap);
    const allErrors = [...matrix.errors, ...parsed.errors, ...mapRows.errors, ...normalizedMap.errors];
    if (allErrors.length) {
      setErrors(allErrors);
      return null;
    }
    return { parsed, questionMap };
  }

  async function generate() {
    setErrors([]);
    setSuccess("");
    setPreview(null);
    if (!files.diagnostic || (uploadType === "simple" && !files.roster)) {
      setErrors([uploadType === "simple" ? "Roster and diagnostic CSV files are required for Simple Diagnostic CSV." : "MyOpenMath detailed export CSV is required."]);
      return;
    }

    if (uploadType === "myopenmath") {
      const previewResult = await parseMyOpenMathPreview();
      if (!previewResult) return;
      const { parsed, questionMap } = previewResult;
      saveData({
        roster: parsed.diagnostics.map(({ student_id, first_name, last_name, class_period }) => ({ student_id, first_name, last_name, class_period })),
        diagnostics: parsed.diagnostics,
        questionMap,
        reflections: [],
      });
      setSuccess("MyOpenMath export parsed, previewed, and stored locally in this browser.");
      router.push("/");
      return;
    }

    const [rosterCsv, diagnosticCsv, mapCsv, reflectionCsv] = await Promise.all([
      parseCsvFile(files.roster as File),
      parseCsvFile(files.diagnostic),
      files.questionMap ? parseCsvFile(files.questionMap) : Promise.resolve({ rows: [], errors: [] }),
      files.reflections ? parseCsvFile(files.reflections) : Promise.resolve({ rows: [], errors: [] }),
    ]);

    const roster = normalizeRoster(rosterCsv.rows);
    const diagnostics = normalizeDiagnostic(diagnosticCsv.rows);
    const questionMap = files.questionMap ? normalizeQuestionMap(mapCsv.rows) : { data: createUnmappedQuestionMap(Object.keys(diagnostics.data[0]?.answers ?? {}).map((question_label) => ({ question_label }))), errors: [] };
    const allErrors = [...rosterCsv.errors, ...diagnosticCsv.errors, ...mapCsv.errors, ...reflectionCsv.errors, ...roster.errors, ...diagnostics.errors, ...questionMap.errors];
    if (allErrors.length) {
      setErrors(allErrors);
      return;
    }

    const data: RawAppData = {
      roster: roster.data,
      diagnostics: diagnostics.data,
      questionMap: questionMap.data,
      reflections: normalizeReflections(reflectionCsv.rows),
    };
    saveData(data);
    setSuccess("Insights generated and stored locally in this browser.");
    router.push("/");
  }

  function loadDemo() {
    saveData(createDemoData());
    router.push("/");
  }

  const cards: { key: FileKey; title: string; optional?: boolean }[] = [
    { key: "roster", title: "Student roster CSV", optional: uploadType === "myopenmath" },
    { key: "diagnostic", title: uploadType === "myopenmath" ? "MyOpenMath detailed assignment export CSV" : "Simple diagnostic CSV" },
    { key: "questionMap", title: "Question map CSV", optional: true },
    { key: "reflections", title: "Student reflection CSV", optional: true },
  ];

  return (
    <>
      <PageHeader title="Upload Data" eyebrow="CSV wizard">
        Upload exported CSVs manually. No student data leaves this browser, and Version 1 does not log in to or scrape MyOpenMath.
      </PageHeader>

      <div className="mb-6 flex flex-wrap gap-3">
        <select className="rounded-2xl border border-[#d6cdbb] bg-white p-3 font-bold text-[#174a36]" value={uploadType} onChange={(event) => setUploadType(event.target.value as UploadType)}>
          <option value="myopenmath">MyOpenMath Detailed Assignment Export</option>
          <option value="simple">Simple Diagnostic CSV</option>
        </select>
        {uploadType === "myopenmath" ? <Button onClick={async () => { await parseMyOpenMathPreview(); }} variant="soft">Parse Preview</Button> : null}
        <Button onClick={generate}>Generate Insights</Button>
        <Button onClick={loadDemo} variant="soft">Load Demo Data</Button>
      </div>

      {errors.length ? (
        <Card className="mb-6 border-red-200 bg-red-50">
          <p className="font-black text-red-900">Please fix these upload issues:</p>
          <ul className="mt-2 list-disc pl-6 text-red-800">
            {errors.map((error) => <li key={error}>{error}</li>)}
          </ul>
        </Card>
      ) : null}
      {success ? <Card className="mb-6 border-emerald-200 bg-emerald-50 text-emerald-900">{success}</Card> : null}

      <section className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <Card key={card.key}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-[#174a36]">{card.title}</h2>
                <p className="mt-2 text-sm text-[#647067]">{card.optional ? "Optional columns:" : "Expected columns:"} {samples[card.key]}</p>
                {card.key === "diagnostic" && uploadType === "myopenmath" ? <p className="mt-2 text-sm text-[#647067]">Uses row 1 question labels, row 2 Points columns, row 3 MyOpenMath IDs, and row 4+ student rows.</p> : null}
              </div>
              {card.optional ? <span className="rounded-full bg-[#d8ebf4] px-3 py-1 text-xs font-black text-[#19506a]">Optional</span> : null}
            </div>
            <input
              className="mt-5 w-full rounded-2xl border border-[#d6cdbb] bg-white p-3"
              type="file"
              accept=".csv,text/csv"
              onChange={(event) => setFiles((current) => ({ ...current, [card.key]: event.target.files?.[0] }))}
            />
          </Card>
        ))}
      </section>

      <Card className="mt-6">
        <h2 className="text-xl font-black text-[#174a36]">Question map sample</h2>
        <p className="mt-2 text-sm text-[#647067]">Simple format: question_id,skill,teks,zone,critical. MyOpenMath format: question_label,skill,teks,zone,critical. Example: Question 1-1,Integer Operations,Readiness,Number Sense,Yes.</p>
      </Card>

      {preview ? (
        <section className="mt-6 grid gap-6">
          <Card className="table-wrap">
            <h2 className="mb-4 text-xl font-black text-[#174a36]">Parsed student preview</h2>
            <table>
              <thead><tr><th>Student name</th><th>Section</th><th>Email</th><th>Attempted</th><th>Earned</th><th>Possible</th><th>Percent</th></tr></thead>
              <tbody>
                {preview.previewStudents.slice(0, 20).map((student, index) => <tr key={`${student.email}-${index}`}><td>{student.student_name}</td><td>{student.section}</td><td>{student.email}</td><td>{student.attemptedQuestionCount}</td><td>{student.totalPointsEarned}</td><td>{student.totalPointsPossible}</td><td>{student.percentScore}%</td></tr>)}
              </tbody>
            </table>
          </Card>
          <Card className="table-wrap">
            <h2 className="mb-4 text-xl font-black text-[#174a36]">Detected questions</h2>
            <table>
              <thead><tr><th>Question label</th><th>MyOpenMath ID</th><th>Points possible</th><th>Skill mapping status</th></tr></thead>
              <tbody>
                {preview.detectedQuestions.map((question) => {
                  const mapped = previewMap.find((item) => item.question_id === question.question_id);
                  return <tr key={question.question_id}><td>{question.question_label}</td><td>{question.myopenmath_question_id}</td><td>{question.points_possible}</td><td>{mapped && mapped.skill !== "Unmapped Questions" ? `Mapped: ${mapped.skill}` : "Unmapped Questions"}</td></tr>;
                })}
              </tbody>
            </table>
          </Card>
        </section>
      ) : null}
    </>
  );
}

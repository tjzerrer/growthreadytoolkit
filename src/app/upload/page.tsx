"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, PageHeader } from "@/components/ui";
import { normalizeDiagnostic, normalizeQuestionMap, normalizeReflections, normalizeRoster, parseCsvFile } from "@/lib/csv";
import { createDemoData } from "@/lib/demoData";
import { useGrowthData } from "@/lib/useGrowthData";
import type { RawAppData } from "@/lib/types";

type FileKey = "roster" | "diagnostic" | "questionMap" | "reflections";

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

  async function generate() {
    setErrors([]);
    setSuccess("");
    if (!files.roster || !files.diagnostic || !files.questionMap) {
      setErrors(["Roster, diagnostic, and question map CSV files are required."]);
      return;
    }

    const [rosterCsv, diagnosticCsv, mapCsv, reflectionCsv] = await Promise.all([
      parseCsvFile(files.roster),
      parseCsvFile(files.diagnostic),
      parseCsvFile(files.questionMap),
      files.reflections ? parseCsvFile(files.reflections) : Promise.resolve({ rows: [], errors: [] }),
    ]);

    const roster = normalizeRoster(rosterCsv.rows);
    const diagnostics = normalizeDiagnostic(diagnosticCsv.rows);
    const questionMap = normalizeQuestionMap(mapCsv.rows);
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
    { key: "roster", title: "Student roster CSV" },
    { key: "diagnostic", title: "MyOpenMath diagnostic CSV" },
    { key: "questionMap", title: "Question map CSV" },
    { key: "reflections", title: "Student reflection CSV", optional: true },
  ];

  return (
    <>
      <PageHeader title="Upload Data" eyebrow="CSV wizard">
        Upload exported CSVs manually. No student data leaves this browser, and Version 1 does not log in to or scrape MyOpenMath.
      </PageHeader>

      <div className="mb-6 flex flex-wrap gap-3">
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
        <p className="mt-2 text-sm text-[#647067]">Example: Q1,Integer Operations,Readiness,Number Sense,Yes. Use Q1 through Q20 for the standard diagnostic format.</p>
      </Card>
    </>
  );
}

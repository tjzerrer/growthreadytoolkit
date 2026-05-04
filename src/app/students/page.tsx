"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge, bandTone, Button, EmptyState, PageHeader } from "@/components/ui";
import { exportStudents } from "@/lib/exports";
import { useGrowthData } from "@/lib/useGrowthData";

export default function StudentsPage() {
  const { data, ready } = useGrowthData();
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState("all");
  if (ready && !data) return <EmptyState />;
  const periods = data ? Array.from(new Set(data.students.map((student) => student.class_period))) : [];
  const students = data?.students.filter((student) => {
    const text = `${student.first_name} ${student.last_name} ${student.student_id}`.toLowerCase();
    return text.includes(query.toLowerCase()) && (period === "all" || student.class_period === period);
  }) ?? [];

  return (
    <>
      <PageHeader title="Students" eyebrow="Student index">
        Search students and open individual profiles with deterministic next steps and parent-friendly summaries.
      </PageHeader>
      {data ? (
        <>
          <div className="mb-4 flex flex-wrap gap-3">
            <input className="rounded-2xl border border-[#d6cdbb] bg-white p-3" placeholder="Search name or ID" value={query} onChange={(event) => setQuery(event.target.value)} />
            <select className="rounded-2xl border border-[#d6cdbb] bg-white p-3" value={period} onChange={(event) => setPeriod(event.target.value)}>
              <option value="all">All class periods</option>
              {periods.map((item) => <option key={item} value={item}>Period {item}</option>)}
            </select>
            <Button onClick={() => exportStudents(data)} variant="soft">Export Student Profiles CSV</Button>
          </div>
          <div className="card table-wrap rounded-3xl">
            <table>
              <thead><tr><th>Name</th><th>Class</th><th>Score</th><th>Band</th><th>Strongest</th><th>Weakest</th><th>Flags</th><th>Enrichment</th></tr></thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.student_id}>
                    <td><Link className="font-black text-[#174a36] underline" href={`/students/${student.student_id}`}>{student.first_name} {student.last_name}</Link></td>
                    <td>{student.class_period}</td><td>{student.incomplete ? "No data" : `${student.totalScore}/${student.totalPossible}`}</td><td><Badge tone={student.incomplete ? "neutral" : bandTone(student.readinessBand)}>{student.incomplete ? "No Data / Not Started" : student.readinessBand}</Badge></td><td>{student.strongestSkill}</td><td>{student.weakestSkill}</td><td>{student.incomplete ? "No Data / Not Started" : student.interventionFlags.join(", ") || "None"}</td><td>{student.enrichment ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </>
  );
}

"use client";

import { useParams } from "next/navigation";
import { AuthGate } from "@/components/AuthGate";
import { Badge, Card, PageHeader, StatCard, teksStatusTone } from "@/components/ui";
import { assignmentAverage, buildStudentTeksHistory } from "@/lib/dbMastery";

export default function StudentPage() {
  const params = useParams<{ id: string }>();
  const studentId = params?.id ?? "";

  return (
    <AuthGate>
      {(db) => {
        const student = db.snapshot.students.find((item) => item.id === studentId);
        const history = buildStudentTeksHistory(db.snapshot, studentId);
        const evidence = db.snapshot.evidence.filter((row) => row.student_id === studentId);
        const average = evidence.length ? Math.round(evidence.reduce((sum, row) => sum + Number(row.percent ?? 0), 0) / evidence.length * 10) / 10 : 0;
        return (
          <>
            <PageHeader title={student?.display_name || "Student"} eyebrow="Student profile">
              Overall assignment history and standard-by-standard mastery history across the school year.
            </PageHeader>
            <section className="mb-6 grid gap-4 md:grid-cols-4">
              <StatCard label="All-time average" value={`${average}%`} />
              <StatCard label="Evidence rows" value={evidence.length} />
              <StatCard label="Weakest TEKS" value={history[0]?.teksCode || "No data"} />
              <StatCard label="Next move" value={history[0]?.recommendedNextMove || "Collect evidence"} />
            </section>
            <Card className="mb-6 table-wrap">
              <h2 className="mb-4 text-xl font-black text-[#174a36]">Assignment history</h2>
              <table><thead><tr><th>Assignment</th><th>Date</th><th>Average</th></tr></thead><tbody>{db.snapshot.assignments.map((assignment) => <tr key={assignment.id}><td>{assignment.assignment_name}</td><td>{assignment.date_administered}</td><td>{assignmentAverage(db.snapshot, assignment.id, studentId)}%</td></tr>)}</tbody></table>
            </Card>
            <Card className="table-wrap">
              <h2 className="mb-4 text-xl font-black text-[#174a36]">Standard mastery history</h2>
              <table><thead><tr><th>TEKS</th><th>Skill</th><th>Evidence</th><th>Recent avg</th><th>All-time avg</th><th>Status</th><th>Movement</th><th>Last evidence</th><th>Next move</th></tr></thead><tbody>{history.map((row) => <tr key={row.teksCode}><td className="font-black">{row.teksCode}</td><td>{row.skillDescription}</td><td>{row.evidenceCount}</td><td>{row.recentAverage}%</td><td>{row.allTimeAverage}%</td><td><Badge tone={teksStatusTone(row.status)}>{row.status}</Badge></td><td>{row.movement}</td><td>{row.lastEvidenceDate}</td><td>{row.recommendedNextMove}</td></tr>)}</tbody></table>
            </Card>
          </>
        );
      }}
    </AuthGate>
  );
}

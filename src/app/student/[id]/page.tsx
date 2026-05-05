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
        const mappedEvidence = evidence.filter((row) => row.teks_code);
        const unmappedEvidence = evidence.filter((row) => !row.teks_code);
        const average = evidence.length ? Math.round(evidence.reduce((sum, row) => sum + Number(row.percent ?? 0), 0) / evidence.length * 10) / 10 : 0;
        return (
          <>
            <PageHeader title={student?.display_name || "Student"} eyebrow="Student profile">
              Overall assignment history and standard-by-standard mastery history across the school year.
            </PageHeader>
            <section className="mb-6 grid gap-4 md:grid-cols-4">
              <StatCard label="All-time average" value={`${average}%`} />
              <StatCard label="Evidence rows" value={evidence.length} />
              <StatCard label="Mapped TEKS rows" value={mappedEvidence.length} />
              <StatCard label="Unmapped rows" value={unmappedEvidence.length} />
            </section>
            <Card className="mb-6 table-wrap">
              <h2 className="mb-4 text-xl font-black text-[#174a36]">Assignment history</h2>
              <table><thead><tr><th>Assignment</th><th>Date</th><th>Average</th></tr></thead><tbody>{db.snapshot.assignments.map((assignment) => <tr key={assignment.id}><td>{assignment.assignment_name}</td><td>{assignment.date_administered}</td><td>{assignmentAverage(db.snapshot, assignment.id, studentId)}%</td></tr>)}</tbody></table>
            </Card>
            <Card className="table-wrap">
              <h2 className="mb-4 text-xl font-black text-[#174a36]">Standard mastery history</h2>
              {history.length ? (
                <table><thead><tr><th>TEKS</th><th>Skill</th><th>Evidence</th><th>Recent avg</th><th>All-time avg</th><th>Status</th><th>Movement</th><th>Last evidence</th><th>Next move</th></tr></thead><tbody>{history.map((row) => <tr key={row.teksCode}><td className="font-black">{row.teksCode}</td><td>{row.skillDescription}</td><td>{row.evidenceCount}</td><td>{row.recentAverage}%</td><td>{row.allTimeAverage}%</td><td><Badge tone={teksStatusTone(row.status)}>{row.status}</Badge></td><td>{row.movement}</td><td>{row.lastEvidenceDate}</td><td>{row.recommendedNextMove}</td></tr>)}</tbody></table>
              ) : (
                <p className="text-[#4d5b52]">This student has evidence, but none of it is attached to TEKS yet. Tag the assignment questions on the TEKS Mapping page to generate standard mastery history.</p>
              )}
            </Card>
            {unmappedEvidence.length ? (
              <Card className="mt-6 table-wrap">
                <h2 className="mb-4 text-xl font-black text-[#174a36]">Unmapped question evidence</h2>
                <table>
                  <thead><tr><th>Assignment</th><th>Question</th><th>Score</th><th>Possible</th><th>Percent</th><th>Date</th></tr></thead>
                  <tbody>
                    {unmappedEvidence.map((row) => {
                      const assignment = db.snapshot.assignments.find((item) => item.id === row.assignment_id);
                      const question = db.snapshot.questions.find((item) => item.id === row.question_id);
                      return <tr key={row.id}><td>{assignment?.assignment_name || "Assignment"}</td><td>{question?.mom_question_label || "Question"}</td><td>{row.score ?? 0}</td><td>{row.points_possible ?? 0}</td><td>{row.percent ?? 0}%</td><td>{row.date_administered}</td></tr>;
                    })}
                  </tbody>
                </table>
              </Card>
            ) : null}
          </>
        );
      }}
    </AuthGate>
  );
}

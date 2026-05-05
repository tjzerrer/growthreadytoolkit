"use client";

import Link from "next/link";
import { AuthGate } from "@/components/AuthGate";
import { Card, PageHeader } from "@/components/ui";
import { buildStudentTeksHistory } from "@/lib/dbMastery";

export default function StudentsPage() {
  return (
    <>
      <PageHeader title="Students" eyebrow="Secure roster">Students are scoped to the signed-in teacher account. Use display names when possible.</PageHeader>
      <AuthGate>
        {(db) => (
          <Card className="table-wrap">
            <table>
              <thead><tr><th>Student</th><th>Class</th><th>Evidence</th><th>Weakest TEKS</th><th>Recommended next move</th></tr></thead>
              <tbody>
                {db.snapshot.students.map((student) => {
                  const history = buildStudentTeksHistory(db.snapshot, student.id);
                  return <tr key={student.id}><td><Link className="font-black text-[#174a36] underline" href={`/student/${student.id}`}>{student.display_name}</Link></td><td>{db.snapshot.classes.find((klass) => klass.id === student.class_id)?.class_name || "Unassigned"}</td><td>{db.snapshot.evidence.filter((row) => row.student_id === student.id).length}</td><td>{history[0]?.teksCode || "No TEKS evidence"}</td><td>{history[0]?.recommendedNextMove || "Collect more evidence before making a decision."}</td></tr>;
                })}
              </tbody>
            </table>
          </Card>
        )}
      </AuthGate>
    </>
  );
}

"use client";

import Link from "next/link";
import { AuthGate } from "@/components/AuthGate";
import { Card, PageHeader } from "@/components/ui";
import { buildTeksMastery } from "@/lib/dbMastery";

export default function ClassesPage() {
  return (
    <>
      <PageHeader title="Classes" eyebrow="Database dashboard">
        Class evidence, TEKS priorities, students needing help, and students ready for enrichment.
      </PageHeader>
      <AuthGate>
        {(db) => (
          <Card className="table-wrap">
            <table>
              <thead><tr><th>Class</th><th>Students</th><th>Evidence rows</th><th>Average</th><th>Priority TEKS</th><th>Enrichment-ready evidence</th></tr></thead>
              <tbody>
                {db.snapshot.classes.map((klass) => {
                  const evidence = db.snapshot.evidence.filter((row) => row.class_id === klass.id);
                  const average = evidence.length ? Math.round(evidence.reduce((sum, row) => sum + Number(row.percent ?? 0), 0) / evidence.length * 10) / 10 : 0;
                  const mastery = buildTeksMastery(db.snapshot, klass.id);
                  return <tr key={klass.id}><td><Link className="font-black text-[#174a36] underline" href={`/classes/${klass.id}`}>{klass.class_name}</Link><br /><span className="text-sm text-[#647067]">{klass.period_label}</span></td><td>{db.snapshot.students.filter((student) => student.class_id === klass.id).length}</td><td>{evidence.length}</td><td>{average}%</td><td>{mastery.slice(0, 3).map((row) => `${row.teksCode} ${row.classAverage}%`).join(", ") || "No TEKS evidence"}</td><td>{mastery.filter((row) => row.status === "Mastered").length}</td></tr>;
                })}
              </tbody>
            </table>
          </Card>
        )}
      </AuthGate>
    </>
  );
}

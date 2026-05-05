"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AuthGate } from "@/components/AuthGate";
import { Badge, Card, PageHeader, StatCard, teksStatusTone } from "@/components/ui";
import { buildStudentTeksHistory, buildTeksMastery } from "@/lib/dbMastery";

export default function ClassDetailPage() {
  const params = useParams<{ period: string }>();
  const classId = params?.period ?? "";

  return (
    <>
      <AuthGate>
        {(db) => {
          const klass = db.snapshot.classes.find((item) => item.id === classId);
          const students = db.snapshot.students.filter((student) => student.class_id === classId);
          const evidence = db.snapshot.evidence.filter((row) => row.class_id === classId);
          const average = evidence.length ? Math.round(evidence.reduce((sum, row) => sum + row.percent, 0) / evidence.length * 10) / 10 : 0;
          const mastery = buildTeksMastery(db.snapshot, classId);
          const support = students.filter((student) => buildStudentTeksHistory(db.snapshot, student.id).some((row) => row.status === "Struggling" || row.status === "Approaching"));
          const enrichment = students.filter((student) => buildStudentTeksHistory(db.snapshot, student.id).some((row) => row.status === "Mastered"));
          return (
            <>
              <PageHeader title={klass?.name || "Class"} eyebrow="Class dashboard">Average score, TEKS mastery summary, priority TEKS, support groups, and enrichment-ready students.</PageHeader>
              <section className="mb-6 grid gap-4 md:grid-cols-4">
                <StatCard label="Students" value={students.length} />
                <StatCard label="Average score" value={`${average}%`} />
                <StatCard label="Priority TEKS" value={mastery.filter((row) => row.classAverage < 70).length} />
                <StatCard label="Evidence rows" value={evidence.length} />
              </section>
              <Card className="mb-6 table-wrap">
                <h2 className="mb-4 text-xl font-black text-[#174a36]">TEKS mastery summary</h2>
                <table><thead><tr><th>TEKS</th><th>Skill</th><th>Average</th><th>Status</th><th>Move</th></tr></thead><tbody>{mastery.map((row) => <tr key={row.teksCode}><td className="font-black">{row.teksCode}</td><td>{row.skillDescription}</td><td>{row.classAverage}%</td><td><Badge tone={teksStatusTone(row.status)}>{row.status}</Badge></td><td>{row.recommendedMove}</td></tr>)}</tbody></table>
              </Card>
              <section className="grid gap-4 lg:grid-cols-2">
                <Card><h2 className="mb-3 text-xl font-black text-[#174a36]">Students needing help</h2>{support.map((student) => <p key={student.id}><Link className="underline" href={`/student/${student.id}`}>{student.display_name}</Link></p>) || "No students flagged."}</Card>
                <Card><h2 className="mb-3 text-xl font-black text-[#174a36]">Ready for enrichment</h2>{enrichment.map((student) => <p key={student.id}><Link className="underline" href={`/student/${student.id}`}>{student.display_name}</Link></p>) || "No students flagged."}</Card>
              </section>
            </>
          );
        }}
      </AuthGate>
    </>
  );
}

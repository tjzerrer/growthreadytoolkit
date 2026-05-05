"use client";

import { AuthGate } from "@/components/AuthGate";
import { Badge, Card, PageHeader, StatCard, teksStatusTone } from "@/components/ui";
import { buildTeksMastery } from "@/lib/dbMastery";
import { downloadCsv } from "@/lib/csv";

export default function WorkingTeksListPage() {
  return (
    <>
      <PageHeader title="Working TEKS List" eyebrow="Yearlong mastery">
        Grades tell what a student earned. Mastery tells what a student is ready to do next.
      </PageHeader>
      <AuthGate>
        {(db) => {
          const rows = buildTeksMastery(db.snapshot);
          return (
            <>
              <section className="mb-6 grid gap-4 md:grid-cols-4">
                <StatCard label="TEKS with evidence" value={rows.length} />
                <StatCard label="Evidence rows" value={db.snapshot.evidence.length} />
                <StatCard label="Students" value={db.snapshot.students.length} />
                <StatCard label="Assignments" value={db.snapshot.assignments.length} />
              </section>
              <div className="mb-4">
                <button className="rounded-2xl border border-[#d6cdbb] bg-white/70 px-5 py-3 text-sm font-black text-[#174a36]" onClick={() => downloadCsv("growthready-teks-mastery.csv", rows.map((row) => ({
                  teks_code: row.teksCode,
                  skill_description: row.skillDescription,
                  standard_type: row.standardType,
                  priority: row.priority,
                  students_with_evidence: row.studentsWithEvidence,
                  total_evidence_points: row.totalEvidencePoints,
                  class_average: row.classAverage,
                  mastered_pct: row.masteredPct,
                  proficient_pct: row.proficientPct,
                  approaching_pct: row.approachingPct,
                  struggling_pct: row.strugglingPct,
                  movement: row.movement,
                  recommended_teacher_move: row.recommendedMove,
                })))}>Export TEKS Mastery CSV</button>
              </div>
              <Card className="table-wrap">
                <table>
                  <thead><tr><th>TEKS</th><th>Skill</th><th>Type</th><th>Priority</th><th>Students</th><th>Evidence</th><th>Average</th><th>Mastered</th><th>Proficient</th><th>Approaching</th><th>Struggling</th><th>Movement</th><th>Move</th></tr></thead>
                  <tbody>
                    {rows.map((row) => <tr key={row.teksCode}><td className="font-black">{row.teksCode}</td><td>{row.skillDescription}</td><td>{row.standardType}</td><td>{row.priority}</td><td>{row.studentsWithEvidence}</td><td>{row.totalEvidencePoints}</td><td><Badge tone={teksStatusTone(row.status)}>{row.classAverage}%</Badge></td><td>{row.masteredPct}%</td><td>{row.proficientPct}%</td><td>{row.approachingPct}%</td><td>{row.strugglingPct}%</td><td>{row.movement}</td><td>{row.recommendedMove}</td></tr>)}
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

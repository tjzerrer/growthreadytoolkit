"use client";

import { AuthGate } from "@/components/AuthGate";
import { ButtonLink, Card, PageHeader, StatCard } from "@/components/ui";
import { buildTeksMastery } from "@/lib/dbMastery";

export default function Home() {
  return (
    <>
      <PageHeader title="GrowthReady Algebra" eyebrow="Mastery and growth engine">
        MyOpenMath is the question engine. GrowthReady Algebra is the mastery and growth engine.
      </PageHeader>
      <Card className="mb-6 border-sky-200 bg-sky-50 text-sky-950">
        Grades tell what a student earned. Mastery tells what a student is ready to do next.
      </Card>
      <div className="mb-8 flex flex-wrap gap-3">
        <ButtonLink href="/upload">Upload MyOpenMath CSV</ButtonLink>
        <ButtonLink href="/teks-mapping">TEKS Mapping</ButtonLink>
        <ButtonLink href="/working-teks-list">Working TEKS List</ButtonLink>
        <ButtonLink href="/classes">Classes</ButtonLink>
        <ButtonLink href="/students">Students</ButtonLink>
        <ButtonLink href="/staar-blueprint">STAAR Blueprint</ButtonLink>
      </div>
      <AuthGate>
        {(db) => {
          const mastery = buildTeksMastery(db.snapshot);
          return (
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Classes" value={db.snapshot.classes.length} />
              <StatCard label="Students" value={db.snapshot.students.length} />
              <StatCard label="Assignments" value={db.snapshot.assignments.length} />
              <StatCard label="Evidence rows" value={db.snapshot.evidence.length} />
              <StatCard label="TEKS with evidence" value={mastery.length} />
              <StatCard label="Priority TEKS" value={mastery.filter((row) => row.classAverage < 70).length} />
              <StatCard label="Mastered TEKS" value={mastery.filter((row) => row.status === "Mastered").length} />
              <StatCard label="Need more evidence" value={mastery.filter((row) => row.status === "Not Enough Evidence").length} />
            </section>
          );
        }}
      </AuthGate>
    </>
  );
}

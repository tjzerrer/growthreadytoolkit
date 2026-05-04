"use client";

import Link from "next/link";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { gradeOrder } from "@/lib/settings";
import { useGrowthData } from "@/lib/useGrowthData";

export default function GradeStructurePage() {
  const { data, settings, ready } = useGrowthData();
  if (ready && !data) return <EmptyState />;

  return (
    <>
      <PageHeader title="A-F Grade Structure" eyebrow="Teacher insight only">
        The diagnostic should be used primarily as a starting-point measure. The A-F conversion helps teachers communicate performance, but mastery and growth data are more useful for planning instruction.
      </PageHeader>
      {data ? (
        <>
          <Card className="mb-6">
            <h2 className="mb-4 text-xl font-black text-[#174a36]">Conversion</h2>
            <div className="grid gap-3 md:grid-cols-5">
              <div>A: {settings.gradeCutoffs.A}-100</div><div>B: {settings.gradeCutoffs.B}-{settings.gradeCutoffs.A - 1}</div><div>C: {settings.gradeCutoffs.C}-{settings.gradeCutoffs.B - 1}</div><div>D: {settings.gradeCutoffs.D}-{settings.gradeCutoffs.C - 1}</div><div>F: below {settings.gradeCutoffs.D}</div>
            </div>
          </Card>

          <section className="mb-6 grid gap-4 lg:grid-cols-2">
            <Card className="table-wrap">
              <h2 className="mb-4 text-xl font-black text-[#174a36]">A-F distribution by class</h2>
              <table>
                <thead><tr><th>Class</th>{gradeOrder.map((grade) => <th key={grade}>{grade}</th>)}</tr></thead>
                <tbody>
                  {data.classes.map((item) => {
                    const students = data.students.filter((student) => student.class_period === item.period);
                    return <tr key={item.period}><td>{item.label}</td>{gradeOrder.map((grade) => <td key={grade}>{students.filter((student) => student.letterGrade === grade).length}</td>)}</tr>;
                  })}
                </tbody>
              </table>
            </Card>
            <Card>
              <h2 className="mb-4 text-xl font-black text-[#174a36]">Planning nuance</h2>
              <p className="text-[#4d5b52]">A low equivalent grade can still hide a clear skill strength, and a passing equivalent can still mask critical gaps. Use these lists to avoid overgeneralizing from the total score.</p>
            </Card>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <Card>
              <h2 className="mb-4 text-xl font-black text-[#174a36]">Low grade with skill strengths</h2>
              <ul className="space-y-2">
                {data.students.filter((student) => ["D", "F"].includes(student.letterGrade) && student.strongestSkill !== "Not enough data").map((student) => <li key={student.student_id}><Link className="font-black underline" href={`/students/${student.student_id}`}>{student.first_name} {student.last_name}</Link>: strength in {student.strongestSkill}</li>)}
              </ul>
            </Card>
            <Card>
              <h2 className="mb-4 text-xl font-black text-[#174a36]">Passing grade with critical gaps</h2>
              <ul className="space-y-2">
                {data.students.filter((student) => !["D", "F"].includes(student.letterGrade) && student.criticalMissedCount > 0).map((student) => <li key={student.student_id}><Link className="font-black underline" href={`/students/${student.student_id}`}>{student.first_name} {student.last_name}</Link>: {student.criticalMissedCount} critical missed</li>)}
              </ul>
            </Card>
          </section>
        </>
      ) : null}
    </>
  );
}

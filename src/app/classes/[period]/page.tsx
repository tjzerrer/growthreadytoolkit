"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Badge, bandTone, Card, EmptyState, masteryColor, PageHeader, StatCard } from "@/components/ui";
import { useGrowthData } from "@/lib/useGrowthData";

export default function ClassDetailPage() {
  const params = useParams<{ period: string }>();
  const period = decodeURIComponent(params?.period ?? "");
  const { data, rawData, ready } = useGrowthData();
  if (ready && !data) return <EmptyState />;

  const summary = data?.classes.find((item) => item.period === period);
  const students = data?.students.filter((student) => student.class_period === period) ?? [];
  const questions = rawData?.questionMap ?? [];

  return (
    <>
      <PageHeader title={summary?.label ?? `Period ${period}`} eyebrow="Individual class">
        Skill heatmap, intervention/enrichment groups, and deterministic recommended teacher moves.
      </PageHeader>

      {summary && data ? (
        <>
          <section className="mb-6 grid gap-4 md:grid-cols-4">
            <StatCard label="Students" value={summary.studentCount} />
            <StatCard label="Average score" value={`${summary.averageScore}/20`} />
            <StatCard label="Weakest skill" value={summary.weakestSkill} />
            <StatCard label="Enrichment" value={summary.enrichmentCount} />
          </section>

          <section className="mb-6 grid gap-4 lg:grid-cols-2">
            <Card>
              <h2 className="mb-4 text-xl font-black text-[#174a36]">Readiness distribution</h2>
              <div className="grid gap-3">
                {["Foundations Missing", "Entering Algebra 1", "Algebra Ready", "Meets/Masters Candidate"].map((band) => (
                  <div key={band} className="flex items-center justify-between rounded-2xl bg-white/70 p-3">
                    <Badge tone={bandTone(band)}>{band}</Badge>
                    <span className="font-black">{students.filter((student) => student.readinessBand === band).length}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <h2 className="mb-4 text-xl font-black text-[#174a36]">Recommended teacher moves</h2>
              <ul className="space-y-3">
                {summary.recommendations.map((rec) => <li key={rec} className="rounded-2xl bg-[#dbe8d2] p-3 font-semibold text-[#174a36]">{rec}</li>)}
              </ul>
            </Card>
          </section>

          <Card className="mb-6">
            <h2 className="mb-4 text-xl font-black text-[#174a36]">Skill mastery heatmap</h2>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
              {data.skills.map((skill) => {
                const value = skill.byClass[period] ?? 0;
                return <div key={skill.skill} className={`rounded-2xl p-3 text-sm font-black ${masteryColor(value)}`}>{skill.skill}: {value}%</div>;
              })}
            </div>
          </Card>

          <Card className="mb-6 table-wrap">
            <h2 className="mb-4 text-xl font-black text-[#174a36]">Question performance</h2>
            <table>
              <thead><tr><th>Question</th><th>Skill</th><th>Zone</th><th>% Correct</th><th>Critical</th></tr></thead>
              <tbody>
                {questions.map((question) => {
                  const correct = students.filter((student) => Number(student.answers[question.question_id]) > 0).length;
                  const percent = students.length ? Math.round((correct / students.length) * 100) : 0;
                  return <tr key={question.question_id}><td>{question.question_id}</td><td>{question.skill}</td><td>{question.zone}</td><td><span className={`rounded-full px-3 py-1 font-black ${masteryColor(percent)}`}>{percent}%</span></td><td>{question.critical ? "Yes" : "No"}</td></tr>;
                })}
              </tbody>
            </table>
          </Card>

          <section className="grid gap-4 lg:grid-cols-2">
            <Card className="table-wrap">
              <h2 className="mb-4 text-xl font-black text-[#174a36]">Student list</h2>
              <table>
                <thead><tr><th>Student</th><th>Score</th><th>Band</th><th>Flags</th></tr></thead>
                <tbody>
                  {students.map((student) => <tr key={student.student_id}><td><Link className="font-black underline" href={`/students/${student.student_id}`}>{student.first_name} {student.last_name}</Link></td><td>{student.totalScore}/20</td><td><Badge tone={bandTone(student.readinessBand)}>{student.readinessBand}</Badge></td><td>{student.interventionFlags.join(", ") || (student.enrichment ? "Enrichment" : "None")}</td></tr>)}
                </tbody>
              </table>
            </Card>
            <Card>
              <h2 className="mb-4 text-xl font-black text-[#174a36]">Groups</h2>
              <p className="font-black text-red-800">Intervention</p>
              <p className="mb-4 text-sm text-[#647067]">{students.filter((student) => student.interventionFlags.length).map((student) => `${student.first_name} ${student.last_name}`).join(", ") || "No intervention group."}</p>
              <p className="font-black text-sky-800">Enrichment</p>
              <p className="text-sm text-[#647067]">{students.filter((student) => student.enrichment).map((student) => `${student.first_name} ${student.last_name}`).join(", ") || "No enrichment group."}</p>
            </Card>
          </section>
        </>
      ) : null}
    </>
  );
}

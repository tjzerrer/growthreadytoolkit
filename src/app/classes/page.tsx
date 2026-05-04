"use client";

import Link from "next/link";
import { Button, EmptyState, PageHeader } from "@/components/ui";
import { exportClassSummary } from "@/lib/exports";
import { useGrowthData } from "@/lib/useGrowthData";

export default function ClassesPage() {
  const { data, ready } = useGrowthData();
  if (ready && !data) return <EmptyState />;

  return (
    <>
      <PageHeader title="All Algebra Classes" eyebrow="Class dashboard">
        Compare readiness, strongest skills, weakest skills, and instructional next moves by period.
      </PageHeader>
      {data ? (
        <>
          <div className="mb-4"><Button onClick={() => exportClassSummary(data)} variant="soft">Export Class Summary CSV</Button></div>
          <div className="card table-wrap rounded-3xl">
            <table>
              <thead>
                <tr>
                  <th>Class period</th><th>Students</th><th>Average</th><th>Median</th><th>% Foundations</th><th>% Entering</th><th>% Ready</th><th>% Meets/Masters</th><th>Weakest</th><th>Strongest</th><th>Intervention</th><th>Enrichment</th>
                </tr>
              </thead>
              <tbody>
                {data.classes.map((item) => (
                  <tr key={item.period}>
                    <td><Link className="font-black text-[#174a36] underline" href={`/classes/${encodeURIComponent(item.period)}`}>{item.label}</Link></td>
                    <td>{item.studentCount}</td><td>{item.averageScore}/20</td><td>{item.medianScore}</td><td>{item.foundationsMissingPct}%</td><td>{item.enteringPct}%</td><td>{item.algebraReadyPct}%</td><td>{item.meetsMastersPct}%</td><td>{item.weakestSkill}</td><td>{item.strongestSkill}</td><td>{item.interventionCount}</td><td>{item.enrichmentCount}</td>
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

"use client";

import { ButtonLink, Card, EmptyState, PageHeader, StatCard, TrajectoryDisclaimer } from "@/components/ui";
import { useGrowthData } from "@/lib/useGrowthData";

export default function Home() {
  const { data, ready } = useGrowthData();

  return (
    <>
      <PageHeader title="GrowthReady Algebra" eyebrow="Private teacher dashboard">
        Turn MyOpenMath data into Algebra 1 growth insights.
      </PageHeader>
      <TrajectoryDisclaimer />

      <div className="mb-8 flex flex-wrap gap-3">
        <ButtonLink href="/upload">Upload Data</ButtonLink>
        <ButtonLink href="/classes">View All Classes</ButtonLink>
        <ButtonLink href="/skills">View Skill Mastery</ButtonLink>
        <ButtonLink href="/groups">View Intervention Groups</ButtonLink>
        <ButtonLink href="/students">View Students</ButtonLink>
      </div>

      {ready && !data ? <EmptyState /> : null}

      {data ? (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total students" value={data.summary.totalStudents} />
          <StatCard label="Classes" value={data.summary.classCount} />
          <StatCard label="Avg diagnostic" value={`${data.summary.averageDiagnosticPercent}%`} detail={`${data.summary.averageDiagnosticScore} avg points`} />
          <StatCard label="Foundations missing" value={`${data.summary.foundationsMissingPct}%`} />
          <StatCard label="Algebra ready" value={`${data.summary.algebraReadyPct}%`} />
          <StatCard label="Weakest skill" value={data.summary.weakestSkillOverall} />
          <StatCard label="Need intervention" value={data.summary.interventionCount} />
          <StatCard label="Ready for enrichment" value={data.summary.enrichmentCount} />
          <StatCard label="Masters trajectory" value={data.summary.trajectoryCounts["Masters Trajectory"]} />
          <StatCard label="Meets trajectory" value={data.summary.trajectoryCounts["Meets Trajectory"]} />
          <StatCard label="Approaches trajectory" value={data.summary.trajectoryCounts["Approaches Trajectory"]} />
          <StatCard label="Did Not Meet risk" value={data.summary.trajectoryCounts["Did Not Meet Risk"]} />
        </section>
      ) : null}

      {data ? (
        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          <Card>
            <h2 className="mb-3 text-xl font-black text-[#174a36]">Highest Did Not Meet Risk</h2>
            <ul className="space-y-2 text-[#4d5b52]">
              {data.summary.highestDidNotMeetRiskClasses.map((item) => <li key={item.period}><strong>{item.label}</strong>: {item.percentage}%</li>)}
            </ul>
          </Card>
          <Card>
            <h2 className="mb-3 text-xl font-black text-[#174a36]">Highest Masters Trajectory</h2>
            <ul className="space-y-2 text-[#4d5b52]">
              {data.summary.highestMastersClasses.map((item) => <li key={item.period}><strong>{item.label}</strong>: {item.percentage}%</li>)}
            </ul>
          </Card>
        </section>
      ) : null}
    </>
  );
}

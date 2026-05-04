"use client";

import { ButtonLink, EmptyState, PageHeader, StatCard } from "@/components/ui";
import { useGrowthData } from "@/lib/useGrowthData";

export default function Home() {
  const { data, ready } = useGrowthData();

  return (
    <>
      <PageHeader title="GrowthReady Algebra" eyebrow="Private teacher dashboard">
        Turn MyOpenMath data into Algebra 1 growth insights.
      </PageHeader>

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
          <StatCard label="Avg diagnostic" value={`${data.summary.averageDiagnosticScore}/20`} />
          <StatCard label="Foundations missing" value={`${data.summary.foundationsMissingPct}%`} />
          <StatCard label="Algebra ready" value={`${data.summary.algebraReadyPct}%`} />
          <StatCard label="Weakest skill" value={data.summary.weakestSkillOverall} />
          <StatCard label="Need intervention" value={data.summary.interventionCount} />
          <StatCard label="Ready for enrichment" value={data.summary.enrichmentCount} />
        </section>
      ) : null}
    </>
  );
}

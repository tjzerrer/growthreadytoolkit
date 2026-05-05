"use client";

import { Badge, Card, EmptyState, PageHeader, StatCard } from "@/components/ui";
import { staarBlueprint } from "@/lib/staar";
import { useGrowthData } from "@/lib/useGrowthData";

export default function StaarBlueprintPage() {
  const { data, ready } = useGrowthData();
  if (ready && !data) return null;

  return (
    <>
      <PageHeader title="STAAR Algebra I Blueprint" eyebrow="Test target">
        The STAAR blueprint tells the test target. TEKS identify the standards. Breakouts identify the smaller skills inside each standard. MyOpenMath provides student evidence. GrowthReady Algebra connects them.
      </PageHeader>

      <section className="mb-6 grid gap-4 md:grid-cols-5">
        <StatCard label="Total questions" value={staarBlueprint.totalQuestions} />
        <StatCard label="Total points" value={staarBlueprint.totalPoints} />
        <StatCard label="1-point questions" value={staarBlueprint.onePointQuestions} />
        <StatCard label="2-point questions" value={staarBlueprint.twoPointQuestions} />
        <StatCard label="Readiness emphasis" value="55-70%" detail={staarBlueprint.readinessPointEmphasis} />
      </section>

      {ready && !data ? <EmptyState /> : null}

      <section className="grid gap-4 lg:grid-cols-2">
        {staarBlueprint.categories.map((category) => {
          const mastery = data?.reportingCategories.find((row) => row.category === category.name);
          const lowHighPriority = mastery && mastery.average < 70 && ["High", "Highest", "Medium-High"].includes(category.priority);
          return (
            <Card key={category.id} className={lowHighPriority ? "border-red-200 bg-red-50" : ""}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-[#174a36]">Category {category.id}: {category.name}</h2>
                  <p className="mt-2 text-sm text-[#647067]">Readiness standards: {category.readinessStandards}. Supporting standards: {category.supportingStandards}. Readiness standards carry the larger EOC emphasis; supporting standards still appear and can affect growth.</p>
                </div>
                <Badge tone={category.priority === "Highest" || category.priority === "High" ? "red" : category.priority === "Medium-High" ? "yellow" : "blue"}>{category.priority}</Badge>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <StatCard label="Questions" value={category.questions} />
                <StatCard label="Points" value={category.points} />
                <StatCard label="Current mastery" value={mastery ? `${mastery.average}%` : "No data"} />
              </div>
              {mastery ? <p className="mt-3 rounded-2xl bg-white/70 p-3 font-semibold text-[#174a36]">{mastery.suggestedNextAction}</p> : null}
              {lowHighPriority ? <p className="mt-3 rounded-2xl bg-red-100 p-3 font-black text-red-900">Warning: high-priority STAAR category is below 70% mastery.</p> : null}
            </Card>
          );
        })}
      </section>
    </>
  );
}

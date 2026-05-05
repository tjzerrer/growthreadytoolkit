"use client";

import { Badge, Card, EmptyState, masteryColor, PageHeader, teksStatusTone } from "@/components/ui";
import { algebraBreakouts, algebraTeksLibrary, staarBlueprint } from "@/lib/staar";
import { useGrowthData } from "@/lib/useGrowthData";

export default function BreakoutsPage() {
  const { data, rawData, ready } = useGrowthData();
  if (ready && !data) return null;

  return (
    <>
      <PageHeader title="TEKS Breakouts" eyebrow="Subskill evidence">
        Breakouts identify the smaller skills inside each standard, so question data can point to the exact version of a skill students are ready to revisit.
      </PageHeader>
      {ready && !data ? <EmptyState /> : null}

      <section className="grid gap-6">
        {staarBlueprint.categories.map((category) => (
          <Card key={category.id} className="table-wrap">
            <h2 className="mb-4 text-xl font-black text-[#174a36]">Category {category.id}: {category.name}</h2>
            <table>
              <thead><tr><th>TEKS</th><th>Breakout</th><th>Teacher-friendly description</th><th>Mapped questions</th><th>Class average</th><th>Status distribution</th><th>Guidance</th></tr></thead>
              <tbody>
                {algebraTeksLibrary.filter((teks) => teks.reporting_category_id === category.id).flatMap((teks) =>
                  algebraBreakouts.filter((breakout) => breakout.teks_code === teks.teks_code).map((breakout) => {
                    const mastery = data?.breakouts.find((row) => row.breakoutId === breakout.breakout_id);
                    const mappedQuestions = rawData?.standardMap?.filter((row) => row.breakout_id === breakout.breakout_id).map((row) => row.question_label).join(", ") || "No mapped questions";
                    return (
                      <tr key={breakout.breakout_id}>
                        <td className="font-black">{teks.teks_code}</td>
                        <td>{breakout.breakout_id}<br /><span className="text-sm text-[#647067]">{breakout.breakout_description}</span></td>
                        <td>{breakout.teacher_friendly_description}</td>
                        <td>{mappedQuestions}</td>
                        <td>{mastery ? <span className={`rounded-full px-3 py-1 font-black ${masteryColor(mastery.average)}`}>{mastery.average}%</span> : "Not enough evidence"}</td>
                        <td>{mastery ? <Badge tone={teksStatusTone(mastery.status)}>{mastery.status}</Badge> : <Badge tone="neutral">Not Enough Evidence</Badge>}<br />{mastery ? `M ${mastery.masteredPct}% | P ${mastery.proficientPct}% | A ${mastery.approachingPct}% | S ${mastery.strugglingPct}%` : ""}</td>
                        <td>{mastery?.guidance || "Not enough evidence"}</td>
                      </tr>
                    );
                  }),
                )}
              </tbody>
            </table>
          </Card>
        ))}
      </section>
    </>
  );
}

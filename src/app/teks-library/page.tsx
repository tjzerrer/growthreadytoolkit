"use client";

import { Badge, Card, EmptyState, PageHeader, teksStatusTone } from "@/components/ui";
import { algebraBreakouts, algebraTeksLibrary, staarBlueprint } from "@/lib/staar";
import { useGrowthData } from "@/lib/useGrowthData";

export default function TeksLibraryPage() {
  const { data, rawData, ready } = useGrowthData();
  if (ready && !data) return null;

  return (
    <>
      <PageHeader title="Algebra I TEKS Library" eyebrow="Standards reference">
        TEKS identify the standards. Use this page to see the built-in Algebra I library, mapped MyOpenMath evidence, and current mastery when data exists.
      </PageHeader>
      {ready && !data ? <EmptyState /> : null}

      <section className="grid gap-6">
        {staarBlueprint.categories.map((category) => {
          const teksRows = algebraTeksLibrary.filter((teks) => teks.reporting_category_id === category.id);
          return (
            <Card key={category.id} className="table-wrap">
              <h2 className="mb-4 text-xl font-black text-[#174a36]">Category {category.id}: {category.name}</h2>
              <table>
                <thead><tr><th>TEKS</th><th>Description</th><th>Label</th><th>Breakouts</th><th>Mapped MOM questions</th><th>Mastery</th></tr></thead>
                <tbody>
                  {teksRows.map((teks) => {
                    const mastery = data?.teksProgress.find((row) => row.teks === teks.teks_code);
                    const mapped = rawData?.standardMap?.filter((row) => row.standard_code === teks.teks_code).length ?? 0;
                    return (
                      <tr key={teks.teks_code}>
                        <td className="font-black">{teks.teks_code}</td>
                        <td>{teks.teks_description}<br /><span className="text-sm text-[#647067]">{teks.student_friendly_skill}</span></td>
                        <td><Badge tone={teks.readiness_or_supporting === "Readiness" ? "blue" : "neutral"}>{teks.readiness_or_supporting}</Badge></td>
                        <td>{algebraBreakouts.filter((breakout) => breakout.teks_code === teks.teks_code).length}</td>
                        <td>{mapped}</td>
                        <td>{mastery ? <Badge tone={teksStatusTone(mastery.status)}>{mastery.status} {mastery.average}%</Badge> : "Not enough evidence"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          );
        })}
      </section>
    </>
  );
}

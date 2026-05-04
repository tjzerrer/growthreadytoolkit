"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge, Button, Card, EmptyState, PageHeader } from "@/components/ui";
import { exportGroups } from "@/lib/exports";
import { useGrowthData } from "@/lib/useGrowthData";

export default function GroupsPage() {
  const { data, ready } = useGrowthData();
  const [period, setPeriod] = useState("all");
  if (ready && !data) return <EmptyState />;
  const periods = data ? Array.from(new Set(data.students.map((student) => student.class_period))) : [];
  const groups = data?.groups.filter((group) => period === "all" || group.classPeriod === period) ?? [];

  return (
    <>
      <PageHeader title="Intervention and Enrichment Groups" eyebrow="Action groups">
        Automatically generated groups show who needs help, why they were placed there, and what to assign next.
      </PageHeader>
      {data ? (
        <>
          <div className="mb-4 flex flex-wrap gap-3">
            <select className="rounded-2xl border border-[#d6cdbb] bg-white p-3" value={period} onChange={(event) => setPeriod(event.target.value)}>
              <option value="all">All class periods</option>
              {periods.map((item) => <option key={item} value={item}>Period {item}</option>)}
            </select>
            <Button onClick={() => exportGroups(data)} variant="soft">Export Groups CSV</Button>
          </div>
          <section className="grid gap-4">
            {groups.map((group) => (
              <Card key={`${group.groupName}-${group.student.student_id}`}>
                <div className="grid gap-3 md:grid-cols-[1fr_1fr_2fr_2fr] md:items-center">
                  <div><Badge tone={group.groupName === "Enrichment" ? "blue" : group.groupName === "Immediate Intervention" ? "red" : group.groupName === "No Data / Not Started" ? "neutral" : "yellow"}>{group.groupName}</Badge></div>
                  <Link className="font-black text-[#174a36] underline" href={`/students/${group.student.student_id}`}>{group.student.first_name} {group.student.last_name}<br /><span className="text-sm text-[#647067]">Period {group.classPeriod}</span></Link>
                  <p className="text-sm text-[#647067]">{group.reason}</p>
                  <p className="font-semibold text-[#174a36]">{group.suggestedActivity}</p>
                </div>
              </Card>
            ))}
          </section>
        </>
      ) : null}
    </>
  );
}

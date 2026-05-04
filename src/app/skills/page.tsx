"use client";

import { Button, Card, EmptyState, masteryColor, PageHeader } from "@/components/ui";
import { exportSkills } from "@/lib/exports";
import { useGrowthData } from "@/lib/useGrowthData";

export default function SkillsPage() {
  const { data, ready } = useGrowthData();
  if (ready && !data) return <EmptyState />;

  return (
    <>
      <PageHeader title="Skill Mastery" eyebrow="TEKS and zones">
        Find the skills that most need reteaching, with priority levels based on criticality and percent correct.
      </PageHeader>
      {data ? (
        <>
          <div className="mb-4"><Button onClick={() => exportSkills(data)} variant="soft">Export Skill Mastery CSV</Button></div>
          <Card className="mb-6">
            <h2 className="mb-4 text-xl font-black text-[#174a36]">Mastery heatmap</h2>
            <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-5">
              {data.skills.map((skill) => <div key={skill.skill} className={`rounded-2xl p-3 text-sm font-black ${masteryColor(skill.percentCorrect)}`}>{skill.skill}<br />{skill.percentCorrect}%</div>)}
            </div>
          </Card>
          <div className="card table-wrap rounded-3xl">
            <table>
              <thead><tr><th>Skill</th><th>Zone</th><th>TEKS</th><th>Questions</th><th>% Correct</th><th>By class</th><th>Critical</th><th>Priority</th></tr></thead>
              <tbody>
                {data.skills.map((skill) => (
                  <tr key={skill.skill}>
                    <td className="font-black">{skill.skill}</td><td>{skill.zone}</td><td>{skill.teks}</td><td>{skill.questionCount}</td><td><span className={`rounded-full px-3 py-1 font-black ${masteryColor(skill.percentCorrect)}`}>{skill.percentCorrect}%</span></td><td>{Object.entries(skill.byClass).map(([period, value]) => `P${period}: ${value}%`).join(" | ")}</td><td>{skill.critical ? "Yes" : "No"}</td><td>{skill.priority}</td>
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

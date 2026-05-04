import type { DiagnosticResult, QuestionMapItem, RawAppData, Reflection, Student } from "./types";

export const defaultQuestionMap: QuestionMapItem[] = [
  ["Q1", "Integer Operations", "Readiness", "Number Sense", true],
  ["Q2", "Fraction Operations", "Readiness", "Number Sense", true],
  ["Q3", "Order of Operations", "Readiness", "Number Sense", true],
  ["Q4", "Percent Reasoning", "Readiness", "Number Sense", false],
  ["Q5", "Evaluate Expressions", "A.12E", "Expressions", true],
  ["Q6", "Combine Like Terms", "A.10A", "Expressions", true],
  ["Q7", "Distributive Property", "A.10A", "Expressions", true],
  ["Q8", "Two-Step Equations", "A.5A", "Equations", true],
  ["Q9", "Variables on Both Sides", "A.5A", "Equations", true],
  ["Q10", "Unit Rate", "A.3B", "Linear Thinking", true],
  ["Q11", "Proportional Tables", "A.2A", "Linear Thinking", true],
  ["Q12", "Solve Proportions", "Readiness", "Linear Thinking", false],
  ["Q13", "Interpret Rate", "A.3B", "Linear Thinking", true],
  ["Q14", "Coordinate Plane", "Readiness", "Graphing", true],
  ["Q15", "Slope from Points", "A.3A", "Graphing", true],
  ["Q16", "Graph Interpretation", "A.3C", "Graphing", true],
  ["Q17", "Linear vs Nonlinear", "A.2A", "Functions", true],
  ["Q18", "Exponent Rules", "A.11B", "Exponents", false],
  ["Q19", "Function Notation", "A.12B", "Functions", true],
  ["Q20", "Pattern Rule", "A.12C", "Functions", false],
].map(([question_id, skill, teks, zone, critical]) => ({
  question_id: String(question_id),
  skill: String(skill),
  teks: String(teks),
  zone: String(zone),
  critical: Boolean(critical),
}));

const supports = ["small group", "worked examples", "partner practice", "video reteach"];

export function createDemoData(): RawAppData {
  const roster: Student[] = [];
  const diagnostics: DiagnosticResult[] = [];
  const reflections: Reflection[] = [];

  for (let i = 1; i <= 100; i += 1) {
    const classPeriod = String(Math.ceil(i / 25));
    const id = `S${String(i).padStart(3, "0")}`;
    const student = {
      student_id: id,
      first_name: `Student`,
      last_name: String(i).padStart(3, "0"),
      class_period: classPeriod,
    };
    roster.push(student);

    const baseline = i % 10 === 0 ? 0.9 : i % 7 === 0 ? 0.35 : i % 4 === 0 ? 0.55 : i % 3 === 0 ? 0.72 : 0.62;
    const answers = Object.fromEntries(
      defaultQuestionMap.map((q, index) => {
        const zonePenalty = classPeriod === "2" && q.zone === "Equations" ? 0.24 : classPeriod === "3" && q.zone === "Graphing" ? 0.18 : 0;
        const numberPenalty = classPeriod === "4" && q.zone === "Number Sense" ? 0.2 : 0;
        const wave = ((i * (index + 3)) % 11) / 100;
        return [q.question_id, baseline + wave - zonePenalty - numberPenalty > 0.58 ? 1 : 0];
      }),
    );
    diagnostics.push({ ...student, answers });
    reflections.push({
      student_id: id,
      confidence_rating: String((i % 5) + 1),
      goal: "Improve confidence solving multi-step Algebra problems.",
      concern: i % 6 === 0 ? "I get stuck when a problem has many steps." : "",
      preferred_support: supports[i % supports.length],
    });
  }

  return { roster, diagnostics, questionMap: defaultQuestionMap, reflections };
}

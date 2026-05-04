import { describe, expect, it } from "vitest";
import { deriveData, getPriority, getReadinessBand } from "./calculations";
import { defaultQuestionMap } from "./demoData";
import type { DiagnosticResult, RawAppData } from "./types";

function diagnostic(student_id: string, score: number): DiagnosticResult {
  const answers = Object.fromEntries(defaultQuestionMap.map((q, index) => [q.question_id, index < score ? 1 : 0]));
  return { student_id, first_name: "Test", last_name: student_id, class_period: "1", answers };
}

describe("GrowthReady calculations", () => {
  it("marks an 18/20 student as Meets/Masters Candidate and Enrichment", () => {
    const raw: RawAppData = { roster: [], diagnostics: [diagnostic("S001", 18)], questionMap: defaultQuestionMap, reflections: [] };
    const data = deriveData(raw);
    expect(data.students[0].readinessBand).toBe("Meets/Masters Candidate");
    expect(data.students[0].enrichment).toBe(true);
  });

  it("marks a 7/20 student as Foundations Missing and Immediate Intervention", () => {
    const raw: RawAppData = { roster: [], diagnostics: [diagnostic("S002", 7)], questionMap: defaultQuestionMap, reflections: [] };
    const data = deriveData(raw);
    expect(getReadinessBand(7)).toBe("Foundations Missing");
    expect(data.students[0].interventionFlags).toContain("Immediate Intervention");
  });

  it("recommends an equation mini-cycle when class equation results are weak", () => {
    const weakEquations = defaultQuestionMap.map((q) => [q.question_id, q.zone === "Equations" ? 0 : 1]);
    const raw: RawAppData = {
      roster: [],
      diagnostics: Array.from({ length: 10 }, (_, index) => ({
        student_id: `S${index}`,
        first_name: "Test",
        last_name: String(index),
        class_period: "1",
        answers: Object.fromEntries(weakEquations),
      })),
      questionMap: defaultQuestionMap,
      reflections: [],
    };
    expect(deriveData(raw).classes[0].recommendations.join(" ")).toContain("equation fluency");
  });

  it("calculates skill priority levels", () => {
    expect(getPriority(65, true)).toBe("High");
    expect(getPriority(75, false)).toBe("Medium");
    expect(getPriority(85, true)).toBe("Low");
  });
});

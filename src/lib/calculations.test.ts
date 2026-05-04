import { describe, expect, it } from "vitest";
import { deriveData, getPriority, getReadinessBand } from "./calculations";
import { createUnmappedQuestionMap, mergeQuestionMapWithDetected, parseCsvMatrixString, parseMyOpenMathDetailedRows } from "./csv";
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

  it("parses MyOpenMath detailed exports using only Points columns", () => {
    const csv = [
      "Name,Section,Email,Question 1-1,Question 1-1,Question 1-1,Question 1-1,Question 1-1,Question 1-1,Question 1-1,Question 1-1,Question 1-2,Question 1-2,Question 1-2,Question 1-2,Question 1-2,Question 1-2,Question 1-2,Question 1-2",
      ",,,Points (1 possible),Part Points (1 possible),Raw,Part Raw,Scored Answer,Scored Answer (raw),Scored Correct Answer,Time Spent,Points (2 possible),Part Points (2 possible),Raw,Part Raw,Scored Answer,Scored Answer (raw),Scored Correct Answer,Time Spent",
      ",,,1789992,1789992,1789992,1789992,1789992,1789992,1789992,1789992,1789993,1789993,1789993,1789993,1789993,1789993,1789993,1789993",
      '"Student, Sample",1,sample@example.com,0.333,ignore,raw,part,answer,raw answer,correct,9.5,1.5,ignore,raw,part,answer,raw answer,correct,10',
      '"Student, Blank",,, ,,,,,,,,,,,,,,',
    ].join("\n");
    const matrix = parseCsvMatrixString(csv);
    const parsed = parseMyOpenMathDetailedRows(matrix.rows);
    expect(parsed.errors).toEqual([]);
    expect(parsed.detectedQuestions).toHaveLength(2);
    expect(parsed.detectedQuestions[0].myopenmath_question_id).toBe("1789992");
    expect(parsed.diagnostics[0].answers["Question 1-1"]).toBe(0.333);
    expect(parsed.diagnostics[0].totalPointsEarned).toBe(1.833);
    expect(parsed.diagnostics[0].totalPointsPossible).toBe(3);
    expect(parsed.diagnostics[1].incomplete).toBe(true);
  });

  it("keeps dashboards working for unmapped MyOpenMath questions", () => {
    const parsed = parseMyOpenMathDetailedRows(parseCsvMatrixString([
      "Name,Section,Email,Question 1-1",
      ",,,Points (1 possible)",
      ",,,1789992",
      '"Student, Ready",2,ready@example.com,1',
    ].join("\n")).rows);
    const raw: RawAppData = {
      roster: [],
      diagnostics: parsed.diagnostics,
      questionMap: mergeQuestionMapWithDetected(createUnmappedQuestionMap(parsed.detectedQuestions), parsed.detectedQuestions),
      reflections: [],
    };
    const data = deriveData(raw);
    expect(data.skills[0].skill).toBe("Unmapped Questions");
    expect(data.students[0].percentage).toBe(100);
  });
});

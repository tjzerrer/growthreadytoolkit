import type {
  AssignmentType,
  BreakoutProgress,
  DiagnosticResult,
  EvidenceType,
  QuestionMapItem,
  ReportingCategoryProgress,
  Student,
  StudentBreakoutProgress,
  StudentTeksProgress,
  TeksOverride,
  TeksMovement,
  TeksPriority,
  TeksProgress,
  TeksStatus,
} from "./types";
import { standardLabel } from "./standards";
import { algebraBreakouts } from "./staar";

const assignmentWeights: Record<AssignmentType, number> = {
  Diagnostic: 0.5,
  Practice: 0.5,
  "Spiral Review": 1,
  "Quiz/Checkpoint": 1.5,
  "Test/Common Assessment": 2,
  "Teacher-Scored Work": 1,
};

export const assignmentTypeOptions: AssignmentType[] = [
  "Diagnostic",
  "Practice",
  "Spiral Review",
  "Quiz/Checkpoint",
  "Test/Common Assessment",
  "Teacher-Scored Work",
];

export const evidenceTypeOptions: EvidenceType[] = [
  "Current",
  "Spiral Recent",
  "Spiral Older",
  "Prerequisite",
  "Enrichment",
  "Assessment",
];

function round(value: number) {
  return Math.round(value * 10) / 10;
}

function pct(part: number, total: number) {
  return total ? round((part / total) * 100) : 0;
}

function unique<T>(items: T[]) {
  return Array.from(new Set(items.filter(Boolean)));
}

function normalizedTeks(question: QuestionMapItem) {
  return question.teks?.trim() || "Unmapped";
}

function normalizedBreakout(question: QuestionMapItem) {
  return question.breakout_id?.trim() || "";
}

function assignmentKey(question: QuestionMapItem, fallbackType: AssignmentType = "Diagnostic") {
  if (question.assignment_key?.trim()) return question.assignment_key.trim();
  const label = question.question_label || question.question_id;
  const match = String(label).match(/question\s+(\d+)[-.]/i);
  return match?.[1] ? `Assignment ${match[1]}` : question.assignment_type || fallbackType;
}

function questionWeight(question: QuestionMapItem, fallbackType: AssignmentType = "Diagnostic") {
  const assignmentType = question.assignment_type || fallbackType;
  const base = assignmentWeights[assignmentType] ?? 1;
  const custom = Number(question.custom_weight ?? 1);
  return base * (Number.isFinite(custom) && custom > 0 ? custom : 1);
}

function questionPercent(result: DiagnosticResult, question: QuestionMapItem) {
  const possible = result.possiblePoints?.[question.question_id] ?? question.points_possible ?? 1;
  return possible ? (Number(result.answers[question.question_id] ?? 0) / possible) * 100 : 0;
}

function weightedAverage(entries: { percent: number; weight: number }[]) {
  const totalWeight = entries.reduce((sum, item) => sum + item.weight, 0);
  if (!totalWeight) return 0;
  return round(entries.reduce((sum, item) => sum + item.percent * item.weight, 0) / totalWeight);
}

export function getTeksStatus(average: number, evidenceCount: number, assignmentCount: number): TeksStatus {
  if (evidenceCount < 2) return "Not Enough Evidence";
  if (average >= 85 && evidenceCount >= 3 && assignmentCount >= 2) return "Mastered";
  if (average >= 70) return "Proficient";
  if (average >= 50) return "Approaching";
  return "Struggling";
}

function statusRank(status: TeksStatus) {
  return {
    "Not Enough Evidence": 0,
    Struggling: 1,
    Approaching: 2,
    Proficient: 3,
    Mastered: 4,
  }[status];
}

function movementFromEvidence(entries: { percent: number; weight: number }[], status: TeksStatus): TeksMovement {
  if (entries.length < 4) return "Not Enough Evidence";
  const midpoint = Math.floor(entries.length / 2);
  const earlier = weightedAverage(entries.slice(0, midpoint));
  const recent = weightedAverage(entries.slice(midpoint));
  const change = recent - earlier;
  if (change >= 10) return "Improving";
  if (change <= -10) return "Slipping";
  if (["Struggling", "Approaching"].includes(status)) return "Stuck";
  return "Stable";
}

function priorityFor(teks: TeksProgress): TeksPriority {
  if (teks.status === "Not Enough Evidence" || teks.studentsWithEvidence === 0) return "Watch";
  const needsSupport = teks.approachingPct + teks.strugglingPct;
  if (needsSupport > 40 && teks.critical) return "High Priority";
  if (needsSupport >= 25 && needsSupport <= 40) return "Medium Priority";
  if (needsSupport > 40) return "Medium Priority";
  return "Low Priority";
}

function recommendedMove(priority: TeksPriority, strugglingPct: number, approachingPct: number) {
  if (priority === "Watch") return "Gather more evidence";
  if (priority === "High Priority" && strugglingPct >= approachingPct) return "Whole-class reteach plus short reassessment";
  if (priority === "High Priority") return "Small-group intervention plus targeted practice";
  if (priority === "Medium Priority") return "Spiral review and checkpoint";
  return "Maintain through spiral";
}

export function categoryPriority(category: string, average: number): TeksPriority {
  if (average >= 70) return "Low Priority";
  if (category === "Writing and Solving Linear Functions, Equations and Inequalities") return "High Priority";
  if (category === "Describing and Graphing Linear Functions, Equations and Inequalities" || category === "Quadratic Functions and Equations") return "High Priority";
  if (category === "Number and Algebraic Methods") return "Medium Priority";
  if (category === "Exponential Functions and Equations") return "Medium Priority";
  return "Watch";
}

export function categoryGuidance(category: string, average: number) {
  if (category === "Writing and Solving Linear Functions, Equations and Inequalities" && average < 70) {
    return "Category 3 is the highest-weighted area on the Algebra I EOC. Current mastery is below 70%, so prioritize writing and solving linear functions, equations, and inequalities.";
  }
  if (average < 70) return `${category} is below 70%. Prioritize mapped readiness skills and reassess with a short checkpoint.`;
  return `${category} is at or above 70%. Maintain through spiral review and mixed practice.`;
}

function nextSkillFor(row: StudentTeksProgress) {
  if (row.status === "Not Enough Evidence") return `Gather more evidence for ${row.teks}`;
  if (row.status === "Mastered") return `Extend ${standardLabel(row.teks, row.teacherDescription)}`;
  if (row.status === "Proficient") return `Maintain ${standardLabel(row.teks, row.teacherDescription)} through spiral review`;
  return standardLabel(row.teks, row.teacherDescription);
}

function buildStudentTeksRows(
  result: DiagnosticResult,
  questionMap: QuestionMapItem[],
  fallbackAssignmentType: AssignmentType = "Diagnostic",
  overrides: TeksOverride[] = [],
): StudentTeksProgress[] {
  const teksCodes = unique(questionMap.map(normalizedTeks)).filter((teks) => teks !== "Unmapped");
  return teksCodes.map((teks) => {
    const questions = questionMap.filter((question) => normalizedTeks(question) === teks);
    const entries = questions
      .filter((question) => result.attemptedQuestions?.[question.question_id] ?? true)
      .map((question) => ({
        percent: questionPercent(result, question),
        weight: questionWeight(question, fallbackAssignmentType),
        assignmentKey: assignmentKey(question, fallbackAssignmentType),
      }));
    const average = weightedAverage(entries);
    const assignmentCount = unique(entries.map((entry) => entry.assignmentKey)).length;
    const teacherOverride = overrides.find((override) => override.student_id === result.student_id && override.teks === teks)?.status;
    const status = teacherOverride ?? getTeksStatus(average, entries.length, assignmentCount);
    const recentAverage = weightedAverage(entries.slice(Math.floor(entries.length / 2)));
    const row = {
      teks,
      skill: unique(questions.map((question) => question.skill)).join(", ") || "Unmapped Questions",
      teacherDescription: unique(questions.map((question) => question.teacher_description || "")).join(", "),
      reportingCategory: unique(questions.map((question) => question.reporting_category || question.zone)).join(", ") || "Unmapped",
      status,
      movement: movementFromEvidence(entries, status),
      evidenceCount: entries.length,
      assignmentCount,
      recentAverage: recentAverage || average,
      overallAverage: average,
      recommendedNextSkill: "",
      teacherOverride,
    };
    return { ...row, recommendedNextSkill: nextSkillFor(row) };
  }).sort((a, b) => statusRank(a.status) - statusRank(b.status) || a.overallAverage - b.overallAverage);
}

export function buildTeksProgress(
  diagnostics: DiagnosticResult[],
  questionMap: QuestionMapItem[],
  fallbackAssignmentType: AssignmentType = "Diagnostic",
  overrides: TeksOverride[] = [],
): { studentRows: Record<string, StudentTeksProgress[]>; allTeks: TeksProgress[]; categories: ReportingCategoryProgress[] } {
  const mappedQuestions = questionMap.filter((question) => normalizedTeks(question) !== "Unmapped");
  const studentRows = Object.fromEntries(diagnostics.map((result) => [result.student_id, buildStudentTeksRows(result, mappedQuestions, fallbackAssignmentType, overrides)]));
  const teksCodes = unique(mappedQuestions.map(normalizedTeks));

  const allTeks = teksCodes.map((teks) => {
    const questions = mappedQuestions.filter((question) => normalizedTeks(question) === teks);
    const studentProgress = diagnostics.map((student) => studentRows[student.student_id]?.find((row) => row.teks === teks)).filter(Boolean) as StudentTeksProgress[];
    const studentsWithEvidence = studentProgress.filter((row) => row.evidenceCount > 0).length;
    const average = round(studentProgress.reduce((sum, row) => sum + row.overallAverage, 0) / Math.max(studentsWithEvidence, 1));
    const allEntries = diagnostics.flatMap((student) =>
      questions
        .filter((question) => student.attemptedQuestions?.[question.question_id] ?? true)
        .map((question) => ({ percent: questionPercent(student, question), weight: questionWeight(question, fallbackAssignmentType) })),
    );
    const assignmentCount = unique(questions.map((question) => assignmentKey(question, fallbackAssignmentType))).length;
    const status = getTeksStatus(average, allEntries.length, assignmentCount);
    const statusCount = (statusName: TeksStatus) => studentProgress.filter((row) => row.status === statusName).length;
    const base: TeksProgress = {
      teks,
      skill: unique(questions.map((question) => question.skill)).join(", ") || "Unmapped Questions",
      teacherDescription: unique(questions.map((question) => question.teacher_description || "")).join(", "),
      reportingCategory: unique(questions.map((question) => question.reporting_category || question.zone)).join(", ") || "Unmapped",
      taggedQuestionCount: questions.length,
      studentsWithEvidence,
      status,
      average,
      masteredPct: pct(statusCount("Mastered"), studentsWithEvidence),
      proficientPct: pct(statusCount("Proficient"), studentsWithEvidence),
      approachingPct: pct(statusCount("Approaching"), studentsWithEvidence),
      strugglingPct: pct(statusCount("Struggling"), studentsWithEvidence),
      notEnoughEvidencePct: pct(statusCount("Not Enough Evidence"), diagnostics.length),
      movement: movementFromEvidence(allEntries, status),
      priority: "Watch",
      recommendedMove: "",
      critical: questions.some((question) => question.critical),
      studentStatuses: Object.fromEntries(
        diagnostics.map((student) => [student.student_id, studentRows[student.student_id]?.find((row) => row.teks === teks)?.status ?? "Not Enough Evidence"]),
      ),
    };
    const priority = priorityFor(base);
    return { ...base, priority, recommendedMove: recommendedMove(priority, base.strugglingPct, base.approachingPct) };
  }).sort((a, b) => statusRank(a.status) - statusRank(b.status) || b.strugglingPct + b.approachingPct - (a.strugglingPct + a.approachingPct));

  const categories = unique(questionMap.map((row) => row.reporting_category || row.zone).filter((category) => category !== "Unmapped")).map((category) => {
    const categoryQuestions = questionMap.filter((question) => (question.reporting_category || question.zone) === category);
    const studentCategoryRows = diagnostics.map((student) => {
      const entries = categoryQuestions
        .filter((question) => student.attemptedQuestions?.[question.question_id] ?? true)
        .map((question) => ({ percent: questionPercent(student, question), weight: questionWeight(question, fallbackAssignmentType) }));
      const average = weightedAverage(entries);
      return { average, status: getTeksStatus(average, entries.length, 1) };
    });
    const average = round(studentCategoryRows.reduce((sum, row) => sum + row.average, 0) / Math.max(studentCategoryRows.length, 1));
    const statusDistribution = {
      Mastered: pct(studentCategoryRows.filter((row) => row.status === "Mastered").length, studentCategoryRows.length),
      Proficient: pct(studentCategoryRows.filter((row) => row.status === "Proficient").length, studentCategoryRows.length),
      Approaching: pct(studentCategoryRows.filter((row) => row.status === "Approaching").length, studentCategoryRows.length),
      Struggling: pct(studentCategoryRows.filter((row) => row.status === "Struggling").length, studentCategoryRows.length),
      "Not Enough Evidence": pct(studentCategoryRows.filter((row) => row.status === "Not Enough Evidence").length, studentCategoryRows.length),
    };
    const priority = categoryPriority(category, average);
    return {
      category,
      average,
      statusDistribution,
      movement: "Not Enough Evidence" as TeksMovement,
      priority,
      suggestedNextAction: categoryGuidance(category, average),
    };
  });

  return { studentRows, allTeks, categories };
}

export function buildBreakoutProgress(
  diagnostics: DiagnosticResult[],
  questionMap: QuestionMapItem[],
  fallbackAssignmentType: AssignmentType = "Diagnostic",
): { studentRows: Record<string, StudentBreakoutProgress[]>; allBreakouts: BreakoutProgress[] } {
  const breakoutIds = Array.from(new Set(questionMap.map(normalizedBreakout).filter(Boolean)));
  const studentRows = Object.fromEntries(diagnostics.map((student) => [
    student.student_id,
    breakoutIds.map((breakoutId) => {
      const questions = questionMap.filter((question) => normalizedBreakout(question) === breakoutId);
      const entries = questions
        .filter((question) => student.attemptedQuestions?.[question.question_id] ?? true)
        .map((question) => ({ percent: questionPercent(student, question), weight: questionWeight(question, fallbackAssignmentType) }));
      const average = weightedAverage(entries);
      const breakout = algebraBreakouts.find((item) => item.breakout_id === breakoutId);
      return {
        breakoutId,
        teks: questions[0]?.teks || breakout?.teks_code || "Unmapped",
        teacherDescription: questions[0]?.teacher_description || breakout?.teacher_friendly_description || "Mapped breakout",
        status: getTeksStatus(average, entries.length, 1),
        evidenceCount: entries.length,
        average,
      };
    }),
  ]));

  const allBreakouts = breakoutIds.map((breakoutId) => {
    const breakout = algebraBreakouts.find((item) => item.breakout_id === breakoutId);
    const questions = questionMap.filter((question) => normalizedBreakout(question) === breakoutId);
    const rows = diagnostics.map((student) => studentRows[student.student_id]?.find((row) => row.breakoutId === breakoutId)).filter(Boolean) as StudentBreakoutProgress[];
    const studentsWithEvidence = rows.filter((row) => row.evidenceCount > 0);
    const average = round(studentsWithEvidence.reduce((sum, row) => sum + row.average, 0) / Math.max(studentsWithEvidence.length, 1));
    const status = getTeksStatus(average, questions.length * diagnostics.length, 1);
    const count = (statusName: TeksStatus) => rows.filter((row) => row.status === statusName).length;
    const guidance = questions.length < 2
      ? "This TEKS has only one mapped question. Gather more evidence before making a major instructional decision."
      : average < 70
        ? "Target the breakout, not the whole TEKS."
        : "Maintain this breakout through spiral review.";
    return {
      breakoutId,
      teks: questions[0]?.teks || breakout?.teks_code || "Unmapped",
      breakoutDescription: breakout?.breakout_description || questions[0]?.teacher_description || "Custom breakout",
      teacherDescription: breakout?.teacher_friendly_description || questions[0]?.teacher_description || "Custom breakout",
      representationType: breakout?.representation_type || "unknown",
      skillType: breakout?.skill_type || "unknown",
      mappedQuestions: questions.length,
      average,
      status,
      masteredPct: pct(count("Mastered"), rows.length),
      proficientPct: pct(count("Proficient"), rows.length),
      approachingPct: pct(count("Approaching"), rows.length),
      strugglingPct: pct(count("Struggling"), rows.length),
      notEnoughEvidencePct: pct(count("Not Enough Evidence"), rows.length),
      guidance,
    };
  }).sort((a, b) => a.average - b.average);
  return { studentRows, allBreakouts };
}

export function buildClassTeksSummary(teksRows: TeksProgress[], students: Student[], studentRows: Record<string, StudentTeksProgress[]>) {
  const classStudentIds = new Set(students.map((student) => student.student_id));
  const rows = teksRows.map((row) => {
    const classRows = students.map((student) => studentRows[student.student_id]?.find((item) => item.teks === row.teks)).filter(Boolean) as StudentTeksProgress[];
    const studentsWithEvidence = classRows.filter((item) => item.evidenceCount > 0).length;
    const statusCount = (statusName: TeksStatus) => classRows.filter((item) => item.status === statusName).length;
    const average = round(classRows.reduce((sum, item) => sum + item.overallAverage, 0) / Math.max(studentsWithEvidence, 1));
    const base = {
      ...row,
      studentsWithEvidence,
      average,
      masteredPct: pct(statusCount("Mastered"), studentsWithEvidence),
      proficientPct: pct(statusCount("Proficient"), studentsWithEvidence),
      approachingPct: pct(statusCount("Approaching"), studentsWithEvidence),
      strugglingPct: pct(statusCount("Struggling"), studentsWithEvidence),
      notEnoughEvidencePct: pct(statusCount("Not Enough Evidence"), students.length),
      studentStatuses: Object.fromEntries(Object.entries(row.studentStatuses).filter(([studentId]) => classStudentIds.has(studentId))),
    };
    const priority = priorityFor(base);
    return { ...base, priority, recommendedMove: recommendedMove(priority, base.strugglingPct, base.approachingPct) };
  });
  return {
    topPriorityTeks: rows.filter((row) => row.priority !== "Low Priority").slice(0, 5),
    strongestTeks: [...rows].filter((row) => row.status !== "Not Enough Evidence").sort((a, b) => b.average - a.average).slice(0, 5),
    interventionByTeks: rows.slice(0, 5).map((row) => ({
      teks: row.teks,
      skill: row.skill,
      teacherDescription: row.teacherDescription,
      students: students.filter((student) => {
        const status = studentRows[student.student_id]?.find((item) => item.teks === row.teks)?.status;
        return status === "Struggling" || status === "Approaching";
      }),
    })).filter((row) => row.students.length),
    enrichmentByTeks: rows.map((row) => ({
      teks: row.teks,
      skill: row.skill,
      teacherDescription: row.teacherDescription,
      students: students.filter((student) => studentRows[student.student_id]?.find((item) => item.teks === row.teks)?.status === "Mastered"),
    })).filter((row) => row.students.length).slice(0, 5),
  };
}

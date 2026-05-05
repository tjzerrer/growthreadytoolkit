import type { DbAssignment, DbClass, DbEvidence, DbProblemMapping, DbQuestion, DbQuestionTag, DbStudent } from "./supabase";

export type MasteryStatus = "Mastered" | "Proficient" | "Approaching" | "Struggling" | "Not Enough Evidence";
export type MovementLabel = "Improving" | "Stable" | "Slipping" | "Stuck" | "Not Enough Evidence";

export type DbSnapshot = {
  classes: DbClass[];
  students: DbStudent[];
  assignments: DbAssignment[];
  questions: DbQuestion[];
  questionTags: DbQuestionTag[];
  problemMappings: DbProblemMapping[];
  evidence: DbEvidence[];
};

export type TeksMasteryRow = {
  teksCode: string;
  skillDescription: string;
  standardType: string;
  priority: string;
  complexity: string;
  reportingCategoryName: string;
  studentsWithEvidence: number;
  totalEvidencePoints: number;
  classAverage: number;
  masteredPct: number;
  proficientPct: number;
  approachingPct: number;
  strugglingPct: number;
  status: MasteryStatus;
  movement: MovementLabel;
  recommendedMove: string;
};

export type StudentTeksHistory = {
  teksCode: string;
  skillDescription: string;
  evidenceCount: number;
  recentAverage: number;
  allTimeAverage: number;
  status: MasteryStatus;
  movement: MovementLabel;
  lastEvidenceDate: string;
  recommendedNextMove: string;
};

const round = (value: number) => Math.round(value * 10) / 10;
const average = (rows: DbEvidence[]) => rows.length ? round(rows.reduce((sum, row) => sum + Number(row.percent), 0) / rows.length) : 0;

export function masteryStatus(recentAverage: number, evidenceCount: number): MasteryStatus {
  if (evidenceCount < 2) return "Not Enough Evidence";
  if (recentAverage >= 85 && evidenceCount >= 4) return "Mastered";
  if (recentAverage >= 70 && evidenceCount >= 3) return "Proficient";
  if (recentAverage >= 50) return "Approaching";
  return "Struggling";
}

export function movementForEvidence(rows: DbEvidence[], status: MasteryStatus): MovementLabel {
  if (rows.length < 4) return "Not Enough Evidence";
  const sorted = [...rows].sort((a, b) => (a.date_administered ?? "").localeCompare(b.date_administered ?? ""));
  const midpoint = Math.floor(sorted.length / 2);
  const earlier = average(sorted.slice(0, midpoint));
  const recent = average(sorted.slice(midpoint));
  const change = recent - earlier;
  if (change >= 10) return "Improving";
  if (change <= -10) return "Slipping";
  if (status === "Struggling" || status === "Approaching") return "Stuck";
  return "Stable";
}

export function recommendedMove(status: MasteryStatus) {
  if (status === "Mastered") return "Maintain with occasional spiral and offer enrichment.";
  if (status === "Proficient") return "Continue grade-level practice and monitor.";
  if (status === "Approaching") return "Assign targeted practice and reassess soon.";
  if (status === "Struggling") return "Reteach and provide intervention.";
  return "Collect more evidence before making a decision.";
}

function recentRows(rows: DbEvidence[]) {
  return [...rows].sort((a, b) => (b.date_administered ?? "").localeCompare(a.date_administered ?? "")).slice(0, 5);
}

function tagForTeks(tags: DbQuestionTag[], teksCode: string) {
  return tags.find((tag) => tag.teks_code === teksCode);
}

export function buildTeksMastery(snapshot: DbSnapshot, classId?: string): TeksMasteryRow[] {
  const evidence = snapshot.evidence.filter((row) => row.teks_code && (!classId || row.class_id === classId));
  const teksCodes = Array.from(new Set(evidence.map((row) => row.teks_code as string)));
  return teksCodes.map((teksCode) => {
    const rows = evidence.filter((row) => row.teks_code === teksCode);
    const studentIds = Array.from(new Set(rows.map((row) => row.student_id)));
    const studentStatuses = studentIds.map((studentId) => {
      const studentRows = rows.filter((row) => row.student_id === studentId);
      return masteryStatus(average(recentRows(studentRows)), studentRows.length);
    });
    const recentAverage = average(recentRows(rows));
    const status = masteryStatus(recentAverage, rows.length);
    const tag = tagForTeks(snapshot.questionTags, teksCode);
    return {
      teksCode,
      skillDescription: tag?.skill_description || "No skill description",
      standardType: tag?.standard_type || "",
      priority: tag?.priority || "",
      complexity: tag?.complexity || "",
      reportingCategoryName: tag?.reporting_category_name || "",
      studentsWithEvidence: studentIds.length,
      totalEvidencePoints: rows.length,
      classAverage: average(rows),
      masteredPct: round((studentStatuses.filter((item) => item === "Mastered").length / Math.max(studentStatuses.length, 1)) * 100),
      proficientPct: round((studentStatuses.filter((item) => item === "Proficient").length / Math.max(studentStatuses.length, 1)) * 100),
      approachingPct: round((studentStatuses.filter((item) => item === "Approaching").length / Math.max(studentStatuses.length, 1)) * 100),
      strugglingPct: round((studentStatuses.filter((item) => item === "Struggling").length / Math.max(studentStatuses.length, 1)) * 100),
      status,
      movement: movementForEvidence(rows, status),
      recommendedMove: recommendedMove(status),
    };
  }).sort((a, b) => a.classAverage - b.classAverage);
}

export function buildStudentTeksHistory(snapshot: DbSnapshot, studentId: string): StudentTeksHistory[] {
  const evidence = snapshot.evidence.filter((row) => row.student_id === studentId && row.teks_code);
  const teksCodes = Array.from(new Set(evidence.map((row) => row.teks_code as string)));
  return teksCodes.map((teksCode) => {
    const rows = evidence.filter((row) => row.teks_code === teksCode);
    const recentAverage = average(recentRows(rows));
    const status = masteryStatus(recentAverage, rows.length);
    const tag = tagForTeks(snapshot.questionTags, teksCode);
    return {
      teksCode,
      skillDescription: tag?.skill_description || "No skill description",
      evidenceCount: rows.length,
      recentAverage,
      allTimeAverage: average(rows),
      status,
      movement: movementForEvidence(rows, status),
      lastEvidenceDate: [...rows].sort((a, b) => (b.date_administered ?? "").localeCompare(a.date_administered ?? ""))[0]?.date_administered || "",
      recommendedNextMove: recommendedMove(status),
    };
  }).sort((a, b) => a.recentAverage - b.recentAverage);
}

export function assignmentAverage(snapshot: DbSnapshot, assignmentId: string, studentId?: string) {
  return average(snapshot.evidence.filter((row) => row.assignment_id === assignmentId && (!studentId || row.student_id === studentId)));
}

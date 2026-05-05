import type { EvidenceType, QuestionMapItem, QuestionStandardMap, ReportingCategory } from "./types";

export const standardMapHeaders = [
  "question_label",
  "mom_question_id",
  "standard_code",
  "breakout_id",
  "teacher_description",
  "skill_category",
  "reporting_category",
  "evidence_type",
  "critical",
] as const;

export function normalizeMapKey(value: string | undefined) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

export function parseCritical(value: string | boolean | undefined) {
  if (typeof value === "boolean") return value;
  return /^(y|yes|true|1)$/i.test(String(value ?? "").trim());
}

export function parseCombinedStandardTag(value: string) {
  const trimmed = value.trim();
  const match = trimmed.match(/^([A-Za-z]\.\d+[A-Za-z]?)\s*(?:\||—|-|:)\s*(.+)$/);
  if (!match) return { standard_code: trimmed, teacher_description: "" };
  return {
    standard_code: match[1].trim(),
    teacher_description: match[2].trim(),
  };
}

export function standardLabel(code: string, description: string) {
  const cleanCode = code.trim();
  const cleanDescription = description.trim();
  if (cleanCode && cleanDescription) return `${cleanCode}: ${cleanDescription}`;
  return cleanCode || "Unmapped";
}

export function createStandardMapFromQuestions(questions: QuestionMapItem[]): QuestionStandardMap[] {
  return questions.map((question) => ({
    question_label: question.question_label || question.question_id,
    mom_question_id: question.myopenmath_question_id || "",
    standard_code: question.teks === "Unmapped" ? "" : question.teks || "",
    breakout_id: "",
    teacher_description: question.teacher_description || (question.skill === "Unmapped Questions" ? "" : question.skill || ""),
    skill_category: question.skill === "Unmapped Questions" ? "" : question.skill || "",
    reporting_category: question.reporting_category || question.zone || "",
    evidence_type: question.evidence_type || "Current",
    critical: question.critical,
    custom_weight: question.custom_weight ?? 1,
  }));
}

export function normalizeStandardMapRows(rows: Record<string, string>[]): QuestionStandardMap[] {
  return rows.map((row) => ({
    question_label: normalizeMapKey(row.question_label),
    mom_question_id: String(row.mom_question_id || row.myopenmath_question_id || "").trim(),
    standard_code: String(row.standard_code || row.teks || "").trim(),
    breakout_id: String(row.breakout_id || "").trim(),
    teacher_description: String(row.teacher_description || row.description || "").trim(),
    skill_category: String(row.skill_category || row.skill || "").trim(),
    reporting_category: String(row.reporting_category || row.category || "").trim() as ReportingCategory,
    evidence_type: (String(row.evidence_type || "Current").trim() || "Current") as EvidenceType,
    critical: parseCritical(row.critical),
    custom_weight: Number(row.custom_weight) || 1,
  })).filter((row) => row.question_label || row.mom_question_id);
}

export function applyStandardMap(questionMap: QuestionMapItem[], standardMap: QuestionStandardMap[] = []) {
  if (!standardMap.length) return questionMap;
  const byLabel = new Map(standardMap.map((item) => [normalizeMapKey(item.question_label), item]));
  const byMomId = new Map(standardMap.filter((item) => item.mom_question_id).map((item) => [item.mom_question_id, item]));
  return questionMap.map((question) => {
    const mapped = byLabel.get(normalizeMapKey(question.question_label || question.question_id)) || byMomId.get(question.myopenmath_question_id || "");
    if (!mapped) return { ...question, teks: "Unmapped", teacher_description: "", skill: "Unmapped Questions", reporting_category: "Unmapped", critical: false };
    const standardCode = mapped.standard_code.trim();
    const teacherDescription = mapped.teacher_description.trim();
    return {
      ...question,
      myopenmath_question_id: mapped.mom_question_id || question.myopenmath_question_id,
      teks: standardCode || "Unmapped",
      breakout_id: mapped.breakout_id,
      teacher_description: teacherDescription,
      skill: mapped.skill_category.trim() || teacherDescription || question.skill,
      zone: mapped.reporting_category || question.zone,
      reporting_category: mapped.reporting_category || question.reporting_category || question.zone,
      evidence_type: mapped.evidence_type || question.evidence_type || "Current",
      critical: Boolean(mapped.critical),
      custom_weight: mapped.custom_weight ?? question.custom_weight ?? 1,
    };
  });
}

export function standardMapToCsvRows(standardMap: QuestionStandardMap[]) {
  return standardMap.map((item) => ({
    question_label: item.question_label,
    mom_question_id: item.mom_question_id,
    standard_code: item.standard_code,
    breakout_id: item.breakout_id,
    teacher_description: item.teacher_description,
    skill_category: item.skill_category,
    reporting_category: item.reporting_category,
    evidence_type: item.evidence_type,
    critical: item.critical ? "Yes" : "No",
    custom_weight: item.custom_weight ?? 1,
  }));
}

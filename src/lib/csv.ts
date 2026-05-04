"use client";

import Papa from "papaparse";
import type { DiagnosticResult, MyOpenMathParseResult, PriorStaarRecord, QuestionMapItem, Reflection, Student } from "./types";

export type ParsedUpload = {
  rows: Record<string, string>[];
  errors: string[];
};

const required = {
  roster: ["student_id", "first_name", "last_name", "class_period"],
  diagnostic: ["student_id", "first_name", "last_name", "class_period"],
  questionMap: ["skill", "teks", "zone", "critical"],
  priorStaar: ["student_id", "prior_staar_year", "prior_staar_test", "prior_scale_score", "prior_performance_level", "prior_growth_level"],
};

export function parseCsvFile(file: File): Promise<ParsedUpload> {
  return new Promise((resolve) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const errors = results.errors.map((error) => error.message);
        resolve({ rows: results.data, errors });
      },
    });
  });
}

export function parseCsvMatrixFile(file: File): Promise<{ rows: string[][]; errors: string[] }> {
  return new Promise((resolve) => {
    Papa.parse<string[]>(file, {
      header: false,
      skipEmptyLines: false,
      complete: (results) => {
        resolve({ rows: results.data, errors: results.errors.map((error) => error.message) });
      },
    });
  });
}

export function parseCsvMatrixString(csv: string): { rows: string[][]; errors: string[] } {
  const results = Papa.parse<string[]>(csv, { header: false, skipEmptyLines: false });
  return { rows: results.data, errors: results.errors.map((error) => error.message) };
}

export function validateColumns(rows: Record<string, string>[], expected: string[], label: string) {
  const headers = Object.keys(rows[0] ?? {});
  return expected.filter((column) => !headers.includes(column)).map((column) => `${label} is missing required column: ${column}`);
}

export function normalizeRoster(rows: Record<string, string>[]): { data: Student[]; errors: string[] } {
  const errors = validateColumns(rows, required.roster, "Roster CSV");
  return {
    errors,
    data: rows.map((row) => ({
      student_id: row.student_id?.trim(),
      first_name: row.first_name?.trim(),
      last_name: row.last_name?.trim(),
      class_period: row.class_period?.trim(),
    })),
  };
}

export function normalizeDiagnostic(rows: Record<string, string>[]): { data: DiagnosticResult[]; errors: string[] } {
  const questionColumns = Object.keys(rows[0] ?? {}).filter((key) => /^Q\d+$/i.test(key));
  const errors = [
    ...validateColumns(rows, required.diagnostic, "Diagnostic CSV"),
    ...(questionColumns.length ? [] : ["Diagnostic CSV must include question columns like Q1, Q2, Q3."]),
  ];
  return {
    errors,
    data: rows.map((row) => ({
      student_id: row.student_id?.trim(),
      first_name: row.first_name?.trim(),
      last_name: row.last_name?.trim(),
      class_period: row.class_period?.trim(),
      answers: Object.fromEntries(questionColumns.map((question) => [question.toUpperCase(), parseScore(row[question])])),
      possiblePoints: Object.fromEntries(questionColumns.map((question) => [question.toUpperCase(), 1])),
      attemptedQuestions: Object.fromEntries(questionColumns.map((question) => [question.toUpperCase(), row[question]?.trim() !== ""])),
      source: "simple",
    })),
  };
}

export function normalizeQuestionMap(rows: Record<string, string>[]): { data: QuestionMapItem[]; errors: string[] } {
  const hasQuestionKey = Object.keys(rows[0] ?? {}).some((key) => ["question_id", "question_label"].includes(key));
  const errors = [...validateColumns(rows, required.questionMap, "Question map CSV"), ...(hasQuestionKey ? [] : ["Question map CSV is missing required column: question_label or question_id"])];
  return {
    errors,
    data: rows.map((row) => ({
      question_id: normalizeQuestionId(row.question_label || row.question_id || ""),
      question_label: (row.question_label || row.question_id || "").trim(),
      myopenmath_question_id: row.myopenmath_question_id?.trim(),
      points_possible: row.points_possible ? Number(row.points_possible) : 1,
      skill: row.skill?.trim(),
      teks: row.teks?.trim(),
      zone: row.zone?.trim(),
      critical: /^(y|yes|true|1)$/i.test(row.critical?.trim() ?? ""),
    })),
  };
}

function parseScore(value: string | undefined) {
  const parsed = Number(String(value ?? "").trim());
  return Number.isFinite(parsed) ? parsed : 0;
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}

function parsePossiblePoints(header: string | undefined) {
  const match = String(header ?? "").match(/\(([\d.]+)\s+possible\)/i);
  const parsed = match ? Number(match[1]) : 1;
  return Number.isFinite(parsed) ? parsed : 1;
}

function splitName(name: string) {
  const trimmed = name.trim();
  if (trimmed.includes(",")) {
    const [last, first] = trimmed.split(",", 2);
    return { first_name: first.trim() || "Student", last_name: last.trim() || "Unknown" };
  }
  const parts = trimmed.split(/\s+/).filter(Boolean);
  return { first_name: parts.slice(0, -1).join(" ") || parts[0] || "Student", last_name: parts.at(-1) || "Unknown" };
}

export function normalizeQuestionId(label: string) {
  return label.trim().replace(/\s+/g, " ");
}

function createUnmappedQuestion(label: string, myopenmathId = "", pointsPossible = 1): QuestionMapItem {
  return {
    question_id: normalizeQuestionId(label),
    question_label: normalizeQuestionId(label),
    myopenmath_question_id: myopenmathId,
    points_possible: pointsPossible,
    skill: "Unmapped Questions",
    teks: "Unmapped",
    zone: "Unmapped Questions",
    critical: false,
  };
}

export function createUnmappedQuestionMap(labels: { question_label: string; myopenmath_question_id?: string; points_possible?: number }[]): QuestionMapItem[] {
  return labels.map((item) => createUnmappedQuestion(item.question_label, item.myopenmath_question_id, item.points_possible));
}

export function mergeQuestionMapWithDetected(map: QuestionMapItem[], detected: { question_label: string; myopenmath_question_id?: string; points_possible?: number }[]) {
  const mapById = new Map(map.map((item) => [normalizeQuestionId(item.question_label || item.question_id), item]));
  return detected.map((question) => {
    const id = normalizeQuestionId(question.question_label);
    const mapped = mapById.get(id);
    return mapped
      ? {
          ...mapped,
          question_id: id,
          question_label: question.question_label,
          myopenmath_question_id: question.myopenmath_question_id || mapped.myopenmath_question_id,
          points_possible: question.points_possible ?? mapped.points_possible ?? 1,
        }
      : createUnmappedQuestion(question.question_label, question.myopenmath_question_id, question.points_possible);
  });
}

export function parseMyOpenMathDetailedRows(rows: string[][]): MyOpenMathParseResult {
  const errors: string[] = [];
  const [groupHeader = [], typeHeader = [], idHeader = [], ...studentRows] = rows;
  if (rows.length < 4) errors.push("MyOpenMath export must include three header rows and at least one student row.");

  const nameIndex = groupHeader.findIndex((cell) => /^name$/i.test(String(cell).trim()));
  const sectionIndex = groupHeader.findIndex((cell) => /^section$/i.test(String(cell).trim()));
  const emailIndex = groupHeader.findIndex((cell) => /^email$/i.test(String(cell).trim()));
  if (nameIndex < 0) errors.push("MyOpenMath export is missing the Name identity column.");
  if (sectionIndex < 0) errors.push("MyOpenMath export is missing the Section identity column.");
  if (emailIndex < 0) errors.push("MyOpenMath export is missing the Email identity column.");

  const detectedQuestions = groupHeader
    .map((label, index) => ({ label: normalizeQuestionId(label), index }))
    .filter(({ label, index }) => /^Question/i.test(label) && /^Points\b/i.test(String(typeHeader[index] ?? "").trim()))
    .map(({ label, index }) => {
      const possible = parsePossiblePoints(typeHeader[index]);
      const timeSpentColumn = groupHeader.findIndex((candidate, candidateIndex) => candidate === label && /^Time Spent$/i.test(String(typeHeader[candidateIndex] ?? "").trim()));
      return {
        question_id: label,
        question_label: label,
        myopenmath_question_id: String(idHeader[index] ?? "").trim(),
        points_possible: possible,
        pointsColumnIndex: index,
        timeSpentColumnIndex: timeSpentColumn >= 0 ? timeSpentColumn : undefined,
      };
    });

  if (!detectedQuestions.length) errors.push("No scored MyOpenMath question columns were detected. Expected columns where row 2 starts with Points.");

  const diagnostics = studentRows
    .filter((row) => row.some((cell) => String(cell ?? "").trim() !== ""))
    .map((row, index) => {
      const studentName = String(row[nameIndex] ?? "").trim();
      const section = String(row[sectionIndex] ?? "").trim() || "Unassigned";
      const email = String(row[emailIndex] ?? "").trim();
      const split = splitName(studentName);
      const answers: Record<string, number> = {};
      const possiblePoints: Record<string, number> = {};
      const attemptedQuestions: Record<string, boolean> = {};
      detectedQuestions.forEach((question) => {
        const raw = String(row[question.pointsColumnIndex] ?? "").trim();
        answers[question.question_id] = parseScore(raw);
        possiblePoints[question.question_id] = question.points_possible;
        attemptedQuestions[question.question_id] = raw !== "";
      });
      const attemptedQuestionCount = Object.values(attemptedQuestions).filter(Boolean).length;
      const totalPointsEarned = Object.entries(answers).reduce((sum, [questionId, score]) => sum + (attemptedQuestions[questionId] ? score : 0), 0);
      const totalPointsPossible = Object.entries(possiblePoints).reduce((sum, [questionId, possible]) => sum + (attemptedQuestions[questionId] ? possible : 0), 0);
      return {
        student_id: `mom-${String(index + 1).padStart(4, "0")}`,
        student_name: studentName,
        first_name: split.first_name,
        last_name: split.last_name,
        email,
        class_period: section,
        answers,
        possiblePoints,
        attemptedQuestions,
        totalPointsEarned,
        totalPointsPossible,
        attemptedQuestionCount,
        incomplete: !section || attemptedQuestionCount === 0,
        source: "myopenmath" as const,
      };
    });

  const previewStudents = diagnostics.map((student) => ({
    student_name: student.student_name || `${student.first_name} ${student.last_name}`,
    section: student.class_period,
    email: student.email || "",
    attemptedQuestionCount: student.attemptedQuestionCount ?? 0,
    totalPointsEarned: round(student.totalPointsEarned ?? 0),
    totalPointsPossible: round(student.totalPointsPossible ?? 0),
    percentScore: student.totalPointsPossible ? round(((student.totalPointsEarned ?? 0) / student.totalPointsPossible) * 100) : 0,
    incomplete: Boolean(student.incomplete),
  }));

  return { diagnostics, detectedQuestions, previewStudents, errors };
}

export function normalizeReflections(rows: Record<string, string>[]): Reflection[] {
  return rows.map((row) => ({
    student_id: row.student_id?.trim(),
    confidence_rating: row.confidence_rating?.trim(),
    goal: row.goal?.trim(),
    concern: row.concern?.trim(),
    preferred_support: row.preferred_support?.trim(),
  }));
}

export function normalizePriorStaar(rows: Record<string, string>[]): { data: PriorStaarRecord[]; errors: string[] } {
  const errors = validateColumns(rows, required.priorStaar, "Prior STAAR CSV");
  return {
    errors,
    data: rows.map((row) => ({
      student_id: row.student_id?.trim(),
      prior_staar_year: row.prior_staar_year?.trim(),
      prior_staar_test: row.prior_staar_test?.trim(),
      prior_scale_score: row.prior_scale_score?.trim(),
      prior_performance_level: row.prior_performance_level?.trim(),
      prior_growth_level: row.prior_growth_level?.trim(),
      notes: row.notes?.trim(),
    })).filter((row) => row.student_id),
  };
}

export function downloadCsv(filename: string, rows: Record<string, string | number | boolean | undefined>[]) {
  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

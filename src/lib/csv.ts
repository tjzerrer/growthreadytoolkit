"use client";

import Papa from "papaparse";
import type { DiagnosticResult, QuestionMapItem, Reflection, Student } from "./types";

export type ParsedUpload = {
  rows: Record<string, string>[];
  errors: string[];
};

const required = {
  roster: ["student_id", "first_name", "last_name", "class_period"],
  diagnostic: ["student_id", "first_name", "last_name", "class_period"],
  questionMap: ["question_id", "skill", "teks", "zone", "critical"],
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
      answers: Object.fromEntries(questionColumns.map((question) => [question.toUpperCase(), Number(row[question]) > 0 ? 1 : 0])),
    })),
  };
}

export function normalizeQuestionMap(rows: Record<string, string>[]): { data: QuestionMapItem[]; errors: string[] } {
  const errors = validateColumns(rows, required.questionMap, "Question map CSV");
  return {
    errors,
    data: rows.map((row) => ({
      question_id: row.question_id?.trim().toUpperCase(),
      skill: row.skill?.trim(),
      teks: row.teks?.trim(),
      zone: row.zone?.trim(),
      critical: /^y|true|1$/i.test(row.critical?.trim() ?? ""),
    })),
  };
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

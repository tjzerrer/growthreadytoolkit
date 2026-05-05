"use client";

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const hasSupabaseConfig = Boolean(url && anonKey);

export const supabase = hasSupabaseConfig
  ? createClient(url as string, anonKey as string)
  : null;

export type DbTeacher = {
  id: string;
  email: string;
  name: string | null;
  school_year: string;
  created_at: string;
};

export type DbClass = {
  id: string;
  teacher_id: string;
  name: string;
  period_label: string;
  term: string | null;
  school_year: string;
  created_at: string;
};

export type DbStudent = {
  id: string;
  teacher_id: string;
  class_id: string | null;
  local_student_id: string | null;
  display_name: string;
  first_name: string | null;
  last_name: string | null;
  active: boolean;
  created_at: string;
};

export type DbAssignment = {
  id: string;
  teacher_id: string;
  name: string;
  source: string;
  assignment_type: "Diagnostic" | "Practice" | "Quiz" | "Test" | "Review" | "Other";
  date_administered: string;
  total_points: number;
  created_at: string;
};

export type DbQuestion = {
  id: string;
  teacher_id: string;
  assignment_id: string;
  mom_question_label: string;
  mom_question_id: string | null;
  points_possible: number;
  created_at: string;
};

export type DbQuestionTag = {
  id: string;
  teacher_id: string;
  question_id: string;
  raw_tag: string | null;
  teks_code: string | null;
  skill_description: string | null;
  standard_type: string | null;
  priority: string | null;
  complexity: string | null;
  reporting_category_id: string | null;
  reporting_category_name: string | null;
  created_at: string;
};

export type DbEvidence = {
  id: string;
  teacher_id: string;
  student_id: string;
  class_id: string | null;
  assignment_id: string;
  question_id: string;
  teks_code: string | null;
  score: number;
  points_possible: number;
  percent: number;
  date_administered: string;
  created_at: string;
};

"use client";

import { createClient } from "./supabase/browser";
import type { Database, Tables } from "./supabase/database.types";

export const supabase = createClient();

export const hasSupabaseConfig = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL
    && (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
);

export type DbProfile = Tables<"profiles">;
export type DbTeacher = DbProfile;
export type DbClass = Tables<"classes">;
export type DbStudent = Tables<"students">;
export type DbAssignment = Tables<"assignments">;
export type DbQuestion = Tables<"questions">;
export type DbQuestionTag = Tables<"question_tags">;
export type DbProblemMapping = Tables<"problem_mappings">;
export type DbEvidence = Tables<"evidence">;
export type DbPriorStaarData = Tables<"prior_staar_data">;
export type { Database };

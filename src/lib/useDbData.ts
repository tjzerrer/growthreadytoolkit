"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { hasSupabaseConfig, supabase, type DbAssignment, type DbClass, type DbEvidence, type DbQuestion, type DbQuestionTag, type DbStudent, type DbTeacher } from "./supabase";
import type { DbSnapshot } from "./dbMastery";

export function useDbData() {
  const [teacher, setTeacher] = useState<DbTeacher | null>(null);
  const [snapshot, setSnapshot] = useState<DbSnapshot>({ classes: [], students: [], assignments: [], questions: [], questionTags: [], evidence: [] });
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");

  const refresh = useCallback(async () => {
    if (!supabase) {
      setReady(true);
      return;
    }
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) {
      setTeacher(null);
      setReady(true);
      return;
    }
    const teacherRow = {
      id: user.id,
      email: user.email || "",
      name: user.user_metadata?.name || user.email || "Teacher",
      school_year: "2026-2027",
    };
    await supabase.from("teachers").upsert(teacherRow, { onConflict: "id" });
    const [teachers, classes, students, assignments, questions, questionTags, evidence] = await Promise.all([
      supabase.from("teachers").select("*").eq("id", user.id).single(),
      supabase.from("classes").select("*").order("period_label"),
      supabase.from("students").select("*").order("display_name"),
      supabase.from("assignments").select("*").order("date_administered", { ascending: false }),
      supabase.from("questions").select("*").order("mom_question_label"),
      supabase.from("question_tags").select("*"),
      supabase.from("evidence").select("*").order("date_administered", { ascending: false }),
    ]);
    setTeacher((teachers.data as DbTeacher) ?? null);
    setSnapshot({
      classes: (classes.data ?? []) as DbClass[],
      students: (students.data ?? []) as DbStudent[],
      assignments: (assignments.data ?? []) as DbAssignment[],
      questions: (questions.data ?? []) as DbQuestion[],
      questionTags: (questionTags.data ?? []) as DbQuestionTag[],
      evidence: (evidence.data ?? []) as DbEvidence[],
    });
    setReady(true);
  }, []);

  useEffect(() => {
    refresh();
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange(() => refresh());
    return () => data.subscription.unsubscribe();
  }, [refresh]);

  const signIn = async (email: string) => {
    if (!supabase) return;
    const result = await supabase.auth.signInWithOtp({ email });
    setMessage(result.error ? result.error.message : "Check your email for a Supabase login link.");
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setTeacher(null);
    setSnapshot({ classes: [], students: [], assignments: [], questions: [], questionTags: [], evidence: [] });
  };

  return useMemo(() => ({ hasSupabaseConfig, supabase, teacher, snapshot, ready, message, signIn, signOut, refresh }), [teacher, snapshot, ready, message, refresh]);
}

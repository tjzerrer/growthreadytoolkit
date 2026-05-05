"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { hasSupabaseConfig, supabase, type DbAssignment, type DbClass, type DbEvidence, type DbQuestion, type DbQuestionTag, type DbStudent, type DbTeacher } from "./supabase";
import type { DbSnapshot } from "./dbMastery";

type SessionUser = {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
};

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
    try {
      const sessionResponse = await fetch("/api/auth/session", { cache: "no-store" });
      const sessionResult = await sessionResponse.json() as { user: SessionUser | null; error?: string };
      const user = sessionResult.user;
      if (!user) {
        setTeacher(null);
        setReady(true);
        if (sessionResult.error && sessionResult.error !== "Auth session missing!") setMessage(sessionResult.error);
        return;
      }
      const profileRow = {
        id: user.id,
        email: user.email || "",
        full_name: String(user.user_metadata?.full_name || user.user_metadata?.name || "") || null,
        school_name: null,
        school_year: "2026-2027",
        created_at: null,
        updated_at: null,
      };
      setTeacher(profileRow);
      setReady(true);
      const profileUpsert = await supabase.from("profiles").upsert(profileRow, { onConflict: "id" });
      const [profiles, classes, students, assignments, questions, questionTags, evidence] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("classes").select("*").order("period_label"),
        supabase.from("students").select("*").order("display_name"),
        supabase.from("assignments").select("*").order("date_administered", { ascending: false }),
        supabase.from("questions").select("*").order("mom_question_label"),
        supabase.from("question_tags").select("*"),
        supabase.from("evidence").select("*").order("date_administered", { ascending: false }),
      ]);
      setTeacher((profiles.data as DbTeacher) ?? profileRow);
      setSnapshot({
        classes: (classes.data ?? []) as DbClass[],
        students: (students.data ?? []) as DbStudent[],
        assignments: (assignments.data ?? []) as DbAssignment[],
        questions: (questions.data ?? []) as DbQuestion[],
        questionTags: (questionTags.data ?? []) as DbQuestionTag[],
        evidence: (evidence.data ?? []) as DbEvidence[],
      });
      const dbErrors = [profileUpsert.error, profiles.error, classes.error, students.error, assignments.error, questions.error, questionTags.error, evidence.error].filter(Boolean);
      setMessage(dbErrors.length ? `Signed in, but database setup needs attention: ${dbErrors[0]?.message}` : "");
    } catch (error) {
      setTeacher(null);
      setMessage(error instanceof Error ? error.message : "Could not connect to Supabase.");
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    refresh();
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange(() => refresh());
    return () => data.subscription.unsubscribe();
  }, [refresh]);

  const signIn = async (email: string) => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setMessage("Enter your email address first.");
      return;
    }
    try {
      const response = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmedEmail,
          redirectTo: `${window.location.origin}/auth/callback`,
        }),
      });
      const result = await response.json() as { error?: string; message?: string };
      setMessage(response.ok ? result.message || "Check your email for a Supabase login link." : result.error || "Could not send login link.");
    } catch (error) {
      setMessage(error instanceof Error ? `Could not reach Supabase Auth: ${error.message}` : "Could not reach Supabase Auth.");
    }
  };

  const signInWithGoogle = async () => {
    window.location.href = "/api/auth/google?next=/upload";
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setTeacher(null);
    setSnapshot({ classes: [], students: [], assignments: [], questions: [], questionTags: [], evidence: [] });
  };

  return useMemo(() => ({ hasSupabaseConfig, supabase, teacher, snapshot, ready, message, signIn, signInWithGoogle, signOut, refresh }), [teacher, snapshot, ready, message, refresh]);
}

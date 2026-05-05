"use client";

import { useState, type ReactNode } from "react";
import { Button, Card } from "./ui";
import { useDbData } from "@/lib/useDbData";

export function AuthGate({ children }: { children: (db: ReturnType<typeof useDbData>) => ReactNode }) {
  const db = useDbData();
  const [email, setEmail] = useState("");

  if (!db.hasSupabaseConfig) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <h2 className="text-xl font-black text-[#174a36]">Supabase setup needed</h2>
        <p className="mt-2 text-[#4d5b52]">Create a Supabase project, run `supabase/schema.sql`, then add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`.</p>
      </Card>
    );
  }

  if (!db.ready) return <Card>Loading secure teacher workspace...</Card>;

  if (!db.teacher) {
    return (
      <Card>
        <h2 className="text-xl font-black text-[#174a36]">Teacher sign in</h2>
        <p className="mt-2 text-[#4d5b52]">Student evidence is stored under your authenticated teacher account.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <input className="min-w-72 rounded-2xl border border-[#d6cdbb] bg-white p-3" placeholder="teacher@email.com" value={email} onChange={(event) => setEmail(event.target.value)} />
          <Button onClick={() => db.signIn(email)}>Send login link</Button>
        </div>
        {db.message ? <p className="mt-3 text-sm font-semibold text-[#174a36]">{db.message}</p> : null}
      </Card>
    );
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#d6cdbb] bg-white/70 p-3 text-sm text-[#4d5b52]">
        <span>Signed in as <strong>{db.teacher.email}</strong></span>
        <button className="font-black text-[#174a36] underline" onClick={db.signOut}>Sign out</button>
      </div>
      {children(db)}
    </>
  );
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function authErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const cause = error instanceof Error && "cause" in error ? error.cause : undefined;
  const causeMessage = cause instanceof Error ? cause.message : "";
  const combined = [message, causeMessage].filter(Boolean).join(" ");

  if (/getaddrinfo|ENOTFOUND|could not be resolved|fetch failed/i.test(combined)) {
    return "Could not reach Supabase Auth. Check your internet/DNS connection and confirm NEXT_PUBLIC_SUPABASE_URL points to an active Supabase project.";
  }

  return `Could not reach Supabase Auth: ${message}`;
}

export async function POST(request: Request) {
  try {
    const { email, redirectTo } = await request.json() as { email?: string; redirectTo?: string };
    const trimmedEmail = email?.trim();

    if (!trimmedEmail) {
      return NextResponse.json({ error: "Enter your email address first." }, { status: 400 });
    }

    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase environment variables are missing." }, { status: 500 });
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: trimmedEmail,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Check your email for a Supabase login link." });
  } catch (error) {
    return NextResponse.json({
      error: authErrorMessage(error),
    }, { status: 502 });
  }
}

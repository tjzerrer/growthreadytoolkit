import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ user: null, error: "Supabase environment variables are missing." }, { status: 500 });
  }

  const { data, error } = await supabase.auth.getUser();
  if (error) {
    return NextResponse.json({ user: null, error: error.message }, { status: 401 });
  }

  return NextResponse.json({
    user: data.user
      ? {
          id: data.user.id,
          email: data.user.email,
          user_metadata: data.user.user_metadata,
        }
      : null,
  });
}

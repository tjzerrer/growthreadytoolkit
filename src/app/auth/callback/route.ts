import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/upload";
  const redirectUrl = new URL(next.startsWith("/") ? next : "/upload", requestUrl.origin);
  let response = NextResponse.redirect(redirectUrl);

  if (!code) {
    redirectUrl.searchParams.set("auth_error", "missing_code");
    return NextResponse.redirect(redirectUrl);
  }

  if (!supabaseUrl || !supabaseKey) {
    redirectUrl.searchParams.set("auth_error", "missing_config");
    return NextResponse.redirect(redirectUrl);
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.redirect(redirectUrl);
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    redirectUrl.searchParams.set("auth_error", error.message);
    response = NextResponse.redirect(redirectUrl);
  }

  return response;
}

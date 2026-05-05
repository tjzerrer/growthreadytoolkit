import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
type CookieToSet = {
  name: string;
  value: string;
  options?: Parameters<NextResponse["cookies"]["set"]>[2];
};

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url);
    const redirectTo = `${requestUrl.origin}/auth/callback`;
    let cookiesToApply: CookieToSet[] = [];

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Supabase environment variables are missing." }, { status: 500 });
    }

    const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          cookiesToApply = cookiesToSet;
        },
      },
    });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });

    if (error) {
      const errorUrl = new URL("/upload", requestUrl.origin);
      errorUrl.searchParams.set("auth_error", error.message);
      return NextResponse.redirect(errorUrl);
    }

    const response = NextResponse.redirect(data.url);
    cookiesToApply.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
    return response;
  } catch (error) {
    const errorUrl = new URL("/upload", request.url);
    errorUrl.searchParams.set("auth_error", error instanceof Error ? error.message : "Could not start Google sign-in.");
    return NextResponse.redirect(errorUrl);
  }
}

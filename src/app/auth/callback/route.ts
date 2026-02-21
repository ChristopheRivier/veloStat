import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const ALLOWED_REDIRECT_PATHS = ["/", "/stats", "/dashboard", "/bikes", "/login"];

function getSafeRedirectPath(next: string | null): string {
  const path = next?.trim() ?? "/stats";
  if (!path.startsWith("/") || path.startsWith("//")) return "/stats";
  const normalized = path === "/" ? path : path.replace(/\/+$/, "") || "/";
  const allowed = ALLOWED_REDIRECT_PATHS.some(
    (p) => normalized === p || (p !== "/" && normalized.startsWith(p + "/"))
  );
  return allowed ? normalized : "/stats";
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = getSafeRedirectPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}

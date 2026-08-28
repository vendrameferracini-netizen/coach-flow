import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { getDashboardPathByRole, isUserRole } from "@/lib/auth/redirects";
import { isDemoModeEnabled } from "@/lib/config/demo";
import type { Database } from "@/types/database";

const authRoutes = ["/login", "/forgot-password", "/update-password"];
const protectedPrefixes = ["/dashboard", "/alunos", "/treinos", "/dietas", "/avaliacoes", "/protocolos", "/recados", "/alertas", "/perfil", "/admin"];

type CookieToSet = {
  name: string;
  value: string;
  options?: CookieOptions;
};

type ProfileAccessRow = {
  role: string;
  status: string;
};

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const demoEnabled = isDemoModeEnabled();

  if (!url || !anonKey) {
    if (demoEnabled) return response;

    const pathname = request.nextUrl.pathname;
    const isProtectedRoute = protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
    if (!isProtectedRoute) return response;

    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  });

  const pathname = request.nextUrl.pathname;
  const isAuthRoute = authRoutes.includes(pathname);
  const isProtectedRoute = protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  const { data: userResult } = await supabase.auth.getUser();
  const user = userResult.user;

  function redirectTo(path: string) {
    const redirectUrl = request.nextUrl.clone();
    const [targetPath, targetSearch] = path.split("?");
    redirectUrl.pathname = targetPath;
    redirectUrl.search = targetSearch ? `?${targetSearch}` : "";
    if (targetPath === "/login" && isProtectedRoute) redirectUrl.searchParams.set("next", pathname);
    if (targetPath !== "/login") redirectUrl.search = "";

    const redirectResponse = NextResponse.redirect(redirectUrl);
    response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
    return redirectResponse;
  }

  if (!user && isProtectedRoute) return redirectTo("/login");
  if (!user) return response;

  const profileResult = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .maybeSingle() as { data: ProfileAccessRow | null; error: Error | null };

  const profile = profileResult.data;

  if (isProtectedRoute && (!profile || !isUserRole(profile.role) || profile.status !== "active")) {
    await supabase.auth.signOut();
    return redirectTo("/login?error=profile_not_linked");
  }

  if (profile && isUserRole(profile.role) && isAuthRoute) {
    return redirectTo(getDashboardPathByRole(profile.role));
  }

  if (pathname.startsWith("/admin") && (!profile || profile.role !== "super_admin")) {
    return redirectTo("/dashboard");
  }

  return response;
}

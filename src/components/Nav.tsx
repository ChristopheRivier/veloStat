"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isApp =
    pathname === "/dashboard" || pathname === "/stats" || pathname === "/bikes";

  return (
    <nav className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="container mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-semibold text-slate-800">
          Vélo Stats
        </Link>
        <div className="flex items-center gap-4">
          {isApp && (
            <>
              <Link
                href="/dashboard"
                className={`text-sm ${pathname === "/dashboard" ? "font-medium text-slate-900" : "text-slate-600 hover:text-slate-900"}`}
              >
                Trajets
              </Link>
              <Link
                href="/bikes"
                className={`text-sm ${pathname === "/bikes" ? "font-medium text-slate-900" : "text-slate-600 hover:text-slate-900"}`}
              >
                Vélos
              </Link>
              <Link
                href="/stats"
                className={`text-sm ${pathname === "/stats" ? "font-medium text-slate-900" : "text-slate-600 hover:text-slate-900"}`}
              >
                Statistiques
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="text-sm text-slate-600 hover:text-slate-900"
              >
                Déconnexion
              </button>
            </>
          )}
          {(isAuthPage || pathname === "/") && (
            <Link
              href={pathname === "/login" ? "/signup" : "/login"}
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              {pathname === "/login" ? "Créer un compte" : "Connexion"}
            </Link>
          )}
        </div>
  </div>
    </nav>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [accountOpen, setAccountOpen] = useState(false);
  const [ajoutOpen, setAjoutOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const ajoutRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setAccountOpen(false);
      }
      if (ajoutRef.current && !ajoutRef.current.contains(event.target as Node)) {
        setAjoutOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isApp =
    pathname === "/dashboard" ||
    pathname === "/stats" ||
    pathname === "/bikes" ||
    pathname === "/profile";

  const isAjout = pathname === "/dashboard" || pathname === "/bikes";

  return (
    <nav className="border-b border-cyan-200/60 bg-cyan-100/90 backdrop-blur">
      <div className="container mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-semibold text-slate-800">
          Vélo Stats
        </Link>
        <div className="flex items-center gap-4">
          {isApp && (
            <>
              <Link
                href="/stats"
                className={`text-sm ${pathname === "/stats" ? "font-medium text-slate-900" : "text-slate-600 hover:text-slate-900"}`}
              >
                Home
              </Link>
              <div className="relative" ref={ajoutRef}>
                <button
                  type="button"
                  onClick={() => setAjoutOpen(!ajoutOpen)}
                  className={`flex items-center gap-1 text-sm ${isAjout ? "font-medium text-slate-900" : "text-slate-600 hover:text-slate-900"}`}
                >
                  Ajout
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-3 w-3 transition-transform ${ajoutOpen ? "rotate-180" : ""}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {ajoutOpen && (
                  <div className="absolute left-0 mt-2 w-36 rounded-lg border border-slate-200 bg-white/50 py-1 shadow-md backdrop-blur">
                    <Link
                      href="/dashboard"
                      onClick={() => setAjoutOpen(false)}
                      className={`flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50 ${pathname === "/dashboard" ? "font-bold text-slate-900" : "text-slate-700"}`}
                    >
                      Trajets
                    </Link>
                    <Link
                      href="/bikes"
                      onClick={() => setAjoutOpen(false)}
                      className={`flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50 ${pathname === "/bikes" ? "font-bold text-slate-900" : "text-slate-700"}`}
                    >
                      Vélos
                    </Link>
                  </div>
                )}
              </div>
              <div className="relative" ref={accountRef}>
                <button
                  type="button"
                  onClick={() => setAccountOpen(!accountOpen)}
                  className={`flex items-center gap-1 text-sm ${pathname === "/profile" ? "font-medium text-slate-900" : "text-slate-600 hover:text-slate-900"}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                  </svg>
                  Compte
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-3 w-3 transition-transform ${accountOpen ? "rotate-180" : ""}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {accountOpen && (
                  <div className="absolute right-0 mt-2 w-44 rounded-lg border border-slate-200 bg-white/50 py-1 shadow-md backdrop-blur">
                    <Link
                      href="/profile"
                      onClick={() => setAccountOpen(false)}
                      className={`flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50 ${pathname === "/profile" ? "font-bold text-slate-900" : "text-slate-700"}`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-slate-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                      </svg>
                      Profil
                    </Link>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-slate-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
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

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-16 text-center">
      <h1 className="text-3xl font-bold text-slate-800">
        Suivez vos trajets à vélo
      </h1>
      <p className="max-w-md text-slate-600">
        Enregistrez vos sorties, consultez vos statistiques de distance et
        suivez votre progression.
      </p>
      <div className="flex gap-4">
        <Link
          href="/signup"
          className="rounded-lg bg-slate-800 px-6 py-3 font-medium text-white hover:bg-slate-700"
        >
          Créer un compte
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-slate-300 px-6 py-3 font-medium text-slate-700 hover:bg-slate-50"
        >
          Se connecter
        </Link>
      </div>
    </div>
  );
}

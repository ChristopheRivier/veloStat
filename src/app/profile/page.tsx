import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const createdAt = new Date(user.created_at).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Mon profil</h1>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-slate-800">
          Informations du compte
        </h2>
        <dl className="space-y-3">
          <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-4">
            <dt className="w-40 shrink-0 text-sm font-medium text-slate-500">
              Email
            </dt>
            <dd className="text-sm text-slate-800">{user.email}</dd>
          </div>
          <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-4">
            <dt className="w-40 shrink-0 text-sm font-medium text-slate-500">
              Membre depuis
            </dt>
            <dd className="text-sm capitalize text-slate-800">{createdAt}</dd>
          </div>
          <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-4">
            <dt className="w-40 shrink-0 text-sm font-medium text-slate-500">
              Identifiant
            </dt>
            <dd className="font-mono text-xs text-slate-500">{user.id}</dd>
          </div>
        </dl>
      </div>

      <ChangePasswordForm />
    </div>
  );
}

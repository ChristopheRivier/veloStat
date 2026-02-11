import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BikeList } from "@/components/BikeList";
import { AddBikeForm } from "@/components/AddBikeForm";

export default async function BikesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: bikes } = await supabase
    .from("bikes")
    .select("*")
    .order("acquisition_date", { ascending: false });

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-800">Mes vélos</h1>
      <AddBikeForm userId={user.id} />
      <BikeList bikes={bikes ?? []} />
    </div>
  );
}

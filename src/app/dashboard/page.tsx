import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { RideList } from "@/components/RideList";
import { AddRideForm } from "@/components/AddRideForm";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: rides } = await supabase
    .from("rides")
    .select("*, bike:bikes(id, name, brand)")
    .order("date", { ascending: false });

  const { data: bikes } = await supabase
    .from("bikes")
    .select("id, name, brand")
    .is("sale_date", null)
    .order("name");

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-800">Mes trajets</h1>
      <AddRideForm userId={user.id} bikes={bikes ?? []} />
      <RideList initialRides={rides ?? []} bikes={bikes ?? []} />
    </div>
  );
}

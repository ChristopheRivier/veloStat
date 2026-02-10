import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function StatsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: rides } = await supabase
    .from("rides")
    .select("date, distance_km, duration_minutes")
    .order("date", { ascending: false });

  const totalKm =
    rides?.reduce((acc, r) => acc + Number(r.distance_km), 0) ?? 0;
  const totalRides = rides?.length ?? 0;
  const totalMinutes =
    rides?.reduce(
      (acc, r) => acc + (r.duration_minutes ?? 0),
      0
    ) ?? 0;

  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const monthKm =
    rides?.filter((r) => {
      const d = new Date(r.date);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).reduce((acc, r) => acc + Number(r.distance_km), 0) ?? 0;

  const byMonth = (rides ?? []).reduce<Record<string, number>>((acc, r) => {
    const d = new Date(r.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    acc[key] = (acc[key] ?? 0) + Number(r.distance_km);
    return acc;
  }, {});
  const sortedMonths = Object.entries(byMonth).sort(([a], [b]) =>
    b.localeCompare(a)
  ).slice(0, 6);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-800">Statistiques</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Distance totale</p>
          <p className="text-2xl font-bold text-slate-800">
            {totalKm.toFixed(1)} km
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Nombre de trajets</p>
          <p className="text-2xl font-bold text-slate-800">{totalRides}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Ce mois</p>
          <p className="text-2xl font-bold text-slate-800">
            {monthKm.toFixed(1)} km
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Temps total</p>
          <p className="text-2xl font-bold text-slate-800">
            {totalMinutes >= 60
              ? `${Math.floor(totalMinutes / 60)} h ${totalMinutes % 60} min`
              : `${totalMinutes} min`}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">
          Distance par mois
        </h2>
        <ul className="space-y-2">
          {sortedMonths.map(([month, km]) => {
            const [y, m] = month.split("-");
            const label = new Date(
              parseInt(y, 10),
              parseInt(m, 10) - 1
            ).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
            return (
              <li
                key={month}
                className="flex items-center justify-between text-slate-700"
              >
                <span className="capitalize">{label}</span>
                <span className="font-medium">{km.toFixed(1)} km</span>
              </li>
            );
          })}
        </ul>
        {sortedMonths.length === 0 && (
          <p className="text-slate-500">Aucune donnée pour l’instant.</p>
        )}
      </div>
    </div>
  );
}

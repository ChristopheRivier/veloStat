import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { StatsBikeFilter } from "@/components/StatsBikeFilter";

type Props = { searchParams?: Promise<{ bike?: string }> | { bike?: string } };

export default async function StatsPage({ searchParams }: Props) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const resolved = searchParams ? await Promise.resolve(searchParams) : {};
  const bikeId = typeof resolved.bike === "string" ? resolved.bike : undefined;

  const [{ data: bikes }, { data: rides }] = await Promise.all([
    supabase.from("bikes").select("id, name").order("name"),
    supabase
      .from("rides")
      .select("date, distance_km, duration_minutes, bike_id")
      .order("date", { ascending: false }),
  ]);

  const filteredRides =
    bikeId && rides
      ? rides.filter((r) => r.bike_id === bikeId)
      : rides ?? [];

  const totalKm =
    filteredRides.reduce((acc, r) => acc + Number(r.distance_km), 0);
  const totalRides = filteredRides.length;
  const totalMinutes = filteredRides.reduce(
    (acc, r) => acc + (r.duration_minutes ?? 0),
    0
  );

  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const monthKm = filteredRides
    .filter((r) => {
      const d = new Date(r.date);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    })
    .reduce((acc, r) => acc + Number(r.distance_km), 0);

  type YearStats = {
    km: number;
    rides: number;
    minutes: number;
    byMonth: Record<string, number>;
  };
  const byYear = filteredRides.reduce<Record<number, YearStats>>((acc, r) => {
    const d = new Date(r.date);
    const year = d.getFullYear();
    const monthKey = String(d.getMonth() + 1).padStart(2, "0");
    if (!acc[year]) {
      acc[year] = { km: 0, rides: 0, minutes: 0, byMonth: {} };
    }
    acc[year].km += Number(r.distance_km);
    acc[year].rides += 1;
    acc[year].minutes += r.duration_minutes ?? 0;
    acc[year].byMonth[monthKey] =
      (acc[year].byMonth[monthKey] ?? 0) + Number(r.distance_km);
    return acc;
  }, {});
  const sortedYears = Object.keys(byYear)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Statistiques</h1>
        <Suspense fallback={<span className="text-sm text-slate-500">Vélo : …</span>}>
          <StatsBikeFilter bikes={bikes ?? []} />
        </Suspense>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Distance totale</p>
          <p className="text-2xl font-bold text-slate-800">
            {totalKm.toFixed(0)} km
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Ce mois</p>
          <p className="text-2xl font-bold text-slate-800">
            {monthKm.toFixed(0)} km
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-slate-800">
          Par année
        </h2>
        {sortedYears.length === 0 ? (
          <p className="text-slate-500">Aucune donnée pour l’instant.</p>
        ) : (
          sortedYears.map((year) => {
            const stats = byYear[year];
            const sortedMonths = Object.entries(stats.byMonth).sort(
              ([a], [b]) => b.localeCompare(a)
            );
            return (
              <div
                key={year}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="-mx-5 -mt-5 mb-4 flex flex-wrap items-baseline justify-between gap-2 rounded-t-xl border-b border-slate-100 bg-cyan-100/40 px-5 pb-3 pt-5">
                  <h3 className="text-xl font-semibold text-slate-800">
                    {year}
                  </h3>
                  <div className="flex gap-4 text-sm text-slate-600">
                    <span>{stats.km.toFixed(0)} km</span>
                    <span>{stats.rides} trajets</span>
                    <span>
                      {stats.minutes >= 60
                        ? `${Math.floor(stats.minutes / 60)} h ${stats.minutes % 60} min`
                        : `${stats.minutes} min`}
                    </span>
                  </div>
                </div>
                <ul className="space-y-2">
                  {sortedMonths.map(([month, km]) => {
                    const label = new Date(
                      year,
                      parseInt(month, 10) - 1
                    ).toLocaleDateString("fr-FR", { month: "long" });
                    return (
                      <li
                        key={month}
                        className="flex items-center justify-between text-slate-700"
                      >
                        <span className="capitalize">{label}</span>
                        <span className="font-medium">{km.toFixed(0)} km</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

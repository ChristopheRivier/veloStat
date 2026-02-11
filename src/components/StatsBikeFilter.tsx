"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Bike = { id: string; name: string };

export function StatsBikeFilter({ bikes }: { bikes: Bike[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentBikeId = searchParams.get("bike") ?? "";

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const url = value ? `/stats?bike=${encodeURIComponent(value)}` : "/stats";
    router.push(url);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label htmlFor="stats-bike-filter" className="text-sm font-medium text-slate-600">
        Vélo :
      </label>
      <select
        id="stats-bike-filter"
        value={currentBikeId}
        onChange={handleChange}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
      >
        <option value="">Tous les vélos</option>
        {bikes.map((bike) => (
          <option key={bike.id} value={bike.id}>
            {bike.name}
          </option>
        ))}
      </select>
    </div>
  );
}

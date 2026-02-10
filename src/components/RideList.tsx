"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Ride } from "@/types/ride";

type Props = { initialRides: Ride[] };

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function RideList({ initialRides }: Props) {
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce trajet ?")) return;
    const supabase = createClient();
    await supabase.from("rides").delete().eq("id", id);
    router.refresh();
  };

  if (initialRides.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 py-8 text-center text-slate-600">
        Aucun trajet pour l’instant. Ajoutez-en un ci-dessus.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {initialRides.map((ride) => (
        <li
          key={ride.id}
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3"
        >
          <div>
            <span className="font-medium text-slate-800">
              {formatDate(ride.date)}
            </span>
            <span className="ml-2 text-slate-600">
              {Number(ride.distance_km)} km
              {ride.duration_minutes != null &&
                ` · ${ride.duration_minutes} min`}
            </span>
            {ride.note && (
              <p className="mt-0.5 text-sm text-slate-500">{ride.note}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => handleDelete(ride.id)}
            className="text-sm text-slate-500 hover:text-red-600"
          >
            Supprimer
          </button>
        </li>
      ))}
    </ul>
  );
}

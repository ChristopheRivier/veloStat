"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Bike } from "@/types/bike";

type Props = { bikes: Bike[] };

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function BikeList({ bikes }: Props) {
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce vélo ? Les trajets associés ne seront pas supprimés."))
      return;
    const supabase = createClient();
    await supabase.from("bikes").delete().eq("id", id);
    router.refresh();
  };

  if (bikes.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 py-8 text-center text-slate-600">
        Aucun vélo. Ajoutez-en un ci-dessus.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {bikes.map((bike) => (
        <li
          key={bike.id}
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3"
        >
          <div>
            <span className="font-medium text-slate-800">{bike.name}</span>
            <span className="ml-2 text-slate-600">{bike.brand}</span>
            <p className="mt-0.5 text-sm text-slate-500">
              Acquis le {formatDate(bike.acquisition_date)}
              {bike.sale_date && ` · Vendu le ${formatDate(bike.sale_date)}`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleDelete(bike.id)}
            className="text-sm text-slate-500 hover:text-red-600"
          >
            Supprimer
          </button>
        </li>
      ))}
    </ul>
  );
}

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Ride } from "@/types/ride";

const PAGE_SIZE = 20;

type BikeOption = { id: string; name: string; brand: string };
type Props = { initialRides: Ride[]; bikes: BikeOption[] };

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function RideList({ initialRides, bikes }: Props) {
  const router = useRouter();
  const [rides, setRides] = useState<Ride[]>(initialRides);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(initialRides.length === PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRides(initialRides);
    setPage(0);
    setHasMore(initialRides.length === PAGE_SIZE);
  }, [initialRides]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const supabase = createClient();
    const { data } = await supabase
      .from("rides")
      .select("*, bike:bikes(id, name, brand)")
      .order("date", { ascending: false })
      .range(nextPage * PAGE_SIZE, (nextPage + 1) * PAGE_SIZE - 1);
    if (data) {
      setRides((prev) => [...prev, ...(data as Ride[])]);
      setPage(nextPage);
      setHasMore(data.length === PAGE_SIZE);
    }
    setLoadingMore(false);
  }, [loadingMore, hasMore, page]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce trajet ?")) return;
    const supabase = createClient();
    await supabase.from("rides").delete().eq("id", id);
    router.refresh();
  };

  const handleEdit = (id: string) => {
    setEditingId((prev) => (prev === id ? null : id));
  };

  if (rides.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 py-8 text-center text-slate-600">
        Aucun trajet pour l'instant. Ajoutez-en un ci-dessus.
      </p>
    );
  }

  return (
    <>
      <ul className="space-y-2">
        {rides.map((ride) => (
          <li
            key={ride.id}
            className="rounded-lg border border-slate-200 bg-white px-4 py-3"
          >
            {editingId === ride.id ? (
              <EditRideForm
                ride={ride}
                bikes={bikes}
                onSuccess={() => {
                  setEditingId(null);
                  router.refresh();
                }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-medium text-slate-800">
                    {formatDate(ride.date)}
                  </span>
                  <span className="ml-2 text-slate-600">
                    {Number(ride.distance_km)} km
                    {ride.duration_minutes != null &&
                      ` · ${ride.duration_minutes} min`}
                    {ride.bike && (
                      <span className="ml-1 text-slate-500">
                        · {ride.bike.name}
                      </span>
                    )}
                  </span>
                  {ride.note && (
                    <p className="mt-0.5 text-sm text-slate-500">{ride.note}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(ride.id)}
                    className="text-sm text-slate-500 hover:text-slate-800"
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(ride.id)}
                    className="text-sm text-slate-500 hover:text-red-600"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
      <div ref={sentinelRef} className="py-2 text-center">
        {loadingMore && (
          <span className="text-sm text-slate-400">Chargement…</span>
        )}
      </div>
    </>
  );
}

type EditRideFormProps = {
  ride: Ride;
  bikes: BikeOption[];
  onSuccess: () => void;
  onCancel: () => void;
};

function EditRideForm({
  ride,
  bikes,
  onSuccess,
  onCancel,
}: EditRideFormProps) {
  const [date, setDate] = useState(ride.date);
  const [bikeId, setBikeId] = useState(ride.bike_id ?? "");
  const [distanceKm, setDistanceKm] = useState(String(ride.distance_km));
  const [durationMinutes, setDurationMinutes] = useState(
    ride.duration_minutes != null ? String(ride.duration_minutes) : ""
  );
  const [note, setNote] = useState(ride.note ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const dist = parseFloat(distanceKm.replace(",", "."));
    if (Number.isNaN(dist) || dist < 0) {
      setError("Distance invalide");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase
      .from("rides")
      .update({
        date,
        bike_id: bikeId || null,
        distance_km: dist,
        duration_minutes: durationMinutes
          ? parseInt(durationMinutes, 10)
          : null,
        note: note || null,
      })
      .eq("id", ride.id);
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h3 className="text-sm font-medium text-slate-700">Modifier le trajet</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label
            htmlFor={`edit-date-${ride.id}`}
            className="mb-0.5 block text-xs font-medium text-slate-600"
          >
            Date
          </label>
          <input
            id={`edit-date-${ride.id}`}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-900"
          />
        </div>
        <div className="sm:col-span-2">
          <label
            htmlFor={`edit-bike-${ride.id}`}
            className="mb-0.5 block text-xs font-medium text-slate-600"
          >
            Vélo (optionnel)
          </label>
          <select
            id={`edit-bike-${ride.id}`}
            value={bikeId}
            onChange={(e) => setBikeId(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-900"
          >
            <option value="">Aucun</option>
            {bikes.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.brand})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor={`edit-distance-${ride.id}`}
            className="mb-0.5 block text-xs font-medium text-slate-600"
          >
            Distance (km)
          </label>
          <input
            id={`edit-distance-${ride.id}`}
            type="text"
            inputMode="decimal"
            value={distanceKm}
            onChange={(e) => setDistanceKm(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-900"
          />
        </div>
        <div>
          <label
            htmlFor={`edit-duration-${ride.id}`}
            className="mb-0.5 block text-xs font-medium text-slate-600"
          >
            Durée (min, optionnel)
          </label>
          <input
            id={`edit-duration-${ride.id}`}
            type="number"
            min="0"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-900"
          />
        </div>
        <div className="sm:col-span-2">
          <label
            htmlFor={`edit-note-${ride.id}`}
            className="mb-0.5 block text-xs font-medium text-slate-600"
          >
            Note (optionnel)
          </label>
          <input
            id={`edit-note-${ride.id}`}
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-900"
          />
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-slate-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {loading ? "Enregistrement…" : "Enregistrer"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}

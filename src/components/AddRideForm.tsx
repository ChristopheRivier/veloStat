"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type BikeOption = { id: string; name: string; brand: string };
type Props = { userId: string; bikes: BikeOption[] };

export function AddRideForm({ userId, bikes }: Props) {
  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [bikeId, setBikeId] = useState("");
  const [distanceKm, setDistanceKm] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
    const { error: err } = await supabase.from("rides").insert({
      user_id: userId,
      bike_id: bikeId || null,
      date: date,
      distance_km: dist,
      duration_minutes: durationMinutes ? parseInt(durationMinutes, 10) : null,
      note: note || null,
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setDistanceKm("");
    setDurationMinutes("");
    setNote("");
    router.refresh();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <h2 className="mb-4 text-lg font-semibold text-slate-800">
        Ajouter un trajet
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="date"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Date
          </label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
          />
        </div>
        <div className="sm:col-span-2">
          <label
            htmlFor="bike"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Vélo (optionnel)
          </label>
          <select
            id="bike"
            value={bikeId}
            onChange={(e) => setBikeId(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
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
            htmlFor="distance"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Distance (km)
          </label>
          <input
            id="distance"
            type="text"
            inputMode="decimal"
            placeholder="ex. 25.5"
            value={distanceKm}
            onChange={(e) => setDistanceKm(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
          />
        </div>
        <div>
          <label
            htmlFor="duration"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Durée (minutes, optionnel)
          </label>
          <input
            id="duration"
            type="number"
            min="0"
            placeholder="ex. 90"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
          />
        </div>
        <div className="sm:col-span-2">
          <label
            htmlFor="note"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Note (optionnel)
          </label>
          <input
            id="note"
            type="text"
            placeholder="ex. Sortie matinale"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
          />
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="mt-4 rounded-lg bg-slate-800 px-4 py-2 font-medium text-white hover:bg-slate-700 disabled:opacity-50"
      >
        {loading ? "Enregistrement…" : "Enregistrer le trajet"}
      </button>
    </form>
  );
}

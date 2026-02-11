"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = { userId: string };

export function AddBikeForm({ userId }: Props) {
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [acquisitionDate, setAcquisitionDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [saleDate, setSaleDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Le nom est requis");
      return;
    }
    if (!brand.trim()) {
      setError("La marque est requise");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.from("bikes").insert({
      user_id: userId,
      name: name.trim(),
      brand: brand.trim(),
      acquisition_date: acquisitionDate,
      sale_date: saleDate || null,
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setName("");
    setBrand("");
    setAcquisitionDate(new Date().toISOString().slice(0, 10));
    setSaleDate("");
    router.refresh();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <h2 className="mb-4 text-lg font-semibold text-slate-800">
        Ajouter un vélo
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="bike-name"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Nom
          </label>
          <input
            id="bike-name"
            type="text"
            placeholder="ex. VTT principal"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
          />
        </div>
        <div>
          <label
            htmlFor="bike-brand"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Marque
          </label>
          <input
            id="bike-brand"
            type="text"
            placeholder="ex. Trek, Canyon"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
          />
        </div>
        <div>
          <label
            htmlFor="acquisition-date"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Date d&apos;acquisition
          </label>
          <input
            id="acquisition-date"
            type="date"
            value={acquisitionDate}
            onChange={(e) => setAcquisitionDate(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
          />
        </div>
        <div>
          <label
            htmlFor="sale-date"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Date de vente (optionnel)
          </label>
          <input
            id="sale-date"
            type="date"
            value={saleDate}
            onChange={(e) => setSaleDate(e.target.value)}
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
        {loading ? "Enregistrement…" : "Enregistrer le vélo"}
      </button>
    </form>
  );
}

"use client";

import { useState } from "react";
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
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Supprimer ce vélo ? Les trajets associés ne seront pas supprimés."
      )
    )
      return;
    const supabase = createClient();
    await supabase.from("bikes").delete().eq("id", id);
    router.refresh();
  };

  const handleEdit = (id: string) => {
    setEditingId((prev) => (prev === id ? null : id));
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
          className="rounded-lg border border-slate-200 bg-white px-4 py-3"
        >
          {editingId === bike.id ? (
            <EditBikeForm
              bike={bike}
              onSuccess={() => {
                setEditingId(null);
                router.refresh();
              }}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-medium text-slate-800">{bike.name}</span>
                <span className="ml-2 text-slate-600">{bike.brand}</span>
                <p className="mt-0.5 text-sm text-slate-500">
                  Acquis le {formatDate(bike.acquisition_date)}
                  {bike.sale_date &&
                    ` · Vendu le ${formatDate(bike.sale_date)}`}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleEdit(bike.id)}
                  className="text-sm text-slate-500 hover:text-slate-800"
                >
                  Modifier
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(bike.id)}
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
  );
}

type EditBikeFormProps = {
  bike: Bike;
  onSuccess: () => void;
  onCancel: () => void;
};

function EditBikeForm({
  bike,
  onSuccess,
  onCancel,
}: EditBikeFormProps) {
  const [name, setName] = useState(bike.name);
  const [brand, setBrand] = useState(bike.brand);
  const [acquisitionDate, setAcquisitionDate] = useState(
    bike.acquisition_date
  );
  const [saleDate, setSaleDate] = useState(bike.sale_date ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    const { error: err } = await supabase
      .from("bikes")
      .update({
        name: name.trim(),
        brand: brand.trim(),
        acquisition_date: acquisitionDate,
        sale_date: saleDate || null,
      })
      .eq("id", bike.id);
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h3 className="text-sm font-medium text-slate-700">Modifier le vélo</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label
            htmlFor={`edit-bike-name-${bike.id}`}
            className="mb-0.5 block text-xs font-medium text-slate-600"
          >
            Nom
          </label>
          <input
            id={`edit-bike-name-${bike.id}`}
            type="text"
            placeholder="ex. VTT principal"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-900"
          />
        </div>
        <div>
          <label
            htmlFor={`edit-bike-brand-${bike.id}`}
            className="mb-0.5 block text-xs font-medium text-slate-600"
          >
            Marque
          </label>
          <input
            id={`edit-bike-brand-${bike.id}`}
            type="text"
            placeholder="ex. Trek, Canyon"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-900"
          />
        </div>
        <div>
          <label
            htmlFor={`edit-acquisition-${bike.id}`}
            className="mb-0.5 block text-xs font-medium text-slate-600"
          >
            Date d&apos;acquisition
          </label>
          <input
            id={`edit-acquisition-${bike.id}`}
            type="date"
            value={acquisitionDate}
            onChange={(e) => setAcquisitionDate(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-900"
          />
        </div>
        <div>
          <label
            htmlFor={`edit-sale-${bike.id}`}
            className="mb-0.5 block text-xs font-medium text-slate-600"
          >
            Date de vente (optionnel)
          </label>
          <input
            id={`edit-sale-${bike.id}`}
            type="date"
            value={saleDate}
            onChange={(e) => setSaleDate(e.target.value)}
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

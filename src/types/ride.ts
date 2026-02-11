export type Ride = {
  id: string;
  user_id: string;
  bike_id: string | null;
  date: string;
  distance_km: number;
  duration_minutes: number | null;
  note: string | null;
  created_at: string;
  bike?: { id: string; name: string; brand: string } | null;
};

export type RideInsert = {
  user_id: string;
  bike_id?: string | null;
  date: string;
  distance_km: number;
  duration_minutes?: number | null;
  note?: string | null;
};

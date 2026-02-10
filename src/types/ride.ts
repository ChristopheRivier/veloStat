export type Ride = {
  id: string;
  user_id: string;
  date: string;
  distance_km: number;
  duration_minutes: number | null;
  note: string | null;
  created_at: string;
};

export type RideInsert = {
  user_id: string;
  date: string;
  distance_km: number;
  duration_minutes?: number | null;
  note?: string | null;
};

export type Bike = {
  id: string;
  user_id: string;
  name: string;
  brand: string;
  acquisition_date: string;
  sale_date: string | null;
  created_at: string;
};

export type BikeInsert = {
  user_id: string;
  name: string;
  brand: string;
  acquisition_date: string;
  sale_date?: string | null;
};

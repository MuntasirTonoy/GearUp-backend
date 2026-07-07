export interface ICreateGear {
  name: string;
  description: string;
  images: string[];
  dailyRentalPrice: number;
  quantity: number;
  categoryId: string;
}

export interface IUpdateGear {
  name?: string;
  description?: string;
  images?: string[];
  dailyRentalPrice?: number;
  quantity?: number;
  status?: string;
  categoryId?: string;
}

export interface IGearFilters {
  searchTerm?: string;
  categoryId?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

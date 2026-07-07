export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export function getPaginationParams(
  rawPage: string | number | undefined,
  rawLimit: string | number | undefined,
  defaultLimit = 10,
): { page: number; limit: number; skip: number } {
  const page = Math.max(1, parseInt(String(rawPage ?? 1), 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(rawLimit ?? defaultLimit), 10) || defaultLimit));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function buildMeta(page: number, limit: number, total: number): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

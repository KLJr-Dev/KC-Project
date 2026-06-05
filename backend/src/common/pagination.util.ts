export const DEFAULT_TAKE = 20;
export const MAX_TAKE = 100;

export function resolvePagination(skip?: string, take?: string): { skip: number; take: number } {
  let parsedSkip = skip !== undefined ? Number(skip) : 0;
  let parsedTake = take !== undefined ? Number(take) : DEFAULT_TAKE;

  if (!Number.isInteger(parsedSkip) || parsedSkip < 0) {
    parsedSkip = 0;
  }
  if (!Number.isInteger(parsedTake) || parsedTake < 1) {
    parsedTake = DEFAULT_TAKE;
  }
  if (parsedTake > MAX_TAKE) {
    parsedTake = MAX_TAKE;
  }

  return { skip: parsedSkip, take: parsedTake };
}

export function buildPaginatedResponse<T>(
  items: T[],
  total: number,
  skip: number,
  take: number,
): { items: T[]; total: number; skip: number; take: number } {
  return { items, total, skip, take };
}

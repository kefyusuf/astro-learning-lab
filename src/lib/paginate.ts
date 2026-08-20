export interface Page<T> {
  items: T[];
  pageNumber: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

/**
 * Slices a list into a single page and computes navigation metadata.
 * Pure function so pagination behavior is unit-testable independently
 * of Astro's routing layer.
 */
export function paginate<T>(
  items: readonly T[],
  pageSize: number,
  pageNumber: number,
): Page<T> {
  if (!Number.isInteger(pageSize) || pageSize < 1) {
    throw new RangeError(
      `pageSize must be a positive integer, received ${pageSize}`,
    );
  }
  if (!Number.isInteger(pageNumber) || pageNumber < 1) {
    throw new RangeError(`pageNumber must be >= 1, received ${pageNumber}`);
  }

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  if (pageNumber > totalPages) {
    throw new RangeError(
      `pageNumber ${pageNumber} exceeds totalPages ${totalPages}`,
    );
  }

  const start = (pageNumber - 1) * pageSize;
  const end = start + pageSize;

  return {
    items: items.slice(start, end),
    pageNumber,
    totalPages,
    hasPrev: pageNumber > 1,
    hasNext: pageNumber < totalPages,
    prevPage: pageNumber > 1 ? pageNumber - 1 : null,
    nextPage: pageNumber < totalPages ? pageNumber + 1 : null,
  };
}

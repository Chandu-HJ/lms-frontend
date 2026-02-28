const isNonEmptyString = (value: string | null | undefined): value is string =>
  typeof value === 'string' && value.trim().length > 0;

export const resolveImageSrc = (
  value: string | null | undefined,
  fallback = '/vite.svg'
): string => (isNonEmptyString(value) ? value : fallback);

export const resolveMediaSrc = (value: string | null | undefined): string | undefined =>
  isNonEmptyString(value) ? value : undefined;

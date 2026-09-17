import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...values: ClassValue[]) {
  return twMerge(clsx(values));
}

/** Two-digit ordinal for editorial numbering: 1 → "01", 10 → "10". */
export const ordinal = (index: number) => String(index + 1).padStart(2, '0');

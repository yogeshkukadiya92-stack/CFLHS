import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Robustly converts various date formats (Firestore Timestamp, ISO String, or Date) 
 * into a standard JS Date object.
 */
export function ensureDate(dateValue: any): Date {
  if (!dateValue) return new Date();
  if (dateValue instanceof Date) return dateValue;
  
  // Handle Firestore Timestamp
  if (dateValue && typeof dateValue === 'object' && 'seconds' in dateValue) {
    return new Date(dateValue.seconds * 1000);
  }
  
  // Handle strings or numbers
  const d = new Date(dateValue);
  return isNaN(d.getTime()) ? new Date() : d;
}

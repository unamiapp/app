import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names and resolves Tailwind CSS conflicts
 * 
 * @param inputs - Class names to combine
 * @returns Combined class string with resolved Tailwind conflicts
 * 
 * @example
 * // Returns "p-4 bg-blue-500" (p-2 is overridden by p-4)
 * cn("p-2", "p-4", "bg-blue-500")
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
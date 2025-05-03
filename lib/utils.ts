import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Optimized class name merging
const classNameCache = new Map<string, string>();

export function cn(...inputs: ClassValue[]): string {
  const key = JSON.stringify(inputs);
  if (classNameCache.has(key)) {
    return classNameCache.get(key)!;
  }
  const result = twMerge(clsx(inputs));
  classNameCache.set(key, result);
  return result;
}

// Image optimization helper
export function getOptimizedImageUrl(url: string, width: number = 800): string {
  if (!url) return '';
  if (url.includes('unsplash.com')) {
    return `${url}?w=${width}&q=80&auto=format`;
  }
  return url;
}

// Debounce function
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function
export function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
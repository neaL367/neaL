/**
 * Utility for conditional class names matching shadcn/ui conventions.
 */
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ');
}

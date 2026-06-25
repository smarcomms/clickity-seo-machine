/**
 * Convert text to URL-friendly slug
 * TODO (Step 2): Enhance with real slugification logic if needed
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

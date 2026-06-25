/**
 * Format blog output for API responses
 * TODO (Step 2): Add real formatting and transformation logic
 */
export function formatBlogOutput(
  markdown: string,
  metadata: Record<string, unknown>
): Record<string, unknown> {
  return {
    markdown,
    metadata,
    formatted_at: new Date().toISOString(),
  };
}

/**
 * Format metadata for SEO
 * TODO (Step 2): Add real metadata formatting with Open Graph, Twitter cards, etc.
 */
export function formatSeoMetadata(
  title: string,
  description: string,
  slug: string
): Record<string, unknown> {
  return {
    meta_title: title,
    meta_description: description,
    slug,
    url_slug: slug,
    canonical_url: `https://example.com/${slug}`,
  };
}

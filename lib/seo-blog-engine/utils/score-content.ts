/**
 * Score content for SEO quality
 * TODO (Step 2): Implement real content scoring logic with keyword density, readability, etc.
 */
export function scoreContent(content: string): number {
  if (!content || content.length === 0) {
    return 0;
  }

  // Basic placeholder scoring
  const wordCount = content.split(/\s+/).length;
  const hasHeaders = /#+\s/.test(content);
  const hasLists = /[-*]\s/.test(content);

  let score = 50; // Base score
  if (wordCount > 300) score += 20;
  if (wordCount > 1000) score += 15;
  if (hasHeaders) score += 10;
  if (hasLists) score += 5;

  return Math.min(score, 100);
}

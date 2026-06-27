'use step';

import 'server-only';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { getAgentConfig } from '../../storage/agent-configs';
import type { SeoBlogInput } from '../../schemas/seo-blog-input';
import type { ResearchOutput } from './research-step';
import type { OutlineOutput } from './outline-step';
import type { WriterOutput } from './writer-step';
import type { SeoQaOutput } from './seo-qa-step';
import type { EditorOutput } from './editor-step';

export interface MetaOutput {
  seo_title: string;
  meta_description: string;
  suggested_slug: string;
  primary_keyword: string;
  secondary_keywords_used: string[];
  excerpt: string;
  og_title: string;
  og_description: string;
  canonical_url_suggestion: string;
  schema_type_suggestion: string;
  human_review_notes: string[];
}

/**
 * Meta Agent Step - Phase 2C-F
 * Generates SEO metadata for human review
 * Does NOT publish, call external services, or overwrite drafts
 * Output goes to final_output_json as meta_json
 */
export async function runMetaStep(
  runId: string,
  input: SeoBlogInput,
  research: ResearchOutput,
  outline: OutlineOutput,
  originalDraft: string,
  seoQa: SeoQaOutput,
  editedDraft: string
): Promise<MetaOutput> {
  console.log(`[v0] Meta step: Starting for run ${runId}`);

  try {
    // Load agent config from database
    const agentConfig = await getAgentConfig('meta');
    if (!agentConfig) {
      throw new Error('Active agent config not found for agent_key: meta');
    }
    console.log(`[v0] SEO Blog Agent Config Loaded: meta v${agentConfig.version}`);

    // Build system prompt from database config
    const systemPrompt = [
      agentConfig.system_prompt,
      agentConfig.skill_markdown,
    ]
      .filter(Boolean)
      .join('\n\n');

    // Build context for meta generation
    const metaContext = buildMetaContext(
      input,
      research,
      outline,
      seoQa,
      originalDraft,
      editedDraft
    );

    // Get model name: use DB config if available, otherwise fall back to env var or default
    const modelName =
      agentConfig.model || process.env.META_AGENT_MODEL || 'gpt-5.4-mini';
    console.log(`[v0] Meta step: Using model: ${modelName}`);

    // Generate metadata
    const { text: metaAnalysis } = await generateText({
      model: openai(modelName),
      system: systemPrompt,
      temperature: 0.5,
      messages: [
        {
          role: 'user',
          content: metaContext,
        },
      ],
    });

    console.log(`[v0] Meta step: Received analysis, parsing JSON`);

    // Parse the response
    let metaOutput: MetaOutput;
    try {
      // Extract JSON from response (may have surrounding text)
      const jsonMatch = metaAnalysis.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      metaOutput = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.warn(
        `[v0] Meta step: Failed to parse JSON response, using fallback`,
        parseError instanceof Error ? parseError.message : String(parseError)
      );
      metaOutput = generateFallbackMeta(input, research, seoQa, originalDraft);
    }

    // Validate required fields at runtime
    const requiredFields: (keyof MetaOutput)[] = [
      'seo_title',
      'meta_description',
      'suggested_slug',
      'primary_keyword',
      'secondary_keywords_used',
      'excerpt',
      'og_title',
      'og_description',
      'canonical_url_suggestion',
      'schema_type_suggestion',
      'human_review_notes',
    ];

    let missingFields: string[] = [];
    for (const field of requiredFields) {
      if (metaOutput[field] === undefined || metaOutput[field] === null) {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      console.warn(
        `[v0] Meta step: Missing required fields: ${missingFields.join(', ')}, using fallback`
      );
      metaOutput = generateFallbackMeta(input, research, seoQa, originalDraft);
    }

    // Validate field constraints
    if (metaOutput.seo_title && metaOutput.seo_title.length > 70) {
      console.warn(
        `[v0] Meta step: SEO title too long (${metaOutput.seo_title.length} chars, max 70), truncating`
      );
      metaOutput.seo_title = metaOutput.seo_title.substring(0, 67) + '...';
    }

    if (metaOutput.meta_description && metaOutput.meta_description.length > 160) {
      console.warn(
        `[v0] Meta step: Meta description too long (${metaOutput.meta_description.length} chars, max 160), truncating`
      );
      metaOutput.meta_description = metaOutput.meta_description.substring(0, 157) + '...';
    }

    if (!Array.isArray(metaOutput.secondary_keywords_used)) {
      console.warn(
        `[v0] Meta step: secondary_keywords_used is not an array, using empty array`
      );
      metaOutput.secondary_keywords_used = [];
    }

    if (!Array.isArray(metaOutput.human_review_notes)) {
      console.warn(
        `[v0] Meta step: human_review_notes is not an array, using default notes`
      );
      metaOutput.human_review_notes = [
        'Review SEO title and meta description for CTR',
        'Verify metadata aligns with content',
      ];
    }

    console.log(
      `[v0] Meta step: Complete for run ${runId}`,
      `Generated metadata: ${metaOutput.seo_title.substring(0, 50)}...`
    );
    return metaOutput;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[v0] Meta step error for run ${runId}: ${errorMessage}`);
    throw error;
  }
}

/**
 * Build context prompt for metadata generation
 */
function buildMetaContext(
  input: SeoBlogInput,
  research: ResearchOutput,
  outline: OutlineOutput,
  seoQa: SeoQaOutput,
  originalDraft: string,
  editedDraft: string
): string {
  // Validate required research.key_findings before using
  if (!Array.isArray(research.key_findings)) {
    throw new Error('Research output missing required key_findings array for meta-step');
  }

  const wordCount = editedDraft.split(/\s+/).length;
  const headings = editedDraft.match(/^#+\s+.+$/gm) || [];
  const keyFindingsSummary = research.key_findings.slice(0, 3).join('\n- ');

  return `You are an expert SEO metadata specialist. Generate SEO metadata for a blog post for human review.

BLOG TOPIC: ${input.blog_topic}
BUSINESS NAME: ${input.business_name || 'Not provided'}
WEBSITE URL: ${input.website_url || 'Not provided'}
PRIMARY KEYWORD: ${input.primary_keyword}
SECONDARY KEYWORDS: ${(input.secondary_keywords || []).join(', ') || 'None provided'}
TARGET AUDIENCE: ${input.audience_notes || 'General audience'}

RESEARCH SUMMARY:
- ${keyFindingsSummary}

OUTLINE STRUCTURE:
${outline.sections.map((s) => `- ${s.heading} (${s.subsections?.length || 0} subsections)`).join('\n')}

SEO QA REVIEW:
- Overall Score: ${seoQa.overall_score}
- Search Intent Alignment: ${seoQa.search_intent_alignment}
- Keyword Usage: ${seoQa.keyword_usage_assessment}
- Heading Structure: ${seoQa.heading_structure_assessment}

CONTENT STATS:
- Word Count: ${wordCount}
- Headings: ${headings.length}
- Has CTA: ${input.cta_notes ? 'Yes' : 'No'}
- Has Internal Links: ${input.internal_link_notes ? 'Yes' : 'No'}

Generate metadata that:
1. Accurately represents the blog content (do not invent claims)
2. Includes the primary keyword naturally in title and description
3. Is SEO-optimized for search engines
4. Is compelling for human readers and CTR
5. Follows best practices (title max 60 chars, description max 160 chars)
6. Includes review notes for the human editor

Return a JSON object with these exact fields:
{
  "seo_title": "SEO-optimized title (max 60 chars)",
  "meta_description": "Compelling description (max 160 chars)",
  "suggested_slug": "url-slug-format",
  "primary_keyword": "${input.primary_keyword}",
  "secondary_keywords_used": ["keyword1", "keyword2"],
  "excerpt": "Brief summary for blog listings (max 155 chars)",
  "og_title": "OpenGraph title for social sharing",
  "og_description": "OpenGraph description for social sharing",
  "canonical_url_suggestion": "https://example.com/blog/url-slug or leave as null if website_url not provided",
  "schema_type_suggestion": "BlogPosting or NewsArticle",
  "human_review_notes": ["note1", "note2"]
}`;
}

/**
 * Generate fallback metadata if AI parsing fails
 */
function generateFallbackMeta(
  input: SeoBlogInput,
  research: ResearchOutput,
  seoQa: SeoQaOutput,
  draft: string
): MetaOutput {
  const primaryKeyword = input.primary_keyword || 'blog post';
  const slug = input.blog_topic
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const wordCount = draft.split(/\s+/).length;

  return {
    seo_title: `${input.blog_topic} - ${input.business_name || 'Blog'}`,
    meta_description: `Comprehensive guide to ${input.blog_topic.toLowerCase()}. Research-backed insights and practical strategies. ${wordCount} words.`,
    suggested_slug: slug,
    primary_keyword: primaryKeyword,
    secondary_keywords_used: input.secondary_keywords || [],
    excerpt: `Learn about ${input.blog_topic.toLowerCase()} with insights from our research. ${wordCount}-word guide covering key aspects and strategies.`,
    og_title: `${input.blog_topic} | ${input.business_name || 'Blog'}`,
    og_description: `Discover ${input.blog_topic.toLowerCase()}. Comprehensive guide with research and insights.`,
    canonical_url_suggestion: input.website_url
      ? `${input.website_url}/blog/${slug}`
      : null,
    schema_type_suggestion: 'BlogPosting',
    human_review_notes: [
      `Overall SEO Score: ${seoQa.overall_score}`,
      'Review and adjust metadata as needed for your brand voice',
      'Ensure SEO title and meta description are compelling for CTR',
      'Verify canonical URL matches your site structure',
      'Check that schema type matches your content format',
    ],
  };
}

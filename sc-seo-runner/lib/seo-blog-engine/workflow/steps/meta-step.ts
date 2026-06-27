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
  meta_title: string;
  meta_description: string;
  slug: string;
  social_preview: {
    title: string;
    description: string;
  };
  schema_markup: {
    '@type': string;
    headline: string;
    description: string;
  };
  primary_keyword_used: boolean;
  secondary_keywords_reflected: string[];
  client_goal_reflected: boolean;
  human_review_required: boolean;
  review_ready: boolean;
  meta_notes: string[];
  needs_review: boolean;
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

    // FAIL-LOUD: Validate all required fields exist and have correct types
    const fieldValidations: Array<{ field: keyof MetaOutput; type: string; check: (v: any) => boolean }> = [
      { field: 'meta_title', type: 'string', check: (v) => typeof v === 'string' && v.length > 0 },
      { field: 'meta_description', type: 'string', check: (v) => typeof v === 'string' && v.length > 0 },
      { field: 'slug', type: 'string', check: (v) => typeof v === 'string' && v.length > 0 },
      { field: 'social_preview', type: 'object', check: (v) => typeof v === 'object' && v.title && v.description },
      { field: 'schema_markup', type: 'object', check: (v) => typeof v === 'object' && v['@type'] && v.headline && v.description },
      { field: 'primary_keyword_used', type: 'boolean', check: (v) => typeof v === 'boolean' },
      { field: 'secondary_keywords_reflected', type: 'array', check: (v) => Array.isArray(v) },
      { field: 'client_goal_reflected', type: 'boolean', check: (v) => typeof v === 'boolean' },
      { field: 'human_review_required', type: 'boolean', check: (v) => typeof v === 'boolean' },
      { field: 'review_ready', type: 'boolean', check: (v) => typeof v === 'boolean' },
      { field: 'meta_notes', type: 'array', check: (v) => Array.isArray(v) },
      { field: 'needs_review', type: 'boolean', check: (v) => typeof v === 'boolean' },
    ];

    const validationErrors: string[] = [];
    for (const validation of fieldValidations) {
      const value = metaOutput[validation.field];
      if (value === undefined || value === null) {
        validationErrors.push(`${validation.field} is missing`);
      } else if (!validation.check(value)) {
        validationErrors.push(`${validation.field} has invalid type (expected ${validation.type})`);
      }
    }

    if (validationErrors.length > 0) {
      throw new Error(
        `Meta output validation failed: ${validationErrors.join('; ')}`
      );
    }

    // Lightweight field constraints (no silent modification)
    if ((metaOutput.meta_title as string).length > 70) {
      throw new Error(
        `Meta title too long: ${metaOutput.meta_title.length} chars, max 70`
      );
    }

    if ((metaOutput.meta_description as string).length > 160) {
      throw new Error(
        `Meta description too long: ${metaOutput.meta_description.length} chars, max 160`
      );
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
    meta_title: `${input.blog_topic} - ${input.business_name || 'Blog'}`,
    meta_description: `Comprehensive guide to ${input.blog_topic.toLowerCase()}. Research-backed insights and practical strategies.`,
    slug: slug,
    social_preview: {
      title: `${input.blog_topic} | ${input.business_name || 'Blog'}`,
      description: `Discover ${input.blog_topic.toLowerCase()}. Comprehensive guide with research and insights.`,
    },
    schema_markup: {
      '@type': 'BlogPosting',
      headline: `${input.blog_topic} - ${input.business_name || 'Blog'}`,
      description: `Comprehensive guide to ${input.blog_topic.toLowerCase()}. Research-backed insights and practical strategies.`,
    },
    primary_keyword_used: true,
    secondary_keywords_reflected: input.secondary_keywords || [],
    client_goal_reflected: true,
    human_review_required: seoQa.overall_score < 75,
    review_ready: seoQa.overall_score >= 60,
    meta_notes: [
      `Overall SEO Score: ${seoQa.overall_score}`,
      'Review and adjust metadata as needed for your brand voice',
      'Ensure meta title and description are compelling for CTR',
      'Verify schema markup matches your content format',
    ],
    needs_review: seoQa.overall_score < 75,
  };
}

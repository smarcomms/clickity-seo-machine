'use step';

import 'server-only';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { getAgentConfig } from '../../storage/agent-configs';
import type { SeoBlogInput } from '../../schemas/seo-blog-input';
import type { ResearchOutput } from './research-step';
import type { OutlineOutput } from './outline-step';
import type { SeoQaOutput } from './seo-qa-step';
import { buildFullInputContext, extractJsonObject } from './context-builder';

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

    // Parse the response - FAIL-LOUD in production
    let metaOutput: MetaOutput;
    try {
      metaOutput = JSON.parse(extractJsonObject(metaAnalysis)) as MetaOutput;
    } catch (parseError) {
      // PRODUCTION MODE: Always fail loud on parse errors.
      // Fallback is not used in normal workflow - this ensures AI model schema compliance.
      const errorMsg = parseError instanceof Error ? parseError.message : String(parseError);
      const fullError = `Meta output parse failed: ${errorMsg}`;
      console.error(`[v0] Meta step: ${fullError}`);
      throw new Error(fullError);
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
      `Generated metadata: ${metaOutput.meta_title.substring(0, 50)}...`
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

FULL BLOG CONTEXT:
${buildFullInputContext(input)}

RESEARCH SUMMARY:
- ${keyFindingsSummary}

OUTLINE STRUCTURE:
${outline.sections.map((s) => `- ${s.heading} (${s.key_points?.length || 0} key points)`).join('\n')}

SEO QA REVIEW:
- Overall Score: ${seoQa.overall_score}
- Search Intent Alignment: ${seoQa.search_intent_alignment.score}
- Primary Keyword Usage: ${seoQa.primary_keyword_usage.score}
- Heading Structure: ${seoQa.heading_structure_review.score}
- Client Goal Alignment: ${seoQa.client_goal_alignment.score}

EDITED BLOG MARKDOWN:
${editedDraft}

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
5. Follows best practices (title max 70 chars, description max 160 chars)
6. Includes review notes for the human editor

Return valid JSON only using exactly these top-level keys:
meta_title, meta_description, slug, social_preview, schema_markup, primary_keyword_used, secondary_keywords_reflected, client_goal_reflected, human_review_required, review_ready, meta_notes, needs_review.

Do not use old keys:
seo_title, suggested_slug, secondary_keywords_used, human_review_notes, excerpt, og_title, og_description, canonical_url_suggestion, schema_type_suggestion.

Return a JSON object with this exact schema:
{
  "meta_title": "SEO-optimized title (max 70 chars, include primary keyword)",
  "meta_description": "Compelling description (max 160 chars, include primary keyword)",
  "slug": "url-slug-format",
  "social_preview": {
    "title": "Social media preview title",
    "description": "Social media preview description"
  },
  "schema_markup": {
    "@type": "BlogPosting",
    "headline": "Article headline",
    "description": "Article description"
  },
  "primary_keyword_used": true,
  "secondary_keywords_reflected": ["keyword1", "keyword2"],
  "client_goal_reflected": true,
  "human_review_required": true,
  "review_ready": true,
  "meta_notes": ["note1", "note2"],
  "needs_review": false
}`;
}

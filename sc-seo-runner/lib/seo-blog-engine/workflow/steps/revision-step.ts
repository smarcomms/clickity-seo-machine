'use step';

import 'server-only';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { getAgentConfig } from '../../storage/agent-configs';
import type { SeoBlogInput } from '../../schemas/seo-blog-input';
import type { ResearchOutput } from './research-step';
import type { OutlineOutput } from './outline-step';
import type { SeoQaOutput } from './seo-qa-step';
import type { MetaOutput } from './meta-step';

export interface RevisionOutput {
  revised_markdown: string;
  revision_mode: 'moderate_revision' | 'heavy_revision';
  feedback_applied: string;
  timestamp: string;
}

/**
 * Helper: Format a value for revision context output
 */
function formatRevisionValue(value: unknown, fallback = 'Not provided'): string {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return fallback;
}

/**
 * Helper: Format a list of values for revision context output
 */
function formatRevisionList(values: unknown, fallback = 'None provided'): string {
  if (!Array.isArray(values) || values.length === 0) return fallback;

  const cleaned = values
    .map((item) => (typeof item === 'string' ? item.trim() : String(item)))
    .filter(Boolean);

  if (cleaned.length === 0) return fallback;
  return cleaned.map((item) => `- ${item}`).join('\n');
}

/**
 * Helper: Format a JSON object for revision context output
 */
function formatRevisionJson(value: unknown, fallback = 'None provided'): string {
  if (!value || typeof value !== 'object') return fallback;
  return JSON.stringify(value, null, 2);
}

/**
 * Build lean revision context (limited to essential fields only)
 * Does NOT include full research, outline, meta, or blog context brief
 * to keep the Revision Agent focused on applying feedback, not re-planning
 */
function buildLeanRevisionContext(input: SeoBlogInput): string {
  const brief: NonNullable<SeoBlogInput['blog_context_brief']> =
    input.blog_context_brief ?? {};

  const briefRecord = brief as Record<string, unknown>;

  const mustInclude =
    Array.isArray(brief.must_include) && brief.must_include.length > 0
      ? brief.must_include
      : input.must_include;

  const mustAvoid =
    Array.isArray(brief.must_avoid) && brief.must_avoid.length > 0
      ? brief.must_avoid
      : input.must_avoid;

  const brandVoice =
    brief.brand_voice_notes ||
    input.brand_voice_notes ||
    input.tone;

  const orderContext =
    input.order_context ||
    briefRecord.order_context ||
    {};

  return `## Limited Revision Context

Use this context only to support the requested revision.
Do not restart, re-plan, or regenerate the article from this context.

Business Name: ${formatRevisionValue(input.business_name)}
Client Name: ${formatRevisionValue(input.client_name)}
Website URL: ${formatRevisionValue(input.website_url)}
Blog Topic: ${formatRevisionValue(input.blog_topic || input.topic)}
Primary Keyword: ${formatRevisionValue(input.primary_keyword)}
Secondary Keywords:
${formatRevisionList(input.secondary_keywords || input.keywords)}
Target Word Count: ${formatRevisionValue(input.target_word_count)}
Brand Voice Notes: ${formatRevisionValue(brandVoice)}
Audience Notes: ${formatRevisionValue(input.audience_notes)}
CTA Notes: ${formatRevisionValue(input.cta_notes || input.cta)}
Additional Order Notes: ${formatRevisionValue(input.additional_order_notes)}

Must Include:
${formatRevisionList(mustInclude)}

Must Avoid:
${formatRevisionList(mustAvoid)}

Original Order Context:
${formatRevisionJson(orderContext)}`;
}

/**
 * Revision Agent Step
 * Revises an existing draft based on reviewer feedback.
 * Does NOT update the database or call callbacks.
 * Returns revised Markdown only, for use by revision-workflow.ts.
 */
export async function runRevisionStep(
  currentDraft: string,
  reviewerFeedback: string,
  revisionMode: 'moderate_revision' | 'heavy_revision',
  input?: SeoBlogInput,
  research?: ResearchOutput,
  outline?: OutlineOutput,
  seoQa?: SeoQaOutput,
  meta?: MetaOutput
): Promise<RevisionOutput> {
  console.log(`[v0] Revision step: Starting with mode: ${revisionMode}`);

  try {
    // Load agent config from database
    const agentConfig = await getAgentConfig('revision');
    if (!agentConfig) {
      throw new Error(
        'Active agent config not found for agent_key: revision'
      );
    }
    console.log(
      `[v0] SEO Blog Agent Config Loaded: revision v${agentConfig.version}`
    );

    // Build system prompt from database config
    const systemPrompt = [
      agentConfig.system_prompt,
      agentConfig.skill_markdown,
    ]
      .filter(Boolean)
      .join('\n\n');

    // Build revision instruction based on mode
    const revisionInstruction =
      revisionMode === 'heavy_revision'
        ? 'Apply comprehensive changes requested by the feedback. You may restructure sections if needed, but keep the same core topic, primary keyword, and publishing intent unless the feedback explicitly asks for a new direction. Preserve the existing H1/title unless the reviewer explicitly asks to change it. Do not invent new facts.'
        : 'Apply focused changes requested by the feedback. Polish the existing structure, refine wording, and keep sections and the existing H1/title intact where possible.';

    // Build lean revision context (essential fields only, no full research/outline/meta)
    const contextBlock = input ? `\n\n${buildLeanRevisionContext(input)}` : '';

    // For V1, do not include full research, outline, seoQa, or meta context
    // to keep the agent focused on applying feedback, not re-planning
    void research;
    void outline;
    void seoQa;
    void meta;

    const additionalContext: string[] = [];

    // Validate inputs
    if (!currentDraft || !currentDraft.trim()) {
      throw new Error('Revision step missing currentDraft');
    }

    if (!reviewerFeedback || !reviewerFeedback.trim()) {
      throw new Error('Revision step missing reviewerFeedback');
    }

    // Build user message
    const userMessage = `Revise the blog draft below using the reviewer feedback provided.

Revision Mode: ${revisionMode}
${revisionInstruction}

Publishing Note:
This revision does not regenerate meta title, slug, or social preview. Preserve the same core topic, primary keyword, article angle, and H1/title unless reviewer feedback explicitly asks to change them.

Reviewer Feedback:
${reviewerFeedback}${contextBlock}${additionalContext.join('')}

Current Draft Markdown:
${currentDraft}

Return the revised blog in Markdown only. Do not return JSON. Do not include explanations, revision notes, markdown fences, or comments outside the article.`;

    // Get model name: use DB config if available, otherwise fall back to env var or default
    const modelName =
      agentConfig.model ||
      process.env.REVISION_AGENT_MODEL ||
      process.env.EDITOR_AGENT_MODEL ||
      'gpt-5.4-mini';
    console.log(`[v0] Revision step: Using model: ${modelName}`);

    // Call AI model via direct OpenAI provider
    const model = openai(modelName);

    const response = await generateText({
      model,
      system: systemPrompt,
      prompt: userMessage,
      temperature: 0.7,
      maxOutputTokens: 8000,
    });

    const revisedMarkdown = response.text.trim();

    // Validate output
    if (!revisedMarkdown || revisedMarkdown.length === 0) {
      throw new Error('Revision Agent returned empty output');
    }

    if (revisedMarkdown.startsWith('{')) {
      throw new Error(
        'Revision output invalid: expected Markdown, received JSON-like response'
      );
    }

    if (
      revisedMarkdown.length <
      Math.min(500, Math.floor(currentDraft.length * 0.4))
    ) {
      throw new Error(
        'Revision output too short compared with original draft'
      );
    }

    const revisionOutput: RevisionOutput = {
      revised_markdown: revisedMarkdown,
      revision_mode: revisionMode,
      feedback_applied: reviewerFeedback.substring(0, 200),
      timestamp: new Date().toISOString(),
    };

    console.log(
      `[v0] Revision step: Complete (${revisedMarkdown.length} chars)`
    );

    return revisionOutput;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[v0] Revision step error: ${errorMessage}`);
    throw error;
  }
}

'use step';

import 'server-only';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { updateRunDraft, updateRunStatus } from '../../storage/runs';
import { getAgentConfig } from '../../storage/agent-configs';
import type { SeoBlogInput } from '../../schemas/seo-blog-input';
import type { OutlineOutput } from './outline-step';

export interface WriterOutput {
  draft_markdown: string;
  word_count: number;
  sections_written: number;
  has_cta: boolean;
  has_internal_links: boolean;
  timestamp: string;
}

/**
 * Writer Step - Phase 2C-C
 * Runs inside a durable step function (has Node.js access)
 * Calls AI model to generate first full blog draft in Markdown
 * Uses research data and outline to structure the content
 */
export async function runWriterStep(
  runId: string,
  input: SeoBlogInput,
  researchData?: Record<string, any>,
  outlineData?: OutlineOutput
): Promise<WriterOutput> {
  console.log(`[v0] Writer step: Creating draft for run ${runId}`);

  try {
    // Load agent config from database
    const agentConfig = await getAgentConfig('writer');
    if (!agentConfig) {
      throw new Error('Active agent config not found for agent_key: writer');
    }
    console.log(`[v0] SEO Blog Agent Config Loaded: writer v${agentConfig.version}`);

    // Build system prompt from database config
    const systemPrompt = [
      agentConfig.system_prompt,
      agentConfig.skill_markdown,
    ]
      .filter(Boolean)
      .join('\n\n');

    // Create context from available data
    const topic = input.blog_topic || input.topic || 'Your Topic';
    const primaryKeyword = input.primary_keyword || 'primary keyword';
    const secondaryKeywords =
      (input.secondary_keywords || input.keywords || []).join(', ') ||
      'secondary keywords';
    const businessName = input.business_name || 'Your Business';
    const audienceNotes =
      input.audience_notes || 'Target audience not specified';
    const brandVoice = input.brand_voice_notes || 'Professional and clear';
    const ctaNotes = input.cta_notes || '';
    const internalLinkNotes = input.internal_link_notes || '';
    const additionalNotes = input.additional_order_notes || 'No additional notes';
    const targetWordCount = input.target_word_count || 1500;

    // Build research context if available
    let researchContext = '';
    if (researchData && typeof researchData === 'object') {
      const findings = (researchData as Record<string, any>).key_findings || [];
      if (Array.isArray(findings) && findings.length > 0) {
        researchContext = `\n\nKey Research Findings:\n${findings
          .map(
            (f: any) =>
              `- ${typeof f === 'string' ? f : JSON.stringify(f)}`
          )
          .join('\n')}`;
      }
    }

    // Build outline context if available
    let outlineContext = '';
    if (outlineData) {
      const sections = (
        (outlineData as Record<string, any>).sections || []
      ).map(
        (s: any) =>
          `## ${typeof s === 'string' ? s : s.heading || 'Section'}\n(${(s as Record<string, any>).purpose || 'Section content'})`
      );
      if (sections.length > 0) {
        outlineContext = `\n\nOutline Structure:\n${sections.join('\n\n')}`;
      }
    }

    // Build internal links context
    let linksContext = '';
    if (internalLinkNotes) {
      linksContext = `\n\nInternal Link Opportunities:\n${internalLinkNotes}`;
    }

    // Build CTA context
    let ctaContext = '';
    if (ctaNotes) {
      ctaContext = `\n\nCall-to-Action Guidance:\n${ctaNotes}`;
    }

    const userMessage = `Write the first draft blog post about: ${topic}${researchContext}${outlineContext}${linksContext}${ctaContext}`;

    // Get model name: use DB config if available, otherwise fall back to env var or default
    const modelName =
      agentConfig.model ||
      process.env.WRITER_AGENT_MODEL ||
      process.env.RESEARCH_AGENT_MODEL ||
      'gpt-5.4-mini';
    console.log(`[v0] Writer step: Using model: ${modelName}`);

    // Call AI model via direct OpenAI provider
    const model = openai(modelName);

    const response = await generateText({
      model,
      system: systemPrompt,
      prompt: userMessage,
      temperature: 0.7,
      maxTokens: 4000,
    });

    const draftMarkdown = response.text;

    // Basic validation
    if (!draftMarkdown || draftMarkdown.trim().length < 500) {
      throw new Error('Generated content too short');
    }

    // Calculate metrics
    const wordCount = draftMarkdown.split(/\s+/).length;
    const sectionsCount = (draftMarkdown.match(/^##\s/gm) || []).length;
    const hasCta =
      draftMarkdown.toLowerCase().includes('call') ||
      draftMarkdown.toLowerCase().includes('action') ||
      ctaNotes.length > 0;
    const hasInternalLinks =
      draftMarkdown.includes('[link:') || internalLinkNotes.length > 0;

    const writerOutput: WriterOutput = {
      draft_markdown: draftMarkdown,
      word_count: wordCount,
      sections_written: sectionsCount,
      has_cta: hasCta,
      has_internal_links: hasInternalLinks,
      timestamp: new Date().toISOString(),
    };

    // Persist draft_markdown to database (markdown string only, not full object)
    console.log(
      `[v0] Writer step: Persisting draft_markdown (${wordCount} words) for run ${runId}`
    );
    await updateRunDraft(runId, writerOutput.draft_markdown);
    // Also update status to 'writing'
    await updateRunStatus(runId, 'writing');

    console.log(
      `[v0] Writer step: Complete for run ${runId} (${wordCount} words, ${sectionsCount} sections)`
    );
    return writerOutput;
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : 'Unknown error in writer step';
    console.error(`[v0] Writer step error for run ${runId}: ${errorMsg}`);
    throw new Error(`Writer step failed: ${errorMsg}`);
  }
}

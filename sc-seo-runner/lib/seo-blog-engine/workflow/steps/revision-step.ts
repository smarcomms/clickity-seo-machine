'use step';

import 'server-only';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { getAgentConfig } from '../../storage/agent-configs';
import { buildFullInputContext } from './context-builder';
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
        ? 'Apply comprehensive changes. Restructure sections if needed. Rewrite paragraphs for clarity and SEO. Be thorough.'
        : 'Apply focused changes. Polish existing structure. Refine wording and clarity. Keep sections intact.';

    // Build context with full Blog Context Brief if input is available
    let contextBlock = '';
    if (input) {
      contextBlock = `\n\n${buildFullInputContext(input)}`;
    }

    // Add additional context from other agents if available
    let additionalContext: string[] = [];

    if (research) {
      const findings = (research as Record<string, any>).key_findings || [];
      if (Array.isArray(findings) && findings.length > 0) {
        additionalContext.push(
          `\n\nPrevious Research Findings:\n${findings
            .map((f: any) => `- ${typeof f === 'string' ? f : JSON.stringify(f)}`)
            .join('\n')}`
        );
      }
    }

    if (outline) {
      const sections = ((outline as Record<string, any>).sections || []).map(
        (s: any) =>
          `## ${typeof s === 'string' ? s : s.heading || 'Section'}`
      );
      if (sections.length > 0) {
        additionalContext.push(
          `\n\nOriginal Outline Structure:\n${sections.join('\n')}`
        );
      }
    }

    if (seoQa) {
      const seoQaObj = seoQa as Record<string, any>;
      additionalContext.push(
        `\n\nSEO QA Results:\nOverall Score: ${seoQaObj.overall_score || 'N/A'}/100`
      );
      if (seoQaObj.priority_fixes && Array.isArray(seoQaObj.priority_fixes)) {
        additionalContext.push(
          `Priority Fixes: ${seoQaObj.priority_fixes.join('; ')}`
        );
      }
    }

    if (meta) {
      const metaObj = meta as Record<string, any>;
      additionalContext.push(
        `\n\nMeta Information:\nMeta Title: ${metaObj.meta_title || 'N/A'}\nMeta Description: ${metaObj.meta_description || 'N/A'}`
      );
    }

    // Build user message
    const userMessage = `Revise the blog draft below using the reviewer feedback provided.

Revision Mode: ${revisionMode}
${revisionInstruction}

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

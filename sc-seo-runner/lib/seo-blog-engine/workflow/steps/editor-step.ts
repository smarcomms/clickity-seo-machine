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

export interface EditorOutput {
  edited_draft_markdown: string;
  editor_notes: string[];
  changes_made: string[];
  human_review_required: boolean;
}

/**
 * Editor Agent Step
 * Improves the draft based on SEO QA recommendations and brand guidelines
 * Does NOT overwrite the original draft_markdown - result goes to final_output_json
 */
export async function runEditorStep(
  runId: string,
  input: SeoBlogInput,
  research: ResearchOutput,
  outline: OutlineOutput,
  originalDraft: string,
  seoQa: SeoQaOutput
): Promise<EditorOutput> {
  console.log(`[v0] Editor step: Starting for run ${runId}`);

  try {
    // Load agent config from database
    const agentConfig = await getAgentConfig('editor');
    if (!agentConfig) {
      throw new Error('Active agent config not found for agent_key: editor');
    }
    console.log(`[v0] SEO Blog Agent Config Loaded: editor v${agentConfig.version}`);

    // Build system prompt from database config
    const systemPrompt = [
      agentConfig.system_prompt,
      agentConfig.skill_markdown,
    ]
      .filter(Boolean)
      .join('\n\n');

    // Build context for editor
    const editorContext = buildEditorContext(input, research, outline, seoQa);

    // Get model name: use DB config if available, otherwise fall back to env var or default
    const modelName =
      agentConfig.model || process.env.EDITOR_AGENT_MODEL || 'gpt-5.4-mini';
    console.log(`[v0] Editor step: Using model: ${modelName}`);

    // Generate improved draft
    const { text: improvementAnalysis } = await generateText({
      model: openai(modelName),
      temperature: 0.7,
      maxTokens: 8000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Please improve this draft based on the following feedback:

ORIGINAL DRAFT:
${originalDraft}

SEO QA FEEDBACK:
${editorContext}

Provide the edited draft and a summary of changes made.`,
        },
      ],
    });

    // Parse improvement analysis
    let editorOutput: EditorOutput;
    try {
      const parsed = JSON.parse(improvementAnalysis);
      editorOutput = {
        edited_draft_markdown: parsed.edited_draft || originalDraft,
        editor_notes: parsed.notes || [],
        changes_made: parsed.changes_summary || [],
        human_review_required: true,
      };
    } catch {
      // Fallback if parsing fails
      console.warn(`[v0] Editor step: Failed to parse editor response, using fallback`);
      editorOutput = {
        edited_draft_markdown: originalDraft,
        editor_notes: ['Editor processing completed with fallback'],
        changes_made: [],
        human_review_required: true,
      };
    }

    console.log(
      `[v0] Editor step: Generated edited draft (${editorOutput.edited_draft_markdown.length} chars)`
    );
    console.log(
      `[v0] Editor step: ${editorOutput.changes_made.length} changes identified`
    );

    return editorOutput;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[v0] Editor step error: ${errorMessage}`);
    throw error;
  }
}

/**
 * Build context for editor based on SEO QA findings
 */
function buildEditorContext(
  input: SeoBlogInput,
  research: ResearchOutput,
  outline: OutlineOutput,
  seoQa: SeoQaOutput
): string {
  const sections: string[] = [];

  sections.push('## SEO Performance Summary');
  sections.push(`Overall Score: ${seoQa.overall_score}/100`);

  sections.push('\n## Search Intent Alignment');
  sections.push(`Score: ${seoQa.search_intent_alignment.score}/100`);
  sections.push(`Analysis: ${seoQa.search_intent_alignment.analysis}`);

  sections.push('\n## Primary Keyword Usage');
  sections.push(`Score: ${seoQa.primary_keyword_usage.score}/100`);
  sections.push(
    `Occurrences: ${seoQa.primary_keyword_usage.occurrences} times`
  );
  sections.push(
    `Placement: ${seoQa.primary_keyword_usage.placement_analysis}`
  );

  sections.push('\n## Secondary Keywords');
  sections.push(`Score: ${seoQa.secondary_keyword_usage.score}/100`);
  sections.push(
    `Covered: ${seoQa.secondary_keyword_usage.keywords_covered.join(', ')}`
  );
  if (seoQa.secondary_keyword_usage.gaps.length > 0) {
    sections.push(`Gaps: ${seoQa.secondary_keyword_usage.gaps.join(', ')}`);
  }

  sections.push('\n## Heading Structure');
  sections.push(`Score: ${seoQa.heading_structure_review.score}/100`);
  sections.push(`H1 Present: ${seoQa.heading_structure_review.h1_present}`);
  sections.push(`H2 Count: ${seoQa.heading_structure_review.h2_count}`);
  if (seoQa.heading_structure_review.hierarchy_issues.length > 0) {
    sections.push(
      `Issues: ${seoQa.heading_structure_review.hierarchy_issues.join('; ')}`
    );
  }

  sections.push('\n## Content Depth');
  sections.push(`Score: ${seoQa.content_depth_review.score}/100`);
  sections.push(`Word Count: ${seoQa.content_depth_review.word_count} words`);
  sections.push(`Coverage: ${seoQa.content_depth_review.section_coverage}`);
  if (seoQa.content_depth_review.depth_issues.length > 0) {
    sections.push(
      `Issues: ${seoQa.content_depth_review.depth_issues.join('; ')}`
    );
  }

  sections.push('\n## Readability');
  sections.push(`Score: ${seoQa.readability_review.score}/100`);
  sections.push(
    `Avg Sentence Length: ${seoQa.readability_review.avg_sentence_length} words`
  );
  sections.push(
    `Reading Level: ${seoQa.readability_review.flesch_kincaid_estimate}`
  );
  if (seoQa.readability_review.readability_issues.length > 0) {
    sections.push(
      `Issues: ${seoQa.readability_review.readability_issues.join('; ')}`
    );
  }

  sections.push('\n## Internal Linking');
  sections.push(`Score: ${seoQa.internal_linking_review.score}/100`);
  sections.push(
    `Links Found: ${seoQa.internal_linking_review.internal_links_found}`
  );
  if (seoQa.internal_linking_review.internal_link_recommendations.length > 0) {
    sections.push(
      `Recommendations: ${seoQa.internal_linking_review.internal_link_recommendations.join('; ')}`
    );
  }

  sections.push('\n## CTA & Brand Guidelines');
  if (input.cta_notes) {
    sections.push(`CTA Notes: ${input.cta_notes}`);
  }
  if (input.brand_voice_notes) {
    sections.push(`Brand Voice: ${input.brand_voice_notes}`);
  }
  if (input.audience_notes) {
    sections.push(`Target Audience: ${input.audience_notes}`);
  }

  return sections.join('\n');
}

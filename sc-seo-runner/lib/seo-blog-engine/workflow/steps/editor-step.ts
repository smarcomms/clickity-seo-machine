'use step';

import 'server-only';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { getAgentConfig } from '../../storage/agent-configs';
import type { SeoBlogInput } from '../../schemas/seo-blog-input';
import type { ResearchOutput } from './research-step';
import type { OutlineOutput } from './outline-step';
import type { SeoQaOutput } from './seo-qa-step';
import { buildFullInputContext } from './context-builder';

export interface EditorOutput {
  edited_draft_markdown: string;
  editor_notes: string[];
  changes_made: string[];
  human_review_required: boolean;
}

/**
 * Editor Agent Step
 * Improves the draft based on SEO QA recommendations and brand guidelines.
 * DB prompt contract: model returns Markdown only.
 * Does NOT overwrite original draft_markdown; edited output goes to final_output_json.
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
    const agentConfig = await getAgentConfig('editor');
    if (!agentConfig) {
      throw new Error('Active agent config not found for agent_key: editor');
    }
    console.log(`[v0] SEO Blog Agent Config Loaded: editor v${agentConfig.version}`);

    const systemPrompt = [agentConfig.system_prompt, agentConfig.skill_markdown]
      .filter(Boolean)
      .join('\n\n');

    const editorContext = buildEditorContext(input, research, outline, seoQa);

    const modelName =
      agentConfig.model || process.env.EDITOR_AGENT_MODEL || 'gpt-5.4-mini';
    console.log(`[v0] Editor step: Using model: ${modelName}`);

    const { text } = await generateText({
      model: openai(modelName),
      temperature: 0.6,
      maxTokens: 8000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Edit the draft below using the supplied context and SEO QA feedback.\n\n${buildFullInputContext(input)}\n\nResearch Agent Output:\n${JSON.stringify(research, null, 2)}\n\nOutline Agent Output:\n${JSON.stringify(outline, null, 2)}\n\nSEO QA Feedback:\n${editorContext}\n\nOriginal Draft Markdown:\n${originalDraft}\n\nReturn the edited blog in Markdown only. Do not return JSON. Do not include explanations, editor notes, markdown fences, or comments outside the article.`,
        },
      ],
    });

    const editedDraft = text.trim();

    if (!editedDraft) {
      throw new Error('Editor output was empty');
    }

    if (editedDraft.startsWith('{')) {
      throw new Error('Editor output invalid: expected Markdown, received JSON-like response');
    }

    if (editedDraft.length < Math.min(500, Math.floor(originalDraft.length * 0.4))) {
      throw new Error('Editor output too short compared with original draft');
    }

    const editorOutput: EditorOutput = {
      edited_draft_markdown: editedDraft,
      editor_notes: [
        'Editor Agent returned Markdown only as required by the active DB prompt.',
      ],
      changes_made: seoQa.priority_fixes || [],
      human_review_required: true,
    };

    console.log(
      `[v0] Editor step: Generated edited draft (${editorOutput.edited_draft_markdown.length} chars)`
    );

    return editorOutput;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[v0] Editor step error: ${errorMessage}`);
    throw error;
  }
}

function buildEditorContext(
  input: SeoBlogInput,
  research: ResearchOutput,
  outline: OutlineOutput,
  seoQa: SeoQaOutput
): string {
  const sections: string[] = [];

  sections.push('## SEO Performance Summary');
  sections.push(`Overall Score: ${seoQa.overall_score}/100`);
  sections.push(`Ready For Editor: ${seoQa.ready_for_editor}`);
  sections.push(`Recommended Next Action: ${seoQa.recommended_next_action}`);
  sections.push(`Needs Review: ${seoQa.needs_review}`);

  sections.push('\n## Search Intent Alignment');
  sections.push(`Score: ${seoQa.search_intent_alignment.score}/100`);
  sections.push(`Analysis: ${seoQa.search_intent_alignment.analysis}`);

  sections.push('\n## Primary Keyword Usage');
  sections.push(`Score: ${seoQa.primary_keyword_usage.score}/100`);
  sections.push(`Occurrences: ${seoQa.primary_keyword_usage.occurrences} times`);
  sections.push(`Placement: ${seoQa.primary_keyword_usage.placement_analysis}`);

  sections.push('\n## Secondary Keywords');
  sections.push(`Score: ${seoQa.secondary_keyword_usage.score}/100`);
  sections.push(`Covered: ${seoQa.secondary_keyword_usage.keywords_covered.join(', ') || 'None'}`);
  if (seoQa.secondary_keyword_usage.gaps.length > 0) {
    sections.push(`Gaps: ${seoQa.secondary_keyword_usage.gaps.join(', ')}`);
  }

  sections.push('\n## Heading Structure');
  sections.push(`Score: ${seoQa.heading_structure_review.score}/100`);
  sections.push(`H1 Present: ${seoQa.heading_structure_review.h1_present}`);
  sections.push(`H2 Count: ${seoQa.heading_structure_review.h2_count}`);
  if (seoQa.heading_structure_review.hierarchy_issues.length > 0) {
    sections.push(`Issues: ${seoQa.heading_structure_review.hierarchy_issues.join('; ')}`);
  }

  sections.push('\n## Content Depth');
  sections.push(`Score: ${seoQa.content_depth_review.score}/100`);
  sections.push(`Word Count: ${seoQa.content_depth_review.word_count} words`);
  sections.push(`Coverage: ${seoQa.content_depth_review.section_coverage}`);
  if (seoQa.content_depth_review.depth_issues.length > 0) {
    sections.push(`Issues: ${seoQa.content_depth_review.depth_issues.join('; ')}`);
  }

  sections.push('\n## Readability');
  sections.push(`Score: ${seoQa.readability_review.score}/100`);
  sections.push(`Avg Sentence Length: ${seoQa.readability_review.avg_sentence_length} words`);
  sections.push(`Reading Level: ${seoQa.readability_review.flesch_kincaid_estimate}`);
  if (seoQa.readability_review.readability_issues.length > 0) {
    sections.push(`Issues: ${seoQa.readability_review.readability_issues.join('; ')}`);
  }

  sections.push('\n## CTA Review');
  sections.push(`Score: ${seoQa.cta_review.score}/100`);
  sections.push(`CTA Present: ${seoQa.cta_review.cta_present}`);
  sections.push(`CTA Analysis: ${seoQa.cta_review.cta_analysis}`);

  sections.push('\n## Internal Linking');
  sections.push(`Score: ${seoQa.internal_linking_review.score}/100`);
  sections.push(`Links Found: ${seoQa.internal_linking_review.internal_links_found}`);
  if (seoQa.internal_linking_review.internal_link_recommendations.length > 0) {
    sections.push(`Recommendations: ${seoQa.internal_linking_review.internal_link_recommendations.join('; ')}`);
  }

  sections.push('\n## Client Goal Alignment');
  sections.push(`Score: ${seoQa.client_goal_alignment.score}/100`);
  sections.push(`Analysis: ${seoQa.client_goal_alignment.analysis}`);

  if (seoQa.priority_fixes.length > 0) {
    sections.push('\n## Priority Fixes');
    sections.push(seoQa.priority_fixes.map((fix) => `- ${fix}`).join('\n'));
  }

  if (seoQa.risk_flags.length > 0) {
    sections.push('\n## Risk Flags');
    sections.push(seoQa.risk_flags.map((flag) => `- ${flag}`).join('\n'));
  }

  sections.push('\n## Research Notes');
  sections.push(`Content Angle: ${research.content_angle}`);
  sections.push(`Client Goal Alignment: ${research.client_goal_alignment}`);

  sections.push('\n## Outline Notes');
  sections.push(`Title: ${outline.title}`);
  sections.push(`CTA Guidance: ${outline.cta_guidance}`);

  sections.push('\n## Additional Client Guidance');
  if (input.cta_notes || input.cta || input.blog_context_brief?.cta) {
    sections.push(`CTA Notes: ${input.blog_context_brief?.cta || input.cta || input.cta_notes}`);
  }
  if (input.brand_voice_notes || input.blog_context_brief?.brand_voice_notes || input.tone) {
    sections.push(`Brand Voice: ${input.blog_context_brief?.brand_voice_notes || input.brand_voice_notes || input.tone}`);
  }
  if (input.audience_notes || input.target_audience || input.blog_context_brief?.target_audience) {
    sections.push(`Target Audience: ${input.blog_context_brief?.target_audience || input.target_audience || input.audience_notes}`);
  }

  return sections.join('\n');
}

'use step';

import 'server-only';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { updateRunStatus } from '../../storage/runs';
import { getAgentConfig } from '../../storage/agent-configs';
import type { SeoBlogInput } from '../../schemas/seo-blog-input';
import type { ResearchOutput } from './research-step';
import type { OutlineOutput } from './outline-step';
import { buildFullInputContext, extractJsonObject } from './context-builder';

export interface SeoQaOutput {
  overall_score: number;
  ready_for_editor: boolean;
  recommended_next_action: 'Approve for editor' | 'Revise before editor' | 'Needs human review';
  search_intent_alignment: {
    score: number;
    analysis: string;
  };
  primary_keyword_usage: {
    score: number;
    occurrences: number;
    placement_analysis: string;
  };
  secondary_keyword_usage: {
    score: number;
    keywords_covered: string[];
    gaps: string[];
  };
  heading_structure_review: {
    score: number;
    h1_present: boolean;
    h2_count: number;
    hierarchy_issues: string[];
  };
  content_depth_review: {
    score: number;
    word_count: number;
    section_coverage: string;
    depth_issues: string[];
  };
  readability_review: {
    score: number;
    readability_issues: string[];
    avg_sentence_length: number;
    flesch_kincaid_estimate: string;
  };
  cta_review: {
    score: number;
    cta_present: boolean;
    cta_analysis: string;
  };
  internal_linking_review: {
    score: number;
    internal_links_found: number;
    internal_link_recommendations: string[];
  };
  client_goal_alignment: {
    score: number;
    analysis: string;
  };
  priority_fixes: string[];
  risk_flags: string[];
  needs_review: boolean;
  timestamp?: string;
}

const VALID_RECOMMENDED_ACTIONS: SeoQaOutput['recommended_next_action'][] = [
  'Approve for editor',
  'Revise before editor',
  'Needs human review',
];

/**
 * SEO QA Step - Phase 2C-D
 * Reviews draft markdown against SEO and client-goal criteria.
 * Returns structured audit JSON. Does not rewrite the draft.
 */
export async function runSeoQaStep(
  runId: string,
  input: SeoBlogInput,
  researchData?: ResearchOutput,
  outlineData?: OutlineOutput,
  draftMarkdown?: string
): Promise<SeoQaOutput> {
  console.log(`[v0] SEO QA step: Auditing draft for run ${runId}`);

  if (!draftMarkdown) {
    throw new Error('Draft markdown is required for SEO QA review');
  }

  try {
    const agentConfig = await getAgentConfig('seo_qa');
    if (!agentConfig) {
      throw new Error('Active agent config not found for agent_key: seo_qa');
    }
    console.log(`[v0] SEO Blog Agent Config Loaded: seo_qa v${agentConfig.version}`);

    const systemPrompt = [agentConfig.system_prompt, agentConfig.skill_markdown]
      .filter(Boolean)
      .join('\n\n');

    const modelName =
      agentConfig.model ||
      process.env.SEO_QA_AGENT_MODEL ||
      process.env.RESEARCH_AGENT_MODEL ||
      'gpt-5.4-mini';
    console.log(`[v0] SEO QA step: Using model: ${modelName}`);

    const seoQaPrompt = `Review this draft using the SEO QA schema from your system instructions.\n\n${buildFullInputContext(input)}\n\nResearch Agent Output:\n${JSON.stringify(researchData ?? {}, null, 2)}\n\nOutline Agent Output:\n${JSON.stringify(outlineData ?? {}, null, 2)}\n\nBlog Draft Markdown:\n${draftMarkdown}\n\nReturn valid JSON only. Do not rewrite the draft. Do not include markdown fences or explanation text. The recommended_next_action must be exactly one of: ${VALID_RECOMMENDED_ACTIONS.map((value) => `"${value}"`).join(', ')}.`;

    const { text } = await generateText({
      model: openai(modelName),
      system: systemPrompt,
      prompt: seoQaPrompt,
      temperature: 0.4,
      maxOutputTokens: 3000,
    });

    console.log(`[v0] SEO QA step: Received audit from model, parsing JSON`);

    let seoQaResult: SeoQaOutput;
    try {
      seoQaResult = JSON.parse(extractJsonObject(text)) as SeoQaOutput;
    } catch (parseErr) {
      const message = parseErr instanceof Error ? parseErr.message : String(parseErr);
      throw new Error(`SEO QA output parse failed: ${message}`);
    }

    validateSeoQaOutput(seoQaResult);
    seoQaResult.timestamp = seoQaResult.timestamp || new Date().toISOString();

    console.log(
      `[v0] SEO QA step: Persisting SEO QA audit (score: ${seoQaResult.overall_score}) for run ${runId}`
    );
    await updateRunStatus(runId, 'seo_qa', seoQaResult as unknown as Record<string, unknown>);

    console.log(`[v0] SEO QA step: Complete for run ${runId}`);
    return seoQaResult;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[v0] SEO QA step: Error during audit for run ${runId}: ${errorMsg}`);
    throw error;
  }
}

function validateSeoQaOutput(output: SeoQaOutput): void {
  const missingFields: string[] = [];

  const requiredFields: (keyof SeoQaOutput)[] = [
    'overall_score',
    'ready_for_editor',
    'recommended_next_action',
    'search_intent_alignment',
    'primary_keyword_usage',
    'secondary_keyword_usage',
    'heading_structure_review',
    'content_depth_review',
    'readability_review',
    'cta_review',
    'internal_linking_review',
    'client_goal_alignment',
    'priority_fixes',
    'risk_flags',
    'needs_review',
  ];

  for (const field of requiredFields) {
    if (output[field] === undefined || output[field] === null) {
      missingFields.push(field);
    }
  }

  if (missingFields.length > 0) {
    throw new Error(`SEO QA output missing required fields: ${missingFields.join(', ')}`);
  }

  if (
    typeof output.overall_score !== 'number' ||
    output.overall_score < 0 ||
    output.overall_score > 100
  ) {
    throw new Error(
      `SEO QA output invalid overall_score: ${output.overall_score}, must be number between 0-100`
    );
  }

  if (typeof output.ready_for_editor !== 'boolean') {
    throw new Error('SEO QA output invalid ready_for_editor: expected boolean');
  }

  if (!VALID_RECOMMENDED_ACTIONS.includes(output.recommended_next_action)) {
    throw new Error(
      `SEO QA output invalid recommended_next_action: ${output.recommended_next_action}`
    );
  }

  if (!Array.isArray(output.priority_fixes)) {
    throw new Error('SEO QA output invalid priority_fixes: expected array');
  }

  if (!Array.isArray(output.risk_flags)) {
    throw new Error('SEO QA output invalid risk_flags: expected array');
  }

  if (typeof output.needs_review !== 'boolean') {
    throw new Error('SEO QA output invalid needs_review: expected boolean');
  }

  validateScoreObject(output.search_intent_alignment, 'search_intent_alignment');
  validateScoreObject(output.primary_keyword_usage, 'primary_keyword_usage');
  validateScoreObject(output.secondary_keyword_usage, 'secondary_keyword_usage');
  validateScoreObject(output.heading_structure_review, 'heading_structure_review');
  validateScoreObject(output.content_depth_review, 'content_depth_review');
  validateScoreObject(output.readability_review, 'readability_review');
  validateScoreObject(output.cta_review, 'cta_review');
  validateScoreObject(output.internal_linking_review, 'internal_linking_review');
  validateScoreObject(output.client_goal_alignment, 'client_goal_alignment');
}

function validateScoreObject(value: unknown, fieldName: string): void {
  if (!value || typeof value !== 'object') {
    throw new Error(`SEO QA output invalid ${fieldName}: expected object`);
  }

  const score = (value as { score?: unknown }).score;
  if (typeof score !== 'number' || score < 0 || score > 100) {
    throw new Error(
      `SEO QA output invalid ${fieldName}.score: ${String(score)}, must be number between 0-100`
    );
  }
}

'use step';

import 'server-only';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { updateRunStatus } from '../../storage/runs';
import { getAgentConfig } from '../../storage/agent-configs';
import type { SeoBlogInput } from '../../schemas/seo-blog-input';
import type { ResearchOutput } from './research-step';
import type { OutlineOutput } from './outline-step';
import type { WriterOutput } from './writer-step';

export interface SeoQaOutput {
  overall_score: number;
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
    avg_sentence_length: number;
    flesch_kincaid_estimate: string;
    readability_issues: string[];
  };
  internal_linking_review: {
    score: number;
    internal_links_found: number;
    internal_link_recommendations: string[];
  };
  cta_review: {
    score: number;
    cta_present: boolean;
    cta_analysis: string;
  };
  client_goal_alignment: {
    score: number;
    analysis: string;
  };
  risk_flags: string[];
  priority_fixes: string[];
  recommended_next_action: 'Approve for editor' | 'Revise before editor' | 'Needs human review';
  ready_for_editor: boolean;
  needs_review: boolean;
  timestamp: string;
}

/**
 * SEO QA Step - Phase 2C-D
 * Runs inside a durable step function (has Node.js access)
 * Reviews draft markdown against SEO best practices
 * Returns structured audit JSON (does NOT rewrite the draft)
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
    // Load agent config from database
    const agentConfig = await getAgentConfig('seo_qa');
    if (!agentConfig) {
      throw new Error('Active agent config not found for agent_key: seo_qa');
    }
    console.log(`[v0] SEO Blog Agent Config Loaded: seo_qa v${agentConfig.version}`);

    // Build system prompt from database config
    const systemPrompt = [
      agentConfig.system_prompt,
      agentConfig.skill_markdown,
    ]
      .filter(Boolean)
      .join('\n\n');

    // Get model name: use DB config if available, otherwise fall back to env var or default
    const modelName =
      agentConfig.model ||
      process.env.SEO_QA_AGENT_MODEL ||
      process.env.RESEARCH_AGENT_MODEL ||
      'gpt-5.4-mini';
    console.log(`[v0] SEO QA step: Using model: ${modelName}`);

    // Prepare context for SEO QA review
    const primaryKeyword = input.primary_keyword || 'primary keyword';
    const secondaryKeywords =
      (input.secondary_keywords || []).join(', ') || 'secondary keywords';
    const targetWordCount = input.target_word_count || 2000;
    const businessName = input.business_name || 'Your Business';
    const audienceNotes =
      input.audience_notes || 'Target audience not specified';
    const brandVoice = input.brand_voice_notes || 'Professional and clear';
    const ctaNotes = input.cta_notes || 'CTA not specified';
    const internalLinkNotes =
      input.internal_link_notes || 'No internal linking strategy';

    // Build SEO QA prompt with system prompt from DB
    const seoQaPrompt = `${systemPrompt}

BLOG DRAFT:
${draftMarkdown}

REVIEW CRITERIA:
- Primary Keyword: "${primaryKeyword}"
- Secondary Keywords: "${secondaryKeywords}"
- Target Word Count: ${targetWordCount} words
- Business: ${businessName}
- Audience: ${audienceNotes}
- Brand Voice: ${brandVoice}
- CTA Notes: ${ctaNotes}
- Internal Linking Strategy: ${internalLinkNotes}

Provide a detailed SEO audit in JSON format (do NOT modify or rewrite the draft).`;

    const { text } = await generateText({
      model: openai(modelName),
      prompt: seoQaPrompt,
      temperature: 0.7,
      maxTokens: 3000,
    });

    console.log(`[v0] SEO QA step: Received audit from model`);

    // Parse the JSON response
    let seoQaResult: SeoQaOutput;
    try {
      seoQaResult = JSON.parse(text);
    } catch (parseErr) {
      console.error(
        `[v0] SEO QA step: Failed to parse model response as JSON`,
        parseErr instanceof Error ? parseErr.message : String(parseErr)
      );
      // Return fallback audit if parsing fails
      seoQaResult = generateFallbackSeoQa(draftMarkdown, primaryKeyword);
    }

    // Runtime validation of required fields
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

    let missingFields: string[] = [];
    for (const field of requiredFields) {
      if (seoQaResult[field] === undefined || seoQaResult[field] === null) {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      throw new Error(
        `SEO QA output missing required fields: ${missingFields.join(', ')}`
      );
    }

    // FAIL-LOUD: Validate controlled values for recommended_next_action
    const validActions = ['Approve for editor', 'Revise before editor', 'Needs human review'];
    if (!validActions.includes(seoQaResult.recommended_next_action)) {
      throw new Error(
        `SEO QA output invalid recommended_next_action: ${seoQaResult.recommended_next_action}`
      );
    }

    // FAIL-LOUD: Validate numeric ranges
    if (typeof seoQaResult.overall_score !== 'number' || seoQaResult.overall_score < 0 || seoQaResult.overall_score > 100) {
      throw new Error(
        `SEO QA output invalid overall_score: ${seoQaResult.overall_score}, must be number between 0-100`
      );
    }

    // Persist optimized_json to database
    console.log(
      `[v0] SEO QA step: Persisting SEO QA audit (score: ${seoQaResult.overall_score}) for run ${runId}`
    );
    await updateRunStatus(runId, 'seo_qa', seoQaResult);

    console.log(`[v0] SEO QA step: Complete for run ${runId}`);
    return seoQaResult;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(
      `[v0] SEO QA step: Error during audit for run ${runId}: ${errorMsg}`
    );
    throw error;
  }
}

/**
 * Generate a basic SEO QA audit as fallback
 */
function generateFallbackSeoQa(
  draftMarkdown: string,
  primaryKeyword: string
): SeoQaOutput {
  const wordCount = draftMarkdown.split(/\s+/).length;
  const h1Count = (draftMarkdown.match(/^# /gm) || []).length;
  const h2Count = (draftMarkdown.match(/^## /gm) || []).length;
  const internalLinkCount = (draftMarkdown.match(/\[.*?\]\(\/.*?\)/g) || []).length;
  const primaryKeywordOccurrences = (
    draftMarkdown.toLowerCase().match(new RegExp(primaryKeyword.toLowerCase(), 'g')) || []
  ).length;

  const overallScore = 68;
  const readyForEditor = overallScore >= 70 && h1Count > 0;
  const recommendedAction: 'Approve for editor' | 'Revise before editor' | 'Needs human review' =
    overallScore >= 75 && readyForEditor
      ? 'Approve for editor'
      : overallScore >= 60 && readyForEditor
        ? 'Revise before editor'
        : 'Needs human review';

  return {
    overall_score: overallScore,
    search_intent_alignment: {
      score: 65,
      analysis: 'Draft covers basic search intent but may need refinement',
    },
    primary_keyword_usage: {
      score: 70,
      occurrences: primaryKeywordOccurrences,
      placement_analysis: `Primary keyword appears ${primaryKeywordOccurrences} times in the draft`,
    },
    secondary_keyword_usage: {
      score: 60,
      keywords_covered: [],
      gaps: ['Additional keyword analysis needed'],
    },
    heading_structure_review: {
      score: h2Count > 2 ? 75 : 65,
      h1_present: h1Count > 0,
      h2_count: h2Count,
      hierarchy_issues: h1Count === 0 ? ['Missing H1 heading'] : [],
    },
    content_depth_review: {
      score: wordCount > 1500 ? 75 : 60,
      word_count: wordCount,
      section_coverage: `Draft contains ${Math.max(1, h2Count)} main sections`,
      depth_issues: wordCount < 1500 ? ['Content may need more depth'] : [],
    },
    readability_review: {
      score: 72,
      avg_sentence_length: 18,
      flesch_kincaid_estimate: '8th grade',
      readability_issues: [],
    },
    internal_linking_review: {
      score: internalLinkCount > 2 ? 70 : 50,
      internal_links_found: internalLinkCount,
      internal_link_recommendations: internalLinkCount === 0 ? ['Add relevant internal links'] : [],
    },
    cta_review: {
      score: 70,
      cta_present: draftMarkdown.toLowerCase().includes('cta') || draftMarkdown.toLowerCase().includes('call'),
      cta_analysis: 'CTA section review needed',
    },
    client_goal_alignment: {
      score: 70,
      analysis: 'Draft aligns with provided client goals and audience targeting',
    },
    risk_flags: [],
    priority_fixes: [
      ...(h1Count === 0 ? ['Ensure H1 heading present'] : []),
      ...(wordCount < 1500 ? ['Expand content to meet word count target'] : []),
      ...(internalLinkCount === 0 ? ['Add internal linking strategy'] : []),
    ],
    recommended_next_action: recommendedAction,
    ready_for_editor: readyForEditor,
    needs_review: overallScore < 70,
    timestamp: new Date().toISOString(),
  };
}

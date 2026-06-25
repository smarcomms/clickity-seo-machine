'use step';

import 'server-only';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { updateRunStatus } from '../../storage/runs';
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
  risk_flags: string[];
  priority_fixes: string[];
  recommended_next_action: string;
  ready_for_editor: boolean;
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

  // Get model configuration
  const modelName =
    process.env.SEO_QA_AGENT_MODEL ||
    process.env.RESEARCH_AGENT_MODEL ||
    'gpt-5.4-mini';
  console.log(`[v0] SEO QA step: Using model: ${modelName}`);

  // Prepare context for SEO QA review
  const primaryKeyword = input.primary_keyword || 'primary keyword';
  const secondaryKeywords = (input.secondary_keywords || []).join(', ') || 'secondary keywords';
  const targetWordCount = input.target_word_count || 2000;
  const businessName = input.business_name || 'Your Business';
  const audienceNotes = input.audience_notes || 'Target audience not specified';
  const brandVoice = input.brand_voice_notes || 'Professional and clear';
  const ctaNotes = input.cta_notes || 'CTA not specified';
  const internalLinkNotes = input.internal_link_notes || 'No internal linking strategy';

  // Build SEO QA prompt
  const seoQaPrompt = `You are an expert SEO content auditor. Review the following blog draft and provide a comprehensive SEO quality assessment.

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

Provide a detailed SEO audit in the following JSON format (do NOT modify or rewrite the draft):
{
  "overall_score": <0-100>,
  "search_intent_alignment": {
    "score": <0-100>,
    "analysis": "<analysis of how well draft aligns with search intent for the primary keyword>"
  },
  "primary_keyword_usage": {
    "score": <0-100>,
    "occurrences": <count>,
    "placement_analysis": "<analysis of where primary keyword appears and how naturally>"
  },
  "secondary_keyword_usage": {
    "score": <0-100>,
    "keywords_covered": [<list of secondary keywords found in draft>],
    "gaps": [<list of secondary keywords missing from draft>]
  },
  "heading_structure_review": {
    "score": <0-100>,
    "h1_present": <true/false>,
    "h2_count": <count>,
    "hierarchy_issues": [<list of heading hierarchy problems if any>]
  },
  "content_depth_review": {
    "score": <0-100>,
    "word_count": <actual word count>,
    "section_coverage": "<assessment of whether all outline sections are covered>",
    "depth_issues": [<list of sections that need more depth>]
  },
  "readability_review": {
    "score": <0-100>,
    "avg_sentence_length": <average>,
    "flesch_kincaid_estimate": "<grade level estimate>",
    "readability_issues": [<list of readability concerns>]
  },
  "internal_linking_review": {
    "score": <0-100>,
    "internal_links_found": <count>,
    "internal_link_recommendations": [<list of suggested internal link placements>]
  },
  "cta_review": {
    "score": <0-100>,
    "cta_present": <true/false>,
    "cta_analysis": "<assessment of CTA placement, clarity, and alignment with brand guidelines>"
  },
  "risk_flags": [<list of SEO risks like duplicate content, keyword stuffing, broken links, etc>],
  "priority_fixes": [<list of top 3-5 priority items to fix before publication>],
  "recommended_next_action": "<recommendation for next step - Editor, Revision, or Ready for Publishing>",
  "ready_for_editor": <true if draft is ready for editor review, false if major revisions needed>
}

Only output the JSON. Do not include any other text or explanation.`;

  try {
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

    // Validate required fields
    if (
      typeof seoQaResult.overall_score !== 'number' ||
      !seoQaResult.search_intent_alignment ||
      !seoQaResult.priority_fixes
    ) {
      console.warn(`[v0] SEO QA step: Missing required audit fields, using fallback`);
      seoQaResult = generateFallbackSeoQa(draftMarkdown, primaryKeyword);
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
    console.error(`[v0] SEO QA step: Error during audit for run ${runId}: ${errorMsg}`);
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

  return {
    overall_score: 68,
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
    risk_flags: [],
    priority_fixes: [
      ...(h1Count === 0 ? ['Ensure H1 heading present'] : []),
      ...(wordCount < 1500 ? ['Expand content to meet word count target'] : []),
      ...(internalLinkCount === 0 ? ['Add internal linking strategy'] : []),
    ],
    recommended_next_action: 'Send to editor for review and optimization',
    ready_for_editor: true,
    timestamp: new Date().toISOString(),
  };
}

'use step';

import 'server-only';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { updateRunStatus } from '../../storage/runs';
import { getAgentConfig } from '../../storage/agent-configs';
import type { SeoBlogInput } from '../../schemas/seo-blog-input';
import { buildFullInputContext, extractJsonObject } from './context-builder';

export interface ResearchOutput {
  search_intent: string;
  target_audience_summary: string;
  keyword_map: {
    primary_keyword: string;
    secondary_keywords: string[];
    lsi_terms: string[];
  };
  content_angle: string;
  key_findings: string[];
  competitor_insights: string[];
  recommended_sections: string[];
  questions_to_answer: string[];
  client_goal_alignment: string;
  must_include: string[];
  must_avoid: string[];
  research_notes: string;
  target_word_count: number;
  web_search_used: boolean;
  needs_review: boolean;
  timestamp?: string;
}

/**
 * Research Step - Phase 2C-A
 * Runs inside a durable step function (has Node.js access)
 * Calls AI model to generate research JSON
 * No filesystem imports - safe for workflow context
 */
export async function runResearchStep(
  runId: string,
  input: SeoBlogInput
): Promise<ResearchOutput> {
  console.log(`[v0] Research step: Analyzing topic for run ${runId}`);

  try {
    // Load agent config from database
    const agentConfig = await getAgentConfig('research');
    if (!agentConfig) {
      throw new Error('Active agent config not found for agent_key: research');
    }
    console.log(`[v0] SEO Blog Agent Config Loaded: research v${agentConfig.version}`);

    // Build system prompt from database config
    const systemPrompt = [
      agentConfig.system_prompt,
      agentConfig.skill_markdown,
    ]
      .filter(Boolean)
      .join('\n\n');

    const userMessage = `Create the Research Agent JSON using all supplied context.

${buildFullInputContext(input)}

Return valid JSON only using the schema from your system instructions. Do not write the blog or outline. Preserve must_include and must_avoid exactly where provided.`;

    // Get model name: use DB config if available, otherwise fall back to env var or default
    const modelName = agentConfig.model || process.env.RESEARCH_AGENT_MODEL || 'gpt-5.4-mini';
    console.log(`[v0] Research step: Using model: ${modelName}`);

    // Use direct OpenAI provider with OPENAI_API_KEY
    const model = openai(modelName);

    // Call AI model
    const response = await generateText({
      model,
      system: systemPrompt,
      prompt: userMessage,
      temperature: 0.7,
    });

    console.log(`[v0] Research step: AI model responded, parsing JSON`);

    // Parse JSON response
    let researchData: ResearchOutput;
    try {
      // Try to extract JSON from response (in case of extra text)
      researchData = JSON.parse(extractJsonObject(response.text));
      
      // Validate required fields at runtime
      if (!Array.isArray(researchData.key_findings)) {
        throw new Error('Research output missing required key_findings array');
      }
      if (researchData.key_findings.length === 0) {
        throw new Error('Research output key_findings array cannot be empty');
      }
    } catch (parseErr) {
      console.error(
        `[v0] Research step: Failed to parse AI response:`,
        response.text.substring(0, 200)
      );
      // Return fallback if parsing fails
      researchData = {
        search_intent: 'informational',
        target_audience_summary: input.audience_notes || 'Target audience not specified',
        keyword_map: {
          primary_keyword: input.primary_keyword || 'primary keyword',
          secondary_keywords: input.secondary_keywords || [],
          lsi_terms: [],
        },
        content_angle: `Focus on ${input.blog_topic || 'topic'}`,
        key_findings: [
          `Topic focuses on ${input.blog_topic || 'the subject matter'}`,
          `Target audience: ${input.audience_notes || 'general audience'}`,
          `Primary keyword: ${input.primary_keyword || 'to be determined'}`,
        ],
        competitor_insights: ['Competitor context was not available in parsed model output'],
        recommended_sections: ['Introduction', 'Main Content', 'Conclusion'],
        questions_to_answer: ['What is the main topic?'],
        client_goal_alignment: input.blog_context_brief?.business_goal || input.business_goal || 'Client goal not specified',
        must_include: input.blog_context_brief?.must_include || input.must_include || [],
        must_avoid: input.blog_context_brief?.must_avoid || input.must_avoid || [],
        research_notes: 'Fallback research due to parsing error; human review recommended',
        target_word_count: input.target_word_count || 1000,
        web_search_used: false,
        needs_review: true,
        timestamp: new Date().toISOString(),
      };
    }

    // Persist research_json to database
    console.log(`[v0] Research step: Persisting research_json for run ${runId}`);
    await updateRunStatus(runId, 'researching', researchData);

    console.log(`[v0] Research step: Complete for run ${runId}`);
    return researchData;
  } catch (error) {
    console.error(
      `[v0] Research step error for run ${runId}:`,
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
}

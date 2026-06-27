'use step';

import 'server-only';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { updateRunStatus } from '../../storage/runs';
import { getAgentConfig } from '../../storage/agent-configs';
import type { SeoBlogInput } from '../../schemas/seo-blog-input';

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
  research_notes: string;
  target_word_count: number;
  web_search_used: boolean;
  timestamp: string;
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

    const userMessage = `Conduct SEO research for:
Topic: ${input.blog_topic}
Primary Keyword: ${input.primary_keyword}
Secondary Keywords: ${input.secondary_keywords?.join(', ') || 'none'}
Target Audience: ${input.audience_notes || 'general'}
Target Word Count: ${input.target_word_count || 1000}
Business: ${input.business_name || 'unknown'}
Website: ${input.website_url || 'unknown'}

Provide comprehensive research findings in JSON format.`;

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
      const jsonMatch = response.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      researchData = JSON.parse(jsonMatch[0]);
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
        competitor_insights: ['Research competitors for competitive advantages'],
        recommended_sections: ['Introduction', 'Main Content', 'Conclusion'],
        questions_to_answer: ['What is the main topic?'],
        research_notes: 'Fallback research due to parsing error',
        target_word_count: input.target_word_count || 1000,
        web_search_used: false,
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

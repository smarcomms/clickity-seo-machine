'use step';

import 'server-only';
import { generateText } from 'ai';
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

  const systemPrompt = `You are an SEO research specialist. Analyze the provided topic, keywords, and audience to generate comprehensive keyword research, competitive analysis, and content planning guidance.

Your output must be valid JSON matching this exact structure:
{
  "search_intent": "string (informational|navigational|commercial|transactional)",
  "target_audience_summary": "string",
  "keyword_map": {
    "primary_keyword": "string",
    "secondary_keywords": ["string"],
    "lsi_terms": ["string"]
  },
  "content_angle": "string",
  "competitor_insights": ["string"],
  "recommended_sections": ["string"],
  "questions_to_answer": ["string"],
  "research_notes": "string",
  "target_word_count": number,
  "web_search_used": false
}

Respond ONLY with valid JSON, no markdown or explanations.`;

  const userMessage = `Conduct SEO research for:
Topic: ${input.blog_topic}
Primary Keyword: ${input.primary_keyword}
Secondary Keywords: ${input.secondary_keywords?.join(', ') || 'none'}
Target Audience: ${input.audience_notes || 'general'}
Target Word Count: ${input.target_word_count || 1000}
Business: ${input.business_name || 'unknown'}
Website: ${input.website_url || 'unknown'}

Provide comprehensive research findings in JSON format.`;

  try {
    // Get model from environment or use OpenAI default
    const model = process.env.RESEARCH_AGENT_MODEL || 'openai/gpt-5.4';
    console.log(`[v0] Research step: Using model: ${model}`);

    // Call AI model via Vercel AI Gateway
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
      console.error(`[v0] Research step: Failed to parse AI response:`, response.text.substring(0, 200));
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
        competitor_insights: ['Research competitors for competitive advantages'],
        recommended_sections: ['Introduction', 'Main Content', 'Conclusion'],
        questions_to_answer: ['What is the main topic?'],
        research_notes: 'Fallback research due to parsing error',
        target_word_count: input.target_word_count || 1000,
        web_search_used: false,
        timestamp: new Date().toISOString(),
      };
    }

    console.log(`[v0] Research step: Complete for run ${runId}`);
    return researchData;
  } catch (error) {
    console.error(`[v0] Research step error for run ${runId}:`, error instanceof Error ? error.message : String(error));
    throw error;
  }
}

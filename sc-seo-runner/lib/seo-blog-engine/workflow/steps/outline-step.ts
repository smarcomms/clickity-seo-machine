'use step';

import 'server-only';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { updateRunStatus } from '../../storage/runs';
import { getAgentConfig } from '../../storage/agent-configs';
import type { SeoBlogInput } from '../../schemas/seo-blog-input';
import { buildFullInputContext, extractJsonObject } from './context-builder';

export interface Section {
  heading: string;
  purpose: string;
  estimated_words: number;
  key_points: string[];
  seo_notes: string[];
  client_goal_notes: string[];
}

export interface OutlineOutput {
  title: string;
  meta_angle: string;
  target_word_count: number;
  sections: Section[];
  intro_guidance: string;
  conclusion_guidance: string;
  cta_guidance: string;
  internal_link_opportunities: string[];
  notes_for_writer: string[];
  needs_review: boolean;
  timestamp?: string;
}

/**
 * Outline Step - Phase 2C-B
 * Runs inside a durable step function (has Node.js access)
 * Calls AI model to generate content outline with structure
 * Uses research data if available to inform outline
 */
export async function runOutlineStep(
  runId: string,
  input: SeoBlogInput,
  researchData?: Record<string, any>
): Promise<OutlineOutput> {
  console.log(`[v0] Outline step: Creating outline for run ${runId}`);

  // Create context from available data (needed for fallback in catch block)
  const topic = input.blog_topic || input.topic || 'Your Topic';
  const primaryKeyword = input.primary_keyword || 'primary keyword';
  const secondaryKeywords =
    (input.secondary_keywords || input.keywords || []).join(', ') ||
    'secondary keywords';
  const businessName = input.business_name || 'Your Business';
  const audienceNotes =
    input.audience_notes || 'Target audience not specified';
  const brandVoice = input.brand_voice_notes || 'Professional and clear';
  const ctaNotes = input.cta_notes || 'Encourage engagement';
  const additionalNotes = input.additional_order_notes || 'No additional notes';
  const targetWordCount = input.target_word_count || 1500;

  try {
    // Load agent config from database
    const agentConfig = await getAgentConfig('outline');
    if (!agentConfig) {
      throw new Error('Active agent config not found for agent_key: outline');
    }
    console.log(`[v0] SEO Blog Agent Config Loaded: outline v${agentConfig.version}`);

    // Build system prompt from database config
    const systemPrompt = [
      agentConfig.system_prompt,
      agentConfig.skill_markdown,
    ]
      .filter(Boolean)
      .join('\n\n');

    // Include research insights if available
    let researchContext = '';
    if (researchData) {
      researchContext = `

Research Insights from Research Agent:
- Search Intent: ${researchData.search_intent || 'N/A'}
- Content Angle: ${researchData.content_angle || 'N/A'}
- Target Audience: ${researchData.target_audience_summary || 'N/A'}
- Recommended Sections: ${researchData.recommended_sections?.join(', ') || 'N/A'}
- Questions to Answer: ${researchData.questions_to_answer?.join(', ') || 'N/A'}`;
    }

    const userMessage = `Create the Outline Agent JSON using the supplied Research Agent output and full Blog Context Brief.

${buildFullInputContext(input)}${researchContext}

Return valid JSON only using the schema from your system instructions. Preserve must_include and must_avoid restrictions, and include client_goal_notes for each section.`;

    // Get model name: use DB config if available, otherwise fall back to env var or default
    const modelName =
      agentConfig.model ||
      process.env.OUTLINE_AGENT_MODEL ||
      process.env.RESEARCH_AGENT_MODEL ||
      'gpt-5.4-mini';
    console.log(`[v0] Outline step: Using model: ${modelName}`);

    // Use direct OpenAI provider
    const model = openai(modelName);

    // Call AI model
    const response = await generateText({
      model,
      system: systemPrompt,
      prompt: userMessage,
      temperature: 0.7,
    });

    console.log(
      `[v0] Outline step: Raw response length: ${response.text.length}`
    );

    // Parse the JSON response
    const outlineData = JSON.parse(extractJsonObject(response.text)) as OutlineOutput;

    // Validate required fields and add defaults
    outlineData.timestamp = outlineData.timestamp || new Date().toISOString();
    outlineData.target_word_count = outlineData.target_word_count || targetWordCount;

    // Ensure sections array exists
    if (!outlineData.sections || !Array.isArray(outlineData.sections)) {
      outlineData.sections = [
        {
          heading: 'Introduction',
          purpose: 'Introduce topic and set context',
          estimated_words: 150,
          key_points: ['Topic overview', 'Why this matters'],
          seo_notes: ['Include primary keyword naturally'],
          client_goal_notes: ['Connect the topic to the supplied client goal where relevant'],
        },
        {
          heading: 'Main Content',
          purpose: 'Detailed exploration of topic',
          estimated_words: 1000,
          key_points: ['Key insight 1', 'Key insight 2', 'Key insight 3'],
          seo_notes: ['Use secondary keywords', 'Answer user intent questions'],
          client_goal_notes: ['Use supplied business goal and services without inventing claims'],
        },
        {
          heading: 'Conclusion',
          purpose: 'Summarize and call to action',
          estimated_words: 150,
          key_points: ['Summary of key points', 'Call to action'],
          seo_notes: ['Reinforce primary keyword'],
          client_goal_notes: ['Close with the supplied CTA direction'],
        },
      ];
    }


    outlineData.sections = outlineData.sections.map((section) => ({
      ...section,
      key_points: Array.isArray(section.key_points) ? section.key_points : [],
      seo_notes: Array.isArray(section.seo_notes) ? section.seo_notes : [],
      client_goal_notes: Array.isArray(section.client_goal_notes) ? section.client_goal_notes : [],
      estimated_words: typeof section.estimated_words === 'number' ? section.estimated_words : 0,
    }));

    outlineData.needs_review = Boolean(outlineData.needs_review);

    console.log(
      `[v0] Outline step: Generated outline with ${outlineData.sections.length} sections`
    );
    // Persist outline_json to database
    console.log(`[v0] Outline step: Persisting outline_json for run ${runId}`);
    await updateRunStatus(runId, 'outlining', outlineData);

    return outlineData;
  } catch (error) {
    console.error(
      `[v0] Outline step error:`,
      error instanceof Error ? error.message : String(error)
    );

    // Return fallback outline if parsing or AI call fails
    const fallbackOutline: OutlineOutput = {
      title: `${topic} - Comprehensive Guide | ${businessName}`,
      meta_angle: `Everything you need to know about ${topic} for ${businessName}`,
      target_word_count: targetWordCount,
      sections: [
        {
          heading: 'Introduction: Understanding the Basics',
          purpose: 'Set context and introduce the topic',
          estimated_words: 200,
          key_points: [
            `Overview of ${topic}`,
            'Why this topic matters to your audience',
            'What you will learn',
          ],
          seo_notes: ['Include primary keyword in first paragraph', 'Use engaging hook'],
          client_goal_notes: ['Introduce why this topic matters for the supplied audience and business goal'],
        },
        {
          heading: 'Key Concepts and Benefits',
          purpose: 'Explore core concepts and advantages',
          estimated_words: 400,
          key_points: [
            'Core concept 1',
            'Core concept 2',
            'How businesses benefit',
            'Real-world applications',
          ],
          seo_notes: ['Use secondary keywords naturally', 'Answer common questions'],
          client_goal_notes: ['Tie benefits back to the supplied service or CTA only when supported'],
        },
        {
          heading: 'Best Practices and Implementation',
          purpose: 'Provide actionable guidance',
          estimated_words: 500,
          key_points: [
            'Step-by-step implementation',
            'Best practices in the industry',
            'Common mistakes to avoid',
            'Tools and resources',
          ],
          seo_notes: ['Use long-tail keywords', 'Include practical examples'],
          client_goal_notes: ['Keep recommendations grounded in the supplied context'],
        },
        {
          heading: 'Conclusion and Next Steps',
          purpose: 'Summarize and guide reader action',
          estimated_words: 150,
          key_points: [
            'Key takeaways',
            'Recommended next steps',
            'Call to action',
          ],
          seo_notes: ['Reinforce primary keyword', 'Create urgency for CTA'],
          client_goal_notes: ['Use the supplied CTA direction without inventing offers'],
        },
      ],
      intro_guidance: `Start with a compelling hook that addresses the reader's pain point. Introduce ${topic} in the context of ${businessName} and explain why it matters to the target audience. Include the primary keyword "${primaryKeyword}" naturally in the first 100 words.`,
      conclusion_guidance: `Summarize the main takeaways from each section. Reinforce how understanding ${topic} benefits the reader. Include a clear, compelling call-to-action that guides the reader on next steps. End with the primary keyword naturally incorporated.`,
      cta_guidance: `${ctaNotes}. Ensure the CTA is clear, specific, and relevant to the article content. Examples: "Schedule a consultation," "Download our guide," "Get started today," "Join our community."`,
      internal_link_opportunities: [
        'Link to relevant service pages on company website',
        'Link to related blog posts on similar topics',
        'Link to case studies or success stories',
        'Link to resource pages or tools',
      ],
      needs_review: true,
      notes_for_writer: [
        `Remember to maintain a ${brandVoice} tone throughout`,
        `Address the needs of: ${audienceNotes}`,
        `Ensure the content is well-researched and includes specific examples`,
        `Use subheadings to improve readability and SEO`,
        `Include relevant data, statistics, or research findings where appropriate`,
        `End with a strong CTA aligned with: ${ctaNotes}`,
      ],
      timestamp: new Date().toISOString(),
    };

    console.log(`[v0] Outline step: Using fallback outline due to error`);
    return fallbackOutline;
  }
}

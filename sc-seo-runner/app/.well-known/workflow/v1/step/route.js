// biome-ignore-all lint: generated file
/* eslint-disable */

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// node_modules/.pnpm/workflow@4.5.0_@nestjs+common@11.1.27_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+core@1_a9c1aa6c0b580e9bf3bff64c3269fe43/node_modules/workflow/dist/internal/builtins.js
import { registerStepFunction } from "workflow/internal/private";
async function __builtin_response_array_buffer() {
  return this.arrayBuffer();
}
__name(__builtin_response_array_buffer, "__builtin_response_array_buffer");
async function __builtin_response_json() {
  return this.json();
}
__name(__builtin_response_json, "__builtin_response_json");
async function __builtin_response_text() {
  return this.text();
}
__name(__builtin_response_text, "__builtin_response_text");
registerStepFunction("__builtin_response_array_buffer", __builtin_response_array_buffer);
registerStepFunction("__builtin_response_json", __builtin_response_json);
registerStepFunction("__builtin_response_text", __builtin_response_text);

// lib/seo-blog-engine/workflow/steps/callback-step.ts
import { registerStepFunction as registerStepFunction2 } from "workflow/internal/private";
import { getRun } from "../../../../../lib/seo-blog-engine/storage/runs.ts";
async function sendCallbackStep(runId) {
  try {
    const run = await getRun(runId);
    if (!run) {
      console.warn(`[v0] Callback: Run ${runId} not found`);
      return;
    }
    if (!run.callback_url) {
      console.log(`[v0] Callback: No callback URL for run ${runId}`);
      return;
    }
    console.log(`[v0] Callback: Sending notification to ${run.callback_url}`);
    const callbackPayload = buildCallbackPayload(run);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3e4);
    try {
      const response = await fetch(run.callback_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(callbackPayload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        console.warn(`[v0] Callback: Webhook returned ${response.status} for run ${runId}`);
      } else {
        console.log(`[v0] Callback: Successfully sent for run ${runId}`);
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error) {
        if (fetchError.name === "AbortError") {
          console.warn(`[v0] Callback: Request timeout (30s) for run ${runId}`);
        } else {
          console.warn(`[v0] Callback: Network error for run ${runId}: ${fetchError.message}`);
        }
      } else {
        console.warn(`[v0] Callback: Unknown error for run ${runId}`);
      }
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[v0] Callback: Unexpected error for run ${runId}: ${errorMsg}`);
  }
}
__name(sendCallbackStep, "sendCallbackStep");
function buildCallbackPayload(run) {
  const isCompleted = run.status === "completed";
  const isFailed = run.status === "failed";
  if (isCompleted) {
    return {
      run_id: run.id,
      status: "completed",
      business_name: run.input_json?.business_name || null,
      blog_topic: run.input_json?.blog_topic || run.input_json?.topic || null,
      review_ready: true,
      human_review_required: true,
      outputs: {
        has_research_json: !!run.research_json,
        has_outline_json: !!run.outline_json,
        has_draft_markdown: !!run.draft_markdown,
        has_optimized_json: !!run.optimized_json,
        has_final_output_json: !!run.final_output_json
      },
      final_output_json: run.final_output_json
    };
  } else if (isFailed) {
    return {
      run_id: run.id,
      status: "failed",
      business_name: run.input_json?.business_name || null,
      blog_topic: run.input_json?.blog_topic || run.input_json?.topic || null,
      review_ready: false,
      human_review_required: true,
      error_message: run.error_message || "Unknown error"
    };
  } else {
    return {
      run_id: run.id,
      status: run.status,
      business_name: run.input_json?.business_name || null,
      blog_topic: run.input_json?.blog_topic || run.input_json?.topic || null
    };
  }
}
__name(buildCallbackPayload, "buildCallbackPayload");
registerStepFunction2("step//./lib/seo-blog-engine/workflow/steps/callback-step//sendCallbackStep", sendCallbackStep);

// lib/seo-blog-engine/workflow/steps/editor-step.ts
import { registerStepFunction as registerStepFunction3 } from "workflow/internal/private";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { getAgentConfig } from "../../../../../lib/seo-blog-engine/storage/agent-configs.ts";
async function runEditorStep(runId, input, research, outline, originalDraft, seoQa) {
  console.log(`[v0] Editor step: Starting for run ${runId}`);
  try {
    const agentConfig = await getAgentConfig("editor");
    if (!agentConfig) {
      throw new Error("Active agent config not found for agent_key: editor");
    }
    console.log(`[v0] SEO Blog Agent Config Loaded: editor v${agentConfig.version}`);
    const systemPrompt = [
      agentConfig.system_prompt,
      agentConfig.skill_markdown
    ].filter(Boolean).join("\n\n");
    const editorContext = buildEditorContext(input, research, outline, seoQa);
    const modelName = agentConfig.model || process.env.EDITOR_AGENT_MODEL || "gpt-5.4-mini";
    console.log(`[v0] Editor step: Using model: ${modelName}`);
    const { text: improvementAnalysis } = await generateText({
      model: openai(modelName),
      temperature: 0.7,
      maxTokens: 8e3,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Please improve this draft based on the following feedback:

ORIGINAL DRAFT:
${originalDraft}

SEO QA FEEDBACK:
${editorContext}

Provide the edited draft and a summary of changes made.`
        }
      ]
    });
    let editorOutput;
    try {
      const parsed = JSON.parse(improvementAnalysis);
      editorOutput = {
        edited_draft_markdown: parsed.edited_draft || originalDraft,
        editor_notes: parsed.notes || [],
        changes_made: parsed.changes_summary || [],
        human_review_required: true
      };
    } catch {
      console.warn(`[v0] Editor step: Failed to parse editor response, using fallback`);
      editorOutput = {
        edited_draft_markdown: originalDraft,
        editor_notes: [
          "Editor processing completed with fallback"
        ],
        changes_made: [],
        human_review_required: true
      };
    }
    console.log(`[v0] Editor step: Generated edited draft (${editorOutput.edited_draft_markdown.length} chars)`);
    console.log(`[v0] Editor step: ${editorOutput.changes_made.length} changes identified`);
    return editorOutput;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[v0] Editor step error: ${errorMessage}`);
    throw error;
  }
}
__name(runEditorStep, "runEditorStep");
function buildEditorContext(input, research, outline, seoQa) {
  const sections = [];
  sections.push("## SEO Performance Summary");
  sections.push(`Overall Score: ${seoQa.overall_score}/100`);
  sections.push("\n## Search Intent Alignment");
  sections.push(`Score: ${seoQa.search_intent_alignment.score}/100`);
  sections.push(`Analysis: ${seoQa.search_intent_alignment.analysis}`);
  sections.push("\n## Primary Keyword Usage");
  sections.push(`Score: ${seoQa.primary_keyword_usage.score}/100`);
  sections.push(`Occurrences: ${seoQa.primary_keyword_usage.occurrences} times`);
  sections.push(`Placement: ${seoQa.primary_keyword_usage.placement_analysis}`);
  sections.push("\n## Secondary Keywords");
  sections.push(`Score: ${seoQa.secondary_keyword_usage.score}/100`);
  sections.push(`Covered: ${seoQa.secondary_keyword_usage.keywords_covered.join(", ")}`);
  if (seoQa.secondary_keyword_usage.gaps.length > 0) {
    sections.push(`Gaps: ${seoQa.secondary_keyword_usage.gaps.join(", ")}`);
  }
  sections.push("\n## Heading Structure");
  sections.push(`Score: ${seoQa.heading_structure_review.score}/100`);
  sections.push(`H1 Present: ${seoQa.heading_structure_review.h1_present}`);
  sections.push(`H2 Count: ${seoQa.heading_structure_review.h2_count}`);
  if (seoQa.heading_structure_review.hierarchy_issues.length > 0) {
    sections.push(`Issues: ${seoQa.heading_structure_review.hierarchy_issues.join("; ")}`);
  }
  sections.push("\n## Content Depth");
  sections.push(`Score: ${seoQa.content_depth_review.score}/100`);
  sections.push(`Word Count: ${seoQa.content_depth_review.word_count} words`);
  sections.push(`Coverage: ${seoQa.content_depth_review.section_coverage}`);
  if (seoQa.content_depth_review.depth_issues.length > 0) {
    sections.push(`Issues: ${seoQa.content_depth_review.depth_issues.join("; ")}`);
  }
  sections.push("\n## Readability");
  sections.push(`Score: ${seoQa.readability_review.score}/100`);
  sections.push(`Avg Sentence Length: ${seoQa.readability_review.avg_sentence_length} words`);
  sections.push(`Reading Level: ${seoQa.readability_review.flesch_kincaid_estimate}`);
  if (seoQa.readability_review.readability_issues.length > 0) {
    sections.push(`Issues: ${seoQa.readability_review.readability_issues.join("; ")}`);
  }
  sections.push("\n## Internal Linking");
  sections.push(`Score: ${seoQa.internal_linking_review.score}/100`);
  sections.push(`Links Found: ${seoQa.internal_linking_review.internal_links_found}`);
  if (seoQa.internal_linking_review.internal_link_recommendations.length > 0) {
    sections.push(`Recommendations: ${seoQa.internal_linking_review.internal_link_recommendations.join("; ")}`);
  }
  sections.push("\n## CTA & Brand Guidelines");
  if (input.cta_notes) {
    sections.push(`CTA Notes: ${input.cta_notes}`);
  }
  if (input.brand_voice_notes) {
    sections.push(`Brand Voice: ${input.brand_voice_notes}`);
  }
  if (input.audience_notes) {
    sections.push(`Target Audience: ${input.audience_notes}`);
  }
  return sections.join("\n");
}
__name(buildEditorContext, "buildEditorContext");
registerStepFunction3("step//./lib/seo-blog-engine/workflow/steps/editor-step//runEditorStep", runEditorStep);

// lib/seo-blog-engine/workflow/steps/helpers.ts
import { registerStepFunction as registerStepFunction4 } from "workflow/internal/private";
import { updateRunStatus, updateRunError, completeRun } from "../../../../../lib/seo-blog-engine/storage/runs.ts";
async function markRunRunningStep(runId) {
  console.log(`[v0] Helper: Marking run ${runId} as running`);
  await updateRunStatus(runId, "researching");
}
__name(markRunRunningStep, "markRunRunningStep");
async function markRunFailedStep(runId, errorMessage) {
  console.log(`[v0] Helper: Marking run ${runId} as failed with error: ${errorMessage}`);
  await updateRunError(runId, errorMessage);
}
__name(markRunFailedStep, "markRunFailedStep");
async function completeRunStep(runId, finalOutput) {
  console.log(`[v0] Helper: Completing run ${runId}`);
  await completeRun(runId, finalOutput);
}
__name(completeRunStep, "completeRunStep");
registerStepFunction4("step//./lib/seo-blog-engine/workflow/steps/helpers//markRunRunningStep", markRunRunningStep);
registerStepFunction4("step//./lib/seo-blog-engine/workflow/steps/helpers//markRunFailedStep", markRunFailedStep);
registerStepFunction4("step//./lib/seo-blog-engine/workflow/steps/helpers//completeRunStep", completeRunStep);

// lib/seo-blog-engine/workflow/steps/meta-step.ts
import { registerStepFunction as registerStepFunction5 } from "workflow/internal/private";
import { generateText as generateText2 } from "ai";
import { openai as openai2 } from "@ai-sdk/openai";
import { getAgentConfig as getAgentConfig2 } from "../../../../../lib/seo-blog-engine/storage/agent-configs.ts";
async function runMetaStep(runId, input, research, outline, originalDraft, seoQa, editedDraft) {
  console.log(`[v0] Meta step: Starting for run ${runId}`);
  try {
    const agentConfig = await getAgentConfig2("meta");
    if (!agentConfig) {
      throw new Error("Active agent config not found for agent_key: meta");
    }
    console.log(`[v0] SEO Blog Agent Config Loaded: meta v${agentConfig.version}`);
    const systemPrompt = [
      agentConfig.system_prompt,
      agentConfig.skill_markdown
    ].filter(Boolean).join("\n\n");
    const metaContext = buildMetaContext(input, research, outline, seoQa, originalDraft, editedDraft);
    const modelName = agentConfig.model || process.env.META_AGENT_MODEL || "gpt-5.4-mini";
    console.log(`[v0] Meta step: Using model: ${modelName}`);
    const { text: metaAnalysis } = await generateText2({
      model: openai2(modelName),
      system: systemPrompt,
      temperature: 0.5,
      messages: [
        {
          role: "user",
          content: metaContext
        }
      ]
    });
    console.log(`[v0] Meta step: Received analysis, parsing JSON`);
    let metaOutput;
    try {
      const jsonMatch = metaAnalysis.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }
      metaOutput = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.warn(`[v0] Meta step: Failed to parse JSON response, using fallback`, parseError instanceof Error ? parseError.message : String(parseError));
      metaOutput = generateFallbackMeta(input, research, seoQa, originalDraft);
    }
    const requiredFields = [
      "seo_title",
      "meta_description",
      "suggested_slug",
      "primary_keyword",
      "secondary_keywords_used",
      "excerpt",
      "og_title",
      "og_description",
      "canonical_url_suggestion",
      "schema_type_suggestion",
      "human_review_notes"
    ];
    for (const field of requiredFields) {
      if (metaOutput[field] === void 0 || metaOutput[field] === null) {
        console.warn(`[v0] Meta step: Missing field ${field}, using fallback`);
        metaOutput = generateFallbackMeta(input, research, seoQa, originalDraft);
        break;
      }
    }
    console.log(`[v0] Meta step: Complete for run ${runId}`, `Generated metadata: ${metaOutput.seo_title.substring(0, 50)}...`);
    return metaOutput;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[v0] Meta step error for run ${runId}: ${errorMessage}`);
    throw error;
  }
}
__name(runMetaStep, "runMetaStep");
function buildMetaContext(input, research, outline, seoQa, originalDraft, editedDraft) {
  if (!Array.isArray(research.key_findings)) {
    throw new Error("Research output missing required key_findings array for meta-step");
  }
  const wordCount = editedDraft.split(/\s+/).length;
  const headings = editedDraft.match(/^#+\s+.+$/gm) || [];
  const keyFindingsSummary = research.key_findings.slice(0, 3).join("\n- ");
  return `You are an expert SEO metadata specialist. Generate SEO metadata for a blog post for human review.

BLOG TOPIC: ${input.blog_topic}
BUSINESS NAME: ${input.business_name || "Not provided"}
WEBSITE URL: ${input.website_url || "Not provided"}
PRIMARY KEYWORD: ${input.primary_keyword}
SECONDARY KEYWORDS: ${(input.secondary_keywords || []).join(", ") || "None provided"}
TARGET AUDIENCE: ${input.audience_notes || "General audience"}

RESEARCH SUMMARY:
- ${keyFindingsSummary}

OUTLINE STRUCTURE:
${outline.sections.map((s) => `- ${s.heading} (${s.subsections?.length || 0} subsections)`).join("\n")}

SEO QA REVIEW:
- Overall Score: ${seoQa.overall_score}
- Search Intent Alignment: ${seoQa.search_intent_alignment}
- Keyword Usage: ${seoQa.keyword_usage_assessment}
- Heading Structure: ${seoQa.heading_structure_assessment}

CONTENT STATS:
- Word Count: ${wordCount}
- Headings: ${headings.length}
- Has CTA: ${input.cta_notes ? "Yes" : "No"}
- Has Internal Links: ${input.internal_link_notes ? "Yes" : "No"}

Generate metadata that:
1. Accurately represents the blog content (do not invent claims)
2. Includes the primary keyword naturally in title and description
3. Is SEO-optimized for search engines
4. Is compelling for human readers and CTR
5. Follows best practices (title max 60 chars, description max 160 chars)
6. Includes review notes for the human editor

Return a JSON object with these exact fields:
{
  "seo_title": "SEO-optimized title (max 60 chars)",
  "meta_description": "Compelling description (max 160 chars)",
  "suggested_slug": "url-slug-format",
  "primary_keyword": "${input.primary_keyword}",
  "secondary_keywords_used": ["keyword1", "keyword2"],
  "excerpt": "Brief summary for blog listings (max 155 chars)",
  "og_title": "OpenGraph title for social sharing",
  "og_description": "OpenGraph description for social sharing",
  "canonical_url_suggestion": "https://example.com/blog/url-slug or leave as null if website_url not provided",
  "schema_type_suggestion": "BlogPosting or NewsArticle",
  "human_review_notes": ["note1", "note2"]
}`;
}
__name(buildMetaContext, "buildMetaContext");
function generateFallbackMeta(input, research, seoQa, draft) {
  const primaryKeyword = input.primary_keyword || "blog post";
  const slug = input.blog_topic.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const wordCount = draft.split(/\s+/).length;
  return {
    seo_title: `${input.blog_topic} - ${input.business_name || "Blog"}`,
    meta_description: `Comprehensive guide to ${input.blog_topic.toLowerCase()}. Research-backed insights and practical strategies. ${wordCount} words.`,
    suggested_slug: slug,
    primary_keyword: primaryKeyword,
    secondary_keywords_used: input.secondary_keywords || [],
    excerpt: `Learn about ${input.blog_topic.toLowerCase()} with insights from our research. ${wordCount}-word guide covering key aspects and strategies.`,
    og_title: `${input.blog_topic} | ${input.business_name || "Blog"}`,
    og_description: `Discover ${input.blog_topic.toLowerCase()}. Comprehensive guide with research and insights.`,
    canonical_url_suggestion: input.website_url ? `${input.website_url}/blog/${slug}` : null,
    schema_type_suggestion: "BlogPosting",
    human_review_notes: [
      `Overall SEO Score: ${seoQa.overall_score}`,
      "Review and adjust metadata as needed for your brand voice",
      "Ensure SEO title and meta description are compelling for CTR",
      "Verify canonical URL matches your site structure",
      "Check that schema type matches your content format"
    ]
  };
}
__name(generateFallbackMeta, "generateFallbackMeta");
registerStepFunction5("step//./lib/seo-blog-engine/workflow/steps/meta-step//runMetaStep", runMetaStep);

// lib/seo-blog-engine/workflow/steps/outline-step.ts
import { registerStepFunction as registerStepFunction6 } from "workflow/internal/private";
import { generateText as generateText3 } from "ai";
import { openai as openai3 } from "@ai-sdk/openai";
import { updateRunStatus as updateRunStatus2 } from "../../../../../lib/seo-blog-engine/storage/runs.ts";
import { getAgentConfig as getAgentConfig3 } from "../../../../../lib/seo-blog-engine/storage/agent-configs.ts";
async function runOutlineStep(runId, input, researchData) {
  console.log(`[v0] Outline step: Creating outline for run ${runId}`);
  const topic = input.blog_topic || input.topic || "Your Topic";
  const primaryKeyword = input.primary_keyword || "primary keyword";
  const secondaryKeywords = (input.secondary_keywords || input.keywords || []).join(", ") || "secondary keywords";
  const businessName = input.business_name || "Your Business";
  const audienceNotes = input.audience_notes || "Target audience not specified";
  const brandVoice = input.brand_voice_notes || "Professional and clear";
  const ctaNotes = input.cta_notes || "Encourage engagement";
  const additionalNotes = input.additional_order_notes || "No additional notes";
  const targetWordCount = input.target_word_count || 1500;
  try {
    const agentConfig = await getAgentConfig3("outline");
    if (!agentConfig) {
      throw new Error("Active agent config not found for agent_key: outline");
    }
    console.log(`[v0] SEO Blog Agent Config Loaded: outline v${agentConfig.version}`);
    const systemPrompt = [
      agentConfig.system_prompt,
      agentConfig.skill_markdown
    ].filter(Boolean).join("\n\n");
    let researchContext = "";
    if (researchData) {
      researchContext = `

Research Insights from Research Agent:
- Search Intent: ${researchData.search_intent || "N/A"}
- Content Angle: ${researchData.content_angle || "N/A"}
- Target Audience: ${researchData.target_audience_summary || "N/A"}
- Recommended Sections: ${researchData.recommended_sections?.join(", ") || "N/A"}
- Questions to Answer: ${researchData.questions_to_answer?.join(", ") || "N/A"}`;
    }
    const userMessage = `Create an outline for this article:

Topic: ${topic}
Business: ${businessName}
Primary Keyword: ${primaryKeyword}
Secondary Keywords: ${secondaryKeywords}
Target Word Count: ${targetWordCount}

Audience Profile:
${audienceNotes}

Brand Voice:
${brandVoice}

Call-to-Action Focus:
${ctaNotes}

Additional Requirements:
${additionalNotes}${researchContext}`;
    const modelName = agentConfig.model || process.env.OUTLINE_AGENT_MODEL || process.env.RESEARCH_AGENT_MODEL || "gpt-5.4-mini";
    console.log(`[v0] Outline step: Using model: ${modelName}`);
    const model = openai3(modelName);
    const response = await generateText3({
      model,
      system: systemPrompt,
      prompt: userMessage,
      temperature: 0.7
    });
    console.log(`[v0] Outline step: Raw response length: ${response.text.length}`);
    const outlineData = JSON.parse(response.text);
    outlineData.timestamp = outlineData.timestamp || (/* @__PURE__ */ new Date()).toISOString();
    outlineData.target_word_count = outlineData.target_word_count || targetWordCount;
    if (!outlineData.sections || !Array.isArray(outlineData.sections)) {
      outlineData.sections = [
        {
          heading: "Introduction",
          purpose: "Introduce topic and set context",
          estimated_words: 150,
          key_points: [
            "Topic overview",
            "Why this matters"
          ],
          seo_notes: [
            "Include primary keyword naturally"
          ]
        },
        {
          heading: "Main Content",
          purpose: "Detailed exploration of topic",
          estimated_words: 1e3,
          key_points: [
            "Key insight 1",
            "Key insight 2",
            "Key insight 3"
          ],
          seo_notes: [
            "Use secondary keywords",
            "Answer user intent questions"
          ]
        },
        {
          heading: "Conclusion",
          purpose: "Summarize and call to action",
          estimated_words: 150,
          key_points: [
            "Summary of key points",
            "Call to action"
          ],
          seo_notes: [
            "Reinforce primary keyword"
          ]
        }
      ];
    }
    console.log(`[v0] Outline step: Generated outline with ${outlineData.sections.length} sections`);
    console.log(`[v0] Outline step: Persisting outline_json for run ${runId}`);
    await updateRunStatus2(runId, "outlining", outlineData);
    return outlineData;
  } catch (error) {
    console.error(`[v0] Outline step error:`, error instanceof Error ? error.message : String(error));
    const fallbackOutline = {
      title: `${topic} - Comprehensive Guide | ${businessName}`,
      meta_angle: `Everything you need to know about ${topic} for ${businessName}`,
      target_word_count: targetWordCount,
      sections: [
        {
          heading: "Introduction: Understanding the Basics",
          purpose: "Set context and introduce the topic",
          estimated_words: 200,
          key_points: [
            `Overview of ${topic}`,
            "Why this topic matters to your audience",
            "What you will learn"
          ],
          seo_notes: [
            "Include primary keyword in first paragraph",
            "Use engaging hook"
          ]
        },
        {
          heading: "Key Concepts and Benefits",
          purpose: "Explore core concepts and advantages",
          estimated_words: 400,
          key_points: [
            "Core concept 1",
            "Core concept 2",
            "How businesses benefit",
            "Real-world applications"
          ],
          seo_notes: [
            "Use secondary keywords naturally",
            "Answer common questions"
          ]
        },
        {
          heading: "Best Practices and Implementation",
          purpose: "Provide actionable guidance",
          estimated_words: 500,
          key_points: [
            "Step-by-step implementation",
            "Best practices in the industry",
            "Common mistakes to avoid",
            "Tools and resources"
          ],
          seo_notes: [
            "Use long-tail keywords",
            "Include practical examples"
          ]
        },
        {
          heading: "Conclusion and Next Steps",
          purpose: "Summarize and guide reader action",
          estimated_words: 150,
          key_points: [
            "Key takeaways",
            "Recommended next steps",
            "Call to action"
          ],
          seo_notes: [
            "Reinforce primary keyword",
            "Create urgency for CTA"
          ]
        }
      ],
      intro_guidance: `Start with a compelling hook that addresses the reader's pain point. Introduce ${topic} in the context of ${businessName} and explain why it matters to the target audience. Include the primary keyword "${primaryKeyword}" naturally in the first 100 words.`,
      conclusion_guidance: `Summarize the main takeaways from each section. Reinforce how understanding ${topic} benefits the reader. Include a clear, compelling call-to-action that guides the reader on next steps. End with the primary keyword naturally incorporated.`,
      cta_guidance: `${ctaNotes}. Ensure the CTA is clear, specific, and relevant to the article content. Examples: "Schedule a consultation," "Download our guide," "Get started today," "Join our community."`,
      internal_link_opportunities: [
        "Link to relevant service pages on company website",
        "Link to related blog posts on similar topics",
        "Link to case studies or success stories",
        "Link to resource pages or tools"
      ],
      notes_for_writer: [
        `Remember to maintain a ${brandVoice} tone throughout`,
        `Address the needs of: ${audienceNotes}`,
        `Ensure the content is well-researched and includes specific examples`,
        `Use subheadings to improve readability and SEO`,
        `Include relevant data, statistics, or research findings where appropriate`,
        `End with a strong CTA aligned with: ${ctaNotes}`
      ],
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    console.log(`[v0] Outline step: Using fallback outline due to error`);
    return fallbackOutline;
  }
}
__name(runOutlineStep, "runOutlineStep");
registerStepFunction6("step//./lib/seo-blog-engine/workflow/steps/outline-step//runOutlineStep", runOutlineStep);

// lib/seo-blog-engine/workflow/steps/research-step.ts
import { registerStepFunction as registerStepFunction7 } from "workflow/internal/private";
import { generateText as generateText4 } from "ai";
import { openai as openai4 } from "@ai-sdk/openai";
import { updateRunStatus as updateRunStatus3 } from "../../../../../lib/seo-blog-engine/storage/runs.ts";
import { getAgentConfig as getAgentConfig4 } from "../../../../../lib/seo-blog-engine/storage/agent-configs.ts";
async function runResearchStep(runId, input) {
  console.log(`[v0] Research step: Analyzing topic for run ${runId}`);
  try {
    const agentConfig = await getAgentConfig4("research");
    if (!agentConfig) {
      throw new Error("Active agent config not found for agent_key: research");
    }
    console.log(`[v0] SEO Blog Agent Config Loaded: research v${agentConfig.version}`);
    const systemPrompt = [
      agentConfig.system_prompt,
      agentConfig.skill_markdown
    ].filter(Boolean).join("\n\n");
    const userMessage = `Conduct SEO research for:
Topic: ${input.blog_topic}
Primary Keyword: ${input.primary_keyword}
Secondary Keywords: ${input.secondary_keywords?.join(", ") || "none"}
Target Audience: ${input.audience_notes || "general"}
Target Word Count: ${input.target_word_count || 1e3}
Business: ${input.business_name || "unknown"}
Website: ${input.website_url || "unknown"}

Provide comprehensive research findings in JSON format.`;
    const modelName = agentConfig.model || process.env.RESEARCH_AGENT_MODEL || "gpt-5.4-mini";
    console.log(`[v0] Research step: Using model: ${modelName}`);
    const model = openai4(modelName);
    const response = await generateText4({
      model,
      system: systemPrompt,
      prompt: userMessage,
      temperature: 0.7
    });
    console.log(`[v0] Research step: AI model responded, parsing JSON`);
    let researchData;
    try {
      const jsonMatch = response.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }
      researchData = JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      console.error(`[v0] Research step: Failed to parse AI response:`, response.text.substring(0, 200));
      researchData = {
        search_intent: "informational",
        target_audience_summary: input.audience_notes || "Target audience not specified",
        keyword_map: {
          primary_keyword: input.primary_keyword || "primary keyword",
          secondary_keywords: input.secondary_keywords || [],
          lsi_terms: []
        },
        content_angle: `Focus on ${input.blog_topic || "topic"}`,
        key_findings: [
          `Topic focuses on ${input.blog_topic || "the subject matter"}`,
          `Target audience: ${input.audience_notes || "general audience"}`,
          `Primary keyword: ${input.primary_keyword || "to be determined"}`
        ],
        competitor_insights: [
          "Research competitors for competitive advantages"
        ],
        recommended_sections: [
          "Introduction",
          "Main Content",
          "Conclusion"
        ],
        questions_to_answer: [
          "What is the main topic?"
        ],
        research_notes: "Fallback research due to parsing error",
        target_word_count: input.target_word_count || 1e3,
        web_search_used: false,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    console.log(`[v0] Research step: Persisting research_json for run ${runId}`);
    await updateRunStatus3(runId, "researching", researchData);
    console.log(`[v0] Research step: Complete for run ${runId}`);
    return researchData;
  } catch (error) {
    console.error(`[v0] Research step error for run ${runId}:`, error instanceof Error ? error.message : String(error));
    throw error;
  }
}
__name(runResearchStep, "runResearchStep");
registerStepFunction7("step//./lib/seo-blog-engine/workflow/steps/research-step//runResearchStep", runResearchStep);

// lib/seo-blog-engine/workflow/steps/seo-qa-step.ts
import { registerStepFunction as registerStepFunction8 } from "workflow/internal/private";
import { generateText as generateText5 } from "ai";
import { openai as openai5 } from "@ai-sdk/openai";
import { updateRunStatus as updateRunStatus4 } from "../../../../../lib/seo-blog-engine/storage/runs.ts";
import { getAgentConfig as getAgentConfig5 } from "../../../../../lib/seo-blog-engine/storage/agent-configs.ts";
async function runSeoQaStep(runId, input, researchData, outlineData, draftMarkdown) {
  console.log(`[v0] SEO QA step: Auditing draft for run ${runId}`);
  if (!draftMarkdown) {
    throw new Error("Draft markdown is required for SEO QA review");
  }
  try {
    const agentConfig = await getAgentConfig5("seo_qa");
    if (!agentConfig) {
      throw new Error("Active agent config not found for agent_key: seo_qa");
    }
    console.log(`[v0] SEO Blog Agent Config Loaded: seo_qa v${agentConfig.version}`);
    const systemPrompt = [
      agentConfig.system_prompt,
      agentConfig.skill_markdown
    ].filter(Boolean).join("\n\n");
    const modelName = agentConfig.model || process.env.SEO_QA_AGENT_MODEL || process.env.RESEARCH_AGENT_MODEL || "gpt-5.4-mini";
    console.log(`[v0] SEO QA step: Using model: ${modelName}`);
    const primaryKeyword = input.primary_keyword || "primary keyword";
    const secondaryKeywords = (input.secondary_keywords || []).join(", ") || "secondary keywords";
    const targetWordCount = input.target_word_count || 2e3;
    const businessName = input.business_name || "Your Business";
    const audienceNotes = input.audience_notes || "Target audience not specified";
    const brandVoice = input.brand_voice_notes || "Professional and clear";
    const ctaNotes = input.cta_notes || "CTA not specified";
    const internalLinkNotes = input.internal_link_notes || "No internal linking strategy";
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
    const { text } = await generateText5({
      model: openai5(modelName),
      prompt: seoQaPrompt,
      temperature: 0.7,
      maxTokens: 3e3
    });
    console.log(`[v0] SEO QA step: Received audit from model`);
    let seoQaResult;
    try {
      seoQaResult = JSON.parse(text);
    } catch (parseErr) {
      console.error(`[v0] SEO QA step: Failed to parse model response as JSON`, parseErr instanceof Error ? parseErr.message : String(parseErr));
      seoQaResult = generateFallbackSeoQa(draftMarkdown, primaryKeyword);
    }
    if (typeof seoQaResult.overall_score !== "number" || !seoQaResult.search_intent_alignment || !seoQaResult.priority_fixes) {
      console.warn(`[v0] SEO QA step: Missing required audit fields, using fallback`);
      seoQaResult = generateFallbackSeoQa(draftMarkdown, primaryKeyword);
    }
    console.log(`[v0] SEO QA step: Persisting SEO QA audit (score: ${seoQaResult.overall_score}) for run ${runId}`);
    await updateRunStatus4(runId, "seo_qa", seoQaResult);
    console.log(`[v0] SEO QA step: Complete for run ${runId}`);
    return seoQaResult;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[v0] SEO QA step: Error during audit for run ${runId}: ${errorMsg}`);
    throw error;
  }
}
__name(runSeoQaStep, "runSeoQaStep");
function generateFallbackSeoQa(draftMarkdown, primaryKeyword) {
  const wordCount = draftMarkdown.split(/\s+/).length;
  const h1Count = (draftMarkdown.match(/^# /gm) || []).length;
  const h2Count = (draftMarkdown.match(/^## /gm) || []).length;
  const internalLinkCount = (draftMarkdown.match(/\[.*?\]\(\/.*?\)/g) || []).length;
  const primaryKeywordOccurrences = (draftMarkdown.toLowerCase().match(new RegExp(primaryKeyword.toLowerCase(), "g")) || []).length;
  const overallScore = 68;
  const readyForEditor = overallScore >= 70 && h1Count > 0;
  const recommendedAction = overallScore >= 75 && readyForEditor ? "Approve for editor" : overallScore >= 60 && readyForEditor ? "Revise before editor" : "Needs human review";
  return {
    overall_score: overallScore,
    search_intent_alignment: {
      score: 65,
      analysis: "Draft covers basic search intent but may need refinement"
    },
    primary_keyword_usage: {
      score: 70,
      occurrences: primaryKeywordOccurrences,
      placement_analysis: `Primary keyword appears ${primaryKeywordOccurrences} times in the draft`
    },
    secondary_keyword_usage: {
      score: 60,
      keywords_covered: [],
      gaps: [
        "Additional keyword analysis needed"
      ]
    },
    heading_structure_review: {
      score: h2Count > 2 ? 75 : 65,
      h1_present: h1Count > 0,
      h2_count: h2Count,
      hierarchy_issues: h1Count === 0 ? [
        "Missing H1 heading"
      ] : []
    },
    content_depth_review: {
      score: wordCount > 1500 ? 75 : 60,
      word_count: wordCount,
      section_coverage: `Draft contains ${Math.max(1, h2Count)} main sections`,
      depth_issues: wordCount < 1500 ? [
        "Content may need more depth"
      ] : []
    },
    readability_review: {
      score: 72,
      avg_sentence_length: 18,
      flesch_kincaid_estimate: "8th grade",
      readability_issues: []
    },
    internal_linking_review: {
      score: internalLinkCount > 2 ? 70 : 50,
      internal_links_found: internalLinkCount,
      internal_link_recommendations: internalLinkCount === 0 ? [
        "Add relevant internal links"
      ] : []
    },
    cta_review: {
      score: 70,
      cta_present: draftMarkdown.toLowerCase().includes("cta") || draftMarkdown.toLowerCase().includes("call"),
      cta_analysis: "CTA section review needed"
    },
    client_goal_alignment: {
      score: 70,
      analysis: "Draft aligns with provided client goals and audience targeting"
    },
    risk_flags: [],
    priority_fixes: [
      ...h1Count === 0 ? [
        "Ensure H1 heading present"
      ] : [],
      ...wordCount < 1500 ? [
        "Expand content to meet word count target"
      ] : [],
      ...internalLinkCount === 0 ? [
        "Add internal linking strategy"
      ] : []
    ],
    recommended_next_action: recommendedAction,
    ready_for_editor: readyForEditor,
    needs_review: overallScore < 70,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
}
__name(generateFallbackSeoQa, "generateFallbackSeoQa");
registerStepFunction8("step//./lib/seo-blog-engine/workflow/steps/seo-qa-step//runSeoQaStep", runSeoQaStep);

// lib/seo-blog-engine/workflow/steps/writer-step.ts
import { registerStepFunction as registerStepFunction9 } from "workflow/internal/private";
import { generateText as generateText6 } from "ai";
import { openai as openai6 } from "@ai-sdk/openai";
import { updateRunDraft, updateRunStatus as updateRunStatus5 } from "../../../../../lib/seo-blog-engine/storage/runs.ts";
import { getAgentConfig as getAgentConfig6 } from "../../../../../lib/seo-blog-engine/storage/agent-configs.ts";
async function runWriterStep(runId, input, researchData, outlineData) {
  console.log(`[v0] Writer step: Creating draft for run ${runId}`);
  try {
    const agentConfig = await getAgentConfig6("writer");
    if (!agentConfig) {
      throw new Error("Active agent config not found for agent_key: writer");
    }
    console.log(`[v0] SEO Blog Agent Config Loaded: writer v${agentConfig.version}`);
    const systemPrompt = [
      agentConfig.system_prompt,
      agentConfig.skill_markdown
    ].filter(Boolean).join("\n\n");
    const topic = input.blog_topic || input.topic || "Your Topic";
    const primaryKeyword = input.primary_keyword || "primary keyword";
    const secondaryKeywords = (input.secondary_keywords || input.keywords || []).join(", ") || "secondary keywords";
    const businessName = input.business_name || "Your Business";
    const audienceNotes = input.audience_notes || "Target audience not specified";
    const brandVoice = input.brand_voice_notes || "Professional and clear";
    const ctaNotes = input.cta_notes || "";
    const internalLinkNotes = input.internal_link_notes || "";
    const additionalNotes = input.additional_order_notes || "No additional notes";
    const targetWordCount = input.target_word_count || 1500;
    let researchContext = "";
    if (researchData && typeof researchData === "object") {
      const findings = researchData.key_findings || [];
      if (Array.isArray(findings) && findings.length > 0) {
        researchContext = `

Key Research Findings:
${findings.map((f) => `- ${typeof f === "string" ? f : JSON.stringify(f)}`).join("\n")}`;
      }
    }
    let outlineContext = "";
    if (outlineData) {
      const sections = (outlineData.sections || []).map((s) => `## ${typeof s === "string" ? s : s.heading || "Section"}
(${s.purpose || "Section content"})`);
      if (sections.length > 0) {
        outlineContext = `

Outline Structure:
${sections.join("\n\n")}`;
      }
    }
    let linksContext = "";
    if (internalLinkNotes) {
      linksContext = `

Internal Link Opportunities:
${internalLinkNotes}`;
    }
    let ctaContext = "";
    if (ctaNotes) {
      ctaContext = `

Call-to-Action Guidance:
${ctaNotes}`;
    }
    const userMessage = `Write the first draft blog post about: ${topic}${researchContext}${outlineContext}${linksContext}${ctaContext}`;
    const modelName = agentConfig.model || process.env.WRITER_AGENT_MODEL || process.env.RESEARCH_AGENT_MODEL || "gpt-5.4-mini";
    console.log(`[v0] Writer step: Using model: ${modelName}`);
    const model = openai6(modelName);
    const response = await generateText6({
      model,
      system: systemPrompt,
      prompt: userMessage,
      temperature: 0.7,
      maxTokens: 4e3
    });
    const draftMarkdown = response.text;
    if (!draftMarkdown || draftMarkdown.trim().length < 500) {
      throw new Error("Generated content too short");
    }
    const wordCount = draftMarkdown.split(/\s+/).length;
    const sectionsCount = (draftMarkdown.match(/^##\s/gm) || []).length;
    const hasCta = draftMarkdown.toLowerCase().includes("call") || draftMarkdown.toLowerCase().includes("action") || ctaNotes.length > 0;
    const hasInternalLinks = draftMarkdown.includes("[link:") || internalLinkNotes.length > 0;
    const writerOutput = {
      draft_markdown: draftMarkdown,
      word_count: wordCount,
      sections_written: sectionsCount,
      has_cta: hasCta,
      has_internal_links: hasInternalLinks,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    console.log(`[v0] Writer step: Persisting draft_markdown (${wordCount} words) for run ${runId}`);
    await updateRunDraft(runId, writerOutput.draft_markdown);
    await updateRunStatus5(runId, "writing");
    console.log(`[v0] Writer step: Complete for run ${runId} (${wordCount} words, ${sectionsCount} sections)`);
    return writerOutput;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error in writer step";
    console.error(`[v0] Writer step error for run ${runId}: ${errorMsg}`);
    throw new Error(`Writer step failed: ${errorMsg}`);
  }
}
__name(runWriterStep, "runWriterStep");
registerStepFunction9("step//./lib/seo-blog-engine/workflow/steps/writer-step//runWriterStep", runWriterStep);

// virtual-entry.js
import { stepEntrypoint, stepEntrypoint as stepEntrypoint2 } from "workflow/runtime";
export {
  stepEntrypoint as HEAD,
  stepEntrypoint2 as POST
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3dvcmtmbG93QDQuNS4wX0BuZXN0anMrY29tbW9uQDExLjEuMjdfcmVmbGVjdC1tZXRhZGF0YUAwLjIuMl9yeGpzQDcuOC4yX19AbmVzdGpzK2NvcmVAMV9hOWMxYWE2YzBiNTgwZTliZjNiZmY2NGMzMjY5ZmU0My9ub2RlX21vZHVsZXMvd29ya2Zsb3cvc3JjL2ludGVybmFsL2J1aWx0aW5zLnRzIiwgIi4uLy4uLy4uLy4uLy4uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvY2FsbGJhY2stc3RlcC50cyIsICIuLi8uLi8uLi8uLi8uLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL2VkaXRvci1zdGVwLnRzIiwgIi4uLy4uLy4uLy4uLy4uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvaGVscGVycy50cyIsICIuLi8uLi8uLi8uLi8uLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL21ldGEtc3RlcC50cyIsICIuLi8uLi8uLi8uLi8uLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL291dGxpbmUtc3RlcC50cyIsICIuLi8uLi8uLi8uLi8uLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3Jlc2VhcmNoLXN0ZXAudHMiLCAiLi4vLi4vLi4vLi4vLi4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9zZW8tcWEtc3RlcC50cyIsICIuLi8uLi8uLi8uLi8uLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3dyaXRlci1zdGVwLnRzIiwgIi4uLy4uLy4uLy4uLy4uL3ZpcnR1YWwtZW50cnkuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKlxuICogVGhlc2UgYXJlIHRoZSBidWlsdC1pbiBzdGVwcyB0aGF0IGFyZSBcImF1dG9tYXRpY2FsbHkgYXZhaWxhYmxlXCIgaW4gdGhlIHdvcmtmbG93IHNjb3BlLiBUaGV5IGFyZVxuICogc2ltaWxhciB0byBcInN0ZGxpYlwiIGV4Y2VwdCB0aGF0IGFyZSBub3QgbWVhbnQgdG8gYmUgaW1wb3J0ZWQgYnkgdXNlcnMsIGJ1dCBhcmUgaW5zdGVhZCBcImp1c3QgYXZhaWxhYmxlXCJcbiAqIGFsb25nc2lkZSB1c2VyIGRlZmluZWQgc3RlcHMuIFRoZXkgYXJlIHVzZWQgaW50ZXJuYWxseSBieSB0aGUgcnVudGltZVxuICovXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBfX2J1aWx0aW5fcmVzcG9uc2VfYXJyYXlfYnVmZmVyKFxuICB0aGlzOiBSZXF1ZXN0IHwgUmVzcG9uc2Vcbikge1xuICAndXNlIHN0ZXAnO1xuICByZXR1cm4gdGhpcy5hcnJheUJ1ZmZlcigpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gX19idWlsdGluX3Jlc3BvbnNlX2pzb24odGhpczogUmVxdWVzdCB8IFJlc3BvbnNlKSB7XG4gICd1c2Ugc3RlcCc7XG4gIHJldHVybiB0aGlzLmpzb24oKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIF9fYnVpbHRpbl9yZXNwb25zZV90ZXh0KHRoaXM6IFJlcXVlc3QgfCBSZXNwb25zZSkge1xuICAndXNlIHN0ZXAnO1xuICByZXR1cm4gdGhpcy50ZXh0KCk7XG59XG4iLCAiaW1wb3J0IHsgcmVnaXN0ZXJTdGVwRnVuY3Rpb24gfSBmcm9tIFwid29ya2Zsb3cvaW50ZXJuYWwvcHJpdmF0ZVwiO1xuaW1wb3J0ICdzZXJ2ZXItb25seSc7XG5pbXBvcnQgeyBnZXRSdW4gfSBmcm9tICcuLi8uLi9zdG9yYWdlL3J1bnMnO1xuLyoqX19pbnRlcm5hbF93b3JrZmxvd3N7XCJzdGVwc1wiOntcImxpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvY2FsbGJhY2stc3RlcC50c1wiOntcInNlbmRDYWxsYmFja1N0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9jYWxsYmFjay1zdGVwLy9zZW5kQ2FsbGJhY2tTdGVwXCJ9fX19Ki87XG4vKipcbiAqIFNlbmQgY2FsbGJhY2sgbm90aWZpY2F0aW9uIHRvIHdlYmhvb2sgVVJMXG4gKiBSdW5zIGFzIGEgZHVyYWJsZSBzdGVwIHRvIGVuc3VyZSBjYWxsYmFjayBkZWxpdmVyeSBpcyB0cmFja2VkXG4gKiBGYWlsdXJlcyBkbyBub3QgYnJlYWsgdGhlIG1haW4gd29ya2Zsb3dcbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gc2VuZENhbGxiYWNrU3RlcChydW5JZCkge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIEZldGNoIHJ1biB0byBnZXQgY2FsbGJhY2sgVVJMIGFuZCBmaW5hbCBzdGF0ZVxuICAgICAgICBjb25zdCBydW4gPSBhd2FpdCBnZXRSdW4ocnVuSWQpO1xuICAgICAgICBpZiAoIXJ1bikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBbdjBdIENhbGxiYWNrOiBSdW4gJHtydW5JZH0gbm90IGZvdW5kYCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFydW4uY2FsbGJhY2tfdXJsKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBDYWxsYmFjazogTm8gY2FsbGJhY2sgVVJMIGZvciBydW4gJHtydW5JZH1gKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBDYWxsYmFjazogU2VuZGluZyBub3RpZmljYXRpb24gdG8gJHtydW4uY2FsbGJhY2tfdXJsfWApO1xuICAgICAgICAvLyBCdWlsZCBjYWxsYmFjayBwYXlsb2FkXG4gICAgICAgIGNvbnN0IGNhbGxiYWNrUGF5bG9hZCA9IGJ1aWxkQ2FsbGJhY2tQYXlsb2FkKHJ1bik7XG4gICAgICAgIC8vIFNlbmQgY2FsbGJhY2sgd2l0aCB0aW1lb3V0IHByb3RlY3Rpb25cbiAgICAgICAgY29uc3QgY29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICAgICAgY29uc3QgdGltZW91dElkID0gc2V0VGltZW91dCgoKT0+Y29udHJvbGxlci5hYm9ydCgpLCAzMDAwMCk7IC8vIDMwIHNlY29uZCB0aW1lb3V0XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHJ1bi5jYWxsYmFja191cmwsIHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbidcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGNhbGxiYWNrUGF5bG9hZCksXG4gICAgICAgICAgICAgICAgc2lnbmFsOiBjb250cm9sbGVyLnNpZ25hbFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcbiAgICAgICAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFt2MF0gQ2FsbGJhY2s6IFdlYmhvb2sgcmV0dXJuZWQgJHtyZXNwb25zZS5zdGF0dXN9IGZvciBydW4gJHtydW5JZH1gKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFt2MF0gQ2FsbGJhY2s6IFN1Y2Nlc3NmdWxseSBzZW50IGZvciBydW4gJHtydW5JZH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZmV0Y2hFcnJvcikge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgICAgICAgICBpZiAoZmV0Y2hFcnJvciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgICAgICAgICAgaWYgKGZldGNoRXJyb3IubmFtZSA9PT0gJ0Fib3J0RXJyb3InKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgW3YwXSBDYWxsYmFjazogUmVxdWVzdCB0aW1lb3V0ICgzMHMpIGZvciBydW4gJHtydW5JZH1gKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFt2MF0gQ2FsbGJhY2s6IE5ldHdvcmsgZXJyb3IgZm9yIHJ1biAke3J1bklkfTogJHtmZXRjaEVycm9yLm1lc3NhZ2V9YCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFt2MF0gQ2FsbGJhY2s6IFVua25vd24gZXJyb3IgZm9yIHJ1biAke3J1bklkfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAvLyBEb24ndCB0aHJvdyAtIGNhbGxiYWNrIGZhaWx1cmUgc2hvdWxkIG5vdCBmYWlsIHRoZSB3b3JrZmxvd1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgLy8gTG9nIGVycm9yIHNhZmVseSB3aXRob3V0IGV4cG9zaW5nIHNlY3JldHNcbiAgICAgICAgY29uc3QgZXJyb3JNc2cgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2MF0gQ2FsbGJhY2s6IFVuZXhwZWN0ZWQgZXJyb3IgZm9yIHJ1biAke3J1bklkfTogJHtlcnJvck1zZ31gKTtcbiAgICAvLyBEb24ndCB0aHJvdyAtIGNhbGxiYWNrIGZhaWx1cmUgc2hvdWxkIG5vdCBmYWlsIHRoZSB3b3JrZmxvd1xuICAgIH1cbn1cbi8qKlxuICogQnVpbGQgY2FsbGJhY2sgcGF5bG9hZCBiYXNlZCBvbiBydW4gc3RhdHVzXG4gKi8gZnVuY3Rpb24gYnVpbGRDYWxsYmFja1BheWxvYWQocnVuKSB7XG4gICAgY29uc3QgaXNDb21wbGV0ZWQgPSBydW4uc3RhdHVzID09PSAnY29tcGxldGVkJztcbiAgICBjb25zdCBpc0ZhaWxlZCA9IHJ1bi5zdGF0dXMgPT09ICdmYWlsZWQnO1xuICAgIGlmIChpc0NvbXBsZXRlZCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcnVuX2lkOiBydW4uaWQsXG4gICAgICAgICAgICBzdGF0dXM6ICdjb21wbGV0ZWQnLFxuICAgICAgICAgICAgYnVzaW5lc3NfbmFtZTogcnVuLmlucHV0X2pzb24/LmJ1c2luZXNzX25hbWUgfHwgbnVsbCxcbiAgICAgICAgICAgIGJsb2dfdG9waWM6IHJ1bi5pbnB1dF9qc29uPy5ibG9nX3RvcGljIHx8IHJ1bi5pbnB1dF9qc29uPy50b3BpYyB8fCBudWxsLFxuICAgICAgICAgICAgcmV2aWV3X3JlYWR5OiB0cnVlLFxuICAgICAgICAgICAgaHVtYW5fcmV2aWV3X3JlcXVpcmVkOiB0cnVlLFxuICAgICAgICAgICAgb3V0cHV0czoge1xuICAgICAgICAgICAgICAgIGhhc19yZXNlYXJjaF9qc29uOiAhIXJ1bi5yZXNlYXJjaF9qc29uLFxuICAgICAgICAgICAgICAgIGhhc19vdXRsaW5lX2pzb246ICEhcnVuLm91dGxpbmVfanNvbixcbiAgICAgICAgICAgICAgICBoYXNfZHJhZnRfbWFya2Rvd246ICEhcnVuLmRyYWZ0X21hcmtkb3duLFxuICAgICAgICAgICAgICAgIGhhc19vcHRpbWl6ZWRfanNvbjogISFydW4ub3B0aW1pemVkX2pzb24sXG4gICAgICAgICAgICAgICAgaGFzX2ZpbmFsX291dHB1dF9qc29uOiAhIXJ1bi5maW5hbF9vdXRwdXRfanNvblxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZpbmFsX291dHB1dF9qc29uOiBydW4uZmluYWxfb3V0cHV0X2pzb25cbiAgICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKGlzRmFpbGVkKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBydW5faWQ6IHJ1bi5pZCxcbiAgICAgICAgICAgIHN0YXR1czogJ2ZhaWxlZCcsXG4gICAgICAgICAgICBidXNpbmVzc19uYW1lOiBydW4uaW5wdXRfanNvbj8uYnVzaW5lc3NfbmFtZSB8fCBudWxsLFxuICAgICAgICAgICAgYmxvZ190b3BpYzogcnVuLmlucHV0X2pzb24/LmJsb2dfdG9waWMgfHwgcnVuLmlucHV0X2pzb24/LnRvcGljIHx8IG51bGwsXG4gICAgICAgICAgICByZXZpZXdfcmVhZHk6IGZhbHNlLFxuICAgICAgICAgICAgaHVtYW5fcmV2aWV3X3JlcXVpcmVkOiB0cnVlLFxuICAgICAgICAgICAgZXJyb3JfbWVzc2FnZTogcnVuLmVycm9yX21lc3NhZ2UgfHwgJ1Vua25vd24gZXJyb3InXG4gICAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gU2hvdWxkbid0IGhhcHBlbiwgYnV0IGhhbmRsZSBncmFjZWZ1bGx5XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBydW5faWQ6IHJ1bi5pZCxcbiAgICAgICAgICAgIHN0YXR1czogcnVuLnN0YXR1cyxcbiAgICAgICAgICAgIGJ1c2luZXNzX25hbWU6IHJ1bi5pbnB1dF9qc29uPy5idXNpbmVzc19uYW1lIHx8IG51bGwsXG4gICAgICAgICAgICBibG9nX3RvcGljOiBydW4uaW5wdXRfanNvbj8uYmxvZ190b3BpYyB8fCBydW4uaW5wdXRfanNvbj8udG9waWMgfHwgbnVsbFxuICAgICAgICB9O1xuICAgIH1cbn1cbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL2NhbGxiYWNrLXN0ZXAvL3NlbmRDYWxsYmFja1N0ZXBcIiwgc2VuZENhbGxiYWNrU3RlcCk7XG4iLCAiaW1wb3J0IHsgcmVnaXN0ZXJTdGVwRnVuY3Rpb24gfSBmcm9tIFwid29ya2Zsb3cvaW50ZXJuYWwvcHJpdmF0ZVwiO1xuaW1wb3J0ICdzZXJ2ZXItb25seSc7XG5pbXBvcnQgeyBnZW5lcmF0ZVRleHQgfSBmcm9tICdhaSc7XG5pbXBvcnQgeyBvcGVuYWkgfSBmcm9tICdAYWktc2RrL29wZW5haSc7XG5pbXBvcnQgeyBnZXRBZ2VudENvbmZpZyB9IGZyb20gJy4uLy4uL3N0b3JhZ2UvYWdlbnQtY29uZmlncyc7XG4vKipfX2ludGVybmFsX3dvcmtmbG93c3tcInN0ZXBzXCI6e1wibGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9lZGl0b3Itc3RlcC50c1wiOntcInJ1bkVkaXRvclN0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9lZGl0b3Itc3RlcC8vcnVuRWRpdG9yU3RlcFwifX19fSovO1xuLyoqXG4gKiBFZGl0b3IgQWdlbnQgU3RlcFxuICogSW1wcm92ZXMgdGhlIGRyYWZ0IGJhc2VkIG9uIFNFTyBRQSByZWNvbW1lbmRhdGlvbnMgYW5kIGJyYW5kIGd1aWRlbGluZXNcbiAqIERvZXMgTk9UIG92ZXJ3cml0ZSB0aGUgb3JpZ2luYWwgZHJhZnRfbWFya2Rvd24gLSByZXN1bHQgZ29lcyB0byBmaW5hbF9vdXRwdXRfanNvblxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5FZGl0b3JTdGVwKHJ1bklkLCBpbnB1dCwgcmVzZWFyY2gsIG91dGxpbmUsIG9yaWdpbmFsRHJhZnQsIHNlb1FhKSB7XG4gICAgY29uc29sZS5sb2coYFt2MF0gRWRpdG9yIHN0ZXA6IFN0YXJ0aW5nIGZvciBydW4gJHtydW5JZH1gKTtcbiAgICB0cnkge1xuICAgICAgICAvLyBMb2FkIGFnZW50IGNvbmZpZyBmcm9tIGRhdGFiYXNlXG4gICAgICAgIGNvbnN0IGFnZW50Q29uZmlnID0gYXdhaXQgZ2V0QWdlbnRDb25maWcoJ2VkaXRvcicpO1xuICAgICAgICBpZiAoIWFnZW50Q29uZmlnKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0FjdGl2ZSBhZ2VudCBjb25maWcgbm90IGZvdW5kIGZvciBhZ2VudF9rZXk6IGVkaXRvcicpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFNFTyBCbG9nIEFnZW50IENvbmZpZyBMb2FkZWQ6IGVkaXRvciB2JHthZ2VudENvbmZpZy52ZXJzaW9ufWApO1xuICAgICAgICAvLyBCdWlsZCBzeXN0ZW0gcHJvbXB0IGZyb20gZGF0YWJhc2UgY29uZmlnXG4gICAgICAgIGNvbnN0IHN5c3RlbVByb21wdCA9IFtcbiAgICAgICAgICAgIGFnZW50Q29uZmlnLnN5c3RlbV9wcm9tcHQsXG4gICAgICAgICAgICBhZ2VudENvbmZpZy5za2lsbF9tYXJrZG93blxuICAgICAgICBdLmZpbHRlcihCb29sZWFuKS5qb2luKCdcXG5cXG4nKTtcbiAgICAgICAgLy8gQnVpbGQgY29udGV4dCBmb3IgZWRpdG9yXG4gICAgICAgIGNvbnN0IGVkaXRvckNvbnRleHQgPSBidWlsZEVkaXRvckNvbnRleHQoaW5wdXQsIHJlc2VhcmNoLCBvdXRsaW5lLCBzZW9RYSk7XG4gICAgICAgIC8vIEdldCBtb2RlbCBuYW1lOiB1c2UgREIgY29uZmlnIGlmIGF2YWlsYWJsZSwgb3RoZXJ3aXNlIGZhbGwgYmFjayB0byBlbnYgdmFyIG9yIGRlZmF1bHRcbiAgICAgICAgY29uc3QgbW9kZWxOYW1lID0gYWdlbnRDb25maWcubW9kZWwgfHwgcHJvY2Vzcy5lbnYuRURJVE9SX0FHRU5UX01PREVMIHx8ICdncHQtNS40LW1pbmknO1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBFZGl0b3Igc3RlcDogVXNpbmcgbW9kZWw6ICR7bW9kZWxOYW1lfWApO1xuICAgICAgICAvLyBHZW5lcmF0ZSBpbXByb3ZlZCBkcmFmdFxuICAgICAgICBjb25zdCB7IHRleHQ6IGltcHJvdmVtZW50QW5hbHlzaXMgfSA9IGF3YWl0IGdlbmVyYXRlVGV4dCh7XG4gICAgICAgICAgICBtb2RlbDogb3BlbmFpKG1vZGVsTmFtZSksXG4gICAgICAgICAgICB0ZW1wZXJhdHVyZTogMC43LFxuICAgICAgICAgICAgbWF4VG9rZW5zOiA4MDAwLFxuICAgICAgICAgICAgc3lzdGVtOiBzeXN0ZW1Qcm9tcHQsXG4gICAgICAgICAgICBtZXNzYWdlczogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcm9sZTogJ3VzZXInLFxuICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBgUGxlYXNlIGltcHJvdmUgdGhpcyBkcmFmdCBiYXNlZCBvbiB0aGUgZm9sbG93aW5nIGZlZWRiYWNrOlxuXG5PUklHSU5BTCBEUkFGVDpcbiR7b3JpZ2luYWxEcmFmdH1cblxuU0VPIFFBIEZFRURCQUNLOlxuJHtlZGl0b3JDb250ZXh0fVxuXG5Qcm92aWRlIHRoZSBlZGl0ZWQgZHJhZnQgYW5kIGEgc3VtbWFyeSBvZiBjaGFuZ2VzIG1hZGUuYFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF1cbiAgICAgICAgfSk7XG4gICAgICAgIC8vIFBhcnNlIGltcHJvdmVtZW50IGFuYWx5c2lzXG4gICAgICAgIGxldCBlZGl0b3JPdXRwdXQ7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKGltcHJvdmVtZW50QW5hbHlzaXMpO1xuICAgICAgICAgICAgZWRpdG9yT3V0cHV0ID0ge1xuICAgICAgICAgICAgICAgIGVkaXRlZF9kcmFmdF9tYXJrZG93bjogcGFyc2VkLmVkaXRlZF9kcmFmdCB8fCBvcmlnaW5hbERyYWZ0LFxuICAgICAgICAgICAgICAgIGVkaXRvcl9ub3RlczogcGFyc2VkLm5vdGVzIHx8IFtdLFxuICAgICAgICAgICAgICAgIGNoYW5nZXNfbWFkZTogcGFyc2VkLmNoYW5nZXNfc3VtbWFyeSB8fCBbXSxcbiAgICAgICAgICAgICAgICBodW1hbl9yZXZpZXdfcmVxdWlyZWQ6IHRydWVcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gY2F0Y2ggIHtcbiAgICAgICAgICAgIC8vIEZhbGxiYWNrIGlmIHBhcnNpbmcgZmFpbHNcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgW3YwXSBFZGl0b3Igc3RlcDogRmFpbGVkIHRvIHBhcnNlIGVkaXRvciByZXNwb25zZSwgdXNpbmcgZmFsbGJhY2tgKTtcbiAgICAgICAgICAgIGVkaXRvck91dHB1dCA9IHtcbiAgICAgICAgICAgICAgICBlZGl0ZWRfZHJhZnRfbWFya2Rvd246IG9yaWdpbmFsRHJhZnQsXG4gICAgICAgICAgICAgICAgZWRpdG9yX25vdGVzOiBbXG4gICAgICAgICAgICAgICAgICAgICdFZGl0b3IgcHJvY2Vzc2luZyBjb21wbGV0ZWQgd2l0aCBmYWxsYmFjaydcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIGNoYW5nZXNfbWFkZTogW10sXG4gICAgICAgICAgICAgICAgaHVtYW5fcmV2aWV3X3JlcXVpcmVkOiB0cnVlXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIEVkaXRvciBzdGVwOiBHZW5lcmF0ZWQgZWRpdGVkIGRyYWZ0ICgke2VkaXRvck91dHB1dC5lZGl0ZWRfZHJhZnRfbWFya2Rvd24ubGVuZ3RofSBjaGFycylgKTtcbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gRWRpdG9yIHN0ZXA6ICR7ZWRpdG9yT3V0cHV0LmNoYW5nZXNfbWFkZS5sZW5ndGh9IGNoYW5nZXMgaWRlbnRpZmllZGApO1xuICAgICAgICByZXR1cm4gZWRpdG9yT3V0cHV0O1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgY29uc29sZS5lcnJvcihgW3YwXSBFZGl0b3Igc3RlcCBlcnJvcjogJHtlcnJvck1lc3NhZ2V9YCk7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbn1cbi8qKlxuICogQnVpbGQgY29udGV4dCBmb3IgZWRpdG9yIGJhc2VkIG9uIFNFTyBRQSBmaW5kaW5nc1xuICovIGZ1bmN0aW9uIGJ1aWxkRWRpdG9yQ29udGV4dChpbnB1dCwgcmVzZWFyY2gsIG91dGxpbmUsIHNlb1FhKSB7XG4gICAgY29uc3Qgc2VjdGlvbnMgPSBbXTtcbiAgICBzZWN0aW9ucy5wdXNoKCcjIyBTRU8gUGVyZm9ybWFuY2UgU3VtbWFyeScpO1xuICAgIHNlY3Rpb25zLnB1c2goYE92ZXJhbGwgU2NvcmU6ICR7c2VvUWEub3ZlcmFsbF9zY29yZX0vMTAwYCk7XG4gICAgc2VjdGlvbnMucHVzaCgnXFxuIyMgU2VhcmNoIEludGVudCBBbGlnbm1lbnQnKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBTY29yZTogJHtzZW9RYS5zZWFyY2hfaW50ZW50X2FsaWdubWVudC5zY29yZX0vMTAwYCk7XG4gICAgc2VjdGlvbnMucHVzaChgQW5hbHlzaXM6ICR7c2VvUWEuc2VhcmNoX2ludGVudF9hbGlnbm1lbnQuYW5hbHlzaXN9YCk7XG4gICAgc2VjdGlvbnMucHVzaCgnXFxuIyMgUHJpbWFyeSBLZXl3b3JkIFVzYWdlJyk7XG4gICAgc2VjdGlvbnMucHVzaChgU2NvcmU6ICR7c2VvUWEucHJpbWFyeV9rZXl3b3JkX3VzYWdlLnNjb3JlfS8xMDBgKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBPY2N1cnJlbmNlczogJHtzZW9RYS5wcmltYXJ5X2tleXdvcmRfdXNhZ2Uub2NjdXJyZW5jZXN9IHRpbWVzYCk7XG4gICAgc2VjdGlvbnMucHVzaChgUGxhY2VtZW50OiAke3Nlb1FhLnByaW1hcnlfa2V5d29yZF91c2FnZS5wbGFjZW1lbnRfYW5hbHlzaXN9YCk7XG4gICAgc2VjdGlvbnMucHVzaCgnXFxuIyMgU2Vjb25kYXJ5IEtleXdvcmRzJyk7XG4gICAgc2VjdGlvbnMucHVzaChgU2NvcmU6ICR7c2VvUWEuc2Vjb25kYXJ5X2tleXdvcmRfdXNhZ2Uuc2NvcmV9LzEwMGApO1xuICAgIHNlY3Rpb25zLnB1c2goYENvdmVyZWQ6ICR7c2VvUWEuc2Vjb25kYXJ5X2tleXdvcmRfdXNhZ2Uua2V5d29yZHNfY292ZXJlZC5qb2luKCcsICcpfWApO1xuICAgIGlmIChzZW9RYS5zZWNvbmRhcnlfa2V5d29yZF91c2FnZS5nYXBzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgc2VjdGlvbnMucHVzaChgR2FwczogJHtzZW9RYS5zZWNvbmRhcnlfa2V5d29yZF91c2FnZS5nYXBzLmpvaW4oJywgJyl9YCk7XG4gICAgfVxuICAgIHNlY3Rpb25zLnB1c2goJ1xcbiMjIEhlYWRpbmcgU3RydWN0dXJlJyk7XG4gICAgc2VjdGlvbnMucHVzaChgU2NvcmU6ICR7c2VvUWEuaGVhZGluZ19zdHJ1Y3R1cmVfcmV2aWV3LnNjb3JlfS8xMDBgKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBIMSBQcmVzZW50OiAke3Nlb1FhLmhlYWRpbmdfc3RydWN0dXJlX3Jldmlldy5oMV9wcmVzZW50fWApO1xuICAgIHNlY3Rpb25zLnB1c2goYEgyIENvdW50OiAke3Nlb1FhLmhlYWRpbmdfc3RydWN0dXJlX3Jldmlldy5oMl9jb3VudH1gKTtcbiAgICBpZiAoc2VvUWEuaGVhZGluZ19zdHJ1Y3R1cmVfcmV2aWV3LmhpZXJhcmNoeV9pc3N1ZXMubGVuZ3RoID4gMCkge1xuICAgICAgICBzZWN0aW9ucy5wdXNoKGBJc3N1ZXM6ICR7c2VvUWEuaGVhZGluZ19zdHJ1Y3R1cmVfcmV2aWV3LmhpZXJhcmNoeV9pc3N1ZXMuam9pbignOyAnKX1gKTtcbiAgICB9XG4gICAgc2VjdGlvbnMucHVzaCgnXFxuIyMgQ29udGVudCBEZXB0aCcpO1xuICAgIHNlY3Rpb25zLnB1c2goYFNjb3JlOiAke3Nlb1FhLmNvbnRlbnRfZGVwdGhfcmV2aWV3LnNjb3JlfS8xMDBgKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBXb3JkIENvdW50OiAke3Nlb1FhLmNvbnRlbnRfZGVwdGhfcmV2aWV3LndvcmRfY291bnR9IHdvcmRzYCk7XG4gICAgc2VjdGlvbnMucHVzaChgQ292ZXJhZ2U6ICR7c2VvUWEuY29udGVudF9kZXB0aF9yZXZpZXcuc2VjdGlvbl9jb3ZlcmFnZX1gKTtcbiAgICBpZiAoc2VvUWEuY29udGVudF9kZXB0aF9yZXZpZXcuZGVwdGhfaXNzdWVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgc2VjdGlvbnMucHVzaChgSXNzdWVzOiAke3Nlb1FhLmNvbnRlbnRfZGVwdGhfcmV2aWV3LmRlcHRoX2lzc3Vlcy5qb2luKCc7ICcpfWApO1xuICAgIH1cbiAgICBzZWN0aW9ucy5wdXNoKCdcXG4jIyBSZWFkYWJpbGl0eScpO1xuICAgIHNlY3Rpb25zLnB1c2goYFNjb3JlOiAke3Nlb1FhLnJlYWRhYmlsaXR5X3Jldmlldy5zY29yZX0vMTAwYCk7XG4gICAgc2VjdGlvbnMucHVzaChgQXZnIFNlbnRlbmNlIExlbmd0aDogJHtzZW9RYS5yZWFkYWJpbGl0eV9yZXZpZXcuYXZnX3NlbnRlbmNlX2xlbmd0aH0gd29yZHNgKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBSZWFkaW5nIExldmVsOiAke3Nlb1FhLnJlYWRhYmlsaXR5X3Jldmlldy5mbGVzY2hfa2luY2FpZF9lc3RpbWF0ZX1gKTtcbiAgICBpZiAoc2VvUWEucmVhZGFiaWxpdHlfcmV2aWV3LnJlYWRhYmlsaXR5X2lzc3Vlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHNlY3Rpb25zLnB1c2goYElzc3VlczogJHtzZW9RYS5yZWFkYWJpbGl0eV9yZXZpZXcucmVhZGFiaWxpdHlfaXNzdWVzLmpvaW4oJzsgJyl9YCk7XG4gICAgfVxuICAgIHNlY3Rpb25zLnB1c2goJ1xcbiMjIEludGVybmFsIExpbmtpbmcnKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBTY29yZTogJHtzZW9RYS5pbnRlcm5hbF9saW5raW5nX3Jldmlldy5zY29yZX0vMTAwYCk7XG4gICAgc2VjdGlvbnMucHVzaChgTGlua3MgRm91bmQ6ICR7c2VvUWEuaW50ZXJuYWxfbGlua2luZ19yZXZpZXcuaW50ZXJuYWxfbGlua3NfZm91bmR9YCk7XG4gICAgaWYgKHNlb1FhLmludGVybmFsX2xpbmtpbmdfcmV2aWV3LmludGVybmFsX2xpbmtfcmVjb21tZW5kYXRpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgc2VjdGlvbnMucHVzaChgUmVjb21tZW5kYXRpb25zOiAke3Nlb1FhLmludGVybmFsX2xpbmtpbmdfcmV2aWV3LmludGVybmFsX2xpbmtfcmVjb21tZW5kYXRpb25zLmpvaW4oJzsgJyl9YCk7XG4gICAgfVxuICAgIHNlY3Rpb25zLnB1c2goJ1xcbiMjIENUQSAmIEJyYW5kIEd1aWRlbGluZXMnKTtcbiAgICBpZiAoaW5wdXQuY3RhX25vdGVzKSB7XG4gICAgICAgIHNlY3Rpb25zLnB1c2goYENUQSBOb3RlczogJHtpbnB1dC5jdGFfbm90ZXN9YCk7XG4gICAgfVxuICAgIGlmIChpbnB1dC5icmFuZF92b2ljZV9ub3Rlcykge1xuICAgICAgICBzZWN0aW9ucy5wdXNoKGBCcmFuZCBWb2ljZTogJHtpbnB1dC5icmFuZF92b2ljZV9ub3Rlc31gKTtcbiAgICB9XG4gICAgaWYgKGlucHV0LmF1ZGllbmNlX25vdGVzKSB7XG4gICAgICAgIHNlY3Rpb25zLnB1c2goYFRhcmdldCBBdWRpZW5jZTogJHtpbnB1dC5hdWRpZW5jZV9ub3Rlc31gKTtcbiAgICB9XG4gICAgcmV0dXJuIHNlY3Rpb25zLmpvaW4oJ1xcbicpO1xufVxucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvZWRpdG9yLXN0ZXAvL3J1bkVkaXRvclN0ZXBcIiwgcnVuRWRpdG9yU3RlcCk7XG4iLCAiaW1wb3J0IHsgcmVnaXN0ZXJTdGVwRnVuY3Rpb24gfSBmcm9tIFwid29ya2Zsb3cvaW50ZXJuYWwvcHJpdmF0ZVwiO1xuaW1wb3J0ICdzZXJ2ZXItb25seSc7XG5pbXBvcnQgeyB1cGRhdGVSdW5TdGF0dXMsIHVwZGF0ZVJ1bkVycm9yLCBjb21wbGV0ZVJ1biB9IGZyb20gJy4uLy4uL3N0b3JhZ2UvcnVucyc7XG4vKipfX2ludGVybmFsX3dvcmtmbG93c3tcInN0ZXBzXCI6e1wibGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9oZWxwZXJzLnRzXCI6e1wiY29tcGxldGVSdW5TdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvaGVscGVycy8vY29tcGxldGVSdW5TdGVwXCJ9LFwibWFya1J1bkZhaWxlZFN0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9oZWxwZXJzLy9tYXJrUnVuRmFpbGVkU3RlcFwifSxcIm1hcmtSdW5SdW5uaW5nU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL2hlbHBlcnMvL21hcmtSdW5SdW5uaW5nU3RlcFwifX19fSovO1xuLyoqXG4gKiBNYXJrIGEgcnVuIGFzIHJ1bm5pbmcgKHRyYW5zaXRpb24gZnJvbSBxdWV1ZWQgdG8gcnVubmluZylcbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gbWFya1J1blJ1bm5pbmdTdGVwKHJ1bklkKSB7XG4gICAgY29uc29sZS5sb2coYFt2MF0gSGVscGVyOiBNYXJraW5nIHJ1biAke3J1bklkfSBhcyBydW5uaW5nYCk7XG4gICAgYXdhaXQgdXBkYXRlUnVuU3RhdHVzKHJ1bklkLCAncmVzZWFyY2hpbmcnKTtcbn1cbi8qKlxuICogTWFyayBhIHJ1biBhcyBmYWlsZWQgd2l0aCBlcnJvciBtZXNzYWdlXG4gKiBDYWxsYmFjayBpcyBzZW50IGJ5IHdvcmtmbG93IG9yY2hlc3RyYXRvciwgbm90IGhlcmVcbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gbWFya1J1bkZhaWxlZFN0ZXAocnVuSWQsIGVycm9yTWVzc2FnZSkge1xuICAgIGNvbnNvbGUubG9nKGBbdjBdIEhlbHBlcjogTWFya2luZyBydW4gJHtydW5JZH0gYXMgZmFpbGVkIHdpdGggZXJyb3I6ICR7ZXJyb3JNZXNzYWdlfWApO1xuICAgIGF3YWl0IHVwZGF0ZVJ1bkVycm9yKHJ1bklkLCBlcnJvck1lc3NhZ2UpO1xufVxuLyoqXG4gKiBDb21wbGV0ZSBhIHJ1biB3aXRoIGZpbmFsIG91dHB1dFxuICogQ2FsbGJhY2sgaXMgc2VudCBieSB3b3JrZmxvdyBvcmNoZXN0cmF0b3IsIG5vdCBoZXJlXG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNvbXBsZXRlUnVuU3RlcChydW5JZCwgZmluYWxPdXRwdXQpIHtcbiAgICBjb25zb2xlLmxvZyhgW3YwXSBIZWxwZXI6IENvbXBsZXRpbmcgcnVuICR7cnVuSWR9YCk7XG4gICAgYXdhaXQgY29tcGxldGVSdW4ocnVuSWQsIGZpbmFsT3V0cHV0KTtcbn1cbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL2hlbHBlcnMvL21hcmtSdW5SdW5uaW5nU3RlcFwiLCBtYXJrUnVuUnVubmluZ1N0ZXApO1xucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvaGVscGVycy8vbWFya1J1bkZhaWxlZFN0ZXBcIiwgbWFya1J1bkZhaWxlZFN0ZXApO1xucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvaGVscGVycy8vY29tcGxldGVSdW5TdGVwXCIsIGNvbXBsZXRlUnVuU3RlcCk7XG4iLCAiaW1wb3J0IHsgcmVnaXN0ZXJTdGVwRnVuY3Rpb24gfSBmcm9tIFwid29ya2Zsb3cvaW50ZXJuYWwvcHJpdmF0ZVwiO1xuaW1wb3J0ICdzZXJ2ZXItb25seSc7XG5pbXBvcnQgeyBnZW5lcmF0ZVRleHQgfSBmcm9tICdhaSc7XG5pbXBvcnQgeyBvcGVuYWkgfSBmcm9tICdAYWktc2RrL29wZW5haSc7XG5pbXBvcnQgeyBnZXRBZ2VudENvbmZpZyB9IGZyb20gJy4uLy4uL3N0b3JhZ2UvYWdlbnQtY29uZmlncyc7XG4vKipfX2ludGVybmFsX3dvcmtmbG93c3tcInN0ZXBzXCI6e1wibGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9tZXRhLXN0ZXAudHNcIjp7XCJydW5NZXRhU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL21ldGEtc3RlcC8vcnVuTWV0YVN0ZXBcIn19fX0qLztcbi8qKlxuICogTWV0YSBBZ2VudCBTdGVwIC0gUGhhc2UgMkMtRlxuICogR2VuZXJhdGVzIFNFTyBtZXRhZGF0YSBmb3IgaHVtYW4gcmV2aWV3XG4gKiBEb2VzIE5PVCBwdWJsaXNoLCBjYWxsIGV4dGVybmFsIHNlcnZpY2VzLCBvciBvdmVyd3JpdGUgZHJhZnRzXG4gKiBPdXRwdXQgZ29lcyB0byBmaW5hbF9vdXRwdXRfanNvbiBhcyBtZXRhX2pzb25cbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gcnVuTWV0YVN0ZXAocnVuSWQsIGlucHV0LCByZXNlYXJjaCwgb3V0bGluZSwgb3JpZ2luYWxEcmFmdCwgc2VvUWEsIGVkaXRlZERyYWZ0KSB7XG4gICAgY29uc29sZS5sb2coYFt2MF0gTWV0YSBzdGVwOiBTdGFydGluZyBmb3IgcnVuICR7cnVuSWR9YCk7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gTG9hZCBhZ2VudCBjb25maWcgZnJvbSBkYXRhYmFzZVxuICAgICAgICBjb25zdCBhZ2VudENvbmZpZyA9IGF3YWl0IGdldEFnZW50Q29uZmlnKCdtZXRhJyk7XG4gICAgICAgIGlmICghYWdlbnRDb25maWcpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQWN0aXZlIGFnZW50IGNvbmZpZyBub3QgZm91bmQgZm9yIGFnZW50X2tleTogbWV0YScpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFNFTyBCbG9nIEFnZW50IENvbmZpZyBMb2FkZWQ6IG1ldGEgdiR7YWdlbnRDb25maWcudmVyc2lvbn1gKTtcbiAgICAgICAgLy8gQnVpbGQgc3lzdGVtIHByb21wdCBmcm9tIGRhdGFiYXNlIGNvbmZpZ1xuICAgICAgICBjb25zdCBzeXN0ZW1Qcm9tcHQgPSBbXG4gICAgICAgICAgICBhZ2VudENvbmZpZy5zeXN0ZW1fcHJvbXB0LFxuICAgICAgICAgICAgYWdlbnRDb25maWcuc2tpbGxfbWFya2Rvd25cbiAgICAgICAgXS5maWx0ZXIoQm9vbGVhbikuam9pbignXFxuXFxuJyk7XG4gICAgICAgIC8vIEJ1aWxkIGNvbnRleHQgZm9yIG1ldGEgZ2VuZXJhdGlvblxuICAgICAgICBjb25zdCBtZXRhQ29udGV4dCA9IGJ1aWxkTWV0YUNvbnRleHQoaW5wdXQsIHJlc2VhcmNoLCBvdXRsaW5lLCBzZW9RYSwgb3JpZ2luYWxEcmFmdCwgZWRpdGVkRHJhZnQpO1xuICAgICAgICAvLyBHZXQgbW9kZWwgbmFtZTogdXNlIERCIGNvbmZpZyBpZiBhdmFpbGFibGUsIG90aGVyd2lzZSBmYWxsIGJhY2sgdG8gZW52IHZhciBvciBkZWZhdWx0XG4gICAgICAgIGNvbnN0IG1vZGVsTmFtZSA9IGFnZW50Q29uZmlnLm1vZGVsIHx8IHByb2Nlc3MuZW52Lk1FVEFfQUdFTlRfTU9ERUwgfHwgJ2dwdC01LjQtbWluaSc7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIE1ldGEgc3RlcDogVXNpbmcgbW9kZWw6ICR7bW9kZWxOYW1lfWApO1xuICAgICAgICAvLyBHZW5lcmF0ZSBtZXRhZGF0YVxuICAgICAgICBjb25zdCB7IHRleHQ6IG1ldGFBbmFseXNpcyB9ID0gYXdhaXQgZ2VuZXJhdGVUZXh0KHtcbiAgICAgICAgICAgIG1vZGVsOiBvcGVuYWkobW9kZWxOYW1lKSxcbiAgICAgICAgICAgIHN5c3RlbTogc3lzdGVtUHJvbXB0LFxuICAgICAgICAgICAgdGVtcGVyYXR1cmU6IDAuNSxcbiAgICAgICAgICAgIG1lc3NhZ2VzOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICByb2xlOiAndXNlcicsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IG1ldGFDb250ZXh0XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXVxuICAgICAgICB9KTtcbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gTWV0YSBzdGVwOiBSZWNlaXZlZCBhbmFseXNpcywgcGFyc2luZyBKU09OYCk7XG4gICAgICAgIC8vIFBhcnNlIHRoZSByZXNwb25zZVxuICAgICAgICBsZXQgbWV0YU91dHB1dDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIEV4dHJhY3QgSlNPTiBmcm9tIHJlc3BvbnNlIChtYXkgaGF2ZSBzdXJyb3VuZGluZyB0ZXh0KVxuICAgICAgICAgICAgY29uc3QganNvbk1hdGNoID0gbWV0YUFuYWx5c2lzLm1hdGNoKC9cXHtbXFxzXFxTXSpcXH0vKTtcbiAgICAgICAgICAgIGlmICghanNvbk1hdGNoKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBKU09OIGZvdW5kIGluIHJlc3BvbnNlJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBtZXRhT3V0cHV0ID0gSlNPTi5wYXJzZShqc29uTWF0Y2hbMF0pO1xuICAgICAgICB9IGNhdGNoIChwYXJzZUVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYFt2MF0gTWV0YSBzdGVwOiBGYWlsZWQgdG8gcGFyc2UgSlNPTiByZXNwb25zZSwgdXNpbmcgZmFsbGJhY2tgLCBwYXJzZUVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBwYXJzZUVycm9yLm1lc3NhZ2UgOiBTdHJpbmcocGFyc2VFcnJvcikpO1xuICAgICAgICAgICAgbWV0YU91dHB1dCA9IGdlbmVyYXRlRmFsbGJhY2tNZXRhKGlucHV0LCByZXNlYXJjaCwgc2VvUWEsIG9yaWdpbmFsRHJhZnQpO1xuICAgICAgICB9XG4gICAgICAgIC8vIFZhbGlkYXRlIHJlcXVpcmVkIGZpZWxkc1xuICAgICAgICBjb25zdCByZXF1aXJlZEZpZWxkcyA9IFtcbiAgICAgICAgICAgICdzZW9fdGl0bGUnLFxuICAgICAgICAgICAgJ21ldGFfZGVzY3JpcHRpb24nLFxuICAgICAgICAgICAgJ3N1Z2dlc3RlZF9zbHVnJyxcbiAgICAgICAgICAgICdwcmltYXJ5X2tleXdvcmQnLFxuICAgICAgICAgICAgJ3NlY29uZGFyeV9rZXl3b3Jkc191c2VkJyxcbiAgICAgICAgICAgICdleGNlcnB0JyxcbiAgICAgICAgICAgICdvZ190aXRsZScsXG4gICAgICAgICAgICAnb2dfZGVzY3JpcHRpb24nLFxuICAgICAgICAgICAgJ2Nhbm9uaWNhbF91cmxfc3VnZ2VzdGlvbicsXG4gICAgICAgICAgICAnc2NoZW1hX3R5cGVfc3VnZ2VzdGlvbicsXG4gICAgICAgICAgICAnaHVtYW5fcmV2aWV3X25vdGVzJ1xuICAgICAgICBdO1xuICAgICAgICBmb3IgKGNvbnN0IGZpZWxkIG9mIHJlcXVpcmVkRmllbGRzKXtcbiAgICAgICAgICAgIGlmIChtZXRhT3V0cHV0W2ZpZWxkXSA9PT0gdW5kZWZpbmVkIHx8IG1ldGFPdXRwdXRbZmllbGRdID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBbdjBdIE1ldGEgc3RlcDogTWlzc2luZyBmaWVsZCAke2ZpZWxkfSwgdXNpbmcgZmFsbGJhY2tgKTtcbiAgICAgICAgICAgICAgICBtZXRhT3V0cHV0ID0gZ2VuZXJhdGVGYWxsYmFja01ldGEoaW5wdXQsIHJlc2VhcmNoLCBzZW9RYSwgb3JpZ2luYWxEcmFmdCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gTWV0YSBzdGVwOiBDb21wbGV0ZSBmb3IgcnVuICR7cnVuSWR9YCwgYEdlbmVyYXRlZCBtZXRhZGF0YTogJHttZXRhT3V0cHV0LnNlb190aXRsZS5zdWJzdHJpbmcoMCwgNTApfS4uLmApO1xuICAgICAgICByZXR1cm4gbWV0YU91dHB1dDtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2MF0gTWV0YSBzdGVwIGVycm9yIGZvciBydW4gJHtydW5JZH06ICR7ZXJyb3JNZXNzYWdlfWApO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG59XG4vKipcbiAqIEJ1aWxkIGNvbnRleHQgcHJvbXB0IGZvciBtZXRhZGF0YSBnZW5lcmF0aW9uXG4gKi8gZnVuY3Rpb24gYnVpbGRNZXRhQ29udGV4dChpbnB1dCwgcmVzZWFyY2gsIG91dGxpbmUsIHNlb1FhLCBvcmlnaW5hbERyYWZ0LCBlZGl0ZWREcmFmdCkge1xuICAgIC8vIFZhbGlkYXRlIHJlcXVpcmVkIHJlc2VhcmNoLmtleV9maW5kaW5ncyBiZWZvcmUgdXNpbmdcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkocmVzZWFyY2gua2V5X2ZpbmRpbmdzKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Jlc2VhcmNoIG91dHB1dCBtaXNzaW5nIHJlcXVpcmVkIGtleV9maW5kaW5ncyBhcnJheSBmb3IgbWV0YS1zdGVwJyk7XG4gICAgfVxuICAgIGNvbnN0IHdvcmRDb3VudCA9IGVkaXRlZERyYWZ0LnNwbGl0KC9cXHMrLykubGVuZ3RoO1xuICAgIGNvbnN0IGhlYWRpbmdzID0gZWRpdGVkRHJhZnQubWF0Y2goL14jK1xccysuKyQvZ20pIHx8IFtdO1xuICAgIGNvbnN0IGtleUZpbmRpbmdzU3VtbWFyeSA9IHJlc2VhcmNoLmtleV9maW5kaW5ncy5zbGljZSgwLCAzKS5qb2luKCdcXG4tICcpO1xuICAgIHJldHVybiBgWW91IGFyZSBhbiBleHBlcnQgU0VPIG1ldGFkYXRhIHNwZWNpYWxpc3QuIEdlbmVyYXRlIFNFTyBtZXRhZGF0YSBmb3IgYSBibG9nIHBvc3QgZm9yIGh1bWFuIHJldmlldy5cblxuQkxPRyBUT1BJQzogJHtpbnB1dC5ibG9nX3RvcGljfVxuQlVTSU5FU1MgTkFNRTogJHtpbnB1dC5idXNpbmVzc19uYW1lIHx8ICdOb3QgcHJvdmlkZWQnfVxuV0VCU0lURSBVUkw6ICR7aW5wdXQud2Vic2l0ZV91cmwgfHwgJ05vdCBwcm92aWRlZCd9XG5QUklNQVJZIEtFWVdPUkQ6ICR7aW5wdXQucHJpbWFyeV9rZXl3b3JkfVxuU0VDT05EQVJZIEtFWVdPUkRTOiAkeyhpbnB1dC5zZWNvbmRhcnlfa2V5d29yZHMgfHwgW10pLmpvaW4oJywgJykgfHwgJ05vbmUgcHJvdmlkZWQnfVxuVEFSR0VUIEFVRElFTkNFOiAke2lucHV0LmF1ZGllbmNlX25vdGVzIHx8ICdHZW5lcmFsIGF1ZGllbmNlJ31cblxuUkVTRUFSQ0ggU1VNTUFSWTpcbi0gJHtrZXlGaW5kaW5nc1N1bW1hcnl9XG5cbk9VVExJTkUgU1RSVUNUVVJFOlxuJHtvdXRsaW5lLnNlY3Rpb25zLm1hcCgocyk9PmAtICR7cy5oZWFkaW5nfSAoJHtzLnN1YnNlY3Rpb25zPy5sZW5ndGggfHwgMH0gc3Vic2VjdGlvbnMpYCkuam9pbignXFxuJyl9XG5cblNFTyBRQSBSRVZJRVc6XG4tIE92ZXJhbGwgU2NvcmU6ICR7c2VvUWEub3ZlcmFsbF9zY29yZX1cbi0gU2VhcmNoIEludGVudCBBbGlnbm1lbnQ6ICR7c2VvUWEuc2VhcmNoX2ludGVudF9hbGlnbm1lbnR9XG4tIEtleXdvcmQgVXNhZ2U6ICR7c2VvUWEua2V5d29yZF91c2FnZV9hc3Nlc3NtZW50fVxuLSBIZWFkaW5nIFN0cnVjdHVyZTogJHtzZW9RYS5oZWFkaW5nX3N0cnVjdHVyZV9hc3Nlc3NtZW50fVxuXG5DT05URU5UIFNUQVRTOlxuLSBXb3JkIENvdW50OiAke3dvcmRDb3VudH1cbi0gSGVhZGluZ3M6ICR7aGVhZGluZ3MubGVuZ3RofVxuLSBIYXMgQ1RBOiAke2lucHV0LmN0YV9ub3RlcyA/ICdZZXMnIDogJ05vJ31cbi0gSGFzIEludGVybmFsIExpbmtzOiAke2lucHV0LmludGVybmFsX2xpbmtfbm90ZXMgPyAnWWVzJyA6ICdObyd9XG5cbkdlbmVyYXRlIG1ldGFkYXRhIHRoYXQ6XG4xLiBBY2N1cmF0ZWx5IHJlcHJlc2VudHMgdGhlIGJsb2cgY29udGVudCAoZG8gbm90IGludmVudCBjbGFpbXMpXG4yLiBJbmNsdWRlcyB0aGUgcHJpbWFyeSBrZXl3b3JkIG5hdHVyYWxseSBpbiB0aXRsZSBhbmQgZGVzY3JpcHRpb25cbjMuIElzIFNFTy1vcHRpbWl6ZWQgZm9yIHNlYXJjaCBlbmdpbmVzXG40LiBJcyBjb21wZWxsaW5nIGZvciBodW1hbiByZWFkZXJzIGFuZCBDVFJcbjUuIEZvbGxvd3MgYmVzdCBwcmFjdGljZXMgKHRpdGxlIG1heCA2MCBjaGFycywgZGVzY3JpcHRpb24gbWF4IDE2MCBjaGFycylcbjYuIEluY2x1ZGVzIHJldmlldyBub3RlcyBmb3IgdGhlIGh1bWFuIGVkaXRvclxuXG5SZXR1cm4gYSBKU09OIG9iamVjdCB3aXRoIHRoZXNlIGV4YWN0IGZpZWxkczpcbntcbiAgXCJzZW9fdGl0bGVcIjogXCJTRU8tb3B0aW1pemVkIHRpdGxlIChtYXggNjAgY2hhcnMpXCIsXG4gIFwibWV0YV9kZXNjcmlwdGlvblwiOiBcIkNvbXBlbGxpbmcgZGVzY3JpcHRpb24gKG1heCAxNjAgY2hhcnMpXCIsXG4gIFwic3VnZ2VzdGVkX3NsdWdcIjogXCJ1cmwtc2x1Zy1mb3JtYXRcIixcbiAgXCJwcmltYXJ5X2tleXdvcmRcIjogXCIke2lucHV0LnByaW1hcnlfa2V5d29yZH1cIixcbiAgXCJzZWNvbmRhcnlfa2V5d29yZHNfdXNlZFwiOiBbXCJrZXl3b3JkMVwiLCBcImtleXdvcmQyXCJdLFxuICBcImV4Y2VycHRcIjogXCJCcmllZiBzdW1tYXJ5IGZvciBibG9nIGxpc3RpbmdzIChtYXggMTU1IGNoYXJzKVwiLFxuICBcIm9nX3RpdGxlXCI6IFwiT3BlbkdyYXBoIHRpdGxlIGZvciBzb2NpYWwgc2hhcmluZ1wiLFxuICBcIm9nX2Rlc2NyaXB0aW9uXCI6IFwiT3BlbkdyYXBoIGRlc2NyaXB0aW9uIGZvciBzb2NpYWwgc2hhcmluZ1wiLFxuICBcImNhbm9uaWNhbF91cmxfc3VnZ2VzdGlvblwiOiBcImh0dHBzOi8vZXhhbXBsZS5jb20vYmxvZy91cmwtc2x1ZyBvciBsZWF2ZSBhcyBudWxsIGlmIHdlYnNpdGVfdXJsIG5vdCBwcm92aWRlZFwiLFxuICBcInNjaGVtYV90eXBlX3N1Z2dlc3Rpb25cIjogXCJCbG9nUG9zdGluZyBvciBOZXdzQXJ0aWNsZVwiLFxuICBcImh1bWFuX3Jldmlld19ub3Rlc1wiOiBbXCJub3RlMVwiLCBcIm5vdGUyXCJdXG59YDtcbn1cbi8qKlxuICogR2VuZXJhdGUgZmFsbGJhY2sgbWV0YWRhdGEgaWYgQUkgcGFyc2luZyBmYWlsc1xuICovIGZ1bmN0aW9uIGdlbmVyYXRlRmFsbGJhY2tNZXRhKGlucHV0LCByZXNlYXJjaCwgc2VvUWEsIGRyYWZ0KSB7XG4gICAgY29uc3QgcHJpbWFyeUtleXdvcmQgPSBpbnB1dC5wcmltYXJ5X2tleXdvcmQgfHwgJ2Jsb2cgcG9zdCc7XG4gICAgY29uc3Qgc2x1ZyA9IGlucHV0LmJsb2dfdG9waWMudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9bXmEtejAtOV0rL2csICctJykucmVwbGFjZSgvXi18LSQvZywgJycpO1xuICAgIGNvbnN0IHdvcmRDb3VudCA9IGRyYWZ0LnNwbGl0KC9cXHMrLykubGVuZ3RoO1xuICAgIHJldHVybiB7XG4gICAgICAgIHNlb190aXRsZTogYCR7aW5wdXQuYmxvZ190b3BpY30gLSAke2lucHV0LmJ1c2luZXNzX25hbWUgfHwgJ0Jsb2cnfWAsXG4gICAgICAgIG1ldGFfZGVzY3JpcHRpb246IGBDb21wcmVoZW5zaXZlIGd1aWRlIHRvICR7aW5wdXQuYmxvZ190b3BpYy50b0xvd2VyQ2FzZSgpfS4gUmVzZWFyY2gtYmFja2VkIGluc2lnaHRzIGFuZCBwcmFjdGljYWwgc3RyYXRlZ2llcy4gJHt3b3JkQ291bnR9IHdvcmRzLmAsXG4gICAgICAgIHN1Z2dlc3RlZF9zbHVnOiBzbHVnLFxuICAgICAgICBwcmltYXJ5X2tleXdvcmQ6IHByaW1hcnlLZXl3b3JkLFxuICAgICAgICBzZWNvbmRhcnlfa2V5d29yZHNfdXNlZDogaW5wdXQuc2Vjb25kYXJ5X2tleXdvcmRzIHx8IFtdLFxuICAgICAgICBleGNlcnB0OiBgTGVhcm4gYWJvdXQgJHtpbnB1dC5ibG9nX3RvcGljLnRvTG93ZXJDYXNlKCl9IHdpdGggaW5zaWdodHMgZnJvbSBvdXIgcmVzZWFyY2guICR7d29yZENvdW50fS13b3JkIGd1aWRlIGNvdmVyaW5nIGtleSBhc3BlY3RzIGFuZCBzdHJhdGVnaWVzLmAsXG4gICAgICAgIG9nX3RpdGxlOiBgJHtpbnB1dC5ibG9nX3RvcGljfSB8ICR7aW5wdXQuYnVzaW5lc3NfbmFtZSB8fCAnQmxvZyd9YCxcbiAgICAgICAgb2dfZGVzY3JpcHRpb246IGBEaXNjb3ZlciAke2lucHV0LmJsb2dfdG9waWMudG9Mb3dlckNhc2UoKX0uIENvbXByZWhlbnNpdmUgZ3VpZGUgd2l0aCByZXNlYXJjaCBhbmQgaW5zaWdodHMuYCxcbiAgICAgICAgY2Fub25pY2FsX3VybF9zdWdnZXN0aW9uOiBpbnB1dC53ZWJzaXRlX3VybCA/IGAke2lucHV0LndlYnNpdGVfdXJsfS9ibG9nLyR7c2x1Z31gIDogbnVsbCxcbiAgICAgICAgc2NoZW1hX3R5cGVfc3VnZ2VzdGlvbjogJ0Jsb2dQb3N0aW5nJyxcbiAgICAgICAgaHVtYW5fcmV2aWV3X25vdGVzOiBbXG4gICAgICAgICAgICBgT3ZlcmFsbCBTRU8gU2NvcmU6ICR7c2VvUWEub3ZlcmFsbF9zY29yZX1gLFxuICAgICAgICAgICAgJ1JldmlldyBhbmQgYWRqdXN0IG1ldGFkYXRhIGFzIG5lZWRlZCBmb3IgeW91ciBicmFuZCB2b2ljZScsXG4gICAgICAgICAgICAnRW5zdXJlIFNFTyB0aXRsZSBhbmQgbWV0YSBkZXNjcmlwdGlvbiBhcmUgY29tcGVsbGluZyBmb3IgQ1RSJyxcbiAgICAgICAgICAgICdWZXJpZnkgY2Fub25pY2FsIFVSTCBtYXRjaGVzIHlvdXIgc2l0ZSBzdHJ1Y3R1cmUnLFxuICAgICAgICAgICAgJ0NoZWNrIHRoYXQgc2NoZW1hIHR5cGUgbWF0Y2hlcyB5b3VyIGNvbnRlbnQgZm9ybWF0J1xuICAgICAgICBdXG4gICAgfTtcbn1cbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL21ldGEtc3RlcC8vcnVuTWV0YVN0ZXBcIiwgcnVuTWV0YVN0ZXApO1xuIiwgImltcG9ydCB7IHJlZ2lzdGVyU3RlcEZ1bmN0aW9uIH0gZnJvbSBcIndvcmtmbG93L2ludGVybmFsL3ByaXZhdGVcIjtcbmltcG9ydCAnc2VydmVyLW9ubHknO1xuaW1wb3J0IHsgZ2VuZXJhdGVUZXh0IH0gZnJvbSAnYWknO1xuaW1wb3J0IHsgb3BlbmFpIH0gZnJvbSAnQGFpLXNkay9vcGVuYWknO1xuaW1wb3J0IHsgdXBkYXRlUnVuU3RhdHVzIH0gZnJvbSAnLi4vLi4vc3RvcmFnZS9ydW5zJztcbmltcG9ydCB7IGdldEFnZW50Q29uZmlnIH0gZnJvbSAnLi4vLi4vc3RvcmFnZS9hZ2VudC1jb25maWdzJztcbi8qKl9faW50ZXJuYWxfd29ya2Zsb3dze1wic3RlcHNcIjp7XCJsaWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL291dGxpbmUtc3RlcC50c1wiOntcInJ1bk91dGxpbmVTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvb3V0bGluZS1zdGVwLy9ydW5PdXRsaW5lU3RlcFwifX19fSovO1xuLyoqXG4gKiBPdXRsaW5lIFN0ZXAgLSBQaGFzZSAyQy1CXG4gKiBSdW5zIGluc2lkZSBhIGR1cmFibGUgc3RlcCBmdW5jdGlvbiAoaGFzIE5vZGUuanMgYWNjZXNzKVxuICogQ2FsbHMgQUkgbW9kZWwgdG8gZ2VuZXJhdGUgY29udGVudCBvdXRsaW5lIHdpdGggc3RydWN0dXJlXG4gKiBVc2VzIHJlc2VhcmNoIGRhdGEgaWYgYXZhaWxhYmxlIHRvIGluZm9ybSBvdXRsaW5lXG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJ1bk91dGxpbmVTdGVwKHJ1bklkLCBpbnB1dCwgcmVzZWFyY2hEYXRhKSB7XG4gICAgY29uc29sZS5sb2coYFt2MF0gT3V0bGluZSBzdGVwOiBDcmVhdGluZyBvdXRsaW5lIGZvciBydW4gJHtydW5JZH1gKTtcbiAgICAvLyBDcmVhdGUgY29udGV4dCBmcm9tIGF2YWlsYWJsZSBkYXRhIChuZWVkZWQgZm9yIGZhbGxiYWNrIGluIGNhdGNoIGJsb2NrKVxuICAgIGNvbnN0IHRvcGljID0gaW5wdXQuYmxvZ190b3BpYyB8fCBpbnB1dC50b3BpYyB8fCAnWW91ciBUb3BpYyc7XG4gICAgY29uc3QgcHJpbWFyeUtleXdvcmQgPSBpbnB1dC5wcmltYXJ5X2tleXdvcmQgfHwgJ3ByaW1hcnkga2V5d29yZCc7XG4gICAgY29uc3Qgc2Vjb25kYXJ5S2V5d29yZHMgPSAoaW5wdXQuc2Vjb25kYXJ5X2tleXdvcmRzIHx8IGlucHV0LmtleXdvcmRzIHx8IFtdKS5qb2luKCcsICcpIHx8ICdzZWNvbmRhcnkga2V5d29yZHMnO1xuICAgIGNvbnN0IGJ1c2luZXNzTmFtZSA9IGlucHV0LmJ1c2luZXNzX25hbWUgfHwgJ1lvdXIgQnVzaW5lc3MnO1xuICAgIGNvbnN0IGF1ZGllbmNlTm90ZXMgPSBpbnB1dC5hdWRpZW5jZV9ub3RlcyB8fCAnVGFyZ2V0IGF1ZGllbmNlIG5vdCBzcGVjaWZpZWQnO1xuICAgIGNvbnN0IGJyYW5kVm9pY2UgPSBpbnB1dC5icmFuZF92b2ljZV9ub3RlcyB8fCAnUHJvZmVzc2lvbmFsIGFuZCBjbGVhcic7XG4gICAgY29uc3QgY3RhTm90ZXMgPSBpbnB1dC5jdGFfbm90ZXMgfHwgJ0VuY291cmFnZSBlbmdhZ2VtZW50JztcbiAgICBjb25zdCBhZGRpdGlvbmFsTm90ZXMgPSBpbnB1dC5hZGRpdGlvbmFsX29yZGVyX25vdGVzIHx8ICdObyBhZGRpdGlvbmFsIG5vdGVzJztcbiAgICBjb25zdCB0YXJnZXRXb3JkQ291bnQgPSBpbnB1dC50YXJnZXRfd29yZF9jb3VudCB8fCAxNTAwO1xuICAgIHRyeSB7XG4gICAgICAgIC8vIExvYWQgYWdlbnQgY29uZmlnIGZyb20gZGF0YWJhc2VcbiAgICAgICAgY29uc3QgYWdlbnRDb25maWcgPSBhd2FpdCBnZXRBZ2VudENvbmZpZygnb3V0bGluZScpO1xuICAgICAgICBpZiAoIWFnZW50Q29uZmlnKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0FjdGl2ZSBhZ2VudCBjb25maWcgbm90IGZvdW5kIGZvciBhZ2VudF9rZXk6IG91dGxpbmUnKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBTRU8gQmxvZyBBZ2VudCBDb25maWcgTG9hZGVkOiBvdXRsaW5lIHYke2FnZW50Q29uZmlnLnZlcnNpb259YCk7XG4gICAgICAgIC8vIEJ1aWxkIHN5c3RlbSBwcm9tcHQgZnJvbSBkYXRhYmFzZSBjb25maWdcbiAgICAgICAgY29uc3Qgc3lzdGVtUHJvbXB0ID0gW1xuICAgICAgICAgICAgYWdlbnRDb25maWcuc3lzdGVtX3Byb21wdCxcbiAgICAgICAgICAgIGFnZW50Q29uZmlnLnNraWxsX21hcmtkb3duXG4gICAgICAgIF0uZmlsdGVyKEJvb2xlYW4pLmpvaW4oJ1xcblxcbicpO1xuICAgICAgICAvLyBJbmNsdWRlIHJlc2VhcmNoIGluc2lnaHRzIGlmIGF2YWlsYWJsZVxuICAgICAgICBsZXQgcmVzZWFyY2hDb250ZXh0ID0gJyc7XG4gICAgICAgIGlmIChyZXNlYXJjaERhdGEpIHtcbiAgICAgICAgICAgIHJlc2VhcmNoQ29udGV4dCA9IGBcblxuUmVzZWFyY2ggSW5zaWdodHMgZnJvbSBSZXNlYXJjaCBBZ2VudDpcbi0gU2VhcmNoIEludGVudDogJHtyZXNlYXJjaERhdGEuc2VhcmNoX2ludGVudCB8fCAnTi9BJ31cbi0gQ29udGVudCBBbmdsZTogJHtyZXNlYXJjaERhdGEuY29udGVudF9hbmdsZSB8fCAnTi9BJ31cbi0gVGFyZ2V0IEF1ZGllbmNlOiAke3Jlc2VhcmNoRGF0YS50YXJnZXRfYXVkaWVuY2Vfc3VtbWFyeSB8fCAnTi9BJ31cbi0gUmVjb21tZW5kZWQgU2VjdGlvbnM6ICR7cmVzZWFyY2hEYXRhLnJlY29tbWVuZGVkX3NlY3Rpb25zPy5qb2luKCcsICcpIHx8ICdOL0EnfVxuLSBRdWVzdGlvbnMgdG8gQW5zd2VyOiAke3Jlc2VhcmNoRGF0YS5xdWVzdGlvbnNfdG9fYW5zd2VyPy5qb2luKCcsICcpIHx8ICdOL0EnfWA7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdXNlck1lc3NhZ2UgPSBgQ3JlYXRlIGFuIG91dGxpbmUgZm9yIHRoaXMgYXJ0aWNsZTpcblxuVG9waWM6ICR7dG9waWN9XG5CdXNpbmVzczogJHtidXNpbmVzc05hbWV9XG5QcmltYXJ5IEtleXdvcmQ6ICR7cHJpbWFyeUtleXdvcmR9XG5TZWNvbmRhcnkgS2V5d29yZHM6ICR7c2Vjb25kYXJ5S2V5d29yZHN9XG5UYXJnZXQgV29yZCBDb3VudDogJHt0YXJnZXRXb3JkQ291bnR9XG5cbkF1ZGllbmNlIFByb2ZpbGU6XG4ke2F1ZGllbmNlTm90ZXN9XG5cbkJyYW5kIFZvaWNlOlxuJHticmFuZFZvaWNlfVxuXG5DYWxsLXRvLUFjdGlvbiBGb2N1czpcbiR7Y3RhTm90ZXN9XG5cbkFkZGl0aW9uYWwgUmVxdWlyZW1lbnRzOlxuJHthZGRpdGlvbmFsTm90ZXN9JHtyZXNlYXJjaENvbnRleHR9YDtcbiAgICAgICAgLy8gR2V0IG1vZGVsIG5hbWU6IHVzZSBEQiBjb25maWcgaWYgYXZhaWxhYmxlLCBvdGhlcndpc2UgZmFsbCBiYWNrIHRvIGVudiB2YXIgb3IgZGVmYXVsdFxuICAgICAgICBjb25zdCBtb2RlbE5hbWUgPSBhZ2VudENvbmZpZy5tb2RlbCB8fCBwcm9jZXNzLmVudi5PVVRMSU5FX0FHRU5UX01PREVMIHx8IHByb2Nlc3MuZW52LlJFU0VBUkNIX0FHRU5UX01PREVMIHx8ICdncHQtNS40LW1pbmknO1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBPdXRsaW5lIHN0ZXA6IFVzaW5nIG1vZGVsOiAke21vZGVsTmFtZX1gKTtcbiAgICAgICAgLy8gVXNlIGRpcmVjdCBPcGVuQUkgcHJvdmlkZXJcbiAgICAgICAgY29uc3QgbW9kZWwgPSBvcGVuYWkobW9kZWxOYW1lKTtcbiAgICAgICAgLy8gQ2FsbCBBSSBtb2RlbFxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGdlbmVyYXRlVGV4dCh7XG4gICAgICAgICAgICBtb2RlbCxcbiAgICAgICAgICAgIHN5c3RlbTogc3lzdGVtUHJvbXB0LFxuICAgICAgICAgICAgcHJvbXB0OiB1c2VyTWVzc2FnZSxcbiAgICAgICAgICAgIHRlbXBlcmF0dXJlOiAwLjdcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIE91dGxpbmUgc3RlcDogUmF3IHJlc3BvbnNlIGxlbmd0aDogJHtyZXNwb25zZS50ZXh0Lmxlbmd0aH1gKTtcbiAgICAgICAgLy8gUGFyc2UgdGhlIEpTT04gcmVzcG9uc2VcbiAgICAgICAgY29uc3Qgb3V0bGluZURhdGEgPSBKU09OLnBhcnNlKHJlc3BvbnNlLnRleHQpO1xuICAgICAgICAvLyBWYWxpZGF0ZSByZXF1aXJlZCBmaWVsZHMgYW5kIGFkZCBkZWZhdWx0c1xuICAgICAgICBvdXRsaW5lRGF0YS50aW1lc3RhbXAgPSBvdXRsaW5lRGF0YS50aW1lc3RhbXAgfHwgbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgICAgICBvdXRsaW5lRGF0YS50YXJnZXRfd29yZF9jb3VudCA9IG91dGxpbmVEYXRhLnRhcmdldF93b3JkX2NvdW50IHx8IHRhcmdldFdvcmRDb3VudDtcbiAgICAgICAgLy8gRW5zdXJlIHNlY3Rpb25zIGFycmF5IGV4aXN0c1xuICAgICAgICBpZiAoIW91dGxpbmVEYXRhLnNlY3Rpb25zIHx8ICFBcnJheS5pc0FycmF5KG91dGxpbmVEYXRhLnNlY3Rpb25zKSkge1xuICAgICAgICAgICAgb3V0bGluZURhdGEuc2VjdGlvbnMgPSBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBoZWFkaW5nOiAnSW50cm9kdWN0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgcHVycG9zZTogJ0ludHJvZHVjZSB0b3BpYyBhbmQgc2V0IGNvbnRleHQnLFxuICAgICAgICAgICAgICAgICAgICBlc3RpbWF0ZWRfd29yZHM6IDE1MCxcbiAgICAgICAgICAgICAgICAgICAga2V5X3BvaW50czogW1xuICAgICAgICAgICAgICAgICAgICAgICAgJ1RvcGljIG92ZXJ2aWV3JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdXaHkgdGhpcyBtYXR0ZXJzJ1xuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBzZW9fbm90ZXM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICdJbmNsdWRlIHByaW1hcnkga2V5d29yZCBuYXR1cmFsbHknXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGluZzogJ01haW4gQ29udGVudCcsXG4gICAgICAgICAgICAgICAgICAgIHB1cnBvc2U6ICdEZXRhaWxlZCBleHBsb3JhdGlvbiBvZiB0b3BpYycsXG4gICAgICAgICAgICAgICAgICAgIGVzdGltYXRlZF93b3JkczogMTAwMCxcbiAgICAgICAgICAgICAgICAgICAga2V5X3BvaW50czogW1xuICAgICAgICAgICAgICAgICAgICAgICAgJ0tleSBpbnNpZ2h0IDEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0tleSBpbnNpZ2h0IDInLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0tleSBpbnNpZ2h0IDMnXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIHNlb19ub3RlczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgJ1VzZSBzZWNvbmRhcnkga2V5d29yZHMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0Fuc3dlciB1c2VyIGludGVudCBxdWVzdGlvbnMnXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGluZzogJ0NvbmNsdXNpb24nLFxuICAgICAgICAgICAgICAgICAgICBwdXJwb3NlOiAnU3VtbWFyaXplIGFuZCBjYWxsIHRvIGFjdGlvbicsXG4gICAgICAgICAgICAgICAgICAgIGVzdGltYXRlZF93b3JkczogMTUwLFxuICAgICAgICAgICAgICAgICAgICBrZXlfcG9pbnRzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAnU3VtbWFyeSBvZiBrZXkgcG9pbnRzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdDYWxsIHRvIGFjdGlvbidcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgc2VvX25vdGVzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAnUmVpbmZvcmNlIHByaW1hcnkga2V5d29yZCdcbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF07XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gT3V0bGluZSBzdGVwOiBHZW5lcmF0ZWQgb3V0bGluZSB3aXRoICR7b3V0bGluZURhdGEuc2VjdGlvbnMubGVuZ3RofSBzZWN0aW9uc2ApO1xuICAgICAgICAvLyBQZXJzaXN0IG91dGxpbmVfanNvbiB0byBkYXRhYmFzZVxuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBPdXRsaW5lIHN0ZXA6IFBlcnNpc3Rpbmcgb3V0bGluZV9qc29uIGZvciBydW4gJHtydW5JZH1gKTtcbiAgICAgICAgYXdhaXQgdXBkYXRlUnVuU3RhdHVzKHJ1bklkLCAnb3V0bGluaW5nJywgb3V0bGluZURhdGEpO1xuICAgICAgICByZXR1cm4gb3V0bGluZURhdGE7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgW3YwXSBPdXRsaW5lIHN0ZXAgZXJyb3I6YCwgZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpKTtcbiAgICAgICAgLy8gUmV0dXJuIGZhbGxiYWNrIG91dGxpbmUgaWYgcGFyc2luZyBvciBBSSBjYWxsIGZhaWxzXG4gICAgICAgIGNvbnN0IGZhbGxiYWNrT3V0bGluZSA9IHtcbiAgICAgICAgICAgIHRpdGxlOiBgJHt0b3BpY30gLSBDb21wcmVoZW5zaXZlIEd1aWRlIHwgJHtidXNpbmVzc05hbWV9YCxcbiAgICAgICAgICAgIG1ldGFfYW5nbGU6IGBFdmVyeXRoaW5nIHlvdSBuZWVkIHRvIGtub3cgYWJvdXQgJHt0b3BpY30gZm9yICR7YnVzaW5lc3NOYW1lfWAsXG4gICAgICAgICAgICB0YXJnZXRfd29yZF9jb3VudDogdGFyZ2V0V29yZENvdW50LFxuICAgICAgICAgICAgc2VjdGlvbnM6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGhlYWRpbmc6ICdJbnRyb2R1Y3Rpb246IFVuZGVyc3RhbmRpbmcgdGhlIEJhc2ljcycsXG4gICAgICAgICAgICAgICAgICAgIHB1cnBvc2U6ICdTZXQgY29udGV4dCBhbmQgaW50cm9kdWNlIHRoZSB0b3BpYycsXG4gICAgICAgICAgICAgICAgICAgIGVzdGltYXRlZF93b3JkczogMjAwLFxuICAgICAgICAgICAgICAgICAgICBrZXlfcG9pbnRzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBgT3ZlcnZpZXcgb2YgJHt0b3BpY31gLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ1doeSB0aGlzIHRvcGljIG1hdHRlcnMgdG8geW91ciBhdWRpZW5jZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAnV2hhdCB5b3Ugd2lsbCBsZWFybidcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgc2VvX25vdGVzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAnSW5jbHVkZSBwcmltYXJ5IGtleXdvcmQgaW4gZmlyc3QgcGFyYWdyYXBoJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdVc2UgZW5nYWdpbmcgaG9vaydcbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBoZWFkaW5nOiAnS2V5IENvbmNlcHRzIGFuZCBCZW5lZml0cycsXG4gICAgICAgICAgICAgICAgICAgIHB1cnBvc2U6ICdFeHBsb3JlIGNvcmUgY29uY2VwdHMgYW5kIGFkdmFudGFnZXMnLFxuICAgICAgICAgICAgICAgICAgICBlc3RpbWF0ZWRfd29yZHM6IDQwMCxcbiAgICAgICAgICAgICAgICAgICAga2V5X3BvaW50czogW1xuICAgICAgICAgICAgICAgICAgICAgICAgJ0NvcmUgY29uY2VwdCAxJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdDb3JlIGNvbmNlcHQgMicsXG4gICAgICAgICAgICAgICAgICAgICAgICAnSG93IGJ1c2luZXNzZXMgYmVuZWZpdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAnUmVhbC13b3JsZCBhcHBsaWNhdGlvbnMnXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIHNlb19ub3RlczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgJ1VzZSBzZWNvbmRhcnkga2V5d29yZHMgbmF0dXJhbGx5JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdBbnN3ZXIgY29tbW9uIHF1ZXN0aW9ucydcbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBoZWFkaW5nOiAnQmVzdCBQcmFjdGljZXMgYW5kIEltcGxlbWVudGF0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgcHVycG9zZTogJ1Byb3ZpZGUgYWN0aW9uYWJsZSBndWlkYW5jZScsXG4gICAgICAgICAgICAgICAgICAgIGVzdGltYXRlZF93b3JkczogNTAwLFxuICAgICAgICAgICAgICAgICAgICBrZXlfcG9pbnRzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAnU3RlcC1ieS1zdGVwIGltcGxlbWVudGF0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdCZXN0IHByYWN0aWNlcyBpbiB0aGUgaW5kdXN0cnknLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0NvbW1vbiBtaXN0YWtlcyB0byBhdm9pZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAnVG9vbHMgYW5kIHJlc291cmNlcydcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgc2VvX25vdGVzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAnVXNlIGxvbmctdGFpbCBrZXl3b3JkcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAnSW5jbHVkZSBwcmFjdGljYWwgZXhhbXBsZXMnXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGluZzogJ0NvbmNsdXNpb24gYW5kIE5leHQgU3RlcHMnLFxuICAgICAgICAgICAgICAgICAgICBwdXJwb3NlOiAnU3VtbWFyaXplIGFuZCBndWlkZSByZWFkZXIgYWN0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgZXN0aW1hdGVkX3dvcmRzOiAxNTAsXG4gICAgICAgICAgICAgICAgICAgIGtleV9wb2ludHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICdLZXkgdGFrZWF3YXlzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdSZWNvbW1lbmRlZCBuZXh0IHN0ZXBzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdDYWxsIHRvIGFjdGlvbidcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgc2VvX25vdGVzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAnUmVpbmZvcmNlIHByaW1hcnkga2V5d29yZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAnQ3JlYXRlIHVyZ2VuY3kgZm9yIENUQSdcbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBpbnRyb19ndWlkYW5jZTogYFN0YXJ0IHdpdGggYSBjb21wZWxsaW5nIGhvb2sgdGhhdCBhZGRyZXNzZXMgdGhlIHJlYWRlcidzIHBhaW4gcG9pbnQuIEludHJvZHVjZSAke3RvcGljfSBpbiB0aGUgY29udGV4dCBvZiAke2J1c2luZXNzTmFtZX0gYW5kIGV4cGxhaW4gd2h5IGl0IG1hdHRlcnMgdG8gdGhlIHRhcmdldCBhdWRpZW5jZS4gSW5jbHVkZSB0aGUgcHJpbWFyeSBrZXl3b3JkIFwiJHtwcmltYXJ5S2V5d29yZH1cIiBuYXR1cmFsbHkgaW4gdGhlIGZpcnN0IDEwMCB3b3Jkcy5gLFxuICAgICAgICAgICAgY29uY2x1c2lvbl9ndWlkYW5jZTogYFN1bW1hcml6ZSB0aGUgbWFpbiB0YWtlYXdheXMgZnJvbSBlYWNoIHNlY3Rpb24uIFJlaW5mb3JjZSBob3cgdW5kZXJzdGFuZGluZyAke3RvcGljfSBiZW5lZml0cyB0aGUgcmVhZGVyLiBJbmNsdWRlIGEgY2xlYXIsIGNvbXBlbGxpbmcgY2FsbC10by1hY3Rpb24gdGhhdCBndWlkZXMgdGhlIHJlYWRlciBvbiBuZXh0IHN0ZXBzLiBFbmQgd2l0aCB0aGUgcHJpbWFyeSBrZXl3b3JkIG5hdHVyYWxseSBpbmNvcnBvcmF0ZWQuYCxcbiAgICAgICAgICAgIGN0YV9ndWlkYW5jZTogYCR7Y3RhTm90ZXN9LiBFbnN1cmUgdGhlIENUQSBpcyBjbGVhciwgc3BlY2lmaWMsIGFuZCByZWxldmFudCB0byB0aGUgYXJ0aWNsZSBjb250ZW50LiBFeGFtcGxlczogXCJTY2hlZHVsZSBhIGNvbnN1bHRhdGlvbixcIiBcIkRvd25sb2FkIG91ciBndWlkZSxcIiBcIkdldCBzdGFydGVkIHRvZGF5LFwiIFwiSm9pbiBvdXIgY29tbXVuaXR5LlwiYCxcbiAgICAgICAgICAgIGludGVybmFsX2xpbmtfb3Bwb3J0dW5pdGllczogW1xuICAgICAgICAgICAgICAgICdMaW5rIHRvIHJlbGV2YW50IHNlcnZpY2UgcGFnZXMgb24gY29tcGFueSB3ZWJzaXRlJyxcbiAgICAgICAgICAgICAgICAnTGluayB0byByZWxhdGVkIGJsb2cgcG9zdHMgb24gc2ltaWxhciB0b3BpY3MnLFxuICAgICAgICAgICAgICAgICdMaW5rIHRvIGNhc2Ugc3R1ZGllcyBvciBzdWNjZXNzIHN0b3JpZXMnLFxuICAgICAgICAgICAgICAgICdMaW5rIHRvIHJlc291cmNlIHBhZ2VzIG9yIHRvb2xzJ1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIG5vdGVzX2Zvcl93cml0ZXI6IFtcbiAgICAgICAgICAgICAgICBgUmVtZW1iZXIgdG8gbWFpbnRhaW4gYSAke2JyYW5kVm9pY2V9IHRvbmUgdGhyb3VnaG91dGAsXG4gICAgICAgICAgICAgICAgYEFkZHJlc3MgdGhlIG5lZWRzIG9mOiAke2F1ZGllbmNlTm90ZXN9YCxcbiAgICAgICAgICAgICAgICBgRW5zdXJlIHRoZSBjb250ZW50IGlzIHdlbGwtcmVzZWFyY2hlZCBhbmQgaW5jbHVkZXMgc3BlY2lmaWMgZXhhbXBsZXNgLFxuICAgICAgICAgICAgICAgIGBVc2Ugc3ViaGVhZGluZ3MgdG8gaW1wcm92ZSByZWFkYWJpbGl0eSBhbmQgU0VPYCxcbiAgICAgICAgICAgICAgICBgSW5jbHVkZSByZWxldmFudCBkYXRhLCBzdGF0aXN0aWNzLCBvciByZXNlYXJjaCBmaW5kaW5ncyB3aGVyZSBhcHByb3ByaWF0ZWAsXG4gICAgICAgICAgICAgICAgYEVuZCB3aXRoIGEgc3Ryb25nIENUQSBhbGlnbmVkIHdpdGg6ICR7Y3RhTm90ZXN9YFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICAgIH07XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIE91dGxpbmUgc3RlcDogVXNpbmcgZmFsbGJhY2sgb3V0bGluZSBkdWUgdG8gZXJyb3JgKTtcbiAgICAgICAgcmV0dXJuIGZhbGxiYWNrT3V0bGluZTtcbiAgICB9XG59XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9vdXRsaW5lLXN0ZXAvL3J1bk91dGxpbmVTdGVwXCIsIHJ1bk91dGxpbmVTdGVwKTtcbiIsICJpbXBvcnQgeyByZWdpc3RlclN0ZXBGdW5jdGlvbiB9IGZyb20gXCJ3b3JrZmxvdy9pbnRlcm5hbC9wcml2YXRlXCI7XG5pbXBvcnQgJ3NlcnZlci1vbmx5JztcbmltcG9ydCB7IGdlbmVyYXRlVGV4dCB9IGZyb20gJ2FpJztcbmltcG9ydCB7IG9wZW5haSB9IGZyb20gJ0BhaS1zZGsvb3BlbmFpJztcbmltcG9ydCB7IHVwZGF0ZVJ1blN0YXR1cyB9IGZyb20gJy4uLy4uL3N0b3JhZ2UvcnVucyc7XG5pbXBvcnQgeyBnZXRBZ2VudENvbmZpZyB9IGZyb20gJy4uLy4uL3N0b3JhZ2UvYWdlbnQtY29uZmlncyc7XG4vKipfX2ludGVybmFsX3dvcmtmbG93c3tcInN0ZXBzXCI6e1wibGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9yZXNlYXJjaC1zdGVwLnRzXCI6e1wicnVuUmVzZWFyY2hTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvcmVzZWFyY2gtc3RlcC8vcnVuUmVzZWFyY2hTdGVwXCJ9fX19Ki87XG4vKipcbiAqIFJlc2VhcmNoIFN0ZXAgLSBQaGFzZSAyQy1BXG4gKiBSdW5zIGluc2lkZSBhIGR1cmFibGUgc3RlcCBmdW5jdGlvbiAoaGFzIE5vZGUuanMgYWNjZXNzKVxuICogQ2FsbHMgQUkgbW9kZWwgdG8gZ2VuZXJhdGUgcmVzZWFyY2ggSlNPTlxuICogTm8gZmlsZXN5c3RlbSBpbXBvcnRzIC0gc2FmZSBmb3Igd29ya2Zsb3cgY29udGV4dFxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5SZXNlYXJjaFN0ZXAocnVuSWQsIGlucHV0KSB7XG4gICAgY29uc29sZS5sb2coYFt2MF0gUmVzZWFyY2ggc3RlcDogQW5hbHl6aW5nIHRvcGljIGZvciBydW4gJHtydW5JZH1gKTtcbiAgICB0cnkge1xuICAgICAgICAvLyBMb2FkIGFnZW50IGNvbmZpZyBmcm9tIGRhdGFiYXNlXG4gICAgICAgIGNvbnN0IGFnZW50Q29uZmlnID0gYXdhaXQgZ2V0QWdlbnRDb25maWcoJ3Jlc2VhcmNoJyk7XG4gICAgICAgIGlmICghYWdlbnRDb25maWcpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQWN0aXZlIGFnZW50IGNvbmZpZyBub3QgZm91bmQgZm9yIGFnZW50X2tleTogcmVzZWFyY2gnKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBTRU8gQmxvZyBBZ2VudCBDb25maWcgTG9hZGVkOiByZXNlYXJjaCB2JHthZ2VudENvbmZpZy52ZXJzaW9ufWApO1xuICAgICAgICAvLyBCdWlsZCBzeXN0ZW0gcHJvbXB0IGZyb20gZGF0YWJhc2UgY29uZmlnXG4gICAgICAgIGNvbnN0IHN5c3RlbVByb21wdCA9IFtcbiAgICAgICAgICAgIGFnZW50Q29uZmlnLnN5c3RlbV9wcm9tcHQsXG4gICAgICAgICAgICBhZ2VudENvbmZpZy5za2lsbF9tYXJrZG93blxuICAgICAgICBdLmZpbHRlcihCb29sZWFuKS5qb2luKCdcXG5cXG4nKTtcbiAgICAgICAgY29uc3QgdXNlck1lc3NhZ2UgPSBgQ29uZHVjdCBTRU8gcmVzZWFyY2ggZm9yOlxuVG9waWM6ICR7aW5wdXQuYmxvZ190b3BpY31cblByaW1hcnkgS2V5d29yZDogJHtpbnB1dC5wcmltYXJ5X2tleXdvcmR9XG5TZWNvbmRhcnkgS2V5d29yZHM6ICR7aW5wdXQuc2Vjb25kYXJ5X2tleXdvcmRzPy5qb2luKCcsICcpIHx8ICdub25lJ31cblRhcmdldCBBdWRpZW5jZTogJHtpbnB1dC5hdWRpZW5jZV9ub3RlcyB8fCAnZ2VuZXJhbCd9XG5UYXJnZXQgV29yZCBDb3VudDogJHtpbnB1dC50YXJnZXRfd29yZF9jb3VudCB8fCAxMDAwfVxuQnVzaW5lc3M6ICR7aW5wdXQuYnVzaW5lc3NfbmFtZSB8fCAndW5rbm93bid9XG5XZWJzaXRlOiAke2lucHV0LndlYnNpdGVfdXJsIHx8ICd1bmtub3duJ31cblxuUHJvdmlkZSBjb21wcmVoZW5zaXZlIHJlc2VhcmNoIGZpbmRpbmdzIGluIEpTT04gZm9ybWF0LmA7XG4gICAgICAgIC8vIEdldCBtb2RlbCBuYW1lOiB1c2UgREIgY29uZmlnIGlmIGF2YWlsYWJsZSwgb3RoZXJ3aXNlIGZhbGwgYmFjayB0byBlbnYgdmFyIG9yIGRlZmF1bHRcbiAgICAgICAgY29uc3QgbW9kZWxOYW1lID0gYWdlbnRDb25maWcubW9kZWwgfHwgcHJvY2Vzcy5lbnYuUkVTRUFSQ0hfQUdFTlRfTU9ERUwgfHwgJ2dwdC01LjQtbWluaSc7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFJlc2VhcmNoIHN0ZXA6IFVzaW5nIG1vZGVsOiAke21vZGVsTmFtZX1gKTtcbiAgICAgICAgLy8gVXNlIGRpcmVjdCBPcGVuQUkgcHJvdmlkZXIgd2l0aCBPUEVOQUlfQVBJX0tFWVxuICAgICAgICBjb25zdCBtb2RlbCA9IG9wZW5haShtb2RlbE5hbWUpO1xuICAgICAgICAvLyBDYWxsIEFJIG1vZGVsXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZ2VuZXJhdGVUZXh0KHtcbiAgICAgICAgICAgIG1vZGVsLFxuICAgICAgICAgICAgc3lzdGVtOiBzeXN0ZW1Qcm9tcHQsXG4gICAgICAgICAgICBwcm9tcHQ6IHVzZXJNZXNzYWdlLFxuICAgICAgICAgICAgdGVtcGVyYXR1cmU6IDAuN1xuICAgICAgICB9KTtcbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gUmVzZWFyY2ggc3RlcDogQUkgbW9kZWwgcmVzcG9uZGVkLCBwYXJzaW5nIEpTT05gKTtcbiAgICAgICAgLy8gUGFyc2UgSlNPTiByZXNwb25zZVxuICAgICAgICBsZXQgcmVzZWFyY2hEYXRhO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gVHJ5IHRvIGV4dHJhY3QgSlNPTiBmcm9tIHJlc3BvbnNlIChpbiBjYXNlIG9mIGV4dHJhIHRleHQpXG4gICAgICAgICAgICBjb25zdCBqc29uTWF0Y2ggPSByZXNwb25zZS50ZXh0Lm1hdGNoKC9cXHtbXFxzXFxTXSpcXH0vKTtcbiAgICAgICAgICAgIGlmICghanNvbk1hdGNoKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBKU09OIGZvdW5kIGluIHJlc3BvbnNlJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXNlYXJjaERhdGEgPSBKU09OLnBhcnNlKGpzb25NYXRjaFswXSk7XG4gICAgICAgIH0gY2F0Y2ggKHBhcnNlRXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbdjBdIFJlc2VhcmNoIHN0ZXA6IEZhaWxlZCB0byBwYXJzZSBBSSByZXNwb25zZTpgLCByZXNwb25zZS50ZXh0LnN1YnN0cmluZygwLCAyMDApKTtcbiAgICAgICAgICAgIC8vIFJldHVybiBmYWxsYmFjayBpZiBwYXJzaW5nIGZhaWxzXG4gICAgICAgICAgICByZXNlYXJjaERhdGEgPSB7XG4gICAgICAgICAgICAgICAgc2VhcmNoX2ludGVudDogJ2luZm9ybWF0aW9uYWwnLFxuICAgICAgICAgICAgICAgIHRhcmdldF9hdWRpZW5jZV9zdW1tYXJ5OiBpbnB1dC5hdWRpZW5jZV9ub3RlcyB8fCAnVGFyZ2V0IGF1ZGllbmNlIG5vdCBzcGVjaWZpZWQnLFxuICAgICAgICAgICAgICAgIGtleXdvcmRfbWFwOiB7XG4gICAgICAgICAgICAgICAgICAgIHByaW1hcnlfa2V5d29yZDogaW5wdXQucHJpbWFyeV9rZXl3b3JkIHx8ICdwcmltYXJ5IGtleXdvcmQnLFxuICAgICAgICAgICAgICAgICAgICBzZWNvbmRhcnlfa2V5d29yZHM6IGlucHV0LnNlY29uZGFyeV9rZXl3b3JkcyB8fCBbXSxcbiAgICAgICAgICAgICAgICAgICAgbHNpX3Rlcm1zOiBbXVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY29udGVudF9hbmdsZTogYEZvY3VzIG9uICR7aW5wdXQuYmxvZ190b3BpYyB8fCAndG9waWMnfWAsXG4gICAgICAgICAgICAgICAga2V5X2ZpbmRpbmdzOiBbXG4gICAgICAgICAgICAgICAgICAgIGBUb3BpYyBmb2N1c2VzIG9uICR7aW5wdXQuYmxvZ190b3BpYyB8fCAndGhlIHN1YmplY3QgbWF0dGVyJ31gLFxuICAgICAgICAgICAgICAgICAgICBgVGFyZ2V0IGF1ZGllbmNlOiAke2lucHV0LmF1ZGllbmNlX25vdGVzIHx8ICdnZW5lcmFsIGF1ZGllbmNlJ31gLFxuICAgICAgICAgICAgICAgICAgICBgUHJpbWFyeSBrZXl3b3JkOiAke2lucHV0LnByaW1hcnlfa2V5d29yZCB8fCAndG8gYmUgZGV0ZXJtaW5lZCd9YFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgY29tcGV0aXRvcl9pbnNpZ2h0czogW1xuICAgICAgICAgICAgICAgICAgICAnUmVzZWFyY2ggY29tcGV0aXRvcnMgZm9yIGNvbXBldGl0aXZlIGFkdmFudGFnZXMnXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZWNvbW1lbmRlZF9zZWN0aW9uczogW1xuICAgICAgICAgICAgICAgICAgICAnSW50cm9kdWN0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgJ01haW4gQ29udGVudCcsXG4gICAgICAgICAgICAgICAgICAgICdDb25jbHVzaW9uJ1xuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcXVlc3Rpb25zX3RvX2Fuc3dlcjogW1xuICAgICAgICAgICAgICAgICAgICAnV2hhdCBpcyB0aGUgbWFpbiB0b3BpYz8nXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNlYXJjaF9ub3RlczogJ0ZhbGxiYWNrIHJlc2VhcmNoIGR1ZSB0byBwYXJzaW5nIGVycm9yJyxcbiAgICAgICAgICAgICAgICB0YXJnZXRfd29yZF9jb3VudDogaW5wdXQudGFyZ2V0X3dvcmRfY291bnQgfHwgMTAwMCxcbiAgICAgICAgICAgICAgICB3ZWJfc2VhcmNoX3VzZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIC8vIFBlcnNpc3QgcmVzZWFyY2hfanNvbiB0byBkYXRhYmFzZVxuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBSZXNlYXJjaCBzdGVwOiBQZXJzaXN0aW5nIHJlc2VhcmNoX2pzb24gZm9yIHJ1biAke3J1bklkfWApO1xuICAgICAgICBhd2FpdCB1cGRhdGVSdW5TdGF0dXMocnVuSWQsICdyZXNlYXJjaGluZycsIHJlc2VhcmNoRGF0YSk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFJlc2VhcmNoIHN0ZXA6IENvbXBsZXRlIGZvciBydW4gJHtydW5JZH1gKTtcbiAgICAgICAgcmV0dXJuIHJlc2VhcmNoRGF0YTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKGBbdjBdIFJlc2VhcmNoIHN0ZXAgZXJyb3IgZm9yIHJ1biAke3J1bklkfTpgLCBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcikpO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG59XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9yZXNlYXJjaC1zdGVwLy9ydW5SZXNlYXJjaFN0ZXBcIiwgcnVuUmVzZWFyY2hTdGVwKTtcbiIsICJpbXBvcnQgeyByZWdpc3RlclN0ZXBGdW5jdGlvbiB9IGZyb20gXCJ3b3JrZmxvdy9pbnRlcm5hbC9wcml2YXRlXCI7XG5pbXBvcnQgJ3NlcnZlci1vbmx5JztcbmltcG9ydCB7IGdlbmVyYXRlVGV4dCB9IGZyb20gJ2FpJztcbmltcG9ydCB7IG9wZW5haSB9IGZyb20gJ0BhaS1zZGsvb3BlbmFpJztcbmltcG9ydCB7IHVwZGF0ZVJ1blN0YXR1cyB9IGZyb20gJy4uLy4uL3N0b3JhZ2UvcnVucyc7XG5pbXBvcnQgeyBnZXRBZ2VudENvbmZpZyB9IGZyb20gJy4uLy4uL3N0b3JhZ2UvYWdlbnQtY29uZmlncyc7XG4vKipfX2ludGVybmFsX3dvcmtmbG93c3tcInN0ZXBzXCI6e1wibGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9zZW8tcWEtc3RlcC50c1wiOntcInJ1blNlb1FhU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3Nlby1xYS1zdGVwLy9ydW5TZW9RYVN0ZXBcIn19fX0qLztcbi8qKlxuICogU0VPIFFBIFN0ZXAgLSBQaGFzZSAyQy1EXG4gKiBSdW5zIGluc2lkZSBhIGR1cmFibGUgc3RlcCBmdW5jdGlvbiAoaGFzIE5vZGUuanMgYWNjZXNzKVxuICogUmV2aWV3cyBkcmFmdCBtYXJrZG93biBhZ2FpbnN0IFNFTyBiZXN0IHByYWN0aWNlc1xuICogUmV0dXJucyBzdHJ1Y3R1cmVkIGF1ZGl0IEpTT04gKGRvZXMgTk9UIHJld3JpdGUgdGhlIGRyYWZ0KVxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5TZW9RYVN0ZXAocnVuSWQsIGlucHV0LCByZXNlYXJjaERhdGEsIG91dGxpbmVEYXRhLCBkcmFmdE1hcmtkb3duKSB7XG4gICAgY29uc29sZS5sb2coYFt2MF0gU0VPIFFBIHN0ZXA6IEF1ZGl0aW5nIGRyYWZ0IGZvciBydW4gJHtydW5JZH1gKTtcbiAgICBpZiAoIWRyYWZ0TWFya2Rvd24pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdEcmFmdCBtYXJrZG93biBpcyByZXF1aXJlZCBmb3IgU0VPIFFBIHJldmlldycpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyBMb2FkIGFnZW50IGNvbmZpZyBmcm9tIGRhdGFiYXNlXG4gICAgICAgIGNvbnN0IGFnZW50Q29uZmlnID0gYXdhaXQgZ2V0QWdlbnRDb25maWcoJ3Nlb19xYScpO1xuICAgICAgICBpZiAoIWFnZW50Q29uZmlnKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0FjdGl2ZSBhZ2VudCBjb25maWcgbm90IGZvdW5kIGZvciBhZ2VudF9rZXk6IHNlb19xYScpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFNFTyBCbG9nIEFnZW50IENvbmZpZyBMb2FkZWQ6IHNlb19xYSB2JHthZ2VudENvbmZpZy52ZXJzaW9ufWApO1xuICAgICAgICAvLyBCdWlsZCBzeXN0ZW0gcHJvbXB0IGZyb20gZGF0YWJhc2UgY29uZmlnXG4gICAgICAgIGNvbnN0IHN5c3RlbVByb21wdCA9IFtcbiAgICAgICAgICAgIGFnZW50Q29uZmlnLnN5c3RlbV9wcm9tcHQsXG4gICAgICAgICAgICBhZ2VudENvbmZpZy5za2lsbF9tYXJrZG93blxuICAgICAgICBdLmZpbHRlcihCb29sZWFuKS5qb2luKCdcXG5cXG4nKTtcbiAgICAgICAgLy8gR2V0IG1vZGVsIG5hbWU6IHVzZSBEQiBjb25maWcgaWYgYXZhaWxhYmxlLCBvdGhlcndpc2UgZmFsbCBiYWNrIHRvIGVudiB2YXIgb3IgZGVmYXVsdFxuICAgICAgICBjb25zdCBtb2RlbE5hbWUgPSBhZ2VudENvbmZpZy5tb2RlbCB8fCBwcm9jZXNzLmVudi5TRU9fUUFfQUdFTlRfTU9ERUwgfHwgcHJvY2Vzcy5lbnYuUkVTRUFSQ0hfQUdFTlRfTU9ERUwgfHwgJ2dwdC01LjQtbWluaSc7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFNFTyBRQSBzdGVwOiBVc2luZyBtb2RlbDogJHttb2RlbE5hbWV9YCk7XG4gICAgICAgIC8vIFByZXBhcmUgY29udGV4dCBmb3IgU0VPIFFBIHJldmlld1xuICAgICAgICBjb25zdCBwcmltYXJ5S2V5d29yZCA9IGlucHV0LnByaW1hcnlfa2V5d29yZCB8fCAncHJpbWFyeSBrZXl3b3JkJztcbiAgICAgICAgY29uc3Qgc2Vjb25kYXJ5S2V5d29yZHMgPSAoaW5wdXQuc2Vjb25kYXJ5X2tleXdvcmRzIHx8IFtdKS5qb2luKCcsICcpIHx8ICdzZWNvbmRhcnkga2V5d29yZHMnO1xuICAgICAgICBjb25zdCB0YXJnZXRXb3JkQ291bnQgPSBpbnB1dC50YXJnZXRfd29yZF9jb3VudCB8fCAyMDAwO1xuICAgICAgICBjb25zdCBidXNpbmVzc05hbWUgPSBpbnB1dC5idXNpbmVzc19uYW1lIHx8ICdZb3VyIEJ1c2luZXNzJztcbiAgICAgICAgY29uc3QgYXVkaWVuY2VOb3RlcyA9IGlucHV0LmF1ZGllbmNlX25vdGVzIHx8ICdUYXJnZXQgYXVkaWVuY2Ugbm90IHNwZWNpZmllZCc7XG4gICAgICAgIGNvbnN0IGJyYW5kVm9pY2UgPSBpbnB1dC5icmFuZF92b2ljZV9ub3RlcyB8fCAnUHJvZmVzc2lvbmFsIGFuZCBjbGVhcic7XG4gICAgICAgIGNvbnN0IGN0YU5vdGVzID0gaW5wdXQuY3RhX25vdGVzIHx8ICdDVEEgbm90IHNwZWNpZmllZCc7XG4gICAgICAgIGNvbnN0IGludGVybmFsTGlua05vdGVzID0gaW5wdXQuaW50ZXJuYWxfbGlua19ub3RlcyB8fCAnTm8gaW50ZXJuYWwgbGlua2luZyBzdHJhdGVneSc7XG4gICAgICAgIC8vIEJ1aWxkIFNFTyBRQSBwcm9tcHQgd2l0aCBzeXN0ZW0gcHJvbXB0IGZyb20gREJcbiAgICAgICAgY29uc3Qgc2VvUWFQcm9tcHQgPSBgJHtzeXN0ZW1Qcm9tcHR9XG5cbkJMT0cgRFJBRlQ6XG4ke2RyYWZ0TWFya2Rvd259XG5cblJFVklFVyBDUklURVJJQTpcbi0gUHJpbWFyeSBLZXl3b3JkOiBcIiR7cHJpbWFyeUtleXdvcmR9XCJcbi0gU2Vjb25kYXJ5IEtleXdvcmRzOiBcIiR7c2Vjb25kYXJ5S2V5d29yZHN9XCJcbi0gVGFyZ2V0IFdvcmQgQ291bnQ6ICR7dGFyZ2V0V29yZENvdW50fSB3b3Jkc1xuLSBCdXNpbmVzczogJHtidXNpbmVzc05hbWV9XG4tIEF1ZGllbmNlOiAke2F1ZGllbmNlTm90ZXN9XG4tIEJyYW5kIFZvaWNlOiAke2JyYW5kVm9pY2V9XG4tIENUQSBOb3RlczogJHtjdGFOb3Rlc31cbi0gSW50ZXJuYWwgTGlua2luZyBTdHJhdGVneTogJHtpbnRlcm5hbExpbmtOb3Rlc31cblxuUHJvdmlkZSBhIGRldGFpbGVkIFNFTyBhdWRpdCBpbiBKU09OIGZvcm1hdCAoZG8gTk9UIG1vZGlmeSBvciByZXdyaXRlIHRoZSBkcmFmdCkuYDtcbiAgICAgICAgY29uc3QgeyB0ZXh0IH0gPSBhd2FpdCBnZW5lcmF0ZVRleHQoe1xuICAgICAgICAgICAgbW9kZWw6IG9wZW5haShtb2RlbE5hbWUpLFxuICAgICAgICAgICAgcHJvbXB0OiBzZW9RYVByb21wdCxcbiAgICAgICAgICAgIHRlbXBlcmF0dXJlOiAwLjcsXG4gICAgICAgICAgICBtYXhUb2tlbnM6IDMwMDBcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFNFTyBRQSBzdGVwOiBSZWNlaXZlZCBhdWRpdCBmcm9tIG1vZGVsYCk7XG4gICAgICAgIC8vIFBhcnNlIHRoZSBKU09OIHJlc3BvbnNlXG4gICAgICAgIGxldCBzZW9RYVJlc3VsdDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHNlb1FhUmVzdWx0ID0gSlNPTi5wYXJzZSh0ZXh0KTtcbiAgICAgICAgfSBjYXRjaCAocGFyc2VFcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2MF0gU0VPIFFBIHN0ZXA6IEZhaWxlZCB0byBwYXJzZSBtb2RlbCByZXNwb25zZSBhcyBKU09OYCwgcGFyc2VFcnIgaW5zdGFuY2VvZiBFcnJvciA/IHBhcnNlRXJyLm1lc3NhZ2UgOiBTdHJpbmcocGFyc2VFcnIpKTtcbiAgICAgICAgICAgIC8vIFJldHVybiBmYWxsYmFjayBhdWRpdCBpZiBwYXJzaW5nIGZhaWxzXG4gICAgICAgICAgICBzZW9RYVJlc3VsdCA9IGdlbmVyYXRlRmFsbGJhY2tTZW9RYShkcmFmdE1hcmtkb3duLCBwcmltYXJ5S2V5d29yZCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gVmFsaWRhdGUgcmVxdWlyZWQgZmllbGRzXG4gICAgICAgIGlmICh0eXBlb2Ygc2VvUWFSZXN1bHQub3ZlcmFsbF9zY29yZSAhPT0gJ251bWJlcicgfHwgIXNlb1FhUmVzdWx0LnNlYXJjaF9pbnRlbnRfYWxpZ25tZW50IHx8ICFzZW9RYVJlc3VsdC5wcmlvcml0eV9maXhlcykge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBbdjBdIFNFTyBRQSBzdGVwOiBNaXNzaW5nIHJlcXVpcmVkIGF1ZGl0IGZpZWxkcywgdXNpbmcgZmFsbGJhY2tgKTtcbiAgICAgICAgICAgIHNlb1FhUmVzdWx0ID0gZ2VuZXJhdGVGYWxsYmFja1Nlb1FhKGRyYWZ0TWFya2Rvd24sIHByaW1hcnlLZXl3b3JkKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBQZXJzaXN0IG9wdGltaXplZF9qc29uIHRvIGRhdGFiYXNlXG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFNFTyBRQSBzdGVwOiBQZXJzaXN0aW5nIFNFTyBRQSBhdWRpdCAoc2NvcmU6ICR7c2VvUWFSZXN1bHQub3ZlcmFsbF9zY29yZX0pIGZvciBydW4gJHtydW5JZH1gKTtcbiAgICAgICAgYXdhaXQgdXBkYXRlUnVuU3RhdHVzKHJ1bklkLCAnc2VvX3FhJywgc2VvUWFSZXN1bHQpO1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBTRU8gUUEgc3RlcDogQ29tcGxldGUgZm9yIHJ1biAke3J1bklkfWApO1xuICAgICAgICByZXR1cm4gc2VvUWFSZXN1bHQ7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgZXJyb3JNc2cgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2MF0gU0VPIFFBIHN0ZXA6IEVycm9yIGR1cmluZyBhdWRpdCBmb3IgcnVuICR7cnVuSWR9OiAke2Vycm9yTXNnfWApO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG59XG4vKipcbiAqIEdlbmVyYXRlIGEgYmFzaWMgU0VPIFFBIGF1ZGl0IGFzIGZhbGxiYWNrXG4gKi8gZnVuY3Rpb24gZ2VuZXJhdGVGYWxsYmFja1Nlb1FhKGRyYWZ0TWFya2Rvd24sIHByaW1hcnlLZXl3b3JkKSB7XG4gICAgY29uc3Qgd29yZENvdW50ID0gZHJhZnRNYXJrZG93bi5zcGxpdCgvXFxzKy8pLmxlbmd0aDtcbiAgICBjb25zdCBoMUNvdW50ID0gKGRyYWZ0TWFya2Rvd24ubWF0Y2goL14jIC9nbSkgfHwgW10pLmxlbmd0aDtcbiAgICBjb25zdCBoMkNvdW50ID0gKGRyYWZ0TWFya2Rvd24ubWF0Y2goL14jIyAvZ20pIHx8IFtdKS5sZW5ndGg7XG4gICAgY29uc3QgaW50ZXJuYWxMaW5rQ291bnQgPSAoZHJhZnRNYXJrZG93bi5tYXRjaCgvXFxbLio/XFxdXFwoXFwvLio/XFwpL2cpIHx8IFtdKS5sZW5ndGg7XG4gICAgY29uc3QgcHJpbWFyeUtleXdvcmRPY2N1cnJlbmNlcyA9IChkcmFmdE1hcmtkb3duLnRvTG93ZXJDYXNlKCkubWF0Y2gobmV3IFJlZ0V4cChwcmltYXJ5S2V5d29yZC50b0xvd2VyQ2FzZSgpLCAnZycpKSB8fCBbXSkubGVuZ3RoO1xuICAgIGNvbnN0IG92ZXJhbGxTY29yZSA9IDY4O1xuICAgIGNvbnN0IHJlYWR5Rm9yRWRpdG9yID0gb3ZlcmFsbFNjb3JlID49IDcwICYmIGgxQ291bnQgPiAwO1xuICAgIGNvbnN0IHJlY29tbWVuZGVkQWN0aW9uID0gb3ZlcmFsbFNjb3JlID49IDc1ICYmIHJlYWR5Rm9yRWRpdG9yID8gJ0FwcHJvdmUgZm9yIGVkaXRvcicgOiBvdmVyYWxsU2NvcmUgPj0gNjAgJiYgcmVhZHlGb3JFZGl0b3IgPyAnUmV2aXNlIGJlZm9yZSBlZGl0b3InIDogJ05lZWRzIGh1bWFuIHJldmlldyc7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgb3ZlcmFsbF9zY29yZTogb3ZlcmFsbFNjb3JlLFxuICAgICAgICBzZWFyY2hfaW50ZW50X2FsaWdubWVudDoge1xuICAgICAgICAgICAgc2NvcmU6IDY1LFxuICAgICAgICAgICAgYW5hbHlzaXM6ICdEcmFmdCBjb3ZlcnMgYmFzaWMgc2VhcmNoIGludGVudCBidXQgbWF5IG5lZWQgcmVmaW5lbWVudCdcbiAgICAgICAgfSxcbiAgICAgICAgcHJpbWFyeV9rZXl3b3JkX3VzYWdlOiB7XG4gICAgICAgICAgICBzY29yZTogNzAsXG4gICAgICAgICAgICBvY2N1cnJlbmNlczogcHJpbWFyeUtleXdvcmRPY2N1cnJlbmNlcyxcbiAgICAgICAgICAgIHBsYWNlbWVudF9hbmFseXNpczogYFByaW1hcnkga2V5d29yZCBhcHBlYXJzICR7cHJpbWFyeUtleXdvcmRPY2N1cnJlbmNlc30gdGltZXMgaW4gdGhlIGRyYWZ0YFxuICAgICAgICB9LFxuICAgICAgICBzZWNvbmRhcnlfa2V5d29yZF91c2FnZToge1xuICAgICAgICAgICAgc2NvcmU6IDYwLFxuICAgICAgICAgICAga2V5d29yZHNfY292ZXJlZDogW10sXG4gICAgICAgICAgICBnYXBzOiBbXG4gICAgICAgICAgICAgICAgJ0FkZGl0aW9uYWwga2V5d29yZCBhbmFseXNpcyBuZWVkZWQnXG4gICAgICAgICAgICBdXG4gICAgICAgIH0sXG4gICAgICAgIGhlYWRpbmdfc3RydWN0dXJlX3Jldmlldzoge1xuICAgICAgICAgICAgc2NvcmU6IGgyQ291bnQgPiAyID8gNzUgOiA2NSxcbiAgICAgICAgICAgIGgxX3ByZXNlbnQ6IGgxQ291bnQgPiAwLFxuICAgICAgICAgICAgaDJfY291bnQ6IGgyQ291bnQsXG4gICAgICAgICAgICBoaWVyYXJjaHlfaXNzdWVzOiBoMUNvdW50ID09PSAwID8gW1xuICAgICAgICAgICAgICAgICdNaXNzaW5nIEgxIGhlYWRpbmcnXG4gICAgICAgICAgICBdIDogW11cbiAgICAgICAgfSxcbiAgICAgICAgY29udGVudF9kZXB0aF9yZXZpZXc6IHtcbiAgICAgICAgICAgIHNjb3JlOiB3b3JkQ291bnQgPiAxNTAwID8gNzUgOiA2MCxcbiAgICAgICAgICAgIHdvcmRfY291bnQ6IHdvcmRDb3VudCxcbiAgICAgICAgICAgIHNlY3Rpb25fY292ZXJhZ2U6IGBEcmFmdCBjb250YWlucyAke01hdGgubWF4KDEsIGgyQ291bnQpfSBtYWluIHNlY3Rpb25zYCxcbiAgICAgICAgICAgIGRlcHRoX2lzc3Vlczogd29yZENvdW50IDwgMTUwMCA/IFtcbiAgICAgICAgICAgICAgICAnQ29udGVudCBtYXkgbmVlZCBtb3JlIGRlcHRoJ1xuICAgICAgICAgICAgXSA6IFtdXG4gICAgICAgIH0sXG4gICAgICAgIHJlYWRhYmlsaXR5X3Jldmlldzoge1xuICAgICAgICAgICAgc2NvcmU6IDcyLFxuICAgICAgICAgICAgYXZnX3NlbnRlbmNlX2xlbmd0aDogMTgsXG4gICAgICAgICAgICBmbGVzY2hfa2luY2FpZF9lc3RpbWF0ZTogJzh0aCBncmFkZScsXG4gICAgICAgICAgICByZWFkYWJpbGl0eV9pc3N1ZXM6IFtdXG4gICAgICAgIH0sXG4gICAgICAgIGludGVybmFsX2xpbmtpbmdfcmV2aWV3OiB7XG4gICAgICAgICAgICBzY29yZTogaW50ZXJuYWxMaW5rQ291bnQgPiAyID8gNzAgOiA1MCxcbiAgICAgICAgICAgIGludGVybmFsX2xpbmtzX2ZvdW5kOiBpbnRlcm5hbExpbmtDb3VudCxcbiAgICAgICAgICAgIGludGVybmFsX2xpbmtfcmVjb21tZW5kYXRpb25zOiBpbnRlcm5hbExpbmtDb3VudCA9PT0gMCA/IFtcbiAgICAgICAgICAgICAgICAnQWRkIHJlbGV2YW50IGludGVybmFsIGxpbmtzJ1xuICAgICAgICAgICAgXSA6IFtdXG4gICAgICAgIH0sXG4gICAgICAgIGN0YV9yZXZpZXc6IHtcbiAgICAgICAgICAgIHNjb3JlOiA3MCxcbiAgICAgICAgICAgIGN0YV9wcmVzZW50OiBkcmFmdE1hcmtkb3duLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoJ2N0YScpIHx8IGRyYWZ0TWFya2Rvd24udG9Mb3dlckNhc2UoKS5pbmNsdWRlcygnY2FsbCcpLFxuICAgICAgICAgICAgY3RhX2FuYWx5c2lzOiAnQ1RBIHNlY3Rpb24gcmV2aWV3IG5lZWRlZCdcbiAgICAgICAgfSxcbiAgICAgICAgY2xpZW50X2dvYWxfYWxpZ25tZW50OiB7XG4gICAgICAgICAgICBzY29yZTogNzAsXG4gICAgICAgICAgICBhbmFseXNpczogJ0RyYWZ0IGFsaWducyB3aXRoIHByb3ZpZGVkIGNsaWVudCBnb2FscyBhbmQgYXVkaWVuY2UgdGFyZ2V0aW5nJ1xuICAgICAgICB9LFxuICAgICAgICByaXNrX2ZsYWdzOiBbXSxcbiAgICAgICAgcHJpb3JpdHlfZml4ZXM6IFtcbiAgICAgICAgICAgIC4uLmgxQ291bnQgPT09IDAgPyBbXG4gICAgICAgICAgICAgICAgJ0Vuc3VyZSBIMSBoZWFkaW5nIHByZXNlbnQnXG4gICAgICAgICAgICBdIDogW10sXG4gICAgICAgICAgICAuLi53b3JkQ291bnQgPCAxNTAwID8gW1xuICAgICAgICAgICAgICAgICdFeHBhbmQgY29udGVudCB0byBtZWV0IHdvcmQgY291bnQgdGFyZ2V0J1xuICAgICAgICAgICAgXSA6IFtdLFxuICAgICAgICAgICAgLi4uaW50ZXJuYWxMaW5rQ291bnQgPT09IDAgPyBbXG4gICAgICAgICAgICAgICAgJ0FkZCBpbnRlcm5hbCBsaW5raW5nIHN0cmF0ZWd5J1xuICAgICAgICAgICAgXSA6IFtdXG4gICAgICAgIF0sXG4gICAgICAgIHJlY29tbWVuZGVkX25leHRfYWN0aW9uOiByZWNvbW1lbmRlZEFjdGlvbixcbiAgICAgICAgcmVhZHlfZm9yX2VkaXRvcjogcmVhZHlGb3JFZGl0b3IsXG4gICAgICAgIG5lZWRzX3Jldmlldzogb3ZlcmFsbFNjb3JlIDwgNzAsXG4gICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgfTtcbn1cbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3Nlby1xYS1zdGVwLy9ydW5TZW9RYVN0ZXBcIiwgcnVuU2VvUWFTdGVwKTtcbiIsICJpbXBvcnQgeyByZWdpc3RlclN0ZXBGdW5jdGlvbiB9IGZyb20gXCJ3b3JrZmxvdy9pbnRlcm5hbC9wcml2YXRlXCI7XG5pbXBvcnQgJ3NlcnZlci1vbmx5JztcbmltcG9ydCB7IGdlbmVyYXRlVGV4dCB9IGZyb20gJ2FpJztcbmltcG9ydCB7IG9wZW5haSB9IGZyb20gJ0BhaS1zZGsvb3BlbmFpJztcbmltcG9ydCB7IHVwZGF0ZVJ1bkRyYWZ0LCB1cGRhdGVSdW5TdGF0dXMgfSBmcm9tICcuLi8uLi9zdG9yYWdlL3J1bnMnO1xuaW1wb3J0IHsgZ2V0QWdlbnRDb25maWcgfSBmcm9tICcuLi8uLi9zdG9yYWdlL2FnZW50LWNvbmZpZ3MnO1xuLyoqX19pbnRlcm5hbF93b3JrZmxvd3N7XCJzdGVwc1wiOntcImxpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvd3JpdGVyLXN0ZXAudHNcIjp7XCJydW5Xcml0ZXJTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvd3JpdGVyLXN0ZXAvL3J1bldyaXRlclN0ZXBcIn19fX0qLztcbi8qKlxuICogV3JpdGVyIFN0ZXAgLSBQaGFzZSAyQy1DXG4gKiBSdW5zIGluc2lkZSBhIGR1cmFibGUgc3RlcCBmdW5jdGlvbiAoaGFzIE5vZGUuanMgYWNjZXNzKVxuICogQ2FsbHMgQUkgbW9kZWwgdG8gZ2VuZXJhdGUgZmlyc3QgZnVsbCBibG9nIGRyYWZ0IGluIE1hcmtkb3duXG4gKiBVc2VzIHJlc2VhcmNoIGRhdGEgYW5kIG91dGxpbmUgdG8gc3RydWN0dXJlIHRoZSBjb250ZW50XG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJ1bldyaXRlclN0ZXAocnVuSWQsIGlucHV0LCByZXNlYXJjaERhdGEsIG91dGxpbmVEYXRhKSB7XG4gICAgY29uc29sZS5sb2coYFt2MF0gV3JpdGVyIHN0ZXA6IENyZWF0aW5nIGRyYWZ0IGZvciBydW4gJHtydW5JZH1gKTtcbiAgICB0cnkge1xuICAgICAgICAvLyBMb2FkIGFnZW50IGNvbmZpZyBmcm9tIGRhdGFiYXNlXG4gICAgICAgIGNvbnN0IGFnZW50Q29uZmlnID0gYXdhaXQgZ2V0QWdlbnRDb25maWcoJ3dyaXRlcicpO1xuICAgICAgICBpZiAoIWFnZW50Q29uZmlnKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0FjdGl2ZSBhZ2VudCBjb25maWcgbm90IGZvdW5kIGZvciBhZ2VudF9rZXk6IHdyaXRlcicpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFNFTyBCbG9nIEFnZW50IENvbmZpZyBMb2FkZWQ6IHdyaXRlciB2JHthZ2VudENvbmZpZy52ZXJzaW9ufWApO1xuICAgICAgICAvLyBCdWlsZCBzeXN0ZW0gcHJvbXB0IGZyb20gZGF0YWJhc2UgY29uZmlnXG4gICAgICAgIGNvbnN0IHN5c3RlbVByb21wdCA9IFtcbiAgICAgICAgICAgIGFnZW50Q29uZmlnLnN5c3RlbV9wcm9tcHQsXG4gICAgICAgICAgICBhZ2VudENvbmZpZy5za2lsbF9tYXJrZG93blxuICAgICAgICBdLmZpbHRlcihCb29sZWFuKS5qb2luKCdcXG5cXG4nKTtcbiAgICAgICAgLy8gQ3JlYXRlIGNvbnRleHQgZnJvbSBhdmFpbGFibGUgZGF0YVxuICAgICAgICBjb25zdCB0b3BpYyA9IGlucHV0LmJsb2dfdG9waWMgfHwgaW5wdXQudG9waWMgfHwgJ1lvdXIgVG9waWMnO1xuICAgICAgICBjb25zdCBwcmltYXJ5S2V5d29yZCA9IGlucHV0LnByaW1hcnlfa2V5d29yZCB8fCAncHJpbWFyeSBrZXl3b3JkJztcbiAgICAgICAgY29uc3Qgc2Vjb25kYXJ5S2V5d29yZHMgPSAoaW5wdXQuc2Vjb25kYXJ5X2tleXdvcmRzIHx8IGlucHV0LmtleXdvcmRzIHx8IFtdKS5qb2luKCcsICcpIHx8ICdzZWNvbmRhcnkga2V5d29yZHMnO1xuICAgICAgICBjb25zdCBidXNpbmVzc05hbWUgPSBpbnB1dC5idXNpbmVzc19uYW1lIHx8ICdZb3VyIEJ1c2luZXNzJztcbiAgICAgICAgY29uc3QgYXVkaWVuY2VOb3RlcyA9IGlucHV0LmF1ZGllbmNlX25vdGVzIHx8ICdUYXJnZXQgYXVkaWVuY2Ugbm90IHNwZWNpZmllZCc7XG4gICAgICAgIGNvbnN0IGJyYW5kVm9pY2UgPSBpbnB1dC5icmFuZF92b2ljZV9ub3RlcyB8fCAnUHJvZmVzc2lvbmFsIGFuZCBjbGVhcic7XG4gICAgICAgIGNvbnN0IGN0YU5vdGVzID0gaW5wdXQuY3RhX25vdGVzIHx8ICcnO1xuICAgICAgICBjb25zdCBpbnRlcm5hbExpbmtOb3RlcyA9IGlucHV0LmludGVybmFsX2xpbmtfbm90ZXMgfHwgJyc7XG4gICAgICAgIGNvbnN0IGFkZGl0aW9uYWxOb3RlcyA9IGlucHV0LmFkZGl0aW9uYWxfb3JkZXJfbm90ZXMgfHwgJ05vIGFkZGl0aW9uYWwgbm90ZXMnO1xuICAgICAgICBjb25zdCB0YXJnZXRXb3JkQ291bnQgPSBpbnB1dC50YXJnZXRfd29yZF9jb3VudCB8fCAxNTAwO1xuICAgICAgICAvLyBCdWlsZCByZXNlYXJjaCBjb250ZXh0IGlmIGF2YWlsYWJsZVxuICAgICAgICBsZXQgcmVzZWFyY2hDb250ZXh0ID0gJyc7XG4gICAgICAgIGlmIChyZXNlYXJjaERhdGEgJiYgdHlwZW9mIHJlc2VhcmNoRGF0YSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIGNvbnN0IGZpbmRpbmdzID0gcmVzZWFyY2hEYXRhLmtleV9maW5kaW5ncyB8fCBbXTtcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGZpbmRpbmdzKSAmJiBmaW5kaW5ncy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgcmVzZWFyY2hDb250ZXh0ID0gYFxcblxcbktleSBSZXNlYXJjaCBGaW5kaW5nczpcXG4ke2ZpbmRpbmdzLm1hcCgoZik9PmAtICR7dHlwZW9mIGYgPT09ICdzdHJpbmcnID8gZiA6IEpTT04uc3RyaW5naWZ5KGYpfWApLmpvaW4oJ1xcbicpfWA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gQnVpbGQgb3V0bGluZSBjb250ZXh0IGlmIGF2YWlsYWJsZVxuICAgICAgICBsZXQgb3V0bGluZUNvbnRleHQgPSAnJztcbiAgICAgICAgaWYgKG91dGxpbmVEYXRhKSB7XG4gICAgICAgICAgICBjb25zdCBzZWN0aW9ucyA9IChvdXRsaW5lRGF0YS5zZWN0aW9ucyB8fCBbXSkubWFwKChzKT0+YCMjICR7dHlwZW9mIHMgPT09ICdzdHJpbmcnID8gcyA6IHMuaGVhZGluZyB8fCAnU2VjdGlvbid9XFxuKCR7cy5wdXJwb3NlIHx8ICdTZWN0aW9uIGNvbnRlbnQnfSlgKTtcbiAgICAgICAgICAgIGlmIChzZWN0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgb3V0bGluZUNvbnRleHQgPSBgXFxuXFxuT3V0bGluZSBTdHJ1Y3R1cmU6XFxuJHtzZWN0aW9ucy5qb2luKCdcXG5cXG4nKX1gO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIEJ1aWxkIGludGVybmFsIGxpbmtzIGNvbnRleHRcbiAgICAgICAgbGV0IGxpbmtzQ29udGV4dCA9ICcnO1xuICAgICAgICBpZiAoaW50ZXJuYWxMaW5rTm90ZXMpIHtcbiAgICAgICAgICAgIGxpbmtzQ29udGV4dCA9IGBcXG5cXG5JbnRlcm5hbCBMaW5rIE9wcG9ydHVuaXRpZXM6XFxuJHtpbnRlcm5hbExpbmtOb3Rlc31gO1xuICAgICAgICB9XG4gICAgICAgIC8vIEJ1aWxkIENUQSBjb250ZXh0XG4gICAgICAgIGxldCBjdGFDb250ZXh0ID0gJyc7XG4gICAgICAgIGlmIChjdGFOb3Rlcykge1xuICAgICAgICAgICAgY3RhQ29udGV4dCA9IGBcXG5cXG5DYWxsLXRvLUFjdGlvbiBHdWlkYW5jZTpcXG4ke2N0YU5vdGVzfWA7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdXNlck1lc3NhZ2UgPSBgV3JpdGUgdGhlIGZpcnN0IGRyYWZ0IGJsb2cgcG9zdCBhYm91dDogJHt0b3BpY30ke3Jlc2VhcmNoQ29udGV4dH0ke291dGxpbmVDb250ZXh0fSR7bGlua3NDb250ZXh0fSR7Y3RhQ29udGV4dH1gO1xuICAgICAgICAvLyBHZXQgbW9kZWwgbmFtZTogdXNlIERCIGNvbmZpZyBpZiBhdmFpbGFibGUsIG90aGVyd2lzZSBmYWxsIGJhY2sgdG8gZW52IHZhciBvciBkZWZhdWx0XG4gICAgICAgIGNvbnN0IG1vZGVsTmFtZSA9IGFnZW50Q29uZmlnLm1vZGVsIHx8IHByb2Nlc3MuZW52LldSSVRFUl9BR0VOVF9NT0RFTCB8fCBwcm9jZXNzLmVudi5SRVNFQVJDSF9BR0VOVF9NT0RFTCB8fCAnZ3B0LTUuNC1taW5pJztcbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gV3JpdGVyIHN0ZXA6IFVzaW5nIG1vZGVsOiAke21vZGVsTmFtZX1gKTtcbiAgICAgICAgLy8gQ2FsbCBBSSBtb2RlbCB2aWEgZGlyZWN0IE9wZW5BSSBwcm92aWRlclxuICAgICAgICBjb25zdCBtb2RlbCA9IG9wZW5haShtb2RlbE5hbWUpO1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGdlbmVyYXRlVGV4dCh7XG4gICAgICAgICAgICBtb2RlbCxcbiAgICAgICAgICAgIHN5c3RlbTogc3lzdGVtUHJvbXB0LFxuICAgICAgICAgICAgcHJvbXB0OiB1c2VyTWVzc2FnZSxcbiAgICAgICAgICAgIHRlbXBlcmF0dXJlOiAwLjcsXG4gICAgICAgICAgICBtYXhUb2tlbnM6IDQwMDBcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IGRyYWZ0TWFya2Rvd24gPSByZXNwb25zZS50ZXh0O1xuICAgICAgICAvLyBCYXNpYyB2YWxpZGF0aW9uXG4gICAgICAgIGlmICghZHJhZnRNYXJrZG93biB8fCBkcmFmdE1hcmtkb3duLnRyaW0oKS5sZW5ndGggPCA1MDApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignR2VuZXJhdGVkIGNvbnRlbnQgdG9vIHNob3J0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQ2FsY3VsYXRlIG1ldHJpY3NcbiAgICAgICAgY29uc3Qgd29yZENvdW50ID0gZHJhZnRNYXJrZG93bi5zcGxpdCgvXFxzKy8pLmxlbmd0aDtcbiAgICAgICAgY29uc3Qgc2VjdGlvbnNDb3VudCA9IChkcmFmdE1hcmtkb3duLm1hdGNoKC9eIyNcXHMvZ20pIHx8IFtdKS5sZW5ndGg7XG4gICAgICAgIGNvbnN0IGhhc0N0YSA9IGRyYWZ0TWFya2Rvd24udG9Mb3dlckNhc2UoKS5pbmNsdWRlcygnY2FsbCcpIHx8IGRyYWZ0TWFya2Rvd24udG9Mb3dlckNhc2UoKS5pbmNsdWRlcygnYWN0aW9uJykgfHwgY3RhTm90ZXMubGVuZ3RoID4gMDtcbiAgICAgICAgY29uc3QgaGFzSW50ZXJuYWxMaW5rcyA9IGRyYWZ0TWFya2Rvd24uaW5jbHVkZXMoJ1tsaW5rOicpIHx8IGludGVybmFsTGlua05vdGVzLmxlbmd0aCA+IDA7XG4gICAgICAgIGNvbnN0IHdyaXRlck91dHB1dCA9IHtcbiAgICAgICAgICAgIGRyYWZ0X21hcmtkb3duOiBkcmFmdE1hcmtkb3duLFxuICAgICAgICAgICAgd29yZF9jb3VudDogd29yZENvdW50LFxuICAgICAgICAgICAgc2VjdGlvbnNfd3JpdHRlbjogc2VjdGlvbnNDb3VudCxcbiAgICAgICAgICAgIGhhc19jdGE6IGhhc0N0YSxcbiAgICAgICAgICAgIGhhc19pbnRlcm5hbF9saW5rczogaGFzSW50ZXJuYWxMaW5rcyxcbiAgICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICAgIH07XG4gICAgICAgIC8vIFBlcnNpc3QgZHJhZnRfbWFya2Rvd24gdG8gZGF0YWJhc2UgKG1hcmtkb3duIHN0cmluZyBvbmx5LCBub3QgZnVsbCBvYmplY3QpXG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFdyaXRlciBzdGVwOiBQZXJzaXN0aW5nIGRyYWZ0X21hcmtkb3duICgke3dvcmRDb3VudH0gd29yZHMpIGZvciBydW4gJHtydW5JZH1gKTtcbiAgICAgICAgYXdhaXQgdXBkYXRlUnVuRHJhZnQocnVuSWQsIHdyaXRlck91dHB1dC5kcmFmdF9tYXJrZG93bik7XG4gICAgICAgIC8vIEFsc28gdXBkYXRlIHN0YXR1cyB0byAnd3JpdGluZydcbiAgICAgICAgYXdhaXQgdXBkYXRlUnVuU3RhdHVzKHJ1bklkLCAnd3JpdGluZycpO1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBXcml0ZXIgc3RlcDogQ29tcGxldGUgZm9yIHJ1biAke3J1bklkfSAoJHt3b3JkQ291bnR9IHdvcmRzLCAke3NlY3Rpb25zQ291bnR9IHNlY3Rpb25zKWApO1xuICAgICAgICByZXR1cm4gd3JpdGVyT3V0cHV0O1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTXNnID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvciBpbiB3cml0ZXIgc3RlcCc7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2MF0gV3JpdGVyIHN0ZXAgZXJyb3IgZm9yIHJ1biAke3J1bklkfTogJHtlcnJvck1zZ31gKTtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBXcml0ZXIgc3RlcCBmYWlsZWQ6ICR7ZXJyb3JNc2d9YCk7XG4gICAgfVxufVxucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvd3JpdGVyLXN0ZXAvL3J1bldyaXRlclN0ZXBcIiwgcnVuV3JpdGVyU3RlcCk7XG4iLCAiXG4gICAgLy8gQnVpbHQgaW4gc3RlcHNcbiAgICBpbXBvcnQgJ3dvcmtmbG93L2ludGVybmFsL2J1aWx0aW5zJztcbiAgICAvLyBVc2VyIHN0ZXBzXG4gICAgaW1wb3J0ICcuL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvY2FsbGJhY2stc3RlcC50cyc7XG5pbXBvcnQgJy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9lZGl0b3Itc3RlcC50cyc7XG5pbXBvcnQgJy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9oZWxwZXJzLnRzJztcbmltcG9ydCAnLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL21ldGEtc3RlcC50cyc7XG5pbXBvcnQgJy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9vdXRsaW5lLXN0ZXAudHMnO1xuaW1wb3J0ICcuL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvcmVzZWFyY2gtc3RlcC50cyc7XG5pbXBvcnQgJy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9zZW8tcWEtc3RlcC50cyc7XG5pbXBvcnQgJy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy93cml0ZXItc3RlcC50cyc7XG4gICAgLy8gU2VyZGUgZmlsZXMgZm9yIGNyb3NzLWNvbnRleHQgY2xhc3MgcmVnaXN0cmF0aW9uXG4gICAgXG4gICAgLy8gQVBJIGVudHJ5cG9pbnRcbiAgICBleHBvcnQgeyBzdGVwRW50cnlwb2ludCBhcyBIRUFELCBzdGVwRW50cnlwb2ludCBhcyBQT1NUIH0gZnJvbSAnd29ya2Zsb3cvcnVudGltZSc7Il0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7OztBQUFBLFNBQUEsNEJBQUE7QUFTRSxlQUFXLGtDQUFBO0FBQ1gsU0FBTyxLQUFLLFlBQVc7QUFDekI7QUFGYTtBQUliLGVBQXNCLDBCQUF1QjtBQUMzQyxTQUFBLEtBQVcsS0FBQTs7QUFEUztBQUd0QixlQUFD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LEVBQ3JEO0FBQ0o7QUE5RjBCO0FBK0YxQkMsc0JBQXFCLHlFQUF5RSxhQUFhOzs7QUM1RnZHLFNBQTJCLGdCQUF3QixrQkFBbEJDLHVCQUE4QjsiLAogICJuYW1lcyI6IFsicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAiZ2VuZXJhdGVUZXh0IiwgIm9wZW5haSIsICJnZXRBZ2VudENvbmZpZyIsICJnZXRBZ2VudENvbmZpZyIsICJnZW5lcmF0ZVRleHQiLCAib3BlbmFpIiwgInJlZ2lzdGVyU3RlcEZ1bmN0aW9uIiwgInJlZ2lzdGVyU3RlcEZ1bmN0aW9uIiwgImdlbmVyYXRlVGV4dCIsICJvcGVuYWkiLCAidXBkYXRlUnVuU3RhdHVzIiwgImdldEFnZW50Q29uZmlnIiwgImdldEFnZW50Q29uZmlnIiwgIm9wZW5haSIsICJnZW5lcmF0ZVRleHQiLCAidXBkYXRlUnVuU3RhdHVzIiwgInJlZ2lzdGVyU3RlcEZ1bmN0aW9uIiwgInJlZ2lzdGVyU3RlcEZ1bmN0aW9uIiwgImdlbmVyYXRlVGV4dCIsICJvcGVuYWkiLCAidXBkYXRlUnVuU3RhdHVzIiwgImdldEFnZW50Q29uZmlnIiwgImdldEFnZW50Q29uZmlnIiwgIm9wZW5haSIsICJnZW5lcmF0ZVRleHQiLCAidXBkYXRlUnVuU3RhdHVzIiwgInJlZ2lzdGVyU3RlcEZ1bmN0aW9uIiwgInJlZ2lzdGVyU3RlcEZ1bmN0aW9uIiwgImdlbmVyYXRlVGV4dCIsICJvcGVuYWkiLCAidXBkYXRlUnVuU3RhdHVzIiwgImdldEFnZW50Q29uZmlnIiwgImdldEFnZW50Q29uZmlnIiwgImdlbmVyYXRlVGV4dCIsICJvcGVuYWkiLCAidXBkYXRlUnVuU3RhdHVzIiwgInJlZ2lzdGVyU3RlcEZ1bmN0aW9uIiwgInJlZ2lzdGVyU3RlcEZ1bmN0aW9uIiwgImdlbmVyYXRlVGV4dCIsICJvcGVuYWkiLCAidXBkYXRlUnVuU3RhdHVzIiwgImdldEFnZW50Q29uZmlnIiwgImdldEFnZW50Q29uZmlnIiwgIm9wZW5haSIsICJnZW5lcmF0ZVRleHQiLCAidXBkYXRlUnVuU3RhdHVzIiwgInJlZ2lzdGVyU3RlcEZ1bmN0aW9uIiwgInN0ZXBFbnRyeXBvaW50Il0KfQo=

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
  const wordCount = editedDraft.split(/\s+/).length;
  const headings = editedDraft.match(/^#+\s+.+$/gm) || [];
  return `You are an expert SEO metadata specialist. Generate SEO metadata for a blog post for human review.

BLOG TOPIC: ${input.blog_topic}
BUSINESS NAME: ${input.business_name || "Not provided"}
WEBSITE URL: ${input.website_url || "Not provided"}
PRIMARY KEYWORD: ${input.primary_keyword}
SECONDARY KEYWORDS: ${(input.secondary_keywords || []).join(", ") || "None provided"}
TARGET AUDIENCE: ${input.audience_notes || "General audience"}

RESEARCH SUMMARY:
${research.key_findings.slice(0, 3).join("\n")}

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
  return {
    overall_score: 68,
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
    recommended_next_action: "Send to editor for review and optimization",
    ready_for_editor: true,
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
      const insights = researchData.key_insights || [];
      if (Array.isArray(insights) && insights.length > 0) {
        researchContext = `

Research Insights:
${insights.map((i) => `- ${typeof i === "string" ? i : JSON.stringify(i)}`).join("\n")}`;
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3dvcmtmbG93QDQuNS4wX0BuZXN0anMrY29tbW9uQDExLjEuMjdfcmVmbGVjdC1tZXRhZGF0YUAwLjIuMl9yeGpzQDcuOC4yX19AbmVzdGpzK2NvcmVAMV9hOWMxYWE2YzBiNTgwZTliZjNiZmY2NGMzMjY5ZmU0My9ub2RlX21vZHVsZXMvd29ya2Zsb3cvc3JjL2ludGVybmFsL2J1aWx0aW5zLnRzIiwgIi4uLy4uLy4uLy4uLy4uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvY2FsbGJhY2stc3RlcC50cyIsICIuLi8uLi8uLi8uLi8uLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL2VkaXRvci1zdGVwLnRzIiwgIi4uLy4uLy4uLy4uLy4uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvaGVscGVycy50cyIsICIuLi8uLi8uLi8uLi8uLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL21ldGEtc3RlcC50cyIsICIuLi8uLi8uLi8uLi8uLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL291dGxpbmUtc3RlcC50cyIsICIuLi8uLi8uLi8uLi8uLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3Jlc2VhcmNoLXN0ZXAudHMiLCAiLi4vLi4vLi4vLi4vLi4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9zZW8tcWEtc3RlcC50cyIsICIuLi8uLi8uLi8uLi8uLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3dyaXRlci1zdGVwLnRzIiwgIi4uLy4uLy4uLy4uLy4uL3ZpcnR1YWwtZW50cnkuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKlxuICogVGhlc2UgYXJlIHRoZSBidWlsdC1pbiBzdGVwcyB0aGF0IGFyZSBcImF1dG9tYXRpY2FsbHkgYXZhaWxhYmxlXCIgaW4gdGhlIHdvcmtmbG93IHNjb3BlLiBUaGV5IGFyZVxuICogc2ltaWxhciB0byBcInN0ZGxpYlwiIGV4Y2VwdCB0aGF0IGFyZSBub3QgbWVhbnQgdG8gYmUgaW1wb3J0ZWQgYnkgdXNlcnMsIGJ1dCBhcmUgaW5zdGVhZCBcImp1c3QgYXZhaWxhYmxlXCJcbiAqIGFsb25nc2lkZSB1c2VyIGRlZmluZWQgc3RlcHMuIFRoZXkgYXJlIHVzZWQgaW50ZXJuYWxseSBieSB0aGUgcnVudGltZVxuICovXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBfX2J1aWx0aW5fcmVzcG9uc2VfYXJyYXlfYnVmZmVyKFxuICB0aGlzOiBSZXF1ZXN0IHwgUmVzcG9uc2Vcbikge1xuICAndXNlIHN0ZXAnO1xuICByZXR1cm4gdGhpcy5hcnJheUJ1ZmZlcigpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gX19idWlsdGluX3Jlc3BvbnNlX2pzb24odGhpczogUmVxdWVzdCB8IFJlc3BvbnNlKSB7XG4gICd1c2Ugc3RlcCc7XG4gIHJldHVybiB0aGlzLmpzb24oKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIF9fYnVpbHRpbl9yZXNwb25zZV90ZXh0KHRoaXM6IFJlcXVlc3QgfCBSZXNwb25zZSkge1xuICAndXNlIHN0ZXAnO1xuICByZXR1cm4gdGhpcy50ZXh0KCk7XG59XG4iLCAiaW1wb3J0IHsgcmVnaXN0ZXJTdGVwRnVuY3Rpb24gfSBmcm9tIFwid29ya2Zsb3cvaW50ZXJuYWwvcHJpdmF0ZVwiO1xuaW1wb3J0ICdzZXJ2ZXItb25seSc7XG5pbXBvcnQgeyBnZXRSdW4gfSBmcm9tICcuLi8uLi9zdG9yYWdlL3J1bnMnO1xuLyoqX19pbnRlcm5hbF93b3JrZmxvd3N7XCJzdGVwc1wiOntcImxpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvY2FsbGJhY2stc3RlcC50c1wiOntcInNlbmRDYWxsYmFja1N0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9jYWxsYmFjay1zdGVwLy9zZW5kQ2FsbGJhY2tTdGVwXCJ9fX19Ki87XG4vKipcbiAqIFNlbmQgY2FsbGJhY2sgbm90aWZpY2F0aW9uIHRvIHdlYmhvb2sgVVJMXG4gKiBSdW5zIGFzIGEgZHVyYWJsZSBzdGVwIHRvIGVuc3VyZSBjYWxsYmFjayBkZWxpdmVyeSBpcyB0cmFja2VkXG4gKiBGYWlsdXJlcyBkbyBub3QgYnJlYWsgdGhlIG1haW4gd29ya2Zsb3dcbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gc2VuZENhbGxiYWNrU3RlcChydW5JZCkge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIEZldGNoIHJ1biB0byBnZXQgY2FsbGJhY2sgVVJMIGFuZCBmaW5hbCBzdGF0ZVxuICAgICAgICBjb25zdCBydW4gPSBhd2FpdCBnZXRSdW4ocnVuSWQpO1xuICAgICAgICBpZiAoIXJ1bikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBbdjBdIENhbGxiYWNrOiBSdW4gJHtydW5JZH0gbm90IGZvdW5kYCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFydW4uY2FsbGJhY2tfdXJsKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBDYWxsYmFjazogTm8gY2FsbGJhY2sgVVJMIGZvciBydW4gJHtydW5JZH1gKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBDYWxsYmFjazogU2VuZGluZyBub3RpZmljYXRpb24gdG8gJHtydW4uY2FsbGJhY2tfdXJsfWApO1xuICAgICAgICAvLyBCdWlsZCBjYWxsYmFjayBwYXlsb2FkXG4gICAgICAgIGNvbnN0IGNhbGxiYWNrUGF5bG9hZCA9IGJ1aWxkQ2FsbGJhY2tQYXlsb2FkKHJ1bik7XG4gICAgICAgIC8vIFNlbmQgY2FsbGJhY2sgd2l0aCB0aW1lb3V0IHByb3RlY3Rpb25cbiAgICAgICAgY29uc3QgY29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICAgICAgY29uc3QgdGltZW91dElkID0gc2V0VGltZW91dCgoKT0+Y29udHJvbGxlci5hYm9ydCgpLCAzMDAwMCk7IC8vIDMwIHNlY29uZCB0aW1lb3V0XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHJ1bi5jYWxsYmFja191cmwsIHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbidcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGNhbGxiYWNrUGF5bG9hZCksXG4gICAgICAgICAgICAgICAgc2lnbmFsOiBjb250cm9sbGVyLnNpZ25hbFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcbiAgICAgICAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFt2MF0gQ2FsbGJhY2s6IFdlYmhvb2sgcmV0dXJuZWQgJHtyZXNwb25zZS5zdGF0dXN9IGZvciBydW4gJHtydW5JZH1gKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFt2MF0gQ2FsbGJhY2s6IFN1Y2Nlc3NmdWxseSBzZW50IGZvciBydW4gJHtydW5JZH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZmV0Y2hFcnJvcikge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgICAgICAgICBpZiAoZmV0Y2hFcnJvciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgICAgICAgICAgaWYgKGZldGNoRXJyb3IubmFtZSA9PT0gJ0Fib3J0RXJyb3InKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgW3YwXSBDYWxsYmFjazogUmVxdWVzdCB0aW1lb3V0ICgzMHMpIGZvciBydW4gJHtydW5JZH1gKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFt2MF0gQ2FsbGJhY2s6IE5ldHdvcmsgZXJyb3IgZm9yIHJ1biAke3J1bklkfTogJHtmZXRjaEVycm9yLm1lc3NhZ2V9YCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFt2MF0gQ2FsbGJhY2s6IFVua25vd24gZXJyb3IgZm9yIHJ1biAke3J1bklkfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAvLyBEb24ndCB0aHJvdyAtIGNhbGxiYWNrIGZhaWx1cmUgc2hvdWxkIG5vdCBmYWlsIHRoZSB3b3JrZmxvd1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgLy8gTG9nIGVycm9yIHNhZmVseSB3aXRob3V0IGV4cG9zaW5nIHNlY3JldHNcbiAgICAgICAgY29uc3QgZXJyb3JNc2cgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2MF0gQ2FsbGJhY2s6IFVuZXhwZWN0ZWQgZXJyb3IgZm9yIHJ1biAke3J1bklkfTogJHtlcnJvck1zZ31gKTtcbiAgICAvLyBEb24ndCB0aHJvdyAtIGNhbGxiYWNrIGZhaWx1cmUgc2hvdWxkIG5vdCBmYWlsIHRoZSB3b3JrZmxvd1xuICAgIH1cbn1cbi8qKlxuICogQnVpbGQgY2FsbGJhY2sgcGF5bG9hZCBiYXNlZCBvbiBydW4gc3RhdHVzXG4gKi8gZnVuY3Rpb24gYnVpbGRDYWxsYmFja1BheWxvYWQocnVuKSB7XG4gICAgY29uc3QgaXNDb21wbGV0ZWQgPSBydW4uc3RhdHVzID09PSAnY29tcGxldGVkJztcbiAgICBjb25zdCBpc0ZhaWxlZCA9IHJ1bi5zdGF0dXMgPT09ICdmYWlsZWQnO1xuICAgIGlmIChpc0NvbXBsZXRlZCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcnVuX2lkOiBydW4uaWQsXG4gICAgICAgICAgICBzdGF0dXM6ICdjb21wbGV0ZWQnLFxuICAgICAgICAgICAgYnVzaW5lc3NfbmFtZTogcnVuLmlucHV0X2pzb24/LmJ1c2luZXNzX25hbWUgfHwgbnVsbCxcbiAgICAgICAgICAgIGJsb2dfdG9waWM6IHJ1bi5pbnB1dF9qc29uPy5ibG9nX3RvcGljIHx8IHJ1bi5pbnB1dF9qc29uPy50b3BpYyB8fCBudWxsLFxuICAgICAgICAgICAgcmV2aWV3X3JlYWR5OiB0cnVlLFxuICAgICAgICAgICAgaHVtYW5fcmV2aWV3X3JlcXVpcmVkOiB0cnVlLFxuICAgICAgICAgICAgb3V0cHV0czoge1xuICAgICAgICAgICAgICAgIGhhc19yZXNlYXJjaF9qc29uOiAhIXJ1bi5yZXNlYXJjaF9qc29uLFxuICAgICAgICAgICAgICAgIGhhc19vdXRsaW5lX2pzb246ICEhcnVuLm91dGxpbmVfanNvbixcbiAgICAgICAgICAgICAgICBoYXNfZHJhZnRfbWFya2Rvd246ICEhcnVuLmRyYWZ0X21hcmtkb3duLFxuICAgICAgICAgICAgICAgIGhhc19vcHRpbWl6ZWRfanNvbjogISFydW4ub3B0aW1pemVkX2pzb24sXG4gICAgICAgICAgICAgICAgaGFzX2ZpbmFsX291dHB1dF9qc29uOiAhIXJ1bi5maW5hbF9vdXRwdXRfanNvblxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZpbmFsX291dHB1dF9qc29uOiBydW4uZmluYWxfb3V0cHV0X2pzb25cbiAgICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKGlzRmFpbGVkKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBydW5faWQ6IHJ1bi5pZCxcbiAgICAgICAgICAgIHN0YXR1czogJ2ZhaWxlZCcsXG4gICAgICAgICAgICBidXNpbmVzc19uYW1lOiBydW4uaW5wdXRfanNvbj8uYnVzaW5lc3NfbmFtZSB8fCBudWxsLFxuICAgICAgICAgICAgYmxvZ190b3BpYzogcnVuLmlucHV0X2pzb24/LmJsb2dfdG9waWMgfHwgcnVuLmlucHV0X2pzb24/LnRvcGljIHx8IG51bGwsXG4gICAgICAgICAgICByZXZpZXdfcmVhZHk6IGZhbHNlLFxuICAgICAgICAgICAgaHVtYW5fcmV2aWV3X3JlcXVpcmVkOiB0cnVlLFxuICAgICAgICAgICAgZXJyb3JfbWVzc2FnZTogcnVuLmVycm9yX21lc3NhZ2UgfHwgJ1Vua25vd24gZXJyb3InXG4gICAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gU2hvdWxkbid0IGhhcHBlbiwgYnV0IGhhbmRsZSBncmFjZWZ1bGx5XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBydW5faWQ6IHJ1bi5pZCxcbiAgICAgICAgICAgIHN0YXR1czogcnVuLnN0YXR1cyxcbiAgICAgICAgICAgIGJ1c2luZXNzX25hbWU6IHJ1bi5pbnB1dF9qc29uPy5idXNpbmVzc19uYW1lIHx8IG51bGwsXG4gICAgICAgICAgICBibG9nX3RvcGljOiBydW4uaW5wdXRfanNvbj8uYmxvZ190b3BpYyB8fCBydW4uaW5wdXRfanNvbj8udG9waWMgfHwgbnVsbFxuICAgICAgICB9O1xuICAgIH1cbn1cbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL2NhbGxiYWNrLXN0ZXAvL3NlbmRDYWxsYmFja1N0ZXBcIiwgc2VuZENhbGxiYWNrU3RlcCk7XG4iLCAiaW1wb3J0IHsgcmVnaXN0ZXJTdGVwRnVuY3Rpb24gfSBmcm9tIFwid29ya2Zsb3cvaW50ZXJuYWwvcHJpdmF0ZVwiO1xuaW1wb3J0ICdzZXJ2ZXItb25seSc7XG5pbXBvcnQgeyBnZW5lcmF0ZVRleHQgfSBmcm9tICdhaSc7XG5pbXBvcnQgeyBvcGVuYWkgfSBmcm9tICdAYWktc2RrL29wZW5haSc7XG5pbXBvcnQgeyBnZXRBZ2VudENvbmZpZyB9IGZyb20gJy4uLy4uL3N0b3JhZ2UvYWdlbnQtY29uZmlncyc7XG4vKipfX2ludGVybmFsX3dvcmtmbG93c3tcInN0ZXBzXCI6e1wibGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9lZGl0b3Itc3RlcC50c1wiOntcInJ1bkVkaXRvclN0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9lZGl0b3Itc3RlcC8vcnVuRWRpdG9yU3RlcFwifX19fSovO1xuLyoqXG4gKiBFZGl0b3IgQWdlbnQgU3RlcFxuICogSW1wcm92ZXMgdGhlIGRyYWZ0IGJhc2VkIG9uIFNFTyBRQSByZWNvbW1lbmRhdGlvbnMgYW5kIGJyYW5kIGd1aWRlbGluZXNcbiAqIERvZXMgTk9UIG92ZXJ3cml0ZSB0aGUgb3JpZ2luYWwgZHJhZnRfbWFya2Rvd24gLSByZXN1bHQgZ29lcyB0byBmaW5hbF9vdXRwdXRfanNvblxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5FZGl0b3JTdGVwKHJ1bklkLCBpbnB1dCwgcmVzZWFyY2gsIG91dGxpbmUsIG9yaWdpbmFsRHJhZnQsIHNlb1FhKSB7XG4gICAgY29uc29sZS5sb2coYFt2MF0gRWRpdG9yIHN0ZXA6IFN0YXJ0aW5nIGZvciBydW4gJHtydW5JZH1gKTtcbiAgICB0cnkge1xuICAgICAgICAvLyBMb2FkIGFnZW50IGNvbmZpZyBmcm9tIGRhdGFiYXNlXG4gICAgICAgIGNvbnN0IGFnZW50Q29uZmlnID0gYXdhaXQgZ2V0QWdlbnRDb25maWcoJ2VkaXRvcicpO1xuICAgICAgICBpZiAoIWFnZW50Q29uZmlnKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0FjdGl2ZSBhZ2VudCBjb25maWcgbm90IGZvdW5kIGZvciBhZ2VudF9rZXk6IGVkaXRvcicpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFNFTyBCbG9nIEFnZW50IENvbmZpZyBMb2FkZWQ6IGVkaXRvciB2JHthZ2VudENvbmZpZy52ZXJzaW9ufWApO1xuICAgICAgICAvLyBCdWlsZCBzeXN0ZW0gcHJvbXB0IGZyb20gZGF0YWJhc2UgY29uZmlnXG4gICAgICAgIGNvbnN0IHN5c3RlbVByb21wdCA9IFtcbiAgICAgICAgICAgIGFnZW50Q29uZmlnLnN5c3RlbV9wcm9tcHQsXG4gICAgICAgICAgICBhZ2VudENvbmZpZy5za2lsbF9tYXJrZG93blxuICAgICAgICBdLmZpbHRlcihCb29sZWFuKS5qb2luKCdcXG5cXG4nKTtcbiAgICAgICAgLy8gQnVpbGQgY29udGV4dCBmb3IgZWRpdG9yXG4gICAgICAgIGNvbnN0IGVkaXRvckNvbnRleHQgPSBidWlsZEVkaXRvckNvbnRleHQoaW5wdXQsIHJlc2VhcmNoLCBvdXRsaW5lLCBzZW9RYSk7XG4gICAgICAgIC8vIEdldCBtb2RlbCBuYW1lOiB1c2UgREIgY29uZmlnIGlmIGF2YWlsYWJsZSwgb3RoZXJ3aXNlIGZhbGwgYmFjayB0byBlbnYgdmFyIG9yIGRlZmF1bHRcbiAgICAgICAgY29uc3QgbW9kZWxOYW1lID0gYWdlbnRDb25maWcubW9kZWwgfHwgcHJvY2Vzcy5lbnYuRURJVE9SX0FHRU5UX01PREVMIHx8ICdncHQtNS40LW1pbmknO1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBFZGl0b3Igc3RlcDogVXNpbmcgbW9kZWw6ICR7bW9kZWxOYW1lfWApO1xuICAgICAgICAvLyBHZW5lcmF0ZSBpbXByb3ZlZCBkcmFmdFxuICAgICAgICBjb25zdCB7IHRleHQ6IGltcHJvdmVtZW50QW5hbHlzaXMgfSA9IGF3YWl0IGdlbmVyYXRlVGV4dCh7XG4gICAgICAgICAgICBtb2RlbDogb3BlbmFpKG1vZGVsTmFtZSksXG4gICAgICAgICAgICB0ZW1wZXJhdHVyZTogMC43LFxuICAgICAgICAgICAgbWF4VG9rZW5zOiA4MDAwLFxuICAgICAgICAgICAgc3lzdGVtOiBzeXN0ZW1Qcm9tcHQsXG4gICAgICAgICAgICBtZXNzYWdlczogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcm9sZTogJ3VzZXInLFxuICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBgUGxlYXNlIGltcHJvdmUgdGhpcyBkcmFmdCBiYXNlZCBvbiB0aGUgZm9sbG93aW5nIGZlZWRiYWNrOlxuXG5PUklHSU5BTCBEUkFGVDpcbiR7b3JpZ2luYWxEcmFmdH1cblxuU0VPIFFBIEZFRURCQUNLOlxuJHtlZGl0b3JDb250ZXh0fVxuXG5Qcm92aWRlIHRoZSBlZGl0ZWQgZHJhZnQgYW5kIGEgc3VtbWFyeSBvZiBjaGFuZ2VzIG1hZGUuYFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF1cbiAgICAgICAgfSk7XG4gICAgICAgIC8vIFBhcnNlIGltcHJvdmVtZW50IGFuYWx5c2lzXG4gICAgICAgIGxldCBlZGl0b3JPdXRwdXQ7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKGltcHJvdmVtZW50QW5hbHlzaXMpO1xuICAgICAgICAgICAgZWRpdG9yT3V0cHV0ID0ge1xuICAgICAgICAgICAgICAgIGVkaXRlZF9kcmFmdF9tYXJrZG93bjogcGFyc2VkLmVkaXRlZF9kcmFmdCB8fCBvcmlnaW5hbERyYWZ0LFxuICAgICAgICAgICAgICAgIGVkaXRvcl9ub3RlczogcGFyc2VkLm5vdGVzIHx8IFtdLFxuICAgICAgICAgICAgICAgIGNoYW5nZXNfbWFkZTogcGFyc2VkLmNoYW5nZXNfc3VtbWFyeSB8fCBbXSxcbiAgICAgICAgICAgICAgICBodW1hbl9yZXZpZXdfcmVxdWlyZWQ6IHRydWVcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gY2F0Y2ggIHtcbiAgICAgICAgICAgIC8vIEZhbGxiYWNrIGlmIHBhcnNpbmcgZmFpbHNcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgW3YwXSBFZGl0b3Igc3RlcDogRmFpbGVkIHRvIHBhcnNlIGVkaXRvciByZXNwb25zZSwgdXNpbmcgZmFsbGJhY2tgKTtcbiAgICAgICAgICAgIGVkaXRvck91dHB1dCA9IHtcbiAgICAgICAgICAgICAgICBlZGl0ZWRfZHJhZnRfbWFya2Rvd246IG9yaWdpbmFsRHJhZnQsXG4gICAgICAgICAgICAgICAgZWRpdG9yX25vdGVzOiBbXG4gICAgICAgICAgICAgICAgICAgICdFZGl0b3IgcHJvY2Vzc2luZyBjb21wbGV0ZWQgd2l0aCBmYWxsYmFjaydcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIGNoYW5nZXNfbWFkZTogW10sXG4gICAgICAgICAgICAgICAgaHVtYW5fcmV2aWV3X3JlcXVpcmVkOiB0cnVlXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIEVkaXRvciBzdGVwOiBHZW5lcmF0ZWQgZWRpdGVkIGRyYWZ0ICgke2VkaXRvck91dHB1dC5lZGl0ZWRfZHJhZnRfbWFya2Rvd24ubGVuZ3RofSBjaGFycylgKTtcbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gRWRpdG9yIHN0ZXA6ICR7ZWRpdG9yT3V0cHV0LmNoYW5nZXNfbWFkZS5sZW5ndGh9IGNoYW5nZXMgaWRlbnRpZmllZGApO1xuICAgICAgICByZXR1cm4gZWRpdG9yT3V0cHV0O1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgY29uc29sZS5lcnJvcihgW3YwXSBFZGl0b3Igc3RlcCBlcnJvcjogJHtlcnJvck1lc3NhZ2V9YCk7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbn1cbi8qKlxuICogQnVpbGQgY29udGV4dCBmb3IgZWRpdG9yIGJhc2VkIG9uIFNFTyBRQSBmaW5kaW5nc1xuICovIGZ1bmN0aW9uIGJ1aWxkRWRpdG9yQ29udGV4dChpbnB1dCwgcmVzZWFyY2gsIG91dGxpbmUsIHNlb1FhKSB7XG4gICAgY29uc3Qgc2VjdGlvbnMgPSBbXTtcbiAgICBzZWN0aW9ucy5wdXNoKCcjIyBTRU8gUGVyZm9ybWFuY2UgU3VtbWFyeScpO1xuICAgIHNlY3Rpb25zLnB1c2goYE92ZXJhbGwgU2NvcmU6ICR7c2VvUWEub3ZlcmFsbF9zY29yZX0vMTAwYCk7XG4gICAgc2VjdGlvbnMucHVzaCgnXFxuIyMgU2VhcmNoIEludGVudCBBbGlnbm1lbnQnKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBTY29yZTogJHtzZW9RYS5zZWFyY2hfaW50ZW50X2FsaWdubWVudC5zY29yZX0vMTAwYCk7XG4gICAgc2VjdGlvbnMucHVzaChgQW5hbHlzaXM6ICR7c2VvUWEuc2VhcmNoX2ludGVudF9hbGlnbm1lbnQuYW5hbHlzaXN9YCk7XG4gICAgc2VjdGlvbnMucHVzaCgnXFxuIyMgUHJpbWFyeSBLZXl3b3JkIFVzYWdlJyk7XG4gICAgc2VjdGlvbnMucHVzaChgU2NvcmU6ICR7c2VvUWEucHJpbWFyeV9rZXl3b3JkX3VzYWdlLnNjb3JlfS8xMDBgKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBPY2N1cnJlbmNlczogJHtzZW9RYS5wcmltYXJ5X2tleXdvcmRfdXNhZ2Uub2NjdXJyZW5jZXN9IHRpbWVzYCk7XG4gICAgc2VjdGlvbnMucHVzaChgUGxhY2VtZW50OiAke3Nlb1FhLnByaW1hcnlfa2V5d29yZF91c2FnZS5wbGFjZW1lbnRfYW5hbHlzaXN9YCk7XG4gICAgc2VjdGlvbnMucHVzaCgnXFxuIyMgU2Vjb25kYXJ5IEtleXdvcmRzJyk7XG4gICAgc2VjdGlvbnMucHVzaChgU2NvcmU6ICR7c2VvUWEuc2Vjb25kYXJ5X2tleXdvcmRfdXNhZ2Uuc2NvcmV9LzEwMGApO1xuICAgIHNlY3Rpb25zLnB1c2goYENvdmVyZWQ6ICR7c2VvUWEuc2Vjb25kYXJ5X2tleXdvcmRfdXNhZ2Uua2V5d29yZHNfY292ZXJlZC5qb2luKCcsICcpfWApO1xuICAgIGlmIChzZW9RYS5zZWNvbmRhcnlfa2V5d29yZF91c2FnZS5nYXBzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgc2VjdGlvbnMucHVzaChgR2FwczogJHtzZW9RYS5zZWNvbmRhcnlfa2V5d29yZF91c2FnZS5nYXBzLmpvaW4oJywgJyl9YCk7XG4gICAgfVxuICAgIHNlY3Rpb25zLnB1c2goJ1xcbiMjIEhlYWRpbmcgU3RydWN0dXJlJyk7XG4gICAgc2VjdGlvbnMucHVzaChgU2NvcmU6ICR7c2VvUWEuaGVhZGluZ19zdHJ1Y3R1cmVfcmV2aWV3LnNjb3JlfS8xMDBgKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBIMSBQcmVzZW50OiAke3Nlb1FhLmhlYWRpbmdfc3RydWN0dXJlX3Jldmlldy5oMV9wcmVzZW50fWApO1xuICAgIHNlY3Rpb25zLnB1c2goYEgyIENvdW50OiAke3Nlb1FhLmhlYWRpbmdfc3RydWN0dXJlX3Jldmlldy5oMl9jb3VudH1gKTtcbiAgICBpZiAoc2VvUWEuaGVhZGluZ19zdHJ1Y3R1cmVfcmV2aWV3LmhpZXJhcmNoeV9pc3N1ZXMubGVuZ3RoID4gMCkge1xuICAgICAgICBzZWN0aW9ucy5wdXNoKGBJc3N1ZXM6ICR7c2VvUWEuaGVhZGluZ19zdHJ1Y3R1cmVfcmV2aWV3LmhpZXJhcmNoeV9pc3N1ZXMuam9pbignOyAnKX1gKTtcbiAgICB9XG4gICAgc2VjdGlvbnMucHVzaCgnXFxuIyMgQ29udGVudCBEZXB0aCcpO1xuICAgIHNlY3Rpb25zLnB1c2goYFNjb3JlOiAke3Nlb1FhLmNvbnRlbnRfZGVwdGhfcmV2aWV3LnNjb3JlfS8xMDBgKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBXb3JkIENvdW50OiAke3Nlb1FhLmNvbnRlbnRfZGVwdGhfcmV2aWV3LndvcmRfY291bnR9IHdvcmRzYCk7XG4gICAgc2VjdGlvbnMucHVzaChgQ292ZXJhZ2U6ICR7c2VvUWEuY29udGVudF9kZXB0aF9yZXZpZXcuc2VjdGlvbl9jb3ZlcmFnZX1gKTtcbiAgICBpZiAoc2VvUWEuY29udGVudF9kZXB0aF9yZXZpZXcuZGVwdGhfaXNzdWVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgc2VjdGlvbnMucHVzaChgSXNzdWVzOiAke3Nlb1FhLmNvbnRlbnRfZGVwdGhfcmV2aWV3LmRlcHRoX2lzc3Vlcy5qb2luKCc7ICcpfWApO1xuICAgIH1cbiAgICBzZWN0aW9ucy5wdXNoKCdcXG4jIyBSZWFkYWJpbGl0eScpO1xuICAgIHNlY3Rpb25zLnB1c2goYFNjb3JlOiAke3Nlb1FhLnJlYWRhYmlsaXR5X3Jldmlldy5zY29yZX0vMTAwYCk7XG4gICAgc2VjdGlvbnMucHVzaChgQXZnIFNlbnRlbmNlIExlbmd0aDogJHtzZW9RYS5yZWFkYWJpbGl0eV9yZXZpZXcuYXZnX3NlbnRlbmNlX2xlbmd0aH0gd29yZHNgKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBSZWFkaW5nIExldmVsOiAke3Nlb1FhLnJlYWRhYmlsaXR5X3Jldmlldy5mbGVzY2hfa2luY2FpZF9lc3RpbWF0ZX1gKTtcbiAgICBpZiAoc2VvUWEucmVhZGFiaWxpdHlfcmV2aWV3LnJlYWRhYmlsaXR5X2lzc3Vlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHNlY3Rpb25zLnB1c2goYElzc3VlczogJHtzZW9RYS5yZWFkYWJpbGl0eV9yZXZpZXcucmVhZGFiaWxpdHlfaXNzdWVzLmpvaW4oJzsgJyl9YCk7XG4gICAgfVxuICAgIHNlY3Rpb25zLnB1c2goJ1xcbiMjIEludGVybmFsIExpbmtpbmcnKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBTY29yZTogJHtzZW9RYS5pbnRlcm5hbF9saW5raW5nX3Jldmlldy5zY29yZX0vMTAwYCk7XG4gICAgc2VjdGlvbnMucHVzaChgTGlua3MgRm91bmQ6ICR7c2VvUWEuaW50ZXJuYWxfbGlua2luZ19yZXZpZXcuaW50ZXJuYWxfbGlua3NfZm91bmR9YCk7XG4gICAgaWYgKHNlb1FhLmludGVybmFsX2xpbmtpbmdfcmV2aWV3LmludGVybmFsX2xpbmtfcmVjb21tZW5kYXRpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgc2VjdGlvbnMucHVzaChgUmVjb21tZW5kYXRpb25zOiAke3Nlb1FhLmludGVybmFsX2xpbmtpbmdfcmV2aWV3LmludGVybmFsX2xpbmtfcmVjb21tZW5kYXRpb25zLmpvaW4oJzsgJyl9YCk7XG4gICAgfVxuICAgIHNlY3Rpb25zLnB1c2goJ1xcbiMjIENUQSAmIEJyYW5kIEd1aWRlbGluZXMnKTtcbiAgICBpZiAoaW5wdXQuY3RhX25vdGVzKSB7XG4gICAgICAgIHNlY3Rpb25zLnB1c2goYENUQSBOb3RlczogJHtpbnB1dC5jdGFfbm90ZXN9YCk7XG4gICAgfVxuICAgIGlmIChpbnB1dC5icmFuZF92b2ljZV9ub3Rlcykge1xuICAgICAgICBzZWN0aW9ucy5wdXNoKGBCcmFuZCBWb2ljZTogJHtpbnB1dC5icmFuZF92b2ljZV9ub3Rlc31gKTtcbiAgICB9XG4gICAgaWYgKGlucHV0LmF1ZGllbmNlX25vdGVzKSB7XG4gICAgICAgIHNlY3Rpb25zLnB1c2goYFRhcmdldCBBdWRpZW5jZTogJHtpbnB1dC5hdWRpZW5jZV9ub3Rlc31gKTtcbiAgICB9XG4gICAgcmV0dXJuIHNlY3Rpb25zLmpvaW4oJ1xcbicpO1xufVxucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvZWRpdG9yLXN0ZXAvL3J1bkVkaXRvclN0ZXBcIiwgcnVuRWRpdG9yU3RlcCk7XG4iLCAiaW1wb3J0IHsgcmVnaXN0ZXJTdGVwRnVuY3Rpb24gfSBmcm9tIFwid29ya2Zsb3cvaW50ZXJuYWwvcHJpdmF0ZVwiO1xuaW1wb3J0ICdzZXJ2ZXItb25seSc7XG5pbXBvcnQgeyB1cGRhdGVSdW5TdGF0dXMsIHVwZGF0ZVJ1bkVycm9yLCBjb21wbGV0ZVJ1biB9IGZyb20gJy4uLy4uL3N0b3JhZ2UvcnVucyc7XG4vKipfX2ludGVybmFsX3dvcmtmbG93c3tcInN0ZXBzXCI6e1wibGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9oZWxwZXJzLnRzXCI6e1wiY29tcGxldGVSdW5TdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvaGVscGVycy8vY29tcGxldGVSdW5TdGVwXCJ9LFwibWFya1J1bkZhaWxlZFN0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9oZWxwZXJzLy9tYXJrUnVuRmFpbGVkU3RlcFwifSxcIm1hcmtSdW5SdW5uaW5nU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL2hlbHBlcnMvL21hcmtSdW5SdW5uaW5nU3RlcFwifX19fSovO1xuLyoqXG4gKiBNYXJrIGEgcnVuIGFzIHJ1bm5pbmcgKHRyYW5zaXRpb24gZnJvbSBxdWV1ZWQgdG8gcnVubmluZylcbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gbWFya1J1blJ1bm5pbmdTdGVwKHJ1bklkKSB7XG4gICAgY29uc29sZS5sb2coYFt2MF0gSGVscGVyOiBNYXJraW5nIHJ1biAke3J1bklkfSBhcyBydW5uaW5nYCk7XG4gICAgYXdhaXQgdXBkYXRlUnVuU3RhdHVzKHJ1bklkLCAncmVzZWFyY2hpbmcnKTtcbn1cbi8qKlxuICogTWFyayBhIHJ1biBhcyBmYWlsZWQgd2l0aCBlcnJvciBtZXNzYWdlXG4gKiBDYWxsYmFjayBpcyBzZW50IGJ5IHdvcmtmbG93IG9yY2hlc3RyYXRvciwgbm90IGhlcmVcbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gbWFya1J1bkZhaWxlZFN0ZXAocnVuSWQsIGVycm9yTWVzc2FnZSkge1xuICAgIGNvbnNvbGUubG9nKGBbdjBdIEhlbHBlcjogTWFya2luZyBydW4gJHtydW5JZH0gYXMgZmFpbGVkIHdpdGggZXJyb3I6ICR7ZXJyb3JNZXNzYWdlfWApO1xuICAgIGF3YWl0IHVwZGF0ZVJ1bkVycm9yKHJ1bklkLCBlcnJvck1lc3NhZ2UpO1xufVxuLyoqXG4gKiBDb21wbGV0ZSBhIHJ1biB3aXRoIGZpbmFsIG91dHB1dFxuICogQ2FsbGJhY2sgaXMgc2VudCBieSB3b3JrZmxvdyBvcmNoZXN0cmF0b3IsIG5vdCBoZXJlXG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNvbXBsZXRlUnVuU3RlcChydW5JZCwgZmluYWxPdXRwdXQpIHtcbiAgICBjb25zb2xlLmxvZyhgW3YwXSBIZWxwZXI6IENvbXBsZXRpbmcgcnVuICR7cnVuSWR9YCk7XG4gICAgYXdhaXQgY29tcGxldGVSdW4ocnVuSWQsIGZpbmFsT3V0cHV0KTtcbn1cbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL2hlbHBlcnMvL21hcmtSdW5SdW5uaW5nU3RlcFwiLCBtYXJrUnVuUnVubmluZ1N0ZXApO1xucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvaGVscGVycy8vbWFya1J1bkZhaWxlZFN0ZXBcIiwgbWFya1J1bkZhaWxlZFN0ZXApO1xucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvaGVscGVycy8vY29tcGxldGVSdW5TdGVwXCIsIGNvbXBsZXRlUnVuU3RlcCk7XG4iLCAiaW1wb3J0IHsgcmVnaXN0ZXJTdGVwRnVuY3Rpb24gfSBmcm9tIFwid29ya2Zsb3cvaW50ZXJuYWwvcHJpdmF0ZVwiO1xuaW1wb3J0ICdzZXJ2ZXItb25seSc7XG5pbXBvcnQgeyBnZW5lcmF0ZVRleHQgfSBmcm9tICdhaSc7XG5pbXBvcnQgeyBvcGVuYWkgfSBmcm9tICdAYWktc2RrL29wZW5haSc7XG5pbXBvcnQgeyBnZXRBZ2VudENvbmZpZyB9IGZyb20gJy4uLy4uL3N0b3JhZ2UvYWdlbnQtY29uZmlncyc7XG4vKipfX2ludGVybmFsX3dvcmtmbG93c3tcInN0ZXBzXCI6e1wibGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9tZXRhLXN0ZXAudHNcIjp7XCJydW5NZXRhU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL21ldGEtc3RlcC8vcnVuTWV0YVN0ZXBcIn19fX0qLztcbi8qKlxuICogTWV0YSBBZ2VudCBTdGVwIC0gUGhhc2UgMkMtRlxuICogR2VuZXJhdGVzIFNFTyBtZXRhZGF0YSBmb3IgaHVtYW4gcmV2aWV3XG4gKiBEb2VzIE5PVCBwdWJsaXNoLCBjYWxsIGV4dGVybmFsIHNlcnZpY2VzLCBvciBvdmVyd3JpdGUgZHJhZnRzXG4gKiBPdXRwdXQgZ29lcyB0byBmaW5hbF9vdXRwdXRfanNvbiBhcyBtZXRhX2pzb25cbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gcnVuTWV0YVN0ZXAocnVuSWQsIGlucHV0LCByZXNlYXJjaCwgb3V0bGluZSwgb3JpZ2luYWxEcmFmdCwgc2VvUWEsIGVkaXRlZERyYWZ0KSB7XG4gICAgY29uc29sZS5sb2coYFt2MF0gTWV0YSBzdGVwOiBTdGFydGluZyBmb3IgcnVuICR7cnVuSWR9YCk7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gTG9hZCBhZ2VudCBjb25maWcgZnJvbSBkYXRhYmFzZVxuICAgICAgICBjb25zdCBhZ2VudENvbmZpZyA9IGF3YWl0IGdldEFnZW50Q29uZmlnKCdtZXRhJyk7XG4gICAgICAgIGlmICghYWdlbnRDb25maWcpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQWN0aXZlIGFnZW50IGNvbmZpZyBub3QgZm91bmQgZm9yIGFnZW50X2tleTogbWV0YScpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFNFTyBCbG9nIEFnZW50IENvbmZpZyBMb2FkZWQ6IG1ldGEgdiR7YWdlbnRDb25maWcudmVyc2lvbn1gKTtcbiAgICAgICAgLy8gQnVpbGQgc3lzdGVtIHByb21wdCBmcm9tIGRhdGFiYXNlIGNvbmZpZ1xuICAgICAgICBjb25zdCBzeXN0ZW1Qcm9tcHQgPSBbXG4gICAgICAgICAgICBhZ2VudENvbmZpZy5zeXN0ZW1fcHJvbXB0LFxuICAgICAgICAgICAgYWdlbnRDb25maWcuc2tpbGxfbWFya2Rvd25cbiAgICAgICAgXS5maWx0ZXIoQm9vbGVhbikuam9pbignXFxuXFxuJyk7XG4gICAgICAgIC8vIEJ1aWxkIGNvbnRleHQgZm9yIG1ldGEgZ2VuZXJhdGlvblxuICAgICAgICBjb25zdCBtZXRhQ29udGV4dCA9IGJ1aWxkTWV0YUNvbnRleHQoaW5wdXQsIHJlc2VhcmNoLCBvdXRsaW5lLCBzZW9RYSwgb3JpZ2luYWxEcmFmdCwgZWRpdGVkRHJhZnQpO1xuICAgICAgICAvLyBHZXQgbW9kZWwgbmFtZTogdXNlIERCIGNvbmZpZyBpZiBhdmFpbGFibGUsIG90aGVyd2lzZSBmYWxsIGJhY2sgdG8gZW52IHZhciBvciBkZWZhdWx0XG4gICAgICAgIGNvbnN0IG1vZGVsTmFtZSA9IGFnZW50Q29uZmlnLm1vZGVsIHx8IHByb2Nlc3MuZW52Lk1FVEFfQUdFTlRfTU9ERUwgfHwgJ2dwdC01LjQtbWluaSc7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIE1ldGEgc3RlcDogVXNpbmcgbW9kZWw6ICR7bW9kZWxOYW1lfWApO1xuICAgICAgICAvLyBHZW5lcmF0ZSBtZXRhZGF0YVxuICAgICAgICBjb25zdCB7IHRleHQ6IG1ldGFBbmFseXNpcyB9ID0gYXdhaXQgZ2VuZXJhdGVUZXh0KHtcbiAgICAgICAgICAgIG1vZGVsOiBvcGVuYWkobW9kZWxOYW1lKSxcbiAgICAgICAgICAgIHN5c3RlbTogc3lzdGVtUHJvbXB0LFxuICAgICAgICAgICAgdGVtcGVyYXR1cmU6IDAuNSxcbiAgICAgICAgICAgIG1lc3NhZ2VzOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICByb2xlOiAndXNlcicsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IG1ldGFDb250ZXh0XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXVxuICAgICAgICB9KTtcbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gTWV0YSBzdGVwOiBSZWNlaXZlZCBhbmFseXNpcywgcGFyc2luZyBKU09OYCk7XG4gICAgICAgIC8vIFBhcnNlIHRoZSByZXNwb25zZVxuICAgICAgICBsZXQgbWV0YU91dHB1dDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIEV4dHJhY3QgSlNPTiBmcm9tIHJlc3BvbnNlIChtYXkgaGF2ZSBzdXJyb3VuZGluZyB0ZXh0KVxuICAgICAgICAgICAgY29uc3QganNvbk1hdGNoID0gbWV0YUFuYWx5c2lzLm1hdGNoKC9cXHtbXFxzXFxTXSpcXH0vKTtcbiAgICAgICAgICAgIGlmICghanNvbk1hdGNoKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBKU09OIGZvdW5kIGluIHJlc3BvbnNlJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBtZXRhT3V0cHV0ID0gSlNPTi5wYXJzZShqc29uTWF0Y2hbMF0pO1xuICAgICAgICB9IGNhdGNoIChwYXJzZUVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYFt2MF0gTWV0YSBzdGVwOiBGYWlsZWQgdG8gcGFyc2UgSlNPTiByZXNwb25zZSwgdXNpbmcgZmFsbGJhY2tgLCBwYXJzZUVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBwYXJzZUVycm9yLm1lc3NhZ2UgOiBTdHJpbmcocGFyc2VFcnJvcikpO1xuICAgICAgICAgICAgbWV0YU91dHB1dCA9IGdlbmVyYXRlRmFsbGJhY2tNZXRhKGlucHV0LCByZXNlYXJjaCwgc2VvUWEsIG9yaWdpbmFsRHJhZnQpO1xuICAgICAgICB9XG4gICAgICAgIC8vIFZhbGlkYXRlIHJlcXVpcmVkIGZpZWxkc1xuICAgICAgICBjb25zdCByZXF1aXJlZEZpZWxkcyA9IFtcbiAgICAgICAgICAgICdzZW9fdGl0bGUnLFxuICAgICAgICAgICAgJ21ldGFfZGVzY3JpcHRpb24nLFxuICAgICAgICAgICAgJ3N1Z2dlc3RlZF9zbHVnJyxcbiAgICAgICAgICAgICdwcmltYXJ5X2tleXdvcmQnLFxuICAgICAgICAgICAgJ3NlY29uZGFyeV9rZXl3b3Jkc191c2VkJyxcbiAgICAgICAgICAgICdleGNlcnB0JyxcbiAgICAgICAgICAgICdvZ190aXRsZScsXG4gICAgICAgICAgICAnb2dfZGVzY3JpcHRpb24nLFxuICAgICAgICAgICAgJ2Nhbm9uaWNhbF91cmxfc3VnZ2VzdGlvbicsXG4gICAgICAgICAgICAnc2NoZW1hX3R5cGVfc3VnZ2VzdGlvbicsXG4gICAgICAgICAgICAnaHVtYW5fcmV2aWV3X25vdGVzJ1xuICAgICAgICBdO1xuICAgICAgICBmb3IgKGNvbnN0IGZpZWxkIG9mIHJlcXVpcmVkRmllbGRzKXtcbiAgICAgICAgICAgIGlmIChtZXRhT3V0cHV0W2ZpZWxkXSA9PT0gdW5kZWZpbmVkIHx8IG1ldGFPdXRwdXRbZmllbGRdID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBbdjBdIE1ldGEgc3RlcDogTWlzc2luZyBmaWVsZCAke2ZpZWxkfSwgdXNpbmcgZmFsbGJhY2tgKTtcbiAgICAgICAgICAgICAgICBtZXRhT3V0cHV0ID0gZ2VuZXJhdGVGYWxsYmFja01ldGEoaW5wdXQsIHJlc2VhcmNoLCBzZW9RYSwgb3JpZ2luYWxEcmFmdCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gTWV0YSBzdGVwOiBDb21wbGV0ZSBmb3IgcnVuICR7cnVuSWR9YCwgYEdlbmVyYXRlZCBtZXRhZGF0YTogJHttZXRhT3V0cHV0LnNlb190aXRsZS5zdWJzdHJpbmcoMCwgNTApfS4uLmApO1xuICAgICAgICByZXR1cm4gbWV0YU91dHB1dDtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2MF0gTWV0YSBzdGVwIGVycm9yIGZvciBydW4gJHtydW5JZH06ICR7ZXJyb3JNZXNzYWdlfWApO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG59XG4vKipcbiAqIEJ1aWxkIGNvbnRleHQgcHJvbXB0IGZvciBtZXRhZGF0YSBnZW5lcmF0aW9uXG4gKi8gZnVuY3Rpb24gYnVpbGRNZXRhQ29udGV4dChpbnB1dCwgcmVzZWFyY2gsIG91dGxpbmUsIHNlb1FhLCBvcmlnaW5hbERyYWZ0LCBlZGl0ZWREcmFmdCkge1xuICAgIGNvbnN0IHdvcmRDb3VudCA9IGVkaXRlZERyYWZ0LnNwbGl0KC9cXHMrLykubGVuZ3RoO1xuICAgIGNvbnN0IGhlYWRpbmdzID0gZWRpdGVkRHJhZnQubWF0Y2goL14jK1xccysuKyQvZ20pIHx8IFtdO1xuICAgIHJldHVybiBgWW91IGFyZSBhbiBleHBlcnQgU0VPIG1ldGFkYXRhIHNwZWNpYWxpc3QuIEdlbmVyYXRlIFNFTyBtZXRhZGF0YSBmb3IgYSBibG9nIHBvc3QgZm9yIGh1bWFuIHJldmlldy5cblxuQkxPRyBUT1BJQzogJHtpbnB1dC5ibG9nX3RvcGljfVxuQlVTSU5FU1MgTkFNRTogJHtpbnB1dC5idXNpbmVzc19uYW1lIHx8ICdOb3QgcHJvdmlkZWQnfVxuV0VCU0lURSBVUkw6ICR7aW5wdXQud2Vic2l0ZV91cmwgfHwgJ05vdCBwcm92aWRlZCd9XG5QUklNQVJZIEtFWVdPUkQ6ICR7aW5wdXQucHJpbWFyeV9rZXl3b3JkfVxuU0VDT05EQVJZIEtFWVdPUkRTOiAkeyhpbnB1dC5zZWNvbmRhcnlfa2V5d29yZHMgfHwgW10pLmpvaW4oJywgJykgfHwgJ05vbmUgcHJvdmlkZWQnfVxuVEFSR0VUIEFVRElFTkNFOiAke2lucHV0LmF1ZGllbmNlX25vdGVzIHx8ICdHZW5lcmFsIGF1ZGllbmNlJ31cblxuUkVTRUFSQ0ggU1VNTUFSWTpcbiR7cmVzZWFyY2gua2V5X2ZpbmRpbmdzLnNsaWNlKDAsIDMpLmpvaW4oJ1xcbicpfVxuXG5PVVRMSU5FIFNUUlVDVFVSRTpcbiR7b3V0bGluZS5zZWN0aW9ucy5tYXAoKHMpPT5gLSAke3MuaGVhZGluZ30gKCR7cy5zdWJzZWN0aW9ucz8ubGVuZ3RoIHx8IDB9IHN1YnNlY3Rpb25zKWApLmpvaW4oJ1xcbicpfVxuXG5TRU8gUUEgUkVWSUVXOlxuLSBPdmVyYWxsIFNjb3JlOiAke3Nlb1FhLm92ZXJhbGxfc2NvcmV9XG4tIFNlYXJjaCBJbnRlbnQgQWxpZ25tZW50OiAke3Nlb1FhLnNlYXJjaF9pbnRlbnRfYWxpZ25tZW50fVxuLSBLZXl3b3JkIFVzYWdlOiAke3Nlb1FhLmtleXdvcmRfdXNhZ2VfYXNzZXNzbWVudH1cbi0gSGVhZGluZyBTdHJ1Y3R1cmU6ICR7c2VvUWEuaGVhZGluZ19zdHJ1Y3R1cmVfYXNzZXNzbWVudH1cblxuQ09OVEVOVCBTVEFUUzpcbi0gV29yZCBDb3VudDogJHt3b3JkQ291bnR9XG4tIEhlYWRpbmdzOiAke2hlYWRpbmdzLmxlbmd0aH1cbi0gSGFzIENUQTogJHtpbnB1dC5jdGFfbm90ZXMgPyAnWWVzJyA6ICdObyd9XG4tIEhhcyBJbnRlcm5hbCBMaW5rczogJHtpbnB1dC5pbnRlcm5hbF9saW5rX25vdGVzID8gJ1llcycgOiAnTm8nfVxuXG5HZW5lcmF0ZSBtZXRhZGF0YSB0aGF0OlxuMS4gQWNjdXJhdGVseSByZXByZXNlbnRzIHRoZSBibG9nIGNvbnRlbnQgKGRvIG5vdCBpbnZlbnQgY2xhaW1zKVxuMi4gSW5jbHVkZXMgdGhlIHByaW1hcnkga2V5d29yZCBuYXR1cmFsbHkgaW4gdGl0bGUgYW5kIGRlc2NyaXB0aW9uXG4zLiBJcyBTRU8tb3B0aW1pemVkIGZvciBzZWFyY2ggZW5naW5lc1xuNC4gSXMgY29tcGVsbGluZyBmb3IgaHVtYW4gcmVhZGVycyBhbmQgQ1RSXG41LiBGb2xsb3dzIGJlc3QgcHJhY3RpY2VzICh0aXRsZSBtYXggNjAgY2hhcnMsIGRlc2NyaXB0aW9uIG1heCAxNjAgY2hhcnMpXG42LiBJbmNsdWRlcyByZXZpZXcgbm90ZXMgZm9yIHRoZSBodW1hbiBlZGl0b3JcblxuUmV0dXJuIGEgSlNPTiBvYmplY3Qgd2l0aCB0aGVzZSBleGFjdCBmaWVsZHM6XG57XG4gIFwic2VvX3RpdGxlXCI6IFwiU0VPLW9wdGltaXplZCB0aXRsZSAobWF4IDYwIGNoYXJzKVwiLFxuICBcIm1ldGFfZGVzY3JpcHRpb25cIjogXCJDb21wZWxsaW5nIGRlc2NyaXB0aW9uIChtYXggMTYwIGNoYXJzKVwiLFxuICBcInN1Z2dlc3RlZF9zbHVnXCI6IFwidXJsLXNsdWctZm9ybWF0XCIsXG4gIFwicHJpbWFyeV9rZXl3b3JkXCI6IFwiJHtpbnB1dC5wcmltYXJ5X2tleXdvcmR9XCIsXG4gIFwic2Vjb25kYXJ5X2tleXdvcmRzX3VzZWRcIjogW1wia2V5d29yZDFcIiwgXCJrZXl3b3JkMlwiXSxcbiAgXCJleGNlcnB0XCI6IFwiQnJpZWYgc3VtbWFyeSBmb3IgYmxvZyBsaXN0aW5ncyAobWF4IDE1NSBjaGFycylcIixcbiAgXCJvZ190aXRsZVwiOiBcIk9wZW5HcmFwaCB0aXRsZSBmb3Igc29jaWFsIHNoYXJpbmdcIixcbiAgXCJvZ19kZXNjcmlwdGlvblwiOiBcIk9wZW5HcmFwaCBkZXNjcmlwdGlvbiBmb3Igc29jaWFsIHNoYXJpbmdcIixcbiAgXCJjYW5vbmljYWxfdXJsX3N1Z2dlc3Rpb25cIjogXCJodHRwczovL2V4YW1wbGUuY29tL2Jsb2cvdXJsLXNsdWcgb3IgbGVhdmUgYXMgbnVsbCBpZiB3ZWJzaXRlX3VybCBub3QgcHJvdmlkZWRcIixcbiAgXCJzY2hlbWFfdHlwZV9zdWdnZXN0aW9uXCI6IFwiQmxvZ1Bvc3Rpbmcgb3IgTmV3c0FydGljbGVcIixcbiAgXCJodW1hbl9yZXZpZXdfbm90ZXNcIjogW1wibm90ZTFcIiwgXCJub3RlMlwiXVxufWA7XG59XG4vKipcbiAqIEdlbmVyYXRlIGZhbGxiYWNrIG1ldGFkYXRhIGlmIEFJIHBhcnNpbmcgZmFpbHNcbiAqLyBmdW5jdGlvbiBnZW5lcmF0ZUZhbGxiYWNrTWV0YShpbnB1dCwgcmVzZWFyY2gsIHNlb1FhLCBkcmFmdCkge1xuICAgIGNvbnN0IHByaW1hcnlLZXl3b3JkID0gaW5wdXQucHJpbWFyeV9rZXl3b3JkIHx8ICdibG9nIHBvc3QnO1xuICAgIGNvbnN0IHNsdWcgPSBpbnB1dC5ibG9nX3RvcGljLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvW15hLXowLTldKy9nLCAnLScpLnJlcGxhY2UoL14tfC0kL2csICcnKTtcbiAgICBjb25zdCB3b3JkQ291bnQgPSBkcmFmdC5zcGxpdCgvXFxzKy8pLmxlbmd0aDtcbiAgICByZXR1cm4ge1xuICAgICAgICBzZW9fdGl0bGU6IGAke2lucHV0LmJsb2dfdG9waWN9IC0gJHtpbnB1dC5idXNpbmVzc19uYW1lIHx8ICdCbG9nJ31gLFxuICAgICAgICBtZXRhX2Rlc2NyaXB0aW9uOiBgQ29tcHJlaGVuc2l2ZSBndWlkZSB0byAke2lucHV0LmJsb2dfdG9waWMudG9Mb3dlckNhc2UoKX0uIFJlc2VhcmNoLWJhY2tlZCBpbnNpZ2h0cyBhbmQgcHJhY3RpY2FsIHN0cmF0ZWdpZXMuICR7d29yZENvdW50fSB3b3Jkcy5gLFxuICAgICAgICBzdWdnZXN0ZWRfc2x1Zzogc2x1ZyxcbiAgICAgICAgcHJpbWFyeV9rZXl3b3JkOiBwcmltYXJ5S2V5d29yZCxcbiAgICAgICAgc2Vjb25kYXJ5X2tleXdvcmRzX3VzZWQ6IGlucHV0LnNlY29uZGFyeV9rZXl3b3JkcyB8fCBbXSxcbiAgICAgICAgZXhjZXJwdDogYExlYXJuIGFib3V0ICR7aW5wdXQuYmxvZ190b3BpYy50b0xvd2VyQ2FzZSgpfSB3aXRoIGluc2lnaHRzIGZyb20gb3VyIHJlc2VhcmNoLiAke3dvcmRDb3VudH0td29yZCBndWlkZSBjb3ZlcmluZyBrZXkgYXNwZWN0cyBhbmQgc3RyYXRlZ2llcy5gLFxuICAgICAgICBvZ190aXRsZTogYCR7aW5wdXQuYmxvZ190b3BpY30gfCAke2lucHV0LmJ1c2luZXNzX25hbWUgfHwgJ0Jsb2cnfWAsXG4gICAgICAgIG9nX2Rlc2NyaXB0aW9uOiBgRGlzY292ZXIgJHtpbnB1dC5ibG9nX3RvcGljLnRvTG93ZXJDYXNlKCl9LiBDb21wcmVoZW5zaXZlIGd1aWRlIHdpdGggcmVzZWFyY2ggYW5kIGluc2lnaHRzLmAsXG4gICAgICAgIGNhbm9uaWNhbF91cmxfc3VnZ2VzdGlvbjogaW5wdXQud2Vic2l0ZV91cmwgPyBgJHtpbnB1dC53ZWJzaXRlX3VybH0vYmxvZy8ke3NsdWd9YCA6IG51bGwsXG4gICAgICAgIHNjaGVtYV90eXBlX3N1Z2dlc3Rpb246ICdCbG9nUG9zdGluZycsXG4gICAgICAgIGh1bWFuX3Jldmlld19ub3RlczogW1xuICAgICAgICAgICAgYE92ZXJhbGwgU0VPIFNjb3JlOiAke3Nlb1FhLm92ZXJhbGxfc2NvcmV9YCxcbiAgICAgICAgICAgICdSZXZpZXcgYW5kIGFkanVzdCBtZXRhZGF0YSBhcyBuZWVkZWQgZm9yIHlvdXIgYnJhbmQgdm9pY2UnLFxuICAgICAgICAgICAgJ0Vuc3VyZSBTRU8gdGl0bGUgYW5kIG1ldGEgZGVzY3JpcHRpb24gYXJlIGNvbXBlbGxpbmcgZm9yIENUUicsXG4gICAgICAgICAgICAnVmVyaWZ5IGNhbm9uaWNhbCBVUkwgbWF0Y2hlcyB5b3VyIHNpdGUgc3RydWN0dXJlJyxcbiAgICAgICAgICAgICdDaGVjayB0aGF0IHNjaGVtYSB0eXBlIG1hdGNoZXMgeW91ciBjb250ZW50IGZvcm1hdCdcbiAgICAgICAgXVxuICAgIH07XG59XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9tZXRhLXN0ZXAvL3J1bk1ldGFTdGVwXCIsIHJ1bk1ldGFTdGVwKTtcbiIsICJpbXBvcnQgeyByZWdpc3RlclN0ZXBGdW5jdGlvbiB9IGZyb20gXCJ3b3JrZmxvdy9pbnRlcm5hbC9wcml2YXRlXCI7XG5pbXBvcnQgJ3NlcnZlci1vbmx5JztcbmltcG9ydCB7IGdlbmVyYXRlVGV4dCB9IGZyb20gJ2FpJztcbmltcG9ydCB7IG9wZW5haSB9IGZyb20gJ0BhaS1zZGsvb3BlbmFpJztcbmltcG9ydCB7IHVwZGF0ZVJ1blN0YXR1cyB9IGZyb20gJy4uLy4uL3N0b3JhZ2UvcnVucyc7XG5pbXBvcnQgeyBnZXRBZ2VudENvbmZpZyB9IGZyb20gJy4uLy4uL3N0b3JhZ2UvYWdlbnQtY29uZmlncyc7XG4vKipfX2ludGVybmFsX3dvcmtmbG93c3tcInN0ZXBzXCI6e1wibGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9vdXRsaW5lLXN0ZXAudHNcIjp7XCJydW5PdXRsaW5lU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL291dGxpbmUtc3RlcC8vcnVuT3V0bGluZVN0ZXBcIn19fX0qLztcbi8qKlxuICogT3V0bGluZSBTdGVwIC0gUGhhc2UgMkMtQlxuICogUnVucyBpbnNpZGUgYSBkdXJhYmxlIHN0ZXAgZnVuY3Rpb24gKGhhcyBOb2RlLmpzIGFjY2VzcylcbiAqIENhbGxzIEFJIG1vZGVsIHRvIGdlbmVyYXRlIGNvbnRlbnQgb3V0bGluZSB3aXRoIHN0cnVjdHVyZVxuICogVXNlcyByZXNlYXJjaCBkYXRhIGlmIGF2YWlsYWJsZSB0byBpbmZvcm0gb3V0bGluZVxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5PdXRsaW5lU3RlcChydW5JZCwgaW5wdXQsIHJlc2VhcmNoRGF0YSkge1xuICAgIGNvbnNvbGUubG9nKGBbdjBdIE91dGxpbmUgc3RlcDogQ3JlYXRpbmcgb3V0bGluZSBmb3IgcnVuICR7cnVuSWR9YCk7XG4gICAgLy8gQ3JlYXRlIGNvbnRleHQgZnJvbSBhdmFpbGFibGUgZGF0YSAobmVlZGVkIGZvciBmYWxsYmFjayBpbiBjYXRjaCBibG9jaylcbiAgICBjb25zdCB0b3BpYyA9IGlucHV0LmJsb2dfdG9waWMgfHwgaW5wdXQudG9waWMgfHwgJ1lvdXIgVG9waWMnO1xuICAgIGNvbnN0IHByaW1hcnlLZXl3b3JkID0gaW5wdXQucHJpbWFyeV9rZXl3b3JkIHx8ICdwcmltYXJ5IGtleXdvcmQnO1xuICAgIGNvbnN0IHNlY29uZGFyeUtleXdvcmRzID0gKGlucHV0LnNlY29uZGFyeV9rZXl3b3JkcyB8fCBpbnB1dC5rZXl3b3JkcyB8fCBbXSkuam9pbignLCAnKSB8fCAnc2Vjb25kYXJ5IGtleXdvcmRzJztcbiAgICBjb25zdCBidXNpbmVzc05hbWUgPSBpbnB1dC5idXNpbmVzc19uYW1lIHx8ICdZb3VyIEJ1c2luZXNzJztcbiAgICBjb25zdCBhdWRpZW5jZU5vdGVzID0gaW5wdXQuYXVkaWVuY2Vfbm90ZXMgfHwgJ1RhcmdldCBhdWRpZW5jZSBub3Qgc3BlY2lmaWVkJztcbiAgICBjb25zdCBicmFuZFZvaWNlID0gaW5wdXQuYnJhbmRfdm9pY2Vfbm90ZXMgfHwgJ1Byb2Zlc3Npb25hbCBhbmQgY2xlYXInO1xuICAgIGNvbnN0IGN0YU5vdGVzID0gaW5wdXQuY3RhX25vdGVzIHx8ICdFbmNvdXJhZ2UgZW5nYWdlbWVudCc7XG4gICAgY29uc3QgYWRkaXRpb25hbE5vdGVzID0gaW5wdXQuYWRkaXRpb25hbF9vcmRlcl9ub3RlcyB8fCAnTm8gYWRkaXRpb25hbCBub3Rlcyc7XG4gICAgY29uc3QgdGFyZ2V0V29yZENvdW50ID0gaW5wdXQudGFyZ2V0X3dvcmRfY291bnQgfHwgMTUwMDtcbiAgICB0cnkge1xuICAgICAgICAvLyBMb2FkIGFnZW50IGNvbmZpZyBmcm9tIGRhdGFiYXNlXG4gICAgICAgIGNvbnN0IGFnZW50Q29uZmlnID0gYXdhaXQgZ2V0QWdlbnRDb25maWcoJ291dGxpbmUnKTtcbiAgICAgICAgaWYgKCFhZ2VudENvbmZpZykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBY3RpdmUgYWdlbnQgY29uZmlnIG5vdCBmb3VuZCBmb3IgYWdlbnRfa2V5OiBvdXRsaW5lJyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gU0VPIEJsb2cgQWdlbnQgQ29uZmlnIExvYWRlZDogb3V0bGluZSB2JHthZ2VudENvbmZpZy52ZXJzaW9ufWApO1xuICAgICAgICAvLyBCdWlsZCBzeXN0ZW0gcHJvbXB0IGZyb20gZGF0YWJhc2UgY29uZmlnXG4gICAgICAgIGNvbnN0IHN5c3RlbVByb21wdCA9IFtcbiAgICAgICAgICAgIGFnZW50Q29uZmlnLnN5c3RlbV9wcm9tcHQsXG4gICAgICAgICAgICBhZ2VudENvbmZpZy5za2lsbF9tYXJrZG93blxuICAgICAgICBdLmZpbHRlcihCb29sZWFuKS5qb2luKCdcXG5cXG4nKTtcbiAgICAgICAgLy8gSW5jbHVkZSByZXNlYXJjaCBpbnNpZ2h0cyBpZiBhdmFpbGFibGVcbiAgICAgICAgbGV0IHJlc2VhcmNoQ29udGV4dCA9ICcnO1xuICAgICAgICBpZiAocmVzZWFyY2hEYXRhKSB7XG4gICAgICAgICAgICByZXNlYXJjaENvbnRleHQgPSBgXG5cblJlc2VhcmNoIEluc2lnaHRzIGZyb20gUmVzZWFyY2ggQWdlbnQ6XG4tIFNlYXJjaCBJbnRlbnQ6ICR7cmVzZWFyY2hEYXRhLnNlYXJjaF9pbnRlbnQgfHwgJ04vQSd9XG4tIENvbnRlbnQgQW5nbGU6ICR7cmVzZWFyY2hEYXRhLmNvbnRlbnRfYW5nbGUgfHwgJ04vQSd9XG4tIFRhcmdldCBBdWRpZW5jZTogJHtyZXNlYXJjaERhdGEudGFyZ2V0X2F1ZGllbmNlX3N1bW1hcnkgfHwgJ04vQSd9XG4tIFJlY29tbWVuZGVkIFNlY3Rpb25zOiAke3Jlc2VhcmNoRGF0YS5yZWNvbW1lbmRlZF9zZWN0aW9ucz8uam9pbignLCAnKSB8fCAnTi9BJ31cbi0gUXVlc3Rpb25zIHRvIEFuc3dlcjogJHtyZXNlYXJjaERhdGEucXVlc3Rpb25zX3RvX2Fuc3dlcj8uam9pbignLCAnKSB8fCAnTi9BJ31gO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHVzZXJNZXNzYWdlID0gYENyZWF0ZSBhbiBvdXRsaW5lIGZvciB0aGlzIGFydGljbGU6XG5cblRvcGljOiAke3RvcGljfVxuQnVzaW5lc3M6ICR7YnVzaW5lc3NOYW1lfVxuUHJpbWFyeSBLZXl3b3JkOiAke3ByaW1hcnlLZXl3b3JkfVxuU2Vjb25kYXJ5IEtleXdvcmRzOiAke3NlY29uZGFyeUtleXdvcmRzfVxuVGFyZ2V0IFdvcmQgQ291bnQ6ICR7dGFyZ2V0V29yZENvdW50fVxuXG5BdWRpZW5jZSBQcm9maWxlOlxuJHthdWRpZW5jZU5vdGVzfVxuXG5CcmFuZCBWb2ljZTpcbiR7YnJhbmRWb2ljZX1cblxuQ2FsbC10by1BY3Rpb24gRm9jdXM6XG4ke2N0YU5vdGVzfVxuXG5BZGRpdGlvbmFsIFJlcXVpcmVtZW50czpcbiR7YWRkaXRpb25hbE5vdGVzfSR7cmVzZWFyY2hDb250ZXh0fWA7XG4gICAgICAgIC8vIEdldCBtb2RlbCBuYW1lOiB1c2UgREIgY29uZmlnIGlmIGF2YWlsYWJsZSwgb3RoZXJ3aXNlIGZhbGwgYmFjayB0byBlbnYgdmFyIG9yIGRlZmF1bHRcbiAgICAgICAgY29uc3QgbW9kZWxOYW1lID0gYWdlbnRDb25maWcubW9kZWwgfHwgcHJvY2Vzcy5lbnYuT1VUTElORV9BR0VOVF9NT0RFTCB8fCBwcm9jZXNzLmVudi5SRVNFQVJDSF9BR0VOVF9NT0RFTCB8fCAnZ3B0LTUuNC1taW5pJztcbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gT3V0bGluZSBzdGVwOiBVc2luZyBtb2RlbDogJHttb2RlbE5hbWV9YCk7XG4gICAgICAgIC8vIFVzZSBkaXJlY3QgT3BlbkFJIHByb3ZpZGVyXG4gICAgICAgIGNvbnN0IG1vZGVsID0gb3BlbmFpKG1vZGVsTmFtZSk7XG4gICAgICAgIC8vIENhbGwgQUkgbW9kZWxcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBnZW5lcmF0ZVRleHQoe1xuICAgICAgICAgICAgbW9kZWwsXG4gICAgICAgICAgICBzeXN0ZW06IHN5c3RlbVByb21wdCxcbiAgICAgICAgICAgIHByb21wdDogdXNlck1lc3NhZ2UsXG4gICAgICAgICAgICB0ZW1wZXJhdHVyZTogMC43XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBPdXRsaW5lIHN0ZXA6IFJhdyByZXNwb25zZSBsZW5ndGg6ICR7cmVzcG9uc2UudGV4dC5sZW5ndGh9YCk7XG4gICAgICAgIC8vIFBhcnNlIHRoZSBKU09OIHJlc3BvbnNlXG4gICAgICAgIGNvbnN0IG91dGxpbmVEYXRhID0gSlNPTi5wYXJzZShyZXNwb25zZS50ZXh0KTtcbiAgICAgICAgLy8gVmFsaWRhdGUgcmVxdWlyZWQgZmllbGRzIGFuZCBhZGQgZGVmYXVsdHNcbiAgICAgICAgb3V0bGluZURhdGEudGltZXN0YW1wID0gb3V0bGluZURhdGEudGltZXN0YW1wIHx8IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICAgICAgb3V0bGluZURhdGEudGFyZ2V0X3dvcmRfY291bnQgPSBvdXRsaW5lRGF0YS50YXJnZXRfd29yZF9jb3VudCB8fCB0YXJnZXRXb3JkQ291bnQ7XG4gICAgICAgIC8vIEVuc3VyZSBzZWN0aW9ucyBhcnJheSBleGlzdHNcbiAgICAgICAgaWYgKCFvdXRsaW5lRGF0YS5zZWN0aW9ucyB8fCAhQXJyYXkuaXNBcnJheShvdXRsaW5lRGF0YS5zZWN0aW9ucykpIHtcbiAgICAgICAgICAgIG91dGxpbmVEYXRhLnNlY3Rpb25zID0gW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGluZzogJ0ludHJvZHVjdGlvbicsXG4gICAgICAgICAgICAgICAgICAgIHB1cnBvc2U6ICdJbnRyb2R1Y2UgdG9waWMgYW5kIHNldCBjb250ZXh0JyxcbiAgICAgICAgICAgICAgICAgICAgZXN0aW1hdGVkX3dvcmRzOiAxNTAsXG4gICAgICAgICAgICAgICAgICAgIGtleV9wb2ludHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICdUb3BpYyBvdmVydmlldycsXG4gICAgICAgICAgICAgICAgICAgICAgICAnV2h5IHRoaXMgbWF0dGVycydcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgc2VvX25vdGVzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAnSW5jbHVkZSBwcmltYXJ5IGtleXdvcmQgbmF0dXJhbGx5J1xuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGhlYWRpbmc6ICdNYWluIENvbnRlbnQnLFxuICAgICAgICAgICAgICAgICAgICBwdXJwb3NlOiAnRGV0YWlsZWQgZXhwbG9yYXRpb24gb2YgdG9waWMnLFxuICAgICAgICAgICAgICAgICAgICBlc3RpbWF0ZWRfd29yZHM6IDEwMDAsXG4gICAgICAgICAgICAgICAgICAgIGtleV9wb2ludHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICdLZXkgaW5zaWdodCAxJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdLZXkgaW5zaWdodCAyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdLZXkgaW5zaWdodCAzJ1xuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBzZW9fbm90ZXM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICdVc2Ugc2Vjb25kYXJ5IGtleXdvcmRzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdBbnN3ZXIgdXNlciBpbnRlbnQgcXVlc3Rpb25zJ1xuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGhlYWRpbmc6ICdDb25jbHVzaW9uJyxcbiAgICAgICAgICAgICAgICAgICAgcHVycG9zZTogJ1N1bW1hcml6ZSBhbmQgY2FsbCB0byBhY3Rpb24nLFxuICAgICAgICAgICAgICAgICAgICBlc3RpbWF0ZWRfd29yZHM6IDE1MCxcbiAgICAgICAgICAgICAgICAgICAga2V5X3BvaW50czogW1xuICAgICAgICAgICAgICAgICAgICAgICAgJ1N1bW1hcnkgb2Yga2V5IHBvaW50cycsXG4gICAgICAgICAgICAgICAgICAgICAgICAnQ2FsbCB0byBhY3Rpb24nXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIHNlb19ub3RlczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgJ1JlaW5mb3JjZSBwcmltYXJ5IGtleXdvcmQnXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIE91dGxpbmUgc3RlcDogR2VuZXJhdGVkIG91dGxpbmUgd2l0aCAke291dGxpbmVEYXRhLnNlY3Rpb25zLmxlbmd0aH0gc2VjdGlvbnNgKTtcbiAgICAgICAgLy8gUGVyc2lzdCBvdXRsaW5lX2pzb24gdG8gZGF0YWJhc2VcbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gT3V0bGluZSBzdGVwOiBQZXJzaXN0aW5nIG91dGxpbmVfanNvbiBmb3IgcnVuICR7cnVuSWR9YCk7XG4gICAgICAgIGF3YWl0IHVwZGF0ZVJ1blN0YXR1cyhydW5JZCwgJ291dGxpbmluZycsIG91dGxpbmVEYXRhKTtcbiAgICAgICAgcmV0dXJuIG91dGxpbmVEYXRhO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2MF0gT3V0bGluZSBzdGVwIGVycm9yOmAsIGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKSk7XG4gICAgICAgIC8vIFJldHVybiBmYWxsYmFjayBvdXRsaW5lIGlmIHBhcnNpbmcgb3IgQUkgY2FsbCBmYWlsc1xuICAgICAgICBjb25zdCBmYWxsYmFja091dGxpbmUgPSB7XG4gICAgICAgICAgICB0aXRsZTogYCR7dG9waWN9IC0gQ29tcHJlaGVuc2l2ZSBHdWlkZSB8ICR7YnVzaW5lc3NOYW1lfWAsXG4gICAgICAgICAgICBtZXRhX2FuZ2xlOiBgRXZlcnl0aGluZyB5b3UgbmVlZCB0byBrbm93IGFib3V0ICR7dG9waWN9IGZvciAke2J1c2luZXNzTmFtZX1gLFxuICAgICAgICAgICAgdGFyZ2V0X3dvcmRfY291bnQ6IHRhcmdldFdvcmRDb3VudCxcbiAgICAgICAgICAgIHNlY3Rpb25zOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBoZWFkaW5nOiAnSW50cm9kdWN0aW9uOiBVbmRlcnN0YW5kaW5nIHRoZSBCYXNpY3MnLFxuICAgICAgICAgICAgICAgICAgICBwdXJwb3NlOiAnU2V0IGNvbnRleHQgYW5kIGludHJvZHVjZSB0aGUgdG9waWMnLFxuICAgICAgICAgICAgICAgICAgICBlc3RpbWF0ZWRfd29yZHM6IDIwMCxcbiAgICAgICAgICAgICAgICAgICAga2V5X3BvaW50czogW1xuICAgICAgICAgICAgICAgICAgICAgICAgYE92ZXJ2aWV3IG9mICR7dG9waWN9YCxcbiAgICAgICAgICAgICAgICAgICAgICAgICdXaHkgdGhpcyB0b3BpYyBtYXR0ZXJzIHRvIHlvdXIgYXVkaWVuY2UnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ1doYXQgeW91IHdpbGwgbGVhcm4nXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIHNlb19ub3RlczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgJ0luY2x1ZGUgcHJpbWFyeSBrZXl3b3JkIGluIGZpcnN0IHBhcmFncmFwaCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAnVXNlIGVuZ2FnaW5nIGhvb2snXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGluZzogJ0tleSBDb25jZXB0cyBhbmQgQmVuZWZpdHMnLFxuICAgICAgICAgICAgICAgICAgICBwdXJwb3NlOiAnRXhwbG9yZSBjb3JlIGNvbmNlcHRzIGFuZCBhZHZhbnRhZ2VzJyxcbiAgICAgICAgICAgICAgICAgICAgZXN0aW1hdGVkX3dvcmRzOiA0MDAsXG4gICAgICAgICAgICAgICAgICAgIGtleV9wb2ludHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICdDb3JlIGNvbmNlcHQgMScsXG4gICAgICAgICAgICAgICAgICAgICAgICAnQ29yZSBjb25jZXB0IDInLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0hvdyBidXNpbmVzc2VzIGJlbmVmaXQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ1JlYWwtd29ybGQgYXBwbGljYXRpb25zJ1xuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBzZW9fbm90ZXM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICdVc2Ugc2Vjb25kYXJ5IGtleXdvcmRzIG5hdHVyYWxseScsXG4gICAgICAgICAgICAgICAgICAgICAgICAnQW5zd2VyIGNvbW1vbiBxdWVzdGlvbnMnXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGluZzogJ0Jlc3QgUHJhY3RpY2VzIGFuZCBJbXBsZW1lbnRhdGlvbicsXG4gICAgICAgICAgICAgICAgICAgIHB1cnBvc2U6ICdQcm92aWRlIGFjdGlvbmFibGUgZ3VpZGFuY2UnLFxuICAgICAgICAgICAgICAgICAgICBlc3RpbWF0ZWRfd29yZHM6IDUwMCxcbiAgICAgICAgICAgICAgICAgICAga2V5X3BvaW50czogW1xuICAgICAgICAgICAgICAgICAgICAgICAgJ1N0ZXAtYnktc3RlcCBpbXBsZW1lbnRhdGlvbicsXG4gICAgICAgICAgICAgICAgICAgICAgICAnQmVzdCBwcmFjdGljZXMgaW4gdGhlIGluZHVzdHJ5JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdDb21tb24gbWlzdGFrZXMgdG8gYXZvaWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ1Rvb2xzIGFuZCByZXNvdXJjZXMnXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIHNlb19ub3RlczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgJ1VzZSBsb25nLXRhaWwga2V5d29yZHMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0luY2x1ZGUgcHJhY3RpY2FsIGV4YW1wbGVzJ1xuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGhlYWRpbmc6ICdDb25jbHVzaW9uIGFuZCBOZXh0IFN0ZXBzJyxcbiAgICAgICAgICAgICAgICAgICAgcHVycG9zZTogJ1N1bW1hcml6ZSBhbmQgZ3VpZGUgcmVhZGVyIGFjdGlvbicsXG4gICAgICAgICAgICAgICAgICAgIGVzdGltYXRlZF93b3JkczogMTUwLFxuICAgICAgICAgICAgICAgICAgICBrZXlfcG9pbnRzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAnS2V5IHRha2Vhd2F5cycsXG4gICAgICAgICAgICAgICAgICAgICAgICAnUmVjb21tZW5kZWQgbmV4dCBzdGVwcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAnQ2FsbCB0byBhY3Rpb24nXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIHNlb19ub3RlczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgJ1JlaW5mb3JjZSBwcmltYXJ5IGtleXdvcmQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0NyZWF0ZSB1cmdlbmN5IGZvciBDVEEnXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgaW50cm9fZ3VpZGFuY2U6IGBTdGFydCB3aXRoIGEgY29tcGVsbGluZyBob29rIHRoYXQgYWRkcmVzc2VzIHRoZSByZWFkZXIncyBwYWluIHBvaW50LiBJbnRyb2R1Y2UgJHt0b3BpY30gaW4gdGhlIGNvbnRleHQgb2YgJHtidXNpbmVzc05hbWV9IGFuZCBleHBsYWluIHdoeSBpdCBtYXR0ZXJzIHRvIHRoZSB0YXJnZXQgYXVkaWVuY2UuIEluY2x1ZGUgdGhlIHByaW1hcnkga2V5d29yZCBcIiR7cHJpbWFyeUtleXdvcmR9XCIgbmF0dXJhbGx5IGluIHRoZSBmaXJzdCAxMDAgd29yZHMuYCxcbiAgICAgICAgICAgIGNvbmNsdXNpb25fZ3VpZGFuY2U6IGBTdW1tYXJpemUgdGhlIG1haW4gdGFrZWF3YXlzIGZyb20gZWFjaCBzZWN0aW9uLiBSZWluZm9yY2UgaG93IHVuZGVyc3RhbmRpbmcgJHt0b3BpY30gYmVuZWZpdHMgdGhlIHJlYWRlci4gSW5jbHVkZSBhIGNsZWFyLCBjb21wZWxsaW5nIGNhbGwtdG8tYWN0aW9uIHRoYXQgZ3VpZGVzIHRoZSByZWFkZXIgb24gbmV4dCBzdGVwcy4gRW5kIHdpdGggdGhlIHByaW1hcnkga2V5d29yZCBuYXR1cmFsbHkgaW5jb3Jwb3JhdGVkLmAsXG4gICAgICAgICAgICBjdGFfZ3VpZGFuY2U6IGAke2N0YU5vdGVzfS4gRW5zdXJlIHRoZSBDVEEgaXMgY2xlYXIsIHNwZWNpZmljLCBhbmQgcmVsZXZhbnQgdG8gdGhlIGFydGljbGUgY29udGVudC4gRXhhbXBsZXM6IFwiU2NoZWR1bGUgYSBjb25zdWx0YXRpb24sXCIgXCJEb3dubG9hZCBvdXIgZ3VpZGUsXCIgXCJHZXQgc3RhcnRlZCB0b2RheSxcIiBcIkpvaW4gb3VyIGNvbW11bml0eS5cImAsXG4gICAgICAgICAgICBpbnRlcm5hbF9saW5rX29wcG9ydHVuaXRpZXM6IFtcbiAgICAgICAgICAgICAgICAnTGluayB0byByZWxldmFudCBzZXJ2aWNlIHBhZ2VzIG9uIGNvbXBhbnkgd2Vic2l0ZScsXG4gICAgICAgICAgICAgICAgJ0xpbmsgdG8gcmVsYXRlZCBibG9nIHBvc3RzIG9uIHNpbWlsYXIgdG9waWNzJyxcbiAgICAgICAgICAgICAgICAnTGluayB0byBjYXNlIHN0dWRpZXMgb3Igc3VjY2VzcyBzdG9yaWVzJyxcbiAgICAgICAgICAgICAgICAnTGluayB0byByZXNvdXJjZSBwYWdlcyBvciB0b29scydcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBub3Rlc19mb3Jfd3JpdGVyOiBbXG4gICAgICAgICAgICAgICAgYFJlbWVtYmVyIHRvIG1haW50YWluIGEgJHticmFuZFZvaWNlfSB0b25lIHRocm91Z2hvdXRgLFxuICAgICAgICAgICAgICAgIGBBZGRyZXNzIHRoZSBuZWVkcyBvZjogJHthdWRpZW5jZU5vdGVzfWAsXG4gICAgICAgICAgICAgICAgYEVuc3VyZSB0aGUgY29udGVudCBpcyB3ZWxsLXJlc2VhcmNoZWQgYW5kIGluY2x1ZGVzIHNwZWNpZmljIGV4YW1wbGVzYCxcbiAgICAgICAgICAgICAgICBgVXNlIHN1YmhlYWRpbmdzIHRvIGltcHJvdmUgcmVhZGFiaWxpdHkgYW5kIFNFT2AsXG4gICAgICAgICAgICAgICAgYEluY2x1ZGUgcmVsZXZhbnQgZGF0YSwgc3RhdGlzdGljcywgb3IgcmVzZWFyY2ggZmluZGluZ3Mgd2hlcmUgYXBwcm9wcmlhdGVgLFxuICAgICAgICAgICAgICAgIGBFbmQgd2l0aCBhIHN0cm9uZyBDVEEgYWxpZ25lZCB3aXRoOiAke2N0YU5vdGVzfWBcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgICAgICB9O1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBPdXRsaW5lIHN0ZXA6IFVzaW5nIGZhbGxiYWNrIG91dGxpbmUgZHVlIHRvIGVycm9yYCk7XG4gICAgICAgIHJldHVybiBmYWxsYmFja091dGxpbmU7XG4gICAgfVxufVxucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvb3V0bGluZS1zdGVwLy9ydW5PdXRsaW5lU3RlcFwiLCBydW5PdXRsaW5lU3RlcCk7XG4iLCAiaW1wb3J0IHsgcmVnaXN0ZXJTdGVwRnVuY3Rpb24gfSBmcm9tIFwid29ya2Zsb3cvaW50ZXJuYWwvcHJpdmF0ZVwiO1xuaW1wb3J0ICdzZXJ2ZXItb25seSc7XG5pbXBvcnQgeyBnZW5lcmF0ZVRleHQgfSBmcm9tICdhaSc7XG5pbXBvcnQgeyBvcGVuYWkgfSBmcm9tICdAYWktc2RrL29wZW5haSc7XG5pbXBvcnQgeyB1cGRhdGVSdW5TdGF0dXMgfSBmcm9tICcuLi8uLi9zdG9yYWdlL3J1bnMnO1xuaW1wb3J0IHsgZ2V0QWdlbnRDb25maWcgfSBmcm9tICcuLi8uLi9zdG9yYWdlL2FnZW50LWNvbmZpZ3MnO1xuLyoqX19pbnRlcm5hbF93b3JrZmxvd3N7XCJzdGVwc1wiOntcImxpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvcmVzZWFyY2gtc3RlcC50c1wiOntcInJ1blJlc2VhcmNoU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3Jlc2VhcmNoLXN0ZXAvL3J1blJlc2VhcmNoU3RlcFwifX19fSovO1xuLyoqXG4gKiBSZXNlYXJjaCBTdGVwIC0gUGhhc2UgMkMtQVxuICogUnVucyBpbnNpZGUgYSBkdXJhYmxlIHN0ZXAgZnVuY3Rpb24gKGhhcyBOb2RlLmpzIGFjY2VzcylcbiAqIENhbGxzIEFJIG1vZGVsIHRvIGdlbmVyYXRlIHJlc2VhcmNoIEpTT05cbiAqIE5vIGZpbGVzeXN0ZW0gaW1wb3J0cyAtIHNhZmUgZm9yIHdvcmtmbG93IGNvbnRleHRcbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gcnVuUmVzZWFyY2hTdGVwKHJ1bklkLCBpbnB1dCkge1xuICAgIGNvbnNvbGUubG9nKGBbdjBdIFJlc2VhcmNoIHN0ZXA6IEFuYWx5emluZyB0b3BpYyBmb3IgcnVuICR7cnVuSWR9YCk7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gTG9hZCBhZ2VudCBjb25maWcgZnJvbSBkYXRhYmFzZVxuICAgICAgICBjb25zdCBhZ2VudENvbmZpZyA9IGF3YWl0IGdldEFnZW50Q29uZmlnKCdyZXNlYXJjaCcpO1xuICAgICAgICBpZiAoIWFnZW50Q29uZmlnKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0FjdGl2ZSBhZ2VudCBjb25maWcgbm90IGZvdW5kIGZvciBhZ2VudF9rZXk6IHJlc2VhcmNoJyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gU0VPIEJsb2cgQWdlbnQgQ29uZmlnIExvYWRlZDogcmVzZWFyY2ggdiR7YWdlbnRDb25maWcudmVyc2lvbn1gKTtcbiAgICAgICAgLy8gQnVpbGQgc3lzdGVtIHByb21wdCBmcm9tIGRhdGFiYXNlIGNvbmZpZ1xuICAgICAgICBjb25zdCBzeXN0ZW1Qcm9tcHQgPSBbXG4gICAgICAgICAgICBhZ2VudENvbmZpZy5zeXN0ZW1fcHJvbXB0LFxuICAgICAgICAgICAgYWdlbnRDb25maWcuc2tpbGxfbWFya2Rvd25cbiAgICAgICAgXS5maWx0ZXIoQm9vbGVhbikuam9pbignXFxuXFxuJyk7XG4gICAgICAgIGNvbnN0IHVzZXJNZXNzYWdlID0gYENvbmR1Y3QgU0VPIHJlc2VhcmNoIGZvcjpcblRvcGljOiAke2lucHV0LmJsb2dfdG9waWN9XG5QcmltYXJ5IEtleXdvcmQ6ICR7aW5wdXQucHJpbWFyeV9rZXl3b3JkfVxuU2Vjb25kYXJ5IEtleXdvcmRzOiAke2lucHV0LnNlY29uZGFyeV9rZXl3b3Jkcz8uam9pbignLCAnKSB8fCAnbm9uZSd9XG5UYXJnZXQgQXVkaWVuY2U6ICR7aW5wdXQuYXVkaWVuY2Vfbm90ZXMgfHwgJ2dlbmVyYWwnfVxuVGFyZ2V0IFdvcmQgQ291bnQ6ICR7aW5wdXQudGFyZ2V0X3dvcmRfY291bnQgfHwgMTAwMH1cbkJ1c2luZXNzOiAke2lucHV0LmJ1c2luZXNzX25hbWUgfHwgJ3Vua25vd24nfVxuV2Vic2l0ZTogJHtpbnB1dC53ZWJzaXRlX3VybCB8fCAndW5rbm93bid9XG5cblByb3ZpZGUgY29tcHJlaGVuc2l2ZSByZXNlYXJjaCBmaW5kaW5ncyBpbiBKU09OIGZvcm1hdC5gO1xuICAgICAgICAvLyBHZXQgbW9kZWwgbmFtZTogdXNlIERCIGNvbmZpZyBpZiBhdmFpbGFibGUsIG90aGVyd2lzZSBmYWxsIGJhY2sgdG8gZW52IHZhciBvciBkZWZhdWx0XG4gICAgICAgIGNvbnN0IG1vZGVsTmFtZSA9IGFnZW50Q29uZmlnLm1vZGVsIHx8IHByb2Nlc3MuZW52LlJFU0VBUkNIX0FHRU5UX01PREVMIHx8ICdncHQtNS40LW1pbmknO1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBSZXNlYXJjaCBzdGVwOiBVc2luZyBtb2RlbDogJHttb2RlbE5hbWV9YCk7XG4gICAgICAgIC8vIFVzZSBkaXJlY3QgT3BlbkFJIHByb3ZpZGVyIHdpdGggT1BFTkFJX0FQSV9LRVlcbiAgICAgICAgY29uc3QgbW9kZWwgPSBvcGVuYWkobW9kZWxOYW1lKTtcbiAgICAgICAgLy8gQ2FsbCBBSSBtb2RlbFxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGdlbmVyYXRlVGV4dCh7XG4gICAgICAgICAgICBtb2RlbCxcbiAgICAgICAgICAgIHN5c3RlbTogc3lzdGVtUHJvbXB0LFxuICAgICAgICAgICAgcHJvbXB0OiB1c2VyTWVzc2FnZSxcbiAgICAgICAgICAgIHRlbXBlcmF0dXJlOiAwLjdcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFJlc2VhcmNoIHN0ZXA6IEFJIG1vZGVsIHJlc3BvbmRlZCwgcGFyc2luZyBKU09OYCk7XG4gICAgICAgIC8vIFBhcnNlIEpTT04gcmVzcG9uc2VcbiAgICAgICAgbGV0IHJlc2VhcmNoRGF0YTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFRyeSB0byBleHRyYWN0IEpTT04gZnJvbSByZXNwb25zZSAoaW4gY2FzZSBvZiBleHRyYSB0ZXh0KVxuICAgICAgICAgICAgY29uc3QganNvbk1hdGNoID0gcmVzcG9uc2UudGV4dC5tYXRjaCgvXFx7W1xcc1xcU10qXFx9Lyk7XG4gICAgICAgICAgICBpZiAoIWpzb25NYXRjaCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTm8gSlNPTiBmb3VuZCBpbiByZXNwb25zZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzZWFyY2hEYXRhID0gSlNPTi5wYXJzZShqc29uTWF0Y2hbMF0pO1xuICAgICAgICB9IGNhdGNoIChwYXJzZUVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW3YwXSBSZXNlYXJjaCBzdGVwOiBGYWlsZWQgdG8gcGFyc2UgQUkgcmVzcG9uc2U6YCwgcmVzcG9uc2UudGV4dC5zdWJzdHJpbmcoMCwgMjAwKSk7XG4gICAgICAgICAgICAvLyBSZXR1cm4gZmFsbGJhY2sgaWYgcGFyc2luZyBmYWlsc1xuICAgICAgICAgICAgcmVzZWFyY2hEYXRhID0ge1xuICAgICAgICAgICAgICAgIHNlYXJjaF9pbnRlbnQ6ICdpbmZvcm1hdGlvbmFsJyxcbiAgICAgICAgICAgICAgICB0YXJnZXRfYXVkaWVuY2Vfc3VtbWFyeTogaW5wdXQuYXVkaWVuY2Vfbm90ZXMgfHwgJ1RhcmdldCBhdWRpZW5jZSBub3Qgc3BlY2lmaWVkJyxcbiAgICAgICAgICAgICAgICBrZXl3b3JkX21hcDoge1xuICAgICAgICAgICAgICAgICAgICBwcmltYXJ5X2tleXdvcmQ6IGlucHV0LnByaW1hcnlfa2V5d29yZCB8fCAncHJpbWFyeSBrZXl3b3JkJyxcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kYXJ5X2tleXdvcmRzOiBpbnB1dC5zZWNvbmRhcnlfa2V5d29yZHMgfHwgW10sXG4gICAgICAgICAgICAgICAgICAgIGxzaV90ZXJtczogW11cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNvbnRlbnRfYW5nbGU6IGBGb2N1cyBvbiAke2lucHV0LmJsb2dfdG9waWMgfHwgJ3RvcGljJ31gLFxuICAgICAgICAgICAgICAgIGNvbXBldGl0b3JfaW5zaWdodHM6IFtcbiAgICAgICAgICAgICAgICAgICAgJ1Jlc2VhcmNoIGNvbXBldGl0b3JzIGZvciBjb21wZXRpdGl2ZSBhZHZhbnRhZ2VzJ1xuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVjb21tZW5kZWRfc2VjdGlvbnM6IFtcbiAgICAgICAgICAgICAgICAgICAgJ0ludHJvZHVjdGlvbicsXG4gICAgICAgICAgICAgICAgICAgICdNYWluIENvbnRlbnQnLFxuICAgICAgICAgICAgICAgICAgICAnQ29uY2x1c2lvbidcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHF1ZXN0aW9uc190b19hbnN3ZXI6IFtcbiAgICAgICAgICAgICAgICAgICAgJ1doYXQgaXMgdGhlIG1haW4gdG9waWM/J1xuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZWFyY2hfbm90ZXM6ICdGYWxsYmFjayByZXNlYXJjaCBkdWUgdG8gcGFyc2luZyBlcnJvcicsXG4gICAgICAgICAgICAgICAgdGFyZ2V0X3dvcmRfY291bnQ6IGlucHV0LnRhcmdldF93b3JkX2NvdW50IHx8IDEwMDAsXG4gICAgICAgICAgICAgICAgd2ViX3NlYXJjaF91c2VkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICAvLyBQZXJzaXN0IHJlc2VhcmNoX2pzb24gdG8gZGF0YWJhc2VcbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gUmVzZWFyY2ggc3RlcDogUGVyc2lzdGluZyByZXNlYXJjaF9qc29uIGZvciBydW4gJHtydW5JZH1gKTtcbiAgICAgICAgYXdhaXQgdXBkYXRlUnVuU3RhdHVzKHJ1bklkLCAncmVzZWFyY2hpbmcnLCByZXNlYXJjaERhdGEpO1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBSZXNlYXJjaCBzdGVwOiBDb21wbGV0ZSBmb3IgcnVuICR7cnVuSWR9YCk7XG4gICAgICAgIHJldHVybiByZXNlYXJjaERhdGE7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgW3YwXSBSZXNlYXJjaCBzdGVwIGVycm9yIGZvciBydW4gJHtydW5JZH06YCwgZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxufVxucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvcmVzZWFyY2gtc3RlcC8vcnVuUmVzZWFyY2hTdGVwXCIsIHJ1blJlc2VhcmNoU3RlcCk7XG4iLCAiaW1wb3J0IHsgcmVnaXN0ZXJTdGVwRnVuY3Rpb24gfSBmcm9tIFwid29ya2Zsb3cvaW50ZXJuYWwvcHJpdmF0ZVwiO1xuaW1wb3J0ICdzZXJ2ZXItb25seSc7XG5pbXBvcnQgeyBnZW5lcmF0ZVRleHQgfSBmcm9tICdhaSc7XG5pbXBvcnQgeyBvcGVuYWkgfSBmcm9tICdAYWktc2RrL29wZW5haSc7XG5pbXBvcnQgeyB1cGRhdGVSdW5TdGF0dXMgfSBmcm9tICcuLi8uLi9zdG9yYWdlL3J1bnMnO1xuaW1wb3J0IHsgZ2V0QWdlbnRDb25maWcgfSBmcm9tICcuLi8uLi9zdG9yYWdlL2FnZW50LWNvbmZpZ3MnO1xuLyoqX19pbnRlcm5hbF93b3JrZmxvd3N7XCJzdGVwc1wiOntcImxpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvc2VvLXFhLXN0ZXAudHNcIjp7XCJydW5TZW9RYVN0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9zZW8tcWEtc3RlcC8vcnVuU2VvUWFTdGVwXCJ9fX19Ki87XG4vKipcbiAqIFNFTyBRQSBTdGVwIC0gUGhhc2UgMkMtRFxuICogUnVucyBpbnNpZGUgYSBkdXJhYmxlIHN0ZXAgZnVuY3Rpb24gKGhhcyBOb2RlLmpzIGFjY2VzcylcbiAqIFJldmlld3MgZHJhZnQgbWFya2Rvd24gYWdhaW5zdCBTRU8gYmVzdCBwcmFjdGljZXNcbiAqIFJldHVybnMgc3RydWN0dXJlZCBhdWRpdCBKU09OIChkb2VzIE5PVCByZXdyaXRlIHRoZSBkcmFmdClcbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gcnVuU2VvUWFTdGVwKHJ1bklkLCBpbnB1dCwgcmVzZWFyY2hEYXRhLCBvdXRsaW5lRGF0YSwgZHJhZnRNYXJrZG93bikge1xuICAgIGNvbnNvbGUubG9nKGBbdjBdIFNFTyBRQSBzdGVwOiBBdWRpdGluZyBkcmFmdCBmb3IgcnVuICR7cnVuSWR9YCk7XG4gICAgaWYgKCFkcmFmdE1hcmtkb3duKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignRHJhZnQgbWFya2Rvd24gaXMgcmVxdWlyZWQgZm9yIFNFTyBRQSByZXZpZXcnKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gTG9hZCBhZ2VudCBjb25maWcgZnJvbSBkYXRhYmFzZVxuICAgICAgICBjb25zdCBhZ2VudENvbmZpZyA9IGF3YWl0IGdldEFnZW50Q29uZmlnKCdzZW9fcWEnKTtcbiAgICAgICAgaWYgKCFhZ2VudENvbmZpZykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBY3RpdmUgYWdlbnQgY29uZmlnIG5vdCBmb3VuZCBmb3IgYWdlbnRfa2V5OiBzZW9fcWEnKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBTRU8gQmxvZyBBZ2VudCBDb25maWcgTG9hZGVkOiBzZW9fcWEgdiR7YWdlbnRDb25maWcudmVyc2lvbn1gKTtcbiAgICAgICAgLy8gQnVpbGQgc3lzdGVtIHByb21wdCBmcm9tIGRhdGFiYXNlIGNvbmZpZ1xuICAgICAgICBjb25zdCBzeXN0ZW1Qcm9tcHQgPSBbXG4gICAgICAgICAgICBhZ2VudENvbmZpZy5zeXN0ZW1fcHJvbXB0LFxuICAgICAgICAgICAgYWdlbnRDb25maWcuc2tpbGxfbWFya2Rvd25cbiAgICAgICAgXS5maWx0ZXIoQm9vbGVhbikuam9pbignXFxuXFxuJyk7XG4gICAgICAgIC8vIEdldCBtb2RlbCBuYW1lOiB1c2UgREIgY29uZmlnIGlmIGF2YWlsYWJsZSwgb3RoZXJ3aXNlIGZhbGwgYmFjayB0byBlbnYgdmFyIG9yIGRlZmF1bHRcbiAgICAgICAgY29uc3QgbW9kZWxOYW1lID0gYWdlbnRDb25maWcubW9kZWwgfHwgcHJvY2Vzcy5lbnYuU0VPX1FBX0FHRU5UX01PREVMIHx8IHByb2Nlc3MuZW52LlJFU0VBUkNIX0FHRU5UX01PREVMIHx8ICdncHQtNS40LW1pbmknO1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBTRU8gUUEgc3RlcDogVXNpbmcgbW9kZWw6ICR7bW9kZWxOYW1lfWApO1xuICAgICAgICAvLyBQcmVwYXJlIGNvbnRleHQgZm9yIFNFTyBRQSByZXZpZXdcbiAgICAgICAgY29uc3QgcHJpbWFyeUtleXdvcmQgPSBpbnB1dC5wcmltYXJ5X2tleXdvcmQgfHwgJ3ByaW1hcnkga2V5d29yZCc7XG4gICAgICAgIGNvbnN0IHNlY29uZGFyeUtleXdvcmRzID0gKGlucHV0LnNlY29uZGFyeV9rZXl3b3JkcyB8fCBbXSkuam9pbignLCAnKSB8fCAnc2Vjb25kYXJ5IGtleXdvcmRzJztcbiAgICAgICAgY29uc3QgdGFyZ2V0V29yZENvdW50ID0gaW5wdXQudGFyZ2V0X3dvcmRfY291bnQgfHwgMjAwMDtcbiAgICAgICAgY29uc3QgYnVzaW5lc3NOYW1lID0gaW5wdXQuYnVzaW5lc3NfbmFtZSB8fCAnWW91ciBCdXNpbmVzcyc7XG4gICAgICAgIGNvbnN0IGF1ZGllbmNlTm90ZXMgPSBpbnB1dC5hdWRpZW5jZV9ub3RlcyB8fCAnVGFyZ2V0IGF1ZGllbmNlIG5vdCBzcGVjaWZpZWQnO1xuICAgICAgICBjb25zdCBicmFuZFZvaWNlID0gaW5wdXQuYnJhbmRfdm9pY2Vfbm90ZXMgfHwgJ1Byb2Zlc3Npb25hbCBhbmQgY2xlYXInO1xuICAgICAgICBjb25zdCBjdGFOb3RlcyA9IGlucHV0LmN0YV9ub3RlcyB8fCAnQ1RBIG5vdCBzcGVjaWZpZWQnO1xuICAgICAgICBjb25zdCBpbnRlcm5hbExpbmtOb3RlcyA9IGlucHV0LmludGVybmFsX2xpbmtfbm90ZXMgfHwgJ05vIGludGVybmFsIGxpbmtpbmcgc3RyYXRlZ3knO1xuICAgICAgICAvLyBCdWlsZCBTRU8gUUEgcHJvbXB0IHdpdGggc3lzdGVtIHByb21wdCBmcm9tIERCXG4gICAgICAgIGNvbnN0IHNlb1FhUHJvbXB0ID0gYCR7c3lzdGVtUHJvbXB0fVxuXG5CTE9HIERSQUZUOlxuJHtkcmFmdE1hcmtkb3dufVxuXG5SRVZJRVcgQ1JJVEVSSUE6XG4tIFByaW1hcnkgS2V5d29yZDogXCIke3ByaW1hcnlLZXl3b3JkfVwiXG4tIFNlY29uZGFyeSBLZXl3b3JkczogXCIke3NlY29uZGFyeUtleXdvcmRzfVwiXG4tIFRhcmdldCBXb3JkIENvdW50OiAke3RhcmdldFdvcmRDb3VudH0gd29yZHNcbi0gQnVzaW5lc3M6ICR7YnVzaW5lc3NOYW1lfVxuLSBBdWRpZW5jZTogJHthdWRpZW5jZU5vdGVzfVxuLSBCcmFuZCBWb2ljZTogJHticmFuZFZvaWNlfVxuLSBDVEEgTm90ZXM6ICR7Y3RhTm90ZXN9XG4tIEludGVybmFsIExpbmtpbmcgU3RyYXRlZ3k6ICR7aW50ZXJuYWxMaW5rTm90ZXN9XG5cblByb3ZpZGUgYSBkZXRhaWxlZCBTRU8gYXVkaXQgaW4gSlNPTiBmb3JtYXQgKGRvIE5PVCBtb2RpZnkgb3IgcmV3cml0ZSB0aGUgZHJhZnQpLmA7XG4gICAgICAgIGNvbnN0IHsgdGV4dCB9ID0gYXdhaXQgZ2VuZXJhdGVUZXh0KHtcbiAgICAgICAgICAgIG1vZGVsOiBvcGVuYWkobW9kZWxOYW1lKSxcbiAgICAgICAgICAgIHByb21wdDogc2VvUWFQcm9tcHQsXG4gICAgICAgICAgICB0ZW1wZXJhdHVyZTogMC43LFxuICAgICAgICAgICAgbWF4VG9rZW5zOiAzMDAwXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBTRU8gUUEgc3RlcDogUmVjZWl2ZWQgYXVkaXQgZnJvbSBtb2RlbGApO1xuICAgICAgICAvLyBQYXJzZSB0aGUgSlNPTiByZXNwb25zZVxuICAgICAgICBsZXQgc2VvUWFSZXN1bHQ7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBzZW9RYVJlc3VsdCA9IEpTT04ucGFyc2UodGV4dCk7XG4gICAgICAgIH0gY2F0Y2ggKHBhcnNlRXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbdjBdIFNFTyBRQSBzdGVwOiBGYWlsZWQgdG8gcGFyc2UgbW9kZWwgcmVzcG9uc2UgYXMgSlNPTmAsIHBhcnNlRXJyIGluc3RhbmNlb2YgRXJyb3IgPyBwYXJzZUVyci5tZXNzYWdlIDogU3RyaW5nKHBhcnNlRXJyKSk7XG4gICAgICAgICAgICAvLyBSZXR1cm4gZmFsbGJhY2sgYXVkaXQgaWYgcGFyc2luZyBmYWlsc1xuICAgICAgICAgICAgc2VvUWFSZXN1bHQgPSBnZW5lcmF0ZUZhbGxiYWNrU2VvUWEoZHJhZnRNYXJrZG93biwgcHJpbWFyeUtleXdvcmQpO1xuICAgICAgICB9XG4gICAgICAgIC8vIFZhbGlkYXRlIHJlcXVpcmVkIGZpZWxkc1xuICAgICAgICBpZiAodHlwZW9mIHNlb1FhUmVzdWx0Lm92ZXJhbGxfc2NvcmUgIT09ICdudW1iZXInIHx8ICFzZW9RYVJlc3VsdC5zZWFyY2hfaW50ZW50X2FsaWdubWVudCB8fCAhc2VvUWFSZXN1bHQucHJpb3JpdHlfZml4ZXMpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgW3YwXSBTRU8gUUEgc3RlcDogTWlzc2luZyByZXF1aXJlZCBhdWRpdCBmaWVsZHMsIHVzaW5nIGZhbGxiYWNrYCk7XG4gICAgICAgICAgICBzZW9RYVJlc3VsdCA9IGdlbmVyYXRlRmFsbGJhY2tTZW9RYShkcmFmdE1hcmtkb3duLCBwcmltYXJ5S2V5d29yZCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gUGVyc2lzdCBvcHRpbWl6ZWRfanNvbiB0byBkYXRhYmFzZVxuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBTRU8gUUEgc3RlcDogUGVyc2lzdGluZyBTRU8gUUEgYXVkaXQgKHNjb3JlOiAke3Nlb1FhUmVzdWx0Lm92ZXJhbGxfc2NvcmV9KSBmb3IgcnVuICR7cnVuSWR9YCk7XG4gICAgICAgIGF3YWl0IHVwZGF0ZVJ1blN0YXR1cyhydW5JZCwgJ3Nlb19xYScsIHNlb1FhUmVzdWx0KTtcbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gU0VPIFFBIHN0ZXA6IENvbXBsZXRlIGZvciBydW4gJHtydW5JZH1gKTtcbiAgICAgICAgcmV0dXJuIHNlb1FhUmVzdWx0O1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTXNnID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICBjb25zb2xlLmVycm9yKGBbdjBdIFNFTyBRQSBzdGVwOiBFcnJvciBkdXJpbmcgYXVkaXQgZm9yIHJ1biAke3J1bklkfTogJHtlcnJvck1zZ31gKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxufVxuLyoqXG4gKiBHZW5lcmF0ZSBhIGJhc2ljIFNFTyBRQSBhdWRpdCBhcyBmYWxsYmFja1xuICovIGZ1bmN0aW9uIGdlbmVyYXRlRmFsbGJhY2tTZW9RYShkcmFmdE1hcmtkb3duLCBwcmltYXJ5S2V5d29yZCkge1xuICAgIGNvbnN0IHdvcmRDb3VudCA9IGRyYWZ0TWFya2Rvd24uc3BsaXQoL1xccysvKS5sZW5ndGg7XG4gICAgY29uc3QgaDFDb3VudCA9IChkcmFmdE1hcmtkb3duLm1hdGNoKC9eIyAvZ20pIHx8IFtdKS5sZW5ndGg7XG4gICAgY29uc3QgaDJDb3VudCA9IChkcmFmdE1hcmtkb3duLm1hdGNoKC9eIyMgL2dtKSB8fCBbXSkubGVuZ3RoO1xuICAgIGNvbnN0IGludGVybmFsTGlua0NvdW50ID0gKGRyYWZ0TWFya2Rvd24ubWF0Y2goL1xcWy4qP1xcXVxcKFxcLy4qP1xcKS9nKSB8fCBbXSkubGVuZ3RoO1xuICAgIGNvbnN0IHByaW1hcnlLZXl3b3JkT2NjdXJyZW5jZXMgPSAoZHJhZnRNYXJrZG93bi50b0xvd2VyQ2FzZSgpLm1hdGNoKG5ldyBSZWdFeHAocHJpbWFyeUtleXdvcmQudG9Mb3dlckNhc2UoKSwgJ2cnKSkgfHwgW10pLmxlbmd0aDtcbiAgICByZXR1cm4ge1xuICAgICAgICBvdmVyYWxsX3Njb3JlOiA2OCxcbiAgICAgICAgc2VhcmNoX2ludGVudF9hbGlnbm1lbnQ6IHtcbiAgICAgICAgICAgIHNjb3JlOiA2NSxcbiAgICAgICAgICAgIGFuYWx5c2lzOiAnRHJhZnQgY292ZXJzIGJhc2ljIHNlYXJjaCBpbnRlbnQgYnV0IG1heSBuZWVkIHJlZmluZW1lbnQnXG4gICAgICAgIH0sXG4gICAgICAgIHByaW1hcnlfa2V5d29yZF91c2FnZToge1xuICAgICAgICAgICAgc2NvcmU6IDcwLFxuICAgICAgICAgICAgb2NjdXJyZW5jZXM6IHByaW1hcnlLZXl3b3JkT2NjdXJyZW5jZXMsXG4gICAgICAgICAgICBwbGFjZW1lbnRfYW5hbHlzaXM6IGBQcmltYXJ5IGtleXdvcmQgYXBwZWFycyAke3ByaW1hcnlLZXl3b3JkT2NjdXJyZW5jZXN9IHRpbWVzIGluIHRoZSBkcmFmdGBcbiAgICAgICAgfSxcbiAgICAgICAgc2Vjb25kYXJ5X2tleXdvcmRfdXNhZ2U6IHtcbiAgICAgICAgICAgIHNjb3JlOiA2MCxcbiAgICAgICAgICAgIGtleXdvcmRzX2NvdmVyZWQ6IFtdLFxuICAgICAgICAgICAgZ2FwczogW1xuICAgICAgICAgICAgICAgICdBZGRpdGlvbmFsIGtleXdvcmQgYW5hbHlzaXMgbmVlZGVkJ1xuICAgICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgICBoZWFkaW5nX3N0cnVjdHVyZV9yZXZpZXc6IHtcbiAgICAgICAgICAgIHNjb3JlOiBoMkNvdW50ID4gMiA/IDc1IDogNjUsXG4gICAgICAgICAgICBoMV9wcmVzZW50OiBoMUNvdW50ID4gMCxcbiAgICAgICAgICAgIGgyX2NvdW50OiBoMkNvdW50LFxuICAgICAgICAgICAgaGllcmFyY2h5X2lzc3VlczogaDFDb3VudCA9PT0gMCA/IFtcbiAgICAgICAgICAgICAgICAnTWlzc2luZyBIMSBoZWFkaW5nJ1xuICAgICAgICAgICAgXSA6IFtdXG4gICAgICAgIH0sXG4gICAgICAgIGNvbnRlbnRfZGVwdGhfcmV2aWV3OiB7XG4gICAgICAgICAgICBzY29yZTogd29yZENvdW50ID4gMTUwMCA/IDc1IDogNjAsXG4gICAgICAgICAgICB3b3JkX2NvdW50OiB3b3JkQ291bnQsXG4gICAgICAgICAgICBzZWN0aW9uX2NvdmVyYWdlOiBgRHJhZnQgY29udGFpbnMgJHtNYXRoLm1heCgxLCBoMkNvdW50KX0gbWFpbiBzZWN0aW9uc2AsXG4gICAgICAgICAgICBkZXB0aF9pc3N1ZXM6IHdvcmRDb3VudCA8IDE1MDAgPyBbXG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQgbWF5IG5lZWQgbW9yZSBkZXB0aCdcbiAgICAgICAgICAgIF0gOiBbXVxuICAgICAgICB9LFxuICAgICAgICByZWFkYWJpbGl0eV9yZXZpZXc6IHtcbiAgICAgICAgICAgIHNjb3JlOiA3MixcbiAgICAgICAgICAgIGF2Z19zZW50ZW5jZV9sZW5ndGg6IDE4LFxuICAgICAgICAgICAgZmxlc2NoX2tpbmNhaWRfZXN0aW1hdGU6ICc4dGggZ3JhZGUnLFxuICAgICAgICAgICAgcmVhZGFiaWxpdHlfaXNzdWVzOiBbXVxuICAgICAgICB9LFxuICAgICAgICBpbnRlcm5hbF9saW5raW5nX3Jldmlldzoge1xuICAgICAgICAgICAgc2NvcmU6IGludGVybmFsTGlua0NvdW50ID4gMiA/IDcwIDogNTAsXG4gICAgICAgICAgICBpbnRlcm5hbF9saW5rc19mb3VuZDogaW50ZXJuYWxMaW5rQ291bnQsXG4gICAgICAgICAgICBpbnRlcm5hbF9saW5rX3JlY29tbWVuZGF0aW9uczogaW50ZXJuYWxMaW5rQ291bnQgPT09IDAgPyBbXG4gICAgICAgICAgICAgICAgJ0FkZCByZWxldmFudCBpbnRlcm5hbCBsaW5rcydcbiAgICAgICAgICAgIF0gOiBbXVxuICAgICAgICB9LFxuICAgICAgICBjdGFfcmV2aWV3OiB7XG4gICAgICAgICAgICBzY29yZTogNzAsXG4gICAgICAgICAgICBjdGFfcHJlc2VudDogZHJhZnRNYXJrZG93bi50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKCdjdGEnKSB8fCBkcmFmdE1hcmtkb3duLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoJ2NhbGwnKSxcbiAgICAgICAgICAgIGN0YV9hbmFseXNpczogJ0NUQSBzZWN0aW9uIHJldmlldyBuZWVkZWQnXG4gICAgICAgIH0sXG4gICAgICAgIHJpc2tfZmxhZ3M6IFtdLFxuICAgICAgICBwcmlvcml0eV9maXhlczogW1xuICAgICAgICAgICAgLi4uaDFDb3VudCA9PT0gMCA/IFtcbiAgICAgICAgICAgICAgICAnRW5zdXJlIEgxIGhlYWRpbmcgcHJlc2VudCdcbiAgICAgICAgICAgIF0gOiBbXSxcbiAgICAgICAgICAgIC4uLndvcmRDb3VudCA8IDE1MDAgPyBbXG4gICAgICAgICAgICAgICAgJ0V4cGFuZCBjb250ZW50IHRvIG1lZXQgd29yZCBjb3VudCB0YXJnZXQnXG4gICAgICAgICAgICBdIDogW10sXG4gICAgICAgICAgICAuLi5pbnRlcm5hbExpbmtDb3VudCA9PT0gMCA/IFtcbiAgICAgICAgICAgICAgICAnQWRkIGludGVybmFsIGxpbmtpbmcgc3RyYXRlZ3knXG4gICAgICAgICAgICBdIDogW11cbiAgICAgICAgXSxcbiAgICAgICAgcmVjb21tZW5kZWRfbmV4dF9hY3Rpb246ICdTZW5kIHRvIGVkaXRvciBmb3IgcmV2aWV3IGFuZCBvcHRpbWl6YXRpb24nLFxuICAgICAgICByZWFkeV9mb3JfZWRpdG9yOiB0cnVlLFxuICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgIH07XG59XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9zZW8tcWEtc3RlcC8vcnVuU2VvUWFTdGVwXCIsIHJ1blNlb1FhU3RlcCk7XG4iLCAiaW1wb3J0IHsgcmVnaXN0ZXJTdGVwRnVuY3Rpb24gfSBmcm9tIFwid29ya2Zsb3cvaW50ZXJuYWwvcHJpdmF0ZVwiO1xuaW1wb3J0ICdzZXJ2ZXItb25seSc7XG5pbXBvcnQgeyBnZW5lcmF0ZVRleHQgfSBmcm9tICdhaSc7XG5pbXBvcnQgeyBvcGVuYWkgfSBmcm9tICdAYWktc2RrL29wZW5haSc7XG5pbXBvcnQgeyB1cGRhdGVSdW5EcmFmdCwgdXBkYXRlUnVuU3RhdHVzIH0gZnJvbSAnLi4vLi4vc3RvcmFnZS9ydW5zJztcbmltcG9ydCB7IGdldEFnZW50Q29uZmlnIH0gZnJvbSAnLi4vLi4vc3RvcmFnZS9hZ2VudC1jb25maWdzJztcbi8qKl9faW50ZXJuYWxfd29ya2Zsb3dze1wic3RlcHNcIjp7XCJsaWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3dyaXRlci1zdGVwLnRzXCI6e1wicnVuV3JpdGVyU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3dyaXRlci1zdGVwLy9ydW5Xcml0ZXJTdGVwXCJ9fX19Ki87XG4vKipcbiAqIFdyaXRlciBTdGVwIC0gUGhhc2UgMkMtQ1xuICogUnVucyBpbnNpZGUgYSBkdXJhYmxlIHN0ZXAgZnVuY3Rpb24gKGhhcyBOb2RlLmpzIGFjY2VzcylcbiAqIENhbGxzIEFJIG1vZGVsIHRvIGdlbmVyYXRlIGZpcnN0IGZ1bGwgYmxvZyBkcmFmdCBpbiBNYXJrZG93blxuICogVXNlcyByZXNlYXJjaCBkYXRhIGFuZCBvdXRsaW5lIHRvIHN0cnVjdHVyZSB0aGUgY29udGVudFxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5Xcml0ZXJTdGVwKHJ1bklkLCBpbnB1dCwgcmVzZWFyY2hEYXRhLCBvdXRsaW5lRGF0YSkge1xuICAgIGNvbnNvbGUubG9nKGBbdjBdIFdyaXRlciBzdGVwOiBDcmVhdGluZyBkcmFmdCBmb3IgcnVuICR7cnVuSWR9YCk7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gTG9hZCBhZ2VudCBjb25maWcgZnJvbSBkYXRhYmFzZVxuICAgICAgICBjb25zdCBhZ2VudENvbmZpZyA9IGF3YWl0IGdldEFnZW50Q29uZmlnKCd3cml0ZXInKTtcbiAgICAgICAgaWYgKCFhZ2VudENvbmZpZykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBY3RpdmUgYWdlbnQgY29uZmlnIG5vdCBmb3VuZCBmb3IgYWdlbnRfa2V5OiB3cml0ZXInKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBTRU8gQmxvZyBBZ2VudCBDb25maWcgTG9hZGVkOiB3cml0ZXIgdiR7YWdlbnRDb25maWcudmVyc2lvbn1gKTtcbiAgICAgICAgLy8gQnVpbGQgc3lzdGVtIHByb21wdCBmcm9tIGRhdGFiYXNlIGNvbmZpZ1xuICAgICAgICBjb25zdCBzeXN0ZW1Qcm9tcHQgPSBbXG4gICAgICAgICAgICBhZ2VudENvbmZpZy5zeXN0ZW1fcHJvbXB0LFxuICAgICAgICAgICAgYWdlbnRDb25maWcuc2tpbGxfbWFya2Rvd25cbiAgICAgICAgXS5maWx0ZXIoQm9vbGVhbikuam9pbignXFxuXFxuJyk7XG4gICAgICAgIC8vIENyZWF0ZSBjb250ZXh0IGZyb20gYXZhaWxhYmxlIGRhdGFcbiAgICAgICAgY29uc3QgdG9waWMgPSBpbnB1dC5ibG9nX3RvcGljIHx8IGlucHV0LnRvcGljIHx8ICdZb3VyIFRvcGljJztcbiAgICAgICAgY29uc3QgcHJpbWFyeUtleXdvcmQgPSBpbnB1dC5wcmltYXJ5X2tleXdvcmQgfHwgJ3ByaW1hcnkga2V5d29yZCc7XG4gICAgICAgIGNvbnN0IHNlY29uZGFyeUtleXdvcmRzID0gKGlucHV0LnNlY29uZGFyeV9rZXl3b3JkcyB8fCBpbnB1dC5rZXl3b3JkcyB8fCBbXSkuam9pbignLCAnKSB8fCAnc2Vjb25kYXJ5IGtleXdvcmRzJztcbiAgICAgICAgY29uc3QgYnVzaW5lc3NOYW1lID0gaW5wdXQuYnVzaW5lc3NfbmFtZSB8fCAnWW91ciBCdXNpbmVzcyc7XG4gICAgICAgIGNvbnN0IGF1ZGllbmNlTm90ZXMgPSBpbnB1dC5hdWRpZW5jZV9ub3RlcyB8fCAnVGFyZ2V0IGF1ZGllbmNlIG5vdCBzcGVjaWZpZWQnO1xuICAgICAgICBjb25zdCBicmFuZFZvaWNlID0gaW5wdXQuYnJhbmRfdm9pY2Vfbm90ZXMgfHwgJ1Byb2Zlc3Npb25hbCBhbmQgY2xlYXInO1xuICAgICAgICBjb25zdCBjdGFOb3RlcyA9IGlucHV0LmN0YV9ub3RlcyB8fCAnJztcbiAgICAgICAgY29uc3QgaW50ZXJuYWxMaW5rTm90ZXMgPSBpbnB1dC5pbnRlcm5hbF9saW5rX25vdGVzIHx8ICcnO1xuICAgICAgICBjb25zdCBhZGRpdGlvbmFsTm90ZXMgPSBpbnB1dC5hZGRpdGlvbmFsX29yZGVyX25vdGVzIHx8ICdObyBhZGRpdGlvbmFsIG5vdGVzJztcbiAgICAgICAgY29uc3QgdGFyZ2V0V29yZENvdW50ID0gaW5wdXQudGFyZ2V0X3dvcmRfY291bnQgfHwgMTUwMDtcbiAgICAgICAgLy8gQnVpbGQgcmVzZWFyY2ggY29udGV4dCBpZiBhdmFpbGFibGVcbiAgICAgICAgbGV0IHJlc2VhcmNoQ29udGV4dCA9ICcnO1xuICAgICAgICBpZiAocmVzZWFyY2hEYXRhICYmIHR5cGVvZiByZXNlYXJjaERhdGEgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICBjb25zdCBpbnNpZ2h0cyA9IHJlc2VhcmNoRGF0YS5rZXlfaW5zaWdodHMgfHwgW107XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShpbnNpZ2h0cykgJiYgaW5zaWdodHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHJlc2VhcmNoQ29udGV4dCA9IGBcXG5cXG5SZXNlYXJjaCBJbnNpZ2h0czpcXG4ke2luc2lnaHRzLm1hcCgoaSk9PmAtICR7dHlwZW9mIGkgPT09ICdzdHJpbmcnID8gaSA6IEpTT04uc3RyaW5naWZ5KGkpfWApLmpvaW4oJ1xcbicpfWA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gQnVpbGQgb3V0bGluZSBjb250ZXh0IGlmIGF2YWlsYWJsZVxuICAgICAgICBsZXQgb3V0bGluZUNvbnRleHQgPSAnJztcbiAgICAgICAgaWYgKG91dGxpbmVEYXRhKSB7XG4gICAgICAgICAgICBjb25zdCBzZWN0aW9ucyA9IChvdXRsaW5lRGF0YS5zZWN0aW9ucyB8fCBbXSkubWFwKChzKT0+YCMjICR7dHlwZW9mIHMgPT09ICdzdHJpbmcnID8gcyA6IHMuaGVhZGluZyB8fCAnU2VjdGlvbid9XFxuKCR7cy5wdXJwb3NlIHx8ICdTZWN0aW9uIGNvbnRlbnQnfSlgKTtcbiAgICAgICAgICAgIGlmIChzZWN0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgb3V0bGluZUNvbnRleHQgPSBgXFxuXFxuT3V0bGluZSBTdHJ1Y3R1cmU6XFxuJHtzZWN0aW9ucy5qb2luKCdcXG5cXG4nKX1gO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIEJ1aWxkIGludGVybmFsIGxpbmtzIGNvbnRleHRcbiAgICAgICAgbGV0IGxpbmtzQ29udGV4dCA9ICcnO1xuICAgICAgICBpZiAoaW50ZXJuYWxMaW5rTm90ZXMpIHtcbiAgICAgICAgICAgIGxpbmtzQ29udGV4dCA9IGBcXG5cXG5JbnRlcm5hbCBMaW5rIE9wcG9ydHVuaXRpZXM6XFxuJHtpbnRlcm5hbExpbmtOb3Rlc31gO1xuICAgICAgICB9XG4gICAgICAgIC8vIEJ1aWxkIENUQSBjb250ZXh0XG4gICAgICAgIGxldCBjdGFDb250ZXh0ID0gJyc7XG4gICAgICAgIGlmIChjdGFOb3Rlcykge1xuICAgICAgICAgICAgY3RhQ29udGV4dCA9IGBcXG5cXG5DYWxsLXRvLUFjdGlvbiBHdWlkYW5jZTpcXG4ke2N0YU5vdGVzfWA7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdXNlck1lc3NhZ2UgPSBgV3JpdGUgdGhlIGZpcnN0IGRyYWZ0IGJsb2cgcG9zdCBhYm91dDogJHt0b3BpY30ke3Jlc2VhcmNoQ29udGV4dH0ke291dGxpbmVDb250ZXh0fSR7bGlua3NDb250ZXh0fSR7Y3RhQ29udGV4dH1gO1xuICAgICAgICAvLyBHZXQgbW9kZWwgbmFtZTogdXNlIERCIGNvbmZpZyBpZiBhdmFpbGFibGUsIG90aGVyd2lzZSBmYWxsIGJhY2sgdG8gZW52IHZhciBvciBkZWZhdWx0XG4gICAgICAgIGNvbnN0IG1vZGVsTmFtZSA9IGFnZW50Q29uZmlnLm1vZGVsIHx8IHByb2Nlc3MuZW52LldSSVRFUl9BR0VOVF9NT0RFTCB8fCBwcm9jZXNzLmVudi5SRVNFQVJDSF9BR0VOVF9NT0RFTCB8fCAnZ3B0LTUuNC1taW5pJztcbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gV3JpdGVyIHN0ZXA6IFVzaW5nIG1vZGVsOiAke21vZGVsTmFtZX1gKTtcbiAgICAgICAgLy8gQ2FsbCBBSSBtb2RlbCB2aWEgZGlyZWN0IE9wZW5BSSBwcm92aWRlclxuICAgICAgICBjb25zdCBtb2RlbCA9IG9wZW5haShtb2RlbE5hbWUpO1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGdlbmVyYXRlVGV4dCh7XG4gICAgICAgICAgICBtb2RlbCxcbiAgICAgICAgICAgIHN5c3RlbTogc3lzdGVtUHJvbXB0LFxuICAgICAgICAgICAgcHJvbXB0OiB1c2VyTWVzc2FnZSxcbiAgICAgICAgICAgIHRlbXBlcmF0dXJlOiAwLjcsXG4gICAgICAgICAgICBtYXhUb2tlbnM6IDQwMDBcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IGRyYWZ0TWFya2Rvd24gPSByZXNwb25zZS50ZXh0O1xuICAgICAgICAvLyBCYXNpYyB2YWxpZGF0aW9uXG4gICAgICAgIGlmICghZHJhZnRNYXJrZG93biB8fCBkcmFmdE1hcmtkb3duLnRyaW0oKS5sZW5ndGggPCA1MDApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignR2VuZXJhdGVkIGNvbnRlbnQgdG9vIHNob3J0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQ2FsY3VsYXRlIG1ldHJpY3NcbiAgICAgICAgY29uc3Qgd29yZENvdW50ID0gZHJhZnRNYXJrZG93bi5zcGxpdCgvXFxzKy8pLmxlbmd0aDtcbiAgICAgICAgY29uc3Qgc2VjdGlvbnNDb3VudCA9IChkcmFmdE1hcmtkb3duLm1hdGNoKC9eIyNcXHMvZ20pIHx8IFtdKS5sZW5ndGg7XG4gICAgICAgIGNvbnN0IGhhc0N0YSA9IGRyYWZ0TWFya2Rvd24udG9Mb3dlckNhc2UoKS5pbmNsdWRlcygnY2FsbCcpIHx8IGRyYWZ0TWFya2Rvd24udG9Mb3dlckNhc2UoKS5pbmNsdWRlcygnYWN0aW9uJykgfHwgY3RhTm90ZXMubGVuZ3RoID4gMDtcbiAgICAgICAgY29uc3QgaGFzSW50ZXJuYWxMaW5rcyA9IGRyYWZ0TWFya2Rvd24uaW5jbHVkZXMoJ1tsaW5rOicpIHx8IGludGVybmFsTGlua05vdGVzLmxlbmd0aCA+IDA7XG4gICAgICAgIGNvbnN0IHdyaXRlck91dHB1dCA9IHtcbiAgICAgICAgICAgIGRyYWZ0X21hcmtkb3duOiBkcmFmdE1hcmtkb3duLFxuICAgICAgICAgICAgd29yZF9jb3VudDogd29yZENvdW50LFxuICAgICAgICAgICAgc2VjdGlvbnNfd3JpdHRlbjogc2VjdGlvbnNDb3VudCxcbiAgICAgICAgICAgIGhhc19jdGE6IGhhc0N0YSxcbiAgICAgICAgICAgIGhhc19pbnRlcm5hbF9saW5rczogaGFzSW50ZXJuYWxMaW5rcyxcbiAgICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICAgIH07XG4gICAgICAgIC8vIFBlcnNpc3QgZHJhZnRfbWFya2Rvd24gdG8gZGF0YWJhc2UgKG1hcmtkb3duIHN0cmluZyBvbmx5LCBub3QgZnVsbCBvYmplY3QpXG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFdyaXRlciBzdGVwOiBQZXJzaXN0aW5nIGRyYWZ0X21hcmtkb3duICgke3dvcmRDb3VudH0gd29yZHMpIGZvciBydW4gJHtydW5JZH1gKTtcbiAgICAgICAgYXdhaXQgdXBkYXRlUnVuRHJhZnQocnVuSWQsIHdyaXRlck91dHB1dC5kcmFmdF9tYXJrZG93bik7XG4gICAgICAgIC8vIEFsc28gdXBkYXRlIHN0YXR1cyB0byAnd3JpdGluZydcbiAgICAgICAgYXdhaXQgdXBkYXRlUnVuU3RhdHVzKHJ1bklkLCAnd3JpdGluZycpO1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBXcml0ZXIgc3RlcDogQ29tcGxldGUgZm9yIHJ1biAke3J1bklkfSAoJHt3b3JkQ291bnR9IHdvcmRzLCAke3NlY3Rpb25zQ291bnR9IHNlY3Rpb25zKWApO1xuICAgICAgICByZXR1cm4gd3JpdGVyT3V0cHV0O1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTXNnID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvciBpbiB3cml0ZXIgc3RlcCc7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2MF0gV3JpdGVyIHN0ZXAgZXJyb3IgZm9yIHJ1biAke3J1bklkfTogJHtlcnJvck1zZ31gKTtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBXcml0ZXIgc3RlcCBmYWlsZWQ6ICR7ZXJyb3JNc2d9YCk7XG4gICAgfVxufVxucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvd3JpdGVyLXN0ZXAvL3J1bldyaXRlclN0ZXBcIiwgcnVuV3JpdGVyU3RlcCk7XG4iLCAiXG4gICAgLy8gQnVpbHQgaW4gc3RlcHNcbiAgICBpbXBvcnQgJ3dvcmtmbG93L2ludGVybmFsL2J1aWx0aW5zJztcbiAgICAvLyBVc2VyIHN0ZXBzXG4gICAgaW1wb3J0ICcuL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvY2FsbGJhY2stc3RlcC50cyc7XG5pbXBvcnQgJy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9lZGl0b3Itc3RlcC50cyc7XG5pbXBvcnQgJy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9oZWxwZXJzLnRzJztcbmltcG9ydCAnLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL21ldGEtc3RlcC50cyc7XG5pbXBvcnQgJy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9vdXRsaW5lLXN0ZXAudHMnO1xuaW1wb3J0ICcuL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvcmVzZWFyY2gtc3RlcC50cyc7XG5pbXBvcnQgJy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9zZW8tcWEtc3RlcC50cyc7XG5pbXBvcnQgJy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy93cml0ZXItc3RlcC50cyc7XG4gICAgLy8gU2VyZGUgZmlsZXMgZm9yIGNyb3NzLWNvbnRleHQgY2xhc3MgcmVnaXN0cmF0aW9uXG4gICAgXG4gICAgLy8gQVBJIGVudHJ5cG9pbnRcbiAgICBleHBvcnQgeyBzdGVwRW50cnlwb2ludCBhcyBIRUFELCBzdGVwRW50cnlwb2ludCBhcyBQT1NUIH0gZnJvbSAnd29ya2Zsb3cvcnVudGltZSc7Il0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7OztBQUFBLFNBQUEsNEJBQUE7QUFTRSxlQUFXLGtDQUFBO0FBQ1gsU0FBTyxLQUFLLFlBQVc7QUFDekI7QUFGYTtBQUliLGVBQXNCLDBCQUF1QjtBQUMzQyxTQUFBLEtBQVcsS0FBQTs7QUFEUztBQUd0QixlQUFDLDBCQUFBO0FBRUQsU0FBTyxLQUFLLEtBQUE7O0FBRlg7cUJBSWlCLG1DQUFHLCtCQUFBO0FBQ3JCLHFCQUFDLDJCQUFBLHVCQUFBOzs7O0FDckJELFNBQVMsd0JBQUFBLDZCQUE0QjtBQUVyQyxTQUFTLGNBQWM7QUFNbkIsZUFBc0IsaUJBQWlCLE9BQU87QUFDOUMs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LElBQ3RDO0FBRUEsWUFBUSxJQUFJLGdEQUFnRCxTQUFTLG1CQUFtQixLQUFLLEVBQUU7QUFDL0YsVUFBTSxlQUFlLE9BQU8sYUFBYSxjQUFjO0FBRXZELFVBQU1DLGlCQUFnQixPQUFPLFNBQVM7QUFDdEMsWUFBUSxJQUFJLHNDQUFzQyxLQUFLLEtBQUssU0FBUyxXQUFXLGFBQWEsWUFBWTtBQUN6RyxXQUFPO0FBQUEsRUFDWCxTQUFTLE9BQU87QUFDWixVQUFNLFdBQVcsaUJBQWlCLFFBQVEsTUFBTSxVQUFVO0FBQzFELFlBQVEsTUFBTSxrQ0FBa0MsS0FBSyxLQUFLLFFBQVEsRUFBRTtBQUNwRSxVQUFNLElBQUksTUFBTSx1QkFBdUIsUUFBUSxFQUFFO0FBQUEsRUFDckQ7QUFDSjtBQTlGMEI7QUErRjFCQyxzQkFBcUIseUVBQXlFLGFBQWE7OztBQzVGdkcsU0FBMkIsZ0JBQXdCLGtCQUFsQkMsdUJBQThCOyIsCiAgIm5hbWVzIjogWyJyZWdpc3RlclN0ZXBGdW5jdGlvbiIsICJyZWdpc3RlclN0ZXBGdW5jdGlvbiIsICJyZWdpc3RlclN0ZXBGdW5jdGlvbiIsICJyZWdpc3RlclN0ZXBGdW5jdGlvbiIsICJyZWdpc3RlclN0ZXBGdW5jdGlvbiIsICJyZWdpc3RlclN0ZXBGdW5jdGlvbiIsICJyZWdpc3RlclN0ZXBGdW5jdGlvbiIsICJnZW5lcmF0ZVRleHQiLCAib3BlbmFpIiwgImdldEFnZW50Q29uZmlnIiwgImdldEFnZW50Q29uZmlnIiwgImdlbmVyYXRlVGV4dCIsICJvcGVuYWkiLCAicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAiZ2VuZXJhdGVUZXh0IiwgIm9wZW5haSIsICJ1cGRhdGVSdW5TdGF0dXMiLCAiZ2V0QWdlbnRDb25maWciLCAiZ2V0QWdlbnRDb25maWciLCAib3BlbmFpIiwgImdlbmVyYXRlVGV4dCIsICJ1cGRhdGVSdW5TdGF0dXMiLCAicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAiZ2VuZXJhdGVUZXh0IiwgIm9wZW5haSIsICJ1cGRhdGVSdW5TdGF0dXMiLCAiZ2V0QWdlbnRDb25maWciLCAiZ2V0QWdlbnRDb25maWciLCAib3BlbmFpIiwgImdlbmVyYXRlVGV4dCIsICJ1cGRhdGVSdW5TdGF0dXMiLCAicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAiZ2VuZXJhdGVUZXh0IiwgIm9wZW5haSIsICJ1cGRhdGVSdW5TdGF0dXMiLCAiZ2V0QWdlbnRDb25maWciLCAiZ2V0QWdlbnRDb25maWciLCAiZ2VuZXJhdGVUZXh0IiwgIm9wZW5haSIsICJ1cGRhdGVSdW5TdGF0dXMiLCAicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAiZ2VuZXJhdGVUZXh0IiwgIm9wZW5haSIsICJ1cGRhdGVSdW5TdGF0dXMiLCAiZ2V0QWdlbnRDb25maWciLCAiZ2V0QWdlbnRDb25maWciLCAib3BlbmFpIiwgImdlbmVyYXRlVGV4dCIsICJ1cGRhdGVSdW5TdGF0dXMiLCAicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAic3RlcEVudHJ5cG9pbnQiXQp9Cg==

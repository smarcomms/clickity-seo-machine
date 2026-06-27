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
import { getRun, recordCallbackAttempt } from "../../../../../lib/seo-blog-engine/storage/runs.ts";
async function sendCallbackStep(runId) {
  try {
    const run = await getRun(runId);
    if (!run) {
      console.warn(`[v0] Callback: Run ${runId} not found`);
      return;
    }
    if (!run.callback_url) {
      console.log(`[v0] Callback: No callback URL for run ${runId}`);
      await recordCallbackAttempt(runId, "not_configured");
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
      if (response.ok) {
        console.log(`[v0] Callback: Successfully sent for run ${runId}, status ${response.status}`);
        await recordCallbackAttempt(runId, "success", response.status);
      } else {
        const statusText = response.statusText || `HTTP ${response.status}`;
        console.warn(`[v0] Callback: Webhook returned ${response.status} for run ${runId}`);
        const errorMsg = `Webhook returned ${response.status}: ${statusText}`;
        await recordCallbackAttempt(runId, "failed", response.status, errorMsg);
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      let errorMessage = "Unknown network error";
      if (fetchError instanceof Error) {
        if (fetchError.name === "AbortError") {
          errorMessage = "Request timeout (30s)";
          console.warn(`[v0] Callback: Request timeout (30s) for run ${runId}`);
        } else {
          errorMessage = `Network error: ${fetchError.message}`;
          console.warn(`[v0] Callback: ${errorMessage} for run ${runId}`);
        }
      } else {
        console.warn(`[v0] Callback: Unknown error for run ${runId}`);
      }
      await recordCallbackAttempt(runId, "failed", void 0, errorMessage);
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
        throw new Error("Meta output parse failed: No JSON found in response");
      }
      metaOutput = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      const isTestMode = input.test_run === true || input.debug_marker !== void 0;
      const errorMsg = parseError instanceof Error ? parseError.message : String(parseError);
      if (isTestMode) {
        console.warn(`[v0] Meta step: Parse failed in test mode, using fallback: ${errorMsg}`);
        metaOutput = generateFallbackMeta(input, research, seoQa, originalDraft);
      } else {
        const fullError = `Meta output parse failed: ${errorMsg}`;
        console.error(`[v0] Meta step: ${fullError}`);
        throw new Error(fullError);
      }
    }
    const fieldValidations = [
      {
        field: "meta_title",
        type: "string",
        check: /* @__PURE__ */ __name((v) => typeof v === "string" && v.length > 0, "check")
      },
      {
        field: "meta_description",
        type: "string",
        check: /* @__PURE__ */ __name((v) => typeof v === "string" && v.length > 0, "check")
      },
      {
        field: "slug",
        type: "string",
        check: /* @__PURE__ */ __name((v) => typeof v === "string" && v.length > 0, "check")
      },
      {
        field: "social_preview",
        type: "object",
        check: /* @__PURE__ */ __name((v) => typeof v === "object" && v.title && v.description, "check")
      },
      {
        field: "schema_markup",
        type: "object",
        check: /* @__PURE__ */ __name((v) => typeof v === "object" && v["@type"] && v.headline && v.description, "check")
      },
      {
        field: "primary_keyword_used",
        type: "boolean",
        check: /* @__PURE__ */ __name((v) => typeof v === "boolean", "check")
      },
      {
        field: "secondary_keywords_reflected",
        type: "array",
        check: /* @__PURE__ */ __name((v) => Array.isArray(v), "check")
      },
      {
        field: "client_goal_reflected",
        type: "boolean",
        check: /* @__PURE__ */ __name((v) => typeof v === "boolean", "check")
      },
      {
        field: "human_review_required",
        type: "boolean",
        check: /* @__PURE__ */ __name((v) => typeof v === "boolean", "check")
      },
      {
        field: "review_ready",
        type: "boolean",
        check: /* @__PURE__ */ __name((v) => typeof v === "boolean", "check")
      },
      {
        field: "meta_notes",
        type: "array",
        check: /* @__PURE__ */ __name((v) => Array.isArray(v), "check")
      },
      {
        field: "needs_review",
        type: "boolean",
        check: /* @__PURE__ */ __name((v) => typeof v === "boolean", "check")
      }
    ];
    const validationErrors = [];
    for (const validation of fieldValidations) {
      const value = metaOutput[validation.field];
      if (value === void 0 || value === null) {
        validationErrors.push(`${validation.field} is missing`);
      } else if (!validation.check(value)) {
        validationErrors.push(`${validation.field} has invalid type (expected ${validation.type})`);
      }
    }
    if (validationErrors.length > 0) {
      throw new Error(`Meta output validation failed: ${validationErrors.join("; ")}`);
    }
    if (metaOutput.meta_title.length > 70) {
      throw new Error(`Meta title too long: ${metaOutput.meta_title.length} chars, max 70`);
    }
    if (metaOutput.meta_description.length > 160) {
      throw new Error(`Meta description too long: ${metaOutput.meta_description.length} chars, max 160`);
    }
    console.log(`[v0] Meta step: Complete for run ${runId}`, `Generated metadata: ${metaOutput.meta_title.substring(0, 50)}...`);
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
- Search Intent Alignment: ${seoQa.search_intent_alignment.score}
- Primary Keyword Usage: ${seoQa.primary_keyword_usage.score}
- Heading Structure: ${seoQa.heading_structure_review.score}
- Client Goal Alignment: ${seoQa.client_goal_alignment.score}

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
5. Follows best practices (title max 70 chars, description max 160 chars)
6. Includes review notes for the human editor

Return valid JSON only using exactly these top-level keys:
meta_title, meta_description, slug, social_preview, schema_markup, primary_keyword_used, secondary_keywords_reflected, client_goal_reflected, human_review_required, review_ready, meta_notes, needs_review.

Do not use old keys:
seo_title, suggested_slug, secondary_keywords_used, human_review_notes, excerpt, og_title, og_description, canonical_url_suggestion, schema_type_suggestion.

Return a JSON object with this exact schema:
{
  "meta_title": "SEO-optimized title (max 70 chars, include primary keyword)",
  "meta_description": "Compelling description (max 160 chars, include primary keyword)",
  "slug": "url-slug-format",
  "social_preview": {
    "title": "Social media preview title",
    "description": "Social media preview description"
  },
  "schema_markup": {
    "@type": "BlogPosting",
    "headline": "Article headline",
    "description": "Article description"
  },
  "primary_keyword_used": true,
  "secondary_keywords_reflected": ["keyword1", "keyword2"],
  "client_goal_reflected": true,
  "human_review_required": false,
  "review_ready": true,
  "meta_notes": ["note1", "note2"],
  "needs_review": false
}`;
}
__name(buildMetaContext, "buildMetaContext");
function generateFallbackMeta(input, research, seoQa, draft) {
  const primaryKeyword = input.primary_keyword || "blog post";
  const slug = input.blog_topic.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const wordCount = draft.split(/\s+/).length;
  return {
    meta_title: `${input.blog_topic} - ${input.business_name || "Blog"}`,
    meta_description: `Comprehensive guide to ${input.blog_topic.toLowerCase()}. Research-backed insights and practical strategies.`,
    slug,
    social_preview: {
      title: `${input.blog_topic} | ${input.business_name || "Blog"}`,
      description: `Discover ${input.blog_topic.toLowerCase()}. Comprehensive guide with research and insights.`
    },
    schema_markup: {
      "@type": "BlogPosting",
      headline: `${input.blog_topic} - ${input.business_name || "Blog"}`,
      description: `Comprehensive guide to ${input.blog_topic.toLowerCase()}. Research-backed insights and practical strategies.`
    },
    primary_keyword_used: true,
    secondary_keywords_reflected: input.secondary_keywords || [],
    client_goal_reflected: true,
    human_review_required: seoQa.overall_score < 75,
    review_ready: seoQa.overall_score >= 60,
    meta_notes: [
      `Overall SEO Score: ${seoQa.overall_score}`,
      "Review and adjust metadata as needed for your brand voice",
      "Ensure meta title and description are compelling for CTR",
      "Verify schema markup matches your content format"
    ],
    needs_review: seoQa.overall_score < 75
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
      if (!Array.isArray(researchData.key_findings)) {
        throw new Error("Research output missing required key_findings array");
      }
      if (researchData.key_findings.length === 0) {
        throw new Error("Research output key_findings array cannot be empty");
      }
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
    const requiredFields = [
      "overall_score",
      "ready_for_editor",
      "recommended_next_action",
      "search_intent_alignment",
      "primary_keyword_usage",
      "secondary_keyword_usage",
      "heading_structure_review",
      "content_depth_review",
      "readability_review",
      "cta_review",
      "internal_linking_review",
      "client_goal_alignment",
      "priority_fixes",
      "risk_flags",
      "needs_review"
    ];
    let missingFields = [];
    for (const field of requiredFields) {
      if (seoQaResult[field] === void 0 || seoQaResult[field] === null) {
        missingFields.push(field);
      }
    }
    if (missingFields.length > 0) {
      throw new Error(`SEO QA output missing required fields: ${missingFields.join(", ")}`);
    }
    const validActions = [
      "Approve for editor",
      "Revise before editor",
      "Needs human review"
    ];
    if (!validActions.includes(seoQaResult.recommended_next_action)) {
      throw new Error(`SEO QA output invalid recommended_next_action: ${seoQaResult.recommended_next_action}`);
    }
    if (typeof seoQaResult.overall_score !== "number" || seoQaResult.overall_score < 0 || seoQaResult.overall_score > 100) {
      throw new Error(`SEO QA output invalid overall_score: ${seoQaResult.overall_score}, must be number between 0-100`);
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3dvcmtmbG93QDQuNS4wX0BuZXN0anMrY29tbW9uQDExLjEuMjdfcmVmbGVjdC1tZXRhZGF0YUAwLjIuMl9yeGpzQDcuOC4yX19AbmVzdGpzK2NvcmVAMV9hOWMxYWE2YzBiNTgwZTliZjNiZmY2NGMzMjY5ZmU0My9ub2RlX21vZHVsZXMvd29ya2Zsb3cvc3JjL2ludGVybmFsL2J1aWx0aW5zLnRzIiwgIi4uLy4uLy4uLy4uLy4uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvY2FsbGJhY2stc3RlcC50cyIsICIuLi8uLi8uLi8uLi8uLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL2VkaXRvci1zdGVwLnRzIiwgIi4uLy4uLy4uLy4uLy4uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvaGVscGVycy50cyIsICIuLi8uLi8uLi8uLi8uLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL21ldGEtc3RlcC50cyIsICIuLi8uLi8uLi8uLi8uLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL291dGxpbmUtc3RlcC50cyIsICIuLi8uLi8uLi8uLi8uLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3Jlc2VhcmNoLXN0ZXAudHMiLCAiLi4vLi4vLi4vLi4vLi4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9zZW8tcWEtc3RlcC50cyIsICIuLi8uLi8uLi8uLi8uLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3dyaXRlci1zdGVwLnRzIiwgIi4uLy4uLy4uLy4uLy4uL3ZpcnR1YWwtZW50cnkuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKlxuICogVGhlc2UgYXJlIHRoZSBidWlsdC1pbiBzdGVwcyB0aGF0IGFyZSBcImF1dG9tYXRpY2FsbHkgYXZhaWxhYmxlXCIgaW4gdGhlIHdvcmtmbG93IHNjb3BlLiBUaGV5IGFyZVxuICogc2ltaWxhciB0byBcInN0ZGxpYlwiIGV4Y2VwdCB0aGF0IGFyZSBub3QgbWVhbnQgdG8gYmUgaW1wb3J0ZWQgYnkgdXNlcnMsIGJ1dCBhcmUgaW5zdGVhZCBcImp1c3QgYXZhaWxhYmxlXCJcbiAqIGFsb25nc2lkZSB1c2VyIGRlZmluZWQgc3RlcHMuIFRoZXkgYXJlIHVzZWQgaW50ZXJuYWxseSBieSB0aGUgcnVudGltZVxuICovXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBfX2J1aWx0aW5fcmVzcG9uc2VfYXJyYXlfYnVmZmVyKFxuICB0aGlzOiBSZXF1ZXN0IHwgUmVzcG9uc2Vcbikge1xuICAndXNlIHN0ZXAnO1xuICByZXR1cm4gdGhpcy5hcnJheUJ1ZmZlcigpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gX19idWlsdGluX3Jlc3BvbnNlX2pzb24odGhpczogUmVxdWVzdCB8IFJlc3BvbnNlKSB7XG4gICd1c2Ugc3RlcCc7XG4gIHJldHVybiB0aGlzLmpzb24oKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIF9fYnVpbHRpbl9yZXNwb25zZV90ZXh0KHRoaXM6IFJlcXVlc3QgfCBSZXNwb25zZSkge1xuICAndXNlIHN0ZXAnO1xuICByZXR1cm4gdGhpcy50ZXh0KCk7XG59XG4iLCAiaW1wb3J0IHsgcmVnaXN0ZXJTdGVwRnVuY3Rpb24gfSBmcm9tIFwid29ya2Zsb3cvaW50ZXJuYWwvcHJpdmF0ZVwiO1xuaW1wb3J0ICdzZXJ2ZXItb25seSc7XG5pbXBvcnQgeyBnZXRSdW4sIHJlY29yZENhbGxiYWNrQXR0ZW1wdCB9IGZyb20gJy4uLy4uL3N0b3JhZ2UvcnVucyc7XG4vKipfX2ludGVybmFsX3dvcmtmbG93c3tcInN0ZXBzXCI6e1wibGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9jYWxsYmFjay1zdGVwLnRzXCI6e1wic2VuZENhbGxiYWNrU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL2NhbGxiYWNrLXN0ZXAvL3NlbmRDYWxsYmFja1N0ZXBcIn19fX0qLztcbi8qKlxuICogU2VuZCBjYWxsYmFjayBub3RpZmljYXRpb24gdG8gd2ViaG9vayBVUkxcbiAqIFJ1bnMgYXMgYSBkdXJhYmxlIHN0ZXAgdG8gZW5zdXJlIGNhbGxiYWNrIGRlbGl2ZXJ5IGlzIHRyYWNrZWRcbiAqIEZhaWx1cmVzIGRvIG5vdCBicmVhayB0aGUgbWFpbiB3b3JrZmxvd1xuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZW5kQ2FsbGJhY2tTdGVwKHJ1bklkKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gRmV0Y2ggcnVuIHRvIGdldCBjYWxsYmFjayBVUkwgYW5kIGZpbmFsIHN0YXRlXG4gICAgICAgIGNvbnN0IHJ1biA9IGF3YWl0IGdldFJ1bihydW5JZCk7XG4gICAgICAgIGlmICghcnVuKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYFt2MF0gQ2FsbGJhY2s6IFJ1biAke3J1bklkfSBub3QgZm91bmRgKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXJ1bi5jYWxsYmFja191cmwpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIENhbGxiYWNrOiBObyBjYWxsYmFjayBVUkwgZm9yIHJ1biAke3J1bklkfWApO1xuICAgICAgICAgICAgLy8gUmVjb3JkIHRoYXQgY2FsbGJhY2sgd2FzIG5vdCBjb25maWd1cmVkXG4gICAgICAgICAgICBhd2FpdCByZWNvcmRDYWxsYmFja0F0dGVtcHQocnVuSWQsICdub3RfY29uZmlndXJlZCcpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIENhbGxiYWNrOiBTZW5kaW5nIG5vdGlmaWNhdGlvbiB0byAke3J1bi5jYWxsYmFja191cmx9YCk7XG4gICAgICAgIC8vIEJ1aWxkIGNhbGxiYWNrIHBheWxvYWRcbiAgICAgICAgY29uc3QgY2FsbGJhY2tQYXlsb2FkID0gYnVpbGRDYWxsYmFja1BheWxvYWQocnVuKTtcbiAgICAgICAgLy8gU2VuZCBjYWxsYmFjayB3aXRoIHRpbWVvdXQgcHJvdGVjdGlvblxuICAgICAgICBjb25zdCBjb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgICAgICBjb25zdCB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KCgpPT5jb250cm9sbGVyLmFib3J0KCksIDMwMDAwKTsgLy8gMzAgc2Vjb25kIHRpbWVvdXRcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2gocnVuLmNhbGxiYWNrX3VybCwge1xuICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJ1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoY2FsbGJhY2tQYXlsb2FkKSxcbiAgICAgICAgICAgICAgICBzaWduYWw6IGNvbnRyb2xsZXIuc2lnbmFsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICAgICAgICAgICAgaWYgKHJlc3BvbnNlLm9rKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFt2MF0gQ2FsbGJhY2s6IFN1Y2Nlc3NmdWxseSBzZW50IGZvciBydW4gJHtydW5JZH0sIHN0YXR1cyAke3Jlc3BvbnNlLnN0YXR1c31gKTtcbiAgICAgICAgICAgICAgICAvLyBSZWNvcmQgc3VjY2Vzc2Z1bCBjYWxsYmFja1xuICAgICAgICAgICAgICAgIGF3YWl0IHJlY29yZENhbGxiYWNrQXR0ZW1wdChydW5JZCwgJ3N1Y2Nlc3MnLCByZXNwb25zZS5zdGF0dXMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzdGF0dXNUZXh0ID0gcmVzcG9uc2Uuc3RhdHVzVGV4dCB8fCBgSFRUUCAke3Jlc3BvbnNlLnN0YXR1c31gO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgW3YwXSBDYWxsYmFjazogV2ViaG9vayByZXR1cm5lZCAke3Jlc3BvbnNlLnN0YXR1c30gZm9yIHJ1biAke3J1bklkfWApO1xuICAgICAgICAgICAgICAgIC8vIFJlY29yZCBmYWlsZWQgY2FsbGJhY2sgd2l0aCBIVFRQIHN0YXR1c1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTXNnID0gYFdlYmhvb2sgcmV0dXJuZWQgJHtyZXNwb25zZS5zdGF0dXN9OiAke3N0YXR1c1RleHR9YDtcbiAgICAgICAgICAgICAgICBhd2FpdCByZWNvcmRDYWxsYmFja0F0dGVtcHQocnVuSWQsICdmYWlsZWQnLCByZXNwb25zZS5zdGF0dXMsIGVycm9yTXNnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZmV0Y2hFcnJvcikge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgICAgICAgICBsZXQgZXJyb3JNZXNzYWdlID0gJ1Vua25vd24gbmV0d29yayBlcnJvcic7XG4gICAgICAgICAgICBpZiAoZmV0Y2hFcnJvciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgICAgICAgICAgaWYgKGZldGNoRXJyb3IubmFtZSA9PT0gJ0Fib3J0RXJyb3InKSB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZSA9ICdSZXF1ZXN0IHRpbWVvdXQgKDMwcyknO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFt2MF0gQ2FsbGJhY2s6IFJlcXVlc3QgdGltZW91dCAoMzBzKSBmb3IgcnVuICR7cnVuSWR9YCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlID0gYE5ldHdvcmsgZXJyb3I6ICR7ZmV0Y2hFcnJvci5tZXNzYWdlfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgW3YwXSBDYWxsYmFjazogJHtlcnJvck1lc3NhZ2V9IGZvciBydW4gJHtydW5JZH1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgW3YwXSBDYWxsYmFjazogVW5rbm93biBlcnJvciBmb3IgcnVuICR7cnVuSWR9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBSZWNvcmQgZmFpbGVkIGNhbGxiYWNrIHdpdGggZXJyb3IgbWVzc2FnZSAobm8gSFRUUCBzdGF0dXMgZm9yIG5ldHdvcmsgZXJyb3JzKVxuICAgICAgICAgICAgYXdhaXQgcmVjb3JkQ2FsbGJhY2tBdHRlbXB0KHJ1bklkLCAnZmFpbGVkJywgdW5kZWZpbmVkLCBlcnJvck1lc3NhZ2UpO1xuICAgICAgICAvLyBEb24ndCB0aHJvdyAtIGNhbGxiYWNrIGZhaWx1cmUgc2hvdWxkIG5vdCBmYWlsIHRoZSB3b3JrZmxvd1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgLy8gTG9nIGVycm9yIHNhZmVseSB3aXRob3V0IGV4cG9zaW5nIHNlY3JldHNcbiAgICAgICAgY29uc3QgZXJyb3JNc2cgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2MF0gQ2FsbGJhY2s6IFVuZXhwZWN0ZWQgZXJyb3IgZm9yIHJ1biAke3J1bklkfTogJHtlcnJvck1zZ31gKTtcbiAgICAvLyBEb24ndCB0aHJvdyAtIGNhbGxiYWNrIGZhaWx1cmUgc2hvdWxkIG5vdCBmYWlsIHRoZSB3b3JrZmxvd1xuICAgIH1cbn1cbi8qKlxuICogQnVpbGQgY2FsbGJhY2sgcGF5bG9hZCBiYXNlZCBvbiBydW4gc3RhdHVzXG4gKi8gZnVuY3Rpb24gYnVpbGRDYWxsYmFja1BheWxvYWQocnVuKSB7XG4gICAgY29uc3QgaXNDb21wbGV0ZWQgPSBydW4uc3RhdHVzID09PSAnY29tcGxldGVkJztcbiAgICBjb25zdCBpc0ZhaWxlZCA9IHJ1bi5zdGF0dXMgPT09ICdmYWlsZWQnO1xuICAgIGlmIChpc0NvbXBsZXRlZCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcnVuX2lkOiBydW4uaWQsXG4gICAgICAgICAgICBzdGF0dXM6ICdjb21wbGV0ZWQnLFxuICAgICAgICAgICAgYnVzaW5lc3NfbmFtZTogcnVuLmlucHV0X2pzb24/LmJ1c2luZXNzX25hbWUgfHwgbnVsbCxcbiAgICAgICAgICAgIGJsb2dfdG9waWM6IHJ1bi5pbnB1dF9qc29uPy5ibG9nX3RvcGljIHx8IHJ1bi5pbnB1dF9qc29uPy50b3BpYyB8fCBudWxsLFxuICAgICAgICAgICAgcmV2aWV3X3JlYWR5OiB0cnVlLFxuICAgICAgICAgICAgaHVtYW5fcmV2aWV3X3JlcXVpcmVkOiB0cnVlLFxuICAgICAgICAgICAgb3V0cHV0czoge1xuICAgICAgICAgICAgICAgIGhhc19yZXNlYXJjaF9qc29uOiAhIXJ1bi5yZXNlYXJjaF9qc29uLFxuICAgICAgICAgICAgICAgIGhhc19vdXRsaW5lX2pzb246ICEhcnVuLm91dGxpbmVfanNvbixcbiAgICAgICAgICAgICAgICBoYXNfZHJhZnRfbWFya2Rvd246ICEhcnVuLmRyYWZ0X21hcmtkb3duLFxuICAgICAgICAgICAgICAgIGhhc19vcHRpbWl6ZWRfanNvbjogISFydW4ub3B0aW1pemVkX2pzb24sXG4gICAgICAgICAgICAgICAgaGFzX2ZpbmFsX291dHB1dF9qc29uOiAhIXJ1bi5maW5hbF9vdXRwdXRfanNvblxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZpbmFsX291dHB1dF9qc29uOiBydW4uZmluYWxfb3V0cHV0X2pzb25cbiAgICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKGlzRmFpbGVkKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBydW5faWQ6IHJ1bi5pZCxcbiAgICAgICAgICAgIHN0YXR1czogJ2ZhaWxlZCcsXG4gICAgICAgICAgICBidXNpbmVzc19uYW1lOiBydW4uaW5wdXRfanNvbj8uYnVzaW5lc3NfbmFtZSB8fCBudWxsLFxuICAgICAgICAgICAgYmxvZ190b3BpYzogcnVuLmlucHV0X2pzb24/LmJsb2dfdG9waWMgfHwgcnVuLmlucHV0X2pzb24/LnRvcGljIHx8IG51bGwsXG4gICAgICAgICAgICByZXZpZXdfcmVhZHk6IGZhbHNlLFxuICAgICAgICAgICAgaHVtYW5fcmV2aWV3X3JlcXVpcmVkOiB0cnVlLFxuICAgICAgICAgICAgZXJyb3JfbWVzc2FnZTogcnVuLmVycm9yX21lc3NhZ2UgfHwgJ1Vua25vd24gZXJyb3InXG4gICAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gU2hvdWxkbid0IGhhcHBlbiwgYnV0IGhhbmRsZSBncmFjZWZ1bGx5XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBydW5faWQ6IHJ1bi5pZCxcbiAgICAgICAgICAgIHN0YXR1czogcnVuLnN0YXR1cyxcbiAgICAgICAgICAgIGJ1c2luZXNzX25hbWU6IHJ1bi5pbnB1dF9qc29uPy5idXNpbmVzc19uYW1lIHx8IG51bGwsXG4gICAgICAgICAgICBibG9nX3RvcGljOiBydW4uaW5wdXRfanNvbj8uYmxvZ190b3BpYyB8fCBydW4uaW5wdXRfanNvbj8udG9waWMgfHwgbnVsbFxuICAgICAgICB9O1xuICAgIH1cbn1cbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL2NhbGxiYWNrLXN0ZXAvL3NlbmRDYWxsYmFja1N0ZXBcIiwgc2VuZENhbGxiYWNrU3RlcCk7XG4iLCAiaW1wb3J0IHsgcmVnaXN0ZXJTdGVwRnVuY3Rpb24gfSBmcm9tIFwid29ya2Zsb3cvaW50ZXJuYWwvcHJpdmF0ZVwiO1xuaW1wb3J0ICdzZXJ2ZXItb25seSc7XG5pbXBvcnQgeyBnZW5lcmF0ZVRleHQgfSBmcm9tICdhaSc7XG5pbXBvcnQgeyBvcGVuYWkgfSBmcm9tICdAYWktc2RrL29wZW5haSc7XG5pbXBvcnQgeyBnZXRBZ2VudENvbmZpZyB9IGZyb20gJy4uLy4uL3N0b3JhZ2UvYWdlbnQtY29uZmlncyc7XG4vKipfX2ludGVybmFsX3dvcmtmbG93c3tcInN0ZXBzXCI6e1wibGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9lZGl0b3Itc3RlcC50c1wiOntcInJ1bkVkaXRvclN0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9lZGl0b3Itc3RlcC8vcnVuRWRpdG9yU3RlcFwifX19fSovO1xuLyoqXG4gKiBFZGl0b3IgQWdlbnQgU3RlcFxuICogSW1wcm92ZXMgdGhlIGRyYWZ0IGJhc2VkIG9uIFNFTyBRQSByZWNvbW1lbmRhdGlvbnMgYW5kIGJyYW5kIGd1aWRlbGluZXNcbiAqIERvZXMgTk9UIG92ZXJ3cml0ZSB0aGUgb3JpZ2luYWwgZHJhZnRfbWFya2Rvd24gLSByZXN1bHQgZ29lcyB0byBmaW5hbF9vdXRwdXRfanNvblxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5FZGl0b3JTdGVwKHJ1bklkLCBpbnB1dCwgcmVzZWFyY2gsIG91dGxpbmUsIG9yaWdpbmFsRHJhZnQsIHNlb1FhKSB7XG4gICAgY29uc29sZS5sb2coYFt2MF0gRWRpdG9yIHN0ZXA6IFN0YXJ0aW5nIGZvciBydW4gJHtydW5JZH1gKTtcbiAgICB0cnkge1xuICAgICAgICAvLyBMb2FkIGFnZW50IGNvbmZpZyBmcm9tIGRhdGFiYXNlXG4gICAgICAgIGNvbnN0IGFnZW50Q29uZmlnID0gYXdhaXQgZ2V0QWdlbnRDb25maWcoJ2VkaXRvcicpO1xuICAgICAgICBpZiAoIWFnZW50Q29uZmlnKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0FjdGl2ZSBhZ2VudCBjb25maWcgbm90IGZvdW5kIGZvciBhZ2VudF9rZXk6IGVkaXRvcicpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFNFTyBCbG9nIEFnZW50IENvbmZpZyBMb2FkZWQ6IGVkaXRvciB2JHthZ2VudENvbmZpZy52ZXJzaW9ufWApO1xuICAgICAgICAvLyBCdWlsZCBzeXN0ZW0gcHJvbXB0IGZyb20gZGF0YWJhc2UgY29uZmlnXG4gICAgICAgIGNvbnN0IHN5c3RlbVByb21wdCA9IFtcbiAgICAgICAgICAgIGFnZW50Q29uZmlnLnN5c3RlbV9wcm9tcHQsXG4gICAgICAgICAgICBhZ2VudENvbmZpZy5za2lsbF9tYXJrZG93blxuICAgICAgICBdLmZpbHRlcihCb29sZWFuKS5qb2luKCdcXG5cXG4nKTtcbiAgICAgICAgLy8gQnVpbGQgY29udGV4dCBmb3IgZWRpdG9yXG4gICAgICAgIGNvbnN0IGVkaXRvckNvbnRleHQgPSBidWlsZEVkaXRvckNvbnRleHQoaW5wdXQsIHJlc2VhcmNoLCBvdXRsaW5lLCBzZW9RYSk7XG4gICAgICAgIC8vIEdldCBtb2RlbCBuYW1lOiB1c2UgREIgY29uZmlnIGlmIGF2YWlsYWJsZSwgb3RoZXJ3aXNlIGZhbGwgYmFjayB0byBlbnYgdmFyIG9yIGRlZmF1bHRcbiAgICAgICAgY29uc3QgbW9kZWxOYW1lID0gYWdlbnRDb25maWcubW9kZWwgfHwgcHJvY2Vzcy5lbnYuRURJVE9SX0FHRU5UX01PREVMIHx8ICdncHQtNS40LW1pbmknO1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBFZGl0b3Igc3RlcDogVXNpbmcgbW9kZWw6ICR7bW9kZWxOYW1lfWApO1xuICAgICAgICAvLyBHZW5lcmF0ZSBpbXByb3ZlZCBkcmFmdFxuICAgICAgICBjb25zdCB7IHRleHQ6IGltcHJvdmVtZW50QW5hbHlzaXMgfSA9IGF3YWl0IGdlbmVyYXRlVGV4dCh7XG4gICAgICAgICAgICBtb2RlbDogb3BlbmFpKG1vZGVsTmFtZSksXG4gICAgICAgICAgICB0ZW1wZXJhdHVyZTogMC43LFxuICAgICAgICAgICAgbWF4VG9rZW5zOiA4MDAwLFxuICAgICAgICAgICAgc3lzdGVtOiBzeXN0ZW1Qcm9tcHQsXG4gICAgICAgICAgICBtZXNzYWdlczogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcm9sZTogJ3VzZXInLFxuICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBgUGxlYXNlIGltcHJvdmUgdGhpcyBkcmFmdCBiYXNlZCBvbiB0aGUgZm9sbG93aW5nIGZlZWRiYWNrOlxuXG5PUklHSU5BTCBEUkFGVDpcbiR7b3JpZ2luYWxEcmFmdH1cblxuU0VPIFFBIEZFRURCQUNLOlxuJHtlZGl0b3JDb250ZXh0fVxuXG5Qcm92aWRlIHRoZSBlZGl0ZWQgZHJhZnQgYW5kIGEgc3VtbWFyeSBvZiBjaGFuZ2VzIG1hZGUuYFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF1cbiAgICAgICAgfSk7XG4gICAgICAgIC8vIFBhcnNlIGltcHJvdmVtZW50IGFuYWx5c2lzXG4gICAgICAgIGxldCBlZGl0b3JPdXRwdXQ7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKGltcHJvdmVtZW50QW5hbHlzaXMpO1xuICAgICAgICAgICAgZWRpdG9yT3V0cHV0ID0ge1xuICAgICAgICAgICAgICAgIGVkaXRlZF9kcmFmdF9tYXJrZG93bjogcGFyc2VkLmVkaXRlZF9kcmFmdCB8fCBvcmlnaW5hbERyYWZ0LFxuICAgICAgICAgICAgICAgIGVkaXRvcl9ub3RlczogcGFyc2VkLm5vdGVzIHx8IFtdLFxuICAgICAgICAgICAgICAgIGNoYW5nZXNfbWFkZTogcGFyc2VkLmNoYW5nZXNfc3VtbWFyeSB8fCBbXSxcbiAgICAgICAgICAgICAgICBodW1hbl9yZXZpZXdfcmVxdWlyZWQ6IHRydWVcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gY2F0Y2ggIHtcbiAgICAgICAgICAgIC8vIEZhbGxiYWNrIGlmIHBhcnNpbmcgZmFpbHNcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgW3YwXSBFZGl0b3Igc3RlcDogRmFpbGVkIHRvIHBhcnNlIGVkaXRvciByZXNwb25zZSwgdXNpbmcgZmFsbGJhY2tgKTtcbiAgICAgICAgICAgIGVkaXRvck91dHB1dCA9IHtcbiAgICAgICAgICAgICAgICBlZGl0ZWRfZHJhZnRfbWFya2Rvd246IG9yaWdpbmFsRHJhZnQsXG4gICAgICAgICAgICAgICAgZWRpdG9yX25vdGVzOiBbXG4gICAgICAgICAgICAgICAgICAgICdFZGl0b3IgcHJvY2Vzc2luZyBjb21wbGV0ZWQgd2l0aCBmYWxsYmFjaydcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIGNoYW5nZXNfbWFkZTogW10sXG4gICAgICAgICAgICAgICAgaHVtYW5fcmV2aWV3X3JlcXVpcmVkOiB0cnVlXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIEVkaXRvciBzdGVwOiBHZW5lcmF0ZWQgZWRpdGVkIGRyYWZ0ICgke2VkaXRvck91dHB1dC5lZGl0ZWRfZHJhZnRfbWFya2Rvd24ubGVuZ3RofSBjaGFycylgKTtcbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gRWRpdG9yIHN0ZXA6ICR7ZWRpdG9yT3V0cHV0LmNoYW5nZXNfbWFkZS5sZW5ndGh9IGNoYW5nZXMgaWRlbnRpZmllZGApO1xuICAgICAgICByZXR1cm4gZWRpdG9yT3V0cHV0O1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgY29uc29sZS5lcnJvcihgW3YwXSBFZGl0b3Igc3RlcCBlcnJvcjogJHtlcnJvck1lc3NhZ2V9YCk7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbn1cbi8qKlxuICogQnVpbGQgY29udGV4dCBmb3IgZWRpdG9yIGJhc2VkIG9uIFNFTyBRQSBmaW5kaW5nc1xuICovIGZ1bmN0aW9uIGJ1aWxkRWRpdG9yQ29udGV4dChpbnB1dCwgcmVzZWFyY2gsIG91dGxpbmUsIHNlb1FhKSB7XG4gICAgY29uc3Qgc2VjdGlvbnMgPSBbXTtcbiAgICBzZWN0aW9ucy5wdXNoKCcjIyBTRU8gUGVyZm9ybWFuY2UgU3VtbWFyeScpO1xuICAgIHNlY3Rpb25zLnB1c2goYE92ZXJhbGwgU2NvcmU6ICR7c2VvUWEub3ZlcmFsbF9zY29yZX0vMTAwYCk7XG4gICAgc2VjdGlvbnMucHVzaCgnXFxuIyMgU2VhcmNoIEludGVudCBBbGlnbm1lbnQnKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBTY29yZTogJHtzZW9RYS5zZWFyY2hfaW50ZW50X2FsaWdubWVudC5zY29yZX0vMTAwYCk7XG4gICAgc2VjdGlvbnMucHVzaChgQW5hbHlzaXM6ICR7c2VvUWEuc2VhcmNoX2ludGVudF9hbGlnbm1lbnQuYW5hbHlzaXN9YCk7XG4gICAgc2VjdGlvbnMucHVzaCgnXFxuIyMgUHJpbWFyeSBLZXl3b3JkIFVzYWdlJyk7XG4gICAgc2VjdGlvbnMucHVzaChgU2NvcmU6ICR7c2VvUWEucHJpbWFyeV9rZXl3b3JkX3VzYWdlLnNjb3JlfS8xMDBgKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBPY2N1cnJlbmNlczogJHtzZW9RYS5wcmltYXJ5X2tleXdvcmRfdXNhZ2Uub2NjdXJyZW5jZXN9IHRpbWVzYCk7XG4gICAgc2VjdGlvbnMucHVzaChgUGxhY2VtZW50OiAke3Nlb1FhLnByaW1hcnlfa2V5d29yZF91c2FnZS5wbGFjZW1lbnRfYW5hbHlzaXN9YCk7XG4gICAgc2VjdGlvbnMucHVzaCgnXFxuIyMgU2Vjb25kYXJ5IEtleXdvcmRzJyk7XG4gICAgc2VjdGlvbnMucHVzaChgU2NvcmU6ICR7c2VvUWEuc2Vjb25kYXJ5X2tleXdvcmRfdXNhZ2Uuc2NvcmV9LzEwMGApO1xuICAgIHNlY3Rpb25zLnB1c2goYENvdmVyZWQ6ICR7c2VvUWEuc2Vjb25kYXJ5X2tleXdvcmRfdXNhZ2Uua2V5d29yZHNfY292ZXJlZC5qb2luKCcsICcpfWApO1xuICAgIGlmIChzZW9RYS5zZWNvbmRhcnlfa2V5d29yZF91c2FnZS5nYXBzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgc2VjdGlvbnMucHVzaChgR2FwczogJHtzZW9RYS5zZWNvbmRhcnlfa2V5d29yZF91c2FnZS5nYXBzLmpvaW4oJywgJyl9YCk7XG4gICAgfVxuICAgIHNlY3Rpb25zLnB1c2goJ1xcbiMjIEhlYWRpbmcgU3RydWN0dXJlJyk7XG4gICAgc2VjdGlvbnMucHVzaChgU2NvcmU6ICR7c2VvUWEuaGVhZGluZ19zdHJ1Y3R1cmVfcmV2aWV3LnNjb3JlfS8xMDBgKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBIMSBQcmVzZW50OiAke3Nlb1FhLmhlYWRpbmdfc3RydWN0dXJlX3Jldmlldy5oMV9wcmVzZW50fWApO1xuICAgIHNlY3Rpb25zLnB1c2goYEgyIENvdW50OiAke3Nlb1FhLmhlYWRpbmdfc3RydWN0dXJlX3Jldmlldy5oMl9jb3VudH1gKTtcbiAgICBpZiAoc2VvUWEuaGVhZGluZ19zdHJ1Y3R1cmVfcmV2aWV3LmhpZXJhcmNoeV9pc3N1ZXMubGVuZ3RoID4gMCkge1xuICAgICAgICBzZWN0aW9ucy5wdXNoKGBJc3N1ZXM6ICR7c2VvUWEuaGVhZGluZ19zdHJ1Y3R1cmVfcmV2aWV3LmhpZXJhcmNoeV9pc3N1ZXMuam9pbignOyAnKX1gKTtcbiAgICB9XG4gICAgc2VjdGlvbnMucHVzaCgnXFxuIyMgQ29udGVudCBEZXB0aCcpO1xuICAgIHNlY3Rpb25zLnB1c2goYFNjb3JlOiAke3Nlb1FhLmNvbnRlbnRfZGVwdGhfcmV2aWV3LnNjb3JlfS8xMDBgKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBXb3JkIENvdW50OiAke3Nlb1FhLmNvbnRlbnRfZGVwdGhfcmV2aWV3LndvcmRfY291bnR9IHdvcmRzYCk7XG4gICAgc2VjdGlvbnMucHVzaChgQ292ZXJhZ2U6ICR7c2VvUWEuY29udGVudF9kZXB0aF9yZXZpZXcuc2VjdGlvbl9jb3ZlcmFnZX1gKTtcbiAgICBpZiAoc2VvUWEuY29udGVudF9kZXB0aF9yZXZpZXcuZGVwdGhfaXNzdWVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgc2VjdGlvbnMucHVzaChgSXNzdWVzOiAke3Nlb1FhLmNvbnRlbnRfZGVwdGhfcmV2aWV3LmRlcHRoX2lzc3Vlcy5qb2luKCc7ICcpfWApO1xuICAgIH1cbiAgICBzZWN0aW9ucy5wdXNoKCdcXG4jIyBSZWFkYWJpbGl0eScpO1xuICAgIHNlY3Rpb25zLnB1c2goYFNjb3JlOiAke3Nlb1FhLnJlYWRhYmlsaXR5X3Jldmlldy5zY29yZX0vMTAwYCk7XG4gICAgc2VjdGlvbnMucHVzaChgQXZnIFNlbnRlbmNlIExlbmd0aDogJHtzZW9RYS5yZWFkYWJpbGl0eV9yZXZpZXcuYXZnX3NlbnRlbmNlX2xlbmd0aH0gd29yZHNgKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBSZWFkaW5nIExldmVsOiAke3Nlb1FhLnJlYWRhYmlsaXR5X3Jldmlldy5mbGVzY2hfa2luY2FpZF9lc3RpbWF0ZX1gKTtcbiAgICBpZiAoc2VvUWEucmVhZGFiaWxpdHlfcmV2aWV3LnJlYWRhYmlsaXR5X2lzc3Vlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHNlY3Rpb25zLnB1c2goYElzc3VlczogJHtzZW9RYS5yZWFkYWJpbGl0eV9yZXZpZXcucmVhZGFiaWxpdHlfaXNzdWVzLmpvaW4oJzsgJyl9YCk7XG4gICAgfVxuICAgIHNlY3Rpb25zLnB1c2goJ1xcbiMjIEludGVybmFsIExpbmtpbmcnKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBTY29yZTogJHtzZW9RYS5pbnRlcm5hbF9saW5raW5nX3Jldmlldy5zY29yZX0vMTAwYCk7XG4gICAgc2VjdGlvbnMucHVzaChgTGlua3MgRm91bmQ6ICR7c2VvUWEuaW50ZXJuYWxfbGlua2luZ19yZXZpZXcuaW50ZXJuYWxfbGlua3NfZm91bmR9YCk7XG4gICAgaWYgKHNlb1FhLmludGVybmFsX2xpbmtpbmdfcmV2aWV3LmludGVybmFsX2xpbmtfcmVjb21tZW5kYXRpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgc2VjdGlvbnMucHVzaChgUmVjb21tZW5kYXRpb25zOiAke3Nlb1FhLmludGVybmFsX2xpbmtpbmdfcmV2aWV3LmludGVybmFsX2xpbmtfcmVjb21tZW5kYXRpb25zLmpvaW4oJzsgJyl9YCk7XG4gICAgfVxuICAgIHNlY3Rpb25zLnB1c2goJ1xcbiMjIENUQSAmIEJyYW5kIEd1aWRlbGluZXMnKTtcbiAgICBpZiAoaW5wdXQuY3RhX25vdGVzKSB7XG4gICAgICAgIHNlY3Rpb25zLnB1c2goYENUQSBOb3RlczogJHtpbnB1dC5jdGFfbm90ZXN9YCk7XG4gICAgfVxuICAgIGlmIChpbnB1dC5icmFuZF92b2ljZV9ub3Rlcykge1xuICAgICAgICBzZWN0aW9ucy5wdXNoKGBCcmFuZCBWb2ljZTogJHtpbnB1dC5icmFuZF92b2ljZV9ub3Rlc31gKTtcbiAgICB9XG4gICAgaWYgKGlucHV0LmF1ZGllbmNlX25vdGVzKSB7XG4gICAgICAgIHNlY3Rpb25zLnB1c2goYFRhcmdldCBBdWRpZW5jZTogJHtpbnB1dC5hdWRpZW5jZV9ub3Rlc31gKTtcbiAgICB9XG4gICAgcmV0dXJuIHNlY3Rpb25zLmpvaW4oJ1xcbicpO1xufVxucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvZWRpdG9yLXN0ZXAvL3J1bkVkaXRvclN0ZXBcIiwgcnVuRWRpdG9yU3RlcCk7XG4iLCAiaW1wb3J0IHsgcmVnaXN0ZXJTdGVwRnVuY3Rpb24gfSBmcm9tIFwid29ya2Zsb3cvaW50ZXJuYWwvcHJpdmF0ZVwiO1xuaW1wb3J0ICdzZXJ2ZXItb25seSc7XG5pbXBvcnQgeyB1cGRhdGVSdW5TdGF0dXMsIHVwZGF0ZVJ1bkVycm9yLCBjb21wbGV0ZVJ1biB9IGZyb20gJy4uLy4uL3N0b3JhZ2UvcnVucyc7XG4vKipfX2ludGVybmFsX3dvcmtmbG93c3tcInN0ZXBzXCI6e1wibGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9oZWxwZXJzLnRzXCI6e1wiY29tcGxldGVSdW5TdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvaGVscGVycy8vY29tcGxldGVSdW5TdGVwXCJ9LFwibWFya1J1bkZhaWxlZFN0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9oZWxwZXJzLy9tYXJrUnVuRmFpbGVkU3RlcFwifSxcIm1hcmtSdW5SdW5uaW5nU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL2hlbHBlcnMvL21hcmtSdW5SdW5uaW5nU3RlcFwifX19fSovO1xuLyoqXG4gKiBNYXJrIGEgcnVuIGFzIHJ1bm5pbmcgKHRyYW5zaXRpb24gZnJvbSBxdWV1ZWQgdG8gcnVubmluZylcbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gbWFya1J1blJ1bm5pbmdTdGVwKHJ1bklkKSB7XG4gICAgY29uc29sZS5sb2coYFt2MF0gSGVscGVyOiBNYXJraW5nIHJ1biAke3J1bklkfSBhcyBydW5uaW5nYCk7XG4gICAgYXdhaXQgdXBkYXRlUnVuU3RhdHVzKHJ1bklkLCAncmVzZWFyY2hpbmcnKTtcbn1cbi8qKlxuICogTWFyayBhIHJ1biBhcyBmYWlsZWQgd2l0aCBlcnJvciBtZXNzYWdlXG4gKiBDYWxsYmFjayBpcyBzZW50IGJ5IHdvcmtmbG93IG9yY2hlc3RyYXRvciwgbm90IGhlcmVcbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gbWFya1J1bkZhaWxlZFN0ZXAocnVuSWQsIGVycm9yTWVzc2FnZSkge1xuICAgIGNvbnNvbGUubG9nKGBbdjBdIEhlbHBlcjogTWFya2luZyBydW4gJHtydW5JZH0gYXMgZmFpbGVkIHdpdGggZXJyb3I6ICR7ZXJyb3JNZXNzYWdlfWApO1xuICAgIGF3YWl0IHVwZGF0ZVJ1bkVycm9yKHJ1bklkLCBlcnJvck1lc3NhZ2UpO1xufVxuLyoqXG4gKiBDb21wbGV0ZSBhIHJ1biB3aXRoIGZpbmFsIG91dHB1dFxuICogQ2FsbGJhY2sgaXMgc2VudCBieSB3b3JrZmxvdyBvcmNoZXN0cmF0b3IsIG5vdCBoZXJlXG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNvbXBsZXRlUnVuU3RlcChydW5JZCwgZmluYWxPdXRwdXQpIHtcbiAgICBjb25zb2xlLmxvZyhgW3YwXSBIZWxwZXI6IENvbXBsZXRpbmcgcnVuICR7cnVuSWR9YCk7XG4gICAgYXdhaXQgY29tcGxldGVSdW4ocnVuSWQsIGZpbmFsT3V0cHV0KTtcbn1cbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL2hlbHBlcnMvL21hcmtSdW5SdW5uaW5nU3RlcFwiLCBtYXJrUnVuUnVubmluZ1N0ZXApO1xucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvaGVscGVycy8vbWFya1J1bkZhaWxlZFN0ZXBcIiwgbWFya1J1bkZhaWxlZFN0ZXApO1xucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvaGVscGVycy8vY29tcGxldGVSdW5TdGVwXCIsIGNvbXBsZXRlUnVuU3RlcCk7XG4iLCAiaW1wb3J0IHsgcmVnaXN0ZXJTdGVwRnVuY3Rpb24gfSBmcm9tIFwid29ya2Zsb3cvaW50ZXJuYWwvcHJpdmF0ZVwiO1xuaW1wb3J0ICdzZXJ2ZXItb25seSc7XG5pbXBvcnQgeyBnZW5lcmF0ZVRleHQgfSBmcm9tICdhaSc7XG5pbXBvcnQgeyBvcGVuYWkgfSBmcm9tICdAYWktc2RrL29wZW5haSc7XG5pbXBvcnQgeyBnZXRBZ2VudENvbmZpZyB9IGZyb20gJy4uLy4uL3N0b3JhZ2UvYWdlbnQtY29uZmlncyc7XG4vKipfX2ludGVybmFsX3dvcmtmbG93c3tcInN0ZXBzXCI6e1wibGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9tZXRhLXN0ZXAudHNcIjp7XCJydW5NZXRhU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL21ldGEtc3RlcC8vcnVuTWV0YVN0ZXBcIn19fX0qLztcbi8qKlxuICogTWV0YSBBZ2VudCBTdGVwIC0gUGhhc2UgMkMtRlxuICogR2VuZXJhdGVzIFNFTyBtZXRhZGF0YSBmb3IgaHVtYW4gcmV2aWV3XG4gKiBEb2VzIE5PVCBwdWJsaXNoLCBjYWxsIGV4dGVybmFsIHNlcnZpY2VzLCBvciBvdmVyd3JpdGUgZHJhZnRzXG4gKiBPdXRwdXQgZ29lcyB0byBmaW5hbF9vdXRwdXRfanNvbiBhcyBtZXRhX2pzb25cbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gcnVuTWV0YVN0ZXAocnVuSWQsIGlucHV0LCByZXNlYXJjaCwgb3V0bGluZSwgb3JpZ2luYWxEcmFmdCwgc2VvUWEsIGVkaXRlZERyYWZ0KSB7XG4gICAgY29uc29sZS5sb2coYFt2MF0gTWV0YSBzdGVwOiBTdGFydGluZyBmb3IgcnVuICR7cnVuSWR9YCk7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gTG9hZCBhZ2VudCBjb25maWcgZnJvbSBkYXRhYmFzZVxuICAgICAgICBjb25zdCBhZ2VudENvbmZpZyA9IGF3YWl0IGdldEFnZW50Q29uZmlnKCdtZXRhJyk7XG4gICAgICAgIGlmICghYWdlbnRDb25maWcpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQWN0aXZlIGFnZW50IGNvbmZpZyBub3QgZm91bmQgZm9yIGFnZW50X2tleTogbWV0YScpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFNFTyBCbG9nIEFnZW50IENvbmZpZyBMb2FkZWQ6IG1ldGEgdiR7YWdlbnRDb25maWcudmVyc2lvbn1gKTtcbiAgICAgICAgLy8gQnVpbGQgc3lzdGVtIHByb21wdCBmcm9tIGRhdGFiYXNlIGNvbmZpZ1xuICAgICAgICBjb25zdCBzeXN0ZW1Qcm9tcHQgPSBbXG4gICAgICAgICAgICBhZ2VudENvbmZpZy5zeXN0ZW1fcHJvbXB0LFxuICAgICAgICAgICAgYWdlbnRDb25maWcuc2tpbGxfbWFya2Rvd25cbiAgICAgICAgXS5maWx0ZXIoQm9vbGVhbikuam9pbignXFxuXFxuJyk7XG4gICAgICAgIC8vIEJ1aWxkIGNvbnRleHQgZm9yIG1ldGEgZ2VuZXJhdGlvblxuICAgICAgICBjb25zdCBtZXRhQ29udGV4dCA9IGJ1aWxkTWV0YUNvbnRleHQoaW5wdXQsIHJlc2VhcmNoLCBvdXRsaW5lLCBzZW9RYSwgb3JpZ2luYWxEcmFmdCwgZWRpdGVkRHJhZnQpO1xuICAgICAgICAvLyBHZXQgbW9kZWwgbmFtZTogdXNlIERCIGNvbmZpZyBpZiBhdmFpbGFibGUsIG90aGVyd2lzZSBmYWxsIGJhY2sgdG8gZW52IHZhciBvciBkZWZhdWx0XG4gICAgICAgIGNvbnN0IG1vZGVsTmFtZSA9IGFnZW50Q29uZmlnLm1vZGVsIHx8IHByb2Nlc3MuZW52Lk1FVEFfQUdFTlRfTU9ERUwgfHwgJ2dwdC01LjQtbWluaSc7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIE1ldGEgc3RlcDogVXNpbmcgbW9kZWw6ICR7bW9kZWxOYW1lfWApO1xuICAgICAgICAvLyBHZW5lcmF0ZSBtZXRhZGF0YVxuICAgICAgICBjb25zdCB7IHRleHQ6IG1ldGFBbmFseXNpcyB9ID0gYXdhaXQgZ2VuZXJhdGVUZXh0KHtcbiAgICAgICAgICAgIG1vZGVsOiBvcGVuYWkobW9kZWxOYW1lKSxcbiAgICAgICAgICAgIHN5c3RlbTogc3lzdGVtUHJvbXB0LFxuICAgICAgICAgICAgdGVtcGVyYXR1cmU6IDAuNSxcbiAgICAgICAgICAgIG1lc3NhZ2VzOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICByb2xlOiAndXNlcicsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IG1ldGFDb250ZXh0XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXVxuICAgICAgICB9KTtcbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gTWV0YSBzdGVwOiBSZWNlaXZlZCBhbmFseXNpcywgcGFyc2luZyBKU09OYCk7XG4gICAgICAgIC8vIFBhcnNlIHRoZSByZXNwb25zZSAtIEZBSUwtTE9VRCBpbiBwcm9kdWN0aW9uXG4gICAgICAgIGxldCBtZXRhT3V0cHV0O1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gRXh0cmFjdCBKU09OIGZyb20gcmVzcG9uc2UgKG1heSBoYXZlIHN1cnJvdW5kaW5nIHRleHQpXG4gICAgICAgICAgICBjb25zdCBqc29uTWF0Y2ggPSBtZXRhQW5hbHlzaXMubWF0Y2goL1xce1tcXHNcXFNdKlxcfS8pO1xuICAgICAgICAgICAgaWYgKCFqc29uTWF0Y2gpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ01ldGEgb3V0cHV0IHBhcnNlIGZhaWxlZDogTm8gSlNPTiBmb3VuZCBpbiByZXNwb25zZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbWV0YU91dHB1dCA9IEpTT04ucGFyc2UoanNvbk1hdGNoWzBdKTtcbiAgICAgICAgfSBjYXRjaCAocGFyc2VFcnJvcikge1xuICAgICAgICAgICAgLy8gSW4gcHJvZHVjdGlvbiwgZmFpbCBsb3VkLiBPbmx5IHVzZSBmYWxsYmFjayBpbiBtb2NrL3Rlc3QgbW9kZS5cbiAgICAgICAgICAgIGNvbnN0IGlzVGVzdE1vZGUgPSBpbnB1dC50ZXN0X3J1biA9PT0gdHJ1ZSB8fCBpbnB1dC5kZWJ1Z19tYXJrZXIgIT09IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTXNnID0gcGFyc2VFcnJvciBpbnN0YW5jZW9mIEVycm9yID8gcGFyc2VFcnJvci5tZXNzYWdlIDogU3RyaW5nKHBhcnNlRXJyb3IpO1xuICAgICAgICAgICAgaWYgKGlzVGVzdE1vZGUpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFt2MF0gTWV0YSBzdGVwOiBQYXJzZSBmYWlsZWQgaW4gdGVzdCBtb2RlLCB1c2luZyBmYWxsYmFjazogJHtlcnJvck1zZ31gKTtcbiAgICAgICAgICAgICAgICBtZXRhT3V0cHV0ID0gZ2VuZXJhdGVGYWxsYmFja01ldGEoaW5wdXQsIHJlc2VhcmNoLCBzZW9RYSwgb3JpZ2luYWxEcmFmdCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZ1bGxFcnJvciA9IGBNZXRhIG91dHB1dCBwYXJzZSBmYWlsZWQ6ICR7ZXJyb3JNc2d9YDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbdjBdIE1ldGEgc3RlcDogJHtmdWxsRXJyb3J9YCk7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGZ1bGxFcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gRkFJTC1MT1VEOiBWYWxpZGF0ZSBhbGwgcmVxdWlyZWQgZmllbGRzIGV4aXN0IGFuZCBoYXZlIGNvcnJlY3QgdHlwZXNcbiAgICAgICAgY29uc3QgZmllbGRWYWxpZGF0aW9ucyA9IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBmaWVsZDogJ21ldGFfdGl0bGUnLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICAgIGNoZWNrOiAodik9PnR5cGVvZiB2ID09PSAnc3RyaW5nJyAmJiB2Lmxlbmd0aCA+IDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZmllbGQ6ICdtZXRhX2Rlc2NyaXB0aW9uJyxcbiAgICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgICBjaGVjazogKHYpPT50eXBlb2YgdiA9PT0gJ3N0cmluZycgJiYgdi5sZW5ndGggPiAwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZpZWxkOiAnc2x1ZycsXG4gICAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICAgICAgY2hlY2s6ICh2KT0+dHlwZW9mIHYgPT09ICdzdHJpbmcnICYmIHYubGVuZ3RoID4gMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBmaWVsZDogJ3NvY2lhbF9wcmV2aWV3JyxcbiAgICAgICAgICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgICAgICAgICBjaGVjazogKHYpPT50eXBlb2YgdiA9PT0gJ29iamVjdCcgJiYgdi50aXRsZSAmJiB2LmRlc2NyaXB0aW9uXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZpZWxkOiAnc2NoZW1hX21hcmt1cCcsXG4gICAgICAgICAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgICAgICAgICAgY2hlY2s6ICh2KT0+dHlwZW9mIHYgPT09ICdvYmplY3QnICYmIHZbJ0B0eXBlJ10gJiYgdi5oZWFkbGluZSAmJiB2LmRlc2NyaXB0aW9uXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZpZWxkOiAncHJpbWFyeV9rZXl3b3JkX3VzZWQnLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgICAgICAgICBjaGVjazogKHYpPT50eXBlb2YgdiA9PT0gJ2Jvb2xlYW4nXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZpZWxkOiAnc2Vjb25kYXJ5X2tleXdvcmRzX3JlZmxlY3RlZCcsXG4gICAgICAgICAgICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgICAgICAgICAgICBjaGVjazogKHYpPT5BcnJheS5pc0FycmF5KHYpXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZpZWxkOiAnY2xpZW50X2dvYWxfcmVmbGVjdGVkJyxcbiAgICAgICAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgICAgICAgICAgY2hlY2s6ICh2KT0+dHlwZW9mIHYgPT09ICdib29sZWFuJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBmaWVsZDogJ2h1bWFuX3Jldmlld19yZXF1aXJlZCcsXG4gICAgICAgICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICAgICAgICAgIGNoZWNrOiAodik9PnR5cGVvZiB2ID09PSAnYm9vbGVhbidcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZmllbGQ6ICdyZXZpZXdfcmVhZHknLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgICAgICAgICBjaGVjazogKHYpPT50eXBlb2YgdiA9PT0gJ2Jvb2xlYW4nXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZpZWxkOiAnbWV0YV9ub3RlcycsXG4gICAgICAgICAgICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgICAgICAgICAgICBjaGVjazogKHYpPT5BcnJheS5pc0FycmF5KHYpXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZpZWxkOiAnbmVlZHNfcmV2aWV3JyxcbiAgICAgICAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgICAgICAgICAgY2hlY2s6ICh2KT0+dHlwZW9mIHYgPT09ICdib29sZWFuJ1xuICAgICAgICAgICAgfVxuICAgICAgICBdO1xuICAgICAgICBjb25zdCB2YWxpZGF0aW9uRXJyb3JzID0gW107XG4gICAgICAgIGZvciAoY29uc3QgdmFsaWRhdGlvbiBvZiBmaWVsZFZhbGlkYXRpb25zKXtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gbWV0YU91dHB1dFt2YWxpZGF0aW9uLmZpZWxkXTtcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdmFsaWRhdGlvbkVycm9ycy5wdXNoKGAke3ZhbGlkYXRpb24uZmllbGR9IGlzIG1pc3NpbmdgKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIXZhbGlkYXRpb24uY2hlY2sodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgdmFsaWRhdGlvbkVycm9ycy5wdXNoKGAke3ZhbGlkYXRpb24uZmllbGR9IGhhcyBpbnZhbGlkIHR5cGUgKGV4cGVjdGVkICR7dmFsaWRhdGlvbi50eXBlfSlgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAodmFsaWRhdGlvbkVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE1ldGEgb3V0cHV0IHZhbGlkYXRpb24gZmFpbGVkOiAke3ZhbGlkYXRpb25FcnJvcnMuam9pbignOyAnKX1gKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBMaWdodHdlaWdodCBmaWVsZCBjb25zdHJhaW50cyAobm8gc2lsZW50IG1vZGlmaWNhdGlvbilcbiAgICAgICAgaWYgKG1ldGFPdXRwdXQubWV0YV90aXRsZS5sZW5ndGggPiA3MCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBNZXRhIHRpdGxlIHRvbyBsb25nOiAke21ldGFPdXRwdXQubWV0YV90aXRsZS5sZW5ndGh9IGNoYXJzLCBtYXggNzBgKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobWV0YU91dHB1dC5tZXRhX2Rlc2NyaXB0aW9uLmxlbmd0aCA+IDE2MCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBNZXRhIGRlc2NyaXB0aW9uIHRvbyBsb25nOiAke21ldGFPdXRwdXQubWV0YV9kZXNjcmlwdGlvbi5sZW5ndGh9IGNoYXJzLCBtYXggMTYwYCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gTWV0YSBzdGVwOiBDb21wbGV0ZSBmb3IgcnVuICR7cnVuSWR9YCwgYEdlbmVyYXRlZCBtZXRhZGF0YTogJHttZXRhT3V0cHV0Lm1ldGFfdGl0bGUuc3Vic3RyaW5nKDAsIDUwKX0uLi5gKTtcbiAgICAgICAgcmV0dXJuIG1ldGFPdXRwdXQ7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICBjb25zb2xlLmVycm9yKGBbdjBdIE1ldGEgc3RlcCBlcnJvciBmb3IgcnVuICR7cnVuSWR9OiAke2Vycm9yTWVzc2FnZX1gKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxufVxuLyoqXG4gKiBCdWlsZCBjb250ZXh0IHByb21wdCBmb3IgbWV0YWRhdGEgZ2VuZXJhdGlvblxuICovIGZ1bmN0aW9uIGJ1aWxkTWV0YUNvbnRleHQoaW5wdXQsIHJlc2VhcmNoLCBvdXRsaW5lLCBzZW9RYSwgb3JpZ2luYWxEcmFmdCwgZWRpdGVkRHJhZnQpIHtcbiAgICAvLyBWYWxpZGF0ZSByZXF1aXJlZCByZXNlYXJjaC5rZXlfZmluZGluZ3MgYmVmb3JlIHVzaW5nXG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHJlc2VhcmNoLmtleV9maW5kaW5ncykpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZXNlYXJjaCBvdXRwdXQgbWlzc2luZyByZXF1aXJlZCBrZXlfZmluZGluZ3MgYXJyYXkgZm9yIG1ldGEtc3RlcCcpO1xuICAgIH1cbiAgICBjb25zdCB3b3JkQ291bnQgPSBlZGl0ZWREcmFmdC5zcGxpdCgvXFxzKy8pLmxlbmd0aDtcbiAgICBjb25zdCBoZWFkaW5ncyA9IGVkaXRlZERyYWZ0Lm1hdGNoKC9eIytcXHMrLiskL2dtKSB8fCBbXTtcbiAgICBjb25zdCBrZXlGaW5kaW5nc1N1bW1hcnkgPSByZXNlYXJjaC5rZXlfZmluZGluZ3Muc2xpY2UoMCwgMykuam9pbignXFxuLSAnKTtcbiAgICByZXR1cm4gYFlvdSBhcmUgYW4gZXhwZXJ0IFNFTyBtZXRhZGF0YSBzcGVjaWFsaXN0LiBHZW5lcmF0ZSBTRU8gbWV0YWRhdGEgZm9yIGEgYmxvZyBwb3N0IGZvciBodW1hbiByZXZpZXcuXG5cbkJMT0cgVE9QSUM6ICR7aW5wdXQuYmxvZ190b3BpY31cbkJVU0lORVNTIE5BTUU6ICR7aW5wdXQuYnVzaW5lc3NfbmFtZSB8fCAnTm90IHByb3ZpZGVkJ31cbldFQlNJVEUgVVJMOiAke2lucHV0LndlYnNpdGVfdXJsIHx8ICdOb3QgcHJvdmlkZWQnfVxuUFJJTUFSWSBLRVlXT1JEOiAke2lucHV0LnByaW1hcnlfa2V5d29yZH1cblNFQ09OREFSWSBLRVlXT1JEUzogJHsoaW5wdXQuc2Vjb25kYXJ5X2tleXdvcmRzIHx8IFtdKS5qb2luKCcsICcpIHx8ICdOb25lIHByb3ZpZGVkJ31cblRBUkdFVCBBVURJRU5DRTogJHtpbnB1dC5hdWRpZW5jZV9ub3RlcyB8fCAnR2VuZXJhbCBhdWRpZW5jZSd9XG5cblJFU0VBUkNIIFNVTU1BUlk6XG4tICR7a2V5RmluZGluZ3NTdW1tYXJ5fVxuXG5PVVRMSU5FIFNUUlVDVFVSRTpcbiR7b3V0bGluZS5zZWN0aW9ucy5tYXAoKHMpPT5gLSAke3MuaGVhZGluZ30gKCR7cy5zdWJzZWN0aW9ucz8ubGVuZ3RoIHx8IDB9IHN1YnNlY3Rpb25zKWApLmpvaW4oJ1xcbicpfVxuXG5TRU8gUUEgUkVWSUVXOlxuLSBPdmVyYWxsIFNjb3JlOiAke3Nlb1FhLm92ZXJhbGxfc2NvcmV9XG4tIFNlYXJjaCBJbnRlbnQgQWxpZ25tZW50OiAke3Nlb1FhLnNlYXJjaF9pbnRlbnRfYWxpZ25tZW50LnNjb3JlfVxuLSBQcmltYXJ5IEtleXdvcmQgVXNhZ2U6ICR7c2VvUWEucHJpbWFyeV9rZXl3b3JkX3VzYWdlLnNjb3JlfVxuLSBIZWFkaW5nIFN0cnVjdHVyZTogJHtzZW9RYS5oZWFkaW5nX3N0cnVjdHVyZV9yZXZpZXcuc2NvcmV9XG4tIENsaWVudCBHb2FsIEFsaWdubWVudDogJHtzZW9RYS5jbGllbnRfZ29hbF9hbGlnbm1lbnQuc2NvcmV9XG5cbkNPTlRFTlQgU1RBVFM6XG4tIFdvcmQgQ291bnQ6ICR7d29yZENvdW50fVxuLSBIZWFkaW5nczogJHtoZWFkaW5ncy5sZW5ndGh9XG4tIEhhcyBDVEE6ICR7aW5wdXQuY3RhX25vdGVzID8gJ1llcycgOiAnTm8nfVxuLSBIYXMgSW50ZXJuYWwgTGlua3M6ICR7aW5wdXQuaW50ZXJuYWxfbGlua19ub3RlcyA/ICdZZXMnIDogJ05vJ31cblxuR2VuZXJhdGUgbWV0YWRhdGEgdGhhdDpcbjEuIEFjY3VyYXRlbHkgcmVwcmVzZW50cyB0aGUgYmxvZyBjb250ZW50IChkbyBub3QgaW52ZW50IGNsYWltcylcbjIuIEluY2x1ZGVzIHRoZSBwcmltYXJ5IGtleXdvcmQgbmF0dXJhbGx5IGluIHRpdGxlIGFuZCBkZXNjcmlwdGlvblxuMy4gSXMgU0VPLW9wdGltaXplZCBmb3Igc2VhcmNoIGVuZ2luZXNcbjQuIElzIGNvbXBlbGxpbmcgZm9yIGh1bWFuIHJlYWRlcnMgYW5kIENUUlxuNS4gRm9sbG93cyBiZXN0IHByYWN0aWNlcyAodGl0bGUgbWF4IDcwIGNoYXJzLCBkZXNjcmlwdGlvbiBtYXggMTYwIGNoYXJzKVxuNi4gSW5jbHVkZXMgcmV2aWV3IG5vdGVzIGZvciB0aGUgaHVtYW4gZWRpdG9yXG5cblJldHVybiB2YWxpZCBKU09OIG9ubHkgdXNpbmcgZXhhY3RseSB0aGVzZSB0b3AtbGV2ZWwga2V5czpcbm1ldGFfdGl0bGUsIG1ldGFfZGVzY3JpcHRpb24sIHNsdWcsIHNvY2lhbF9wcmV2aWV3LCBzY2hlbWFfbWFya3VwLCBwcmltYXJ5X2tleXdvcmRfdXNlZCwgc2Vjb25kYXJ5X2tleXdvcmRzX3JlZmxlY3RlZCwgY2xpZW50X2dvYWxfcmVmbGVjdGVkLCBodW1hbl9yZXZpZXdfcmVxdWlyZWQsIHJldmlld19yZWFkeSwgbWV0YV9ub3RlcywgbmVlZHNfcmV2aWV3LlxuXG5EbyBub3QgdXNlIG9sZCBrZXlzOlxuc2VvX3RpdGxlLCBzdWdnZXN0ZWRfc2x1Zywgc2Vjb25kYXJ5X2tleXdvcmRzX3VzZWQsIGh1bWFuX3Jldmlld19ub3RlcywgZXhjZXJwdCwgb2dfdGl0bGUsIG9nX2Rlc2NyaXB0aW9uLCBjYW5vbmljYWxfdXJsX3N1Z2dlc3Rpb24sIHNjaGVtYV90eXBlX3N1Z2dlc3Rpb24uXG5cblJldHVybiBhIEpTT04gb2JqZWN0IHdpdGggdGhpcyBleGFjdCBzY2hlbWE6XG57XG4gIFwibWV0YV90aXRsZVwiOiBcIlNFTy1vcHRpbWl6ZWQgdGl0bGUgKG1heCA3MCBjaGFycywgaW5jbHVkZSBwcmltYXJ5IGtleXdvcmQpXCIsXG4gIFwibWV0YV9kZXNjcmlwdGlvblwiOiBcIkNvbXBlbGxpbmcgZGVzY3JpcHRpb24gKG1heCAxNjAgY2hhcnMsIGluY2x1ZGUgcHJpbWFyeSBrZXl3b3JkKVwiLFxuICBcInNsdWdcIjogXCJ1cmwtc2x1Zy1mb3JtYXRcIixcbiAgXCJzb2NpYWxfcHJldmlld1wiOiB7XG4gICAgXCJ0aXRsZVwiOiBcIlNvY2lhbCBtZWRpYSBwcmV2aWV3IHRpdGxlXCIsXG4gICAgXCJkZXNjcmlwdGlvblwiOiBcIlNvY2lhbCBtZWRpYSBwcmV2aWV3IGRlc2NyaXB0aW9uXCJcbiAgfSxcbiAgXCJzY2hlbWFfbWFya3VwXCI6IHtcbiAgICBcIkB0eXBlXCI6IFwiQmxvZ1Bvc3RpbmdcIixcbiAgICBcImhlYWRsaW5lXCI6IFwiQXJ0aWNsZSBoZWFkbGluZVwiLFxuICAgIFwiZGVzY3JpcHRpb25cIjogXCJBcnRpY2xlIGRlc2NyaXB0aW9uXCJcbiAgfSxcbiAgXCJwcmltYXJ5X2tleXdvcmRfdXNlZFwiOiB0cnVlLFxuICBcInNlY29uZGFyeV9rZXl3b3Jkc19yZWZsZWN0ZWRcIjogW1wia2V5d29yZDFcIiwgXCJrZXl3b3JkMlwiXSxcbiAgXCJjbGllbnRfZ29hbF9yZWZsZWN0ZWRcIjogdHJ1ZSxcbiAgXCJodW1hbl9yZXZpZXdfcmVxdWlyZWRcIjogZmFsc2UsXG4gIFwicmV2aWV3X3JlYWR5XCI6IHRydWUsXG4gIFwibWV0YV9ub3Rlc1wiOiBbXCJub3RlMVwiLCBcIm5vdGUyXCJdLFxuICBcIm5lZWRzX3Jldmlld1wiOiBmYWxzZVxufWA7XG59XG4vKipcbiAqIEdlbmVyYXRlIGZhbGxiYWNrIG1ldGFkYXRhIGlmIEFJIHBhcnNpbmcgZmFpbHNcbiAqLyBmdW5jdGlvbiBnZW5lcmF0ZUZhbGxiYWNrTWV0YShpbnB1dCwgcmVzZWFyY2gsIHNlb1FhLCBkcmFmdCkge1xuICAgIGNvbnN0IHByaW1hcnlLZXl3b3JkID0gaW5wdXQucHJpbWFyeV9rZXl3b3JkIHx8ICdibG9nIHBvc3QnO1xuICAgIGNvbnN0IHNsdWcgPSBpbnB1dC5ibG9nX3RvcGljLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvW15hLXowLTldKy9nLCAnLScpLnJlcGxhY2UoL14tfC0kL2csICcnKTtcbiAgICBjb25zdCB3b3JkQ291bnQgPSBkcmFmdC5zcGxpdCgvXFxzKy8pLmxlbmd0aDtcbiAgICByZXR1cm4ge1xuICAgICAgICBtZXRhX3RpdGxlOiBgJHtpbnB1dC5ibG9nX3RvcGljfSAtICR7aW5wdXQuYnVzaW5lc3NfbmFtZSB8fCAnQmxvZyd9YCxcbiAgICAgICAgbWV0YV9kZXNjcmlwdGlvbjogYENvbXByZWhlbnNpdmUgZ3VpZGUgdG8gJHtpbnB1dC5ibG9nX3RvcGljLnRvTG93ZXJDYXNlKCl9LiBSZXNlYXJjaC1iYWNrZWQgaW5zaWdodHMgYW5kIHByYWN0aWNhbCBzdHJhdGVnaWVzLmAsXG4gICAgICAgIHNsdWc6IHNsdWcsXG4gICAgICAgIHNvY2lhbF9wcmV2aWV3OiB7XG4gICAgICAgICAgICB0aXRsZTogYCR7aW5wdXQuYmxvZ190b3BpY30gfCAke2lucHV0LmJ1c2luZXNzX25hbWUgfHwgJ0Jsb2cnfWAsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogYERpc2NvdmVyICR7aW5wdXQuYmxvZ190b3BpYy50b0xvd2VyQ2FzZSgpfS4gQ29tcHJlaGVuc2l2ZSBndWlkZSB3aXRoIHJlc2VhcmNoIGFuZCBpbnNpZ2h0cy5gXG4gICAgICAgIH0sXG4gICAgICAgIHNjaGVtYV9tYXJrdXA6IHtcbiAgICAgICAgICAgICdAdHlwZSc6ICdCbG9nUG9zdGluZycsXG4gICAgICAgICAgICBoZWFkbGluZTogYCR7aW5wdXQuYmxvZ190b3BpY30gLSAke2lucHV0LmJ1c2luZXNzX25hbWUgfHwgJ0Jsb2cnfWAsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogYENvbXByZWhlbnNpdmUgZ3VpZGUgdG8gJHtpbnB1dC5ibG9nX3RvcGljLnRvTG93ZXJDYXNlKCl9LiBSZXNlYXJjaC1iYWNrZWQgaW5zaWdodHMgYW5kIHByYWN0aWNhbCBzdHJhdGVnaWVzLmBcbiAgICAgICAgfSxcbiAgICAgICAgcHJpbWFyeV9rZXl3b3JkX3VzZWQ6IHRydWUsXG4gICAgICAgIHNlY29uZGFyeV9rZXl3b3Jkc19yZWZsZWN0ZWQ6IGlucHV0LnNlY29uZGFyeV9rZXl3b3JkcyB8fCBbXSxcbiAgICAgICAgY2xpZW50X2dvYWxfcmVmbGVjdGVkOiB0cnVlLFxuICAgICAgICBodW1hbl9yZXZpZXdfcmVxdWlyZWQ6IHNlb1FhLm92ZXJhbGxfc2NvcmUgPCA3NSxcbiAgICAgICAgcmV2aWV3X3JlYWR5OiBzZW9RYS5vdmVyYWxsX3Njb3JlID49IDYwLFxuICAgICAgICBtZXRhX25vdGVzOiBbXG4gICAgICAgICAgICBgT3ZlcmFsbCBTRU8gU2NvcmU6ICR7c2VvUWEub3ZlcmFsbF9zY29yZX1gLFxuICAgICAgICAgICAgJ1JldmlldyBhbmQgYWRqdXN0IG1ldGFkYXRhIGFzIG5lZWRlZCBmb3IgeW91ciBicmFuZCB2b2ljZScsXG4gICAgICAgICAgICAnRW5zdXJlIG1ldGEgdGl0bGUgYW5kIGRlc2NyaXB0aW9uIGFyZSBjb21wZWxsaW5nIGZvciBDVFInLFxuICAgICAgICAgICAgJ1ZlcmlmeSBzY2hlbWEgbWFya3VwIG1hdGNoZXMgeW91ciBjb250ZW50IGZvcm1hdCdcbiAgICAgICAgXSxcbiAgICAgICAgbmVlZHNfcmV2aWV3OiBzZW9RYS5vdmVyYWxsX3Njb3JlIDwgNzVcbiAgICB9O1xufVxucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvbWV0YS1zdGVwLy9ydW5NZXRhU3RlcFwiLCBydW5NZXRhU3RlcCk7XG4iLCAiaW1wb3J0IHsgcmVnaXN0ZXJTdGVwRnVuY3Rpb24gfSBmcm9tIFwid29ya2Zsb3cvaW50ZXJuYWwvcHJpdmF0ZVwiO1xuaW1wb3J0ICdzZXJ2ZXItb25seSc7XG5pbXBvcnQgeyBnZW5lcmF0ZVRleHQgfSBmcm9tICdhaSc7XG5pbXBvcnQgeyBvcGVuYWkgfSBmcm9tICdAYWktc2RrL29wZW5haSc7XG5pbXBvcnQgeyB1cGRhdGVSdW5TdGF0dXMgfSBmcm9tICcuLi8uLi9zdG9yYWdlL3J1bnMnO1xuaW1wb3J0IHsgZ2V0QWdlbnRDb25maWcgfSBmcm9tICcuLi8uLi9zdG9yYWdlL2FnZW50LWNvbmZpZ3MnO1xuLyoqX19pbnRlcm5hbF93b3JrZmxvd3N7XCJzdGVwc1wiOntcImxpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvb3V0bGluZS1zdGVwLnRzXCI6e1wicnVuT3V0bGluZVN0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9vdXRsaW5lLXN0ZXAvL3J1bk91dGxpbmVTdGVwXCJ9fX19Ki87XG4vKipcbiAqIE91dGxpbmUgU3RlcCAtIFBoYXNlIDJDLUJcbiAqIFJ1bnMgaW5zaWRlIGEgZHVyYWJsZSBzdGVwIGZ1bmN0aW9uIChoYXMgTm9kZS5qcyBhY2Nlc3MpXG4gKiBDYWxscyBBSSBtb2RlbCB0byBnZW5lcmF0ZSBjb250ZW50IG91dGxpbmUgd2l0aCBzdHJ1Y3R1cmVcbiAqIFVzZXMgcmVzZWFyY2ggZGF0YSBpZiBhdmFpbGFibGUgdG8gaW5mb3JtIG91dGxpbmVcbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gcnVuT3V0bGluZVN0ZXAocnVuSWQsIGlucHV0LCByZXNlYXJjaERhdGEpIHtcbiAgICBjb25zb2xlLmxvZyhgW3YwXSBPdXRsaW5lIHN0ZXA6IENyZWF0aW5nIG91dGxpbmUgZm9yIHJ1biAke3J1bklkfWApO1xuICAgIC8vIENyZWF0ZSBjb250ZXh0IGZyb20gYXZhaWxhYmxlIGRhdGEgKG5lZWRlZCBmb3IgZmFsbGJhY2sgaW4gY2F0Y2ggYmxvY2spXG4gICAgY29uc3QgdG9waWMgPSBpbnB1dC5ibG9nX3RvcGljIHx8IGlucHV0LnRvcGljIHx8ICdZb3VyIFRvcGljJztcbiAgICBjb25zdCBwcmltYXJ5S2V5d29yZCA9IGlucHV0LnByaW1hcnlfa2V5d29yZCB8fCAncHJpbWFyeSBrZXl3b3JkJztcbiAgICBjb25zdCBzZWNvbmRhcnlLZXl3b3JkcyA9IChpbnB1dC5zZWNvbmRhcnlfa2V5d29yZHMgfHwgaW5wdXQua2V5d29yZHMgfHwgW10pLmpvaW4oJywgJykgfHwgJ3NlY29uZGFyeSBrZXl3b3Jkcyc7XG4gICAgY29uc3QgYnVzaW5lc3NOYW1lID0gaW5wdXQuYnVzaW5lc3NfbmFtZSB8fCAnWW91ciBCdXNpbmVzcyc7XG4gICAgY29uc3QgYXVkaWVuY2VOb3RlcyA9IGlucHV0LmF1ZGllbmNlX25vdGVzIHx8ICdUYXJnZXQgYXVkaWVuY2Ugbm90IHNwZWNpZmllZCc7XG4gICAgY29uc3QgYnJhbmRWb2ljZSA9IGlucHV0LmJyYW5kX3ZvaWNlX25vdGVzIHx8ICdQcm9mZXNzaW9uYWwgYW5kIGNsZWFyJztcbiAgICBjb25zdCBjdGFOb3RlcyA9IGlucHV0LmN0YV9ub3RlcyB8fCAnRW5jb3VyYWdlIGVuZ2FnZW1lbnQnO1xuICAgIGNvbnN0IGFkZGl0aW9uYWxOb3RlcyA9IGlucHV0LmFkZGl0aW9uYWxfb3JkZXJfbm90ZXMgfHwgJ05vIGFkZGl0aW9uYWwgbm90ZXMnO1xuICAgIGNvbnN0IHRhcmdldFdvcmRDb3VudCA9IGlucHV0LnRhcmdldF93b3JkX2NvdW50IHx8IDE1MDA7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gTG9hZCBhZ2VudCBjb25maWcgZnJvbSBkYXRhYmFzZVxuICAgICAgICBjb25zdCBhZ2VudENvbmZpZyA9IGF3YWl0IGdldEFnZW50Q29uZmlnKCdvdXRsaW5lJyk7XG4gICAgICAgIGlmICghYWdlbnRDb25maWcpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQWN0aXZlIGFnZW50IGNvbmZpZyBub3QgZm91bmQgZm9yIGFnZW50X2tleTogb3V0bGluZScpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFNFTyBCbG9nIEFnZW50IENvbmZpZyBMb2FkZWQ6IG91dGxpbmUgdiR7YWdlbnRDb25maWcudmVyc2lvbn1gKTtcbiAgICAgICAgLy8gQnVpbGQgc3lzdGVtIHByb21wdCBmcm9tIGRhdGFiYXNlIGNvbmZpZ1xuICAgICAgICBjb25zdCBzeXN0ZW1Qcm9tcHQgPSBbXG4gICAgICAgICAgICBhZ2VudENvbmZpZy5zeXN0ZW1fcHJvbXB0LFxuICAgICAgICAgICAgYWdlbnRDb25maWcuc2tpbGxfbWFya2Rvd25cbiAgICAgICAgXS5maWx0ZXIoQm9vbGVhbikuam9pbignXFxuXFxuJyk7XG4gICAgICAgIC8vIEluY2x1ZGUgcmVzZWFyY2ggaW5zaWdodHMgaWYgYXZhaWxhYmxlXG4gICAgICAgIGxldCByZXNlYXJjaENvbnRleHQgPSAnJztcbiAgICAgICAgaWYgKHJlc2VhcmNoRGF0YSkge1xuICAgICAgICAgICAgcmVzZWFyY2hDb250ZXh0ID0gYFxuXG5SZXNlYXJjaCBJbnNpZ2h0cyBmcm9tIFJlc2VhcmNoIEFnZW50OlxuLSBTZWFyY2ggSW50ZW50OiAke3Jlc2VhcmNoRGF0YS5zZWFyY2hfaW50ZW50IHx8ICdOL0EnfVxuLSBDb250ZW50IEFuZ2xlOiAke3Jlc2VhcmNoRGF0YS5jb250ZW50X2FuZ2xlIHx8ICdOL0EnfVxuLSBUYXJnZXQgQXVkaWVuY2U6ICR7cmVzZWFyY2hEYXRhLnRhcmdldF9hdWRpZW5jZV9zdW1tYXJ5IHx8ICdOL0EnfVxuLSBSZWNvbW1lbmRlZCBTZWN0aW9uczogJHtyZXNlYXJjaERhdGEucmVjb21tZW5kZWRfc2VjdGlvbnM/LmpvaW4oJywgJykgfHwgJ04vQSd9XG4tIFF1ZXN0aW9ucyB0byBBbnN3ZXI6ICR7cmVzZWFyY2hEYXRhLnF1ZXN0aW9uc190b19hbnN3ZXI/LmpvaW4oJywgJykgfHwgJ04vQSd9YDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB1c2VyTWVzc2FnZSA9IGBDcmVhdGUgYW4gb3V0bGluZSBmb3IgdGhpcyBhcnRpY2xlOlxuXG5Ub3BpYzogJHt0b3BpY31cbkJ1c2luZXNzOiAke2J1c2luZXNzTmFtZX1cblByaW1hcnkgS2V5d29yZDogJHtwcmltYXJ5S2V5d29yZH1cblNlY29uZGFyeSBLZXl3b3JkczogJHtzZWNvbmRhcnlLZXl3b3Jkc31cblRhcmdldCBXb3JkIENvdW50OiAke3RhcmdldFdvcmRDb3VudH1cblxuQXVkaWVuY2UgUHJvZmlsZTpcbiR7YXVkaWVuY2VOb3Rlc31cblxuQnJhbmQgVm9pY2U6XG4ke2JyYW5kVm9pY2V9XG5cbkNhbGwtdG8tQWN0aW9uIEZvY3VzOlxuJHtjdGFOb3Rlc31cblxuQWRkaXRpb25hbCBSZXF1aXJlbWVudHM6XG4ke2FkZGl0aW9uYWxOb3Rlc30ke3Jlc2VhcmNoQ29udGV4dH1gO1xuICAgICAgICAvLyBHZXQgbW9kZWwgbmFtZTogdXNlIERCIGNvbmZpZyBpZiBhdmFpbGFibGUsIG90aGVyd2lzZSBmYWxsIGJhY2sgdG8gZW52IHZhciBvciBkZWZhdWx0XG4gICAgICAgIGNvbnN0IG1vZGVsTmFtZSA9IGFnZW50Q29uZmlnLm1vZGVsIHx8IHByb2Nlc3MuZW52Lk9VVExJTkVfQUdFTlRfTU9ERUwgfHwgcHJvY2Vzcy5lbnYuUkVTRUFSQ0hfQUdFTlRfTU9ERUwgfHwgJ2dwdC01LjQtbWluaSc7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIE91dGxpbmUgc3RlcDogVXNpbmcgbW9kZWw6ICR7bW9kZWxOYW1lfWApO1xuICAgICAgICAvLyBVc2UgZGlyZWN0IE9wZW5BSSBwcm92aWRlclxuICAgICAgICBjb25zdCBtb2RlbCA9IG9wZW5haShtb2RlbE5hbWUpO1xuICAgICAgICAvLyBDYWxsIEFJIG1vZGVsXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZ2VuZXJhdGVUZXh0KHtcbiAgICAgICAgICAgIG1vZGVsLFxuICAgICAgICAgICAgc3lzdGVtOiBzeXN0ZW1Qcm9tcHQsXG4gICAgICAgICAgICBwcm9tcHQ6IHVzZXJNZXNzYWdlLFxuICAgICAgICAgICAgdGVtcGVyYXR1cmU6IDAuN1xuICAgICAgICB9KTtcbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gT3V0bGluZSBzdGVwOiBSYXcgcmVzcG9uc2UgbGVuZ3RoOiAke3Jlc3BvbnNlLnRleHQubGVuZ3RofWApO1xuICAgICAgICAvLyBQYXJzZSB0aGUgSlNPTiByZXNwb25zZVxuICAgICAgICBjb25zdCBvdXRsaW5lRGF0YSA9IEpTT04ucGFyc2UocmVzcG9uc2UudGV4dCk7XG4gICAgICAgIC8vIFZhbGlkYXRlIHJlcXVpcmVkIGZpZWxkcyBhbmQgYWRkIGRlZmF1bHRzXG4gICAgICAgIG91dGxpbmVEYXRhLnRpbWVzdGFtcCA9IG91dGxpbmVEYXRhLnRpbWVzdGFtcCB8fCBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgICAgIG91dGxpbmVEYXRhLnRhcmdldF93b3JkX2NvdW50ID0gb3V0bGluZURhdGEudGFyZ2V0X3dvcmRfY291bnQgfHwgdGFyZ2V0V29yZENvdW50O1xuICAgICAgICAvLyBFbnN1cmUgc2VjdGlvbnMgYXJyYXkgZXhpc3RzXG4gICAgICAgIGlmICghb3V0bGluZURhdGEuc2VjdGlvbnMgfHwgIUFycmF5LmlzQXJyYXkob3V0bGluZURhdGEuc2VjdGlvbnMpKSB7XG4gICAgICAgICAgICBvdXRsaW5lRGF0YS5zZWN0aW9ucyA9IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGhlYWRpbmc6ICdJbnRyb2R1Y3Rpb24nLFxuICAgICAgICAgICAgICAgICAgICBwdXJwb3NlOiAnSW50cm9kdWNlIHRvcGljIGFuZCBzZXQgY29udGV4dCcsXG4gICAgICAgICAgICAgICAgICAgIGVzdGltYXRlZF93b3JkczogMTUwLFxuICAgICAgICAgICAgICAgICAgICBrZXlfcG9pbnRzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAnVG9waWMgb3ZlcnZpZXcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ1doeSB0aGlzIG1hdHRlcnMnXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIHNlb19ub3RlczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgJ0luY2x1ZGUgcHJpbWFyeSBrZXl3b3JkIG5hdHVyYWxseSdcbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBoZWFkaW5nOiAnTWFpbiBDb250ZW50JyxcbiAgICAgICAgICAgICAgICAgICAgcHVycG9zZTogJ0RldGFpbGVkIGV4cGxvcmF0aW9uIG9mIHRvcGljJyxcbiAgICAgICAgICAgICAgICAgICAgZXN0aW1hdGVkX3dvcmRzOiAxMDAwLFxuICAgICAgICAgICAgICAgICAgICBrZXlfcG9pbnRzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAnS2V5IGluc2lnaHQgMScsXG4gICAgICAgICAgICAgICAgICAgICAgICAnS2V5IGluc2lnaHQgMicsXG4gICAgICAgICAgICAgICAgICAgICAgICAnS2V5IGluc2lnaHQgMydcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgc2VvX25vdGVzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAnVXNlIHNlY29uZGFyeSBrZXl3b3JkcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAnQW5zd2VyIHVzZXIgaW50ZW50IHF1ZXN0aW9ucydcbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBoZWFkaW5nOiAnQ29uY2x1c2lvbicsXG4gICAgICAgICAgICAgICAgICAgIHB1cnBvc2U6ICdTdW1tYXJpemUgYW5kIGNhbGwgdG8gYWN0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgZXN0aW1hdGVkX3dvcmRzOiAxNTAsXG4gICAgICAgICAgICAgICAgICAgIGtleV9wb2ludHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICdTdW1tYXJ5IG9mIGtleSBwb2ludHMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0NhbGwgdG8gYWN0aW9uJ1xuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBzZW9fbm90ZXM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICdSZWluZm9yY2UgcHJpbWFyeSBrZXl3b3JkJ1xuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBPdXRsaW5lIHN0ZXA6IEdlbmVyYXRlZCBvdXRsaW5lIHdpdGggJHtvdXRsaW5lRGF0YS5zZWN0aW9ucy5sZW5ndGh9IHNlY3Rpb25zYCk7XG4gICAgICAgIC8vIFBlcnNpc3Qgb3V0bGluZV9qc29uIHRvIGRhdGFiYXNlXG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIE91dGxpbmUgc3RlcDogUGVyc2lzdGluZyBvdXRsaW5lX2pzb24gZm9yIHJ1biAke3J1bklkfWApO1xuICAgICAgICBhd2FpdCB1cGRhdGVSdW5TdGF0dXMocnVuSWQsICdvdXRsaW5pbmcnLCBvdXRsaW5lRGF0YSk7XG4gICAgICAgIHJldHVybiBvdXRsaW5lRGF0YTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKGBbdjBdIE91dGxpbmUgc3RlcCBlcnJvcjpgLCBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcikpO1xuICAgICAgICAvLyBSZXR1cm4gZmFsbGJhY2sgb3V0bGluZSBpZiBwYXJzaW5nIG9yIEFJIGNhbGwgZmFpbHNcbiAgICAgICAgY29uc3QgZmFsbGJhY2tPdXRsaW5lID0ge1xuICAgICAgICAgICAgdGl0bGU6IGAke3RvcGljfSAtIENvbXByZWhlbnNpdmUgR3VpZGUgfCAke2J1c2luZXNzTmFtZX1gLFxuICAgICAgICAgICAgbWV0YV9hbmdsZTogYEV2ZXJ5dGhpbmcgeW91IG5lZWQgdG8ga25vdyBhYm91dCAke3RvcGljfSBmb3IgJHtidXNpbmVzc05hbWV9YCxcbiAgICAgICAgICAgIHRhcmdldF93b3JkX2NvdW50OiB0YXJnZXRXb3JkQ291bnQsXG4gICAgICAgICAgICBzZWN0aW9uczogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGluZzogJ0ludHJvZHVjdGlvbjogVW5kZXJzdGFuZGluZyB0aGUgQmFzaWNzJyxcbiAgICAgICAgICAgICAgICAgICAgcHVycG9zZTogJ1NldCBjb250ZXh0IGFuZCBpbnRyb2R1Y2UgdGhlIHRvcGljJyxcbiAgICAgICAgICAgICAgICAgICAgZXN0aW1hdGVkX3dvcmRzOiAyMDAsXG4gICAgICAgICAgICAgICAgICAgIGtleV9wb2ludHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIGBPdmVydmlldyBvZiAke3RvcGljfWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAnV2h5IHRoaXMgdG9waWMgbWF0dGVycyB0byB5b3VyIGF1ZGllbmNlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdXaGF0IHlvdSB3aWxsIGxlYXJuJ1xuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBzZW9fbm90ZXM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICdJbmNsdWRlIHByaW1hcnkga2V5d29yZCBpbiBmaXJzdCBwYXJhZ3JhcGgnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ1VzZSBlbmdhZ2luZyBob29rJ1xuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGhlYWRpbmc6ICdLZXkgQ29uY2VwdHMgYW5kIEJlbmVmaXRzJyxcbiAgICAgICAgICAgICAgICAgICAgcHVycG9zZTogJ0V4cGxvcmUgY29yZSBjb25jZXB0cyBhbmQgYWR2YW50YWdlcycsXG4gICAgICAgICAgICAgICAgICAgIGVzdGltYXRlZF93b3JkczogNDAwLFxuICAgICAgICAgICAgICAgICAgICBrZXlfcG9pbnRzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAnQ29yZSBjb25jZXB0IDEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0NvcmUgY29uY2VwdCAyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdIb3cgYnVzaW5lc3NlcyBiZW5lZml0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdSZWFsLXdvcmxkIGFwcGxpY2F0aW9ucydcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgc2VvX25vdGVzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAnVXNlIHNlY29uZGFyeSBrZXl3b3JkcyBuYXR1cmFsbHknLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0Fuc3dlciBjb21tb24gcXVlc3Rpb25zJ1xuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGhlYWRpbmc6ICdCZXN0IFByYWN0aWNlcyBhbmQgSW1wbGVtZW50YXRpb24nLFxuICAgICAgICAgICAgICAgICAgICBwdXJwb3NlOiAnUHJvdmlkZSBhY3Rpb25hYmxlIGd1aWRhbmNlJyxcbiAgICAgICAgICAgICAgICAgICAgZXN0aW1hdGVkX3dvcmRzOiA1MDAsXG4gICAgICAgICAgICAgICAgICAgIGtleV9wb2ludHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICdTdGVwLWJ5LXN0ZXAgaW1wbGVtZW50YXRpb24nLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0Jlc3QgcHJhY3RpY2VzIGluIHRoZSBpbmR1c3RyeScsXG4gICAgICAgICAgICAgICAgICAgICAgICAnQ29tbW9uIG1pc3Rha2VzIHRvIGF2b2lkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdUb29scyBhbmQgcmVzb3VyY2VzJ1xuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBzZW9fbm90ZXM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICdVc2UgbG9uZy10YWlsIGtleXdvcmRzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdJbmNsdWRlIHByYWN0aWNhbCBleGFtcGxlcydcbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBoZWFkaW5nOiAnQ29uY2x1c2lvbiBhbmQgTmV4dCBTdGVwcycsXG4gICAgICAgICAgICAgICAgICAgIHB1cnBvc2U6ICdTdW1tYXJpemUgYW5kIGd1aWRlIHJlYWRlciBhY3Rpb24nLFxuICAgICAgICAgICAgICAgICAgICBlc3RpbWF0ZWRfd29yZHM6IDE1MCxcbiAgICAgICAgICAgICAgICAgICAga2V5X3BvaW50czogW1xuICAgICAgICAgICAgICAgICAgICAgICAgJ0tleSB0YWtlYXdheXMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ1JlY29tbWVuZGVkIG5leHQgc3RlcHMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0NhbGwgdG8gYWN0aW9uJ1xuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBzZW9fbm90ZXM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICdSZWluZm9yY2UgcHJpbWFyeSBrZXl3b3JkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdDcmVhdGUgdXJnZW5jeSBmb3IgQ1RBJ1xuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGludHJvX2d1aWRhbmNlOiBgU3RhcnQgd2l0aCBhIGNvbXBlbGxpbmcgaG9vayB0aGF0IGFkZHJlc3NlcyB0aGUgcmVhZGVyJ3MgcGFpbiBwb2ludC4gSW50cm9kdWNlICR7dG9waWN9IGluIHRoZSBjb250ZXh0IG9mICR7YnVzaW5lc3NOYW1lfSBhbmQgZXhwbGFpbiB3aHkgaXQgbWF0dGVycyB0byB0aGUgdGFyZ2V0IGF1ZGllbmNlLiBJbmNsdWRlIHRoZSBwcmltYXJ5IGtleXdvcmQgXCIke3ByaW1hcnlLZXl3b3JkfVwiIG5hdHVyYWxseSBpbiB0aGUgZmlyc3QgMTAwIHdvcmRzLmAsXG4gICAgICAgICAgICBjb25jbHVzaW9uX2d1aWRhbmNlOiBgU3VtbWFyaXplIHRoZSBtYWluIHRha2Vhd2F5cyBmcm9tIGVhY2ggc2VjdGlvbi4gUmVpbmZvcmNlIGhvdyB1bmRlcnN0YW5kaW5nICR7dG9waWN9IGJlbmVmaXRzIHRoZSByZWFkZXIuIEluY2x1ZGUgYSBjbGVhciwgY29tcGVsbGluZyBjYWxsLXRvLWFjdGlvbiB0aGF0IGd1aWRlcyB0aGUgcmVhZGVyIG9uIG5leHQgc3RlcHMuIEVuZCB3aXRoIHRoZSBwcmltYXJ5IGtleXdvcmQgbmF0dXJhbGx5IGluY29ycG9yYXRlZC5gLFxuICAgICAgICAgICAgY3RhX2d1aWRhbmNlOiBgJHtjdGFOb3Rlc30uIEVuc3VyZSB0aGUgQ1RBIGlzIGNsZWFyLCBzcGVjaWZpYywgYW5kIHJlbGV2YW50IHRvIHRoZSBhcnRpY2xlIGNvbnRlbnQuIEV4YW1wbGVzOiBcIlNjaGVkdWxlIGEgY29uc3VsdGF0aW9uLFwiIFwiRG93bmxvYWQgb3VyIGd1aWRlLFwiIFwiR2V0IHN0YXJ0ZWQgdG9kYXksXCIgXCJKb2luIG91ciBjb21tdW5pdHkuXCJgLFxuICAgICAgICAgICAgaW50ZXJuYWxfbGlua19vcHBvcnR1bml0aWVzOiBbXG4gICAgICAgICAgICAgICAgJ0xpbmsgdG8gcmVsZXZhbnQgc2VydmljZSBwYWdlcyBvbiBjb21wYW55IHdlYnNpdGUnLFxuICAgICAgICAgICAgICAgICdMaW5rIHRvIHJlbGF0ZWQgYmxvZyBwb3N0cyBvbiBzaW1pbGFyIHRvcGljcycsXG4gICAgICAgICAgICAgICAgJ0xpbmsgdG8gY2FzZSBzdHVkaWVzIG9yIHN1Y2Nlc3Mgc3RvcmllcycsXG4gICAgICAgICAgICAgICAgJ0xpbmsgdG8gcmVzb3VyY2UgcGFnZXMgb3IgdG9vbHMnXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgbm90ZXNfZm9yX3dyaXRlcjogW1xuICAgICAgICAgICAgICAgIGBSZW1lbWJlciB0byBtYWludGFpbiBhICR7YnJhbmRWb2ljZX0gdG9uZSB0aHJvdWdob3V0YCxcbiAgICAgICAgICAgICAgICBgQWRkcmVzcyB0aGUgbmVlZHMgb2Y6ICR7YXVkaWVuY2VOb3Rlc31gLFxuICAgICAgICAgICAgICAgIGBFbnN1cmUgdGhlIGNvbnRlbnQgaXMgd2VsbC1yZXNlYXJjaGVkIGFuZCBpbmNsdWRlcyBzcGVjaWZpYyBleGFtcGxlc2AsXG4gICAgICAgICAgICAgICAgYFVzZSBzdWJoZWFkaW5ncyB0byBpbXByb3ZlIHJlYWRhYmlsaXR5IGFuZCBTRU9gLFxuICAgICAgICAgICAgICAgIGBJbmNsdWRlIHJlbGV2YW50IGRhdGEsIHN0YXRpc3RpY3MsIG9yIHJlc2VhcmNoIGZpbmRpbmdzIHdoZXJlIGFwcHJvcHJpYXRlYCxcbiAgICAgICAgICAgICAgICBgRW5kIHdpdGggYSBzdHJvbmcgQ1RBIGFsaWduZWQgd2l0aDogJHtjdGFOb3Rlc31gXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgICAgfTtcbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gT3V0bGluZSBzdGVwOiBVc2luZyBmYWxsYmFjayBvdXRsaW5lIGR1ZSB0byBlcnJvcmApO1xuICAgICAgICByZXR1cm4gZmFsbGJhY2tPdXRsaW5lO1xuICAgIH1cbn1cbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL291dGxpbmUtc3RlcC8vcnVuT3V0bGluZVN0ZXBcIiwgcnVuT3V0bGluZVN0ZXApO1xuIiwgImltcG9ydCB7IHJlZ2lzdGVyU3RlcEZ1bmN0aW9uIH0gZnJvbSBcIndvcmtmbG93L2ludGVybmFsL3ByaXZhdGVcIjtcbmltcG9ydCAnc2VydmVyLW9ubHknO1xuaW1wb3J0IHsgZ2VuZXJhdGVUZXh0IH0gZnJvbSAnYWknO1xuaW1wb3J0IHsgb3BlbmFpIH0gZnJvbSAnQGFpLXNkay9vcGVuYWknO1xuaW1wb3J0IHsgdXBkYXRlUnVuU3RhdHVzIH0gZnJvbSAnLi4vLi4vc3RvcmFnZS9ydW5zJztcbmltcG9ydCB7IGdldEFnZW50Q29uZmlnIH0gZnJvbSAnLi4vLi4vc3RvcmFnZS9hZ2VudC1jb25maWdzJztcbi8qKl9faW50ZXJuYWxfd29ya2Zsb3dze1wic3RlcHNcIjp7XCJsaWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3Jlc2VhcmNoLXN0ZXAudHNcIjp7XCJydW5SZXNlYXJjaFN0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9yZXNlYXJjaC1zdGVwLy9ydW5SZXNlYXJjaFN0ZXBcIn19fX0qLztcbi8qKlxuICogUmVzZWFyY2ggU3RlcCAtIFBoYXNlIDJDLUFcbiAqIFJ1bnMgaW5zaWRlIGEgZHVyYWJsZSBzdGVwIGZ1bmN0aW9uIChoYXMgTm9kZS5qcyBhY2Nlc3MpXG4gKiBDYWxscyBBSSBtb2RlbCB0byBnZW5lcmF0ZSByZXNlYXJjaCBKU09OXG4gKiBObyBmaWxlc3lzdGVtIGltcG9ydHMgLSBzYWZlIGZvciB3b3JrZmxvdyBjb250ZXh0XG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJ1blJlc2VhcmNoU3RlcChydW5JZCwgaW5wdXQpIHtcbiAgICBjb25zb2xlLmxvZyhgW3YwXSBSZXNlYXJjaCBzdGVwOiBBbmFseXppbmcgdG9waWMgZm9yIHJ1biAke3J1bklkfWApO1xuICAgIHRyeSB7XG4gICAgICAgIC8vIExvYWQgYWdlbnQgY29uZmlnIGZyb20gZGF0YWJhc2VcbiAgICAgICAgY29uc3QgYWdlbnRDb25maWcgPSBhd2FpdCBnZXRBZ2VudENvbmZpZygncmVzZWFyY2gnKTtcbiAgICAgICAgaWYgKCFhZ2VudENvbmZpZykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBY3RpdmUgYWdlbnQgY29uZmlnIG5vdCBmb3VuZCBmb3IgYWdlbnRfa2V5OiByZXNlYXJjaCcpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFNFTyBCbG9nIEFnZW50IENvbmZpZyBMb2FkZWQ6IHJlc2VhcmNoIHYke2FnZW50Q29uZmlnLnZlcnNpb259YCk7XG4gICAgICAgIC8vIEJ1aWxkIHN5c3RlbSBwcm9tcHQgZnJvbSBkYXRhYmFzZSBjb25maWdcbiAgICAgICAgY29uc3Qgc3lzdGVtUHJvbXB0ID0gW1xuICAgICAgICAgICAgYWdlbnRDb25maWcuc3lzdGVtX3Byb21wdCxcbiAgICAgICAgICAgIGFnZW50Q29uZmlnLnNraWxsX21hcmtkb3duXG4gICAgICAgIF0uZmlsdGVyKEJvb2xlYW4pLmpvaW4oJ1xcblxcbicpO1xuICAgICAgICBjb25zdCB1c2VyTWVzc2FnZSA9IGBDb25kdWN0IFNFTyByZXNlYXJjaCBmb3I6XG5Ub3BpYzogJHtpbnB1dC5ibG9nX3RvcGljfVxuUHJpbWFyeSBLZXl3b3JkOiAke2lucHV0LnByaW1hcnlfa2V5d29yZH1cblNlY29uZGFyeSBLZXl3b3JkczogJHtpbnB1dC5zZWNvbmRhcnlfa2V5d29yZHM/LmpvaW4oJywgJykgfHwgJ25vbmUnfVxuVGFyZ2V0IEF1ZGllbmNlOiAke2lucHV0LmF1ZGllbmNlX25vdGVzIHx8ICdnZW5lcmFsJ31cblRhcmdldCBXb3JkIENvdW50OiAke2lucHV0LnRhcmdldF93b3JkX2NvdW50IHx8IDEwMDB9XG5CdXNpbmVzczogJHtpbnB1dC5idXNpbmVzc19uYW1lIHx8ICd1bmtub3duJ31cbldlYnNpdGU6ICR7aW5wdXQud2Vic2l0ZV91cmwgfHwgJ3Vua25vd24nfVxuXG5Qcm92aWRlIGNvbXByZWhlbnNpdmUgcmVzZWFyY2ggZmluZGluZ3MgaW4gSlNPTiBmb3JtYXQuYDtcbiAgICAgICAgLy8gR2V0IG1vZGVsIG5hbWU6IHVzZSBEQiBjb25maWcgaWYgYXZhaWxhYmxlLCBvdGhlcndpc2UgZmFsbCBiYWNrIHRvIGVudiB2YXIgb3IgZGVmYXVsdFxuICAgICAgICBjb25zdCBtb2RlbE5hbWUgPSBhZ2VudENvbmZpZy5tb2RlbCB8fCBwcm9jZXNzLmVudi5SRVNFQVJDSF9BR0VOVF9NT0RFTCB8fCAnZ3B0LTUuNC1taW5pJztcbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gUmVzZWFyY2ggc3RlcDogVXNpbmcgbW9kZWw6ICR7bW9kZWxOYW1lfWApO1xuICAgICAgICAvLyBVc2UgZGlyZWN0IE9wZW5BSSBwcm92aWRlciB3aXRoIE9QRU5BSV9BUElfS0VZXG4gICAgICAgIGNvbnN0IG1vZGVsID0gb3BlbmFpKG1vZGVsTmFtZSk7XG4gICAgICAgIC8vIENhbGwgQUkgbW9kZWxcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBnZW5lcmF0ZVRleHQoe1xuICAgICAgICAgICAgbW9kZWwsXG4gICAgICAgICAgICBzeXN0ZW06IHN5c3RlbVByb21wdCxcbiAgICAgICAgICAgIHByb21wdDogdXNlck1lc3NhZ2UsXG4gICAgICAgICAgICB0ZW1wZXJhdHVyZTogMC43XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBSZXNlYXJjaCBzdGVwOiBBSSBtb2RlbCByZXNwb25kZWQsIHBhcnNpbmcgSlNPTmApO1xuICAgICAgICAvLyBQYXJzZSBKU09OIHJlc3BvbnNlXG4gICAgICAgIGxldCByZXNlYXJjaERhdGE7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBUcnkgdG8gZXh0cmFjdCBKU09OIGZyb20gcmVzcG9uc2UgKGluIGNhc2Ugb2YgZXh0cmEgdGV4dClcbiAgICAgICAgICAgIGNvbnN0IGpzb25NYXRjaCA9IHJlc3BvbnNlLnRleHQubWF0Y2goL1xce1tcXHNcXFNdKlxcfS8pO1xuICAgICAgICAgICAgaWYgKCFqc29uTWF0Y2gpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIEpTT04gZm91bmQgaW4gcmVzcG9uc2UnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc2VhcmNoRGF0YSA9IEpTT04ucGFyc2UoanNvbk1hdGNoWzBdKTtcbiAgICAgICAgICAgIC8vIFZhbGlkYXRlIHJlcXVpcmVkIGZpZWxkcyBhdCBydW50aW1lXG4gICAgICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkocmVzZWFyY2hEYXRhLmtleV9maW5kaW5ncykpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Jlc2VhcmNoIG91dHB1dCBtaXNzaW5nIHJlcXVpcmVkIGtleV9maW5kaW5ncyBhcnJheScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJlc2VhcmNoRGF0YS5rZXlfZmluZGluZ3MubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZXNlYXJjaCBvdXRwdXQga2V5X2ZpbmRpbmdzIGFycmF5IGNhbm5vdCBiZSBlbXB0eScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChwYXJzZUVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW3YwXSBSZXNlYXJjaCBzdGVwOiBGYWlsZWQgdG8gcGFyc2UgQUkgcmVzcG9uc2U6YCwgcmVzcG9uc2UudGV4dC5zdWJzdHJpbmcoMCwgMjAwKSk7XG4gICAgICAgICAgICAvLyBSZXR1cm4gZmFsbGJhY2sgaWYgcGFyc2luZyBmYWlsc1xuICAgICAgICAgICAgcmVzZWFyY2hEYXRhID0ge1xuICAgICAgICAgICAgICAgIHNlYXJjaF9pbnRlbnQ6ICdpbmZvcm1hdGlvbmFsJyxcbiAgICAgICAgICAgICAgICB0YXJnZXRfYXVkaWVuY2Vfc3VtbWFyeTogaW5wdXQuYXVkaWVuY2Vfbm90ZXMgfHwgJ1RhcmdldCBhdWRpZW5jZSBub3Qgc3BlY2lmaWVkJyxcbiAgICAgICAgICAgICAgICBrZXl3b3JkX21hcDoge1xuICAgICAgICAgICAgICAgICAgICBwcmltYXJ5X2tleXdvcmQ6IGlucHV0LnByaW1hcnlfa2V5d29yZCB8fCAncHJpbWFyeSBrZXl3b3JkJyxcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kYXJ5X2tleXdvcmRzOiBpbnB1dC5zZWNvbmRhcnlfa2V5d29yZHMgfHwgW10sXG4gICAgICAgICAgICAgICAgICAgIGxzaV90ZXJtczogW11cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNvbnRlbnRfYW5nbGU6IGBGb2N1cyBvbiAke2lucHV0LmJsb2dfdG9waWMgfHwgJ3RvcGljJ31gLFxuICAgICAgICAgICAgICAgIGtleV9maW5kaW5nczogW1xuICAgICAgICAgICAgICAgICAgICBgVG9waWMgZm9jdXNlcyBvbiAke2lucHV0LmJsb2dfdG9waWMgfHwgJ3RoZSBzdWJqZWN0IG1hdHRlcid9YCxcbiAgICAgICAgICAgICAgICAgICAgYFRhcmdldCBhdWRpZW5jZTogJHtpbnB1dC5hdWRpZW5jZV9ub3RlcyB8fCAnZ2VuZXJhbCBhdWRpZW5jZSd9YCxcbiAgICAgICAgICAgICAgICAgICAgYFByaW1hcnkga2V5d29yZDogJHtpbnB1dC5wcmltYXJ5X2tleXdvcmQgfHwgJ3RvIGJlIGRldGVybWluZWQnfWBcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIGNvbXBldGl0b3JfaW5zaWdodHM6IFtcbiAgICAgICAgICAgICAgICAgICAgJ1Jlc2VhcmNoIGNvbXBldGl0b3JzIGZvciBjb21wZXRpdGl2ZSBhZHZhbnRhZ2VzJ1xuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVjb21tZW5kZWRfc2VjdGlvbnM6IFtcbiAgICAgICAgICAgICAgICAgICAgJ0ludHJvZHVjdGlvbicsXG4gICAgICAgICAgICAgICAgICAgICdNYWluIENvbnRlbnQnLFxuICAgICAgICAgICAgICAgICAgICAnQ29uY2x1c2lvbidcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHF1ZXN0aW9uc190b19hbnN3ZXI6IFtcbiAgICAgICAgICAgICAgICAgICAgJ1doYXQgaXMgdGhlIG1haW4gdG9waWM/J1xuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZWFyY2hfbm90ZXM6ICdGYWxsYmFjayByZXNlYXJjaCBkdWUgdG8gcGFyc2luZyBlcnJvcicsXG4gICAgICAgICAgICAgICAgdGFyZ2V0X3dvcmRfY291bnQ6IGlucHV0LnRhcmdldF93b3JkX2NvdW50IHx8IDEwMDAsXG4gICAgICAgICAgICAgICAgd2ViX3NlYXJjaF91c2VkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICAvLyBQZXJzaXN0IHJlc2VhcmNoX2pzb24gdG8gZGF0YWJhc2VcbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gUmVzZWFyY2ggc3RlcDogUGVyc2lzdGluZyByZXNlYXJjaF9qc29uIGZvciBydW4gJHtydW5JZH1gKTtcbiAgICAgICAgYXdhaXQgdXBkYXRlUnVuU3RhdHVzKHJ1bklkLCAncmVzZWFyY2hpbmcnLCByZXNlYXJjaERhdGEpO1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBSZXNlYXJjaCBzdGVwOiBDb21wbGV0ZSBmb3IgcnVuICR7cnVuSWR9YCk7XG4gICAgICAgIHJldHVybiByZXNlYXJjaERhdGE7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgW3YwXSBSZXNlYXJjaCBzdGVwIGVycm9yIGZvciBydW4gJHtydW5JZH06YCwgZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxufVxucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvcmVzZWFyY2gtc3RlcC8vcnVuUmVzZWFyY2hTdGVwXCIsIHJ1blJlc2VhcmNoU3RlcCk7XG4iLCAiaW1wb3J0IHsgcmVnaXN0ZXJTdGVwRnVuY3Rpb24gfSBmcm9tIFwid29ya2Zsb3cvaW50ZXJuYWwvcHJpdmF0ZVwiO1xuaW1wb3J0ICdzZXJ2ZXItb25seSc7XG5pbXBvcnQgeyBnZW5lcmF0ZVRleHQgfSBmcm9tICdhaSc7XG5pbXBvcnQgeyBvcGVuYWkgfSBmcm9tICdAYWktc2RrL29wZW5haSc7XG5pbXBvcnQgeyB1cGRhdGVSdW5TdGF0dXMgfSBmcm9tICcuLi8uLi9zdG9yYWdlL3J1bnMnO1xuaW1wb3J0IHsgZ2V0QWdlbnRDb25maWcgfSBmcm9tICcuLi8uLi9zdG9yYWdlL2FnZW50LWNvbmZpZ3MnO1xuLyoqX19pbnRlcm5hbF93b3JrZmxvd3N7XCJzdGVwc1wiOntcImxpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvc2VvLXFhLXN0ZXAudHNcIjp7XCJydW5TZW9RYVN0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9zZW8tcWEtc3RlcC8vcnVuU2VvUWFTdGVwXCJ9fX19Ki87XG4vKipcbiAqIFNFTyBRQSBTdGVwIC0gUGhhc2UgMkMtRFxuICogUnVucyBpbnNpZGUgYSBkdXJhYmxlIHN0ZXAgZnVuY3Rpb24gKGhhcyBOb2RlLmpzIGFjY2VzcylcbiAqIFJldmlld3MgZHJhZnQgbWFya2Rvd24gYWdhaW5zdCBTRU8gYmVzdCBwcmFjdGljZXNcbiAqIFJldHVybnMgc3RydWN0dXJlZCBhdWRpdCBKU09OIChkb2VzIE5PVCByZXdyaXRlIHRoZSBkcmFmdClcbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gcnVuU2VvUWFTdGVwKHJ1bklkLCBpbnB1dCwgcmVzZWFyY2hEYXRhLCBvdXRsaW5lRGF0YSwgZHJhZnRNYXJrZG93bikge1xuICAgIGNvbnNvbGUubG9nKGBbdjBdIFNFTyBRQSBzdGVwOiBBdWRpdGluZyBkcmFmdCBmb3IgcnVuICR7cnVuSWR9YCk7XG4gICAgaWYgKCFkcmFmdE1hcmtkb3duKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignRHJhZnQgbWFya2Rvd24gaXMgcmVxdWlyZWQgZm9yIFNFTyBRQSByZXZpZXcnKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gTG9hZCBhZ2VudCBjb25maWcgZnJvbSBkYXRhYmFzZVxuICAgICAgICBjb25zdCBhZ2VudENvbmZpZyA9IGF3YWl0IGdldEFnZW50Q29uZmlnKCdzZW9fcWEnKTtcbiAgICAgICAgaWYgKCFhZ2VudENvbmZpZykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBY3RpdmUgYWdlbnQgY29uZmlnIG5vdCBmb3VuZCBmb3IgYWdlbnRfa2V5OiBzZW9fcWEnKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBTRU8gQmxvZyBBZ2VudCBDb25maWcgTG9hZGVkOiBzZW9fcWEgdiR7YWdlbnRDb25maWcudmVyc2lvbn1gKTtcbiAgICAgICAgLy8gQnVpbGQgc3lzdGVtIHByb21wdCBmcm9tIGRhdGFiYXNlIGNvbmZpZ1xuICAgICAgICBjb25zdCBzeXN0ZW1Qcm9tcHQgPSBbXG4gICAgICAgICAgICBhZ2VudENvbmZpZy5zeXN0ZW1fcHJvbXB0LFxuICAgICAgICAgICAgYWdlbnRDb25maWcuc2tpbGxfbWFya2Rvd25cbiAgICAgICAgXS5maWx0ZXIoQm9vbGVhbikuam9pbignXFxuXFxuJyk7XG4gICAgICAgIC8vIEdldCBtb2RlbCBuYW1lOiB1c2UgREIgY29uZmlnIGlmIGF2YWlsYWJsZSwgb3RoZXJ3aXNlIGZhbGwgYmFjayB0byBlbnYgdmFyIG9yIGRlZmF1bHRcbiAgICAgICAgY29uc3QgbW9kZWxOYW1lID0gYWdlbnRDb25maWcubW9kZWwgfHwgcHJvY2Vzcy5lbnYuU0VPX1FBX0FHRU5UX01PREVMIHx8IHByb2Nlc3MuZW52LlJFU0VBUkNIX0FHRU5UX01PREVMIHx8ICdncHQtNS40LW1pbmknO1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBTRU8gUUEgc3RlcDogVXNpbmcgbW9kZWw6ICR7bW9kZWxOYW1lfWApO1xuICAgICAgICAvLyBQcmVwYXJlIGNvbnRleHQgZm9yIFNFTyBRQSByZXZpZXdcbiAgICAgICAgY29uc3QgcHJpbWFyeUtleXdvcmQgPSBpbnB1dC5wcmltYXJ5X2tleXdvcmQgfHwgJ3ByaW1hcnkga2V5d29yZCc7XG4gICAgICAgIGNvbnN0IHNlY29uZGFyeUtleXdvcmRzID0gKGlucHV0LnNlY29uZGFyeV9rZXl3b3JkcyB8fCBbXSkuam9pbignLCAnKSB8fCAnc2Vjb25kYXJ5IGtleXdvcmRzJztcbiAgICAgICAgY29uc3QgdGFyZ2V0V29yZENvdW50ID0gaW5wdXQudGFyZ2V0X3dvcmRfY291bnQgfHwgMjAwMDtcbiAgICAgICAgY29uc3QgYnVzaW5lc3NOYW1lID0gaW5wdXQuYnVzaW5lc3NfbmFtZSB8fCAnWW91ciBCdXNpbmVzcyc7XG4gICAgICAgIGNvbnN0IGF1ZGllbmNlTm90ZXMgPSBpbnB1dC5hdWRpZW5jZV9ub3RlcyB8fCAnVGFyZ2V0IGF1ZGllbmNlIG5vdCBzcGVjaWZpZWQnO1xuICAgICAgICBjb25zdCBicmFuZFZvaWNlID0gaW5wdXQuYnJhbmRfdm9pY2Vfbm90ZXMgfHwgJ1Byb2Zlc3Npb25hbCBhbmQgY2xlYXInO1xuICAgICAgICBjb25zdCBjdGFOb3RlcyA9IGlucHV0LmN0YV9ub3RlcyB8fCAnQ1RBIG5vdCBzcGVjaWZpZWQnO1xuICAgICAgICBjb25zdCBpbnRlcm5hbExpbmtOb3RlcyA9IGlucHV0LmludGVybmFsX2xpbmtfbm90ZXMgfHwgJ05vIGludGVybmFsIGxpbmtpbmcgc3RyYXRlZ3knO1xuICAgICAgICAvLyBCdWlsZCBTRU8gUUEgcHJvbXB0IHdpdGggc3lzdGVtIHByb21wdCBmcm9tIERCXG4gICAgICAgIGNvbnN0IHNlb1FhUHJvbXB0ID0gYCR7c3lzdGVtUHJvbXB0fVxuXG5CTE9HIERSQUZUOlxuJHtkcmFmdE1hcmtkb3dufVxuXG5SRVZJRVcgQ1JJVEVSSUE6XG4tIFByaW1hcnkgS2V5d29yZDogXCIke3ByaW1hcnlLZXl3b3JkfVwiXG4tIFNlY29uZGFyeSBLZXl3b3JkczogXCIke3NlY29uZGFyeUtleXdvcmRzfVwiXG4tIFRhcmdldCBXb3JkIENvdW50OiAke3RhcmdldFdvcmRDb3VudH0gd29yZHNcbi0gQnVzaW5lc3M6ICR7YnVzaW5lc3NOYW1lfVxuLSBBdWRpZW5jZTogJHthdWRpZW5jZU5vdGVzfVxuLSBCcmFuZCBWb2ljZTogJHticmFuZFZvaWNlfVxuLSBDVEEgTm90ZXM6ICR7Y3RhTm90ZXN9XG4tIEludGVybmFsIExpbmtpbmcgU3RyYXRlZ3k6ICR7aW50ZXJuYWxMaW5rTm90ZXN9XG5cblByb3ZpZGUgYSBkZXRhaWxlZCBTRU8gYXVkaXQgaW4gSlNPTiBmb3JtYXQgKGRvIE5PVCBtb2RpZnkgb3IgcmV3cml0ZSB0aGUgZHJhZnQpLmA7XG4gICAgICAgIGNvbnN0IHsgdGV4dCB9ID0gYXdhaXQgZ2VuZXJhdGVUZXh0KHtcbiAgICAgICAgICAgIG1vZGVsOiBvcGVuYWkobW9kZWxOYW1lKSxcbiAgICAgICAgICAgIHByb21wdDogc2VvUWFQcm9tcHQsXG4gICAgICAgICAgICB0ZW1wZXJhdHVyZTogMC43LFxuICAgICAgICAgICAgbWF4VG9rZW5zOiAzMDAwXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBTRU8gUUEgc3RlcDogUmVjZWl2ZWQgYXVkaXQgZnJvbSBtb2RlbGApO1xuICAgICAgICAvLyBQYXJzZSB0aGUgSlNPTiByZXNwb25zZVxuICAgICAgICBsZXQgc2VvUWFSZXN1bHQ7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBzZW9RYVJlc3VsdCA9IEpTT04ucGFyc2UodGV4dCk7XG4gICAgICAgIH0gY2F0Y2ggKHBhcnNlRXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbdjBdIFNFTyBRQSBzdGVwOiBGYWlsZWQgdG8gcGFyc2UgbW9kZWwgcmVzcG9uc2UgYXMgSlNPTmAsIHBhcnNlRXJyIGluc3RhbmNlb2YgRXJyb3IgPyBwYXJzZUVyci5tZXNzYWdlIDogU3RyaW5nKHBhcnNlRXJyKSk7XG4gICAgICAgICAgICAvLyBSZXR1cm4gZmFsbGJhY2sgYXVkaXQgaWYgcGFyc2luZyBmYWlsc1xuICAgICAgICAgICAgc2VvUWFSZXN1bHQgPSBnZW5lcmF0ZUZhbGxiYWNrU2VvUWEoZHJhZnRNYXJrZG93biwgcHJpbWFyeUtleXdvcmQpO1xuICAgICAgICB9XG4gICAgICAgIC8vIFJ1bnRpbWUgdmFsaWRhdGlvbiBvZiByZXF1aXJlZCBmaWVsZHNcbiAgICAgICAgY29uc3QgcmVxdWlyZWRGaWVsZHMgPSBbXG4gICAgICAgICAgICAnb3ZlcmFsbF9zY29yZScsXG4gICAgICAgICAgICAncmVhZHlfZm9yX2VkaXRvcicsXG4gICAgICAgICAgICAncmVjb21tZW5kZWRfbmV4dF9hY3Rpb24nLFxuICAgICAgICAgICAgJ3NlYXJjaF9pbnRlbnRfYWxpZ25tZW50JyxcbiAgICAgICAgICAgICdwcmltYXJ5X2tleXdvcmRfdXNhZ2UnLFxuICAgICAgICAgICAgJ3NlY29uZGFyeV9rZXl3b3JkX3VzYWdlJyxcbiAgICAgICAgICAgICdoZWFkaW5nX3N0cnVjdHVyZV9yZXZpZXcnLFxuICAgICAgICAgICAgJ2NvbnRlbnRfZGVwdGhfcmV2aWV3JyxcbiAgICAgICAgICAgICdyZWFkYWJpbGl0eV9yZXZpZXcnLFxuICAgICAgICAgICAgJ2N0YV9yZXZpZXcnLFxuICAgICAgICAgICAgJ2ludGVybmFsX2xpbmtpbmdfcmV2aWV3JyxcbiAgICAgICAgICAgICdjbGllbnRfZ29hbF9hbGlnbm1lbnQnLFxuICAgICAgICAgICAgJ3ByaW9yaXR5X2ZpeGVzJyxcbiAgICAgICAgICAgICdyaXNrX2ZsYWdzJyxcbiAgICAgICAgICAgICduZWVkc19yZXZpZXcnXG4gICAgICAgIF07XG4gICAgICAgIGxldCBtaXNzaW5nRmllbGRzID0gW107XG4gICAgICAgIGZvciAoY29uc3QgZmllbGQgb2YgcmVxdWlyZWRGaWVsZHMpe1xuICAgICAgICAgICAgaWYgKHNlb1FhUmVzdWx0W2ZpZWxkXSA9PT0gdW5kZWZpbmVkIHx8IHNlb1FhUmVzdWx0W2ZpZWxkXSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIG1pc3NpbmdGaWVsZHMucHVzaChmaWVsZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1pc3NpbmdGaWVsZHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBTRU8gUUEgb3V0cHV0IG1pc3NpbmcgcmVxdWlyZWQgZmllbGRzOiAke21pc3NpbmdGaWVsZHMuam9pbignLCAnKX1gKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBGQUlMLUxPVUQ6IFZhbGlkYXRlIGNvbnRyb2xsZWQgdmFsdWVzIGZvciByZWNvbW1lbmRlZF9uZXh0X2FjdGlvblxuICAgICAgICBjb25zdCB2YWxpZEFjdGlvbnMgPSBbXG4gICAgICAgICAgICAnQXBwcm92ZSBmb3IgZWRpdG9yJyxcbiAgICAgICAgICAgICdSZXZpc2UgYmVmb3JlIGVkaXRvcicsXG4gICAgICAgICAgICAnTmVlZHMgaHVtYW4gcmV2aWV3J1xuICAgICAgICBdO1xuICAgICAgICBpZiAoIXZhbGlkQWN0aW9ucy5pbmNsdWRlcyhzZW9RYVJlc3VsdC5yZWNvbW1lbmRlZF9uZXh0X2FjdGlvbikpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgU0VPIFFBIG91dHB1dCBpbnZhbGlkIHJlY29tbWVuZGVkX25leHRfYWN0aW9uOiAke3Nlb1FhUmVzdWx0LnJlY29tbWVuZGVkX25leHRfYWN0aW9ufWApO1xuICAgICAgICB9XG4gICAgICAgIC8vIEZBSUwtTE9VRDogVmFsaWRhdGUgbnVtZXJpYyByYW5nZXNcbiAgICAgICAgaWYgKHR5cGVvZiBzZW9RYVJlc3VsdC5vdmVyYWxsX3Njb3JlICE9PSAnbnVtYmVyJyB8fCBzZW9RYVJlc3VsdC5vdmVyYWxsX3Njb3JlIDwgMCB8fCBzZW9RYVJlc3VsdC5vdmVyYWxsX3Njb3JlID4gMTAwKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFNFTyBRQSBvdXRwdXQgaW52YWxpZCBvdmVyYWxsX3Njb3JlOiAke3Nlb1FhUmVzdWx0Lm92ZXJhbGxfc2NvcmV9LCBtdXN0IGJlIG51bWJlciBiZXR3ZWVuIDAtMTAwYCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gUGVyc2lzdCBvcHRpbWl6ZWRfanNvbiB0byBkYXRhYmFzZVxuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBTRU8gUUEgc3RlcDogUGVyc2lzdGluZyBTRU8gUUEgYXVkaXQgKHNjb3JlOiAke3Nlb1FhUmVzdWx0Lm92ZXJhbGxfc2NvcmV9KSBmb3IgcnVuICR7cnVuSWR9YCk7XG4gICAgICAgIGF3YWl0IHVwZGF0ZVJ1blN0YXR1cyhydW5JZCwgJ3Nlb19xYScsIHNlb1FhUmVzdWx0KTtcbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gU0VPIFFBIHN0ZXA6IENvbXBsZXRlIGZvciBydW4gJHtydW5JZH1gKTtcbiAgICAgICAgcmV0dXJuIHNlb1FhUmVzdWx0O1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTXNnID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICBjb25zb2xlLmVycm9yKGBbdjBdIFNFTyBRQSBzdGVwOiBFcnJvciBkdXJpbmcgYXVkaXQgZm9yIHJ1biAke3J1bklkfTogJHtlcnJvck1zZ31gKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxufVxuLyoqXG4gKiBHZW5lcmF0ZSBhIGJhc2ljIFNFTyBRQSBhdWRpdCBhcyBmYWxsYmFja1xuICovIGZ1bmN0aW9uIGdlbmVyYXRlRmFsbGJhY2tTZW9RYShkcmFmdE1hcmtkb3duLCBwcmltYXJ5S2V5d29yZCkge1xuICAgIGNvbnN0IHdvcmRDb3VudCA9IGRyYWZ0TWFya2Rvd24uc3BsaXQoL1xccysvKS5sZW5ndGg7XG4gICAgY29uc3QgaDFDb3VudCA9IChkcmFmdE1hcmtkb3duLm1hdGNoKC9eIyAvZ20pIHx8IFtdKS5sZW5ndGg7XG4gICAgY29uc3QgaDJDb3VudCA9IChkcmFmdE1hcmtkb3duLm1hdGNoKC9eIyMgL2dtKSB8fCBbXSkubGVuZ3RoO1xuICAgIGNvbnN0IGludGVybmFsTGlua0NvdW50ID0gKGRyYWZ0TWFya2Rvd24ubWF0Y2goL1xcWy4qP1xcXVxcKFxcLy4qP1xcKS9nKSB8fCBbXSkubGVuZ3RoO1xuICAgIGNvbnN0IHByaW1hcnlLZXl3b3JkT2NjdXJyZW5jZXMgPSAoZHJhZnRNYXJrZG93bi50b0xvd2VyQ2FzZSgpLm1hdGNoKG5ldyBSZWdFeHAocHJpbWFyeUtleXdvcmQudG9Mb3dlckNhc2UoKSwgJ2cnKSkgfHwgW10pLmxlbmd0aDtcbiAgICBjb25zdCBvdmVyYWxsU2NvcmUgPSA2ODtcbiAgICBjb25zdCByZWFkeUZvckVkaXRvciA9IG92ZXJhbGxTY29yZSA+PSA3MCAmJiBoMUNvdW50ID4gMDtcbiAgICBjb25zdCByZWNvbW1lbmRlZEFjdGlvbiA9IG92ZXJhbGxTY29yZSA+PSA3NSAmJiByZWFkeUZvckVkaXRvciA/ICdBcHByb3ZlIGZvciBlZGl0b3InIDogb3ZlcmFsbFNjb3JlID49IDYwICYmIHJlYWR5Rm9yRWRpdG9yID8gJ1JldmlzZSBiZWZvcmUgZWRpdG9yJyA6ICdOZWVkcyBodW1hbiByZXZpZXcnO1xuICAgIHJldHVybiB7XG4gICAgICAgIG92ZXJhbGxfc2NvcmU6IG92ZXJhbGxTY29yZSxcbiAgICAgICAgc2VhcmNoX2ludGVudF9hbGlnbm1lbnQ6IHtcbiAgICAgICAgICAgIHNjb3JlOiA2NSxcbiAgICAgICAgICAgIGFuYWx5c2lzOiAnRHJhZnQgY292ZXJzIGJhc2ljIHNlYXJjaCBpbnRlbnQgYnV0IG1heSBuZWVkIHJlZmluZW1lbnQnXG4gICAgICAgIH0sXG4gICAgICAgIHByaW1hcnlfa2V5d29yZF91c2FnZToge1xuICAgICAgICAgICAgc2NvcmU6IDcwLFxuICAgICAgICAgICAgb2NjdXJyZW5jZXM6IHByaW1hcnlLZXl3b3JkT2NjdXJyZW5jZXMsXG4gICAgICAgICAgICBwbGFjZW1lbnRfYW5hbHlzaXM6IGBQcmltYXJ5IGtleXdvcmQgYXBwZWFycyAke3ByaW1hcnlLZXl3b3JkT2NjdXJyZW5jZXN9IHRpbWVzIGluIHRoZSBkcmFmdGBcbiAgICAgICAgfSxcbiAgICAgICAgc2Vjb25kYXJ5X2tleXdvcmRfdXNhZ2U6IHtcbiAgICAgICAgICAgIHNjb3JlOiA2MCxcbiAgICAgICAgICAgIGtleXdvcmRzX2NvdmVyZWQ6IFtdLFxuICAgICAgICAgICAgZ2FwczogW1xuICAgICAgICAgICAgICAgICdBZGRpdGlvbmFsIGtleXdvcmQgYW5hbHlzaXMgbmVlZGVkJ1xuICAgICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgICBoZWFkaW5nX3N0cnVjdHVyZV9yZXZpZXc6IHtcbiAgICAgICAgICAgIHNjb3JlOiBoMkNvdW50ID4gMiA/IDc1IDogNjUsXG4gICAgICAgICAgICBoMV9wcmVzZW50OiBoMUNvdW50ID4gMCxcbiAgICAgICAgICAgIGgyX2NvdW50OiBoMkNvdW50LFxuICAgICAgICAgICAgaGllcmFyY2h5X2lzc3VlczogaDFDb3VudCA9PT0gMCA/IFtcbiAgICAgICAgICAgICAgICAnTWlzc2luZyBIMSBoZWFkaW5nJ1xuICAgICAgICAgICAgXSA6IFtdXG4gICAgICAgIH0sXG4gICAgICAgIGNvbnRlbnRfZGVwdGhfcmV2aWV3OiB7XG4gICAgICAgICAgICBzY29yZTogd29yZENvdW50ID4gMTUwMCA/IDc1IDogNjAsXG4gICAgICAgICAgICB3b3JkX2NvdW50OiB3b3JkQ291bnQsXG4gICAgICAgICAgICBzZWN0aW9uX2NvdmVyYWdlOiBgRHJhZnQgY29udGFpbnMgJHtNYXRoLm1heCgxLCBoMkNvdW50KX0gbWFpbiBzZWN0aW9uc2AsXG4gICAgICAgICAgICBkZXB0aF9pc3N1ZXM6IHdvcmRDb3VudCA8IDE1MDAgPyBbXG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQgbWF5IG5lZWQgbW9yZSBkZXB0aCdcbiAgICAgICAgICAgIF0gOiBbXVxuICAgICAgICB9LFxuICAgICAgICByZWFkYWJpbGl0eV9yZXZpZXc6IHtcbiAgICAgICAgICAgIHNjb3JlOiA3MixcbiAgICAgICAgICAgIGF2Z19zZW50ZW5jZV9sZW5ndGg6IDE4LFxuICAgICAgICAgICAgZmxlc2NoX2tpbmNhaWRfZXN0aW1hdGU6ICc4dGggZ3JhZGUnLFxuICAgICAgICAgICAgcmVhZGFiaWxpdHlfaXNzdWVzOiBbXVxuICAgICAgICB9LFxuICAgICAgICBpbnRlcm5hbF9saW5raW5nX3Jldmlldzoge1xuICAgICAgICAgICAgc2NvcmU6IGludGVybmFsTGlua0NvdW50ID4gMiA/IDcwIDogNTAsXG4gICAgICAgICAgICBpbnRlcm5hbF9saW5rc19mb3VuZDogaW50ZXJuYWxMaW5rQ291bnQsXG4gICAgICAgICAgICBpbnRlcm5hbF9saW5rX3JlY29tbWVuZGF0aW9uczogaW50ZXJuYWxMaW5rQ291bnQgPT09IDAgPyBbXG4gICAgICAgICAgICAgICAgJ0FkZCByZWxldmFudCBpbnRlcm5hbCBsaW5rcydcbiAgICAgICAgICAgIF0gOiBbXVxuICAgICAgICB9LFxuICAgICAgICBjdGFfcmV2aWV3OiB7XG4gICAgICAgICAgICBzY29yZTogNzAsXG4gICAgICAgICAgICBjdGFfcHJlc2VudDogZHJhZnRNYXJrZG93bi50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKCdjdGEnKSB8fCBkcmFmdE1hcmtkb3duLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoJ2NhbGwnKSxcbiAgICAgICAgICAgIGN0YV9hbmFseXNpczogJ0NUQSBzZWN0aW9uIHJldmlldyBuZWVkZWQnXG4gICAgICAgIH0sXG4gICAgICAgIGNsaWVudF9nb2FsX2FsaWdubWVudDoge1xuICAgICAgICAgICAgc2NvcmU6IDcwLFxuICAgICAgICAgICAgYW5hbHlzaXM6ICdEcmFmdCBhbGlnbnMgd2l0aCBwcm92aWRlZCBjbGllbnQgZ29hbHMgYW5kIGF1ZGllbmNlIHRhcmdldGluZydcbiAgICAgICAgfSxcbiAgICAgICAgcmlza19mbGFnczogW10sXG4gICAgICAgIHByaW9yaXR5X2ZpeGVzOiBbXG4gICAgICAgICAgICAuLi5oMUNvdW50ID09PSAwID8gW1xuICAgICAgICAgICAgICAgICdFbnN1cmUgSDEgaGVhZGluZyBwcmVzZW50J1xuICAgICAgICAgICAgXSA6IFtdLFxuICAgICAgICAgICAgLi4ud29yZENvdW50IDwgMTUwMCA/IFtcbiAgICAgICAgICAgICAgICAnRXhwYW5kIGNvbnRlbnQgdG8gbWVldCB3b3JkIGNvdW50IHRhcmdldCdcbiAgICAgICAgICAgIF0gOiBbXSxcbiAgICAgICAgICAgIC4uLmludGVybmFsTGlua0NvdW50ID09PSAwID8gW1xuICAgICAgICAgICAgICAgICdBZGQgaW50ZXJuYWwgbGlua2luZyBzdHJhdGVneSdcbiAgICAgICAgICAgIF0gOiBbXVxuICAgICAgICBdLFxuICAgICAgICByZWNvbW1lbmRlZF9uZXh0X2FjdGlvbjogcmVjb21tZW5kZWRBY3Rpb24sXG4gICAgICAgIHJlYWR5X2Zvcl9lZGl0b3I6IHJlYWR5Rm9yRWRpdG9yLFxuICAgICAgICBuZWVkc19yZXZpZXc6IG92ZXJhbGxTY29yZSA8IDcwLFxuICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgIH07XG59XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9zZW8tcWEtc3RlcC8vcnVuU2VvUWFTdGVwXCIsIHJ1blNlb1FhU3RlcCk7XG4iLCAiaW1wb3J0IHsgcmVnaXN0ZXJTdGVwRnVuY3Rpb24gfSBmcm9tIFwid29ya2Zsb3cvaW50ZXJuYWwvcHJpdmF0ZVwiO1xuaW1wb3J0ICdzZXJ2ZXItb25seSc7XG5pbXBvcnQgeyBnZW5lcmF0ZVRleHQgfSBmcm9tICdhaSc7XG5pbXBvcnQgeyBvcGVuYWkgfSBmcm9tICdAYWktc2RrL29wZW5haSc7XG5pbXBvcnQgeyB1cGRhdGVSdW5EcmFmdCwgdXBkYXRlUnVuU3RhdHVzIH0gZnJvbSAnLi4vLi4vc3RvcmFnZS9ydW5zJztcbmltcG9ydCB7IGdldEFnZW50Q29uZmlnIH0gZnJvbSAnLi4vLi4vc3RvcmFnZS9hZ2VudC1jb25maWdzJztcbi8qKl9faW50ZXJuYWxfd29ya2Zsb3dze1wic3RlcHNcIjp7XCJsaWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3dyaXRlci1zdGVwLnRzXCI6e1wicnVuV3JpdGVyU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3dyaXRlci1zdGVwLy9ydW5Xcml0ZXJTdGVwXCJ9fX19Ki87XG4vKipcbiAqIFdyaXRlciBTdGVwIC0gUGhhc2UgMkMtQ1xuICogUnVucyBpbnNpZGUgYSBkdXJhYmxlIHN0ZXAgZnVuY3Rpb24gKGhhcyBOb2RlLmpzIGFjY2VzcylcbiAqIENhbGxzIEFJIG1vZGVsIHRvIGdlbmVyYXRlIGZpcnN0IGZ1bGwgYmxvZyBkcmFmdCBpbiBNYXJrZG93blxuICogVXNlcyByZXNlYXJjaCBkYXRhIGFuZCBvdXRsaW5lIHRvIHN0cnVjdHVyZSB0aGUgY29udGVudFxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5Xcml0ZXJTdGVwKHJ1bklkLCBpbnB1dCwgcmVzZWFyY2hEYXRhLCBvdXRsaW5lRGF0YSkge1xuICAgIGNvbnNvbGUubG9nKGBbdjBdIFdyaXRlciBzdGVwOiBDcmVhdGluZyBkcmFmdCBmb3IgcnVuICR7cnVuSWR9YCk7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gTG9hZCBhZ2VudCBjb25maWcgZnJvbSBkYXRhYmFzZVxuICAgICAgICBjb25zdCBhZ2VudENvbmZpZyA9IGF3YWl0IGdldEFnZW50Q29uZmlnKCd3cml0ZXInKTtcbiAgICAgICAgaWYgKCFhZ2VudENvbmZpZykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBY3RpdmUgYWdlbnQgY29uZmlnIG5vdCBmb3VuZCBmb3IgYWdlbnRfa2V5OiB3cml0ZXInKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBTRU8gQmxvZyBBZ2VudCBDb25maWcgTG9hZGVkOiB3cml0ZXIgdiR7YWdlbnRDb25maWcudmVyc2lvbn1gKTtcbiAgICAgICAgLy8gQnVpbGQgc3lzdGVtIHByb21wdCBmcm9tIGRhdGFiYXNlIGNvbmZpZ1xuICAgICAgICBjb25zdCBzeXN0ZW1Qcm9tcHQgPSBbXG4gICAgICAgICAgICBhZ2VudENvbmZpZy5zeXN0ZW1fcHJvbXB0LFxuICAgICAgICAgICAgYWdlbnRDb25maWcuc2tpbGxfbWFya2Rvd25cbiAgICAgICAgXS5maWx0ZXIoQm9vbGVhbikuam9pbignXFxuXFxuJyk7XG4gICAgICAgIC8vIENyZWF0ZSBjb250ZXh0IGZyb20gYXZhaWxhYmxlIGRhdGFcbiAgICAgICAgY29uc3QgdG9waWMgPSBpbnB1dC5ibG9nX3RvcGljIHx8IGlucHV0LnRvcGljIHx8ICdZb3VyIFRvcGljJztcbiAgICAgICAgY29uc3QgcHJpbWFyeUtleXdvcmQgPSBpbnB1dC5wcmltYXJ5X2tleXdvcmQgfHwgJ3ByaW1hcnkga2V5d29yZCc7XG4gICAgICAgIGNvbnN0IHNlY29uZGFyeUtleXdvcmRzID0gKGlucHV0LnNlY29uZGFyeV9rZXl3b3JkcyB8fCBpbnB1dC5rZXl3b3JkcyB8fCBbXSkuam9pbignLCAnKSB8fCAnc2Vjb25kYXJ5IGtleXdvcmRzJztcbiAgICAgICAgY29uc3QgYnVzaW5lc3NOYW1lID0gaW5wdXQuYnVzaW5lc3NfbmFtZSB8fCAnWW91ciBCdXNpbmVzcyc7XG4gICAgICAgIGNvbnN0IGF1ZGllbmNlTm90ZXMgPSBpbnB1dC5hdWRpZW5jZV9ub3RlcyB8fCAnVGFyZ2V0IGF1ZGllbmNlIG5vdCBzcGVjaWZpZWQnO1xuICAgICAgICBjb25zdCBicmFuZFZvaWNlID0gaW5wdXQuYnJhbmRfdm9pY2Vfbm90ZXMgfHwgJ1Byb2Zlc3Npb25hbCBhbmQgY2xlYXInO1xuICAgICAgICBjb25zdCBjdGFOb3RlcyA9IGlucHV0LmN0YV9ub3RlcyB8fCAnJztcbiAgICAgICAgY29uc3QgaW50ZXJuYWxMaW5rTm90ZXMgPSBpbnB1dC5pbnRlcm5hbF9saW5rX25vdGVzIHx8ICcnO1xuICAgICAgICBjb25zdCBhZGRpdGlvbmFsTm90ZXMgPSBpbnB1dC5hZGRpdGlvbmFsX29yZGVyX25vdGVzIHx8ICdObyBhZGRpdGlvbmFsIG5vdGVzJztcbiAgICAgICAgY29uc3QgdGFyZ2V0V29yZENvdW50ID0gaW5wdXQudGFyZ2V0X3dvcmRfY291bnQgfHwgMTUwMDtcbiAgICAgICAgLy8gQnVpbGQgcmVzZWFyY2ggY29udGV4dCBpZiBhdmFpbGFibGVcbiAgICAgICAgbGV0IHJlc2VhcmNoQ29udGV4dCA9ICcnO1xuICAgICAgICBpZiAocmVzZWFyY2hEYXRhICYmIHR5cGVvZiByZXNlYXJjaERhdGEgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICBjb25zdCBmaW5kaW5ncyA9IHJlc2VhcmNoRGF0YS5rZXlfZmluZGluZ3MgfHwgW107XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShmaW5kaW5ncykgJiYgZmluZGluZ3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHJlc2VhcmNoQ29udGV4dCA9IGBcXG5cXG5LZXkgUmVzZWFyY2ggRmluZGluZ3M6XFxuJHtmaW5kaW5ncy5tYXAoKGYpPT5gLSAke3R5cGVvZiBmID09PSAnc3RyaW5nJyA/IGYgOiBKU09OLnN0cmluZ2lmeShmKX1gKS5qb2luKCdcXG4nKX1gO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIEJ1aWxkIG91dGxpbmUgY29udGV4dCBpZiBhdmFpbGFibGVcbiAgICAgICAgbGV0IG91dGxpbmVDb250ZXh0ID0gJyc7XG4gICAgICAgIGlmIChvdXRsaW5lRGF0YSkge1xuICAgICAgICAgICAgY29uc3Qgc2VjdGlvbnMgPSAob3V0bGluZURhdGEuc2VjdGlvbnMgfHwgW10pLm1hcCgocyk9PmAjIyAke3R5cGVvZiBzID09PSAnc3RyaW5nJyA/IHMgOiBzLmhlYWRpbmcgfHwgJ1NlY3Rpb24nfVxcbigke3MucHVycG9zZSB8fCAnU2VjdGlvbiBjb250ZW50J30pYCk7XG4gICAgICAgICAgICBpZiAoc2VjdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIG91dGxpbmVDb250ZXh0ID0gYFxcblxcbk91dGxpbmUgU3RydWN0dXJlOlxcbiR7c2VjdGlvbnMuam9pbignXFxuXFxuJyl9YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBCdWlsZCBpbnRlcm5hbCBsaW5rcyBjb250ZXh0XG4gICAgICAgIGxldCBsaW5rc0NvbnRleHQgPSAnJztcbiAgICAgICAgaWYgKGludGVybmFsTGlua05vdGVzKSB7XG4gICAgICAgICAgICBsaW5rc0NvbnRleHQgPSBgXFxuXFxuSW50ZXJuYWwgTGluayBPcHBvcnR1bml0aWVzOlxcbiR7aW50ZXJuYWxMaW5rTm90ZXN9YDtcbiAgICAgICAgfVxuICAgICAgICAvLyBCdWlsZCBDVEEgY29udGV4dFxuICAgICAgICBsZXQgY3RhQ29udGV4dCA9ICcnO1xuICAgICAgICBpZiAoY3RhTm90ZXMpIHtcbiAgICAgICAgICAgIGN0YUNvbnRleHQgPSBgXFxuXFxuQ2FsbC10by1BY3Rpb24gR3VpZGFuY2U6XFxuJHtjdGFOb3Rlc31gO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHVzZXJNZXNzYWdlID0gYFdyaXRlIHRoZSBmaXJzdCBkcmFmdCBibG9nIHBvc3QgYWJvdXQ6ICR7dG9waWN9JHtyZXNlYXJjaENvbnRleHR9JHtvdXRsaW5lQ29udGV4dH0ke2xpbmtzQ29udGV4dH0ke2N0YUNvbnRleHR9YDtcbiAgICAgICAgLy8gR2V0IG1vZGVsIG5hbWU6IHVzZSBEQiBjb25maWcgaWYgYXZhaWxhYmxlLCBvdGhlcndpc2UgZmFsbCBiYWNrIHRvIGVudiB2YXIgb3IgZGVmYXVsdFxuICAgICAgICBjb25zdCBtb2RlbE5hbWUgPSBhZ2VudENvbmZpZy5tb2RlbCB8fCBwcm9jZXNzLmVudi5XUklURVJfQUdFTlRfTU9ERUwgfHwgcHJvY2Vzcy5lbnYuUkVTRUFSQ0hfQUdFTlRfTU9ERUwgfHwgJ2dwdC01LjQtbWluaSc7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFdyaXRlciBzdGVwOiBVc2luZyBtb2RlbDogJHttb2RlbE5hbWV9YCk7XG4gICAgICAgIC8vIENhbGwgQUkgbW9kZWwgdmlhIGRpcmVjdCBPcGVuQUkgcHJvdmlkZXJcbiAgICAgICAgY29uc3QgbW9kZWwgPSBvcGVuYWkobW9kZWxOYW1lKTtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBnZW5lcmF0ZVRleHQoe1xuICAgICAgICAgICAgbW9kZWwsXG4gICAgICAgICAgICBzeXN0ZW06IHN5c3RlbVByb21wdCxcbiAgICAgICAgICAgIHByb21wdDogdXNlck1lc3NhZ2UsXG4gICAgICAgICAgICB0ZW1wZXJhdHVyZTogMC43LFxuICAgICAgICAgICAgbWF4VG9rZW5zOiA0MDAwXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBkcmFmdE1hcmtkb3duID0gcmVzcG9uc2UudGV4dDtcbiAgICAgICAgLy8gQmFzaWMgdmFsaWRhdGlvblxuICAgICAgICBpZiAoIWRyYWZ0TWFya2Rvd24gfHwgZHJhZnRNYXJrZG93bi50cmltKCkubGVuZ3RoIDwgNTAwKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0dlbmVyYXRlZCBjb250ZW50IHRvbyBzaG9ydCcpO1xuICAgICAgICB9XG4gICAgICAgIC8vIENhbGN1bGF0ZSBtZXRyaWNzXG4gICAgICAgIGNvbnN0IHdvcmRDb3VudCA9IGRyYWZ0TWFya2Rvd24uc3BsaXQoL1xccysvKS5sZW5ndGg7XG4gICAgICAgIGNvbnN0IHNlY3Rpb25zQ291bnQgPSAoZHJhZnRNYXJrZG93bi5tYXRjaCgvXiMjXFxzL2dtKSB8fCBbXSkubGVuZ3RoO1xuICAgICAgICBjb25zdCBoYXNDdGEgPSBkcmFmdE1hcmtkb3duLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoJ2NhbGwnKSB8fCBkcmFmdE1hcmtkb3duLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoJ2FjdGlvbicpIHx8IGN0YU5vdGVzLmxlbmd0aCA+IDA7XG4gICAgICAgIGNvbnN0IGhhc0ludGVybmFsTGlua3MgPSBkcmFmdE1hcmtkb3duLmluY2x1ZGVzKCdbbGluazonKSB8fCBpbnRlcm5hbExpbmtOb3Rlcy5sZW5ndGggPiAwO1xuICAgICAgICBjb25zdCB3cml0ZXJPdXRwdXQgPSB7XG4gICAgICAgICAgICBkcmFmdF9tYXJrZG93bjogZHJhZnRNYXJrZG93bixcbiAgICAgICAgICAgIHdvcmRfY291bnQ6IHdvcmRDb3VudCxcbiAgICAgICAgICAgIHNlY3Rpb25zX3dyaXR0ZW46IHNlY3Rpb25zQ291bnQsXG4gICAgICAgICAgICBoYXNfY3RhOiBoYXNDdGEsXG4gICAgICAgICAgICBoYXNfaW50ZXJuYWxfbGlua3M6IGhhc0ludGVybmFsTGlua3MsXG4gICAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgICAgICB9O1xuICAgICAgICAvLyBQZXJzaXN0IGRyYWZ0X21hcmtkb3duIHRvIGRhdGFiYXNlIChtYXJrZG93biBzdHJpbmcgb25seSwgbm90IGZ1bGwgb2JqZWN0KVxuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBXcml0ZXIgc3RlcDogUGVyc2lzdGluZyBkcmFmdF9tYXJrZG93biAoJHt3b3JkQ291bnR9IHdvcmRzKSBmb3IgcnVuICR7cnVuSWR9YCk7XG4gICAgICAgIGF3YWl0IHVwZGF0ZVJ1bkRyYWZ0KHJ1bklkLCB3cml0ZXJPdXRwdXQuZHJhZnRfbWFya2Rvd24pO1xuICAgICAgICAvLyBBbHNvIHVwZGF0ZSBzdGF0dXMgdG8gJ3dyaXRpbmcnXG4gICAgICAgIGF3YWl0IHVwZGF0ZVJ1blN0YXR1cyhydW5JZCwgJ3dyaXRpbmcnKTtcbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gV3JpdGVyIHN0ZXA6IENvbXBsZXRlIGZvciBydW4gJHtydW5JZH0gKCR7d29yZENvdW50fSB3b3JkcywgJHtzZWN0aW9uc0NvdW50fSBzZWN0aW9ucylgKTtcbiAgICAgICAgcmV0dXJuIHdyaXRlck91dHB1dDtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBlcnJvck1zZyA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3IgaW4gd3JpdGVyIHN0ZXAnO1xuICAgICAgICBjb25zb2xlLmVycm9yKGBbdjBdIFdyaXRlciBzdGVwIGVycm9yIGZvciBydW4gJHtydW5JZH06ICR7ZXJyb3JNc2d9YCk7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgV3JpdGVyIHN0ZXAgZmFpbGVkOiAke2Vycm9yTXNnfWApO1xuICAgIH1cbn1cbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3dyaXRlci1zdGVwLy9ydW5Xcml0ZXJTdGVwXCIsIHJ1bldyaXRlclN0ZXApO1xuIiwgIlxuICAgIC8vIEJ1aWx0IGluIHN0ZXBzXG4gICAgaW1wb3J0ICd3b3JrZmxvdy9pbnRlcm5hbC9idWlsdGlucyc7XG4gICAgLy8gVXNlciBzdGVwc1xuICAgIGltcG9ydCAnLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL2NhbGxiYWNrLXN0ZXAudHMnO1xuaW1wb3J0ICcuL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvZWRpdG9yLXN0ZXAudHMnO1xuaW1wb3J0ICcuL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvaGVscGVycy50cyc7XG5pbXBvcnQgJy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9tZXRhLXN0ZXAudHMnO1xuaW1wb3J0ICcuL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvb3V0bGluZS1zdGVwLnRzJztcbmltcG9ydCAnLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3Jlc2VhcmNoLXN0ZXAudHMnO1xuaW1wb3J0ICcuL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvc2VvLXFhLXN0ZXAudHMnO1xuaW1wb3J0ICcuL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvd3JpdGVyLXN0ZXAudHMnO1xuICAgIC8vIFNlcmRlIGZpbGVzIGZvciBjcm9zcy1jb250ZXh0IGNsYXNzIHJlZ2lzdHJhdGlvblxuICAgIFxuICAgIC8vIEFQSSBlbnRyeXBvaW50XG4gICAgZXhwb3J0IHsgc3RlcEVudHJ5cG9pbnQgYXMgSEVBRCwgc3RlcEVudHJ5cG9pbnQgYXMgUE9TVCB9IGZyb20gJ3dvcmtmbG93L3J1bnRpbWUnOyJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7QUFBQSxTQUFBLDRCQUFBO0FBU0UsZUFBVyxrQ0FBQTtBQUNYLFNBQU8sS0FBSyxZQUFXO0FBQ3pCO0FB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QyxpQkFBZ0IsT0FBTyxTQUFTO0FBQ3RDLFlBQVEsSUFBSSxzQ0FBc0MsS0FBSyxLQUFLLFNBQVMsV0FBVyxhQUFhLFlBQVk7QUFDekcsV0FBTztBQUFBLEVBQ1gsU0FBUyxPQUFPO0FBQ1osVUFBTSxXQUFXLGlCQUFpQixRQUFRLE1BQU0sVUFBVTtBQUMxRCxZQUFRLE1BQU0sa0NBQWtDLEtBQUssS0FBSyxRQUFRLEVBQUU7QUFDcEUsVUFBTSxJQUFJLE1BQU0sdUJBQXVCLFFBQVEsRUFBRTtBQUFBLEVBQ3JEO0FBQ0o7QUE5RjBCO0FBK0YxQkMsc0JBQXFCLHlFQUF5RSxhQUFhOzs7QUM1RnZHLFNBQTJCLGdCQUF3QixrQkFBbEJDLHVCQUE4QjsiLAogICJuYW1lcyI6IFsicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAiZ2VuZXJhdGVUZXh0IiwgIm9wZW5haSIsICJnZXRBZ2VudENvbmZpZyIsICJnZXRBZ2VudENvbmZpZyIsICJnZW5lcmF0ZVRleHQiLCAib3BlbmFpIiwgInJlZ2lzdGVyU3RlcEZ1bmN0aW9uIiwgInJlZ2lzdGVyU3RlcEZ1bmN0aW9uIiwgImdlbmVyYXRlVGV4dCIsICJvcGVuYWkiLCAidXBkYXRlUnVuU3RhdHVzIiwgImdldEFnZW50Q29uZmlnIiwgImdldEFnZW50Q29uZmlnIiwgIm9wZW5haSIsICJnZW5lcmF0ZVRleHQiLCAidXBkYXRlUnVuU3RhdHVzIiwgInJlZ2lzdGVyU3RlcEZ1bmN0aW9uIiwgInJlZ2lzdGVyU3RlcEZ1bmN0aW9uIiwgImdlbmVyYXRlVGV4dCIsICJvcGVuYWkiLCAidXBkYXRlUnVuU3RhdHVzIiwgImdldEFnZW50Q29uZmlnIiwgImdldEFnZW50Q29uZmlnIiwgIm9wZW5haSIsICJnZW5lcmF0ZVRleHQiLCAidXBkYXRlUnVuU3RhdHVzIiwgInJlZ2lzdGVyU3RlcEZ1bmN0aW9uIiwgInJlZ2lzdGVyU3RlcEZ1bmN0aW9uIiwgImdlbmVyYXRlVGV4dCIsICJvcGVuYWkiLCAidXBkYXRlUnVuU3RhdHVzIiwgImdldEFnZW50Q29uZmlnIiwgImdldEFnZW50Q29uZmlnIiwgImdlbmVyYXRlVGV4dCIsICJvcGVuYWkiLCAidXBkYXRlUnVuU3RhdHVzIiwgInJlZ2lzdGVyU3RlcEZ1bmN0aW9uIiwgInJlZ2lzdGVyU3RlcEZ1bmN0aW9uIiwgImdlbmVyYXRlVGV4dCIsICJvcGVuYWkiLCAidXBkYXRlUnVuU3RhdHVzIiwgImdldEFnZW50Q29uZmlnIiwgImdldEFnZW50Q29uZmlnIiwgIm9wZW5haSIsICJnZW5lcmF0ZVRleHQiLCAidXBkYXRlUnVuU3RhdHVzIiwgInJlZ2lzdGVyU3RlcEZ1bmN0aW9uIiwgInN0ZXBFbnRyeXBvaW50Il0KfQo=

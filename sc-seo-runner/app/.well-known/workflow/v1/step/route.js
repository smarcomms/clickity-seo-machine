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
import { buildFullInputContext } from "../../../../../lib/seo-blog-engine/workflow/steps/context-builder.ts";
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
    const { text } = await generateText({
      model: openai(modelName),
      temperature: 0.6,
      maxTokens: 8e3,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Edit the draft below using the supplied context and SEO QA feedback.

${buildFullInputContext(input)}

Research Agent Output:
${JSON.stringify(research, null, 2)}

Outline Agent Output:
${JSON.stringify(outline, null, 2)}

SEO QA Feedback:
${editorContext}

Original Draft Markdown:
${originalDraft}

Return the edited blog in Markdown only. Do not return JSON. Do not include explanations, editor notes, markdown fences, or comments outside the article.`
        }
      ]
    });
    const editedDraft = text.trim();
    if (!editedDraft) {
      throw new Error("Editor output was empty");
    }
    if (editedDraft.startsWith("{")) {
      throw new Error("Editor output invalid: expected Markdown, received JSON-like response");
    }
    if (editedDraft.length < Math.min(500, Math.floor(originalDraft.length * 0.4))) {
      throw new Error("Editor output too short compared with original draft");
    }
    const editorOutput = {
      edited_draft_markdown: editedDraft,
      editor_notes: [
        "Editor Agent returned Markdown only as required by the active DB prompt."
      ],
      changes_made: seoQa.priority_fixes || [],
      human_review_required: true
    };
    console.log(`[v0] Editor step: Generated edited draft (${editorOutput.edited_draft_markdown.length} chars)`);
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
  sections.push(`Ready For Editor: ${seoQa.ready_for_editor}`);
  sections.push(`Recommended Next Action: ${seoQa.recommended_next_action}`);
  sections.push(`Needs Review: ${seoQa.needs_review}`);
  sections.push("\n## Search Intent Alignment");
  sections.push(`Score: ${seoQa.search_intent_alignment.score}/100`);
  sections.push(`Analysis: ${seoQa.search_intent_alignment.analysis}`);
  sections.push("\n## Primary Keyword Usage");
  sections.push(`Score: ${seoQa.primary_keyword_usage.score}/100`);
  sections.push(`Occurrences: ${seoQa.primary_keyword_usage.occurrences} times`);
  sections.push(`Placement: ${seoQa.primary_keyword_usage.placement_analysis}`);
  sections.push("\n## Secondary Keywords");
  sections.push(`Score: ${seoQa.secondary_keyword_usage.score}/100`);
  sections.push(`Covered: ${seoQa.secondary_keyword_usage.keywords_covered.join(", ") || "None"}`);
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
  sections.push("\n## CTA Review");
  sections.push(`Score: ${seoQa.cta_review.score}/100`);
  sections.push(`CTA Present: ${seoQa.cta_review.cta_present}`);
  sections.push(`CTA Analysis: ${seoQa.cta_review.cta_analysis}`);
  sections.push("\n## Internal Linking");
  sections.push(`Score: ${seoQa.internal_linking_review.score}/100`);
  sections.push(`Links Found: ${seoQa.internal_linking_review.internal_links_found}`);
  if (seoQa.internal_linking_review.internal_link_recommendations.length > 0) {
    sections.push(`Recommendations: ${seoQa.internal_linking_review.internal_link_recommendations.join("; ")}`);
  }
  sections.push("\n## Client Goal Alignment");
  sections.push(`Score: ${seoQa.client_goal_alignment.score}/100`);
  sections.push(`Analysis: ${seoQa.client_goal_alignment.analysis}`);
  if (seoQa.priority_fixes.length > 0) {
    sections.push("\n## Priority Fixes");
    sections.push(seoQa.priority_fixes.map((fix) => `- ${fix}`).join("\n"));
  }
  if (seoQa.risk_flags.length > 0) {
    sections.push("\n## Risk Flags");
    sections.push(seoQa.risk_flags.map((flag) => `- ${flag}`).join("\n"));
  }
  sections.push("\n## Research Notes");
  sections.push(`Content Angle: ${research.content_angle}`);
  sections.push(`Client Goal Alignment: ${research.client_goal_alignment}`);
  sections.push("\n## Outline Notes");
  sections.push(`Title: ${outline.title}`);
  sections.push(`CTA Guidance: ${outline.cta_guidance}`);
  sections.push("\n## Additional Client Guidance");
  if (input.cta_notes || input.cta || input.blog_context_brief?.cta) {
    sections.push(`CTA Notes: ${input.blog_context_brief?.cta || input.cta || input.cta_notes}`);
  }
  if (input.brand_voice_notes || input.blog_context_brief?.brand_voice_notes || input.tone) {
    sections.push(`Brand Voice: ${input.blog_context_brief?.brand_voice_notes || input.brand_voice_notes || input.tone}`);
  }
  if (input.audience_notes || input.target_audience || input.blog_context_brief?.target_audience) {
    sections.push(`Target Audience: ${input.blog_context_brief?.target_audience || input.target_audience || input.audience_notes}`);
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
import { buildFullInputContext as buildFullInputContext2, extractJsonObject } from "../../../../../lib/seo-blog-engine/workflow/steps/context-builder.ts";
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
      metaOutput = JSON.parse(extractJsonObject(metaAnalysis));
    } catch (parseError) {
      const errorMsg = parseError instanceof Error ? parseError.message : String(parseError);
      const fullError = `Meta output parse failed: ${errorMsg}`;
      console.error(`[v0] Meta step: ${fullError}`);
      throw new Error(fullError);
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

FULL BLOG CONTEXT:
${buildFullInputContext2(input)}

RESEARCH SUMMARY:
- ${keyFindingsSummary}

OUTLINE STRUCTURE:
${outline.sections.map((s) => `- ${s.heading} (${s.key_points?.length || 0} key points)`).join("\n")}

SEO QA REVIEW:
- Overall Score: ${seoQa.overall_score}
- Search Intent Alignment: ${seoQa.search_intent_alignment.score}
- Primary Keyword Usage: ${seoQa.primary_keyword_usage.score}
- Heading Structure: ${seoQa.heading_structure_review.score}
- Client Goal Alignment: ${seoQa.client_goal_alignment.score}

EDITED BLOG MARKDOWN:
${editedDraft}

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
  "human_review_required": true,
  "review_ready": true,
  "meta_notes": ["note1", "note2"],
  "needs_review": false
}`;
}
__name(buildMetaContext, "buildMetaContext");
registerStepFunction5("step//./lib/seo-blog-engine/workflow/steps/meta-step//runMetaStep", runMetaStep);

// lib/seo-blog-engine/workflow/steps/outline-step.ts
import { registerStepFunction as registerStepFunction6 } from "workflow/internal/private";
import { generateText as generateText3 } from "ai";
import { openai as openai3 } from "@ai-sdk/openai";
import { updateRunStatus as updateRunStatus2 } from "../../../../../lib/seo-blog-engine/storage/runs.ts";
import { getAgentConfig as getAgentConfig3 } from "../../../../../lib/seo-blog-engine/storage/agent-configs.ts";
import { buildFullInputContext as buildFullInputContext3, extractJsonObject as extractJsonObject2 } from "../../../../../lib/seo-blog-engine/workflow/steps/context-builder.ts";
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
    const userMessage = `Create the Outline Agent JSON using the supplied Research Agent output and full Blog Context Brief.

${buildFullInputContext3(input)}${researchContext}

Return valid JSON only using the schema from your system instructions. Preserve must_include and must_avoid restrictions, and include client_goal_notes for each section.`;
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
    const outlineData = JSON.parse(extractJsonObject2(response.text));
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
          ],
          client_goal_notes: [
            "Connect the topic to the supplied client goal where relevant"
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
          ],
          client_goal_notes: [
            "Use supplied business goal and services without inventing claims"
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
          ],
          client_goal_notes: [
            "Close with the supplied CTA direction"
          ]
        }
      ];
    }
    outlineData.sections = outlineData.sections.map((section) => ({
      ...section,
      key_points: Array.isArray(section.key_points) ? section.key_points : [],
      seo_notes: Array.isArray(section.seo_notes) ? section.seo_notes : [],
      client_goal_notes: Array.isArray(section.client_goal_notes) ? section.client_goal_notes : [],
      estimated_words: typeof section.estimated_words === "number" ? section.estimated_words : 0
    }));
    outlineData.needs_review = Boolean(outlineData.needs_review);
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
          ],
          client_goal_notes: [
            "Introduce why this topic matters for the supplied audience and business goal"
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
          ],
          client_goal_notes: [
            "Tie benefits back to the supplied service or CTA only when supported"
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
          ],
          client_goal_notes: [
            "Keep recommendations grounded in the supplied context"
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
          ],
          client_goal_notes: [
            "Use the supplied CTA direction without inventing offers"
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
      needs_review: true,
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
import { buildFullInputContext as buildFullInputContext4, extractJsonObject as extractJsonObject3 } from "../../../../../lib/seo-blog-engine/workflow/steps/context-builder.ts";
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
    const userMessage = `Create the Research Agent JSON using all supplied context.

${buildFullInputContext4(input)}

Return valid JSON only using the schema from your system instructions. Do not write the blog or outline. Preserve must_include and must_avoid exactly where provided.`;
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
      researchData = JSON.parse(extractJsonObject3(response.text));
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
          "Competitor context was not available in parsed model output"
        ],
        recommended_sections: [
          "Introduction",
          "Main Content",
          "Conclusion"
        ],
        questions_to_answer: [
          "What is the main topic?"
        ],
        client_goal_alignment: input.blog_context_brief?.business_goal || input.business_goal || "Client goal not specified",
        must_include: input.blog_context_brief?.must_include || input.must_include || [],
        must_avoid: input.blog_context_brief?.must_avoid || input.must_avoid || [],
        research_notes: "Fallback research due to parsing error; human review recommended",
        target_word_count: input.target_word_count || 1e3,
        web_search_used: false,
        needs_review: true,
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
import { buildFullInputContext as buildFullInputContext5, extractJsonObject as extractJsonObject4 } from "../../../../../lib/seo-blog-engine/workflow/steps/context-builder.ts";
var VALID_RECOMMENDED_ACTIONS = [
  "Approve for editor",
  "Revise before editor",
  "Needs human review"
];
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
    const seoQaPrompt = `Review this draft using the SEO QA schema from your system instructions.

${buildFullInputContext5(input)}

Research Agent Output:
${JSON.stringify(researchData ?? {}, null, 2)}

Outline Agent Output:
${JSON.stringify(outlineData ?? {}, null, 2)}

Blog Draft Markdown:
${draftMarkdown}

Return valid JSON only. Do not rewrite the draft. Do not include markdown fences or explanation text. The recommended_next_action must be exactly one of: ${VALID_RECOMMENDED_ACTIONS.map((value) => `"${value}"`).join(", ")}.`;
    const { text } = await generateText5({
      model: openai5(modelName),
      system: systemPrompt,
      prompt: seoQaPrompt,
      temperature: 0.4,
      maxTokens: 3e3
    });
    console.log(`[v0] SEO QA step: Received audit from model, parsing JSON`);
    let seoQaResult;
    try {
      seoQaResult = JSON.parse(extractJsonObject4(text));
    } catch (parseErr) {
      const message = parseErr instanceof Error ? parseErr.message : String(parseErr);
      throw new Error(`SEO QA output parse failed: ${message}`);
    }
    validateSeoQaOutput(seoQaResult);
    seoQaResult.timestamp = seoQaResult.timestamp || (/* @__PURE__ */ new Date()).toISOString();
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
function validateSeoQaOutput(output) {
  const missingFields = [];
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
  for (const field of requiredFields) {
    if (output[field] === void 0 || output[field] === null) {
      missingFields.push(field);
    }
  }
  if (missingFields.length > 0) {
    throw new Error(`SEO QA output missing required fields: ${missingFields.join(", ")}`);
  }
  if (typeof output.overall_score !== "number" || output.overall_score < 0 || output.overall_score > 100) {
    throw new Error(`SEO QA output invalid overall_score: ${output.overall_score}, must be number between 0-100`);
  }
  if (typeof output.ready_for_editor !== "boolean") {
    throw new Error("SEO QA output invalid ready_for_editor: expected boolean");
  }
  if (!VALID_RECOMMENDED_ACTIONS.includes(output.recommended_next_action)) {
    throw new Error(`SEO QA output invalid recommended_next_action: ${output.recommended_next_action}`);
  }
  if (!Array.isArray(output.priority_fixes)) {
    throw new Error("SEO QA output invalid priority_fixes: expected array");
  }
  if (!Array.isArray(output.risk_flags)) {
    throw new Error("SEO QA output invalid risk_flags: expected array");
  }
  if (typeof output.needs_review !== "boolean") {
    throw new Error("SEO QA output invalid needs_review: expected boolean");
  }
  validateScoreObject(output.search_intent_alignment, "search_intent_alignment");
  validateScoreObject(output.primary_keyword_usage, "primary_keyword_usage");
  validateScoreObject(output.secondary_keyword_usage, "secondary_keyword_usage");
  validateScoreObject(output.heading_structure_review, "heading_structure_review");
  validateScoreObject(output.content_depth_review, "content_depth_review");
  validateScoreObject(output.readability_review, "readability_review");
  validateScoreObject(output.cta_review, "cta_review");
  validateScoreObject(output.internal_linking_review, "internal_linking_review");
  validateScoreObject(output.client_goal_alignment, "client_goal_alignment");
}
__name(validateSeoQaOutput, "validateSeoQaOutput");
function validateScoreObject(value, fieldName) {
  if (!value || typeof value !== "object") {
    throw new Error(`SEO QA output invalid ${fieldName}: expected object`);
  }
  const score = value.score;
  if (typeof score !== "number" || score < 0 || score > 100) {
    throw new Error(`SEO QA output invalid ${fieldName}.score: ${String(score)}, must be number between 0-100`);
  }
}
__name(validateScoreObject, "validateScoreObject");
registerStepFunction8("step//./lib/seo-blog-engine/workflow/steps/seo-qa-step//runSeoQaStep", runSeoQaStep);

// lib/seo-blog-engine/workflow/steps/writer-step.ts
import { registerStepFunction as registerStepFunction9 } from "workflow/internal/private";
import { generateText as generateText6 } from "ai";
import { openai as openai6 } from "@ai-sdk/openai";
import { updateRunDraft, updateRunStatus as updateRunStatus5 } from "../../../../../lib/seo-blog-engine/storage/runs.ts";
import { getAgentConfig as getAgentConfig6 } from "../../../../../lib/seo-blog-engine/storage/agent-configs.ts";
import { buildFullInputContext as buildFullInputContext6 } from "../../../../../lib/seo-blog-engine/workflow/steps/context-builder.ts";
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
    const userMessage = `Write the first draft blog post using the full Blog Context Brief, Research Agent output, and Outline Agent output.

${buildFullInputContext6(input)}${researchContext}${outlineContext}${linksContext}${ctaContext}

Topic: ${topic}
Business: ${businessName}
Primary Keyword: ${primaryKeyword}
Secondary Keywords: ${secondaryKeywords}
Target Word Count: ${targetWordCount}
Audience: ${audienceNotes}
Brand Voice: ${brandVoice}
Additional Notes: ${additionalNotes}

Return Markdown only, following the Writer Agent instructions. Do not invent unsupported facts, services, locations, offers, claims, or links.`;
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3dvcmtmbG93QDQuNS4wX0BuZXN0anMrY29tbW9uQDExLjEuMjdfcmVmbGVjdC1tZXRhZGF0YUAwLjIuMl9yeGpzQDcuOC4yX19AbmVzdGpzK2NvcmVAMV9hOWMxYWE2YzBiNTgwZTliZjNiZmY2NGMzMjY5ZmU0My9ub2RlX21vZHVsZXMvd29ya2Zsb3cvc3JjL2ludGVybmFsL2J1aWx0aW5zLnRzIiwgIi4uLy4uLy4uLy4uLy4uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvY2FsbGJhY2stc3RlcC50cyIsICIuLi8uLi8uLi8uLi8uLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL2VkaXRvci1zdGVwLnRzIiwgIi4uLy4uLy4uLy4uLy4uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvaGVscGVycy50cyIsICIuLi8uLi8uLi8uLi8uLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL21ldGEtc3RlcC50cyIsICIuLi8uLi8uLi8uLi8uLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL291dGxpbmUtc3RlcC50cyIsICIuLi8uLi8uLi8uLi8uLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3Jlc2VhcmNoLXN0ZXAudHMiLCAiLi4vLi4vLi4vLi4vLi4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9zZW8tcWEtc3RlcC50cyIsICIuLi8uLi8uLi8uLi8uLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3dyaXRlci1zdGVwLnRzIiwgIi4uLy4uLy4uLy4uLy4uL3ZpcnR1YWwtZW50cnkuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKlxuICogVGhlc2UgYXJlIHRoZSBidWlsdC1pbiBzdGVwcyB0aGF0IGFyZSBcImF1dG9tYXRpY2FsbHkgYXZhaWxhYmxlXCIgaW4gdGhlIHdvcmtmbG93IHNjb3BlLiBUaGV5IGFyZVxuICogc2ltaWxhciB0byBcInN0ZGxpYlwiIGV4Y2VwdCB0aGF0IGFyZSBub3QgbWVhbnQgdG8gYmUgaW1wb3J0ZWQgYnkgdXNlcnMsIGJ1dCBhcmUgaW5zdGVhZCBcImp1c3QgYXZhaWxhYmxlXCJcbiAqIGFsb25nc2lkZSB1c2VyIGRlZmluZWQgc3RlcHMuIFRoZXkgYXJlIHVzZWQgaW50ZXJuYWxseSBieSB0aGUgcnVudGltZVxuICovXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBfX2J1aWx0aW5fcmVzcG9uc2VfYXJyYXlfYnVmZmVyKFxuICB0aGlzOiBSZXF1ZXN0IHwgUmVzcG9uc2Vcbikge1xuICAndXNlIHN0ZXAnO1xuICByZXR1cm4gdGhpcy5hcnJheUJ1ZmZlcigpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gX19idWlsdGluX3Jlc3BvbnNlX2pzb24odGhpczogUmVxdWVzdCB8IFJlc3BvbnNlKSB7XG4gICd1c2Ugc3RlcCc7XG4gIHJldHVybiB0aGlzLmpzb24oKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIF9fYnVpbHRpbl9yZXNwb25zZV90ZXh0KHRoaXM6IFJlcXVlc3QgfCBSZXNwb25zZSkge1xuICAndXNlIHN0ZXAnO1xuICByZXR1cm4gdGhpcy50ZXh0KCk7XG59XG4iLCAiaW1wb3J0IHsgcmVnaXN0ZXJTdGVwRnVuY3Rpb24gfSBmcm9tIFwid29ya2Zsb3cvaW50ZXJuYWwvcHJpdmF0ZVwiO1xuaW1wb3J0ICdzZXJ2ZXItb25seSc7XG5pbXBvcnQgeyBnZXRSdW4sIHJlY29yZENhbGxiYWNrQXR0ZW1wdCB9IGZyb20gJy4uLy4uL3N0b3JhZ2UvcnVucyc7XG4vKipfX2ludGVybmFsX3dvcmtmbG93c3tcInN0ZXBzXCI6e1wibGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9jYWxsYmFjay1zdGVwLnRzXCI6e1wic2VuZENhbGxiYWNrU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL2NhbGxiYWNrLXN0ZXAvL3NlbmRDYWxsYmFja1N0ZXBcIn19fX0qLztcbi8qKlxuICogU2VuZCBjYWxsYmFjayBub3RpZmljYXRpb24gdG8gd2ViaG9vayBVUkxcbiAqIFJ1bnMgYXMgYSBkdXJhYmxlIHN0ZXAgdG8gZW5zdXJlIGNhbGxiYWNrIGRlbGl2ZXJ5IGlzIHRyYWNrZWRcbiAqIEZhaWx1cmVzIGRvIG5vdCBicmVhayB0aGUgbWFpbiB3b3JrZmxvd1xuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZW5kQ2FsbGJhY2tTdGVwKHJ1bklkKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gRmV0Y2ggcnVuIHRvIGdldCBjYWxsYmFjayBVUkwgYW5kIGZpbmFsIHN0YXRlXG4gICAgICAgIGNvbnN0IHJ1biA9IGF3YWl0IGdldFJ1bihydW5JZCk7XG4gICAgICAgIGlmICghcnVuKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYFt2MF0gQ2FsbGJhY2s6IFJ1biAke3J1bklkfSBub3QgZm91bmRgKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXJ1bi5jYWxsYmFja191cmwpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIENhbGxiYWNrOiBObyBjYWxsYmFjayBVUkwgZm9yIHJ1biAke3J1bklkfWApO1xuICAgICAgICAgICAgLy8gUmVjb3JkIHRoYXQgY2FsbGJhY2sgd2FzIG5vdCBjb25maWd1cmVkXG4gICAgICAgICAgICBhd2FpdCByZWNvcmRDYWxsYmFja0F0dGVtcHQocnVuSWQsICdub3RfY29uZmlndXJlZCcpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIENhbGxiYWNrOiBTZW5kaW5nIG5vdGlmaWNhdGlvbiB0byAke3J1bi5jYWxsYmFja191cmx9YCk7XG4gICAgICAgIC8vIEJ1aWxkIGNhbGxiYWNrIHBheWxvYWRcbiAgICAgICAgY29uc3QgY2FsbGJhY2tQYXlsb2FkID0gYnVpbGRDYWxsYmFja1BheWxvYWQocnVuKTtcbiAgICAgICAgLy8gU2VuZCBjYWxsYmFjayB3aXRoIHRpbWVvdXQgcHJvdGVjdGlvblxuICAgICAgICBjb25zdCBjb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgICAgICBjb25zdCB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KCgpPT5jb250cm9sbGVyLmFib3J0KCksIDMwMDAwKTsgLy8gMzAgc2Vjb25kIHRpbWVvdXRcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2gocnVuLmNhbGxiYWNrX3VybCwge1xuICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJ1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoY2FsbGJhY2tQYXlsb2FkKSxcbiAgICAgICAgICAgICAgICBzaWduYWw6IGNvbnRyb2xsZXIuc2lnbmFsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICAgICAgICAgICAgaWYgKHJlc3BvbnNlLm9rKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFt2MF0gQ2FsbGJhY2s6IFN1Y2Nlc3NmdWxseSBzZW50IGZvciBydW4gJHtydW5JZH0sIHN0YXR1cyAke3Jlc3BvbnNlLnN0YXR1c31gKTtcbiAgICAgICAgICAgICAgICAvLyBSZWNvcmQgc3VjY2Vzc2Z1bCBjYWxsYmFja1xuICAgICAgICAgICAgICAgIGF3YWl0IHJlY29yZENhbGxiYWNrQXR0ZW1wdChydW5JZCwgJ3N1Y2Nlc3MnLCByZXNwb25zZS5zdGF0dXMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzdGF0dXNUZXh0ID0gcmVzcG9uc2Uuc3RhdHVzVGV4dCB8fCBgSFRUUCAke3Jlc3BvbnNlLnN0YXR1c31gO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgW3YwXSBDYWxsYmFjazogV2ViaG9vayByZXR1cm5lZCAke3Jlc3BvbnNlLnN0YXR1c30gZm9yIHJ1biAke3J1bklkfWApO1xuICAgICAgICAgICAgICAgIC8vIFJlY29yZCBmYWlsZWQgY2FsbGJhY2sgd2l0aCBIVFRQIHN0YXR1c1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTXNnID0gYFdlYmhvb2sgcmV0dXJuZWQgJHtyZXNwb25zZS5zdGF0dXN9OiAke3N0YXR1c1RleHR9YDtcbiAgICAgICAgICAgICAgICBhd2FpdCByZWNvcmRDYWxsYmFja0F0dGVtcHQocnVuSWQsICdmYWlsZWQnLCByZXNwb25zZS5zdGF0dXMsIGVycm9yTXNnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZmV0Y2hFcnJvcikge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgICAgICAgICBsZXQgZXJyb3JNZXNzYWdlID0gJ1Vua25vd24gbmV0d29yayBlcnJvcic7XG4gICAgICAgICAgICBpZiAoZmV0Y2hFcnJvciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgICAgICAgICAgaWYgKGZldGNoRXJyb3IubmFtZSA9PT0gJ0Fib3J0RXJyb3InKSB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZSA9ICdSZXF1ZXN0IHRpbWVvdXQgKDMwcyknO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFt2MF0gQ2FsbGJhY2s6IFJlcXVlc3QgdGltZW91dCAoMzBzKSBmb3IgcnVuICR7cnVuSWR9YCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlID0gYE5ldHdvcmsgZXJyb3I6ICR7ZmV0Y2hFcnJvci5tZXNzYWdlfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgW3YwXSBDYWxsYmFjazogJHtlcnJvck1lc3NhZ2V9IGZvciBydW4gJHtydW5JZH1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgW3YwXSBDYWxsYmFjazogVW5rbm93biBlcnJvciBmb3IgcnVuICR7cnVuSWR9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBSZWNvcmQgZmFpbGVkIGNhbGxiYWNrIHdpdGggZXJyb3IgbWVzc2FnZSAobm8gSFRUUCBzdGF0dXMgZm9yIG5ldHdvcmsgZXJyb3JzKVxuICAgICAgICAgICAgYXdhaXQgcmVjb3JkQ2FsbGJhY2tBdHRlbXB0KHJ1bklkLCAnZmFpbGVkJywgdW5kZWZpbmVkLCBlcnJvck1lc3NhZ2UpO1xuICAgICAgICAvLyBEb24ndCB0aHJvdyAtIGNhbGxiYWNrIGZhaWx1cmUgc2hvdWxkIG5vdCBmYWlsIHRoZSB3b3JrZmxvd1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgLy8gTG9nIGVycm9yIHNhZmVseSB3aXRob3V0IGV4cG9zaW5nIHNlY3JldHNcbiAgICAgICAgY29uc3QgZXJyb3JNc2cgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2MF0gQ2FsbGJhY2s6IFVuZXhwZWN0ZWQgZXJyb3IgZm9yIHJ1biAke3J1bklkfTogJHtlcnJvck1zZ31gKTtcbiAgICAvLyBEb24ndCB0aHJvdyAtIGNhbGxiYWNrIGZhaWx1cmUgc2hvdWxkIG5vdCBmYWlsIHRoZSB3b3JrZmxvd1xuICAgIH1cbn1cbi8qKlxuICogQnVpbGQgY2FsbGJhY2sgcGF5bG9hZCBiYXNlZCBvbiBydW4gc3RhdHVzXG4gKi8gZnVuY3Rpb24gYnVpbGRDYWxsYmFja1BheWxvYWQocnVuKSB7XG4gICAgY29uc3QgaXNDb21wbGV0ZWQgPSBydW4uc3RhdHVzID09PSAnY29tcGxldGVkJztcbiAgICBjb25zdCBpc0ZhaWxlZCA9IHJ1bi5zdGF0dXMgPT09ICdmYWlsZWQnO1xuICAgIGlmIChpc0NvbXBsZXRlZCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcnVuX2lkOiBydW4uaWQsXG4gICAgICAgICAgICBzdGF0dXM6ICdjb21wbGV0ZWQnLFxuICAgICAgICAgICAgYnVzaW5lc3NfbmFtZTogcnVuLmlucHV0X2pzb24/LmJ1c2luZXNzX25hbWUgfHwgbnVsbCxcbiAgICAgICAgICAgIGJsb2dfdG9waWM6IHJ1bi5pbnB1dF9qc29uPy5ibG9nX3RvcGljIHx8IHJ1bi5pbnB1dF9qc29uPy50b3BpYyB8fCBudWxsLFxuICAgICAgICAgICAgcmV2aWV3X3JlYWR5OiB0cnVlLFxuICAgICAgICAgICAgaHVtYW5fcmV2aWV3X3JlcXVpcmVkOiB0cnVlLFxuICAgICAgICAgICAgb3V0cHV0czoge1xuICAgICAgICAgICAgICAgIGhhc19yZXNlYXJjaF9qc29uOiAhIXJ1bi5yZXNlYXJjaF9qc29uLFxuICAgICAgICAgICAgICAgIGhhc19vdXRsaW5lX2pzb246ICEhcnVuLm91dGxpbmVfanNvbixcbiAgICAgICAgICAgICAgICBoYXNfZHJhZnRfbWFya2Rvd246ICEhcnVuLmRyYWZ0X21hcmtkb3duLFxuICAgICAgICAgICAgICAgIGhhc19vcHRpbWl6ZWRfanNvbjogISFydW4ub3B0aW1pemVkX2pzb24sXG4gICAgICAgICAgICAgICAgaGFzX2ZpbmFsX291dHB1dF9qc29uOiAhIXJ1bi5maW5hbF9vdXRwdXRfanNvblxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZpbmFsX291dHB1dF9qc29uOiBydW4uZmluYWxfb3V0cHV0X2pzb25cbiAgICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKGlzRmFpbGVkKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBydW5faWQ6IHJ1bi5pZCxcbiAgICAgICAgICAgIHN0YXR1czogJ2ZhaWxlZCcsXG4gICAgICAgICAgICBidXNpbmVzc19uYW1lOiBydW4uaW5wdXRfanNvbj8uYnVzaW5lc3NfbmFtZSB8fCBudWxsLFxuICAgICAgICAgICAgYmxvZ190b3BpYzogcnVuLmlucHV0X2pzb24/LmJsb2dfdG9waWMgfHwgcnVuLmlucHV0X2pzb24/LnRvcGljIHx8IG51bGwsXG4gICAgICAgICAgICByZXZpZXdfcmVhZHk6IGZhbHNlLFxuICAgICAgICAgICAgaHVtYW5fcmV2aWV3X3JlcXVpcmVkOiB0cnVlLFxuICAgICAgICAgICAgZXJyb3JfbWVzc2FnZTogcnVuLmVycm9yX21lc3NhZ2UgfHwgJ1Vua25vd24gZXJyb3InXG4gICAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gU2hvdWxkbid0IGhhcHBlbiwgYnV0IGhhbmRsZSBncmFjZWZ1bGx5XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBydW5faWQ6IHJ1bi5pZCxcbiAgICAgICAgICAgIHN0YXR1czogcnVuLnN0YXR1cyxcbiAgICAgICAgICAgIGJ1c2luZXNzX25hbWU6IHJ1bi5pbnB1dF9qc29uPy5idXNpbmVzc19uYW1lIHx8IG51bGwsXG4gICAgICAgICAgICBibG9nX3RvcGljOiBydW4uaW5wdXRfanNvbj8uYmxvZ190b3BpYyB8fCBydW4uaW5wdXRfanNvbj8udG9waWMgfHwgbnVsbFxuICAgICAgICB9O1xuICAgIH1cbn1cbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL2NhbGxiYWNrLXN0ZXAvL3NlbmRDYWxsYmFja1N0ZXBcIiwgc2VuZENhbGxiYWNrU3RlcCk7XG4iLCAiaW1wb3J0IHsgcmVnaXN0ZXJTdGVwRnVuY3Rpb24gfSBmcm9tIFwid29ya2Zsb3cvaW50ZXJuYWwvcHJpdmF0ZVwiO1xuaW1wb3J0ICdzZXJ2ZXItb25seSc7XG5pbXBvcnQgeyBnZW5lcmF0ZVRleHQgfSBmcm9tICdhaSc7XG5pbXBvcnQgeyBvcGVuYWkgfSBmcm9tICdAYWktc2RrL29wZW5haSc7XG5pbXBvcnQgeyBnZXRBZ2VudENvbmZpZyB9IGZyb20gJy4uLy4uL3N0b3JhZ2UvYWdlbnQtY29uZmlncyc7XG5pbXBvcnQgeyBidWlsZEZ1bGxJbnB1dENvbnRleHQgfSBmcm9tICcuL2NvbnRleHQtYnVpbGRlcic7XG4vKipfX2ludGVybmFsX3dvcmtmbG93c3tcInN0ZXBzXCI6e1wibGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9lZGl0b3Itc3RlcC50c1wiOntcInJ1bkVkaXRvclN0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9lZGl0b3Itc3RlcC8vcnVuRWRpdG9yU3RlcFwifX19fSovO1xuLyoqXG4gKiBFZGl0b3IgQWdlbnQgU3RlcFxuICogSW1wcm92ZXMgdGhlIGRyYWZ0IGJhc2VkIG9uIFNFTyBRQSByZWNvbW1lbmRhdGlvbnMgYW5kIGJyYW5kIGd1aWRlbGluZXMuXG4gKiBEQiBwcm9tcHQgY29udHJhY3Q6IG1vZGVsIHJldHVybnMgTWFya2Rvd24gb25seS5cbiAqIERvZXMgTk9UIG92ZXJ3cml0ZSBvcmlnaW5hbCBkcmFmdF9tYXJrZG93bjsgZWRpdGVkIG91dHB1dCBnb2VzIHRvIGZpbmFsX291dHB1dF9qc29uLlxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5FZGl0b3JTdGVwKHJ1bklkLCBpbnB1dCwgcmVzZWFyY2gsIG91dGxpbmUsIG9yaWdpbmFsRHJhZnQsIHNlb1FhKSB7XG4gICAgY29uc29sZS5sb2coYFt2MF0gRWRpdG9yIHN0ZXA6IFN0YXJ0aW5nIGZvciBydW4gJHtydW5JZH1gKTtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBhZ2VudENvbmZpZyA9IGF3YWl0IGdldEFnZW50Q29uZmlnKCdlZGl0b3InKTtcbiAgICAgICAgaWYgKCFhZ2VudENvbmZpZykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBY3RpdmUgYWdlbnQgY29uZmlnIG5vdCBmb3VuZCBmb3IgYWdlbnRfa2V5OiBlZGl0b3InKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBTRU8gQmxvZyBBZ2VudCBDb25maWcgTG9hZGVkOiBlZGl0b3IgdiR7YWdlbnRDb25maWcudmVyc2lvbn1gKTtcbiAgICAgICAgY29uc3Qgc3lzdGVtUHJvbXB0ID0gW1xuICAgICAgICAgICAgYWdlbnRDb25maWcuc3lzdGVtX3Byb21wdCxcbiAgICAgICAgICAgIGFnZW50Q29uZmlnLnNraWxsX21hcmtkb3duXG4gICAgICAgIF0uZmlsdGVyKEJvb2xlYW4pLmpvaW4oJ1xcblxcbicpO1xuICAgICAgICBjb25zdCBlZGl0b3JDb250ZXh0ID0gYnVpbGRFZGl0b3JDb250ZXh0KGlucHV0LCByZXNlYXJjaCwgb3V0bGluZSwgc2VvUWEpO1xuICAgICAgICBjb25zdCBtb2RlbE5hbWUgPSBhZ2VudENvbmZpZy5tb2RlbCB8fCBwcm9jZXNzLmVudi5FRElUT1JfQUdFTlRfTU9ERUwgfHwgJ2dwdC01LjQtbWluaSc7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIEVkaXRvciBzdGVwOiBVc2luZyBtb2RlbDogJHttb2RlbE5hbWV9YCk7XG4gICAgICAgIGNvbnN0IHsgdGV4dCB9ID0gYXdhaXQgZ2VuZXJhdGVUZXh0KHtcbiAgICAgICAgICAgIG1vZGVsOiBvcGVuYWkobW9kZWxOYW1lKSxcbiAgICAgICAgICAgIHRlbXBlcmF0dXJlOiAwLjYsXG4gICAgICAgICAgICBtYXhUb2tlbnM6IDgwMDAsXG4gICAgICAgICAgICBzeXN0ZW06IHN5c3RlbVByb21wdCxcbiAgICAgICAgICAgIG1lc3NhZ2VzOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICByb2xlOiAndXNlcicsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGBFZGl0IHRoZSBkcmFmdCBiZWxvdyB1c2luZyB0aGUgc3VwcGxpZWQgY29udGV4dCBhbmQgU0VPIFFBIGZlZWRiYWNrLlxcblxcbiR7YnVpbGRGdWxsSW5wdXRDb250ZXh0KGlucHV0KX1cXG5cXG5SZXNlYXJjaCBBZ2VudCBPdXRwdXQ6XFxuJHtKU09OLnN0cmluZ2lmeShyZXNlYXJjaCwgbnVsbCwgMil9XFxuXFxuT3V0bGluZSBBZ2VudCBPdXRwdXQ6XFxuJHtKU09OLnN0cmluZ2lmeShvdXRsaW5lLCBudWxsLCAyKX1cXG5cXG5TRU8gUUEgRmVlZGJhY2s6XFxuJHtlZGl0b3JDb250ZXh0fVxcblxcbk9yaWdpbmFsIERyYWZ0IE1hcmtkb3duOlxcbiR7b3JpZ2luYWxEcmFmdH1cXG5cXG5SZXR1cm4gdGhlIGVkaXRlZCBibG9nIGluIE1hcmtkb3duIG9ubHkuIERvIG5vdCByZXR1cm4gSlNPTi4gRG8gbm90IGluY2x1ZGUgZXhwbGFuYXRpb25zLCBlZGl0b3Igbm90ZXMsIG1hcmtkb3duIGZlbmNlcywgb3IgY29tbWVudHMgb3V0c2lkZSB0aGUgYXJ0aWNsZS5gXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXVxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgZWRpdGVkRHJhZnQgPSB0ZXh0LnRyaW0oKTtcbiAgICAgICAgaWYgKCFlZGl0ZWREcmFmdCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFZGl0b3Igb3V0cHV0IHdhcyBlbXB0eScpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlZGl0ZWREcmFmdC5zdGFydHNXaXRoKCd7JykpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRWRpdG9yIG91dHB1dCBpbnZhbGlkOiBleHBlY3RlZCBNYXJrZG93biwgcmVjZWl2ZWQgSlNPTi1saWtlIHJlc3BvbnNlJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVkaXRlZERyYWZ0Lmxlbmd0aCA8IE1hdGgubWluKDUwMCwgTWF0aC5mbG9vcihvcmlnaW5hbERyYWZ0Lmxlbmd0aCAqIDAuNCkpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0VkaXRvciBvdXRwdXQgdG9vIHNob3J0IGNvbXBhcmVkIHdpdGggb3JpZ2luYWwgZHJhZnQnKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBlZGl0b3JPdXRwdXQgPSB7XG4gICAgICAgICAgICBlZGl0ZWRfZHJhZnRfbWFya2Rvd246IGVkaXRlZERyYWZ0LFxuICAgICAgICAgICAgZWRpdG9yX25vdGVzOiBbXG4gICAgICAgICAgICAgICAgJ0VkaXRvciBBZ2VudCByZXR1cm5lZCBNYXJrZG93biBvbmx5IGFzIHJlcXVpcmVkIGJ5IHRoZSBhY3RpdmUgREIgcHJvbXB0LidcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBjaGFuZ2VzX21hZGU6IHNlb1FhLnByaW9yaXR5X2ZpeGVzIHx8IFtdLFxuICAgICAgICAgICAgaHVtYW5fcmV2aWV3X3JlcXVpcmVkOiB0cnVlXG4gICAgICAgIH07XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIEVkaXRvciBzdGVwOiBHZW5lcmF0ZWQgZWRpdGVkIGRyYWZ0ICgke2VkaXRvck91dHB1dC5lZGl0ZWRfZHJhZnRfbWFya2Rvd24ubGVuZ3RofSBjaGFycylgKTtcbiAgICAgICAgcmV0dXJuIGVkaXRvck91dHB1dDtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2MF0gRWRpdG9yIHN0ZXAgZXJyb3I6ICR7ZXJyb3JNZXNzYWdlfWApO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG59XG5mdW5jdGlvbiBidWlsZEVkaXRvckNvbnRleHQoaW5wdXQsIHJlc2VhcmNoLCBvdXRsaW5lLCBzZW9RYSkge1xuICAgIGNvbnN0IHNlY3Rpb25zID0gW107XG4gICAgc2VjdGlvbnMucHVzaCgnIyMgU0VPIFBlcmZvcm1hbmNlIFN1bW1hcnknKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBPdmVyYWxsIFNjb3JlOiAke3Nlb1FhLm92ZXJhbGxfc2NvcmV9LzEwMGApO1xuICAgIHNlY3Rpb25zLnB1c2goYFJlYWR5IEZvciBFZGl0b3I6ICR7c2VvUWEucmVhZHlfZm9yX2VkaXRvcn1gKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBSZWNvbW1lbmRlZCBOZXh0IEFjdGlvbjogJHtzZW9RYS5yZWNvbW1lbmRlZF9uZXh0X2FjdGlvbn1gKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBOZWVkcyBSZXZpZXc6ICR7c2VvUWEubmVlZHNfcmV2aWV3fWApO1xuICAgIHNlY3Rpb25zLnB1c2goJ1xcbiMjIFNlYXJjaCBJbnRlbnQgQWxpZ25tZW50Jyk7XG4gICAgc2VjdGlvbnMucHVzaChgU2NvcmU6ICR7c2VvUWEuc2VhcmNoX2ludGVudF9hbGlnbm1lbnQuc2NvcmV9LzEwMGApO1xuICAgIHNlY3Rpb25zLnB1c2goYEFuYWx5c2lzOiAke3Nlb1FhLnNlYXJjaF9pbnRlbnRfYWxpZ25tZW50LmFuYWx5c2lzfWApO1xuICAgIHNlY3Rpb25zLnB1c2goJ1xcbiMjIFByaW1hcnkgS2V5d29yZCBVc2FnZScpO1xuICAgIHNlY3Rpb25zLnB1c2goYFNjb3JlOiAke3Nlb1FhLnByaW1hcnlfa2V5d29yZF91c2FnZS5zY29yZX0vMTAwYCk7XG4gICAgc2VjdGlvbnMucHVzaChgT2NjdXJyZW5jZXM6ICR7c2VvUWEucHJpbWFyeV9rZXl3b3JkX3VzYWdlLm9jY3VycmVuY2VzfSB0aW1lc2ApO1xuICAgIHNlY3Rpb25zLnB1c2goYFBsYWNlbWVudDogJHtzZW9RYS5wcmltYXJ5X2tleXdvcmRfdXNhZ2UucGxhY2VtZW50X2FuYWx5c2lzfWApO1xuICAgIHNlY3Rpb25zLnB1c2goJ1xcbiMjIFNlY29uZGFyeSBLZXl3b3JkcycpO1xuICAgIHNlY3Rpb25zLnB1c2goYFNjb3JlOiAke3Nlb1FhLnNlY29uZGFyeV9rZXl3b3JkX3VzYWdlLnNjb3JlfS8xMDBgKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBDb3ZlcmVkOiAke3Nlb1FhLnNlY29uZGFyeV9rZXl3b3JkX3VzYWdlLmtleXdvcmRzX2NvdmVyZWQuam9pbignLCAnKSB8fCAnTm9uZSd9YCk7XG4gICAgaWYgKHNlb1FhLnNlY29uZGFyeV9rZXl3b3JkX3VzYWdlLmdhcHMubGVuZ3RoID4gMCkge1xuICAgICAgICBzZWN0aW9ucy5wdXNoKGBHYXBzOiAke3Nlb1FhLnNlY29uZGFyeV9rZXl3b3JkX3VzYWdlLmdhcHMuam9pbignLCAnKX1gKTtcbiAgICB9XG4gICAgc2VjdGlvbnMucHVzaCgnXFxuIyMgSGVhZGluZyBTdHJ1Y3R1cmUnKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBTY29yZTogJHtzZW9RYS5oZWFkaW5nX3N0cnVjdHVyZV9yZXZpZXcuc2NvcmV9LzEwMGApO1xuICAgIHNlY3Rpb25zLnB1c2goYEgxIFByZXNlbnQ6ICR7c2VvUWEuaGVhZGluZ19zdHJ1Y3R1cmVfcmV2aWV3LmgxX3ByZXNlbnR9YCk7XG4gICAgc2VjdGlvbnMucHVzaChgSDIgQ291bnQ6ICR7c2VvUWEuaGVhZGluZ19zdHJ1Y3R1cmVfcmV2aWV3LmgyX2NvdW50fWApO1xuICAgIGlmIChzZW9RYS5oZWFkaW5nX3N0cnVjdHVyZV9yZXZpZXcuaGllcmFyY2h5X2lzc3Vlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHNlY3Rpb25zLnB1c2goYElzc3VlczogJHtzZW9RYS5oZWFkaW5nX3N0cnVjdHVyZV9yZXZpZXcuaGllcmFyY2h5X2lzc3Vlcy5qb2luKCc7ICcpfWApO1xuICAgIH1cbiAgICBzZWN0aW9ucy5wdXNoKCdcXG4jIyBDb250ZW50IERlcHRoJyk7XG4gICAgc2VjdGlvbnMucHVzaChgU2NvcmU6ICR7c2VvUWEuY29udGVudF9kZXB0aF9yZXZpZXcuc2NvcmV9LzEwMGApO1xuICAgIHNlY3Rpb25zLnB1c2goYFdvcmQgQ291bnQ6ICR7c2VvUWEuY29udGVudF9kZXB0aF9yZXZpZXcud29yZF9jb3VudH0gd29yZHNgKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBDb3ZlcmFnZTogJHtzZW9RYS5jb250ZW50X2RlcHRoX3Jldmlldy5zZWN0aW9uX2NvdmVyYWdlfWApO1xuICAgIGlmIChzZW9RYS5jb250ZW50X2RlcHRoX3Jldmlldy5kZXB0aF9pc3N1ZXMubGVuZ3RoID4gMCkge1xuICAgICAgICBzZWN0aW9ucy5wdXNoKGBJc3N1ZXM6ICR7c2VvUWEuY29udGVudF9kZXB0aF9yZXZpZXcuZGVwdGhfaXNzdWVzLmpvaW4oJzsgJyl9YCk7XG4gICAgfVxuICAgIHNlY3Rpb25zLnB1c2goJ1xcbiMjIFJlYWRhYmlsaXR5Jyk7XG4gICAgc2VjdGlvbnMucHVzaChgU2NvcmU6ICR7c2VvUWEucmVhZGFiaWxpdHlfcmV2aWV3LnNjb3JlfS8xMDBgKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBBdmcgU2VudGVuY2UgTGVuZ3RoOiAke3Nlb1FhLnJlYWRhYmlsaXR5X3Jldmlldy5hdmdfc2VudGVuY2VfbGVuZ3RofSB3b3Jkc2ApO1xuICAgIHNlY3Rpb25zLnB1c2goYFJlYWRpbmcgTGV2ZWw6ICR7c2VvUWEucmVhZGFiaWxpdHlfcmV2aWV3LmZsZXNjaF9raW5jYWlkX2VzdGltYXRlfWApO1xuICAgIGlmIChzZW9RYS5yZWFkYWJpbGl0eV9yZXZpZXcucmVhZGFiaWxpdHlfaXNzdWVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgc2VjdGlvbnMucHVzaChgSXNzdWVzOiAke3Nlb1FhLnJlYWRhYmlsaXR5X3Jldmlldy5yZWFkYWJpbGl0eV9pc3N1ZXMuam9pbignOyAnKX1gKTtcbiAgICB9XG4gICAgc2VjdGlvbnMucHVzaCgnXFxuIyMgQ1RBIFJldmlldycpO1xuICAgIHNlY3Rpb25zLnB1c2goYFNjb3JlOiAke3Nlb1FhLmN0YV9yZXZpZXcuc2NvcmV9LzEwMGApO1xuICAgIHNlY3Rpb25zLnB1c2goYENUQSBQcmVzZW50OiAke3Nlb1FhLmN0YV9yZXZpZXcuY3RhX3ByZXNlbnR9YCk7XG4gICAgc2VjdGlvbnMucHVzaChgQ1RBIEFuYWx5c2lzOiAke3Nlb1FhLmN0YV9yZXZpZXcuY3RhX2FuYWx5c2lzfWApO1xuICAgIHNlY3Rpb25zLnB1c2goJ1xcbiMjIEludGVybmFsIExpbmtpbmcnKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBTY29yZTogJHtzZW9RYS5pbnRlcm5hbF9saW5raW5nX3Jldmlldy5zY29yZX0vMTAwYCk7XG4gICAgc2VjdGlvbnMucHVzaChgTGlua3MgRm91bmQ6ICR7c2VvUWEuaW50ZXJuYWxfbGlua2luZ19yZXZpZXcuaW50ZXJuYWxfbGlua3NfZm91bmR9YCk7XG4gICAgaWYgKHNlb1FhLmludGVybmFsX2xpbmtpbmdfcmV2aWV3LmludGVybmFsX2xpbmtfcmVjb21tZW5kYXRpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgc2VjdGlvbnMucHVzaChgUmVjb21tZW5kYXRpb25zOiAke3Nlb1FhLmludGVybmFsX2xpbmtpbmdfcmV2aWV3LmludGVybmFsX2xpbmtfcmVjb21tZW5kYXRpb25zLmpvaW4oJzsgJyl9YCk7XG4gICAgfVxuICAgIHNlY3Rpb25zLnB1c2goJ1xcbiMjIENsaWVudCBHb2FsIEFsaWdubWVudCcpO1xuICAgIHNlY3Rpb25zLnB1c2goYFNjb3JlOiAke3Nlb1FhLmNsaWVudF9nb2FsX2FsaWdubWVudC5zY29yZX0vMTAwYCk7XG4gICAgc2VjdGlvbnMucHVzaChgQW5hbHlzaXM6ICR7c2VvUWEuY2xpZW50X2dvYWxfYWxpZ25tZW50LmFuYWx5c2lzfWApO1xuICAgIGlmIChzZW9RYS5wcmlvcml0eV9maXhlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHNlY3Rpb25zLnB1c2goJ1xcbiMjIFByaW9yaXR5IEZpeGVzJyk7XG4gICAgICAgIHNlY3Rpb25zLnB1c2goc2VvUWEucHJpb3JpdHlfZml4ZXMubWFwKChmaXgpPT5gLSAke2ZpeH1gKS5qb2luKCdcXG4nKSk7XG4gICAgfVxuICAgIGlmIChzZW9RYS5yaXNrX2ZsYWdzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgc2VjdGlvbnMucHVzaCgnXFxuIyMgUmlzayBGbGFncycpO1xuICAgICAgICBzZWN0aW9ucy5wdXNoKHNlb1FhLnJpc2tfZmxhZ3MubWFwKChmbGFnKT0+YC0gJHtmbGFnfWApLmpvaW4oJ1xcbicpKTtcbiAgICB9XG4gICAgc2VjdGlvbnMucHVzaCgnXFxuIyMgUmVzZWFyY2ggTm90ZXMnKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBDb250ZW50IEFuZ2xlOiAke3Jlc2VhcmNoLmNvbnRlbnRfYW5nbGV9YCk7XG4gICAgc2VjdGlvbnMucHVzaChgQ2xpZW50IEdvYWwgQWxpZ25tZW50OiAke3Jlc2VhcmNoLmNsaWVudF9nb2FsX2FsaWdubWVudH1gKTtcbiAgICBzZWN0aW9ucy5wdXNoKCdcXG4jIyBPdXRsaW5lIE5vdGVzJyk7XG4gICAgc2VjdGlvbnMucHVzaChgVGl0bGU6ICR7b3V0bGluZS50aXRsZX1gKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBDVEEgR3VpZGFuY2U6ICR7b3V0bGluZS5jdGFfZ3VpZGFuY2V9YCk7XG4gICAgc2VjdGlvbnMucHVzaCgnXFxuIyMgQWRkaXRpb25hbCBDbGllbnQgR3VpZGFuY2UnKTtcbiAgICBpZiAoaW5wdXQuY3RhX25vdGVzIHx8IGlucHV0LmN0YSB8fCBpbnB1dC5ibG9nX2NvbnRleHRfYnJpZWY/LmN0YSkge1xuICAgICAgICBzZWN0aW9ucy5wdXNoKGBDVEEgTm90ZXM6ICR7aW5wdXQuYmxvZ19jb250ZXh0X2JyaWVmPy5jdGEgfHwgaW5wdXQuY3RhIHx8IGlucHV0LmN0YV9ub3Rlc31gKTtcbiAgICB9XG4gICAgaWYgKGlucHV0LmJyYW5kX3ZvaWNlX25vdGVzIHx8IGlucHV0LmJsb2dfY29udGV4dF9icmllZj8uYnJhbmRfdm9pY2Vfbm90ZXMgfHwgaW5wdXQudG9uZSkge1xuICAgICAgICBzZWN0aW9ucy5wdXNoKGBCcmFuZCBWb2ljZTogJHtpbnB1dC5ibG9nX2NvbnRleHRfYnJpZWY/LmJyYW5kX3ZvaWNlX25vdGVzIHx8IGlucHV0LmJyYW5kX3ZvaWNlX25vdGVzIHx8IGlucHV0LnRvbmV9YCk7XG4gICAgfVxuICAgIGlmIChpbnB1dC5hdWRpZW5jZV9ub3RlcyB8fCBpbnB1dC50YXJnZXRfYXVkaWVuY2UgfHwgaW5wdXQuYmxvZ19jb250ZXh0X2JyaWVmPy50YXJnZXRfYXVkaWVuY2UpIHtcbiAgICAgICAgc2VjdGlvbnMucHVzaChgVGFyZ2V0IEF1ZGllbmNlOiAke2lucHV0LmJsb2dfY29udGV4dF9icmllZj8udGFyZ2V0X2F1ZGllbmNlIHx8IGlucHV0LnRhcmdldF9hdWRpZW5jZSB8fCBpbnB1dC5hdWRpZW5jZV9ub3Rlc31gKTtcbiAgICB9XG4gICAgcmV0dXJuIHNlY3Rpb25zLmpvaW4oJ1xcbicpO1xufVxucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvZWRpdG9yLXN0ZXAvL3J1bkVkaXRvclN0ZXBcIiwgcnVuRWRpdG9yU3RlcCk7XG4iLCAiaW1wb3J0IHsgcmVnaXN0ZXJTdGVwRnVuY3Rpb24gfSBmcm9tIFwid29ya2Zsb3cvaW50ZXJuYWwvcHJpdmF0ZVwiO1xuaW1wb3J0ICdzZXJ2ZXItb25seSc7XG5pbXBvcnQgeyB1cGRhdGVSdW5TdGF0dXMsIHVwZGF0ZVJ1bkVycm9yLCBjb21wbGV0ZVJ1biB9IGZyb20gJy4uLy4uL3N0b3JhZ2UvcnVucyc7XG4vKipfX2ludGVybmFsX3dvcmtmbG93c3tcInN0ZXBzXCI6e1wibGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9oZWxwZXJzLnRzXCI6e1wiY29tcGxldGVSdW5TdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvaGVscGVycy8vY29tcGxldGVSdW5TdGVwXCJ9LFwibWFya1J1bkZhaWxlZFN0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9oZWxwZXJzLy9tYXJrUnVuRmFpbGVkU3RlcFwifSxcIm1hcmtSdW5SdW5uaW5nU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL2hlbHBlcnMvL21hcmtSdW5SdW5uaW5nU3RlcFwifX19fSovO1xuLyoqXG4gKiBNYXJrIGEgcnVuIGFzIHJ1bm5pbmcgKHRyYW5zaXRpb24gZnJvbSBxdWV1ZWQgdG8gcnVubmluZylcbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gbWFya1J1blJ1bm5pbmdTdGVwKHJ1bklkKSB7XG4gICAgY29uc29sZS5sb2coYFt2MF0gSGVscGVyOiBNYXJraW5nIHJ1biAke3J1bklkfSBhcyBydW5uaW5nYCk7XG4gICAgYXdhaXQgdXBkYXRlUnVuU3RhdHVzKHJ1bklkLCAncmVzZWFyY2hpbmcnKTtcbn1cbi8qKlxuICogTWFyayBhIHJ1biBhcyBmYWlsZWQgd2l0aCBlcnJvciBtZXNzYWdlXG4gKiBDYWxsYmFjayBpcyBzZW50IGJ5IHdvcmtmbG93IG9yY2hlc3RyYXRvciwgbm90IGhlcmVcbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gbWFya1J1bkZhaWxlZFN0ZXAocnVuSWQsIGVycm9yTWVzc2FnZSkge1xuICAgIGNvbnNvbGUubG9nKGBbdjBdIEhlbHBlcjogTWFya2luZyBydW4gJHtydW5JZH0gYXMgZmFpbGVkIHdpdGggZXJyb3I6ICR7ZXJyb3JNZXNzYWdlfWApO1xuICAgIGF3YWl0IHVwZGF0ZVJ1bkVycm9yKHJ1bklkLCBlcnJvck1lc3NhZ2UpO1xufVxuLyoqXG4gKiBDb21wbGV0ZSBhIHJ1biB3aXRoIGZpbmFsIG91dHB1dFxuICogQ2FsbGJhY2sgaXMgc2VudCBieSB3b3JrZmxvdyBvcmNoZXN0cmF0b3IsIG5vdCBoZXJlXG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNvbXBsZXRlUnVuU3RlcChydW5JZCwgZmluYWxPdXRwdXQpIHtcbiAgICBjb25zb2xlLmxvZyhgW3YwXSBIZWxwZXI6IENvbXBsZXRpbmcgcnVuICR7cnVuSWR9YCk7XG4gICAgYXdhaXQgY29tcGxldGVSdW4ocnVuSWQsIGZpbmFsT3V0cHV0KTtcbn1cbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL2hlbHBlcnMvL21hcmtSdW5SdW5uaW5nU3RlcFwiLCBtYXJrUnVuUnVubmluZ1N0ZXApO1xucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvaGVscGVycy8vbWFya1J1bkZhaWxlZFN0ZXBcIiwgbWFya1J1bkZhaWxlZFN0ZXApO1xucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvaGVscGVycy8vY29tcGxldGVSdW5TdGVwXCIsIGNvbXBsZXRlUnVuU3RlcCk7XG4iLCAiaW1wb3J0IHsgcmVnaXN0ZXJTdGVwRnVuY3Rpb24gfSBmcm9tIFwid29ya2Zsb3cvaW50ZXJuYWwvcHJpdmF0ZVwiO1xuaW1wb3J0ICdzZXJ2ZXItb25seSc7XG5pbXBvcnQgeyBnZW5lcmF0ZVRleHQgfSBmcm9tICdhaSc7XG5pbXBvcnQgeyBvcGVuYWkgfSBmcm9tICdAYWktc2RrL29wZW5haSc7XG5pbXBvcnQgeyBnZXRBZ2VudENvbmZpZyB9IGZyb20gJy4uLy4uL3N0b3JhZ2UvYWdlbnQtY29uZmlncyc7XG5pbXBvcnQgeyBidWlsZEZ1bGxJbnB1dENvbnRleHQsIGV4dHJhY3RKc29uT2JqZWN0IH0gZnJvbSAnLi9jb250ZXh0LWJ1aWxkZXInO1xuLyoqX19pbnRlcm5hbF93b3JrZmxvd3N7XCJzdGVwc1wiOntcImxpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvbWV0YS1zdGVwLnRzXCI6e1wicnVuTWV0YVN0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9tZXRhLXN0ZXAvL3J1bk1ldGFTdGVwXCJ9fX19Ki87XG4vKipcbiAqIE1ldGEgQWdlbnQgU3RlcCAtIFBoYXNlIDJDLUZcbiAqIEdlbmVyYXRlcyBTRU8gbWV0YWRhdGEgZm9yIGh1bWFuIHJldmlld1xuICogRG9lcyBOT1QgcHVibGlzaCwgY2FsbCBleHRlcm5hbCBzZXJ2aWNlcywgb3Igb3ZlcndyaXRlIGRyYWZ0c1xuICogT3V0cHV0IGdvZXMgdG8gZmluYWxfb3V0cHV0X2pzb24gYXMgbWV0YV9qc29uXG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJ1bk1ldGFTdGVwKHJ1bklkLCBpbnB1dCwgcmVzZWFyY2gsIG91dGxpbmUsIG9yaWdpbmFsRHJhZnQsIHNlb1FhLCBlZGl0ZWREcmFmdCkge1xuICAgIGNvbnNvbGUubG9nKGBbdjBdIE1ldGEgc3RlcDogU3RhcnRpbmcgZm9yIHJ1biAke3J1bklkfWApO1xuICAgIHRyeSB7XG4gICAgICAgIC8vIExvYWQgYWdlbnQgY29uZmlnIGZyb20gZGF0YWJhc2VcbiAgICAgICAgY29uc3QgYWdlbnRDb25maWcgPSBhd2FpdCBnZXRBZ2VudENvbmZpZygnbWV0YScpO1xuICAgICAgICBpZiAoIWFnZW50Q29uZmlnKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0FjdGl2ZSBhZ2VudCBjb25maWcgbm90IGZvdW5kIGZvciBhZ2VudF9rZXk6IG1ldGEnKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBTRU8gQmxvZyBBZ2VudCBDb25maWcgTG9hZGVkOiBtZXRhIHYke2FnZW50Q29uZmlnLnZlcnNpb259YCk7XG4gICAgICAgIC8vIEJ1aWxkIHN5c3RlbSBwcm9tcHQgZnJvbSBkYXRhYmFzZSBjb25maWdcbiAgICAgICAgY29uc3Qgc3lzdGVtUHJvbXB0ID0gW1xuICAgICAgICAgICAgYWdlbnRDb25maWcuc3lzdGVtX3Byb21wdCxcbiAgICAgICAgICAgIGFnZW50Q29uZmlnLnNraWxsX21hcmtkb3duXG4gICAgICAgIF0uZmlsdGVyKEJvb2xlYW4pLmpvaW4oJ1xcblxcbicpO1xuICAgICAgICAvLyBCdWlsZCBjb250ZXh0IGZvciBtZXRhIGdlbmVyYXRpb25cbiAgICAgICAgY29uc3QgbWV0YUNvbnRleHQgPSBidWlsZE1ldGFDb250ZXh0KGlucHV0LCByZXNlYXJjaCwgb3V0bGluZSwgc2VvUWEsIG9yaWdpbmFsRHJhZnQsIGVkaXRlZERyYWZ0KTtcbiAgICAgICAgLy8gR2V0IG1vZGVsIG5hbWU6IHVzZSBEQiBjb25maWcgaWYgYXZhaWxhYmxlLCBvdGhlcndpc2UgZmFsbCBiYWNrIHRvIGVudiB2YXIgb3IgZGVmYXVsdFxuICAgICAgICBjb25zdCBtb2RlbE5hbWUgPSBhZ2VudENvbmZpZy5tb2RlbCB8fCBwcm9jZXNzLmVudi5NRVRBX0FHRU5UX01PREVMIHx8ICdncHQtNS40LW1pbmknO1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBNZXRhIHN0ZXA6IFVzaW5nIG1vZGVsOiAke21vZGVsTmFtZX1gKTtcbiAgICAgICAgLy8gR2VuZXJhdGUgbWV0YWRhdGFcbiAgICAgICAgY29uc3QgeyB0ZXh0OiBtZXRhQW5hbHlzaXMgfSA9IGF3YWl0IGdlbmVyYXRlVGV4dCh7XG4gICAgICAgICAgICBtb2RlbDogb3BlbmFpKG1vZGVsTmFtZSksXG4gICAgICAgICAgICBzeXN0ZW06IHN5c3RlbVByb21wdCxcbiAgICAgICAgICAgIHRlbXBlcmF0dXJlOiAwLjUsXG4gICAgICAgICAgICBtZXNzYWdlczogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcm9sZTogJ3VzZXInLFxuICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBtZXRhQ29udGV4dFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF1cbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIE1ldGEgc3RlcDogUmVjZWl2ZWQgYW5hbHlzaXMsIHBhcnNpbmcgSlNPTmApO1xuICAgICAgICAvLyBQYXJzZSB0aGUgcmVzcG9uc2UgLSBGQUlMLUxPVUQgaW4gcHJvZHVjdGlvblxuICAgICAgICBsZXQgbWV0YU91dHB1dDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIG1ldGFPdXRwdXQgPSBKU09OLnBhcnNlKGV4dHJhY3RKc29uT2JqZWN0KG1ldGFBbmFseXNpcykpO1xuICAgICAgICB9IGNhdGNoIChwYXJzZUVycm9yKSB7XG4gICAgICAgICAgICAvLyBQUk9EVUNUSU9OIE1PREU6IEFsd2F5cyBmYWlsIGxvdWQgb24gcGFyc2UgZXJyb3JzLlxuICAgICAgICAgICAgLy8gRmFsbGJhY2sgaXMgbm90IHVzZWQgaW4gbm9ybWFsIHdvcmtmbG93IC0gdGhpcyBlbnN1cmVzIEFJIG1vZGVsIHNjaGVtYSBjb21wbGlhbmNlLlxuICAgICAgICAgICAgY29uc3QgZXJyb3JNc2cgPSBwYXJzZUVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBwYXJzZUVycm9yLm1lc3NhZ2UgOiBTdHJpbmcocGFyc2VFcnJvcik7XG4gICAgICAgICAgICBjb25zdCBmdWxsRXJyb3IgPSBgTWV0YSBvdXRwdXQgcGFyc2UgZmFpbGVkOiAke2Vycm9yTXNnfWA7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbdjBdIE1ldGEgc3RlcDogJHtmdWxsRXJyb3J9YCk7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZnVsbEVycm9yKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBGQUlMLUxPVUQ6IFZhbGlkYXRlIGFsbCByZXF1aXJlZCBmaWVsZHMgZXhpc3QgYW5kIGhhdmUgY29ycmVjdCB0eXBlc1xuICAgICAgICBjb25zdCBmaWVsZFZhbGlkYXRpb25zID0gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZpZWxkOiAnbWV0YV90aXRsZScsXG4gICAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICAgICAgY2hlY2s6ICh2KT0+dHlwZW9mIHYgPT09ICdzdHJpbmcnICYmIHYubGVuZ3RoID4gMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBmaWVsZDogJ21ldGFfZGVzY3JpcHRpb24nLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICAgIGNoZWNrOiAodik9PnR5cGVvZiB2ID09PSAnc3RyaW5nJyAmJiB2Lmxlbmd0aCA+IDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZmllbGQ6ICdzbHVnJyxcbiAgICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgICBjaGVjazogKHYpPT50eXBlb2YgdiA9PT0gJ3N0cmluZycgJiYgdi5sZW5ndGggPiAwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZpZWxkOiAnc29jaWFsX3ByZXZpZXcnLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICAgICAgICAgIGNoZWNrOiAodik9PnR5cGVvZiB2ID09PSAnb2JqZWN0JyAmJiB2LnRpdGxlICYmIHYuZGVzY3JpcHRpb25cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZmllbGQ6ICdzY2hlbWFfbWFya3VwJyxcbiAgICAgICAgICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgICAgICAgICBjaGVjazogKHYpPT50eXBlb2YgdiA9PT0gJ29iamVjdCcgJiYgdlsnQHR5cGUnXSAmJiB2LmhlYWRsaW5lICYmIHYuZGVzY3JpcHRpb25cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZmllbGQ6ICdwcmltYXJ5X2tleXdvcmRfdXNlZCcsXG4gICAgICAgICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICAgICAgICAgIGNoZWNrOiAodik9PnR5cGVvZiB2ID09PSAnYm9vbGVhbidcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZmllbGQ6ICdzZWNvbmRhcnlfa2V5d29yZHNfcmVmbGVjdGVkJyxcbiAgICAgICAgICAgICAgICB0eXBlOiAnYXJyYXknLFxuICAgICAgICAgICAgICAgIGNoZWNrOiAodik9PkFycmF5LmlzQXJyYXkodilcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZmllbGQ6ICdjbGllbnRfZ29hbF9yZWZsZWN0ZWQnLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgICAgICAgICBjaGVjazogKHYpPT50eXBlb2YgdiA9PT0gJ2Jvb2xlYW4nXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZpZWxkOiAnaHVtYW5fcmV2aWV3X3JlcXVpcmVkJyxcbiAgICAgICAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgICAgICAgICAgY2hlY2s6ICh2KT0+dHlwZW9mIHYgPT09ICdib29sZWFuJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBmaWVsZDogJ3Jldmlld19yZWFkeScsXG4gICAgICAgICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICAgICAgICAgIGNoZWNrOiAodik9PnR5cGVvZiB2ID09PSAnYm9vbGVhbidcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZmllbGQ6ICdtZXRhX25vdGVzJyxcbiAgICAgICAgICAgICAgICB0eXBlOiAnYXJyYXknLFxuICAgICAgICAgICAgICAgIGNoZWNrOiAodik9PkFycmF5LmlzQXJyYXkodilcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZmllbGQ6ICduZWVkc19yZXZpZXcnLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgICAgICAgICBjaGVjazogKHYpPT50eXBlb2YgdiA9PT0gJ2Jvb2xlYW4nXG4gICAgICAgICAgICB9XG4gICAgICAgIF07XG4gICAgICAgIGNvbnN0IHZhbGlkYXRpb25FcnJvcnMgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCB2YWxpZGF0aW9uIG9mIGZpZWxkVmFsaWRhdGlvbnMpe1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBtZXRhT3V0cHV0W3ZhbGlkYXRpb24uZmllbGRdO1xuICAgICAgICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICB2YWxpZGF0aW9uRXJyb3JzLnB1c2goYCR7dmFsaWRhdGlvbi5maWVsZH0gaXMgbWlzc2luZ2ApO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghdmFsaWRhdGlvbi5jaGVjayh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICB2YWxpZGF0aW9uRXJyb3JzLnB1c2goYCR7dmFsaWRhdGlvbi5maWVsZH0gaGFzIGludmFsaWQgdHlwZSAoZXhwZWN0ZWQgJHt2YWxpZGF0aW9uLnR5cGV9KWApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICh2YWxpZGF0aW9uRXJyb3JzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgTWV0YSBvdXRwdXQgdmFsaWRhdGlvbiBmYWlsZWQ6ICR7dmFsaWRhdGlvbkVycm9ycy5qb2luKCc7ICcpfWApO1xuICAgICAgICB9XG4gICAgICAgIC8vIExpZ2h0d2VpZ2h0IGZpZWxkIGNvbnN0cmFpbnRzIChubyBzaWxlbnQgbW9kaWZpY2F0aW9uKVxuICAgICAgICBpZiAobWV0YU91dHB1dC5tZXRhX3RpdGxlLmxlbmd0aCA+IDcwKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE1ldGEgdGl0bGUgdG9vIGxvbmc6ICR7bWV0YU91dHB1dC5tZXRhX3RpdGxlLmxlbmd0aH0gY2hhcnMsIG1heCA3MGApO1xuICAgICAgICB9XG4gICAgICAgIGlmIChtZXRhT3V0cHV0Lm1ldGFfZGVzY3JpcHRpb24ubGVuZ3RoID4gMTYwKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE1ldGEgZGVzY3JpcHRpb24gdG9vIGxvbmc6ICR7bWV0YU91dHB1dC5tZXRhX2Rlc2NyaXB0aW9uLmxlbmd0aH0gY2hhcnMsIG1heCAxNjBgKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBNZXRhIHN0ZXA6IENvbXBsZXRlIGZvciBydW4gJHtydW5JZH1gLCBgR2VuZXJhdGVkIG1ldGFkYXRhOiAke21ldGFPdXRwdXQubWV0YV90aXRsZS5zdWJzdHJpbmcoMCwgNTApfS4uLmApO1xuICAgICAgICByZXR1cm4gbWV0YU91dHB1dDtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2MF0gTWV0YSBzdGVwIGVycm9yIGZvciBydW4gJHtydW5JZH06ICR7ZXJyb3JNZXNzYWdlfWApO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG59XG4vKipcbiAqIEJ1aWxkIGNvbnRleHQgcHJvbXB0IGZvciBtZXRhZGF0YSBnZW5lcmF0aW9uXG4gKi8gZnVuY3Rpb24gYnVpbGRNZXRhQ29udGV4dChpbnB1dCwgcmVzZWFyY2gsIG91dGxpbmUsIHNlb1FhLCBvcmlnaW5hbERyYWZ0LCBlZGl0ZWREcmFmdCkge1xuICAgIC8vIFZhbGlkYXRlIHJlcXVpcmVkIHJlc2VhcmNoLmtleV9maW5kaW5ncyBiZWZvcmUgdXNpbmdcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkocmVzZWFyY2gua2V5X2ZpbmRpbmdzKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Jlc2VhcmNoIG91dHB1dCBtaXNzaW5nIHJlcXVpcmVkIGtleV9maW5kaW5ncyBhcnJheSBmb3IgbWV0YS1zdGVwJyk7XG4gICAgfVxuICAgIGNvbnN0IHdvcmRDb3VudCA9IGVkaXRlZERyYWZ0LnNwbGl0KC9cXHMrLykubGVuZ3RoO1xuICAgIGNvbnN0IGhlYWRpbmdzID0gZWRpdGVkRHJhZnQubWF0Y2goL14jK1xccysuKyQvZ20pIHx8IFtdO1xuICAgIGNvbnN0IGtleUZpbmRpbmdzU3VtbWFyeSA9IHJlc2VhcmNoLmtleV9maW5kaW5ncy5zbGljZSgwLCAzKS5qb2luKCdcXG4tICcpO1xuICAgIHJldHVybiBgWW91IGFyZSBhbiBleHBlcnQgU0VPIG1ldGFkYXRhIHNwZWNpYWxpc3QuIEdlbmVyYXRlIFNFTyBtZXRhZGF0YSBmb3IgYSBibG9nIHBvc3QgZm9yIGh1bWFuIHJldmlldy5cblxuRlVMTCBCTE9HIENPTlRFWFQ6XG4ke2J1aWxkRnVsbElucHV0Q29udGV4dChpbnB1dCl9XG5cblJFU0VBUkNIIFNVTU1BUlk6XG4tICR7a2V5RmluZGluZ3NTdW1tYXJ5fVxuXG5PVVRMSU5FIFNUUlVDVFVSRTpcbiR7b3V0bGluZS5zZWN0aW9ucy5tYXAoKHMpPT5gLSAke3MuaGVhZGluZ30gKCR7cy5rZXlfcG9pbnRzPy5sZW5ndGggfHwgMH0ga2V5IHBvaW50cylgKS5qb2luKCdcXG4nKX1cblxuU0VPIFFBIFJFVklFVzpcbi0gT3ZlcmFsbCBTY29yZTogJHtzZW9RYS5vdmVyYWxsX3Njb3JlfVxuLSBTZWFyY2ggSW50ZW50IEFsaWdubWVudDogJHtzZW9RYS5zZWFyY2hfaW50ZW50X2FsaWdubWVudC5zY29yZX1cbi0gUHJpbWFyeSBLZXl3b3JkIFVzYWdlOiAke3Nlb1FhLnByaW1hcnlfa2V5d29yZF91c2FnZS5zY29yZX1cbi0gSGVhZGluZyBTdHJ1Y3R1cmU6ICR7c2VvUWEuaGVhZGluZ19zdHJ1Y3R1cmVfcmV2aWV3LnNjb3JlfVxuLSBDbGllbnQgR29hbCBBbGlnbm1lbnQ6ICR7c2VvUWEuY2xpZW50X2dvYWxfYWxpZ25tZW50LnNjb3JlfVxuXG5FRElURUQgQkxPRyBNQVJLRE9XTjpcbiR7ZWRpdGVkRHJhZnR9XG5cbkNPTlRFTlQgU1RBVFM6XG4tIFdvcmQgQ291bnQ6ICR7d29yZENvdW50fVxuLSBIZWFkaW5nczogJHtoZWFkaW5ncy5sZW5ndGh9XG4tIEhhcyBDVEE6ICR7aW5wdXQuY3RhX25vdGVzID8gJ1llcycgOiAnTm8nfVxuLSBIYXMgSW50ZXJuYWwgTGlua3M6ICR7aW5wdXQuaW50ZXJuYWxfbGlua19ub3RlcyA/ICdZZXMnIDogJ05vJ31cblxuR2VuZXJhdGUgbWV0YWRhdGEgdGhhdDpcbjEuIEFjY3VyYXRlbHkgcmVwcmVzZW50cyB0aGUgYmxvZyBjb250ZW50IChkbyBub3QgaW52ZW50IGNsYWltcylcbjIuIEluY2x1ZGVzIHRoZSBwcmltYXJ5IGtleXdvcmQgbmF0dXJhbGx5IGluIHRpdGxlIGFuZCBkZXNjcmlwdGlvblxuMy4gSXMgU0VPLW9wdGltaXplZCBmb3Igc2VhcmNoIGVuZ2luZXNcbjQuIElzIGNvbXBlbGxpbmcgZm9yIGh1bWFuIHJlYWRlcnMgYW5kIENUUlxuNS4gRm9sbG93cyBiZXN0IHByYWN0aWNlcyAodGl0bGUgbWF4IDcwIGNoYXJzLCBkZXNjcmlwdGlvbiBtYXggMTYwIGNoYXJzKVxuNi4gSW5jbHVkZXMgcmV2aWV3IG5vdGVzIGZvciB0aGUgaHVtYW4gZWRpdG9yXG5cblJldHVybiB2YWxpZCBKU09OIG9ubHkgdXNpbmcgZXhhY3RseSB0aGVzZSB0b3AtbGV2ZWwga2V5czpcbm1ldGFfdGl0bGUsIG1ldGFfZGVzY3JpcHRpb24sIHNsdWcsIHNvY2lhbF9wcmV2aWV3LCBzY2hlbWFfbWFya3VwLCBwcmltYXJ5X2tleXdvcmRfdXNlZCwgc2Vjb25kYXJ5X2tleXdvcmRzX3JlZmxlY3RlZCwgY2xpZW50X2dvYWxfcmVmbGVjdGVkLCBodW1hbl9yZXZpZXdfcmVxdWlyZWQsIHJldmlld19yZWFkeSwgbWV0YV9ub3RlcywgbmVlZHNfcmV2aWV3LlxuXG5EbyBub3QgdXNlIG9sZCBrZXlzOlxuc2VvX3RpdGxlLCBzdWdnZXN0ZWRfc2x1Zywgc2Vjb25kYXJ5X2tleXdvcmRzX3VzZWQsIGh1bWFuX3Jldmlld19ub3RlcywgZXhjZXJwdCwgb2dfdGl0bGUsIG9nX2Rlc2NyaXB0aW9uLCBjYW5vbmljYWxfdXJsX3N1Z2dlc3Rpb24sIHNjaGVtYV90eXBlX3N1Z2dlc3Rpb24uXG5cblJldHVybiBhIEpTT04gb2JqZWN0IHdpdGggdGhpcyBleGFjdCBzY2hlbWE6XG57XG4gIFwibWV0YV90aXRsZVwiOiBcIlNFTy1vcHRpbWl6ZWQgdGl0bGUgKG1heCA3MCBjaGFycywgaW5jbHVkZSBwcmltYXJ5IGtleXdvcmQpXCIsXG4gIFwibWV0YV9kZXNjcmlwdGlvblwiOiBcIkNvbXBlbGxpbmcgZGVzY3JpcHRpb24gKG1heCAxNjAgY2hhcnMsIGluY2x1ZGUgcHJpbWFyeSBrZXl3b3JkKVwiLFxuICBcInNsdWdcIjogXCJ1cmwtc2x1Zy1mb3JtYXRcIixcbiAgXCJzb2NpYWxfcHJldmlld1wiOiB7XG4gICAgXCJ0aXRsZVwiOiBcIlNvY2lhbCBtZWRpYSBwcmV2aWV3IHRpdGxlXCIsXG4gICAgXCJkZXNjcmlwdGlvblwiOiBcIlNvY2lhbCBtZWRpYSBwcmV2aWV3IGRlc2NyaXB0aW9uXCJcbiAgfSxcbiAgXCJzY2hlbWFfbWFya3VwXCI6IHtcbiAgICBcIkB0eXBlXCI6IFwiQmxvZ1Bvc3RpbmdcIixcbiAgICBcImhlYWRsaW5lXCI6IFwiQXJ0aWNsZSBoZWFkbGluZVwiLFxuICAgIFwiZGVzY3JpcHRpb25cIjogXCJBcnRpY2xlIGRlc2NyaXB0aW9uXCJcbiAgfSxcbiAgXCJwcmltYXJ5X2tleXdvcmRfdXNlZFwiOiB0cnVlLFxuICBcInNlY29uZGFyeV9rZXl3b3Jkc19yZWZsZWN0ZWRcIjogW1wia2V5d29yZDFcIiwgXCJrZXl3b3JkMlwiXSxcbiAgXCJjbGllbnRfZ29hbF9yZWZsZWN0ZWRcIjogdHJ1ZSxcbiAgXCJodW1hbl9yZXZpZXdfcmVxdWlyZWRcIjogdHJ1ZSxcbiAgXCJyZXZpZXdfcmVhZHlcIjogdHJ1ZSxcbiAgXCJtZXRhX25vdGVzXCI6IFtcIm5vdGUxXCIsIFwibm90ZTJcIl0sXG4gIFwibmVlZHNfcmV2aWV3XCI6IGZhbHNlXG59YDtcbn1cbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL21ldGEtc3RlcC8vcnVuTWV0YVN0ZXBcIiwgcnVuTWV0YVN0ZXApO1xuIiwgImltcG9ydCB7IHJlZ2lzdGVyU3RlcEZ1bmN0aW9uIH0gZnJvbSBcIndvcmtmbG93L2ludGVybmFsL3ByaXZhdGVcIjtcbmltcG9ydCAnc2VydmVyLW9ubHknO1xuaW1wb3J0IHsgZ2VuZXJhdGVUZXh0IH0gZnJvbSAnYWknO1xuaW1wb3J0IHsgb3BlbmFpIH0gZnJvbSAnQGFpLXNkay9vcGVuYWknO1xuaW1wb3J0IHsgdXBkYXRlUnVuU3RhdHVzIH0gZnJvbSAnLi4vLi4vc3RvcmFnZS9ydW5zJztcbmltcG9ydCB7IGdldEFnZW50Q29uZmlnIH0gZnJvbSAnLi4vLi4vc3RvcmFnZS9hZ2VudC1jb25maWdzJztcbmltcG9ydCB7IGJ1aWxkRnVsbElucHV0Q29udGV4dCwgZXh0cmFjdEpzb25PYmplY3QgfSBmcm9tICcuL2NvbnRleHQtYnVpbGRlcic7XG4vKipfX2ludGVybmFsX3dvcmtmbG93c3tcInN0ZXBzXCI6e1wibGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9vdXRsaW5lLXN0ZXAudHNcIjp7XCJydW5PdXRsaW5lU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL291dGxpbmUtc3RlcC8vcnVuT3V0bGluZVN0ZXBcIn19fX0qLztcbi8qKlxuICogT3V0bGluZSBTdGVwIC0gUGhhc2UgMkMtQlxuICogUnVucyBpbnNpZGUgYSBkdXJhYmxlIHN0ZXAgZnVuY3Rpb24gKGhhcyBOb2RlLmpzIGFjY2VzcylcbiAqIENhbGxzIEFJIG1vZGVsIHRvIGdlbmVyYXRlIGNvbnRlbnQgb3V0bGluZSB3aXRoIHN0cnVjdHVyZVxuICogVXNlcyByZXNlYXJjaCBkYXRhIGlmIGF2YWlsYWJsZSB0byBpbmZvcm0gb3V0bGluZVxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5PdXRsaW5lU3RlcChydW5JZCwgaW5wdXQsIHJlc2VhcmNoRGF0YSkge1xuICAgIGNvbnNvbGUubG9nKGBbdjBdIE91dGxpbmUgc3RlcDogQ3JlYXRpbmcgb3V0bGluZSBmb3IgcnVuICR7cnVuSWR9YCk7XG4gICAgLy8gQ3JlYXRlIGNvbnRleHQgZnJvbSBhdmFpbGFibGUgZGF0YSAobmVlZGVkIGZvciBmYWxsYmFjayBpbiBjYXRjaCBibG9jaylcbiAgICBjb25zdCB0b3BpYyA9IGlucHV0LmJsb2dfdG9waWMgfHwgaW5wdXQudG9waWMgfHwgJ1lvdXIgVG9waWMnO1xuICAgIGNvbnN0IHByaW1hcnlLZXl3b3JkID0gaW5wdXQucHJpbWFyeV9rZXl3b3JkIHx8ICdwcmltYXJ5IGtleXdvcmQnO1xuICAgIGNvbnN0IHNlY29uZGFyeUtleXdvcmRzID0gKGlucHV0LnNlY29uZGFyeV9rZXl3b3JkcyB8fCBpbnB1dC5rZXl3b3JkcyB8fCBbXSkuam9pbignLCAnKSB8fCAnc2Vjb25kYXJ5IGtleXdvcmRzJztcbiAgICBjb25zdCBidXNpbmVzc05hbWUgPSBpbnB1dC5idXNpbmVzc19uYW1lIHx8ICdZb3VyIEJ1c2luZXNzJztcbiAgICBjb25zdCBhdWRpZW5jZU5vdGVzID0gaW5wdXQuYXVkaWVuY2Vfbm90ZXMgfHwgJ1RhcmdldCBhdWRpZW5jZSBub3Qgc3BlY2lmaWVkJztcbiAgICBjb25zdCBicmFuZFZvaWNlID0gaW5wdXQuYnJhbmRfdm9pY2Vfbm90ZXMgfHwgJ1Byb2Zlc3Npb25hbCBhbmQgY2xlYXInO1xuICAgIGNvbnN0IGN0YU5vdGVzID0gaW5wdXQuY3RhX25vdGVzIHx8ICdFbmNvdXJhZ2UgZW5nYWdlbWVudCc7XG4gICAgY29uc3QgYWRkaXRpb25hbE5vdGVzID0gaW5wdXQuYWRkaXRpb25hbF9vcmRlcl9ub3RlcyB8fCAnTm8gYWRkaXRpb25hbCBub3Rlcyc7XG4gICAgY29uc3QgdGFyZ2V0V29yZENvdW50ID0gaW5wdXQudGFyZ2V0X3dvcmRfY291bnQgfHwgMTUwMDtcbiAgICB0cnkge1xuICAgICAgICAvLyBMb2FkIGFnZW50IGNvbmZpZyBmcm9tIGRhdGFiYXNlXG4gICAgICAgIGNvbnN0IGFnZW50Q29uZmlnID0gYXdhaXQgZ2V0QWdlbnRDb25maWcoJ291dGxpbmUnKTtcbiAgICAgICAgaWYgKCFhZ2VudENvbmZpZykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBY3RpdmUgYWdlbnQgY29uZmlnIG5vdCBmb3VuZCBmb3IgYWdlbnRfa2V5OiBvdXRsaW5lJyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gU0VPIEJsb2cgQWdlbnQgQ29uZmlnIExvYWRlZDogb3V0bGluZSB2JHthZ2VudENvbmZpZy52ZXJzaW9ufWApO1xuICAgICAgICAvLyBCdWlsZCBzeXN0ZW0gcHJvbXB0IGZyb20gZGF0YWJhc2UgY29uZmlnXG4gICAgICAgIGNvbnN0IHN5c3RlbVByb21wdCA9IFtcbiAgICAgICAgICAgIGFnZW50Q29uZmlnLnN5c3RlbV9wcm9tcHQsXG4gICAgICAgICAgICBhZ2VudENvbmZpZy5za2lsbF9tYXJrZG93blxuICAgICAgICBdLmZpbHRlcihCb29sZWFuKS5qb2luKCdcXG5cXG4nKTtcbiAgICAgICAgLy8gSW5jbHVkZSByZXNlYXJjaCBpbnNpZ2h0cyBpZiBhdmFpbGFibGVcbiAgICAgICAgbGV0IHJlc2VhcmNoQ29udGV4dCA9ICcnO1xuICAgICAgICBpZiAocmVzZWFyY2hEYXRhKSB7XG4gICAgICAgICAgICByZXNlYXJjaENvbnRleHQgPSBgXG5cblJlc2VhcmNoIEluc2lnaHRzIGZyb20gUmVzZWFyY2ggQWdlbnQ6XG4tIFNlYXJjaCBJbnRlbnQ6ICR7cmVzZWFyY2hEYXRhLnNlYXJjaF9pbnRlbnQgfHwgJ04vQSd9XG4tIENvbnRlbnQgQW5nbGU6ICR7cmVzZWFyY2hEYXRhLmNvbnRlbnRfYW5nbGUgfHwgJ04vQSd9XG4tIFRhcmdldCBBdWRpZW5jZTogJHtyZXNlYXJjaERhdGEudGFyZ2V0X2F1ZGllbmNlX3N1bW1hcnkgfHwgJ04vQSd9XG4tIFJlY29tbWVuZGVkIFNlY3Rpb25zOiAke3Jlc2VhcmNoRGF0YS5yZWNvbW1lbmRlZF9zZWN0aW9ucz8uam9pbignLCAnKSB8fCAnTi9BJ31cbi0gUXVlc3Rpb25zIHRvIEFuc3dlcjogJHtyZXNlYXJjaERhdGEucXVlc3Rpb25zX3RvX2Fuc3dlcj8uam9pbignLCAnKSB8fCAnTi9BJ31gO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHVzZXJNZXNzYWdlID0gYENyZWF0ZSB0aGUgT3V0bGluZSBBZ2VudCBKU09OIHVzaW5nIHRoZSBzdXBwbGllZCBSZXNlYXJjaCBBZ2VudCBvdXRwdXQgYW5kIGZ1bGwgQmxvZyBDb250ZXh0IEJyaWVmLlxuXG4ke2J1aWxkRnVsbElucHV0Q29udGV4dChpbnB1dCl9JHtyZXNlYXJjaENvbnRleHR9XG5cblJldHVybiB2YWxpZCBKU09OIG9ubHkgdXNpbmcgdGhlIHNjaGVtYSBmcm9tIHlvdXIgc3lzdGVtIGluc3RydWN0aW9ucy4gUHJlc2VydmUgbXVzdF9pbmNsdWRlIGFuZCBtdXN0X2F2b2lkIHJlc3RyaWN0aW9ucywgYW5kIGluY2x1ZGUgY2xpZW50X2dvYWxfbm90ZXMgZm9yIGVhY2ggc2VjdGlvbi5gO1xuICAgICAgICAvLyBHZXQgbW9kZWwgbmFtZTogdXNlIERCIGNvbmZpZyBpZiBhdmFpbGFibGUsIG90aGVyd2lzZSBmYWxsIGJhY2sgdG8gZW52IHZhciBvciBkZWZhdWx0XG4gICAgICAgIGNvbnN0IG1vZGVsTmFtZSA9IGFnZW50Q29uZmlnLm1vZGVsIHx8IHByb2Nlc3MuZW52Lk9VVExJTkVfQUdFTlRfTU9ERUwgfHwgcHJvY2Vzcy5lbnYuUkVTRUFSQ0hfQUdFTlRfTU9ERUwgfHwgJ2dwdC01LjQtbWluaSc7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIE91dGxpbmUgc3RlcDogVXNpbmcgbW9kZWw6ICR7bW9kZWxOYW1lfWApO1xuICAgICAgICAvLyBVc2UgZGlyZWN0IE9wZW5BSSBwcm92aWRlclxuICAgICAgICBjb25zdCBtb2RlbCA9IG9wZW5haShtb2RlbE5hbWUpO1xuICAgICAgICAvLyBDYWxsIEFJIG1vZGVsXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZ2VuZXJhdGVUZXh0KHtcbiAgICAgICAgICAgIG1vZGVsLFxuICAgICAgICAgICAgc3lzdGVtOiBzeXN0ZW1Qcm9tcHQsXG4gICAgICAgICAgICBwcm9tcHQ6IHVzZXJNZXNzYWdlLFxuICAgICAgICAgICAgdGVtcGVyYXR1cmU6IDAuN1xuICAgICAgICB9KTtcbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gT3V0bGluZSBzdGVwOiBSYXcgcmVzcG9uc2UgbGVuZ3RoOiAke3Jlc3BvbnNlLnRleHQubGVuZ3RofWApO1xuICAgICAgICAvLyBQYXJzZSB0aGUgSlNPTiByZXNwb25zZVxuICAgICAgICBjb25zdCBvdXRsaW5lRGF0YSA9IEpTT04ucGFyc2UoZXh0cmFjdEpzb25PYmplY3QocmVzcG9uc2UudGV4dCkpO1xuICAgICAgICAvLyBWYWxpZGF0ZSByZXF1aXJlZCBmaWVsZHMgYW5kIGFkZCBkZWZhdWx0c1xuICAgICAgICBvdXRsaW5lRGF0YS50aW1lc3RhbXAgPSBvdXRsaW5lRGF0YS50aW1lc3RhbXAgfHwgbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgICAgICBvdXRsaW5lRGF0YS50YXJnZXRfd29yZF9jb3VudCA9IG91dGxpbmVEYXRhLnRhcmdldF93b3JkX2NvdW50IHx8IHRhcmdldFdvcmRDb3VudDtcbiAgICAgICAgLy8gRW5zdXJlIHNlY3Rpb25zIGFycmF5IGV4aXN0c1xuICAgICAgICBpZiAoIW91dGxpbmVEYXRhLnNlY3Rpb25zIHx8ICFBcnJheS5pc0FycmF5KG91dGxpbmVEYXRhLnNlY3Rpb25zKSkge1xuICAgICAgICAgICAgb3V0bGluZURhdGEuc2VjdGlvbnMgPSBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBoZWFkaW5nOiAnSW50cm9kdWN0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgcHVycG9zZTogJ0ludHJvZHVjZSB0b3BpYyBhbmQgc2V0IGNvbnRleHQnLFxuICAgICAgICAgICAgICAgICAgICBlc3RpbWF0ZWRfd29yZHM6IDE1MCxcbiAgICAgICAgICAgICAgICAgICAga2V5X3BvaW50czogW1xuICAgICAgICAgICAgICAgICAgICAgICAgJ1RvcGljIG92ZXJ2aWV3JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdXaHkgdGhpcyBtYXR0ZXJzJ1xuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBzZW9fbm90ZXM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICdJbmNsdWRlIHByaW1hcnkga2V5d29yZCBuYXR1cmFsbHknXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIGNsaWVudF9nb2FsX25vdGVzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAnQ29ubmVjdCB0aGUgdG9waWMgdG8gdGhlIHN1cHBsaWVkIGNsaWVudCBnb2FsIHdoZXJlIHJlbGV2YW50J1xuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGhlYWRpbmc6ICdNYWluIENvbnRlbnQnLFxuICAgICAgICAgICAgICAgICAgICBwdXJwb3NlOiAnRGV0YWlsZWQgZXhwbG9yYXRpb24gb2YgdG9waWMnLFxuICAgICAgICAgICAgICAgICAgICBlc3RpbWF0ZWRfd29yZHM6IDEwMDAsXG4gICAgICAgICAgICAgICAgICAgIGtleV9wb2ludHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICdLZXkgaW5zaWdodCAxJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdLZXkgaW5zaWdodCAyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdLZXkgaW5zaWdodCAzJ1xuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBzZW9fbm90ZXM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICdVc2Ugc2Vjb25kYXJ5IGtleXdvcmRzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdBbnN3ZXIgdXNlciBpbnRlbnQgcXVlc3Rpb25zJ1xuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBjbGllbnRfZ29hbF9ub3RlczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgJ1VzZSBzdXBwbGllZCBidXNpbmVzcyBnb2FsIGFuZCBzZXJ2aWNlcyB3aXRob3V0IGludmVudGluZyBjbGFpbXMnXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGluZzogJ0NvbmNsdXNpb24nLFxuICAgICAgICAgICAgICAgICAgICBwdXJwb3NlOiAnU3VtbWFyaXplIGFuZCBjYWxsIHRvIGFjdGlvbicsXG4gICAgICAgICAgICAgICAgICAgIGVzdGltYXRlZF93b3JkczogMTUwLFxuICAgICAgICAgICAgICAgICAgICBrZXlfcG9pbnRzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAnU3VtbWFyeSBvZiBrZXkgcG9pbnRzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdDYWxsIHRvIGFjdGlvbidcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgc2VvX25vdGVzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAnUmVpbmZvcmNlIHByaW1hcnkga2V5d29yZCdcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgY2xpZW50X2dvYWxfbm90ZXM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICdDbG9zZSB3aXRoIHRoZSBzdXBwbGllZCBDVEEgZGlyZWN0aW9uJ1xuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXTtcbiAgICAgICAgfVxuICAgICAgICBvdXRsaW5lRGF0YS5zZWN0aW9ucyA9IG91dGxpbmVEYXRhLnNlY3Rpb25zLm1hcCgoc2VjdGlvbik9Pih7XG4gICAgICAgICAgICAgICAgLi4uc2VjdGlvbixcbiAgICAgICAgICAgICAgICBrZXlfcG9pbnRzOiBBcnJheS5pc0FycmF5KHNlY3Rpb24ua2V5X3BvaW50cykgPyBzZWN0aW9uLmtleV9wb2ludHMgOiBbXSxcbiAgICAgICAgICAgICAgICBzZW9fbm90ZXM6IEFycmF5LmlzQXJyYXkoc2VjdGlvbi5zZW9fbm90ZXMpID8gc2VjdGlvbi5zZW9fbm90ZXMgOiBbXSxcbiAgICAgICAgICAgICAgICBjbGllbnRfZ29hbF9ub3RlczogQXJyYXkuaXNBcnJheShzZWN0aW9uLmNsaWVudF9nb2FsX25vdGVzKSA/IHNlY3Rpb24uY2xpZW50X2dvYWxfbm90ZXMgOiBbXSxcbiAgICAgICAgICAgICAgICBlc3RpbWF0ZWRfd29yZHM6IHR5cGVvZiBzZWN0aW9uLmVzdGltYXRlZF93b3JkcyA9PT0gJ251bWJlcicgPyBzZWN0aW9uLmVzdGltYXRlZF93b3JkcyA6IDBcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgb3V0bGluZURhdGEubmVlZHNfcmV2aWV3ID0gQm9vbGVhbihvdXRsaW5lRGF0YS5uZWVkc19yZXZpZXcpO1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBPdXRsaW5lIHN0ZXA6IEdlbmVyYXRlZCBvdXRsaW5lIHdpdGggJHtvdXRsaW5lRGF0YS5zZWN0aW9ucy5sZW5ndGh9IHNlY3Rpb25zYCk7XG4gICAgICAgIC8vIFBlcnNpc3Qgb3V0bGluZV9qc29uIHRvIGRhdGFiYXNlXG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIE91dGxpbmUgc3RlcDogUGVyc2lzdGluZyBvdXRsaW5lX2pzb24gZm9yIHJ1biAke3J1bklkfWApO1xuICAgICAgICBhd2FpdCB1cGRhdGVSdW5TdGF0dXMocnVuSWQsICdvdXRsaW5pbmcnLCBvdXRsaW5lRGF0YSk7XG4gICAgICAgIHJldHVybiBvdXRsaW5lRGF0YTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKGBbdjBdIE91dGxpbmUgc3RlcCBlcnJvcjpgLCBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcikpO1xuICAgICAgICAvLyBSZXR1cm4gZmFsbGJhY2sgb3V0bGluZSBpZiBwYXJzaW5nIG9yIEFJIGNhbGwgZmFpbHNcbiAgICAgICAgY29uc3QgZmFsbGJhY2tPdXRsaW5lID0ge1xuICAgICAgICAgICAgdGl0bGU6IGAke3RvcGljfSAtIENvbXByZWhlbnNpdmUgR3VpZGUgfCAke2J1c2luZXNzTmFtZX1gLFxuICAgICAgICAgICAgbWV0YV9hbmdsZTogYEV2ZXJ5dGhpbmcgeW91IG5lZWQgdG8ga25vdyBhYm91dCAke3RvcGljfSBmb3IgJHtidXNpbmVzc05hbWV9YCxcbiAgICAgICAgICAgIHRhcmdldF93b3JkX2NvdW50OiB0YXJnZXRXb3JkQ291bnQsXG4gICAgICAgICAgICBzZWN0aW9uczogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGluZzogJ0ludHJvZHVjdGlvbjogVW5kZXJzdGFuZGluZyB0aGUgQmFzaWNzJyxcbiAgICAgICAgICAgICAgICAgICAgcHVycG9zZTogJ1NldCBjb250ZXh0IGFuZCBpbnRyb2R1Y2UgdGhlIHRvcGljJyxcbiAgICAgICAgICAgICAgICAgICAgZXN0aW1hdGVkX3dvcmRzOiAyMDAsXG4gICAgICAgICAgICAgICAgICAgIGtleV9wb2ludHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIGBPdmVydmlldyBvZiAke3RvcGljfWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAnV2h5IHRoaXMgdG9waWMgbWF0dGVycyB0byB5b3VyIGF1ZGllbmNlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdXaGF0IHlvdSB3aWxsIGxlYXJuJ1xuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBzZW9fbm90ZXM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICdJbmNsdWRlIHByaW1hcnkga2V5d29yZCBpbiBmaXJzdCBwYXJhZ3JhcGgnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ1VzZSBlbmdhZ2luZyBob29rJ1xuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBjbGllbnRfZ29hbF9ub3RlczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgJ0ludHJvZHVjZSB3aHkgdGhpcyB0b3BpYyBtYXR0ZXJzIGZvciB0aGUgc3VwcGxpZWQgYXVkaWVuY2UgYW5kIGJ1c2luZXNzIGdvYWwnXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGluZzogJ0tleSBDb25jZXB0cyBhbmQgQmVuZWZpdHMnLFxuICAgICAgICAgICAgICAgICAgICBwdXJwb3NlOiAnRXhwbG9yZSBjb3JlIGNvbmNlcHRzIGFuZCBhZHZhbnRhZ2VzJyxcbiAgICAgICAgICAgICAgICAgICAgZXN0aW1hdGVkX3dvcmRzOiA0MDAsXG4gICAgICAgICAgICAgICAgICAgIGtleV9wb2ludHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICdDb3JlIGNvbmNlcHQgMScsXG4gICAgICAgICAgICAgICAgICAgICAgICAnQ29yZSBjb25jZXB0IDInLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0hvdyBidXNpbmVzc2VzIGJlbmVmaXQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ1JlYWwtd29ybGQgYXBwbGljYXRpb25zJ1xuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBzZW9fbm90ZXM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICdVc2Ugc2Vjb25kYXJ5IGtleXdvcmRzIG5hdHVyYWxseScsXG4gICAgICAgICAgICAgICAgICAgICAgICAnQW5zd2VyIGNvbW1vbiBxdWVzdGlvbnMnXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIGNsaWVudF9nb2FsX25vdGVzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAnVGllIGJlbmVmaXRzIGJhY2sgdG8gdGhlIHN1cHBsaWVkIHNlcnZpY2Ugb3IgQ1RBIG9ubHkgd2hlbiBzdXBwb3J0ZWQnXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGluZzogJ0Jlc3QgUHJhY3RpY2VzIGFuZCBJbXBsZW1lbnRhdGlvbicsXG4gICAgICAgICAgICAgICAgICAgIHB1cnBvc2U6ICdQcm92aWRlIGFjdGlvbmFibGUgZ3VpZGFuY2UnLFxuICAgICAgICAgICAgICAgICAgICBlc3RpbWF0ZWRfd29yZHM6IDUwMCxcbiAgICAgICAgICAgICAgICAgICAga2V5X3BvaW50czogW1xuICAgICAgICAgICAgICAgICAgICAgICAgJ1N0ZXAtYnktc3RlcCBpbXBsZW1lbnRhdGlvbicsXG4gICAgICAgICAgICAgICAgICAgICAgICAnQmVzdCBwcmFjdGljZXMgaW4gdGhlIGluZHVzdHJ5JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdDb21tb24gbWlzdGFrZXMgdG8gYXZvaWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ1Rvb2xzIGFuZCByZXNvdXJjZXMnXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIHNlb19ub3RlczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgJ1VzZSBsb25nLXRhaWwga2V5d29yZHMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0luY2x1ZGUgcHJhY3RpY2FsIGV4YW1wbGVzJ1xuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBjbGllbnRfZ29hbF9ub3RlczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgJ0tlZXAgcmVjb21tZW5kYXRpb25zIGdyb3VuZGVkIGluIHRoZSBzdXBwbGllZCBjb250ZXh0J1xuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGhlYWRpbmc6ICdDb25jbHVzaW9uIGFuZCBOZXh0IFN0ZXBzJyxcbiAgICAgICAgICAgICAgICAgICAgcHVycG9zZTogJ1N1bW1hcml6ZSBhbmQgZ3VpZGUgcmVhZGVyIGFjdGlvbicsXG4gICAgICAgICAgICAgICAgICAgIGVzdGltYXRlZF93b3JkczogMTUwLFxuICAgICAgICAgICAgICAgICAgICBrZXlfcG9pbnRzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAnS2V5IHRha2Vhd2F5cycsXG4gICAgICAgICAgICAgICAgICAgICAgICAnUmVjb21tZW5kZWQgbmV4dCBzdGVwcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAnQ2FsbCB0byBhY3Rpb24nXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIHNlb19ub3RlczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgJ1JlaW5mb3JjZSBwcmltYXJ5IGtleXdvcmQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0NyZWF0ZSB1cmdlbmN5IGZvciBDVEEnXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIGNsaWVudF9nb2FsX25vdGVzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAnVXNlIHRoZSBzdXBwbGllZCBDVEEgZGlyZWN0aW9uIHdpdGhvdXQgaW52ZW50aW5nIG9mZmVycydcbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBpbnRyb19ndWlkYW5jZTogYFN0YXJ0IHdpdGggYSBjb21wZWxsaW5nIGhvb2sgdGhhdCBhZGRyZXNzZXMgdGhlIHJlYWRlcidzIHBhaW4gcG9pbnQuIEludHJvZHVjZSAke3RvcGljfSBpbiB0aGUgY29udGV4dCBvZiAke2J1c2luZXNzTmFtZX0gYW5kIGV4cGxhaW4gd2h5IGl0IG1hdHRlcnMgdG8gdGhlIHRhcmdldCBhdWRpZW5jZS4gSW5jbHVkZSB0aGUgcHJpbWFyeSBrZXl3b3JkIFwiJHtwcmltYXJ5S2V5d29yZH1cIiBuYXR1cmFsbHkgaW4gdGhlIGZpcnN0IDEwMCB3b3Jkcy5gLFxuICAgICAgICAgICAgY29uY2x1c2lvbl9ndWlkYW5jZTogYFN1bW1hcml6ZSB0aGUgbWFpbiB0YWtlYXdheXMgZnJvbSBlYWNoIHNlY3Rpb24uIFJlaW5mb3JjZSBob3cgdW5kZXJzdGFuZGluZyAke3RvcGljfSBiZW5lZml0cyB0aGUgcmVhZGVyLiBJbmNsdWRlIGEgY2xlYXIsIGNvbXBlbGxpbmcgY2FsbC10by1hY3Rpb24gdGhhdCBndWlkZXMgdGhlIHJlYWRlciBvbiBuZXh0IHN0ZXBzLiBFbmQgd2l0aCB0aGUgcHJpbWFyeSBrZXl3b3JkIG5hdHVyYWxseSBpbmNvcnBvcmF0ZWQuYCxcbiAgICAgICAgICAgIGN0YV9ndWlkYW5jZTogYCR7Y3RhTm90ZXN9LiBFbnN1cmUgdGhlIENUQSBpcyBjbGVhciwgc3BlY2lmaWMsIGFuZCByZWxldmFudCB0byB0aGUgYXJ0aWNsZSBjb250ZW50LiBFeGFtcGxlczogXCJTY2hlZHVsZSBhIGNvbnN1bHRhdGlvbixcIiBcIkRvd25sb2FkIG91ciBndWlkZSxcIiBcIkdldCBzdGFydGVkIHRvZGF5LFwiIFwiSm9pbiBvdXIgY29tbXVuaXR5LlwiYCxcbiAgICAgICAgICAgIGludGVybmFsX2xpbmtfb3Bwb3J0dW5pdGllczogW1xuICAgICAgICAgICAgICAgICdMaW5rIHRvIHJlbGV2YW50IHNlcnZpY2UgcGFnZXMgb24gY29tcGFueSB3ZWJzaXRlJyxcbiAgICAgICAgICAgICAgICAnTGluayB0byByZWxhdGVkIGJsb2cgcG9zdHMgb24gc2ltaWxhciB0b3BpY3MnLFxuICAgICAgICAgICAgICAgICdMaW5rIHRvIGNhc2Ugc3R1ZGllcyBvciBzdWNjZXNzIHN0b3JpZXMnLFxuICAgICAgICAgICAgICAgICdMaW5rIHRvIHJlc291cmNlIHBhZ2VzIG9yIHRvb2xzJ1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIG5lZWRzX3JldmlldzogdHJ1ZSxcbiAgICAgICAgICAgIG5vdGVzX2Zvcl93cml0ZXI6IFtcbiAgICAgICAgICAgICAgICBgUmVtZW1iZXIgdG8gbWFpbnRhaW4gYSAke2JyYW5kVm9pY2V9IHRvbmUgdGhyb3VnaG91dGAsXG4gICAgICAgICAgICAgICAgYEFkZHJlc3MgdGhlIG5lZWRzIG9mOiAke2F1ZGllbmNlTm90ZXN9YCxcbiAgICAgICAgICAgICAgICBgRW5zdXJlIHRoZSBjb250ZW50IGlzIHdlbGwtcmVzZWFyY2hlZCBhbmQgaW5jbHVkZXMgc3BlY2lmaWMgZXhhbXBsZXNgLFxuICAgICAgICAgICAgICAgIGBVc2Ugc3ViaGVhZGluZ3MgdG8gaW1wcm92ZSByZWFkYWJpbGl0eSBhbmQgU0VPYCxcbiAgICAgICAgICAgICAgICBgSW5jbHVkZSByZWxldmFudCBkYXRhLCBzdGF0aXN0aWNzLCBvciByZXNlYXJjaCBmaW5kaW5ncyB3aGVyZSBhcHByb3ByaWF0ZWAsXG4gICAgICAgICAgICAgICAgYEVuZCB3aXRoIGEgc3Ryb25nIENUQSBhbGlnbmVkIHdpdGg6ICR7Y3RhTm90ZXN9YFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICAgIH07XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIE91dGxpbmUgc3RlcDogVXNpbmcgZmFsbGJhY2sgb3V0bGluZSBkdWUgdG8gZXJyb3JgKTtcbiAgICAgICAgcmV0dXJuIGZhbGxiYWNrT3V0bGluZTtcbiAgICB9XG59XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9vdXRsaW5lLXN0ZXAvL3J1bk91dGxpbmVTdGVwXCIsIHJ1bk91dGxpbmVTdGVwKTtcbiIsICJpbXBvcnQgeyByZWdpc3RlclN0ZXBGdW5jdGlvbiB9IGZyb20gXCJ3b3JrZmxvdy9pbnRlcm5hbC9wcml2YXRlXCI7XG5pbXBvcnQgJ3NlcnZlci1vbmx5JztcbmltcG9ydCB7IGdlbmVyYXRlVGV4dCB9IGZyb20gJ2FpJztcbmltcG9ydCB7IG9wZW5haSB9IGZyb20gJ0BhaS1zZGsvb3BlbmFpJztcbmltcG9ydCB7IHVwZGF0ZVJ1blN0YXR1cyB9IGZyb20gJy4uLy4uL3N0b3JhZ2UvcnVucyc7XG5pbXBvcnQgeyBnZXRBZ2VudENvbmZpZyB9IGZyb20gJy4uLy4uL3N0b3JhZ2UvYWdlbnQtY29uZmlncyc7XG5pbXBvcnQgeyBidWlsZEZ1bGxJbnB1dENvbnRleHQsIGV4dHJhY3RKc29uT2JqZWN0IH0gZnJvbSAnLi9jb250ZXh0LWJ1aWxkZXInO1xuLyoqX19pbnRlcm5hbF93b3JrZmxvd3N7XCJzdGVwc1wiOntcImxpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvcmVzZWFyY2gtc3RlcC50c1wiOntcInJ1blJlc2VhcmNoU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3Jlc2VhcmNoLXN0ZXAvL3J1blJlc2VhcmNoU3RlcFwifX19fSovO1xuLyoqXG4gKiBSZXNlYXJjaCBTdGVwIC0gUGhhc2UgMkMtQVxuICogUnVucyBpbnNpZGUgYSBkdXJhYmxlIHN0ZXAgZnVuY3Rpb24gKGhhcyBOb2RlLmpzIGFjY2VzcylcbiAqIENhbGxzIEFJIG1vZGVsIHRvIGdlbmVyYXRlIHJlc2VhcmNoIEpTT05cbiAqIE5vIGZpbGVzeXN0ZW0gaW1wb3J0cyAtIHNhZmUgZm9yIHdvcmtmbG93IGNvbnRleHRcbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gcnVuUmVzZWFyY2hTdGVwKHJ1bklkLCBpbnB1dCkge1xuICAgIGNvbnNvbGUubG9nKGBbdjBdIFJlc2VhcmNoIHN0ZXA6IEFuYWx5emluZyB0b3BpYyBmb3IgcnVuICR7cnVuSWR9YCk7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gTG9hZCBhZ2VudCBjb25maWcgZnJvbSBkYXRhYmFzZVxuICAgICAgICBjb25zdCBhZ2VudENvbmZpZyA9IGF3YWl0IGdldEFnZW50Q29uZmlnKCdyZXNlYXJjaCcpO1xuICAgICAgICBpZiAoIWFnZW50Q29uZmlnKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0FjdGl2ZSBhZ2VudCBjb25maWcgbm90IGZvdW5kIGZvciBhZ2VudF9rZXk6IHJlc2VhcmNoJyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gU0VPIEJsb2cgQWdlbnQgQ29uZmlnIExvYWRlZDogcmVzZWFyY2ggdiR7YWdlbnRDb25maWcudmVyc2lvbn1gKTtcbiAgICAgICAgLy8gQnVpbGQgc3lzdGVtIHByb21wdCBmcm9tIGRhdGFiYXNlIGNvbmZpZ1xuICAgICAgICBjb25zdCBzeXN0ZW1Qcm9tcHQgPSBbXG4gICAgICAgICAgICBhZ2VudENvbmZpZy5zeXN0ZW1fcHJvbXB0LFxuICAgICAgICAgICAgYWdlbnRDb25maWcuc2tpbGxfbWFya2Rvd25cbiAgICAgICAgXS5maWx0ZXIoQm9vbGVhbikuam9pbignXFxuXFxuJyk7XG4gICAgICAgIGNvbnN0IHVzZXJNZXNzYWdlID0gYENyZWF0ZSB0aGUgUmVzZWFyY2ggQWdlbnQgSlNPTiB1c2luZyBhbGwgc3VwcGxpZWQgY29udGV4dC5cblxuJHtidWlsZEZ1bGxJbnB1dENvbnRleHQoaW5wdXQpfVxuXG5SZXR1cm4gdmFsaWQgSlNPTiBvbmx5IHVzaW5nIHRoZSBzY2hlbWEgZnJvbSB5b3VyIHN5c3RlbSBpbnN0cnVjdGlvbnMuIERvIG5vdCB3cml0ZSB0aGUgYmxvZyBvciBvdXRsaW5lLiBQcmVzZXJ2ZSBtdXN0X2luY2x1ZGUgYW5kIG11c3RfYXZvaWQgZXhhY3RseSB3aGVyZSBwcm92aWRlZC5gO1xuICAgICAgICAvLyBHZXQgbW9kZWwgbmFtZTogdXNlIERCIGNvbmZpZyBpZiBhdmFpbGFibGUsIG90aGVyd2lzZSBmYWxsIGJhY2sgdG8gZW52IHZhciBvciBkZWZhdWx0XG4gICAgICAgIGNvbnN0IG1vZGVsTmFtZSA9IGFnZW50Q29uZmlnLm1vZGVsIHx8IHByb2Nlc3MuZW52LlJFU0VBUkNIX0FHRU5UX01PREVMIHx8ICdncHQtNS40LW1pbmknO1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBSZXNlYXJjaCBzdGVwOiBVc2luZyBtb2RlbDogJHttb2RlbE5hbWV9YCk7XG4gICAgICAgIC8vIFVzZSBkaXJlY3QgT3BlbkFJIHByb3ZpZGVyIHdpdGggT1BFTkFJX0FQSV9LRVlcbiAgICAgICAgY29uc3QgbW9kZWwgPSBvcGVuYWkobW9kZWxOYW1lKTtcbiAgICAgICAgLy8gQ2FsbCBBSSBtb2RlbFxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGdlbmVyYXRlVGV4dCh7XG4gICAgICAgICAgICBtb2RlbCxcbiAgICAgICAgICAgIHN5c3RlbTogc3lzdGVtUHJvbXB0LFxuICAgICAgICAgICAgcHJvbXB0OiB1c2VyTWVzc2FnZSxcbiAgICAgICAgICAgIHRlbXBlcmF0dXJlOiAwLjdcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFJlc2VhcmNoIHN0ZXA6IEFJIG1vZGVsIHJlc3BvbmRlZCwgcGFyc2luZyBKU09OYCk7XG4gICAgICAgIC8vIFBhcnNlIEpTT04gcmVzcG9uc2VcbiAgICAgICAgbGV0IHJlc2VhcmNoRGF0YTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFRyeSB0byBleHRyYWN0IEpTT04gZnJvbSByZXNwb25zZSAoaW4gY2FzZSBvZiBleHRyYSB0ZXh0KVxuICAgICAgICAgICAgcmVzZWFyY2hEYXRhID0gSlNPTi5wYXJzZShleHRyYWN0SnNvbk9iamVjdChyZXNwb25zZS50ZXh0KSk7XG4gICAgICAgICAgICAvLyBWYWxpZGF0ZSByZXF1aXJlZCBmaWVsZHMgYXQgcnVudGltZVxuICAgICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHJlc2VhcmNoRGF0YS5rZXlfZmluZGluZ3MpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZXNlYXJjaCBvdXRwdXQgbWlzc2luZyByZXF1aXJlZCBrZXlfZmluZGluZ3MgYXJyYXknKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChyZXNlYXJjaERhdGEua2V5X2ZpbmRpbmdzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignUmVzZWFyY2ggb3V0cHV0IGtleV9maW5kaW5ncyBhcnJheSBjYW5ub3QgYmUgZW1wdHknKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAocGFyc2VFcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2MF0gUmVzZWFyY2ggc3RlcDogRmFpbGVkIHRvIHBhcnNlIEFJIHJlc3BvbnNlOmAsIHJlc3BvbnNlLnRleHQuc3Vic3RyaW5nKDAsIDIwMCkpO1xuICAgICAgICAgICAgLy8gUmV0dXJuIGZhbGxiYWNrIGlmIHBhcnNpbmcgZmFpbHNcbiAgICAgICAgICAgIHJlc2VhcmNoRGF0YSA9IHtcbiAgICAgICAgICAgICAgICBzZWFyY2hfaW50ZW50OiAnaW5mb3JtYXRpb25hbCcsXG4gICAgICAgICAgICAgICAgdGFyZ2V0X2F1ZGllbmNlX3N1bW1hcnk6IGlucHV0LmF1ZGllbmNlX25vdGVzIHx8ICdUYXJnZXQgYXVkaWVuY2Ugbm90IHNwZWNpZmllZCcsXG4gICAgICAgICAgICAgICAga2V5d29yZF9tYXA6IHtcbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeV9rZXl3b3JkOiBpbnB1dC5wcmltYXJ5X2tleXdvcmQgfHwgJ3ByaW1hcnkga2V5d29yZCcsXG4gICAgICAgICAgICAgICAgICAgIHNlY29uZGFyeV9rZXl3b3JkczogaW5wdXQuc2Vjb25kYXJ5X2tleXdvcmRzIHx8IFtdLFxuICAgICAgICAgICAgICAgICAgICBsc2lfdGVybXM6IFtdXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjb250ZW50X2FuZ2xlOiBgRm9jdXMgb24gJHtpbnB1dC5ibG9nX3RvcGljIHx8ICd0b3BpYyd9YCxcbiAgICAgICAgICAgICAgICBrZXlfZmluZGluZ3M6IFtcbiAgICAgICAgICAgICAgICAgICAgYFRvcGljIGZvY3VzZXMgb24gJHtpbnB1dC5ibG9nX3RvcGljIHx8ICd0aGUgc3ViamVjdCBtYXR0ZXInfWAsXG4gICAgICAgICAgICAgICAgICAgIGBUYXJnZXQgYXVkaWVuY2U6ICR7aW5wdXQuYXVkaWVuY2Vfbm90ZXMgfHwgJ2dlbmVyYWwgYXVkaWVuY2UnfWAsXG4gICAgICAgICAgICAgICAgICAgIGBQcmltYXJ5IGtleXdvcmQ6ICR7aW5wdXQucHJpbWFyeV9rZXl3b3JkIHx8ICd0byBiZSBkZXRlcm1pbmVkJ31gXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBjb21wZXRpdG9yX2luc2lnaHRzOiBbXG4gICAgICAgICAgICAgICAgICAgICdDb21wZXRpdG9yIGNvbnRleHQgd2FzIG5vdCBhdmFpbGFibGUgaW4gcGFyc2VkIG1vZGVsIG91dHB1dCdcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlY29tbWVuZGVkX3NlY3Rpb25zOiBbXG4gICAgICAgICAgICAgICAgICAgICdJbnRyb2R1Y3Rpb24nLFxuICAgICAgICAgICAgICAgICAgICAnTWFpbiBDb250ZW50JyxcbiAgICAgICAgICAgICAgICAgICAgJ0NvbmNsdXNpb24nXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBxdWVzdGlvbnNfdG9fYW5zd2VyOiBbXG4gICAgICAgICAgICAgICAgICAgICdXaGF0IGlzIHRoZSBtYWluIHRvcGljPydcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIGNsaWVudF9nb2FsX2FsaWdubWVudDogaW5wdXQuYmxvZ19jb250ZXh0X2JyaWVmPy5idXNpbmVzc19nb2FsIHx8IGlucHV0LmJ1c2luZXNzX2dvYWwgfHwgJ0NsaWVudCBnb2FsIG5vdCBzcGVjaWZpZWQnLFxuICAgICAgICAgICAgICAgIG11c3RfaW5jbHVkZTogaW5wdXQuYmxvZ19jb250ZXh0X2JyaWVmPy5tdXN0X2luY2x1ZGUgfHwgaW5wdXQubXVzdF9pbmNsdWRlIHx8IFtdLFxuICAgICAgICAgICAgICAgIG11c3RfYXZvaWQ6IGlucHV0LmJsb2dfY29udGV4dF9icmllZj8ubXVzdF9hdm9pZCB8fCBpbnB1dC5tdXN0X2F2b2lkIHx8IFtdLFxuICAgICAgICAgICAgICAgIHJlc2VhcmNoX25vdGVzOiAnRmFsbGJhY2sgcmVzZWFyY2ggZHVlIHRvIHBhcnNpbmcgZXJyb3I7IGh1bWFuIHJldmlldyByZWNvbW1lbmRlZCcsXG4gICAgICAgICAgICAgICAgdGFyZ2V0X3dvcmRfY291bnQ6IGlucHV0LnRhcmdldF93b3JkX2NvdW50IHx8IDEwMDAsXG4gICAgICAgICAgICAgICAgd2ViX3NlYXJjaF91c2VkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBuZWVkc19yZXZpZXc6IHRydWUsXG4gICAgICAgICAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgLy8gUGVyc2lzdCByZXNlYXJjaF9qc29uIHRvIGRhdGFiYXNlXG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFJlc2VhcmNoIHN0ZXA6IFBlcnNpc3RpbmcgcmVzZWFyY2hfanNvbiBmb3IgcnVuICR7cnVuSWR9YCk7XG4gICAgICAgIGF3YWl0IHVwZGF0ZVJ1blN0YXR1cyhydW5JZCwgJ3Jlc2VhcmNoaW5nJywgcmVzZWFyY2hEYXRhKTtcbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gUmVzZWFyY2ggc3RlcDogQ29tcGxldGUgZm9yIHJ1biAke3J1bklkfWApO1xuICAgICAgICByZXR1cm4gcmVzZWFyY2hEYXRhO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2MF0gUmVzZWFyY2ggc3RlcCBlcnJvciBmb3IgcnVuICR7cnVuSWR9OmAsIGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKSk7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbn1cbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3Jlc2VhcmNoLXN0ZXAvL3J1blJlc2VhcmNoU3RlcFwiLCBydW5SZXNlYXJjaFN0ZXApO1xuIiwgImltcG9ydCB7IHJlZ2lzdGVyU3RlcEZ1bmN0aW9uIH0gZnJvbSBcIndvcmtmbG93L2ludGVybmFsL3ByaXZhdGVcIjtcbmltcG9ydCAnc2VydmVyLW9ubHknO1xuaW1wb3J0IHsgZ2VuZXJhdGVUZXh0IH0gZnJvbSAnYWknO1xuaW1wb3J0IHsgb3BlbmFpIH0gZnJvbSAnQGFpLXNkay9vcGVuYWknO1xuaW1wb3J0IHsgdXBkYXRlUnVuU3RhdHVzIH0gZnJvbSAnLi4vLi4vc3RvcmFnZS9ydW5zJztcbmltcG9ydCB7IGdldEFnZW50Q29uZmlnIH0gZnJvbSAnLi4vLi4vc3RvcmFnZS9hZ2VudC1jb25maWdzJztcbmltcG9ydCB7IGJ1aWxkRnVsbElucHV0Q29udGV4dCwgZXh0cmFjdEpzb25PYmplY3QgfSBmcm9tICcuL2NvbnRleHQtYnVpbGRlcic7XG4vKipfX2ludGVybmFsX3dvcmtmbG93c3tcInN0ZXBzXCI6e1wibGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9zZW8tcWEtc3RlcC50c1wiOntcInJ1blNlb1FhU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3Nlby1xYS1zdGVwLy9ydW5TZW9RYVN0ZXBcIn19fX0qLztcbmNvbnN0IFZBTElEX1JFQ09NTUVOREVEX0FDVElPTlMgPSBbXG4gICAgJ0FwcHJvdmUgZm9yIGVkaXRvcicsXG4gICAgJ1JldmlzZSBiZWZvcmUgZWRpdG9yJyxcbiAgICAnTmVlZHMgaHVtYW4gcmV2aWV3J1xuXTtcbi8qKlxuICogU0VPIFFBIFN0ZXAgLSBQaGFzZSAyQy1EXG4gKiBSZXZpZXdzIGRyYWZ0IG1hcmtkb3duIGFnYWluc3QgU0VPIGFuZCBjbGllbnQtZ29hbCBjcml0ZXJpYS5cbiAqIFJldHVybnMgc3RydWN0dXJlZCBhdWRpdCBKU09OLiBEb2VzIG5vdCByZXdyaXRlIHRoZSBkcmFmdC5cbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gcnVuU2VvUWFTdGVwKHJ1bklkLCBpbnB1dCwgcmVzZWFyY2hEYXRhLCBvdXRsaW5lRGF0YSwgZHJhZnRNYXJrZG93bikge1xuICAgIGNvbnNvbGUubG9nKGBbdjBdIFNFTyBRQSBzdGVwOiBBdWRpdGluZyBkcmFmdCBmb3IgcnVuICR7cnVuSWR9YCk7XG4gICAgaWYgKCFkcmFmdE1hcmtkb3duKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignRHJhZnQgbWFya2Rvd24gaXMgcmVxdWlyZWQgZm9yIFNFTyBRQSByZXZpZXcnKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgYWdlbnRDb25maWcgPSBhd2FpdCBnZXRBZ2VudENvbmZpZygnc2VvX3FhJyk7XG4gICAgICAgIGlmICghYWdlbnRDb25maWcpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQWN0aXZlIGFnZW50IGNvbmZpZyBub3QgZm91bmQgZm9yIGFnZW50X2tleTogc2VvX3FhJyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gU0VPIEJsb2cgQWdlbnQgQ29uZmlnIExvYWRlZDogc2VvX3FhIHYke2FnZW50Q29uZmlnLnZlcnNpb259YCk7XG4gICAgICAgIGNvbnN0IHN5c3RlbVByb21wdCA9IFtcbiAgICAgICAgICAgIGFnZW50Q29uZmlnLnN5c3RlbV9wcm9tcHQsXG4gICAgICAgICAgICBhZ2VudENvbmZpZy5za2lsbF9tYXJrZG93blxuICAgICAgICBdLmZpbHRlcihCb29sZWFuKS5qb2luKCdcXG5cXG4nKTtcbiAgICAgICAgY29uc3QgbW9kZWxOYW1lID0gYWdlbnRDb25maWcubW9kZWwgfHwgcHJvY2Vzcy5lbnYuU0VPX1FBX0FHRU5UX01PREVMIHx8IHByb2Nlc3MuZW52LlJFU0VBUkNIX0FHRU5UX01PREVMIHx8ICdncHQtNS40LW1pbmknO1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBTRU8gUUEgc3RlcDogVXNpbmcgbW9kZWw6ICR7bW9kZWxOYW1lfWApO1xuICAgICAgICBjb25zdCBzZW9RYVByb21wdCA9IGBSZXZpZXcgdGhpcyBkcmFmdCB1c2luZyB0aGUgU0VPIFFBIHNjaGVtYSBmcm9tIHlvdXIgc3lzdGVtIGluc3RydWN0aW9ucy5cXG5cXG4ke2J1aWxkRnVsbElucHV0Q29udGV4dChpbnB1dCl9XFxuXFxuUmVzZWFyY2ggQWdlbnQgT3V0cHV0OlxcbiR7SlNPTi5zdHJpbmdpZnkocmVzZWFyY2hEYXRhID8/IHt9LCBudWxsLCAyKX1cXG5cXG5PdXRsaW5lIEFnZW50IE91dHB1dDpcXG4ke0pTT04uc3RyaW5naWZ5KG91dGxpbmVEYXRhID8/IHt9LCBudWxsLCAyKX1cXG5cXG5CbG9nIERyYWZ0IE1hcmtkb3duOlxcbiR7ZHJhZnRNYXJrZG93bn1cXG5cXG5SZXR1cm4gdmFsaWQgSlNPTiBvbmx5LiBEbyBub3QgcmV3cml0ZSB0aGUgZHJhZnQuIERvIG5vdCBpbmNsdWRlIG1hcmtkb3duIGZlbmNlcyBvciBleHBsYW5hdGlvbiB0ZXh0LiBUaGUgcmVjb21tZW5kZWRfbmV4dF9hY3Rpb24gbXVzdCBiZSBleGFjdGx5IG9uZSBvZjogJHtWQUxJRF9SRUNPTU1FTkRFRF9BQ1RJT05TLm1hcCgodmFsdWUpPT5gXCIke3ZhbHVlfVwiYCkuam9pbignLCAnKX0uYDtcbiAgICAgICAgY29uc3QgeyB0ZXh0IH0gPSBhd2FpdCBnZW5lcmF0ZVRleHQoe1xuICAgICAgICAgICAgbW9kZWw6IG9wZW5haShtb2RlbE5hbWUpLFxuICAgICAgICAgICAgc3lzdGVtOiBzeXN0ZW1Qcm9tcHQsXG4gICAgICAgICAgICBwcm9tcHQ6IHNlb1FhUHJvbXB0LFxuICAgICAgICAgICAgdGVtcGVyYXR1cmU6IDAuNCxcbiAgICAgICAgICAgIG1heFRva2VuczogMzAwMFxuICAgICAgICB9KTtcbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gU0VPIFFBIHN0ZXA6IFJlY2VpdmVkIGF1ZGl0IGZyb20gbW9kZWwsIHBhcnNpbmcgSlNPTmApO1xuICAgICAgICBsZXQgc2VvUWFSZXN1bHQ7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBzZW9RYVJlc3VsdCA9IEpTT04ucGFyc2UoZXh0cmFjdEpzb25PYmplY3QodGV4dCkpO1xuICAgICAgICB9IGNhdGNoIChwYXJzZUVycikge1xuICAgICAgICAgICAgY29uc3QgbWVzc2FnZSA9IHBhcnNlRXJyIGluc3RhbmNlb2YgRXJyb3IgPyBwYXJzZUVyci5tZXNzYWdlIDogU3RyaW5nKHBhcnNlRXJyKTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgU0VPIFFBIG91dHB1dCBwYXJzZSBmYWlsZWQ6ICR7bWVzc2FnZX1gKTtcbiAgICAgICAgfVxuICAgICAgICB2YWxpZGF0ZVNlb1FhT3V0cHV0KHNlb1FhUmVzdWx0KTtcbiAgICAgICAgc2VvUWFSZXN1bHQudGltZXN0YW1wID0gc2VvUWFSZXN1bHQudGltZXN0YW1wIHx8IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gU0VPIFFBIHN0ZXA6IFBlcnNpc3RpbmcgU0VPIFFBIGF1ZGl0IChzY29yZTogJHtzZW9RYVJlc3VsdC5vdmVyYWxsX3Njb3JlfSkgZm9yIHJ1biAke3J1bklkfWApO1xuICAgICAgICBhd2FpdCB1cGRhdGVSdW5TdGF0dXMocnVuSWQsICdzZW9fcWEnLCBzZW9RYVJlc3VsdCk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFNFTyBRQSBzdGVwOiBDb21wbGV0ZSBmb3IgcnVuICR7cnVuSWR9YCk7XG4gICAgICAgIHJldHVybiBzZW9RYVJlc3VsdDtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBlcnJvck1zZyA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgY29uc29sZS5lcnJvcihgW3YwXSBTRU8gUUEgc3RlcDogRXJyb3IgZHVyaW5nIGF1ZGl0IGZvciBydW4gJHtydW5JZH06ICR7ZXJyb3JNc2d9YCk7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHZhbGlkYXRlU2VvUWFPdXRwdXQob3V0cHV0KSB7XG4gICAgY29uc3QgbWlzc2luZ0ZpZWxkcyA9IFtdO1xuICAgIGNvbnN0IHJlcXVpcmVkRmllbGRzID0gW1xuICAgICAgICAnb3ZlcmFsbF9zY29yZScsXG4gICAgICAgICdyZWFkeV9mb3JfZWRpdG9yJyxcbiAgICAgICAgJ3JlY29tbWVuZGVkX25leHRfYWN0aW9uJyxcbiAgICAgICAgJ3NlYXJjaF9pbnRlbnRfYWxpZ25tZW50JyxcbiAgICAgICAgJ3ByaW1hcnlfa2V5d29yZF91c2FnZScsXG4gICAgICAgICdzZWNvbmRhcnlfa2V5d29yZF91c2FnZScsXG4gICAgICAgICdoZWFkaW5nX3N0cnVjdHVyZV9yZXZpZXcnLFxuICAgICAgICAnY29udGVudF9kZXB0aF9yZXZpZXcnLFxuICAgICAgICAncmVhZGFiaWxpdHlfcmV2aWV3JyxcbiAgICAgICAgJ2N0YV9yZXZpZXcnLFxuICAgICAgICAnaW50ZXJuYWxfbGlua2luZ19yZXZpZXcnLFxuICAgICAgICAnY2xpZW50X2dvYWxfYWxpZ25tZW50JyxcbiAgICAgICAgJ3ByaW9yaXR5X2ZpeGVzJyxcbiAgICAgICAgJ3Jpc2tfZmxhZ3MnLFxuICAgICAgICAnbmVlZHNfcmV2aWV3J1xuICAgIF07XG4gICAgZm9yIChjb25zdCBmaWVsZCBvZiByZXF1aXJlZEZpZWxkcyl7XG4gICAgICAgIGlmIChvdXRwdXRbZmllbGRdID09PSB1bmRlZmluZWQgfHwgb3V0cHV0W2ZpZWxkXSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgbWlzc2luZ0ZpZWxkcy5wdXNoKGZpZWxkKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAobWlzc2luZ0ZpZWxkcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgU0VPIFFBIG91dHB1dCBtaXNzaW5nIHJlcXVpcmVkIGZpZWxkczogJHttaXNzaW5nRmllbGRzLmpvaW4oJywgJyl9YCk7XG4gICAgfVxuICAgIGlmICh0eXBlb2Ygb3V0cHV0Lm92ZXJhbGxfc2NvcmUgIT09ICdudW1iZXInIHx8IG91dHB1dC5vdmVyYWxsX3Njb3JlIDwgMCB8fCBvdXRwdXQub3ZlcmFsbF9zY29yZSA+IDEwMCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFNFTyBRQSBvdXRwdXQgaW52YWxpZCBvdmVyYWxsX3Njb3JlOiAke291dHB1dC5vdmVyYWxsX3Njb3JlfSwgbXVzdCBiZSBudW1iZXIgYmV0d2VlbiAwLTEwMGApO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIG91dHB1dC5yZWFkeV9mb3JfZWRpdG9yICE9PSAnYm9vbGVhbicpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTRU8gUUEgb3V0cHV0IGludmFsaWQgcmVhZHlfZm9yX2VkaXRvcjogZXhwZWN0ZWQgYm9vbGVhbicpO1xuICAgIH1cbiAgICBpZiAoIVZBTElEX1JFQ09NTUVOREVEX0FDVElPTlMuaW5jbHVkZXMob3V0cHV0LnJlY29tbWVuZGVkX25leHRfYWN0aW9uKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFNFTyBRQSBvdXRwdXQgaW52YWxpZCByZWNvbW1lbmRlZF9uZXh0X2FjdGlvbjogJHtvdXRwdXQucmVjb21tZW5kZWRfbmV4dF9hY3Rpb259YCk7XG4gICAgfVxuICAgIGlmICghQXJyYXkuaXNBcnJheShvdXRwdXQucHJpb3JpdHlfZml4ZXMpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignU0VPIFFBIG91dHB1dCBpbnZhbGlkIHByaW9yaXR5X2ZpeGVzOiBleHBlY3RlZCBhcnJheScpO1xuICAgIH1cbiAgICBpZiAoIUFycmF5LmlzQXJyYXkob3V0cHV0LnJpc2tfZmxhZ3MpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignU0VPIFFBIG91dHB1dCBpbnZhbGlkIHJpc2tfZmxhZ3M6IGV4cGVjdGVkIGFycmF5Jyk7XG4gICAgfVxuICAgIGlmICh0eXBlb2Ygb3V0cHV0Lm5lZWRzX3JldmlldyAhPT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignU0VPIFFBIG91dHB1dCBpbnZhbGlkIG5lZWRzX3JldmlldzogZXhwZWN0ZWQgYm9vbGVhbicpO1xuICAgIH1cbiAgICB2YWxpZGF0ZVNjb3JlT2JqZWN0KG91dHB1dC5zZWFyY2hfaW50ZW50X2FsaWdubWVudCwgJ3NlYXJjaF9pbnRlbnRfYWxpZ25tZW50Jyk7XG4gICAgdmFsaWRhdGVTY29yZU9iamVjdChvdXRwdXQucHJpbWFyeV9rZXl3b3JkX3VzYWdlLCAncHJpbWFyeV9rZXl3b3JkX3VzYWdlJyk7XG4gICAgdmFsaWRhdGVTY29yZU9iamVjdChvdXRwdXQuc2Vjb25kYXJ5X2tleXdvcmRfdXNhZ2UsICdzZWNvbmRhcnlfa2V5d29yZF91c2FnZScpO1xuICAgIHZhbGlkYXRlU2NvcmVPYmplY3Qob3V0cHV0LmhlYWRpbmdfc3RydWN0dXJlX3JldmlldywgJ2hlYWRpbmdfc3RydWN0dXJlX3JldmlldycpO1xuICAgIHZhbGlkYXRlU2NvcmVPYmplY3Qob3V0cHV0LmNvbnRlbnRfZGVwdGhfcmV2aWV3LCAnY29udGVudF9kZXB0aF9yZXZpZXcnKTtcbiAgICB2YWxpZGF0ZVNjb3JlT2JqZWN0KG91dHB1dC5yZWFkYWJpbGl0eV9yZXZpZXcsICdyZWFkYWJpbGl0eV9yZXZpZXcnKTtcbiAgICB2YWxpZGF0ZVNjb3JlT2JqZWN0KG91dHB1dC5jdGFfcmV2aWV3LCAnY3RhX3JldmlldycpO1xuICAgIHZhbGlkYXRlU2NvcmVPYmplY3Qob3V0cHV0LmludGVybmFsX2xpbmtpbmdfcmV2aWV3LCAnaW50ZXJuYWxfbGlua2luZ19yZXZpZXcnKTtcbiAgICB2YWxpZGF0ZVNjb3JlT2JqZWN0KG91dHB1dC5jbGllbnRfZ29hbF9hbGlnbm1lbnQsICdjbGllbnRfZ29hbF9hbGlnbm1lbnQnKTtcbn1cbmZ1bmN0aW9uIHZhbGlkYXRlU2NvcmVPYmplY3QodmFsdWUsIGZpZWxkTmFtZSkge1xuICAgIGlmICghdmFsdWUgfHwgdHlwZW9mIHZhbHVlICE9PSAnb2JqZWN0Jykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFNFTyBRQSBvdXRwdXQgaW52YWxpZCAke2ZpZWxkTmFtZX06IGV4cGVjdGVkIG9iamVjdGApO1xuICAgIH1cbiAgICBjb25zdCBzY29yZSA9IHZhbHVlLnNjb3JlO1xuICAgIGlmICh0eXBlb2Ygc2NvcmUgIT09ICdudW1iZXInIHx8IHNjb3JlIDwgMCB8fCBzY29yZSA+IDEwMCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFNFTyBRQSBvdXRwdXQgaW52YWxpZCAke2ZpZWxkTmFtZX0uc2NvcmU6ICR7U3RyaW5nKHNjb3JlKX0sIG11c3QgYmUgbnVtYmVyIGJldHdlZW4gMC0xMDBgKTtcbiAgICB9XG59XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9zZW8tcWEtc3RlcC8vcnVuU2VvUWFTdGVwXCIsIHJ1blNlb1FhU3RlcCk7XG4iLCAiaW1wb3J0IHsgcmVnaXN0ZXJTdGVwRnVuY3Rpb24gfSBmcm9tIFwid29ya2Zsb3cvaW50ZXJuYWwvcHJpdmF0ZVwiO1xuaW1wb3J0ICdzZXJ2ZXItb25seSc7XG5pbXBvcnQgeyBnZW5lcmF0ZVRleHQgfSBmcm9tICdhaSc7XG5pbXBvcnQgeyBvcGVuYWkgfSBmcm9tICdAYWktc2RrL29wZW5haSc7XG5pbXBvcnQgeyB1cGRhdGVSdW5EcmFmdCwgdXBkYXRlUnVuU3RhdHVzIH0gZnJvbSAnLi4vLi4vc3RvcmFnZS9ydW5zJztcbmltcG9ydCB7IGdldEFnZW50Q29uZmlnIH0gZnJvbSAnLi4vLi4vc3RvcmFnZS9hZ2VudC1jb25maWdzJztcbmltcG9ydCB7IGJ1aWxkRnVsbElucHV0Q29udGV4dCB9IGZyb20gJy4vY29udGV4dC1idWlsZGVyJztcbi8qKl9faW50ZXJuYWxfd29ya2Zsb3dze1wic3RlcHNcIjp7XCJsaWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3dyaXRlci1zdGVwLnRzXCI6e1wicnVuV3JpdGVyU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3dyaXRlci1zdGVwLy9ydW5Xcml0ZXJTdGVwXCJ9fX19Ki87XG4vKipcbiAqIFdyaXRlciBTdGVwIC0gUGhhc2UgMkMtQ1xuICogUnVucyBpbnNpZGUgYSBkdXJhYmxlIHN0ZXAgZnVuY3Rpb24gKGhhcyBOb2RlLmpzIGFjY2VzcylcbiAqIENhbGxzIEFJIG1vZGVsIHRvIGdlbmVyYXRlIGZpcnN0IGZ1bGwgYmxvZyBkcmFmdCBpbiBNYXJrZG93blxuICogVXNlcyByZXNlYXJjaCBkYXRhIGFuZCBvdXRsaW5lIHRvIHN0cnVjdHVyZSB0aGUgY29udGVudFxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5Xcml0ZXJTdGVwKHJ1bklkLCBpbnB1dCwgcmVzZWFyY2hEYXRhLCBvdXRsaW5lRGF0YSkge1xuICAgIGNvbnNvbGUubG9nKGBbdjBdIFdyaXRlciBzdGVwOiBDcmVhdGluZyBkcmFmdCBmb3IgcnVuICR7cnVuSWR9YCk7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gTG9hZCBhZ2VudCBjb25maWcgZnJvbSBkYXRhYmFzZVxuICAgICAgICBjb25zdCBhZ2VudENvbmZpZyA9IGF3YWl0IGdldEFnZW50Q29uZmlnKCd3cml0ZXInKTtcbiAgICAgICAgaWYgKCFhZ2VudENvbmZpZykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBY3RpdmUgYWdlbnQgY29uZmlnIG5vdCBmb3VuZCBmb3IgYWdlbnRfa2V5OiB3cml0ZXInKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBTRU8gQmxvZyBBZ2VudCBDb25maWcgTG9hZGVkOiB3cml0ZXIgdiR7YWdlbnRDb25maWcudmVyc2lvbn1gKTtcbiAgICAgICAgLy8gQnVpbGQgc3lzdGVtIHByb21wdCBmcm9tIGRhdGFiYXNlIGNvbmZpZ1xuICAgICAgICBjb25zdCBzeXN0ZW1Qcm9tcHQgPSBbXG4gICAgICAgICAgICBhZ2VudENvbmZpZy5zeXN0ZW1fcHJvbXB0LFxuICAgICAgICAgICAgYWdlbnRDb25maWcuc2tpbGxfbWFya2Rvd25cbiAgICAgICAgXS5maWx0ZXIoQm9vbGVhbikuam9pbignXFxuXFxuJyk7XG4gICAgICAgIC8vIENyZWF0ZSBjb250ZXh0IGZyb20gYXZhaWxhYmxlIGRhdGFcbiAgICAgICAgY29uc3QgdG9waWMgPSBpbnB1dC5ibG9nX3RvcGljIHx8IGlucHV0LnRvcGljIHx8ICdZb3VyIFRvcGljJztcbiAgICAgICAgY29uc3QgcHJpbWFyeUtleXdvcmQgPSBpbnB1dC5wcmltYXJ5X2tleXdvcmQgfHwgJ3ByaW1hcnkga2V5d29yZCc7XG4gICAgICAgIGNvbnN0IHNlY29uZGFyeUtleXdvcmRzID0gKGlucHV0LnNlY29uZGFyeV9rZXl3b3JkcyB8fCBpbnB1dC5rZXl3b3JkcyB8fCBbXSkuam9pbignLCAnKSB8fCAnc2Vjb25kYXJ5IGtleXdvcmRzJztcbiAgICAgICAgY29uc3QgYnVzaW5lc3NOYW1lID0gaW5wdXQuYnVzaW5lc3NfbmFtZSB8fCAnWW91ciBCdXNpbmVzcyc7XG4gICAgICAgIGNvbnN0IGF1ZGllbmNlTm90ZXMgPSBpbnB1dC5hdWRpZW5jZV9ub3RlcyB8fCAnVGFyZ2V0IGF1ZGllbmNlIG5vdCBzcGVjaWZpZWQnO1xuICAgICAgICBjb25zdCBicmFuZFZvaWNlID0gaW5wdXQuYnJhbmRfdm9pY2Vfbm90ZXMgfHwgJ1Byb2Zlc3Npb25hbCBhbmQgY2xlYXInO1xuICAgICAgICBjb25zdCBjdGFOb3RlcyA9IGlucHV0LmN0YV9ub3RlcyB8fCAnJztcbiAgICAgICAgY29uc3QgaW50ZXJuYWxMaW5rTm90ZXMgPSBpbnB1dC5pbnRlcm5hbF9saW5rX25vdGVzIHx8ICcnO1xuICAgICAgICBjb25zdCBhZGRpdGlvbmFsTm90ZXMgPSBpbnB1dC5hZGRpdGlvbmFsX29yZGVyX25vdGVzIHx8ICdObyBhZGRpdGlvbmFsIG5vdGVzJztcbiAgICAgICAgY29uc3QgdGFyZ2V0V29yZENvdW50ID0gaW5wdXQudGFyZ2V0X3dvcmRfY291bnQgfHwgMTUwMDtcbiAgICAgICAgLy8gQnVpbGQgcmVzZWFyY2ggY29udGV4dCBpZiBhdmFpbGFibGVcbiAgICAgICAgbGV0IHJlc2VhcmNoQ29udGV4dCA9ICcnO1xuICAgICAgICBpZiAocmVzZWFyY2hEYXRhICYmIHR5cGVvZiByZXNlYXJjaERhdGEgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICBjb25zdCBmaW5kaW5ncyA9IHJlc2VhcmNoRGF0YS5rZXlfZmluZGluZ3MgfHwgW107XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShmaW5kaW5ncykgJiYgZmluZGluZ3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHJlc2VhcmNoQ29udGV4dCA9IGBcXG5cXG5LZXkgUmVzZWFyY2ggRmluZGluZ3M6XFxuJHtmaW5kaW5ncy5tYXAoKGYpPT5gLSAke3R5cGVvZiBmID09PSAnc3RyaW5nJyA/IGYgOiBKU09OLnN0cmluZ2lmeShmKX1gKS5qb2luKCdcXG4nKX1gO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIEJ1aWxkIG91dGxpbmUgY29udGV4dCBpZiBhdmFpbGFibGVcbiAgICAgICAgbGV0IG91dGxpbmVDb250ZXh0ID0gJyc7XG4gICAgICAgIGlmIChvdXRsaW5lRGF0YSkge1xuICAgICAgICAgICAgY29uc3Qgc2VjdGlvbnMgPSAob3V0bGluZURhdGEuc2VjdGlvbnMgfHwgW10pLm1hcCgocyk9PmAjIyAke3R5cGVvZiBzID09PSAnc3RyaW5nJyA/IHMgOiBzLmhlYWRpbmcgfHwgJ1NlY3Rpb24nfVxcbigke3MucHVycG9zZSB8fCAnU2VjdGlvbiBjb250ZW50J30pYCk7XG4gICAgICAgICAgICBpZiAoc2VjdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIG91dGxpbmVDb250ZXh0ID0gYFxcblxcbk91dGxpbmUgU3RydWN0dXJlOlxcbiR7c2VjdGlvbnMuam9pbignXFxuXFxuJyl9YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBCdWlsZCBpbnRlcm5hbCBsaW5rcyBjb250ZXh0XG4gICAgICAgIGxldCBsaW5rc0NvbnRleHQgPSAnJztcbiAgICAgICAgaWYgKGludGVybmFsTGlua05vdGVzKSB7XG4gICAgICAgICAgICBsaW5rc0NvbnRleHQgPSBgXFxuXFxuSW50ZXJuYWwgTGluayBPcHBvcnR1bml0aWVzOlxcbiR7aW50ZXJuYWxMaW5rTm90ZXN9YDtcbiAgICAgICAgfVxuICAgICAgICAvLyBCdWlsZCBDVEEgY29udGV4dFxuICAgICAgICBsZXQgY3RhQ29udGV4dCA9ICcnO1xuICAgICAgICBpZiAoY3RhTm90ZXMpIHtcbiAgICAgICAgICAgIGN0YUNvbnRleHQgPSBgXFxuXFxuQ2FsbC10by1BY3Rpb24gR3VpZGFuY2U6XFxuJHtjdGFOb3Rlc31gO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHVzZXJNZXNzYWdlID0gYFdyaXRlIHRoZSBmaXJzdCBkcmFmdCBibG9nIHBvc3QgdXNpbmcgdGhlIGZ1bGwgQmxvZyBDb250ZXh0IEJyaWVmLCBSZXNlYXJjaCBBZ2VudCBvdXRwdXQsIGFuZCBPdXRsaW5lIEFnZW50IG91dHB1dC5cblxuJHtidWlsZEZ1bGxJbnB1dENvbnRleHQoaW5wdXQpfSR7cmVzZWFyY2hDb250ZXh0fSR7b3V0bGluZUNvbnRleHR9JHtsaW5rc0NvbnRleHR9JHtjdGFDb250ZXh0fVxuXG5Ub3BpYzogJHt0b3BpY31cbkJ1c2luZXNzOiAke2J1c2luZXNzTmFtZX1cblByaW1hcnkgS2V5d29yZDogJHtwcmltYXJ5S2V5d29yZH1cblNlY29uZGFyeSBLZXl3b3JkczogJHtzZWNvbmRhcnlLZXl3b3Jkc31cblRhcmdldCBXb3JkIENvdW50OiAke3RhcmdldFdvcmRDb3VudH1cbkF1ZGllbmNlOiAke2F1ZGllbmNlTm90ZXN9XG5CcmFuZCBWb2ljZTogJHticmFuZFZvaWNlfVxuQWRkaXRpb25hbCBOb3RlczogJHthZGRpdGlvbmFsTm90ZXN9XG5cblJldHVybiBNYXJrZG93biBvbmx5LCBmb2xsb3dpbmcgdGhlIFdyaXRlciBBZ2VudCBpbnN0cnVjdGlvbnMuIERvIG5vdCBpbnZlbnQgdW5zdXBwb3J0ZWQgZmFjdHMsIHNlcnZpY2VzLCBsb2NhdGlvbnMsIG9mZmVycywgY2xhaW1zLCBvciBsaW5rcy5gO1xuICAgICAgICAvLyBHZXQgbW9kZWwgbmFtZTogdXNlIERCIGNvbmZpZyBpZiBhdmFpbGFibGUsIG90aGVyd2lzZSBmYWxsIGJhY2sgdG8gZW52IHZhciBvciBkZWZhdWx0XG4gICAgICAgIGNvbnN0IG1vZGVsTmFtZSA9IGFnZW50Q29uZmlnLm1vZGVsIHx8IHByb2Nlc3MuZW52LldSSVRFUl9BR0VOVF9NT0RFTCB8fCBwcm9jZXNzLmVudi5SRVNFQVJDSF9BR0VOVF9NT0RFTCB8fCAnZ3B0LTUuNC1taW5pJztcbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gV3JpdGVyIHN0ZXA6IFVzaW5nIG1vZGVsOiAke21vZGVsTmFtZX1gKTtcbiAgICAgICAgLy8gQ2FsbCBBSSBtb2RlbCB2aWEgZGlyZWN0IE9wZW5BSSBwcm92aWRlclxuICAgICAgICBjb25zdCBtb2RlbCA9IG9wZW5haShtb2RlbE5hbWUpO1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGdlbmVyYXRlVGV4dCh7XG4gICAgICAgICAgICBtb2RlbCxcbiAgICAgICAgICAgIHN5c3RlbTogc3lzdGVtUHJvbXB0LFxuICAgICAgICAgICAgcHJvbXB0OiB1c2VyTWVzc2FnZSxcbiAgICAgICAgICAgIHRlbXBlcmF0dXJlOiAwLjcsXG4gICAgICAgICAgICBtYXhUb2tlbnM6IDQwMDBcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IGRyYWZ0TWFya2Rvd24gPSByZXNwb25zZS50ZXh0O1xuICAgICAgICAvLyBCYXNpYyB2YWxpZGF0aW9uXG4gICAgICAgIGlmICghZHJhZnRNYXJrZG93biB8fCBkcmFmdE1hcmtkb3duLnRyaW0oKS5sZW5ndGggPCA1MDApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignR2VuZXJhdGVkIGNvbnRlbnQgdG9vIHNob3J0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQ2FsY3VsYXRlIG1ldHJpY3NcbiAgICAgICAgY29uc3Qgd29yZENvdW50ID0gZHJhZnRNYXJrZG93bi5zcGxpdCgvXFxzKy8pLmxlbmd0aDtcbiAgICAgICAgY29uc3Qgc2VjdGlvbnNDb3VudCA9IChkcmFmdE1hcmtkb3duLm1hdGNoKC9eIyNcXHMvZ20pIHx8IFtdKS5sZW5ndGg7XG4gICAgICAgIGNvbnN0IGhhc0N0YSA9IGRyYWZ0TWFya2Rvd24udG9Mb3dlckNhc2UoKS5pbmNsdWRlcygnY2FsbCcpIHx8IGRyYWZ0TWFya2Rvd24udG9Mb3dlckNhc2UoKS5pbmNsdWRlcygnYWN0aW9uJykgfHwgY3RhTm90ZXMubGVuZ3RoID4gMDtcbiAgICAgICAgY29uc3QgaGFzSW50ZXJuYWxMaW5rcyA9IGRyYWZ0TWFya2Rvd24uaW5jbHVkZXMoJ1tsaW5rOicpIHx8IGludGVybmFsTGlua05vdGVzLmxlbmd0aCA+IDA7XG4gICAgICAgIGNvbnN0IHdyaXRlck91dHB1dCA9IHtcbiAgICAgICAgICAgIGRyYWZ0X21hcmtkb3duOiBkcmFmdE1hcmtkb3duLFxuICAgICAgICAgICAgd29yZF9jb3VudDogd29yZENvdW50LFxuICAgICAgICAgICAgc2VjdGlvbnNfd3JpdHRlbjogc2VjdGlvbnNDb3VudCxcbiAgICAgICAgICAgIGhhc19jdGE6IGhhc0N0YSxcbiAgICAgICAgICAgIGhhc19pbnRlcm5hbF9saW5rczogaGFzSW50ZXJuYWxMaW5rcyxcbiAgICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICAgIH07XG4gICAgICAgIC8vIFBlcnNpc3QgZHJhZnRfbWFya2Rvd24gdG8gZGF0YWJhc2UgKG1hcmtkb3duIHN0cmluZyBvbmx5LCBub3QgZnVsbCBvYmplY3QpXG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFdyaXRlciBzdGVwOiBQZXJzaXN0aW5nIGRyYWZ0X21hcmtkb3duICgke3dvcmRDb3VudH0gd29yZHMpIGZvciBydW4gJHtydW5JZH1gKTtcbiAgICAgICAgYXdhaXQgdXBkYXRlUnVuRHJhZnQocnVuSWQsIHdyaXRlck91dHB1dC5kcmFmdF9tYXJrZG93bik7XG4gICAgICAgIC8vIEFsc28gdXBkYXRlIHN0YXR1cyB0byAnd3JpdGluZydcbiAgICAgICAgYXdhaXQgdXBkYXRlUnVuU3RhdHVzKHJ1bklkLCAnd3JpdGluZycpO1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBXcml0ZXIgc3RlcDogQ29tcGxldGUgZm9yIHJ1biAke3J1bklkfSAoJHt3b3JkQ291bnR9IHdvcmRzLCAke3NlY3Rpb25zQ291bnR9IHNlY3Rpb25zKWApO1xuICAgICAgICByZXR1cm4gd3JpdGVyT3V0cHV0O1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTXNnID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvciBpbiB3cml0ZXIgc3RlcCc7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2MF0gV3JpdGVyIHN0ZXAgZXJyb3IgZm9yIHJ1biAke3J1bklkfTogJHtlcnJvck1zZ31gKTtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBXcml0ZXIgc3RlcCBmYWlsZWQ6ICR7ZXJyb3JNc2d9YCk7XG4gICAgfVxufVxucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvd3JpdGVyLXN0ZXAvL3J1bldyaXRlclN0ZXBcIiwgcnVuV3JpdGVyU3RlcCk7XG4iLCAiXG4gICAgLy8gQnVpbHQgaW4gc3RlcHNcbiAgICBpbXBvcnQgJ3dvcmtmbG93L2ludGVybmFsL2J1aWx0aW5zJztcbiAgICAvLyBVc2VyIHN0ZXBzXG4gICAgaW1wb3J0ICcuL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvY2FsbGJhY2stc3RlcC50cyc7XG5pbXBvcnQgJy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9lZGl0b3Itc3RlcC50cyc7XG5pbXBvcnQgJy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9oZWxwZXJzLnRzJztcbmltcG9ydCAnLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL21ldGEtc3RlcC50cyc7XG5pbXBvcnQgJy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9vdXRsaW5lLXN0ZXAudHMnO1xuaW1wb3J0ICcuL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvcmVzZWFyY2gtc3RlcC50cyc7XG5pbXBvcnQgJy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9zZW8tcWEtc3RlcC50cyc7XG5pbXBvcnQgJy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy93cml0ZXItc3RlcC50cyc7XG4gICAgLy8gU2VyZGUgZmlsZXMgZm9yIGNyb3NzLWNvbnRleHQgY2xhc3MgcmVnaXN0cmF0aW9uXG4gICAgXG4gICAgLy8gQVBJIGVudHJ5cG9pbnRcbiAgICBleHBvcnQgeyBzdGVwRW50cnlwb2ludCBhcyBIRUFELCBzdGVwRW50cnlwb2ludCBhcyBQT1NUIH0gZnJvbSAnd29ya2Zsb3cvcnVudGltZSc7Il0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7OztBQUFBLFNBQUEsNEJBQUE7QUFTRSxlQUFXLGtDQUFBO0FBQ1gsU0FBTyxLQUFLLFlBQVc7QUFDekI7QUFGYTtBQUliLGVBQXNCLDBCQUF1QjtBQUMzQyxTQUFBLEtBQVcsS0FBQTs7QUFEUztBQUd0QixlQUFDLDBCQUFBO0FBRUQsU0FBTyxLQUFLLEtBQUE7O0FBRlg7cUJBSWlCLG1DQUFHLCtCQUFBO0FBQ3JCLHFCQUFDLDJCQUFBLHVCQUFBOzs7O0FDckJELFNBQVMsd0JBQUFBLDZCQUE0QjtBQUVyQyxTQUFTLFFBQVEsNkJBQTZCO0FBTTFDLGVBQXNCLGlCQUFpQixPQUFPO0FBQzlDLE1BQUk7QUFFQSxVQUFNLE1BQU0sTUFBTSxPQUFPLEtBQUs7QUFDOUIsUUFBSSxDQUFDLEtBQUs7QUFDTixjQUFRLEtBQUssc0JBQXNCLEtBQUssWUFBWTtBQUNwRDtBQUFBLElBQ0o7QUFDQSxRQUFJLENBQUMsSUFBSSxjQUFjO0FBQ25CLGNBQVEsSUFBSSwwQ0FBMEMsS0FBSyxFQUFFO0FBRTdELFlBQU0sc0JBQXNCLE9BQU8sZ0JBQWdCO0FBQ25EO0FBQUEsSUFDSjtBQUNBLFlBQVEsSUFBSSwwQ0FBMEMsSUFBSSxZQUFZLEVBQUU7QUFFeEUsVUFBTSxrQkFBa0IscUJBQXFCLEdBQUc7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QUNULG9CQUFvQjtBQUFBLE1BQ3BCLFlBQVcsb0JBQUksS0FBSyxHQUFFLFlBQVk7QUFBQSxJQUN0QztBQUVBLFlBQVEsSUFBSSxnREFBZ0QsU0FBUyxtQkFBbUIsS0FBSyxFQUFFO0FBQy9GLFVBQU0sZUFBZSxPQUFPLGFBQWEsY0FBYztBQUV2RCxVQUFNQyxpQkFBZ0IsT0FBTyxTQUFTO0FBQ3RDLFlBQVEsSUFBSSxzQ0FBc0MsS0FBSyxLQUFLLFNBQVMsV0FBVyxhQUFhLFlBQVk7QUFDekcsV0FBTztBQUFBLEVBQ1gsU0FBUyxPQUFPO0FBQ1osVUFBTSxXQUFXLGlCQUFpQixRQUFRLE1BQU0sVUFBVTtBQUMxRCxZQUFRLE1BQU0sa0NBQWtDLEtBQUssS0FBSyxRQUFRLEVBQUU7QUFDcEUsVUFBTSxJQUFJLE1BQU0sdUJBQXVCLFFBQVEsRUFBRTtBQUFBLEVBQ3JEO0FBQ0o7QUEzRzBCO0FBNEcxQkMsc0JBQXFCLHlFQUF5RSxhQUFhOzs7QUMxR3ZHLFNBQTJCLGdCQUF3QixrQkFBbEJDLHVCQUE4QjsiLAogICJuYW1lcyI6IFsicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAiZ2VuZXJhdGVUZXh0IiwgIm9wZW5haSIsICJnZXRBZ2VudENvbmZpZyIsICJidWlsZEZ1bGxJbnB1dENvbnRleHQiLCAiZ2V0QWdlbnRDb25maWciLCAiZ2VuZXJhdGVUZXh0IiwgIm9wZW5haSIsICJidWlsZEZ1bGxJbnB1dENvbnRleHQiLCAicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAiZ2VuZXJhdGVUZXh0IiwgIm9wZW5haSIsICJ1cGRhdGVSdW5TdGF0dXMiLCAiZ2V0QWdlbnRDb25maWciLCAiYnVpbGRGdWxsSW5wdXRDb250ZXh0IiwgImV4dHJhY3RKc29uT2JqZWN0IiwgImdldEFnZW50Q29uZmlnIiwgImJ1aWxkRnVsbElucHV0Q29udGV4dCIsICJvcGVuYWkiLCAiZ2VuZXJhdGVUZXh0IiwgImV4dHJhY3RKc29uT2JqZWN0IiwgInVwZGF0ZVJ1blN0YXR1cyIsICJyZWdpc3RlclN0ZXBGdW5jdGlvbiIsICJyZWdpc3RlclN0ZXBGdW5jdGlvbiIsICJnZW5lcmF0ZVRleHQiLCAib3BlbmFpIiwgInVwZGF0ZVJ1blN0YXR1cyIsICJnZXRBZ2VudENvbmZpZyIsICJidWlsZEZ1bGxJbnB1dENvbnRleHQiLCAiZXh0cmFjdEpzb25PYmplY3QiLCAiZ2V0QWdlbnRDb25maWciLCAiYnVpbGRGdWxsSW5wdXRDb250ZXh0IiwgIm9wZW5haSIsICJnZW5lcmF0ZVRleHQiLCAiZXh0cmFjdEpzb25PYmplY3QiLCAidXBkYXRlUnVuU3RhdHVzIiwgInJlZ2lzdGVyU3RlcEZ1bmN0aW9uIiwgInJlZ2lzdGVyU3RlcEZ1bmN0aW9uIiwgImdlbmVyYXRlVGV4dCIsICJvcGVuYWkiLCAidXBkYXRlUnVuU3RhdHVzIiwgImdldEFnZW50Q29uZmlnIiwgImJ1aWxkRnVsbElucHV0Q29udGV4dCIsICJleHRyYWN0SnNvbk9iamVjdCIsICJnZXRBZ2VudENvbmZpZyIsICJidWlsZEZ1bGxJbnB1dENvbnRleHQiLCAiZ2VuZXJhdGVUZXh0IiwgIm9wZW5haSIsICJleHRyYWN0SnNvbk9iamVjdCIsICJ1cGRhdGVSdW5TdGF0dXMiLCAicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAiZ2VuZXJhdGVUZXh0IiwgIm9wZW5haSIsICJ1cGRhdGVSdW5TdGF0dXMiLCAiZ2V0QWdlbnRDb25maWciLCAiYnVpbGRGdWxsSW5wdXRDb250ZXh0IiwgImdldEFnZW50Q29uZmlnIiwgImJ1aWxkRnVsbElucHV0Q29udGV4dCIsICJvcGVuYWkiLCAiZ2VuZXJhdGVUZXh0IiwgInVwZGF0ZVJ1blN0YXR1cyIsICJyZWdpc3RlclN0ZXBGdW5jdGlvbiIsICJzdGVwRW50cnlwb2ludCJdCn0K

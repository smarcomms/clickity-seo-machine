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
      maxOutputTokens: 8e3,
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

// lib/seo-blog-engine/workflow/steps/revision-step.ts
import { registerStepFunction as registerStepFunction8 } from "workflow/internal/private";
import { generateText as generateText5 } from "ai";
import { openai as openai5 } from "@ai-sdk/openai";
import { getAgentConfig as getAgentConfig5 } from "../../../../../lib/seo-blog-engine/storage/agent-configs.ts";
import { buildFullInputContext as buildFullInputContext5 } from "../../../../../lib/seo-blog-engine/workflow/steps/context-builder.ts";
async function runRevisionStep(currentDraft, reviewerFeedback, revisionMode, input, research, outline, seoQa, meta) {
  console.log(`[v0] Revision step: Starting with mode: ${revisionMode}`);
  try {
    const agentConfig = await getAgentConfig5("revision");
    if (!agentConfig) {
      throw new Error("Active agent config not found for agent_key: revision");
    }
    console.log(`[v0] SEO Blog Agent Config Loaded: revision v${agentConfig.version}`);
    const systemPrompt = [
      agentConfig.system_prompt,
      agentConfig.skill_markdown
    ].filter(Boolean).join("\n\n");
    const revisionInstruction = revisionMode === "heavy_revision" ? "Apply comprehensive changes. Restructure sections if needed. Rewrite paragraphs for clarity and SEO. Be thorough." : "Apply focused changes. Polish existing structure. Refine wording and clarity. Keep sections intact.";
    let contextBlock = "";
    if (input) {
      contextBlock = `

${buildFullInputContext5(input)}`;
    }
    let additionalContext = [];
    if (research) {
      const findings = research.key_findings || [];
      if (Array.isArray(findings) && findings.length > 0) {
        additionalContext.push(`

Previous Research Findings:
${findings.map((f) => `- ${typeof f === "string" ? f : JSON.stringify(f)}`).join("\n")}`);
      }
    }
    if (outline) {
      const sections = (outline.sections || []).map((s) => `## ${typeof s === "string" ? s : s.heading || "Section"}`);
      if (sections.length > 0) {
        additionalContext.push(`

Original Outline Structure:
${sections.join("\n")}`);
      }
    }
    if (seoQa) {
      const seoQaObj = seoQa;
      additionalContext.push(`

SEO QA Results:
Overall Score: ${seoQaObj.overall_score || "N/A"}/100`);
      if (seoQaObj.priority_fixes && Array.isArray(seoQaObj.priority_fixes)) {
        additionalContext.push(`Priority Fixes: ${seoQaObj.priority_fixes.join("; ")}`);
      }
    }
    if (meta) {
      const metaObj = meta;
      additionalContext.push(`

Meta Information:
Meta Title: ${metaObj.meta_title || "N/A"}
Meta Description: ${metaObj.meta_description || "N/A"}`);
    }
    const userMessage = `Revise the blog draft below using the reviewer feedback provided.

Revision Mode: ${revisionMode}
${revisionInstruction}

Reviewer Feedback:
${reviewerFeedback}${contextBlock}${additionalContext.join("")}

Current Draft Markdown:
${currentDraft}

Return the revised blog in Markdown only. Do not return JSON. Do not include explanations, revision notes, markdown fences, or comments outside the article.`;
    const modelName = agentConfig.model || process.env.REVISION_AGENT_MODEL || process.env.EDITOR_AGENT_MODEL || "gpt-5.4-mini";
    console.log(`[v0] Revision step: Using model: ${modelName}`);
    const model = openai5(modelName);
    const response = await generateText5({
      model,
      system: systemPrompt,
      prompt: userMessage,
      temperature: 0.7,
      maxOutputTokens: 8e3
    });
    const revisedMarkdown = response.text.trim();
    if (!revisedMarkdown || revisedMarkdown.length === 0) {
      throw new Error("Revision Agent returned empty output");
    }
    if (revisedMarkdown.startsWith("{")) {
      throw new Error("Revision output invalid: expected Markdown, received JSON-like response");
    }
    if (revisedMarkdown.length < Math.min(500, Math.floor(currentDraft.length * 0.4))) {
      throw new Error("Revision output too short compared with original draft");
    }
    const revisionOutput = {
      revised_markdown: revisedMarkdown,
      revision_mode: revisionMode,
      feedback_applied: reviewerFeedback.substring(0, 200),
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    console.log(`[v0] Revision step: Complete (${revisedMarkdown.length} chars)`);
    return revisionOutput;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[v0] Revision step error: ${errorMessage}`);
    throw error;
  }
}
__name(runRevisionStep, "runRevisionStep");
registerStepFunction8("step//./lib/seo-blog-engine/workflow/steps/revision-step//runRevisionStep", runRevisionStep);

// lib/seo-blog-engine/workflow/steps/seo-qa-step.ts
import { registerStepFunction as registerStepFunction9 } from "workflow/internal/private";
import { generateText as generateText6 } from "ai";
import { openai as openai6 } from "@ai-sdk/openai";
import { updateRunStatus as updateRunStatus4 } from "../../../../../lib/seo-blog-engine/storage/runs.ts";
import { getAgentConfig as getAgentConfig6 } from "../../../../../lib/seo-blog-engine/storage/agent-configs.ts";
import { buildFullInputContext as buildFullInputContext6, extractJsonObject as extractJsonObject4 } from "../../../../../lib/seo-blog-engine/workflow/steps/context-builder.ts";
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
    const agentConfig = await getAgentConfig6("seo_qa");
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

${buildFullInputContext6(input)}

Research Agent Output:
${JSON.stringify(researchData ?? {}, null, 2)}

Outline Agent Output:
${JSON.stringify(outlineData ?? {}, null, 2)}

Blog Draft Markdown:
${draftMarkdown}

Return valid JSON only. Do not rewrite the draft. Do not include markdown fences or explanation text. The recommended_next_action must be exactly one of: ${VALID_RECOMMENDED_ACTIONS.map((value) => `"${value}"`).join(", ")}.`;
    const { text } = await generateText6({
      model: openai6(modelName),
      system: systemPrompt,
      prompt: seoQaPrompt,
      temperature: 0.4,
      maxOutputTokens: 3e3
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
registerStepFunction9("step//./lib/seo-blog-engine/workflow/steps/seo-qa-step//runSeoQaStep", runSeoQaStep);

// lib/seo-blog-engine/workflow/steps/writer-step.ts
import { registerStepFunction as registerStepFunction10 } from "workflow/internal/private";
import { generateText as generateText7 } from "ai";
import { openai as openai7 } from "@ai-sdk/openai";
import { updateRunDraft, updateRunStatus as updateRunStatus5 } from "../../../../../lib/seo-blog-engine/storage/runs.ts";
import { getAgentConfig as getAgentConfig7 } from "../../../../../lib/seo-blog-engine/storage/agent-configs.ts";
import { buildFullInputContext as buildFullInputContext7 } from "../../../../../lib/seo-blog-engine/workflow/steps/context-builder.ts";
async function runWriterStep(runId, input, researchData, outlineData) {
  console.log(`[v0] Writer step: Creating draft for run ${runId}`);
  try {
    const agentConfig = await getAgentConfig7("writer");
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

${buildFullInputContext7(input)}${researchContext}${outlineContext}${linksContext}${ctaContext}

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
    const model = openai7(modelName);
    const response = await generateText7({
      model,
      system: systemPrompt,
      prompt: userMessage,
      temperature: 0.7,
      maxOutputTokens: 4e3
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
registerStepFunction10("step//./lib/seo-blog-engine/workflow/steps/writer-step//runWriterStep", runWriterStep);

// virtual-entry.js
import { stepEntrypoint, stepEntrypoint as stepEntrypoint2 } from "workflow/runtime";
export {
  stepEntrypoint as HEAD,
  stepEntrypoint2 as POST
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3dvcmtmbG93QDQuNS4wX0BuZXN0anMrY29tbW9uQDExLjEuMjdfcmVmbGVjdC1tZXRhZGF0YUAwLjIuMl9yeGpzQDcuOC4yX19AbmVzdGpzK2NvcmVAMV9hOWMxYWE2YzBiNTgwZTliZjNiZmY2NGMzMjY5ZmU0My9ub2RlX21vZHVsZXMvd29ya2Zsb3cvc3JjL2ludGVybmFsL2J1aWx0aW5zLnRzIiwgIi4uLy4uLy4uLy4uLy4uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvY2FsbGJhY2stc3RlcC50cyIsICIuLi8uLi8uLi8uLi8uLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL2VkaXRvci1zdGVwLnRzIiwgIi4uLy4uLy4uLy4uLy4uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvaGVscGVycy50cyIsICIuLi8uLi8uLi8uLi8uLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL21ldGEtc3RlcC50cyIsICIuLi8uLi8uLi8uLi8uLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL291dGxpbmUtc3RlcC50cyIsICIuLi8uLi8uLi8uLi8uLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3Jlc2VhcmNoLXN0ZXAudHMiLCAiLi4vLi4vLi4vLi4vLi4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9yZXZpc2lvbi1zdGVwLnRzIiwgIi4uLy4uLy4uLy4uLy4uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvc2VvLXFhLXN0ZXAudHMiLCAiLi4vLi4vLi4vLi4vLi4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy93cml0ZXItc3RlcC50cyIsICIuLi8uLi8uLi8uLi8uLi92aXJ0dWFsLWVudHJ5LmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKipcbiAqIFRoZXNlIGFyZSB0aGUgYnVpbHQtaW4gc3RlcHMgdGhhdCBhcmUgXCJhdXRvbWF0aWNhbGx5IGF2YWlsYWJsZVwiIGluIHRoZSB3b3JrZmxvdyBzY29wZS4gVGhleSBhcmVcbiAqIHNpbWlsYXIgdG8gXCJzdGRsaWJcIiBleGNlcHQgdGhhdCBhcmUgbm90IG1lYW50IHRvIGJlIGltcG9ydGVkIGJ5IHVzZXJzLCBidXQgYXJlIGluc3RlYWQgXCJqdXN0IGF2YWlsYWJsZVwiXG4gKiBhbG9uZ3NpZGUgdXNlciBkZWZpbmVkIHN0ZXBzLiBUaGV5IGFyZSB1c2VkIGludGVybmFsbHkgYnkgdGhlIHJ1bnRpbWVcbiAqL1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gX19idWlsdGluX3Jlc3BvbnNlX2FycmF5X2J1ZmZlcihcbiAgdGhpczogUmVxdWVzdCB8IFJlc3BvbnNlXG4pIHtcbiAgJ3VzZSBzdGVwJztcbiAgcmV0dXJuIHRoaXMuYXJyYXlCdWZmZXIoKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIF9fYnVpbHRpbl9yZXNwb25zZV9qc29uKHRoaXM6IFJlcXVlc3QgfCBSZXNwb25zZSkge1xuICAndXNlIHN0ZXAnO1xuICByZXR1cm4gdGhpcy5qc29uKCk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBfX2J1aWx0aW5fcmVzcG9uc2VfdGV4dCh0aGlzOiBSZXF1ZXN0IHwgUmVzcG9uc2UpIHtcbiAgJ3VzZSBzdGVwJztcbiAgcmV0dXJuIHRoaXMudGV4dCgpO1xufVxuIiwgImltcG9ydCB7IHJlZ2lzdGVyU3RlcEZ1bmN0aW9uIH0gZnJvbSBcIndvcmtmbG93L2ludGVybmFsL3ByaXZhdGVcIjtcbmltcG9ydCAnc2VydmVyLW9ubHknO1xuaW1wb3J0IHsgZ2V0UnVuLCByZWNvcmRDYWxsYmFja0F0dGVtcHQgfSBmcm9tICcuLi8uLi9zdG9yYWdlL3J1bnMnO1xuLyoqX19pbnRlcm5hbF93b3JrZmxvd3N7XCJzdGVwc1wiOntcImxpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvY2FsbGJhY2stc3RlcC50c1wiOntcInNlbmRDYWxsYmFja1N0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9jYWxsYmFjay1zdGVwLy9zZW5kQ2FsbGJhY2tTdGVwXCJ9fX19Ki87XG4vKipcbiAqIFNlbmQgY2FsbGJhY2sgbm90aWZpY2F0aW9uIHRvIHdlYmhvb2sgVVJMXG4gKiBSdW5zIGFzIGEgZHVyYWJsZSBzdGVwIHRvIGVuc3VyZSBjYWxsYmFjayBkZWxpdmVyeSBpcyB0cmFja2VkXG4gKiBGYWlsdXJlcyBkbyBub3QgYnJlYWsgdGhlIG1haW4gd29ya2Zsb3dcbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gc2VuZENhbGxiYWNrU3RlcChydW5JZCkge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIEZldGNoIHJ1biB0byBnZXQgY2FsbGJhY2sgVVJMIGFuZCBmaW5hbCBzdGF0ZVxuICAgICAgICBjb25zdCBydW4gPSBhd2FpdCBnZXRSdW4ocnVuSWQpO1xuICAgICAgICBpZiAoIXJ1bikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBbdjBdIENhbGxiYWNrOiBSdW4gJHtydW5JZH0gbm90IGZvdW5kYCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFydW4uY2FsbGJhY2tfdXJsKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBDYWxsYmFjazogTm8gY2FsbGJhY2sgVVJMIGZvciBydW4gJHtydW5JZH1gKTtcbiAgICAgICAgICAgIC8vIFJlY29yZCB0aGF0IGNhbGxiYWNrIHdhcyBub3QgY29uZmlndXJlZFxuICAgICAgICAgICAgYXdhaXQgcmVjb3JkQ2FsbGJhY2tBdHRlbXB0KHJ1bklkLCAnbm90X2NvbmZpZ3VyZWQnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBDYWxsYmFjazogU2VuZGluZyBub3RpZmljYXRpb24gdG8gJHtydW4uY2FsbGJhY2tfdXJsfWApO1xuICAgICAgICAvLyBCdWlsZCBjYWxsYmFjayBwYXlsb2FkXG4gICAgICAgIGNvbnN0IGNhbGxiYWNrUGF5bG9hZCA9IGJ1aWxkQ2FsbGJhY2tQYXlsb2FkKHJ1bik7XG4gICAgICAgIC8vIFNlbmQgY2FsbGJhY2sgd2l0aCB0aW1lb3V0IHByb3RlY3Rpb25cbiAgICAgICAgY29uc3QgY29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICAgICAgY29uc3QgdGltZW91dElkID0gc2V0VGltZW91dCgoKT0+Y29udHJvbGxlci5hYm9ydCgpLCAzMDAwMCk7IC8vIDMwIHNlY29uZCB0aW1lb3V0XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHJ1bi5jYWxsYmFja191cmwsIHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbidcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGNhbGxiYWNrUGF5bG9hZCksXG4gICAgICAgICAgICAgICAgc2lnbmFsOiBjb250cm9sbGVyLnNpZ25hbFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcbiAgICAgICAgICAgIGlmIChyZXNwb25zZS5vaykge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIENhbGxiYWNrOiBTdWNjZXNzZnVsbHkgc2VudCBmb3IgcnVuICR7cnVuSWR9LCBzdGF0dXMgJHtyZXNwb25zZS5zdGF0dXN9YCk7XG4gICAgICAgICAgICAgICAgLy8gUmVjb3JkIHN1Y2Nlc3NmdWwgY2FsbGJhY2tcbiAgICAgICAgICAgICAgICBhd2FpdCByZWNvcmRDYWxsYmFja0F0dGVtcHQocnVuSWQsICdzdWNjZXNzJywgcmVzcG9uc2Uuc3RhdHVzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3RhdHVzVGV4dCA9IHJlc3BvbnNlLnN0YXR1c1RleHQgfHwgYEhUVFAgJHtyZXNwb25zZS5zdGF0dXN9YDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFt2MF0gQ2FsbGJhY2s6IFdlYmhvb2sgcmV0dXJuZWQgJHtyZXNwb25zZS5zdGF0dXN9IGZvciBydW4gJHtydW5JZH1gKTtcbiAgICAgICAgICAgICAgICAvLyBSZWNvcmQgZmFpbGVkIGNhbGxiYWNrIHdpdGggSFRUUCBzdGF0dXNcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1zZyA9IGBXZWJob29rIHJldHVybmVkICR7cmVzcG9uc2Uuc3RhdHVzfTogJHtzdGF0dXNUZXh0fWA7XG4gICAgICAgICAgICAgICAgYXdhaXQgcmVjb3JkQ2FsbGJhY2tBdHRlbXB0KHJ1bklkLCAnZmFpbGVkJywgcmVzcG9uc2Uuc3RhdHVzLCBlcnJvck1zZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGZldGNoRXJyb3IpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICAgICAgICAgICAgbGV0IGVycm9yTWVzc2FnZSA9ICdVbmtub3duIG5ldHdvcmsgZXJyb3InO1xuICAgICAgICAgICAgaWYgKGZldGNoRXJyb3IgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICAgICAgICAgIGlmIChmZXRjaEVycm9yLm5hbWUgPT09ICdBYm9ydEVycm9yJykge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2UgPSAnUmVxdWVzdCB0aW1lb3V0ICgzMHMpJztcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBbdjBdIENhbGxiYWNrOiBSZXF1ZXN0IHRpbWVvdXQgKDMwcykgZm9yIHJ1biAke3J1bklkfWApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZSA9IGBOZXR3b3JrIGVycm9yOiAke2ZldGNoRXJyb3IubWVzc2FnZX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFt2MF0gQ2FsbGJhY2s6ICR7ZXJyb3JNZXNzYWdlfSBmb3IgcnVuICR7cnVuSWR9YCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFt2MF0gQ2FsbGJhY2s6IFVua25vd24gZXJyb3IgZm9yIHJ1biAke3J1bklkfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gUmVjb3JkIGZhaWxlZCBjYWxsYmFjayB3aXRoIGVycm9yIG1lc3NhZ2UgKG5vIEhUVFAgc3RhdHVzIGZvciBuZXR3b3JrIGVycm9ycylcbiAgICAgICAgICAgIGF3YWl0IHJlY29yZENhbGxiYWNrQXR0ZW1wdChydW5JZCwgJ2ZhaWxlZCcsIHVuZGVmaW5lZCwgZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgLy8gRG9uJ3QgdGhyb3cgLSBjYWxsYmFjayBmYWlsdXJlIHNob3VsZCBub3QgZmFpbCB0aGUgd29ya2Zsb3dcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIC8vIExvZyBlcnJvciBzYWZlbHkgd2l0aG91dCBleHBvc2luZyBzZWNyZXRzXG4gICAgICAgIGNvbnN0IGVycm9yTXNnID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICBjb25zb2xlLmVycm9yKGBbdjBdIENhbGxiYWNrOiBVbmV4cGVjdGVkIGVycm9yIGZvciBydW4gJHtydW5JZH06ICR7ZXJyb3JNc2d9YCk7XG4gICAgLy8gRG9uJ3QgdGhyb3cgLSBjYWxsYmFjayBmYWlsdXJlIHNob3VsZCBub3QgZmFpbCB0aGUgd29ya2Zsb3dcbiAgICB9XG59XG4vKipcbiAqIEJ1aWxkIGNhbGxiYWNrIHBheWxvYWQgYmFzZWQgb24gcnVuIHN0YXR1c1xuICovIGZ1bmN0aW9uIGJ1aWxkQ2FsbGJhY2tQYXlsb2FkKHJ1bikge1xuICAgIGNvbnN0IGlzQ29tcGxldGVkID0gcnVuLnN0YXR1cyA9PT0gJ2NvbXBsZXRlZCc7XG4gICAgY29uc3QgaXNGYWlsZWQgPSBydW4uc3RhdHVzID09PSAnZmFpbGVkJztcbiAgICBpZiAoaXNDb21wbGV0ZWQpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJ1bl9pZDogcnVuLmlkLFxuICAgICAgICAgICAgc3RhdHVzOiAnY29tcGxldGVkJyxcbiAgICAgICAgICAgIGJ1c2luZXNzX25hbWU6IHJ1bi5pbnB1dF9qc29uPy5idXNpbmVzc19uYW1lIHx8IG51bGwsXG4gICAgICAgICAgICBibG9nX3RvcGljOiBydW4uaW5wdXRfanNvbj8uYmxvZ190b3BpYyB8fCBydW4uaW5wdXRfanNvbj8udG9waWMgfHwgbnVsbCxcbiAgICAgICAgICAgIHJldmlld19yZWFkeTogdHJ1ZSxcbiAgICAgICAgICAgIGh1bWFuX3Jldmlld19yZXF1aXJlZDogdHJ1ZSxcbiAgICAgICAgICAgIG91dHB1dHM6IHtcbiAgICAgICAgICAgICAgICBoYXNfcmVzZWFyY2hfanNvbjogISFydW4ucmVzZWFyY2hfanNvbixcbiAgICAgICAgICAgICAgICBoYXNfb3V0bGluZV9qc29uOiAhIXJ1bi5vdXRsaW5lX2pzb24sXG4gICAgICAgICAgICAgICAgaGFzX2RyYWZ0X21hcmtkb3duOiAhIXJ1bi5kcmFmdF9tYXJrZG93bixcbiAgICAgICAgICAgICAgICBoYXNfb3B0aW1pemVkX2pzb246ICEhcnVuLm9wdGltaXplZF9qc29uLFxuICAgICAgICAgICAgICAgIGhhc19maW5hbF9vdXRwdXRfanNvbjogISFydW4uZmluYWxfb3V0cHV0X2pzb25cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmaW5hbF9vdXRwdXRfanNvbjogcnVuLmZpbmFsX291dHB1dF9qc29uXG4gICAgICAgIH07XG4gICAgfSBlbHNlIGlmIChpc0ZhaWxlZCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcnVuX2lkOiBydW4uaWQsXG4gICAgICAgICAgICBzdGF0dXM6ICdmYWlsZWQnLFxuICAgICAgICAgICAgYnVzaW5lc3NfbmFtZTogcnVuLmlucHV0X2pzb24/LmJ1c2luZXNzX25hbWUgfHwgbnVsbCxcbiAgICAgICAgICAgIGJsb2dfdG9waWM6IHJ1bi5pbnB1dF9qc29uPy5ibG9nX3RvcGljIHx8IHJ1bi5pbnB1dF9qc29uPy50b3BpYyB8fCBudWxsLFxuICAgICAgICAgICAgcmV2aWV3X3JlYWR5OiBmYWxzZSxcbiAgICAgICAgICAgIGh1bWFuX3Jldmlld19yZXF1aXJlZDogdHJ1ZSxcbiAgICAgICAgICAgIGVycm9yX21lc3NhZ2U6IHJ1bi5lcnJvcl9tZXNzYWdlIHx8ICdVbmtub3duIGVycm9yJ1xuICAgICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFNob3VsZG4ndCBoYXBwZW4sIGJ1dCBoYW5kbGUgZ3JhY2VmdWxseVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcnVuX2lkOiBydW4uaWQsXG4gICAgICAgICAgICBzdGF0dXM6IHJ1bi5zdGF0dXMsXG4gICAgICAgICAgICBidXNpbmVzc19uYW1lOiBydW4uaW5wdXRfanNvbj8uYnVzaW5lc3NfbmFtZSB8fCBudWxsLFxuICAgICAgICAgICAgYmxvZ190b3BpYzogcnVuLmlucHV0X2pzb24/LmJsb2dfdG9waWMgfHwgcnVuLmlucHV0X2pzb24/LnRvcGljIHx8IG51bGxcbiAgICAgICAgfTtcbiAgICB9XG59XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9jYWxsYmFjay1zdGVwLy9zZW5kQ2FsbGJhY2tTdGVwXCIsIHNlbmRDYWxsYmFja1N0ZXApO1xuIiwgImltcG9ydCB7IHJlZ2lzdGVyU3RlcEZ1bmN0aW9uIH0gZnJvbSBcIndvcmtmbG93L2ludGVybmFsL3ByaXZhdGVcIjtcbmltcG9ydCAnc2VydmVyLW9ubHknO1xuaW1wb3J0IHsgZ2VuZXJhdGVUZXh0IH0gZnJvbSAnYWknO1xuaW1wb3J0IHsgb3BlbmFpIH0gZnJvbSAnQGFpLXNkay9vcGVuYWknO1xuaW1wb3J0IHsgZ2V0QWdlbnRDb25maWcgfSBmcm9tICcuLi8uLi9zdG9yYWdlL2FnZW50LWNvbmZpZ3MnO1xuaW1wb3J0IHsgYnVpbGRGdWxsSW5wdXRDb250ZXh0IH0gZnJvbSAnLi9jb250ZXh0LWJ1aWxkZXInO1xuLyoqX19pbnRlcm5hbF93b3JrZmxvd3N7XCJzdGVwc1wiOntcImxpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvZWRpdG9yLXN0ZXAudHNcIjp7XCJydW5FZGl0b3JTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvZWRpdG9yLXN0ZXAvL3J1bkVkaXRvclN0ZXBcIn19fX0qLztcbi8qKlxuICogRWRpdG9yIEFnZW50IFN0ZXBcbiAqIEltcHJvdmVzIHRoZSBkcmFmdCBiYXNlZCBvbiBTRU8gUUEgcmVjb21tZW5kYXRpb25zIGFuZCBicmFuZCBndWlkZWxpbmVzLlxuICogREIgcHJvbXB0IGNvbnRyYWN0OiBtb2RlbCByZXR1cm5zIE1hcmtkb3duIG9ubHkuXG4gKiBEb2VzIE5PVCBvdmVyd3JpdGUgb3JpZ2luYWwgZHJhZnRfbWFya2Rvd247IGVkaXRlZCBvdXRwdXQgZ29lcyB0byBmaW5hbF9vdXRwdXRfanNvbi5cbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gcnVuRWRpdG9yU3RlcChydW5JZCwgaW5wdXQsIHJlc2VhcmNoLCBvdXRsaW5lLCBvcmlnaW5hbERyYWZ0LCBzZW9RYSkge1xuICAgIGNvbnNvbGUubG9nKGBbdjBdIEVkaXRvciBzdGVwOiBTdGFydGluZyBmb3IgcnVuICR7cnVuSWR9YCk7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgYWdlbnRDb25maWcgPSBhd2FpdCBnZXRBZ2VudENvbmZpZygnZWRpdG9yJyk7XG4gICAgICAgIGlmICghYWdlbnRDb25maWcpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQWN0aXZlIGFnZW50IGNvbmZpZyBub3QgZm91bmQgZm9yIGFnZW50X2tleTogZWRpdG9yJyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gU0VPIEJsb2cgQWdlbnQgQ29uZmlnIExvYWRlZDogZWRpdG9yIHYke2FnZW50Q29uZmlnLnZlcnNpb259YCk7XG4gICAgICAgIGNvbnN0IHN5c3RlbVByb21wdCA9IFtcbiAgICAgICAgICAgIGFnZW50Q29uZmlnLnN5c3RlbV9wcm9tcHQsXG4gICAgICAgICAgICBhZ2VudENvbmZpZy5za2lsbF9tYXJrZG93blxuICAgICAgICBdLmZpbHRlcihCb29sZWFuKS5qb2luKCdcXG5cXG4nKTtcbiAgICAgICAgY29uc3QgZWRpdG9yQ29udGV4dCA9IGJ1aWxkRWRpdG9yQ29udGV4dChpbnB1dCwgcmVzZWFyY2gsIG91dGxpbmUsIHNlb1FhKTtcbiAgICAgICAgY29uc3QgbW9kZWxOYW1lID0gYWdlbnRDb25maWcubW9kZWwgfHwgcHJvY2Vzcy5lbnYuRURJVE9SX0FHRU5UX01PREVMIHx8ICdncHQtNS40LW1pbmknO1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBFZGl0b3Igc3RlcDogVXNpbmcgbW9kZWw6ICR7bW9kZWxOYW1lfWApO1xuICAgICAgICBjb25zdCB7IHRleHQgfSA9IGF3YWl0IGdlbmVyYXRlVGV4dCh7XG4gICAgICAgICAgICBtb2RlbDogb3BlbmFpKG1vZGVsTmFtZSksXG4gICAgICAgICAgICB0ZW1wZXJhdHVyZTogMC42LFxuICAgICAgICAgICAgbWF4T3V0cHV0VG9rZW5zOiA4MDAwLFxuICAgICAgICAgICAgc3lzdGVtOiBzeXN0ZW1Qcm9tcHQsXG4gICAgICAgICAgICBtZXNzYWdlczogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcm9sZTogJ3VzZXInLFxuICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBgRWRpdCB0aGUgZHJhZnQgYmVsb3cgdXNpbmcgdGhlIHN1cHBsaWVkIGNvbnRleHQgYW5kIFNFTyBRQSBmZWVkYmFjay5cXG5cXG4ke2J1aWxkRnVsbElucHV0Q29udGV4dChpbnB1dCl9XFxuXFxuUmVzZWFyY2ggQWdlbnQgT3V0cHV0OlxcbiR7SlNPTi5zdHJpbmdpZnkocmVzZWFyY2gsIG51bGwsIDIpfVxcblxcbk91dGxpbmUgQWdlbnQgT3V0cHV0OlxcbiR7SlNPTi5zdHJpbmdpZnkob3V0bGluZSwgbnVsbCwgMil9XFxuXFxuU0VPIFFBIEZlZWRiYWNrOlxcbiR7ZWRpdG9yQ29udGV4dH1cXG5cXG5PcmlnaW5hbCBEcmFmdCBNYXJrZG93bjpcXG4ke29yaWdpbmFsRHJhZnR9XFxuXFxuUmV0dXJuIHRoZSBlZGl0ZWQgYmxvZyBpbiBNYXJrZG93biBvbmx5LiBEbyBub3QgcmV0dXJuIEpTT04uIERvIG5vdCBpbmNsdWRlIGV4cGxhbmF0aW9ucywgZWRpdG9yIG5vdGVzLCBtYXJrZG93biBmZW5jZXMsIG9yIGNvbW1lbnRzIG91dHNpZGUgdGhlIGFydGljbGUuYFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF1cbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IGVkaXRlZERyYWZ0ID0gdGV4dC50cmltKCk7XG4gICAgICAgIGlmICghZWRpdGVkRHJhZnQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRWRpdG9yIG91dHB1dCB3YXMgZW1wdHknKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZWRpdGVkRHJhZnQuc3RhcnRzV2l0aCgneycpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0VkaXRvciBvdXRwdXQgaW52YWxpZDogZXhwZWN0ZWQgTWFya2Rvd24sIHJlY2VpdmVkIEpTT04tbGlrZSByZXNwb25zZScpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlZGl0ZWREcmFmdC5sZW5ndGggPCBNYXRoLm1pbig1MDAsIE1hdGguZmxvb3Iob3JpZ2luYWxEcmFmdC5sZW5ndGggKiAwLjQpKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFZGl0b3Igb3V0cHV0IHRvbyBzaG9ydCBjb21wYXJlZCB3aXRoIG9yaWdpbmFsIGRyYWZ0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZWRpdG9yT3V0cHV0ID0ge1xuICAgICAgICAgICAgZWRpdGVkX2RyYWZ0X21hcmtkb3duOiBlZGl0ZWREcmFmdCxcbiAgICAgICAgICAgIGVkaXRvcl9ub3RlczogW1xuICAgICAgICAgICAgICAgICdFZGl0b3IgQWdlbnQgcmV0dXJuZWQgTWFya2Rvd24gb25seSBhcyByZXF1aXJlZCBieSB0aGUgYWN0aXZlIERCIHByb21wdC4nXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgY2hhbmdlc19tYWRlOiBzZW9RYS5wcmlvcml0eV9maXhlcyB8fCBbXSxcbiAgICAgICAgICAgIGh1bWFuX3Jldmlld19yZXF1aXJlZDogdHJ1ZVxuICAgICAgICB9O1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBFZGl0b3Igc3RlcDogR2VuZXJhdGVkIGVkaXRlZCBkcmFmdCAoJHtlZGl0b3JPdXRwdXQuZWRpdGVkX2RyYWZ0X21hcmtkb3duLmxlbmd0aH0gY2hhcnMpYCk7XG4gICAgICAgIHJldHVybiBlZGl0b3JPdXRwdXQ7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICBjb25zb2xlLmVycm9yKGBbdjBdIEVkaXRvciBzdGVwIGVycm9yOiAke2Vycm9yTWVzc2FnZX1gKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxufVxuZnVuY3Rpb24gYnVpbGRFZGl0b3JDb250ZXh0KGlucHV0LCByZXNlYXJjaCwgb3V0bGluZSwgc2VvUWEpIHtcbiAgICBjb25zdCBzZWN0aW9ucyA9IFtdO1xuICAgIHNlY3Rpb25zLnB1c2goJyMjIFNFTyBQZXJmb3JtYW5jZSBTdW1tYXJ5Jyk7XG4gICAgc2VjdGlvbnMucHVzaChgT3ZlcmFsbCBTY29yZTogJHtzZW9RYS5vdmVyYWxsX3Njb3JlfS8xMDBgKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBSZWFkeSBGb3IgRWRpdG9yOiAke3Nlb1FhLnJlYWR5X2Zvcl9lZGl0b3J9YCk7XG4gICAgc2VjdGlvbnMucHVzaChgUmVjb21tZW5kZWQgTmV4dCBBY3Rpb246ICR7c2VvUWEucmVjb21tZW5kZWRfbmV4dF9hY3Rpb259YCk7XG4gICAgc2VjdGlvbnMucHVzaChgTmVlZHMgUmV2aWV3OiAke3Nlb1FhLm5lZWRzX3Jldmlld31gKTtcbiAgICBzZWN0aW9ucy5wdXNoKCdcXG4jIyBTZWFyY2ggSW50ZW50IEFsaWdubWVudCcpO1xuICAgIHNlY3Rpb25zLnB1c2goYFNjb3JlOiAke3Nlb1FhLnNlYXJjaF9pbnRlbnRfYWxpZ25tZW50LnNjb3JlfS8xMDBgKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBBbmFseXNpczogJHtzZW9RYS5zZWFyY2hfaW50ZW50X2FsaWdubWVudC5hbmFseXNpc31gKTtcbiAgICBzZWN0aW9ucy5wdXNoKCdcXG4jIyBQcmltYXJ5IEtleXdvcmQgVXNhZ2UnKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBTY29yZTogJHtzZW9RYS5wcmltYXJ5X2tleXdvcmRfdXNhZ2Uuc2NvcmV9LzEwMGApO1xuICAgIHNlY3Rpb25zLnB1c2goYE9jY3VycmVuY2VzOiAke3Nlb1FhLnByaW1hcnlfa2V5d29yZF91c2FnZS5vY2N1cnJlbmNlc30gdGltZXNgKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBQbGFjZW1lbnQ6ICR7c2VvUWEucHJpbWFyeV9rZXl3b3JkX3VzYWdlLnBsYWNlbWVudF9hbmFseXNpc31gKTtcbiAgICBzZWN0aW9ucy5wdXNoKCdcXG4jIyBTZWNvbmRhcnkgS2V5d29yZHMnKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBTY29yZTogJHtzZW9RYS5zZWNvbmRhcnlfa2V5d29yZF91c2FnZS5zY29yZX0vMTAwYCk7XG4gICAgc2VjdGlvbnMucHVzaChgQ292ZXJlZDogJHtzZW9RYS5zZWNvbmRhcnlfa2V5d29yZF91c2FnZS5rZXl3b3Jkc19jb3ZlcmVkLmpvaW4oJywgJykgfHwgJ05vbmUnfWApO1xuICAgIGlmIChzZW9RYS5zZWNvbmRhcnlfa2V5d29yZF91c2FnZS5nYXBzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgc2VjdGlvbnMucHVzaChgR2FwczogJHtzZW9RYS5zZWNvbmRhcnlfa2V5d29yZF91c2FnZS5nYXBzLmpvaW4oJywgJyl9YCk7XG4gICAgfVxuICAgIHNlY3Rpb25zLnB1c2goJ1xcbiMjIEhlYWRpbmcgU3RydWN0dXJlJyk7XG4gICAgc2VjdGlvbnMucHVzaChgU2NvcmU6ICR7c2VvUWEuaGVhZGluZ19zdHJ1Y3R1cmVfcmV2aWV3LnNjb3JlfS8xMDBgKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBIMSBQcmVzZW50OiAke3Nlb1FhLmhlYWRpbmdfc3RydWN0dXJlX3Jldmlldy5oMV9wcmVzZW50fWApO1xuICAgIHNlY3Rpb25zLnB1c2goYEgyIENvdW50OiAke3Nlb1FhLmhlYWRpbmdfc3RydWN0dXJlX3Jldmlldy5oMl9jb3VudH1gKTtcbiAgICBpZiAoc2VvUWEuaGVhZGluZ19zdHJ1Y3R1cmVfcmV2aWV3LmhpZXJhcmNoeV9pc3N1ZXMubGVuZ3RoID4gMCkge1xuICAgICAgICBzZWN0aW9ucy5wdXNoKGBJc3N1ZXM6ICR7c2VvUWEuaGVhZGluZ19zdHJ1Y3R1cmVfcmV2aWV3LmhpZXJhcmNoeV9pc3N1ZXMuam9pbignOyAnKX1gKTtcbiAgICB9XG4gICAgc2VjdGlvbnMucHVzaCgnXFxuIyMgQ29udGVudCBEZXB0aCcpO1xuICAgIHNlY3Rpb25zLnB1c2goYFNjb3JlOiAke3Nlb1FhLmNvbnRlbnRfZGVwdGhfcmV2aWV3LnNjb3JlfS8xMDBgKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBXb3JkIENvdW50OiAke3Nlb1FhLmNvbnRlbnRfZGVwdGhfcmV2aWV3LndvcmRfY291bnR9IHdvcmRzYCk7XG4gICAgc2VjdGlvbnMucHVzaChgQ292ZXJhZ2U6ICR7c2VvUWEuY29udGVudF9kZXB0aF9yZXZpZXcuc2VjdGlvbl9jb3ZlcmFnZX1gKTtcbiAgICBpZiAoc2VvUWEuY29udGVudF9kZXB0aF9yZXZpZXcuZGVwdGhfaXNzdWVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgc2VjdGlvbnMucHVzaChgSXNzdWVzOiAke3Nlb1FhLmNvbnRlbnRfZGVwdGhfcmV2aWV3LmRlcHRoX2lzc3Vlcy5qb2luKCc7ICcpfWApO1xuICAgIH1cbiAgICBzZWN0aW9ucy5wdXNoKCdcXG4jIyBSZWFkYWJpbGl0eScpO1xuICAgIHNlY3Rpb25zLnB1c2goYFNjb3JlOiAke3Nlb1FhLnJlYWRhYmlsaXR5X3Jldmlldy5zY29yZX0vMTAwYCk7XG4gICAgc2VjdGlvbnMucHVzaChgQXZnIFNlbnRlbmNlIExlbmd0aDogJHtzZW9RYS5yZWFkYWJpbGl0eV9yZXZpZXcuYXZnX3NlbnRlbmNlX2xlbmd0aH0gd29yZHNgKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBSZWFkaW5nIExldmVsOiAke3Nlb1FhLnJlYWRhYmlsaXR5X3Jldmlldy5mbGVzY2hfa2luY2FpZF9lc3RpbWF0ZX1gKTtcbiAgICBpZiAoc2VvUWEucmVhZGFiaWxpdHlfcmV2aWV3LnJlYWRhYmlsaXR5X2lzc3Vlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHNlY3Rpb25zLnB1c2goYElzc3VlczogJHtzZW9RYS5yZWFkYWJpbGl0eV9yZXZpZXcucmVhZGFiaWxpdHlfaXNzdWVzLmpvaW4oJzsgJyl9YCk7XG4gICAgfVxuICAgIHNlY3Rpb25zLnB1c2goJ1xcbiMjIENUQSBSZXZpZXcnKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBTY29yZTogJHtzZW9RYS5jdGFfcmV2aWV3LnNjb3JlfS8xMDBgKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBDVEEgUHJlc2VudDogJHtzZW9RYS5jdGFfcmV2aWV3LmN0YV9wcmVzZW50fWApO1xuICAgIHNlY3Rpb25zLnB1c2goYENUQSBBbmFseXNpczogJHtzZW9RYS5jdGFfcmV2aWV3LmN0YV9hbmFseXNpc31gKTtcbiAgICBzZWN0aW9ucy5wdXNoKCdcXG4jIyBJbnRlcm5hbCBMaW5raW5nJyk7XG4gICAgc2VjdGlvbnMucHVzaChgU2NvcmU6ICR7c2VvUWEuaW50ZXJuYWxfbGlua2luZ19yZXZpZXcuc2NvcmV9LzEwMGApO1xuICAgIHNlY3Rpb25zLnB1c2goYExpbmtzIEZvdW5kOiAke3Nlb1FhLmludGVybmFsX2xpbmtpbmdfcmV2aWV3LmludGVybmFsX2xpbmtzX2ZvdW5kfWApO1xuICAgIGlmIChzZW9RYS5pbnRlcm5hbF9saW5raW5nX3Jldmlldy5pbnRlcm5hbF9saW5rX3JlY29tbWVuZGF0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHNlY3Rpb25zLnB1c2goYFJlY29tbWVuZGF0aW9uczogJHtzZW9RYS5pbnRlcm5hbF9saW5raW5nX3Jldmlldy5pbnRlcm5hbF9saW5rX3JlY29tbWVuZGF0aW9ucy5qb2luKCc7ICcpfWApO1xuICAgIH1cbiAgICBzZWN0aW9ucy5wdXNoKCdcXG4jIyBDbGllbnQgR29hbCBBbGlnbm1lbnQnKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBTY29yZTogJHtzZW9RYS5jbGllbnRfZ29hbF9hbGlnbm1lbnQuc2NvcmV9LzEwMGApO1xuICAgIHNlY3Rpb25zLnB1c2goYEFuYWx5c2lzOiAke3Nlb1FhLmNsaWVudF9nb2FsX2FsaWdubWVudC5hbmFseXNpc31gKTtcbiAgICBpZiAoc2VvUWEucHJpb3JpdHlfZml4ZXMubGVuZ3RoID4gMCkge1xuICAgICAgICBzZWN0aW9ucy5wdXNoKCdcXG4jIyBQcmlvcml0eSBGaXhlcycpO1xuICAgICAgICBzZWN0aW9ucy5wdXNoKHNlb1FhLnByaW9yaXR5X2ZpeGVzLm1hcCgoZml4KT0+YC0gJHtmaXh9YCkuam9pbignXFxuJykpO1xuICAgIH1cbiAgICBpZiAoc2VvUWEucmlza19mbGFncy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHNlY3Rpb25zLnB1c2goJ1xcbiMjIFJpc2sgRmxhZ3MnKTtcbiAgICAgICAgc2VjdGlvbnMucHVzaChzZW9RYS5yaXNrX2ZsYWdzLm1hcCgoZmxhZyk9PmAtICR7ZmxhZ31gKS5qb2luKCdcXG4nKSk7XG4gICAgfVxuICAgIHNlY3Rpb25zLnB1c2goJ1xcbiMjIFJlc2VhcmNoIE5vdGVzJyk7XG4gICAgc2VjdGlvbnMucHVzaChgQ29udGVudCBBbmdsZTogJHtyZXNlYXJjaC5jb250ZW50X2FuZ2xlfWApO1xuICAgIHNlY3Rpb25zLnB1c2goYENsaWVudCBHb2FsIEFsaWdubWVudDogJHtyZXNlYXJjaC5jbGllbnRfZ29hbF9hbGlnbm1lbnR9YCk7XG4gICAgc2VjdGlvbnMucHVzaCgnXFxuIyMgT3V0bGluZSBOb3RlcycpO1xuICAgIHNlY3Rpb25zLnB1c2goYFRpdGxlOiAke291dGxpbmUudGl0bGV9YCk7XG4gICAgc2VjdGlvbnMucHVzaChgQ1RBIEd1aWRhbmNlOiAke291dGxpbmUuY3RhX2d1aWRhbmNlfWApO1xuICAgIHNlY3Rpb25zLnB1c2goJ1xcbiMjIEFkZGl0aW9uYWwgQ2xpZW50IEd1aWRhbmNlJyk7XG4gICAgaWYgKGlucHV0LmN0YV9ub3RlcyB8fCBpbnB1dC5jdGEgfHwgaW5wdXQuYmxvZ19jb250ZXh0X2JyaWVmPy5jdGEpIHtcbiAgICAgICAgc2VjdGlvbnMucHVzaChgQ1RBIE5vdGVzOiAke2lucHV0LmJsb2dfY29udGV4dF9icmllZj8uY3RhIHx8IGlucHV0LmN0YSB8fCBpbnB1dC5jdGFfbm90ZXN9YCk7XG4gICAgfVxuICAgIGlmIChpbnB1dC5icmFuZF92b2ljZV9ub3RlcyB8fCBpbnB1dC5ibG9nX2NvbnRleHRfYnJpZWY/LmJyYW5kX3ZvaWNlX25vdGVzIHx8IGlucHV0LnRvbmUpIHtcbiAgICAgICAgc2VjdGlvbnMucHVzaChgQnJhbmQgVm9pY2U6ICR7aW5wdXQuYmxvZ19jb250ZXh0X2JyaWVmPy5icmFuZF92b2ljZV9ub3RlcyB8fCBpbnB1dC5icmFuZF92b2ljZV9ub3RlcyB8fCBpbnB1dC50b25lfWApO1xuICAgIH1cbiAgICBpZiAoaW5wdXQuYXVkaWVuY2Vfbm90ZXMgfHwgaW5wdXQudGFyZ2V0X2F1ZGllbmNlIHx8IGlucHV0LmJsb2dfY29udGV4dF9icmllZj8udGFyZ2V0X2F1ZGllbmNlKSB7XG4gICAgICAgIHNlY3Rpb25zLnB1c2goYFRhcmdldCBBdWRpZW5jZTogJHtpbnB1dC5ibG9nX2NvbnRleHRfYnJpZWY/LnRhcmdldF9hdWRpZW5jZSB8fCBpbnB1dC50YXJnZXRfYXVkaWVuY2UgfHwgaW5wdXQuYXVkaWVuY2Vfbm90ZXN9YCk7XG4gICAgfVxuICAgIHJldHVybiBzZWN0aW9ucy5qb2luKCdcXG4nKTtcbn1cbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL2VkaXRvci1zdGVwLy9ydW5FZGl0b3JTdGVwXCIsIHJ1bkVkaXRvclN0ZXApO1xuIiwgImltcG9ydCB7IHJlZ2lzdGVyU3RlcEZ1bmN0aW9uIH0gZnJvbSBcIndvcmtmbG93L2ludGVybmFsL3ByaXZhdGVcIjtcbmltcG9ydCAnc2VydmVyLW9ubHknO1xuaW1wb3J0IHsgdXBkYXRlUnVuU3RhdHVzLCB1cGRhdGVSdW5FcnJvciwgY29tcGxldGVSdW4gfSBmcm9tICcuLi8uLi9zdG9yYWdlL3J1bnMnO1xuLyoqX19pbnRlcm5hbF93b3JrZmxvd3N7XCJzdGVwc1wiOntcImxpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvaGVscGVycy50c1wiOntcImNvbXBsZXRlUnVuU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL2hlbHBlcnMvL2NvbXBsZXRlUnVuU3RlcFwifSxcIm1hcmtSdW5GYWlsZWRTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvaGVscGVycy8vbWFya1J1bkZhaWxlZFN0ZXBcIn0sXCJtYXJrUnVuUnVubmluZ1N0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9oZWxwZXJzLy9tYXJrUnVuUnVubmluZ1N0ZXBcIn19fX0qLztcbi8qKlxuICogTWFyayBhIHJ1biBhcyBydW5uaW5nICh0cmFuc2l0aW9uIGZyb20gcXVldWVkIHRvIHJ1bm5pbmcpXG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG1hcmtSdW5SdW5uaW5nU3RlcChydW5JZCkge1xuICAgIGNvbnNvbGUubG9nKGBbdjBdIEhlbHBlcjogTWFya2luZyBydW4gJHtydW5JZH0gYXMgcnVubmluZ2ApO1xuICAgIGF3YWl0IHVwZGF0ZVJ1blN0YXR1cyhydW5JZCwgJ3Jlc2VhcmNoaW5nJyk7XG59XG4vKipcbiAqIE1hcmsgYSBydW4gYXMgZmFpbGVkIHdpdGggZXJyb3IgbWVzc2FnZVxuICogQ2FsbGJhY2sgaXMgc2VudCBieSB3b3JrZmxvdyBvcmNoZXN0cmF0b3IsIG5vdCBoZXJlXG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG1hcmtSdW5GYWlsZWRTdGVwKHJ1bklkLCBlcnJvck1lc3NhZ2UpIHtcbiAgICBjb25zb2xlLmxvZyhgW3YwXSBIZWxwZXI6IE1hcmtpbmcgcnVuICR7cnVuSWR9IGFzIGZhaWxlZCB3aXRoIGVycm9yOiAke2Vycm9yTWVzc2FnZX1gKTtcbiAgICBhd2FpdCB1cGRhdGVSdW5FcnJvcihydW5JZCwgZXJyb3JNZXNzYWdlKTtcbn1cbi8qKlxuICogQ29tcGxldGUgYSBydW4gd2l0aCBmaW5hbCBvdXRwdXRcbiAqIENhbGxiYWNrIGlzIHNlbnQgYnkgd29ya2Zsb3cgb3JjaGVzdHJhdG9yLCBub3QgaGVyZVxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBjb21wbGV0ZVJ1blN0ZXAocnVuSWQsIGZpbmFsT3V0cHV0KSB7XG4gICAgY29uc29sZS5sb2coYFt2MF0gSGVscGVyOiBDb21wbGV0aW5nIHJ1biAke3J1bklkfWApO1xuICAgIGF3YWl0IGNvbXBsZXRlUnVuKHJ1bklkLCBmaW5hbE91dHB1dCk7XG59XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9oZWxwZXJzLy9tYXJrUnVuUnVubmluZ1N0ZXBcIiwgbWFya1J1blJ1bm5pbmdTdGVwKTtcbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL2hlbHBlcnMvL21hcmtSdW5GYWlsZWRTdGVwXCIsIG1hcmtSdW5GYWlsZWRTdGVwKTtcbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL2hlbHBlcnMvL2NvbXBsZXRlUnVuU3RlcFwiLCBjb21wbGV0ZVJ1blN0ZXApO1xuIiwgImltcG9ydCB7IHJlZ2lzdGVyU3RlcEZ1bmN0aW9uIH0gZnJvbSBcIndvcmtmbG93L2ludGVybmFsL3ByaXZhdGVcIjtcbmltcG9ydCAnc2VydmVyLW9ubHknO1xuaW1wb3J0IHsgZ2VuZXJhdGVUZXh0IH0gZnJvbSAnYWknO1xuaW1wb3J0IHsgb3BlbmFpIH0gZnJvbSAnQGFpLXNkay9vcGVuYWknO1xuaW1wb3J0IHsgZ2V0QWdlbnRDb25maWcgfSBmcm9tICcuLi8uLi9zdG9yYWdlL2FnZW50LWNvbmZpZ3MnO1xuaW1wb3J0IHsgYnVpbGRGdWxsSW5wdXRDb250ZXh0LCBleHRyYWN0SnNvbk9iamVjdCB9IGZyb20gJy4vY29udGV4dC1idWlsZGVyJztcbi8qKl9faW50ZXJuYWxfd29ya2Zsb3dze1wic3RlcHNcIjp7XCJsaWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL21ldGEtc3RlcC50c1wiOntcInJ1bk1ldGFTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvbWV0YS1zdGVwLy9ydW5NZXRhU3RlcFwifX19fSovO1xuLyoqXG4gKiBNZXRhIEFnZW50IFN0ZXAgLSBQaGFzZSAyQy1GXG4gKiBHZW5lcmF0ZXMgU0VPIG1ldGFkYXRhIGZvciBodW1hbiByZXZpZXdcbiAqIERvZXMgTk9UIHB1Ymxpc2gsIGNhbGwgZXh0ZXJuYWwgc2VydmljZXMsIG9yIG92ZXJ3cml0ZSBkcmFmdHNcbiAqIE91dHB1dCBnb2VzIHRvIGZpbmFsX291dHB1dF9qc29uIGFzIG1ldGFfanNvblxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5NZXRhU3RlcChydW5JZCwgaW5wdXQsIHJlc2VhcmNoLCBvdXRsaW5lLCBvcmlnaW5hbERyYWZ0LCBzZW9RYSwgZWRpdGVkRHJhZnQpIHtcbiAgICBjb25zb2xlLmxvZyhgW3YwXSBNZXRhIHN0ZXA6IFN0YXJ0aW5nIGZvciBydW4gJHtydW5JZH1gKTtcbiAgICB0cnkge1xuICAgICAgICAvLyBMb2FkIGFnZW50IGNvbmZpZyBmcm9tIGRhdGFiYXNlXG4gICAgICAgIGNvbnN0IGFnZW50Q29uZmlnID0gYXdhaXQgZ2V0QWdlbnRDb25maWcoJ21ldGEnKTtcbiAgICAgICAgaWYgKCFhZ2VudENvbmZpZykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBY3RpdmUgYWdlbnQgY29uZmlnIG5vdCBmb3VuZCBmb3IgYWdlbnRfa2V5OiBtZXRhJyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gU0VPIEJsb2cgQWdlbnQgQ29uZmlnIExvYWRlZDogbWV0YSB2JHthZ2VudENvbmZpZy52ZXJzaW9ufWApO1xuICAgICAgICAvLyBCdWlsZCBzeXN0ZW0gcHJvbXB0IGZyb20gZGF0YWJhc2UgY29uZmlnXG4gICAgICAgIGNvbnN0IHN5c3RlbVByb21wdCA9IFtcbiAgICAgICAgICAgIGFnZW50Q29uZmlnLnN5c3RlbV9wcm9tcHQsXG4gICAgICAgICAgICBhZ2VudENvbmZpZy5za2lsbF9tYXJrZG93blxuICAgICAgICBdLmZpbHRlcihCb29sZWFuKS5qb2luKCdcXG5cXG4nKTtcbiAgICAgICAgLy8gQnVpbGQgY29udGV4dCBmb3IgbWV0YSBnZW5lcmF0aW9uXG4gICAgICAgIGNvbnN0IG1ldGFDb250ZXh0ID0gYnVpbGRNZXRhQ29udGV4dChpbnB1dCwgcmVzZWFyY2gsIG91dGxpbmUsIHNlb1FhLCBvcmlnaW5hbERyYWZ0LCBlZGl0ZWREcmFmdCk7XG4gICAgICAgIC8vIEdldCBtb2RlbCBuYW1lOiB1c2UgREIgY29uZmlnIGlmIGF2YWlsYWJsZSwgb3RoZXJ3aXNlIGZhbGwgYmFjayB0byBlbnYgdmFyIG9yIGRlZmF1bHRcbiAgICAgICAgY29uc3QgbW9kZWxOYW1lID0gYWdlbnRDb25maWcubW9kZWwgfHwgcHJvY2Vzcy5lbnYuTUVUQV9BR0VOVF9NT0RFTCB8fCAnZ3B0LTUuNC1taW5pJztcbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gTWV0YSBzdGVwOiBVc2luZyBtb2RlbDogJHttb2RlbE5hbWV9YCk7XG4gICAgICAgIC8vIEdlbmVyYXRlIG1ldGFkYXRhXG4gICAgICAgIGNvbnN0IHsgdGV4dDogbWV0YUFuYWx5c2lzIH0gPSBhd2FpdCBnZW5lcmF0ZVRleHQoe1xuICAgICAgICAgICAgbW9kZWw6IG9wZW5haShtb2RlbE5hbWUpLFxuICAgICAgICAgICAgc3lzdGVtOiBzeXN0ZW1Qcm9tcHQsXG4gICAgICAgICAgICB0ZW1wZXJhdHVyZTogMC41LFxuICAgICAgICAgICAgbWVzc2FnZXM6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHJvbGU6ICd1c2VyJyxcbiAgICAgICAgICAgICAgICAgICAgY29udGVudDogbWV0YUNvbnRleHRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBNZXRhIHN0ZXA6IFJlY2VpdmVkIGFuYWx5c2lzLCBwYXJzaW5nIEpTT05gKTtcbiAgICAgICAgLy8gUGFyc2UgdGhlIHJlc3BvbnNlIC0gRkFJTC1MT1VEIGluIHByb2R1Y3Rpb25cbiAgICAgICAgbGV0IG1ldGFPdXRwdXQ7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBtZXRhT3V0cHV0ID0gSlNPTi5wYXJzZShleHRyYWN0SnNvbk9iamVjdChtZXRhQW5hbHlzaXMpKTtcbiAgICAgICAgfSBjYXRjaCAocGFyc2VFcnJvcikge1xuICAgICAgICAgICAgLy8gUFJPRFVDVElPTiBNT0RFOiBBbHdheXMgZmFpbCBsb3VkIG9uIHBhcnNlIGVycm9ycy5cbiAgICAgICAgICAgIC8vIEZhbGxiYWNrIGlzIG5vdCB1c2VkIGluIG5vcm1hbCB3b3JrZmxvdyAtIHRoaXMgZW5zdXJlcyBBSSBtb2RlbCBzY2hlbWEgY29tcGxpYW5jZS5cbiAgICAgICAgICAgIGNvbnN0IGVycm9yTXNnID0gcGFyc2VFcnJvciBpbnN0YW5jZW9mIEVycm9yID8gcGFyc2VFcnJvci5tZXNzYWdlIDogU3RyaW5nKHBhcnNlRXJyb3IpO1xuICAgICAgICAgICAgY29uc3QgZnVsbEVycm9yID0gYE1ldGEgb3V0cHV0IHBhcnNlIGZhaWxlZDogJHtlcnJvck1zZ31gO1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW3YwXSBNZXRhIHN0ZXA6ICR7ZnVsbEVycm9yfWApO1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGZ1bGxFcnJvcik7XG4gICAgICAgIH1cbiAgICAgICAgLy8gRkFJTC1MT1VEOiBWYWxpZGF0ZSBhbGwgcmVxdWlyZWQgZmllbGRzIGV4aXN0IGFuZCBoYXZlIGNvcnJlY3QgdHlwZXNcbiAgICAgICAgY29uc3QgZmllbGRWYWxpZGF0aW9ucyA9IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBmaWVsZDogJ21ldGFfdGl0bGUnLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICAgIGNoZWNrOiAodik9PnR5cGVvZiB2ID09PSAnc3RyaW5nJyAmJiB2Lmxlbmd0aCA+IDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZmllbGQ6ICdtZXRhX2Rlc2NyaXB0aW9uJyxcbiAgICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgICBjaGVjazogKHYpPT50eXBlb2YgdiA9PT0gJ3N0cmluZycgJiYgdi5sZW5ndGggPiAwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZpZWxkOiAnc2x1ZycsXG4gICAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICAgICAgY2hlY2s6ICh2KT0+dHlwZW9mIHYgPT09ICdzdHJpbmcnICYmIHYubGVuZ3RoID4gMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBmaWVsZDogJ3NvY2lhbF9wcmV2aWV3JyxcbiAgICAgICAgICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgICAgICAgICBjaGVjazogKHYpPT50eXBlb2YgdiA9PT0gJ29iamVjdCcgJiYgdi50aXRsZSAmJiB2LmRlc2NyaXB0aW9uXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZpZWxkOiAnc2NoZW1hX21hcmt1cCcsXG4gICAgICAgICAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgICAgICAgICAgY2hlY2s6ICh2KT0+dHlwZW9mIHYgPT09ICdvYmplY3QnICYmIHZbJ0B0eXBlJ10gJiYgdi5oZWFkbGluZSAmJiB2LmRlc2NyaXB0aW9uXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZpZWxkOiAncHJpbWFyeV9rZXl3b3JkX3VzZWQnLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgICAgICAgICBjaGVjazogKHYpPT50eXBlb2YgdiA9PT0gJ2Jvb2xlYW4nXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZpZWxkOiAnc2Vjb25kYXJ5X2tleXdvcmRzX3JlZmxlY3RlZCcsXG4gICAgICAgICAgICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgICAgICAgICAgICBjaGVjazogKHYpPT5BcnJheS5pc0FycmF5KHYpXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZpZWxkOiAnY2xpZW50X2dvYWxfcmVmbGVjdGVkJyxcbiAgICAgICAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgICAgICAgICAgY2hlY2s6ICh2KT0+dHlwZW9mIHYgPT09ICdib29sZWFuJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBmaWVsZDogJ2h1bWFuX3Jldmlld19yZXF1aXJlZCcsXG4gICAgICAgICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICAgICAgICAgIGNoZWNrOiAodik9PnR5cGVvZiB2ID09PSAnYm9vbGVhbidcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZmllbGQ6ICdyZXZpZXdfcmVhZHknLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgICAgICAgICBjaGVjazogKHYpPT50eXBlb2YgdiA9PT0gJ2Jvb2xlYW4nXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZpZWxkOiAnbWV0YV9ub3RlcycsXG4gICAgICAgICAgICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgICAgICAgICAgICBjaGVjazogKHYpPT5BcnJheS5pc0FycmF5KHYpXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZpZWxkOiAnbmVlZHNfcmV2aWV3JyxcbiAgICAgICAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgICAgICAgICAgY2hlY2s6ICh2KT0+dHlwZW9mIHYgPT09ICdib29sZWFuJ1xuICAgICAgICAgICAgfVxuICAgICAgICBdO1xuICAgICAgICBjb25zdCB2YWxpZGF0aW9uRXJyb3JzID0gW107XG4gICAgICAgIGZvciAoY29uc3QgdmFsaWRhdGlvbiBvZiBmaWVsZFZhbGlkYXRpb25zKXtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gbWV0YU91dHB1dFt2YWxpZGF0aW9uLmZpZWxkXTtcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdmFsaWRhdGlvbkVycm9ycy5wdXNoKGAke3ZhbGlkYXRpb24uZmllbGR9IGlzIG1pc3NpbmdgKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIXZhbGlkYXRpb24uY2hlY2sodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgdmFsaWRhdGlvbkVycm9ycy5wdXNoKGAke3ZhbGlkYXRpb24uZmllbGR9IGhhcyBpbnZhbGlkIHR5cGUgKGV4cGVjdGVkICR7dmFsaWRhdGlvbi50eXBlfSlgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAodmFsaWRhdGlvbkVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE1ldGEgb3V0cHV0IHZhbGlkYXRpb24gZmFpbGVkOiAke3ZhbGlkYXRpb25FcnJvcnMuam9pbignOyAnKX1gKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBMaWdodHdlaWdodCBmaWVsZCBjb25zdHJhaW50cyAobm8gc2lsZW50IG1vZGlmaWNhdGlvbilcbiAgICAgICAgaWYgKG1ldGFPdXRwdXQubWV0YV90aXRsZS5sZW5ndGggPiA3MCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBNZXRhIHRpdGxlIHRvbyBsb25nOiAke21ldGFPdXRwdXQubWV0YV90aXRsZS5sZW5ndGh9IGNoYXJzLCBtYXggNzBgKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobWV0YU91dHB1dC5tZXRhX2Rlc2NyaXB0aW9uLmxlbmd0aCA+IDE2MCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBNZXRhIGRlc2NyaXB0aW9uIHRvbyBsb25nOiAke21ldGFPdXRwdXQubWV0YV9kZXNjcmlwdGlvbi5sZW5ndGh9IGNoYXJzLCBtYXggMTYwYCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gTWV0YSBzdGVwOiBDb21wbGV0ZSBmb3IgcnVuICR7cnVuSWR9YCwgYEdlbmVyYXRlZCBtZXRhZGF0YTogJHttZXRhT3V0cHV0Lm1ldGFfdGl0bGUuc3Vic3RyaW5nKDAsIDUwKX0uLi5gKTtcbiAgICAgICAgcmV0dXJuIG1ldGFPdXRwdXQ7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICBjb25zb2xlLmVycm9yKGBbdjBdIE1ldGEgc3RlcCBlcnJvciBmb3IgcnVuICR7cnVuSWR9OiAke2Vycm9yTWVzc2FnZX1gKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxufVxuLyoqXG4gKiBCdWlsZCBjb250ZXh0IHByb21wdCBmb3IgbWV0YWRhdGEgZ2VuZXJhdGlvblxuICovIGZ1bmN0aW9uIGJ1aWxkTWV0YUNvbnRleHQoaW5wdXQsIHJlc2VhcmNoLCBvdXRsaW5lLCBzZW9RYSwgb3JpZ2luYWxEcmFmdCwgZWRpdGVkRHJhZnQpIHtcbiAgICAvLyBWYWxpZGF0ZSByZXF1aXJlZCByZXNlYXJjaC5rZXlfZmluZGluZ3MgYmVmb3JlIHVzaW5nXG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHJlc2VhcmNoLmtleV9maW5kaW5ncykpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZXNlYXJjaCBvdXRwdXQgbWlzc2luZyByZXF1aXJlZCBrZXlfZmluZGluZ3MgYXJyYXkgZm9yIG1ldGEtc3RlcCcpO1xuICAgIH1cbiAgICBjb25zdCB3b3JkQ291bnQgPSBlZGl0ZWREcmFmdC5zcGxpdCgvXFxzKy8pLmxlbmd0aDtcbiAgICBjb25zdCBoZWFkaW5ncyA9IGVkaXRlZERyYWZ0Lm1hdGNoKC9eIytcXHMrLiskL2dtKSB8fCBbXTtcbiAgICBjb25zdCBrZXlGaW5kaW5nc1N1bW1hcnkgPSByZXNlYXJjaC5rZXlfZmluZGluZ3Muc2xpY2UoMCwgMykuam9pbignXFxuLSAnKTtcbiAgICByZXR1cm4gYFlvdSBhcmUgYW4gZXhwZXJ0IFNFTyBtZXRhZGF0YSBzcGVjaWFsaXN0LiBHZW5lcmF0ZSBTRU8gbWV0YWRhdGEgZm9yIGEgYmxvZyBwb3N0IGZvciBodW1hbiByZXZpZXcuXG5cbkZVTEwgQkxPRyBDT05URVhUOlxuJHtidWlsZEZ1bGxJbnB1dENvbnRleHQoaW5wdXQpfVxuXG5SRVNFQVJDSCBTVU1NQVJZOlxuLSAke2tleUZpbmRpbmdzU3VtbWFyeX1cblxuT1VUTElORSBTVFJVQ1RVUkU6XG4ke291dGxpbmUuc2VjdGlvbnMubWFwKChzKT0+YC0gJHtzLmhlYWRpbmd9ICgke3Mua2V5X3BvaW50cz8ubGVuZ3RoIHx8IDB9IGtleSBwb2ludHMpYCkuam9pbignXFxuJyl9XG5cblNFTyBRQSBSRVZJRVc6XG4tIE92ZXJhbGwgU2NvcmU6ICR7c2VvUWEub3ZlcmFsbF9zY29yZX1cbi0gU2VhcmNoIEludGVudCBBbGlnbm1lbnQ6ICR7c2VvUWEuc2VhcmNoX2ludGVudF9hbGlnbm1lbnQuc2NvcmV9XG4tIFByaW1hcnkgS2V5d29yZCBVc2FnZTogJHtzZW9RYS5wcmltYXJ5X2tleXdvcmRfdXNhZ2Uuc2NvcmV9XG4tIEhlYWRpbmcgU3RydWN0dXJlOiAke3Nlb1FhLmhlYWRpbmdfc3RydWN0dXJlX3Jldmlldy5zY29yZX1cbi0gQ2xpZW50IEdvYWwgQWxpZ25tZW50OiAke3Nlb1FhLmNsaWVudF9nb2FsX2FsaWdubWVudC5zY29yZX1cblxuRURJVEVEIEJMT0cgTUFSS0RPV046XG4ke2VkaXRlZERyYWZ0fVxuXG5DT05URU5UIFNUQVRTOlxuLSBXb3JkIENvdW50OiAke3dvcmRDb3VudH1cbi0gSGVhZGluZ3M6ICR7aGVhZGluZ3MubGVuZ3RofVxuLSBIYXMgQ1RBOiAke2lucHV0LmN0YV9ub3RlcyA/ICdZZXMnIDogJ05vJ31cbi0gSGFzIEludGVybmFsIExpbmtzOiAke2lucHV0LmludGVybmFsX2xpbmtfbm90ZXMgPyAnWWVzJyA6ICdObyd9XG5cbkdlbmVyYXRlIG1ldGFkYXRhIHRoYXQ6XG4xLiBBY2N1cmF0ZWx5IHJlcHJlc2VudHMgdGhlIGJsb2cgY29udGVudCAoZG8gbm90IGludmVudCBjbGFpbXMpXG4yLiBJbmNsdWRlcyB0aGUgcHJpbWFyeSBrZXl3b3JkIG5hdHVyYWxseSBpbiB0aXRsZSBhbmQgZGVzY3JpcHRpb25cbjMuIElzIFNFTy1vcHRpbWl6ZWQgZm9yIHNlYXJjaCBlbmdpbmVzXG40LiBJcyBjb21wZWxsaW5nIGZvciBodW1hbiByZWFkZXJzIGFuZCBDVFJcbjUuIEZvbGxvd3MgYmVzdCBwcmFjdGljZXMgKHRpdGxlIG1heCA3MCBjaGFycywgZGVzY3JpcHRpb24gbWF4IDE2MCBjaGFycylcbjYuIEluY2x1ZGVzIHJldmlldyBub3RlcyBmb3IgdGhlIGh1bWFuIGVkaXRvclxuXG5SZXR1cm4gdmFsaWQgSlNPTiBvbmx5IHVzaW5nIGV4YWN0bHkgdGhlc2UgdG9wLWxldmVsIGtleXM6XG5tZXRhX3RpdGxlLCBtZXRhX2Rlc2NyaXB0aW9uLCBzbHVnLCBzb2NpYWxfcHJldmlldywgc2NoZW1hX21hcmt1cCwgcHJpbWFyeV9rZXl3b3JkX3VzZWQsIHNlY29uZGFyeV9rZXl3b3Jkc19yZWZsZWN0ZWQsIGNsaWVudF9nb2FsX3JlZmxlY3RlZCwgaHVtYW5fcmV2aWV3X3JlcXVpcmVkLCByZXZpZXdfcmVhZHksIG1ldGFfbm90ZXMsIG5lZWRzX3Jldmlldy5cblxuRG8gbm90IHVzZSBvbGQga2V5czpcbnNlb190aXRsZSwgc3VnZ2VzdGVkX3NsdWcsIHNlY29uZGFyeV9rZXl3b3Jkc191c2VkLCBodW1hbl9yZXZpZXdfbm90ZXMsIGV4Y2VycHQsIG9nX3RpdGxlLCBvZ19kZXNjcmlwdGlvbiwgY2Fub25pY2FsX3VybF9zdWdnZXN0aW9uLCBzY2hlbWFfdHlwZV9zdWdnZXN0aW9uLlxuXG5SZXR1cm4gYSBKU09OIG9iamVjdCB3aXRoIHRoaXMgZXhhY3Qgc2NoZW1hOlxue1xuICBcIm1ldGFfdGl0bGVcIjogXCJTRU8tb3B0aW1pemVkIHRpdGxlIChtYXggNzAgY2hhcnMsIGluY2x1ZGUgcHJpbWFyeSBrZXl3b3JkKVwiLFxuICBcIm1ldGFfZGVzY3JpcHRpb25cIjogXCJDb21wZWxsaW5nIGRlc2NyaXB0aW9uIChtYXggMTYwIGNoYXJzLCBpbmNsdWRlIHByaW1hcnkga2V5d29yZClcIixcbiAgXCJzbHVnXCI6IFwidXJsLXNsdWctZm9ybWF0XCIsXG4gIFwic29jaWFsX3ByZXZpZXdcIjoge1xuICAgIFwidGl0bGVcIjogXCJTb2NpYWwgbWVkaWEgcHJldmlldyB0aXRsZVwiLFxuICAgIFwiZGVzY3JpcHRpb25cIjogXCJTb2NpYWwgbWVkaWEgcHJldmlldyBkZXNjcmlwdGlvblwiXG4gIH0sXG4gIFwic2NoZW1hX21hcmt1cFwiOiB7XG4gICAgXCJAdHlwZVwiOiBcIkJsb2dQb3N0aW5nXCIsXG4gICAgXCJoZWFkbGluZVwiOiBcIkFydGljbGUgaGVhZGxpbmVcIixcbiAgICBcImRlc2NyaXB0aW9uXCI6IFwiQXJ0aWNsZSBkZXNjcmlwdGlvblwiXG4gIH0sXG4gIFwicHJpbWFyeV9rZXl3b3JkX3VzZWRcIjogdHJ1ZSxcbiAgXCJzZWNvbmRhcnlfa2V5d29yZHNfcmVmbGVjdGVkXCI6IFtcImtleXdvcmQxXCIsIFwia2V5d29yZDJcIl0sXG4gIFwiY2xpZW50X2dvYWxfcmVmbGVjdGVkXCI6IHRydWUsXG4gIFwiaHVtYW5fcmV2aWV3X3JlcXVpcmVkXCI6IHRydWUsXG4gIFwicmV2aWV3X3JlYWR5XCI6IHRydWUsXG4gIFwibWV0YV9ub3Rlc1wiOiBbXCJub3RlMVwiLCBcIm5vdGUyXCJdLFxuICBcIm5lZWRzX3Jldmlld1wiOiBmYWxzZVxufWA7XG59XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9tZXRhLXN0ZXAvL3J1bk1ldGFTdGVwXCIsIHJ1bk1ldGFTdGVwKTtcbiIsICJpbXBvcnQgeyByZWdpc3RlclN0ZXBGdW5jdGlvbiB9IGZyb20gXCJ3b3JrZmxvdy9pbnRlcm5hbC9wcml2YXRlXCI7XG5pbXBvcnQgJ3NlcnZlci1vbmx5JztcbmltcG9ydCB7IGdlbmVyYXRlVGV4dCB9IGZyb20gJ2FpJztcbmltcG9ydCB7IG9wZW5haSB9IGZyb20gJ0BhaS1zZGsvb3BlbmFpJztcbmltcG9ydCB7IHVwZGF0ZVJ1blN0YXR1cyB9IGZyb20gJy4uLy4uL3N0b3JhZ2UvcnVucyc7XG5pbXBvcnQgeyBnZXRBZ2VudENvbmZpZyB9IGZyb20gJy4uLy4uL3N0b3JhZ2UvYWdlbnQtY29uZmlncyc7XG5pbXBvcnQgeyBidWlsZEZ1bGxJbnB1dENvbnRleHQsIGV4dHJhY3RKc29uT2JqZWN0IH0gZnJvbSAnLi9jb250ZXh0LWJ1aWxkZXInO1xuLyoqX19pbnRlcm5hbF93b3JrZmxvd3N7XCJzdGVwc1wiOntcImxpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvb3V0bGluZS1zdGVwLnRzXCI6e1wicnVuT3V0bGluZVN0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9vdXRsaW5lLXN0ZXAvL3J1bk91dGxpbmVTdGVwXCJ9fX19Ki87XG4vKipcbiAqIE91dGxpbmUgU3RlcCAtIFBoYXNlIDJDLUJcbiAqIFJ1bnMgaW5zaWRlIGEgZHVyYWJsZSBzdGVwIGZ1bmN0aW9uIChoYXMgTm9kZS5qcyBhY2Nlc3MpXG4gKiBDYWxscyBBSSBtb2RlbCB0byBnZW5lcmF0ZSBjb250ZW50IG91dGxpbmUgd2l0aCBzdHJ1Y3R1cmVcbiAqIFVzZXMgcmVzZWFyY2ggZGF0YSBpZiBhdmFpbGFibGUgdG8gaW5mb3JtIG91dGxpbmVcbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gcnVuT3V0bGluZVN0ZXAocnVuSWQsIGlucHV0LCByZXNlYXJjaERhdGEpIHtcbiAgICBjb25zb2xlLmxvZyhgW3YwXSBPdXRsaW5lIHN0ZXA6IENyZWF0aW5nIG91dGxpbmUgZm9yIHJ1biAke3J1bklkfWApO1xuICAgIC8vIENyZWF0ZSBjb250ZXh0IGZyb20gYXZhaWxhYmxlIGRhdGEgKG5lZWRlZCBmb3IgZmFsbGJhY2sgaW4gY2F0Y2ggYmxvY2spXG4gICAgY29uc3QgdG9waWMgPSBpbnB1dC5ibG9nX3RvcGljIHx8IGlucHV0LnRvcGljIHx8ICdZb3VyIFRvcGljJztcbiAgICBjb25zdCBwcmltYXJ5S2V5d29yZCA9IGlucHV0LnByaW1hcnlfa2V5d29yZCB8fCAncHJpbWFyeSBrZXl3b3JkJztcbiAgICBjb25zdCBzZWNvbmRhcnlLZXl3b3JkcyA9IChpbnB1dC5zZWNvbmRhcnlfa2V5d29yZHMgfHwgaW5wdXQua2V5d29yZHMgfHwgW10pLmpvaW4oJywgJykgfHwgJ3NlY29uZGFyeSBrZXl3b3Jkcyc7XG4gICAgY29uc3QgYnVzaW5lc3NOYW1lID0gaW5wdXQuYnVzaW5lc3NfbmFtZSB8fCAnWW91ciBCdXNpbmVzcyc7XG4gICAgY29uc3QgYXVkaWVuY2VOb3RlcyA9IGlucHV0LmF1ZGllbmNlX25vdGVzIHx8ICdUYXJnZXQgYXVkaWVuY2Ugbm90IHNwZWNpZmllZCc7XG4gICAgY29uc3QgYnJhbmRWb2ljZSA9IGlucHV0LmJyYW5kX3ZvaWNlX25vdGVzIHx8ICdQcm9mZXNzaW9uYWwgYW5kIGNsZWFyJztcbiAgICBjb25zdCBjdGFOb3RlcyA9IGlucHV0LmN0YV9ub3RlcyB8fCAnRW5jb3VyYWdlIGVuZ2FnZW1lbnQnO1xuICAgIGNvbnN0IGFkZGl0aW9uYWxOb3RlcyA9IGlucHV0LmFkZGl0aW9uYWxfb3JkZXJfbm90ZXMgfHwgJ05vIGFkZGl0aW9uYWwgbm90ZXMnO1xuICAgIGNvbnN0IHRhcmdldFdvcmRDb3VudCA9IGlucHV0LnRhcmdldF93b3JkX2NvdW50IHx8IDE1MDA7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gTG9hZCBhZ2VudCBjb25maWcgZnJvbSBkYXRhYmFzZVxuICAgICAgICBjb25zdCBhZ2VudENvbmZpZyA9IGF3YWl0IGdldEFnZW50Q29uZmlnKCdvdXRsaW5lJyk7XG4gICAgICAgIGlmICghYWdlbnRDb25maWcpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQWN0aXZlIGFnZW50IGNvbmZpZyBub3QgZm91bmQgZm9yIGFnZW50X2tleTogb3V0bGluZScpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFNFTyBCbG9nIEFnZW50IENvbmZpZyBMb2FkZWQ6IG91dGxpbmUgdiR7YWdlbnRDb25maWcudmVyc2lvbn1gKTtcbiAgICAgICAgLy8gQnVpbGQgc3lzdGVtIHByb21wdCBmcm9tIGRhdGFiYXNlIGNvbmZpZ1xuICAgICAgICBjb25zdCBzeXN0ZW1Qcm9tcHQgPSBbXG4gICAgICAgICAgICBhZ2VudENvbmZpZy5zeXN0ZW1fcHJvbXB0LFxuICAgICAgICAgICAgYWdlbnRDb25maWcuc2tpbGxfbWFya2Rvd25cbiAgICAgICAgXS5maWx0ZXIoQm9vbGVhbikuam9pbignXFxuXFxuJyk7XG4gICAgICAgIC8vIEluY2x1ZGUgcmVzZWFyY2ggaW5zaWdodHMgaWYgYXZhaWxhYmxlXG4gICAgICAgIGxldCByZXNlYXJjaENvbnRleHQgPSAnJztcbiAgICAgICAgaWYgKHJlc2VhcmNoRGF0YSkge1xuICAgICAgICAgICAgcmVzZWFyY2hDb250ZXh0ID0gYFxuXG5SZXNlYXJjaCBJbnNpZ2h0cyBmcm9tIFJlc2VhcmNoIEFnZW50OlxuLSBTZWFyY2ggSW50ZW50OiAke3Jlc2VhcmNoRGF0YS5zZWFyY2hfaW50ZW50IHx8ICdOL0EnfVxuLSBDb250ZW50IEFuZ2xlOiAke3Jlc2VhcmNoRGF0YS5jb250ZW50X2FuZ2xlIHx8ICdOL0EnfVxuLSBUYXJnZXQgQXVkaWVuY2U6ICR7cmVzZWFyY2hEYXRhLnRhcmdldF9hdWRpZW5jZV9zdW1tYXJ5IHx8ICdOL0EnfVxuLSBSZWNvbW1lbmRlZCBTZWN0aW9uczogJHtyZXNlYXJjaERhdGEucmVjb21tZW5kZWRfc2VjdGlvbnM/LmpvaW4oJywgJykgfHwgJ04vQSd9XG4tIFF1ZXN0aW9ucyB0byBBbnN3ZXI6ICR7cmVzZWFyY2hEYXRhLnF1ZXN0aW9uc190b19hbnN3ZXI/LmpvaW4oJywgJykgfHwgJ04vQSd9YDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB1c2VyTWVzc2FnZSA9IGBDcmVhdGUgdGhlIE91dGxpbmUgQWdlbnQgSlNPTiB1c2luZyB0aGUgc3VwcGxpZWQgUmVzZWFyY2ggQWdlbnQgb3V0cHV0IGFuZCBmdWxsIEJsb2cgQ29udGV4dCBCcmllZi5cblxuJHtidWlsZEZ1bGxJbnB1dENvbnRleHQoaW5wdXQpfSR7cmVzZWFyY2hDb250ZXh0fVxuXG5SZXR1cm4gdmFsaWQgSlNPTiBvbmx5IHVzaW5nIHRoZSBzY2hlbWEgZnJvbSB5b3VyIHN5c3RlbSBpbnN0cnVjdGlvbnMuIFByZXNlcnZlIG11c3RfaW5jbHVkZSBhbmQgbXVzdF9hdm9pZCByZXN0cmljdGlvbnMsIGFuZCBpbmNsdWRlIGNsaWVudF9nb2FsX25vdGVzIGZvciBlYWNoIHNlY3Rpb24uYDtcbiAgICAgICAgLy8gR2V0IG1vZGVsIG5hbWU6IHVzZSBEQiBjb25maWcgaWYgYXZhaWxhYmxlLCBvdGhlcndpc2UgZmFsbCBiYWNrIHRvIGVudiB2YXIgb3IgZGVmYXVsdFxuICAgICAgICBjb25zdCBtb2RlbE5hbWUgPSBhZ2VudENvbmZpZy5tb2RlbCB8fCBwcm9jZXNzLmVudi5PVVRMSU5FX0FHRU5UX01PREVMIHx8IHByb2Nlc3MuZW52LlJFU0VBUkNIX0FHRU5UX01PREVMIHx8ICdncHQtNS40LW1pbmknO1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBPdXRsaW5lIHN0ZXA6IFVzaW5nIG1vZGVsOiAke21vZGVsTmFtZX1gKTtcbiAgICAgICAgLy8gVXNlIGRpcmVjdCBPcGVuQUkgcHJvdmlkZXJcbiAgICAgICAgY29uc3QgbW9kZWwgPSBvcGVuYWkobW9kZWxOYW1lKTtcbiAgICAgICAgLy8gQ2FsbCBBSSBtb2RlbFxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGdlbmVyYXRlVGV4dCh7XG4gICAgICAgICAgICBtb2RlbCxcbiAgICAgICAgICAgIHN5c3RlbTogc3lzdGVtUHJvbXB0LFxuICAgICAgICAgICAgcHJvbXB0OiB1c2VyTWVzc2FnZSxcbiAgICAgICAgICAgIHRlbXBlcmF0dXJlOiAwLjdcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIE91dGxpbmUgc3RlcDogUmF3IHJlc3BvbnNlIGxlbmd0aDogJHtyZXNwb25zZS50ZXh0Lmxlbmd0aH1gKTtcbiAgICAgICAgLy8gUGFyc2UgdGhlIEpTT04gcmVzcG9uc2VcbiAgICAgICAgY29uc3Qgb3V0bGluZURhdGEgPSBKU09OLnBhcnNlKGV4dHJhY3RKc29uT2JqZWN0KHJlc3BvbnNlLnRleHQpKTtcbiAgICAgICAgLy8gVmFsaWRhdGUgcmVxdWlyZWQgZmllbGRzIGFuZCBhZGQgZGVmYXVsdHNcbiAgICAgICAgb3V0bGluZURhdGEudGltZXN0YW1wID0gb3V0bGluZURhdGEudGltZXN0YW1wIHx8IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICAgICAgb3V0bGluZURhdGEudGFyZ2V0X3dvcmRfY291bnQgPSBvdXRsaW5lRGF0YS50YXJnZXRfd29yZF9jb3VudCB8fCB0YXJnZXRXb3JkQ291bnQ7XG4gICAgICAgIC8vIEVuc3VyZSBzZWN0aW9ucyBhcnJheSBleGlzdHNcbiAgICAgICAgaWYgKCFvdXRsaW5lRGF0YS5zZWN0aW9ucyB8fCAhQXJyYXkuaXNBcnJheShvdXRsaW5lRGF0YS5zZWN0aW9ucykpIHtcbiAgICAgICAgICAgIG91dGxpbmVEYXRhLnNlY3Rpb25zID0gW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGluZzogJ0ludHJvZHVjdGlvbicsXG4gICAgICAgICAgICAgICAgICAgIHB1cnBvc2U6ICdJbnRyb2R1Y2UgdG9waWMgYW5kIHNldCBjb250ZXh0JyxcbiAgICAgICAgICAgICAgICAgICAgZXN0aW1hdGVkX3dvcmRzOiAxNTAsXG4gICAgICAgICAgICAgICAgICAgIGtleV9wb2ludHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICdUb3BpYyBvdmVydmlldycsXG4gICAgICAgICAgICAgICAgICAgICAgICAnV2h5IHRoaXMgbWF0dGVycydcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgc2VvX25vdGVzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAnSW5jbHVkZSBwcmltYXJ5IGtleXdvcmQgbmF0dXJhbGx5J1xuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBjbGllbnRfZ29hbF9ub3RlczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgJ0Nvbm5lY3QgdGhlIHRvcGljIHRvIHRoZSBzdXBwbGllZCBjbGllbnQgZ29hbCB3aGVyZSByZWxldmFudCdcbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBoZWFkaW5nOiAnTWFpbiBDb250ZW50JyxcbiAgICAgICAgICAgICAgICAgICAgcHVycG9zZTogJ0RldGFpbGVkIGV4cGxvcmF0aW9uIG9mIHRvcGljJyxcbiAgICAgICAgICAgICAgICAgICAgZXN0aW1hdGVkX3dvcmRzOiAxMDAwLFxuICAgICAgICAgICAgICAgICAgICBrZXlfcG9pbnRzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAnS2V5IGluc2lnaHQgMScsXG4gICAgICAgICAgICAgICAgICAgICAgICAnS2V5IGluc2lnaHQgMicsXG4gICAgICAgICAgICAgICAgICAgICAgICAnS2V5IGluc2lnaHQgMydcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgc2VvX25vdGVzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAnVXNlIHNlY29uZGFyeSBrZXl3b3JkcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAnQW5zd2VyIHVzZXIgaW50ZW50IHF1ZXN0aW9ucydcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgY2xpZW50X2dvYWxfbm90ZXM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICdVc2Ugc3VwcGxpZWQgYnVzaW5lc3MgZ29hbCBhbmQgc2VydmljZXMgd2l0aG91dCBpbnZlbnRpbmcgY2xhaW1zJ1xuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGhlYWRpbmc6ICdDb25jbHVzaW9uJyxcbiAgICAgICAgICAgICAgICAgICAgcHVycG9zZTogJ1N1bW1hcml6ZSBhbmQgY2FsbCB0byBhY3Rpb24nLFxuICAgICAgICAgICAgICAgICAgICBlc3RpbWF0ZWRfd29yZHM6IDE1MCxcbiAgICAgICAgICAgICAgICAgICAga2V5X3BvaW50czogW1xuICAgICAgICAgICAgICAgICAgICAgICAgJ1N1bW1hcnkgb2Yga2V5IHBvaW50cycsXG4gICAgICAgICAgICAgICAgICAgICAgICAnQ2FsbCB0byBhY3Rpb24nXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIHNlb19ub3RlczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgJ1JlaW5mb3JjZSBwcmltYXJ5IGtleXdvcmQnXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIGNsaWVudF9nb2FsX25vdGVzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAnQ2xvc2Ugd2l0aCB0aGUgc3VwcGxpZWQgQ1RBIGRpcmVjdGlvbidcbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF07XG4gICAgICAgIH1cbiAgICAgICAgb3V0bGluZURhdGEuc2VjdGlvbnMgPSBvdXRsaW5lRGF0YS5zZWN0aW9ucy5tYXAoKHNlY3Rpb24pPT4oe1xuICAgICAgICAgICAgICAgIC4uLnNlY3Rpb24sXG4gICAgICAgICAgICAgICAga2V5X3BvaW50czogQXJyYXkuaXNBcnJheShzZWN0aW9uLmtleV9wb2ludHMpID8gc2VjdGlvbi5rZXlfcG9pbnRzIDogW10sXG4gICAgICAgICAgICAgICAgc2VvX25vdGVzOiBBcnJheS5pc0FycmF5KHNlY3Rpb24uc2VvX25vdGVzKSA/IHNlY3Rpb24uc2VvX25vdGVzIDogW10sXG4gICAgICAgICAgICAgICAgY2xpZW50X2dvYWxfbm90ZXM6IEFycmF5LmlzQXJyYXkoc2VjdGlvbi5jbGllbnRfZ29hbF9ub3RlcykgPyBzZWN0aW9uLmNsaWVudF9nb2FsX25vdGVzIDogW10sXG4gICAgICAgICAgICAgICAgZXN0aW1hdGVkX3dvcmRzOiB0eXBlb2Ygc2VjdGlvbi5lc3RpbWF0ZWRfd29yZHMgPT09ICdudW1iZXInID8gc2VjdGlvbi5lc3RpbWF0ZWRfd29yZHMgOiAwXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIG91dGxpbmVEYXRhLm5lZWRzX3JldmlldyA9IEJvb2xlYW4ob3V0bGluZURhdGEubmVlZHNfcmV2aWV3KTtcbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gT3V0bGluZSBzdGVwOiBHZW5lcmF0ZWQgb3V0bGluZSB3aXRoICR7b3V0bGluZURhdGEuc2VjdGlvbnMubGVuZ3RofSBzZWN0aW9uc2ApO1xuICAgICAgICAvLyBQZXJzaXN0IG91dGxpbmVfanNvbiB0byBkYXRhYmFzZVxuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBPdXRsaW5lIHN0ZXA6IFBlcnNpc3Rpbmcgb3V0bGluZV9qc29uIGZvciBydW4gJHtydW5JZH1gKTtcbiAgICAgICAgYXdhaXQgdXBkYXRlUnVuU3RhdHVzKHJ1bklkLCAnb3V0bGluaW5nJywgb3V0bGluZURhdGEpO1xuICAgICAgICByZXR1cm4gb3V0bGluZURhdGE7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgW3YwXSBPdXRsaW5lIHN0ZXAgZXJyb3I6YCwgZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpKTtcbiAgICAgICAgLy8gUmV0dXJuIGZhbGxiYWNrIG91dGxpbmUgaWYgcGFyc2luZyBvciBBSSBjYWxsIGZhaWxzXG4gICAgICAgIGNvbnN0IGZhbGxiYWNrT3V0bGluZSA9IHtcbiAgICAgICAgICAgIHRpdGxlOiBgJHt0b3BpY30gLSBDb21wcmVoZW5zaXZlIEd1aWRlIHwgJHtidXNpbmVzc05hbWV9YCxcbiAgICAgICAgICAgIG1ldGFfYW5nbGU6IGBFdmVyeXRoaW5nIHlvdSBuZWVkIHRvIGtub3cgYWJvdXQgJHt0b3BpY30gZm9yICR7YnVzaW5lc3NOYW1lfWAsXG4gICAgICAgICAgICB0YXJnZXRfd29yZF9jb3VudDogdGFyZ2V0V29yZENvdW50LFxuICAgICAgICAgICAgc2VjdGlvbnM6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGhlYWRpbmc6ICdJbnRyb2R1Y3Rpb246IFVuZGVyc3RhbmRpbmcgdGhlIEJhc2ljcycsXG4gICAgICAgICAgICAgICAgICAgIHB1cnBvc2U6ICdTZXQgY29udGV4dCBhbmQgaW50cm9kdWNlIHRoZSB0b3BpYycsXG4gICAgICAgICAgICAgICAgICAgIGVzdGltYXRlZF93b3JkczogMjAwLFxuICAgICAgICAgICAgICAgICAgICBrZXlfcG9pbnRzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBgT3ZlcnZpZXcgb2YgJHt0b3BpY31gLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ1doeSB0aGlzIHRvcGljIG1hdHRlcnMgdG8geW91ciBhdWRpZW5jZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAnV2hhdCB5b3Ugd2lsbCBsZWFybidcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgc2VvX25vdGVzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAnSW5jbHVkZSBwcmltYXJ5IGtleXdvcmQgaW4gZmlyc3QgcGFyYWdyYXBoJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdVc2UgZW5nYWdpbmcgaG9vaydcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgY2xpZW50X2dvYWxfbm90ZXM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICdJbnRyb2R1Y2Ugd2h5IHRoaXMgdG9waWMgbWF0dGVycyBmb3IgdGhlIHN1cHBsaWVkIGF1ZGllbmNlIGFuZCBidXNpbmVzcyBnb2FsJ1xuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGhlYWRpbmc6ICdLZXkgQ29uY2VwdHMgYW5kIEJlbmVmaXRzJyxcbiAgICAgICAgICAgICAgICAgICAgcHVycG9zZTogJ0V4cGxvcmUgY29yZSBjb25jZXB0cyBhbmQgYWR2YW50YWdlcycsXG4gICAgICAgICAgICAgICAgICAgIGVzdGltYXRlZF93b3JkczogNDAwLFxuICAgICAgICAgICAgICAgICAgICBrZXlfcG9pbnRzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAnQ29yZSBjb25jZXB0IDEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0NvcmUgY29uY2VwdCAyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdIb3cgYnVzaW5lc3NlcyBiZW5lZml0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdSZWFsLXdvcmxkIGFwcGxpY2F0aW9ucydcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgc2VvX25vdGVzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAnVXNlIHNlY29uZGFyeSBrZXl3b3JkcyBuYXR1cmFsbHknLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0Fuc3dlciBjb21tb24gcXVlc3Rpb25zJ1xuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBjbGllbnRfZ29hbF9ub3RlczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgJ1RpZSBiZW5lZml0cyBiYWNrIHRvIHRoZSBzdXBwbGllZCBzZXJ2aWNlIG9yIENUQSBvbmx5IHdoZW4gc3VwcG9ydGVkJ1xuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGhlYWRpbmc6ICdCZXN0IFByYWN0aWNlcyBhbmQgSW1wbGVtZW50YXRpb24nLFxuICAgICAgICAgICAgICAgICAgICBwdXJwb3NlOiAnUHJvdmlkZSBhY3Rpb25hYmxlIGd1aWRhbmNlJyxcbiAgICAgICAgICAgICAgICAgICAgZXN0aW1hdGVkX3dvcmRzOiA1MDAsXG4gICAgICAgICAgICAgICAgICAgIGtleV9wb2ludHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICdTdGVwLWJ5LXN0ZXAgaW1wbGVtZW50YXRpb24nLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0Jlc3QgcHJhY3RpY2VzIGluIHRoZSBpbmR1c3RyeScsXG4gICAgICAgICAgICAgICAgICAgICAgICAnQ29tbW9uIG1pc3Rha2VzIHRvIGF2b2lkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdUb29scyBhbmQgcmVzb3VyY2VzJ1xuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBzZW9fbm90ZXM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICdVc2UgbG9uZy10YWlsIGtleXdvcmRzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdJbmNsdWRlIHByYWN0aWNhbCBleGFtcGxlcydcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgY2xpZW50X2dvYWxfbm90ZXM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICdLZWVwIHJlY29tbWVuZGF0aW9ucyBncm91bmRlZCBpbiB0aGUgc3VwcGxpZWQgY29udGV4dCdcbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBoZWFkaW5nOiAnQ29uY2x1c2lvbiBhbmQgTmV4dCBTdGVwcycsXG4gICAgICAgICAgICAgICAgICAgIHB1cnBvc2U6ICdTdW1tYXJpemUgYW5kIGd1aWRlIHJlYWRlciBhY3Rpb24nLFxuICAgICAgICAgICAgICAgICAgICBlc3RpbWF0ZWRfd29yZHM6IDE1MCxcbiAgICAgICAgICAgICAgICAgICAga2V5X3BvaW50czogW1xuICAgICAgICAgICAgICAgICAgICAgICAgJ0tleSB0YWtlYXdheXMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ1JlY29tbWVuZGVkIG5leHQgc3RlcHMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0NhbGwgdG8gYWN0aW9uJ1xuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBzZW9fbm90ZXM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICdSZWluZm9yY2UgcHJpbWFyeSBrZXl3b3JkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdDcmVhdGUgdXJnZW5jeSBmb3IgQ1RBJ1xuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBjbGllbnRfZ29hbF9ub3RlczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgJ1VzZSB0aGUgc3VwcGxpZWQgQ1RBIGRpcmVjdGlvbiB3aXRob3V0IGludmVudGluZyBvZmZlcnMnXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgaW50cm9fZ3VpZGFuY2U6IGBTdGFydCB3aXRoIGEgY29tcGVsbGluZyBob29rIHRoYXQgYWRkcmVzc2VzIHRoZSByZWFkZXIncyBwYWluIHBvaW50LiBJbnRyb2R1Y2UgJHt0b3BpY30gaW4gdGhlIGNvbnRleHQgb2YgJHtidXNpbmVzc05hbWV9IGFuZCBleHBsYWluIHdoeSBpdCBtYXR0ZXJzIHRvIHRoZSB0YXJnZXQgYXVkaWVuY2UuIEluY2x1ZGUgdGhlIHByaW1hcnkga2V5d29yZCBcIiR7cHJpbWFyeUtleXdvcmR9XCIgbmF0dXJhbGx5IGluIHRoZSBmaXJzdCAxMDAgd29yZHMuYCxcbiAgICAgICAgICAgIGNvbmNsdXNpb25fZ3VpZGFuY2U6IGBTdW1tYXJpemUgdGhlIG1haW4gdGFrZWF3YXlzIGZyb20gZWFjaCBzZWN0aW9uLiBSZWluZm9yY2UgaG93IHVuZGVyc3RhbmRpbmcgJHt0b3BpY30gYmVuZWZpdHMgdGhlIHJlYWRlci4gSW5jbHVkZSBhIGNsZWFyLCBjb21wZWxsaW5nIGNhbGwtdG8tYWN0aW9uIHRoYXQgZ3VpZGVzIHRoZSByZWFkZXIgb24gbmV4dCBzdGVwcy4gRW5kIHdpdGggdGhlIHByaW1hcnkga2V5d29yZCBuYXR1cmFsbHkgaW5jb3Jwb3JhdGVkLmAsXG4gICAgICAgICAgICBjdGFfZ3VpZGFuY2U6IGAke2N0YU5vdGVzfS4gRW5zdXJlIHRoZSBDVEEgaXMgY2xlYXIsIHNwZWNpZmljLCBhbmQgcmVsZXZhbnQgdG8gdGhlIGFydGljbGUgY29udGVudC4gRXhhbXBsZXM6IFwiU2NoZWR1bGUgYSBjb25zdWx0YXRpb24sXCIgXCJEb3dubG9hZCBvdXIgZ3VpZGUsXCIgXCJHZXQgc3RhcnRlZCB0b2RheSxcIiBcIkpvaW4gb3VyIGNvbW11bml0eS5cImAsXG4gICAgICAgICAgICBpbnRlcm5hbF9saW5rX29wcG9ydHVuaXRpZXM6IFtcbiAgICAgICAgICAgICAgICAnTGluayB0byByZWxldmFudCBzZXJ2aWNlIHBhZ2VzIG9uIGNvbXBhbnkgd2Vic2l0ZScsXG4gICAgICAgICAgICAgICAgJ0xpbmsgdG8gcmVsYXRlZCBibG9nIHBvc3RzIG9uIHNpbWlsYXIgdG9waWNzJyxcbiAgICAgICAgICAgICAgICAnTGluayB0byBjYXNlIHN0dWRpZXMgb3Igc3VjY2VzcyBzdG9yaWVzJyxcbiAgICAgICAgICAgICAgICAnTGluayB0byByZXNvdXJjZSBwYWdlcyBvciB0b29scydcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBuZWVkc19yZXZpZXc6IHRydWUsXG4gICAgICAgICAgICBub3Rlc19mb3Jfd3JpdGVyOiBbXG4gICAgICAgICAgICAgICAgYFJlbWVtYmVyIHRvIG1haW50YWluIGEgJHticmFuZFZvaWNlfSB0b25lIHRocm91Z2hvdXRgLFxuICAgICAgICAgICAgICAgIGBBZGRyZXNzIHRoZSBuZWVkcyBvZjogJHthdWRpZW5jZU5vdGVzfWAsXG4gICAgICAgICAgICAgICAgYEVuc3VyZSB0aGUgY29udGVudCBpcyB3ZWxsLXJlc2VhcmNoZWQgYW5kIGluY2x1ZGVzIHNwZWNpZmljIGV4YW1wbGVzYCxcbiAgICAgICAgICAgICAgICBgVXNlIHN1YmhlYWRpbmdzIHRvIGltcHJvdmUgcmVhZGFiaWxpdHkgYW5kIFNFT2AsXG4gICAgICAgICAgICAgICAgYEluY2x1ZGUgcmVsZXZhbnQgZGF0YSwgc3RhdGlzdGljcywgb3IgcmVzZWFyY2ggZmluZGluZ3Mgd2hlcmUgYXBwcm9wcmlhdGVgLFxuICAgICAgICAgICAgICAgIGBFbmQgd2l0aCBhIHN0cm9uZyBDVEEgYWxpZ25lZCB3aXRoOiAke2N0YU5vdGVzfWBcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgICAgICB9O1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBPdXRsaW5lIHN0ZXA6IFVzaW5nIGZhbGxiYWNrIG91dGxpbmUgZHVlIHRvIGVycm9yYCk7XG4gICAgICAgIHJldHVybiBmYWxsYmFja091dGxpbmU7XG4gICAgfVxufVxucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvb3V0bGluZS1zdGVwLy9ydW5PdXRsaW5lU3RlcFwiLCBydW5PdXRsaW5lU3RlcCk7XG4iLCAiaW1wb3J0IHsgcmVnaXN0ZXJTdGVwRnVuY3Rpb24gfSBmcm9tIFwid29ya2Zsb3cvaW50ZXJuYWwvcHJpdmF0ZVwiO1xuaW1wb3J0ICdzZXJ2ZXItb25seSc7XG5pbXBvcnQgeyBnZW5lcmF0ZVRleHQgfSBmcm9tICdhaSc7XG5pbXBvcnQgeyBvcGVuYWkgfSBmcm9tICdAYWktc2RrL29wZW5haSc7XG5pbXBvcnQgeyB1cGRhdGVSdW5TdGF0dXMgfSBmcm9tICcuLi8uLi9zdG9yYWdlL3J1bnMnO1xuaW1wb3J0IHsgZ2V0QWdlbnRDb25maWcgfSBmcm9tICcuLi8uLi9zdG9yYWdlL2FnZW50LWNvbmZpZ3MnO1xuaW1wb3J0IHsgYnVpbGRGdWxsSW5wdXRDb250ZXh0LCBleHRyYWN0SnNvbk9iamVjdCB9IGZyb20gJy4vY29udGV4dC1idWlsZGVyJztcbi8qKl9faW50ZXJuYWxfd29ya2Zsb3dze1wic3RlcHNcIjp7XCJsaWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3Jlc2VhcmNoLXN0ZXAudHNcIjp7XCJydW5SZXNlYXJjaFN0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9yZXNlYXJjaC1zdGVwLy9ydW5SZXNlYXJjaFN0ZXBcIn19fX0qLztcbi8qKlxuICogUmVzZWFyY2ggU3RlcCAtIFBoYXNlIDJDLUFcbiAqIFJ1bnMgaW5zaWRlIGEgZHVyYWJsZSBzdGVwIGZ1bmN0aW9uIChoYXMgTm9kZS5qcyBhY2Nlc3MpXG4gKiBDYWxscyBBSSBtb2RlbCB0byBnZW5lcmF0ZSByZXNlYXJjaCBKU09OXG4gKiBObyBmaWxlc3lzdGVtIGltcG9ydHMgLSBzYWZlIGZvciB3b3JrZmxvdyBjb250ZXh0XG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJ1blJlc2VhcmNoU3RlcChydW5JZCwgaW5wdXQpIHtcbiAgICBjb25zb2xlLmxvZyhgW3YwXSBSZXNlYXJjaCBzdGVwOiBBbmFseXppbmcgdG9waWMgZm9yIHJ1biAke3J1bklkfWApO1xuICAgIHRyeSB7XG4gICAgICAgIC8vIExvYWQgYWdlbnQgY29uZmlnIGZyb20gZGF0YWJhc2VcbiAgICAgICAgY29uc3QgYWdlbnRDb25maWcgPSBhd2FpdCBnZXRBZ2VudENvbmZpZygncmVzZWFyY2gnKTtcbiAgICAgICAgaWYgKCFhZ2VudENvbmZpZykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBY3RpdmUgYWdlbnQgY29uZmlnIG5vdCBmb3VuZCBmb3IgYWdlbnRfa2V5OiByZXNlYXJjaCcpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFNFTyBCbG9nIEFnZW50IENvbmZpZyBMb2FkZWQ6IHJlc2VhcmNoIHYke2FnZW50Q29uZmlnLnZlcnNpb259YCk7XG4gICAgICAgIC8vIEJ1aWxkIHN5c3RlbSBwcm9tcHQgZnJvbSBkYXRhYmFzZSBjb25maWdcbiAgICAgICAgY29uc3Qgc3lzdGVtUHJvbXB0ID0gW1xuICAgICAgICAgICAgYWdlbnRDb25maWcuc3lzdGVtX3Byb21wdCxcbiAgICAgICAgICAgIGFnZW50Q29uZmlnLnNraWxsX21hcmtkb3duXG4gICAgICAgIF0uZmlsdGVyKEJvb2xlYW4pLmpvaW4oJ1xcblxcbicpO1xuICAgICAgICBjb25zdCB1c2VyTWVzc2FnZSA9IGBDcmVhdGUgdGhlIFJlc2VhcmNoIEFnZW50IEpTT04gdXNpbmcgYWxsIHN1cHBsaWVkIGNvbnRleHQuXG5cbiR7YnVpbGRGdWxsSW5wdXRDb250ZXh0KGlucHV0KX1cblxuUmV0dXJuIHZhbGlkIEpTT04gb25seSB1c2luZyB0aGUgc2NoZW1hIGZyb20geW91ciBzeXN0ZW0gaW5zdHJ1Y3Rpb25zLiBEbyBub3Qgd3JpdGUgdGhlIGJsb2cgb3Igb3V0bGluZS4gUHJlc2VydmUgbXVzdF9pbmNsdWRlIGFuZCBtdXN0X2F2b2lkIGV4YWN0bHkgd2hlcmUgcHJvdmlkZWQuYDtcbiAgICAgICAgLy8gR2V0IG1vZGVsIG5hbWU6IHVzZSBEQiBjb25maWcgaWYgYXZhaWxhYmxlLCBvdGhlcndpc2UgZmFsbCBiYWNrIHRvIGVudiB2YXIgb3IgZGVmYXVsdFxuICAgICAgICBjb25zdCBtb2RlbE5hbWUgPSBhZ2VudENvbmZpZy5tb2RlbCB8fCBwcm9jZXNzLmVudi5SRVNFQVJDSF9BR0VOVF9NT0RFTCB8fCAnZ3B0LTUuNC1taW5pJztcbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gUmVzZWFyY2ggc3RlcDogVXNpbmcgbW9kZWw6ICR7bW9kZWxOYW1lfWApO1xuICAgICAgICAvLyBVc2UgZGlyZWN0IE9wZW5BSSBwcm92aWRlciB3aXRoIE9QRU5BSV9BUElfS0VZXG4gICAgICAgIGNvbnN0IG1vZGVsID0gb3BlbmFpKG1vZGVsTmFtZSk7XG4gICAgICAgIC8vIENhbGwgQUkgbW9kZWxcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBnZW5lcmF0ZVRleHQoe1xuICAgICAgICAgICAgbW9kZWwsXG4gICAgICAgICAgICBzeXN0ZW06IHN5c3RlbVByb21wdCxcbiAgICAgICAgICAgIHByb21wdDogdXNlck1lc3NhZ2UsXG4gICAgICAgICAgICB0ZW1wZXJhdHVyZTogMC43XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBSZXNlYXJjaCBzdGVwOiBBSSBtb2RlbCByZXNwb25kZWQsIHBhcnNpbmcgSlNPTmApO1xuICAgICAgICAvLyBQYXJzZSBKU09OIHJlc3BvbnNlXG4gICAgICAgIGxldCByZXNlYXJjaERhdGE7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBUcnkgdG8gZXh0cmFjdCBKU09OIGZyb20gcmVzcG9uc2UgKGluIGNhc2Ugb2YgZXh0cmEgdGV4dClcbiAgICAgICAgICAgIHJlc2VhcmNoRGF0YSA9IEpTT04ucGFyc2UoZXh0cmFjdEpzb25PYmplY3QocmVzcG9uc2UudGV4dCkpO1xuICAgICAgICAgICAgLy8gVmFsaWRhdGUgcmVxdWlyZWQgZmllbGRzIGF0IHJ1bnRpbWVcbiAgICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheShyZXNlYXJjaERhdGEua2V5X2ZpbmRpbmdzKSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignUmVzZWFyY2ggb3V0cHV0IG1pc3NpbmcgcmVxdWlyZWQga2V5X2ZpbmRpbmdzIGFycmF5Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocmVzZWFyY2hEYXRhLmtleV9maW5kaW5ncy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Jlc2VhcmNoIG91dHB1dCBrZXlfZmluZGluZ3MgYXJyYXkgY2Fubm90IGJlIGVtcHR5Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKHBhcnNlRXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbdjBdIFJlc2VhcmNoIHN0ZXA6IEZhaWxlZCB0byBwYXJzZSBBSSByZXNwb25zZTpgLCByZXNwb25zZS50ZXh0LnN1YnN0cmluZygwLCAyMDApKTtcbiAgICAgICAgICAgIC8vIFJldHVybiBmYWxsYmFjayBpZiBwYXJzaW5nIGZhaWxzXG4gICAgICAgICAgICByZXNlYXJjaERhdGEgPSB7XG4gICAgICAgICAgICAgICAgc2VhcmNoX2ludGVudDogJ2luZm9ybWF0aW9uYWwnLFxuICAgICAgICAgICAgICAgIHRhcmdldF9hdWRpZW5jZV9zdW1tYXJ5OiBpbnB1dC5hdWRpZW5jZV9ub3RlcyB8fCAnVGFyZ2V0IGF1ZGllbmNlIG5vdCBzcGVjaWZpZWQnLFxuICAgICAgICAgICAgICAgIGtleXdvcmRfbWFwOiB7XG4gICAgICAgICAgICAgICAgICAgIHByaW1hcnlfa2V5d29yZDogaW5wdXQucHJpbWFyeV9rZXl3b3JkIHx8ICdwcmltYXJ5IGtleXdvcmQnLFxuICAgICAgICAgICAgICAgICAgICBzZWNvbmRhcnlfa2V5d29yZHM6IGlucHV0LnNlY29uZGFyeV9rZXl3b3JkcyB8fCBbXSxcbiAgICAgICAgICAgICAgICAgICAgbHNpX3Rlcm1zOiBbXVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY29udGVudF9hbmdsZTogYEZvY3VzIG9uICR7aW5wdXQuYmxvZ190b3BpYyB8fCAndG9waWMnfWAsXG4gICAgICAgICAgICAgICAga2V5X2ZpbmRpbmdzOiBbXG4gICAgICAgICAgICAgICAgICAgIGBUb3BpYyBmb2N1c2VzIG9uICR7aW5wdXQuYmxvZ190b3BpYyB8fCAndGhlIHN1YmplY3QgbWF0dGVyJ31gLFxuICAgICAgICAgICAgICAgICAgICBgVGFyZ2V0IGF1ZGllbmNlOiAke2lucHV0LmF1ZGllbmNlX25vdGVzIHx8ICdnZW5lcmFsIGF1ZGllbmNlJ31gLFxuICAgICAgICAgICAgICAgICAgICBgUHJpbWFyeSBrZXl3b3JkOiAke2lucHV0LnByaW1hcnlfa2V5d29yZCB8fCAndG8gYmUgZGV0ZXJtaW5lZCd9YFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgY29tcGV0aXRvcl9pbnNpZ2h0czogW1xuICAgICAgICAgICAgICAgICAgICAnQ29tcGV0aXRvciBjb250ZXh0IHdhcyBub3QgYXZhaWxhYmxlIGluIHBhcnNlZCBtb2RlbCBvdXRwdXQnXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZWNvbW1lbmRlZF9zZWN0aW9uczogW1xuICAgICAgICAgICAgICAgICAgICAnSW50cm9kdWN0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgJ01haW4gQ29udGVudCcsXG4gICAgICAgICAgICAgICAgICAgICdDb25jbHVzaW9uJ1xuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcXVlc3Rpb25zX3RvX2Fuc3dlcjogW1xuICAgICAgICAgICAgICAgICAgICAnV2hhdCBpcyB0aGUgbWFpbiB0b3BpYz8nXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBjbGllbnRfZ29hbF9hbGlnbm1lbnQ6IGlucHV0LmJsb2dfY29udGV4dF9icmllZj8uYnVzaW5lc3NfZ29hbCB8fCBpbnB1dC5idXNpbmVzc19nb2FsIHx8ICdDbGllbnQgZ29hbCBub3Qgc3BlY2lmaWVkJyxcbiAgICAgICAgICAgICAgICBtdXN0X2luY2x1ZGU6IGlucHV0LmJsb2dfY29udGV4dF9icmllZj8ubXVzdF9pbmNsdWRlIHx8IGlucHV0Lm11c3RfaW5jbHVkZSB8fCBbXSxcbiAgICAgICAgICAgICAgICBtdXN0X2F2b2lkOiBpbnB1dC5ibG9nX2NvbnRleHRfYnJpZWY/Lm11c3RfYXZvaWQgfHwgaW5wdXQubXVzdF9hdm9pZCB8fCBbXSxcbiAgICAgICAgICAgICAgICByZXNlYXJjaF9ub3RlczogJ0ZhbGxiYWNrIHJlc2VhcmNoIGR1ZSB0byBwYXJzaW5nIGVycm9yOyBodW1hbiByZXZpZXcgcmVjb21tZW5kZWQnLFxuICAgICAgICAgICAgICAgIHRhcmdldF93b3JkX2NvdW50OiBpbnB1dC50YXJnZXRfd29yZF9jb3VudCB8fCAxMDAwLFxuICAgICAgICAgICAgICAgIHdlYl9zZWFyY2hfdXNlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgbmVlZHNfcmV2aWV3OiB0cnVlLFxuICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIC8vIFBlcnNpc3QgcmVzZWFyY2hfanNvbiB0byBkYXRhYmFzZVxuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBSZXNlYXJjaCBzdGVwOiBQZXJzaXN0aW5nIHJlc2VhcmNoX2pzb24gZm9yIHJ1biAke3J1bklkfWApO1xuICAgICAgICBhd2FpdCB1cGRhdGVSdW5TdGF0dXMocnVuSWQsICdyZXNlYXJjaGluZycsIHJlc2VhcmNoRGF0YSk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFJlc2VhcmNoIHN0ZXA6IENvbXBsZXRlIGZvciBydW4gJHtydW5JZH1gKTtcbiAgICAgICAgcmV0dXJuIHJlc2VhcmNoRGF0YTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKGBbdjBdIFJlc2VhcmNoIHN0ZXAgZXJyb3IgZm9yIHJ1biAke3J1bklkfTpgLCBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcikpO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG59XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9yZXNlYXJjaC1zdGVwLy9ydW5SZXNlYXJjaFN0ZXBcIiwgcnVuUmVzZWFyY2hTdGVwKTtcbiIsICJpbXBvcnQgeyByZWdpc3RlclN0ZXBGdW5jdGlvbiB9IGZyb20gXCJ3b3JrZmxvdy9pbnRlcm5hbC9wcml2YXRlXCI7XG5pbXBvcnQgJ3NlcnZlci1vbmx5JztcbmltcG9ydCB7IGdlbmVyYXRlVGV4dCB9IGZyb20gJ2FpJztcbmltcG9ydCB7IG9wZW5haSB9IGZyb20gJ0BhaS1zZGsvb3BlbmFpJztcbmltcG9ydCB7IGdldEFnZW50Q29uZmlnIH0gZnJvbSAnLi4vLi4vc3RvcmFnZS9hZ2VudC1jb25maWdzJztcbmltcG9ydCB7IGJ1aWxkRnVsbElucHV0Q29udGV4dCB9IGZyb20gJy4vY29udGV4dC1idWlsZGVyJztcbi8qKl9faW50ZXJuYWxfd29ya2Zsb3dze1wic3RlcHNcIjp7XCJsaWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3JldmlzaW9uLXN0ZXAudHNcIjp7XCJydW5SZXZpc2lvblN0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9yZXZpc2lvbi1zdGVwLy9ydW5SZXZpc2lvblN0ZXBcIn19fX0qLztcbi8qKlxuICogUmV2aXNpb24gQWdlbnQgU3RlcFxuICogUmV2aXNlcyBhbiBleGlzdGluZyBkcmFmdCBiYXNlZCBvbiByZXZpZXdlciBmZWVkYmFjay5cbiAqIERvZXMgTk9UIHVwZGF0ZSB0aGUgZGF0YWJhc2Ugb3IgY2FsbCBjYWxsYmFja3MuXG4gKiBSZXR1cm5zIHJldmlzZWQgTWFya2Rvd24gb25seSwgZm9yIHVzZSBieSByZXZpc2lvbi13b3JrZmxvdy50cy5cbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gcnVuUmV2aXNpb25TdGVwKGN1cnJlbnREcmFmdCwgcmV2aWV3ZXJGZWVkYmFjaywgcmV2aXNpb25Nb2RlLCBpbnB1dCwgcmVzZWFyY2gsIG91dGxpbmUsIHNlb1FhLCBtZXRhKSB7XG4gICAgY29uc29sZS5sb2coYFt2MF0gUmV2aXNpb24gc3RlcDogU3RhcnRpbmcgd2l0aCBtb2RlOiAke3JldmlzaW9uTW9kZX1gKTtcbiAgICB0cnkge1xuICAgICAgICAvLyBMb2FkIGFnZW50IGNvbmZpZyBmcm9tIGRhdGFiYXNlXG4gICAgICAgIGNvbnN0IGFnZW50Q29uZmlnID0gYXdhaXQgZ2V0QWdlbnRDb25maWcoJ3JldmlzaW9uJyk7XG4gICAgICAgIGlmICghYWdlbnRDb25maWcpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQWN0aXZlIGFnZW50IGNvbmZpZyBub3QgZm91bmQgZm9yIGFnZW50X2tleTogcmV2aXNpb24nKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBTRU8gQmxvZyBBZ2VudCBDb25maWcgTG9hZGVkOiByZXZpc2lvbiB2JHthZ2VudENvbmZpZy52ZXJzaW9ufWApO1xuICAgICAgICAvLyBCdWlsZCBzeXN0ZW0gcHJvbXB0IGZyb20gZGF0YWJhc2UgY29uZmlnXG4gICAgICAgIGNvbnN0IHN5c3RlbVByb21wdCA9IFtcbiAgICAgICAgICAgIGFnZW50Q29uZmlnLnN5c3RlbV9wcm9tcHQsXG4gICAgICAgICAgICBhZ2VudENvbmZpZy5za2lsbF9tYXJrZG93blxuICAgICAgICBdLmZpbHRlcihCb29sZWFuKS5qb2luKCdcXG5cXG4nKTtcbiAgICAgICAgLy8gQnVpbGQgcmV2aXNpb24gaW5zdHJ1Y3Rpb24gYmFzZWQgb24gbW9kZVxuICAgICAgICBjb25zdCByZXZpc2lvbkluc3RydWN0aW9uID0gcmV2aXNpb25Nb2RlID09PSAnaGVhdnlfcmV2aXNpb24nID8gJ0FwcGx5IGNvbXByZWhlbnNpdmUgY2hhbmdlcy4gUmVzdHJ1Y3R1cmUgc2VjdGlvbnMgaWYgbmVlZGVkLiBSZXdyaXRlIHBhcmFncmFwaHMgZm9yIGNsYXJpdHkgYW5kIFNFTy4gQmUgdGhvcm91Z2guJyA6ICdBcHBseSBmb2N1c2VkIGNoYW5nZXMuIFBvbGlzaCBleGlzdGluZyBzdHJ1Y3R1cmUuIFJlZmluZSB3b3JkaW5nIGFuZCBjbGFyaXR5LiBLZWVwIHNlY3Rpb25zIGludGFjdC4nO1xuICAgICAgICAvLyBCdWlsZCBjb250ZXh0IHdpdGggZnVsbCBCbG9nIENvbnRleHQgQnJpZWYgaWYgaW5wdXQgaXMgYXZhaWxhYmxlXG4gICAgICAgIGxldCBjb250ZXh0QmxvY2sgPSAnJztcbiAgICAgICAgaWYgKGlucHV0KSB7XG4gICAgICAgICAgICBjb250ZXh0QmxvY2sgPSBgXFxuXFxuJHtidWlsZEZ1bGxJbnB1dENvbnRleHQoaW5wdXQpfWA7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQWRkIGFkZGl0aW9uYWwgY29udGV4dCBmcm9tIG90aGVyIGFnZW50cyBpZiBhdmFpbGFibGVcbiAgICAgICAgbGV0IGFkZGl0aW9uYWxDb250ZXh0ID0gW107XG4gICAgICAgIGlmIChyZXNlYXJjaCkge1xuICAgICAgICAgICAgY29uc3QgZmluZGluZ3MgPSByZXNlYXJjaC5rZXlfZmluZGluZ3MgfHwgW107XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShmaW5kaW5ncykgJiYgZmluZGluZ3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGFkZGl0aW9uYWxDb250ZXh0LnB1c2goYFxcblxcblByZXZpb3VzIFJlc2VhcmNoIEZpbmRpbmdzOlxcbiR7ZmluZGluZ3MubWFwKChmKT0+YC0gJHt0eXBlb2YgZiA9PT0gJ3N0cmluZycgPyBmIDogSlNPTi5zdHJpbmdpZnkoZil9YCkuam9pbignXFxuJyl9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG91dGxpbmUpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlY3Rpb25zID0gKG91dGxpbmUuc2VjdGlvbnMgfHwgW10pLm1hcCgocyk9PmAjIyAke3R5cGVvZiBzID09PSAnc3RyaW5nJyA/IHMgOiBzLmhlYWRpbmcgfHwgJ1NlY3Rpb24nfWApO1xuICAgICAgICAgICAgaWYgKHNlY3Rpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBhZGRpdGlvbmFsQ29udGV4dC5wdXNoKGBcXG5cXG5PcmlnaW5hbCBPdXRsaW5lIFN0cnVjdHVyZTpcXG4ke3NlY3Rpb25zLmpvaW4oJ1xcbicpfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChzZW9RYSkge1xuICAgICAgICAgICAgY29uc3Qgc2VvUWFPYmogPSBzZW9RYTtcbiAgICAgICAgICAgIGFkZGl0aW9uYWxDb250ZXh0LnB1c2goYFxcblxcblNFTyBRQSBSZXN1bHRzOlxcbk92ZXJhbGwgU2NvcmU6ICR7c2VvUWFPYmoub3ZlcmFsbF9zY29yZSB8fCAnTi9BJ30vMTAwYCk7XG4gICAgICAgICAgICBpZiAoc2VvUWFPYmoucHJpb3JpdHlfZml4ZXMgJiYgQXJyYXkuaXNBcnJheShzZW9RYU9iai5wcmlvcml0eV9maXhlcykpIHtcbiAgICAgICAgICAgICAgICBhZGRpdGlvbmFsQ29udGV4dC5wdXNoKGBQcmlvcml0eSBGaXhlczogJHtzZW9RYU9iai5wcmlvcml0eV9maXhlcy5qb2luKCc7ICcpfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChtZXRhKSB7XG4gICAgICAgICAgICBjb25zdCBtZXRhT2JqID0gbWV0YTtcbiAgICAgICAgICAgIGFkZGl0aW9uYWxDb250ZXh0LnB1c2goYFxcblxcbk1ldGEgSW5mb3JtYXRpb246XFxuTWV0YSBUaXRsZTogJHttZXRhT2JqLm1ldGFfdGl0bGUgfHwgJ04vQSd9XFxuTWV0YSBEZXNjcmlwdGlvbjogJHttZXRhT2JqLm1ldGFfZGVzY3JpcHRpb24gfHwgJ04vQSd9YCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQnVpbGQgdXNlciBtZXNzYWdlXG4gICAgICAgIGNvbnN0IHVzZXJNZXNzYWdlID0gYFJldmlzZSB0aGUgYmxvZyBkcmFmdCBiZWxvdyB1c2luZyB0aGUgcmV2aWV3ZXIgZmVlZGJhY2sgcHJvdmlkZWQuXG5cblJldmlzaW9uIE1vZGU6ICR7cmV2aXNpb25Nb2RlfVxuJHtyZXZpc2lvbkluc3RydWN0aW9ufVxuXG5SZXZpZXdlciBGZWVkYmFjazpcbiR7cmV2aWV3ZXJGZWVkYmFja30ke2NvbnRleHRCbG9ja30ke2FkZGl0aW9uYWxDb250ZXh0LmpvaW4oJycpfVxuXG5DdXJyZW50IERyYWZ0IE1hcmtkb3duOlxuJHtjdXJyZW50RHJhZnR9XG5cblJldHVybiB0aGUgcmV2aXNlZCBibG9nIGluIE1hcmtkb3duIG9ubHkuIERvIG5vdCByZXR1cm4gSlNPTi4gRG8gbm90IGluY2x1ZGUgZXhwbGFuYXRpb25zLCByZXZpc2lvbiBub3RlcywgbWFya2Rvd24gZmVuY2VzLCBvciBjb21tZW50cyBvdXRzaWRlIHRoZSBhcnRpY2xlLmA7XG4gICAgICAgIC8vIEdldCBtb2RlbCBuYW1lOiB1c2UgREIgY29uZmlnIGlmIGF2YWlsYWJsZSwgb3RoZXJ3aXNlIGZhbGwgYmFjayB0byBlbnYgdmFyIG9yIGRlZmF1bHRcbiAgICAgICAgY29uc3QgbW9kZWxOYW1lID0gYWdlbnRDb25maWcubW9kZWwgfHwgcHJvY2Vzcy5lbnYuUkVWSVNJT05fQUdFTlRfTU9ERUwgfHwgcHJvY2Vzcy5lbnYuRURJVE9SX0FHRU5UX01PREVMIHx8ICdncHQtNS40LW1pbmknO1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBSZXZpc2lvbiBzdGVwOiBVc2luZyBtb2RlbDogJHttb2RlbE5hbWV9YCk7XG4gICAgICAgIC8vIENhbGwgQUkgbW9kZWwgdmlhIGRpcmVjdCBPcGVuQUkgcHJvdmlkZXJcbiAgICAgICAgY29uc3QgbW9kZWwgPSBvcGVuYWkobW9kZWxOYW1lKTtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBnZW5lcmF0ZVRleHQoe1xuICAgICAgICAgICAgbW9kZWwsXG4gICAgICAgICAgICBzeXN0ZW06IHN5c3RlbVByb21wdCxcbiAgICAgICAgICAgIHByb21wdDogdXNlck1lc3NhZ2UsXG4gICAgICAgICAgICB0ZW1wZXJhdHVyZTogMC43LFxuICAgICAgICAgICAgbWF4T3V0cHV0VG9rZW5zOiA4MDAwXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCByZXZpc2VkTWFya2Rvd24gPSByZXNwb25zZS50ZXh0LnRyaW0oKTtcbiAgICAgICAgLy8gVmFsaWRhdGUgb3V0cHV0XG4gICAgICAgIGlmICghcmV2aXNlZE1hcmtkb3duIHx8IHJldmlzZWRNYXJrZG93bi5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignUmV2aXNpb24gQWdlbnQgcmV0dXJuZWQgZW1wdHkgb3V0cHV0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJldmlzZWRNYXJrZG93bi5zdGFydHNXaXRoKCd7JykpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignUmV2aXNpb24gb3V0cHV0IGludmFsaWQ6IGV4cGVjdGVkIE1hcmtkb3duLCByZWNlaXZlZCBKU09OLWxpa2UgcmVzcG9uc2UnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocmV2aXNlZE1hcmtkb3duLmxlbmd0aCA8IE1hdGgubWluKDUwMCwgTWF0aC5mbG9vcihjdXJyZW50RHJhZnQubGVuZ3RoICogMC40KSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignUmV2aXNpb24gb3V0cHV0IHRvbyBzaG9ydCBjb21wYXJlZCB3aXRoIG9yaWdpbmFsIGRyYWZ0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmV2aXNpb25PdXRwdXQgPSB7XG4gICAgICAgICAgICByZXZpc2VkX21hcmtkb3duOiByZXZpc2VkTWFya2Rvd24sXG4gICAgICAgICAgICByZXZpc2lvbl9tb2RlOiByZXZpc2lvbk1vZGUsXG4gICAgICAgICAgICBmZWVkYmFja19hcHBsaWVkOiByZXZpZXdlckZlZWRiYWNrLnN1YnN0cmluZygwLCAyMDApLFxuICAgICAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgICAgfTtcbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gUmV2aXNpb24gc3RlcDogQ29tcGxldGUgKCR7cmV2aXNlZE1hcmtkb3duLmxlbmd0aH0gY2hhcnMpYCk7XG4gICAgICAgIHJldHVybiByZXZpc2lvbk91dHB1dDtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2MF0gUmV2aXNpb24gc3RlcCBlcnJvcjogJHtlcnJvck1lc3NhZ2V9YCk7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbn1cbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3JldmlzaW9uLXN0ZXAvL3J1blJldmlzaW9uU3RlcFwiLCBydW5SZXZpc2lvblN0ZXApO1xuIiwgImltcG9ydCB7IHJlZ2lzdGVyU3RlcEZ1bmN0aW9uIH0gZnJvbSBcIndvcmtmbG93L2ludGVybmFsL3ByaXZhdGVcIjtcbmltcG9ydCAnc2VydmVyLW9ubHknO1xuaW1wb3J0IHsgZ2VuZXJhdGVUZXh0IH0gZnJvbSAnYWknO1xuaW1wb3J0IHsgb3BlbmFpIH0gZnJvbSAnQGFpLXNkay9vcGVuYWknO1xuaW1wb3J0IHsgdXBkYXRlUnVuU3RhdHVzIH0gZnJvbSAnLi4vLi4vc3RvcmFnZS9ydW5zJztcbmltcG9ydCB7IGdldEFnZW50Q29uZmlnIH0gZnJvbSAnLi4vLi4vc3RvcmFnZS9hZ2VudC1jb25maWdzJztcbmltcG9ydCB7IGJ1aWxkRnVsbElucHV0Q29udGV4dCwgZXh0cmFjdEpzb25PYmplY3QgfSBmcm9tICcuL2NvbnRleHQtYnVpbGRlcic7XG4vKipfX2ludGVybmFsX3dvcmtmbG93c3tcInN0ZXBzXCI6e1wibGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9zZW8tcWEtc3RlcC50c1wiOntcInJ1blNlb1FhU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3Nlby1xYS1zdGVwLy9ydW5TZW9RYVN0ZXBcIn19fX0qLztcbmNvbnN0IFZBTElEX1JFQ09NTUVOREVEX0FDVElPTlMgPSBbXG4gICAgJ0FwcHJvdmUgZm9yIGVkaXRvcicsXG4gICAgJ1JldmlzZSBiZWZvcmUgZWRpdG9yJyxcbiAgICAnTmVlZHMgaHVtYW4gcmV2aWV3J1xuXTtcbi8qKlxuICogU0VPIFFBIFN0ZXAgLSBQaGFzZSAyQy1EXG4gKiBSZXZpZXdzIGRyYWZ0IG1hcmtkb3duIGFnYWluc3QgU0VPIGFuZCBjbGllbnQtZ29hbCBjcml0ZXJpYS5cbiAqIFJldHVybnMgc3RydWN0dXJlZCBhdWRpdCBKU09OLiBEb2VzIG5vdCByZXdyaXRlIHRoZSBkcmFmdC5cbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gcnVuU2VvUWFTdGVwKHJ1bklkLCBpbnB1dCwgcmVzZWFyY2hEYXRhLCBvdXRsaW5lRGF0YSwgZHJhZnRNYXJrZG93bikge1xuICAgIGNvbnNvbGUubG9nKGBbdjBdIFNFTyBRQSBzdGVwOiBBdWRpdGluZyBkcmFmdCBmb3IgcnVuICR7cnVuSWR9YCk7XG4gICAgaWYgKCFkcmFmdE1hcmtkb3duKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignRHJhZnQgbWFya2Rvd24gaXMgcmVxdWlyZWQgZm9yIFNFTyBRQSByZXZpZXcnKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgYWdlbnRDb25maWcgPSBhd2FpdCBnZXRBZ2VudENvbmZpZygnc2VvX3FhJyk7XG4gICAgICAgIGlmICghYWdlbnRDb25maWcpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQWN0aXZlIGFnZW50IGNvbmZpZyBub3QgZm91bmQgZm9yIGFnZW50X2tleTogc2VvX3FhJyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gU0VPIEJsb2cgQWdlbnQgQ29uZmlnIExvYWRlZDogc2VvX3FhIHYke2FnZW50Q29uZmlnLnZlcnNpb259YCk7XG4gICAgICAgIGNvbnN0IHN5c3RlbVByb21wdCA9IFtcbiAgICAgICAgICAgIGFnZW50Q29uZmlnLnN5c3RlbV9wcm9tcHQsXG4gICAgICAgICAgICBhZ2VudENvbmZpZy5za2lsbF9tYXJrZG93blxuICAgICAgICBdLmZpbHRlcihCb29sZWFuKS5qb2luKCdcXG5cXG4nKTtcbiAgICAgICAgY29uc3QgbW9kZWxOYW1lID0gYWdlbnRDb25maWcubW9kZWwgfHwgcHJvY2Vzcy5lbnYuU0VPX1FBX0FHRU5UX01PREVMIHx8IHByb2Nlc3MuZW52LlJFU0VBUkNIX0FHRU5UX01PREVMIHx8ICdncHQtNS40LW1pbmknO1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBTRU8gUUEgc3RlcDogVXNpbmcgbW9kZWw6ICR7bW9kZWxOYW1lfWApO1xuICAgICAgICBjb25zdCBzZW9RYVByb21wdCA9IGBSZXZpZXcgdGhpcyBkcmFmdCB1c2luZyB0aGUgU0VPIFFBIHNjaGVtYSBmcm9tIHlvdXIgc3lzdGVtIGluc3RydWN0aW9ucy5cXG5cXG4ke2J1aWxkRnVsbElucHV0Q29udGV4dChpbnB1dCl9XFxuXFxuUmVzZWFyY2ggQWdlbnQgT3V0cHV0OlxcbiR7SlNPTi5zdHJpbmdpZnkocmVzZWFyY2hEYXRhID8/IHt9LCBudWxsLCAyKX1cXG5cXG5PdXRsaW5lIEFnZW50IE91dHB1dDpcXG4ke0pTT04uc3RyaW5naWZ5KG91dGxpbmVEYXRhID8/IHt9LCBudWxsLCAyKX1cXG5cXG5CbG9nIERyYWZ0IE1hcmtkb3duOlxcbiR7ZHJhZnRNYXJrZG93bn1cXG5cXG5SZXR1cm4gdmFsaWQgSlNPTiBvbmx5LiBEbyBub3QgcmV3cml0ZSB0aGUgZHJhZnQuIERvIG5vdCBpbmNsdWRlIG1hcmtkb3duIGZlbmNlcyBvciBleHBsYW5hdGlvbiB0ZXh0LiBUaGUgcmVjb21tZW5kZWRfbmV4dF9hY3Rpb24gbXVzdCBiZSBleGFjdGx5IG9uZSBvZjogJHtWQUxJRF9SRUNPTU1FTkRFRF9BQ1RJT05TLm1hcCgodmFsdWUpPT5gXCIke3ZhbHVlfVwiYCkuam9pbignLCAnKX0uYDtcbiAgICAgICAgY29uc3QgeyB0ZXh0IH0gPSBhd2FpdCBnZW5lcmF0ZVRleHQoe1xuICAgICAgICAgICAgbW9kZWw6IG9wZW5haShtb2RlbE5hbWUpLFxuICAgICAgICAgICAgc3lzdGVtOiBzeXN0ZW1Qcm9tcHQsXG4gICAgICAgICAgICBwcm9tcHQ6IHNlb1FhUHJvbXB0LFxuICAgICAgICAgICAgdGVtcGVyYXR1cmU6IDAuNCxcbiAgICAgICAgICAgIG1heE91dHB1dFRva2VuczogMzAwMFxuICAgICAgICB9KTtcbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gU0VPIFFBIHN0ZXA6IFJlY2VpdmVkIGF1ZGl0IGZyb20gbW9kZWwsIHBhcnNpbmcgSlNPTmApO1xuICAgICAgICBsZXQgc2VvUWFSZXN1bHQ7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBzZW9RYVJlc3VsdCA9IEpTT04ucGFyc2UoZXh0cmFjdEpzb25PYmplY3QodGV4dCkpO1xuICAgICAgICB9IGNhdGNoIChwYXJzZUVycikge1xuICAgICAgICAgICAgY29uc3QgbWVzc2FnZSA9IHBhcnNlRXJyIGluc3RhbmNlb2YgRXJyb3IgPyBwYXJzZUVyci5tZXNzYWdlIDogU3RyaW5nKHBhcnNlRXJyKTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgU0VPIFFBIG91dHB1dCBwYXJzZSBmYWlsZWQ6ICR7bWVzc2FnZX1gKTtcbiAgICAgICAgfVxuICAgICAgICB2YWxpZGF0ZVNlb1FhT3V0cHV0KHNlb1FhUmVzdWx0KTtcbiAgICAgICAgc2VvUWFSZXN1bHQudGltZXN0YW1wID0gc2VvUWFSZXN1bHQudGltZXN0YW1wIHx8IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gU0VPIFFBIHN0ZXA6IFBlcnNpc3RpbmcgU0VPIFFBIGF1ZGl0IChzY29yZTogJHtzZW9RYVJlc3VsdC5vdmVyYWxsX3Njb3JlfSkgZm9yIHJ1biAke3J1bklkfWApO1xuICAgICAgICBhd2FpdCB1cGRhdGVSdW5TdGF0dXMocnVuSWQsICdzZW9fcWEnLCBzZW9RYVJlc3VsdCk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFNFTyBRQSBzdGVwOiBDb21wbGV0ZSBmb3IgcnVuICR7cnVuSWR9YCk7XG4gICAgICAgIHJldHVybiBzZW9RYVJlc3VsdDtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBlcnJvck1zZyA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgY29uc29sZS5lcnJvcihgW3YwXSBTRU8gUUEgc3RlcDogRXJyb3IgZHVyaW5nIGF1ZGl0IGZvciBydW4gJHtydW5JZH06ICR7ZXJyb3JNc2d9YCk7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHZhbGlkYXRlU2VvUWFPdXRwdXQob3V0cHV0KSB7XG4gICAgY29uc3QgbWlzc2luZ0ZpZWxkcyA9IFtdO1xuICAgIGNvbnN0IHJlcXVpcmVkRmllbGRzID0gW1xuICAgICAgICAnb3ZlcmFsbF9zY29yZScsXG4gICAgICAgICdyZWFkeV9mb3JfZWRpdG9yJyxcbiAgICAgICAgJ3JlY29tbWVuZGVkX25leHRfYWN0aW9uJyxcbiAgICAgICAgJ3NlYXJjaF9pbnRlbnRfYWxpZ25tZW50JyxcbiAgICAgICAgJ3ByaW1hcnlfa2V5d29yZF91c2FnZScsXG4gICAgICAgICdzZWNvbmRhcnlfa2V5d29yZF91c2FnZScsXG4gICAgICAgICdoZWFkaW5nX3N0cnVjdHVyZV9yZXZpZXcnLFxuICAgICAgICAnY29udGVudF9kZXB0aF9yZXZpZXcnLFxuICAgICAgICAncmVhZGFiaWxpdHlfcmV2aWV3JyxcbiAgICAgICAgJ2N0YV9yZXZpZXcnLFxuICAgICAgICAnaW50ZXJuYWxfbGlua2luZ19yZXZpZXcnLFxuICAgICAgICAnY2xpZW50X2dvYWxfYWxpZ25tZW50JyxcbiAgICAgICAgJ3ByaW9yaXR5X2ZpeGVzJyxcbiAgICAgICAgJ3Jpc2tfZmxhZ3MnLFxuICAgICAgICAnbmVlZHNfcmV2aWV3J1xuICAgIF07XG4gICAgZm9yIChjb25zdCBmaWVsZCBvZiByZXF1aXJlZEZpZWxkcyl7XG4gICAgICAgIGlmIChvdXRwdXRbZmllbGRdID09PSB1bmRlZmluZWQgfHwgb3V0cHV0W2ZpZWxkXSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgbWlzc2luZ0ZpZWxkcy5wdXNoKGZpZWxkKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAobWlzc2luZ0ZpZWxkcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgU0VPIFFBIG91dHB1dCBtaXNzaW5nIHJlcXVpcmVkIGZpZWxkczogJHttaXNzaW5nRmllbGRzLmpvaW4oJywgJyl9YCk7XG4gICAgfVxuICAgIGlmICh0eXBlb2Ygb3V0cHV0Lm92ZXJhbGxfc2NvcmUgIT09ICdudW1iZXInIHx8IG91dHB1dC5vdmVyYWxsX3Njb3JlIDwgMCB8fCBvdXRwdXQub3ZlcmFsbF9zY29yZSA+IDEwMCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFNFTyBRQSBvdXRwdXQgaW52YWxpZCBvdmVyYWxsX3Njb3JlOiAke291dHB1dC5vdmVyYWxsX3Njb3JlfSwgbXVzdCBiZSBudW1iZXIgYmV0d2VlbiAwLTEwMGApO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIG91dHB1dC5yZWFkeV9mb3JfZWRpdG9yICE9PSAnYm9vbGVhbicpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTRU8gUUEgb3V0cHV0IGludmFsaWQgcmVhZHlfZm9yX2VkaXRvcjogZXhwZWN0ZWQgYm9vbGVhbicpO1xuICAgIH1cbiAgICBpZiAoIVZBTElEX1JFQ09NTUVOREVEX0FDVElPTlMuaW5jbHVkZXMob3V0cHV0LnJlY29tbWVuZGVkX25leHRfYWN0aW9uKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFNFTyBRQSBvdXRwdXQgaW52YWxpZCByZWNvbW1lbmRlZF9uZXh0X2FjdGlvbjogJHtvdXRwdXQucmVjb21tZW5kZWRfbmV4dF9hY3Rpb259YCk7XG4gICAgfVxuICAgIGlmICghQXJyYXkuaXNBcnJheShvdXRwdXQucHJpb3JpdHlfZml4ZXMpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignU0VPIFFBIG91dHB1dCBpbnZhbGlkIHByaW9yaXR5X2ZpeGVzOiBleHBlY3RlZCBhcnJheScpO1xuICAgIH1cbiAgICBpZiAoIUFycmF5LmlzQXJyYXkob3V0cHV0LnJpc2tfZmxhZ3MpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignU0VPIFFBIG91dHB1dCBpbnZhbGlkIHJpc2tfZmxhZ3M6IGV4cGVjdGVkIGFycmF5Jyk7XG4gICAgfVxuICAgIGlmICh0eXBlb2Ygb3V0cHV0Lm5lZWRzX3JldmlldyAhPT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignU0VPIFFBIG91dHB1dCBpbnZhbGlkIG5lZWRzX3JldmlldzogZXhwZWN0ZWQgYm9vbGVhbicpO1xuICAgIH1cbiAgICB2YWxpZGF0ZVNjb3JlT2JqZWN0KG91dHB1dC5zZWFyY2hfaW50ZW50X2FsaWdubWVudCwgJ3NlYXJjaF9pbnRlbnRfYWxpZ25tZW50Jyk7XG4gICAgdmFsaWRhdGVTY29yZU9iamVjdChvdXRwdXQucHJpbWFyeV9rZXl3b3JkX3VzYWdlLCAncHJpbWFyeV9rZXl3b3JkX3VzYWdlJyk7XG4gICAgdmFsaWRhdGVTY29yZU9iamVjdChvdXRwdXQuc2Vjb25kYXJ5X2tleXdvcmRfdXNhZ2UsICdzZWNvbmRhcnlfa2V5d29yZF91c2FnZScpO1xuICAgIHZhbGlkYXRlU2NvcmVPYmplY3Qob3V0cHV0LmhlYWRpbmdfc3RydWN0dXJlX3JldmlldywgJ2hlYWRpbmdfc3RydWN0dXJlX3JldmlldycpO1xuICAgIHZhbGlkYXRlU2NvcmVPYmplY3Qob3V0cHV0LmNvbnRlbnRfZGVwdGhfcmV2aWV3LCAnY29udGVudF9kZXB0aF9yZXZpZXcnKTtcbiAgICB2YWxpZGF0ZVNjb3JlT2JqZWN0KG91dHB1dC5yZWFkYWJpbGl0eV9yZXZpZXcsICdyZWFkYWJpbGl0eV9yZXZpZXcnKTtcbiAgICB2YWxpZGF0ZVNjb3JlT2JqZWN0KG91dHB1dC5jdGFfcmV2aWV3LCAnY3RhX3JldmlldycpO1xuICAgIHZhbGlkYXRlU2NvcmVPYmplY3Qob3V0cHV0LmludGVybmFsX2xpbmtpbmdfcmV2aWV3LCAnaW50ZXJuYWxfbGlua2luZ19yZXZpZXcnKTtcbiAgICB2YWxpZGF0ZVNjb3JlT2JqZWN0KG91dHB1dC5jbGllbnRfZ29hbF9hbGlnbm1lbnQsICdjbGllbnRfZ29hbF9hbGlnbm1lbnQnKTtcbn1cbmZ1bmN0aW9uIHZhbGlkYXRlU2NvcmVPYmplY3QodmFsdWUsIGZpZWxkTmFtZSkge1xuICAgIGlmICghdmFsdWUgfHwgdHlwZW9mIHZhbHVlICE9PSAnb2JqZWN0Jykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFNFTyBRQSBvdXRwdXQgaW52YWxpZCAke2ZpZWxkTmFtZX06IGV4cGVjdGVkIG9iamVjdGApO1xuICAgIH1cbiAgICBjb25zdCBzY29yZSA9IHZhbHVlLnNjb3JlO1xuICAgIGlmICh0eXBlb2Ygc2NvcmUgIT09ICdudW1iZXInIHx8IHNjb3JlIDwgMCB8fCBzY29yZSA+IDEwMCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFNFTyBRQSBvdXRwdXQgaW52YWxpZCAke2ZpZWxkTmFtZX0uc2NvcmU6ICR7U3RyaW5nKHNjb3JlKX0sIG11c3QgYmUgbnVtYmVyIGJldHdlZW4gMC0xMDBgKTtcbiAgICB9XG59XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9zZW8tcWEtc3RlcC8vcnVuU2VvUWFTdGVwXCIsIHJ1blNlb1FhU3RlcCk7XG4iLCAiaW1wb3J0IHsgcmVnaXN0ZXJTdGVwRnVuY3Rpb24gfSBmcm9tIFwid29ya2Zsb3cvaW50ZXJuYWwvcHJpdmF0ZVwiO1xuaW1wb3J0ICdzZXJ2ZXItb25seSc7XG5pbXBvcnQgeyBnZW5lcmF0ZVRleHQgfSBmcm9tICdhaSc7XG5pbXBvcnQgeyBvcGVuYWkgfSBmcm9tICdAYWktc2RrL29wZW5haSc7XG5pbXBvcnQgeyB1cGRhdGVSdW5EcmFmdCwgdXBkYXRlUnVuU3RhdHVzIH0gZnJvbSAnLi4vLi4vc3RvcmFnZS9ydW5zJztcbmltcG9ydCB7IGdldEFnZW50Q29uZmlnIH0gZnJvbSAnLi4vLi4vc3RvcmFnZS9hZ2VudC1jb25maWdzJztcbmltcG9ydCB7IGJ1aWxkRnVsbElucHV0Q29udGV4dCB9IGZyb20gJy4vY29udGV4dC1idWlsZGVyJztcbi8qKl9faW50ZXJuYWxfd29ya2Zsb3dze1wic3RlcHNcIjp7XCJsaWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3dyaXRlci1zdGVwLnRzXCI6e1wicnVuV3JpdGVyU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3dyaXRlci1zdGVwLy9ydW5Xcml0ZXJTdGVwXCJ9fX19Ki87XG4vKipcbiAqIFdyaXRlciBTdGVwIC0gUGhhc2UgMkMtQ1xuICogUnVucyBpbnNpZGUgYSBkdXJhYmxlIHN0ZXAgZnVuY3Rpb24gKGhhcyBOb2RlLmpzIGFjY2VzcylcbiAqIENhbGxzIEFJIG1vZGVsIHRvIGdlbmVyYXRlIGZpcnN0IGZ1bGwgYmxvZyBkcmFmdCBpbiBNYXJrZG93blxuICogVXNlcyByZXNlYXJjaCBkYXRhIGFuZCBvdXRsaW5lIHRvIHN0cnVjdHVyZSB0aGUgY29udGVudFxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5Xcml0ZXJTdGVwKHJ1bklkLCBpbnB1dCwgcmVzZWFyY2hEYXRhLCBvdXRsaW5lRGF0YSkge1xuICAgIGNvbnNvbGUubG9nKGBbdjBdIFdyaXRlciBzdGVwOiBDcmVhdGluZyBkcmFmdCBmb3IgcnVuICR7cnVuSWR9YCk7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gTG9hZCBhZ2VudCBjb25maWcgZnJvbSBkYXRhYmFzZVxuICAgICAgICBjb25zdCBhZ2VudENvbmZpZyA9IGF3YWl0IGdldEFnZW50Q29uZmlnKCd3cml0ZXInKTtcbiAgICAgICAgaWYgKCFhZ2VudENvbmZpZykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBY3RpdmUgYWdlbnQgY29uZmlnIG5vdCBmb3VuZCBmb3IgYWdlbnRfa2V5OiB3cml0ZXInKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBTRU8gQmxvZyBBZ2VudCBDb25maWcgTG9hZGVkOiB3cml0ZXIgdiR7YWdlbnRDb25maWcudmVyc2lvbn1gKTtcbiAgICAgICAgLy8gQnVpbGQgc3lzdGVtIHByb21wdCBmcm9tIGRhdGFiYXNlIGNvbmZpZ1xuICAgICAgICBjb25zdCBzeXN0ZW1Qcm9tcHQgPSBbXG4gICAgICAgICAgICBhZ2VudENvbmZpZy5zeXN0ZW1fcHJvbXB0LFxuICAgICAgICAgICAgYWdlbnRDb25maWcuc2tpbGxfbWFya2Rvd25cbiAgICAgICAgXS5maWx0ZXIoQm9vbGVhbikuam9pbignXFxuXFxuJyk7XG4gICAgICAgIC8vIENyZWF0ZSBjb250ZXh0IGZyb20gYXZhaWxhYmxlIGRhdGFcbiAgICAgICAgY29uc3QgdG9waWMgPSBpbnB1dC5ibG9nX3RvcGljIHx8IGlucHV0LnRvcGljIHx8ICdZb3VyIFRvcGljJztcbiAgICAgICAgY29uc3QgcHJpbWFyeUtleXdvcmQgPSBpbnB1dC5wcmltYXJ5X2tleXdvcmQgfHwgJ3ByaW1hcnkga2V5d29yZCc7XG4gICAgICAgIGNvbnN0IHNlY29uZGFyeUtleXdvcmRzID0gKGlucHV0LnNlY29uZGFyeV9rZXl3b3JkcyB8fCBpbnB1dC5rZXl3b3JkcyB8fCBbXSkuam9pbignLCAnKSB8fCAnc2Vjb25kYXJ5IGtleXdvcmRzJztcbiAgICAgICAgY29uc3QgYnVzaW5lc3NOYW1lID0gaW5wdXQuYnVzaW5lc3NfbmFtZSB8fCAnWW91ciBCdXNpbmVzcyc7XG4gICAgICAgIGNvbnN0IGF1ZGllbmNlTm90ZXMgPSBpbnB1dC5hdWRpZW5jZV9ub3RlcyB8fCAnVGFyZ2V0IGF1ZGllbmNlIG5vdCBzcGVjaWZpZWQnO1xuICAgICAgICBjb25zdCBicmFuZFZvaWNlID0gaW5wdXQuYnJhbmRfdm9pY2Vfbm90ZXMgfHwgJ1Byb2Zlc3Npb25hbCBhbmQgY2xlYXInO1xuICAgICAgICBjb25zdCBjdGFOb3RlcyA9IGlucHV0LmN0YV9ub3RlcyB8fCAnJztcbiAgICAgICAgY29uc3QgaW50ZXJuYWxMaW5rTm90ZXMgPSBpbnB1dC5pbnRlcm5hbF9saW5rX25vdGVzIHx8ICcnO1xuICAgICAgICBjb25zdCBhZGRpdGlvbmFsTm90ZXMgPSBpbnB1dC5hZGRpdGlvbmFsX29yZGVyX25vdGVzIHx8ICdObyBhZGRpdGlvbmFsIG5vdGVzJztcbiAgICAgICAgY29uc3QgdGFyZ2V0V29yZENvdW50ID0gaW5wdXQudGFyZ2V0X3dvcmRfY291bnQgfHwgMTUwMDtcbiAgICAgICAgLy8gQnVpbGQgcmVzZWFyY2ggY29udGV4dCBpZiBhdmFpbGFibGVcbiAgICAgICAgbGV0IHJlc2VhcmNoQ29udGV4dCA9ICcnO1xuICAgICAgICBpZiAocmVzZWFyY2hEYXRhICYmIHR5cGVvZiByZXNlYXJjaERhdGEgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICBjb25zdCBmaW5kaW5ncyA9IHJlc2VhcmNoRGF0YS5rZXlfZmluZGluZ3MgfHwgW107XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShmaW5kaW5ncykgJiYgZmluZGluZ3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHJlc2VhcmNoQ29udGV4dCA9IGBcXG5cXG5LZXkgUmVzZWFyY2ggRmluZGluZ3M6XFxuJHtmaW5kaW5ncy5tYXAoKGYpPT5gLSAke3R5cGVvZiBmID09PSAnc3RyaW5nJyA/IGYgOiBKU09OLnN0cmluZ2lmeShmKX1gKS5qb2luKCdcXG4nKX1gO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIEJ1aWxkIG91dGxpbmUgY29udGV4dCBpZiBhdmFpbGFibGVcbiAgICAgICAgbGV0IG91dGxpbmVDb250ZXh0ID0gJyc7XG4gICAgICAgIGlmIChvdXRsaW5lRGF0YSkge1xuICAgICAgICAgICAgY29uc3Qgc2VjdGlvbnMgPSAob3V0bGluZURhdGEuc2VjdGlvbnMgfHwgW10pLm1hcCgocyk9PmAjIyAke3R5cGVvZiBzID09PSAnc3RyaW5nJyA/IHMgOiBzLmhlYWRpbmcgfHwgJ1NlY3Rpb24nfVxcbigke3MucHVycG9zZSB8fCAnU2VjdGlvbiBjb250ZW50J30pYCk7XG4gICAgICAgICAgICBpZiAoc2VjdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIG91dGxpbmVDb250ZXh0ID0gYFxcblxcbk91dGxpbmUgU3RydWN0dXJlOlxcbiR7c2VjdGlvbnMuam9pbignXFxuXFxuJyl9YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBCdWlsZCBpbnRlcm5hbCBsaW5rcyBjb250ZXh0XG4gICAgICAgIGxldCBsaW5rc0NvbnRleHQgPSAnJztcbiAgICAgICAgaWYgKGludGVybmFsTGlua05vdGVzKSB7XG4gICAgICAgICAgICBsaW5rc0NvbnRleHQgPSBgXFxuXFxuSW50ZXJuYWwgTGluayBPcHBvcnR1bml0aWVzOlxcbiR7aW50ZXJuYWxMaW5rTm90ZXN9YDtcbiAgICAgICAgfVxuICAgICAgICAvLyBCdWlsZCBDVEEgY29udGV4dFxuICAgICAgICBsZXQgY3RhQ29udGV4dCA9ICcnO1xuICAgICAgICBpZiAoY3RhTm90ZXMpIHtcbiAgICAgICAgICAgIGN0YUNvbnRleHQgPSBgXFxuXFxuQ2FsbC10by1BY3Rpb24gR3VpZGFuY2U6XFxuJHtjdGFOb3Rlc31gO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHVzZXJNZXNzYWdlID0gYFdyaXRlIHRoZSBmaXJzdCBkcmFmdCBibG9nIHBvc3QgdXNpbmcgdGhlIGZ1bGwgQmxvZyBDb250ZXh0IEJyaWVmLCBSZXNlYXJjaCBBZ2VudCBvdXRwdXQsIGFuZCBPdXRsaW5lIEFnZW50IG91dHB1dC5cblxuJHtidWlsZEZ1bGxJbnB1dENvbnRleHQoaW5wdXQpfSR7cmVzZWFyY2hDb250ZXh0fSR7b3V0bGluZUNvbnRleHR9JHtsaW5rc0NvbnRleHR9JHtjdGFDb250ZXh0fVxuXG5Ub3BpYzogJHt0b3BpY31cbkJ1c2luZXNzOiAke2J1c2luZXNzTmFtZX1cblByaW1hcnkgS2V5d29yZDogJHtwcmltYXJ5S2V5d29yZH1cblNlY29uZGFyeSBLZXl3b3JkczogJHtzZWNvbmRhcnlLZXl3b3Jkc31cblRhcmdldCBXb3JkIENvdW50OiAke3RhcmdldFdvcmRDb3VudH1cbkF1ZGllbmNlOiAke2F1ZGllbmNlTm90ZXN9XG5CcmFuZCBWb2ljZTogJHticmFuZFZvaWNlfVxuQWRkaXRpb25hbCBOb3RlczogJHthZGRpdGlvbmFsTm90ZXN9XG5cblJldHVybiBNYXJrZG93biBvbmx5LCBmb2xsb3dpbmcgdGhlIFdyaXRlciBBZ2VudCBpbnN0cnVjdGlvbnMuIERvIG5vdCBpbnZlbnQgdW5zdXBwb3J0ZWQgZmFjdHMsIHNlcnZpY2VzLCBsb2NhdGlvbnMsIG9mZmVycywgY2xhaW1zLCBvciBsaW5rcy5gO1xuICAgICAgICAvLyBHZXQgbW9kZWwgbmFtZTogdXNlIERCIGNvbmZpZyBpZiBhdmFpbGFibGUsIG90aGVyd2lzZSBmYWxsIGJhY2sgdG8gZW52IHZhciBvciBkZWZhdWx0XG4gICAgICAgIGNvbnN0IG1vZGVsTmFtZSA9IGFnZW50Q29uZmlnLm1vZGVsIHx8IHByb2Nlc3MuZW52LldSSVRFUl9BR0VOVF9NT0RFTCB8fCBwcm9jZXNzLmVudi5SRVNFQVJDSF9BR0VOVF9NT0RFTCB8fCAnZ3B0LTUuNC1taW5pJztcbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gV3JpdGVyIHN0ZXA6IFVzaW5nIG1vZGVsOiAke21vZGVsTmFtZX1gKTtcbiAgICAgICAgLy8gQ2FsbCBBSSBtb2RlbCB2aWEgZGlyZWN0IE9wZW5BSSBwcm92aWRlclxuICAgICAgICBjb25zdCBtb2RlbCA9IG9wZW5haShtb2RlbE5hbWUpO1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGdlbmVyYXRlVGV4dCh7XG4gICAgICAgICAgICBtb2RlbCxcbiAgICAgICAgICAgIHN5c3RlbTogc3lzdGVtUHJvbXB0LFxuICAgICAgICAgICAgcHJvbXB0OiB1c2VyTWVzc2FnZSxcbiAgICAgICAgICAgIHRlbXBlcmF0dXJlOiAwLjcsXG4gICAgICAgICAgICBtYXhPdXRwdXRUb2tlbnM6IDQwMDBcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IGRyYWZ0TWFya2Rvd24gPSByZXNwb25zZS50ZXh0O1xuICAgICAgICAvLyBCYXNpYyB2YWxpZGF0aW9uXG4gICAgICAgIGlmICghZHJhZnRNYXJrZG93biB8fCBkcmFmdE1hcmtkb3duLnRyaW0oKS5sZW5ndGggPCA1MDApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignR2VuZXJhdGVkIGNvbnRlbnQgdG9vIHNob3J0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQ2FsY3VsYXRlIG1ldHJpY3NcbiAgICAgICAgY29uc3Qgd29yZENvdW50ID0gZHJhZnRNYXJrZG93bi5zcGxpdCgvXFxzKy8pLmxlbmd0aDtcbiAgICAgICAgY29uc3Qgc2VjdGlvbnNDb3VudCA9IChkcmFmdE1hcmtkb3duLm1hdGNoKC9eIyNcXHMvZ20pIHx8IFtdKS5sZW5ndGg7XG4gICAgICAgIGNvbnN0IGhhc0N0YSA9IGRyYWZ0TWFya2Rvd24udG9Mb3dlckNhc2UoKS5pbmNsdWRlcygnY2FsbCcpIHx8IGRyYWZ0TWFya2Rvd24udG9Mb3dlckNhc2UoKS5pbmNsdWRlcygnYWN0aW9uJykgfHwgY3RhTm90ZXMubGVuZ3RoID4gMDtcbiAgICAgICAgY29uc3QgaGFzSW50ZXJuYWxMaW5rcyA9IGRyYWZ0TWFya2Rvd24uaW5jbHVkZXMoJ1tsaW5rOicpIHx8IGludGVybmFsTGlua05vdGVzLmxlbmd0aCA+IDA7XG4gICAgICAgIGNvbnN0IHdyaXRlck91dHB1dCA9IHtcbiAgICAgICAgICAgIGRyYWZ0X21hcmtkb3duOiBkcmFmdE1hcmtkb3duLFxuICAgICAgICAgICAgd29yZF9jb3VudDogd29yZENvdW50LFxuICAgICAgICAgICAgc2VjdGlvbnNfd3JpdHRlbjogc2VjdGlvbnNDb3VudCxcbiAgICAgICAgICAgIGhhc19jdGE6IGhhc0N0YSxcbiAgICAgICAgICAgIGhhc19pbnRlcm5hbF9saW5rczogaGFzSW50ZXJuYWxMaW5rcyxcbiAgICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICAgIH07XG4gICAgICAgIC8vIFBlcnNpc3QgZHJhZnRfbWFya2Rvd24gdG8gZGF0YWJhc2UgKG1hcmtkb3duIHN0cmluZyBvbmx5LCBub3QgZnVsbCBvYmplY3QpXG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFdyaXRlciBzdGVwOiBQZXJzaXN0aW5nIGRyYWZ0X21hcmtkb3duICgke3dvcmRDb3VudH0gd29yZHMpIGZvciBydW4gJHtydW5JZH1gKTtcbiAgICAgICAgYXdhaXQgdXBkYXRlUnVuRHJhZnQocnVuSWQsIHdyaXRlck91dHB1dC5kcmFmdF9tYXJrZG93bik7XG4gICAgICAgIC8vIEFsc28gdXBkYXRlIHN0YXR1cyB0byAnd3JpdGluZydcbiAgICAgICAgYXdhaXQgdXBkYXRlUnVuU3RhdHVzKHJ1bklkLCAnd3JpdGluZycpO1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBXcml0ZXIgc3RlcDogQ29tcGxldGUgZm9yIHJ1biAke3J1bklkfSAoJHt3b3JkQ291bnR9IHdvcmRzLCAke3NlY3Rpb25zQ291bnR9IHNlY3Rpb25zKWApO1xuICAgICAgICByZXR1cm4gd3JpdGVyT3V0cHV0O1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTXNnID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvciBpbiB3cml0ZXIgc3RlcCc7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2MF0gV3JpdGVyIHN0ZXAgZXJyb3IgZm9yIHJ1biAke3J1bklkfTogJHtlcnJvck1zZ31gKTtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBXcml0ZXIgc3RlcCBmYWlsZWQ6ICR7ZXJyb3JNc2d9YCk7XG4gICAgfVxufVxucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvd3JpdGVyLXN0ZXAvL3J1bldyaXRlclN0ZXBcIiwgcnVuV3JpdGVyU3RlcCk7XG4iLCAiXG4gICAgLy8gQnVpbHQgaW4gc3RlcHNcbiAgICBpbXBvcnQgJ3dvcmtmbG93L2ludGVybmFsL2J1aWx0aW5zJztcbiAgICAvLyBVc2VyIHN0ZXBzXG4gICAgaW1wb3J0ICcuL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvY2FsbGJhY2stc3RlcC50cyc7XG5pbXBvcnQgJy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9lZGl0b3Itc3RlcC50cyc7XG5pbXBvcnQgJy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9oZWxwZXJzLnRzJztcbmltcG9ydCAnLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL21ldGEtc3RlcC50cyc7XG5pbXBvcnQgJy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9vdXRsaW5lLXN0ZXAudHMnO1xuaW1wb3J0ICcuL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvcmVzZWFyY2gtc3RlcC50cyc7XG5pbXBvcnQgJy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9yZXZpc2lvbi1zdGVwLnRzJztcbmltcG9ydCAnLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3Nlby1xYS1zdGVwLnRzJztcbmltcG9ydCAnLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3dyaXRlci1zdGVwLnRzJztcbiAgICAvLyBTZXJkZSBmaWxlcyBmb3IgY3Jvc3MtY29udGV4dCBjbGFzcyByZWdpc3RyYXRpb25cbiAgICBcbiAgICAvLyBBUEkgZW50cnlwb2ludFxuICAgIGV4cG9ydCB7IHN0ZXBFbnRyeXBvaW50IGFzIEhFQUQsIHN0ZXBFbnRyeXBvaW50IGFzIFBPU1QgfSBmcm9tICd3b3JrZmxvdy9ydW50aW1lJzsiXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7O0FBQUEsU0FB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QWMsTUFBTSxLQUFLLEVBQUU7QUFDN0MsVUFBTSxpQkFBaUIsY0FBYyxNQUFNLFNBQVMsS0FBSyxDQUFDLEdBQUc7QUFDN0QsVUFBTSxTQUFTLGNBQWMsWUFBWSxFQUFFLFNBQVMsTUFBTSxLQUFLLGNBQWMsWUFBWSxFQUFFLFNBQVMsUUFBUSxLQUFLLFNBQVMsU0FBUztBQUNuSSxVQUFNLG1CQUFtQixjQUFjLFNBQVMsUUFBUSxLQUFLLGtCQUFrQixTQUFTO0FBQ3hGLFVBQU0sZUFBZTtBQUFBLE1BQ2pCLGdCQUFnQjtBQUFBLE1BQ2hCLFlBQVk7QUFBQSxNQUNaLGtCQUFrQjtBQUFBLE1BQ2xCLFNBQVM7QUFBQSxNQUNULG9CQUFvQjtBQUFBLE1BQ3BCLFlBQVcsb0JBQUksS0FBSyxHQUFFLFlBQVk7QUFBQSxJQUN0QztBQUVBLFlBQVEsSUFBSSxnREFBZ0QsU0FBUyxtQkFBbUIsS0FBSyxFQUFFO0FBQy9GLFVBQU0sZUFBZSxPQUFPLGFBQWEsY0FBYztBQUV2RCxVQUFNQyxpQkFBZ0IsT0FBTyxTQUFTO0FBQ3RDLFlBQVEsSUFBSSxzQ0FBc0MsS0FBSyxLQUFLLFNBQVMsV0FBVyxhQUFhLFlBQVk7QUFDekcsV0FBTztBQUFBLEVBQ1gsU0FBUyxPQUFPO0FBQ1osVUFBTSxXQUFXLGlCQUFpQixRQUFRLE1BQU0sVUFBVTtBQUMxRCxZQUFRLE1BQU0sa0NBQWtDLEtBQUssS0FBSyxRQUFRLEVBQUU7QUFDcEUsVUFBTSxJQUFJLE1BQU0sdUJBQXVCLFFBQVEsRUFBRTtBQUFBLEVBQ3JEO0FBQ0o7QUEzRzBCO0FBNEcxQkMsdUJBQXFCLHlFQUF5RSxhQUFhOzs7QUN6R3ZHLFNBQTJCLGdCQUF3QixrQkFBbEJDLHVCQUE4QjsiLAogICJuYW1lcyI6IFsicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAiZ2VuZXJhdGVUZXh0IiwgIm9wZW5haSIsICJnZXRBZ2VudENvbmZpZyIsICJidWlsZEZ1bGxJbnB1dENvbnRleHQiLCAiZ2V0QWdlbnRDb25maWciLCAiZ2VuZXJhdGVUZXh0IiwgIm9wZW5haSIsICJidWlsZEZ1bGxJbnB1dENvbnRleHQiLCAicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAiZ2VuZXJhdGVUZXh0IiwgIm9wZW5haSIsICJ1cGRhdGVSdW5TdGF0dXMiLCAiZ2V0QWdlbnRDb25maWciLCAiYnVpbGRGdWxsSW5wdXRDb250ZXh0IiwgImV4dHJhY3RKc29uT2JqZWN0IiwgImdldEFnZW50Q29uZmlnIiwgImJ1aWxkRnVsbElucHV0Q29udGV4dCIsICJvcGVuYWkiLCAiZ2VuZXJhdGVUZXh0IiwgImV4dHJhY3RKc29uT2JqZWN0IiwgInVwZGF0ZVJ1blN0YXR1cyIsICJyZWdpc3RlclN0ZXBGdW5jdGlvbiIsICJyZWdpc3RlclN0ZXBGdW5jdGlvbiIsICJnZW5lcmF0ZVRleHQiLCAib3BlbmFpIiwgInVwZGF0ZVJ1blN0YXR1cyIsICJnZXRBZ2VudENvbmZpZyIsICJidWlsZEZ1bGxJbnB1dENvbnRleHQiLCAiZXh0cmFjdEpzb25PYmplY3QiLCAiZ2V0QWdlbnRDb25maWciLCAiYnVpbGRGdWxsSW5wdXRDb250ZXh0IiwgIm9wZW5haSIsICJnZW5lcmF0ZVRleHQiLCAiZXh0cmFjdEpzb25PYmplY3QiLCAidXBkYXRlUnVuU3RhdHVzIiwgInJlZ2lzdGVyU3RlcEZ1bmN0aW9uIiwgInJlZ2lzdGVyU3RlcEZ1bmN0aW9uIiwgImdlbmVyYXRlVGV4dCIsICJvcGVuYWkiLCAiZ2V0QWdlbnRDb25maWciLCAiYnVpbGRGdWxsSW5wdXRDb250ZXh0IiwgImdldEFnZW50Q29uZmlnIiwgImJ1aWxkRnVsbElucHV0Q29udGV4dCIsICJvcGVuYWkiLCAiZ2VuZXJhdGVUZXh0IiwgInJlZ2lzdGVyU3RlcEZ1bmN0aW9uIiwgInJlZ2lzdGVyU3RlcEZ1bmN0aW9uIiwgImdlbmVyYXRlVGV4dCIsICJvcGVuYWkiLCAidXBkYXRlUnVuU3RhdHVzIiwgImdldEFnZW50Q29uZmlnIiwgImJ1aWxkRnVsbElucHV0Q29udGV4dCIsICJleHRyYWN0SnNvbk9iamVjdCIsICJnZXRBZ2VudENvbmZpZyIsICJidWlsZEZ1bGxJbnB1dENvbnRleHQiLCAiZ2VuZXJhdGVUZXh0IiwgIm9wZW5haSIsICJleHRyYWN0SnNvbk9iamVjdCIsICJ1cGRhdGVSdW5TdGF0dXMiLCAicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAiZ2VuZXJhdGVUZXh0IiwgIm9wZW5haSIsICJ1cGRhdGVSdW5TdGF0dXMiLCAiZ2V0QWdlbnRDb25maWciLCAiYnVpbGRGdWxsSW5wdXRDb250ZXh0IiwgImdldEFnZW50Q29uZmlnIiwgImJ1aWxkRnVsbElucHV0Q29udGV4dCIsICJvcGVuYWkiLCAiZ2VuZXJhdGVUZXh0IiwgInVwZGF0ZVJ1blN0YXR1cyIsICJyZWdpc3RlclN0ZXBGdW5jdGlvbiIsICJzdGVwRW50cnlwb2ludCJdCn0K

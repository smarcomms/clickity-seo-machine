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
async function sendCallbackStep(runId, options) {
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
    const callbackPayload = buildCallbackPayload(run, options);
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
function buildCallbackPayload(run, options) {
  const isCompleted = run.status === "completed";
  const isFailed = run.status === "failed";
  const compactPayload = options?.compactPayload === true;
  if (isCompleted) {
    const payload = {
      run_id: run.id,
      status: "completed",
      business_name: run.input_json?.business_name || null,
      blog_topic: run.input_json?.blog_topic || run.input_json?.topic || null,
      review_ready: true,
      human_review_required: true
    };
    if (options?.draftEvent) {
      payload.draft_event = options.draftEvent;
    }
    const internalReview = run.final_output_json?.internal_review;
    if (internalReview && typeof internalReview === "object" && "review_round" in internalReview) {
      payload.review_round = internalReview.review_round;
    }
    const outputs = {
      has_research_json: !!run.research_json,
      has_outline_json: !!run.outline_json,
      has_draft_markdown: !!run.draft_markdown,
      has_optimized_json: !!run.optimized_json,
      has_final_output_json: !!run.final_output_json,
      has_edited_draft_markdown: !!run.final_output_json?.edited_draft_markdown && run.final_output_json.edited_draft_markdown.length > 0
    };
    payload.outputs = outputs;
    if (!compactPayload) {
      payload.final_output_json = run.final_output_json;
    }
    return payload;
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3dvcmtmbG93QDQuNS4wX0BuZXN0anMrY29tbW9uQDExLjEuMjdfcmVmbGVjdC1tZXRhZGF0YUAwLjIuMl9yeGpzQDcuOC4yX19AbmVzdGpzK2NvcmVAMV9hOWMxYWE2YzBiNTgwZTliZjNiZmY2NGMzMjY5ZmU0My9ub2RlX21vZHVsZXMvd29ya2Zsb3cvc3JjL2ludGVybmFsL2J1aWx0aW5zLnRzIiwgIi4uLy4uLy4uLy4uLy4uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvY2FsbGJhY2stc3RlcC50cyIsICIuLi8uLi8uLi8uLi8uLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL2VkaXRvci1zdGVwLnRzIiwgIi4uLy4uLy4uLy4uLy4uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvaGVscGVycy50cyIsICIuLi8uLi8uLi8uLi8uLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL21ldGEtc3RlcC50cyIsICIuLi8uLi8uLi8uLi8uLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL291dGxpbmUtc3RlcC50cyIsICIuLi8uLi8uLi8uLi8uLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3Jlc2VhcmNoLXN0ZXAudHMiLCAiLi4vLi4vLi4vLi4vLi4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9yZXZpc2lvbi1zdGVwLnRzIiwgIi4uLy4uLy4uLy4uLy4uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvc2VvLXFhLXN0ZXAudHMiLCAiLi4vLi4vLi4vLi4vLi4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy93cml0ZXItc3RlcC50cyIsICIuLi8uLi8uLi8uLi8uLi92aXJ0dWFsLWVudHJ5LmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKipcbiAqIFRoZXNlIGFyZSB0aGUgYnVpbHQtaW4gc3RlcHMgdGhhdCBhcmUgXCJhdXRvbWF0aWNhbGx5IGF2YWlsYWJsZVwiIGluIHRoZSB3b3JrZmxvdyBzY29wZS4gVGhleSBhcmVcbiAqIHNpbWlsYXIgdG8gXCJzdGRsaWJcIiBleGNlcHQgdGhhdCBhcmUgbm90IG1lYW50IHRvIGJlIGltcG9ydGVkIGJ5IHVzZXJzLCBidXQgYXJlIGluc3RlYWQgXCJqdXN0IGF2YWlsYWJsZVwiXG4gKiBhbG9uZ3NpZGUgdXNlciBkZWZpbmVkIHN0ZXBzLiBUaGV5IGFyZSB1c2VkIGludGVybmFsbHkgYnkgdGhlIHJ1bnRpbWVcbiAqL1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gX19idWlsdGluX3Jlc3BvbnNlX2FycmF5X2J1ZmZlcihcbiAgdGhpczogUmVxdWVzdCB8IFJlc3BvbnNlXG4pIHtcbiAgJ3VzZSBzdGVwJztcbiAgcmV0dXJuIHRoaXMuYXJyYXlCdWZmZXIoKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIF9fYnVpbHRpbl9yZXNwb25zZV9qc29uKHRoaXM6IFJlcXVlc3QgfCBSZXNwb25zZSkge1xuICAndXNlIHN0ZXAnO1xuICByZXR1cm4gdGhpcy5qc29uKCk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBfX2J1aWx0aW5fcmVzcG9uc2VfdGV4dCh0aGlzOiBSZXF1ZXN0IHwgUmVzcG9uc2UpIHtcbiAgJ3VzZSBzdGVwJztcbiAgcmV0dXJuIHRoaXMudGV4dCgpO1xufVxuIiwgImltcG9ydCB7IHJlZ2lzdGVyU3RlcEZ1bmN0aW9uIH0gZnJvbSBcIndvcmtmbG93L2ludGVybmFsL3ByaXZhdGVcIjtcbmltcG9ydCAnc2VydmVyLW9ubHknO1xuaW1wb3J0IHsgZ2V0UnVuLCByZWNvcmRDYWxsYmFja0F0dGVtcHQgfSBmcm9tICcuLi8uLi9zdG9yYWdlL3J1bnMnO1xuLyoqX19pbnRlcm5hbF93b3JrZmxvd3N7XCJzdGVwc1wiOntcImxpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvY2FsbGJhY2stc3RlcC50c1wiOntcInNlbmRDYWxsYmFja1N0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9jYWxsYmFjay1zdGVwLy9zZW5kQ2FsbGJhY2tTdGVwXCJ9fX19Ki87XG4vKipcbiAqIFNlbmQgY2FsbGJhY2sgbm90aWZpY2F0aW9uIHRvIHdlYmhvb2sgVVJMXG4gKiBSdW5zIGFzIGEgZHVyYWJsZSBzdGVwIHRvIGVuc3VyZSBjYWxsYmFjayBkZWxpdmVyeSBpcyB0cmFja2VkXG4gKiBGYWlsdXJlcyBkbyBub3QgYnJlYWsgdGhlIG1haW4gd29ya2Zsb3dcbiAqXG4gKiBAcGFyYW0gcnVuSWQgLSBUaGUgcnVuIElEIHRvIHNlbmQgY2FsbGJhY2sgZm9yXG4gKiBAcGFyYW0gb3B0aW9ucyAtIE9wdGlvbmFsIGNhbGxiYWNrIG9wdGlvbnNcbiAqICAgLSBkcmFmdEV2ZW50OiBFdmVudCBpZGVudGlmaWVyIChlLmcuLCBcInJldmlzZWRfZHJhZnRfcmVhZHlcIilcbiAqICAgLSBjb21wYWN0UGF5bG9hZDogSWYgdHJ1ZSwgb21pdCBmdWxsIGZpbmFsX291dHB1dF9qc29uIHRvIHJlZHVjZSBwYXlsb2FkIHNpemVcbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gc2VuZENhbGxiYWNrU3RlcChydW5JZCwgb3B0aW9ucykge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIEZldGNoIHJ1biB0byBnZXQgY2FsbGJhY2sgVVJMIGFuZCBmaW5hbCBzdGF0ZVxuICAgICAgICBjb25zdCBydW4gPSBhd2FpdCBnZXRSdW4ocnVuSWQpO1xuICAgICAgICBpZiAoIXJ1bikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBbdjBdIENhbGxiYWNrOiBSdW4gJHtydW5JZH0gbm90IGZvdW5kYCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFydW4uY2FsbGJhY2tfdXJsKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBDYWxsYmFjazogTm8gY2FsbGJhY2sgVVJMIGZvciBydW4gJHtydW5JZH1gKTtcbiAgICAgICAgICAgIC8vIFJlY29yZCB0aGF0IGNhbGxiYWNrIHdhcyBub3QgY29uZmlndXJlZFxuICAgICAgICAgICAgYXdhaXQgcmVjb3JkQ2FsbGJhY2tBdHRlbXB0KHJ1bklkLCAnbm90X2NvbmZpZ3VyZWQnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBDYWxsYmFjazogU2VuZGluZyBub3RpZmljYXRpb24gdG8gJHtydW4uY2FsbGJhY2tfdXJsfWApO1xuICAgICAgICAvLyBCdWlsZCBjYWxsYmFjayBwYXlsb2FkXG4gICAgICAgIGNvbnN0IGNhbGxiYWNrUGF5bG9hZCA9IGJ1aWxkQ2FsbGJhY2tQYXlsb2FkKHJ1biwgb3B0aW9ucyk7XG4gICAgICAgIC8vIFNlbmQgY2FsbGJhY2sgd2l0aCB0aW1lb3V0IHByb3RlY3Rpb25cbiAgICAgICAgY29uc3QgY29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICAgICAgY29uc3QgdGltZW91dElkID0gc2V0VGltZW91dCgoKT0+Y29udHJvbGxlci5hYm9ydCgpLCAzMDAwMCk7IC8vIDMwIHNlY29uZCB0aW1lb3V0XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHJ1bi5jYWxsYmFja191cmwsIHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbidcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGNhbGxiYWNrUGF5bG9hZCksXG4gICAgICAgICAgICAgICAgc2lnbmFsOiBjb250cm9sbGVyLnNpZ25hbFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcbiAgICAgICAgICAgIGlmIChyZXNwb25zZS5vaykge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIENhbGxiYWNrOiBTdWNjZXNzZnVsbHkgc2VudCBmb3IgcnVuICR7cnVuSWR9LCBzdGF0dXMgJHtyZXNwb25zZS5zdGF0dXN9YCk7XG4gICAgICAgICAgICAgICAgLy8gUmVjb3JkIHN1Y2Nlc3NmdWwgY2FsbGJhY2tcbiAgICAgICAgICAgICAgICBhd2FpdCByZWNvcmRDYWxsYmFja0F0dGVtcHQocnVuSWQsICdzdWNjZXNzJywgcmVzcG9uc2Uuc3RhdHVzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3RhdHVzVGV4dCA9IHJlc3BvbnNlLnN0YXR1c1RleHQgfHwgYEhUVFAgJHtyZXNwb25zZS5zdGF0dXN9YDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFt2MF0gQ2FsbGJhY2s6IFdlYmhvb2sgcmV0dXJuZWQgJHtyZXNwb25zZS5zdGF0dXN9IGZvciBydW4gJHtydW5JZH1gKTtcbiAgICAgICAgICAgICAgICAvLyBSZWNvcmQgZmFpbGVkIGNhbGxiYWNrIHdpdGggSFRUUCBzdGF0dXNcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1zZyA9IGBXZWJob29rIHJldHVybmVkICR7cmVzcG9uc2Uuc3RhdHVzfTogJHtzdGF0dXNUZXh0fWA7XG4gICAgICAgICAgICAgICAgYXdhaXQgcmVjb3JkQ2FsbGJhY2tBdHRlbXB0KHJ1bklkLCAnZmFpbGVkJywgcmVzcG9uc2Uuc3RhdHVzLCBlcnJvck1zZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGZldGNoRXJyb3IpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICAgICAgICAgICAgbGV0IGVycm9yTWVzc2FnZSA9ICdVbmtub3duIG5ldHdvcmsgZXJyb3InO1xuICAgICAgICAgICAgaWYgKGZldGNoRXJyb3IgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICAgICAgICAgIGlmIChmZXRjaEVycm9yLm5hbWUgPT09ICdBYm9ydEVycm9yJykge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2UgPSAnUmVxdWVzdCB0aW1lb3V0ICgzMHMpJztcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBbdjBdIENhbGxiYWNrOiBSZXF1ZXN0IHRpbWVvdXQgKDMwcykgZm9yIHJ1biAke3J1bklkfWApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZSA9IGBOZXR3b3JrIGVycm9yOiAke2ZldGNoRXJyb3IubWVzc2FnZX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFt2MF0gQ2FsbGJhY2s6ICR7ZXJyb3JNZXNzYWdlfSBmb3IgcnVuICR7cnVuSWR9YCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFt2MF0gQ2FsbGJhY2s6IFVua25vd24gZXJyb3IgZm9yIHJ1biAke3J1bklkfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gUmVjb3JkIGZhaWxlZCBjYWxsYmFjayB3aXRoIGVycm9yIG1lc3NhZ2UgKG5vIEhUVFAgc3RhdHVzIGZvciBuZXR3b3JrIGVycm9ycylcbiAgICAgICAgICAgIGF3YWl0IHJlY29yZENhbGxiYWNrQXR0ZW1wdChydW5JZCwgJ2ZhaWxlZCcsIHVuZGVmaW5lZCwgZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgLy8gRG9uJ3QgdGhyb3cgLSBjYWxsYmFjayBmYWlsdXJlIHNob3VsZCBub3QgZmFpbCB0aGUgd29ya2Zsb3dcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIC8vIExvZyBlcnJvciBzYWZlbHkgd2l0aG91dCBleHBvc2luZyBzZWNyZXRzXG4gICAgICAgIGNvbnN0IGVycm9yTXNnID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICBjb25zb2xlLmVycm9yKGBbdjBdIENhbGxiYWNrOiBVbmV4cGVjdGVkIGVycm9yIGZvciBydW4gJHtydW5JZH06ICR7ZXJyb3JNc2d9YCk7XG4gICAgLy8gRG9uJ3QgdGhyb3cgLSBjYWxsYmFjayBmYWlsdXJlIHNob3VsZCBub3QgZmFpbCB0aGUgd29ya2Zsb3dcbiAgICB9XG59XG4vKipcbiAqIEJ1aWxkIGNhbGxiYWNrIHBheWxvYWQgYmFzZWQgb24gcnVuIHN0YXR1cyBhbmQgb3B0aW9uc1xuICovIGZ1bmN0aW9uIGJ1aWxkQ2FsbGJhY2tQYXlsb2FkKHJ1biwgb3B0aW9ucykge1xuICAgIGNvbnN0IGlzQ29tcGxldGVkID0gcnVuLnN0YXR1cyA9PT0gJ2NvbXBsZXRlZCc7XG4gICAgY29uc3QgaXNGYWlsZWQgPSBydW4uc3RhdHVzID09PSAnZmFpbGVkJztcbiAgICBjb25zdCBjb21wYWN0UGF5bG9hZCA9IG9wdGlvbnM/LmNvbXBhY3RQYXlsb2FkID09PSB0cnVlO1xuICAgIGlmIChpc0NvbXBsZXRlZCkge1xuICAgICAgICAvLyBCYXNlIHBheWxvYWQgZm9yIGNvbXBsZXRlZCBydW5zXG4gICAgICAgIGNvbnN0IHBheWxvYWQgPSB7XG4gICAgICAgICAgICBydW5faWQ6IHJ1bi5pZCxcbiAgICAgICAgICAgIHN0YXR1czogJ2NvbXBsZXRlZCcsXG4gICAgICAgICAgICBidXNpbmVzc19uYW1lOiBydW4uaW5wdXRfanNvbj8uYnVzaW5lc3NfbmFtZSB8fCBudWxsLFxuICAgICAgICAgICAgYmxvZ190b3BpYzogcnVuLmlucHV0X2pzb24/LmJsb2dfdG9waWMgfHwgcnVuLmlucHV0X2pzb24/LnRvcGljIHx8IG51bGwsXG4gICAgICAgICAgICByZXZpZXdfcmVhZHk6IHRydWUsXG4gICAgICAgICAgICBodW1hbl9yZXZpZXdfcmVxdWlyZWQ6IHRydWVcbiAgICAgICAgfTtcbiAgICAgICAgLy8gQWRkIGRyYWZ0X2V2ZW50IGlmIHByb3ZpZGVkXG4gICAgICAgIGlmIChvcHRpb25zPy5kcmFmdEV2ZW50KSB7XG4gICAgICAgICAgICBwYXlsb2FkLmRyYWZ0X2V2ZW50ID0gb3B0aW9ucy5kcmFmdEV2ZW50O1xuICAgICAgICB9XG4gICAgICAgIC8vIEV4dHJhY3QgcmV2aWV3X3JvdW5kIGZyb20gaW50ZXJuYWxfcmV2aWV3IGlmIGF2YWlsYWJsZVxuICAgICAgICBjb25zdCBpbnRlcm5hbFJldmlldyA9IHJ1bi5maW5hbF9vdXRwdXRfanNvbj8uaW50ZXJuYWxfcmV2aWV3O1xuICAgICAgICBpZiAoaW50ZXJuYWxSZXZpZXcgJiYgdHlwZW9mIGludGVybmFsUmV2aWV3ID09PSAnb2JqZWN0JyAmJiAncmV2aWV3X3JvdW5kJyBpbiBpbnRlcm5hbFJldmlldykge1xuICAgICAgICAgICAgcGF5bG9hZC5yZXZpZXdfcm91bmQgPSBpbnRlcm5hbFJldmlldy5yZXZpZXdfcm91bmQ7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQnVpbGQgb3V0cHV0cyBvYmplY3RcbiAgICAgICAgY29uc3Qgb3V0cHV0cyA9IHtcbiAgICAgICAgICAgIGhhc19yZXNlYXJjaF9qc29uOiAhIXJ1bi5yZXNlYXJjaF9qc29uLFxuICAgICAgICAgICAgaGFzX291dGxpbmVfanNvbjogISFydW4ub3V0bGluZV9qc29uLFxuICAgICAgICAgICAgaGFzX2RyYWZ0X21hcmtkb3duOiAhIXJ1bi5kcmFmdF9tYXJrZG93bixcbiAgICAgICAgICAgIGhhc19vcHRpbWl6ZWRfanNvbjogISFydW4ub3B0aW1pemVkX2pzb24sXG4gICAgICAgICAgICBoYXNfZmluYWxfb3V0cHV0X2pzb246ICEhcnVuLmZpbmFsX291dHB1dF9qc29uLFxuICAgICAgICAgICAgaGFzX2VkaXRlZF9kcmFmdF9tYXJrZG93bjogISFydW4uZmluYWxfb3V0cHV0X2pzb24/LmVkaXRlZF9kcmFmdF9tYXJrZG93biAmJiBydW4uZmluYWxfb3V0cHV0X2pzb24uZWRpdGVkX2RyYWZ0X21hcmtkb3duLmxlbmd0aCA+IDBcbiAgICAgICAgfTtcbiAgICAgICAgcGF5bG9hZC5vdXRwdXRzID0gb3V0cHV0cztcbiAgICAgICAgLy8gSW5jbHVkZSBmdWxsIGZpbmFsX291dHB1dF9qc29uIG9ubHkgaWYgY29tcGFjdCBwYXlsb2FkIGlzIG5vdCByZXF1ZXN0ZWRcbiAgICAgICAgaWYgKCFjb21wYWN0UGF5bG9hZCkge1xuICAgICAgICAgICAgcGF5bG9hZC5maW5hbF9vdXRwdXRfanNvbiA9IHJ1bi5maW5hbF9vdXRwdXRfanNvbjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGF5bG9hZDtcbiAgICB9IGVsc2UgaWYgKGlzRmFpbGVkKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBydW5faWQ6IHJ1bi5pZCxcbiAgICAgICAgICAgIHN0YXR1czogJ2ZhaWxlZCcsXG4gICAgICAgICAgICBidXNpbmVzc19uYW1lOiBydW4uaW5wdXRfanNvbj8uYnVzaW5lc3NfbmFtZSB8fCBudWxsLFxuICAgICAgICAgICAgYmxvZ190b3BpYzogcnVuLmlucHV0X2pzb24/LmJsb2dfdG9waWMgfHwgcnVuLmlucHV0X2pzb24/LnRvcGljIHx8IG51bGwsXG4gICAgICAgICAgICByZXZpZXdfcmVhZHk6IGZhbHNlLFxuICAgICAgICAgICAgaHVtYW5fcmV2aWV3X3JlcXVpcmVkOiB0cnVlLFxuICAgICAgICAgICAgZXJyb3JfbWVzc2FnZTogcnVuLmVycm9yX21lc3NhZ2UgfHwgJ1Vua25vd24gZXJyb3InXG4gICAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gU2hvdWxkbid0IGhhcHBlbiwgYnV0IGhhbmRsZSBncmFjZWZ1bGx5XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBydW5faWQ6IHJ1bi5pZCxcbiAgICAgICAgICAgIHN0YXR1czogcnVuLnN0YXR1cyxcbiAgICAgICAgICAgIGJ1c2luZXNzX25hbWU6IHJ1bi5pbnB1dF9qc29uPy5idXNpbmVzc19uYW1lIHx8IG51bGwsXG4gICAgICAgICAgICBibG9nX3RvcGljOiBydW4uaW5wdXRfanNvbj8uYmxvZ190b3BpYyB8fCBydW4uaW5wdXRfanNvbj8udG9waWMgfHwgbnVsbFxuICAgICAgICB9O1xuICAgIH1cbn1cbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL2NhbGxiYWNrLXN0ZXAvL3NlbmRDYWxsYmFja1N0ZXBcIiwgc2VuZENhbGxiYWNrU3RlcCk7XG4iLCAiaW1wb3J0IHsgcmVnaXN0ZXJTdGVwRnVuY3Rpb24gfSBmcm9tIFwid29ya2Zsb3cvaW50ZXJuYWwvcHJpdmF0ZVwiO1xuaW1wb3J0ICdzZXJ2ZXItb25seSc7XG5pbXBvcnQgeyBnZW5lcmF0ZVRleHQgfSBmcm9tICdhaSc7XG5pbXBvcnQgeyBvcGVuYWkgfSBmcm9tICdAYWktc2RrL29wZW5haSc7XG5pbXBvcnQgeyBnZXRBZ2VudENvbmZpZyB9IGZyb20gJy4uLy4uL3N0b3JhZ2UvYWdlbnQtY29uZmlncyc7XG5pbXBvcnQgeyBidWlsZEZ1bGxJbnB1dENvbnRleHQgfSBmcm9tICcuL2NvbnRleHQtYnVpbGRlcic7XG4vKipfX2ludGVybmFsX3dvcmtmbG93c3tcInN0ZXBzXCI6e1wibGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9lZGl0b3Itc3RlcC50c1wiOntcInJ1bkVkaXRvclN0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9lZGl0b3Itc3RlcC8vcnVuRWRpdG9yU3RlcFwifX19fSovO1xuLyoqXG4gKiBFZGl0b3IgQWdlbnQgU3RlcFxuICogSW1wcm92ZXMgdGhlIGRyYWZ0IGJhc2VkIG9uIFNFTyBRQSByZWNvbW1lbmRhdGlvbnMgYW5kIGJyYW5kIGd1aWRlbGluZXMuXG4gKiBEQiBwcm9tcHQgY29udHJhY3Q6IG1vZGVsIHJldHVybnMgTWFya2Rvd24gb25seS5cbiAqIERvZXMgTk9UIG92ZXJ3cml0ZSBvcmlnaW5hbCBkcmFmdF9tYXJrZG93bjsgZWRpdGVkIG91dHB1dCBnb2VzIHRvIGZpbmFsX291dHB1dF9qc29uLlxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5FZGl0b3JTdGVwKHJ1bklkLCBpbnB1dCwgcmVzZWFyY2gsIG91dGxpbmUsIG9yaWdpbmFsRHJhZnQsIHNlb1FhKSB7XG4gICAgY29uc29sZS5sb2coYFt2MF0gRWRpdG9yIHN0ZXA6IFN0YXJ0aW5nIGZvciBydW4gJHtydW5JZH1gKTtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBhZ2VudENvbmZpZyA9IGF3YWl0IGdldEFnZW50Q29uZmlnKCdlZGl0b3InKTtcbiAgICAgICAgaWYgKCFhZ2VudENvbmZpZykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBY3RpdmUgYWdlbnQgY29uZmlnIG5vdCBmb3VuZCBmb3IgYWdlbnRfa2V5OiBlZGl0b3InKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBTRU8gQmxvZyBBZ2VudCBDb25maWcgTG9hZGVkOiBlZGl0b3IgdiR7YWdlbnRDb25maWcudmVyc2lvbn1gKTtcbiAgICAgICAgY29uc3Qgc3lzdGVtUHJvbXB0ID0gW1xuICAgICAgICAgICAgYWdlbnRDb25maWcuc3lzdGVtX3Byb21wdCxcbiAgICAgICAgICAgIGFnZW50Q29uZmlnLnNraWxsX21hcmtkb3duXG4gICAgICAgIF0uZmlsdGVyKEJvb2xlYW4pLmpvaW4oJ1xcblxcbicpO1xuICAgICAgICBjb25zdCBlZGl0b3JDb250ZXh0ID0gYnVpbGRFZGl0b3JDb250ZXh0KGlucHV0LCByZXNlYXJjaCwgb3V0bGluZSwgc2VvUWEpO1xuICAgICAgICBjb25zdCBtb2RlbE5hbWUgPSBhZ2VudENvbmZpZy5tb2RlbCB8fCBwcm9jZXNzLmVudi5FRElUT1JfQUdFTlRfTU9ERUwgfHwgJ2dwdC01LjQtbWluaSc7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIEVkaXRvciBzdGVwOiBVc2luZyBtb2RlbDogJHttb2RlbE5hbWV9YCk7XG4gICAgICAgIGNvbnN0IHsgdGV4dCB9ID0gYXdhaXQgZ2VuZXJhdGVUZXh0KHtcbiAgICAgICAgICAgIG1vZGVsOiBvcGVuYWkobW9kZWxOYW1lKSxcbiAgICAgICAgICAgIHRlbXBlcmF0dXJlOiAwLjYsXG4gICAgICAgICAgICBtYXhPdXRwdXRUb2tlbnM6IDgwMDAsXG4gICAgICAgICAgICBzeXN0ZW06IHN5c3RlbVByb21wdCxcbiAgICAgICAgICAgIG1lc3NhZ2VzOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICByb2xlOiAndXNlcicsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGBFZGl0IHRoZSBkcmFmdCBiZWxvdyB1c2luZyB0aGUgc3VwcGxpZWQgY29udGV4dCBhbmQgU0VPIFFBIGZlZWRiYWNrLlxcblxcbiR7YnVpbGRGdWxsSW5wdXRDb250ZXh0KGlucHV0KX1cXG5cXG5SZXNlYXJjaCBBZ2VudCBPdXRwdXQ6XFxuJHtKU09OLnN0cmluZ2lmeShyZXNlYXJjaCwgbnVsbCwgMil9XFxuXFxuT3V0bGluZSBBZ2VudCBPdXRwdXQ6XFxuJHtKU09OLnN0cmluZ2lmeShvdXRsaW5lLCBudWxsLCAyKX1cXG5cXG5TRU8gUUEgRmVlZGJhY2s6XFxuJHtlZGl0b3JDb250ZXh0fVxcblxcbk9yaWdpbmFsIERyYWZ0IE1hcmtkb3duOlxcbiR7b3JpZ2luYWxEcmFmdH1cXG5cXG5SZXR1cm4gdGhlIGVkaXRlZCBibG9nIGluIE1hcmtkb3duIG9ubHkuIERvIG5vdCByZXR1cm4gSlNPTi4gRG8gbm90IGluY2x1ZGUgZXhwbGFuYXRpb25zLCBlZGl0b3Igbm90ZXMsIG1hcmtkb3duIGZlbmNlcywgb3IgY29tbWVudHMgb3V0c2lkZSB0aGUgYXJ0aWNsZS5gXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXVxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgZWRpdGVkRHJhZnQgPSB0ZXh0LnRyaW0oKTtcbiAgICAgICAgaWYgKCFlZGl0ZWREcmFmdCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFZGl0b3Igb3V0cHV0IHdhcyBlbXB0eScpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlZGl0ZWREcmFmdC5zdGFydHNXaXRoKCd7JykpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRWRpdG9yIG91dHB1dCBpbnZhbGlkOiBleHBlY3RlZCBNYXJrZG93biwgcmVjZWl2ZWQgSlNPTi1saWtlIHJlc3BvbnNlJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVkaXRlZERyYWZ0Lmxlbmd0aCA8IE1hdGgubWluKDUwMCwgTWF0aC5mbG9vcihvcmlnaW5hbERyYWZ0Lmxlbmd0aCAqIDAuNCkpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0VkaXRvciBvdXRwdXQgdG9vIHNob3J0IGNvbXBhcmVkIHdpdGggb3JpZ2luYWwgZHJhZnQnKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBlZGl0b3JPdXRwdXQgPSB7XG4gICAgICAgICAgICBlZGl0ZWRfZHJhZnRfbWFya2Rvd246IGVkaXRlZERyYWZ0LFxuICAgICAgICAgICAgZWRpdG9yX25vdGVzOiBbXG4gICAgICAgICAgICAgICAgJ0VkaXRvciBBZ2VudCByZXR1cm5lZCBNYXJrZG93biBvbmx5IGFzIHJlcXVpcmVkIGJ5IHRoZSBhY3RpdmUgREIgcHJvbXB0LidcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBjaGFuZ2VzX21hZGU6IHNlb1FhLnByaW9yaXR5X2ZpeGVzIHx8IFtdLFxuICAgICAgICAgICAgaHVtYW5fcmV2aWV3X3JlcXVpcmVkOiB0cnVlXG4gICAgICAgIH07XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIEVkaXRvciBzdGVwOiBHZW5lcmF0ZWQgZWRpdGVkIGRyYWZ0ICgke2VkaXRvck91dHB1dC5lZGl0ZWRfZHJhZnRfbWFya2Rvd24ubGVuZ3RofSBjaGFycylgKTtcbiAgICAgICAgcmV0dXJuIGVkaXRvck91dHB1dDtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2MF0gRWRpdG9yIHN0ZXAgZXJyb3I6ICR7ZXJyb3JNZXNzYWdlfWApO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG59XG5mdW5jdGlvbiBidWlsZEVkaXRvckNvbnRleHQoaW5wdXQsIHJlc2VhcmNoLCBvdXRsaW5lLCBzZW9RYSkge1xuICAgIGNvbnN0IHNlY3Rpb25zID0gW107XG4gICAgc2VjdGlvbnMucHVzaCgnIyMgU0VPIFBlcmZvcm1hbmNlIFN1bW1hcnknKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBPdmVyYWxsIFNjb3JlOiAke3Nlb1FhLm92ZXJhbGxfc2NvcmV9LzEwMGApO1xuICAgIHNlY3Rpb25zLnB1c2goYFJlYWR5IEZvciBFZGl0b3I6ICR7c2VvUWEucmVhZHlfZm9yX2VkaXRvcn1gKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBSZWNvbW1lbmRlZCBOZXh0IEFjdGlvbjogJHtzZW9RYS5yZWNvbW1lbmRlZF9uZXh0X2FjdGlvbn1gKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBOZWVkcyBSZXZpZXc6ICR7c2VvUWEubmVlZHNfcmV2aWV3fWApO1xuICAgIHNlY3Rpb25zLnB1c2goJ1xcbiMjIFNlYXJjaCBJbnRlbnQgQWxpZ25tZW50Jyk7XG4gICAgc2VjdGlvbnMucHVzaChgU2NvcmU6ICR7c2VvUWEuc2VhcmNoX2ludGVudF9hbGlnbm1lbnQuc2NvcmV9LzEwMGApO1xuICAgIHNlY3Rpb25zLnB1c2goYEFuYWx5c2lzOiAke3Nlb1FhLnNlYXJjaF9pbnRlbnRfYWxpZ25tZW50LmFuYWx5c2lzfWApO1xuICAgIHNlY3Rpb25zLnB1c2goJ1xcbiMjIFByaW1hcnkgS2V5d29yZCBVc2FnZScpO1xuICAgIHNlY3Rpb25zLnB1c2goYFNjb3JlOiAke3Nlb1FhLnByaW1hcnlfa2V5d29yZF91c2FnZS5zY29yZX0vMTAwYCk7XG4gICAgc2VjdGlvbnMucHVzaChgT2NjdXJyZW5jZXM6ICR7c2VvUWEucHJpbWFyeV9rZXl3b3JkX3VzYWdlLm9jY3VycmVuY2VzfSB0aW1lc2ApO1xuICAgIHNlY3Rpb25zLnB1c2goYFBsYWNlbWVudDogJHtzZW9RYS5wcmltYXJ5X2tleXdvcmRfdXNhZ2UucGxhY2VtZW50X2FuYWx5c2lzfWApO1xuICAgIHNlY3Rpb25zLnB1c2goJ1xcbiMjIFNlY29uZGFyeSBLZXl3b3JkcycpO1xuICAgIHNlY3Rpb25zLnB1c2goYFNjb3JlOiAke3Nlb1FhLnNlY29uZGFyeV9rZXl3b3JkX3VzYWdlLnNjb3JlfS8xMDBgKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBDb3ZlcmVkOiAke3Nlb1FhLnNlY29uZGFyeV9rZXl3b3JkX3VzYWdlLmtleXdvcmRzX2NvdmVyZWQuam9pbignLCAnKSB8fCAnTm9uZSd9YCk7XG4gICAgaWYgKHNlb1FhLnNlY29uZGFyeV9rZXl3b3JkX3VzYWdlLmdhcHMubGVuZ3RoID4gMCkge1xuICAgICAgICBzZWN0aW9ucy5wdXNoKGBHYXBzOiAke3Nlb1FhLnNlY29uZGFyeV9rZXl3b3JkX3VzYWdlLmdhcHMuam9pbignLCAnKX1gKTtcbiAgICB9XG4gICAgc2VjdGlvbnMucHVzaCgnXFxuIyMgSGVhZGluZyBTdHJ1Y3R1cmUnKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBTY29yZTogJHtzZW9RYS5oZWFkaW5nX3N0cnVjdHVyZV9yZXZpZXcuc2NvcmV9LzEwMGApO1xuICAgIHNlY3Rpb25zLnB1c2goYEgxIFByZXNlbnQ6ICR7c2VvUWEuaGVhZGluZ19zdHJ1Y3R1cmVfcmV2aWV3LmgxX3ByZXNlbnR9YCk7XG4gICAgc2VjdGlvbnMucHVzaChgSDIgQ291bnQ6ICR7c2VvUWEuaGVhZGluZ19zdHJ1Y3R1cmVfcmV2aWV3LmgyX2NvdW50fWApO1xuICAgIGlmIChzZW9RYS5oZWFkaW5nX3N0cnVjdHVyZV9yZXZpZXcuaGllcmFyY2h5X2lzc3Vlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHNlY3Rpb25zLnB1c2goYElzc3VlczogJHtzZW9RYS5oZWFkaW5nX3N0cnVjdHVyZV9yZXZpZXcuaGllcmFyY2h5X2lzc3Vlcy5qb2luKCc7ICcpfWApO1xuICAgIH1cbiAgICBzZWN0aW9ucy5wdXNoKCdcXG4jIyBDb250ZW50IERlcHRoJyk7XG4gICAgc2VjdGlvbnMucHVzaChgU2NvcmU6ICR7c2VvUWEuY29udGVudF9kZXB0aF9yZXZpZXcuc2NvcmV9LzEwMGApO1xuICAgIHNlY3Rpb25zLnB1c2goYFdvcmQgQ291bnQ6ICR7c2VvUWEuY29udGVudF9kZXB0aF9yZXZpZXcud29yZF9jb3VudH0gd29yZHNgKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBDb3ZlcmFnZTogJHtzZW9RYS5jb250ZW50X2RlcHRoX3Jldmlldy5zZWN0aW9uX2NvdmVyYWdlfWApO1xuICAgIGlmIChzZW9RYS5jb250ZW50X2RlcHRoX3Jldmlldy5kZXB0aF9pc3N1ZXMubGVuZ3RoID4gMCkge1xuICAgICAgICBzZWN0aW9ucy5wdXNoKGBJc3N1ZXM6ICR7c2VvUWEuY29udGVudF9kZXB0aF9yZXZpZXcuZGVwdGhfaXNzdWVzLmpvaW4oJzsgJyl9YCk7XG4gICAgfVxuICAgIHNlY3Rpb25zLnB1c2goJ1xcbiMjIFJlYWRhYmlsaXR5Jyk7XG4gICAgc2VjdGlvbnMucHVzaChgU2NvcmU6ICR7c2VvUWEucmVhZGFiaWxpdHlfcmV2aWV3LnNjb3JlfS8xMDBgKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBBdmcgU2VudGVuY2UgTGVuZ3RoOiAke3Nlb1FhLnJlYWRhYmlsaXR5X3Jldmlldy5hdmdfc2VudGVuY2VfbGVuZ3RofSB3b3Jkc2ApO1xuICAgIHNlY3Rpb25zLnB1c2goYFJlYWRpbmcgTGV2ZWw6ICR7c2VvUWEucmVhZGFiaWxpdHlfcmV2aWV3LmZsZXNjaF9raW5jYWlkX2VzdGltYXRlfWApO1xuICAgIGlmIChzZW9RYS5yZWFkYWJpbGl0eV9yZXZpZXcucmVhZGFiaWxpdHlfaXNzdWVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgc2VjdGlvbnMucHVzaChgSXNzdWVzOiAke3Nlb1FhLnJlYWRhYmlsaXR5X3Jldmlldy5yZWFkYWJpbGl0eV9pc3N1ZXMuam9pbignOyAnKX1gKTtcbiAgICB9XG4gICAgc2VjdGlvbnMucHVzaCgnXFxuIyMgQ1RBIFJldmlldycpO1xuICAgIHNlY3Rpb25zLnB1c2goYFNjb3JlOiAke3Nlb1FhLmN0YV9yZXZpZXcuc2NvcmV9LzEwMGApO1xuICAgIHNlY3Rpb25zLnB1c2goYENUQSBQcmVzZW50OiAke3Nlb1FhLmN0YV9yZXZpZXcuY3RhX3ByZXNlbnR9YCk7XG4gICAgc2VjdGlvbnMucHVzaChgQ1RBIEFuYWx5c2lzOiAke3Nlb1FhLmN0YV9yZXZpZXcuY3RhX2FuYWx5c2lzfWApO1xuICAgIHNlY3Rpb25zLnB1c2goJ1xcbiMjIEludGVybmFsIExpbmtpbmcnKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBTY29yZTogJHtzZW9RYS5pbnRlcm5hbF9saW5raW5nX3Jldmlldy5zY29yZX0vMTAwYCk7XG4gICAgc2VjdGlvbnMucHVzaChgTGlua3MgRm91bmQ6ICR7c2VvUWEuaW50ZXJuYWxfbGlua2luZ19yZXZpZXcuaW50ZXJuYWxfbGlua3NfZm91bmR9YCk7XG4gICAgaWYgKHNlb1FhLmludGVybmFsX2xpbmtpbmdfcmV2aWV3LmludGVybmFsX2xpbmtfcmVjb21tZW5kYXRpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgc2VjdGlvbnMucHVzaChgUmVjb21tZW5kYXRpb25zOiAke3Nlb1FhLmludGVybmFsX2xpbmtpbmdfcmV2aWV3LmludGVybmFsX2xpbmtfcmVjb21tZW5kYXRpb25zLmpvaW4oJzsgJyl9YCk7XG4gICAgfVxuICAgIHNlY3Rpb25zLnB1c2goJ1xcbiMjIENsaWVudCBHb2FsIEFsaWdubWVudCcpO1xuICAgIHNlY3Rpb25zLnB1c2goYFNjb3JlOiAke3Nlb1FhLmNsaWVudF9nb2FsX2FsaWdubWVudC5zY29yZX0vMTAwYCk7XG4gICAgc2VjdGlvbnMucHVzaChgQW5hbHlzaXM6ICR7c2VvUWEuY2xpZW50X2dvYWxfYWxpZ25tZW50LmFuYWx5c2lzfWApO1xuICAgIGlmIChzZW9RYS5wcmlvcml0eV9maXhlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHNlY3Rpb25zLnB1c2goJ1xcbiMjIFByaW9yaXR5IEZpeGVzJyk7XG4gICAgICAgIHNlY3Rpb25zLnB1c2goc2VvUWEucHJpb3JpdHlfZml4ZXMubWFwKChmaXgpPT5gLSAke2ZpeH1gKS5qb2luKCdcXG4nKSk7XG4gICAgfVxuICAgIGlmIChzZW9RYS5yaXNrX2ZsYWdzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgc2VjdGlvbnMucHVzaCgnXFxuIyMgUmlzayBGbGFncycpO1xuICAgICAgICBzZWN0aW9ucy5wdXNoKHNlb1FhLnJpc2tfZmxhZ3MubWFwKChmbGFnKT0+YC0gJHtmbGFnfWApLmpvaW4oJ1xcbicpKTtcbiAgICB9XG4gICAgc2VjdGlvbnMucHVzaCgnXFxuIyMgUmVzZWFyY2ggTm90ZXMnKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBDb250ZW50IEFuZ2xlOiAke3Jlc2VhcmNoLmNvbnRlbnRfYW5nbGV9YCk7XG4gICAgc2VjdGlvbnMucHVzaChgQ2xpZW50IEdvYWwgQWxpZ25tZW50OiAke3Jlc2VhcmNoLmNsaWVudF9nb2FsX2FsaWdubWVudH1gKTtcbiAgICBzZWN0aW9ucy5wdXNoKCdcXG4jIyBPdXRsaW5lIE5vdGVzJyk7XG4gICAgc2VjdGlvbnMucHVzaChgVGl0bGU6ICR7b3V0bGluZS50aXRsZX1gKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBDVEEgR3VpZGFuY2U6ICR7b3V0bGluZS5jdGFfZ3VpZGFuY2V9YCk7XG4gICAgc2VjdGlvbnMucHVzaCgnXFxuIyMgQWRkaXRpb25hbCBDbGllbnQgR3VpZGFuY2UnKTtcbiAgICBpZiAoaW5wdXQuY3RhX25vdGVzIHx8IGlucHV0LmN0YSB8fCBpbnB1dC5ibG9nX2NvbnRleHRfYnJpZWY/LmN0YSkge1xuICAgICAgICBzZWN0aW9ucy5wdXNoKGBDVEEgTm90ZXM6ICR7aW5wdXQuYmxvZ19jb250ZXh0X2JyaWVmPy5jdGEgfHwgaW5wdXQuY3RhIHx8IGlucHV0LmN0YV9ub3Rlc31gKTtcbiAgICB9XG4gICAgaWYgKGlucHV0LmJyYW5kX3ZvaWNlX25vdGVzIHx8IGlucHV0LmJsb2dfY29udGV4dF9icmllZj8uYnJhbmRfdm9pY2Vfbm90ZXMgfHwgaW5wdXQudG9uZSkge1xuICAgICAgICBzZWN0aW9ucy5wdXNoKGBCcmFuZCBWb2ljZTogJHtpbnB1dC5ibG9nX2NvbnRleHRfYnJpZWY/LmJyYW5kX3ZvaWNlX25vdGVzIHx8IGlucHV0LmJyYW5kX3ZvaWNlX25vdGVzIHx8IGlucHV0LnRvbmV9YCk7XG4gICAgfVxuICAgIGlmIChpbnB1dC5hdWRpZW5jZV9ub3RlcyB8fCBpbnB1dC50YXJnZXRfYXVkaWVuY2UgfHwgaW5wdXQuYmxvZ19jb250ZXh0X2JyaWVmPy50YXJnZXRfYXVkaWVuY2UpIHtcbiAgICAgICAgc2VjdGlvbnMucHVzaChgVGFyZ2V0IEF1ZGllbmNlOiAke2lucHV0LmJsb2dfY29udGV4dF9icmllZj8udGFyZ2V0X2F1ZGllbmNlIHx8IGlucHV0LnRhcmdldF9hdWRpZW5jZSB8fCBpbnB1dC5hdWRpZW5jZV9ub3Rlc31gKTtcbiAgICB9XG4gICAgcmV0dXJuIHNlY3Rpb25zLmpvaW4oJ1xcbicpO1xufVxucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvZWRpdG9yLXN0ZXAvL3J1bkVkaXRvclN0ZXBcIiwgcnVuRWRpdG9yU3RlcCk7XG4iLCAiaW1wb3J0IHsgcmVnaXN0ZXJTdGVwRnVuY3Rpb24gfSBmcm9tIFwid29ya2Zsb3cvaW50ZXJuYWwvcHJpdmF0ZVwiO1xuaW1wb3J0ICdzZXJ2ZXItb25seSc7XG5pbXBvcnQgeyB1cGRhdGVSdW5TdGF0dXMsIHVwZGF0ZVJ1bkVycm9yLCBjb21wbGV0ZVJ1biB9IGZyb20gJy4uLy4uL3N0b3JhZ2UvcnVucyc7XG4vKipfX2ludGVybmFsX3dvcmtmbG93c3tcInN0ZXBzXCI6e1wibGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9oZWxwZXJzLnRzXCI6e1wiY29tcGxldGVSdW5TdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvaGVscGVycy8vY29tcGxldGVSdW5TdGVwXCJ9LFwibWFya1J1bkZhaWxlZFN0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9oZWxwZXJzLy9tYXJrUnVuRmFpbGVkU3RlcFwifSxcIm1hcmtSdW5SdW5uaW5nU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL2hlbHBlcnMvL21hcmtSdW5SdW5uaW5nU3RlcFwifX19fSovO1xuLyoqXG4gKiBNYXJrIGEgcnVuIGFzIHJ1bm5pbmcgKHRyYW5zaXRpb24gZnJvbSBxdWV1ZWQgdG8gcnVubmluZylcbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gbWFya1J1blJ1bm5pbmdTdGVwKHJ1bklkKSB7XG4gICAgY29uc29sZS5sb2coYFt2MF0gSGVscGVyOiBNYXJraW5nIHJ1biAke3J1bklkfSBhcyBydW5uaW5nYCk7XG4gICAgYXdhaXQgdXBkYXRlUnVuU3RhdHVzKHJ1bklkLCAncmVzZWFyY2hpbmcnKTtcbn1cbi8qKlxuICogTWFyayBhIHJ1biBhcyBmYWlsZWQgd2l0aCBlcnJvciBtZXNzYWdlXG4gKiBDYWxsYmFjayBpcyBzZW50IGJ5IHdvcmtmbG93IG9yY2hlc3RyYXRvciwgbm90IGhlcmVcbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gbWFya1J1bkZhaWxlZFN0ZXAocnVuSWQsIGVycm9yTWVzc2FnZSkge1xuICAgIGNvbnNvbGUubG9nKGBbdjBdIEhlbHBlcjogTWFya2luZyBydW4gJHtydW5JZH0gYXMgZmFpbGVkIHdpdGggZXJyb3I6ICR7ZXJyb3JNZXNzYWdlfWApO1xuICAgIGF3YWl0IHVwZGF0ZVJ1bkVycm9yKHJ1bklkLCBlcnJvck1lc3NhZ2UpO1xufVxuLyoqXG4gKiBDb21wbGV0ZSBhIHJ1biB3aXRoIGZpbmFsIG91dHB1dFxuICogQ2FsbGJhY2sgaXMgc2VudCBieSB3b3JrZmxvdyBvcmNoZXN0cmF0b3IsIG5vdCBoZXJlXG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNvbXBsZXRlUnVuU3RlcChydW5JZCwgZmluYWxPdXRwdXQpIHtcbiAgICBjb25zb2xlLmxvZyhgW3YwXSBIZWxwZXI6IENvbXBsZXRpbmcgcnVuICR7cnVuSWR9YCk7XG4gICAgYXdhaXQgY29tcGxldGVSdW4ocnVuSWQsIGZpbmFsT3V0cHV0KTtcbn1cbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL2hlbHBlcnMvL21hcmtSdW5SdW5uaW5nU3RlcFwiLCBtYXJrUnVuUnVubmluZ1N0ZXApO1xucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvaGVscGVycy8vbWFya1J1bkZhaWxlZFN0ZXBcIiwgbWFya1J1bkZhaWxlZFN0ZXApO1xucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvaGVscGVycy8vY29tcGxldGVSdW5TdGVwXCIsIGNvbXBsZXRlUnVuU3RlcCk7XG4iLCAiaW1wb3J0IHsgcmVnaXN0ZXJTdGVwRnVuY3Rpb24gfSBmcm9tIFwid29ya2Zsb3cvaW50ZXJuYWwvcHJpdmF0ZVwiO1xuaW1wb3J0ICdzZXJ2ZXItb25seSc7XG5pbXBvcnQgeyBnZW5lcmF0ZVRleHQgfSBmcm9tICdhaSc7XG5pbXBvcnQgeyBvcGVuYWkgfSBmcm9tICdAYWktc2RrL29wZW5haSc7XG5pbXBvcnQgeyBnZXRBZ2VudENvbmZpZyB9IGZyb20gJy4uLy4uL3N0b3JhZ2UvYWdlbnQtY29uZmlncyc7XG5pbXBvcnQgeyBidWlsZEZ1bGxJbnB1dENvbnRleHQsIGV4dHJhY3RKc29uT2JqZWN0IH0gZnJvbSAnLi9jb250ZXh0LWJ1aWxkZXInO1xuLyoqX19pbnRlcm5hbF93b3JrZmxvd3N7XCJzdGVwc1wiOntcImxpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvbWV0YS1zdGVwLnRzXCI6e1wicnVuTWV0YVN0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9tZXRhLXN0ZXAvL3J1bk1ldGFTdGVwXCJ9fX19Ki87XG4vKipcbiAqIE1ldGEgQWdlbnQgU3RlcCAtIFBoYXNlIDJDLUZcbiAqIEdlbmVyYXRlcyBTRU8gbWV0YWRhdGEgZm9yIGh1bWFuIHJldmlld1xuICogRG9lcyBOT1QgcHVibGlzaCwgY2FsbCBleHRlcm5hbCBzZXJ2aWNlcywgb3Igb3ZlcndyaXRlIGRyYWZ0c1xuICogT3V0cHV0IGdvZXMgdG8gZmluYWxfb3V0cHV0X2pzb24gYXMgbWV0YV9qc29uXG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJ1bk1ldGFTdGVwKHJ1bklkLCBpbnB1dCwgcmVzZWFyY2gsIG91dGxpbmUsIG9yaWdpbmFsRHJhZnQsIHNlb1FhLCBlZGl0ZWREcmFmdCkge1xuICAgIGNvbnNvbGUubG9nKGBbdjBdIE1ldGEgc3RlcDogU3RhcnRpbmcgZm9yIHJ1biAke3J1bklkfWApO1xuICAgIHRyeSB7XG4gICAgICAgIC8vIExvYWQgYWdlbnQgY29uZmlnIGZyb20gZGF0YWJhc2VcbiAgICAgICAgY29uc3QgYWdlbnRDb25maWcgPSBhd2FpdCBnZXRBZ2VudENvbmZpZygnbWV0YScpO1xuICAgICAgICBpZiAoIWFnZW50Q29uZmlnKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0FjdGl2ZSBhZ2VudCBjb25maWcgbm90IGZvdW5kIGZvciBhZ2VudF9rZXk6IG1ldGEnKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBTRU8gQmxvZyBBZ2VudCBDb25maWcgTG9hZGVkOiBtZXRhIHYke2FnZW50Q29uZmlnLnZlcnNpb259YCk7XG4gICAgICAgIC8vIEJ1aWxkIHN5c3RlbSBwcm9tcHQgZnJvbSBkYXRhYmFzZSBjb25maWdcbiAgICAgICAgY29uc3Qgc3lzdGVtUHJvbXB0ID0gW1xuICAgICAgICAgICAgYWdlbnRDb25maWcuc3lzdGVtX3Byb21wdCxcbiAgICAgICAgICAgIGFnZW50Q29uZmlnLnNraWxsX21hcmtkb3duXG4gICAgICAgIF0uZmlsdGVyKEJvb2xlYW4pLmpvaW4oJ1xcblxcbicpO1xuICAgICAgICAvLyBCdWlsZCBjb250ZXh0IGZvciBtZXRhIGdlbmVyYXRpb25cbiAgICAgICAgY29uc3QgbWV0YUNvbnRleHQgPSBidWlsZE1ldGFDb250ZXh0KGlucHV0LCByZXNlYXJjaCwgb3V0bGluZSwgc2VvUWEsIG9yaWdpbmFsRHJhZnQsIGVkaXRlZERyYWZ0KTtcbiAgICAgICAgLy8gR2V0IG1vZGVsIG5hbWU6IHVzZSBEQiBjb25maWcgaWYgYXZhaWxhYmxlLCBvdGhlcndpc2UgZmFsbCBiYWNrIHRvIGVudiB2YXIgb3IgZGVmYXVsdFxuICAgICAgICBjb25zdCBtb2RlbE5hbWUgPSBhZ2VudENvbmZpZy5tb2RlbCB8fCBwcm9jZXNzLmVudi5NRVRBX0FHRU5UX01PREVMIHx8ICdncHQtNS40LW1pbmknO1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBNZXRhIHN0ZXA6IFVzaW5nIG1vZGVsOiAke21vZGVsTmFtZX1gKTtcbiAgICAgICAgLy8gR2VuZXJhdGUgbWV0YWRhdGFcbiAgICAgICAgY29uc3QgeyB0ZXh0OiBtZXRhQW5hbHlzaXMgfSA9IGF3YWl0IGdlbmVyYXRlVGV4dCh7XG4gICAgICAgICAgICBtb2RlbDogb3BlbmFpKG1vZGVsTmFtZSksXG4gICAgICAgICAgICBzeXN0ZW06IHN5c3RlbVByb21wdCxcbiAgICAgICAgICAgIHRlbXBlcmF0dXJlOiAwLjUsXG4gICAgICAgICAgICBtZXNzYWdlczogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcm9sZTogJ3VzZXInLFxuICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBtZXRhQ29udGV4dFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF1cbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIE1ldGEgc3RlcDogUmVjZWl2ZWQgYW5hbHlzaXMsIHBhcnNpbmcgSlNPTmApO1xuICAgICAgICAvLyBQYXJzZSB0aGUgcmVzcG9uc2UgLSBGQUlMLUxPVUQgaW4gcHJvZHVjdGlvblxuICAgICAgICBsZXQgbWV0YU91dHB1dDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIG1ldGFPdXRwdXQgPSBKU09OLnBhcnNlKGV4dHJhY3RKc29uT2JqZWN0KG1ldGFBbmFseXNpcykpO1xuICAgICAgICB9IGNhdGNoIChwYXJzZUVycm9yKSB7XG4gICAgICAgICAgICAvLyBQUk9EVUNUSU9OIE1PREU6IEFsd2F5cyBmYWlsIGxvdWQgb24gcGFyc2UgZXJyb3JzLlxuICAgICAgICAgICAgLy8gRmFsbGJhY2sgaXMgbm90IHVzZWQgaW4gbm9ybWFsIHdvcmtmbG93IC0gdGhpcyBlbnN1cmVzIEFJIG1vZGVsIHNjaGVtYSBjb21wbGlhbmNlLlxuICAgICAgICAgICAgY29uc3QgZXJyb3JNc2cgPSBwYXJzZUVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBwYXJzZUVycm9yLm1lc3NhZ2UgOiBTdHJpbmcocGFyc2VFcnJvcik7XG4gICAgICAgICAgICBjb25zdCBmdWxsRXJyb3IgPSBgTWV0YSBvdXRwdXQgcGFyc2UgZmFpbGVkOiAke2Vycm9yTXNnfWA7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbdjBdIE1ldGEgc3RlcDogJHtmdWxsRXJyb3J9YCk7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZnVsbEVycm9yKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBGQUlMLUxPVUQ6IFZhbGlkYXRlIGFsbCByZXF1aXJlZCBmaWVsZHMgZXhpc3QgYW5kIGhhdmUgY29ycmVjdCB0eXBlc1xuICAgICAgICBjb25zdCBmaWVsZFZhbGlkYXRpb25zID0gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZpZWxkOiAnbWV0YV90aXRsZScsXG4gICAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICAgICAgY2hlY2s6ICh2KT0+dHlwZW9mIHYgPT09ICdzdHJpbmcnICYmIHYubGVuZ3RoID4gMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBmaWVsZDogJ21ldGFfZGVzY3JpcHRpb24nLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICAgIGNoZWNrOiAodik9PnR5cGVvZiB2ID09PSAnc3RyaW5nJyAmJiB2Lmxlbmd0aCA+IDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZmllbGQ6ICdzbHVnJyxcbiAgICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgICBjaGVjazogKHYpPT50eXBlb2YgdiA9PT0gJ3N0cmluZycgJiYgdi5sZW5ndGggPiAwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZpZWxkOiAnc29jaWFsX3ByZXZpZXcnLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICAgICAgICAgIGNoZWNrOiAodik9PnR5cGVvZiB2ID09PSAnb2JqZWN0JyAmJiB2LnRpdGxlICYmIHYuZGVzY3JpcHRpb25cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZmllbGQ6ICdzY2hlbWFfbWFya3VwJyxcbiAgICAgICAgICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgICAgICAgICBjaGVjazogKHYpPT50eXBlb2YgdiA9PT0gJ29iamVjdCcgJiYgdlsnQHR5cGUnXSAmJiB2LmhlYWRsaW5lICYmIHYuZGVzY3JpcHRpb25cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZmllbGQ6ICdwcmltYXJ5X2tleXdvcmRfdXNlZCcsXG4gICAgICAgICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICAgICAgICAgIGNoZWNrOiAodik9PnR5cGVvZiB2ID09PSAnYm9vbGVhbidcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZmllbGQ6ICdzZWNvbmRhcnlfa2V5d29yZHNfcmVmbGVjdGVkJyxcbiAgICAgICAgICAgICAgICB0eXBlOiAnYXJyYXknLFxuICAgICAgICAgICAgICAgIGNoZWNrOiAodik9PkFycmF5LmlzQXJyYXkodilcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZmllbGQ6ICdjbGllbnRfZ29hbF9yZWZsZWN0ZWQnLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgICAgICAgICBjaGVjazogKHYpPT50eXBlb2YgdiA9PT0gJ2Jvb2xlYW4nXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZpZWxkOiAnaHVtYW5fcmV2aWV3X3JlcXVpcmVkJyxcbiAgICAgICAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgICAgICAgICAgY2hlY2s6ICh2KT0+dHlwZW9mIHYgPT09ICdib29sZWFuJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBmaWVsZDogJ3Jldmlld19yZWFkeScsXG4gICAgICAgICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICAgICAgICAgIGNoZWNrOiAodik9PnR5cGVvZiB2ID09PSAnYm9vbGVhbidcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZmllbGQ6ICdtZXRhX25vdGVzJyxcbiAgICAgICAgICAgICAgICB0eXBlOiAnYXJyYXknLFxuICAgICAgICAgICAgICAgIGNoZWNrOiAodik9PkFycmF5LmlzQXJyYXkodilcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZmllbGQ6ICduZWVkc19yZXZpZXcnLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgICAgICAgICBjaGVjazogKHYpPT50eXBlb2YgdiA9PT0gJ2Jvb2xlYW4nXG4gICAgICAgICAgICB9XG4gICAgICAgIF07XG4gICAgICAgIGNvbnN0IHZhbGlkYXRpb25FcnJvcnMgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCB2YWxpZGF0aW9uIG9mIGZpZWxkVmFsaWRhdGlvbnMpe1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBtZXRhT3V0cHV0W3ZhbGlkYXRpb24uZmllbGRdO1xuICAgICAgICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICB2YWxpZGF0aW9uRXJyb3JzLnB1c2goYCR7dmFsaWRhdGlvbi5maWVsZH0gaXMgbWlzc2luZ2ApO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghdmFsaWRhdGlvbi5jaGVjayh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICB2YWxpZGF0aW9uRXJyb3JzLnB1c2goYCR7dmFsaWRhdGlvbi5maWVsZH0gaGFzIGludmFsaWQgdHlwZSAoZXhwZWN0ZWQgJHt2YWxpZGF0aW9uLnR5cGV9KWApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICh2YWxpZGF0aW9uRXJyb3JzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgTWV0YSBvdXRwdXQgdmFsaWRhdGlvbiBmYWlsZWQ6ICR7dmFsaWRhdGlvbkVycm9ycy5qb2luKCc7ICcpfWApO1xuICAgICAgICB9XG4gICAgICAgIC8vIExpZ2h0d2VpZ2h0IGZpZWxkIGNvbnN0cmFpbnRzIChubyBzaWxlbnQgbW9kaWZpY2F0aW9uKVxuICAgICAgICBpZiAobWV0YU91dHB1dC5tZXRhX3RpdGxlLmxlbmd0aCA+IDcwKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE1ldGEgdGl0bGUgdG9vIGxvbmc6ICR7bWV0YU91dHB1dC5tZXRhX3RpdGxlLmxlbmd0aH0gY2hhcnMsIG1heCA3MGApO1xuICAgICAgICB9XG4gICAgICAgIGlmIChtZXRhT3V0cHV0Lm1ldGFfZGVzY3JpcHRpb24ubGVuZ3RoID4gMTYwKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE1ldGEgZGVzY3JpcHRpb24gdG9vIGxvbmc6ICR7bWV0YU91dHB1dC5tZXRhX2Rlc2NyaXB0aW9uLmxlbmd0aH0gY2hhcnMsIG1heCAxNjBgKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBNZXRhIHN0ZXA6IENvbXBsZXRlIGZvciBydW4gJHtydW5JZH1gLCBgR2VuZXJhdGVkIG1ldGFkYXRhOiAke21ldGFPdXRwdXQubWV0YV90aXRsZS5zdWJzdHJpbmcoMCwgNTApfS4uLmApO1xuICAgICAgICByZXR1cm4gbWV0YU91dHB1dDtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2MF0gTWV0YSBzdGVwIGVycm9yIGZvciBydW4gJHtydW5JZH06ICR7ZXJyb3JNZXNzYWdlfWApO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG59XG4vKipcbiAqIEJ1aWxkIGNvbnRleHQgcHJvbXB0IGZvciBtZXRhZGF0YSBnZW5lcmF0aW9uXG4gKi8gZnVuY3Rpb24gYnVpbGRNZXRhQ29udGV4dChpbnB1dCwgcmVzZWFyY2gsIG91dGxpbmUsIHNlb1FhLCBvcmlnaW5hbERyYWZ0LCBlZGl0ZWREcmFmdCkge1xuICAgIC8vIFZhbGlkYXRlIHJlcXVpcmVkIHJlc2VhcmNoLmtleV9maW5kaW5ncyBiZWZvcmUgdXNpbmdcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkocmVzZWFyY2gua2V5X2ZpbmRpbmdzKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Jlc2VhcmNoIG91dHB1dCBtaXNzaW5nIHJlcXVpcmVkIGtleV9maW5kaW5ncyBhcnJheSBmb3IgbWV0YS1zdGVwJyk7XG4gICAgfVxuICAgIGNvbnN0IHdvcmRDb3VudCA9IGVkaXRlZERyYWZ0LnNwbGl0KC9cXHMrLykubGVuZ3RoO1xuICAgIGNvbnN0IGhlYWRpbmdzID0gZWRpdGVkRHJhZnQubWF0Y2goL14jK1xccysuKyQvZ20pIHx8IFtdO1xuICAgIGNvbnN0IGtleUZpbmRpbmdzU3VtbWFyeSA9IHJlc2VhcmNoLmtleV9maW5kaW5ncy5zbGljZSgwLCAzKS5qb2luKCdcXG4tICcpO1xuICAgIHJldHVybiBgWW91IGFyZSBhbiBleHBlcnQgU0VPIG1ldGFkYXRhIHNwZWNpYWxpc3QuIEdlbmVyYXRlIFNFTyBtZXRhZGF0YSBmb3IgYSBibG9nIHBvc3QgZm9yIGh1bWFuIHJldmlldy5cblxuRlVMTCBCTE9HIENPTlRFWFQ6XG4ke2J1aWxkRnVsbElucHV0Q29udGV4dChpbnB1dCl9XG5cblJFU0VBUkNIIFNVTU1BUlk6XG4tICR7a2V5RmluZGluZ3NTdW1tYXJ5fVxuXG5PVVRMSU5FIFNUUlVDVFVSRTpcbiR7b3V0bGluZS5zZWN0aW9ucy5tYXAoKHMpPT5gLSAke3MuaGVhZGluZ30gKCR7cy5rZXlfcG9pbnRzPy5sZW5ndGggfHwgMH0ga2V5IHBvaW50cylgKS5qb2luKCdcXG4nKX1cblxuU0VPIFFBIFJFVklFVzpcbi0gT3ZlcmFsbCBTY29yZTogJHtzZW9RYS5vdmVyYWxsX3Njb3JlfVxuLSBTZWFyY2ggSW50ZW50IEFsaWdubWVudDogJHtzZW9RYS5zZWFyY2hfaW50ZW50X2FsaWdubWVudC5zY29yZX1cbi0gUHJpbWFyeSBLZXl3b3JkIFVzYWdlOiAke3Nlb1FhLnByaW1hcnlfa2V5d29yZF91c2FnZS5zY29yZX1cbi0gSGVhZGluZyBTdHJ1Y3R1cmU6ICR7c2VvUWEuaGVhZGluZ19zdHJ1Y3R1cmVfcmV2aWV3LnNjb3JlfVxuLSBDbGllbnQgR29hbCBBbGlnbm1lbnQ6ICR7c2VvUWEuY2xpZW50X2dvYWxfYWxpZ25tZW50LnNjb3JlfVxuXG5FRElURUQgQkxPRyBNQVJLRE9XTjpcbiR7ZWRpdGVkRHJhZnR9XG5cbkNPTlRFTlQgU1RBVFM6XG4tIFdvcmQgQ291bnQ6ICR7d29yZENvdW50fVxuLSBIZWFkaW5nczogJHtoZWFkaW5ncy5sZW5ndGh9XG4tIEhhcyBDVEE6ICR7aW5wdXQuY3RhX25vdGVzID8gJ1llcycgOiAnTm8nfVxuLSBIYXMgSW50ZXJuYWwgTGlua3M6ICR7aW5wdXQuaW50ZXJuYWxfbGlua19ub3RlcyA/ICdZZXMnIDogJ05vJ31cblxuR2VuZXJhdGUgbWV0YWRhdGEgdGhhdDpcbjEuIEFjY3VyYXRlbHkgcmVwcmVzZW50cyB0aGUgYmxvZyBjb250ZW50IChkbyBub3QgaW52ZW50IGNsYWltcylcbjIuIEluY2x1ZGVzIHRoZSBwcmltYXJ5IGtleXdvcmQgbmF0dXJhbGx5IGluIHRpdGxlIGFuZCBkZXNjcmlwdGlvblxuMy4gSXMgU0VPLW9wdGltaXplZCBmb3Igc2VhcmNoIGVuZ2luZXNcbjQuIElzIGNvbXBlbGxpbmcgZm9yIGh1bWFuIHJlYWRlcnMgYW5kIENUUlxuNS4gRm9sbG93cyBiZXN0IHByYWN0aWNlcyAodGl0bGUgbWF4IDcwIGNoYXJzLCBkZXNjcmlwdGlvbiBtYXggMTYwIGNoYXJzKVxuNi4gSW5jbHVkZXMgcmV2aWV3IG5vdGVzIGZvciB0aGUgaHVtYW4gZWRpdG9yXG5cblJldHVybiB2YWxpZCBKU09OIG9ubHkgdXNpbmcgZXhhY3RseSB0aGVzZSB0b3AtbGV2ZWwga2V5czpcbm1ldGFfdGl0bGUsIG1ldGFfZGVzY3JpcHRpb24sIHNsdWcsIHNvY2lhbF9wcmV2aWV3LCBzY2hlbWFfbWFya3VwLCBwcmltYXJ5X2tleXdvcmRfdXNlZCwgc2Vjb25kYXJ5X2tleXdvcmRzX3JlZmxlY3RlZCwgY2xpZW50X2dvYWxfcmVmbGVjdGVkLCBodW1hbl9yZXZpZXdfcmVxdWlyZWQsIHJldmlld19yZWFkeSwgbWV0YV9ub3RlcywgbmVlZHNfcmV2aWV3LlxuXG5EbyBub3QgdXNlIG9sZCBrZXlzOlxuc2VvX3RpdGxlLCBzdWdnZXN0ZWRfc2x1Zywgc2Vjb25kYXJ5X2tleXdvcmRzX3VzZWQsIGh1bWFuX3Jldmlld19ub3RlcywgZXhjZXJwdCwgb2dfdGl0bGUsIG9nX2Rlc2NyaXB0aW9uLCBjYW5vbmljYWxfdXJsX3N1Z2dlc3Rpb24sIHNjaGVtYV90eXBlX3N1Z2dlc3Rpb24uXG5cblJldHVybiBhIEpTT04gb2JqZWN0IHdpdGggdGhpcyBleGFjdCBzY2hlbWE6XG57XG4gIFwibWV0YV90aXRsZVwiOiBcIlNFTy1vcHRpbWl6ZWQgdGl0bGUgKG1heCA3MCBjaGFycywgaW5jbHVkZSBwcmltYXJ5IGtleXdvcmQpXCIsXG4gIFwibWV0YV9kZXNjcmlwdGlvblwiOiBcIkNvbXBlbGxpbmcgZGVzY3JpcHRpb24gKG1heCAxNjAgY2hhcnMsIGluY2x1ZGUgcHJpbWFyeSBrZXl3b3JkKVwiLFxuICBcInNsdWdcIjogXCJ1cmwtc2x1Zy1mb3JtYXRcIixcbiAgXCJzb2NpYWxfcHJldmlld1wiOiB7XG4gICAgXCJ0aXRsZVwiOiBcIlNvY2lhbCBtZWRpYSBwcmV2aWV3IHRpdGxlXCIsXG4gICAgXCJkZXNjcmlwdGlvblwiOiBcIlNvY2lhbCBtZWRpYSBwcmV2aWV3IGRlc2NyaXB0aW9uXCJcbiAgfSxcbiAgXCJzY2hlbWFfbWFya3VwXCI6IHtcbiAgICBcIkB0eXBlXCI6IFwiQmxvZ1Bvc3RpbmdcIixcbiAgICBcImhlYWRsaW5lXCI6IFwiQXJ0aWNsZSBoZWFkbGluZVwiLFxuICAgIFwiZGVzY3JpcHRpb25cIjogXCJBcnRpY2xlIGRlc2NyaXB0aW9uXCJcbiAgfSxcbiAgXCJwcmltYXJ5X2tleXdvcmRfdXNlZFwiOiB0cnVlLFxuICBcInNlY29uZGFyeV9rZXl3b3Jkc19yZWZsZWN0ZWRcIjogW1wia2V5d29yZDFcIiwgXCJrZXl3b3JkMlwiXSxcbiAgXCJjbGllbnRfZ29hbF9yZWZsZWN0ZWRcIjogdHJ1ZSxcbiAgXCJodW1hbl9yZXZpZXdfcmVxdWlyZWRcIjogdHJ1ZSxcbiAgXCJyZXZpZXdfcmVhZHlcIjogdHJ1ZSxcbiAgXCJtZXRhX25vdGVzXCI6IFtcIm5vdGUxXCIsIFwibm90ZTJcIl0sXG4gIFwibmVlZHNfcmV2aWV3XCI6IGZhbHNlXG59YDtcbn1cbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL21ldGEtc3RlcC8vcnVuTWV0YVN0ZXBcIiwgcnVuTWV0YVN0ZXApO1xuIiwgImltcG9ydCB7IHJlZ2lzdGVyU3RlcEZ1bmN0aW9uIH0gZnJvbSBcIndvcmtmbG93L2ludGVybmFsL3ByaXZhdGVcIjtcbmltcG9ydCAnc2VydmVyLW9ubHknO1xuaW1wb3J0IHsgZ2VuZXJhdGVUZXh0IH0gZnJvbSAnYWknO1xuaW1wb3J0IHsgb3BlbmFpIH0gZnJvbSAnQGFpLXNkay9vcGVuYWknO1xuaW1wb3J0IHsgdXBkYXRlUnVuU3RhdHVzIH0gZnJvbSAnLi4vLi4vc3RvcmFnZS9ydW5zJztcbmltcG9ydCB7IGdldEFnZW50Q29uZmlnIH0gZnJvbSAnLi4vLi4vc3RvcmFnZS9hZ2VudC1jb25maWdzJztcbmltcG9ydCB7IGJ1aWxkRnVsbElucHV0Q29udGV4dCwgZXh0cmFjdEpzb25PYmplY3QgfSBmcm9tICcuL2NvbnRleHQtYnVpbGRlcic7XG4vKipfX2ludGVybmFsX3dvcmtmbG93c3tcInN0ZXBzXCI6e1wibGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9vdXRsaW5lLXN0ZXAudHNcIjp7XCJydW5PdXRsaW5lU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL291dGxpbmUtc3RlcC8vcnVuT3V0bGluZVN0ZXBcIn19fX0qLztcbi8qKlxuICogT3V0bGluZSBTdGVwIC0gUGhhc2UgMkMtQlxuICogUnVucyBpbnNpZGUgYSBkdXJhYmxlIHN0ZXAgZnVuY3Rpb24gKGhhcyBOb2RlLmpzIGFjY2VzcylcbiAqIENhbGxzIEFJIG1vZGVsIHRvIGdlbmVyYXRlIGNvbnRlbnQgb3V0bGluZSB3aXRoIHN0cnVjdHVyZVxuICogVXNlcyByZXNlYXJjaCBkYXRhIGlmIGF2YWlsYWJsZSB0byBpbmZvcm0gb3V0bGluZVxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5PdXRsaW5lU3RlcChydW5JZCwgaW5wdXQsIHJlc2VhcmNoRGF0YSkge1xuICAgIGNvbnNvbGUubG9nKGBbdjBdIE91dGxpbmUgc3RlcDogQ3JlYXRpbmcgb3V0bGluZSBmb3IgcnVuICR7cnVuSWR9YCk7XG4gICAgLy8gQ3JlYXRlIGNvbnRleHQgZnJvbSBhdmFpbGFibGUgZGF0YSAobmVlZGVkIGZvciBmYWxsYmFjayBpbiBjYXRjaCBibG9jaylcbiAgICBjb25zdCB0b3BpYyA9IGlucHV0LmJsb2dfdG9waWMgfHwgaW5wdXQudG9waWMgfHwgJ1lvdXIgVG9waWMnO1xuICAgIGNvbnN0IHByaW1hcnlLZXl3b3JkID0gaW5wdXQucHJpbWFyeV9rZXl3b3JkIHx8ICdwcmltYXJ5IGtleXdvcmQnO1xuICAgIGNvbnN0IHNlY29uZGFyeUtleXdvcmRzID0gKGlucHV0LnNlY29uZGFyeV9rZXl3b3JkcyB8fCBpbnB1dC5rZXl3b3JkcyB8fCBbXSkuam9pbignLCAnKSB8fCAnc2Vjb25kYXJ5IGtleXdvcmRzJztcbiAgICBjb25zdCBidXNpbmVzc05hbWUgPSBpbnB1dC5idXNpbmVzc19uYW1lIHx8ICdZb3VyIEJ1c2luZXNzJztcbiAgICBjb25zdCBhdWRpZW5jZU5vdGVzID0gaW5wdXQuYXVkaWVuY2Vfbm90ZXMgfHwgJ1RhcmdldCBhdWRpZW5jZSBub3Qgc3BlY2lmaWVkJztcbiAgICBjb25zdCBicmFuZFZvaWNlID0gaW5wdXQuYnJhbmRfdm9pY2Vfbm90ZXMgfHwgJ1Byb2Zlc3Npb25hbCBhbmQgY2xlYXInO1xuICAgIGNvbnN0IGN0YU5vdGVzID0gaW5wdXQuY3RhX25vdGVzIHx8ICdFbmNvdXJhZ2UgZW5nYWdlbWVudCc7XG4gICAgY29uc3QgYWRkaXRpb25hbE5vdGVzID0gaW5wdXQuYWRkaXRpb25hbF9vcmRlcl9ub3RlcyB8fCAnTm8gYWRkaXRpb25hbCBub3Rlcyc7XG4gICAgY29uc3QgdGFyZ2V0V29yZENvdW50ID0gaW5wdXQudGFyZ2V0X3dvcmRfY291bnQgfHwgMTUwMDtcbiAgICB0cnkge1xuICAgICAgICAvLyBMb2FkIGFnZW50IGNvbmZpZyBmcm9tIGRhdGFiYXNlXG4gICAgICAgIGNvbnN0IGFnZW50Q29uZmlnID0gYXdhaXQgZ2V0QWdlbnRDb25maWcoJ291dGxpbmUnKTtcbiAgICAgICAgaWYgKCFhZ2VudENvbmZpZykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBY3RpdmUgYWdlbnQgY29uZmlnIG5vdCBmb3VuZCBmb3IgYWdlbnRfa2V5OiBvdXRsaW5lJyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gU0VPIEJsb2cgQWdlbnQgQ29uZmlnIExvYWRlZDogb3V0bGluZSB2JHthZ2VudENvbmZpZy52ZXJzaW9ufWApO1xuICAgICAgICAvLyBCdWlsZCBzeXN0ZW0gcHJvbXB0IGZyb20gZGF0YWJhc2UgY29uZmlnXG4gICAgICAgIGNvbnN0IHN5c3RlbVByb21wdCA9IFtcbiAgICAgICAgICAgIGFnZW50Q29uZmlnLnN5c3RlbV9wcm9tcHQsXG4gICAgICAgICAgICBhZ2VudENvbmZpZy5za2lsbF9tYXJrZG93blxuICAgICAgICBdLmZpbHRlcihCb29sZWFuKS5qb2luKCdcXG5cXG4nKTtcbiAgICAgICAgLy8gSW5jbHVkZSByZXNlYXJjaCBpbnNpZ2h0cyBpZiBhdmFpbGFibGVcbiAgICAgICAgbGV0IHJlc2VhcmNoQ29udGV4dCA9ICcnO1xuICAgICAgICBpZiAocmVzZWFyY2hEYXRhKSB7XG4gICAgICAgICAgICByZXNlYXJjaENvbnRleHQgPSBgXG5cblJlc2VhcmNoIEluc2lnaHRzIGZyb20gUmVzZWFyY2ggQWdlbnQ6XG4tIFNlYXJjaCBJbnRlbnQ6ICR7cmVzZWFyY2hEYXRhLnNlYXJjaF9pbnRlbnQgfHwgJ04vQSd9XG4tIENvbnRlbnQgQW5nbGU6ICR7cmVzZWFyY2hEYXRhLmNvbnRlbnRfYW5nbGUgfHwgJ04vQSd9XG4tIFRhcmdldCBBdWRpZW5jZTogJHtyZXNlYXJjaERhdGEudGFyZ2V0X2F1ZGllbmNlX3N1bW1hcnkgfHwgJ04vQSd9XG4tIFJlY29tbWVuZGVkIFNlY3Rpb25zOiAke3Jlc2VhcmNoRGF0YS5yZWNvbW1lbmRlZF9zZWN0aW9ucz8uam9pbignLCAnKSB8fCAnTi9BJ31cbi0gUXVlc3Rpb25zIHRvIEFuc3dlcjogJHtyZXNlYXJjaERhdGEucXVlc3Rpb25zX3RvX2Fuc3dlcj8uam9pbignLCAnKSB8fCAnTi9BJ31gO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHVzZXJNZXNzYWdlID0gYENyZWF0ZSB0aGUgT3V0bGluZSBBZ2VudCBKU09OIHVzaW5nIHRoZSBzdXBwbGllZCBSZXNlYXJjaCBBZ2VudCBvdXRwdXQgYW5kIGZ1bGwgQmxvZyBDb250ZXh0IEJyaWVmLlxuXG4ke2J1aWxkRnVsbElucHV0Q29udGV4dChpbnB1dCl9JHtyZXNlYXJjaENvbnRleHR9XG5cblJldHVybiB2YWxpZCBKU09OIG9ubHkgdXNpbmcgdGhlIHNjaGVtYSBmcm9tIHlvdXIgc3lzdGVtIGluc3RydWN0aW9ucy4gUHJlc2VydmUgbXVzdF9pbmNsdWRlIGFuZCBtdXN0X2F2b2lkIHJlc3RyaWN0aW9ucywgYW5kIGluY2x1ZGUgY2xpZW50X2dvYWxfbm90ZXMgZm9yIGVhY2ggc2VjdGlvbi5gO1xuICAgICAgICAvLyBHZXQgbW9kZWwgbmFtZTogdXNlIERCIGNvbmZpZyBpZiBhdmFpbGFibGUsIG90aGVyd2lzZSBmYWxsIGJhY2sgdG8gZW52IHZhciBvciBkZWZhdWx0XG4gICAgICAgIGNvbnN0IG1vZGVsTmFtZSA9IGFnZW50Q29uZmlnLm1vZGVsIHx8IHByb2Nlc3MuZW52Lk9VVExJTkVfQUdFTlRfTU9ERUwgfHwgcHJvY2Vzcy5lbnYuUkVTRUFSQ0hfQUdFTlRfTU9ERUwgfHwgJ2dwdC01LjQtbWluaSc7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIE91dGxpbmUgc3RlcDogVXNpbmcgbW9kZWw6ICR7bW9kZWxOYW1lfWApO1xuICAgICAgICAvLyBVc2UgZGlyZWN0IE9wZW5BSSBwcm92aWRlclxuICAgICAgICBjb25zdCBtb2RlbCA9IG9wZW5haShtb2RlbE5hbWUpO1xuICAgICAgICAvLyBDYWxsIEFJIG1vZGVsXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZ2VuZXJhdGVUZXh0KHtcbiAgICAgICAgICAgIG1vZGVsLFxuICAgICAgICAgICAgc3lzdGVtOiBzeXN0ZW1Qcm9tcHQsXG4gICAgICAgICAgICBwcm9tcHQ6IHVzZXJNZXNzYWdlLFxuICAgICAgICAgICAgdGVtcGVyYXR1cmU6IDAuN1xuICAgICAgICB9KTtcbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gT3V0bGluZSBzdGVwOiBSYXcgcmVzcG9uc2UgbGVuZ3RoOiAke3Jlc3BvbnNlLnRleHQubGVuZ3RofWApO1xuICAgICAgICAvLyBQYXJzZSB0aGUgSlNPTiByZXNwb25zZVxuICAgICAgICBjb25zdCBvdXRsaW5lRGF0YSA9IEpTT04ucGFyc2UoZXh0cmFjdEpzb25PYmplY3QocmVzcG9uc2UudGV4dCkpO1xuICAgICAgICAvLyBWYWxpZGF0ZSByZXF1aXJlZCBmaWVsZHMgYW5kIGFkZCBkZWZhdWx0c1xuICAgICAgICBvdXRsaW5lRGF0YS50aW1lc3RhbXAgPSBvdXRsaW5lRGF0YS50aW1lc3RhbXAgfHwgbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgICAgICBvdXRsaW5lRGF0YS50YXJnZXRfd29yZF9jb3VudCA9IG91dGxpbmVEYXRhLnRhcmdldF93b3JkX2NvdW50IHx8IHRhcmdldFdvcmRDb3VudDtcbiAgICAgICAgLy8gRW5zdXJlIHNlY3Rpb25zIGFycmF5IGV4aXN0c1xuICAgICAgICBpZiAoIW91dGxpbmVEYXRhLnNlY3Rpb25zIHx8ICFBcnJheS5pc0FycmF5KG91dGxpbmVEYXRhLnNlY3Rpb25zKSkge1xuICAgICAgICAgICAgb3V0bGluZURhdGEuc2VjdGlvbnMgPSBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBoZWFkaW5nOiAnSW50cm9kdWN0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgcHVycG9zZTogJ0ludHJvZHVjZSB0b3BpYyBhbmQgc2V0IGNvbnRleHQnLFxuICAgICAgICAgICAgICAgICAgICBlc3RpbWF0ZWRfd29yZHM6IDE1MCxcbiAgICAgICAgICAgICAgICAgICAga2V5X3BvaW50czogW1xuICAgICAgICAgICAgICAgICAgICAgICAgJ1RvcGljIG92ZXJ2aWV3JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdXaHkgdGhpcyBtYXR0ZXJzJ1xuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBzZW9fbm90ZXM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICdJbmNsdWRlIHByaW1hcnkga2V5d29yZCBuYXR1cmFsbHknXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIGNsaWVudF9nb2FsX25vdGVzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAnQ29ubmVjdCB0aGUgdG9waWMgdG8gdGhlIHN1cHBsaWVkIGNsaWVudCBnb2FsIHdoZXJlIHJlbGV2YW50J1xuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGhlYWRpbmc6ICdNYWluIENvbnRlbnQnLFxuICAgICAgICAgICAgICAgICAgICBwdXJwb3NlOiAnRGV0YWlsZWQgZXhwbG9yYXRpb24gb2YgdG9waWMnLFxuICAgICAgICAgICAgICAgICAgICBlc3RpbWF0ZWRfd29yZHM6IDEwMDAsXG4gICAgICAgICAgICAgICAgICAgIGtleV9wb2ludHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICdLZXkgaW5zaWdodCAxJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdLZXkgaW5zaWdodCAyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdLZXkgaW5zaWdodCAzJ1xuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBzZW9fbm90ZXM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICdVc2Ugc2Vjb25kYXJ5IGtleXdvcmRzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdBbnN3ZXIgdXNlciBpbnRlbnQgcXVlc3Rpb25zJ1xuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBjbGllbnRfZ29hbF9ub3RlczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgJ1VzZSBzdXBwbGllZCBidXNpbmVzcyBnb2FsIGFuZCBzZXJ2aWNlcyB3aXRob3V0IGludmVudGluZyBjbGFpbXMnXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGluZzogJ0NvbmNsdXNpb24nLFxuICAgICAgICAgICAgICAgICAgICBwdXJwb3NlOiAnU3VtbWFyaXplIGFuZCBjYWxsIHRvIGFjdGlvbicsXG4gICAgICAgICAgICAgICAgICAgIGVzdGltYXRlZF93b3JkczogMTUwLFxuICAgICAgICAgICAgICAgICAgICBrZXlfcG9pbnRzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAnU3VtbWFyeSBvZiBrZXkgcG9pbnRzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdDYWxsIHRvIGFjdGlvbidcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgc2VvX25vdGVzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAnUmVpbmZvcmNlIHByaW1hcnkga2V5d29yZCdcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgY2xpZW50X2dvYWxfbm90ZXM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICdDbG9zZSB3aXRoIHRoZSBzdXBwbGllZCBDVEEgZGlyZWN0aW9uJ1xuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXTtcbiAgICAgICAgfVxuICAgICAgICBvdXRsaW5lRGF0YS5zZWN0aW9ucyA9IG91dGxpbmVEYXRhLnNlY3Rpb25zLm1hcCgoc2VjdGlvbik9Pih7XG4gICAgICAgICAgICAgICAgLi4uc2VjdGlvbixcbiAgICAgICAgICAgICAgICBrZXlfcG9pbnRzOiBBcnJheS5pc0FycmF5KHNlY3Rpb24ua2V5X3BvaW50cykgPyBzZWN0aW9uLmtleV9wb2ludHMgOiBbXSxcbiAgICAgICAgICAgICAgICBzZW9fbm90ZXM6IEFycmF5LmlzQXJyYXkoc2VjdGlvbi5zZW9fbm90ZXMpID8gc2VjdGlvbi5zZW9fbm90ZXMgOiBbXSxcbiAgICAgICAgICAgICAgICBjbGllbnRfZ29hbF9ub3RlczogQXJyYXkuaXNBcnJheShzZWN0aW9uLmNsaWVudF9nb2FsX25vdGVzKSA/IHNlY3Rpb24uY2xpZW50X2dvYWxfbm90ZXMgOiBbXSxcbiAgICAgICAgICAgICAgICBlc3RpbWF0ZWRfd29yZHM6IHR5cGVvZiBzZWN0aW9uLmVzdGltYXRlZF93b3JkcyA9PT0gJ251bWJlcicgPyBzZWN0aW9uLmVzdGltYXRlZF93b3JkcyA6IDBcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgb3V0bGluZURhdGEubmVlZHNfcmV2aWV3ID0gQm9vbGVhbihvdXRsaW5lRGF0YS5uZWVkc19yZXZpZXcpO1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBPdXRsaW5lIHN0ZXA6IEdlbmVyYXRlZCBvdXRsaW5lIHdpdGggJHtvdXRsaW5lRGF0YS5zZWN0aW9ucy5sZW5ndGh9IHNlY3Rpb25zYCk7XG4gICAgICAgIC8vIFBlcnNpc3Qgb3V0bGluZV9qc29uIHRvIGRhdGFiYXNlXG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIE91dGxpbmUgc3RlcDogUGVyc2lzdGluZyBvdXRsaW5lX2pzb24gZm9yIHJ1biAke3J1bklkfWApO1xuICAgICAgICBhd2FpdCB1cGRhdGVSdW5TdGF0dXMocnVuSWQsICdvdXRsaW5pbmcnLCBvdXRsaW5lRGF0YSk7XG4gICAgICAgIHJldHVybiBvdXRsaW5lRGF0YTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKGBbdjBdIE91dGxpbmUgc3RlcCBlcnJvcjpgLCBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcikpO1xuICAgICAgICAvLyBSZXR1cm4gZmFsbGJhY2sgb3V0bGluZSBpZiBwYXJzaW5nIG9yIEFJIGNhbGwgZmFpbHNcbiAgICAgICAgY29uc3QgZmFsbGJhY2tPdXRsaW5lID0ge1xuICAgICAgICAgICAgdGl0bGU6IGAke3RvcGljfSAtIENvbXByZWhlbnNpdmUgR3VpZGUgfCAke2J1c2luZXNzTmFtZX1gLFxuICAgICAgICAgICAgbWV0YV9hbmdsZTogYEV2ZXJ5dGhpbmcgeW91IG5lZWQgdG8ga25vdyBhYm91dCAke3RvcGljfSBmb3IgJHtidXNpbmVzc05hbWV9YCxcbiAgICAgICAgICAgIHRhcmdldF93b3JkX2NvdW50OiB0YXJnZXRXb3JkQ291bnQsXG4gICAgICAgICAgICBzZWN0aW9uczogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGluZzogJ0ludHJvZHVjdGlvbjogVW5kZXJzdGFuZGluZyB0aGUgQmFzaWNzJyxcbiAgICAgICAgICAgICAgICAgICAgcHVycG9zZTogJ1NldCBjb250ZXh0IGFuZCBpbnRyb2R1Y2UgdGhlIHRvcGljJyxcbiAgICAgICAgICAgICAgICAgICAgZXN0aW1hdGVkX3dvcmRzOiAyMDAsXG4gICAgICAgICAgICAgICAgICAgIGtleV9wb2ludHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIGBPdmVydmlldyBvZiAke3RvcGljfWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAnV2h5IHRoaXMgdG9waWMgbWF0dGVycyB0byB5b3VyIGF1ZGllbmNlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdXaGF0IHlvdSB3aWxsIGxlYXJuJ1xuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBzZW9fbm90ZXM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICdJbmNsdWRlIHByaW1hcnkga2V5d29yZCBpbiBmaXJzdCBwYXJhZ3JhcGgnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ1VzZSBlbmdhZ2luZyBob29rJ1xuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBjbGllbnRfZ29hbF9ub3RlczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgJ0ludHJvZHVjZSB3aHkgdGhpcyB0b3BpYyBtYXR0ZXJzIGZvciB0aGUgc3VwcGxpZWQgYXVkaWVuY2UgYW5kIGJ1c2luZXNzIGdvYWwnXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGluZzogJ0tleSBDb25jZXB0cyBhbmQgQmVuZWZpdHMnLFxuICAgICAgICAgICAgICAgICAgICBwdXJwb3NlOiAnRXhwbG9yZSBjb3JlIGNvbmNlcHRzIGFuZCBhZHZhbnRhZ2VzJyxcbiAgICAgICAgICAgICAgICAgICAgZXN0aW1hdGVkX3dvcmRzOiA0MDAsXG4gICAgICAgICAgICAgICAgICAgIGtleV9wb2ludHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICdDb3JlIGNvbmNlcHQgMScsXG4gICAgICAgICAgICAgICAgICAgICAgICAnQ29yZSBjb25jZXB0IDInLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0hvdyBidXNpbmVzc2VzIGJlbmVmaXQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ1JlYWwtd29ybGQgYXBwbGljYXRpb25zJ1xuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBzZW9fbm90ZXM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICdVc2Ugc2Vjb25kYXJ5IGtleXdvcmRzIG5hdHVyYWxseScsXG4gICAgICAgICAgICAgICAgICAgICAgICAnQW5zd2VyIGNvbW1vbiBxdWVzdGlvbnMnXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIGNsaWVudF9nb2FsX25vdGVzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAnVGllIGJlbmVmaXRzIGJhY2sgdG8gdGhlIHN1cHBsaWVkIHNlcnZpY2Ugb3IgQ1RBIG9ubHkgd2hlbiBzdXBwb3J0ZWQnXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGluZzogJ0Jlc3QgUHJhY3RpY2VzIGFuZCBJbXBsZW1lbnRhdGlvbicsXG4gICAgICAgICAgICAgICAgICAgIHB1cnBvc2U6ICdQcm92aWRlIGFjdGlvbmFibGUgZ3VpZGFuY2UnLFxuICAgICAgICAgICAgICAgICAgICBlc3RpbWF0ZWRfd29yZHM6IDUwMCxcbiAgICAgICAgICAgICAgICAgICAga2V5X3BvaW50czogW1xuICAgICAgICAgICAgICAgICAgICAgICAgJ1N0ZXAtYnktc3RlcCBpbXBsZW1lbnRhdGlvbicsXG4gICAgICAgICAgICAgICAgICAgICAgICAnQmVzdCBwcmFjdGljZXMgaW4gdGhlIGluZHVzdHJ5JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdDb21tb24gbWlzdGFrZXMgdG8gYXZvaWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ1Rvb2xzIGFuZCByZXNvdXJjZXMnXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIHNlb19ub3RlczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgJ1VzZSBsb25nLXRhaWwga2V5d29yZHMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0luY2x1ZGUgcHJhY3RpY2FsIGV4YW1wbGVzJ1xuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBjbGllbnRfZ29hbF9ub3RlczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgJ0tlZXAgcmVjb21tZW5kYXRpb25zIGdyb3VuZGVkIGluIHRoZSBzdXBwbGllZCBjb250ZXh0J1xuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGhlYWRpbmc6ICdDb25jbHVzaW9uIGFuZCBOZXh0IFN0ZXBzJyxcbiAgICAgICAgICAgICAgICAgICAgcHVycG9zZTogJ1N1bW1hcml6ZSBhbmQgZ3VpZGUgcmVhZGVyIGFjdGlvbicsXG4gICAgICAgICAgICAgICAgICAgIGVzdGltYXRlZF93b3JkczogMTUwLFxuICAgICAgICAgICAgICAgICAgICBrZXlfcG9pbnRzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAnS2V5IHRha2Vhd2F5cycsXG4gICAgICAgICAgICAgICAgICAgICAgICAnUmVjb21tZW5kZWQgbmV4dCBzdGVwcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAnQ2FsbCB0byBhY3Rpb24nXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIHNlb19ub3RlczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgJ1JlaW5mb3JjZSBwcmltYXJ5IGtleXdvcmQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0NyZWF0ZSB1cmdlbmN5IGZvciBDVEEnXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIGNsaWVudF9nb2FsX25vdGVzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAnVXNlIHRoZSBzdXBwbGllZCBDVEEgZGlyZWN0aW9uIHdpdGhvdXQgaW52ZW50aW5nIG9mZmVycydcbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBpbnRyb19ndWlkYW5jZTogYFN0YXJ0IHdpdGggYSBjb21wZWxsaW5nIGhvb2sgdGhhdCBhZGRyZXNzZXMgdGhlIHJlYWRlcidzIHBhaW4gcG9pbnQuIEludHJvZHVjZSAke3RvcGljfSBpbiB0aGUgY29udGV4dCBvZiAke2J1c2luZXNzTmFtZX0gYW5kIGV4cGxhaW4gd2h5IGl0IG1hdHRlcnMgdG8gdGhlIHRhcmdldCBhdWRpZW5jZS4gSW5jbHVkZSB0aGUgcHJpbWFyeSBrZXl3b3JkIFwiJHtwcmltYXJ5S2V5d29yZH1cIiBuYXR1cmFsbHkgaW4gdGhlIGZpcnN0IDEwMCB3b3Jkcy5gLFxuICAgICAgICAgICAgY29uY2x1c2lvbl9ndWlkYW5jZTogYFN1bW1hcml6ZSB0aGUgbWFpbiB0YWtlYXdheXMgZnJvbSBlYWNoIHNlY3Rpb24uIFJlaW5mb3JjZSBob3cgdW5kZXJzdGFuZGluZyAke3RvcGljfSBiZW5lZml0cyB0aGUgcmVhZGVyLiBJbmNsdWRlIGEgY2xlYXIsIGNvbXBlbGxpbmcgY2FsbC10by1hY3Rpb24gdGhhdCBndWlkZXMgdGhlIHJlYWRlciBvbiBuZXh0IHN0ZXBzLiBFbmQgd2l0aCB0aGUgcHJpbWFyeSBrZXl3b3JkIG5hdHVyYWxseSBpbmNvcnBvcmF0ZWQuYCxcbiAgICAgICAgICAgIGN0YV9ndWlkYW5jZTogYCR7Y3RhTm90ZXN9LiBFbnN1cmUgdGhlIENUQSBpcyBjbGVhciwgc3BlY2lmaWMsIGFuZCByZWxldmFudCB0byB0aGUgYXJ0aWNsZSBjb250ZW50LiBFeGFtcGxlczogXCJTY2hlZHVsZSBhIGNvbnN1bHRhdGlvbixcIiBcIkRvd25sb2FkIG91ciBndWlkZSxcIiBcIkdldCBzdGFydGVkIHRvZGF5LFwiIFwiSm9pbiBvdXIgY29tbXVuaXR5LlwiYCxcbiAgICAgICAgICAgIGludGVybmFsX2xpbmtfb3Bwb3J0dW5pdGllczogW1xuICAgICAgICAgICAgICAgICdMaW5rIHRvIHJlbGV2YW50IHNlcnZpY2UgcGFnZXMgb24gY29tcGFueSB3ZWJzaXRlJyxcbiAgICAgICAgICAgICAgICAnTGluayB0byByZWxhdGVkIGJsb2cgcG9zdHMgb24gc2ltaWxhciB0b3BpY3MnLFxuICAgICAgICAgICAgICAgICdMaW5rIHRvIGNhc2Ugc3R1ZGllcyBvciBzdWNjZXNzIHN0b3JpZXMnLFxuICAgICAgICAgICAgICAgICdMaW5rIHRvIHJlc291cmNlIHBhZ2VzIG9yIHRvb2xzJ1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIG5lZWRzX3JldmlldzogdHJ1ZSxcbiAgICAgICAgICAgIG5vdGVzX2Zvcl93cml0ZXI6IFtcbiAgICAgICAgICAgICAgICBgUmVtZW1iZXIgdG8gbWFpbnRhaW4gYSAke2JyYW5kVm9pY2V9IHRvbmUgdGhyb3VnaG91dGAsXG4gICAgICAgICAgICAgICAgYEFkZHJlc3MgdGhlIG5lZWRzIG9mOiAke2F1ZGllbmNlTm90ZXN9YCxcbiAgICAgICAgICAgICAgICBgRW5zdXJlIHRoZSBjb250ZW50IGlzIHdlbGwtcmVzZWFyY2hlZCBhbmQgaW5jbHVkZXMgc3BlY2lmaWMgZXhhbXBsZXNgLFxuICAgICAgICAgICAgICAgIGBVc2Ugc3ViaGVhZGluZ3MgdG8gaW1wcm92ZSByZWFkYWJpbGl0eSBhbmQgU0VPYCxcbiAgICAgICAgICAgICAgICBgSW5jbHVkZSByZWxldmFudCBkYXRhLCBzdGF0aXN0aWNzLCBvciByZXNlYXJjaCBmaW5kaW5ncyB3aGVyZSBhcHByb3ByaWF0ZWAsXG4gICAgICAgICAgICAgICAgYEVuZCB3aXRoIGEgc3Ryb25nIENUQSBhbGlnbmVkIHdpdGg6ICR7Y3RhTm90ZXN9YFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICAgIH07XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIE91dGxpbmUgc3RlcDogVXNpbmcgZmFsbGJhY2sgb3V0bGluZSBkdWUgdG8gZXJyb3JgKTtcbiAgICAgICAgcmV0dXJuIGZhbGxiYWNrT3V0bGluZTtcbiAgICB9XG59XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9vdXRsaW5lLXN0ZXAvL3J1bk91dGxpbmVTdGVwXCIsIHJ1bk91dGxpbmVTdGVwKTtcbiIsICJpbXBvcnQgeyByZWdpc3RlclN0ZXBGdW5jdGlvbiB9IGZyb20gXCJ3b3JrZmxvdy9pbnRlcm5hbC9wcml2YXRlXCI7XG5pbXBvcnQgJ3NlcnZlci1vbmx5JztcbmltcG9ydCB7IGdlbmVyYXRlVGV4dCB9IGZyb20gJ2FpJztcbmltcG9ydCB7IG9wZW5haSB9IGZyb20gJ0BhaS1zZGsvb3BlbmFpJztcbmltcG9ydCB7IHVwZGF0ZVJ1blN0YXR1cyB9IGZyb20gJy4uLy4uL3N0b3JhZ2UvcnVucyc7XG5pbXBvcnQgeyBnZXRBZ2VudENvbmZpZyB9IGZyb20gJy4uLy4uL3N0b3JhZ2UvYWdlbnQtY29uZmlncyc7XG5pbXBvcnQgeyBidWlsZEZ1bGxJbnB1dENvbnRleHQsIGV4dHJhY3RKc29uT2JqZWN0IH0gZnJvbSAnLi9jb250ZXh0LWJ1aWxkZXInO1xuLyoqX19pbnRlcm5hbF93b3JrZmxvd3N7XCJzdGVwc1wiOntcImxpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvcmVzZWFyY2gtc3RlcC50c1wiOntcInJ1blJlc2VhcmNoU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3Jlc2VhcmNoLXN0ZXAvL3J1blJlc2VhcmNoU3RlcFwifX19fSovO1xuLyoqXG4gKiBSZXNlYXJjaCBTdGVwIC0gUGhhc2UgMkMtQVxuICogUnVucyBpbnNpZGUgYSBkdXJhYmxlIHN0ZXAgZnVuY3Rpb24gKGhhcyBOb2RlLmpzIGFjY2VzcylcbiAqIENhbGxzIEFJIG1vZGVsIHRvIGdlbmVyYXRlIHJlc2VhcmNoIEpTT05cbiAqIE5vIGZpbGVzeXN0ZW0gaW1wb3J0cyAtIHNhZmUgZm9yIHdvcmtmbG93IGNvbnRleHRcbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gcnVuUmVzZWFyY2hTdGVwKHJ1bklkLCBpbnB1dCkge1xuICAgIGNvbnNvbGUubG9nKGBbdjBdIFJlc2VhcmNoIHN0ZXA6IEFuYWx5emluZyB0b3BpYyBmb3IgcnVuICR7cnVuSWR9YCk7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gTG9hZCBhZ2VudCBjb25maWcgZnJvbSBkYXRhYmFzZVxuICAgICAgICBjb25zdCBhZ2VudENvbmZpZyA9IGF3YWl0IGdldEFnZW50Q29uZmlnKCdyZXNlYXJjaCcpO1xuICAgICAgICBpZiAoIWFnZW50Q29uZmlnKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0FjdGl2ZSBhZ2VudCBjb25maWcgbm90IGZvdW5kIGZvciBhZ2VudF9rZXk6IHJlc2VhcmNoJyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gU0VPIEJsb2cgQWdlbnQgQ29uZmlnIExvYWRlZDogcmVzZWFyY2ggdiR7YWdlbnRDb25maWcudmVyc2lvbn1gKTtcbiAgICAgICAgLy8gQnVpbGQgc3lzdGVtIHByb21wdCBmcm9tIGRhdGFiYXNlIGNvbmZpZ1xuICAgICAgICBjb25zdCBzeXN0ZW1Qcm9tcHQgPSBbXG4gICAgICAgICAgICBhZ2VudENvbmZpZy5zeXN0ZW1fcHJvbXB0LFxuICAgICAgICAgICAgYWdlbnRDb25maWcuc2tpbGxfbWFya2Rvd25cbiAgICAgICAgXS5maWx0ZXIoQm9vbGVhbikuam9pbignXFxuXFxuJyk7XG4gICAgICAgIGNvbnN0IHVzZXJNZXNzYWdlID0gYENyZWF0ZSB0aGUgUmVzZWFyY2ggQWdlbnQgSlNPTiB1c2luZyBhbGwgc3VwcGxpZWQgY29udGV4dC5cblxuJHtidWlsZEZ1bGxJbnB1dENvbnRleHQoaW5wdXQpfVxuXG5SZXR1cm4gdmFsaWQgSlNPTiBvbmx5IHVzaW5nIHRoZSBzY2hlbWEgZnJvbSB5b3VyIHN5c3RlbSBpbnN0cnVjdGlvbnMuIERvIG5vdCB3cml0ZSB0aGUgYmxvZyBvciBvdXRsaW5lLiBQcmVzZXJ2ZSBtdXN0X2luY2x1ZGUgYW5kIG11c3RfYXZvaWQgZXhhY3RseSB3aGVyZSBwcm92aWRlZC5gO1xuICAgICAgICAvLyBHZXQgbW9kZWwgbmFtZTogdXNlIERCIGNvbmZpZyBpZiBhdmFpbGFibGUsIG90aGVyd2lzZSBmYWxsIGJhY2sgdG8gZW52IHZhciBvciBkZWZhdWx0XG4gICAgICAgIGNvbnN0IG1vZGVsTmFtZSA9IGFnZW50Q29uZmlnLm1vZGVsIHx8IHByb2Nlc3MuZW52LlJFU0VBUkNIX0FHRU5UX01PREVMIHx8ICdncHQtNS40LW1pbmknO1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBSZXNlYXJjaCBzdGVwOiBVc2luZyBtb2RlbDogJHttb2RlbE5hbWV9YCk7XG4gICAgICAgIC8vIFVzZSBkaXJlY3QgT3BlbkFJIHByb3ZpZGVyIHdpdGggT1BFTkFJX0FQSV9LRVlcbiAgICAgICAgY29uc3QgbW9kZWwgPSBvcGVuYWkobW9kZWxOYW1lKTtcbiAgICAgICAgLy8gQ2FsbCBBSSBtb2RlbFxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGdlbmVyYXRlVGV4dCh7XG4gICAgICAgICAgICBtb2RlbCxcbiAgICAgICAgICAgIHN5c3RlbTogc3lzdGVtUHJvbXB0LFxuICAgICAgICAgICAgcHJvbXB0OiB1c2VyTWVzc2FnZSxcbiAgICAgICAgICAgIHRlbXBlcmF0dXJlOiAwLjdcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFJlc2VhcmNoIHN0ZXA6IEFJIG1vZGVsIHJlc3BvbmRlZCwgcGFyc2luZyBKU09OYCk7XG4gICAgICAgIC8vIFBhcnNlIEpTT04gcmVzcG9uc2VcbiAgICAgICAgbGV0IHJlc2VhcmNoRGF0YTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFRyeSB0byBleHRyYWN0IEpTT04gZnJvbSByZXNwb25zZSAoaW4gY2FzZSBvZiBleHRyYSB0ZXh0KVxuICAgICAgICAgICAgcmVzZWFyY2hEYXRhID0gSlNPTi5wYXJzZShleHRyYWN0SnNvbk9iamVjdChyZXNwb25zZS50ZXh0KSk7XG4gICAgICAgICAgICAvLyBWYWxpZGF0ZSByZXF1aXJlZCBmaWVsZHMgYXQgcnVudGltZVxuICAgICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHJlc2VhcmNoRGF0YS5rZXlfZmluZGluZ3MpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZXNlYXJjaCBvdXRwdXQgbWlzc2luZyByZXF1aXJlZCBrZXlfZmluZGluZ3MgYXJyYXknKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChyZXNlYXJjaERhdGEua2V5X2ZpbmRpbmdzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignUmVzZWFyY2ggb3V0cHV0IGtleV9maW5kaW5ncyBhcnJheSBjYW5ub3QgYmUgZW1wdHknKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAocGFyc2VFcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2MF0gUmVzZWFyY2ggc3RlcDogRmFpbGVkIHRvIHBhcnNlIEFJIHJlc3BvbnNlOmAsIHJlc3BvbnNlLnRleHQuc3Vic3RyaW5nKDAsIDIwMCkpO1xuICAgICAgICAgICAgLy8gUmV0dXJuIGZhbGxiYWNrIGlmIHBhcnNpbmcgZmFpbHNcbiAgICAgICAgICAgIHJlc2VhcmNoRGF0YSA9IHtcbiAgICAgICAgICAgICAgICBzZWFyY2hfaW50ZW50OiAnaW5mb3JtYXRpb25hbCcsXG4gICAgICAgICAgICAgICAgdGFyZ2V0X2F1ZGllbmNlX3N1bW1hcnk6IGlucHV0LmF1ZGllbmNlX25vdGVzIHx8ICdUYXJnZXQgYXVkaWVuY2Ugbm90IHNwZWNpZmllZCcsXG4gICAgICAgICAgICAgICAga2V5d29yZF9tYXA6IHtcbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeV9rZXl3b3JkOiBpbnB1dC5wcmltYXJ5X2tleXdvcmQgfHwgJ3ByaW1hcnkga2V5d29yZCcsXG4gICAgICAgICAgICAgICAgICAgIHNlY29uZGFyeV9rZXl3b3JkczogaW5wdXQuc2Vjb25kYXJ5X2tleXdvcmRzIHx8IFtdLFxuICAgICAgICAgICAgICAgICAgICBsc2lfdGVybXM6IFtdXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjb250ZW50X2FuZ2xlOiBgRm9jdXMgb24gJHtpbnB1dC5ibG9nX3RvcGljIHx8ICd0b3BpYyd9YCxcbiAgICAgICAgICAgICAgICBrZXlfZmluZGluZ3M6IFtcbiAgICAgICAgICAgICAgICAgICAgYFRvcGljIGZvY3VzZXMgb24gJHtpbnB1dC5ibG9nX3RvcGljIHx8ICd0aGUgc3ViamVjdCBtYXR0ZXInfWAsXG4gICAgICAgICAgICAgICAgICAgIGBUYXJnZXQgYXVkaWVuY2U6ICR7aW5wdXQuYXVkaWVuY2Vfbm90ZXMgfHwgJ2dlbmVyYWwgYXVkaWVuY2UnfWAsXG4gICAgICAgICAgICAgICAgICAgIGBQcmltYXJ5IGtleXdvcmQ6ICR7aW5wdXQucHJpbWFyeV9rZXl3b3JkIHx8ICd0byBiZSBkZXRlcm1pbmVkJ31gXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBjb21wZXRpdG9yX2luc2lnaHRzOiBbXG4gICAgICAgICAgICAgICAgICAgICdDb21wZXRpdG9yIGNvbnRleHQgd2FzIG5vdCBhdmFpbGFibGUgaW4gcGFyc2VkIG1vZGVsIG91dHB1dCdcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlY29tbWVuZGVkX3NlY3Rpb25zOiBbXG4gICAgICAgICAgICAgICAgICAgICdJbnRyb2R1Y3Rpb24nLFxuICAgICAgICAgICAgICAgICAgICAnTWFpbiBDb250ZW50JyxcbiAgICAgICAgICAgICAgICAgICAgJ0NvbmNsdXNpb24nXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBxdWVzdGlvbnNfdG9fYW5zd2VyOiBbXG4gICAgICAgICAgICAgICAgICAgICdXaGF0IGlzIHRoZSBtYWluIHRvcGljPydcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIGNsaWVudF9nb2FsX2FsaWdubWVudDogaW5wdXQuYmxvZ19jb250ZXh0X2JyaWVmPy5idXNpbmVzc19nb2FsIHx8IGlucHV0LmJ1c2luZXNzX2dvYWwgfHwgJ0NsaWVudCBnb2FsIG5vdCBzcGVjaWZpZWQnLFxuICAgICAgICAgICAgICAgIG11c3RfaW5jbHVkZTogaW5wdXQuYmxvZ19jb250ZXh0X2JyaWVmPy5tdXN0X2luY2x1ZGUgfHwgaW5wdXQubXVzdF9pbmNsdWRlIHx8IFtdLFxuICAgICAgICAgICAgICAgIG11c3RfYXZvaWQ6IGlucHV0LmJsb2dfY29udGV4dF9icmllZj8ubXVzdF9hdm9pZCB8fCBpbnB1dC5tdXN0X2F2b2lkIHx8IFtdLFxuICAgICAgICAgICAgICAgIHJlc2VhcmNoX25vdGVzOiAnRmFsbGJhY2sgcmVzZWFyY2ggZHVlIHRvIHBhcnNpbmcgZXJyb3I7IGh1bWFuIHJldmlldyByZWNvbW1lbmRlZCcsXG4gICAgICAgICAgICAgICAgdGFyZ2V0X3dvcmRfY291bnQ6IGlucHV0LnRhcmdldF93b3JkX2NvdW50IHx8IDEwMDAsXG4gICAgICAgICAgICAgICAgd2ViX3NlYXJjaF91c2VkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBuZWVkc19yZXZpZXc6IHRydWUsXG4gICAgICAgICAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgLy8gUGVyc2lzdCByZXNlYXJjaF9qc29uIHRvIGRhdGFiYXNlXG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFJlc2VhcmNoIHN0ZXA6IFBlcnNpc3RpbmcgcmVzZWFyY2hfanNvbiBmb3IgcnVuICR7cnVuSWR9YCk7XG4gICAgICAgIGF3YWl0IHVwZGF0ZVJ1blN0YXR1cyhydW5JZCwgJ3Jlc2VhcmNoaW5nJywgcmVzZWFyY2hEYXRhKTtcbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gUmVzZWFyY2ggc3RlcDogQ29tcGxldGUgZm9yIHJ1biAke3J1bklkfWApO1xuICAgICAgICByZXR1cm4gcmVzZWFyY2hEYXRhO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2MF0gUmVzZWFyY2ggc3RlcCBlcnJvciBmb3IgcnVuICR7cnVuSWR9OmAsIGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKSk7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbn1cbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3Jlc2VhcmNoLXN0ZXAvL3J1blJlc2VhcmNoU3RlcFwiLCBydW5SZXNlYXJjaFN0ZXApO1xuIiwgImltcG9ydCB7IHJlZ2lzdGVyU3RlcEZ1bmN0aW9uIH0gZnJvbSBcIndvcmtmbG93L2ludGVybmFsL3ByaXZhdGVcIjtcbmltcG9ydCAnc2VydmVyLW9ubHknO1xuaW1wb3J0IHsgZ2VuZXJhdGVUZXh0IH0gZnJvbSAnYWknO1xuaW1wb3J0IHsgb3BlbmFpIH0gZnJvbSAnQGFpLXNkay9vcGVuYWknO1xuaW1wb3J0IHsgZ2V0QWdlbnRDb25maWcgfSBmcm9tICcuLi8uLi9zdG9yYWdlL2FnZW50LWNvbmZpZ3MnO1xuaW1wb3J0IHsgYnVpbGRGdWxsSW5wdXRDb250ZXh0IH0gZnJvbSAnLi9jb250ZXh0LWJ1aWxkZXInO1xuLyoqX19pbnRlcm5hbF93b3JrZmxvd3N7XCJzdGVwc1wiOntcImxpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvcmV2aXNpb24tc3RlcC50c1wiOntcInJ1blJldmlzaW9uU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3JldmlzaW9uLXN0ZXAvL3J1blJldmlzaW9uU3RlcFwifX19fSovO1xuLyoqXG4gKiBSZXZpc2lvbiBBZ2VudCBTdGVwXG4gKiBSZXZpc2VzIGFuIGV4aXN0aW5nIGRyYWZ0IGJhc2VkIG9uIHJldmlld2VyIGZlZWRiYWNrLlxuICogRG9lcyBOT1QgdXBkYXRlIHRoZSBkYXRhYmFzZSBvciBjYWxsIGNhbGxiYWNrcy5cbiAqIFJldHVybnMgcmV2aXNlZCBNYXJrZG93biBvbmx5LCBmb3IgdXNlIGJ5IHJldmlzaW9uLXdvcmtmbG93LnRzLlxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5SZXZpc2lvblN0ZXAoY3VycmVudERyYWZ0LCByZXZpZXdlckZlZWRiYWNrLCByZXZpc2lvbk1vZGUsIGlucHV0LCByZXNlYXJjaCwgb3V0bGluZSwgc2VvUWEsIG1ldGEpIHtcbiAgICBjb25zb2xlLmxvZyhgW3YwXSBSZXZpc2lvbiBzdGVwOiBTdGFydGluZyB3aXRoIG1vZGU6ICR7cmV2aXNpb25Nb2RlfWApO1xuICAgIHRyeSB7XG4gICAgICAgIC8vIExvYWQgYWdlbnQgY29uZmlnIGZyb20gZGF0YWJhc2VcbiAgICAgICAgY29uc3QgYWdlbnRDb25maWcgPSBhd2FpdCBnZXRBZ2VudENvbmZpZygncmV2aXNpb24nKTtcbiAgICAgICAgaWYgKCFhZ2VudENvbmZpZykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBY3RpdmUgYWdlbnQgY29uZmlnIG5vdCBmb3VuZCBmb3IgYWdlbnRfa2V5OiByZXZpc2lvbicpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFNFTyBCbG9nIEFnZW50IENvbmZpZyBMb2FkZWQ6IHJldmlzaW9uIHYke2FnZW50Q29uZmlnLnZlcnNpb259YCk7XG4gICAgICAgIC8vIEJ1aWxkIHN5c3RlbSBwcm9tcHQgZnJvbSBkYXRhYmFzZSBjb25maWdcbiAgICAgICAgY29uc3Qgc3lzdGVtUHJvbXB0ID0gW1xuICAgICAgICAgICAgYWdlbnRDb25maWcuc3lzdGVtX3Byb21wdCxcbiAgICAgICAgICAgIGFnZW50Q29uZmlnLnNraWxsX21hcmtkb3duXG4gICAgICAgIF0uZmlsdGVyKEJvb2xlYW4pLmpvaW4oJ1xcblxcbicpO1xuICAgICAgICAvLyBCdWlsZCByZXZpc2lvbiBpbnN0cnVjdGlvbiBiYXNlZCBvbiBtb2RlXG4gICAgICAgIGNvbnN0IHJldmlzaW9uSW5zdHJ1Y3Rpb24gPSByZXZpc2lvbk1vZGUgPT09ICdoZWF2eV9yZXZpc2lvbicgPyAnQXBwbHkgY29tcHJlaGVuc2l2ZSBjaGFuZ2VzLiBSZXN0cnVjdHVyZSBzZWN0aW9ucyBpZiBuZWVkZWQuIFJld3JpdGUgcGFyYWdyYXBocyBmb3IgY2xhcml0eSBhbmQgU0VPLiBCZSB0aG9yb3VnaC4nIDogJ0FwcGx5IGZvY3VzZWQgY2hhbmdlcy4gUG9saXNoIGV4aXN0aW5nIHN0cnVjdHVyZS4gUmVmaW5lIHdvcmRpbmcgYW5kIGNsYXJpdHkuIEtlZXAgc2VjdGlvbnMgaW50YWN0Lic7XG4gICAgICAgIC8vIEJ1aWxkIGNvbnRleHQgd2l0aCBmdWxsIEJsb2cgQ29udGV4dCBCcmllZiBpZiBpbnB1dCBpcyBhdmFpbGFibGVcbiAgICAgICAgbGV0IGNvbnRleHRCbG9jayA9ICcnO1xuICAgICAgICBpZiAoaW5wdXQpIHtcbiAgICAgICAgICAgIGNvbnRleHRCbG9jayA9IGBcXG5cXG4ke2J1aWxkRnVsbElucHV0Q29udGV4dChpbnB1dCl9YDtcbiAgICAgICAgfVxuICAgICAgICAvLyBBZGQgYWRkaXRpb25hbCBjb250ZXh0IGZyb20gb3RoZXIgYWdlbnRzIGlmIGF2YWlsYWJsZVxuICAgICAgICBsZXQgYWRkaXRpb25hbENvbnRleHQgPSBbXTtcbiAgICAgICAgaWYgKHJlc2VhcmNoKSB7XG4gICAgICAgICAgICBjb25zdCBmaW5kaW5ncyA9IHJlc2VhcmNoLmtleV9maW5kaW5ncyB8fCBbXTtcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGZpbmRpbmdzKSAmJiBmaW5kaW5ncy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgYWRkaXRpb25hbENvbnRleHQucHVzaChgXFxuXFxuUHJldmlvdXMgUmVzZWFyY2ggRmluZGluZ3M6XFxuJHtmaW5kaW5ncy5tYXAoKGYpPT5gLSAke3R5cGVvZiBmID09PSAnc3RyaW5nJyA/IGYgOiBKU09OLnN0cmluZ2lmeShmKX1gKS5qb2luKCdcXG4nKX1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAob3V0bGluZSkge1xuICAgICAgICAgICAgY29uc3Qgc2VjdGlvbnMgPSAob3V0bGluZS5zZWN0aW9ucyB8fCBbXSkubWFwKChzKT0+YCMjICR7dHlwZW9mIHMgPT09ICdzdHJpbmcnID8gcyA6IHMuaGVhZGluZyB8fCAnU2VjdGlvbid9YCk7XG4gICAgICAgICAgICBpZiAoc2VjdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGFkZGl0aW9uYWxDb250ZXh0LnB1c2goYFxcblxcbk9yaWdpbmFsIE91dGxpbmUgU3RydWN0dXJlOlxcbiR7c2VjdGlvbnMuam9pbignXFxuJyl9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNlb1FhKSB7XG4gICAgICAgICAgICBjb25zdCBzZW9RYU9iaiA9IHNlb1FhO1xuICAgICAgICAgICAgYWRkaXRpb25hbENvbnRleHQucHVzaChgXFxuXFxuU0VPIFFBIFJlc3VsdHM6XFxuT3ZlcmFsbCBTY29yZTogJHtzZW9RYU9iai5vdmVyYWxsX3Njb3JlIHx8ICdOL0EnfS8xMDBgKTtcbiAgICAgICAgICAgIGlmIChzZW9RYU9iai5wcmlvcml0eV9maXhlcyAmJiBBcnJheS5pc0FycmF5KHNlb1FhT2JqLnByaW9yaXR5X2ZpeGVzKSkge1xuICAgICAgICAgICAgICAgIGFkZGl0aW9uYWxDb250ZXh0LnB1c2goYFByaW9yaXR5IEZpeGVzOiAke3Nlb1FhT2JqLnByaW9yaXR5X2ZpeGVzLmpvaW4oJzsgJyl9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1ldGEpIHtcbiAgICAgICAgICAgIGNvbnN0IG1ldGFPYmogPSBtZXRhO1xuICAgICAgICAgICAgYWRkaXRpb25hbENvbnRleHQucHVzaChgXFxuXFxuTWV0YSBJbmZvcm1hdGlvbjpcXG5NZXRhIFRpdGxlOiAke21ldGFPYmoubWV0YV90aXRsZSB8fCAnTi9BJ31cXG5NZXRhIERlc2NyaXB0aW9uOiAke21ldGFPYmoubWV0YV9kZXNjcmlwdGlvbiB8fCAnTi9BJ31gKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBCdWlsZCB1c2VyIG1lc3NhZ2VcbiAgICAgICAgY29uc3QgdXNlck1lc3NhZ2UgPSBgUmV2aXNlIHRoZSBibG9nIGRyYWZ0IGJlbG93IHVzaW5nIHRoZSByZXZpZXdlciBmZWVkYmFjayBwcm92aWRlZC5cblxuUmV2aXNpb24gTW9kZTogJHtyZXZpc2lvbk1vZGV9XG4ke3JldmlzaW9uSW5zdHJ1Y3Rpb259XG5cblJldmlld2VyIEZlZWRiYWNrOlxuJHtyZXZpZXdlckZlZWRiYWNrfSR7Y29udGV4dEJsb2NrfSR7YWRkaXRpb25hbENvbnRleHQuam9pbignJyl9XG5cbkN1cnJlbnQgRHJhZnQgTWFya2Rvd246XG4ke2N1cnJlbnREcmFmdH1cblxuUmV0dXJuIHRoZSByZXZpc2VkIGJsb2cgaW4gTWFya2Rvd24gb25seS4gRG8gbm90IHJldHVybiBKU09OLiBEbyBub3QgaW5jbHVkZSBleHBsYW5hdGlvbnMsIHJldmlzaW9uIG5vdGVzLCBtYXJrZG93biBmZW5jZXMsIG9yIGNvbW1lbnRzIG91dHNpZGUgdGhlIGFydGljbGUuYDtcbiAgICAgICAgLy8gR2V0IG1vZGVsIG5hbWU6IHVzZSBEQiBjb25maWcgaWYgYXZhaWxhYmxlLCBvdGhlcndpc2UgZmFsbCBiYWNrIHRvIGVudiB2YXIgb3IgZGVmYXVsdFxuICAgICAgICBjb25zdCBtb2RlbE5hbWUgPSBhZ2VudENvbmZpZy5tb2RlbCB8fCBwcm9jZXNzLmVudi5SRVZJU0lPTl9BR0VOVF9NT0RFTCB8fCBwcm9jZXNzLmVudi5FRElUT1JfQUdFTlRfTU9ERUwgfHwgJ2dwdC01LjQtbWluaSc7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFJldmlzaW9uIHN0ZXA6IFVzaW5nIG1vZGVsOiAke21vZGVsTmFtZX1gKTtcbiAgICAgICAgLy8gQ2FsbCBBSSBtb2RlbCB2aWEgZGlyZWN0IE9wZW5BSSBwcm92aWRlclxuICAgICAgICBjb25zdCBtb2RlbCA9IG9wZW5haShtb2RlbE5hbWUpO1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGdlbmVyYXRlVGV4dCh7XG4gICAgICAgICAgICBtb2RlbCxcbiAgICAgICAgICAgIHN5c3RlbTogc3lzdGVtUHJvbXB0LFxuICAgICAgICAgICAgcHJvbXB0OiB1c2VyTWVzc2FnZSxcbiAgICAgICAgICAgIHRlbXBlcmF0dXJlOiAwLjcsXG4gICAgICAgICAgICBtYXhPdXRwdXRUb2tlbnM6IDgwMDBcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IHJldmlzZWRNYXJrZG93biA9IHJlc3BvbnNlLnRleHQudHJpbSgpO1xuICAgICAgICAvLyBWYWxpZGF0ZSBvdXRwdXRcbiAgICAgICAgaWYgKCFyZXZpc2VkTWFya2Rvd24gfHwgcmV2aXNlZE1hcmtkb3duLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZXZpc2lvbiBBZ2VudCByZXR1cm5lZCBlbXB0eSBvdXRwdXQnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocmV2aXNlZE1hcmtkb3duLnN0YXJ0c1dpdGgoJ3snKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZXZpc2lvbiBvdXRwdXQgaW52YWxpZDogZXhwZWN0ZWQgTWFya2Rvd24sIHJlY2VpdmVkIEpTT04tbGlrZSByZXNwb25zZScpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyZXZpc2VkTWFya2Rvd24ubGVuZ3RoIDwgTWF0aC5taW4oNTAwLCBNYXRoLmZsb29yKGN1cnJlbnREcmFmdC5sZW5ndGggKiAwLjQpKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZXZpc2lvbiBvdXRwdXQgdG9vIHNob3J0IGNvbXBhcmVkIHdpdGggb3JpZ2luYWwgZHJhZnQnKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByZXZpc2lvbk91dHB1dCA9IHtcbiAgICAgICAgICAgIHJldmlzZWRfbWFya2Rvd246IHJldmlzZWRNYXJrZG93bixcbiAgICAgICAgICAgIHJldmlzaW9uX21vZGU6IHJldmlzaW9uTW9kZSxcbiAgICAgICAgICAgIGZlZWRiYWNrX2FwcGxpZWQ6IHJldmlld2VyRmVlZGJhY2suc3Vic3RyaW5nKDAsIDIwMCksXG4gICAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgICAgICB9O1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBSZXZpc2lvbiBzdGVwOiBDb21wbGV0ZSAoJHtyZXZpc2VkTWFya2Rvd24ubGVuZ3RofSBjaGFycylgKTtcbiAgICAgICAgcmV0dXJuIHJldmlzaW9uT3V0cHV0O1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgY29uc29sZS5lcnJvcihgW3YwXSBSZXZpc2lvbiBzdGVwIGVycm9yOiAke2Vycm9yTWVzc2FnZX1gKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxufVxucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvcmV2aXNpb24tc3RlcC8vcnVuUmV2aXNpb25TdGVwXCIsIHJ1blJldmlzaW9uU3RlcCk7XG4iLCAiaW1wb3J0IHsgcmVnaXN0ZXJTdGVwRnVuY3Rpb24gfSBmcm9tIFwid29ya2Zsb3cvaW50ZXJuYWwvcHJpdmF0ZVwiO1xuaW1wb3J0ICdzZXJ2ZXItb25seSc7XG5pbXBvcnQgeyBnZW5lcmF0ZVRleHQgfSBmcm9tICdhaSc7XG5pbXBvcnQgeyBvcGVuYWkgfSBmcm9tICdAYWktc2RrL29wZW5haSc7XG5pbXBvcnQgeyB1cGRhdGVSdW5TdGF0dXMgfSBmcm9tICcuLi8uLi9zdG9yYWdlL3J1bnMnO1xuaW1wb3J0IHsgZ2V0QWdlbnRDb25maWcgfSBmcm9tICcuLi8uLi9zdG9yYWdlL2FnZW50LWNvbmZpZ3MnO1xuaW1wb3J0IHsgYnVpbGRGdWxsSW5wdXRDb250ZXh0LCBleHRyYWN0SnNvbk9iamVjdCB9IGZyb20gJy4vY29udGV4dC1idWlsZGVyJztcbi8qKl9faW50ZXJuYWxfd29ya2Zsb3dze1wic3RlcHNcIjp7XCJsaWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3Nlby1xYS1zdGVwLnRzXCI6e1wicnVuU2VvUWFTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvc2VvLXFhLXN0ZXAvL3J1blNlb1FhU3RlcFwifX19fSovO1xuY29uc3QgVkFMSURfUkVDT01NRU5ERURfQUNUSU9OUyA9IFtcbiAgICAnQXBwcm92ZSBmb3IgZWRpdG9yJyxcbiAgICAnUmV2aXNlIGJlZm9yZSBlZGl0b3InLFxuICAgICdOZWVkcyBodW1hbiByZXZpZXcnXG5dO1xuLyoqXG4gKiBTRU8gUUEgU3RlcCAtIFBoYXNlIDJDLURcbiAqIFJldmlld3MgZHJhZnQgbWFya2Rvd24gYWdhaW5zdCBTRU8gYW5kIGNsaWVudC1nb2FsIGNyaXRlcmlhLlxuICogUmV0dXJucyBzdHJ1Y3R1cmVkIGF1ZGl0IEpTT04uIERvZXMgbm90IHJld3JpdGUgdGhlIGRyYWZ0LlxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5TZW9RYVN0ZXAocnVuSWQsIGlucHV0LCByZXNlYXJjaERhdGEsIG91dGxpbmVEYXRhLCBkcmFmdE1hcmtkb3duKSB7XG4gICAgY29uc29sZS5sb2coYFt2MF0gU0VPIFFBIHN0ZXA6IEF1ZGl0aW5nIGRyYWZ0IGZvciBydW4gJHtydW5JZH1gKTtcbiAgICBpZiAoIWRyYWZ0TWFya2Rvd24pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdEcmFmdCBtYXJrZG93biBpcyByZXF1aXJlZCBmb3IgU0VPIFFBIHJldmlldycpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICBjb25zdCBhZ2VudENvbmZpZyA9IGF3YWl0IGdldEFnZW50Q29uZmlnKCdzZW9fcWEnKTtcbiAgICAgICAgaWYgKCFhZ2VudENvbmZpZykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBY3RpdmUgYWdlbnQgY29uZmlnIG5vdCBmb3VuZCBmb3IgYWdlbnRfa2V5OiBzZW9fcWEnKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBTRU8gQmxvZyBBZ2VudCBDb25maWcgTG9hZGVkOiBzZW9fcWEgdiR7YWdlbnRDb25maWcudmVyc2lvbn1gKTtcbiAgICAgICAgY29uc3Qgc3lzdGVtUHJvbXB0ID0gW1xuICAgICAgICAgICAgYWdlbnRDb25maWcuc3lzdGVtX3Byb21wdCxcbiAgICAgICAgICAgIGFnZW50Q29uZmlnLnNraWxsX21hcmtkb3duXG4gICAgICAgIF0uZmlsdGVyKEJvb2xlYW4pLmpvaW4oJ1xcblxcbicpO1xuICAgICAgICBjb25zdCBtb2RlbE5hbWUgPSBhZ2VudENvbmZpZy5tb2RlbCB8fCBwcm9jZXNzLmVudi5TRU9fUUFfQUdFTlRfTU9ERUwgfHwgcHJvY2Vzcy5lbnYuUkVTRUFSQ0hfQUdFTlRfTU9ERUwgfHwgJ2dwdC01LjQtbWluaSc7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFNFTyBRQSBzdGVwOiBVc2luZyBtb2RlbDogJHttb2RlbE5hbWV9YCk7XG4gICAgICAgIGNvbnN0IHNlb1FhUHJvbXB0ID0gYFJldmlldyB0aGlzIGRyYWZ0IHVzaW5nIHRoZSBTRU8gUUEgc2NoZW1hIGZyb20geW91ciBzeXN0ZW0gaW5zdHJ1Y3Rpb25zLlxcblxcbiR7YnVpbGRGdWxsSW5wdXRDb250ZXh0KGlucHV0KX1cXG5cXG5SZXNlYXJjaCBBZ2VudCBPdXRwdXQ6XFxuJHtKU09OLnN0cmluZ2lmeShyZXNlYXJjaERhdGEgPz8ge30sIG51bGwsIDIpfVxcblxcbk91dGxpbmUgQWdlbnQgT3V0cHV0OlxcbiR7SlNPTi5zdHJpbmdpZnkob3V0bGluZURhdGEgPz8ge30sIG51bGwsIDIpfVxcblxcbkJsb2cgRHJhZnQgTWFya2Rvd246XFxuJHtkcmFmdE1hcmtkb3dufVxcblxcblJldHVybiB2YWxpZCBKU09OIG9ubHkuIERvIG5vdCByZXdyaXRlIHRoZSBkcmFmdC4gRG8gbm90IGluY2x1ZGUgbWFya2Rvd24gZmVuY2VzIG9yIGV4cGxhbmF0aW9uIHRleHQuIFRoZSByZWNvbW1lbmRlZF9uZXh0X2FjdGlvbiBtdXN0IGJlIGV4YWN0bHkgb25lIG9mOiAke1ZBTElEX1JFQ09NTUVOREVEX0FDVElPTlMubWFwKCh2YWx1ZSk9PmBcIiR7dmFsdWV9XCJgKS5qb2luKCcsICcpfS5gO1xuICAgICAgICBjb25zdCB7IHRleHQgfSA9IGF3YWl0IGdlbmVyYXRlVGV4dCh7XG4gICAgICAgICAgICBtb2RlbDogb3BlbmFpKG1vZGVsTmFtZSksXG4gICAgICAgICAgICBzeXN0ZW06IHN5c3RlbVByb21wdCxcbiAgICAgICAgICAgIHByb21wdDogc2VvUWFQcm9tcHQsXG4gICAgICAgICAgICB0ZW1wZXJhdHVyZTogMC40LFxuICAgICAgICAgICAgbWF4T3V0cHV0VG9rZW5zOiAzMDAwXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBTRU8gUUEgc3RlcDogUmVjZWl2ZWQgYXVkaXQgZnJvbSBtb2RlbCwgcGFyc2luZyBKU09OYCk7XG4gICAgICAgIGxldCBzZW9RYVJlc3VsdDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHNlb1FhUmVzdWx0ID0gSlNPTi5wYXJzZShleHRyYWN0SnNvbk9iamVjdCh0ZXh0KSk7XG4gICAgICAgIH0gY2F0Y2ggKHBhcnNlRXJyKSB7XG4gICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gcGFyc2VFcnIgaW5zdGFuY2VvZiBFcnJvciA/IHBhcnNlRXJyLm1lc3NhZ2UgOiBTdHJpbmcocGFyc2VFcnIpO1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBTRU8gUUEgb3V0cHV0IHBhcnNlIGZhaWxlZDogJHttZXNzYWdlfWApO1xuICAgICAgICB9XG4gICAgICAgIHZhbGlkYXRlU2VvUWFPdXRwdXQoc2VvUWFSZXN1bHQpO1xuICAgICAgICBzZW9RYVJlc3VsdC50aW1lc3RhbXAgPSBzZW9RYVJlc3VsdC50aW1lc3RhbXAgfHwgbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBTRU8gUUEgc3RlcDogUGVyc2lzdGluZyBTRU8gUUEgYXVkaXQgKHNjb3JlOiAke3Nlb1FhUmVzdWx0Lm92ZXJhbGxfc2NvcmV9KSBmb3IgcnVuICR7cnVuSWR9YCk7XG4gICAgICAgIGF3YWl0IHVwZGF0ZVJ1blN0YXR1cyhydW5JZCwgJ3Nlb19xYScsIHNlb1FhUmVzdWx0KTtcbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gU0VPIFFBIHN0ZXA6IENvbXBsZXRlIGZvciBydW4gJHtydW5JZH1gKTtcbiAgICAgICAgcmV0dXJuIHNlb1FhUmVzdWx0O1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTXNnID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICBjb25zb2xlLmVycm9yKGBbdjBdIFNFTyBRQSBzdGVwOiBFcnJvciBkdXJpbmcgYXVkaXQgZm9yIHJ1biAke3J1bklkfTogJHtlcnJvck1zZ31gKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxufVxuZnVuY3Rpb24gdmFsaWRhdGVTZW9RYU91dHB1dChvdXRwdXQpIHtcbiAgICBjb25zdCBtaXNzaW5nRmllbGRzID0gW107XG4gICAgY29uc3QgcmVxdWlyZWRGaWVsZHMgPSBbXG4gICAgICAgICdvdmVyYWxsX3Njb3JlJyxcbiAgICAgICAgJ3JlYWR5X2Zvcl9lZGl0b3InLFxuICAgICAgICAncmVjb21tZW5kZWRfbmV4dF9hY3Rpb24nLFxuICAgICAgICAnc2VhcmNoX2ludGVudF9hbGlnbm1lbnQnLFxuICAgICAgICAncHJpbWFyeV9rZXl3b3JkX3VzYWdlJyxcbiAgICAgICAgJ3NlY29uZGFyeV9rZXl3b3JkX3VzYWdlJyxcbiAgICAgICAgJ2hlYWRpbmdfc3RydWN0dXJlX3JldmlldycsXG4gICAgICAgICdjb250ZW50X2RlcHRoX3JldmlldycsXG4gICAgICAgICdyZWFkYWJpbGl0eV9yZXZpZXcnLFxuICAgICAgICAnY3RhX3JldmlldycsXG4gICAgICAgICdpbnRlcm5hbF9saW5raW5nX3JldmlldycsXG4gICAgICAgICdjbGllbnRfZ29hbF9hbGlnbm1lbnQnLFxuICAgICAgICAncHJpb3JpdHlfZml4ZXMnLFxuICAgICAgICAncmlza19mbGFncycsXG4gICAgICAgICduZWVkc19yZXZpZXcnXG4gICAgXTtcbiAgICBmb3IgKGNvbnN0IGZpZWxkIG9mIHJlcXVpcmVkRmllbGRzKXtcbiAgICAgICAgaWYgKG91dHB1dFtmaWVsZF0gPT09IHVuZGVmaW5lZCB8fCBvdXRwdXRbZmllbGRdID09PSBudWxsKSB7XG4gICAgICAgICAgICBtaXNzaW5nRmllbGRzLnB1c2goZmllbGQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChtaXNzaW5nRmllbGRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBTRU8gUUEgb3V0cHV0IG1pc3NpbmcgcmVxdWlyZWQgZmllbGRzOiAke21pc3NpbmdGaWVsZHMuam9pbignLCAnKX1gKTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBvdXRwdXQub3ZlcmFsbF9zY29yZSAhPT0gJ251bWJlcicgfHwgb3V0cHV0Lm92ZXJhbGxfc2NvcmUgPCAwIHx8IG91dHB1dC5vdmVyYWxsX3Njb3JlID4gMTAwKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgU0VPIFFBIG91dHB1dCBpbnZhbGlkIG92ZXJhbGxfc2NvcmU6ICR7b3V0cHV0Lm92ZXJhbGxfc2NvcmV9LCBtdXN0IGJlIG51bWJlciBiZXR3ZWVuIDAtMTAwYCk7XG4gICAgfVxuICAgIGlmICh0eXBlb2Ygb3V0cHV0LnJlYWR5X2Zvcl9lZGl0b3IgIT09ICdib29sZWFuJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NFTyBRQSBvdXRwdXQgaW52YWxpZCByZWFkeV9mb3JfZWRpdG9yOiBleHBlY3RlZCBib29sZWFuJyk7XG4gICAgfVxuICAgIGlmICghVkFMSURfUkVDT01NRU5ERURfQUNUSU9OUy5pbmNsdWRlcyhvdXRwdXQucmVjb21tZW5kZWRfbmV4dF9hY3Rpb24pKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgU0VPIFFBIG91dHB1dCBpbnZhbGlkIHJlY29tbWVuZGVkX25leHRfYWN0aW9uOiAke291dHB1dC5yZWNvbW1lbmRlZF9uZXh0X2FjdGlvbn1gKTtcbiAgICB9XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KG91dHB1dC5wcmlvcml0eV9maXhlcykpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTRU8gUUEgb3V0cHV0IGludmFsaWQgcHJpb3JpdHlfZml4ZXM6IGV4cGVjdGVkIGFycmF5Jyk7XG4gICAgfVxuICAgIGlmICghQXJyYXkuaXNBcnJheShvdXRwdXQucmlza19mbGFncykpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTRU8gUUEgb3V0cHV0IGludmFsaWQgcmlza19mbGFnczogZXhwZWN0ZWQgYXJyYXknKTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBvdXRwdXQubmVlZHNfcmV2aWV3ICE9PSAnYm9vbGVhbicpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTRU8gUUEgb3V0cHV0IGludmFsaWQgbmVlZHNfcmV2aWV3OiBleHBlY3RlZCBib29sZWFuJyk7XG4gICAgfVxuICAgIHZhbGlkYXRlU2NvcmVPYmplY3Qob3V0cHV0LnNlYXJjaF9pbnRlbnRfYWxpZ25tZW50LCAnc2VhcmNoX2ludGVudF9hbGlnbm1lbnQnKTtcbiAgICB2YWxpZGF0ZVNjb3JlT2JqZWN0KG91dHB1dC5wcmltYXJ5X2tleXdvcmRfdXNhZ2UsICdwcmltYXJ5X2tleXdvcmRfdXNhZ2UnKTtcbiAgICB2YWxpZGF0ZVNjb3JlT2JqZWN0KG91dHB1dC5zZWNvbmRhcnlfa2V5d29yZF91c2FnZSwgJ3NlY29uZGFyeV9rZXl3b3JkX3VzYWdlJyk7XG4gICAgdmFsaWRhdGVTY29yZU9iamVjdChvdXRwdXQuaGVhZGluZ19zdHJ1Y3R1cmVfcmV2aWV3LCAnaGVhZGluZ19zdHJ1Y3R1cmVfcmV2aWV3Jyk7XG4gICAgdmFsaWRhdGVTY29yZU9iamVjdChvdXRwdXQuY29udGVudF9kZXB0aF9yZXZpZXcsICdjb250ZW50X2RlcHRoX3JldmlldycpO1xuICAgIHZhbGlkYXRlU2NvcmVPYmplY3Qob3V0cHV0LnJlYWRhYmlsaXR5X3JldmlldywgJ3JlYWRhYmlsaXR5X3JldmlldycpO1xuICAgIHZhbGlkYXRlU2NvcmVPYmplY3Qob3V0cHV0LmN0YV9yZXZpZXcsICdjdGFfcmV2aWV3Jyk7XG4gICAgdmFsaWRhdGVTY29yZU9iamVjdChvdXRwdXQuaW50ZXJuYWxfbGlua2luZ19yZXZpZXcsICdpbnRlcm5hbF9saW5raW5nX3JldmlldycpO1xuICAgIHZhbGlkYXRlU2NvcmVPYmplY3Qob3V0cHV0LmNsaWVudF9nb2FsX2FsaWdubWVudCwgJ2NsaWVudF9nb2FsX2FsaWdubWVudCcpO1xufVxuZnVuY3Rpb24gdmFsaWRhdGVTY29yZU9iamVjdCh2YWx1ZSwgZmllbGROYW1lKSB7XG4gICAgaWYgKCF2YWx1ZSB8fCB0eXBlb2YgdmFsdWUgIT09ICdvYmplY3QnKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgU0VPIFFBIG91dHB1dCBpbnZhbGlkICR7ZmllbGROYW1lfTogZXhwZWN0ZWQgb2JqZWN0YCk7XG4gICAgfVxuICAgIGNvbnN0IHNjb3JlID0gdmFsdWUuc2NvcmU7XG4gICAgaWYgKHR5cGVvZiBzY29yZSAhPT0gJ251bWJlcicgfHwgc2NvcmUgPCAwIHx8IHNjb3JlID4gMTAwKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgU0VPIFFBIG91dHB1dCBpbnZhbGlkICR7ZmllbGROYW1lfS5zY29yZTogJHtTdHJpbmcoc2NvcmUpfSwgbXVzdCBiZSBudW1iZXIgYmV0d2VlbiAwLTEwMGApO1xuICAgIH1cbn1cbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3Nlby1xYS1zdGVwLy9ydW5TZW9RYVN0ZXBcIiwgcnVuU2VvUWFTdGVwKTtcbiIsICJpbXBvcnQgeyByZWdpc3RlclN0ZXBGdW5jdGlvbiB9IGZyb20gXCJ3b3JrZmxvdy9pbnRlcm5hbC9wcml2YXRlXCI7XG5pbXBvcnQgJ3NlcnZlci1vbmx5JztcbmltcG9ydCB7IGdlbmVyYXRlVGV4dCB9IGZyb20gJ2FpJztcbmltcG9ydCB7IG9wZW5haSB9IGZyb20gJ0BhaS1zZGsvb3BlbmFpJztcbmltcG9ydCB7IHVwZGF0ZVJ1bkRyYWZ0LCB1cGRhdGVSdW5TdGF0dXMgfSBmcm9tICcuLi8uLi9zdG9yYWdlL3J1bnMnO1xuaW1wb3J0IHsgZ2V0QWdlbnRDb25maWcgfSBmcm9tICcuLi8uLi9zdG9yYWdlL2FnZW50LWNvbmZpZ3MnO1xuaW1wb3J0IHsgYnVpbGRGdWxsSW5wdXRDb250ZXh0IH0gZnJvbSAnLi9jb250ZXh0LWJ1aWxkZXInO1xuLyoqX19pbnRlcm5hbF93b3JrZmxvd3N7XCJzdGVwc1wiOntcImxpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvd3JpdGVyLXN0ZXAudHNcIjp7XCJydW5Xcml0ZXJTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvd3JpdGVyLXN0ZXAvL3J1bldyaXRlclN0ZXBcIn19fX0qLztcbi8qKlxuICogV3JpdGVyIFN0ZXAgLSBQaGFzZSAyQy1DXG4gKiBSdW5zIGluc2lkZSBhIGR1cmFibGUgc3RlcCBmdW5jdGlvbiAoaGFzIE5vZGUuanMgYWNjZXNzKVxuICogQ2FsbHMgQUkgbW9kZWwgdG8gZ2VuZXJhdGUgZmlyc3QgZnVsbCBibG9nIGRyYWZ0IGluIE1hcmtkb3duXG4gKiBVc2VzIHJlc2VhcmNoIGRhdGEgYW5kIG91dGxpbmUgdG8gc3RydWN0dXJlIHRoZSBjb250ZW50XG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJ1bldyaXRlclN0ZXAocnVuSWQsIGlucHV0LCByZXNlYXJjaERhdGEsIG91dGxpbmVEYXRhKSB7XG4gICAgY29uc29sZS5sb2coYFt2MF0gV3JpdGVyIHN0ZXA6IENyZWF0aW5nIGRyYWZ0IGZvciBydW4gJHtydW5JZH1gKTtcbiAgICB0cnkge1xuICAgICAgICAvLyBMb2FkIGFnZW50IGNvbmZpZyBmcm9tIGRhdGFiYXNlXG4gICAgICAgIGNvbnN0IGFnZW50Q29uZmlnID0gYXdhaXQgZ2V0QWdlbnRDb25maWcoJ3dyaXRlcicpO1xuICAgICAgICBpZiAoIWFnZW50Q29uZmlnKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0FjdGl2ZSBhZ2VudCBjb25maWcgbm90IGZvdW5kIGZvciBhZ2VudF9rZXk6IHdyaXRlcicpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFNFTyBCbG9nIEFnZW50IENvbmZpZyBMb2FkZWQ6IHdyaXRlciB2JHthZ2VudENvbmZpZy52ZXJzaW9ufWApO1xuICAgICAgICAvLyBCdWlsZCBzeXN0ZW0gcHJvbXB0IGZyb20gZGF0YWJhc2UgY29uZmlnXG4gICAgICAgIGNvbnN0IHN5c3RlbVByb21wdCA9IFtcbiAgICAgICAgICAgIGFnZW50Q29uZmlnLnN5c3RlbV9wcm9tcHQsXG4gICAgICAgICAgICBhZ2VudENvbmZpZy5za2lsbF9tYXJrZG93blxuICAgICAgICBdLmZpbHRlcihCb29sZWFuKS5qb2luKCdcXG5cXG4nKTtcbiAgICAgICAgLy8gQ3JlYXRlIGNvbnRleHQgZnJvbSBhdmFpbGFibGUgZGF0YVxuICAgICAgICBjb25zdCB0b3BpYyA9IGlucHV0LmJsb2dfdG9waWMgfHwgaW5wdXQudG9waWMgfHwgJ1lvdXIgVG9waWMnO1xuICAgICAgICBjb25zdCBwcmltYXJ5S2V5d29yZCA9IGlucHV0LnByaW1hcnlfa2V5d29yZCB8fCAncHJpbWFyeSBrZXl3b3JkJztcbiAgICAgICAgY29uc3Qgc2Vjb25kYXJ5S2V5d29yZHMgPSAoaW5wdXQuc2Vjb25kYXJ5X2tleXdvcmRzIHx8IGlucHV0LmtleXdvcmRzIHx8IFtdKS5qb2luKCcsICcpIHx8ICdzZWNvbmRhcnkga2V5d29yZHMnO1xuICAgICAgICBjb25zdCBidXNpbmVzc05hbWUgPSBpbnB1dC5idXNpbmVzc19uYW1lIHx8ICdZb3VyIEJ1c2luZXNzJztcbiAgICAgICAgY29uc3QgYXVkaWVuY2VOb3RlcyA9IGlucHV0LmF1ZGllbmNlX25vdGVzIHx8ICdUYXJnZXQgYXVkaWVuY2Ugbm90IHNwZWNpZmllZCc7XG4gICAgICAgIGNvbnN0IGJyYW5kVm9pY2UgPSBpbnB1dC5icmFuZF92b2ljZV9ub3RlcyB8fCAnUHJvZmVzc2lvbmFsIGFuZCBjbGVhcic7XG4gICAgICAgIGNvbnN0IGN0YU5vdGVzID0gaW5wdXQuY3RhX25vdGVzIHx8ICcnO1xuICAgICAgICBjb25zdCBpbnRlcm5hbExpbmtOb3RlcyA9IGlucHV0LmludGVybmFsX2xpbmtfbm90ZXMgfHwgJyc7XG4gICAgICAgIGNvbnN0IGFkZGl0aW9uYWxOb3RlcyA9IGlucHV0LmFkZGl0aW9uYWxfb3JkZXJfbm90ZXMgfHwgJ05vIGFkZGl0aW9uYWwgbm90ZXMnO1xuICAgICAgICBjb25zdCB0YXJnZXRXb3JkQ291bnQgPSBpbnB1dC50YXJnZXRfd29yZF9jb3VudCB8fCAxNTAwO1xuICAgICAgICAvLyBCdWlsZCByZXNlYXJjaCBjb250ZXh0IGlmIGF2YWlsYWJsZVxuICAgICAgICBsZXQgcmVzZWFyY2hDb250ZXh0ID0gJyc7XG4gICAgICAgIGlmIChyZXNlYXJjaERhdGEgJiYgdHlwZW9mIHJlc2VhcmNoRGF0YSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIGNvbnN0IGZpbmRpbmdzID0gcmVzZWFyY2hEYXRhLmtleV9maW5kaW5ncyB8fCBbXTtcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGZpbmRpbmdzKSAmJiBmaW5kaW5ncy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgcmVzZWFyY2hDb250ZXh0ID0gYFxcblxcbktleSBSZXNlYXJjaCBGaW5kaW5nczpcXG4ke2ZpbmRpbmdzLm1hcCgoZik9PmAtICR7dHlwZW9mIGYgPT09ICdzdHJpbmcnID8gZiA6IEpTT04uc3RyaW5naWZ5KGYpfWApLmpvaW4oJ1xcbicpfWA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gQnVpbGQgb3V0bGluZSBjb250ZXh0IGlmIGF2YWlsYWJsZVxuICAgICAgICBsZXQgb3V0bGluZUNvbnRleHQgPSAnJztcbiAgICAgICAgaWYgKG91dGxpbmVEYXRhKSB7XG4gICAgICAgICAgICBjb25zdCBzZWN0aW9ucyA9IChvdXRsaW5lRGF0YS5zZWN0aW9ucyB8fCBbXSkubWFwKChzKT0+YCMjICR7dHlwZW9mIHMgPT09ICdzdHJpbmcnID8gcyA6IHMuaGVhZGluZyB8fCAnU2VjdGlvbid9XFxuKCR7cy5wdXJwb3NlIHx8ICdTZWN0aW9uIGNvbnRlbnQnfSlgKTtcbiAgICAgICAgICAgIGlmIChzZWN0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgb3V0bGluZUNvbnRleHQgPSBgXFxuXFxuT3V0bGluZSBTdHJ1Y3R1cmU6XFxuJHtzZWN0aW9ucy5qb2luKCdcXG5cXG4nKX1gO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIEJ1aWxkIGludGVybmFsIGxpbmtzIGNvbnRleHRcbiAgICAgICAgbGV0IGxpbmtzQ29udGV4dCA9ICcnO1xuICAgICAgICBpZiAoaW50ZXJuYWxMaW5rTm90ZXMpIHtcbiAgICAgICAgICAgIGxpbmtzQ29udGV4dCA9IGBcXG5cXG5JbnRlcm5hbCBMaW5rIE9wcG9ydHVuaXRpZXM6XFxuJHtpbnRlcm5hbExpbmtOb3Rlc31gO1xuICAgICAgICB9XG4gICAgICAgIC8vIEJ1aWxkIENUQSBjb250ZXh0XG4gICAgICAgIGxldCBjdGFDb250ZXh0ID0gJyc7XG4gICAgICAgIGlmIChjdGFOb3Rlcykge1xuICAgICAgICAgICAgY3RhQ29udGV4dCA9IGBcXG5cXG5DYWxsLXRvLUFjdGlvbiBHdWlkYW5jZTpcXG4ke2N0YU5vdGVzfWA7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdXNlck1lc3NhZ2UgPSBgV3JpdGUgdGhlIGZpcnN0IGRyYWZ0IGJsb2cgcG9zdCB1c2luZyB0aGUgZnVsbCBCbG9nIENvbnRleHQgQnJpZWYsIFJlc2VhcmNoIEFnZW50IG91dHB1dCwgYW5kIE91dGxpbmUgQWdlbnQgb3V0cHV0LlxuXG4ke2J1aWxkRnVsbElucHV0Q29udGV4dChpbnB1dCl9JHtyZXNlYXJjaENvbnRleHR9JHtvdXRsaW5lQ29udGV4dH0ke2xpbmtzQ29udGV4dH0ke2N0YUNvbnRleHR9XG5cblRvcGljOiAke3RvcGljfVxuQnVzaW5lc3M6ICR7YnVzaW5lc3NOYW1lfVxuUHJpbWFyeSBLZXl3b3JkOiAke3ByaW1hcnlLZXl3b3JkfVxuU2Vjb25kYXJ5IEtleXdvcmRzOiAke3NlY29uZGFyeUtleXdvcmRzfVxuVGFyZ2V0IFdvcmQgQ291bnQ6ICR7dGFyZ2V0V29yZENvdW50fVxuQXVkaWVuY2U6ICR7YXVkaWVuY2VOb3Rlc31cbkJyYW5kIFZvaWNlOiAke2JyYW5kVm9pY2V9XG5BZGRpdGlvbmFsIE5vdGVzOiAke2FkZGl0aW9uYWxOb3Rlc31cblxuUmV0dXJuIE1hcmtkb3duIG9ubHksIGZvbGxvd2luZyB0aGUgV3JpdGVyIEFnZW50IGluc3RydWN0aW9ucy4gRG8gbm90IGludmVudCB1bnN1cHBvcnRlZCBmYWN0cywgc2VydmljZXMsIGxvY2F0aW9ucywgb2ZmZXJzLCBjbGFpbXMsIG9yIGxpbmtzLmA7XG4gICAgICAgIC8vIEdldCBtb2RlbCBuYW1lOiB1c2UgREIgY29uZmlnIGlmIGF2YWlsYWJsZSwgb3RoZXJ3aXNlIGZhbGwgYmFjayB0byBlbnYgdmFyIG9yIGRlZmF1bHRcbiAgICAgICAgY29uc3QgbW9kZWxOYW1lID0gYWdlbnRDb25maWcubW9kZWwgfHwgcHJvY2Vzcy5lbnYuV1JJVEVSX0FHRU5UX01PREVMIHx8IHByb2Nlc3MuZW52LlJFU0VBUkNIX0FHRU5UX01PREVMIHx8ICdncHQtNS40LW1pbmknO1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBXcml0ZXIgc3RlcDogVXNpbmcgbW9kZWw6ICR7bW9kZWxOYW1lfWApO1xuICAgICAgICAvLyBDYWxsIEFJIG1vZGVsIHZpYSBkaXJlY3QgT3BlbkFJIHByb3ZpZGVyXG4gICAgICAgIGNvbnN0IG1vZGVsID0gb3BlbmFpKG1vZGVsTmFtZSk7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZ2VuZXJhdGVUZXh0KHtcbiAgICAgICAgICAgIG1vZGVsLFxuICAgICAgICAgICAgc3lzdGVtOiBzeXN0ZW1Qcm9tcHQsXG4gICAgICAgICAgICBwcm9tcHQ6IHVzZXJNZXNzYWdlLFxuICAgICAgICAgICAgdGVtcGVyYXR1cmU6IDAuNyxcbiAgICAgICAgICAgIG1heE91dHB1dFRva2VuczogNDAwMFxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgZHJhZnRNYXJrZG93biA9IHJlc3BvbnNlLnRleHQ7XG4gICAgICAgIC8vIEJhc2ljIHZhbGlkYXRpb25cbiAgICAgICAgaWYgKCFkcmFmdE1hcmtkb3duIHx8IGRyYWZ0TWFya2Rvd24udHJpbSgpLmxlbmd0aCA8IDUwMCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdHZW5lcmF0ZWQgY29udGVudCB0b28gc2hvcnQnKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBDYWxjdWxhdGUgbWV0cmljc1xuICAgICAgICBjb25zdCB3b3JkQ291bnQgPSBkcmFmdE1hcmtkb3duLnNwbGl0KC9cXHMrLykubGVuZ3RoO1xuICAgICAgICBjb25zdCBzZWN0aW9uc0NvdW50ID0gKGRyYWZ0TWFya2Rvd24ubWF0Y2goL14jI1xccy9nbSkgfHwgW10pLmxlbmd0aDtcbiAgICAgICAgY29uc3QgaGFzQ3RhID0gZHJhZnRNYXJrZG93bi50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKCdjYWxsJykgfHwgZHJhZnRNYXJrZG93bi50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKCdhY3Rpb24nKSB8fCBjdGFOb3Rlcy5sZW5ndGggPiAwO1xuICAgICAgICBjb25zdCBoYXNJbnRlcm5hbExpbmtzID0gZHJhZnRNYXJrZG93bi5pbmNsdWRlcygnW2xpbms6JykgfHwgaW50ZXJuYWxMaW5rTm90ZXMubGVuZ3RoID4gMDtcbiAgICAgICAgY29uc3Qgd3JpdGVyT3V0cHV0ID0ge1xuICAgICAgICAgICAgZHJhZnRfbWFya2Rvd246IGRyYWZ0TWFya2Rvd24sXG4gICAgICAgICAgICB3b3JkX2NvdW50OiB3b3JkQ291bnQsXG4gICAgICAgICAgICBzZWN0aW9uc193cml0dGVuOiBzZWN0aW9uc0NvdW50LFxuICAgICAgICAgICAgaGFzX2N0YTogaGFzQ3RhLFxuICAgICAgICAgICAgaGFzX2ludGVybmFsX2xpbmtzOiBoYXNJbnRlcm5hbExpbmtzLFxuICAgICAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgICAgfTtcbiAgICAgICAgLy8gUGVyc2lzdCBkcmFmdF9tYXJrZG93biB0byBkYXRhYmFzZSAobWFya2Rvd24gc3RyaW5nIG9ubHksIG5vdCBmdWxsIG9iamVjdClcbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gV3JpdGVyIHN0ZXA6IFBlcnNpc3RpbmcgZHJhZnRfbWFya2Rvd24gKCR7d29yZENvdW50fSB3b3JkcykgZm9yIHJ1biAke3J1bklkfWApO1xuICAgICAgICBhd2FpdCB1cGRhdGVSdW5EcmFmdChydW5JZCwgd3JpdGVyT3V0cHV0LmRyYWZ0X21hcmtkb3duKTtcbiAgICAgICAgLy8gQWxzbyB1cGRhdGUgc3RhdHVzIHRvICd3cml0aW5nJ1xuICAgICAgICBhd2FpdCB1cGRhdGVSdW5TdGF0dXMocnVuSWQsICd3cml0aW5nJyk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFdyaXRlciBzdGVwOiBDb21wbGV0ZSBmb3IgcnVuICR7cnVuSWR9ICgke3dvcmRDb3VudH0gd29yZHMsICR7c2VjdGlvbnNDb3VudH0gc2VjdGlvbnMpYCk7XG4gICAgICAgIHJldHVybiB3cml0ZXJPdXRwdXQ7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgZXJyb3JNc2cgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yIGluIHdyaXRlciBzdGVwJztcbiAgICAgICAgY29uc29sZS5lcnJvcihgW3YwXSBXcml0ZXIgc3RlcCBlcnJvciBmb3IgcnVuICR7cnVuSWR9OiAke2Vycm9yTXNnfWApO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFdyaXRlciBzdGVwIGZhaWxlZDogJHtlcnJvck1zZ31gKTtcbiAgICB9XG59XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy93cml0ZXItc3RlcC8vcnVuV3JpdGVyU3RlcFwiLCBydW5Xcml0ZXJTdGVwKTtcbiIsICJcbiAgICAvLyBCdWlsdCBpbiBzdGVwc1xuICAgIGltcG9ydCAnd29ya2Zsb3cvaW50ZXJuYWwvYnVpbHRpbnMnO1xuICAgIC8vIFVzZXIgc3RlcHNcbiAgICBpbXBvcnQgJy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9jYWxsYmFjay1zdGVwLnRzJztcbmltcG9ydCAnLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL2VkaXRvci1zdGVwLnRzJztcbmltcG9ydCAnLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL2hlbHBlcnMudHMnO1xuaW1wb3J0ICcuL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvbWV0YS1zdGVwLnRzJztcbmltcG9ydCAnLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL291dGxpbmUtc3RlcC50cyc7XG5pbXBvcnQgJy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9yZXNlYXJjaC1zdGVwLnRzJztcbmltcG9ydCAnLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3JldmlzaW9uLXN0ZXAudHMnO1xuaW1wb3J0ICcuL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvc2VvLXFhLXN0ZXAudHMnO1xuaW1wb3J0ICcuL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvd3JpdGVyLXN0ZXAudHMnO1xuICAgIC8vIFNlcmRlIGZpbGVzIGZvciBjcm9zcy1jb250ZXh0IGNsYXNzIHJlZ2lzdHJhdGlvblxuICAgIFxuICAgIC8vIEFQSSBlbnRyeXBvaW50XG4gICAgZXhwb3J0IHsgc3RlcEVudHJ5cG9pbnQgYXMgSEVBRCwgc3RlcEVudHJ5cG9pbnQgYXMgUE9TVCB9IGZyb20gJ3dvcmtmbG93L3J1bnRpbWUnOyJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7QUFBQSxTQUFBLDRCQUFBO0FBU0UsZUFBVyxrQ0FBQTtBQUNYLFNBQU8sS0FBSyxZQUFXO0FBQ3pCO0FBRmE7QUFJYixlQUFzQiwwQkFBdUI7QUFDM0MsU0FBQSxLQUFXLEtBQUE7O0FBRFM7QUFHdEIsZUFBQywwQkFBQTtBQUVELFNBQU8sS0FBSyxLQUFBOztBQUZYO3FCQUlpQixtQ0FBRywrQkFBQTtBQUNyQixxQkFBQywyQkFBQSx1QkFBQTs7OztBQ3JCRCxTQUFTLHdCQUFBQSw2QkFBNEI7QUFFckMsU0FBUyxRQUFRLDZCQUE2QjtBQVcxQyxlQUFzQixpQkFBaUIsT0FBTyxTQUFTO0FBQ3ZELE1BQUk7QUFFQSxVQUFNLE1BQU0sTUFBTSxPQUFPLEtBQUs7QUFDOUIsUUFBSSxDQUFDLEtBQUs7QUFDTixjQUFRLEtBQUssc0JBQXNCLEtBQUssWUFBWTtBQUNwRDtBQUFBLElBQ0o7QUFDQSxRQUFJLENBQUMsSUFBSSxjQUFjO0FBQ25CLGNBQVEsSUFBSSwwQ0FBMEMsS0FBSyxFQUFFO0FBRTdELFlBQU0sc0JBQXNCLE9BQU8sZ0JBQWdCO0FBQ25EO0FBQUEsSUFDSjtBQUNBLFlBQVEsSUFBSSwwQ0FBMEMsSUFBSSxZQUFZLEVBQUU7QUFFeEUsVUFBTSxrQkFBa0IscUJBQXFCLEtBQUssT0FBTztBQUV6RCxVQUFNLGFBQWEsSUFBSSxn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QWdCO0FBQUEsTUFDaEIsWUFBWTtBQUFBLE1BQ1osa0JBQWtCO0FBQUEsTUFDbEIsU0FBUztBQUFBLE1BQ1Qsb0JBQW9CO0FBQUEsTUFDcEIsWUFBVyxvQkFBSSxLQUFLLEdBQUUsWUFBWTtBQUFBLElBQ3RDO0FBRUEsWUFBUSxJQUFJLGdEQUFnRCxTQUFTLG1CQUFtQixLQUFLLEVBQUU7QUFDL0YsVUFBTSxlQUFlLE9BQU8sYUFBYSxjQUFjO0FBRXZELFVBQU1DLGlCQUFnQixPQUFPLFNBQVM7QUFDdEMsWUFBUSxJQUFJLHNDQUFzQyxLQUFLLEtBQUssU0FBUyxXQUFXLGFBQWEsWUFBWTtBQUN6RyxXQUFPO0FBQUEsRUFDWCxTQUFTLE9BQU87QUFDWixVQUFNLFdBQVcsaUJBQWlCLFFBQVEsTUFBTSxVQUFVO0FBQzFELFlBQVEsTUFBTSxrQ0FBa0MsS0FBSyxLQUFLLFFBQVEsRUFBRTtBQUNwRSxVQUFNLElBQUksTUFBTSx1QkFBdUIsUUFBUSxFQUFFO0FBQUEsRUFDckQ7QUFDSjtBQTNHMEI7QUE0RzFCQyx1QkFBcUIseUVBQXlFLGFBQWE7OztBQ3pHdkcsU0FBMkIsZ0JBQXdCLGtCQUFsQkMsdUJBQThCOyIsCiAgIm5hbWVzIjogWyJyZWdpc3RlclN0ZXBGdW5jdGlvbiIsICJyZWdpc3RlclN0ZXBGdW5jdGlvbiIsICJyZWdpc3RlclN0ZXBGdW5jdGlvbiIsICJyZWdpc3RlclN0ZXBGdW5jdGlvbiIsICJyZWdpc3RlclN0ZXBGdW5jdGlvbiIsICJyZWdpc3RlclN0ZXBGdW5jdGlvbiIsICJyZWdpc3RlclN0ZXBGdW5jdGlvbiIsICJnZW5lcmF0ZVRleHQiLCAib3BlbmFpIiwgImdldEFnZW50Q29uZmlnIiwgImJ1aWxkRnVsbElucHV0Q29udGV4dCIsICJnZXRBZ2VudENvbmZpZyIsICJnZW5lcmF0ZVRleHQiLCAib3BlbmFpIiwgImJ1aWxkRnVsbElucHV0Q29udGV4dCIsICJyZWdpc3RlclN0ZXBGdW5jdGlvbiIsICJyZWdpc3RlclN0ZXBGdW5jdGlvbiIsICJnZW5lcmF0ZVRleHQiLCAib3BlbmFpIiwgInVwZGF0ZVJ1blN0YXR1cyIsICJnZXRBZ2VudENvbmZpZyIsICJidWlsZEZ1bGxJbnB1dENvbnRleHQiLCAiZXh0cmFjdEpzb25PYmplY3QiLCAiZ2V0QWdlbnRDb25maWciLCAiYnVpbGRGdWxsSW5wdXRDb250ZXh0IiwgIm9wZW5haSIsICJnZW5lcmF0ZVRleHQiLCAiZXh0cmFjdEpzb25PYmplY3QiLCAidXBkYXRlUnVuU3RhdHVzIiwgInJlZ2lzdGVyU3RlcEZ1bmN0aW9uIiwgInJlZ2lzdGVyU3RlcEZ1bmN0aW9uIiwgImdlbmVyYXRlVGV4dCIsICJvcGVuYWkiLCAidXBkYXRlUnVuU3RhdHVzIiwgImdldEFnZW50Q29uZmlnIiwgImJ1aWxkRnVsbElucHV0Q29udGV4dCIsICJleHRyYWN0SnNvbk9iamVjdCIsICJnZXRBZ2VudENvbmZpZyIsICJidWlsZEZ1bGxJbnB1dENvbnRleHQiLCAib3BlbmFpIiwgImdlbmVyYXRlVGV4dCIsICJleHRyYWN0SnNvbk9iamVjdCIsICJ1cGRhdGVSdW5TdGF0dXMiLCAicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAiZ2VuZXJhdGVUZXh0IiwgIm9wZW5haSIsICJnZXRBZ2VudENvbmZpZyIsICJidWlsZEZ1bGxJbnB1dENvbnRleHQiLCAiZ2V0QWdlbnRDb25maWciLCAiYnVpbGRGdWxsSW5wdXRDb250ZXh0IiwgIm9wZW5haSIsICJnZW5lcmF0ZVRleHQiLCAicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAiZ2VuZXJhdGVUZXh0IiwgIm9wZW5haSIsICJ1cGRhdGVSdW5TdGF0dXMiLCAiZ2V0QWdlbnRDb25maWciLCAiYnVpbGRGdWxsSW5wdXRDb250ZXh0IiwgImV4dHJhY3RKc29uT2JqZWN0IiwgImdldEFnZW50Q29uZmlnIiwgImJ1aWxkRnVsbElucHV0Q29udGV4dCIsICJnZW5lcmF0ZVRleHQiLCAib3BlbmFpIiwgImV4dHJhY3RKc29uT2JqZWN0IiwgInVwZGF0ZVJ1blN0YXR1cyIsICJyZWdpc3RlclN0ZXBGdW5jdGlvbiIsICJyZWdpc3RlclN0ZXBGdW5jdGlvbiIsICJnZW5lcmF0ZVRleHQiLCAib3BlbmFpIiwgInVwZGF0ZVJ1blN0YXR1cyIsICJnZXRBZ2VudENvbmZpZyIsICJidWlsZEZ1bGxJbnB1dENvbnRleHQiLCAiZ2V0QWdlbnRDb25maWciLCAiYnVpbGRGdWxsSW5wdXRDb250ZXh0IiwgIm9wZW5haSIsICJnZW5lcmF0ZVRleHQiLCAidXBkYXRlUnVuU3RhdHVzIiwgInJlZ2lzdGVyU3RlcEZ1bmN0aW9uIiwgInN0ZXBFbnRyeXBvaW50Il0KfQo=

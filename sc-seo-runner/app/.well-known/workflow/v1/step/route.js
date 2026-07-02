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

// lib/seo-blog-engine/workflow/steps/revision-helpers.ts
import { registerStepFunction as registerStepFunction8 } from "workflow/internal/private";
import { getRun as getRun2, updateRevisionAndDraft } from "../../../../../lib/seo-blog-engine/storage/runs.ts";
import { query } from "../../../../../lib/seo-blog-engine/storage/db.ts";
async function getRunForRevisionStep(runId) {
  return getRun2(runId);
}
__name(getRunForRevisionStep, "getRunForRevisionStep");
async function updateRevisionAndDraftStep(runId, revisedMarkdown, internalReviewMetadata) {
  return updateRevisionAndDraft(runId, revisedMarkdown, internalReviewMetadata);
}
__name(updateRevisionAndDraftStep, "updateRevisionAndDraftStep");
async function updateBatchRevisionPendingStep(batchId) {
  if (!batchId) {
    return {
      ok: true,
      skipped: true,
      reason: "No batch id provided"
    };
  }
  try {
    await query(`UPDATE smc_content_batches SET status = $1, updated_at = NOW() WHERE id = $2`, [
      "blog_revised_review_pending",
      batchId
    ]);
    return {
      ok: true,
      skipped: false
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      ok: false,
      skipped: false,
      error: errorMessage
    };
  }
}
__name(updateBatchRevisionPendingStep, "updateBatchRevisionPendingStep");
registerStepFunction8("step//./lib/seo-blog-engine/workflow/steps/revision-helpers//getRunForRevisionStep", getRunForRevisionStep);
registerStepFunction8("step//./lib/seo-blog-engine/workflow/steps/revision-helpers//updateRevisionAndDraftStep", updateRevisionAndDraftStep);
registerStepFunction8("step//./lib/seo-blog-engine/workflow/steps/revision-helpers//updateBatchRevisionPendingStep", updateBatchRevisionPendingStep);

// lib/seo-blog-engine/workflow/steps/revision-step.ts
import { registerStepFunction as registerStepFunction9 } from "workflow/internal/private";
import { generateText as generateText5 } from "ai";
import { openai as openai5 } from "@ai-sdk/openai";
import { getAgentConfig as getAgentConfig5 } from "../../../../../lib/seo-blog-engine/storage/agent-configs.ts";
function formatRevisionValue(value, fallback = "Not provided") {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return fallback;
}
__name(formatRevisionValue, "formatRevisionValue");
function formatRevisionList(values, fallback = "None provided") {
  if (!Array.isArray(values) || values.length === 0) return fallback;
  const cleaned = values.map((item) => typeof item === "string" ? item.trim() : String(item)).filter(Boolean);
  if (cleaned.length === 0) return fallback;
  return cleaned.map((item) => `- ${item}`).join("\n");
}
__name(formatRevisionList, "formatRevisionList");
function formatRevisionJson(value, fallback = "None provided") {
  if (!value || typeof value !== "object") return fallback;
  return JSON.stringify(value, null, 2);
}
__name(formatRevisionJson, "formatRevisionJson");
function buildLeanRevisionContext(input) {
  const brief = input.blog_context_brief ?? {};
  const briefRecord = brief;
  const mustInclude = Array.isArray(brief.must_include) && brief.must_include.length > 0 ? brief.must_include : input.must_include;
  const mustAvoid = Array.isArray(brief.must_avoid) && brief.must_avoid.length > 0 ? brief.must_avoid : input.must_avoid;
  const brandVoice = brief.brand_voice_notes || input.brand_voice_notes || input.tone;
  const orderContext = input.order_context || briefRecord.order_context || {};
  return `## Limited Revision Context

Use this context only to support the requested revision.
Do not restart, re-plan, or regenerate the article from this context.

Business Name: ${formatRevisionValue(input.business_name)}
Client Name: ${formatRevisionValue(input.client_name)}
Website URL: ${formatRevisionValue(input.website_url)}
Blog Topic: ${formatRevisionValue(input.blog_topic || input.topic)}
Primary Keyword: ${formatRevisionValue(input.primary_keyword)}
Secondary Keywords:
${formatRevisionList(input.secondary_keywords || input.keywords)}
Target Word Count: ${formatRevisionValue(input.target_word_count)}
Brand Voice Notes: ${formatRevisionValue(brandVoice)}
Audience Notes: ${formatRevisionValue(input.audience_notes)}
CTA Notes: ${formatRevisionValue(input.cta_notes || input.cta)}
Additional Order Notes: ${formatRevisionValue(input.additional_order_notes)}

Must Include:
${formatRevisionList(mustInclude)}

Must Avoid:
${formatRevisionList(mustAvoid)}

Original Order Context:
${formatRevisionJson(orderContext)}`;
}
__name(buildLeanRevisionContext, "buildLeanRevisionContext");
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
    const revisionInstruction = revisionMode === "heavy_revision" ? "Apply comprehensive changes requested by the feedback. You may restructure sections if needed, but keep the same core topic, primary keyword, and publishing intent unless the feedback explicitly asks for a new direction. Preserve the existing H1/title unless the reviewer explicitly asks to change it. Do not invent new facts." : "Apply focused changes requested by the feedback. Polish the existing structure, refine wording, and keep sections and the existing H1/title intact where possible.";
    const contextBlock = input ? `

${buildLeanRevisionContext(input)}` : "";
    void research;
    void outline;
    void seoQa;
    void meta;
    const additionalContext = [];
    if (!currentDraft || !currentDraft.trim()) {
      throw new Error("Revision step missing currentDraft");
    }
    if (!reviewerFeedback || !reviewerFeedback.trim()) {
      throw new Error("Revision step missing reviewerFeedback");
    }
    const userMessage = `Revise the blog draft below using the reviewer feedback provided.

Revision Mode: ${revisionMode}
${revisionInstruction}

Publishing Note:
This revision does not regenerate meta title, slug, or social preview. Preserve the same core topic, primary keyword, article angle, and H1/title unless reviewer feedback explicitly asks to change them.

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
registerStepFunction9("step//./lib/seo-blog-engine/workflow/steps/revision-step//runRevisionStep", runRevisionStep);

// lib/seo-blog-engine/workflow/steps/seo-qa-step.ts
import { registerStepFunction as registerStepFunction10 } from "workflow/internal/private";
import { generateText as generateText6 } from "ai";
import { openai as openai6 } from "@ai-sdk/openai";
import { updateRunStatus as updateRunStatus4 } from "../../../../../lib/seo-blog-engine/storage/runs.ts";
import { getAgentConfig as getAgentConfig6 } from "../../../../../lib/seo-blog-engine/storage/agent-configs.ts";
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

${buildFullInputContext5(input)}

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
registerStepFunction10("step//./lib/seo-blog-engine/workflow/steps/seo-qa-step//runSeoQaStep", runSeoQaStep);

// lib/seo-blog-engine/workflow/steps/writer-step.ts
import { registerStepFunction as registerStepFunction11 } from "workflow/internal/private";
import { generateText as generateText7 } from "ai";
import { openai as openai7 } from "@ai-sdk/openai";
import { updateRunDraft, updateRunStatus as updateRunStatus5 } from "../../../../../lib/seo-blog-engine/storage/runs.ts";
import { getAgentConfig as getAgentConfig7 } from "../../../../../lib/seo-blog-engine/storage/agent-configs.ts";
import { buildFullInputContext as buildFullInputContext6 } from "../../../../../lib/seo-blog-engine/workflow/steps/context-builder.ts";
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
registerStepFunction11("step//./lib/seo-blog-engine/workflow/steps/writer-step//runWriterStep", runWriterStep);

// virtual-entry.js
import { stepEntrypoint, stepEntrypoint as stepEntrypoint2 } from "workflow/runtime";
export {
  stepEntrypoint as HEAD,
  stepEntrypoint2 as POST
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3dvcmtmbG93QDQuNS4wX0BuZXN0anMrY29tbW9uQDExLjEuMjdfcmVmbGVjdC1tZXRhZGF0YUAwLjIuMl9yeGpzQDcuOC4yX19AbmVzdGpzK2NvcmVAMV9hOWMxYWE2YzBiNTgwZTliZjNiZmY2NGMzMjY5ZmU0My9ub2RlX21vZHVsZXMvd29ya2Zsb3cvc3JjL2ludGVybmFsL2J1aWx0aW5zLnRzIiwgIi4uLy4uLy4uLy4uLy4uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvY2FsbGJhY2stc3RlcC50cyIsICIuLi8uLi8uLi8uLi8uLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL2VkaXRvci1zdGVwLnRzIiwgIi4uLy4uLy4uLy4uLy4uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvaGVscGVycy50cyIsICIuLi8uLi8uLi8uLi8uLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL21ldGEtc3RlcC50cyIsICIuLi8uLi8uLi8uLi8uLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL291dGxpbmUtc3RlcC50cyIsICIuLi8uLi8uLi8uLi8uLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3Jlc2VhcmNoLXN0ZXAudHMiLCAiLi4vLi4vLi4vLi4vLi4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9yZXZpc2lvbi1oZWxwZXJzLnRzIiwgIi4uLy4uLy4uLy4uLy4uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvcmV2aXNpb24tc3RlcC50cyIsICIuLi8uLi8uLi8uLi8uLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3Nlby1xYS1zdGVwLnRzIiwgIi4uLy4uLy4uLy4uLy4uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvd3JpdGVyLXN0ZXAudHMiLCAiLi4vLi4vLi4vLi4vLi4vdmlydHVhbC1lbnRyeS5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLyoqXG4gKiBUaGVzZSBhcmUgdGhlIGJ1aWx0LWluIHN0ZXBzIHRoYXQgYXJlIFwiYXV0b21hdGljYWxseSBhdmFpbGFibGVcIiBpbiB0aGUgd29ya2Zsb3cgc2NvcGUuIFRoZXkgYXJlXG4gKiBzaW1pbGFyIHRvIFwic3RkbGliXCIgZXhjZXB0IHRoYXQgYXJlIG5vdCBtZWFudCB0byBiZSBpbXBvcnRlZCBieSB1c2VycywgYnV0IGFyZSBpbnN0ZWFkIFwianVzdCBhdmFpbGFibGVcIlxuICogYWxvbmdzaWRlIHVzZXIgZGVmaW5lZCBzdGVwcy4gVGhleSBhcmUgdXNlZCBpbnRlcm5hbGx5IGJ5IHRoZSBydW50aW1lXG4gKi9cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIF9fYnVpbHRpbl9yZXNwb25zZV9hcnJheV9idWZmZXIoXG4gIHRoaXM6IFJlcXVlc3QgfCBSZXNwb25zZVxuKSB7XG4gICd1c2Ugc3RlcCc7XG4gIHJldHVybiB0aGlzLmFycmF5QnVmZmVyKCk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBfX2J1aWx0aW5fcmVzcG9uc2VfanNvbih0aGlzOiBSZXF1ZXN0IHwgUmVzcG9uc2UpIHtcbiAgJ3VzZSBzdGVwJztcbiAgcmV0dXJuIHRoaXMuanNvbigpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gX19idWlsdGluX3Jlc3BvbnNlX3RleHQodGhpczogUmVxdWVzdCB8IFJlc3BvbnNlKSB7XG4gICd1c2Ugc3RlcCc7XG4gIHJldHVybiB0aGlzLnRleHQoKTtcbn1cbiIsICJpbXBvcnQgeyByZWdpc3RlclN0ZXBGdW5jdGlvbiB9IGZyb20gXCJ3b3JrZmxvdy9pbnRlcm5hbC9wcml2YXRlXCI7XG5pbXBvcnQgJ3NlcnZlci1vbmx5JztcbmltcG9ydCB7IGdldFJ1biwgcmVjb3JkQ2FsbGJhY2tBdHRlbXB0IH0gZnJvbSAnLi4vLi4vc3RvcmFnZS9ydW5zJztcbi8qKl9faW50ZXJuYWxfd29ya2Zsb3dze1wic3RlcHNcIjp7XCJsaWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL2NhbGxiYWNrLXN0ZXAudHNcIjp7XCJzZW5kQ2FsbGJhY2tTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvY2FsbGJhY2stc3RlcC8vc2VuZENhbGxiYWNrU3RlcFwifX19fSovO1xuLyoqXG4gKiBTZW5kIGNhbGxiYWNrIG5vdGlmaWNhdGlvbiB0byB3ZWJob29rIFVSTFxuICogUnVucyBhcyBhIGR1cmFibGUgc3RlcCB0byBlbnN1cmUgY2FsbGJhY2sgZGVsaXZlcnkgaXMgdHJhY2tlZFxuICogRmFpbHVyZXMgZG8gbm90IGJyZWFrIHRoZSBtYWluIHdvcmtmbG93XG4gKlxuICogQHBhcmFtIHJ1bklkIC0gVGhlIHJ1biBJRCB0byBzZW5kIGNhbGxiYWNrIGZvclxuICogQHBhcmFtIG9wdGlvbnMgLSBPcHRpb25hbCBjYWxsYmFjayBvcHRpb25zXG4gKiAgIC0gZHJhZnRFdmVudDogRXZlbnQgaWRlbnRpZmllciAoZS5nLiwgXCJyZXZpc2VkX2RyYWZ0X3JlYWR5XCIpXG4gKiAgIC0gY29tcGFjdFBheWxvYWQ6IElmIHRydWUsIG9taXQgZnVsbCBmaW5hbF9vdXRwdXRfanNvbiB0byByZWR1Y2UgcGF5bG9hZCBzaXplXG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNlbmRDYWxsYmFja1N0ZXAocnVuSWQsIG9wdGlvbnMpIHtcbiAgICB0cnkge1xuICAgICAgICAvLyBGZXRjaCBydW4gdG8gZ2V0IGNhbGxiYWNrIFVSTCBhbmQgZmluYWwgc3RhdGVcbiAgICAgICAgY29uc3QgcnVuID0gYXdhaXQgZ2V0UnVuKHJ1bklkKTtcbiAgICAgICAgaWYgKCFydW4pIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgW3YwXSBDYWxsYmFjazogUnVuICR7cnVuSWR9IG5vdCBmb3VuZGApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICghcnVuLmNhbGxiYWNrX3VybCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYFt2MF0gQ2FsbGJhY2s6IE5vIGNhbGxiYWNrIFVSTCBmb3IgcnVuICR7cnVuSWR9YCk7XG4gICAgICAgICAgICAvLyBSZWNvcmQgdGhhdCBjYWxsYmFjayB3YXMgbm90IGNvbmZpZ3VyZWRcbiAgICAgICAgICAgIGF3YWl0IHJlY29yZENhbGxiYWNrQXR0ZW1wdChydW5JZCwgJ25vdF9jb25maWd1cmVkJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gQ2FsbGJhY2s6IFNlbmRpbmcgbm90aWZpY2F0aW9uIHRvICR7cnVuLmNhbGxiYWNrX3VybH1gKTtcbiAgICAgICAgLy8gQnVpbGQgY2FsbGJhY2sgcGF5bG9hZFxuICAgICAgICBjb25zdCBjYWxsYmFja1BheWxvYWQgPSBidWlsZENhbGxiYWNrUGF5bG9hZChydW4sIG9wdGlvbnMpO1xuICAgICAgICAvLyBTZW5kIGNhbGxiYWNrIHdpdGggdGltZW91dCBwcm90ZWN0aW9uXG4gICAgICAgIGNvbnN0IGNvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgICAgIGNvbnN0IHRpbWVvdXRJZCA9IHNldFRpbWVvdXQoKCk9PmNvbnRyb2xsZXIuYWJvcnQoKSwgMzAwMDApOyAvLyAzMCBzZWNvbmQgdGltZW91dFxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChydW4uY2FsbGJhY2tfdXJsLCB7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShjYWxsYmFja1BheWxvYWQpLFxuICAgICAgICAgICAgICAgIHNpZ25hbDogY29udHJvbGxlci5zaWduYWxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgICAgICAgICBpZiAocmVzcG9uc2Uub2spIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBDYWxsYmFjazogU3VjY2Vzc2Z1bGx5IHNlbnQgZm9yIHJ1biAke3J1bklkfSwgc3RhdHVzICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xuICAgICAgICAgICAgICAgIC8vIFJlY29yZCBzdWNjZXNzZnVsIGNhbGxiYWNrXG4gICAgICAgICAgICAgICAgYXdhaXQgcmVjb3JkQ2FsbGJhY2tBdHRlbXB0KHJ1bklkLCAnc3VjY2VzcycsIHJlc3BvbnNlLnN0YXR1cyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IHN0YXR1c1RleHQgPSByZXNwb25zZS5zdGF0dXNUZXh0IHx8IGBIVFRQICR7cmVzcG9uc2Uuc3RhdHVzfWA7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBbdjBdIENhbGxiYWNrOiBXZWJob29rIHJldHVybmVkICR7cmVzcG9uc2Uuc3RhdHVzfSBmb3IgcnVuICR7cnVuSWR9YCk7XG4gICAgICAgICAgICAgICAgLy8gUmVjb3JkIGZhaWxlZCBjYWxsYmFjayB3aXRoIEhUVFAgc3RhdHVzXG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNc2cgPSBgV2ViaG9vayByZXR1cm5lZCAke3Jlc3BvbnNlLnN0YXR1c306ICR7c3RhdHVzVGV4dH1gO1xuICAgICAgICAgICAgICAgIGF3YWl0IHJlY29yZENhbGxiYWNrQXR0ZW1wdChydW5JZCwgJ2ZhaWxlZCcsIHJlc3BvbnNlLnN0YXR1cywgZXJyb3JNc2cpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChmZXRjaEVycm9yKSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcbiAgICAgICAgICAgIGxldCBlcnJvck1lc3NhZ2UgPSAnVW5rbm93biBuZXR3b3JrIGVycm9yJztcbiAgICAgICAgICAgIGlmIChmZXRjaEVycm9yIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgICAgICAgICBpZiAoZmV0Y2hFcnJvci5uYW1lID09PSAnQWJvcnRFcnJvcicpIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlID0gJ1JlcXVlc3QgdGltZW91dCAoMzBzKSc7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgW3YwXSBDYWxsYmFjazogUmVxdWVzdCB0aW1lb3V0ICgzMHMpIGZvciBydW4gJHtydW5JZH1gKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2UgPSBgTmV0d29yayBlcnJvcjogJHtmZXRjaEVycm9yLm1lc3NhZ2V9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBbdjBdIENhbGxiYWNrOiAke2Vycm9yTWVzc2FnZX0gZm9yIHJ1biAke3J1bklkfWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBbdjBdIENhbGxiYWNrOiBVbmtub3duIGVycm9yIGZvciBydW4gJHtydW5JZH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFJlY29yZCBmYWlsZWQgY2FsbGJhY2sgd2l0aCBlcnJvciBtZXNzYWdlIChubyBIVFRQIHN0YXR1cyBmb3IgbmV0d29yayBlcnJvcnMpXG4gICAgICAgICAgICBhd2FpdCByZWNvcmRDYWxsYmFja0F0dGVtcHQocnVuSWQsICdmYWlsZWQnLCB1bmRlZmluZWQsIGVycm9yTWVzc2FnZSk7XG4gICAgICAgIC8vIERvbid0IHRocm93IC0gY2FsbGJhY2sgZmFpbHVyZSBzaG91bGQgbm90IGZhaWwgdGhlIHdvcmtmbG93XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAvLyBMb2cgZXJyb3Igc2FmZWx5IHdpdGhvdXQgZXhwb3Npbmcgc2VjcmV0c1xuICAgICAgICBjb25zdCBlcnJvck1zZyA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgY29uc29sZS5lcnJvcihgW3YwXSBDYWxsYmFjazogVW5leHBlY3RlZCBlcnJvciBmb3IgcnVuICR7cnVuSWR9OiAke2Vycm9yTXNnfWApO1xuICAgIC8vIERvbid0IHRocm93IC0gY2FsbGJhY2sgZmFpbHVyZSBzaG91bGQgbm90IGZhaWwgdGhlIHdvcmtmbG93XG4gICAgfVxufVxuLyoqXG4gKiBCdWlsZCBjYWxsYmFjayBwYXlsb2FkIGJhc2VkIG9uIHJ1biBzdGF0dXMgYW5kIG9wdGlvbnNcbiAqLyBmdW5jdGlvbiBidWlsZENhbGxiYWNrUGF5bG9hZChydW4sIG9wdGlvbnMpIHtcbiAgICBjb25zdCBpc0NvbXBsZXRlZCA9IHJ1bi5zdGF0dXMgPT09ICdjb21wbGV0ZWQnO1xuICAgIGNvbnN0IGlzRmFpbGVkID0gcnVuLnN0YXR1cyA9PT0gJ2ZhaWxlZCc7XG4gICAgY29uc3QgY29tcGFjdFBheWxvYWQgPSBvcHRpb25zPy5jb21wYWN0UGF5bG9hZCA9PT0gdHJ1ZTtcbiAgICBpZiAoaXNDb21wbGV0ZWQpIHtcbiAgICAgICAgLy8gQmFzZSBwYXlsb2FkIGZvciBjb21wbGV0ZWQgcnVuc1xuICAgICAgICBjb25zdCBwYXlsb2FkID0ge1xuICAgICAgICAgICAgcnVuX2lkOiBydW4uaWQsXG4gICAgICAgICAgICBzdGF0dXM6ICdjb21wbGV0ZWQnLFxuICAgICAgICAgICAgYnVzaW5lc3NfbmFtZTogcnVuLmlucHV0X2pzb24/LmJ1c2luZXNzX25hbWUgfHwgbnVsbCxcbiAgICAgICAgICAgIGJsb2dfdG9waWM6IHJ1bi5pbnB1dF9qc29uPy5ibG9nX3RvcGljIHx8IHJ1bi5pbnB1dF9qc29uPy50b3BpYyB8fCBudWxsLFxuICAgICAgICAgICAgcmV2aWV3X3JlYWR5OiB0cnVlLFxuICAgICAgICAgICAgaHVtYW5fcmV2aWV3X3JlcXVpcmVkOiB0cnVlXG4gICAgICAgIH07XG4gICAgICAgIC8vIEFkZCBkcmFmdF9ldmVudCBpZiBwcm92aWRlZFxuICAgICAgICBpZiAob3B0aW9ucz8uZHJhZnRFdmVudCkge1xuICAgICAgICAgICAgcGF5bG9hZC5kcmFmdF9ldmVudCA9IG9wdGlvbnMuZHJhZnRFdmVudDtcbiAgICAgICAgfVxuICAgICAgICAvLyBFeHRyYWN0IHJldmlld19yb3VuZCBmcm9tIGludGVybmFsX3JldmlldyBpZiBhdmFpbGFibGVcbiAgICAgICAgY29uc3QgaW50ZXJuYWxSZXZpZXcgPSBydW4uZmluYWxfb3V0cHV0X2pzb24/LmludGVybmFsX3JldmlldztcbiAgICAgICAgaWYgKGludGVybmFsUmV2aWV3ICYmIHR5cGVvZiBpbnRlcm5hbFJldmlldyA9PT0gJ29iamVjdCcgJiYgJ3Jldmlld19yb3VuZCcgaW4gaW50ZXJuYWxSZXZpZXcpIHtcbiAgICAgICAgICAgIHBheWxvYWQucmV2aWV3X3JvdW5kID0gaW50ZXJuYWxSZXZpZXcucmV2aWV3X3JvdW5kO1xuICAgICAgICB9XG4gICAgICAgIC8vIEJ1aWxkIG91dHB1dHMgb2JqZWN0XG4gICAgICAgIGNvbnN0IG91dHB1dHMgPSB7XG4gICAgICAgICAgICBoYXNfcmVzZWFyY2hfanNvbjogISFydW4ucmVzZWFyY2hfanNvbixcbiAgICAgICAgICAgIGhhc19vdXRsaW5lX2pzb246ICEhcnVuLm91dGxpbmVfanNvbixcbiAgICAgICAgICAgIGhhc19kcmFmdF9tYXJrZG93bjogISFydW4uZHJhZnRfbWFya2Rvd24sXG4gICAgICAgICAgICBoYXNfb3B0aW1pemVkX2pzb246ICEhcnVuLm9wdGltaXplZF9qc29uLFxuICAgICAgICAgICAgaGFzX2ZpbmFsX291dHB1dF9qc29uOiAhIXJ1bi5maW5hbF9vdXRwdXRfanNvbixcbiAgICAgICAgICAgIGhhc19lZGl0ZWRfZHJhZnRfbWFya2Rvd246ICEhcnVuLmZpbmFsX291dHB1dF9qc29uPy5lZGl0ZWRfZHJhZnRfbWFya2Rvd24gJiYgcnVuLmZpbmFsX291dHB1dF9qc29uLmVkaXRlZF9kcmFmdF9tYXJrZG93bi5sZW5ndGggPiAwXG4gICAgICAgIH07XG4gICAgICAgIHBheWxvYWQub3V0cHV0cyA9IG91dHB1dHM7XG4gICAgICAgIC8vIEluY2x1ZGUgZnVsbCBmaW5hbF9vdXRwdXRfanNvbiBvbmx5IGlmIGNvbXBhY3QgcGF5bG9hZCBpcyBub3QgcmVxdWVzdGVkXG4gICAgICAgIGlmICghY29tcGFjdFBheWxvYWQpIHtcbiAgICAgICAgICAgIHBheWxvYWQuZmluYWxfb3V0cHV0X2pzb24gPSBydW4uZmluYWxfb3V0cHV0X2pzb247XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBheWxvYWQ7XG4gICAgfSBlbHNlIGlmIChpc0ZhaWxlZCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcnVuX2lkOiBydW4uaWQsXG4gICAgICAgICAgICBzdGF0dXM6ICdmYWlsZWQnLFxuICAgICAgICAgICAgYnVzaW5lc3NfbmFtZTogcnVuLmlucHV0X2pzb24/LmJ1c2luZXNzX25hbWUgfHwgbnVsbCxcbiAgICAgICAgICAgIGJsb2dfdG9waWM6IHJ1bi5pbnB1dF9qc29uPy5ibG9nX3RvcGljIHx8IHJ1bi5pbnB1dF9qc29uPy50b3BpYyB8fCBudWxsLFxuICAgICAgICAgICAgcmV2aWV3X3JlYWR5OiBmYWxzZSxcbiAgICAgICAgICAgIGh1bWFuX3Jldmlld19yZXF1aXJlZDogdHJ1ZSxcbiAgICAgICAgICAgIGVycm9yX21lc3NhZ2U6IHJ1bi5lcnJvcl9tZXNzYWdlIHx8ICdVbmtub3duIGVycm9yJ1xuICAgICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFNob3VsZG4ndCBoYXBwZW4sIGJ1dCBoYW5kbGUgZ3JhY2VmdWxseVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcnVuX2lkOiBydW4uaWQsXG4gICAgICAgICAgICBzdGF0dXM6IHJ1bi5zdGF0dXMsXG4gICAgICAgICAgICBidXNpbmVzc19uYW1lOiBydW4uaW5wdXRfanNvbj8uYnVzaW5lc3NfbmFtZSB8fCBudWxsLFxuICAgICAgICAgICAgYmxvZ190b3BpYzogcnVuLmlucHV0X2pzb24/LmJsb2dfdG9waWMgfHwgcnVuLmlucHV0X2pzb24/LnRvcGljIHx8IG51bGxcbiAgICAgICAgfTtcbiAgICB9XG59XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9jYWxsYmFjay1zdGVwLy9zZW5kQ2FsbGJhY2tTdGVwXCIsIHNlbmRDYWxsYmFja1N0ZXApO1xuIiwgImltcG9ydCB7IHJlZ2lzdGVyU3RlcEZ1bmN0aW9uIH0gZnJvbSBcIndvcmtmbG93L2ludGVybmFsL3ByaXZhdGVcIjtcbmltcG9ydCAnc2VydmVyLW9ubHknO1xuaW1wb3J0IHsgZ2VuZXJhdGVUZXh0IH0gZnJvbSAnYWknO1xuaW1wb3J0IHsgb3BlbmFpIH0gZnJvbSAnQGFpLXNkay9vcGVuYWknO1xuaW1wb3J0IHsgZ2V0QWdlbnRDb25maWcgfSBmcm9tICcuLi8uLi9zdG9yYWdlL2FnZW50LWNvbmZpZ3MnO1xuaW1wb3J0IHsgYnVpbGRGdWxsSW5wdXRDb250ZXh0IH0gZnJvbSAnLi9jb250ZXh0LWJ1aWxkZXInO1xuLyoqX19pbnRlcm5hbF93b3JrZmxvd3N7XCJzdGVwc1wiOntcImxpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvZWRpdG9yLXN0ZXAudHNcIjp7XCJydW5FZGl0b3JTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvZWRpdG9yLXN0ZXAvL3J1bkVkaXRvclN0ZXBcIn19fX0qLztcbi8qKlxuICogRWRpdG9yIEFnZW50IFN0ZXBcbiAqIEltcHJvdmVzIHRoZSBkcmFmdCBiYXNlZCBvbiBTRU8gUUEgcmVjb21tZW5kYXRpb25zIGFuZCBicmFuZCBndWlkZWxpbmVzLlxuICogREIgcHJvbXB0IGNvbnRyYWN0OiBtb2RlbCByZXR1cm5zIE1hcmtkb3duIG9ubHkuXG4gKiBEb2VzIE5PVCBvdmVyd3JpdGUgb3JpZ2luYWwgZHJhZnRfbWFya2Rvd247IGVkaXRlZCBvdXRwdXQgZ29lcyB0byBmaW5hbF9vdXRwdXRfanNvbi5cbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gcnVuRWRpdG9yU3RlcChydW5JZCwgaW5wdXQsIHJlc2VhcmNoLCBvdXRsaW5lLCBvcmlnaW5hbERyYWZ0LCBzZW9RYSkge1xuICAgIGNvbnNvbGUubG9nKGBbdjBdIEVkaXRvciBzdGVwOiBTdGFydGluZyBmb3IgcnVuICR7cnVuSWR9YCk7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgYWdlbnRDb25maWcgPSBhd2FpdCBnZXRBZ2VudENvbmZpZygnZWRpdG9yJyk7XG4gICAgICAgIGlmICghYWdlbnRDb25maWcpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQWN0aXZlIGFnZW50IGNvbmZpZyBub3QgZm91bmQgZm9yIGFnZW50X2tleTogZWRpdG9yJyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gU0VPIEJsb2cgQWdlbnQgQ29uZmlnIExvYWRlZDogZWRpdG9yIHYke2FnZW50Q29uZmlnLnZlcnNpb259YCk7XG4gICAgICAgIGNvbnN0IHN5c3RlbVByb21wdCA9IFtcbiAgICAgICAgICAgIGFnZW50Q29uZmlnLnN5c3RlbV9wcm9tcHQsXG4gICAgICAgICAgICBhZ2VudENvbmZpZy5za2lsbF9tYXJrZG93blxuICAgICAgICBdLmZpbHRlcihCb29sZWFuKS5qb2luKCdcXG5cXG4nKTtcbiAgICAgICAgY29uc3QgZWRpdG9yQ29udGV4dCA9IGJ1aWxkRWRpdG9yQ29udGV4dChpbnB1dCwgcmVzZWFyY2gsIG91dGxpbmUsIHNlb1FhKTtcbiAgICAgICAgY29uc3QgbW9kZWxOYW1lID0gYWdlbnRDb25maWcubW9kZWwgfHwgcHJvY2Vzcy5lbnYuRURJVE9SX0FHRU5UX01PREVMIHx8ICdncHQtNS40LW1pbmknO1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBFZGl0b3Igc3RlcDogVXNpbmcgbW9kZWw6ICR7bW9kZWxOYW1lfWApO1xuICAgICAgICBjb25zdCB7IHRleHQgfSA9IGF3YWl0IGdlbmVyYXRlVGV4dCh7XG4gICAgICAgICAgICBtb2RlbDogb3BlbmFpKG1vZGVsTmFtZSksXG4gICAgICAgICAgICB0ZW1wZXJhdHVyZTogMC42LFxuICAgICAgICAgICAgbWF4T3V0cHV0VG9rZW5zOiA4MDAwLFxuICAgICAgICAgICAgc3lzdGVtOiBzeXN0ZW1Qcm9tcHQsXG4gICAgICAgICAgICBtZXNzYWdlczogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcm9sZTogJ3VzZXInLFxuICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBgRWRpdCB0aGUgZHJhZnQgYmVsb3cgdXNpbmcgdGhlIHN1cHBsaWVkIGNvbnRleHQgYW5kIFNFTyBRQSBmZWVkYmFjay5cXG5cXG4ke2J1aWxkRnVsbElucHV0Q29udGV4dChpbnB1dCl9XFxuXFxuUmVzZWFyY2ggQWdlbnQgT3V0cHV0OlxcbiR7SlNPTi5zdHJpbmdpZnkocmVzZWFyY2gsIG51bGwsIDIpfVxcblxcbk91dGxpbmUgQWdlbnQgT3V0cHV0OlxcbiR7SlNPTi5zdHJpbmdpZnkob3V0bGluZSwgbnVsbCwgMil9XFxuXFxuU0VPIFFBIEZlZWRiYWNrOlxcbiR7ZWRpdG9yQ29udGV4dH1cXG5cXG5PcmlnaW5hbCBEcmFmdCBNYXJrZG93bjpcXG4ke29yaWdpbmFsRHJhZnR9XFxuXFxuUmV0dXJuIHRoZSBlZGl0ZWQgYmxvZyBpbiBNYXJrZG93biBvbmx5LiBEbyBub3QgcmV0dXJuIEpTT04uIERvIG5vdCBpbmNsdWRlIGV4cGxhbmF0aW9ucywgZWRpdG9yIG5vdGVzLCBtYXJrZG93biBmZW5jZXMsIG9yIGNvbW1lbnRzIG91dHNpZGUgdGhlIGFydGljbGUuYFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF1cbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IGVkaXRlZERyYWZ0ID0gdGV4dC50cmltKCk7XG4gICAgICAgIGlmICghZWRpdGVkRHJhZnQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRWRpdG9yIG91dHB1dCB3YXMgZW1wdHknKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZWRpdGVkRHJhZnQuc3RhcnRzV2l0aCgneycpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0VkaXRvciBvdXRwdXQgaW52YWxpZDogZXhwZWN0ZWQgTWFya2Rvd24sIHJlY2VpdmVkIEpTT04tbGlrZSByZXNwb25zZScpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlZGl0ZWREcmFmdC5sZW5ndGggPCBNYXRoLm1pbig1MDAsIE1hdGguZmxvb3Iob3JpZ2luYWxEcmFmdC5sZW5ndGggKiAwLjQpKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFZGl0b3Igb3V0cHV0IHRvbyBzaG9ydCBjb21wYXJlZCB3aXRoIG9yaWdpbmFsIGRyYWZ0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZWRpdG9yT3V0cHV0ID0ge1xuICAgICAgICAgICAgZWRpdGVkX2RyYWZ0X21hcmtkb3duOiBlZGl0ZWREcmFmdCxcbiAgICAgICAgICAgIGVkaXRvcl9ub3RlczogW1xuICAgICAgICAgICAgICAgICdFZGl0b3IgQWdlbnQgcmV0dXJuZWQgTWFya2Rvd24gb25seSBhcyByZXF1aXJlZCBieSB0aGUgYWN0aXZlIERCIHByb21wdC4nXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgY2hhbmdlc19tYWRlOiBzZW9RYS5wcmlvcml0eV9maXhlcyB8fCBbXSxcbiAgICAgICAgICAgIGh1bWFuX3Jldmlld19yZXF1aXJlZDogdHJ1ZVxuICAgICAgICB9O1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBFZGl0b3Igc3RlcDogR2VuZXJhdGVkIGVkaXRlZCBkcmFmdCAoJHtlZGl0b3JPdXRwdXQuZWRpdGVkX2RyYWZ0X21hcmtkb3duLmxlbmd0aH0gY2hhcnMpYCk7XG4gICAgICAgIHJldHVybiBlZGl0b3JPdXRwdXQ7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICBjb25zb2xlLmVycm9yKGBbdjBdIEVkaXRvciBzdGVwIGVycm9yOiAke2Vycm9yTWVzc2FnZX1gKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxufVxuZnVuY3Rpb24gYnVpbGRFZGl0b3JDb250ZXh0KGlucHV0LCByZXNlYXJjaCwgb3V0bGluZSwgc2VvUWEpIHtcbiAgICBjb25zdCBzZWN0aW9ucyA9IFtdO1xuICAgIHNlY3Rpb25zLnB1c2goJyMjIFNFTyBQZXJmb3JtYW5jZSBTdW1tYXJ5Jyk7XG4gICAgc2VjdGlvbnMucHVzaChgT3ZlcmFsbCBTY29yZTogJHtzZW9RYS5vdmVyYWxsX3Njb3JlfS8xMDBgKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBSZWFkeSBGb3IgRWRpdG9yOiAke3Nlb1FhLnJlYWR5X2Zvcl9lZGl0b3J9YCk7XG4gICAgc2VjdGlvbnMucHVzaChgUmVjb21tZW5kZWQgTmV4dCBBY3Rpb246ICR7c2VvUWEucmVjb21tZW5kZWRfbmV4dF9hY3Rpb259YCk7XG4gICAgc2VjdGlvbnMucHVzaChgTmVlZHMgUmV2aWV3OiAke3Nlb1FhLm5lZWRzX3Jldmlld31gKTtcbiAgICBzZWN0aW9ucy5wdXNoKCdcXG4jIyBTZWFyY2ggSW50ZW50IEFsaWdubWVudCcpO1xuICAgIHNlY3Rpb25zLnB1c2goYFNjb3JlOiAke3Nlb1FhLnNlYXJjaF9pbnRlbnRfYWxpZ25tZW50LnNjb3JlfS8xMDBgKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBBbmFseXNpczogJHtzZW9RYS5zZWFyY2hfaW50ZW50X2FsaWdubWVudC5hbmFseXNpc31gKTtcbiAgICBzZWN0aW9ucy5wdXNoKCdcXG4jIyBQcmltYXJ5IEtleXdvcmQgVXNhZ2UnKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBTY29yZTogJHtzZW9RYS5wcmltYXJ5X2tleXdvcmRfdXNhZ2Uuc2NvcmV9LzEwMGApO1xuICAgIHNlY3Rpb25zLnB1c2goYE9jY3VycmVuY2VzOiAke3Nlb1FhLnByaW1hcnlfa2V5d29yZF91c2FnZS5vY2N1cnJlbmNlc30gdGltZXNgKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBQbGFjZW1lbnQ6ICR7c2VvUWEucHJpbWFyeV9rZXl3b3JkX3VzYWdlLnBsYWNlbWVudF9hbmFseXNpc31gKTtcbiAgICBzZWN0aW9ucy5wdXNoKCdcXG4jIyBTZWNvbmRhcnkgS2V5d29yZHMnKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBTY29yZTogJHtzZW9RYS5zZWNvbmRhcnlfa2V5d29yZF91c2FnZS5zY29yZX0vMTAwYCk7XG4gICAgc2VjdGlvbnMucHVzaChgQ292ZXJlZDogJHtzZW9RYS5zZWNvbmRhcnlfa2V5d29yZF91c2FnZS5rZXl3b3Jkc19jb3ZlcmVkLmpvaW4oJywgJykgfHwgJ05vbmUnfWApO1xuICAgIGlmIChzZW9RYS5zZWNvbmRhcnlfa2V5d29yZF91c2FnZS5nYXBzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgc2VjdGlvbnMucHVzaChgR2FwczogJHtzZW9RYS5zZWNvbmRhcnlfa2V5d29yZF91c2FnZS5nYXBzLmpvaW4oJywgJyl9YCk7XG4gICAgfVxuICAgIHNlY3Rpb25zLnB1c2goJ1xcbiMjIEhlYWRpbmcgU3RydWN0dXJlJyk7XG4gICAgc2VjdGlvbnMucHVzaChgU2NvcmU6ICR7c2VvUWEuaGVhZGluZ19zdHJ1Y3R1cmVfcmV2aWV3LnNjb3JlfS8xMDBgKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBIMSBQcmVzZW50OiAke3Nlb1FhLmhlYWRpbmdfc3RydWN0dXJlX3Jldmlldy5oMV9wcmVzZW50fWApO1xuICAgIHNlY3Rpb25zLnB1c2goYEgyIENvdW50OiAke3Nlb1FhLmhlYWRpbmdfc3RydWN0dXJlX3Jldmlldy5oMl9jb3VudH1gKTtcbiAgICBpZiAoc2VvUWEuaGVhZGluZ19zdHJ1Y3R1cmVfcmV2aWV3LmhpZXJhcmNoeV9pc3N1ZXMubGVuZ3RoID4gMCkge1xuICAgICAgICBzZWN0aW9ucy5wdXNoKGBJc3N1ZXM6ICR7c2VvUWEuaGVhZGluZ19zdHJ1Y3R1cmVfcmV2aWV3LmhpZXJhcmNoeV9pc3N1ZXMuam9pbignOyAnKX1gKTtcbiAgICB9XG4gICAgc2VjdGlvbnMucHVzaCgnXFxuIyMgQ29udGVudCBEZXB0aCcpO1xuICAgIHNlY3Rpb25zLnB1c2goYFNjb3JlOiAke3Nlb1FhLmNvbnRlbnRfZGVwdGhfcmV2aWV3LnNjb3JlfS8xMDBgKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBXb3JkIENvdW50OiAke3Nlb1FhLmNvbnRlbnRfZGVwdGhfcmV2aWV3LndvcmRfY291bnR9IHdvcmRzYCk7XG4gICAgc2VjdGlvbnMucHVzaChgQ292ZXJhZ2U6ICR7c2VvUWEuY29udGVudF9kZXB0aF9yZXZpZXcuc2VjdGlvbl9jb3ZlcmFnZX1gKTtcbiAgICBpZiAoc2VvUWEuY29udGVudF9kZXB0aF9yZXZpZXcuZGVwdGhfaXNzdWVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgc2VjdGlvbnMucHVzaChgSXNzdWVzOiAke3Nlb1FhLmNvbnRlbnRfZGVwdGhfcmV2aWV3LmRlcHRoX2lzc3Vlcy5qb2luKCc7ICcpfWApO1xuICAgIH1cbiAgICBzZWN0aW9ucy5wdXNoKCdcXG4jIyBSZWFkYWJpbGl0eScpO1xuICAgIHNlY3Rpb25zLnB1c2goYFNjb3JlOiAke3Nlb1FhLnJlYWRhYmlsaXR5X3Jldmlldy5zY29yZX0vMTAwYCk7XG4gICAgc2VjdGlvbnMucHVzaChgQXZnIFNlbnRlbmNlIExlbmd0aDogJHtzZW9RYS5yZWFkYWJpbGl0eV9yZXZpZXcuYXZnX3NlbnRlbmNlX2xlbmd0aH0gd29yZHNgKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBSZWFkaW5nIExldmVsOiAke3Nlb1FhLnJlYWRhYmlsaXR5X3Jldmlldy5mbGVzY2hfa2luY2FpZF9lc3RpbWF0ZX1gKTtcbiAgICBpZiAoc2VvUWEucmVhZGFiaWxpdHlfcmV2aWV3LnJlYWRhYmlsaXR5X2lzc3Vlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHNlY3Rpb25zLnB1c2goYElzc3VlczogJHtzZW9RYS5yZWFkYWJpbGl0eV9yZXZpZXcucmVhZGFiaWxpdHlfaXNzdWVzLmpvaW4oJzsgJyl9YCk7XG4gICAgfVxuICAgIHNlY3Rpb25zLnB1c2goJ1xcbiMjIENUQSBSZXZpZXcnKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBTY29yZTogJHtzZW9RYS5jdGFfcmV2aWV3LnNjb3JlfS8xMDBgKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBDVEEgUHJlc2VudDogJHtzZW9RYS5jdGFfcmV2aWV3LmN0YV9wcmVzZW50fWApO1xuICAgIHNlY3Rpb25zLnB1c2goYENUQSBBbmFseXNpczogJHtzZW9RYS5jdGFfcmV2aWV3LmN0YV9hbmFseXNpc31gKTtcbiAgICBzZWN0aW9ucy5wdXNoKCdcXG4jIyBJbnRlcm5hbCBMaW5raW5nJyk7XG4gICAgc2VjdGlvbnMucHVzaChgU2NvcmU6ICR7c2VvUWEuaW50ZXJuYWxfbGlua2luZ19yZXZpZXcuc2NvcmV9LzEwMGApO1xuICAgIHNlY3Rpb25zLnB1c2goYExpbmtzIEZvdW5kOiAke3Nlb1FhLmludGVybmFsX2xpbmtpbmdfcmV2aWV3LmludGVybmFsX2xpbmtzX2ZvdW5kfWApO1xuICAgIGlmIChzZW9RYS5pbnRlcm5hbF9saW5raW5nX3Jldmlldy5pbnRlcm5hbF9saW5rX3JlY29tbWVuZGF0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHNlY3Rpb25zLnB1c2goYFJlY29tbWVuZGF0aW9uczogJHtzZW9RYS5pbnRlcm5hbF9saW5raW5nX3Jldmlldy5pbnRlcm5hbF9saW5rX3JlY29tbWVuZGF0aW9ucy5qb2luKCc7ICcpfWApO1xuICAgIH1cbiAgICBzZWN0aW9ucy5wdXNoKCdcXG4jIyBDbGllbnQgR29hbCBBbGlnbm1lbnQnKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBTY29yZTogJHtzZW9RYS5jbGllbnRfZ29hbF9hbGlnbm1lbnQuc2NvcmV9LzEwMGApO1xuICAgIHNlY3Rpb25zLnB1c2goYEFuYWx5c2lzOiAke3Nlb1FhLmNsaWVudF9nb2FsX2FsaWdubWVudC5hbmFseXNpc31gKTtcbiAgICBpZiAoc2VvUWEucHJpb3JpdHlfZml4ZXMubGVuZ3RoID4gMCkge1xuICAgICAgICBzZWN0aW9ucy5wdXNoKCdcXG4jIyBQcmlvcml0eSBGaXhlcycpO1xuICAgICAgICBzZWN0aW9ucy5wdXNoKHNlb1FhLnByaW9yaXR5X2ZpeGVzLm1hcCgoZml4KT0+YC0gJHtmaXh9YCkuam9pbignXFxuJykpO1xuICAgIH1cbiAgICBpZiAoc2VvUWEucmlza19mbGFncy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHNlY3Rpb25zLnB1c2goJ1xcbiMjIFJpc2sgRmxhZ3MnKTtcbiAgICAgICAgc2VjdGlvbnMucHVzaChzZW9RYS5yaXNrX2ZsYWdzLm1hcCgoZmxhZyk9PmAtICR7ZmxhZ31gKS5qb2luKCdcXG4nKSk7XG4gICAgfVxuICAgIHNlY3Rpb25zLnB1c2goJ1xcbiMjIFJlc2VhcmNoIE5vdGVzJyk7XG4gICAgc2VjdGlvbnMucHVzaChgQ29udGVudCBBbmdsZTogJHtyZXNlYXJjaC5jb250ZW50X2FuZ2xlfWApO1xuICAgIHNlY3Rpb25zLnB1c2goYENsaWVudCBHb2FsIEFsaWdubWVudDogJHtyZXNlYXJjaC5jbGllbnRfZ29hbF9hbGlnbm1lbnR9YCk7XG4gICAgc2VjdGlvbnMucHVzaCgnXFxuIyMgT3V0bGluZSBOb3RlcycpO1xuICAgIHNlY3Rpb25zLnB1c2goYFRpdGxlOiAke291dGxpbmUudGl0bGV9YCk7XG4gICAgc2VjdGlvbnMucHVzaChgQ1RBIEd1aWRhbmNlOiAke291dGxpbmUuY3RhX2d1aWRhbmNlfWApO1xuICAgIHNlY3Rpb25zLnB1c2goJ1xcbiMjIEFkZGl0aW9uYWwgQ2xpZW50IEd1aWRhbmNlJyk7XG4gICAgaWYgKGlucHV0LmN0YV9ub3RlcyB8fCBpbnB1dC5jdGEgfHwgaW5wdXQuYmxvZ19jb250ZXh0X2JyaWVmPy5jdGEpIHtcbiAgICAgICAgc2VjdGlvbnMucHVzaChgQ1RBIE5vdGVzOiAke2lucHV0LmJsb2dfY29udGV4dF9icmllZj8uY3RhIHx8IGlucHV0LmN0YSB8fCBpbnB1dC5jdGFfbm90ZXN9YCk7XG4gICAgfVxuICAgIGlmIChpbnB1dC5icmFuZF92b2ljZV9ub3RlcyB8fCBpbnB1dC5ibG9nX2NvbnRleHRfYnJpZWY/LmJyYW5kX3ZvaWNlX25vdGVzIHx8IGlucHV0LnRvbmUpIHtcbiAgICAgICAgc2VjdGlvbnMucHVzaChgQnJhbmQgVm9pY2U6ICR7aW5wdXQuYmxvZ19jb250ZXh0X2JyaWVmPy5icmFuZF92b2ljZV9ub3RlcyB8fCBpbnB1dC5icmFuZF92b2ljZV9ub3RlcyB8fCBpbnB1dC50b25lfWApO1xuICAgIH1cbiAgICBpZiAoaW5wdXQuYXVkaWVuY2Vfbm90ZXMgfHwgaW5wdXQudGFyZ2V0X2F1ZGllbmNlIHx8IGlucHV0LmJsb2dfY29udGV4dF9icmllZj8udGFyZ2V0X2F1ZGllbmNlKSB7XG4gICAgICAgIHNlY3Rpb25zLnB1c2goYFRhcmdldCBBdWRpZW5jZTogJHtpbnB1dC5ibG9nX2NvbnRleHRfYnJpZWY/LnRhcmdldF9hdWRpZW5jZSB8fCBpbnB1dC50YXJnZXRfYXVkaWVuY2UgfHwgaW5wdXQuYXVkaWVuY2Vfbm90ZXN9YCk7XG4gICAgfVxuICAgIHJldHVybiBzZWN0aW9ucy5qb2luKCdcXG4nKTtcbn1cbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL2VkaXRvci1zdGVwLy9ydW5FZGl0b3JTdGVwXCIsIHJ1bkVkaXRvclN0ZXApO1xuIiwgImltcG9ydCB7IHJlZ2lzdGVyU3RlcEZ1bmN0aW9uIH0gZnJvbSBcIndvcmtmbG93L2ludGVybmFsL3ByaXZhdGVcIjtcbmltcG9ydCAnc2VydmVyLW9ubHknO1xuaW1wb3J0IHsgdXBkYXRlUnVuU3RhdHVzLCB1cGRhdGVSdW5FcnJvciwgY29tcGxldGVSdW4gfSBmcm9tICcuLi8uLi9zdG9yYWdlL3J1bnMnO1xuLyoqX19pbnRlcm5hbF93b3JrZmxvd3N7XCJzdGVwc1wiOntcImxpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvaGVscGVycy50c1wiOntcImNvbXBsZXRlUnVuU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL2hlbHBlcnMvL2NvbXBsZXRlUnVuU3RlcFwifSxcIm1hcmtSdW5GYWlsZWRTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvaGVscGVycy8vbWFya1J1bkZhaWxlZFN0ZXBcIn0sXCJtYXJrUnVuUnVubmluZ1N0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9oZWxwZXJzLy9tYXJrUnVuUnVubmluZ1N0ZXBcIn19fX0qLztcbi8qKlxuICogTWFyayBhIHJ1biBhcyBydW5uaW5nICh0cmFuc2l0aW9uIGZyb20gcXVldWVkIHRvIHJ1bm5pbmcpXG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG1hcmtSdW5SdW5uaW5nU3RlcChydW5JZCkge1xuICAgIGNvbnNvbGUubG9nKGBbdjBdIEhlbHBlcjogTWFya2luZyBydW4gJHtydW5JZH0gYXMgcnVubmluZ2ApO1xuICAgIGF3YWl0IHVwZGF0ZVJ1blN0YXR1cyhydW5JZCwgJ3Jlc2VhcmNoaW5nJyk7XG59XG4vKipcbiAqIE1hcmsgYSBydW4gYXMgZmFpbGVkIHdpdGggZXJyb3IgbWVzc2FnZVxuICogQ2FsbGJhY2sgaXMgc2VudCBieSB3b3JrZmxvdyBvcmNoZXN0cmF0b3IsIG5vdCBoZXJlXG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG1hcmtSdW5GYWlsZWRTdGVwKHJ1bklkLCBlcnJvck1lc3NhZ2UpIHtcbiAgICBjb25zb2xlLmxvZyhgW3YwXSBIZWxwZXI6IE1hcmtpbmcgcnVuICR7cnVuSWR9IGFzIGZhaWxlZCB3aXRoIGVycm9yOiAke2Vycm9yTWVzc2FnZX1gKTtcbiAgICBhd2FpdCB1cGRhdGVSdW5FcnJvcihydW5JZCwgZXJyb3JNZXNzYWdlKTtcbn1cbi8qKlxuICogQ29tcGxldGUgYSBydW4gd2l0aCBmaW5hbCBvdXRwdXRcbiAqIENhbGxiYWNrIGlzIHNlbnQgYnkgd29ya2Zsb3cgb3JjaGVzdHJhdG9yLCBub3QgaGVyZVxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBjb21wbGV0ZVJ1blN0ZXAocnVuSWQsIGZpbmFsT3V0cHV0KSB7XG4gICAgY29uc29sZS5sb2coYFt2MF0gSGVscGVyOiBDb21wbGV0aW5nIHJ1biAke3J1bklkfWApO1xuICAgIGF3YWl0IGNvbXBsZXRlUnVuKHJ1bklkLCBmaW5hbE91dHB1dCk7XG59XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9oZWxwZXJzLy9tYXJrUnVuUnVubmluZ1N0ZXBcIiwgbWFya1J1blJ1bm5pbmdTdGVwKTtcbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL2hlbHBlcnMvL21hcmtSdW5GYWlsZWRTdGVwXCIsIG1hcmtSdW5GYWlsZWRTdGVwKTtcbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL2hlbHBlcnMvL2NvbXBsZXRlUnVuU3RlcFwiLCBjb21wbGV0ZVJ1blN0ZXApO1xuIiwgImltcG9ydCB7IHJlZ2lzdGVyU3RlcEZ1bmN0aW9uIH0gZnJvbSBcIndvcmtmbG93L2ludGVybmFsL3ByaXZhdGVcIjtcbmltcG9ydCAnc2VydmVyLW9ubHknO1xuaW1wb3J0IHsgZ2VuZXJhdGVUZXh0IH0gZnJvbSAnYWknO1xuaW1wb3J0IHsgb3BlbmFpIH0gZnJvbSAnQGFpLXNkay9vcGVuYWknO1xuaW1wb3J0IHsgZ2V0QWdlbnRDb25maWcgfSBmcm9tICcuLi8uLi9zdG9yYWdlL2FnZW50LWNvbmZpZ3MnO1xuaW1wb3J0IHsgYnVpbGRGdWxsSW5wdXRDb250ZXh0LCBleHRyYWN0SnNvbk9iamVjdCB9IGZyb20gJy4vY29udGV4dC1idWlsZGVyJztcbi8qKl9faW50ZXJuYWxfd29ya2Zsb3dze1wic3RlcHNcIjp7XCJsaWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL21ldGEtc3RlcC50c1wiOntcInJ1bk1ldGFTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvbWV0YS1zdGVwLy9ydW5NZXRhU3RlcFwifX19fSovO1xuLyoqXG4gKiBNZXRhIEFnZW50IFN0ZXAgLSBQaGFzZSAyQy1GXG4gKiBHZW5lcmF0ZXMgU0VPIG1ldGFkYXRhIGZvciBodW1hbiByZXZpZXdcbiAqIERvZXMgTk9UIHB1Ymxpc2gsIGNhbGwgZXh0ZXJuYWwgc2VydmljZXMsIG9yIG92ZXJ3cml0ZSBkcmFmdHNcbiAqIE91dHB1dCBnb2VzIHRvIGZpbmFsX291dHB1dF9qc29uIGFzIG1ldGFfanNvblxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5NZXRhU3RlcChydW5JZCwgaW5wdXQsIHJlc2VhcmNoLCBvdXRsaW5lLCBvcmlnaW5hbERyYWZ0LCBzZW9RYSwgZWRpdGVkRHJhZnQpIHtcbiAgICBjb25zb2xlLmxvZyhgW3YwXSBNZXRhIHN0ZXA6IFN0YXJ0aW5nIGZvciBydW4gJHtydW5JZH1gKTtcbiAgICB0cnkge1xuICAgICAgICAvLyBMb2FkIGFnZW50IGNvbmZpZyBmcm9tIGRhdGFiYXNlXG4gICAgICAgIGNvbnN0IGFnZW50Q29uZmlnID0gYXdhaXQgZ2V0QWdlbnRDb25maWcoJ21ldGEnKTtcbiAgICAgICAgaWYgKCFhZ2VudENvbmZpZykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBY3RpdmUgYWdlbnQgY29uZmlnIG5vdCBmb3VuZCBmb3IgYWdlbnRfa2V5OiBtZXRhJyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gU0VPIEJsb2cgQWdlbnQgQ29uZmlnIExvYWRlZDogbWV0YSB2JHthZ2VudENvbmZpZy52ZXJzaW9ufWApO1xuICAgICAgICAvLyBCdWlsZCBzeXN0ZW0gcHJvbXB0IGZyb20gZGF0YWJhc2UgY29uZmlnXG4gICAgICAgIGNvbnN0IHN5c3RlbVByb21wdCA9IFtcbiAgICAgICAgICAgIGFnZW50Q29uZmlnLnN5c3RlbV9wcm9tcHQsXG4gICAgICAgICAgICBhZ2VudENvbmZpZy5za2lsbF9tYXJrZG93blxuICAgICAgICBdLmZpbHRlcihCb29sZWFuKS5qb2luKCdcXG5cXG4nKTtcbiAgICAgICAgLy8gQnVpbGQgY29udGV4dCBmb3IgbWV0YSBnZW5lcmF0aW9uXG4gICAgICAgIGNvbnN0IG1ldGFDb250ZXh0ID0gYnVpbGRNZXRhQ29udGV4dChpbnB1dCwgcmVzZWFyY2gsIG91dGxpbmUsIHNlb1FhLCBvcmlnaW5hbERyYWZ0LCBlZGl0ZWREcmFmdCk7XG4gICAgICAgIC8vIEdldCBtb2RlbCBuYW1lOiB1c2UgREIgY29uZmlnIGlmIGF2YWlsYWJsZSwgb3RoZXJ3aXNlIGZhbGwgYmFjayB0byBlbnYgdmFyIG9yIGRlZmF1bHRcbiAgICAgICAgY29uc3QgbW9kZWxOYW1lID0gYWdlbnRDb25maWcubW9kZWwgfHwgcHJvY2Vzcy5lbnYuTUVUQV9BR0VOVF9NT0RFTCB8fCAnZ3B0LTUuNC1taW5pJztcbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gTWV0YSBzdGVwOiBVc2luZyBtb2RlbDogJHttb2RlbE5hbWV9YCk7XG4gICAgICAgIC8vIEdlbmVyYXRlIG1ldGFkYXRhXG4gICAgICAgIGNvbnN0IHsgdGV4dDogbWV0YUFuYWx5c2lzIH0gPSBhd2FpdCBnZW5lcmF0ZVRleHQoe1xuICAgICAgICAgICAgbW9kZWw6IG9wZW5haShtb2RlbE5hbWUpLFxuICAgICAgICAgICAgc3lzdGVtOiBzeXN0ZW1Qcm9tcHQsXG4gICAgICAgICAgICB0ZW1wZXJhdHVyZTogMC41LFxuICAgICAgICAgICAgbWVzc2FnZXM6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHJvbGU6ICd1c2VyJyxcbiAgICAgICAgICAgICAgICAgICAgY29udGVudDogbWV0YUNvbnRleHRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBNZXRhIHN0ZXA6IFJlY2VpdmVkIGFuYWx5c2lzLCBwYXJzaW5nIEpTT05gKTtcbiAgICAgICAgLy8gUGFyc2UgdGhlIHJlc3BvbnNlIC0gRkFJTC1MT1VEIGluIHByb2R1Y3Rpb25cbiAgICAgICAgbGV0IG1ldGFPdXRwdXQ7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBtZXRhT3V0cHV0ID0gSlNPTi5wYXJzZShleHRyYWN0SnNvbk9iamVjdChtZXRhQW5hbHlzaXMpKTtcbiAgICAgICAgfSBjYXRjaCAocGFyc2VFcnJvcikge1xuICAgICAgICAgICAgLy8gUFJPRFVDVElPTiBNT0RFOiBBbHdheXMgZmFpbCBsb3VkIG9uIHBhcnNlIGVycm9ycy5cbiAgICAgICAgICAgIC8vIEZhbGxiYWNrIGlzIG5vdCB1c2VkIGluIG5vcm1hbCB3b3JrZmxvdyAtIHRoaXMgZW5zdXJlcyBBSSBtb2RlbCBzY2hlbWEgY29tcGxpYW5jZS5cbiAgICAgICAgICAgIGNvbnN0IGVycm9yTXNnID0gcGFyc2VFcnJvciBpbnN0YW5jZW9mIEVycm9yID8gcGFyc2VFcnJvci5tZXNzYWdlIDogU3RyaW5nKHBhcnNlRXJyb3IpO1xuICAgICAgICAgICAgY29uc3QgZnVsbEVycm9yID0gYE1ldGEgb3V0cHV0IHBhcnNlIGZhaWxlZDogJHtlcnJvck1zZ31gO1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW3YwXSBNZXRhIHN0ZXA6ICR7ZnVsbEVycm9yfWApO1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGZ1bGxFcnJvcik7XG4gICAgICAgIH1cbiAgICAgICAgLy8gRkFJTC1MT1VEOiBWYWxpZGF0ZSBhbGwgcmVxdWlyZWQgZmllbGRzIGV4aXN0IGFuZCBoYXZlIGNvcnJlY3QgdHlwZXNcbiAgICAgICAgY29uc3QgZmllbGRWYWxpZGF0aW9ucyA9IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBmaWVsZDogJ21ldGFfdGl0bGUnLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICAgIGNoZWNrOiAodik9PnR5cGVvZiB2ID09PSAnc3RyaW5nJyAmJiB2Lmxlbmd0aCA+IDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZmllbGQ6ICdtZXRhX2Rlc2NyaXB0aW9uJyxcbiAgICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgICBjaGVjazogKHYpPT50eXBlb2YgdiA9PT0gJ3N0cmluZycgJiYgdi5sZW5ndGggPiAwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZpZWxkOiAnc2x1ZycsXG4gICAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICAgICAgY2hlY2s6ICh2KT0+dHlwZW9mIHYgPT09ICdzdHJpbmcnICYmIHYubGVuZ3RoID4gMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBmaWVsZDogJ3NvY2lhbF9wcmV2aWV3JyxcbiAgICAgICAgICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgICAgICAgICBjaGVjazogKHYpPT50eXBlb2YgdiA9PT0gJ29iamVjdCcgJiYgdi50aXRsZSAmJiB2LmRlc2NyaXB0aW9uXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZpZWxkOiAnc2NoZW1hX21hcmt1cCcsXG4gICAgICAgICAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgICAgICAgICAgY2hlY2s6ICh2KT0+dHlwZW9mIHYgPT09ICdvYmplY3QnICYmIHZbJ0B0eXBlJ10gJiYgdi5oZWFkbGluZSAmJiB2LmRlc2NyaXB0aW9uXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZpZWxkOiAncHJpbWFyeV9rZXl3b3JkX3VzZWQnLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgICAgICAgICBjaGVjazogKHYpPT50eXBlb2YgdiA9PT0gJ2Jvb2xlYW4nXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZpZWxkOiAnc2Vjb25kYXJ5X2tleXdvcmRzX3JlZmxlY3RlZCcsXG4gICAgICAgICAgICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgICAgICAgICAgICBjaGVjazogKHYpPT5BcnJheS5pc0FycmF5KHYpXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZpZWxkOiAnY2xpZW50X2dvYWxfcmVmbGVjdGVkJyxcbiAgICAgICAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgICAgICAgICAgY2hlY2s6ICh2KT0+dHlwZW9mIHYgPT09ICdib29sZWFuJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBmaWVsZDogJ2h1bWFuX3Jldmlld19yZXF1aXJlZCcsXG4gICAgICAgICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICAgICAgICAgIGNoZWNrOiAodik9PnR5cGVvZiB2ID09PSAnYm9vbGVhbidcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZmllbGQ6ICdyZXZpZXdfcmVhZHknLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgICAgICAgICBjaGVjazogKHYpPT50eXBlb2YgdiA9PT0gJ2Jvb2xlYW4nXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZpZWxkOiAnbWV0YV9ub3RlcycsXG4gICAgICAgICAgICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgICAgICAgICAgICBjaGVjazogKHYpPT5BcnJheS5pc0FycmF5KHYpXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZpZWxkOiAnbmVlZHNfcmV2aWV3JyxcbiAgICAgICAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgICAgICAgICAgY2hlY2s6ICh2KT0+dHlwZW9mIHYgPT09ICdib29sZWFuJ1xuICAgICAgICAgICAgfVxuICAgICAgICBdO1xuICAgICAgICBjb25zdCB2YWxpZGF0aW9uRXJyb3JzID0gW107XG4gICAgICAgIGZvciAoY29uc3QgdmFsaWRhdGlvbiBvZiBmaWVsZFZhbGlkYXRpb25zKXtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gbWV0YU91dHB1dFt2YWxpZGF0aW9uLmZpZWxkXTtcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdmFsaWRhdGlvbkVycm9ycy5wdXNoKGAke3ZhbGlkYXRpb24uZmllbGR9IGlzIG1pc3NpbmdgKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIXZhbGlkYXRpb24uY2hlY2sodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgdmFsaWRhdGlvbkVycm9ycy5wdXNoKGAke3ZhbGlkYXRpb24uZmllbGR9IGhhcyBpbnZhbGlkIHR5cGUgKGV4cGVjdGVkICR7dmFsaWRhdGlvbi50eXBlfSlgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAodmFsaWRhdGlvbkVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE1ldGEgb3V0cHV0IHZhbGlkYXRpb24gZmFpbGVkOiAke3ZhbGlkYXRpb25FcnJvcnMuam9pbignOyAnKX1gKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBMaWdodHdlaWdodCBmaWVsZCBjb25zdHJhaW50cyAobm8gc2lsZW50IG1vZGlmaWNhdGlvbilcbiAgICAgICAgaWYgKG1ldGFPdXRwdXQubWV0YV90aXRsZS5sZW5ndGggPiA3MCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBNZXRhIHRpdGxlIHRvbyBsb25nOiAke21ldGFPdXRwdXQubWV0YV90aXRsZS5sZW5ndGh9IGNoYXJzLCBtYXggNzBgKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobWV0YU91dHB1dC5tZXRhX2Rlc2NyaXB0aW9uLmxlbmd0aCA+IDE2MCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBNZXRhIGRlc2NyaXB0aW9uIHRvbyBsb25nOiAke21ldGFPdXRwdXQubWV0YV9kZXNjcmlwdGlvbi5sZW5ndGh9IGNoYXJzLCBtYXggMTYwYCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gTWV0YSBzdGVwOiBDb21wbGV0ZSBmb3IgcnVuICR7cnVuSWR9YCwgYEdlbmVyYXRlZCBtZXRhZGF0YTogJHttZXRhT3V0cHV0Lm1ldGFfdGl0bGUuc3Vic3RyaW5nKDAsIDUwKX0uLi5gKTtcbiAgICAgICAgcmV0dXJuIG1ldGFPdXRwdXQ7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICBjb25zb2xlLmVycm9yKGBbdjBdIE1ldGEgc3RlcCBlcnJvciBmb3IgcnVuICR7cnVuSWR9OiAke2Vycm9yTWVzc2FnZX1gKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxufVxuLyoqXG4gKiBCdWlsZCBjb250ZXh0IHByb21wdCBmb3IgbWV0YWRhdGEgZ2VuZXJhdGlvblxuICovIGZ1bmN0aW9uIGJ1aWxkTWV0YUNvbnRleHQoaW5wdXQsIHJlc2VhcmNoLCBvdXRsaW5lLCBzZW9RYSwgb3JpZ2luYWxEcmFmdCwgZWRpdGVkRHJhZnQpIHtcbiAgICAvLyBWYWxpZGF0ZSByZXF1aXJlZCByZXNlYXJjaC5rZXlfZmluZGluZ3MgYmVmb3JlIHVzaW5nXG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHJlc2VhcmNoLmtleV9maW5kaW5ncykpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZXNlYXJjaCBvdXRwdXQgbWlzc2luZyByZXF1aXJlZCBrZXlfZmluZGluZ3MgYXJyYXkgZm9yIG1ldGEtc3RlcCcpO1xuICAgIH1cbiAgICBjb25zdCB3b3JkQ291bnQgPSBlZGl0ZWREcmFmdC5zcGxpdCgvXFxzKy8pLmxlbmd0aDtcbiAgICBjb25zdCBoZWFkaW5ncyA9IGVkaXRlZERyYWZ0Lm1hdGNoKC9eIytcXHMrLiskL2dtKSB8fCBbXTtcbiAgICBjb25zdCBrZXlGaW5kaW5nc1N1bW1hcnkgPSByZXNlYXJjaC5rZXlfZmluZGluZ3Muc2xpY2UoMCwgMykuam9pbignXFxuLSAnKTtcbiAgICByZXR1cm4gYFlvdSBhcmUgYW4gZXhwZXJ0IFNFTyBtZXRhZGF0YSBzcGVjaWFsaXN0LiBHZW5lcmF0ZSBTRU8gbWV0YWRhdGEgZm9yIGEgYmxvZyBwb3N0IGZvciBodW1hbiByZXZpZXcuXG5cbkZVTEwgQkxPRyBDT05URVhUOlxuJHtidWlsZEZ1bGxJbnB1dENvbnRleHQoaW5wdXQpfVxuXG5SRVNFQVJDSCBTVU1NQVJZOlxuLSAke2tleUZpbmRpbmdzU3VtbWFyeX1cblxuT1VUTElORSBTVFJVQ1RVUkU6XG4ke291dGxpbmUuc2VjdGlvbnMubWFwKChzKT0+YC0gJHtzLmhlYWRpbmd9ICgke3Mua2V5X3BvaW50cz8ubGVuZ3RoIHx8IDB9IGtleSBwb2ludHMpYCkuam9pbignXFxuJyl9XG5cblNFTyBRQSBSRVZJRVc6XG4tIE92ZXJhbGwgU2NvcmU6ICR7c2VvUWEub3ZlcmFsbF9zY29yZX1cbi0gU2VhcmNoIEludGVudCBBbGlnbm1lbnQ6ICR7c2VvUWEuc2VhcmNoX2ludGVudF9hbGlnbm1lbnQuc2NvcmV9XG4tIFByaW1hcnkgS2V5d29yZCBVc2FnZTogJHtzZW9RYS5wcmltYXJ5X2tleXdvcmRfdXNhZ2Uuc2NvcmV9XG4tIEhlYWRpbmcgU3RydWN0dXJlOiAke3Nlb1FhLmhlYWRpbmdfc3RydWN0dXJlX3Jldmlldy5zY29yZX1cbi0gQ2xpZW50IEdvYWwgQWxpZ25tZW50OiAke3Nlb1FhLmNsaWVudF9nb2FsX2FsaWdubWVudC5zY29yZX1cblxuRURJVEVEIEJMT0cgTUFSS0RPV046XG4ke2VkaXRlZERyYWZ0fVxuXG5DT05URU5UIFNUQVRTOlxuLSBXb3JkIENvdW50OiAke3dvcmRDb3VudH1cbi0gSGVhZGluZ3M6ICR7aGVhZGluZ3MubGVuZ3RofVxuLSBIYXMgQ1RBOiAke2lucHV0LmN0YV9ub3RlcyA/ICdZZXMnIDogJ05vJ31cbi0gSGFzIEludGVybmFsIExpbmtzOiAke2lucHV0LmludGVybmFsX2xpbmtfbm90ZXMgPyAnWWVzJyA6ICdObyd9XG5cbkdlbmVyYXRlIG1ldGFkYXRhIHRoYXQ6XG4xLiBBY2N1cmF0ZWx5IHJlcHJlc2VudHMgdGhlIGJsb2cgY29udGVudCAoZG8gbm90IGludmVudCBjbGFpbXMpXG4yLiBJbmNsdWRlcyB0aGUgcHJpbWFyeSBrZXl3b3JkIG5hdHVyYWxseSBpbiB0aXRsZSBhbmQgZGVzY3JpcHRpb25cbjMuIElzIFNFTy1vcHRpbWl6ZWQgZm9yIHNlYXJjaCBlbmdpbmVzXG40LiBJcyBjb21wZWxsaW5nIGZvciBodW1hbiByZWFkZXJzIGFuZCBDVFJcbjUuIEZvbGxvd3MgYmVzdCBwcmFjdGljZXMgKHRpdGxlIG1heCA3MCBjaGFycywgZGVzY3JpcHRpb24gbWF4IDE2MCBjaGFycylcbjYuIEluY2x1ZGVzIHJldmlldyBub3RlcyBmb3IgdGhlIGh1bWFuIGVkaXRvclxuXG5SZXR1cm4gdmFsaWQgSlNPTiBvbmx5IHVzaW5nIGV4YWN0bHkgdGhlc2UgdG9wLWxldmVsIGtleXM6XG5tZXRhX3RpdGxlLCBtZXRhX2Rlc2NyaXB0aW9uLCBzbHVnLCBzb2NpYWxfcHJldmlldywgc2NoZW1hX21hcmt1cCwgcHJpbWFyeV9rZXl3b3JkX3VzZWQsIHNlY29uZGFyeV9rZXl3b3Jkc19yZWZsZWN0ZWQsIGNsaWVudF9nb2FsX3JlZmxlY3RlZCwgaHVtYW5fcmV2aWV3X3JlcXVpcmVkLCByZXZpZXdfcmVhZHksIG1ldGFfbm90ZXMsIG5lZWRzX3Jldmlldy5cblxuRG8gbm90IHVzZSBvbGQga2V5czpcbnNlb190aXRsZSwgc3VnZ2VzdGVkX3NsdWcsIHNlY29uZGFyeV9rZXl3b3Jkc191c2VkLCBodW1hbl9yZXZpZXdfbm90ZXMsIGV4Y2VycHQsIG9nX3RpdGxlLCBvZ19kZXNjcmlwdGlvbiwgY2Fub25pY2FsX3VybF9zdWdnZXN0aW9uLCBzY2hlbWFfdHlwZV9zdWdnZXN0aW9uLlxuXG5SZXR1cm4gYSBKU09OIG9iamVjdCB3aXRoIHRoaXMgZXhhY3Qgc2NoZW1hOlxue1xuICBcIm1ldGFfdGl0bGVcIjogXCJTRU8tb3B0aW1pemVkIHRpdGxlIChtYXggNzAgY2hhcnMsIGluY2x1ZGUgcHJpbWFyeSBrZXl3b3JkKVwiLFxuICBcIm1ldGFfZGVzY3JpcHRpb25cIjogXCJDb21wZWxsaW5nIGRlc2NyaXB0aW9uIChtYXggMTYwIGNoYXJzLCBpbmNsdWRlIHByaW1hcnkga2V5d29yZClcIixcbiAgXCJzbHVnXCI6IFwidXJsLXNsdWctZm9ybWF0XCIsXG4gIFwic29jaWFsX3ByZXZpZXdcIjoge1xuICAgIFwidGl0bGVcIjogXCJTb2NpYWwgbWVkaWEgcHJldmlldyB0aXRsZVwiLFxuICAgIFwiZGVzY3JpcHRpb25cIjogXCJTb2NpYWwgbWVkaWEgcHJldmlldyBkZXNjcmlwdGlvblwiXG4gIH0sXG4gIFwic2NoZW1hX21hcmt1cFwiOiB7XG4gICAgXCJAdHlwZVwiOiBcIkJsb2dQb3N0aW5nXCIsXG4gICAgXCJoZWFkbGluZVwiOiBcIkFydGljbGUgaGVhZGxpbmVcIixcbiAgICBcImRlc2NyaXB0aW9uXCI6IFwiQXJ0aWNsZSBkZXNjcmlwdGlvblwiXG4gIH0sXG4gIFwicHJpbWFyeV9rZXl3b3JkX3VzZWRcIjogdHJ1ZSxcbiAgXCJzZWNvbmRhcnlfa2V5d29yZHNfcmVmbGVjdGVkXCI6IFtcImtleXdvcmQxXCIsIFwia2V5d29yZDJcIl0sXG4gIFwiY2xpZW50X2dvYWxfcmVmbGVjdGVkXCI6IHRydWUsXG4gIFwiaHVtYW5fcmV2aWV3X3JlcXVpcmVkXCI6IHRydWUsXG4gIFwicmV2aWV3X3JlYWR5XCI6IHRydWUsXG4gIFwibWV0YV9ub3Rlc1wiOiBbXCJub3RlMVwiLCBcIm5vdGUyXCJdLFxuICBcIm5lZWRzX3Jldmlld1wiOiBmYWxzZVxufWA7XG59XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9tZXRhLXN0ZXAvL3J1bk1ldGFTdGVwXCIsIHJ1bk1ldGFTdGVwKTtcbiIsICJpbXBvcnQgeyByZWdpc3RlclN0ZXBGdW5jdGlvbiB9IGZyb20gXCJ3b3JrZmxvdy9pbnRlcm5hbC9wcml2YXRlXCI7XG5pbXBvcnQgJ3NlcnZlci1vbmx5JztcbmltcG9ydCB7IGdlbmVyYXRlVGV4dCB9IGZyb20gJ2FpJztcbmltcG9ydCB7IG9wZW5haSB9IGZyb20gJ0BhaS1zZGsvb3BlbmFpJztcbmltcG9ydCB7IHVwZGF0ZVJ1blN0YXR1cyB9IGZyb20gJy4uLy4uL3N0b3JhZ2UvcnVucyc7XG5pbXBvcnQgeyBnZXRBZ2VudENvbmZpZyB9IGZyb20gJy4uLy4uL3N0b3JhZ2UvYWdlbnQtY29uZmlncyc7XG5pbXBvcnQgeyBidWlsZEZ1bGxJbnB1dENvbnRleHQsIGV4dHJhY3RKc29uT2JqZWN0IH0gZnJvbSAnLi9jb250ZXh0LWJ1aWxkZXInO1xuLyoqX19pbnRlcm5hbF93b3JrZmxvd3N7XCJzdGVwc1wiOntcImxpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvb3V0bGluZS1zdGVwLnRzXCI6e1wicnVuT3V0bGluZVN0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9vdXRsaW5lLXN0ZXAvL3J1bk91dGxpbmVTdGVwXCJ9fX19Ki87XG4vKipcbiAqIE91dGxpbmUgU3RlcCAtIFBoYXNlIDJDLUJcbiAqIFJ1bnMgaW5zaWRlIGEgZHVyYWJsZSBzdGVwIGZ1bmN0aW9uIChoYXMgTm9kZS5qcyBhY2Nlc3MpXG4gKiBDYWxscyBBSSBtb2RlbCB0byBnZW5lcmF0ZSBjb250ZW50IG91dGxpbmUgd2l0aCBzdHJ1Y3R1cmVcbiAqIFVzZXMgcmVzZWFyY2ggZGF0YSBpZiBhdmFpbGFibGUgdG8gaW5mb3JtIG91dGxpbmVcbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gcnVuT3V0bGluZVN0ZXAocnVuSWQsIGlucHV0LCByZXNlYXJjaERhdGEpIHtcbiAgICBjb25zb2xlLmxvZyhgW3YwXSBPdXRsaW5lIHN0ZXA6IENyZWF0aW5nIG91dGxpbmUgZm9yIHJ1biAke3J1bklkfWApO1xuICAgIC8vIENyZWF0ZSBjb250ZXh0IGZyb20gYXZhaWxhYmxlIGRhdGEgKG5lZWRlZCBmb3IgZmFsbGJhY2sgaW4gY2F0Y2ggYmxvY2spXG4gICAgY29uc3QgdG9waWMgPSBpbnB1dC5ibG9nX3RvcGljIHx8IGlucHV0LnRvcGljIHx8ICdZb3VyIFRvcGljJztcbiAgICBjb25zdCBwcmltYXJ5S2V5d29yZCA9IGlucHV0LnByaW1hcnlfa2V5d29yZCB8fCAncHJpbWFyeSBrZXl3b3JkJztcbiAgICBjb25zdCBzZWNvbmRhcnlLZXl3b3JkcyA9IChpbnB1dC5zZWNvbmRhcnlfa2V5d29yZHMgfHwgaW5wdXQua2V5d29yZHMgfHwgW10pLmpvaW4oJywgJykgfHwgJ3NlY29uZGFyeSBrZXl3b3Jkcyc7XG4gICAgY29uc3QgYnVzaW5lc3NOYW1lID0gaW5wdXQuYnVzaW5lc3NfbmFtZSB8fCAnWW91ciBCdXNpbmVzcyc7XG4gICAgY29uc3QgYXVkaWVuY2VOb3RlcyA9IGlucHV0LmF1ZGllbmNlX25vdGVzIHx8ICdUYXJnZXQgYXVkaWVuY2Ugbm90IHNwZWNpZmllZCc7XG4gICAgY29uc3QgYnJhbmRWb2ljZSA9IGlucHV0LmJyYW5kX3ZvaWNlX25vdGVzIHx8ICdQcm9mZXNzaW9uYWwgYW5kIGNsZWFyJztcbiAgICBjb25zdCBjdGFOb3RlcyA9IGlucHV0LmN0YV9ub3RlcyB8fCAnRW5jb3VyYWdlIGVuZ2FnZW1lbnQnO1xuICAgIGNvbnN0IGFkZGl0aW9uYWxOb3RlcyA9IGlucHV0LmFkZGl0aW9uYWxfb3JkZXJfbm90ZXMgfHwgJ05vIGFkZGl0aW9uYWwgbm90ZXMnO1xuICAgIGNvbnN0IHRhcmdldFdvcmRDb3VudCA9IGlucHV0LnRhcmdldF93b3JkX2NvdW50IHx8IDE1MDA7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gTG9hZCBhZ2VudCBjb25maWcgZnJvbSBkYXRhYmFzZVxuICAgICAgICBjb25zdCBhZ2VudENvbmZpZyA9IGF3YWl0IGdldEFnZW50Q29uZmlnKCdvdXRsaW5lJyk7XG4gICAgICAgIGlmICghYWdlbnRDb25maWcpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQWN0aXZlIGFnZW50IGNvbmZpZyBub3QgZm91bmQgZm9yIGFnZW50X2tleTogb3V0bGluZScpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFNFTyBCbG9nIEFnZW50IENvbmZpZyBMb2FkZWQ6IG91dGxpbmUgdiR7YWdlbnRDb25maWcudmVyc2lvbn1gKTtcbiAgICAgICAgLy8gQnVpbGQgc3lzdGVtIHByb21wdCBmcm9tIGRhdGFiYXNlIGNvbmZpZ1xuICAgICAgICBjb25zdCBzeXN0ZW1Qcm9tcHQgPSBbXG4gICAgICAgICAgICBhZ2VudENvbmZpZy5zeXN0ZW1fcHJvbXB0LFxuICAgICAgICAgICAgYWdlbnRDb25maWcuc2tpbGxfbWFya2Rvd25cbiAgICAgICAgXS5maWx0ZXIoQm9vbGVhbikuam9pbignXFxuXFxuJyk7XG4gICAgICAgIC8vIEluY2x1ZGUgcmVzZWFyY2ggaW5zaWdodHMgaWYgYXZhaWxhYmxlXG4gICAgICAgIGxldCByZXNlYXJjaENvbnRleHQgPSAnJztcbiAgICAgICAgaWYgKHJlc2VhcmNoRGF0YSkge1xuICAgICAgICAgICAgcmVzZWFyY2hDb250ZXh0ID0gYFxuXG5SZXNlYXJjaCBJbnNpZ2h0cyBmcm9tIFJlc2VhcmNoIEFnZW50OlxuLSBTZWFyY2ggSW50ZW50OiAke3Jlc2VhcmNoRGF0YS5zZWFyY2hfaW50ZW50IHx8ICdOL0EnfVxuLSBDb250ZW50IEFuZ2xlOiAke3Jlc2VhcmNoRGF0YS5jb250ZW50X2FuZ2xlIHx8ICdOL0EnfVxuLSBUYXJnZXQgQXVkaWVuY2U6ICR7cmVzZWFyY2hEYXRhLnRhcmdldF9hdWRpZW5jZV9zdW1tYXJ5IHx8ICdOL0EnfVxuLSBSZWNvbW1lbmRlZCBTZWN0aW9uczogJHtyZXNlYXJjaERhdGEucmVjb21tZW5kZWRfc2VjdGlvbnM/LmpvaW4oJywgJykgfHwgJ04vQSd9XG4tIFF1ZXN0aW9ucyB0byBBbnN3ZXI6ICR7cmVzZWFyY2hEYXRhLnF1ZXN0aW9uc190b19hbnN3ZXI/LmpvaW4oJywgJykgfHwgJ04vQSd9YDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB1c2VyTWVzc2FnZSA9IGBDcmVhdGUgdGhlIE91dGxpbmUgQWdlbnQgSlNPTiB1c2luZyB0aGUgc3VwcGxpZWQgUmVzZWFyY2ggQWdlbnQgb3V0cHV0IGFuZCBmdWxsIEJsb2cgQ29udGV4dCBCcmllZi5cblxuJHtidWlsZEZ1bGxJbnB1dENvbnRleHQoaW5wdXQpfSR7cmVzZWFyY2hDb250ZXh0fVxuXG5SZXR1cm4gdmFsaWQgSlNPTiBvbmx5IHVzaW5nIHRoZSBzY2hlbWEgZnJvbSB5b3VyIHN5c3RlbSBpbnN0cnVjdGlvbnMuIFByZXNlcnZlIG11c3RfaW5jbHVkZSBhbmQgbXVzdF9hdm9pZCByZXN0cmljdGlvbnMsIGFuZCBpbmNsdWRlIGNsaWVudF9nb2FsX25vdGVzIGZvciBlYWNoIHNlY3Rpb24uYDtcbiAgICAgICAgLy8gR2V0IG1vZGVsIG5hbWU6IHVzZSBEQiBjb25maWcgaWYgYXZhaWxhYmxlLCBvdGhlcndpc2UgZmFsbCBiYWNrIHRvIGVudiB2YXIgb3IgZGVmYXVsdFxuICAgICAgICBjb25zdCBtb2RlbE5hbWUgPSBhZ2VudENvbmZpZy5tb2RlbCB8fCBwcm9jZXNzLmVudi5PVVRMSU5FX0FHRU5UX01PREVMIHx8IHByb2Nlc3MuZW52LlJFU0VBUkNIX0FHRU5UX01PREVMIHx8ICdncHQtNS40LW1pbmknO1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBPdXRsaW5lIHN0ZXA6IFVzaW5nIG1vZGVsOiAke21vZGVsTmFtZX1gKTtcbiAgICAgICAgLy8gVXNlIGRpcmVjdCBPcGVuQUkgcHJvdmlkZXJcbiAgICAgICAgY29uc3QgbW9kZWwgPSBvcGVuYWkobW9kZWxOYW1lKTtcbiAgICAgICAgLy8gQ2FsbCBBSSBtb2RlbFxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGdlbmVyYXRlVGV4dCh7XG4gICAgICAgICAgICBtb2RlbCxcbiAgICAgICAgICAgIHN5c3RlbTogc3lzdGVtUHJvbXB0LFxuICAgICAgICAgICAgcHJvbXB0OiB1c2VyTWVzc2FnZSxcbiAgICAgICAgICAgIHRlbXBlcmF0dXJlOiAwLjdcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIE91dGxpbmUgc3RlcDogUmF3IHJlc3BvbnNlIGxlbmd0aDogJHtyZXNwb25zZS50ZXh0Lmxlbmd0aH1gKTtcbiAgICAgICAgLy8gUGFyc2UgdGhlIEpTT04gcmVzcG9uc2VcbiAgICAgICAgY29uc3Qgb3V0bGluZURhdGEgPSBKU09OLnBhcnNlKGV4dHJhY3RKc29uT2JqZWN0KHJlc3BvbnNlLnRleHQpKTtcbiAgICAgICAgLy8gVmFsaWRhdGUgcmVxdWlyZWQgZmllbGRzIGFuZCBhZGQgZGVmYXVsdHNcbiAgICAgICAgb3V0bGluZURhdGEudGltZXN0YW1wID0gb3V0bGluZURhdGEudGltZXN0YW1wIHx8IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICAgICAgb3V0bGluZURhdGEudGFyZ2V0X3dvcmRfY291bnQgPSBvdXRsaW5lRGF0YS50YXJnZXRfd29yZF9jb3VudCB8fCB0YXJnZXRXb3JkQ291bnQ7XG4gICAgICAgIC8vIEVuc3VyZSBzZWN0aW9ucyBhcnJheSBleGlzdHNcbiAgICAgICAgaWYgKCFvdXRsaW5lRGF0YS5zZWN0aW9ucyB8fCAhQXJyYXkuaXNBcnJheShvdXRsaW5lRGF0YS5zZWN0aW9ucykpIHtcbiAgICAgICAgICAgIG91dGxpbmVEYXRhLnNlY3Rpb25zID0gW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGluZzogJ0ludHJvZHVjdGlvbicsXG4gICAgICAgICAgICAgICAgICAgIHB1cnBvc2U6ICdJbnRyb2R1Y2UgdG9waWMgYW5kIHNldCBjb250ZXh0JyxcbiAgICAgICAgICAgICAgICAgICAgZXN0aW1hdGVkX3dvcmRzOiAxNTAsXG4gICAgICAgICAgICAgICAgICAgIGtleV9wb2ludHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICdUb3BpYyBvdmVydmlldycsXG4gICAgICAgICAgICAgICAgICAgICAgICAnV2h5IHRoaXMgbWF0dGVycydcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgc2VvX25vdGVzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAnSW5jbHVkZSBwcmltYXJ5IGtleXdvcmQgbmF0dXJhbGx5J1xuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBjbGllbnRfZ29hbF9ub3RlczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgJ0Nvbm5lY3QgdGhlIHRvcGljIHRvIHRoZSBzdXBwbGllZCBjbGllbnQgZ29hbCB3aGVyZSByZWxldmFudCdcbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBoZWFkaW5nOiAnTWFpbiBDb250ZW50JyxcbiAgICAgICAgICAgICAgICAgICAgcHVycG9zZTogJ0RldGFpbGVkIGV4cGxvcmF0aW9uIG9mIHRvcGljJyxcbiAgICAgICAgICAgICAgICAgICAgZXN0aW1hdGVkX3dvcmRzOiAxMDAwLFxuICAgICAgICAgICAgICAgICAgICBrZXlfcG9pbnRzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAnS2V5IGluc2lnaHQgMScsXG4gICAgICAgICAgICAgICAgICAgICAgICAnS2V5IGluc2lnaHQgMicsXG4gICAgICAgICAgICAgICAgICAgICAgICAnS2V5IGluc2lnaHQgMydcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgc2VvX25vdGVzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAnVXNlIHNlY29uZGFyeSBrZXl3b3JkcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAnQW5zd2VyIHVzZXIgaW50ZW50IHF1ZXN0aW9ucydcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgY2xpZW50X2dvYWxfbm90ZXM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICdVc2Ugc3VwcGxpZWQgYnVzaW5lc3MgZ29hbCBhbmQgc2VydmljZXMgd2l0aG91dCBpbnZlbnRpbmcgY2xhaW1zJ1xuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGhlYWRpbmc6ICdDb25jbHVzaW9uJyxcbiAgICAgICAgICAgICAgICAgICAgcHVycG9zZTogJ1N1bW1hcml6ZSBhbmQgY2FsbCB0byBhY3Rpb24nLFxuICAgICAgICAgICAgICAgICAgICBlc3RpbWF0ZWRfd29yZHM6IDE1MCxcbiAgICAgICAgICAgICAgICAgICAga2V5X3BvaW50czogW1xuICAgICAgICAgICAgICAgICAgICAgICAgJ1N1bW1hcnkgb2Yga2V5IHBvaW50cycsXG4gICAgICAgICAgICAgICAgICAgICAgICAnQ2FsbCB0byBhY3Rpb24nXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIHNlb19ub3RlczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgJ1JlaW5mb3JjZSBwcmltYXJ5IGtleXdvcmQnXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIGNsaWVudF9nb2FsX25vdGVzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAnQ2xvc2Ugd2l0aCB0aGUgc3VwcGxpZWQgQ1RBIGRpcmVjdGlvbidcbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF07XG4gICAgICAgIH1cbiAgICAgICAgb3V0bGluZURhdGEuc2VjdGlvbnMgPSBvdXRsaW5lRGF0YS5zZWN0aW9ucy5tYXAoKHNlY3Rpb24pPT4oe1xuICAgICAgICAgICAgICAgIC4uLnNlY3Rpb24sXG4gICAgICAgICAgICAgICAga2V5X3BvaW50czogQXJyYXkuaXNBcnJheShzZWN0aW9uLmtleV9wb2ludHMpID8gc2VjdGlvbi5rZXlfcG9pbnRzIDogW10sXG4gICAgICAgICAgICAgICAgc2VvX25vdGVzOiBBcnJheS5pc0FycmF5KHNlY3Rpb24uc2VvX25vdGVzKSA/IHNlY3Rpb24uc2VvX25vdGVzIDogW10sXG4gICAgICAgICAgICAgICAgY2xpZW50X2dvYWxfbm90ZXM6IEFycmF5LmlzQXJyYXkoc2VjdGlvbi5jbGllbnRfZ29hbF9ub3RlcykgPyBzZWN0aW9uLmNsaWVudF9nb2FsX25vdGVzIDogW10sXG4gICAgICAgICAgICAgICAgZXN0aW1hdGVkX3dvcmRzOiB0eXBlb2Ygc2VjdGlvbi5lc3RpbWF0ZWRfd29yZHMgPT09ICdudW1iZXInID8gc2VjdGlvbi5lc3RpbWF0ZWRfd29yZHMgOiAwXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIG91dGxpbmVEYXRhLm5lZWRzX3JldmlldyA9IEJvb2xlYW4ob3V0bGluZURhdGEubmVlZHNfcmV2aWV3KTtcbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gT3V0bGluZSBzdGVwOiBHZW5lcmF0ZWQgb3V0bGluZSB3aXRoICR7b3V0bGluZURhdGEuc2VjdGlvbnMubGVuZ3RofSBzZWN0aW9uc2ApO1xuICAgICAgICAvLyBQZXJzaXN0IG91dGxpbmVfanNvbiB0byBkYXRhYmFzZVxuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBPdXRsaW5lIHN0ZXA6IFBlcnNpc3Rpbmcgb3V0bGluZV9qc29uIGZvciBydW4gJHtydW5JZH1gKTtcbiAgICAgICAgYXdhaXQgdXBkYXRlUnVuU3RhdHVzKHJ1bklkLCAnb3V0bGluaW5nJywgb3V0bGluZURhdGEpO1xuICAgICAgICByZXR1cm4gb3V0bGluZURhdGE7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgW3YwXSBPdXRsaW5lIHN0ZXAgZXJyb3I6YCwgZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpKTtcbiAgICAgICAgLy8gUmV0dXJuIGZhbGxiYWNrIG91dGxpbmUgaWYgcGFyc2luZyBvciBBSSBjYWxsIGZhaWxzXG4gICAgICAgIGNvbnN0IGZhbGxiYWNrT3V0bGluZSA9IHtcbiAgICAgICAgICAgIHRpdGxlOiBgJHt0b3BpY30gLSBDb21wcmVoZW5zaXZlIEd1aWRlIHwgJHtidXNpbmVzc05hbWV9YCxcbiAgICAgICAgICAgIG1ldGFfYW5nbGU6IGBFdmVyeXRoaW5nIHlvdSBuZWVkIHRvIGtub3cgYWJvdXQgJHt0b3BpY30gZm9yICR7YnVzaW5lc3NOYW1lfWAsXG4gICAgICAgICAgICB0YXJnZXRfd29yZF9jb3VudDogdGFyZ2V0V29yZENvdW50LFxuICAgICAgICAgICAgc2VjdGlvbnM6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGhlYWRpbmc6ICdJbnRyb2R1Y3Rpb246IFVuZGVyc3RhbmRpbmcgdGhlIEJhc2ljcycsXG4gICAgICAgICAgICAgICAgICAgIHB1cnBvc2U6ICdTZXQgY29udGV4dCBhbmQgaW50cm9kdWNlIHRoZSB0b3BpYycsXG4gICAgICAgICAgICAgICAgICAgIGVzdGltYXRlZF93b3JkczogMjAwLFxuICAgICAgICAgICAgICAgICAgICBrZXlfcG9pbnRzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBgT3ZlcnZpZXcgb2YgJHt0b3BpY31gLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ1doeSB0aGlzIHRvcGljIG1hdHRlcnMgdG8geW91ciBhdWRpZW5jZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAnV2hhdCB5b3Ugd2lsbCBsZWFybidcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgc2VvX25vdGVzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAnSW5jbHVkZSBwcmltYXJ5IGtleXdvcmQgaW4gZmlyc3QgcGFyYWdyYXBoJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdVc2UgZW5nYWdpbmcgaG9vaydcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgY2xpZW50X2dvYWxfbm90ZXM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICdJbnRyb2R1Y2Ugd2h5IHRoaXMgdG9waWMgbWF0dGVycyBmb3IgdGhlIHN1cHBsaWVkIGF1ZGllbmNlIGFuZCBidXNpbmVzcyBnb2FsJ1xuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGhlYWRpbmc6ICdLZXkgQ29uY2VwdHMgYW5kIEJlbmVmaXRzJyxcbiAgICAgICAgICAgICAgICAgICAgcHVycG9zZTogJ0V4cGxvcmUgY29yZSBjb25jZXB0cyBhbmQgYWR2YW50YWdlcycsXG4gICAgICAgICAgICAgICAgICAgIGVzdGltYXRlZF93b3JkczogNDAwLFxuICAgICAgICAgICAgICAgICAgICBrZXlfcG9pbnRzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAnQ29yZSBjb25jZXB0IDEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0NvcmUgY29uY2VwdCAyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdIb3cgYnVzaW5lc3NlcyBiZW5lZml0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdSZWFsLXdvcmxkIGFwcGxpY2F0aW9ucydcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgc2VvX25vdGVzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAnVXNlIHNlY29uZGFyeSBrZXl3b3JkcyBuYXR1cmFsbHknLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0Fuc3dlciBjb21tb24gcXVlc3Rpb25zJ1xuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBjbGllbnRfZ29hbF9ub3RlczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgJ1RpZSBiZW5lZml0cyBiYWNrIHRvIHRoZSBzdXBwbGllZCBzZXJ2aWNlIG9yIENUQSBvbmx5IHdoZW4gc3VwcG9ydGVkJ1xuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGhlYWRpbmc6ICdCZXN0IFByYWN0aWNlcyBhbmQgSW1wbGVtZW50YXRpb24nLFxuICAgICAgICAgICAgICAgICAgICBwdXJwb3NlOiAnUHJvdmlkZSBhY3Rpb25hYmxlIGd1aWRhbmNlJyxcbiAgICAgICAgICAgICAgICAgICAgZXN0aW1hdGVkX3dvcmRzOiA1MDAsXG4gICAgICAgICAgICAgICAgICAgIGtleV9wb2ludHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICdTdGVwLWJ5LXN0ZXAgaW1wbGVtZW50YXRpb24nLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0Jlc3QgcHJhY3RpY2VzIGluIHRoZSBpbmR1c3RyeScsXG4gICAgICAgICAgICAgICAgICAgICAgICAnQ29tbW9uIG1pc3Rha2VzIHRvIGF2b2lkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdUb29scyBhbmQgcmVzb3VyY2VzJ1xuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBzZW9fbm90ZXM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICdVc2UgbG9uZy10YWlsIGtleXdvcmRzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdJbmNsdWRlIHByYWN0aWNhbCBleGFtcGxlcydcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgY2xpZW50X2dvYWxfbm90ZXM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICdLZWVwIHJlY29tbWVuZGF0aW9ucyBncm91bmRlZCBpbiB0aGUgc3VwcGxpZWQgY29udGV4dCdcbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBoZWFkaW5nOiAnQ29uY2x1c2lvbiBhbmQgTmV4dCBTdGVwcycsXG4gICAgICAgICAgICAgICAgICAgIHB1cnBvc2U6ICdTdW1tYXJpemUgYW5kIGd1aWRlIHJlYWRlciBhY3Rpb24nLFxuICAgICAgICAgICAgICAgICAgICBlc3RpbWF0ZWRfd29yZHM6IDE1MCxcbiAgICAgICAgICAgICAgICAgICAga2V5X3BvaW50czogW1xuICAgICAgICAgICAgICAgICAgICAgICAgJ0tleSB0YWtlYXdheXMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ1JlY29tbWVuZGVkIG5leHQgc3RlcHMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0NhbGwgdG8gYWN0aW9uJ1xuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBzZW9fbm90ZXM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICdSZWluZm9yY2UgcHJpbWFyeSBrZXl3b3JkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdDcmVhdGUgdXJnZW5jeSBmb3IgQ1RBJ1xuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBjbGllbnRfZ29hbF9ub3RlczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgJ1VzZSB0aGUgc3VwcGxpZWQgQ1RBIGRpcmVjdGlvbiB3aXRob3V0IGludmVudGluZyBvZmZlcnMnXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgaW50cm9fZ3VpZGFuY2U6IGBTdGFydCB3aXRoIGEgY29tcGVsbGluZyBob29rIHRoYXQgYWRkcmVzc2VzIHRoZSByZWFkZXIncyBwYWluIHBvaW50LiBJbnRyb2R1Y2UgJHt0b3BpY30gaW4gdGhlIGNvbnRleHQgb2YgJHtidXNpbmVzc05hbWV9IGFuZCBleHBsYWluIHdoeSBpdCBtYXR0ZXJzIHRvIHRoZSB0YXJnZXQgYXVkaWVuY2UuIEluY2x1ZGUgdGhlIHByaW1hcnkga2V5d29yZCBcIiR7cHJpbWFyeUtleXdvcmR9XCIgbmF0dXJhbGx5IGluIHRoZSBmaXJzdCAxMDAgd29yZHMuYCxcbiAgICAgICAgICAgIGNvbmNsdXNpb25fZ3VpZGFuY2U6IGBTdW1tYXJpemUgdGhlIG1haW4gdGFrZWF3YXlzIGZyb20gZWFjaCBzZWN0aW9uLiBSZWluZm9yY2UgaG93IHVuZGVyc3RhbmRpbmcgJHt0b3BpY30gYmVuZWZpdHMgdGhlIHJlYWRlci4gSW5jbHVkZSBhIGNsZWFyLCBjb21wZWxsaW5nIGNhbGwtdG8tYWN0aW9uIHRoYXQgZ3VpZGVzIHRoZSByZWFkZXIgb24gbmV4dCBzdGVwcy4gRW5kIHdpdGggdGhlIHByaW1hcnkga2V5d29yZCBuYXR1cmFsbHkgaW5jb3Jwb3JhdGVkLmAsXG4gICAgICAgICAgICBjdGFfZ3VpZGFuY2U6IGAke2N0YU5vdGVzfS4gRW5zdXJlIHRoZSBDVEEgaXMgY2xlYXIsIHNwZWNpZmljLCBhbmQgcmVsZXZhbnQgdG8gdGhlIGFydGljbGUgY29udGVudC4gRXhhbXBsZXM6IFwiU2NoZWR1bGUgYSBjb25zdWx0YXRpb24sXCIgXCJEb3dubG9hZCBvdXIgZ3VpZGUsXCIgXCJHZXQgc3RhcnRlZCB0b2RheSxcIiBcIkpvaW4gb3VyIGNvbW11bml0eS5cImAsXG4gICAgICAgICAgICBpbnRlcm5hbF9saW5rX29wcG9ydHVuaXRpZXM6IFtcbiAgICAgICAgICAgICAgICAnTGluayB0byByZWxldmFudCBzZXJ2aWNlIHBhZ2VzIG9uIGNvbXBhbnkgd2Vic2l0ZScsXG4gICAgICAgICAgICAgICAgJ0xpbmsgdG8gcmVsYXRlZCBibG9nIHBvc3RzIG9uIHNpbWlsYXIgdG9waWNzJyxcbiAgICAgICAgICAgICAgICAnTGluayB0byBjYXNlIHN0dWRpZXMgb3Igc3VjY2VzcyBzdG9yaWVzJyxcbiAgICAgICAgICAgICAgICAnTGluayB0byByZXNvdXJjZSBwYWdlcyBvciB0b29scydcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBuZWVkc19yZXZpZXc6IHRydWUsXG4gICAgICAgICAgICBub3Rlc19mb3Jfd3JpdGVyOiBbXG4gICAgICAgICAgICAgICAgYFJlbWVtYmVyIHRvIG1haW50YWluIGEgJHticmFuZFZvaWNlfSB0b25lIHRocm91Z2hvdXRgLFxuICAgICAgICAgICAgICAgIGBBZGRyZXNzIHRoZSBuZWVkcyBvZjogJHthdWRpZW5jZU5vdGVzfWAsXG4gICAgICAgICAgICAgICAgYEVuc3VyZSB0aGUgY29udGVudCBpcyB3ZWxsLXJlc2VhcmNoZWQgYW5kIGluY2x1ZGVzIHNwZWNpZmljIGV4YW1wbGVzYCxcbiAgICAgICAgICAgICAgICBgVXNlIHN1YmhlYWRpbmdzIHRvIGltcHJvdmUgcmVhZGFiaWxpdHkgYW5kIFNFT2AsXG4gICAgICAgICAgICAgICAgYEluY2x1ZGUgcmVsZXZhbnQgZGF0YSwgc3RhdGlzdGljcywgb3IgcmVzZWFyY2ggZmluZGluZ3Mgd2hlcmUgYXBwcm9wcmlhdGVgLFxuICAgICAgICAgICAgICAgIGBFbmQgd2l0aCBhIHN0cm9uZyBDVEEgYWxpZ25lZCB3aXRoOiAke2N0YU5vdGVzfWBcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgICAgICB9O1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBPdXRsaW5lIHN0ZXA6IFVzaW5nIGZhbGxiYWNrIG91dGxpbmUgZHVlIHRvIGVycm9yYCk7XG4gICAgICAgIHJldHVybiBmYWxsYmFja091dGxpbmU7XG4gICAgfVxufVxucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvb3V0bGluZS1zdGVwLy9ydW5PdXRsaW5lU3RlcFwiLCBydW5PdXRsaW5lU3RlcCk7XG4iLCAiaW1wb3J0IHsgcmVnaXN0ZXJTdGVwRnVuY3Rpb24gfSBmcm9tIFwid29ya2Zsb3cvaW50ZXJuYWwvcHJpdmF0ZVwiO1xuaW1wb3J0ICdzZXJ2ZXItb25seSc7XG5pbXBvcnQgeyBnZW5lcmF0ZVRleHQgfSBmcm9tICdhaSc7XG5pbXBvcnQgeyBvcGVuYWkgfSBmcm9tICdAYWktc2RrL29wZW5haSc7XG5pbXBvcnQgeyB1cGRhdGVSdW5TdGF0dXMgfSBmcm9tICcuLi8uLi9zdG9yYWdlL3J1bnMnO1xuaW1wb3J0IHsgZ2V0QWdlbnRDb25maWcgfSBmcm9tICcuLi8uLi9zdG9yYWdlL2FnZW50LWNvbmZpZ3MnO1xuaW1wb3J0IHsgYnVpbGRGdWxsSW5wdXRDb250ZXh0LCBleHRyYWN0SnNvbk9iamVjdCB9IGZyb20gJy4vY29udGV4dC1idWlsZGVyJztcbi8qKl9faW50ZXJuYWxfd29ya2Zsb3dze1wic3RlcHNcIjp7XCJsaWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3Jlc2VhcmNoLXN0ZXAudHNcIjp7XCJydW5SZXNlYXJjaFN0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9yZXNlYXJjaC1zdGVwLy9ydW5SZXNlYXJjaFN0ZXBcIn19fX0qLztcbi8qKlxuICogUmVzZWFyY2ggU3RlcCAtIFBoYXNlIDJDLUFcbiAqIFJ1bnMgaW5zaWRlIGEgZHVyYWJsZSBzdGVwIGZ1bmN0aW9uIChoYXMgTm9kZS5qcyBhY2Nlc3MpXG4gKiBDYWxscyBBSSBtb2RlbCB0byBnZW5lcmF0ZSByZXNlYXJjaCBKU09OXG4gKiBObyBmaWxlc3lzdGVtIGltcG9ydHMgLSBzYWZlIGZvciB3b3JrZmxvdyBjb250ZXh0XG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJ1blJlc2VhcmNoU3RlcChydW5JZCwgaW5wdXQpIHtcbiAgICBjb25zb2xlLmxvZyhgW3YwXSBSZXNlYXJjaCBzdGVwOiBBbmFseXppbmcgdG9waWMgZm9yIHJ1biAke3J1bklkfWApO1xuICAgIHRyeSB7XG4gICAgICAgIC8vIExvYWQgYWdlbnQgY29uZmlnIGZyb20gZGF0YWJhc2VcbiAgICAgICAgY29uc3QgYWdlbnRDb25maWcgPSBhd2FpdCBnZXRBZ2VudENvbmZpZygncmVzZWFyY2gnKTtcbiAgICAgICAgaWYgKCFhZ2VudENvbmZpZykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBY3RpdmUgYWdlbnQgY29uZmlnIG5vdCBmb3VuZCBmb3IgYWdlbnRfa2V5OiByZXNlYXJjaCcpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFNFTyBCbG9nIEFnZW50IENvbmZpZyBMb2FkZWQ6IHJlc2VhcmNoIHYke2FnZW50Q29uZmlnLnZlcnNpb259YCk7XG4gICAgICAgIC8vIEJ1aWxkIHN5c3RlbSBwcm9tcHQgZnJvbSBkYXRhYmFzZSBjb25maWdcbiAgICAgICAgY29uc3Qgc3lzdGVtUHJvbXB0ID0gW1xuICAgICAgICAgICAgYWdlbnRDb25maWcuc3lzdGVtX3Byb21wdCxcbiAgICAgICAgICAgIGFnZW50Q29uZmlnLnNraWxsX21hcmtkb3duXG4gICAgICAgIF0uZmlsdGVyKEJvb2xlYW4pLmpvaW4oJ1xcblxcbicpO1xuICAgICAgICBjb25zdCB1c2VyTWVzc2FnZSA9IGBDcmVhdGUgdGhlIFJlc2VhcmNoIEFnZW50IEpTT04gdXNpbmcgYWxsIHN1cHBsaWVkIGNvbnRleHQuXG5cbiR7YnVpbGRGdWxsSW5wdXRDb250ZXh0KGlucHV0KX1cblxuUmV0dXJuIHZhbGlkIEpTT04gb25seSB1c2luZyB0aGUgc2NoZW1hIGZyb20geW91ciBzeXN0ZW0gaW5zdHJ1Y3Rpb25zLiBEbyBub3Qgd3JpdGUgdGhlIGJsb2cgb3Igb3V0bGluZS4gUHJlc2VydmUgbXVzdF9pbmNsdWRlIGFuZCBtdXN0X2F2b2lkIGV4YWN0bHkgd2hlcmUgcHJvdmlkZWQuYDtcbiAgICAgICAgLy8gR2V0IG1vZGVsIG5hbWU6IHVzZSBEQiBjb25maWcgaWYgYXZhaWxhYmxlLCBvdGhlcndpc2UgZmFsbCBiYWNrIHRvIGVudiB2YXIgb3IgZGVmYXVsdFxuICAgICAgICBjb25zdCBtb2RlbE5hbWUgPSBhZ2VudENvbmZpZy5tb2RlbCB8fCBwcm9jZXNzLmVudi5SRVNFQVJDSF9BR0VOVF9NT0RFTCB8fCAnZ3B0LTUuNC1taW5pJztcbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gUmVzZWFyY2ggc3RlcDogVXNpbmcgbW9kZWw6ICR7bW9kZWxOYW1lfWApO1xuICAgICAgICAvLyBVc2UgZGlyZWN0IE9wZW5BSSBwcm92aWRlciB3aXRoIE9QRU5BSV9BUElfS0VZXG4gICAgICAgIGNvbnN0IG1vZGVsID0gb3BlbmFpKG1vZGVsTmFtZSk7XG4gICAgICAgIC8vIENhbGwgQUkgbW9kZWxcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBnZW5lcmF0ZVRleHQoe1xuICAgICAgICAgICAgbW9kZWwsXG4gICAgICAgICAgICBzeXN0ZW06IHN5c3RlbVByb21wdCxcbiAgICAgICAgICAgIHByb21wdDogdXNlck1lc3NhZ2UsXG4gICAgICAgICAgICB0ZW1wZXJhdHVyZTogMC43XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBSZXNlYXJjaCBzdGVwOiBBSSBtb2RlbCByZXNwb25kZWQsIHBhcnNpbmcgSlNPTmApO1xuICAgICAgICAvLyBQYXJzZSBKU09OIHJlc3BvbnNlXG4gICAgICAgIGxldCByZXNlYXJjaERhdGE7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBUcnkgdG8gZXh0cmFjdCBKU09OIGZyb20gcmVzcG9uc2UgKGluIGNhc2Ugb2YgZXh0cmEgdGV4dClcbiAgICAgICAgICAgIHJlc2VhcmNoRGF0YSA9IEpTT04ucGFyc2UoZXh0cmFjdEpzb25PYmplY3QocmVzcG9uc2UudGV4dCkpO1xuICAgICAgICAgICAgLy8gVmFsaWRhdGUgcmVxdWlyZWQgZmllbGRzIGF0IHJ1bnRpbWVcbiAgICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheShyZXNlYXJjaERhdGEua2V5X2ZpbmRpbmdzKSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignUmVzZWFyY2ggb3V0cHV0IG1pc3NpbmcgcmVxdWlyZWQga2V5X2ZpbmRpbmdzIGFycmF5Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocmVzZWFyY2hEYXRhLmtleV9maW5kaW5ncy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Jlc2VhcmNoIG91dHB1dCBrZXlfZmluZGluZ3MgYXJyYXkgY2Fubm90IGJlIGVtcHR5Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKHBhcnNlRXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbdjBdIFJlc2VhcmNoIHN0ZXA6IEZhaWxlZCB0byBwYXJzZSBBSSByZXNwb25zZTpgLCByZXNwb25zZS50ZXh0LnN1YnN0cmluZygwLCAyMDApKTtcbiAgICAgICAgICAgIC8vIFJldHVybiBmYWxsYmFjayBpZiBwYXJzaW5nIGZhaWxzXG4gICAgICAgICAgICByZXNlYXJjaERhdGEgPSB7XG4gICAgICAgICAgICAgICAgc2VhcmNoX2ludGVudDogJ2luZm9ybWF0aW9uYWwnLFxuICAgICAgICAgICAgICAgIHRhcmdldF9hdWRpZW5jZV9zdW1tYXJ5OiBpbnB1dC5hdWRpZW5jZV9ub3RlcyB8fCAnVGFyZ2V0IGF1ZGllbmNlIG5vdCBzcGVjaWZpZWQnLFxuICAgICAgICAgICAgICAgIGtleXdvcmRfbWFwOiB7XG4gICAgICAgICAgICAgICAgICAgIHByaW1hcnlfa2V5d29yZDogaW5wdXQucHJpbWFyeV9rZXl3b3JkIHx8ICdwcmltYXJ5IGtleXdvcmQnLFxuICAgICAgICAgICAgICAgICAgICBzZWNvbmRhcnlfa2V5d29yZHM6IGlucHV0LnNlY29uZGFyeV9rZXl3b3JkcyB8fCBbXSxcbiAgICAgICAgICAgICAgICAgICAgbHNpX3Rlcm1zOiBbXVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY29udGVudF9hbmdsZTogYEZvY3VzIG9uICR7aW5wdXQuYmxvZ190b3BpYyB8fCAndG9waWMnfWAsXG4gICAgICAgICAgICAgICAga2V5X2ZpbmRpbmdzOiBbXG4gICAgICAgICAgICAgICAgICAgIGBUb3BpYyBmb2N1c2VzIG9uICR7aW5wdXQuYmxvZ190b3BpYyB8fCAndGhlIHN1YmplY3QgbWF0dGVyJ31gLFxuICAgICAgICAgICAgICAgICAgICBgVGFyZ2V0IGF1ZGllbmNlOiAke2lucHV0LmF1ZGllbmNlX25vdGVzIHx8ICdnZW5lcmFsIGF1ZGllbmNlJ31gLFxuICAgICAgICAgICAgICAgICAgICBgUHJpbWFyeSBrZXl3b3JkOiAke2lucHV0LnByaW1hcnlfa2V5d29yZCB8fCAndG8gYmUgZGV0ZXJtaW5lZCd9YFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgY29tcGV0aXRvcl9pbnNpZ2h0czogW1xuICAgICAgICAgICAgICAgICAgICAnQ29tcGV0aXRvciBjb250ZXh0IHdhcyBub3QgYXZhaWxhYmxlIGluIHBhcnNlZCBtb2RlbCBvdXRwdXQnXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZWNvbW1lbmRlZF9zZWN0aW9uczogW1xuICAgICAgICAgICAgICAgICAgICAnSW50cm9kdWN0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgJ01haW4gQ29udGVudCcsXG4gICAgICAgICAgICAgICAgICAgICdDb25jbHVzaW9uJ1xuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcXVlc3Rpb25zX3RvX2Fuc3dlcjogW1xuICAgICAgICAgICAgICAgICAgICAnV2hhdCBpcyB0aGUgbWFpbiB0b3BpYz8nXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBjbGllbnRfZ29hbF9hbGlnbm1lbnQ6IGlucHV0LmJsb2dfY29udGV4dF9icmllZj8uYnVzaW5lc3NfZ29hbCB8fCBpbnB1dC5idXNpbmVzc19nb2FsIHx8ICdDbGllbnQgZ29hbCBub3Qgc3BlY2lmaWVkJyxcbiAgICAgICAgICAgICAgICBtdXN0X2luY2x1ZGU6IGlucHV0LmJsb2dfY29udGV4dF9icmllZj8ubXVzdF9pbmNsdWRlIHx8IGlucHV0Lm11c3RfaW5jbHVkZSB8fCBbXSxcbiAgICAgICAgICAgICAgICBtdXN0X2F2b2lkOiBpbnB1dC5ibG9nX2NvbnRleHRfYnJpZWY/Lm11c3RfYXZvaWQgfHwgaW5wdXQubXVzdF9hdm9pZCB8fCBbXSxcbiAgICAgICAgICAgICAgICByZXNlYXJjaF9ub3RlczogJ0ZhbGxiYWNrIHJlc2VhcmNoIGR1ZSB0byBwYXJzaW5nIGVycm9yOyBodW1hbiByZXZpZXcgcmVjb21tZW5kZWQnLFxuICAgICAgICAgICAgICAgIHRhcmdldF93b3JkX2NvdW50OiBpbnB1dC50YXJnZXRfd29yZF9jb3VudCB8fCAxMDAwLFxuICAgICAgICAgICAgICAgIHdlYl9zZWFyY2hfdXNlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgbmVlZHNfcmV2aWV3OiB0cnVlLFxuICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIC8vIFBlcnNpc3QgcmVzZWFyY2hfanNvbiB0byBkYXRhYmFzZVxuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBSZXNlYXJjaCBzdGVwOiBQZXJzaXN0aW5nIHJlc2VhcmNoX2pzb24gZm9yIHJ1biAke3J1bklkfWApO1xuICAgICAgICBhd2FpdCB1cGRhdGVSdW5TdGF0dXMocnVuSWQsICdyZXNlYXJjaGluZycsIHJlc2VhcmNoRGF0YSk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFJlc2VhcmNoIHN0ZXA6IENvbXBsZXRlIGZvciBydW4gJHtydW5JZH1gKTtcbiAgICAgICAgcmV0dXJuIHJlc2VhcmNoRGF0YTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKGBbdjBdIFJlc2VhcmNoIHN0ZXAgZXJyb3IgZm9yIHJ1biAke3J1bklkfTpgLCBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcikpO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG59XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9yZXNlYXJjaC1zdGVwLy9ydW5SZXNlYXJjaFN0ZXBcIiwgcnVuUmVzZWFyY2hTdGVwKTtcbiIsICJpbXBvcnQgeyByZWdpc3RlclN0ZXBGdW5jdGlvbiB9IGZyb20gXCJ3b3JrZmxvdy9pbnRlcm5hbC9wcml2YXRlXCI7XG5pbXBvcnQgJ3NlcnZlci1vbmx5JztcbmltcG9ydCB7IGdldFJ1biwgdXBkYXRlUmV2aXNpb25BbmREcmFmdCB9IGZyb20gJy4uLy4uL3N0b3JhZ2UvcnVucyc7XG5pbXBvcnQgeyBxdWVyeSB9IGZyb20gJy4uLy4uL3N0b3JhZ2UvZGInO1xuLyoqX19pbnRlcm5hbF93b3JrZmxvd3N7XCJzdGVwc1wiOntcImxpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvcmV2aXNpb24taGVscGVycy50c1wiOntcImdldFJ1bkZvclJldmlzaW9uU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3JldmlzaW9uLWhlbHBlcnMvL2dldFJ1bkZvclJldmlzaW9uU3RlcFwifSxcInVwZGF0ZUJhdGNoUmV2aXNpb25QZW5kaW5nU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3JldmlzaW9uLWhlbHBlcnMvL3VwZGF0ZUJhdGNoUmV2aXNpb25QZW5kaW5nU3RlcFwifSxcInVwZGF0ZVJldmlzaW9uQW5kRHJhZnRTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvcmV2aXNpb24taGVscGVycy8vdXBkYXRlUmV2aXNpb25BbmREcmFmdFN0ZXBcIn19fX0qLztcbi8qKlxuICogU3RlcCB3cmFwcGVyIHRvIGZldGNoIHJ1biBieSBJRFxuICogSXNvbGF0ZXMgREIgYWNjZXNzIChwZyBtb2R1bGUpIHRvIHN0ZXAgZXhlY3V0aW9uIGNvbnRleHRcbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UnVuRm9yUmV2aXNpb25TdGVwKHJ1bklkKSB7XG4gICAgcmV0dXJuIGdldFJ1bihydW5JZCk7XG59XG4vKipcbiAqIFN0ZXAgd3JhcHBlciB0byB1cGRhdGUgcmV2aXNpb24gYW5kIGRyYWZ0XG4gKiBJc29sYXRlcyBEQiBhY2Nlc3MgKHBnIG1vZHVsZSkgdG8gc3RlcCBleGVjdXRpb24gY29udGV4dFxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiB1cGRhdGVSZXZpc2lvbkFuZERyYWZ0U3RlcChydW5JZCwgcmV2aXNlZE1hcmtkb3duLCBpbnRlcm5hbFJldmlld01ldGFkYXRhKSB7XG4gICAgcmV0dXJuIHVwZGF0ZVJldmlzaW9uQW5kRHJhZnQocnVuSWQsIHJldmlzZWRNYXJrZG93biwgaW50ZXJuYWxSZXZpZXdNZXRhZGF0YSk7XG59XG4vKipcbiAqIFN0ZXAgd3JhcHBlciB0byB1cGRhdGUgc21jX2NvbnRlbnRfYmF0Y2hlcyBzdGF0dXMgZm9yIHJldmlzZWQgYmxvZ1xuICogSXNvbGF0ZXMgREIgYWNjZXNzIChwZyBtb2R1bGUpIHRvIHN0ZXAgZXhlY3V0aW9uIGNvbnRleHRcbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gdXBkYXRlQmF0Y2hSZXZpc2lvblBlbmRpbmdTdGVwKGJhdGNoSWQpIHtcbiAgICBpZiAoIWJhdGNoSWQpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG9rOiB0cnVlLFxuICAgICAgICAgICAgc2tpcHBlZDogdHJ1ZSxcbiAgICAgICAgICAgIHJlYXNvbjogJ05vIGJhdGNoIGlkIHByb3ZpZGVkJ1xuICAgICAgICB9O1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICBhd2FpdCBxdWVyeShgVVBEQVRFIHNtY19jb250ZW50X2JhdGNoZXMgU0VUIHN0YXR1cyA9ICQxLCB1cGRhdGVkX2F0ID0gTk9XKCkgV0hFUkUgaWQgPSAkMmAsIFtcbiAgICAgICAgICAgICdibG9nX3JldmlzZWRfcmV2aWV3X3BlbmRpbmcnLFxuICAgICAgICAgICAgYmF0Y2hJZFxuICAgICAgICBdKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG9rOiB0cnVlLFxuICAgICAgICAgICAgc2tpcHBlZDogZmFsc2VcbiAgICAgICAgfTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBvazogZmFsc2UsXG4gICAgICAgICAgICBza2lwcGVkOiBmYWxzZSxcbiAgICAgICAgICAgIGVycm9yOiBlcnJvck1lc3NhZ2VcbiAgICAgICAgfTtcbiAgICB9XG59XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9yZXZpc2lvbi1oZWxwZXJzLy9nZXRSdW5Gb3JSZXZpc2lvblN0ZXBcIiwgZ2V0UnVuRm9yUmV2aXNpb25TdGVwKTtcbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3JldmlzaW9uLWhlbHBlcnMvL3VwZGF0ZVJldmlzaW9uQW5kRHJhZnRTdGVwXCIsIHVwZGF0ZVJldmlzaW9uQW5kRHJhZnRTdGVwKTtcbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3JldmlzaW9uLWhlbHBlcnMvL3VwZGF0ZUJhdGNoUmV2aXNpb25QZW5kaW5nU3RlcFwiLCB1cGRhdGVCYXRjaFJldmlzaW9uUGVuZGluZ1N0ZXApO1xuIiwgImltcG9ydCB7IHJlZ2lzdGVyU3RlcEZ1bmN0aW9uIH0gZnJvbSBcIndvcmtmbG93L2ludGVybmFsL3ByaXZhdGVcIjtcbmltcG9ydCAnc2VydmVyLW9ubHknO1xuaW1wb3J0IHsgZ2VuZXJhdGVUZXh0IH0gZnJvbSAnYWknO1xuaW1wb3J0IHsgb3BlbmFpIH0gZnJvbSAnQGFpLXNkay9vcGVuYWknO1xuaW1wb3J0IHsgZ2V0QWdlbnRDb25maWcgfSBmcm9tICcuLi8uLi9zdG9yYWdlL2FnZW50LWNvbmZpZ3MnO1xuLyoqX19pbnRlcm5hbF93b3JrZmxvd3N7XCJzdGVwc1wiOntcImxpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvcmV2aXNpb24tc3RlcC50c1wiOntcInJ1blJldmlzaW9uU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3JldmlzaW9uLXN0ZXAvL3J1blJldmlzaW9uU3RlcFwifX19fSovO1xuLyoqXG4gKiBIZWxwZXI6IEZvcm1hdCBhIHZhbHVlIGZvciByZXZpc2lvbiBjb250ZXh0IG91dHB1dFxuICovIGZ1bmN0aW9uIGZvcm1hdFJldmlzaW9uVmFsdWUodmFsdWUsIGZhbGxiYWNrID0gJ05vdCBwcm92aWRlZCcpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB2YWx1ZS50cmltKCkpIHJldHVybiB2YWx1ZS50cmltKCk7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgfHwgdHlwZW9mIHZhbHVlID09PSAnYm9vbGVhbicpIHJldHVybiBTdHJpbmcodmFsdWUpO1xuICAgIHJldHVybiBmYWxsYmFjaztcbn1cbi8qKlxuICogSGVscGVyOiBGb3JtYXQgYSBsaXN0IG9mIHZhbHVlcyBmb3IgcmV2aXNpb24gY29udGV4dCBvdXRwdXRcbiAqLyBmdW5jdGlvbiBmb3JtYXRSZXZpc2lvbkxpc3QodmFsdWVzLCBmYWxsYmFjayA9ICdOb25lIHByb3ZpZGVkJykge1xuICAgIGlmICghQXJyYXkuaXNBcnJheSh2YWx1ZXMpIHx8IHZhbHVlcy5sZW5ndGggPT09IDApIHJldHVybiBmYWxsYmFjaztcbiAgICBjb25zdCBjbGVhbmVkID0gdmFsdWVzLm1hcCgoaXRlbSk9PnR5cGVvZiBpdGVtID09PSAnc3RyaW5nJyA/IGl0ZW0udHJpbSgpIDogU3RyaW5nKGl0ZW0pKS5maWx0ZXIoQm9vbGVhbik7XG4gICAgaWYgKGNsZWFuZWQubGVuZ3RoID09PSAwKSByZXR1cm4gZmFsbGJhY2s7XG4gICAgcmV0dXJuIGNsZWFuZWQubWFwKChpdGVtKT0+YC0gJHtpdGVtfWApLmpvaW4oJ1xcbicpO1xufVxuLyoqXG4gKiBIZWxwZXI6IEZvcm1hdCBhIEpTT04gb2JqZWN0IGZvciByZXZpc2lvbiBjb250ZXh0IG91dHB1dFxuICovIGZ1bmN0aW9uIGZvcm1hdFJldmlzaW9uSnNvbih2YWx1ZSwgZmFsbGJhY2sgPSAnTm9uZSBwcm92aWRlZCcpIHtcbiAgICBpZiAoIXZhbHVlIHx8IHR5cGVvZiB2YWx1ZSAhPT0gJ29iamVjdCcpIHJldHVybiBmYWxsYmFjaztcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodmFsdWUsIG51bGwsIDIpO1xufVxuLyoqXG4gKiBCdWlsZCBsZWFuIHJldmlzaW9uIGNvbnRleHQgKGxpbWl0ZWQgdG8gZXNzZW50aWFsIGZpZWxkcyBvbmx5KVxuICogRG9lcyBOT1QgaW5jbHVkZSBmdWxsIHJlc2VhcmNoLCBvdXRsaW5lLCBtZXRhLCBvciBibG9nIGNvbnRleHQgYnJpZWZcbiAqIHRvIGtlZXAgdGhlIFJldmlzaW9uIEFnZW50IGZvY3VzZWQgb24gYXBwbHlpbmcgZmVlZGJhY2ssIG5vdCByZS1wbGFubmluZ1xuICovIGZ1bmN0aW9uIGJ1aWxkTGVhblJldmlzaW9uQ29udGV4dChpbnB1dCkge1xuICAgIGNvbnN0IGJyaWVmID0gaW5wdXQuYmxvZ19jb250ZXh0X2JyaWVmID8/IHt9O1xuICAgIGNvbnN0IGJyaWVmUmVjb3JkID0gYnJpZWY7XG4gICAgY29uc3QgbXVzdEluY2x1ZGUgPSBBcnJheS5pc0FycmF5KGJyaWVmLm11c3RfaW5jbHVkZSkgJiYgYnJpZWYubXVzdF9pbmNsdWRlLmxlbmd0aCA+IDAgPyBicmllZi5tdXN0X2luY2x1ZGUgOiBpbnB1dC5tdXN0X2luY2x1ZGU7XG4gICAgY29uc3QgbXVzdEF2b2lkID0gQXJyYXkuaXNBcnJheShicmllZi5tdXN0X2F2b2lkKSAmJiBicmllZi5tdXN0X2F2b2lkLmxlbmd0aCA+IDAgPyBicmllZi5tdXN0X2F2b2lkIDogaW5wdXQubXVzdF9hdm9pZDtcbiAgICBjb25zdCBicmFuZFZvaWNlID0gYnJpZWYuYnJhbmRfdm9pY2Vfbm90ZXMgfHwgaW5wdXQuYnJhbmRfdm9pY2Vfbm90ZXMgfHwgaW5wdXQudG9uZTtcbiAgICBjb25zdCBvcmRlckNvbnRleHQgPSBpbnB1dC5vcmRlcl9jb250ZXh0IHx8IGJyaWVmUmVjb3JkLm9yZGVyX2NvbnRleHQgfHwge307XG4gICAgcmV0dXJuIGAjIyBMaW1pdGVkIFJldmlzaW9uIENvbnRleHRcblxuVXNlIHRoaXMgY29udGV4dCBvbmx5IHRvIHN1cHBvcnQgdGhlIHJlcXVlc3RlZCByZXZpc2lvbi5cbkRvIG5vdCByZXN0YXJ0LCByZS1wbGFuLCBvciByZWdlbmVyYXRlIHRoZSBhcnRpY2xlIGZyb20gdGhpcyBjb250ZXh0LlxuXG5CdXNpbmVzcyBOYW1lOiAke2Zvcm1hdFJldmlzaW9uVmFsdWUoaW5wdXQuYnVzaW5lc3NfbmFtZSl9XG5DbGllbnQgTmFtZTogJHtmb3JtYXRSZXZpc2lvblZhbHVlKGlucHV0LmNsaWVudF9uYW1lKX1cbldlYnNpdGUgVVJMOiAke2Zvcm1hdFJldmlzaW9uVmFsdWUoaW5wdXQud2Vic2l0ZV91cmwpfVxuQmxvZyBUb3BpYzogJHtmb3JtYXRSZXZpc2lvblZhbHVlKGlucHV0LmJsb2dfdG9waWMgfHwgaW5wdXQudG9waWMpfVxuUHJpbWFyeSBLZXl3b3JkOiAke2Zvcm1hdFJldmlzaW9uVmFsdWUoaW5wdXQucHJpbWFyeV9rZXl3b3JkKX1cblNlY29uZGFyeSBLZXl3b3JkczpcbiR7Zm9ybWF0UmV2aXNpb25MaXN0KGlucHV0LnNlY29uZGFyeV9rZXl3b3JkcyB8fCBpbnB1dC5rZXl3b3Jkcyl9XG5UYXJnZXQgV29yZCBDb3VudDogJHtmb3JtYXRSZXZpc2lvblZhbHVlKGlucHV0LnRhcmdldF93b3JkX2NvdW50KX1cbkJyYW5kIFZvaWNlIE5vdGVzOiAke2Zvcm1hdFJldmlzaW9uVmFsdWUoYnJhbmRWb2ljZSl9XG5BdWRpZW5jZSBOb3RlczogJHtmb3JtYXRSZXZpc2lvblZhbHVlKGlucHV0LmF1ZGllbmNlX25vdGVzKX1cbkNUQSBOb3RlczogJHtmb3JtYXRSZXZpc2lvblZhbHVlKGlucHV0LmN0YV9ub3RlcyB8fCBpbnB1dC5jdGEpfVxuQWRkaXRpb25hbCBPcmRlciBOb3RlczogJHtmb3JtYXRSZXZpc2lvblZhbHVlKGlucHV0LmFkZGl0aW9uYWxfb3JkZXJfbm90ZXMpfVxuXG5NdXN0IEluY2x1ZGU6XG4ke2Zvcm1hdFJldmlzaW9uTGlzdChtdXN0SW5jbHVkZSl9XG5cbk11c3QgQXZvaWQ6XG4ke2Zvcm1hdFJldmlzaW9uTGlzdChtdXN0QXZvaWQpfVxuXG5PcmlnaW5hbCBPcmRlciBDb250ZXh0OlxuJHtmb3JtYXRSZXZpc2lvbkpzb24ob3JkZXJDb250ZXh0KX1gO1xufVxuLyoqXG4gKiBSZXZpc2lvbiBBZ2VudCBTdGVwXG4gKiBSZXZpc2VzIGFuIGV4aXN0aW5nIGRyYWZ0IGJhc2VkIG9uIHJldmlld2VyIGZlZWRiYWNrLlxuICogRG9lcyBOT1QgdXBkYXRlIHRoZSBkYXRhYmFzZSBvciBjYWxsIGNhbGxiYWNrcy5cbiAqIFJldHVybnMgcmV2aXNlZCBNYXJrZG93biBvbmx5LCBmb3IgdXNlIGJ5IHJldmlzaW9uLXdvcmtmbG93LnRzLlxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5SZXZpc2lvblN0ZXAoY3VycmVudERyYWZ0LCByZXZpZXdlckZlZWRiYWNrLCByZXZpc2lvbk1vZGUsIGlucHV0LCByZXNlYXJjaCwgb3V0bGluZSwgc2VvUWEsIG1ldGEpIHtcbiAgICBjb25zb2xlLmxvZyhgW3YwXSBSZXZpc2lvbiBzdGVwOiBTdGFydGluZyB3aXRoIG1vZGU6ICR7cmV2aXNpb25Nb2RlfWApO1xuICAgIHRyeSB7XG4gICAgICAgIC8vIExvYWQgYWdlbnQgY29uZmlnIGZyb20gZGF0YWJhc2VcbiAgICAgICAgY29uc3QgYWdlbnRDb25maWcgPSBhd2FpdCBnZXRBZ2VudENvbmZpZygncmV2aXNpb24nKTtcbiAgICAgICAgaWYgKCFhZ2VudENvbmZpZykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBY3RpdmUgYWdlbnQgY29uZmlnIG5vdCBmb3VuZCBmb3IgYWdlbnRfa2V5OiByZXZpc2lvbicpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFNFTyBCbG9nIEFnZW50IENvbmZpZyBMb2FkZWQ6IHJldmlzaW9uIHYke2FnZW50Q29uZmlnLnZlcnNpb259YCk7XG4gICAgICAgIC8vIEJ1aWxkIHN5c3RlbSBwcm9tcHQgZnJvbSBkYXRhYmFzZSBjb25maWdcbiAgICAgICAgY29uc3Qgc3lzdGVtUHJvbXB0ID0gW1xuICAgICAgICAgICAgYWdlbnRDb25maWcuc3lzdGVtX3Byb21wdCxcbiAgICAgICAgICAgIGFnZW50Q29uZmlnLnNraWxsX21hcmtkb3duXG4gICAgICAgIF0uZmlsdGVyKEJvb2xlYW4pLmpvaW4oJ1xcblxcbicpO1xuICAgICAgICAvLyBCdWlsZCByZXZpc2lvbiBpbnN0cnVjdGlvbiBiYXNlZCBvbiBtb2RlXG4gICAgICAgIGNvbnN0IHJldmlzaW9uSW5zdHJ1Y3Rpb24gPSByZXZpc2lvbk1vZGUgPT09ICdoZWF2eV9yZXZpc2lvbicgPyAnQXBwbHkgY29tcHJlaGVuc2l2ZSBjaGFuZ2VzIHJlcXVlc3RlZCBieSB0aGUgZmVlZGJhY2suIFlvdSBtYXkgcmVzdHJ1Y3R1cmUgc2VjdGlvbnMgaWYgbmVlZGVkLCBidXQga2VlcCB0aGUgc2FtZSBjb3JlIHRvcGljLCBwcmltYXJ5IGtleXdvcmQsIGFuZCBwdWJsaXNoaW5nIGludGVudCB1bmxlc3MgdGhlIGZlZWRiYWNrIGV4cGxpY2l0bHkgYXNrcyBmb3IgYSBuZXcgZGlyZWN0aW9uLiBQcmVzZXJ2ZSB0aGUgZXhpc3RpbmcgSDEvdGl0bGUgdW5sZXNzIHRoZSByZXZpZXdlciBleHBsaWNpdGx5IGFza3MgdG8gY2hhbmdlIGl0LiBEbyBub3QgaW52ZW50IG5ldyBmYWN0cy4nIDogJ0FwcGx5IGZvY3VzZWQgY2hhbmdlcyByZXF1ZXN0ZWQgYnkgdGhlIGZlZWRiYWNrLiBQb2xpc2ggdGhlIGV4aXN0aW5nIHN0cnVjdHVyZSwgcmVmaW5lIHdvcmRpbmcsIGFuZCBrZWVwIHNlY3Rpb25zIGFuZCB0aGUgZXhpc3RpbmcgSDEvdGl0bGUgaW50YWN0IHdoZXJlIHBvc3NpYmxlLic7XG4gICAgICAgIC8vIEJ1aWxkIGxlYW4gcmV2aXNpb24gY29udGV4dCAoZXNzZW50aWFsIGZpZWxkcyBvbmx5LCBubyBmdWxsIHJlc2VhcmNoL291dGxpbmUvbWV0YSlcbiAgICAgICAgY29uc3QgY29udGV4dEJsb2NrID0gaW5wdXQgPyBgXFxuXFxuJHtidWlsZExlYW5SZXZpc2lvbkNvbnRleHQoaW5wdXQpfWAgOiAnJztcbiAgICAgICAgLy8gRm9yIFYxLCBkbyBub3QgaW5jbHVkZSBmdWxsIHJlc2VhcmNoLCBvdXRsaW5lLCBzZW9RYSwgb3IgbWV0YSBjb250ZXh0XG4gICAgICAgIC8vIHRvIGtlZXAgdGhlIGFnZW50IGZvY3VzZWQgb24gYXBwbHlpbmcgZmVlZGJhY2ssIG5vdCByZS1wbGFubmluZ1xuICAgICAgICB2b2lkIHJlc2VhcmNoO1xuICAgICAgICB2b2lkIG91dGxpbmU7XG4gICAgICAgIHZvaWQgc2VvUWE7XG4gICAgICAgIHZvaWQgbWV0YTtcbiAgICAgICAgY29uc3QgYWRkaXRpb25hbENvbnRleHQgPSBbXTtcbiAgICAgICAgLy8gVmFsaWRhdGUgaW5wdXRzXG4gICAgICAgIGlmICghY3VycmVudERyYWZ0IHx8ICFjdXJyZW50RHJhZnQudHJpbSgpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1JldmlzaW9uIHN0ZXAgbWlzc2luZyBjdXJyZW50RHJhZnQnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXJldmlld2VyRmVlZGJhY2sgfHwgIXJldmlld2VyRmVlZGJhY2sudHJpbSgpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1JldmlzaW9uIHN0ZXAgbWlzc2luZyByZXZpZXdlckZlZWRiYWNrJyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQnVpbGQgdXNlciBtZXNzYWdlXG4gICAgICAgIGNvbnN0IHVzZXJNZXNzYWdlID0gYFJldmlzZSB0aGUgYmxvZyBkcmFmdCBiZWxvdyB1c2luZyB0aGUgcmV2aWV3ZXIgZmVlZGJhY2sgcHJvdmlkZWQuXG5cblJldmlzaW9uIE1vZGU6ICR7cmV2aXNpb25Nb2RlfVxuJHtyZXZpc2lvbkluc3RydWN0aW9ufVxuXG5QdWJsaXNoaW5nIE5vdGU6XG5UaGlzIHJldmlzaW9uIGRvZXMgbm90IHJlZ2VuZXJhdGUgbWV0YSB0aXRsZSwgc2x1Zywgb3Igc29jaWFsIHByZXZpZXcuIFByZXNlcnZlIHRoZSBzYW1lIGNvcmUgdG9waWMsIHByaW1hcnkga2V5d29yZCwgYXJ0aWNsZSBhbmdsZSwgYW5kIEgxL3RpdGxlIHVubGVzcyByZXZpZXdlciBmZWVkYmFjayBleHBsaWNpdGx5IGFza3MgdG8gY2hhbmdlIHRoZW0uXG5cblJldmlld2VyIEZlZWRiYWNrOlxuJHtyZXZpZXdlckZlZWRiYWNrfSR7Y29udGV4dEJsb2NrfSR7YWRkaXRpb25hbENvbnRleHQuam9pbignJyl9XG5cbkN1cnJlbnQgRHJhZnQgTWFya2Rvd246XG4ke2N1cnJlbnREcmFmdH1cblxuUmV0dXJuIHRoZSByZXZpc2VkIGJsb2cgaW4gTWFya2Rvd24gb25seS4gRG8gbm90IHJldHVybiBKU09OLiBEbyBub3QgaW5jbHVkZSBleHBsYW5hdGlvbnMsIHJldmlzaW9uIG5vdGVzLCBtYXJrZG93biBmZW5jZXMsIG9yIGNvbW1lbnRzIG91dHNpZGUgdGhlIGFydGljbGUuYDtcbiAgICAgICAgLy8gR2V0IG1vZGVsIG5hbWU6IHVzZSBEQiBjb25maWcgaWYgYXZhaWxhYmxlLCBvdGhlcndpc2UgZmFsbCBiYWNrIHRvIGVudiB2YXIgb3IgZGVmYXVsdFxuICAgICAgICBjb25zdCBtb2RlbE5hbWUgPSBhZ2VudENvbmZpZy5tb2RlbCB8fCBwcm9jZXNzLmVudi5SRVZJU0lPTl9BR0VOVF9NT0RFTCB8fCBwcm9jZXNzLmVudi5FRElUT1JfQUdFTlRfTU9ERUwgfHwgJ2dwdC01LjQtbWluaSc7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFJldmlzaW9uIHN0ZXA6IFVzaW5nIG1vZGVsOiAke21vZGVsTmFtZX1gKTtcbiAgICAgICAgLy8gQ2FsbCBBSSBtb2RlbCB2aWEgZGlyZWN0IE9wZW5BSSBwcm92aWRlclxuICAgICAgICBjb25zdCBtb2RlbCA9IG9wZW5haShtb2RlbE5hbWUpO1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGdlbmVyYXRlVGV4dCh7XG4gICAgICAgICAgICBtb2RlbCxcbiAgICAgICAgICAgIHN5c3RlbTogc3lzdGVtUHJvbXB0LFxuICAgICAgICAgICAgcHJvbXB0OiB1c2VyTWVzc2FnZSxcbiAgICAgICAgICAgIHRlbXBlcmF0dXJlOiAwLjcsXG4gICAgICAgICAgICBtYXhPdXRwdXRUb2tlbnM6IDgwMDBcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IHJldmlzZWRNYXJrZG93biA9IHJlc3BvbnNlLnRleHQudHJpbSgpO1xuICAgICAgICAvLyBWYWxpZGF0ZSBvdXRwdXRcbiAgICAgICAgaWYgKCFyZXZpc2VkTWFya2Rvd24gfHwgcmV2aXNlZE1hcmtkb3duLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZXZpc2lvbiBBZ2VudCByZXR1cm5lZCBlbXB0eSBvdXRwdXQnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocmV2aXNlZE1hcmtkb3duLnN0YXJ0c1dpdGgoJ3snKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZXZpc2lvbiBvdXRwdXQgaW52YWxpZDogZXhwZWN0ZWQgTWFya2Rvd24sIHJlY2VpdmVkIEpTT04tbGlrZSByZXNwb25zZScpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyZXZpc2VkTWFya2Rvd24ubGVuZ3RoIDwgTWF0aC5taW4oNTAwLCBNYXRoLmZsb29yKGN1cnJlbnREcmFmdC5sZW5ndGggKiAwLjQpKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZXZpc2lvbiBvdXRwdXQgdG9vIHNob3J0IGNvbXBhcmVkIHdpdGggb3JpZ2luYWwgZHJhZnQnKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByZXZpc2lvbk91dHB1dCA9IHtcbiAgICAgICAgICAgIHJldmlzZWRfbWFya2Rvd246IHJldmlzZWRNYXJrZG93bixcbiAgICAgICAgICAgIHJldmlzaW9uX21vZGU6IHJldmlzaW9uTW9kZSxcbiAgICAgICAgICAgIGZlZWRiYWNrX2FwcGxpZWQ6IHJldmlld2VyRmVlZGJhY2suc3Vic3RyaW5nKDAsIDIwMCksXG4gICAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgICAgICB9O1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBSZXZpc2lvbiBzdGVwOiBDb21wbGV0ZSAoJHtyZXZpc2VkTWFya2Rvd24ubGVuZ3RofSBjaGFycylgKTtcbiAgICAgICAgcmV0dXJuIHJldmlzaW9uT3V0cHV0O1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgY29uc29sZS5lcnJvcihgW3YwXSBSZXZpc2lvbiBzdGVwIGVycm9yOiAke2Vycm9yTWVzc2FnZX1gKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxufVxucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvcmV2aXNpb24tc3RlcC8vcnVuUmV2aXNpb25TdGVwXCIsIHJ1blJldmlzaW9uU3RlcCk7XG4iLCAiaW1wb3J0IHsgcmVnaXN0ZXJTdGVwRnVuY3Rpb24gfSBmcm9tIFwid29ya2Zsb3cvaW50ZXJuYWwvcHJpdmF0ZVwiO1xuaW1wb3J0ICdzZXJ2ZXItb25seSc7XG5pbXBvcnQgeyBnZW5lcmF0ZVRleHQgfSBmcm9tICdhaSc7XG5pbXBvcnQgeyBvcGVuYWkgfSBmcm9tICdAYWktc2RrL29wZW5haSc7XG5pbXBvcnQgeyB1cGRhdGVSdW5TdGF0dXMgfSBmcm9tICcuLi8uLi9zdG9yYWdlL3J1bnMnO1xuaW1wb3J0IHsgZ2V0QWdlbnRDb25maWcgfSBmcm9tICcuLi8uLi9zdG9yYWdlL2FnZW50LWNvbmZpZ3MnO1xuaW1wb3J0IHsgYnVpbGRGdWxsSW5wdXRDb250ZXh0LCBleHRyYWN0SnNvbk9iamVjdCB9IGZyb20gJy4vY29udGV4dC1idWlsZGVyJztcbi8qKl9faW50ZXJuYWxfd29ya2Zsb3dze1wic3RlcHNcIjp7XCJsaWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3Nlby1xYS1zdGVwLnRzXCI6e1wicnVuU2VvUWFTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvc2VvLXFhLXN0ZXAvL3J1blNlb1FhU3RlcFwifX19fSovO1xuY29uc3QgVkFMSURfUkVDT01NRU5ERURfQUNUSU9OUyA9IFtcbiAgICAnQXBwcm92ZSBmb3IgZWRpdG9yJyxcbiAgICAnUmV2aXNlIGJlZm9yZSBlZGl0b3InLFxuICAgICdOZWVkcyBodW1hbiByZXZpZXcnXG5dO1xuLyoqXG4gKiBTRU8gUUEgU3RlcCAtIFBoYXNlIDJDLURcbiAqIFJldmlld3MgZHJhZnQgbWFya2Rvd24gYWdhaW5zdCBTRU8gYW5kIGNsaWVudC1nb2FsIGNyaXRlcmlhLlxuICogUmV0dXJucyBzdHJ1Y3R1cmVkIGF1ZGl0IEpTT04uIERvZXMgbm90IHJld3JpdGUgdGhlIGRyYWZ0LlxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5TZW9RYVN0ZXAocnVuSWQsIGlucHV0LCByZXNlYXJjaERhdGEsIG91dGxpbmVEYXRhLCBkcmFmdE1hcmtkb3duKSB7XG4gICAgY29uc29sZS5sb2coYFt2MF0gU0VPIFFBIHN0ZXA6IEF1ZGl0aW5nIGRyYWZ0IGZvciBydW4gJHtydW5JZH1gKTtcbiAgICBpZiAoIWRyYWZ0TWFya2Rvd24pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdEcmFmdCBtYXJrZG93biBpcyByZXF1aXJlZCBmb3IgU0VPIFFBIHJldmlldycpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICBjb25zdCBhZ2VudENvbmZpZyA9IGF3YWl0IGdldEFnZW50Q29uZmlnKCdzZW9fcWEnKTtcbiAgICAgICAgaWYgKCFhZ2VudENvbmZpZykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBY3RpdmUgYWdlbnQgY29uZmlnIG5vdCBmb3VuZCBmb3IgYWdlbnRfa2V5OiBzZW9fcWEnKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBTRU8gQmxvZyBBZ2VudCBDb25maWcgTG9hZGVkOiBzZW9fcWEgdiR7YWdlbnRDb25maWcudmVyc2lvbn1gKTtcbiAgICAgICAgY29uc3Qgc3lzdGVtUHJvbXB0ID0gW1xuICAgICAgICAgICAgYWdlbnRDb25maWcuc3lzdGVtX3Byb21wdCxcbiAgICAgICAgICAgIGFnZW50Q29uZmlnLnNraWxsX21hcmtkb3duXG4gICAgICAgIF0uZmlsdGVyKEJvb2xlYW4pLmpvaW4oJ1xcblxcbicpO1xuICAgICAgICBjb25zdCBtb2RlbE5hbWUgPSBhZ2VudENvbmZpZy5tb2RlbCB8fCBwcm9jZXNzLmVudi5TRU9fUUFfQUdFTlRfTU9ERUwgfHwgcHJvY2Vzcy5lbnYuUkVTRUFSQ0hfQUdFTlRfTU9ERUwgfHwgJ2dwdC01LjQtbWluaSc7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFNFTyBRQSBzdGVwOiBVc2luZyBtb2RlbDogJHttb2RlbE5hbWV9YCk7XG4gICAgICAgIGNvbnN0IHNlb1FhUHJvbXB0ID0gYFJldmlldyB0aGlzIGRyYWZ0IHVzaW5nIHRoZSBTRU8gUUEgc2NoZW1hIGZyb20geW91ciBzeXN0ZW0gaW5zdHJ1Y3Rpb25zLlxcblxcbiR7YnVpbGRGdWxsSW5wdXRDb250ZXh0KGlucHV0KX1cXG5cXG5SZXNlYXJjaCBBZ2VudCBPdXRwdXQ6XFxuJHtKU09OLnN0cmluZ2lmeShyZXNlYXJjaERhdGEgPz8ge30sIG51bGwsIDIpfVxcblxcbk91dGxpbmUgQWdlbnQgT3V0cHV0OlxcbiR7SlNPTi5zdHJpbmdpZnkob3V0bGluZURhdGEgPz8ge30sIG51bGwsIDIpfVxcblxcbkJsb2cgRHJhZnQgTWFya2Rvd246XFxuJHtkcmFmdE1hcmtkb3dufVxcblxcblJldHVybiB2YWxpZCBKU09OIG9ubHkuIERvIG5vdCByZXdyaXRlIHRoZSBkcmFmdC4gRG8gbm90IGluY2x1ZGUgbWFya2Rvd24gZmVuY2VzIG9yIGV4cGxhbmF0aW9uIHRleHQuIFRoZSByZWNvbW1lbmRlZF9uZXh0X2FjdGlvbiBtdXN0IGJlIGV4YWN0bHkgb25lIG9mOiAke1ZBTElEX1JFQ09NTUVOREVEX0FDVElPTlMubWFwKCh2YWx1ZSk9PmBcIiR7dmFsdWV9XCJgKS5qb2luKCcsICcpfS5gO1xuICAgICAgICBjb25zdCB7IHRleHQgfSA9IGF3YWl0IGdlbmVyYXRlVGV4dCh7XG4gICAgICAgICAgICBtb2RlbDogb3BlbmFpKG1vZGVsTmFtZSksXG4gICAgICAgICAgICBzeXN0ZW06IHN5c3RlbVByb21wdCxcbiAgICAgICAgICAgIHByb21wdDogc2VvUWFQcm9tcHQsXG4gICAgICAgICAgICB0ZW1wZXJhdHVyZTogMC40LFxuICAgICAgICAgICAgbWF4T3V0cHV0VG9rZW5zOiAzMDAwXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBTRU8gUUEgc3RlcDogUmVjZWl2ZWQgYXVkaXQgZnJvbSBtb2RlbCwgcGFyc2luZyBKU09OYCk7XG4gICAgICAgIGxldCBzZW9RYVJlc3VsdDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHNlb1FhUmVzdWx0ID0gSlNPTi5wYXJzZShleHRyYWN0SnNvbk9iamVjdCh0ZXh0KSk7XG4gICAgICAgIH0gY2F0Y2ggKHBhcnNlRXJyKSB7XG4gICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gcGFyc2VFcnIgaW5zdGFuY2VvZiBFcnJvciA/IHBhcnNlRXJyLm1lc3NhZ2UgOiBTdHJpbmcocGFyc2VFcnIpO1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBTRU8gUUEgb3V0cHV0IHBhcnNlIGZhaWxlZDogJHttZXNzYWdlfWApO1xuICAgICAgICB9XG4gICAgICAgIHZhbGlkYXRlU2VvUWFPdXRwdXQoc2VvUWFSZXN1bHQpO1xuICAgICAgICBzZW9RYVJlc3VsdC50aW1lc3RhbXAgPSBzZW9RYVJlc3VsdC50aW1lc3RhbXAgfHwgbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBTRU8gUUEgc3RlcDogUGVyc2lzdGluZyBTRU8gUUEgYXVkaXQgKHNjb3JlOiAke3Nlb1FhUmVzdWx0Lm92ZXJhbGxfc2NvcmV9KSBmb3IgcnVuICR7cnVuSWR9YCk7XG4gICAgICAgIGF3YWl0IHVwZGF0ZVJ1blN0YXR1cyhydW5JZCwgJ3Nlb19xYScsIHNlb1FhUmVzdWx0KTtcbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gU0VPIFFBIHN0ZXA6IENvbXBsZXRlIGZvciBydW4gJHtydW5JZH1gKTtcbiAgICAgICAgcmV0dXJuIHNlb1FhUmVzdWx0O1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTXNnID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICBjb25zb2xlLmVycm9yKGBbdjBdIFNFTyBRQSBzdGVwOiBFcnJvciBkdXJpbmcgYXVkaXQgZm9yIHJ1biAke3J1bklkfTogJHtlcnJvck1zZ31gKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxufVxuZnVuY3Rpb24gdmFsaWRhdGVTZW9RYU91dHB1dChvdXRwdXQpIHtcbiAgICBjb25zdCBtaXNzaW5nRmllbGRzID0gW107XG4gICAgY29uc3QgcmVxdWlyZWRGaWVsZHMgPSBbXG4gICAgICAgICdvdmVyYWxsX3Njb3JlJyxcbiAgICAgICAgJ3JlYWR5X2Zvcl9lZGl0b3InLFxuICAgICAgICAncmVjb21tZW5kZWRfbmV4dF9hY3Rpb24nLFxuICAgICAgICAnc2VhcmNoX2ludGVudF9hbGlnbm1lbnQnLFxuICAgICAgICAncHJpbWFyeV9rZXl3b3JkX3VzYWdlJyxcbiAgICAgICAgJ3NlY29uZGFyeV9rZXl3b3JkX3VzYWdlJyxcbiAgICAgICAgJ2hlYWRpbmdfc3RydWN0dXJlX3JldmlldycsXG4gICAgICAgICdjb250ZW50X2RlcHRoX3JldmlldycsXG4gICAgICAgICdyZWFkYWJpbGl0eV9yZXZpZXcnLFxuICAgICAgICAnY3RhX3JldmlldycsXG4gICAgICAgICdpbnRlcm5hbF9saW5raW5nX3JldmlldycsXG4gICAgICAgICdjbGllbnRfZ29hbF9hbGlnbm1lbnQnLFxuICAgICAgICAncHJpb3JpdHlfZml4ZXMnLFxuICAgICAgICAncmlza19mbGFncycsXG4gICAgICAgICduZWVkc19yZXZpZXcnXG4gICAgXTtcbiAgICBmb3IgKGNvbnN0IGZpZWxkIG9mIHJlcXVpcmVkRmllbGRzKXtcbiAgICAgICAgaWYgKG91dHB1dFtmaWVsZF0gPT09IHVuZGVmaW5lZCB8fCBvdXRwdXRbZmllbGRdID09PSBudWxsKSB7XG4gICAgICAgICAgICBtaXNzaW5nRmllbGRzLnB1c2goZmllbGQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChtaXNzaW5nRmllbGRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBTRU8gUUEgb3V0cHV0IG1pc3NpbmcgcmVxdWlyZWQgZmllbGRzOiAke21pc3NpbmdGaWVsZHMuam9pbignLCAnKX1gKTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBvdXRwdXQub3ZlcmFsbF9zY29yZSAhPT0gJ251bWJlcicgfHwgb3V0cHV0Lm92ZXJhbGxfc2NvcmUgPCAwIHx8IG91dHB1dC5vdmVyYWxsX3Njb3JlID4gMTAwKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgU0VPIFFBIG91dHB1dCBpbnZhbGlkIG92ZXJhbGxfc2NvcmU6ICR7b3V0cHV0Lm92ZXJhbGxfc2NvcmV9LCBtdXN0IGJlIG51bWJlciBiZXR3ZWVuIDAtMTAwYCk7XG4gICAgfVxuICAgIGlmICh0eXBlb2Ygb3V0cHV0LnJlYWR5X2Zvcl9lZGl0b3IgIT09ICdib29sZWFuJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NFTyBRQSBvdXRwdXQgaW52YWxpZCByZWFkeV9mb3JfZWRpdG9yOiBleHBlY3RlZCBib29sZWFuJyk7XG4gICAgfVxuICAgIGlmICghVkFMSURfUkVDT01NRU5ERURfQUNUSU9OUy5pbmNsdWRlcyhvdXRwdXQucmVjb21tZW5kZWRfbmV4dF9hY3Rpb24pKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgU0VPIFFBIG91dHB1dCBpbnZhbGlkIHJlY29tbWVuZGVkX25leHRfYWN0aW9uOiAke291dHB1dC5yZWNvbW1lbmRlZF9uZXh0X2FjdGlvbn1gKTtcbiAgICB9XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KG91dHB1dC5wcmlvcml0eV9maXhlcykpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTRU8gUUEgb3V0cHV0IGludmFsaWQgcHJpb3JpdHlfZml4ZXM6IGV4cGVjdGVkIGFycmF5Jyk7XG4gICAgfVxuICAgIGlmICghQXJyYXkuaXNBcnJheShvdXRwdXQucmlza19mbGFncykpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTRU8gUUEgb3V0cHV0IGludmFsaWQgcmlza19mbGFnczogZXhwZWN0ZWQgYXJyYXknKTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBvdXRwdXQubmVlZHNfcmV2aWV3ICE9PSAnYm9vbGVhbicpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTRU8gUUEgb3V0cHV0IGludmFsaWQgbmVlZHNfcmV2aWV3OiBleHBlY3RlZCBib29sZWFuJyk7XG4gICAgfVxuICAgIHZhbGlkYXRlU2NvcmVPYmplY3Qob3V0cHV0LnNlYXJjaF9pbnRlbnRfYWxpZ25tZW50LCAnc2VhcmNoX2ludGVudF9hbGlnbm1lbnQnKTtcbiAgICB2YWxpZGF0ZVNjb3JlT2JqZWN0KG91dHB1dC5wcmltYXJ5X2tleXdvcmRfdXNhZ2UsICdwcmltYXJ5X2tleXdvcmRfdXNhZ2UnKTtcbiAgICB2YWxpZGF0ZVNjb3JlT2JqZWN0KG91dHB1dC5zZWNvbmRhcnlfa2V5d29yZF91c2FnZSwgJ3NlY29uZGFyeV9rZXl3b3JkX3VzYWdlJyk7XG4gICAgdmFsaWRhdGVTY29yZU9iamVjdChvdXRwdXQuaGVhZGluZ19zdHJ1Y3R1cmVfcmV2aWV3LCAnaGVhZGluZ19zdHJ1Y3R1cmVfcmV2aWV3Jyk7XG4gICAgdmFsaWRhdGVTY29yZU9iamVjdChvdXRwdXQuY29udGVudF9kZXB0aF9yZXZpZXcsICdjb250ZW50X2RlcHRoX3JldmlldycpO1xuICAgIHZhbGlkYXRlU2NvcmVPYmplY3Qob3V0cHV0LnJlYWRhYmlsaXR5X3JldmlldywgJ3JlYWRhYmlsaXR5X3JldmlldycpO1xuICAgIHZhbGlkYXRlU2NvcmVPYmplY3Qob3V0cHV0LmN0YV9yZXZpZXcsICdjdGFfcmV2aWV3Jyk7XG4gICAgdmFsaWRhdGVTY29yZU9iamVjdChvdXRwdXQuaW50ZXJuYWxfbGlua2luZ19yZXZpZXcsICdpbnRlcm5hbF9saW5raW5nX3JldmlldycpO1xuICAgIHZhbGlkYXRlU2NvcmVPYmplY3Qob3V0cHV0LmNsaWVudF9nb2FsX2FsaWdubWVudCwgJ2NsaWVudF9nb2FsX2FsaWdubWVudCcpO1xufVxuZnVuY3Rpb24gdmFsaWRhdGVTY29yZU9iamVjdCh2YWx1ZSwgZmllbGROYW1lKSB7XG4gICAgaWYgKCF2YWx1ZSB8fCB0eXBlb2YgdmFsdWUgIT09ICdvYmplY3QnKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgU0VPIFFBIG91dHB1dCBpbnZhbGlkICR7ZmllbGROYW1lfTogZXhwZWN0ZWQgb2JqZWN0YCk7XG4gICAgfVxuICAgIGNvbnN0IHNjb3JlID0gdmFsdWUuc2NvcmU7XG4gICAgaWYgKHR5cGVvZiBzY29yZSAhPT0gJ251bWJlcicgfHwgc2NvcmUgPCAwIHx8IHNjb3JlID4gMTAwKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgU0VPIFFBIG91dHB1dCBpbnZhbGlkICR7ZmllbGROYW1lfS5zY29yZTogJHtTdHJpbmcoc2NvcmUpfSwgbXVzdCBiZSBudW1iZXIgYmV0d2VlbiAwLTEwMGApO1xuICAgIH1cbn1cbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3Nlby1xYS1zdGVwLy9ydW5TZW9RYVN0ZXBcIiwgcnVuU2VvUWFTdGVwKTtcbiIsICJpbXBvcnQgeyByZWdpc3RlclN0ZXBGdW5jdGlvbiB9IGZyb20gXCJ3b3JrZmxvdy9pbnRlcm5hbC9wcml2YXRlXCI7XG5pbXBvcnQgJ3NlcnZlci1vbmx5JztcbmltcG9ydCB7IGdlbmVyYXRlVGV4dCB9IGZyb20gJ2FpJztcbmltcG9ydCB7IG9wZW5haSB9IGZyb20gJ0BhaS1zZGsvb3BlbmFpJztcbmltcG9ydCB7IHVwZGF0ZVJ1bkRyYWZ0LCB1cGRhdGVSdW5TdGF0dXMgfSBmcm9tICcuLi8uLi9zdG9yYWdlL3J1bnMnO1xuaW1wb3J0IHsgZ2V0QWdlbnRDb25maWcgfSBmcm9tICcuLi8uLi9zdG9yYWdlL2FnZW50LWNvbmZpZ3MnO1xuaW1wb3J0IHsgYnVpbGRGdWxsSW5wdXRDb250ZXh0IH0gZnJvbSAnLi9jb250ZXh0LWJ1aWxkZXInO1xuLyoqX19pbnRlcm5hbF93b3JrZmxvd3N7XCJzdGVwc1wiOntcImxpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvd3JpdGVyLXN0ZXAudHNcIjp7XCJydW5Xcml0ZXJTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvd3JpdGVyLXN0ZXAvL3J1bldyaXRlclN0ZXBcIn19fX0qLztcbi8qKlxuICogV3JpdGVyIFN0ZXAgLSBQaGFzZSAyQy1DXG4gKiBSdW5zIGluc2lkZSBhIGR1cmFibGUgc3RlcCBmdW5jdGlvbiAoaGFzIE5vZGUuanMgYWNjZXNzKVxuICogQ2FsbHMgQUkgbW9kZWwgdG8gZ2VuZXJhdGUgZmlyc3QgZnVsbCBibG9nIGRyYWZ0IGluIE1hcmtkb3duXG4gKiBVc2VzIHJlc2VhcmNoIGRhdGEgYW5kIG91dGxpbmUgdG8gc3RydWN0dXJlIHRoZSBjb250ZW50XG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJ1bldyaXRlclN0ZXAocnVuSWQsIGlucHV0LCByZXNlYXJjaERhdGEsIG91dGxpbmVEYXRhKSB7XG4gICAgY29uc29sZS5sb2coYFt2MF0gV3JpdGVyIHN0ZXA6IENyZWF0aW5nIGRyYWZ0IGZvciBydW4gJHtydW5JZH1gKTtcbiAgICB0cnkge1xuICAgICAgICAvLyBMb2FkIGFnZW50IGNvbmZpZyBmcm9tIGRhdGFiYXNlXG4gICAgICAgIGNvbnN0IGFnZW50Q29uZmlnID0gYXdhaXQgZ2V0QWdlbnRDb25maWcoJ3dyaXRlcicpO1xuICAgICAgICBpZiAoIWFnZW50Q29uZmlnKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0FjdGl2ZSBhZ2VudCBjb25maWcgbm90IGZvdW5kIGZvciBhZ2VudF9rZXk6IHdyaXRlcicpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFNFTyBCbG9nIEFnZW50IENvbmZpZyBMb2FkZWQ6IHdyaXRlciB2JHthZ2VudENvbmZpZy52ZXJzaW9ufWApO1xuICAgICAgICAvLyBCdWlsZCBzeXN0ZW0gcHJvbXB0IGZyb20gZGF0YWJhc2UgY29uZmlnXG4gICAgICAgIGNvbnN0IHN5c3RlbVByb21wdCA9IFtcbiAgICAgICAgICAgIGFnZW50Q29uZmlnLnN5c3RlbV9wcm9tcHQsXG4gICAgICAgICAgICBhZ2VudENvbmZpZy5za2lsbF9tYXJrZG93blxuICAgICAgICBdLmZpbHRlcihCb29sZWFuKS5qb2luKCdcXG5cXG4nKTtcbiAgICAgICAgLy8gQ3JlYXRlIGNvbnRleHQgZnJvbSBhdmFpbGFibGUgZGF0YVxuICAgICAgICBjb25zdCB0b3BpYyA9IGlucHV0LmJsb2dfdG9waWMgfHwgaW5wdXQudG9waWMgfHwgJ1lvdXIgVG9waWMnO1xuICAgICAgICBjb25zdCBwcmltYXJ5S2V5d29yZCA9IGlucHV0LnByaW1hcnlfa2V5d29yZCB8fCAncHJpbWFyeSBrZXl3b3JkJztcbiAgICAgICAgY29uc3Qgc2Vjb25kYXJ5S2V5d29yZHMgPSAoaW5wdXQuc2Vjb25kYXJ5X2tleXdvcmRzIHx8IGlucHV0LmtleXdvcmRzIHx8IFtdKS5qb2luKCcsICcpIHx8ICdzZWNvbmRhcnkga2V5d29yZHMnO1xuICAgICAgICBjb25zdCBidXNpbmVzc05hbWUgPSBpbnB1dC5idXNpbmVzc19uYW1lIHx8ICdZb3VyIEJ1c2luZXNzJztcbiAgICAgICAgY29uc3QgYXVkaWVuY2VOb3RlcyA9IGlucHV0LmF1ZGllbmNlX25vdGVzIHx8ICdUYXJnZXQgYXVkaWVuY2Ugbm90IHNwZWNpZmllZCc7XG4gICAgICAgIGNvbnN0IGJyYW5kVm9pY2UgPSBpbnB1dC5icmFuZF92b2ljZV9ub3RlcyB8fCAnUHJvZmVzc2lvbmFsIGFuZCBjbGVhcic7XG4gICAgICAgIGNvbnN0IGN0YU5vdGVzID0gaW5wdXQuY3RhX25vdGVzIHx8ICcnO1xuICAgICAgICBjb25zdCBpbnRlcm5hbExpbmtOb3RlcyA9IGlucHV0LmludGVybmFsX2xpbmtfbm90ZXMgfHwgJyc7XG4gICAgICAgIGNvbnN0IGFkZGl0aW9uYWxOb3RlcyA9IGlucHV0LmFkZGl0aW9uYWxfb3JkZXJfbm90ZXMgfHwgJ05vIGFkZGl0aW9uYWwgbm90ZXMnO1xuICAgICAgICBjb25zdCB0YXJnZXRXb3JkQ291bnQgPSBpbnB1dC50YXJnZXRfd29yZF9jb3VudCB8fCAxNTAwO1xuICAgICAgICAvLyBCdWlsZCByZXNlYXJjaCBjb250ZXh0IGlmIGF2YWlsYWJsZVxuICAgICAgICBsZXQgcmVzZWFyY2hDb250ZXh0ID0gJyc7XG4gICAgICAgIGlmIChyZXNlYXJjaERhdGEgJiYgdHlwZW9mIHJlc2VhcmNoRGF0YSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIGNvbnN0IGZpbmRpbmdzID0gcmVzZWFyY2hEYXRhLmtleV9maW5kaW5ncyB8fCBbXTtcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGZpbmRpbmdzKSAmJiBmaW5kaW5ncy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgcmVzZWFyY2hDb250ZXh0ID0gYFxcblxcbktleSBSZXNlYXJjaCBGaW5kaW5nczpcXG4ke2ZpbmRpbmdzLm1hcCgoZik9PmAtICR7dHlwZW9mIGYgPT09ICdzdHJpbmcnID8gZiA6IEpTT04uc3RyaW5naWZ5KGYpfWApLmpvaW4oJ1xcbicpfWA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gQnVpbGQgb3V0bGluZSBjb250ZXh0IGlmIGF2YWlsYWJsZVxuICAgICAgICBsZXQgb3V0bGluZUNvbnRleHQgPSAnJztcbiAgICAgICAgaWYgKG91dGxpbmVEYXRhKSB7XG4gICAgICAgICAgICBjb25zdCBzZWN0aW9ucyA9IChvdXRsaW5lRGF0YS5zZWN0aW9ucyB8fCBbXSkubWFwKChzKT0+YCMjICR7dHlwZW9mIHMgPT09ICdzdHJpbmcnID8gcyA6IHMuaGVhZGluZyB8fCAnU2VjdGlvbid9XFxuKCR7cy5wdXJwb3NlIHx8ICdTZWN0aW9uIGNvbnRlbnQnfSlgKTtcbiAgICAgICAgICAgIGlmIChzZWN0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgb3V0bGluZUNvbnRleHQgPSBgXFxuXFxuT3V0bGluZSBTdHJ1Y3R1cmU6XFxuJHtzZWN0aW9ucy5qb2luKCdcXG5cXG4nKX1gO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIEJ1aWxkIGludGVybmFsIGxpbmtzIGNvbnRleHRcbiAgICAgICAgbGV0IGxpbmtzQ29udGV4dCA9ICcnO1xuICAgICAgICBpZiAoaW50ZXJuYWxMaW5rTm90ZXMpIHtcbiAgICAgICAgICAgIGxpbmtzQ29udGV4dCA9IGBcXG5cXG5JbnRlcm5hbCBMaW5rIE9wcG9ydHVuaXRpZXM6XFxuJHtpbnRlcm5hbExpbmtOb3Rlc31gO1xuICAgICAgICB9XG4gICAgICAgIC8vIEJ1aWxkIENUQSBjb250ZXh0XG4gICAgICAgIGxldCBjdGFDb250ZXh0ID0gJyc7XG4gICAgICAgIGlmIChjdGFOb3Rlcykge1xuICAgICAgICAgICAgY3RhQ29udGV4dCA9IGBcXG5cXG5DYWxsLXRvLUFjdGlvbiBHdWlkYW5jZTpcXG4ke2N0YU5vdGVzfWA7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdXNlck1lc3NhZ2UgPSBgV3JpdGUgdGhlIGZpcnN0IGRyYWZ0IGJsb2cgcG9zdCB1c2luZyB0aGUgZnVsbCBCbG9nIENvbnRleHQgQnJpZWYsIFJlc2VhcmNoIEFnZW50IG91dHB1dCwgYW5kIE91dGxpbmUgQWdlbnQgb3V0cHV0LlxuXG4ke2J1aWxkRnVsbElucHV0Q29udGV4dChpbnB1dCl9JHtyZXNlYXJjaENvbnRleHR9JHtvdXRsaW5lQ29udGV4dH0ke2xpbmtzQ29udGV4dH0ke2N0YUNvbnRleHR9XG5cblRvcGljOiAke3RvcGljfVxuQnVzaW5lc3M6ICR7YnVzaW5lc3NOYW1lfVxuUHJpbWFyeSBLZXl3b3JkOiAke3ByaW1hcnlLZXl3b3JkfVxuU2Vjb25kYXJ5IEtleXdvcmRzOiAke3NlY29uZGFyeUtleXdvcmRzfVxuVGFyZ2V0IFdvcmQgQ291bnQ6ICR7dGFyZ2V0V29yZENvdW50fVxuQXVkaWVuY2U6ICR7YXVkaWVuY2VOb3Rlc31cbkJyYW5kIFZvaWNlOiAke2JyYW5kVm9pY2V9XG5BZGRpdGlvbmFsIE5vdGVzOiAke2FkZGl0aW9uYWxOb3Rlc31cblxuUmV0dXJuIE1hcmtkb3duIG9ubHksIGZvbGxvd2luZyB0aGUgV3JpdGVyIEFnZW50IGluc3RydWN0aW9ucy4gRG8gbm90IGludmVudCB1bnN1cHBvcnRlZCBmYWN0cywgc2VydmljZXMsIGxvY2F0aW9ucywgb2ZmZXJzLCBjbGFpbXMsIG9yIGxpbmtzLmA7XG4gICAgICAgIC8vIEdldCBtb2RlbCBuYW1lOiB1c2UgREIgY29uZmlnIGlmIGF2YWlsYWJsZSwgb3RoZXJ3aXNlIGZhbGwgYmFjayB0byBlbnYgdmFyIG9yIGRlZmF1bHRcbiAgICAgICAgY29uc3QgbW9kZWxOYW1lID0gYWdlbnRDb25maWcubW9kZWwgfHwgcHJvY2Vzcy5lbnYuV1JJVEVSX0FHRU5UX01PREVMIHx8IHByb2Nlc3MuZW52LlJFU0VBUkNIX0FHRU5UX01PREVMIHx8ICdncHQtNS40LW1pbmknO1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBXcml0ZXIgc3RlcDogVXNpbmcgbW9kZWw6ICR7bW9kZWxOYW1lfWApO1xuICAgICAgICAvLyBDYWxsIEFJIG1vZGVsIHZpYSBkaXJlY3QgT3BlbkFJIHByb3ZpZGVyXG4gICAgICAgIGNvbnN0IG1vZGVsID0gb3BlbmFpKG1vZGVsTmFtZSk7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZ2VuZXJhdGVUZXh0KHtcbiAgICAgICAgICAgIG1vZGVsLFxuICAgICAgICAgICAgc3lzdGVtOiBzeXN0ZW1Qcm9tcHQsXG4gICAgICAgICAgICBwcm9tcHQ6IHVzZXJNZXNzYWdlLFxuICAgICAgICAgICAgdGVtcGVyYXR1cmU6IDAuNyxcbiAgICAgICAgICAgIG1heE91dHB1dFRva2VuczogNDAwMFxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgZHJhZnRNYXJrZG93biA9IHJlc3BvbnNlLnRleHQ7XG4gICAgICAgIC8vIEJhc2ljIHZhbGlkYXRpb25cbiAgICAgICAgaWYgKCFkcmFmdE1hcmtkb3duIHx8IGRyYWZ0TWFya2Rvd24udHJpbSgpLmxlbmd0aCA8IDUwMCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdHZW5lcmF0ZWQgY29udGVudCB0b28gc2hvcnQnKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBDYWxjdWxhdGUgbWV0cmljc1xuICAgICAgICBjb25zdCB3b3JkQ291bnQgPSBkcmFmdE1hcmtkb3duLnNwbGl0KC9cXHMrLykubGVuZ3RoO1xuICAgICAgICBjb25zdCBzZWN0aW9uc0NvdW50ID0gKGRyYWZ0TWFya2Rvd24ubWF0Y2goL14jI1xccy9nbSkgfHwgW10pLmxlbmd0aDtcbiAgICAgICAgY29uc3QgaGFzQ3RhID0gZHJhZnRNYXJrZG93bi50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKCdjYWxsJykgfHwgZHJhZnRNYXJrZG93bi50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKCdhY3Rpb24nKSB8fCBjdGFOb3Rlcy5sZW5ndGggPiAwO1xuICAgICAgICBjb25zdCBoYXNJbnRlcm5hbExpbmtzID0gZHJhZnRNYXJrZG93bi5pbmNsdWRlcygnW2xpbms6JykgfHwgaW50ZXJuYWxMaW5rTm90ZXMubGVuZ3RoID4gMDtcbiAgICAgICAgY29uc3Qgd3JpdGVyT3V0cHV0ID0ge1xuICAgICAgICAgICAgZHJhZnRfbWFya2Rvd246IGRyYWZ0TWFya2Rvd24sXG4gICAgICAgICAgICB3b3JkX2NvdW50OiB3b3JkQ291bnQsXG4gICAgICAgICAgICBzZWN0aW9uc193cml0dGVuOiBzZWN0aW9uc0NvdW50LFxuICAgICAgICAgICAgaGFzX2N0YTogaGFzQ3RhLFxuICAgICAgICAgICAgaGFzX2ludGVybmFsX2xpbmtzOiBoYXNJbnRlcm5hbExpbmtzLFxuICAgICAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgICAgfTtcbiAgICAgICAgLy8gUGVyc2lzdCBkcmFmdF9tYXJrZG93biB0byBkYXRhYmFzZSAobWFya2Rvd24gc3RyaW5nIG9ubHksIG5vdCBmdWxsIG9iamVjdClcbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gV3JpdGVyIHN0ZXA6IFBlcnNpc3RpbmcgZHJhZnRfbWFya2Rvd24gKCR7d29yZENvdW50fSB3b3JkcykgZm9yIHJ1biAke3J1bklkfWApO1xuICAgICAgICBhd2FpdCB1cGRhdGVSdW5EcmFmdChydW5JZCwgd3JpdGVyT3V0cHV0LmRyYWZ0X21hcmtkb3duKTtcbiAgICAgICAgLy8gQWxzbyB1cGRhdGUgc3RhdHVzIHRvICd3cml0aW5nJ1xuICAgICAgICBhd2FpdCB1cGRhdGVSdW5TdGF0dXMocnVuSWQsICd3cml0aW5nJyk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFdyaXRlciBzdGVwOiBDb21wbGV0ZSBmb3IgcnVuICR7cnVuSWR9ICgke3dvcmRDb3VudH0gd29yZHMsICR7c2VjdGlvbnNDb3VudH0gc2VjdGlvbnMpYCk7XG4gICAgICAgIHJldHVybiB3cml0ZXJPdXRwdXQ7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgZXJyb3JNc2cgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yIGluIHdyaXRlciBzdGVwJztcbiAgICAgICAgY29uc29sZS5lcnJvcihgW3YwXSBXcml0ZXIgc3RlcCBlcnJvciBmb3IgcnVuICR7cnVuSWR9OiAke2Vycm9yTXNnfWApO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFdyaXRlciBzdGVwIGZhaWxlZDogJHtlcnJvck1zZ31gKTtcbiAgICB9XG59XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy93cml0ZXItc3RlcC8vcnVuV3JpdGVyU3RlcFwiLCBydW5Xcml0ZXJTdGVwKTtcbiIsICJcbiAgICAvLyBCdWlsdCBpbiBzdGVwc1xuICAgIGltcG9ydCAnd29ya2Zsb3cvaW50ZXJuYWwvYnVpbHRpbnMnO1xuICAgIC8vIFVzZXIgc3RlcHNcbiAgICBpbXBvcnQgJy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9jYWxsYmFjay1zdGVwLnRzJztcbmltcG9ydCAnLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL2VkaXRvci1zdGVwLnRzJztcbmltcG9ydCAnLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL2hlbHBlcnMudHMnO1xuaW1wb3J0ICcuL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvbWV0YS1zdGVwLnRzJztcbmltcG9ydCAnLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL291dGxpbmUtc3RlcC50cyc7XG5pbXBvcnQgJy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9yZXNlYXJjaC1zdGVwLnRzJztcbmltcG9ydCAnLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3JldmlzaW9uLWhlbHBlcnMudHMnO1xuaW1wb3J0ICcuL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvcmV2aXNpb24tc3RlcC50cyc7XG5pbXBvcnQgJy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9zZW8tcWEtc3RlcC50cyc7XG5pbXBvcnQgJy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy93cml0ZXItc3RlcC50cyc7XG4gICAgLy8gU2VyZGUgZmlsZXMgZm9yIGNyb3NzLWNvbnRleHQgY2xhc3MgcmVnaXN0cmF0aW9uXG4gICAgXG4gICAgLy8gQVBJIGVudHJ5cG9pbnRcbiAgICBleHBvcnQgeyBzdGVwRW50cnlwb2ludCBhcyBIRUFELCBzdGVwRW50cnlwb2ludCBhcyBQT1NUIH0gZnJvbSAnd29ya2Zsb3cvcnVudGlt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QUFjLEtBQUssRUFBRSxTQUFTLEtBQUs7QUFDckQsWUFBTSxJQUFJLE1BQU0sNkJBQTZCO0FBQUEsSUFDakQ7QUFFQSxVQUFNLFlBQVksY0FBYyxNQUFNLEtBQUssRUFBRTtBQUM3QyxVQUFNLGlCQUFpQixjQUFjLE1BQU0sU0FBUyxLQUFLLENBQUMsR0FBRztBQUM3RCxVQUFNLFNBQVMsY0FBYyxZQUFZLEVBQUUsU0FBUyxNQUFNLEtBQUssY0FBYyxZQUFZLEVBQUUsU0FBUyxRQUFRLEtBQUssU0FBUyxTQUFTO0FBQ25JLFVBQU0sbUJBQW1CLGNBQWMsU0FBUyxRQUFRLEtBQUssa0JBQWtCLFNBQVM7QUFDeEYsVUFBTSxlQUFlO0FBQUEsTUFDakIsZ0JBQWdCO0FBQUEsTUFDaEIsWUFBWTtBQUFBLE1BQ1osa0JBQWtCO0FBQUEsTUFDbEIsU0FBUztBQUFBLE1BQ1Qsb0JBQW9CO0FBQUEsTUFDcEIsWUFBVyxvQkFBSSxLQUFLLEdBQUUsWUFBWTtBQUFBLElBQ3RDO0FBRUEsWUFBUSxJQUFJLGdEQUFnRCxTQUFTLG1CQUFtQixLQUFLLEVBQUU7QUFDL0YsVUFBTSxlQUFlLE9BQU8sYUFBYSxjQUFjO0FBRXZELFVBQU1DLGlCQUFnQixPQUFPLFNBQVM7QUFDdEMsWUFBUSxJQUFJLHNDQUFzQyxLQUFLLEtBQUssU0FBUyxXQUFXLGFBQWEsWUFBWTtBQUN6RyxXQUFPO0FBQUEsRUFDWCxTQUFTLE9BQU87QUFDWixVQUFNLFdBQVcsaUJBQWlCLFFBQVEsTUFBTSxVQUFVO0FBQzFELFlBQVEsTUFBTSxrQ0FBa0MsS0FBSyxLQUFLLFFBQVEsRUFBRTtBQUNwRSxVQUFNLElBQUksTUFBTSx1QkFBdUIsUUFBUSxFQUFFO0FBQUEsRUFDckQ7QUFDSjtBQTNHMEI7QUE0RzFCQyx1QkFBcUIseUVBQXlFLGFBQWE7OztBQ3hHdkcsU0FBMkIsZ0JBQXdCLGtCQUFsQkMsdUJBQThCOyIsCiAgIm5hbWVzIjogWyJyZWdpc3RlclN0ZXBGdW5jdGlvbiIsICJyZWdpc3RlclN0ZXBGdW5jdGlvbiIsICJyZWdpc3RlclN0ZXBGdW5jdGlvbiIsICJyZWdpc3RlclN0ZXBGdW5jdGlvbiIsICJyZWdpc3RlclN0ZXBGdW5jdGlvbiIsICJyZWdpc3RlclN0ZXBGdW5jdGlvbiIsICJyZWdpc3RlclN0ZXBGdW5jdGlvbiIsICJnZW5lcmF0ZVRleHQiLCAib3BlbmFpIiwgImdldEFnZW50Q29uZmlnIiwgImJ1aWxkRnVsbElucHV0Q29udGV4dCIsICJnZXRBZ2VudENvbmZpZyIsICJnZW5lcmF0ZVRleHQiLCAib3BlbmFpIiwgImJ1aWxkRnVsbElucHV0Q29udGV4dCIsICJyZWdpc3RlclN0ZXBGdW5jdGlvbiIsICJyZWdpc3RlclN0ZXBGdW5jdGlvbiIsICJnZW5lcmF0ZVRleHQiLCAib3BlbmFpIiwgInVwZGF0ZVJ1blN0YXR1cyIsICJnZXRBZ2VudENvbmZpZyIsICJidWlsZEZ1bGxJbnB1dENvbnRleHQiLCAiZXh0cmFjdEpzb25PYmplY3QiLCAiZ2V0QWdlbnRDb25maWciLCAiYnVpbGRGdWxsSW5wdXRDb250ZXh0IiwgIm9wZW5haSIsICJnZW5lcmF0ZVRleHQiLCAiZXh0cmFjdEpzb25PYmplY3QiLCAidXBkYXRlUnVuU3RhdHVzIiwgInJlZ2lzdGVyU3RlcEZ1bmN0aW9uIiwgInJlZ2lzdGVyU3RlcEZ1bmN0aW9uIiwgImdlbmVyYXRlVGV4dCIsICJvcGVuYWkiLCAidXBkYXRlUnVuU3RhdHVzIiwgImdldEFnZW50Q29uZmlnIiwgImJ1aWxkRnVsbElucHV0Q29udGV4dCIsICJleHRyYWN0SnNvbk9iamVjdCIsICJnZXRBZ2VudENvbmZpZyIsICJidWlsZEZ1bGxJbnB1dENvbnRleHQiLCAib3BlbmFpIiwgImdlbmVyYXRlVGV4dCIsICJleHRyYWN0SnNvbk9iamVjdCIsICJ1cGRhdGVSdW5TdGF0dXMiLCAicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAiZ2V0UnVuIiwgImdldFJ1biIsICJyZWdpc3RlclN0ZXBGdW5jdGlvbiIsICJyZWdpc3RlclN0ZXBGdW5jdGlvbiIsICJnZW5lcmF0ZVRleHQiLCAib3BlbmFpIiwgImdldEFnZW50Q29uZmlnIiwgImdldEFnZW50Q29uZmlnIiwgIm9wZW5haSIsICJnZW5lcmF0ZVRleHQiLCAicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAicmVnaXN0ZXJTdGVwRnVuY3Rpb24iLCAiZ2VuZXJhdGVUZXh0IiwgIm9wZW5haSIsICJ1cGRhdGVSdW5TdGF0dXMiLCAiZ2V0QWdlbnRDb25maWciLCAiYnVpbGRGdWxsSW5wdXRDb250ZXh0IiwgImV4dHJhY3RKc29uT2JqZWN0IiwgImdldEFnZW50Q29uZmlnIiwgImJ1aWxkRnVsbElucHV0Q29udGV4dCIsICJnZW5lcmF0ZVRleHQiLCAib3BlbmFpIiwgImV4dHJhY3RKc29uT2JqZWN0IiwgInVwZGF0ZVJ1blN0YXR1cyIsICJyZWdpc3RlclN0ZXBGdW5jdGlvbiIsICJyZWdpc3RlclN0ZXBGdW5jdGlvbiIsICJnZW5lcmF0ZVRleHQiLCAib3BlbmFpIiwgInVwZGF0ZVJ1blN0YXR1cyIsICJnZXRBZ2VudENvbmZpZyIsICJidWlsZEZ1bGxJbnB1dENvbnRleHQiLCAiZ2V0QWdlbnRDb25maWciLCAiYnVpbGRGdWxsSW5wdXRDb250ZXh0IiwgIm9wZW5haSIsICJnZW5lcmF0ZVRleHQiLCAidXBkYXRlUnVuU3RhdHVzIiwgInJlZ2lzdGVyU3RlcEZ1bmN0aW9uIiwgInN0ZXBFbnRyeXBvaW50Il0KfQo=

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
async function runEditorStep(runId, input, research, outline, originalDraft, seoQa) {
  console.log(`[v0] Editor step: Starting for run ${runId}`);
  try {
    const editorContext = buildEditorContext(input, research, outline, seoQa);
    const modelName = process.env.EDITOR_AGENT_MODEL || "gpt-5.4-mini";
    console.log(`[v0] Editor step: Using model: ${modelName}`);
    const { text: improvementAnalysis } = await generateText({
      model: openai(modelName),
      temperature: 0.7,
      maxTokens: 8e3,
      system: `You are an expert content editor. Your role is to improve blog drafts based on SEO QA feedback while maintaining authenticity and brand voice.

IMPORTANT RULES:
1. Preserve the original H1/H2/H3 structure
2. Improve clarity, transitions, and readability
3. Fix issues identified in SEO QA output
4. Keep keywords natural - prioritize readability over keyword stuffing
5. Preserve all factual content and caution about limitations
6. Do NOT invent statistics or fake claims
7. Do NOT modify client claims or invented credentials
8. Keep Markdown format
9. Preserve CTA section if present
10. Preserve internal link placeholders if present

Output a JSON object with:
{
  "edited_draft": "complete improved markdown...",
  "changes_summary": ["change 1", "change 2", ...],
  "notes": ["note 1", "note 2", ...]
}`,
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
async function runMetaStep(runId, input, research, outline, originalDraft, seoQa, editedDraft) {
  console.log(`[v0] Meta step: Starting for run ${runId}`);
  try {
    const metaContext = buildMetaContext(input, research, outline, seoQa, originalDraft, editedDraft);
    const modelName = process.env.META_AGENT_MODEL || "gpt-5.4-mini";
    console.log(`[v0] Meta step: Using model: ${modelName}`);
    const { text: metaAnalysis } = await generateText2({
      model: openai2(modelName),
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
async function runOutlineStep(runId, input, researchData) {
  console.log(`[v0] Outline step: Creating outline for run ${runId}`);
  const modelName = process.env.OUTLINE_AGENT_MODEL || process.env.RESEARCH_AGENT_MODEL || "gpt-5.4-mini";
  console.log(`[v0] Outline step: Using model: ${modelName}`);
  const topic = input.blog_topic || input.topic || "Your Topic";
  const primaryKeyword = input.primary_keyword || "primary keyword";
  const secondaryKeywords = (input.secondary_keywords || input.keywords || []).join(", ") || "secondary keywords";
  const businessName = input.business_name || "Your Business";
  const audienceNotes = input.audience_notes || "Target audience not specified";
  const brandVoice = input.brand_voice_notes || "Professional and clear";
  const ctaNotes = input.cta_notes || "Encourage engagement";
  const additionalNotes = input.additional_order_notes || "No additional notes";
  const targetWordCount = input.target_word_count || 1500;
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
  const systemPrompt = `You are a professional content outline specialist. Create a detailed, well-structured blog outline that will guide content writers.

Your output must be valid JSON matching this exact structure:
{
  "title": "string (SEO-optimized title including primary keyword)",
  "meta_angle": "string (unique angle that differentiates this article)",
  "target_word_count": number,
  "sections": [
    {
      "heading": "string",
      "purpose": "string (why this section matters)",
      "estimated_words": number,
      "key_points": ["string"],
      "seo_notes": ["string (SEO best practices for this section)"]
    }
  ],
  "intro_guidance": "string (guidance for introduction paragraph)",
  "conclusion_guidance": "string (guidance for conclusion paragraph)",
  "cta_guidance": "string (call-to-action guidance)",
  "internal_link_opportunities": ["string (suggested internal links)"],
  "notes_for_writer": ["string (additional guidance for writer)"]
}

Ensure:
- Sections total approximately the target word count
- Each section includes specific key points to cover
- SEO best practices are integrated
- The outline flows logically
- Internal linking opportunities are realistic
- The outline is actionable for a writer

Respond ONLY with valid JSON, no markdown or explanations.`;
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
  try {
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
async function runResearchStep(runId, input) {
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
Secondary Keywords: ${input.secondary_keywords?.join(", ") || "none"}
Target Audience: ${input.audience_notes || "general"}
Target Word Count: ${input.target_word_count || 1e3}
Business: ${input.business_name || "unknown"}
Website: ${input.website_url || "unknown"}

Provide comprehensive research findings in JSON format.`;
  try {
    const modelName = process.env.RESEARCH_AGENT_MODEL || "gpt-5.4-mini";
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
async function runSeoQaStep(runId, input, researchData, outlineData, draftMarkdown) {
  console.log(`[v0] SEO QA step: Auditing draft for run ${runId}`);
  if (!draftMarkdown) {
    throw new Error("Draft markdown is required for SEO QA review");
  }
  const modelName = process.env.SEO_QA_AGENT_MODEL || process.env.RESEARCH_AGENT_MODEL || "gpt-5.4-mini";
  console.log(`[v0] SEO QA step: Using model: ${modelName}`);
  const primaryKeyword = input.primary_keyword || "primary keyword";
  const secondaryKeywords = (input.secondary_keywords || []).join(", ") || "secondary keywords";
  const targetWordCount = input.target_word_count || 2e3;
  const businessName = input.business_name || "Your Business";
  const audienceNotes = input.audience_notes || "Target audience not specified";
  const brandVoice = input.brand_voice_notes || "Professional and clear";
  const ctaNotes = input.cta_notes || "CTA not specified";
  const internalLinkNotes = input.internal_link_notes || "No internal linking strategy";
  const seoQaPrompt = `You are an expert SEO content auditor. Review the following blog draft and provide a comprehensive SEO quality assessment.

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

Provide a detailed SEO audit in the following JSON format (do NOT modify or rewrite the draft):
{
  "overall_score": <0-100>,
  "search_intent_alignment": {
    "score": <0-100>,
    "analysis": "<analysis of how well draft aligns with search intent for the primary keyword>"
  },
  "primary_keyword_usage": {
    "score": <0-100>,
    "occurrences": <count>,
    "placement_analysis": "<analysis of where primary keyword appears and how naturally>"
  },
  "secondary_keyword_usage": {
    "score": <0-100>,
    "keywords_covered": [<list of secondary keywords found in draft>],
    "gaps": [<list of secondary keywords missing from draft>]
  },
  "heading_structure_review": {
    "score": <0-100>,
    "h1_present": <true/false>,
    "h2_count": <count>,
    "hierarchy_issues": [<list of heading hierarchy problems if any>]
  },
  "content_depth_review": {
    "score": <0-100>,
    "word_count": <actual word count>,
    "section_coverage": "<assessment of whether all outline sections are covered>",
    "depth_issues": [<list of sections that need more depth>]
  },
  "readability_review": {
    "score": <0-100>,
    "avg_sentence_length": <average>,
    "flesch_kincaid_estimate": "<grade level estimate>",
    "readability_issues": [<list of readability concerns>]
  },
  "internal_linking_review": {
    "score": <0-100>,
    "internal_links_found": <count>,
    "internal_link_recommendations": [<list of suggested internal link placements>]
  },
  "cta_review": {
    "score": <0-100>,
    "cta_present": <true/false>,
    "cta_analysis": "<assessment of CTA placement, clarity, and alignment with brand guidelines>"
  },
  "risk_flags": [<list of SEO risks like duplicate content, keyword stuffing, broken links, etc>],
  "priority_fixes": [<list of top 3-5 priority items to fix before publication>],
  "recommended_next_action": "<recommendation for next step - Editor, Revision, or Ready for Publishing>",
  "ready_for_editor": <true if draft is ready for editor review, false if major revisions needed>
}

Only output the JSON. Do not include any other text or explanation.`;
  try {
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
async function runWriterStep(runId, input, researchData, outlineData) {
  console.log(`[v0] Writer step: Creating draft for run ${runId}`);
  const modelName = process.env.WRITER_AGENT_MODEL || process.env.RESEARCH_AGENT_MODEL || "gpt-5.4-mini";
  console.log(`[v0] Writer step: Using model: ${modelName}`);
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
  const systemPrompt = `You are an expert SEO content writer. Write a first draft blog post in Markdown format that is:
- SEO-optimized for the primary keyword: "${primaryKeyword}"
- Naturally incorporating secondary keywords: ${secondaryKeywords}
- Aligned with this brand voice: ${brandVoice}
- Targeting this audience: ${audienceNotes}
- Approximately ${targetWordCount} words in length
- Written for "${businessName}"${additionalNotes ? `
- Additional context: ${additionalNotes}` : ""}

Guidelines:
- Start with an H1 title that includes the primary keyword
- Write an engaging introduction (100-150 words)
- Structure with H2 and H3 subheadings as appropriate
- Each section should be 150-300 words
- Use natural, conversational language
- Include practical examples and actionable insights
- No fake statistics or invented claims
- No publishing metadata or frontmatter${ctaContext ? "\n- Include a strong CTA section at the end" : ""}${linksContext ? "\n- Mark internal link opportunities as [link: description]" : ""}
- Aim for the target word count but prioritize quality over exact count`;
  const userMessage = `Write the first draft blog post about: ${topic}${researchContext}${outlineContext}${linksContext}${ctaContext}`;
  try {
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3dvcmtmbG93QDQuNS4wX0BuZXN0anMrY29tbW9uQDExLjEuMjdfcmVmbGVjdC1tZXRhZGF0YUAwLjIuMl9yeGpzQDcuOC4yX19AbmVzdGpzK2NvcmVAMV9hOWMxYWE2YzBiNTgwZTliZjNiZmY2NGMzMjY5ZmU0My9ub2RlX21vZHVsZXMvd29ya2Zsb3cvc3JjL2ludGVybmFsL2J1aWx0aW5zLnRzIiwgIi4uLy4uLy4uLy4uLy4uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvY2FsbGJhY2stc3RlcC50cyIsICIuLi8uLi8uLi8uLi8uLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL2VkaXRvci1zdGVwLnRzIiwgIi4uLy4uLy4uLy4uLy4uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvaGVscGVycy50cyIsICIuLi8uLi8uLi8uLi8uLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL21ldGEtc3RlcC50cyIsICIuLi8uLi8uLi8uLi8uLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL291dGxpbmUtc3RlcC50cyIsICIuLi8uLi8uLi8uLi8uLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3Jlc2VhcmNoLXN0ZXAudHMiLCAiLi4vLi4vLi4vLi4vLi4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9zZW8tcWEtc3RlcC50cyIsICIuLi8uLi8uLi8uLi8uLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3dyaXRlci1zdGVwLnRzIiwgIi4uLy4uLy4uLy4uLy4uL3ZpcnR1YWwtZW50cnkuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKlxuICogVGhlc2UgYXJlIHRoZSBidWlsdC1pbiBzdGVwcyB0aGF0IGFyZSBcImF1dG9tYXRpY2FsbHkgYXZhaWxhYmxlXCIgaW4gdGhlIHdvcmtmbG93IHNjb3BlLiBUaGV5IGFyZVxuICogc2ltaWxhciB0byBcInN0ZGxpYlwiIGV4Y2VwdCB0aGF0IGFyZSBub3QgbWVhbnQgdG8gYmUgaW1wb3J0ZWQgYnkgdXNlcnMsIGJ1dCBhcmUgaW5zdGVhZCBcImp1c3QgYXZhaWxhYmxlXCJcbiAqIGFsb25nc2lkZSB1c2VyIGRlZmluZWQgc3RlcHMuIFRoZXkgYXJlIHVzZWQgaW50ZXJuYWxseSBieSB0aGUgcnVudGltZVxuICovXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBfX2J1aWx0aW5fcmVzcG9uc2VfYXJyYXlfYnVmZmVyKFxuICB0aGlzOiBSZXF1ZXN0IHwgUmVzcG9uc2Vcbikge1xuICAndXNlIHN0ZXAnO1xuICByZXR1cm4gdGhpcy5hcnJheUJ1ZmZlcigpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gX19idWlsdGluX3Jlc3BvbnNlX2pzb24odGhpczogUmVxdWVzdCB8IFJlc3BvbnNlKSB7XG4gICd1c2Ugc3RlcCc7XG4gIHJldHVybiB0aGlzLmpzb24oKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIF9fYnVpbHRpbl9yZXNwb25zZV90ZXh0KHRoaXM6IFJlcXVlc3QgfCBSZXNwb25zZSkge1xuICAndXNlIHN0ZXAnO1xuICByZXR1cm4gdGhpcy50ZXh0KCk7XG59XG4iLCAiaW1wb3J0IHsgcmVnaXN0ZXJTdGVwRnVuY3Rpb24gfSBmcm9tIFwid29ya2Zsb3cvaW50ZXJuYWwvcHJpdmF0ZVwiO1xuaW1wb3J0ICdzZXJ2ZXItb25seSc7XG5pbXBvcnQgeyBnZXRSdW4gfSBmcm9tICcuLi8uLi9zdG9yYWdlL3J1bnMnO1xuLyoqX19pbnRlcm5hbF93b3JrZmxvd3N7XCJzdGVwc1wiOntcImxpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvY2FsbGJhY2stc3RlcC50c1wiOntcInNlbmRDYWxsYmFja1N0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9jYWxsYmFjay1zdGVwLy9zZW5kQ2FsbGJhY2tTdGVwXCJ9fX19Ki87XG4vKipcbiAqIFNlbmQgY2FsbGJhY2sgbm90aWZpY2F0aW9uIHRvIHdlYmhvb2sgVVJMXG4gKiBSdW5zIGFzIGEgZHVyYWJsZSBzdGVwIHRvIGVuc3VyZSBjYWxsYmFjayBkZWxpdmVyeSBpcyB0cmFja2VkXG4gKiBGYWlsdXJlcyBkbyBub3QgYnJlYWsgdGhlIG1haW4gd29ya2Zsb3dcbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gc2VuZENhbGxiYWNrU3RlcChydW5JZCkge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIEZldGNoIHJ1biB0byBnZXQgY2FsbGJhY2sgVVJMIGFuZCBmaW5hbCBzdGF0ZVxuICAgICAgICBjb25zdCBydW4gPSBhd2FpdCBnZXRSdW4ocnVuSWQpO1xuICAgICAgICBpZiAoIXJ1bikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBbdjBdIENhbGxiYWNrOiBSdW4gJHtydW5JZH0gbm90IGZvdW5kYCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFydW4uY2FsbGJhY2tfdXJsKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBDYWxsYmFjazogTm8gY2FsbGJhY2sgVVJMIGZvciBydW4gJHtydW5JZH1gKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBDYWxsYmFjazogU2VuZGluZyBub3RpZmljYXRpb24gdG8gJHtydW4uY2FsbGJhY2tfdXJsfWApO1xuICAgICAgICAvLyBCdWlsZCBjYWxsYmFjayBwYXlsb2FkXG4gICAgICAgIGNvbnN0IGNhbGxiYWNrUGF5bG9hZCA9IGJ1aWxkQ2FsbGJhY2tQYXlsb2FkKHJ1bik7XG4gICAgICAgIC8vIFNlbmQgY2FsbGJhY2sgd2l0aCB0aW1lb3V0IHByb3RlY3Rpb25cbiAgICAgICAgY29uc3QgY29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICAgICAgY29uc3QgdGltZW91dElkID0gc2V0VGltZW91dCgoKT0+Y29udHJvbGxlci5hYm9ydCgpLCAzMDAwMCk7IC8vIDMwIHNlY29uZCB0aW1lb3V0XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHJ1bi5jYWxsYmFja191cmwsIHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbidcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGNhbGxiYWNrUGF5bG9hZCksXG4gICAgICAgICAgICAgICAgc2lnbmFsOiBjb250cm9sbGVyLnNpZ25hbFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcbiAgICAgICAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFt2MF0gQ2FsbGJhY2s6IFdlYmhvb2sgcmV0dXJuZWQgJHtyZXNwb25zZS5zdGF0dXN9IGZvciBydW4gJHtydW5JZH1gKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFt2MF0gQ2FsbGJhY2s6IFN1Y2Nlc3NmdWxseSBzZW50IGZvciBydW4gJHtydW5JZH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZmV0Y2hFcnJvcikge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgICAgICAgICBpZiAoZmV0Y2hFcnJvciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgICAgICAgICAgaWYgKGZldGNoRXJyb3IubmFtZSA9PT0gJ0Fib3J0RXJyb3InKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgW3YwXSBDYWxsYmFjazogUmVxdWVzdCB0aW1lb3V0ICgzMHMpIGZvciBydW4gJHtydW5JZH1gKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFt2MF0gQ2FsbGJhY2s6IE5ldHdvcmsgZXJyb3IgZm9yIHJ1biAke3J1bklkfTogJHtmZXRjaEVycm9yLm1lc3NhZ2V9YCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFt2MF0gQ2FsbGJhY2s6IFVua25vd24gZXJyb3IgZm9yIHJ1biAke3J1bklkfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAvLyBEb24ndCB0aHJvdyAtIGNhbGxiYWNrIGZhaWx1cmUgc2hvdWxkIG5vdCBmYWlsIHRoZSB3b3JrZmxvd1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgLy8gTG9nIGVycm9yIHNhZmVseSB3aXRob3V0IGV4cG9zaW5nIHNlY3JldHNcbiAgICAgICAgY29uc3QgZXJyb3JNc2cgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2MF0gQ2FsbGJhY2s6IFVuZXhwZWN0ZWQgZXJyb3IgZm9yIHJ1biAke3J1bklkfTogJHtlcnJvck1zZ31gKTtcbiAgICAvLyBEb24ndCB0aHJvdyAtIGNhbGxiYWNrIGZhaWx1cmUgc2hvdWxkIG5vdCBmYWlsIHRoZSB3b3JrZmxvd1xuICAgIH1cbn1cbi8qKlxuICogQnVpbGQgY2FsbGJhY2sgcGF5bG9hZCBiYXNlZCBvbiBydW4gc3RhdHVzXG4gKi8gZnVuY3Rpb24gYnVpbGRDYWxsYmFja1BheWxvYWQocnVuKSB7XG4gICAgY29uc3QgaXNDb21wbGV0ZWQgPSBydW4uc3RhdHVzID09PSAnY29tcGxldGVkJztcbiAgICBjb25zdCBpc0ZhaWxlZCA9IHJ1bi5zdGF0dXMgPT09ICdmYWlsZWQnO1xuICAgIGlmIChpc0NvbXBsZXRlZCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcnVuX2lkOiBydW4uaWQsXG4gICAgICAgICAgICBzdGF0dXM6ICdjb21wbGV0ZWQnLFxuICAgICAgICAgICAgYnVzaW5lc3NfbmFtZTogcnVuLmlucHV0X2pzb24/LmJ1c2luZXNzX25hbWUgfHwgbnVsbCxcbiAgICAgICAgICAgIGJsb2dfdG9waWM6IHJ1bi5pbnB1dF9qc29uPy5ibG9nX3RvcGljIHx8IHJ1bi5pbnB1dF9qc29uPy50b3BpYyB8fCBudWxsLFxuICAgICAgICAgICAgcmV2aWV3X3JlYWR5OiB0cnVlLFxuICAgICAgICAgICAgaHVtYW5fcmV2aWV3X3JlcXVpcmVkOiB0cnVlLFxuICAgICAgICAgICAgb3V0cHV0czoge1xuICAgICAgICAgICAgICAgIGhhc19yZXNlYXJjaF9qc29uOiAhIXJ1bi5yZXNlYXJjaF9qc29uLFxuICAgICAgICAgICAgICAgIGhhc19vdXRsaW5lX2pzb246ICEhcnVuLm91dGxpbmVfanNvbixcbiAgICAgICAgICAgICAgICBoYXNfZHJhZnRfbWFya2Rvd246ICEhcnVuLmRyYWZ0X21hcmtkb3duLFxuICAgICAgICAgICAgICAgIGhhc19vcHRpbWl6ZWRfanNvbjogISFydW4ub3B0aW1pemVkX2pzb24sXG4gICAgICAgICAgICAgICAgaGFzX2ZpbmFsX291dHB1dF9qc29uOiAhIXJ1bi5maW5hbF9vdXRwdXRfanNvblxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZpbmFsX291dHB1dF9qc29uOiBydW4uZmluYWxfb3V0cHV0X2pzb25cbiAgICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKGlzRmFpbGVkKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBydW5faWQ6IHJ1bi5pZCxcbiAgICAgICAgICAgIHN0YXR1czogJ2ZhaWxlZCcsXG4gICAgICAgICAgICBidXNpbmVzc19uYW1lOiBydW4uaW5wdXRfanNvbj8uYnVzaW5lc3NfbmFtZSB8fCBudWxsLFxuICAgICAgICAgICAgYmxvZ190b3BpYzogcnVuLmlucHV0X2pzb24/LmJsb2dfdG9waWMgfHwgcnVuLmlucHV0X2pzb24/LnRvcGljIHx8IG51bGwsXG4gICAgICAgICAgICByZXZpZXdfcmVhZHk6IGZhbHNlLFxuICAgICAgICAgICAgaHVtYW5fcmV2aWV3X3JlcXVpcmVkOiB0cnVlLFxuICAgICAgICAgICAgZXJyb3JfbWVzc2FnZTogcnVuLmVycm9yX21lc3NhZ2UgfHwgJ1Vua25vd24gZXJyb3InXG4gICAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gU2hvdWxkbid0IGhhcHBlbiwgYnV0IGhhbmRsZSBncmFjZWZ1bGx5XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBydW5faWQ6IHJ1bi5pZCxcbiAgICAgICAgICAgIHN0YXR1czogcnVuLnN0YXR1cyxcbiAgICAgICAgICAgIGJ1c2luZXNzX25hbWU6IHJ1bi5pbnB1dF9qc29uPy5idXNpbmVzc19uYW1lIHx8IG51bGwsXG4gICAgICAgICAgICBibG9nX3RvcGljOiBydW4uaW5wdXRfanNvbj8uYmxvZ190b3BpYyB8fCBydW4uaW5wdXRfanNvbj8udG9waWMgfHwgbnVsbFxuICAgICAgICB9O1xuICAgIH1cbn1cbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL2NhbGxiYWNrLXN0ZXAvL3NlbmRDYWxsYmFja1N0ZXBcIiwgc2VuZENhbGxiYWNrU3RlcCk7XG4iLCAiaW1wb3J0IHsgcmVnaXN0ZXJTdGVwRnVuY3Rpb24gfSBmcm9tIFwid29ya2Zsb3cvaW50ZXJuYWwvcHJpdmF0ZVwiO1xuaW1wb3J0ICdzZXJ2ZXItb25seSc7XG5pbXBvcnQgeyBnZW5lcmF0ZVRleHQgfSBmcm9tICdhaSc7XG5pbXBvcnQgeyBvcGVuYWkgfSBmcm9tICdAYWktc2RrL29wZW5haSc7XG4vKipfX2ludGVybmFsX3dvcmtmbG93c3tcInN0ZXBzXCI6e1wibGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9lZGl0b3Itc3RlcC50c1wiOntcInJ1bkVkaXRvclN0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9lZGl0b3Itc3RlcC8vcnVuRWRpdG9yU3RlcFwifX19fSovO1xuLyoqXG4gKiBFZGl0b3IgQWdlbnQgU3RlcFxuICogSW1wcm92ZXMgdGhlIGRyYWZ0IGJhc2VkIG9uIFNFTyBRQSByZWNvbW1lbmRhdGlvbnMgYW5kIGJyYW5kIGd1aWRlbGluZXNcbiAqIERvZXMgTk9UIG92ZXJ3cml0ZSB0aGUgb3JpZ2luYWwgZHJhZnRfbWFya2Rvd24gLSByZXN1bHQgZ29lcyB0byBmaW5hbF9vdXRwdXRfanNvblxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5FZGl0b3JTdGVwKHJ1bklkLCBpbnB1dCwgcmVzZWFyY2gsIG91dGxpbmUsIG9yaWdpbmFsRHJhZnQsIHNlb1FhKSB7XG4gICAgY29uc29sZS5sb2coYFt2MF0gRWRpdG9yIHN0ZXA6IFN0YXJ0aW5nIGZvciBydW4gJHtydW5JZH1gKTtcbiAgICB0cnkge1xuICAgICAgICAvLyBCdWlsZCBjb250ZXh0IGZvciBlZGl0b3JcbiAgICAgICAgY29uc3QgZWRpdG9yQ29udGV4dCA9IGJ1aWxkRWRpdG9yQ29udGV4dChpbnB1dCwgcmVzZWFyY2gsIG91dGxpbmUsIHNlb1FhKTtcbiAgICAgICAgLy8gR2V0IG1vZGVsIG5hbWUgZnJvbSBlbnZpcm9ubWVudCBvciB1c2UgZGVmYXVsdFxuICAgICAgICBjb25zdCBtb2RlbE5hbWUgPSBwcm9jZXNzLmVudi5FRElUT1JfQUdFTlRfTU9ERUwgfHwgJ2dwdC01LjQtbWluaSc7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIEVkaXRvciBzdGVwOiBVc2luZyBtb2RlbDogJHttb2RlbE5hbWV9YCk7XG4gICAgICAgIC8vIEdlbmVyYXRlIGltcHJvdmVkIGRyYWZ0XG4gICAgICAgIGNvbnN0IHsgdGV4dDogaW1wcm92ZW1lbnRBbmFseXNpcyB9ID0gYXdhaXQgZ2VuZXJhdGVUZXh0KHtcbiAgICAgICAgICAgIG1vZGVsOiBvcGVuYWkobW9kZWxOYW1lKSxcbiAgICAgICAgICAgIHRlbXBlcmF0dXJlOiAwLjcsXG4gICAgICAgICAgICBtYXhUb2tlbnM6IDgwMDAsXG4gICAgICAgICAgICBzeXN0ZW06IGBZb3UgYXJlIGFuIGV4cGVydCBjb250ZW50IGVkaXRvci4gWW91ciByb2xlIGlzIHRvIGltcHJvdmUgYmxvZyBkcmFmdHMgYmFzZWQgb24gU0VPIFFBIGZlZWRiYWNrIHdoaWxlIG1haW50YWluaW5nIGF1dGhlbnRpY2l0eSBhbmQgYnJhbmQgdm9pY2UuXG5cbklNUE9SVEFOVCBSVUxFUzpcbjEuIFByZXNlcnZlIHRoZSBvcmlnaW5hbCBIMS9IMi9IMyBzdHJ1Y3R1cmVcbjIuIEltcHJvdmUgY2xhcml0eSwgdHJhbnNpdGlvbnMsIGFuZCByZWFkYWJpbGl0eVxuMy4gRml4IGlzc3VlcyBpZGVudGlmaWVkIGluIFNFTyBRQSBvdXRwdXRcbjQuIEtlZXAga2V5d29yZHMgbmF0dXJhbCAtIHByaW9yaXRpemUgcmVhZGFiaWxpdHkgb3ZlciBrZXl3b3JkIHN0dWZmaW5nXG41LiBQcmVzZXJ2ZSBhbGwgZmFjdHVhbCBjb250ZW50IGFuZCBjYXV0aW9uIGFib3V0IGxpbWl0YXRpb25zXG42LiBEbyBOT1QgaW52ZW50IHN0YXRpc3RpY3Mgb3IgZmFrZSBjbGFpbXNcbjcuIERvIE5PVCBtb2RpZnkgY2xpZW50IGNsYWltcyBvciBpbnZlbnRlZCBjcmVkZW50aWFsc1xuOC4gS2VlcCBNYXJrZG93biBmb3JtYXRcbjkuIFByZXNlcnZlIENUQSBzZWN0aW9uIGlmIHByZXNlbnRcbjEwLiBQcmVzZXJ2ZSBpbnRlcm5hbCBsaW5rIHBsYWNlaG9sZGVycyBpZiBwcmVzZW50XG5cbk91dHB1dCBhIEpTT04gb2JqZWN0IHdpdGg6XG57XG4gIFwiZWRpdGVkX2RyYWZ0XCI6IFwiY29tcGxldGUgaW1wcm92ZWQgbWFya2Rvd24uLi5cIixcbiAgXCJjaGFuZ2VzX3N1bW1hcnlcIjogW1wiY2hhbmdlIDFcIiwgXCJjaGFuZ2UgMlwiLCAuLi5dLFxuICBcIm5vdGVzXCI6IFtcIm5vdGUgMVwiLCBcIm5vdGUgMlwiLCAuLi5dXG59YCxcbiAgICAgICAgICAgIG1lc3NhZ2VzOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICByb2xlOiAndXNlcicsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGBQbGVhc2UgaW1wcm92ZSB0aGlzIGRyYWZ0IGJhc2VkIG9uIHRoZSBmb2xsb3dpbmcgZmVlZGJhY2s6XG5cbk9SSUdJTkFMIERSQUZUOlxuJHtvcmlnaW5hbERyYWZ0fVxuXG5TRU8gUUEgRkVFREJBQ0s6XG4ke2VkaXRvckNvbnRleHR9XG5cblByb3ZpZGUgdGhlIGVkaXRlZCBkcmFmdCBhbmQgYSBzdW1tYXJ5IG9mIGNoYW5nZXMgbWFkZS5gXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXVxuICAgICAgICB9KTtcbiAgICAgICAgLy8gUGFyc2UgaW1wcm92ZW1lbnQgYW5hbHlzaXNcbiAgICAgICAgbGV0IGVkaXRvck91dHB1dDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UoaW1wcm92ZW1lbnRBbmFseXNpcyk7XG4gICAgICAgICAgICBlZGl0b3JPdXRwdXQgPSB7XG4gICAgICAgICAgICAgICAgZWRpdGVkX2RyYWZ0X21hcmtkb3duOiBwYXJzZWQuZWRpdGVkX2RyYWZ0IHx8IG9yaWdpbmFsRHJhZnQsXG4gICAgICAgICAgICAgICAgZWRpdG9yX25vdGVzOiBwYXJzZWQubm90ZXMgfHwgW10sXG4gICAgICAgICAgICAgICAgY2hhbmdlc19tYWRlOiBwYXJzZWQuY2hhbmdlc19zdW1tYXJ5IHx8IFtdLFxuICAgICAgICAgICAgICAgIGh1bWFuX3Jldmlld19yZXF1aXJlZDogdHJ1ZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBjYXRjaCAge1xuICAgICAgICAgICAgLy8gRmFsbGJhY2sgaWYgcGFyc2luZyBmYWlsc1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBbdjBdIEVkaXRvciBzdGVwOiBGYWlsZWQgdG8gcGFyc2UgZWRpdG9yIHJlc3BvbnNlLCB1c2luZyBmYWxsYmFja2ApO1xuICAgICAgICAgICAgZWRpdG9yT3V0cHV0ID0ge1xuICAgICAgICAgICAgICAgIGVkaXRlZF9kcmFmdF9tYXJrZG93bjogb3JpZ2luYWxEcmFmdCxcbiAgICAgICAgICAgICAgICBlZGl0b3Jfbm90ZXM6IFtcbiAgICAgICAgICAgICAgICAgICAgJ0VkaXRvciBwcm9jZXNzaW5nIGNvbXBsZXRlZCB3aXRoIGZhbGxiYWNrJ1xuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgY2hhbmdlc19tYWRlOiBbXSxcbiAgICAgICAgICAgICAgICBodW1hbl9yZXZpZXdfcmVxdWlyZWQ6IHRydWVcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gRWRpdG9yIHN0ZXA6IEdlbmVyYXRlZCBlZGl0ZWQgZHJhZnQgKCR7ZWRpdG9yT3V0cHV0LmVkaXRlZF9kcmFmdF9tYXJrZG93bi5sZW5ndGh9IGNoYXJzKWApO1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBFZGl0b3Igc3RlcDogJHtlZGl0b3JPdXRwdXQuY2hhbmdlc19tYWRlLmxlbmd0aH0gY2hhbmdlcyBpZGVudGlmaWVkYCk7XG4gICAgICAgIHJldHVybiBlZGl0b3JPdXRwdXQ7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICBjb25zb2xlLmVycm9yKGBbdjBdIEVkaXRvciBzdGVwIGVycm9yOiAke2Vycm9yTWVzc2FnZX1gKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxufVxuLyoqXG4gKiBCdWlsZCBjb250ZXh0IGZvciBlZGl0b3IgYmFzZWQgb24gU0VPIFFBIGZpbmRpbmdzXG4gKi8gZnVuY3Rpb24gYnVpbGRFZGl0b3JDb250ZXh0KGlucHV0LCByZXNlYXJjaCwgb3V0bGluZSwgc2VvUWEpIHtcbiAgICBjb25zdCBzZWN0aW9ucyA9IFtdO1xuICAgIHNlY3Rpb25zLnB1c2goJyMjIFNFTyBQZXJmb3JtYW5jZSBTdW1tYXJ5Jyk7XG4gICAgc2VjdGlvbnMucHVzaChgT3ZlcmFsbCBTY29yZTogJHtzZW9RYS5vdmVyYWxsX3Njb3JlfS8xMDBgKTtcbiAgICBzZWN0aW9ucy5wdXNoKCdcXG4jIyBTZWFyY2ggSW50ZW50IEFsaWdubWVudCcpO1xuICAgIHNlY3Rpb25zLnB1c2goYFNjb3JlOiAke3Nlb1FhLnNlYXJjaF9pbnRlbnRfYWxpZ25tZW50LnNjb3JlfS8xMDBgKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBBbmFseXNpczogJHtzZW9RYS5zZWFyY2hfaW50ZW50X2FsaWdubWVudC5hbmFseXNpc31gKTtcbiAgICBzZWN0aW9ucy5wdXNoKCdcXG4jIyBQcmltYXJ5IEtleXdvcmQgVXNhZ2UnKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBTY29yZTogJHtzZW9RYS5wcmltYXJ5X2tleXdvcmRfdXNhZ2Uuc2NvcmV9LzEwMGApO1xuICAgIHNlY3Rpb25zLnB1c2goYE9jY3VycmVuY2VzOiAke3Nlb1FhLnByaW1hcnlfa2V5d29yZF91c2FnZS5vY2N1cnJlbmNlc30gdGltZXNgKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBQbGFjZW1lbnQ6ICR7c2VvUWEucHJpbWFyeV9rZXl3b3JkX3VzYWdlLnBsYWNlbWVudF9hbmFseXNpc31gKTtcbiAgICBzZWN0aW9ucy5wdXNoKCdcXG4jIyBTZWNvbmRhcnkgS2V5d29yZHMnKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBTY29yZTogJHtzZW9RYS5zZWNvbmRhcnlfa2V5d29yZF91c2FnZS5zY29yZX0vMTAwYCk7XG4gICAgc2VjdGlvbnMucHVzaChgQ292ZXJlZDogJHtzZW9RYS5zZWNvbmRhcnlfa2V5d29yZF91c2FnZS5rZXl3b3Jkc19jb3ZlcmVkLmpvaW4oJywgJyl9YCk7XG4gICAgaWYgKHNlb1FhLnNlY29uZGFyeV9rZXl3b3JkX3VzYWdlLmdhcHMubGVuZ3RoID4gMCkge1xuICAgICAgICBzZWN0aW9ucy5wdXNoKGBHYXBzOiAke3Nlb1FhLnNlY29uZGFyeV9rZXl3b3JkX3VzYWdlLmdhcHMuam9pbignLCAnKX1gKTtcbiAgICB9XG4gICAgc2VjdGlvbnMucHVzaCgnXFxuIyMgSGVhZGluZyBTdHJ1Y3R1cmUnKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBTY29yZTogJHtzZW9RYS5oZWFkaW5nX3N0cnVjdHVyZV9yZXZpZXcuc2NvcmV9LzEwMGApO1xuICAgIHNlY3Rpb25zLnB1c2goYEgxIFByZXNlbnQ6ICR7c2VvUWEuaGVhZGluZ19zdHJ1Y3R1cmVfcmV2aWV3LmgxX3ByZXNlbnR9YCk7XG4gICAgc2VjdGlvbnMucHVzaChgSDIgQ291bnQ6ICR7c2VvUWEuaGVhZGluZ19zdHJ1Y3R1cmVfcmV2aWV3LmgyX2NvdW50fWApO1xuICAgIGlmIChzZW9RYS5oZWFkaW5nX3N0cnVjdHVyZV9yZXZpZXcuaGllcmFyY2h5X2lzc3Vlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHNlY3Rpb25zLnB1c2goYElzc3VlczogJHtzZW9RYS5oZWFkaW5nX3N0cnVjdHVyZV9yZXZpZXcuaGllcmFyY2h5X2lzc3Vlcy5qb2luKCc7ICcpfWApO1xuICAgIH1cbiAgICBzZWN0aW9ucy5wdXNoKCdcXG4jIyBDb250ZW50IERlcHRoJyk7XG4gICAgc2VjdGlvbnMucHVzaChgU2NvcmU6ICR7c2VvUWEuY29udGVudF9kZXB0aF9yZXZpZXcuc2NvcmV9LzEwMGApO1xuICAgIHNlY3Rpb25zLnB1c2goYFdvcmQgQ291bnQ6ICR7c2VvUWEuY29udGVudF9kZXB0aF9yZXZpZXcud29yZF9jb3VudH0gd29yZHNgKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBDb3ZlcmFnZTogJHtzZW9RYS5jb250ZW50X2RlcHRoX3Jldmlldy5zZWN0aW9uX2NvdmVyYWdlfWApO1xuICAgIGlmIChzZW9RYS5jb250ZW50X2RlcHRoX3Jldmlldy5kZXB0aF9pc3N1ZXMubGVuZ3RoID4gMCkge1xuICAgICAgICBzZWN0aW9ucy5wdXNoKGBJc3N1ZXM6ICR7c2VvUWEuY29udGVudF9kZXB0aF9yZXZpZXcuZGVwdGhfaXNzdWVzLmpvaW4oJzsgJyl9YCk7XG4gICAgfVxuICAgIHNlY3Rpb25zLnB1c2goJ1xcbiMjIFJlYWRhYmlsaXR5Jyk7XG4gICAgc2VjdGlvbnMucHVzaChgU2NvcmU6ICR7c2VvUWEucmVhZGFiaWxpdHlfcmV2aWV3LnNjb3JlfS8xMDBgKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBBdmcgU2VudGVuY2UgTGVuZ3RoOiAke3Nlb1FhLnJlYWRhYmlsaXR5X3Jldmlldy5hdmdfc2VudGVuY2VfbGVuZ3RofSB3b3Jkc2ApO1xuICAgIHNlY3Rpb25zLnB1c2goYFJlYWRpbmcgTGV2ZWw6ICR7c2VvUWEucmVhZGFiaWxpdHlfcmV2aWV3LmZsZXNjaF9raW5jYWlkX2VzdGltYXRlfWApO1xuICAgIGlmIChzZW9RYS5yZWFkYWJpbGl0eV9yZXZpZXcucmVhZGFiaWxpdHlfaXNzdWVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgc2VjdGlvbnMucHVzaChgSXNzdWVzOiAke3Nlb1FhLnJlYWRhYmlsaXR5X3Jldmlldy5yZWFkYWJpbGl0eV9pc3N1ZXMuam9pbignOyAnKX1gKTtcbiAgICB9XG4gICAgc2VjdGlvbnMucHVzaCgnXFxuIyMgSW50ZXJuYWwgTGlua2luZycpO1xuICAgIHNlY3Rpb25zLnB1c2goYFNjb3JlOiAke3Nlb1FhLmludGVybmFsX2xpbmtpbmdfcmV2aWV3LnNjb3JlfS8xMDBgKTtcbiAgICBzZWN0aW9ucy5wdXNoKGBMaW5rcyBGb3VuZDogJHtzZW9RYS5pbnRlcm5hbF9saW5raW5nX3Jldmlldy5pbnRlcm5hbF9saW5rc19mb3VuZH1gKTtcbiAgICBpZiAoc2VvUWEuaW50ZXJuYWxfbGlua2luZ19yZXZpZXcuaW50ZXJuYWxfbGlua19yZWNvbW1lbmRhdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgICBzZWN0aW9ucy5wdXNoKGBSZWNvbW1lbmRhdGlvbnM6ICR7c2VvUWEuaW50ZXJuYWxfbGlua2luZ19yZXZpZXcuaW50ZXJuYWxfbGlua19yZWNvbW1lbmRhdGlvbnMuam9pbignOyAnKX1gKTtcbiAgICB9XG4gICAgc2VjdGlvbnMucHVzaCgnXFxuIyMgQ1RBICYgQnJhbmQgR3VpZGVsaW5lcycpO1xuICAgIGlmIChpbnB1dC5jdGFfbm90ZXMpIHtcbiAgICAgICAgc2VjdGlvbnMucHVzaChgQ1RBIE5vdGVzOiAke2lucHV0LmN0YV9ub3Rlc31gKTtcbiAgICB9XG4gICAgaWYgKGlucHV0LmJyYW5kX3ZvaWNlX25vdGVzKSB7XG4gICAgICAgIHNlY3Rpb25zLnB1c2goYEJyYW5kIFZvaWNlOiAke2lucHV0LmJyYW5kX3ZvaWNlX25vdGVzfWApO1xuICAgIH1cbiAgICBpZiAoaW5wdXQuYXVkaWVuY2Vfbm90ZXMpIHtcbiAgICAgICAgc2VjdGlvbnMucHVzaChgVGFyZ2V0IEF1ZGllbmNlOiAke2lucHV0LmF1ZGllbmNlX25vdGVzfWApO1xuICAgIH1cbiAgICByZXR1cm4gc2VjdGlvbnMuam9pbignXFxuJyk7XG59XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9lZGl0b3Itc3RlcC8vcnVuRWRpdG9yU3RlcFwiLCBydW5FZGl0b3JTdGVwKTtcbiIsICJpbXBvcnQgeyByZWdpc3RlclN0ZXBGdW5jdGlvbiB9IGZyb20gXCJ3b3JrZmxvdy9pbnRlcm5hbC9wcml2YXRlXCI7XG5pbXBvcnQgJ3NlcnZlci1vbmx5JztcbmltcG9ydCB7IHVwZGF0ZVJ1blN0YXR1cywgdXBkYXRlUnVuRXJyb3IsIGNvbXBsZXRlUnVuIH0gZnJvbSAnLi4vLi4vc3RvcmFnZS9ydW5zJztcbi8qKl9faW50ZXJuYWxfd29ya2Zsb3dze1wic3RlcHNcIjp7XCJsaWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL2hlbHBlcnMudHNcIjp7XCJjb21wbGV0ZVJ1blN0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9oZWxwZXJzLy9jb21wbGV0ZVJ1blN0ZXBcIn0sXCJtYXJrUnVuRmFpbGVkU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL2hlbHBlcnMvL21hcmtSdW5GYWlsZWRTdGVwXCJ9LFwibWFya1J1blJ1bm5pbmdTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvaGVscGVycy8vbWFya1J1blJ1bm5pbmdTdGVwXCJ9fX19Ki87XG4vKipcbiAqIE1hcmsgYSBydW4gYXMgcnVubmluZyAodHJhbnNpdGlvbiBmcm9tIHF1ZXVlZCB0byBydW5uaW5nKVxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBtYXJrUnVuUnVubmluZ1N0ZXAocnVuSWQpIHtcbiAgICBjb25zb2xlLmxvZyhgW3YwXSBIZWxwZXI6IE1hcmtpbmcgcnVuICR7cnVuSWR9IGFzIHJ1bm5pbmdgKTtcbiAgICBhd2FpdCB1cGRhdGVSdW5TdGF0dXMocnVuSWQsICdyZXNlYXJjaGluZycpO1xufVxuLyoqXG4gKiBNYXJrIGEgcnVuIGFzIGZhaWxlZCB3aXRoIGVycm9yIG1lc3NhZ2VcbiAqIENhbGxiYWNrIGlzIHNlbnQgYnkgd29ya2Zsb3cgb3JjaGVzdHJhdG9yLCBub3QgaGVyZVxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBtYXJrUnVuRmFpbGVkU3RlcChydW5JZCwgZXJyb3JNZXNzYWdlKSB7XG4gICAgY29uc29sZS5sb2coYFt2MF0gSGVscGVyOiBNYXJraW5nIHJ1biAke3J1bklkfSBhcyBmYWlsZWQgd2l0aCBlcnJvcjogJHtlcnJvck1lc3NhZ2V9YCk7XG4gICAgYXdhaXQgdXBkYXRlUnVuRXJyb3IocnVuSWQsIGVycm9yTWVzc2FnZSk7XG59XG4vKipcbiAqIENvbXBsZXRlIGEgcnVuIHdpdGggZmluYWwgb3V0cHV0XG4gKiBDYWxsYmFjayBpcyBzZW50IGJ5IHdvcmtmbG93IG9yY2hlc3RyYXRvciwgbm90IGhlcmVcbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gY29tcGxldGVSdW5TdGVwKHJ1bklkLCBmaW5hbE91dHB1dCkge1xuICAgIGNvbnNvbGUubG9nKGBbdjBdIEhlbHBlcjogQ29tcGxldGluZyBydW4gJHtydW5JZH1gKTtcbiAgICBhd2FpdCBjb21wbGV0ZVJ1bihydW5JZCwgZmluYWxPdXRwdXQpO1xufVxucmVnaXN0ZXJTdGVwRnVuY3Rpb24oXCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvaGVscGVycy8vbWFya1J1blJ1bm5pbmdTdGVwXCIsIG1hcmtSdW5SdW5uaW5nU3RlcCk7XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9oZWxwZXJzLy9tYXJrUnVuRmFpbGVkU3RlcFwiLCBtYXJrUnVuRmFpbGVkU3RlcCk7XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9oZWxwZXJzLy9jb21wbGV0ZVJ1blN0ZXBcIiwgY29tcGxldGVSdW5TdGVwKTtcbiIsICJpbXBvcnQgeyByZWdpc3RlclN0ZXBGdW5jdGlvbiB9IGZyb20gXCJ3b3JrZmxvdy9pbnRlcm5hbC9wcml2YXRlXCI7XG5pbXBvcnQgJ3NlcnZlci1vbmx5JztcbmltcG9ydCB7IGdlbmVyYXRlVGV4dCB9IGZyb20gJ2FpJztcbmltcG9ydCB7IG9wZW5haSB9IGZyb20gJ0BhaS1zZGsvb3BlbmFpJztcbi8qKl9faW50ZXJuYWxfd29ya2Zsb3dze1wic3RlcHNcIjp7XCJsaWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL21ldGEtc3RlcC50c1wiOntcInJ1bk1ldGFTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvbWV0YS1zdGVwLy9ydW5NZXRhU3RlcFwifX19fSovO1xuLyoqXG4gKiBNZXRhIEFnZW50IFN0ZXAgLSBQaGFzZSAyQy1GXG4gKiBHZW5lcmF0ZXMgU0VPIG1ldGFkYXRhIGZvciBodW1hbiByZXZpZXdcbiAqIERvZXMgTk9UIHB1Ymxpc2gsIGNhbGwgZXh0ZXJuYWwgc2VydmljZXMsIG9yIG92ZXJ3cml0ZSBkcmFmdHNcbiAqIE91dHB1dCBnb2VzIHRvIGZpbmFsX291dHB1dF9qc29uIGFzIG1ldGFfanNvblxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5NZXRhU3RlcChydW5JZCwgaW5wdXQsIHJlc2VhcmNoLCBvdXRsaW5lLCBvcmlnaW5hbERyYWZ0LCBzZW9RYSwgZWRpdGVkRHJhZnQpIHtcbiAgICBjb25zb2xlLmxvZyhgW3YwXSBNZXRhIHN0ZXA6IFN0YXJ0aW5nIGZvciBydW4gJHtydW5JZH1gKTtcbiAgICB0cnkge1xuICAgICAgICAvLyBCdWlsZCBjb250ZXh0IGZvciBtZXRhIGdlbmVyYXRpb25cbiAgICAgICAgY29uc3QgbWV0YUNvbnRleHQgPSBidWlsZE1ldGFDb250ZXh0KGlucHV0LCByZXNlYXJjaCwgb3V0bGluZSwgc2VvUWEsIG9yaWdpbmFsRHJhZnQsIGVkaXRlZERyYWZ0KTtcbiAgICAgICAgLy8gR2V0IG1vZGVsIG5hbWUgZnJvbSBlbnZpcm9ubWVudCBvciB1c2UgZGVmYXVsdFxuICAgICAgICBjb25zdCBtb2RlbE5hbWUgPSBwcm9jZXNzLmVudi5NRVRBX0FHRU5UX01PREVMIHx8ICdncHQtNS40LW1pbmknO1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBNZXRhIHN0ZXA6IFVzaW5nIG1vZGVsOiAke21vZGVsTmFtZX1gKTtcbiAgICAgICAgLy8gR2VuZXJhdGUgbWV0YWRhdGFcbiAgICAgICAgY29uc3QgeyB0ZXh0OiBtZXRhQW5hbHlzaXMgfSA9IGF3YWl0IGdlbmVyYXRlVGV4dCh7XG4gICAgICAgICAgICBtb2RlbDogb3BlbmFpKG1vZGVsTmFtZSksXG4gICAgICAgICAgICB0ZW1wZXJhdHVyZTogMC41LFxuICAgICAgICAgICAgbWVzc2FnZXM6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHJvbGU6ICd1c2VyJyxcbiAgICAgICAgICAgICAgICAgICAgY29udGVudDogbWV0YUNvbnRleHRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBNZXRhIHN0ZXA6IFJlY2VpdmVkIGFuYWx5c2lzLCBwYXJzaW5nIEpTT05gKTtcbiAgICAgICAgLy8gUGFyc2UgdGhlIHJlc3BvbnNlXG4gICAgICAgIGxldCBtZXRhT3V0cHV0O1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gRXh0cmFjdCBKU09OIGZyb20gcmVzcG9uc2UgKG1heSBoYXZlIHN1cnJvdW5kaW5nIHRleHQpXG4gICAgICAgICAgICBjb25zdCBqc29uTWF0Y2ggPSBtZXRhQW5hbHlzaXMubWF0Y2goL1xce1tcXHNcXFNdKlxcfS8pO1xuICAgICAgICAgICAgaWYgKCFqc29uTWF0Y2gpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIEpTT04gZm91bmQgaW4gcmVzcG9uc2UnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG1ldGFPdXRwdXQgPSBKU09OLnBhcnNlKGpzb25NYXRjaFswXSk7XG4gICAgICAgIH0gY2F0Y2ggKHBhcnNlRXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgW3YwXSBNZXRhIHN0ZXA6IEZhaWxlZCB0byBwYXJzZSBKU09OIHJlc3BvbnNlLCB1c2luZyBmYWxsYmFja2AsIHBhcnNlRXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IHBhcnNlRXJyb3IubWVzc2FnZSA6IFN0cmluZyhwYXJzZUVycm9yKSk7XG4gICAgICAgICAgICBtZXRhT3V0cHV0ID0gZ2VuZXJhdGVGYWxsYmFja01ldGEoaW5wdXQsIHJlc2VhcmNoLCBzZW9RYSwgb3JpZ2luYWxEcmFmdCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gVmFsaWRhdGUgcmVxdWlyZWQgZmllbGRzXG4gICAgICAgIGNvbnN0IHJlcXVpcmVkRmllbGRzID0gW1xuICAgICAgICAgICAgJ3Nlb190aXRsZScsXG4gICAgICAgICAgICAnbWV0YV9kZXNjcmlwdGlvbicsXG4gICAgICAgICAgICAnc3VnZ2VzdGVkX3NsdWcnLFxuICAgICAgICAgICAgJ3ByaW1hcnlfa2V5d29yZCcsXG4gICAgICAgICAgICAnc2Vjb25kYXJ5X2tleXdvcmRzX3VzZWQnLFxuICAgICAgICAgICAgJ2V4Y2VycHQnLFxuICAgICAgICAgICAgJ29nX3RpdGxlJyxcbiAgICAgICAgICAgICdvZ19kZXNjcmlwdGlvbicsXG4gICAgICAgICAgICAnY2Fub25pY2FsX3VybF9zdWdnZXN0aW9uJyxcbiAgICAgICAgICAgICdzY2hlbWFfdHlwZV9zdWdnZXN0aW9uJyxcbiAgICAgICAgICAgICdodW1hbl9yZXZpZXdfbm90ZXMnXG4gICAgICAgIF07XG4gICAgICAgIGZvciAoY29uc3QgZmllbGQgb2YgcmVxdWlyZWRGaWVsZHMpe1xuICAgICAgICAgICAgaWYgKG1ldGFPdXRwdXRbZmllbGRdID09PSB1bmRlZmluZWQgfHwgbWV0YU91dHB1dFtmaWVsZF0gPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFt2MF0gTWV0YSBzdGVwOiBNaXNzaW5nIGZpZWxkICR7ZmllbGR9LCB1c2luZyBmYWxsYmFja2ApO1xuICAgICAgICAgICAgICAgIG1ldGFPdXRwdXQgPSBnZW5lcmF0ZUZhbGxiYWNrTWV0YShpbnB1dCwgcmVzZWFyY2gsIHNlb1FhLCBvcmlnaW5hbERyYWZ0KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBNZXRhIHN0ZXA6IENvbXBsZXRlIGZvciBydW4gJHtydW5JZH1gLCBgR2VuZXJhdGVkIG1ldGFkYXRhOiAke21ldGFPdXRwdXQuc2VvX3RpdGxlLnN1YnN0cmluZygwLCA1MCl9Li4uYCk7XG4gICAgICAgIHJldHVybiBtZXRhT3V0cHV0O1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgY29uc29sZS5lcnJvcihgW3YwXSBNZXRhIHN0ZXAgZXJyb3IgZm9yIHJ1biAke3J1bklkfTogJHtlcnJvck1lc3NhZ2V9YCk7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbn1cbi8qKlxuICogQnVpbGQgY29udGV4dCBwcm9tcHQgZm9yIG1ldGFkYXRhIGdlbmVyYXRpb25cbiAqLyBmdW5jdGlvbiBidWlsZE1ldGFDb250ZXh0KGlucHV0LCByZXNlYXJjaCwgb3V0bGluZSwgc2VvUWEsIG9yaWdpbmFsRHJhZnQsIGVkaXRlZERyYWZ0KSB7XG4gICAgY29uc3Qgd29yZENvdW50ID0gZWRpdGVkRHJhZnQuc3BsaXQoL1xccysvKS5sZW5ndGg7XG4gICAgY29uc3QgaGVhZGluZ3MgPSBlZGl0ZWREcmFmdC5tYXRjaCgvXiMrXFxzKy4rJC9nbSkgfHwgW107XG4gICAgcmV0dXJuIGBZb3UgYXJlIGFuIGV4cGVydCBTRU8gbWV0YWRhdGEgc3BlY2lhbGlzdC4gR2VuZXJhdGUgU0VPIG1ldGFkYXRhIGZvciBhIGJsb2cgcG9zdCBmb3IgaHVtYW4gcmV2aWV3LlxuXG5CTE9HIFRPUElDOiAke2lucHV0LmJsb2dfdG9waWN9XG5CVVNJTkVTUyBOQU1FOiAke2lucHV0LmJ1c2luZXNzX25hbWUgfHwgJ05vdCBwcm92aWRlZCd9XG5XRUJTSVRFIFVSTDogJHtpbnB1dC53ZWJzaXRlX3VybCB8fCAnTm90IHByb3ZpZGVkJ31cblBSSU1BUlkgS0VZV09SRDogJHtpbnB1dC5wcmltYXJ5X2tleXdvcmR9XG5TRUNPTkRBUlkgS0VZV09SRFM6ICR7KGlucHV0LnNlY29uZGFyeV9rZXl3b3JkcyB8fCBbXSkuam9pbignLCAnKSB8fCAnTm9uZSBwcm92aWRlZCd9XG5UQVJHRVQgQVVESUVOQ0U6ICR7aW5wdXQuYXVkaWVuY2Vfbm90ZXMgfHwgJ0dlbmVyYWwgYXVkaWVuY2UnfVxuXG5SRVNFQVJDSCBTVU1NQVJZOlxuJHtyZXNlYXJjaC5rZXlfZmluZGluZ3Muc2xpY2UoMCwgMykuam9pbignXFxuJyl9XG5cbk9VVExJTkUgU1RSVUNUVVJFOlxuJHtvdXRsaW5lLnNlY3Rpb25zLm1hcCgocyk9PmAtICR7cy5oZWFkaW5nfSAoJHtzLnN1YnNlY3Rpb25zPy5sZW5ndGggfHwgMH0gc3Vic2VjdGlvbnMpYCkuam9pbignXFxuJyl9XG5cblNFTyBRQSBSRVZJRVc6XG4tIE92ZXJhbGwgU2NvcmU6ICR7c2VvUWEub3ZlcmFsbF9zY29yZX1cbi0gU2VhcmNoIEludGVudCBBbGlnbm1lbnQ6ICR7c2VvUWEuc2VhcmNoX2ludGVudF9hbGlnbm1lbnR9XG4tIEtleXdvcmQgVXNhZ2U6ICR7c2VvUWEua2V5d29yZF91c2FnZV9hc3Nlc3NtZW50fVxuLSBIZWFkaW5nIFN0cnVjdHVyZTogJHtzZW9RYS5oZWFkaW5nX3N0cnVjdHVyZV9hc3Nlc3NtZW50fVxuXG5DT05URU5UIFNUQVRTOlxuLSBXb3JkIENvdW50OiAke3dvcmRDb3VudH1cbi0gSGVhZGluZ3M6ICR7aGVhZGluZ3MubGVuZ3RofVxuLSBIYXMgQ1RBOiAke2lucHV0LmN0YV9ub3RlcyA/ICdZZXMnIDogJ05vJ31cbi0gSGFzIEludGVybmFsIExpbmtzOiAke2lucHV0LmludGVybmFsX2xpbmtfbm90ZXMgPyAnWWVzJyA6ICdObyd9XG5cbkdlbmVyYXRlIG1ldGFkYXRhIHRoYXQ6XG4xLiBBY2N1cmF0ZWx5IHJlcHJlc2VudHMgdGhlIGJsb2cgY29udGVudCAoZG8gbm90IGludmVudCBjbGFpbXMpXG4yLiBJbmNsdWRlcyB0aGUgcHJpbWFyeSBrZXl3b3JkIG5hdHVyYWxseSBpbiB0aXRsZSBhbmQgZGVzY3JpcHRpb25cbjMuIElzIFNFTy1vcHRpbWl6ZWQgZm9yIHNlYXJjaCBlbmdpbmVzXG40LiBJcyBjb21wZWxsaW5nIGZvciBodW1hbiByZWFkZXJzIGFuZCBDVFJcbjUuIEZvbGxvd3MgYmVzdCBwcmFjdGljZXMgKHRpdGxlIG1heCA2MCBjaGFycywgZGVzY3JpcHRpb24gbWF4IDE2MCBjaGFycylcbjYuIEluY2x1ZGVzIHJldmlldyBub3RlcyBmb3IgdGhlIGh1bWFuIGVkaXRvclxuXG5SZXR1cm4gYSBKU09OIG9iamVjdCB3aXRoIHRoZXNlIGV4YWN0IGZpZWxkczpcbntcbiAgXCJzZW9fdGl0bGVcIjogXCJTRU8tb3B0aW1pemVkIHRpdGxlIChtYXggNjAgY2hhcnMpXCIsXG4gIFwibWV0YV9kZXNjcmlwdGlvblwiOiBcIkNvbXBlbGxpbmcgZGVzY3JpcHRpb24gKG1heCAxNjAgY2hhcnMpXCIsXG4gIFwic3VnZ2VzdGVkX3NsdWdcIjogXCJ1cmwtc2x1Zy1mb3JtYXRcIixcbiAgXCJwcmltYXJ5X2tleXdvcmRcIjogXCIke2lucHV0LnByaW1hcnlfa2V5d29yZH1cIixcbiAgXCJzZWNvbmRhcnlfa2V5d29yZHNfdXNlZFwiOiBbXCJrZXl3b3JkMVwiLCBcImtleXdvcmQyXCJdLFxuICBcImV4Y2VycHRcIjogXCJCcmllZiBzdW1tYXJ5IGZvciBibG9nIGxpc3RpbmdzIChtYXggMTU1IGNoYXJzKVwiLFxuICBcIm9nX3RpdGxlXCI6IFwiT3BlbkdyYXBoIHRpdGxlIGZvciBzb2NpYWwgc2hhcmluZ1wiLFxuICBcIm9nX2Rlc2NyaXB0aW9uXCI6IFwiT3BlbkdyYXBoIGRlc2NyaXB0aW9uIGZvciBzb2NpYWwgc2hhcmluZ1wiLFxuICBcImNhbm9uaWNhbF91cmxfc3VnZ2VzdGlvblwiOiBcImh0dHBzOi8vZXhhbXBsZS5jb20vYmxvZy91cmwtc2x1ZyBvciBsZWF2ZSBhcyBudWxsIGlmIHdlYnNpdGVfdXJsIG5vdCBwcm92aWRlZFwiLFxuICBcInNjaGVtYV90eXBlX3N1Z2dlc3Rpb25cIjogXCJCbG9nUG9zdGluZyBvciBOZXdzQXJ0aWNsZVwiLFxuICBcImh1bWFuX3Jldmlld19ub3Rlc1wiOiBbXCJub3RlMVwiLCBcIm5vdGUyXCJdXG59YDtcbn1cbi8qKlxuICogR2VuZXJhdGUgZmFsbGJhY2sgbWV0YWRhdGEgaWYgQUkgcGFyc2luZyBmYWlsc1xuICovIGZ1bmN0aW9uIGdlbmVyYXRlRmFsbGJhY2tNZXRhKGlucHV0LCByZXNlYXJjaCwgc2VvUWEsIGRyYWZ0KSB7XG4gICAgY29uc3QgcHJpbWFyeUtleXdvcmQgPSBpbnB1dC5wcmltYXJ5X2tleXdvcmQgfHwgJ2Jsb2cgcG9zdCc7XG4gICAgY29uc3Qgc2x1ZyA9IGlucHV0LmJsb2dfdG9waWMudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9bXmEtejAtOV0rL2csICctJykucmVwbGFjZSgvXi18LSQvZywgJycpO1xuICAgIGNvbnN0IHdvcmRDb3VudCA9IGRyYWZ0LnNwbGl0KC9cXHMrLykubGVuZ3RoO1xuICAgIHJldHVybiB7XG4gICAgICAgIHNlb190aXRsZTogYCR7aW5wdXQuYmxvZ190b3BpY30gLSAke2lucHV0LmJ1c2luZXNzX25hbWUgfHwgJ0Jsb2cnfWAsXG4gICAgICAgIG1ldGFfZGVzY3JpcHRpb246IGBDb21wcmVoZW5zaXZlIGd1aWRlIHRvICR7aW5wdXQuYmxvZ190b3BpYy50b0xvd2VyQ2FzZSgpfS4gUmVzZWFyY2gtYmFja2VkIGluc2lnaHRzIGFuZCBwcmFjdGljYWwgc3RyYXRlZ2llcy4gJHt3b3JkQ291bnR9IHdvcmRzLmAsXG4gICAgICAgIHN1Z2dlc3RlZF9zbHVnOiBzbHVnLFxuICAgICAgICBwcmltYXJ5X2tleXdvcmQ6IHByaW1hcnlLZXl3b3JkLFxuICAgICAgICBzZWNvbmRhcnlfa2V5d29yZHNfdXNlZDogaW5wdXQuc2Vjb25kYXJ5X2tleXdvcmRzIHx8IFtdLFxuICAgICAgICBleGNlcnB0OiBgTGVhcm4gYWJvdXQgJHtpbnB1dC5ibG9nX3RvcGljLnRvTG93ZXJDYXNlKCl9IHdpdGggaW5zaWdodHMgZnJvbSBvdXIgcmVzZWFyY2guICR7d29yZENvdW50fS13b3JkIGd1aWRlIGNvdmVyaW5nIGtleSBhc3BlY3RzIGFuZCBzdHJhdGVnaWVzLmAsXG4gICAgICAgIG9nX3RpdGxlOiBgJHtpbnB1dC5ibG9nX3RvcGljfSB8ICR7aW5wdXQuYnVzaW5lc3NfbmFtZSB8fCAnQmxvZyd9YCxcbiAgICAgICAgb2dfZGVzY3JpcHRpb246IGBEaXNjb3ZlciAke2lucHV0LmJsb2dfdG9waWMudG9Mb3dlckNhc2UoKX0uIENvbXByZWhlbnNpdmUgZ3VpZGUgd2l0aCByZXNlYXJjaCBhbmQgaW5zaWdodHMuYCxcbiAgICAgICAgY2Fub25pY2FsX3VybF9zdWdnZXN0aW9uOiBpbnB1dC53ZWJzaXRlX3VybCA/IGAke2lucHV0LndlYnNpdGVfdXJsfS9ibG9nLyR7c2x1Z31gIDogbnVsbCxcbiAgICAgICAgc2NoZW1hX3R5cGVfc3VnZ2VzdGlvbjogJ0Jsb2dQb3N0aW5nJyxcbiAgICAgICAgaHVtYW5fcmV2aWV3X25vdGVzOiBbXG4gICAgICAgICAgICBgT3ZlcmFsbCBTRU8gU2NvcmU6ICR7c2VvUWEub3ZlcmFsbF9zY29yZX1gLFxuICAgICAgICAgICAgJ1JldmlldyBhbmQgYWRqdXN0IG1ldGFkYXRhIGFzIG5lZWRlZCBmb3IgeW91ciBicmFuZCB2b2ljZScsXG4gICAgICAgICAgICAnRW5zdXJlIFNFTyB0aXRsZSBhbmQgbWV0YSBkZXNjcmlwdGlvbiBhcmUgY29tcGVsbGluZyBmb3IgQ1RSJyxcbiAgICAgICAgICAgICdWZXJpZnkgY2Fub25pY2FsIFVSTCBtYXRjaGVzIHlvdXIgc2l0ZSBzdHJ1Y3R1cmUnLFxuICAgICAgICAgICAgJ0NoZWNrIHRoYXQgc2NoZW1hIHR5cGUgbWF0Y2hlcyB5b3VyIGNvbnRlbnQgZm9ybWF0J1xuICAgICAgICBdXG4gICAgfTtcbn1cbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL21ldGEtc3RlcC8vcnVuTWV0YVN0ZXBcIiwgcnVuTWV0YVN0ZXApO1xuIiwgImltcG9ydCB7IHJlZ2lzdGVyU3RlcEZ1bmN0aW9uIH0gZnJvbSBcIndvcmtmbG93L2ludGVybmFsL3ByaXZhdGVcIjtcbmltcG9ydCAnc2VydmVyLW9ubHknO1xuaW1wb3J0IHsgZ2VuZXJhdGVUZXh0IH0gZnJvbSAnYWknO1xuaW1wb3J0IHsgb3BlbmFpIH0gZnJvbSAnQGFpLXNkay9vcGVuYWknO1xuaW1wb3J0IHsgdXBkYXRlUnVuU3RhdHVzIH0gZnJvbSAnLi4vLi4vc3RvcmFnZS9ydW5zJztcbi8qKl9faW50ZXJuYWxfd29ya2Zsb3dze1wic3RlcHNcIjp7XCJsaWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL291dGxpbmUtc3RlcC50c1wiOntcInJ1bk91dGxpbmVTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvb3V0bGluZS1zdGVwLy9ydW5PdXRsaW5lU3RlcFwifX19fSovO1xuLyoqXG4gKiBPdXRsaW5lIFN0ZXAgLSBQaGFzZSAyQy1CXG4gKiBSdW5zIGluc2lkZSBhIGR1cmFibGUgc3RlcCBmdW5jdGlvbiAoaGFzIE5vZGUuanMgYWNjZXNzKVxuICogQ2FsbHMgQUkgbW9kZWwgdG8gZ2VuZXJhdGUgY29udGVudCBvdXRsaW5lIHdpdGggc3RydWN0dXJlXG4gKiBVc2VzIHJlc2VhcmNoIGRhdGEgaWYgYXZhaWxhYmxlIHRvIGluZm9ybSBvdXRsaW5lXG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJ1bk91dGxpbmVTdGVwKHJ1bklkLCBpbnB1dCwgcmVzZWFyY2hEYXRhKSB7XG4gICAgY29uc29sZS5sb2coYFt2MF0gT3V0bGluZSBzdGVwOiBDcmVhdGluZyBvdXRsaW5lIGZvciBydW4gJHtydW5JZH1gKTtcbiAgICAvLyBHZXQgbW9kZWwgY29uZmlndXJhdGlvblxuICAgIGNvbnN0IG1vZGVsTmFtZSA9IHByb2Nlc3MuZW52Lk9VVExJTkVfQUdFTlRfTU9ERUwgfHwgcHJvY2Vzcy5lbnYuUkVTRUFSQ0hfQUdFTlRfTU9ERUwgfHwgJ2dwdC01LjQtbWluaSc7XG4gICAgY29uc29sZS5sb2coYFt2MF0gT3V0bGluZSBzdGVwOiBVc2luZyBtb2RlbDogJHttb2RlbE5hbWV9YCk7XG4gICAgLy8gQ3JlYXRlIGNvbnRleHQgZnJvbSBhdmFpbGFibGUgZGF0YVxuICAgIGNvbnN0IHRvcGljID0gaW5wdXQuYmxvZ190b3BpYyB8fCBpbnB1dC50b3BpYyB8fCAnWW91ciBUb3BpYyc7XG4gICAgY29uc3QgcHJpbWFyeUtleXdvcmQgPSBpbnB1dC5wcmltYXJ5X2tleXdvcmQgfHwgJ3ByaW1hcnkga2V5d29yZCc7XG4gICAgY29uc3Qgc2Vjb25kYXJ5S2V5d29yZHMgPSAoaW5wdXQuc2Vjb25kYXJ5X2tleXdvcmRzIHx8IGlucHV0LmtleXdvcmRzIHx8IFtdKS5qb2luKCcsICcpIHx8ICdzZWNvbmRhcnkga2V5d29yZHMnO1xuICAgIGNvbnN0IGJ1c2luZXNzTmFtZSA9IGlucHV0LmJ1c2luZXNzX25hbWUgfHwgJ1lvdXIgQnVzaW5lc3MnO1xuICAgIGNvbnN0IGF1ZGllbmNlTm90ZXMgPSBpbnB1dC5hdWRpZW5jZV9ub3RlcyB8fCAnVGFyZ2V0IGF1ZGllbmNlIG5vdCBzcGVjaWZpZWQnO1xuICAgIGNvbnN0IGJyYW5kVm9pY2UgPSBpbnB1dC5icmFuZF92b2ljZV9ub3RlcyB8fCAnUHJvZmVzc2lvbmFsIGFuZCBjbGVhcic7XG4gICAgY29uc3QgY3RhTm90ZXMgPSBpbnB1dC5jdGFfbm90ZXMgfHwgJ0VuY291cmFnZSBlbmdhZ2VtZW50JztcbiAgICBjb25zdCBhZGRpdGlvbmFsTm90ZXMgPSBpbnB1dC5hZGRpdGlvbmFsX29yZGVyX25vdGVzIHx8ICdObyBhZGRpdGlvbmFsIG5vdGVzJztcbiAgICBjb25zdCB0YXJnZXRXb3JkQ291bnQgPSBpbnB1dC50YXJnZXRfd29yZF9jb3VudCB8fCAxNTAwO1xuICAgIC8vIEluY2x1ZGUgcmVzZWFyY2ggaW5zaWdodHMgaWYgYXZhaWxhYmxlXG4gICAgbGV0IHJlc2VhcmNoQ29udGV4dCA9ICcnO1xuICAgIGlmIChyZXNlYXJjaERhdGEpIHtcbiAgICAgICAgcmVzZWFyY2hDb250ZXh0ID0gYFxuXG5SZXNlYXJjaCBJbnNpZ2h0cyBmcm9tIFJlc2VhcmNoIEFnZW50OlxuLSBTZWFyY2ggSW50ZW50OiAke3Jlc2VhcmNoRGF0YS5zZWFyY2hfaW50ZW50IHx8ICdOL0EnfVxuLSBDb250ZW50IEFuZ2xlOiAke3Jlc2VhcmNoRGF0YS5jb250ZW50X2FuZ2xlIHx8ICdOL0EnfVxuLSBUYXJnZXQgQXVkaWVuY2U6ICR7cmVzZWFyY2hEYXRhLnRhcmdldF9hdWRpZW5jZV9zdW1tYXJ5IHx8ICdOL0EnfVxuLSBSZWNvbW1lbmRlZCBTZWN0aW9uczogJHtyZXNlYXJjaERhdGEucmVjb21tZW5kZWRfc2VjdGlvbnM/LmpvaW4oJywgJykgfHwgJ04vQSd9XG4tIFF1ZXN0aW9ucyB0byBBbnN3ZXI6ICR7cmVzZWFyY2hEYXRhLnF1ZXN0aW9uc190b19hbnN3ZXI/LmpvaW4oJywgJykgfHwgJ04vQSd9YDtcbiAgICB9XG4gICAgY29uc3Qgc3lzdGVtUHJvbXB0ID0gYFlvdSBhcmUgYSBwcm9mZXNzaW9uYWwgY29udGVudCBvdXRsaW5lIHNwZWNpYWxpc3QuIENyZWF0ZSBhIGRldGFpbGVkLCB3ZWxsLXN0cnVjdHVyZWQgYmxvZyBvdXRsaW5lIHRoYXQgd2lsbCBndWlkZSBjb250ZW50IHdyaXRlcnMuXG5cbllvdXIgb3V0cHV0IG11c3QgYmUgdmFsaWQgSlNPTiBtYXRjaGluZyB0aGlzIGV4YWN0IHN0cnVjdHVyZTpcbntcbiAgXCJ0aXRsZVwiOiBcInN0cmluZyAoU0VPLW9wdGltaXplZCB0aXRsZSBpbmNsdWRpbmcgcHJpbWFyeSBrZXl3b3JkKVwiLFxuICBcIm1ldGFfYW5nbGVcIjogXCJzdHJpbmcgKHVuaXF1ZSBhbmdsZSB0aGF0IGRpZmZlcmVudGlhdGVzIHRoaXMgYXJ0aWNsZSlcIixcbiAgXCJ0YXJnZXRfd29yZF9jb3VudFwiOiBudW1iZXIsXG4gIFwic2VjdGlvbnNcIjogW1xuICAgIHtcbiAgICAgIFwiaGVhZGluZ1wiOiBcInN0cmluZ1wiLFxuICAgICAgXCJwdXJwb3NlXCI6IFwic3RyaW5nICh3aHkgdGhpcyBzZWN0aW9uIG1hdHRlcnMpXCIsXG4gICAgICBcImVzdGltYXRlZF93b3Jkc1wiOiBudW1iZXIsXG4gICAgICBcImtleV9wb2ludHNcIjogW1wic3RyaW5nXCJdLFxuICAgICAgXCJzZW9fbm90ZXNcIjogW1wic3RyaW5nIChTRU8gYmVzdCBwcmFjdGljZXMgZm9yIHRoaXMgc2VjdGlvbilcIl1cbiAgICB9XG4gIF0sXG4gIFwiaW50cm9fZ3VpZGFuY2VcIjogXCJzdHJpbmcgKGd1aWRhbmNlIGZvciBpbnRyb2R1Y3Rpb24gcGFyYWdyYXBoKVwiLFxuICBcImNvbmNsdXNpb25fZ3VpZGFuY2VcIjogXCJzdHJpbmcgKGd1aWRhbmNlIGZvciBjb25jbHVzaW9uIHBhcmFncmFwaClcIixcbiAgXCJjdGFfZ3VpZGFuY2VcIjogXCJzdHJpbmcgKGNhbGwtdG8tYWN0aW9uIGd1aWRhbmNlKVwiLFxuICBcImludGVybmFsX2xpbmtfb3Bwb3J0dW5pdGllc1wiOiBbXCJzdHJpbmcgKHN1Z2dlc3RlZCBpbnRlcm5hbCBsaW5rcylcIl0sXG4gIFwibm90ZXNfZm9yX3dyaXRlclwiOiBbXCJzdHJpbmcgKGFkZGl0aW9uYWwgZ3VpZGFuY2UgZm9yIHdyaXRlcilcIl1cbn1cblxuRW5zdXJlOlxuLSBTZWN0aW9ucyB0b3RhbCBhcHByb3hpbWF0ZWx5IHRoZSB0YXJnZXQgd29yZCBjb3VudFxuLSBFYWNoIHNlY3Rpb24gaW5jbHVkZXMgc3BlY2lmaWMga2V5IHBvaW50cyB0byBjb3ZlclxuLSBTRU8gYmVzdCBwcmFjdGljZXMgYXJlIGludGVncmF0ZWRcbi0gVGhlIG91dGxpbmUgZmxvd3MgbG9naWNhbGx5XG4tIEludGVybmFsIGxpbmtpbmcgb3Bwb3J0dW5pdGllcyBhcmUgcmVhbGlzdGljXG4tIFRoZSBvdXRsaW5lIGlzIGFjdGlvbmFibGUgZm9yIGEgd3JpdGVyXG5cblJlc3BvbmQgT05MWSB3aXRoIHZhbGlkIEpTT04sIG5vIG1hcmtkb3duIG9yIGV4cGxhbmF0aW9ucy5gO1xuICAgIGNvbnN0IHVzZXJNZXNzYWdlID0gYENyZWF0ZSBhbiBvdXRsaW5lIGZvciB0aGlzIGFydGljbGU6XG5cblRvcGljOiAke3RvcGljfVxuQnVzaW5lc3M6ICR7YnVzaW5lc3NOYW1lfVxuUHJpbWFyeSBLZXl3b3JkOiAke3ByaW1hcnlLZXl3b3JkfVxuU2Vjb25kYXJ5IEtleXdvcmRzOiAke3NlY29uZGFyeUtleXdvcmRzfVxuVGFyZ2V0IFdvcmQgQ291bnQ6ICR7dGFyZ2V0V29yZENvdW50fVxuXG5BdWRpZW5jZSBQcm9maWxlOlxuJHthdWRpZW5jZU5vdGVzfVxuXG5CcmFuZCBWb2ljZTpcbiR7YnJhbmRWb2ljZX1cblxuQ2FsbC10by1BY3Rpb24gRm9jdXM6XG4ke2N0YU5vdGVzfVxuXG5BZGRpdGlvbmFsIFJlcXVpcmVtZW50czpcbiR7YWRkaXRpb25hbE5vdGVzfSR7cmVzZWFyY2hDb250ZXh0fWA7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gVXNlIGRpcmVjdCBPcGVuQUkgcHJvdmlkZXJcbiAgICAgICAgY29uc3QgbW9kZWwgPSBvcGVuYWkobW9kZWxOYW1lKTtcbiAgICAgICAgLy8gQ2FsbCBBSSBtb2RlbFxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGdlbmVyYXRlVGV4dCh7XG4gICAgICAgICAgICBtb2RlbCxcbiAgICAgICAgICAgIHN5c3RlbTogc3lzdGVtUHJvbXB0LFxuICAgICAgICAgICAgcHJvbXB0OiB1c2VyTWVzc2FnZSxcbiAgICAgICAgICAgIHRlbXBlcmF0dXJlOiAwLjdcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIE91dGxpbmUgc3RlcDogUmF3IHJlc3BvbnNlIGxlbmd0aDogJHtyZXNwb25zZS50ZXh0Lmxlbmd0aH1gKTtcbiAgICAgICAgLy8gUGFyc2UgdGhlIEpTT04gcmVzcG9uc2VcbiAgICAgICAgY29uc3Qgb3V0bGluZURhdGEgPSBKU09OLnBhcnNlKHJlc3BvbnNlLnRleHQpO1xuICAgICAgICAvLyBWYWxpZGF0ZSByZXF1aXJlZCBmaWVsZHMgYW5kIGFkZCBkZWZhdWx0c1xuICAgICAgICBvdXRsaW5lRGF0YS50aW1lc3RhbXAgPSBvdXRsaW5lRGF0YS50aW1lc3RhbXAgfHwgbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgICAgICBvdXRsaW5lRGF0YS50YXJnZXRfd29yZF9jb3VudCA9IG91dGxpbmVEYXRhLnRhcmdldF93b3JkX2NvdW50IHx8IHRhcmdldFdvcmRDb3VudDtcbiAgICAgICAgLy8gRW5zdXJlIHNlY3Rpb25zIGFycmF5IGV4aXN0c1xuICAgICAgICBpZiAoIW91dGxpbmVEYXRhLnNlY3Rpb25zIHx8ICFBcnJheS5pc0FycmF5KG91dGxpbmVEYXRhLnNlY3Rpb25zKSkge1xuICAgICAgICAgICAgb3V0bGluZURhdGEuc2VjdGlvbnMgPSBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBoZWFkaW5nOiAnSW50cm9kdWN0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgcHVycG9zZTogJ0ludHJvZHVjZSB0b3BpYyBhbmQgc2V0IGNvbnRleHQnLFxuICAgICAgICAgICAgICAgICAgICBlc3RpbWF0ZWRfd29yZHM6IDE1MCxcbiAgICAgICAgICAgICAgICAgICAga2V5X3BvaW50czogW1xuICAgICAgICAgICAgICAgICAgICAgICAgJ1RvcGljIG92ZXJ2aWV3JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdXaHkgdGhpcyBtYXR0ZXJzJ1xuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBzZW9fbm90ZXM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICdJbmNsdWRlIHByaW1hcnkga2V5d29yZCBuYXR1cmFsbHknXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGluZzogJ01haW4gQ29udGVudCcsXG4gICAgICAgICAgICAgICAgICAgIHB1cnBvc2U6ICdEZXRhaWxlZCBleHBsb3JhdGlvbiBvZiB0b3BpYycsXG4gICAgICAgICAgICAgICAgICAgIGVzdGltYXRlZF93b3JkczogMTAwMCxcbiAgICAgICAgICAgICAgICAgICAga2V5X3BvaW50czogW1xuICAgICAgICAgICAgICAgICAgICAgICAgJ0tleSBpbnNpZ2h0IDEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0tleSBpbnNpZ2h0IDInLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0tleSBpbnNpZ2h0IDMnXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIHNlb19ub3RlczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgJ1VzZSBzZWNvbmRhcnkga2V5d29yZHMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0Fuc3dlciB1c2VyIGludGVudCBxdWVzdGlvbnMnXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGluZzogJ0NvbmNsdXNpb24nLFxuICAgICAgICAgICAgICAgICAgICBwdXJwb3NlOiAnU3VtbWFyaXplIGFuZCBjYWxsIHRvIGFjdGlvbicsXG4gICAgICAgICAgICAgICAgICAgIGVzdGltYXRlZF93b3JkczogMTUwLFxuICAgICAgICAgICAgICAgICAgICBrZXlfcG9pbnRzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAnU3VtbWFyeSBvZiBrZXkgcG9pbnRzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdDYWxsIHRvIGFjdGlvbidcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgc2VvX25vdGVzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAnUmVpbmZvcmNlIHByaW1hcnkga2V5d29yZCdcbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF07XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gT3V0bGluZSBzdGVwOiBHZW5lcmF0ZWQgb3V0bGluZSB3aXRoICR7b3V0bGluZURhdGEuc2VjdGlvbnMubGVuZ3RofSBzZWN0aW9uc2ApO1xuICAgICAgICAvLyBQZXJzaXN0IG91dGxpbmVfanNvbiB0byBkYXRhYmFzZVxuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBPdXRsaW5lIHN0ZXA6IFBlcnNpc3Rpbmcgb3V0bGluZV9qc29uIGZvciBydW4gJHtydW5JZH1gKTtcbiAgICAgICAgYXdhaXQgdXBkYXRlUnVuU3RhdHVzKHJ1bklkLCAnb3V0bGluaW5nJywgb3V0bGluZURhdGEpO1xuICAgICAgICByZXR1cm4gb3V0bGluZURhdGE7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgW3YwXSBPdXRsaW5lIHN0ZXAgZXJyb3I6YCwgZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpKTtcbiAgICAgICAgLy8gUmV0dXJuIGZhbGxiYWNrIG91dGxpbmUgaWYgcGFyc2luZyBvciBBSSBjYWxsIGZhaWxzXG4gICAgICAgIGNvbnN0IGZhbGxiYWNrT3V0bGluZSA9IHtcbiAgICAgICAgICAgIHRpdGxlOiBgJHt0b3BpY30gLSBDb21wcmVoZW5zaXZlIEd1aWRlIHwgJHtidXNpbmVzc05hbWV9YCxcbiAgICAgICAgICAgIG1ldGFfYW5nbGU6IGBFdmVyeXRoaW5nIHlvdSBuZWVkIHRvIGtub3cgYWJvdXQgJHt0b3BpY30gZm9yICR7YnVzaW5lc3NOYW1lfWAsXG4gICAgICAgICAgICB0YXJnZXRfd29yZF9jb3VudDogdGFyZ2V0V29yZENvdW50LFxuICAgICAgICAgICAgc2VjdGlvbnM6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGhlYWRpbmc6ICdJbnRyb2R1Y3Rpb246IFVuZGVyc3RhbmRpbmcgdGhlIEJhc2ljcycsXG4gICAgICAgICAgICAgICAgICAgIHB1cnBvc2U6ICdTZXQgY29udGV4dCBhbmQgaW50cm9kdWNlIHRoZSB0b3BpYycsXG4gICAgICAgICAgICAgICAgICAgIGVzdGltYXRlZF93b3JkczogMjAwLFxuICAgICAgICAgICAgICAgICAgICBrZXlfcG9pbnRzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBgT3ZlcnZpZXcgb2YgJHt0b3BpY31gLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ1doeSB0aGlzIHRvcGljIG1hdHRlcnMgdG8geW91ciBhdWRpZW5jZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAnV2hhdCB5b3Ugd2lsbCBsZWFybidcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgc2VvX25vdGVzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAnSW5jbHVkZSBwcmltYXJ5IGtleXdvcmQgaW4gZmlyc3QgcGFyYWdyYXBoJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdVc2UgZW5nYWdpbmcgaG9vaydcbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBoZWFkaW5nOiAnS2V5IENvbmNlcHRzIGFuZCBCZW5lZml0cycsXG4gICAgICAgICAgICAgICAgICAgIHB1cnBvc2U6ICdFeHBsb3JlIGNvcmUgY29uY2VwdHMgYW5kIGFkdmFudGFnZXMnLFxuICAgICAgICAgICAgICAgICAgICBlc3RpbWF0ZWRfd29yZHM6IDQwMCxcbiAgICAgICAgICAgICAgICAgICAga2V5X3BvaW50czogW1xuICAgICAgICAgICAgICAgICAgICAgICAgJ0NvcmUgY29uY2VwdCAxJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdDb3JlIGNvbmNlcHQgMicsXG4gICAgICAgICAgICAgICAgICAgICAgICAnSG93IGJ1c2luZXNzZXMgYmVuZWZpdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAnUmVhbC13b3JsZCBhcHBsaWNhdGlvbnMnXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIHNlb19ub3RlczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgJ1VzZSBzZWNvbmRhcnkga2V5d29yZHMgbmF0dXJhbGx5JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdBbnN3ZXIgY29tbW9uIHF1ZXN0aW9ucydcbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBoZWFkaW5nOiAnQmVzdCBQcmFjdGljZXMgYW5kIEltcGxlbWVudGF0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgcHVycG9zZTogJ1Byb3ZpZGUgYWN0aW9uYWJsZSBndWlkYW5jZScsXG4gICAgICAgICAgICAgICAgICAgIGVzdGltYXRlZF93b3JkczogNTAwLFxuICAgICAgICAgICAgICAgICAgICBrZXlfcG9pbnRzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAnU3RlcC1ieS1zdGVwIGltcGxlbWVudGF0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdCZXN0IHByYWN0aWNlcyBpbiB0aGUgaW5kdXN0cnknLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0NvbW1vbiBtaXN0YWtlcyB0byBhdm9pZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAnVG9vbHMgYW5kIHJlc291cmNlcydcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgc2VvX25vdGVzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAnVXNlIGxvbmctdGFpbCBrZXl3b3JkcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAnSW5jbHVkZSBwcmFjdGljYWwgZXhhbXBsZXMnXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGluZzogJ0NvbmNsdXNpb24gYW5kIE5leHQgU3RlcHMnLFxuICAgICAgICAgICAgICAgICAgICBwdXJwb3NlOiAnU3VtbWFyaXplIGFuZCBndWlkZSByZWFkZXIgYWN0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgZXN0aW1hdGVkX3dvcmRzOiAxNTAsXG4gICAgICAgICAgICAgICAgICAgIGtleV9wb2ludHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICdLZXkgdGFrZWF3YXlzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdSZWNvbW1lbmRlZCBuZXh0IHN0ZXBzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdDYWxsIHRvIGFjdGlvbidcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgc2VvX25vdGVzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAnUmVpbmZvcmNlIHByaW1hcnkga2V5d29yZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAnQ3JlYXRlIHVyZ2VuY3kgZm9yIENUQSdcbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBpbnRyb19ndWlkYW5jZTogYFN0YXJ0IHdpdGggYSBjb21wZWxsaW5nIGhvb2sgdGhhdCBhZGRyZXNzZXMgdGhlIHJlYWRlcidzIHBhaW4gcG9pbnQuIEludHJvZHVjZSAke3RvcGljfSBpbiB0aGUgY29udGV4dCBvZiAke2J1c2luZXNzTmFtZX0gYW5kIGV4cGxhaW4gd2h5IGl0IG1hdHRlcnMgdG8gdGhlIHRhcmdldCBhdWRpZW5jZS4gSW5jbHVkZSB0aGUgcHJpbWFyeSBrZXl3b3JkIFwiJHtwcmltYXJ5S2V5d29yZH1cIiBuYXR1cmFsbHkgaW4gdGhlIGZpcnN0IDEwMCB3b3Jkcy5gLFxuICAgICAgICAgICAgY29uY2x1c2lvbl9ndWlkYW5jZTogYFN1bW1hcml6ZSB0aGUgbWFpbiB0YWtlYXdheXMgZnJvbSBlYWNoIHNlY3Rpb24uIFJlaW5mb3JjZSBob3cgdW5kZXJzdGFuZGluZyAke3RvcGljfSBiZW5lZml0cyB0aGUgcmVhZGVyLiBJbmNsdWRlIGEgY2xlYXIsIGNvbXBlbGxpbmcgY2FsbC10by1hY3Rpb24gdGhhdCBndWlkZXMgdGhlIHJlYWRlciBvbiBuZXh0IHN0ZXBzLiBFbmQgd2l0aCB0aGUgcHJpbWFyeSBrZXl3b3JkIG5hdHVyYWxseSBpbmNvcnBvcmF0ZWQuYCxcbiAgICAgICAgICAgIGN0YV9ndWlkYW5jZTogYCR7Y3RhTm90ZXN9LiBFbnN1cmUgdGhlIENUQSBpcyBjbGVhciwgc3BlY2lmaWMsIGFuZCByZWxldmFudCB0byB0aGUgYXJ0aWNsZSBjb250ZW50LiBFeGFtcGxlczogXCJTY2hlZHVsZSBhIGNvbnN1bHRhdGlvbixcIiBcIkRvd25sb2FkIG91ciBndWlkZSxcIiBcIkdldCBzdGFydGVkIHRvZGF5LFwiIFwiSm9pbiBvdXIgY29tbXVuaXR5LlwiYCxcbiAgICAgICAgICAgIGludGVybmFsX2xpbmtfb3Bwb3J0dW5pdGllczogW1xuICAgICAgICAgICAgICAgICdMaW5rIHRvIHJlbGV2YW50IHNlcnZpY2UgcGFnZXMgb24gY29tcGFueSB3ZWJzaXRlJyxcbiAgICAgICAgICAgICAgICAnTGluayB0byByZWxhdGVkIGJsb2cgcG9zdHMgb24gc2ltaWxhciB0b3BpY3MnLFxuICAgICAgICAgICAgICAgICdMaW5rIHRvIGNhc2Ugc3R1ZGllcyBvciBzdWNjZXNzIHN0b3JpZXMnLFxuICAgICAgICAgICAgICAgICdMaW5rIHRvIHJlc291cmNlIHBhZ2VzIG9yIHRvb2xzJ1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIG5vdGVzX2Zvcl93cml0ZXI6IFtcbiAgICAgICAgICAgICAgICBgUmVtZW1iZXIgdG8gbWFpbnRhaW4gYSAke2JyYW5kVm9pY2V9IHRvbmUgdGhyb3VnaG91dGAsXG4gICAgICAgICAgICAgICAgYEFkZHJlc3MgdGhlIG5lZWRzIG9mOiAke2F1ZGllbmNlTm90ZXN9YCxcbiAgICAgICAgICAgICAgICBgRW5zdXJlIHRoZSBjb250ZW50IGlzIHdlbGwtcmVzZWFyY2hlZCBhbmQgaW5jbHVkZXMgc3BlY2lmaWMgZXhhbXBsZXNgLFxuICAgICAgICAgICAgICAgIGBVc2Ugc3ViaGVhZGluZ3MgdG8gaW1wcm92ZSByZWFkYWJpbGl0eSBhbmQgU0VPYCxcbiAgICAgICAgICAgICAgICBgSW5jbHVkZSByZWxldmFudCBkYXRhLCBzdGF0aXN0aWNzLCBvciByZXNlYXJjaCBmaW5kaW5ncyB3aGVyZSBhcHByb3ByaWF0ZWAsXG4gICAgICAgICAgICAgICAgYEVuZCB3aXRoIGEgc3Ryb25nIENUQSBhbGlnbmVkIHdpdGg6ICR7Y3RhTm90ZXN9YFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICAgIH07XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIE91dGxpbmUgc3RlcDogVXNpbmcgZmFsbGJhY2sgb3V0bGluZSBkdWUgdG8gZXJyb3JgKTtcbiAgICAgICAgcmV0dXJuIGZhbGxiYWNrT3V0bGluZTtcbiAgICB9XG59XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9vdXRsaW5lLXN0ZXAvL3J1bk91dGxpbmVTdGVwXCIsIHJ1bk91dGxpbmVTdGVwKTtcbiIsICJpbXBvcnQgeyByZWdpc3RlclN0ZXBGdW5jdGlvbiB9IGZyb20gXCJ3b3JrZmxvdy9pbnRlcm5hbC9wcml2YXRlXCI7XG5pbXBvcnQgJ3NlcnZlci1vbmx5JztcbmltcG9ydCB7IGdlbmVyYXRlVGV4dCB9IGZyb20gJ2FpJztcbmltcG9ydCB7IG9wZW5haSB9IGZyb20gJ0BhaS1zZGsvb3BlbmFpJztcbmltcG9ydCB7IHVwZGF0ZVJ1blN0YXR1cyB9IGZyb20gJy4uLy4uL3N0b3JhZ2UvcnVucyc7XG4vKipfX2ludGVybmFsX3dvcmtmbG93c3tcInN0ZXBzXCI6e1wibGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9yZXNlYXJjaC1zdGVwLnRzXCI6e1wicnVuUmVzZWFyY2hTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvcmVzZWFyY2gtc3RlcC8vcnVuUmVzZWFyY2hTdGVwXCJ9fX19Ki87XG4vKipcbiAqIFJlc2VhcmNoIFN0ZXAgLSBQaGFzZSAyQy1BXG4gKiBSdW5zIGluc2lkZSBhIGR1cmFibGUgc3RlcCBmdW5jdGlvbiAoaGFzIE5vZGUuanMgYWNjZXNzKVxuICogQ2FsbHMgQUkgbW9kZWwgdG8gZ2VuZXJhdGUgcmVzZWFyY2ggSlNPTlxuICogTm8gZmlsZXN5c3RlbSBpbXBvcnRzIC0gc2FmZSBmb3Igd29ya2Zsb3cgY29udGV4dFxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5SZXNlYXJjaFN0ZXAocnVuSWQsIGlucHV0KSB7XG4gICAgY29uc29sZS5sb2coYFt2MF0gUmVzZWFyY2ggc3RlcDogQW5hbHl6aW5nIHRvcGljIGZvciBydW4gJHtydW5JZH1gKTtcbiAgICBjb25zdCBzeXN0ZW1Qcm9tcHQgPSBgWW91IGFyZSBhbiBTRU8gcmVzZWFyY2ggc3BlY2lhbGlzdC4gQW5hbHl6ZSB0aGUgcHJvdmlkZWQgdG9waWMsIGtleXdvcmRzLCBhbmQgYXVkaWVuY2UgdG8gZ2VuZXJhdGUgY29tcHJlaGVuc2l2ZSBrZXl3b3JkIHJlc2VhcmNoLCBjb21wZXRpdGl2ZSBhbmFseXNpcywgYW5kIGNvbnRlbnQgcGxhbm5pbmcgZ3VpZGFuY2UuXG5cbllvdXIgb3V0cHV0IG11c3QgYmUgdmFsaWQgSlNPTiBtYXRjaGluZyB0aGlzIGV4YWN0IHN0cnVjdHVyZTpcbntcbiAgXCJzZWFyY2hfaW50ZW50XCI6IFwic3RyaW5nIChpbmZvcm1hdGlvbmFsfG5hdmlnYXRpb25hbHxjb21tZXJjaWFsfHRyYW5zYWN0aW9uYWwpXCIsXG4gIFwidGFyZ2V0X2F1ZGllbmNlX3N1bW1hcnlcIjogXCJzdHJpbmdcIixcbiAgXCJrZXl3b3JkX21hcFwiOiB7XG4gICAgXCJwcmltYXJ5X2tleXdvcmRcIjogXCJzdHJpbmdcIixcbiAgICBcInNlY29uZGFyeV9rZXl3b3Jkc1wiOiBbXCJzdHJpbmdcIl0sXG4gICAgXCJsc2lfdGVybXNcIjogW1wic3RyaW5nXCJdXG4gIH0sXG4gIFwiY29udGVudF9hbmdsZVwiOiBcInN0cmluZ1wiLFxuICBcImNvbXBldGl0b3JfaW5zaWdodHNcIjogW1wic3RyaW5nXCJdLFxuICBcInJlY29tbWVuZGVkX3NlY3Rpb25zXCI6IFtcInN0cmluZ1wiXSxcbiAgXCJxdWVzdGlvbnNfdG9fYW5zd2VyXCI6IFtcInN0cmluZ1wiXSxcbiAgXCJyZXNlYXJjaF9ub3Rlc1wiOiBcInN0cmluZ1wiLFxuICBcInRhcmdldF93b3JkX2NvdW50XCI6IG51bWJlcixcbiAgXCJ3ZWJfc2VhcmNoX3VzZWRcIjogZmFsc2Vcbn1cblxuUmVzcG9uZCBPTkxZIHdpdGggdmFsaWQgSlNPTiwgbm8gbWFya2Rvd24gb3IgZXhwbGFuYXRpb25zLmA7XG4gICAgY29uc3QgdXNlck1lc3NhZ2UgPSBgQ29uZHVjdCBTRU8gcmVzZWFyY2ggZm9yOlxuVG9waWM6ICR7aW5wdXQuYmxvZ190b3BpY31cblByaW1hcnkgS2V5d29yZDogJHtpbnB1dC5wcmltYXJ5X2tleXdvcmR9XG5TZWNvbmRhcnkgS2V5d29yZHM6ICR7aW5wdXQuc2Vjb25kYXJ5X2tleXdvcmRzPy5qb2luKCcsICcpIHx8ICdub25lJ31cblRhcmdldCBBdWRpZW5jZTogJHtpbnB1dC5hdWRpZW5jZV9ub3RlcyB8fCAnZ2VuZXJhbCd9XG5UYXJnZXQgV29yZCBDb3VudDogJHtpbnB1dC50YXJnZXRfd29yZF9jb3VudCB8fCAxMDAwfVxuQnVzaW5lc3M6ICR7aW5wdXQuYnVzaW5lc3NfbmFtZSB8fCAndW5rbm93bid9XG5XZWJzaXRlOiAke2lucHV0LndlYnNpdGVfdXJsIHx8ICd1bmtub3duJ31cblxuUHJvdmlkZSBjb21wcmVoZW5zaXZlIHJlc2VhcmNoIGZpbmRpbmdzIGluIEpTT04gZm9ybWF0LmA7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gR2V0IG1vZGVsIG5hbWUgZnJvbSBlbnZpcm9ubWVudCBvciB1c2UgZGVmYXVsdFxuICAgICAgICBjb25zdCBtb2RlbE5hbWUgPSBwcm9jZXNzLmVudi5SRVNFQVJDSF9BR0VOVF9NT0RFTCB8fCAnZ3B0LTUuNC1taW5pJztcbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gUmVzZWFyY2ggc3RlcDogVXNpbmcgbW9kZWw6ICR7bW9kZWxOYW1lfWApO1xuICAgICAgICAvLyBVc2UgZGlyZWN0IE9wZW5BSSBwcm92aWRlciB3aXRoIE9QRU5BSV9BUElfS0VZXG4gICAgICAgIGNvbnN0IG1vZGVsID0gb3BlbmFpKG1vZGVsTmFtZSk7XG4gICAgICAgIC8vIENhbGwgQUkgbW9kZWxcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBnZW5lcmF0ZVRleHQoe1xuICAgICAgICAgICAgbW9kZWwsXG4gICAgICAgICAgICBzeXN0ZW06IHN5c3RlbVByb21wdCxcbiAgICAgICAgICAgIHByb21wdDogdXNlck1lc3NhZ2UsXG4gICAgICAgICAgICB0ZW1wZXJhdHVyZTogMC43XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBSZXNlYXJjaCBzdGVwOiBBSSBtb2RlbCByZXNwb25kZWQsIHBhcnNpbmcgSlNPTmApO1xuICAgICAgICAvLyBQYXJzZSBKU09OIHJlc3BvbnNlXG4gICAgICAgIGxldCByZXNlYXJjaERhdGE7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBUcnkgdG8gZXh0cmFjdCBKU09OIGZyb20gcmVzcG9uc2UgKGluIGNhc2Ugb2YgZXh0cmEgdGV4dClcbiAgICAgICAgICAgIGNvbnN0IGpzb25NYXRjaCA9IHJlc3BvbnNlLnRleHQubWF0Y2goL1xce1tcXHNcXFNdKlxcfS8pO1xuICAgICAgICAgICAgaWYgKCFqc29uTWF0Y2gpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIEpTT04gZm91bmQgaW4gcmVzcG9uc2UnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc2VhcmNoRGF0YSA9IEpTT04ucGFyc2UoanNvbk1hdGNoWzBdKTtcbiAgICAgICAgfSBjYXRjaCAocGFyc2VFcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2MF0gUmVzZWFyY2ggc3RlcDogRmFpbGVkIHRvIHBhcnNlIEFJIHJlc3BvbnNlOmAsIHJlc3BvbnNlLnRleHQuc3Vic3RyaW5nKDAsIDIwMCkpO1xuICAgICAgICAgICAgLy8gUmV0dXJuIGZhbGxiYWNrIGlmIHBhcnNpbmcgZmFpbHNcbiAgICAgICAgICAgIHJlc2VhcmNoRGF0YSA9IHtcbiAgICAgICAgICAgICAgICBzZWFyY2hfaW50ZW50OiAnaW5mb3JtYXRpb25hbCcsXG4gICAgICAgICAgICAgICAgdGFyZ2V0X2F1ZGllbmNlX3N1bW1hcnk6IGlucHV0LmF1ZGllbmNlX25vdGVzIHx8ICdUYXJnZXQgYXVkaWVuY2Ugbm90IHNwZWNpZmllZCcsXG4gICAgICAgICAgICAgICAga2V5d29yZF9tYXA6IHtcbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeV9rZXl3b3JkOiBpbnB1dC5wcmltYXJ5X2tleXdvcmQgfHwgJ3ByaW1hcnkga2V5d29yZCcsXG4gICAgICAgICAgICAgICAgICAgIHNlY29uZGFyeV9rZXl3b3JkczogaW5wdXQuc2Vjb25kYXJ5X2tleXdvcmRzIHx8IFtdLFxuICAgICAgICAgICAgICAgICAgICBsc2lfdGVybXM6IFtdXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjb250ZW50X2FuZ2xlOiBgRm9jdXMgb24gJHtpbnB1dC5ibG9nX3RvcGljIHx8ICd0b3BpYyd9YCxcbiAgICAgICAgICAgICAgICBjb21wZXRpdG9yX2luc2lnaHRzOiBbXG4gICAgICAgICAgICAgICAgICAgICdSZXNlYXJjaCBjb21wZXRpdG9ycyBmb3IgY29tcGV0aXRpdmUgYWR2YW50YWdlcydcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlY29tbWVuZGVkX3NlY3Rpb25zOiBbXG4gICAgICAgICAgICAgICAgICAgICdJbnRyb2R1Y3Rpb24nLFxuICAgICAgICAgICAgICAgICAgICAnTWFpbiBDb250ZW50JyxcbiAgICAgICAgICAgICAgICAgICAgJ0NvbmNsdXNpb24nXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBxdWVzdGlvbnNfdG9fYW5zd2VyOiBbXG4gICAgICAgICAgICAgICAgICAgICdXaGF0IGlzIHRoZSBtYWluIHRvcGljPydcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2VhcmNoX25vdGVzOiAnRmFsbGJhY2sgcmVzZWFyY2ggZHVlIHRvIHBhcnNpbmcgZXJyb3InLFxuICAgICAgICAgICAgICAgIHRhcmdldF93b3JkX2NvdW50OiBpbnB1dC50YXJnZXRfd29yZF9jb3VudCB8fCAxMDAwLFxuICAgICAgICAgICAgICAgIHdlYl9zZWFyY2hfdXNlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgLy8gUGVyc2lzdCByZXNlYXJjaF9qc29uIHRvIGRhdGFiYXNlXG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFJlc2VhcmNoIHN0ZXA6IFBlcnNpc3RpbmcgcmVzZWFyY2hfanNvbiBmb3IgcnVuICR7cnVuSWR9YCk7XG4gICAgICAgIGF3YWl0IHVwZGF0ZVJ1blN0YXR1cyhydW5JZCwgJ3Jlc2VhcmNoaW5nJywgcmVzZWFyY2hEYXRhKTtcbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gUmVzZWFyY2ggc3RlcDogQ29tcGxldGUgZm9yIHJ1biAke3J1bklkfWApO1xuICAgICAgICByZXR1cm4gcmVzZWFyY2hEYXRhO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2MF0gUmVzZWFyY2ggc3RlcCBlcnJvciBmb3IgcnVuICR7cnVuSWR9OmAsIGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKSk7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbn1cbnJlZ2lzdGVyU3RlcEZ1bmN0aW9uKFwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3Jlc2VhcmNoLXN0ZXAvL3J1blJlc2VhcmNoU3RlcFwiLCBydW5SZXNlYXJjaFN0ZXApO1xuIiwgImltcG9ydCB7IHJlZ2lzdGVyU3RlcEZ1bmN0aW9uIH0gZnJvbSBcIndvcmtmbG93L2ludGVybmFsL3ByaXZhdGVcIjtcbmltcG9ydCAnc2VydmVyLW9ubHknO1xuaW1wb3J0IHsgZ2VuZXJhdGVUZXh0IH0gZnJvbSAnYWknO1xuaW1wb3J0IHsgb3BlbmFpIH0gZnJvbSAnQGFpLXNkay9vcGVuYWknO1xuaW1wb3J0IHsgdXBkYXRlUnVuU3RhdHVzIH0gZnJvbSAnLi4vLi4vc3RvcmFnZS9ydW5zJztcbi8qKl9faW50ZXJuYWxfd29ya2Zsb3dze1wic3RlcHNcIjp7XCJsaWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3Nlby1xYS1zdGVwLnRzXCI6e1wicnVuU2VvUWFTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvc2VvLXFhLXN0ZXAvL3J1blNlb1FhU3RlcFwifX19fSovO1xuLyoqXG4gKiBTRU8gUUEgU3RlcCAtIFBoYXNlIDJDLURcbiAqIFJ1bnMgaW5zaWRlIGEgZHVyYWJsZSBzdGVwIGZ1bmN0aW9uIChoYXMgTm9kZS5qcyBhY2Nlc3MpXG4gKiBSZXZpZXdzIGRyYWZ0IG1hcmtkb3duIGFnYWluc3QgU0VPIGJlc3QgcHJhY3RpY2VzXG4gKiBSZXR1cm5zIHN0cnVjdHVyZWQgYXVkaXQgSlNPTiAoZG9lcyBOT1QgcmV3cml0ZSB0aGUgZHJhZnQpXG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJ1blNlb1FhU3RlcChydW5JZCwgaW5wdXQsIHJlc2VhcmNoRGF0YSwgb3V0bGluZURhdGEsIGRyYWZ0TWFya2Rvd24pIHtcbiAgICBjb25zb2xlLmxvZyhgW3YwXSBTRU8gUUEgc3RlcDogQXVkaXRpbmcgZHJhZnQgZm9yIHJ1biAke3J1bklkfWApO1xuICAgIGlmICghZHJhZnRNYXJrZG93bikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0RyYWZ0IG1hcmtkb3duIGlzIHJlcXVpcmVkIGZvciBTRU8gUUEgcmV2aWV3Jyk7XG4gICAgfVxuICAgIC8vIEdldCBtb2RlbCBjb25maWd1cmF0aW9uXG4gICAgY29uc3QgbW9kZWxOYW1lID0gcHJvY2Vzcy5lbnYuU0VPX1FBX0FHRU5UX01PREVMIHx8IHByb2Nlc3MuZW52LlJFU0VBUkNIX0FHRU5UX01PREVMIHx8ICdncHQtNS40LW1pbmknO1xuICAgIGNvbnNvbGUubG9nKGBbdjBdIFNFTyBRQSBzdGVwOiBVc2luZyBtb2RlbDogJHttb2RlbE5hbWV9YCk7XG4gICAgLy8gUHJlcGFyZSBjb250ZXh0IGZvciBTRU8gUUEgcmV2aWV3XG4gICAgY29uc3QgcHJpbWFyeUtleXdvcmQgPSBpbnB1dC5wcmltYXJ5X2tleXdvcmQgfHwgJ3ByaW1hcnkga2V5d29yZCc7XG4gICAgY29uc3Qgc2Vjb25kYXJ5S2V5d29yZHMgPSAoaW5wdXQuc2Vjb25kYXJ5X2tleXdvcmRzIHx8IFtdKS5qb2luKCcsICcpIHx8ICdzZWNvbmRhcnkga2V5d29yZHMnO1xuICAgIGNvbnN0IHRhcmdldFdvcmRDb3VudCA9IGlucHV0LnRhcmdldF93b3JkX2NvdW50IHx8IDIwMDA7XG4gICAgY29uc3QgYnVzaW5lc3NOYW1lID0gaW5wdXQuYnVzaW5lc3NfbmFtZSB8fCAnWW91ciBCdXNpbmVzcyc7XG4gICAgY29uc3QgYXVkaWVuY2VOb3RlcyA9IGlucHV0LmF1ZGllbmNlX25vdGVzIHx8ICdUYXJnZXQgYXVkaWVuY2Ugbm90IHNwZWNpZmllZCc7XG4gICAgY29uc3QgYnJhbmRWb2ljZSA9IGlucHV0LmJyYW5kX3ZvaWNlX25vdGVzIHx8ICdQcm9mZXNzaW9uYWwgYW5kIGNsZWFyJztcbiAgICBjb25zdCBjdGFOb3RlcyA9IGlucHV0LmN0YV9ub3RlcyB8fCAnQ1RBIG5vdCBzcGVjaWZpZWQnO1xuICAgIGNvbnN0IGludGVybmFsTGlua05vdGVzID0gaW5wdXQuaW50ZXJuYWxfbGlua19ub3RlcyB8fCAnTm8gaW50ZXJuYWwgbGlua2luZyBzdHJhdGVneSc7XG4gICAgLy8gQnVpbGQgU0VPIFFBIHByb21wdFxuICAgIGNvbnN0IHNlb1FhUHJvbXB0ID0gYFlvdSBhcmUgYW4gZXhwZXJ0IFNFTyBjb250ZW50IGF1ZGl0b3IuIFJldmlldyB0aGUgZm9sbG93aW5nIGJsb2cgZHJhZnQgYW5kIHByb3ZpZGUgYSBjb21wcmVoZW5zaXZlIFNFTyBxdWFsaXR5IGFzc2Vzc21lbnQuXG5cbkJMT0cgRFJBRlQ6XG4ke2RyYWZ0TWFya2Rvd259XG5cblJFVklFVyBDUklURVJJQTpcbi0gUHJpbWFyeSBLZXl3b3JkOiBcIiR7cHJpbWFyeUtleXdvcmR9XCJcbi0gU2Vjb25kYXJ5IEtleXdvcmRzOiBcIiR7c2Vjb25kYXJ5S2V5d29yZHN9XCJcbi0gVGFyZ2V0IFdvcmQgQ291bnQ6ICR7dGFyZ2V0V29yZENvdW50fSB3b3Jkc1xuLSBCdXNpbmVzczogJHtidXNpbmVzc05hbWV9XG4tIEF1ZGllbmNlOiAke2F1ZGllbmNlTm90ZXN9XG4tIEJyYW5kIFZvaWNlOiAke2JyYW5kVm9pY2V9XG4tIENUQSBOb3RlczogJHtjdGFOb3Rlc31cbi0gSW50ZXJuYWwgTGlua2luZyBTdHJhdGVneTogJHtpbnRlcm5hbExpbmtOb3Rlc31cblxuUHJvdmlkZSBhIGRldGFpbGVkIFNFTyBhdWRpdCBpbiB0aGUgZm9sbG93aW5nIEpTT04gZm9ybWF0IChkbyBOT1QgbW9kaWZ5IG9yIHJld3JpdGUgdGhlIGRyYWZ0KTpcbntcbiAgXCJvdmVyYWxsX3Njb3JlXCI6IDwwLTEwMD4sXG4gIFwic2VhcmNoX2ludGVudF9hbGlnbm1lbnRcIjoge1xuICAgIFwic2NvcmVcIjogPDAtMTAwPixcbiAgICBcImFuYWx5c2lzXCI6IFwiPGFuYWx5c2lzIG9mIGhvdyB3ZWxsIGRyYWZ0IGFsaWducyB3aXRoIHNlYXJjaCBpbnRlbnQgZm9yIHRoZSBwcmltYXJ5IGtleXdvcmQ+XCJcbiAgfSxcbiAgXCJwcmltYXJ5X2tleXdvcmRfdXNhZ2VcIjoge1xuICAgIFwic2NvcmVcIjogPDAtMTAwPixcbiAgICBcIm9jY3VycmVuY2VzXCI6IDxjb3VudD4sXG4gICAgXCJwbGFjZW1lbnRfYW5hbHlzaXNcIjogXCI8YW5hbHlzaXMgb2Ygd2hlcmUgcHJpbWFyeSBrZXl3b3JkIGFwcGVhcnMgYW5kIGhvdyBuYXR1cmFsbHk+XCJcbiAgfSxcbiAgXCJzZWNvbmRhcnlfa2V5d29yZF91c2FnZVwiOiB7XG4gICAgXCJzY29yZVwiOiA8MC0xMDA+LFxuICAgIFwia2V5d29yZHNfY292ZXJlZFwiOiBbPGxpc3Qgb2Ygc2Vjb25kYXJ5IGtleXdvcmRzIGZvdW5kIGluIGRyYWZ0Pl0sXG4gICAgXCJnYXBzXCI6IFs8bGlzdCBvZiBzZWNvbmRhcnkga2V5d29yZHMgbWlzc2luZyBmcm9tIGRyYWZ0Pl1cbiAgfSxcbiAgXCJoZWFkaW5nX3N0cnVjdHVyZV9yZXZpZXdcIjoge1xuICAgIFwic2NvcmVcIjogPDAtMTAwPixcbiAgICBcImgxX3ByZXNlbnRcIjogPHRydWUvZmFsc2U+LFxuICAgIFwiaDJfY291bnRcIjogPGNvdW50PixcbiAgICBcImhpZXJhcmNoeV9pc3N1ZXNcIjogWzxsaXN0IG9mIGhlYWRpbmcgaGllcmFyY2h5IHByb2JsZW1zIGlmIGFueT5dXG4gIH0sXG4gIFwiY29udGVudF9kZXB0aF9yZXZpZXdcIjoge1xuICAgIFwic2NvcmVcIjogPDAtMTAwPixcbiAgICBcIndvcmRfY291bnRcIjogPGFjdHVhbCB3b3JkIGNvdW50PixcbiAgICBcInNlY3Rpb25fY292ZXJhZ2VcIjogXCI8YXNzZXNzbWVudCBvZiB3aGV0aGVyIGFsbCBvdXRsaW5lIHNlY3Rpb25zIGFyZSBjb3ZlcmVkPlwiLFxuICAgIFwiZGVwdGhfaXNzdWVzXCI6IFs8bGlzdCBvZiBzZWN0aW9ucyB0aGF0IG5lZWQgbW9yZSBkZXB0aD5dXG4gIH0sXG4gIFwicmVhZGFiaWxpdHlfcmV2aWV3XCI6IHtcbiAgICBcInNjb3JlXCI6IDwwLTEwMD4sXG4gICAgXCJhdmdfc2VudGVuY2VfbGVuZ3RoXCI6IDxhdmVyYWdlPixcbiAgICBcImZsZXNjaF9raW5jYWlkX2VzdGltYXRlXCI6IFwiPGdyYWRlIGxldmVsIGVzdGltYXRlPlwiLFxuICAgIFwicmVhZGFiaWxpdHlfaXNzdWVzXCI6IFs8bGlzdCBvZiByZWFkYWJpbGl0eSBjb25jZXJucz5dXG4gIH0sXG4gIFwiaW50ZXJuYWxfbGlua2luZ19yZXZpZXdcIjoge1xuICAgIFwic2NvcmVcIjogPDAtMTAwPixcbiAgICBcImludGVybmFsX2xpbmtzX2ZvdW5kXCI6IDxjb3VudD4sXG4gICAgXCJpbnRlcm5hbF9saW5rX3JlY29tbWVuZGF0aW9uc1wiOiBbPGxpc3Qgb2Ygc3VnZ2VzdGVkIGludGVybmFsIGxpbmsgcGxhY2VtZW50cz5dXG4gIH0sXG4gIFwiY3RhX3Jldmlld1wiOiB7XG4gICAgXCJzY29yZVwiOiA8MC0xMDA+LFxuICAgIFwiY3RhX3ByZXNlbnRcIjogPHRydWUvZmFsc2U+LFxuICAgIFwiY3RhX2FuYWx5c2lzXCI6IFwiPGFzc2Vzc21lbnQgb2YgQ1RBIHBsYWNlbWVudCwgY2xhcml0eSwgYW5kIGFsaWdubWVudCB3aXRoIGJyYW5kIGd1aWRlbGluZXM+XCJcbiAgfSxcbiAgXCJyaXNrX2ZsYWdzXCI6IFs8bGlzdCBvZiBTRU8gcmlza3MgbGlrZSBkdXBsaWNhdGUgY29udGVudCwga2V5d29yZCBzdHVmZmluZywgYnJva2VuIGxpbmtzLCBldGM+XSxcbiAgXCJwcmlvcml0eV9maXhlc1wiOiBbPGxpc3Qgb2YgdG9wIDMtNSBwcmlvcml0eSBpdGVtcyB0byBmaXggYmVmb3JlIHB1YmxpY2F0aW9uPl0sXG4gIFwicmVjb21tZW5kZWRfbmV4dF9hY3Rpb25cIjogXCI8cmVjb21tZW5kYXRpb24gZm9yIG5leHQgc3RlcCAtIEVkaXRvciwgUmV2aXNpb24sIG9yIFJlYWR5IGZvciBQdWJsaXNoaW5nPlwiLFxuICBcInJlYWR5X2Zvcl9lZGl0b3JcIjogPHRydWUgaWYgZHJhZnQgaXMgcmVhZHkgZm9yIGVkaXRvciByZXZpZXcsIGZhbHNlIGlmIG1ham9yIHJldmlzaW9ucyBuZWVkZWQ+XG59XG5cbk9ubHkgb3V0cHV0IHRoZSBKU09OLiBEbyBub3QgaW5jbHVkZSBhbnkgb3RoZXIgdGV4dCBvciBleHBsYW5hdGlvbi5gO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHsgdGV4dCB9ID0gYXdhaXQgZ2VuZXJhdGVUZXh0KHtcbiAgICAgICAgICAgIG1vZGVsOiBvcGVuYWkobW9kZWxOYW1lKSxcbiAgICAgICAgICAgIHByb21wdDogc2VvUWFQcm9tcHQsXG4gICAgICAgICAgICB0ZW1wZXJhdHVyZTogMC43LFxuICAgICAgICAgICAgbWF4VG9rZW5zOiAzMDAwXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBTRU8gUUEgc3RlcDogUmVjZWl2ZWQgYXVkaXQgZnJvbSBtb2RlbGApO1xuICAgICAgICAvLyBQYXJzZSB0aGUgSlNPTiByZXNwb25zZVxuICAgICAgICBsZXQgc2VvUWFSZXN1bHQ7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBzZW9RYVJlc3VsdCA9IEpTT04ucGFyc2UodGV4dCk7XG4gICAgICAgIH0gY2F0Y2ggKHBhcnNlRXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbdjBdIFNFTyBRQSBzdGVwOiBGYWlsZWQgdG8gcGFyc2UgbW9kZWwgcmVzcG9uc2UgYXMgSlNPTmAsIHBhcnNlRXJyIGluc3RhbmNlb2YgRXJyb3IgPyBwYXJzZUVyci5tZXNzYWdlIDogU3RyaW5nKHBhcnNlRXJyKSk7XG4gICAgICAgICAgICAvLyBSZXR1cm4gZmFsbGJhY2sgYXVkaXQgaWYgcGFyc2luZyBmYWlsc1xuICAgICAgICAgICAgc2VvUWFSZXN1bHQgPSBnZW5lcmF0ZUZhbGxiYWNrU2VvUWEoZHJhZnRNYXJrZG93biwgcHJpbWFyeUtleXdvcmQpO1xuICAgICAgICB9XG4gICAgICAgIC8vIFZhbGlkYXRlIHJlcXVpcmVkIGZpZWxkc1xuICAgICAgICBpZiAodHlwZW9mIHNlb1FhUmVzdWx0Lm92ZXJhbGxfc2NvcmUgIT09ICdudW1iZXInIHx8ICFzZW9RYVJlc3VsdC5zZWFyY2hfaW50ZW50X2FsaWdubWVudCB8fCAhc2VvUWFSZXN1bHQucHJpb3JpdHlfZml4ZXMpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgW3YwXSBTRU8gUUEgc3RlcDogTWlzc2luZyByZXF1aXJlZCBhdWRpdCBmaWVsZHMsIHVzaW5nIGZhbGxiYWNrYCk7XG4gICAgICAgICAgICBzZW9RYVJlc3VsdCA9IGdlbmVyYXRlRmFsbGJhY2tTZW9RYShkcmFmdE1hcmtkb3duLCBwcmltYXJ5S2V5d29yZCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gUGVyc2lzdCBvcHRpbWl6ZWRfanNvbiB0byBkYXRhYmFzZVxuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBTRU8gUUEgc3RlcDogUGVyc2lzdGluZyBTRU8gUUEgYXVkaXQgKHNjb3JlOiAke3Nlb1FhUmVzdWx0Lm92ZXJhbGxfc2NvcmV9KSBmb3IgcnVuICR7cnVuSWR9YCk7XG4gICAgICAgIGF3YWl0IHVwZGF0ZVJ1blN0YXR1cyhydW5JZCwgJ3Nlb19xYScsIHNlb1FhUmVzdWx0KTtcbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gU0VPIFFBIHN0ZXA6IENvbXBsZXRlIGZvciBydW4gJHtydW5JZH1gKTtcbiAgICAgICAgcmV0dXJuIHNlb1FhUmVzdWx0O1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTXNnID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICBjb25zb2xlLmVycm9yKGBbdjBdIFNFTyBRQSBzdGVwOiBFcnJvciBkdXJpbmcgYXVkaXQgZm9yIHJ1biAke3J1bklkfTogJHtlcnJvck1zZ31gKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxufVxuLyoqXG4gKiBHZW5lcmF0ZSBhIGJhc2ljIFNFTyBRQSBhdWRpdCBhcyBmYWxsYmFja1xuICovIGZ1bmN0aW9uIGdlbmVyYXRlRmFsbGJhY2tTZW9RYShkcmFmdE1hcmtkb3duLCBwcmltYXJ5S2V5d29yZCkge1xuICAgIGNvbnN0IHdvcmRDb3VudCA9IGRyYWZ0TWFya2Rvd24uc3BsaXQoL1xccysvKS5sZW5ndGg7XG4gICAgY29uc3QgaDFDb3VudCA9IChkcmFmdE1hcmtkb3duLm1hdGNoKC9eIyAvZ20pIHx8IFtdKS5sZW5ndGg7XG4gICAgY29uc3QgaDJDb3VudCA9IChkcmFmdE1hcmtkb3duLm1hdGNoKC9eIyMgL2dtKSB8fCBbXSkubGVuZ3RoO1xuICAgIGNvbnN0IGludGVybmFsTGlua0NvdW50ID0gKGRyYWZ0TWFya2Rvd24ubWF0Y2goL1xcWy4qP1xcXVxcKFxcLy4qP1xcKS9nKSB8fCBbXSkubGVuZ3RoO1xuICAgIGNvbnN0IHByaW1hcnlLZXl3b3JkT2NjdXJyZW5jZXMgPSAoZHJhZnRNYXJrZG93bi50b0xvd2VyQ2FzZSgpLm1hdGNoKG5ldyBSZWdFeHAocHJpbWFyeUtleXdvcmQudG9Mb3dlckNhc2UoKSwgJ2cnKSkgfHwgW10pLmxlbmd0aDtcbiAgICByZXR1cm4ge1xuICAgICAgICBvdmVyYWxsX3Njb3JlOiA2OCxcbiAgICAgICAgc2VhcmNoX2ludGVudF9hbGlnbm1lbnQ6IHtcbiAgICAgICAgICAgIHNjb3JlOiA2NSxcbiAgICAgICAgICAgIGFuYWx5c2lzOiAnRHJhZnQgY292ZXJzIGJhc2ljIHNlYXJjaCBpbnRlbnQgYnV0IG1heSBuZWVkIHJlZmluZW1lbnQnXG4gICAgICAgIH0sXG4gICAgICAgIHByaW1hcnlfa2V5d29yZF91c2FnZToge1xuICAgICAgICAgICAgc2NvcmU6IDcwLFxuICAgICAgICAgICAgb2NjdXJyZW5jZXM6IHByaW1hcnlLZXl3b3JkT2NjdXJyZW5jZXMsXG4gICAgICAgICAgICBwbGFjZW1lbnRfYW5hbHlzaXM6IGBQcmltYXJ5IGtleXdvcmQgYXBwZWFycyAke3ByaW1hcnlLZXl3b3JkT2NjdXJyZW5jZXN9IHRpbWVzIGluIHRoZSBkcmFmdGBcbiAgICAgICAgfSxcbiAgICAgICAgc2Vjb25kYXJ5X2tleXdvcmRfdXNhZ2U6IHtcbiAgICAgICAgICAgIHNjb3JlOiA2MCxcbiAgICAgICAgICAgIGtleXdvcmRzX2NvdmVyZWQ6IFtdLFxuICAgICAgICAgICAgZ2FwczogW1xuICAgICAgICAgICAgICAgICdBZGRpdGlvbmFsIGtleXdvcmQgYW5hbHlzaXMgbmVlZGVkJ1xuICAgICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgICBoZWFkaW5nX3N0cnVjdHVyZV9yZXZpZXc6IHtcbiAgICAgICAgICAgIHNjb3JlOiBoMkNvdW50ID4gMiA/IDc1IDogNjUsXG4gICAgICAgICAgICBoMV9wcmVzZW50OiBoMUNvdW50ID4gMCxcbiAgICAgICAgICAgIGgyX2NvdW50OiBoMkNvdW50LFxuICAgICAgICAgICAgaGllcmFyY2h5X2lzc3VlczogaDFDb3VudCA9PT0gMCA/IFtcbiAgICAgICAgICAgICAgICAnTWlzc2luZyBIMSBoZWFkaW5nJ1xuICAgICAgICAgICAgXSA6IFtdXG4gICAgICAgIH0sXG4gICAgICAgIGNvbnRlbnRfZGVwdGhfcmV2aWV3OiB7XG4gICAgICAgICAgICBzY29yZTogd29yZENvdW50ID4gMTUwMCA/IDc1IDogNjAsXG4gICAgICAgICAgICB3b3JkX2NvdW50OiB3b3JkQ291bnQsXG4gICAgICAgICAgICBzZWN0aW9uX2NvdmVyYWdlOiBgRHJhZnQgY29udGFpbnMgJHtNYXRoLm1heCgxLCBoMkNvdW50KX0gbWFpbiBzZWN0aW9uc2AsXG4gICAgICAgICAgICBkZXB0aF9pc3N1ZXM6IHdvcmRDb3VudCA8IDE1MDAgPyBbXG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQgbWF5IG5lZWQgbW9yZSBkZXB0aCdcbiAgICAgICAgICAgIF0gOiBbXVxuICAgICAgICB9LFxuICAgICAgICByZWFkYWJpbGl0eV9yZXZpZXc6IHtcbiAgICAgICAgICAgIHNjb3JlOiA3MixcbiAgICAgICAgICAgIGF2Z19zZW50ZW5jZV9sZW5ndGg6IDE4LFxuICAgICAgICAgICAgZmxlc2NoX2tpbmNhaWRfZXN0aW1hdGU6ICc4dGggZ3JhZGUnLFxuICAgICAgICAgICAgcmVhZGFiaWxpdHlfaXNzdWVzOiBbXVxuICAgICAgICB9LFxuICAgICAgICBpbnRlcm5hbF9saW5raW5nX3Jldmlldzoge1xuICAgICAgICAgICAgc2NvcmU6IGludGVybmFsTGlua0NvdW50ID4gMiA/IDcwIDogNTAsXG4gICAgICAgICAgICBpbnRlcm5hbF9saW5rc19mb3VuZDogaW50ZXJuYWxMaW5rQ291bnQsXG4gICAgICAgICAgICBpbnRlcm5hbF9saW5rX3JlY29tbWVuZGF0aW9uczogaW50ZXJuYWxMaW5rQ291bnQgPT09IDAgPyBbXG4gICAgICAgICAgICAgICAgJ0FkZCByZWxldmFudCBpbnRlcm5hbCBsaW5rcydcbiAgICAgICAgICAgIF0gOiBbXVxuICAgICAgICB9LFxuICAgICAgICBjdGFfcmV2aWV3OiB7XG4gICAgICAgICAgICBzY29yZTogNzAsXG4gICAgICAgICAgICBjdGFfcHJlc2VudDogZHJhZnRNYXJrZG93bi50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKCdjdGEnKSB8fCBkcmFmdE1hcmtkb3duLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoJ2NhbGwnKSxcbiAgICAgICAgICAgIGN0YV9hbmFseXNpczogJ0NUQSBzZWN0aW9uIHJldmlldyBuZWVkZWQnXG4gICAgICAgIH0sXG4gICAgICAgIHJpc2tfZmxhZ3M6IFtdLFxuICAgICAgICBwcmlvcml0eV9maXhlczogW1xuICAgICAgICAgICAgLi4uaDFDb3VudCA9PT0gMCA/IFtcbiAgICAgICAgICAgICAgICAnRW5zdXJlIEgxIGhlYWRpbmcgcHJlc2VudCdcbiAgICAgICAgICAgIF0gOiBbXSxcbiAgICAgICAgICAgIC4uLndvcmRDb3VudCA8IDE1MDAgPyBbXG4gICAgICAgICAgICAgICAgJ0V4cGFuZCBjb250ZW50IHRvIG1lZXQgd29yZCBjb3VudCB0YXJnZXQnXG4gICAgICAgICAgICBdIDogW10sXG4gICAgICAgICAgICAuLi5pbnRlcm5hbExpbmtDb3VudCA9PT0gMCA/IFtcbiAgICAgICAgICAgICAgICAnQWRkIGludGVybmFsIGxpbmtpbmcgc3RyYXRlZ3knXG4gICAgICAgICAgICBdIDogW11cbiAgICAgICAgXSxcbiAgICAgICAgcmVjb21tZW5kZWRfbmV4dF9hY3Rpb246ICdTZW5kIHRvIGVkaXRvciBmb3IgcmV2aWV3IGFuZCBvcHRpbWl6YXRpb24nLFxuICAgICAgICByZWFkeV9mb3JfZWRpdG9yOiB0cnVlLFxuICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgIH07XG59XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9zZW8tcWEtc3RlcC8vcnVuU2VvUWFTdGVwXCIsIHJ1blNlb1FhU3RlcCk7XG4iLCAiaW1wb3J0IHsgcmVnaXN0ZXJTdGVwRnVuY3Rpb24gfSBmcm9tIFwid29ya2Zsb3cvaW50ZXJuYWwvcHJpdmF0ZVwiO1xuaW1wb3J0ICdzZXJ2ZXItb25seSc7XG5pbXBvcnQgeyBnZW5lcmF0ZVRleHQgfSBmcm9tICdhaSc7XG5pbXBvcnQgeyBvcGVuYWkgfSBmcm9tICdAYWktc2RrL29wZW5haSc7XG5pbXBvcnQgeyB1cGRhdGVSdW5EcmFmdCwgdXBkYXRlUnVuU3RhdHVzIH0gZnJvbSAnLi4vLi4vc3RvcmFnZS9ydW5zJztcbi8qKl9faW50ZXJuYWxfd29ya2Zsb3dze1wic3RlcHNcIjp7XCJsaWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3dyaXRlci1zdGVwLnRzXCI6e1wicnVuV3JpdGVyU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3dyaXRlci1zdGVwLy9ydW5Xcml0ZXJTdGVwXCJ9fX19Ki87XG4vKipcbiAqIFdyaXRlciBTdGVwIC0gUGhhc2UgMkMtQ1xuICogUnVucyBpbnNpZGUgYSBkdXJhYmxlIHN0ZXAgZnVuY3Rpb24gKGhhcyBOb2RlLmpzIGFjY2VzcylcbiAqIENhbGxzIEFJIG1vZGVsIHRvIGdlbmVyYXRlIGZpcnN0IGZ1bGwgYmxvZyBkcmFmdCBpbiBNYXJrZG93blxuICogVXNlcyByZXNlYXJjaCBkYXRhIGFuZCBvdXRsaW5lIHRvIHN0cnVjdHVyZSB0aGUgY29udGVudFxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5Xcml0ZXJTdGVwKHJ1bklkLCBpbnB1dCwgcmVzZWFyY2hEYXRhLCBvdXRsaW5lRGF0YSkge1xuICAgIGNvbnNvbGUubG9nKGBbdjBdIFdyaXRlciBzdGVwOiBDcmVhdGluZyBkcmFmdCBmb3IgcnVuICR7cnVuSWR9YCk7XG4gICAgLy8gR2V0IG1vZGVsIGNvbmZpZ3VyYXRpb25cbiAgICBjb25zdCBtb2RlbE5hbWUgPSBwcm9jZXNzLmVudi5XUklURVJfQUdFTlRfTU9ERUwgfHwgcHJvY2Vzcy5lbnYuUkVTRUFSQ0hfQUdFTlRfTU9ERUwgfHwgJ2dwdC01LjQtbWluaSc7XG4gICAgY29uc29sZS5sb2coYFt2MF0gV3JpdGVyIHN0ZXA6IFVzaW5nIG1vZGVsOiAke21vZGVsTmFtZX1gKTtcbiAgICAvLyBDcmVhdGUgY29udGV4dCBmcm9tIGF2YWlsYWJsZSBkYXRhXG4gICAgY29uc3QgdG9waWMgPSBpbnB1dC5ibG9nX3RvcGljIHx8IGlucHV0LnRvcGljIHx8ICdZb3VyIFRvcGljJztcbiAgICBjb25zdCBwcmltYXJ5S2V5d29yZCA9IGlucHV0LnByaW1hcnlfa2V5d29yZCB8fCAncHJpbWFyeSBrZXl3b3JkJztcbiAgICBjb25zdCBzZWNvbmRhcnlLZXl3b3JkcyA9IChpbnB1dC5zZWNvbmRhcnlfa2V5d29yZHMgfHwgaW5wdXQua2V5d29yZHMgfHwgW10pLmpvaW4oJywgJykgfHwgJ3NlY29uZGFyeSBrZXl3b3Jkcyc7XG4gICAgY29uc3QgYnVzaW5lc3NOYW1lID0gaW5wdXQuYnVzaW5lc3NfbmFtZSB8fCAnWW91ciBCdXNpbmVzcyc7XG4gICAgY29uc3QgYXVkaWVuY2VOb3RlcyA9IGlucHV0LmF1ZGllbmNlX25vdGVzIHx8ICdUYXJnZXQgYXVkaWVuY2Ugbm90IHNwZWNpZmllZCc7XG4gICAgY29uc3QgYnJhbmRWb2ljZSA9IGlucHV0LmJyYW5kX3ZvaWNlX25vdGVzIHx8ICdQcm9mZXNzaW9uYWwgYW5kIGNsZWFyJztcbiAgICBjb25zdCBjdGFOb3RlcyA9IGlucHV0LmN0YV9ub3RlcyB8fCAnJztcbiAgICBjb25zdCBpbnRlcm5hbExpbmtOb3RlcyA9IGlucHV0LmludGVybmFsX2xpbmtfbm90ZXMgfHwgJyc7XG4gICAgY29uc3QgYWRkaXRpb25hbE5vdGVzID0gaW5wdXQuYWRkaXRpb25hbF9vcmRlcl9ub3RlcyB8fCAnTm8gYWRkaXRpb25hbCBub3Rlcyc7XG4gICAgY29uc3QgdGFyZ2V0V29yZENvdW50ID0gaW5wdXQudGFyZ2V0X3dvcmRfY291bnQgfHwgMTUwMDtcbiAgICAvLyBCdWlsZCByZXNlYXJjaCBjb250ZXh0IGlmIGF2YWlsYWJsZVxuICAgIGxldCByZXNlYXJjaENvbnRleHQgPSAnJztcbiAgICBpZiAocmVzZWFyY2hEYXRhICYmIHR5cGVvZiByZXNlYXJjaERhdGEgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGNvbnN0IGluc2lnaHRzID0gcmVzZWFyY2hEYXRhLmtleV9pbnNpZ2h0cyB8fCBbXTtcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoaW5zaWdodHMpICYmIGluc2lnaHRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHJlc2VhcmNoQ29udGV4dCA9IGBcXG5cXG5SZXNlYXJjaCBJbnNpZ2h0czpcXG4ke2luc2lnaHRzLm1hcCgoaSk9PmAtICR7dHlwZW9mIGkgPT09ICdzdHJpbmcnID8gaSA6IEpTT04uc3RyaW5naWZ5KGkpfWApLmpvaW4oJ1xcbicpfWA7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gQnVpbGQgb3V0bGluZSBjb250ZXh0IGlmIGF2YWlsYWJsZVxuICAgIGxldCBvdXRsaW5lQ29udGV4dCA9ICcnO1xuICAgIGlmIChvdXRsaW5lRGF0YSkge1xuICAgICAgICBjb25zdCBzZWN0aW9ucyA9IChvdXRsaW5lRGF0YS5zZWN0aW9ucyB8fCBbXSkubWFwKChzKT0+YCMjICR7dHlwZW9mIHMgPT09ICdzdHJpbmcnID8gcyA6IHMuaGVhZGluZyB8fCAnU2VjdGlvbid9XFxuKCR7cy5wdXJwb3NlIHx8ICdTZWN0aW9uIGNvbnRlbnQnfSlgKTtcbiAgICAgICAgaWYgKHNlY3Rpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIG91dGxpbmVDb250ZXh0ID0gYFxcblxcbk91dGxpbmUgU3RydWN0dXJlOlxcbiR7c2VjdGlvbnMuam9pbignXFxuXFxuJyl9YDtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBCdWlsZCBpbnRlcm5hbCBsaW5rcyBjb250ZXh0XG4gICAgbGV0IGxpbmtzQ29udGV4dCA9ICcnO1xuICAgIGlmIChpbnRlcm5hbExpbmtOb3Rlcykge1xuICAgICAgICBsaW5rc0NvbnRleHQgPSBgXFxuXFxuSW50ZXJuYWwgTGluayBPcHBvcnR1bml0aWVzOlxcbiR7aW50ZXJuYWxMaW5rTm90ZXN9YDtcbiAgICB9XG4gICAgLy8gQnVpbGQgQ1RBIGNvbnRleHRcbiAgICBsZXQgY3RhQ29udGV4dCA9ICcnO1xuICAgIGlmIChjdGFOb3Rlcykge1xuICAgICAgICBjdGFDb250ZXh0ID0gYFxcblxcbkNhbGwtdG8tQWN0aW9uIEd1aWRhbmNlOlxcbiR7Y3RhTm90ZXN9YDtcbiAgICB9XG4gICAgY29uc3Qgc3lzdGVtUHJvbXB0ID0gYFlvdSBhcmUgYW4gZXhwZXJ0IFNFTyBjb250ZW50IHdyaXRlci4gV3JpdGUgYSBmaXJzdCBkcmFmdCBibG9nIHBvc3QgaW4gTWFya2Rvd24gZm9ybWF0IHRoYXQgaXM6XG4tIFNFTy1vcHRpbWl6ZWQgZm9yIHRoZSBwcmltYXJ5IGtleXdvcmQ6IFwiJHtwcmltYXJ5S2V5d29yZH1cIlxuLSBOYXR1cmFsbHkgaW5jb3Jwb3JhdGluZyBzZWNvbmRhcnkga2V5d29yZHM6ICR7c2Vjb25kYXJ5S2V5d29yZHN9XG4tIEFsaWduZWQgd2l0aCB0aGlzIGJyYW5kIHZvaWNlOiAke2JyYW5kVm9pY2V9XG4tIFRhcmdldGluZyB0aGlzIGF1ZGllbmNlOiAke2F1ZGllbmNlTm90ZXN9XG4tIEFwcHJveGltYXRlbHkgJHt0YXJnZXRXb3JkQ291bnR9IHdvcmRzIGluIGxlbmd0aFxuLSBXcml0dGVuIGZvciBcIiR7YnVzaW5lc3NOYW1lfVwiJHthZGRpdGlvbmFsTm90ZXMgPyBgXFxuLSBBZGRpdGlvbmFsIGNvbnRleHQ6ICR7YWRkaXRpb25hbE5vdGVzfWAgOiAnJ31cblxuR3VpZGVsaW5lczpcbi0gU3RhcnQgd2l0aCBhbiBIMSB0aXRsZSB0aGF0IGluY2x1ZGVzIHRoZSBwcmltYXJ5IGtleXdvcmRcbi0gV3JpdGUgYW4gZW5nYWdpbmcgaW50cm9kdWN0aW9uICgxMDAtMTUwIHdvcmRzKVxuLSBTdHJ1Y3R1cmUgd2l0aCBIMiBhbmQgSDMgc3ViaGVhZGluZ3MgYXMgYXBwcm9wcmlhdGVcbi0gRWFjaCBzZWN0aW9uIHNob3VsZCBiZSAxNTAtMzAwIHdvcmRzXG4tIFVzZSBuYXR1cmFsLCBjb252ZXJzYXRpb25hbCBsYW5ndWFnZVxuLSBJbmNsdWRlIHByYWN0aWNhbCBleGFtcGxlcyBhbmQgYWN0aW9uYWJsZSBpbnNpZ2h0c1xuLSBObyBmYWtlIHN0YXRpc3RpY3Mgb3IgaW52ZW50ZWQgY2xhaW1zXG4tIE5vIHB1Ymxpc2hpbmcgbWV0YWRhdGEgb3IgZnJvbnRtYXR0ZXIke2N0YUNvbnRleHQgPyAnXFxuLSBJbmNsdWRlIGEgc3Ryb25nIENUQSBzZWN0aW9uIGF0IHRoZSBlbmQnIDogJyd9JHtsaW5rc0NvbnRleHQgPyAnXFxuLSBNYXJrIGludGVybmFsIGxpbmsgb3Bwb3J0dW5pdGllcyBhcyBbbGluazogZGVzY3JpcHRpb25dJyA6ICcnfVxuLSBBaW0gZm9yIHRoZSB0YXJnZXQgd29yZCBjb3VudCBidXQgcHJpb3JpdGl6ZSBxdWFsaXR5IG92ZXIgZXhhY3QgY291bnRgO1xuICAgIGNvbnN0IHVzZXJNZXNzYWdlID0gYFdyaXRlIHRoZSBmaXJzdCBkcmFmdCBibG9nIHBvc3QgYWJvdXQ6ICR7dG9waWN9JHtyZXNlYXJjaENvbnRleHR9JHtvdXRsaW5lQ29udGV4dH0ke2xpbmtzQ29udGV4dH0ke2N0YUNvbnRleHR9YDtcbiAgICB0cnkge1xuICAgICAgICAvLyBDYWxsIEFJIG1vZGVsIHZpYSBkaXJlY3QgT3BlbkFJIHByb3ZpZGVyXG4gICAgICAgIGNvbnN0IG1vZGVsID0gb3BlbmFpKG1vZGVsTmFtZSk7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZ2VuZXJhdGVUZXh0KHtcbiAgICAgICAgICAgIG1vZGVsLFxuICAgICAgICAgICAgc3lzdGVtOiBzeXN0ZW1Qcm9tcHQsXG4gICAgICAgICAgICBwcm9tcHQ6IHVzZXJNZXNzYWdlLFxuICAgICAgICAgICAgdGVtcGVyYXR1cmU6IDAuNyxcbiAgICAgICAgICAgIG1heFRva2VuczogNDAwMFxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgZHJhZnRNYXJrZG93biA9IHJlc3BvbnNlLnRleHQ7XG4gICAgICAgIC8vIEJhc2ljIHZhbGlkYXRpb25cbiAgICAgICAgaWYgKCFkcmFmdE1hcmtkb3duIHx8IGRyYWZ0TWFya2Rvd24udHJpbSgpLmxlbmd0aCA8IDUwMCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdHZW5lcmF0ZWQgY29udGVudCB0b28gc2hvcnQnKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBDYWxjdWxhdGUgbWV0cmljc1xuICAgICAgICBjb25zdCB3b3JkQ291bnQgPSBkcmFmdE1hcmtkb3duLnNwbGl0KC9cXHMrLykubGVuZ3RoO1xuICAgICAgICBjb25zdCBzZWN0aW9uc0NvdW50ID0gKGRyYWZ0TWFya2Rvd24ubWF0Y2goL14jI1xccy9nbSkgfHwgW10pLmxlbmd0aDtcbiAgICAgICAgY29uc3QgaGFzQ3RhID0gZHJhZnRNYXJrZG93bi50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKCdjYWxsJykgfHwgZHJhZnRNYXJrZG93bi50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKCdhY3Rpb24nKSB8fCBjdGFOb3Rlcy5sZW5ndGggPiAwO1xuICAgICAgICBjb25zdCBoYXNJbnRlcm5hbExpbmtzID0gZHJhZnRNYXJrZG93bi5pbmNsdWRlcygnW2xpbms6JykgfHwgaW50ZXJuYWxMaW5rTm90ZXMubGVuZ3RoID4gMDtcbiAgICAgICAgY29uc3Qgd3JpdGVyT3V0cHV0ID0ge1xuICAgICAgICAgICAgZHJhZnRfbWFya2Rvd246IGRyYWZ0TWFya2Rvd24sXG4gICAgICAgICAgICB3b3JkX2NvdW50OiB3b3JkQ291bnQsXG4gICAgICAgICAgICBzZWN0aW9uc193cml0dGVuOiBzZWN0aW9uc0NvdW50LFxuICAgICAgICAgICAgaGFzX2N0YTogaGFzQ3RhLFxuICAgICAgICAgICAgaGFzX2ludGVybmFsX2xpbmtzOiBoYXNJbnRlcm5hbExpbmtzLFxuICAgICAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgICAgfTtcbiAgICAgICAgLy8gUGVyc2lzdCBkcmFmdF9tYXJrZG93biB0byBkYXRhYmFzZSAobWFya2Rvd24gc3RyaW5nIG9ubHksIG5vdCBmdWxsIG9iamVjdClcbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gV3JpdGVyIHN0ZXA6IFBlcnNpc3RpbmcgZHJhZnRfbWFya2Rvd24gKCR7d29yZENvdW50fSB3b3JkcykgZm9yIHJ1biAke3J1bklkfWApO1xuICAgICAgICBhd2FpdCB1cGRhdGVSdW5EcmFmdChydW5JZCwgd3JpdGVyT3V0cHV0LmRyYWZ0X21hcmtkb3duKTtcbiAgICAgICAgLy8gQWxzbyB1cGRhdGUgc3RhdHVzIHRvICd3cml0aW5nJ1xuICAgICAgICBhd2FpdCB1cGRhdGVSdW5TdGF0dXMocnVuSWQsICd3cml0aW5nJyk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFdyaXRlciBzdGVwOiBDb21wbGV0ZSBmb3IgcnVuICR7cnVuSWR9ICgke3dvcmRDb3VudH0gd29yZHMsICR7c2VjdGlvbnNDb3VudH0gc2VjdGlvbnMpYCk7XG4gICAgICAgIHJldHVybiB3cml0ZXJPdXRwdXQ7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgZXJyb3JNc2cgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yIGluIHdyaXRlciBzdGVwJztcbiAgICAgICAgY29uc29sZS5lcnJvcihgW3YwXSBXcml0ZXIgc3RlcCBlcnJvciBmb3IgcnVuICR7cnVuSWR9OiAke2Vycm9yTXNnfWApO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFdyaXRlciBzdGVwIGZhaWxlZDogJHtlcnJvck1zZ31gKTtcbiAgICB9XG59XG5yZWdpc3RlclN0ZXBGdW5jdGlvbihcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy93cml0ZXItc3RlcC8vcnVuV3JpdGVyU3RlcFwiLCBydW5Xcml0ZXJTdGVwKTtcbiIsICJcbiAgICAvLyBCdWlsdCBpbiBzdGVwc1xuICAgIGltcG9ydCAnd29ya2Zsb3cvaW50ZXJuYWwvYnVpbHRpbnMnO1xuICAgIC8vIFVzZXIgc3RlcHNcbiAgICBpbXBvcnQgJy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9jYWxsYmFjay1zdGVwLnRzJztcbmltcG9ydCAnLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL2VkaXRvci1zdGVwLnRzJztcbmltcG9ydCAnLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL2hlbHBlcnMudHMnO1xuaW1wb3J0ICcuL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvbWV0YS1zdGVwLnRzJztcbmltcG9ydCAnLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL291dGxpbmUtc3RlcC50cyc7XG5pbXBvcnQgJy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9yZXNlYXJjaC1zdGVwLnRzJztcbmltcG9ydCAnLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3Nlby1xYS1zdGVwLnRzJztcbmltcG9ydCAnLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3dyaXRlci1zdGVwLnRzJztcbiAgICAvLyBTZXJkZSBmaWxlcyBmb3IgY3Jvc3MtY29udGV4dCBjbGFzcyByZWdpc3RyYXRpb25cbiAgICBcbiAgICAvLyBBUEkgZW50cnlwb2ludFxuICAgIGV4cG9ydCB7IHN0ZXBFbnRyeXBvaW50IGFzIEhF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QU0sSUFBSSxNQUFNLHVCQUF1QixRQUFRLEVBQUU7QUFBQSxFQUNyRDtBQUNKO0FBckcwQjtBQXNHMUJDLHNCQUFxQix5RUFBeUUsYUFBYTs7O0FDbEd2RyxTQUEyQixnQkFBd0Isa0JBQWxCQyx1QkFBOEI7IiwKICAibmFtZXMiOiBbInJlZ2lzdGVyU3RlcEZ1bmN0aW9uIiwgInJlZ2lzdGVyU3RlcEZ1bmN0aW9uIiwgInJlZ2lzdGVyU3RlcEZ1bmN0aW9uIiwgInJlZ2lzdGVyU3RlcEZ1bmN0aW9uIiwgInJlZ2lzdGVyU3RlcEZ1bmN0aW9uIiwgInJlZ2lzdGVyU3RlcEZ1bmN0aW9uIiwgInJlZ2lzdGVyU3RlcEZ1bmN0aW9uIiwgImdlbmVyYXRlVGV4dCIsICJvcGVuYWkiLCAiZ2VuZXJhdGVUZXh0IiwgIm9wZW5haSIsICJyZWdpc3RlclN0ZXBGdW5jdGlvbiIsICJyZWdpc3RlclN0ZXBGdW5jdGlvbiIsICJnZW5lcmF0ZVRleHQiLCAib3BlbmFpIiwgInVwZGF0ZVJ1blN0YXR1cyIsICJvcGVuYWkiLCAiZ2VuZXJhdGVUZXh0IiwgInVwZGF0ZVJ1blN0YXR1cyIsICJyZWdpc3RlclN0ZXBGdW5jdGlvbiIsICJyZWdpc3RlclN0ZXBGdW5jdGlvbiIsICJnZW5lcmF0ZVRleHQiLCAib3BlbmFpIiwgInVwZGF0ZVJ1blN0YXR1cyIsICJvcGVuYWkiLCAiZ2VuZXJhdGVUZXh0IiwgInVwZGF0ZVJ1blN0YXR1cyIsICJyZWdpc3RlclN0ZXBGdW5jdGlvbiIsICJyZWdpc3RlclN0ZXBGdW5jdGlvbiIsICJnZW5lcmF0ZVRleHQiLCAib3BlbmFpIiwgInVwZGF0ZVJ1blN0YXR1cyIsICJnZW5lcmF0ZVRleHQiLCAib3BlbmFpIiwgInVwZGF0ZVJ1blN0YXR1cyIsICJyZWdpc3RlclN0ZXBGdW5jdGlvbiIsICJyZWdpc3RlclN0ZXBGdW5jdGlvbiIsICJnZW5lcmF0ZVRleHQiLCAib3BlbmFpIiwgInVwZGF0ZVJ1blN0YXR1cyIsICJvcGVuYWkiLCAiZ2VuZXJhdGVUZXh0IiwgInVwZGF0ZVJ1blN0YXR1cyIsICJyZWdpc3RlclN0ZXBGdW5jdGlvbiIsICJzdGVwRW50cnlwb2ludCJdCn0K

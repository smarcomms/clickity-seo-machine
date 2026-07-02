// biome-ignore-all lint: generated file
/* eslint-disable */
import { workflowEntrypoint } from 'workflow/runtime';

const workflowCode = `globalThis.__private_workflows = new Map();
"use strict";
var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// lib/seo-blog-engine/workflow/steps/callback-step.ts
var sendCallbackStep = globalThis[/* @__PURE__ */ Symbol.for("WORKFLOW_USE_STEP")]("step//./lib/seo-blog-engine/workflow/steps/callback-step//sendCallbackStep");

// lib/seo-blog-engine/workflow/steps/revision-step.ts
var runRevisionStep = globalThis[/* @__PURE__ */ Symbol.for("WORKFLOW_USE_STEP")]("step//./lib/seo-blog-engine/workflow/steps/revision-step//runRevisionStep");

// lib/seo-blog-engine/workflow/steps/revision-helpers.ts
var getRunForRevisionStep = globalThis[/* @__PURE__ */ Symbol.for("WORKFLOW_USE_STEP")]("step//./lib/seo-blog-engine/workflow/steps/revision-helpers//getRunForRevisionStep");
var updateRevisionAndDraftStep = globalThis[/* @__PURE__ */ Symbol.for("WORKFLOW_USE_STEP")]("step//./lib/seo-blog-engine/workflow/steps/revision-helpers//updateRevisionAndDraftStep");
var updateBatchRevisionPendingStep = globalThis[/* @__PURE__ */ Symbol.for("WORKFLOW_USE_STEP")]("step//./lib/seo-blog-engine/workflow/steps/revision-helpers//updateBatchRevisionPendingStep");

// lib/seo-blog-engine/workflow/revision-workflow.ts
async function revisionWorkflow(request) {
  console.log(\`[v0] Revision Workflow started for run \${request.run_id}, mode: \${request.revision_mode}\`);
  try {
    if (!request.run_id) {
      throw new Error("run_id is required");
    }
    if (!request.revision_mode) {
      throw new Error("revision_mode is required");
    }
    if (!request.reviewer_email) {
      throw new Error("reviewer_email is required");
    }
    if (!request.reviewer_feedback) {
      throw new Error("reviewer_feedback is required");
    }
    console.log(\`[v0] Revision Workflow: Fetching run \${request.run_id}\`);
    const run = await getRunForRevisionStep(request.run_id);
    if (!run) {
      throw new Error(\`Run not found: \${request.run_id}\`);
    }
    if (run.status !== "completed") {
      throw new Error(\`Run status is "\${run.status}", not "completed". Cannot revise incomplete runs.\`);
    }
    if (!run.final_output_json) {
      throw new Error(\`Run has no final_output_json. Run status: \${run.status}\`);
    }
    const finalOutput = run.final_output_json;
    let currentDraft = request.current_draft_markdown || run.revised_markdown || finalOutput.edited_draft_markdown || finalOutput.draft_markdown || run.draft_markdown;
    if (!currentDraft || typeof currentDraft !== "string") {
      throw new Error("No draft markdown found in run or request. Cannot proceed with revision.");
    }
    currentDraft = currentDraft.trim();
    if (!currentDraft || currentDraft.length === 0) {
      throw new Error("Draft markdown is empty after trimming.");
    }
    console.log(\`[v0] Revision Workflow: Current draft length: \${currentDraft.length} chars\`);
    const knownFieldsOrder = [
      {
        key: "requested_changes",
        label: "Requested Changes"
      },
      {
        key: "top_priority_fix",
        label: "Top Priority Fix"
      },
      {
        key: "second_priority_fix",
        label: "Second Priority Fix"
      },
      {
        key: "preserve_notes",
        label: "Preserve Notes"
      },
      {
        key: "risk_notes",
        label: "Risk Notes"
      },
      {
        key: "rewrite_reason",
        label: "Rewrite Reason"
      },
      {
        key: "new_direction",
        label: "New Direction"
      },
      {
        key: "must_keep",
        label: "Must Keep"
      },
      {
        key: "must_remove",
        label: "Must Remove"
      },
      {
        key: "tone_notes",
        label: "Tone Notes"
      }
    ];
    const feedbackParts = [];
    const processedKeys = /* @__PURE__ */ new Set();
    for (const { key, label } of knownFieldsOrder) {
      const value = request.reviewer_feedback[key];
      if (value && typeof value === "string") {
        const trimmedValue = value.trim();
        if (trimmedValue) {
          feedbackParts.push(\`\${label}:
\${trimmedValue}\`);
          processedKeys.add(key);
        }
      }
    }
    for (const [key, value] of Object.entries(request.reviewer_feedback)) {
      if (!processedKeys.has(key) && value && typeof value === "string") {
        const trimmedValue = value.trim();
        if (trimmedValue) {
          const label = key.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
          feedbackParts.push(\`\${label}:
\${trimmedValue}\`);
        }
      }
    }
    let reviewerFeedback = feedbackParts.join("\\n\\n").trim();
    if (!reviewerFeedback || reviewerFeedback.length === 0) {
      throw new Error("Reviewer feedback is empty after trimming. At least one feedback field is required.");
    }
    console.log(\`[v0] Revision Workflow: Reviewer feedback length: \${reviewerFeedback.length} chars\`);
    const input = run.input_json && typeof run.input_json === "object" ? run.input_json : void 0;
    const research = finalOutput.research_json || void 0;
    const outline = finalOutput.outline_json || void 0;
    const seoQa = finalOutput.seo_qa_json || void 0;
    const meta = finalOutput.meta_json || void 0;
    console.log(\`[v0] Revision Workflow: Calling revision step\`);
    const revisionOutput = await runRevisionStep(currentDraft, reviewerFeedback, request.revision_mode, input, research, outline, seoQa, meta);
    console.log(\`[v0] Revision Workflow: Revision complete. Revised markdown length: \${revisionOutput.revised_markdown.length} chars\`);
    const previousReviewRound = finalOutput.internal_review?.review_round || request.review_round || 1;
    const newReviewRound = previousReviewRound + 1;
    const internalReviewMetadata = {
      review_status: "revised_review_pending",
      review_round: newReviewRound,
      previous_review_round: previousReviewRound,
      revision_mode: request.revision_mode,
      reviewer_email: request.reviewer_email,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    console.log(\`[v0] Revision Workflow: Saving revision to database. Review round: \${newReviewRound}\`);
    await updateRevisionAndDraftStep(request.run_id, revisionOutput.revised_markdown, internalReviewMetadata);
    console.log(\`[v0] Revision Workflow: Revision saved. Status remains "completed"\`);
    const batchId = run.smc_content_batch_id || request.smc_content_batch_id;
    if (batchId) {
      console.log(\`[v0] Revision Workflow: Updating smc_content_batches status for batch \${batchId}\`);
      const batchUpdate = await updateBatchRevisionPendingStep(batchId);
      if (!batchUpdate.ok) {
        console.error(\`[v0] Revision Workflow: Failed to update smc_content_batches: \${batchUpdate.error}. Revision is preserved - proceeding with callback.\`);
      } else if (!batchUpdate.skipped) {
        console.log(\`[v0] Revision Workflow: smc_content_batches status updated\`);
      }
    }
    console.log(\`[v0] Revision Workflow: Sending callback with draft_event\`);
    await sendCallbackStep(request.run_id, {
      draftEvent: "revised_draft_ready",
      compactPayload: true
    });
    console.log(\`[v0] Revision Workflow: Complete for run \${request.run_id}\`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(\`[v0] Revision Workflow error: \${errorMessage}\`);
    throw error;
  }
}
__name(revisionWorkflow, "revisionWorkflow");
revisionWorkflow.workflowId = "workflow//./lib/seo-blog-engine/workflow/revision-workflow//revisionWorkflow";
globalThis.__private_workflows.set("workflow//./lib/seo-blog-engine/workflow/revision-workflow//revisionWorkflow", revisionWorkflow);

// lib/seo-blog-engine/workflow/steps/research-step.ts
var runResearchStep = globalThis[/* @__PURE__ */ Symbol.for("WORKFLOW_USE_STEP")]("step//./lib/seo-blog-engine/workflow/steps/research-step//runResearchStep");

// lib/seo-blog-engine/workflow/steps/outline-step.ts
var runOutlineStep = globalThis[/* @__PURE__ */ Symbol.for("WORKFLOW_USE_STEP")]("step//./lib/seo-blog-engine/workflow/steps/outline-step//runOutlineStep");

// lib/seo-blog-engine/workflow/steps/writer-step.ts
var runWriterStep = globalThis[/* @__PURE__ */ Symbol.for("WORKFLOW_USE_STEP")]("step//./lib/seo-blog-engine/workflow/steps/writer-step//runWriterStep");

// lib/seo-blog-engine/workflow/steps/seo-qa-step.ts
var runSeoQaStep = globalThis[/* @__PURE__ */ Symbol.for("WORKFLOW_USE_STEP")]("step//./lib/seo-blog-engine/workflow/steps/seo-qa-step//runSeoQaStep");

// lib/seo-blog-engine/workflow/steps/editor-step.ts
var runEditorStep = globalThis[/* @__PURE__ */ Symbol.for("WORKFLOW_USE_STEP")]("step//./lib/seo-blog-engine/workflow/steps/editor-step//runEditorStep");

// lib/seo-blog-engine/workflow/steps/meta-step.ts
var runMetaStep = globalThis[/* @__PURE__ */ Symbol.for("WORKFLOW_USE_STEP")]("step//./lib/seo-blog-engine/workflow/steps/meta-step//runMetaStep");

// lib/seo-blog-engine/workflow/steps/helpers.ts
var markRunRunningStep = globalThis[/* @__PURE__ */ Symbol.for("WORKFLOW_USE_STEP")]("step//./lib/seo-blog-engine/workflow/steps/helpers//markRunRunningStep");
var markRunFailedStep = globalThis[/* @__PURE__ */ Symbol.for("WORKFLOW_USE_STEP")]("step//./lib/seo-blog-engine/workflow/steps/helpers//markRunFailedStep");
var completeRunStep = globalThis[/* @__PURE__ */ Symbol.for("WORKFLOW_USE_STEP")]("step//./lib/seo-blog-engine/workflow/steps/helpers//completeRunStep");

// lib/seo-blog-engine/workflow/seo-blog-workflow.ts
async function seoBlogWorkflow(runId, input) {
  console.log(\`[v0] SEO Blog Workflow started for run \${runId}\`);
  try {
    console.log(\`[v0] Workflow: Marking run as running\`);
    await markRunRunningStep(runId);
    console.log(\`[v0] Stage 1: Running research step\`);
    const researchOutput = await runResearchStep(runId, input);
    console.log(\`[v0] Stage 1: Research completed and persisted\`);
    console.log(\`[v0] Stage 2: Running outline step\`);
    const outlineOutput = await runOutlineStep(runId, input, researchOutput);
    console.log(\`[v0] Stage 2: Outline completed and persisted\`);
    console.log(\`[v0] Stage 3: Running writer step\`);
    const writerOutput = await runWriterStep(runId, input, researchOutput, outlineOutput);
    console.log(\`[v0] Stage 3: Writer completed and persisted\`);
    console.log(\`[v0] Stage 4: Running SEO QA step\`);
    const seoQaOutput = await runSeoQaStep(runId, input, researchOutput, outlineOutput, writerOutput.draft_markdown);
    console.log(\`[v0] Stage 4: SEO QA completed and persisted\`);
    console.log(\`[v0] Stage 5: Running editor step\`);
    const editorOutput = await runEditorStep(runId, input, researchOutput, outlineOutput, writerOutput.draft_markdown, seoQaOutput);
    console.log(\`[v0] Stage 5: Editor completed\`);
    console.log(\`[v0] Stage 6: Running meta step\`);
    const metaOutput = await runMetaStep(runId, input, researchOutput, outlineOutput, writerOutput.draft_markdown, seoQaOutput, editorOutput.edited_draft_markdown);
    console.log(\`[v0] Stage 6: Meta completed\`);
    console.log(\`[v0] Workflow: Completing run\`);
    const finalOutput = {
      research_json: researchOutput,
      outline_json: outlineOutput,
      draft_markdown: writerOutput.draft_markdown,
      seo_qa_json: seoQaOutput,
      edited_draft_markdown: editorOutput.edited_draft_markdown,
      editor_notes: editorOutput.editor_notes,
      changes_made: editorOutput.changes_made,
      meta_json: metaOutput,
      human_review_required: true,
      workflow_status: "meta_complete_awaiting_review",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    await completeRunStep(runId, finalOutput);
    console.log(\`[v0] Workflow: Sending completion callback\`);
    try {
      await sendCallbackStep(runId);
    } catch (callbackErr) {
      console.error(\`[v0] Workflow: Callback delivery failed:\`, callbackErr instanceof Error ? callbackErr.message : String(callbackErr));
    }
    console.log(\`[v0] SEO Blog Workflow completed successfully for run \${runId}\`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(\`[v0] Workflow error for run \${runId}: \${errorMessage}\`);
    try {
      await markRunFailedStep(runId, errorMessage);
    } catch (failureErr) {
      console.error(\`[v0] Failed to mark run as failed:\`, failureErr instanceof Error ? failureErr.message : String(failureErr));
    }
    console.log(\`[v0] Workflow: Sending failure callback\`);
    try {
      await sendCallbackStep(runId);
    } catch (callbackErr) {
      console.error(\`[v0] Workflow: Callback delivery failed:\`, callbackErr instanceof Error ? callbackErr.message : String(callbackErr));
    }
    throw error;
  }
}
__name(seoBlogWorkflow, "seoBlogWorkflow");
seoBlogWorkflow.workflowId = "workflow//./lib/seo-blog-engine/workflow/seo-blog-workflow//seoBlogWorkflow";
globalThis.__private_workflows.set("workflow//./lib/seo-blog-engine/workflow/seo-blog-workflow//seoBlogWorkflow", seoBlogWorkflow);
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9jYWxsYmFjay1zdGVwLnRzIiwgImxpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvcmV2aXNpb24tc3RlcC50cyIsICJsaWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3JldmlzaW9uLWhlbHBlcnMudHMiLCAibGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9yZXZpc2lvbi13b3JrZmxvdy50cyIsICJsaWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3Jlc2VhcmNoLXN0ZXAudHMiLCAibGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9vdXRsaW5lLXN0ZXAudHMiLCAibGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy93cml0ZXItc3RlcC50cyIsICJsaWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3Nlby1xYS1zdGVwLnRzIiwgImxpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvZWRpdG9yLXN0ZXAudHMiLCAibGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9tZXRhLXN0ZXAudHMiLCAibGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9oZWxwZXJzLnRzIiwgImxpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc2VvLWJsb2ctd29ya2Zsb3cudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKl9faW50ZXJuYWxfd29ya2Zsb3dze1wic3RlcHNcIjp7XCJsaWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL2NhbGxiYWNrLXN0ZXAudHNcIjp7XCJzZW5kQ2FsbGJhY2tTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvY2FsbGJhY2stc3RlcC8vc2VuZENhbGxiYWNrU3RlcFwifX19fSovO1xuJ3VzZSBzdGVwJztcbi8qKlxuICogU2VuZCBjYWxsYmFjayBub3RpZmljYXRpb24gdG8gd2ViaG9vayBVUkxcbiAqIFJ1bnMgYXMgYSBkdXJhYmxlIHN0ZXAgdG8gZW5zdXJlIGNhbGxiYWNrIGRlbGl2ZXJ5IGlzIHRyYWNrZWRcbiAqIEZhaWx1cmVzIGRvIG5vdCBicmVhayB0aGUgbWFpbiB3b3JrZmxvd1xuICpcbiAqIEBwYXJhbSBydW5JZCAtIFRoZSBydW4gSUQgdG8gc2VuZCBjYWxsYmFjayBmb3JcbiAqIEBwYXJhbSBvcHRpb25zIC0gT3B0aW9uYWwgY2FsbGJhY2sgb3B0aW9uc1xuICogICAtIGRyYWZ0RXZlbnQ6IEV2ZW50IGlkZW50aWZpZXIgKGUuZy4sIFwicmV2aXNlZF9kcmFmdF9yZWFkeVwiKVxuICogICAtIGNvbXBhY3RQYXlsb2FkOiBJZiB0cnVlLCBvbWl0IGZ1bGwgZmluYWxfb3V0cHV0X2pzb24gdG8gcmVkdWNlIHBheWxvYWQgc2l6ZVxuICovIGV4cG9ydCB2YXIgc2VuZENhbGxiYWNrU3RlcCA9IGdsb2JhbFRoaXNbU3ltYm9sLmZvcihcIldPUktGTE9XX1VTRV9TVEVQXCIpXShcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9jYWxsYmFjay1zdGVwLy9zZW5kQ2FsbGJhY2tTdGVwXCIpO1xuIiwgIi8qKl9faW50ZXJuYWxfd29ya2Zsb3dze1wic3RlcHNcIjp7XCJsaWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3JldmlzaW9uLXN0ZXAudHNcIjp7XCJydW5SZXZpc2lvblN0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9yZXZpc2lvbi1zdGVwLy9ydW5SZXZpc2lvblN0ZXBcIn19fX0qLztcbid1c2Ugc3RlcCc7XG4vKipcbiAqIFJldmlzaW9uIEFnZW50IFN0ZXBcbiAqIFJldmlzZXMgYW4gZXhpc3RpbmcgZHJhZnQgYmFzZWQgb24gcmV2aWV3ZXIgZmVlZGJhY2suXG4gKiBEb2VzIE5PVCB1cGRhdGUgdGhlIGRhdGFiYXNlIG9yIGNhbGwgY2FsbGJhY2tzLlxuICogUmV0dXJucyByZXZpc2VkIE1hcmtkb3duIG9ubHksIGZvciB1c2UgYnkgcmV2aXNpb24td29ya2Zsb3cudHMuXG4gKi8gZXhwb3J0IHZhciBydW5SZXZpc2lvblN0ZXAgPSBnbG9iYWxUaGlzW1N5bWJvbC5mb3IoXCJXT1JLRkxPV19VU0VfU1RFUFwiKV0oXCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvcmV2aXNpb24tc3RlcC8vcnVuUmV2aXNpb25TdGVwXCIpO1xuIiwgIi8qKl9faW50ZXJuYWxfd29ya2Zsb3dze1wic3RlcHNcIjp7XCJsaWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3JldmlzaW9uLWhlbHBlcnMudHNcIjp7XCJnZXRSdW5Gb3JSZXZpc2lvblN0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9yZXZpc2lvbi1oZWxwZXJzLy9nZXRSdW5Gb3JSZXZpc2lvblN0ZXBcIn0sXCJ1cGRhdGVCYXRjaFJldmlzaW9uUGVuZGluZ1N0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9yZXZpc2lvbi1oZWxwZXJzLy91cGRhdGVCYXRjaFJldmlzaW9uUGVuZGluZ1N0ZXBcIn0sXCJ1cGRhdGVSZXZpc2lvbkFuZERyYWZ0U3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3JldmlzaW9uLWhlbHBlcnMvL3VwZGF0ZVJldmlzaW9uQW5kRHJhZnRTdGVwXCJ9fX19Ki87XG4ndXNlIHN0ZXAnO1xuLyoqXG4gKiBTdGVwIHdyYXBwZXIgdG8gZmV0Y2ggcnVuIGJ5IElEXG4gKiBJc29sYXRlcyBEQiBhY2Nlc3MgKHBnIG1vZHVsZSkgdG8gc3RlcCBleGVjdXRpb24gY29udGV4dFxuICovIGV4cG9ydCB2YXIgZ2V0UnVuRm9yUmV2aXNpb25TdGVwID0gZ2xvYmFsVGhpc1tTeW1ib2wuZm9yKFwiV09SS0ZMT1dfVVNFX1NURVBcIildKFwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3JldmlzaW9uLWhlbHBlcnMvL2dldFJ1bkZvclJldmlzaW9uU3RlcFwiKTtcbi8qKlxuICogU3RlcCB3cmFwcGVyIHRvIHVwZGF0ZSByZXZpc2lvbiBhbmQgZHJhZnRcbiAqIElzb2xhdGVzIERCIGFjY2VzcyAocGcgbW9kdWxlKSB0byBzdGVwIGV4ZWN1dGlvbiBjb250ZXh0XG4gKi8gZXhwb3J0IHZhciB1cGRhdGVSZXZpc2lvbkFuZERyYWZ0U3RlcCA9IGdsb2JhbFRoaXNbU3ltYm9sLmZvcihcIldPUktGTE9XX1VTRV9TVEVQXCIpXShcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9yZXZpc2lvbi1oZWxwZXJzLy91cGRhdGVSZXZpc2lvbkFuZERyYWZ0U3RlcFwiKTtcbi8qKlxuICogU3RlcCB3cmFwcGVyIHRvIHVwZGF0ZSBzbWNfY29udGVudF9iYXRjaGVzIHN0YXR1cyBmb3IgcmV2aXNlZCBibG9nXG4gKiBJc29sYXRlcyBEQiBhY2Nlc3MgKHBnIG1vZHVsZSkgdG8gc3RlcCBleGVjdXRpb24gY29udGV4dFxuICovIGV4cG9ydCB2YXIgdXBkYXRlQmF0Y2hSZXZpc2lvblBlbmRpbmdTdGVwID0gZ2xvYmFsVGhpc1tTeW1ib2wuZm9yKFwiV09SS0ZMT1dfVVNFX1NURVBcIildKFwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3JldmlzaW9uLWhlbHBlcnMvL3VwZGF0ZUJhdGNoUmV2aXNpb25QZW5kaW5nU3RlcFwiKTtcbiIsICJpbXBvcnQgeyBzZW5kQ2FsbGJhY2tTdGVwIH0gZnJvbSAnLi9zdGVwcy9jYWxsYmFjay1zdGVwJztcbmltcG9ydCB7IHJ1blJldmlzaW9uU3RlcCB9IGZyb20gJy4vc3RlcHMvcmV2aXNpb24tc3RlcCc7XG5pbXBvcnQgeyBnZXRSdW5Gb3JSZXZpc2lvblN0ZXAsIHVwZGF0ZVJldmlzaW9uQW5kRHJhZnRTdGVwLCB1cGRhdGVCYXRjaFJldmlzaW9uUGVuZGluZ1N0ZXAgfSBmcm9tICcuL3N0ZXBzL3JldmlzaW9uLWhlbHBlcnMnO1xuLyoqX19pbnRlcm5hbF93b3JrZmxvd3N7XCJ3b3JrZmxvd3NcIjp7XCJsaWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3JldmlzaW9uLXdvcmtmbG93LnRzXCI6e1wicmV2aXNpb25Xb3JrZmxvd1wiOntcIndvcmtmbG93SWRcIjpcIndvcmtmbG93Ly8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvcmV2aXNpb24td29ya2Zsb3cvL3JldmlzaW9uV29ya2Zsb3dcIn19fX0qLztcbi8qKlxuICogU0VPIEJsb2cgUmV2aXNpb24gV29ya2Zsb3dcbiAqIEhhbmRsZXMgcmV2aXNpb25zIHRvIGNvbXBsZXRlZCBibG9nIHJ1bnMgYWZ0ZXIgaHVtYW4gcmV2aWV3LlxuICogRG9lcyBOT1QgY2hhbmdlIHNlb19ibG9nX3J1bnMuc3RhdHVzIChzdGF5cyBcImNvbXBsZXRlZFwiKS5cbiAqIEtlZXBzIHJldmlzaW9uIHN0YXRlIGluIGZpbmFsX291dHB1dF9qc29uLmludGVybmFsX3JldmlldyBhbmQgcmV2aXNlZF9tYXJrZG93biBjb2x1bW4uXG4gKi8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJldmlzaW9uV29ya2Zsb3cocmVxdWVzdCkge1xuICAgIGNvbnNvbGUubG9nKGBbdjBdIFJldmlzaW9uIFdvcmtmbG93IHN0YXJ0ZWQgZm9yIHJ1biAke3JlcXVlc3QucnVuX2lkfSwgbW9kZTogJHtyZXF1ZXN0LnJldmlzaW9uX21vZGV9YCk7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gVmFsaWRhdGUgcmVxdWVzdFxuICAgICAgICBpZiAoIXJlcXVlc3QucnVuX2lkKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3J1bl9pZCBpcyByZXF1aXJlZCcpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghcmVxdWVzdC5yZXZpc2lvbl9tb2RlKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3JldmlzaW9uX21vZGUgaXMgcmVxdWlyZWQnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXJlcXVlc3QucmV2aWV3ZXJfZW1haWwpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigncmV2aWV3ZXJfZW1haWwgaXMgcmVxdWlyZWQnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXJlcXVlc3QucmV2aWV3ZXJfZmVlZGJhY2spIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigncmV2aWV3ZXJfZmVlZGJhY2sgaXMgcmVxdWlyZWQnKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBGZXRjaCB0aGUgZXhpc3RpbmcgcnVuXG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFJldmlzaW9uIFdvcmtmbG93OiBGZXRjaGluZyBydW4gJHtyZXF1ZXN0LnJ1bl9pZH1gKTtcbiAgICAgICAgY29uc3QgcnVuID0gYXdhaXQgZ2V0UnVuRm9yUmV2aXNpb25TdGVwKHJlcXVlc3QucnVuX2lkKTtcbiAgICAgICAgaWYgKCFydW4pIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgUnVuIG5vdCBmb3VuZDogJHtyZXF1ZXN0LnJ1bl9pZH1gKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBWYWxpZGF0ZSBydW4gaXMgY29tcGxldGVkXG4gICAgICAgIGlmIChydW4uc3RhdHVzICE9PSAnY29tcGxldGVkJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBSdW4gc3RhdHVzIGlzIFwiJHtydW4uc3RhdHVzfVwiLCBub3QgXCJjb21wbGV0ZWRcIi4gQ2Fubm90IHJldmlzZSBpbmNvbXBsZXRlIHJ1bnMuYCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFydW4uZmluYWxfb3V0cHV0X2pzb24pIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgUnVuIGhhcyBubyBmaW5hbF9vdXRwdXRfanNvbi4gUnVuIHN0YXR1czogJHtydW4uc3RhdHVzfWApO1xuICAgICAgICB9XG4gICAgICAgIC8vIEdldCB0aGUgbGF0ZXN0IGRyYWZ0IG1hcmtkb3duIHdpdGggcHJpb3JpdHk6XG4gICAgICAgIC8vIDEuIHJlcXVlc3QuY3VycmVudF9kcmFmdF9tYXJrZG93biAoaWYgcHJvdmlkZWQpXG4gICAgICAgIC8vIDIuIHJ1bi5maW5hbF9vdXRwdXRfanNvbi5lZGl0ZWRfZHJhZnRfbWFya2Rvd25cbiAgICAgICAgLy8gMy4gcnVuLmZpbmFsX291dHB1dF9qc29uLmRyYWZ0X21hcmtkb3duXG4gICAgICAgIC8vIDQuIHJ1bi5kcmFmdF9tYXJrZG93blxuICAgICAgICBjb25zdCBmaW5hbE91dHB1dCA9IHJ1bi5maW5hbF9vdXRwdXRfanNvbjtcbiAgICAgICAgbGV0IGN1cnJlbnREcmFmdCA9IHJlcXVlc3QuY3VycmVudF9kcmFmdF9tYXJrZG93biB8fCBydW4ucmV2aXNlZF9tYXJrZG93biB8fCBmaW5hbE91dHB1dC5lZGl0ZWRfZHJhZnRfbWFya2Rvd24gfHwgZmluYWxPdXRwdXQuZHJhZnRfbWFya2Rvd24gfHwgcnVuLmRyYWZ0X21hcmtkb3duO1xuICAgICAgICBpZiAoIWN1cnJlbnREcmFmdCB8fCB0eXBlb2YgY3VycmVudERyYWZ0ICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBkcmFmdCBtYXJrZG93biBmb3VuZCBpbiBydW4gb3IgcmVxdWVzdC4gQ2Fubm90IHByb2NlZWQgd2l0aCByZXZpc2lvbi4nKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBUcmltIGFuZCB2YWxpZGF0ZSBkcmFmdFxuICAgICAgICBjdXJyZW50RHJhZnQgPSBjdXJyZW50RHJhZnQudHJpbSgpO1xuICAgICAgICBpZiAoIWN1cnJlbnREcmFmdCB8fCBjdXJyZW50RHJhZnQubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0RyYWZ0IG1hcmtkb3duIGlzIGVtcHR5IGFmdGVyIHRyaW1taW5nLicpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFJldmlzaW9uIFdvcmtmbG93OiBDdXJyZW50IGRyYWZ0IGxlbmd0aDogJHtjdXJyZW50RHJhZnQubGVuZ3RofSBjaGFyc2ApO1xuICAgICAgICAvLyBCdWlsZCByZXZpZXdlciBmZWVkYmFjayBzdHJpbmcgZnJvbSBmbGV4aWJsZSBmZWVkYmFjayBvYmplY3RcbiAgICAgICAgLy8gRGVmaW5lIGtub3duIGZpZWxkcyBpbiBwcmlvcml0eSBvcmRlciB3aXRoIGh1bWFuLXJlYWRhYmxlIGxhYmVsc1xuICAgICAgICBjb25zdCBrbm93bkZpZWxkc09yZGVyID0gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGtleTogJ3JlcXVlc3RlZF9jaGFuZ2VzJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogJ1JlcXVlc3RlZCBDaGFuZ2VzJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBrZXk6ICd0b3BfcHJpb3JpdHlfZml4JyxcbiAgICAgICAgICAgICAgICBsYWJlbDogJ1RvcCBQcmlvcml0eSBGaXgnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGtleTogJ3NlY29uZF9wcmlvcml0eV9maXgnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiAnU2Vjb25kIFByaW9yaXR5IEZpeCdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAga2V5OiAncHJlc2VydmVfbm90ZXMnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiAnUHJlc2VydmUgTm90ZXMnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGtleTogJ3Jpc2tfbm90ZXMnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiAnUmlzayBOb3RlcydcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAga2V5OiAncmV3cml0ZV9yZWFzb24nLFxuICAgICAgICAgICAgICAgIGxhYmVsOiAnUmV3cml0ZSBSZWFzb24nXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGtleTogJ25ld19kaXJlY3Rpb24nLFxuICAgICAgICAgICAgICAgIGxhYmVsOiAnTmV3IERpcmVjdGlvbidcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAga2V5OiAnbXVzdF9rZWVwJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogJ011c3QgS2VlcCdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAga2V5OiAnbXVzdF9yZW1vdmUnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiAnTXVzdCBSZW1vdmUnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGtleTogJ3RvbmVfbm90ZXMnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiAnVG9uZSBOb3RlcydcbiAgICAgICAgICAgIH1cbiAgICAgICAgXTtcbiAgICAgICAgY29uc3QgZmVlZGJhY2tQYXJ0cyA9IFtdO1xuICAgICAgICBjb25zdCBwcm9jZXNzZWRLZXlzID0gbmV3IFNldCgpO1xuICAgICAgICAvLyBQcm9jZXNzIGtub3duIGZpZWxkcyBpbiBvcmRlclxuICAgICAgICBmb3IgKGNvbnN0IHsga2V5LCBsYWJlbCB9IG9mIGtub3duRmllbGRzT3JkZXIpe1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSByZXF1ZXN0LnJldmlld2VyX2ZlZWRiYWNrW2tleV07XG4gICAgICAgICAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRyaW1tZWRWYWx1ZSA9IHZhbHVlLnRyaW0oKTtcbiAgICAgICAgICAgICAgICBpZiAodHJpbW1lZFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGZlZWRiYWNrUGFydHMucHVzaChgJHtsYWJlbH06XFxuJHt0cmltbWVkVmFsdWV9YCk7XG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3NlZEtleXMuYWRkKGtleSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIFByb2Nlc3MgZXh0cmEgZmllbGRzIG5vdCBpbiBrbm93biBsaXN0XG4gICAgICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKHJlcXVlc3QucmV2aWV3ZXJfZmVlZGJhY2spKXtcbiAgICAgICAgICAgIGlmICghcHJvY2Vzc2VkS2V5cy5oYXMoa2V5KSAmJiB2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdHJpbW1lZFZhbHVlID0gdmFsdWUudHJpbSgpO1xuICAgICAgICAgICAgICAgIGlmICh0cmltbWVkVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQ29udmVydCBzbmFrZV9jYXNlIGtleSB0byBUaXRsZSBDYXNlIGxhYmVsXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGxhYmVsID0ga2V5LnNwbGl0KCdfJykubWFwKCh3b3JkKT0+d29yZC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHdvcmQuc2xpY2UoMSkpLmpvaW4oJyAnKTtcbiAgICAgICAgICAgICAgICAgICAgZmVlZGJhY2tQYXJ0cy5wdXNoKGAke2xhYmVsfTpcXG4ke3RyaW1tZWRWYWx1ZX1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHJldmlld2VyRmVlZGJhY2sgPSBmZWVkYmFja1BhcnRzLmpvaW4oJ1xcblxcbicpLnRyaW0oKTtcbiAgICAgICAgaWYgKCFyZXZpZXdlckZlZWRiYWNrIHx8IHJldmlld2VyRmVlZGJhY2subGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Jldmlld2VyIGZlZWRiYWNrIGlzIGVtcHR5IGFmdGVyIHRyaW1taW5nLiBBdCBsZWFzdCBvbmUgZmVlZGJhY2sgZmllbGQgaXMgcmVxdWlyZWQuJyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gUmV2aXNpb24gV29ya2Zsb3c6IFJldmlld2VyIGZlZWRiYWNrIGxlbmd0aDogJHtyZXZpZXdlckZlZWRiYWNrLmxlbmd0aH0gY2hhcnNgKTtcbiAgICAgICAgLy8gRXh0cmFjdCBjb250ZXh0IGZvciByZXZpc2lvbiBzdGVwXG4gICAgICAgIGNvbnN0IGlucHV0ID0gcnVuLmlucHV0X2pzb24gJiYgdHlwZW9mIHJ1bi5pbnB1dF9qc29uID09PSAnb2JqZWN0JyA/IHJ1bi5pbnB1dF9qc29uIDogdW5kZWZpbmVkO1xuICAgICAgICBjb25zdCByZXNlYXJjaCA9IGZpbmFsT3V0cHV0LnJlc2VhcmNoX2pzb24gfHwgdW5kZWZpbmVkO1xuICAgICAgICBjb25zdCBvdXRsaW5lID0gZmluYWxPdXRwdXQub3V0bGluZV9qc29uIHx8IHVuZGVmaW5lZDtcbiAgICAgICAgY29uc3Qgc2VvUWEgPSBmaW5hbE91dHB1dC5zZW9fcWFfanNvbiB8fCB1bmRlZmluZWQ7XG4gICAgICAgIGNvbnN0IG1ldGEgPSBmaW5hbE91dHB1dC5tZXRhX2pzb24gfHwgdW5kZWZpbmVkO1xuICAgICAgICAvLyBDYWxsIHJldmlzaW9uIHN0ZXAgKHJ1bnMgTExNLCByZXR1cm5zIHJldmlzZWQgbWFya2Rvd24pXG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFJldmlzaW9uIFdvcmtmbG93OiBDYWxsaW5nIHJldmlzaW9uIHN0ZXBgKTtcbiAgICAgICAgY29uc3QgcmV2aXNpb25PdXRwdXQgPSBhd2FpdCBydW5SZXZpc2lvblN0ZXAoY3VycmVudERyYWZ0LCByZXZpZXdlckZlZWRiYWNrLCByZXF1ZXN0LnJldmlzaW9uX21vZGUsIGlucHV0LCByZXNlYXJjaCwgb3V0bGluZSwgc2VvUWEsIG1ldGEpO1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBSZXZpc2lvbiBXb3JrZmxvdzogUmV2aXNpb24gY29tcGxldGUuIFJldmlzZWQgbWFya2Rvd24gbGVuZ3RoOiAke3JldmlzaW9uT3V0cHV0LnJldmlzZWRfbWFya2Rvd24ubGVuZ3RofSBjaGFyc2ApO1xuICAgICAgICAvLyBQcmVwYXJlIGludGVybmFsIHJldmlldyBtZXRhZGF0YVxuICAgICAgICAvLyBSZXZpZXcgcm91bmQgcHJpb3JpdHk6IGZpbmFsT3V0cHV0LmludGVybmFsX3Jldmlldz8ucmV2aWV3X3JvdW5kLCB0aGVuIHJlcXVlc3QucmV2aWV3X3JvdW5kLCB0aGVuIDFcbiAgICAgICAgY29uc3QgcHJldmlvdXNSZXZpZXdSb3VuZCA9IGZpbmFsT3V0cHV0LmludGVybmFsX3Jldmlldz8ucmV2aWV3X3JvdW5kIHx8IHJlcXVlc3QucmV2aWV3X3JvdW5kIHx8IDE7XG4gICAgICAgIGNvbnN0IG5ld1Jldmlld1JvdW5kID0gcHJldmlvdXNSZXZpZXdSb3VuZCArIDE7XG4gICAgICAgIGNvbnN0IGludGVybmFsUmV2aWV3TWV0YWRhdGEgPSB7XG4gICAgICAgICAgICByZXZpZXdfc3RhdHVzOiAncmV2aXNlZF9yZXZpZXdfcGVuZGluZycsXG4gICAgICAgICAgICByZXZpZXdfcm91bmQ6IG5ld1Jldmlld1JvdW5kLFxuICAgICAgICAgICAgcHJldmlvdXNfcmV2aWV3X3JvdW5kOiBwcmV2aW91c1Jldmlld1JvdW5kLFxuICAgICAgICAgICAgcmV2aXNpb25fbW9kZTogcmVxdWVzdC5yZXZpc2lvbl9tb2RlLFxuICAgICAgICAgICAgcmV2aWV3ZXJfZW1haWw6IHJlcXVlc3QucmV2aWV3ZXJfZW1haWwsXG4gICAgICAgICAgICB1cGRhdGVkX2F0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgICAgfTtcbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gUmV2aXNpb24gV29ya2Zsb3c6IFNhdmluZyByZXZpc2lvbiB0byBkYXRhYmFzZS4gUmV2aWV3IHJvdW5kOiAke25ld1Jldmlld1JvdW5kfWApO1xuICAgICAgICAvLyBTYXZlIHJldmlzaW9uIHRvIGRhdGFiYXNlICh1cGRhdGVzIGJvdGggcmV2aXNlZF9tYXJrZG93biBhbmQgZmluYWxfb3V0cHV0X2pzb24uZWRpdGVkX2RyYWZ0X21hcmtkb3duKVxuICAgICAgICBhd2FpdCB1cGRhdGVSZXZpc2lvbkFuZERyYWZ0U3RlcChyZXF1ZXN0LnJ1bl9pZCwgcmV2aXNpb25PdXRwdXQucmV2aXNlZF9tYXJrZG93biwgaW50ZXJuYWxSZXZpZXdNZXRhZGF0YSk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFJldmlzaW9uIFdvcmtmbG93OiBSZXZpc2lvbiBzYXZlZC4gU3RhdHVzIHJlbWFpbnMgXCJjb21wbGV0ZWRcImApO1xuICAgICAgICAvLyBVcGRhdGUgc21jX2NvbnRlbnRfYmF0Y2hlcyBzdGF0dXMgaWYgYmF0Y2hfaWQgZXhpc3RzXG4gICAgICAgIGNvbnN0IGJhdGNoSWQgPSBydW4uc21jX2NvbnRlbnRfYmF0Y2hfaWQgfHwgcmVxdWVzdC5zbWNfY29udGVudF9iYXRjaF9pZDtcbiAgICAgICAgaWYgKGJhdGNoSWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFJldmlzaW9uIFdvcmtmbG93OiBVcGRhdGluZyBzbWNfY29udGVudF9iYXRjaGVzIHN0YXR1cyBmb3IgYmF0Y2ggJHtiYXRjaElkfWApO1xuICAgICAgICAgICAgY29uc3QgYmF0Y2hVcGRhdGUgPSBhd2FpdCB1cGRhdGVCYXRjaFJldmlzaW9uUGVuZGluZ1N0ZXAoYmF0Y2hJZCk7XG4gICAgICAgICAgICBpZiAoIWJhdGNoVXBkYXRlLm9rKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW3YwXSBSZXZpc2lvbiBXb3JrZmxvdzogRmFpbGVkIHRvIHVwZGF0ZSBzbWNfY29udGVudF9iYXRjaGVzOiAke2JhdGNoVXBkYXRlLmVycm9yfS4gUmV2aXNpb24gaXMgcHJlc2VydmVkIC0gcHJvY2VlZGluZyB3aXRoIGNhbGxiYWNrLmApO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghYmF0Y2hVcGRhdGUuc2tpcHBlZCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFJldmlzaW9uIFdvcmtmbG93OiBzbWNfY29udGVudF9iYXRjaGVzIHN0YXR1cyB1cGRhdGVkYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gU2VuZCBjYWxsYmFjayBub3RpZmljYXRpb24gdG8gbjhuIHdpdGggZHJhZnRfZXZlbnQgc2lnbmFsXG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFJldmlzaW9uIFdvcmtmbG93OiBTZW5kaW5nIGNhbGxiYWNrIHdpdGggZHJhZnRfZXZlbnRgKTtcbiAgICAgICAgYXdhaXQgc2VuZENhbGxiYWNrU3RlcChyZXF1ZXN0LnJ1bl9pZCwge1xuICAgICAgICAgICAgZHJhZnRFdmVudDogJ3JldmlzZWRfZHJhZnRfcmVhZHknLFxuICAgICAgICAgICAgY29tcGFjdFBheWxvYWQ6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFJldmlzaW9uIFdvcmtmbG93OiBDb21wbGV0ZSBmb3IgcnVuICR7cmVxdWVzdC5ydW5faWR9YCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICBjb25zb2xlLmVycm9yKGBbdjBdIFJldmlzaW9uIFdvcmtmbG93IGVycm9yOiAke2Vycm9yTWVzc2FnZX1gKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxufVxucmV2aXNpb25Xb3JrZmxvdy53b3JrZmxvd0lkID0gXCJ3b3JrZmxvdy8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3JldmlzaW9uLXdvcmtmbG93Ly9yZXZpc2lvbldvcmtmbG93XCI7XG5nbG9iYWxUaGlzLl9fcHJpdmF0ZV93b3JrZmxvd3Muc2V0KFwid29ya2Zsb3cvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9yZXZpc2lvbi13b3JrZmxvdy8vcmV2aXNpb25Xb3JrZmxvd1wiLCByZXZpc2lvbldvcmtmbG93KTtcbiIsICIvKipfX2ludGVybmFsX3dvcmtmbG93c3tcInN0ZXBzXCI6e1wibGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9yZXNlYXJjaC1zdGVwLnRzXCI6e1wicnVuUmVzZWFyY2hTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvcmVzZWFyY2gtc3RlcC8vcnVuUmVzZWFyY2hTdGVwXCJ9fX19Ki87XG4ndXNlIHN0ZXAnO1xuLyoqXG4gKiBSZXNlYXJjaCBTdGVwIC0gUGhhc2UgMkMtQVxuICogUnVucyBpbnNpZGUgYSBkdXJhYmxlIHN0ZXAgZnVuY3Rpb24gKGhhcyBOb2RlLmpzIGFjY2VzcylcbiAqIENhbGxzIEFJIG1vZGVsIHRvIGdlbmVyYXRlIHJlc2VhcmNoIEpTT05cbiAqIE5vIGZpbGVzeXN0ZW0gaW1wb3J0cyAtIHNhZmUgZm9yIHdvcmtmbG93IGNvbnRleHRcbiAqLyBleHBvcnQgdmFyIHJ1blJlc2VhcmNoU3RlcCA9IGdsb2JhbFRoaXNbU3ltYm9sLmZvcihcIldPUktGTE9XX1VTRV9TVEVQXCIpXShcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9yZXNlYXJjaC1zdGVwLy9ydW5SZXNlYXJjaFN0ZXBcIik7XG4iLCAiLyoqX19pbnRlcm5hbF93b3JrZmxvd3N7XCJzdGVwc1wiOntcImxpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvb3V0bGluZS1zdGVwLnRzXCI6e1wicnVuT3V0bGluZVN0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9vdXRsaW5lLXN0ZXAvL3J1bk91dGxpbmVTdGVwXCJ9fX19Ki87XG4ndXNlIHN0ZXAnO1xuLyoqXG4gKiBPdXRsaW5lIFN0ZXAgLSBQaGFzZSAyQy1CXG4gKiBSdW5zIGluc2lkZSBhIGR1cmFibGUgc3RlcCBmdW5jdGlvbiAoaGFzIE5vZGUuanMgYWNjZXNzKVxuICogQ2FsbHMgQUkgbW9kZWwgdG8gZ2VuZXJhdGUgY29udGVudCBvdXRsaW5lIHdpdGggc3RydWN0dXJlXG4gKiBVc2VzIHJlc2VhcmNoIGRhdGEgaWYgYXZhaWxhYmxlIHRvIGluZm9ybSBvdXRsaW5lXG4gKi8gZXhwb3J0IHZhciBydW5PdXRsaW5lU3RlcCA9IGdsb2JhbFRoaXNbU3ltYm9sLmZvcihcIldPUktGTE9XX1VTRV9TVEVQXCIpXShcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9vdXRsaW5lLXN0ZXAvL3J1bk91dGxpbmVTdGVwXCIpO1xuIiwgIi8qKl9faW50ZXJuYWxfd29ya2Zsb3dze1wic3RlcHNcIjp7XCJsaWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3dyaXRlci1zdGVwLnRzXCI6e1wicnVuV3JpdGVyU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3dyaXRlci1zdGVwLy9ydW5Xcml0ZXJTdGVwXCJ9fX19Ki87XG4ndXNlIHN0ZXAnO1xuLyoqXG4gKiBXcml0ZXIgU3RlcCAtIFBoYXNlIDJDLUNcbiAqIFJ1bnMgaW5zaWRlIGEgZHVyYWJsZSBzdGVwIGZ1bmN0aW9uIChoYXMgTm9kZS5qcyBhY2Nlc3MpXG4gKiBDYWxscyBBSSBtb2RlbCB0byBnZW5lcmF0ZSBmaXJzdCBmdWxsIGJsb2cgZHJhZnQgaW4gTWFya2Rvd25cbiAqIFVzZXMgcmVzZWFyY2ggZGF0YSBhbmQgb3V0bGluZSB0byBzdHJ1Y3R1cmUgdGhlIGNvbnRlbnRcbiAqLyBleHBvcnQgdmFyIHJ1bldyaXRlclN0ZXAgPSBnbG9iYWxUaGlzW1N5bWJvbC5mb3IoXCJXT1JLRkxPV19VU0VfU1RFUFwiKV0oXCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvd3JpdGVyLXN0ZXAvL3J1bldyaXRlclN0ZXBcIik7XG4iLCAiLyoqX19pbnRlcm5hbF93b3JrZmxvd3N7XCJzdGVwc1wiOntcImxpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvc2VvLXFhLXN0ZXAudHNcIjp7XCJydW5TZW9RYVN0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9zZW8tcWEtc3RlcC8vcnVuU2VvUWFTdGVwXCJ9fX19Ki87XG4ndXNlIHN0ZXAnO1xuLyoqXG4gKiBTRU8gUUEgU3RlcCAtIFBoYXNlIDJDLURcbiAqIFJldmlld3MgZHJhZnQgbWFya2Rvd24gYWdhaW5zdCBTRU8gYW5kIGNsaWVudC1nb2FsIGNyaXRlcmlhLlxuICogUmV0dXJucyBzdHJ1Y3R1cmVkIGF1ZGl0IEpTT04uIERvZXMgbm90IHJld3JpdGUgdGhlIGRyYWZ0LlxuICovIGV4cG9ydCB2YXIgcnVuU2VvUWFTdGVwID0gZ2xvYmFsVGhpc1tTeW1ib2wuZm9yKFwiV09SS0ZMT1dfVVNFX1NURVBcIildKFwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL3Nlby1xYS1zdGVwLy9ydW5TZW9RYVN0ZXBcIik7XG4iLCAiLyoqX19pbnRlcm5hbF93b3JrZmxvd3N7XCJzdGVwc1wiOntcImxpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvZWRpdG9yLXN0ZXAudHNcIjp7XCJydW5FZGl0b3JTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvZWRpdG9yLXN0ZXAvL3J1bkVkaXRvclN0ZXBcIn19fX0qLztcbid1c2Ugc3RlcCc7XG4vKipcbiAqIEVkaXRvciBBZ2VudCBTdGVwXG4gKiBJbXByb3ZlcyB0aGUgZHJhZnQgYmFzZWQgb24gU0VPIFFBIHJlY29tbWVuZGF0aW9ucyBhbmQgYnJhbmQgZ3VpZGVsaW5lcy5cbiAqIERCIHByb21wdCBjb250cmFjdDogbW9kZWwgcmV0dXJucyBNYXJrZG93biBvbmx5LlxuICogRG9lcyBOT1Qgb3ZlcndyaXRlIG9yaWdpbmFsIGRyYWZ0X21hcmtkb3duOyBlZGl0ZWQgb3V0cHV0IGdvZXMgdG8gZmluYWxfb3V0cHV0X2pzb24uXG4gKi8gZXhwb3J0IHZhciBydW5FZGl0b3JTdGVwID0gZ2xvYmFsVGhpc1tTeW1ib2wuZm9yKFwiV09SS0ZMT1dfVVNFX1NURVBcIildKFwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL2VkaXRvci1zdGVwLy9ydW5FZGl0b3JTdGVwXCIpO1xuIiwgIi8qKl9faW50ZXJuYWxfd29ya2Zsb3dze1wic3RlcHNcIjp7XCJsaWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL21ldGEtc3RlcC50c1wiOntcInJ1bk1ldGFTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvbWV0YS1zdGVwLy9ydW5NZXRhU3RlcFwifX19fSovO1xuJ3VzZSBzdGVwJztcbi8qKlxuICogTWV0YSBBZ2VudCBTdGVwIC0gUGhhc2UgMkMtRlxuICogR2VuZXJhdGVzIFNFTyBtZXRhZGF0YSBmb3IgaHVtYW4gcmV2aWV3XG4gKiBEb2VzIE5PVCBwdWJsaXNoLCBjYWxsIGV4dGVybmFsIHNlcnZpY2VzLCBvciBvdmVyd3JpdGUgZHJhZnRzXG4gKiBPdXRwdXQgZ29lcyB0byBmaW5hbF9vdXRwdXRfanNvbiBhcyBtZXRhX2pzb25cbiAqLyBleHBvcnQgdmFyIHJ1bk1ldGFTdGVwID0gZ2xvYmFsVGhpc1tTeW1ib2wuZm9yKFwiV09SS0ZMT1dfVVNFX1NURVBcIildKFwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL21ldGEtc3RlcC8vcnVuTWV0YVN0ZXBcIik7XG4iLCAiLyoqX19pbnRlcm5hbF93b3JrZmxvd3N7XCJzdGVwc1wiOntcImxpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvaGVscGVycy50c1wiOntcImNvbXBsZXRlUnVuU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL2hlbHBlcnMvL2NvbXBsZXRlUnVuU3RlcFwifSxcIm1hcmtSdW5GYWlsZWRTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvaGVscGVycy8vbWFya1J1bkZhaWxlZFN0ZXBcIn0sXCJtYXJrUnVuUnVubmluZ1N0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zdGVwcy9oZWxwZXJzLy9tYXJrUnVuUnVubmluZ1N0ZXBcIn19fX0qLztcbid1c2Ugc3RlcCc7XG4vKipcbiAqIE1hcmsgYSBydW4gYXMgcnVubmluZyAodHJhbnNpdGlvbiBmcm9tIHF1ZXVlZCB0byBydW5uaW5nKVxuICovIGV4cG9ydCB2YXIgbWFya1J1blJ1bm5pbmdTdGVwID0gZ2xvYmFsVGhpc1tTeW1ib2wuZm9yKFwiV09SS0ZMT1dfVVNFX1NURVBcIildKFwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL2hlbHBlcnMvL21hcmtSdW5SdW5uaW5nU3RlcFwiKTtcbi8qKlxuICogTWFyayBhIHJ1biBhcyBmYWlsZWQgd2l0aCBlcnJvciBtZXNzYWdlXG4gKiBDYWxsYmFjayBpcyBzZW50IGJ5IHdvcmtmbG93IG9yY2hlc3RyYXRvciwgbm90IGhlcmVcbiAqLyBleHBvcnQgdmFyIG1hcmtSdW5GYWlsZWRTdGVwID0gZ2xvYmFsVGhpc1tTeW1ib2wuZm9yKFwiV09SS0ZMT1dfVVNFX1NURVBcIildKFwic3RlcC8vLi9saWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3N0ZXBzL2hlbHBlcnMvL21hcmtSdW5GYWlsZWRTdGVwXCIpO1xuLyoqXG4gKiBDb21wbGV0ZSBhIHJ1biB3aXRoIGZpbmFsIG91dHB1dFxuICogQ2FsbGJhY2sgaXMgc2VudCBieSB3b3JrZmxvdyBvcmNoZXN0cmF0b3IsIG5vdCBoZXJlXG4gKi8gZXhwb3J0IHZhciBjb21wbGV0ZVJ1blN0ZXAgPSBnbG9iYWxUaGlzW1N5bWJvbC5mb3IoXCJXT1JLRkxPV19VU0VfU1RFUFwiKV0oXCJzdGVwLy8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc3RlcHMvaGVscGVycy8vY29tcGxldGVSdW5TdGVwXCIpO1xuIiwgIi8qKlxuICogU0VPIEJsb2cgR2VuZXJhdGlvbiBXb3JrZmxvdyAtIFBoYXNlIDJDLUEvQlxuICogT3JjaGVzdHJhdGVzIG11bHRpLWFnZW50IGNvbnRlbnQgZ2VuZXJhdGlvbiBwaXBlbGluZVxuICogU3RlcCBmdW5jdGlvbnMgYXJlIGludm9rZWQgZGlyZWN0bHkgLSB0aGV5IGhhdmUgJ3VzZSBzdGVwJyBkaXJlY3RpdmVcbiAqIFxuICogRXJyb3IgaGFuZGxpbmcgZW5zdXJlcyBydW4gc3RhdGUgaXMgYWx3YXlzIHBlcnNpc3RlZDpcbiAqIC0gcXVldWVkIFx1MjE5MiBydW5uaW5nIFx1MjE5MiBjb21wbGV0ZWR8ZmFpbGVkXG4gKiAtIE5vIHJ1bnMgc3R1Y2sgaW4gcXVldWVkIHN0YXRlXG4gKi8gLy8gSW1wb3J0IHN0ZXAgZnVuY3Rpb25zICh0aGV5IGhhdmUgJ3VzZSBzdGVwJyBkaXJlY3RpdmUpXG5pbXBvcnQgeyBydW5SZXNlYXJjaFN0ZXAgfSBmcm9tICcuL3N0ZXBzL3Jlc2VhcmNoLXN0ZXAnO1xuaW1wb3J0IHsgcnVuT3V0bGluZVN0ZXAgfSBmcm9tICcuL3N0ZXBzL291dGxpbmUtc3RlcCc7XG5pbXBvcnQgeyBydW5Xcml0ZXJTdGVwIH0gZnJvbSAnLi9zdGVwcy93cml0ZXItc3RlcCc7XG5pbXBvcnQgeyBydW5TZW9RYVN0ZXAgfSBmcm9tICcuL3N0ZXBzL3Nlby1xYS1zdGVwJztcbmltcG9ydCB7IHJ1bkVkaXRvclN0ZXAgfSBmcm9tICcuL3N0ZXBzL2VkaXRvci1zdGVwJztcbmltcG9ydCB7IHJ1bk1ldGFTdGVwIH0gZnJvbSAnLi9zdGVwcy9tZXRhLXN0ZXAnO1xuaW1wb3J0IHsgbWFya1J1blJ1bm5pbmdTdGVwLCBtYXJrUnVuRmFpbGVkU3RlcCwgY29tcGxldGVSdW5TdGVwIH0gZnJvbSAnLi9zdGVwcy9oZWxwZXJzJztcbmltcG9ydCB7IHNlbmRDYWxsYmFja1N0ZXAgfSBmcm9tICcuL3N0ZXBzL2NhbGxiYWNrLXN0ZXAnO1xuLyoqX19pbnRlcm5hbF93b3JrZmxvd3N7XCJ3b3JrZmxvd3NcIjp7XCJsaWIvc2VvLWJsb2ctZW5naW5lL3dvcmtmbG93L3Nlby1ibG9nLXdvcmtmbG93LnRzXCI6e1wic2VvQmxvZ1dvcmtmbG93XCI6e1wid29ya2Zsb3dJZFwiOlwid29ya2Zsb3cvLy4vbGliL3Nlby1ibG9nLWVuZ2luZS93b3JrZmxvdy9zZW8tYmxvZy13b3JrZmxvdy8vc2VvQmxvZ1dvcmtmbG93XCJ9fX19Ki87XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2VvQmxvZ1dvcmtmbG93KHJ1bklkLCBpbnB1dCkge1xuICAgIGNvbnNvbGUubG9nKGBbdjBdIFNFTyBCbG9nIFdvcmtmbG93IHN0YXJ0ZWQgZm9yIHJ1biAke3J1bklkfWApO1xuICAgIHRyeSB7XG4gICAgICAgIC8vIE1hcmsgcnVuIGFzIHJ1bm5pbmcgKHRyYW5zaXRpb24gZnJvbSBxdWV1ZWQpXG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFdvcmtmbG93OiBNYXJraW5nIHJ1biBhcyBydW5uaW5nYCk7XG4gICAgICAgIGF3YWl0IG1hcmtSdW5SdW5uaW5nU3RlcChydW5JZCk7XG4gICAgICAgIC8vIFN0YWdlIDE6IFJlc2VhcmNoIC0gcnVucyBhcyBkdXJhYmxlIHN0ZXBcbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gU3RhZ2UgMTogUnVubmluZyByZXNlYXJjaCBzdGVwYCk7XG4gICAgICAgIGNvbnN0IHJlc2VhcmNoT3V0cHV0ID0gYXdhaXQgcnVuUmVzZWFyY2hTdGVwKHJ1bklkLCBpbnB1dCk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFN0YWdlIDE6IFJlc2VhcmNoIGNvbXBsZXRlZCBhbmQgcGVyc2lzdGVkYCk7XG4gICAgICAgIC8vIFN0YWdlIDI6IE91dGxpbmUgLSBydW5zIGFzIGR1cmFibGUgc3RlcFxuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBTdGFnZSAyOiBSdW5uaW5nIG91dGxpbmUgc3RlcGApO1xuICAgICAgICBjb25zdCBvdXRsaW5lT3V0cHV0ID0gYXdhaXQgcnVuT3V0bGluZVN0ZXAocnVuSWQsIGlucHV0LCByZXNlYXJjaE91dHB1dCk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFN0YWdlIDI6IE91dGxpbmUgY29tcGxldGVkIGFuZCBwZXJzaXN0ZWRgKTtcbiAgICAgICAgLy8gU3RhZ2UgMzogV3JpdGVyIC0gcnVucyBhcyBkdXJhYmxlIHN0ZXBcbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gU3RhZ2UgMzogUnVubmluZyB3cml0ZXIgc3RlcGApO1xuICAgICAgICBjb25zdCB3cml0ZXJPdXRwdXQgPSBhd2FpdCBydW5Xcml0ZXJTdGVwKHJ1bklkLCBpbnB1dCwgcmVzZWFyY2hPdXRwdXQsIG91dGxpbmVPdXRwdXQpO1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBTdGFnZSAzOiBXcml0ZXIgY29tcGxldGVkIGFuZCBwZXJzaXN0ZWRgKTtcbiAgICAgICAgLy8gU3RhZ2UgNDogU0VPIFFBIC0gcnVucyBhcyBkdXJhYmxlIHN0ZXBcbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gU3RhZ2UgNDogUnVubmluZyBTRU8gUUEgc3RlcGApO1xuICAgICAgICBjb25zdCBzZW9RYU91dHB1dCA9IGF3YWl0IHJ1blNlb1FhU3RlcChydW5JZCwgaW5wdXQsIHJlc2VhcmNoT3V0cHV0LCBvdXRsaW5lT3V0cHV0LCB3cml0ZXJPdXRwdXQuZHJhZnRfbWFya2Rvd24pO1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBTdGFnZSA0OiBTRU8gUUEgY29tcGxldGVkIGFuZCBwZXJzaXN0ZWRgKTtcbiAgICAgICAgLy8gU3RhZ2UgNTogRWRpdG9yIC0gcnVucyBhcyBkdXJhYmxlIHN0ZXBcbiAgICAgICAgY29uc29sZS5sb2coYFt2MF0gU3RhZ2UgNTogUnVubmluZyBlZGl0b3Igc3RlcGApO1xuICAgICAgICBjb25zdCBlZGl0b3JPdXRwdXQgPSBhd2FpdCBydW5FZGl0b3JTdGVwKHJ1bklkLCBpbnB1dCwgcmVzZWFyY2hPdXRwdXQsIG91dGxpbmVPdXRwdXQsIHdyaXRlck91dHB1dC5kcmFmdF9tYXJrZG93biwgc2VvUWFPdXRwdXQpO1xuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBTdGFnZSA1OiBFZGl0b3IgY29tcGxldGVkYCk7XG4gICAgICAgIC8vIFN0YWdlIDY6IE1ldGEgLSBydW5zIGFzIGR1cmFibGUgc3RlcFxuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBTdGFnZSA2OiBSdW5uaW5nIG1ldGEgc3RlcGApO1xuICAgICAgICBjb25zdCBtZXRhT3V0cHV0ID0gYXdhaXQgcnVuTWV0YVN0ZXAocnVuSWQsIGlucHV0LCByZXNlYXJjaE91dHB1dCwgb3V0bGluZU91dHB1dCwgd3JpdGVyT3V0cHV0LmRyYWZ0X21hcmtkb3duLCBzZW9RYU91dHB1dCwgZWRpdG9yT3V0cHV0LmVkaXRlZF9kcmFmdF9tYXJrZG93bik7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFN0YWdlIDY6IE1ldGEgY29tcGxldGVkYCk7XG4gICAgICAgIC8vIENvbXBsZXRlOiBNYXJrIHdvcmtmbG93IGFzIGRvbmUgd2l0aCBodW1hbiByZXZpZXcgcmVxdWlyZWQgKGFmdGVyIGFsbCBzdGFnZXMpXG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFdvcmtmbG93OiBDb21wbGV0aW5nIHJ1bmApO1xuICAgICAgICBjb25zdCBmaW5hbE91dHB1dCA9IHtcbiAgICAgICAgICAgIHJlc2VhcmNoX2pzb246IHJlc2VhcmNoT3V0cHV0LFxuICAgICAgICAgICAgb3V0bGluZV9qc29uOiBvdXRsaW5lT3V0cHV0LFxuICAgICAgICAgICAgZHJhZnRfbWFya2Rvd246IHdyaXRlck91dHB1dC5kcmFmdF9tYXJrZG93bixcbiAgICAgICAgICAgIHNlb19xYV9qc29uOiBzZW9RYU91dHB1dCxcbiAgICAgICAgICAgIGVkaXRlZF9kcmFmdF9tYXJrZG93bjogZWRpdG9yT3V0cHV0LmVkaXRlZF9kcmFmdF9tYXJrZG93bixcbiAgICAgICAgICAgIGVkaXRvcl9ub3RlczogZWRpdG9yT3V0cHV0LmVkaXRvcl9ub3RlcyxcbiAgICAgICAgICAgIGNoYW5nZXNfbWFkZTogZWRpdG9yT3V0cHV0LmNoYW5nZXNfbWFkZSxcbiAgICAgICAgICAgIG1ldGFfanNvbjogbWV0YU91dHB1dCxcbiAgICAgICAgICAgIGh1bWFuX3Jldmlld19yZXF1aXJlZDogdHJ1ZSxcbiAgICAgICAgICAgIHdvcmtmbG93X3N0YXR1czogJ21ldGFfY29tcGxldGVfYXdhaXRpbmdfcmV2aWV3JyxcbiAgICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICAgIH07XG4gICAgICAgIGF3YWl0IGNvbXBsZXRlUnVuU3RlcChydW5JZCwgZmluYWxPdXRwdXQpO1xuICAgICAgICAvLyBTZW5kIGNvbXBsZXRpb24gY2FsbGJhY2sgKG9yY2hlc3RyYXRvciBsZXZlbCwgbm90IGZyb20gaGVscGVyIHN0ZXApXG4gICAgICAgIC8vIENhbGxiYWNrIGRlbGl2ZXJ5IGZhaWx1cmVzIGRvIG5vdCBmYWlsIHRoZSBjb21wbGV0ZWQgcnVuXG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFdvcmtmbG93OiBTZW5kaW5nIGNvbXBsZXRpb24gY2FsbGJhY2tgKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHNlbmRDYWxsYmFja1N0ZXAocnVuSWQpO1xuICAgICAgICB9IGNhdGNoIChjYWxsYmFja0Vycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW3YwXSBXb3JrZmxvdzogQ2FsbGJhY2sgZGVsaXZlcnkgZmFpbGVkOmAsIGNhbGxiYWNrRXJyIGluc3RhbmNlb2YgRXJyb3IgPyBjYWxsYmFja0Vyci5tZXNzYWdlIDogU3RyaW5nKGNhbGxiYWNrRXJyKSk7XG4gICAgICAgIC8vIENhbGxiYWNrIGZhaWx1cmUgZG9lcyBub3QgZmFpbCB0aGUgd29ya2Zsb3dcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhgW3YwXSBTRU8gQmxvZyBXb3JrZmxvdyBjb21wbGV0ZWQgc3VjY2Vzc2Z1bGx5IGZvciBydW4gJHtydW5JZH1gKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYFt2MF0gV29ya2Zsb3cgZXJyb3IgZm9yIHJ1biAke3J1bklkfTogJHtlcnJvck1lc3NhZ2V9YCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBtYXJrUnVuRmFpbGVkU3RlcChydW5JZCwgZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgfSBjYXRjaCAoZmFpbHVyZUVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW3YwXSBGYWlsZWQgdG8gbWFyayBydW4gYXMgZmFpbGVkOmAsIGZhaWx1cmVFcnIgaW5zdGFuY2VvZiBFcnJvciA/IGZhaWx1cmVFcnIubWVzc2FnZSA6IFN0cmluZyhmYWlsdXJlRXJyKSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gU2VuZCBmYWlsdXJlIGNhbGxiYWNrIChvcmNoZXN0cmF0b3IgbGV2ZWwsIG5vdCBmcm9tIGhlbHBlciBzdGVwKVxuICAgICAgICAvLyBDYWxsYmFjayBkZWxpdmVyeSBmYWlsdXJlcyBkbyBub3QgY2hhbmdlIHRoZSBmYWlsZWQgc3RhdHVzXG4gICAgICAgIGNvbnNvbGUubG9nKGBbdjBdIFdvcmtmbG93OiBTZW5kaW5nIGZhaWx1cmUgY2FsbGJhY2tgKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHNlbmRDYWxsYmFja1N0ZXAocnVuSWQpO1xuICAgICAgICB9IGNhdGNoIChjYWxsYmFja0Vycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW3YwXSBXb3JrZmxvdzogQ2FsbGJhY2sgZGVsaXZlcnkgZmFpbGVkOmAsIGNhbGxiYWNrRXJyIGluc3RhbmNlb2YgRXJyb3IgPyBjYWxsYmFja0Vyci5tZXNzYWdlIDogU3RyaW5nKGNhbGxiYWNrRXJyKSk7XG4gICAgICAgIC8vIENhbGxiYWNrIGZhaWx1cmUgZG9lcyBub3QgY2hhbmdlIHRoZSBmYWlsZWQgc3RhdHVzXG4gICAgICAgIH1cbiAgICAgICAgLy8gUmUtdGhyb3cgdG8gZW5zdXJlIHdvcmtmbG93IGZhaWx1cmUgaXMgcmVjb3JkZWRcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxufVxuc2VvQmxvZ1dvcmtmbG93LndvcmtmbG93SWQgPSBcIndvcmtmbG93Ly8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc2VvLWJsb2ctd29ya2Zsb3cvL3Nlb0Jsb2dXb3JrZmxvd1wiO1xuZ2xvYmFsVGhpcy5fX3ByaXZhdGVfd29ya2Zsb3dzLnNldChcIndvcmtmbG93Ly8uL2xpYi9zZW8tYmxvZy1lbmdpbmUvd29ya2Zsb3cvc2VvLWJsb2ctd29ya2Zsb3cvL3Nlb0Jsb2dXb3JrZmxvd1wiLCBzZW9CbG9nV29ya2Zsb3cpO1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7O0FBV1csSUFBSSxtQkFBbUIsV0FBVyx1QkFBTyxJQUFJLG1CQUFtQixDQUFDLEVBQUUsNEVBQTRFOzs7QUNKL0ksSUFBSSxrQkFBa0IsV0FBVyx1QkFBTyxJQUFJLG1CQUFtQixDQUFDLEVBQUUsMkVBQTJFOzs7QUNGN0ksSUFBSSx3QkFBd0IsV0FBVyx1QkFBTyxJQUFJLG1CQUFtQixDQUFDLEVBQUUsb0ZBQW9GO0FBSTVKLElBQUksNkJBQTZCLFdBQVcsdUJBQU8sSUFBSSxtQkFBbUIsQ0FBQyxFQUFFLHlGQUF5RjtBQUl0SyxJQUFJLGlDQUFpQyxXQUFXLHVCQUFPLElBQUksbUJBQW1CLENBQUMsRUFBRSw2RkFBNkY7OztBQ0pyTCxlQUFzQixpQkFBaUIsU0FBUztBQUNoRCxVQUFRLElBQUksMENBQTBDLFFBQVEsTUFBTSxXQUFXLFFBQVEsYUFBYSxFQUFFO0FBQ3RHLE1BQUk7QUFFQSxRQUFJLENBQUMsUUFBUSxRQUFRO0FBQ2pCLFlBQU0sSUFBSSxNQUFNLG9CQUFvQjtBQUFBLElBQ3hDO0FBQ0EsUUFBSSxDQUFDLFFBQVEsZUFBZTtBQUN4QixZQUFNLElBQUksTUFBTSwyQkFBMkI7QUFBQSxJQUMvQztBQUNBLFFBQUksQ0FBQyxRQUFRLGdCQUFnQjtBQUN6QixZQUFNLElBQUksTUFBTSw0QkFBNEI7QUFBQSxJQUNoRDtBQUNBLFFBQUksQ0FBQyxRQUFRLG1CQUFtQjtBQUM1QixZQUFNLElBQUksTUFBTSwrQkFBK0I7QUFBQSxJQUNuRDtBQUVBLFlBQVEsSUFBSSx3Q0FBd0MsUUFBUSxNQUFNLEVBQUU7QUFDcEUsVUFBTSxNQUFNLE1BQU0sc0JBQXNCLFFBQVEsTUFBTTtBQUN0RCxRQUFJLENBQUMsS0FBSztBQUNOLFlBQU0sSUFBSSxNQUFNLGtCQUFrQixRQUFRLE1BQU0sRUFBRTtBQUFBLElBQ3REO0FBRUEsUUFBSSxJQUFJLFdBQVcsYUFBYTtBQUM1QixZQUFNLElBQUksTUFBTSxrQkFBa0IsSUFBSSxNQUFNLG9EQUFvRDtBQUFBLElBQ3BHO0FBQ0EsUUFBSSxDQUFDLElBQUksbUJBQW1CO0FBQ3hCLFlBQU0sSUFBSSxNQUFNLDZDQUE2QyxJQUFJLE1BQU0sRUFBRTtBQUFBLElBQzdFO0FBTUEsVUFBTSxjQUFjLElBQUk7QUFDeEIsUUFBSSxlQUFlLFFBQVEsMEJBQTBCLElBQUksb0JBQW9CLFlBQVkseUJBQXlCLFlBQVksa0JBQWtCLElBQUk7QUFDcEosUUFBSSxDQUFDLGdCQUFnQixPQUFPLGlCQUFpQixVQUFVO0FBQ25ELFlBQU0sSUFBSSxNQUFNLDBFQUEwRTtBQUFBLElBQzlGO0FBRUEsbUJBQWUsYUFBYSxLQUFLO0FBQ2pDLFFBQUksQ0FBQyxnQkFBZ0IsYUFBYSxXQUFXLEdBQUc7QUFDNUMsWUFBTSxJQUFJLE1BQU0seUNBQXlDO0FBQUEsSUFDN0Q7QUFDQSxZQUFRLElBQUksaURBQWlELGFBQWEsTUFBTSxRQUFRO0FBR3hGLFVBQU0sbUJBQW1CO0FBQUEsTUFDckI7QUFBQSxRQUNJLEtBQUs7QUFBQSxRQUNMLE9BQU87QUFBQSxNQUNYO0FBQUEsTUFDQTtBQUFBLFFBQ0ksS0FBSztBQUFBLFFBQ0wsT0FBTztBQUFBLE1BQ1g7QUFBQSxNQUNBO0FBQUEsUUFDSSxLQUFLO0FBQUEsUUFDTCxPQUFPO0FBQUEsTUFDWDtBQUFBLE1BQ0E7QUFBQSxRQUNJLEtBQUs7QUFBQSxRQUNMLE9BQU87QUFBQSxNQUNYO0FBQUEsTUFDQTtBQUFBLFFBQ0ksS0FBSztBQUFBLFFBQ0wsT0FBTztBQUFBLE1BQ1g7QUFBQSxNQUNBO0FBQUEsUUFDSSxLQUFLO0FBQUEsUUFDTCxPQUFPO0FBQUEsTUFDWDtBQUFBLE1BQ0E7QUFBQSxRQUNJLEtBQUs7QUFBQSxRQUNMLE9BQU87QUFBQSxNQUNYO0FBQUEsTUFDQTtBQUFBLFFBQ0ksS0FBSztBQUFBLFFBQ0wsT0FBTztBQUFBLE1BQ1g7QUFBQSxNQUNBO0FBQUEsUUFDSSxLQUFLO0FBQUEsUUFDTCxPQUFPO0FBQUEsTUFDWDtBQUFBLE1BQ0E7QUFBQSxRQUNJLEtBQUs7QUFBQSxRQUNMLE9BQU87QUFBQSxNQUNYO0FBQUEsSUFDSjtBQUNBLFVBQU0sZ0JBQWdCLENBQUM7QUFDdkIsVUFBTSxnQkFBZ0Isb0JBQUksSUFBSTtBQUU5QixlQUFXLEVBQUUsS0FBSyxNQUFNLEtBQUssa0JBQWlCO0FBQzFDLFlBQU0sUUFBUSxRQUFRLGtCQUFrQixHQUFHO0FBQzNDLFVBQUksU0FBUyxPQUFPLFVBQVUsVUFBVTtBQUNwQyxjQUFNLGVBQWUsTUFBTSxLQUFLO0FBQ2hDLFlBQUksY0FBYztBQUNkLHdCQUFjLEtBQUssR0FBRyxLQUFLO0FBQUEsRUFBTSxZQUFZLEVBQUU7QUFDL0Msd0JBQWMsSUFBSSxHQUFHO0FBQUEsUUFDekI7QUFBQSxNQUNKO0FBQUEsSUFDSjtBQUVBLGVBQVcsQ0FBQyxLQUFLLEtBQUssS0FBSyxPQUFPLFFBQVEsUUFBUSxpQkFBaUIsR0FBRTtBQUNqRSxVQUFJLENBQUMsY0FBYyxJQUFJLEdBQUcsS0FBSyxTQUFTLE9BQU8sVUFBVSxVQUFVO0FBQy9ELGNBQU0sZUFBZSxNQUFNLEtBQUs7QUFDaEMsWUFBSSxjQUFjO0FBRWQsZ0JBQU0sUUFBUSxJQUFJLE1BQU0sR0FBRyxFQUFFLElBQUksQ0FBQyxTQUFPLEtBQUssT0FBTyxDQUFDLEVBQUUsWUFBWSxJQUFJLEtBQUssTUFBTSxDQUFDLENBQUMsRUFBRSxLQUFLLEdBQUc7QUFDL0Ysd0JBQWMsS0FBSyxHQUFHLEtBQUs7QUFBQSxFQUFNLFlBQVksRUFBRTtBQUFBLFFBQ25EO0FBQUEsTUFDSjtBQUFBLElBQ0o7QUFDQSxRQUFJLG1CQUFtQixjQUFjLEtBQUssTUFBTSxFQUFFLEtBQUs7QUFDdkQsUUFBSSxDQUFDLG9CQUFvQixpQkFBaUIsV0FBVyxHQUFHO0FBQ3BELFlBQU0sSUFBSSxNQUFNLHFGQUFxRjtBQUFBLElBQ3pHO0FBQ0EsWUFBUSxJQUFJLHFEQUFxRCxpQkFBaUIsTUFBTSxRQUFRO0FBRWhHLFVBQU0sUUFBUSxJQUFJLGNBQWMsT0FBTyxJQUFJLGVBQWUsV0FBVyxJQUFJLGFBQWE7QUFDdEYsVUFBTSxXQUFXLFlBQVksaUJBQWlCO0FBQzlDLFVBQU0sVUFBVSxZQUFZLGdCQUFnQjtBQUM1QyxVQUFNLFFBQVEsWUFBWSxlQUFlO0FBQ3pDLFVBQU0sT0FBTyxZQUFZLGFBQWE7QUFFdEMsWUFBUSxJQUFJLCtDQUErQztBQUMzRCxVQUFNLGlCQUFpQixNQUFNLGdCQUFnQixjQUFjLGtCQUFrQixRQUFRLGVBQWUsT0FBTyxVQUFVLFNBQVMsT0FBTyxJQUFJO0FBQ3pJLFlBQVEsSUFBSSx1RUFBdUUsZUFBZSxpQkFBaUIsTUFBTSxRQUFRO0FBR2pJLFVBQU0sc0JBQXNCLFlBQVksaUJBQWlCLGdCQUFnQixRQUFRLGdCQUFnQjtBQUNqRyxVQUFNLGlCQUFpQixzQkFBc0I7QUFDN0MsVUFBTSx5QkFBeUI7QUFBQSxNQUMzQixlQUFlO0FBQUEsTUFDZixjQUFjO0FBQUEsTUFDZCx1QkFBdUI7QUFBQSxNQUN2QixlQUFlLFFBQVE7QUFBQSxNQUN2QixnQkFBZ0IsUUFBUTtBQUFBLE1BQ3hCLGFBQVksb0JBQUksS0FBSyxHQUFFLFlBQVk7QUFBQSxJQUN2QztBQUNBLFlBQVEsSUFBSSxzRUFBc0UsY0FBYyxFQUFFO0FBRWxHLFVBQU0sMkJBQTJCLFFBQVEsUUFBUSxlQUFlLGtCQUFrQixzQkFBc0I7QUFDeEcsWUFBUSxJQUFJLG9FQUFvRTtBQUVoRixVQUFNLFVBQVUsSUFBSSx3QkFBd0IsUUFBUTtBQUNwRCxRQUFJLFNBQVM7QUFDVCxjQUFRLElBQUkseUVBQXlFLE9BQU8sRUFBRTtBQUM5RixZQUFNLGNBQWMsTUFBTSwrQkFBK0IsT0FBTztBQUNoRSxVQUFJLENBQUMsWUFBWSxJQUFJO0FBQ2pCLGdCQUFRLE1BQU0saUVBQWlFLFlBQVksS0FBSyxxREFBcUQ7QUFBQSxNQUN6SixXQUFXLENBQUMsWUFBWSxTQUFTO0FBQzdCLGdCQUFRLElBQUksNERBQTREO0FBQUEsTUFDNUU7QUFBQSxJQUNKO0FBRUEsWUFBUSxJQUFJLDJEQUEyRDtBQUN2RSxVQUFNLGlCQUFpQixRQUFRLFFBQVE7QUFBQSxNQUNuQyxZQUFZO0FBQUEsTUFDWixnQkFBZ0I7QUFBQSxJQUNwQixDQUFDO0FBQ0QsWUFBUSxJQUFJLDRDQUE0QyxRQUFRLE1BQU0sRUFBRTtBQUFBLEVBQzVFLFNBQVMsT0FBTztBQUNaLFVBQU0sZUFBZSxpQkFBaUIsUUFBUSxNQUFNLFVBQVUsT0FBTyxLQUFLO0FBQzFFLFlBQVEsTUFBTSxpQ0FBaUMsWUFBWSxFQUFFO0FBQzdELFVBQU07QUFBQSxFQUNWO0FBQ0o7QUF2SzBCO0FBd0sxQixpQkFBaUIsYUFBYTtBQUM5QixXQUFXLG9CQUFvQixJQUFJLGdGQUFnRixnQkFBZ0I7OztBQzNLeEgsSUFBSSxrQkFBa0IsV0FBVyx1QkFBTyxJQUFJLG1CQUFtQixDQUFDLEVBQUUsMkVBQTJFOzs7QUNBN0ksSUFBSSxpQkFBaUIsV0FBVyx1QkFBTyxJQUFJLG1CQUFtQixDQUFDLEVBQUUseUVBQXlFOzs7QUNBMUksSUFBSSxnQkFBZ0IsV0FBVyx1QkFBTyxJQUFJLG1CQUFtQixDQUFDLEVBQUUsdUVBQXVFOzs7QUNEdkksSUFBSSxlQUFlLFdBQVcsdUJBQU8sSUFBSSxtQkFBbUIsQ0FBQyxFQUFFLHNFQUFzRTs7O0FDQ3JJLElBQUksZ0JBQWdCLFdBQVcsdUJBQU8sSUFBSSxtQkFBbUIsQ0FBQyxFQUFFLHVFQUF1RTs7O0FDQXZJLElBQUksY0FBYyxXQUFXLHVCQUFPLElBQUksbUJBQW1CLENBQUMsRUFBRSxtRUFBbUU7OztBQ0hqSSxJQUFJLHFCQUFxQixXQUFXLHVCQUFPLElBQUksbUJBQW1CLENBQUMsRUFBRSx3RUFBd0U7QUFJN0ksSUFBSSxvQkFBb0IsV0FBVyx1QkFBTyxJQUFJLG1CQUFtQixDQUFDLEVBQUUsdUVBQXVFO0FBSTNJLElBQUksa0JBQWtCLFdBQVcsdUJBQU8sSUFBSSxtQkFBbUIsQ0FBQyxFQUFFLHFFQUFxRTs7O0FDTWxKLGVBQXNCLGdCQUFnQixPQUFPLE9BQU87QUFDaEQsVUFBUSxJQUFJLDBDQUEwQyxLQUFLLEVBQUU7QUFDN0QsTUFBSTtBQUVBLFlBQVEsSUFBSSx1Q0FBdUM7QUFDbkQsVUFBTSxtQkFBbUIsS0FBSztBQUU5QixZQUFRLElBQUkscUNBQXFDO0FBQ2pELFVBQU0saUJBQWlCLE1BQU0sZ0JBQWdCLE9BQU8sS0FBSztBQUN6RCxZQUFRLElBQUksZ0RBQWdEO0FBRTVELFlBQVEsSUFBSSxvQ0FBb0M7QUFDaEQsVUFBTSxnQkFBZ0IsTUFBTSxlQUFlLE9BQU8sT0FBTyxjQUFjO0FBQ3ZFLFlBQVEsSUFBSSwrQ0FBK0M7QUFFM0QsWUFBUSxJQUFJLG1DQUFtQztBQUMvQyxVQUFNLGVBQWUsTUFBTSxjQUFjLE9BQU8sT0FBTyxnQkFBZ0IsYUFBYTtBQUNwRixZQUFRLElBQUksOENBQThDO0FBRTFELFlBQVEsSUFBSSxtQ0FBbUM7QUFDL0MsVUFBTSxjQUFjLE1BQU0sYUFBYSxPQUFPLE9BQU8sZ0JBQWdCLGVBQWUsYUFBYSxjQUFjO0FBQy9HLFlBQVEsSUFBSSw4Q0FBOEM7QUFFMUQsWUFBUSxJQUFJLG1DQUFtQztBQUMvQyxVQUFNLGVBQWUsTUFBTSxjQUFjLE9BQU8sT0FBTyxnQkFBZ0IsZUFBZSxhQUFhLGdCQUFnQixXQUFXO0FBQzlILFlBQVEsSUFBSSxnQ0FBZ0M7QUFFNUMsWUFBUSxJQUFJLGlDQUFpQztBQUM3QyxVQUFNLGFBQWEsTUFBTSxZQUFZLE9BQU8sT0FBTyxnQkFBZ0IsZUFBZSxhQUFhLGdCQUFnQixhQUFhLGFBQWEscUJBQXFCO0FBQzlKLFlBQVEsSUFBSSw4QkFBOEI7QUFFMUMsWUFBUSxJQUFJLCtCQUErQjtBQUMzQyxVQUFNLGNBQWM7QUFBQSxNQUNoQixlQUFlO0FBQUEsTUFDZixjQUFjO0FBQUEsTUFDZCxnQkFBZ0IsYUFBYTtBQUFBLE1BQzdCLGFBQWE7QUFBQSxNQUNiLHVCQUF1QixhQUFhO0FBQUEsTUFDcEMsY0FBYyxhQUFhO0FBQUEsTUFDM0IsY0FBYyxhQUFhO0FBQUEsTUFDM0IsV0FBVztBQUFBLE1BQ1gsdUJBQXVCO0FBQUEsTUFDdkIsaUJBQWlCO0FBQUEsTUFDakIsWUFBVyxvQkFBSSxLQUFLLEdBQUUsWUFBWTtBQUFBLElBQ3RDO0FBQ0EsVUFBTSxnQkFBZ0IsT0FBTyxXQUFXO0FBR3hDLFlBQVEsSUFBSSw0Q0FBNEM7QUFDeEQsUUFBSTtBQUNBLFlBQU0saUJBQWlCLEtBQUs7QUFBQSxJQUNoQyxTQUFTLGFBQWE7QUFDbEIsY0FBUSxNQUFNLDRDQUE0Qyx1QkFBdUIsUUFBUSxZQUFZLFVBQVUsT0FBTyxXQUFXLENBQUM7QUFBQSxJQUV0STtBQUNBLFlBQVEsSUFBSSx5REFBeUQsS0FBSyxFQUFFO0FBQUEsRUFDaEYsU0FBUyxPQUFPO0FBQ1osVUFBTSxlQUFlLGlCQUFpQixRQUFRLE1BQU0sVUFBVSxPQUFPLEtBQUs7QUFDMUUsWUFBUSxNQUFNLCtCQUErQixLQUFLLEtBQUssWUFBWSxFQUFFO0FBQ3JFLFFBQUk7QUFDQSxZQUFNLGtCQUFrQixPQUFPLFlBQVk7QUFBQSxJQUMvQyxTQUFTLFlBQVk7QUFDakIsY0FBUSxNQUFNLHNDQUFzQyxzQkFBc0IsUUFBUSxXQUFXLFVBQVUsT0FBTyxVQUFVLENBQUM7QUFBQSxJQUM3SDtBQUdBLFlBQVEsSUFBSSx5Q0FBeUM7QUFDckQsUUFBSTtBQUNBLFlBQU0saUJBQWlCLEtBQUs7QUFBQSxJQUNoQyxTQUFTLGFBQWE7QUFDbEIsY0FBUSxNQUFNLDRDQUE0Qyx1QkFBdUIsUUFBUSxZQUFZLFVBQVUsT0FBTyxXQUFXLENBQUM7QUFBQSxJQUV0STtBQUVBLFVBQU07QUFBQSxFQUNWO0FBQ0o7QUE1RXNCO0FBNkV0QixnQkFBZ0IsYUFBYTtBQUM3QixXQUFXLG9CQUFvQixJQUFJLCtFQUErRSxlQUFlOyIsCiAgIm5hbWVzIjogW10KfQo=
`;

const handler = workflowEntrypoint(workflowCode);

export const HEAD = handler;
export const POST = handler;
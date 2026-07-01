'use workflow';

import { getRun, updateRevisionAndDraft } from '../storage/runs';
import { sendCallbackStep } from './steps/callback-step';
import { runRevisionStep } from './steps/revision-step';
import { query } from '../storage/db';

/**
 * Revision Request Data Structure
 */
export interface RevisionRequest {
  run_id: string;
  revision_mode: 'moderate_revision' | 'heavy_revision';
  reviewer_email: string;
  reviewer_feedback: {
    requested_changes: string;
    top_priority_fix?: string;
    second_priority_fix?: string;
    preserve_notes?: string;
    risk_notes?: string;
  };
  smc_content_batch_id?: string;
  order_id?: string;
  review_round?: number;
  current_draft_markdown?: string;
  source?: string;
}

/**
 * SEO Blog Revision Workflow
 * Handles revisions to completed blog runs after human review.
 * Does NOT change seo_blog_runs.status (stays "completed").
 * Keeps revision state in final_output_json.internal_review and revised_markdown column.
 */
export async function revisionWorkflow(request: RevisionRequest): Promise<void> {
  console.log(
    `[v0] Revision Workflow started for run ${request.run_id}, mode: ${request.revision_mode}`
  );

  try {
    // Validate request
    if (!request.run_id) {
      throw new Error('run_id is required');
    }

    if (!request.revision_mode) {
      throw new Error('revision_mode is required');
    }

    if (!request.reviewer_email) {
      throw new Error('reviewer_email is required');
    }

    if (!request.reviewer_feedback) {
      throw new Error('reviewer_feedback is required');
    }

    // Fetch the existing run
    console.log(`[v0] Revision Workflow: Fetching run ${request.run_id}`);
    const run = await getRun(request.run_id);

    if (!run) {
      throw new Error(`Run not found: ${request.run_id}`);
    }

    // Validate run is completed
    if (run.status !== 'completed') {
      throw new Error(
        `Run status is "${run.status}", not "completed". Cannot revise incomplete runs.`
      );
    }

    if (!run.final_output_json) {
      throw new Error(
        `Run has no final_output_json. Run status: ${run.status}`
      );
    }

    // Get the latest draft markdown with priority:
    // 1. request.current_draft_markdown (if provided)
    // 2. run.final_output_json.edited_draft_markdown
    // 3. run.final_output_json.draft_markdown
    // 4. run.draft_markdown
    const finalOutput = run.final_output_json as Record<string, any>;
    let currentDraft =
      request.current_draft_markdown ||
      finalOutput.edited_draft_markdown ||
      finalOutput.draft_markdown ||
      (run as Record<string, any>).draft_markdown;

    if (!currentDraft || typeof currentDraft !== 'string') {
      throw new Error(
        'No draft markdown found in run or request. Cannot proceed with revision.'
      );
    }

    // Trim and validate draft
    currentDraft = currentDraft.trim();
    if (!currentDraft || currentDraft.length === 0) {
      throw new Error('Draft markdown is empty after trimming.');
    }

    console.log(
      `[v0] Revision Workflow: Current draft length: ${currentDraft.length} chars`
    );

    // Build reviewer feedback string
    const feedbackParts: string[] = [];

    if (request.reviewer_feedback.requested_changes) {
      feedbackParts.push(
        `Main Feedback:\n${request.reviewer_feedback.requested_changes}`
      );
    }

    if (request.reviewer_feedback.top_priority_fix) {
      feedbackParts.push(
        `Top Priority Fix:\n${request.reviewer_feedback.top_priority_fix}`
      );
    }

    if (request.reviewer_feedback.second_priority_fix) {
      feedbackParts.push(
        `Second Priority Fix:\n${request.reviewer_feedback.second_priority_fix}`
      );
    }

    if (request.reviewer_feedback.preserve_notes) {
      feedbackParts.push(
        `Keep the following:\n${request.reviewer_feedback.preserve_notes}`
      );
    }

    if (request.reviewer_feedback.risk_notes) {
      feedbackParts.push(
        `Be careful with:\n${request.reviewer_feedback.risk_notes}`
      );
    }

    let reviewerFeedback = feedbackParts.join('\n\n').trim();

    if (!reviewerFeedback || reviewerFeedback.length === 0) {
      throw new Error(
        'Reviewer feedback is empty after trimming. At least one feedback field is required.'
      );
    }

    console.log(
      `[v0] Revision Workflow: Reviewer feedback length: ${reviewerFeedback.length} chars`
    );

    // Extract context for revision step
    const input =
      (run.input_json as Record<string, any>) ||
      (typeof run.input_json === 'object' ? run.input_json : undefined);
    const research = finalOutput.research_json || undefined;
    const outline = finalOutput.outline_json || undefined;
    const seoQa = finalOutput.seo_qa_json || undefined;
    const meta = finalOutput.meta_json || undefined;

    // Call revision step (runs LLM, returns revised markdown)
    console.log(`[v0] Revision Workflow: Calling revision step`);
    const revisionOutput = await runRevisionStep(
      currentDraft,
      reviewerFeedback,
      request.revision_mode,
      input,
      research,
      outline,
      seoQa,
      meta
    );

    console.log(
      `[v0] Revision Workflow: Revision complete. Revised markdown length: ${revisionOutput.revised_markdown.length} chars`
    );

    // Prepare internal review metadata
    // Review round priority: finalOutput.internal_review?.review_round, then request.review_round, then 1
    const previousReviewRound =
      (finalOutput.internal_review?.review_round as number) ||
      request.review_round ||
      1;
    const newReviewRound = previousReviewRound + 1;

    const internalReviewMetadata = {
      review_status: 'revised_review_pending',
      review_round: newReviewRound,
      previous_review_round: previousReviewRound,
      revision_mode: request.revision_mode,
      reviewer_email: request.reviewer_email,
      updated_at: new Date().toISOString(),
    };

    console.log(
      `[v0] Revision Workflow: Saving revision to database. Review round: ${newReviewRound}`
    );

    // Save revision to database (updates both revised_markdown and final_output_json.edited_draft_markdown)
    await updateRevisionAndDraft(
      request.run_id,
      revisionOutput.revised_markdown,
      internalReviewMetadata
    );

    console.log(
      `[v0] Revision Workflow: Revision saved. Status remains "completed"`
    );

    // Update smc_content_batches status if batch_id exists
    const batchId = run.smc_content_batch_id || request.smc_content_batch_id;
    if (batchId) {
      try {
        console.log(
          `[v0] Revision Workflow: Updating smc_content_batches status for batch ${batchId}`
        );

        await query(
          `UPDATE smc_content_batches SET status = $1, updated_at = NOW() WHERE id = $2`,
          ['blog_revised_review_pending', batchId]
        );

        console.log(
          `[v0] Revision Workflow: smc_content_batches status updated`
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error(
          `[v0] Revision Workflow: Failed to update smc_content_batches: ${errorMessage}. Revision is preserved - proceeding with callback.`
        );
        // Do NOT rethrow - revision is already saved
      }
    }

    // Send callback notification to n8n with draft_event signal
    console.log(`[v0] Revision Workflow: Sending callback with draft_event`);
    await sendCallbackStep(request.run_id, {
      draftEvent: 'revised_draft_ready',
      compactPayload: true,
    });

    console.log(
      `[v0] Revision Workflow: Complete for run ${request.run_id}`
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[v0] Revision Workflow error: ${errorMessage}`);
    throw error;
  }
}

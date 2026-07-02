'use step';

import 'server-only';
import { getRun, recordCallbackAttempt } from '../../storage/runs';

/**
 * Callback options for controlling payload format
 */
export interface CallbackOptions {
  draftEvent?: string;
  compactPayload?: boolean;
}

/**
 * Send callback notification to webhook URL
 * Runs as a durable step to ensure callback delivery is tracked
 * Failures do not break the main workflow
 *
 * @param runId - The run ID to send callback for
 * @param options - Optional callback options
 *   - draftEvent: Event identifier (e.g., "revised_draft_ready")
 *   - compactPayload: If true, omit full final_output_json to reduce payload size
 */
export async function sendCallbackStep(runId: string, options?: CallbackOptions): Promise<void> {
  try {
    // Fetch run to get callback URL and final state
    const run = await getRun(runId);
    if (!run) {
      console.warn(`[v0] Callback: Run ${runId} not found`);
      return;
    }

    if (!run.callback_url) {
      console.log(`[v0] Callback: No callback URL for run ${runId}`);
      // Record that callback was not configured
      await recordCallbackAttempt(runId, 'not_configured');
      return;
    }

    console.log(`[v0] Callback: Sending notification to ${run.callback_url}`);

    // Build callback payload
    const callbackPayload = buildCallbackPayload(run, options);

    // Send callback with timeout protection
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch(run.callback_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(callbackPayload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        console.log(`[v0] Callback: Successfully sent for run ${runId}, status ${response.status}`);
        // Record successful callback
        await recordCallbackAttempt(runId, 'success', response.status);
      } else {
        const statusText = response.statusText || `HTTP ${response.status}`;
        console.warn(
          `[v0] Callback: Webhook returned ${response.status} for run ${runId}`
        );
        // Record failed callback with HTTP status
        const errorMsg = `Webhook returned ${response.status}: ${statusText}`;
        await recordCallbackAttempt(runId, 'failed', response.status, errorMsg);
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);

      let errorMessage = 'Unknown network error';
      if (fetchError instanceof Error) {
        if (fetchError.name === 'AbortError') {
          errorMessage = 'Request timeout (30s)';
          console.warn(`[v0] Callback: Request timeout (30s) for run ${runId}`);
        } else {
          errorMessage = `Network error: ${fetchError.message}`;
          console.warn(`[v0] Callback: ${errorMessage} for run ${runId}`);
        }
      } else {
        console.warn(`[v0] Callback: Unknown error for run ${runId}`);
      }
      // Record failed callback with error message (no HTTP status for network errors)
      await recordCallbackAttempt(runId, 'failed', undefined, errorMessage);
      // Don't throw - callback failure should not fail the workflow
    }
  } catch (error) {
    // Log error safely without exposing secrets
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[v0] Callback: Unexpected error for run ${runId}: ${errorMsg}`);
    // Don't throw - callback failure should not fail the workflow
  }
}

/**
 * Build callback payload based on run status and options
 */
function buildCallbackPayload(run: any, options?: CallbackOptions): Record<string, unknown> {
  const isCompleted = run.status === 'completed';
  const isFailed = run.status === 'failed';
  const compactPayload = options?.compactPayload === true;

  if (isCompleted) {
    // Base payload for completed runs
    const payload: Record<string, unknown> = {
      run_id: run.id,
      status: 'completed',
      business_name: run.input_json?.business_name || null,
      blog_topic: run.input_json?.blog_topic || run.input_json?.topic || null,
      review_ready: true,
      human_review_required: true,
    };

    // Add draft_event if provided
    if (options?.draftEvent) {
      payload.draft_event = options.draftEvent;
    }

    // Extract review_round from internal_review if available
    const internalReview = run.final_output_json?.internal_review;
    if (internalReview && typeof internalReview === 'object' && 'review_round' in internalReview) {
      payload.review_round = internalReview.review_round;
    }

    // Build outputs object
    const outputs: Record<string, boolean> = {
      has_research_json: !!run.research_json,
      has_outline_json: !!run.outline_json,
      has_draft_markdown: !!run.draft_markdown,
      has_optimized_json: !!run.optimized_json,
      has_final_output_json: !!run.final_output_json,
      has_edited_draft_markdown:
        !!run.final_output_json?.edited_draft_markdown &&
        run.final_output_json.edited_draft_markdown.length > 0,
    };
    payload.outputs = outputs;

    // Include full final_output_json only if compact payload is not requested
    if (!compactPayload) {
      payload.final_output_json = run.final_output_json;
    }

    return payload;
  } else if (isFailed) {
    return {
      run_id: run.id,
      status: 'failed',
      business_name: run.input_json?.business_name || null,
      blog_topic: run.input_json?.blog_topic || run.input_json?.topic || null,
      review_ready: false,
      human_review_required: true,
      error_message: run.error_message || 'Unknown error',
    };
  } else {
    // Shouldn't happen, but handle gracefully
    return {
      run_id: run.id,
      status: run.status,
      business_name: run.input_json?.business_name || null,
      blog_topic: run.input_json?.blog_topic || run.input_json?.topic || null,
    };
  }
}

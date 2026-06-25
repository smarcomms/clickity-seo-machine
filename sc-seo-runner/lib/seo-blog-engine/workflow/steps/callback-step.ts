'use step';

import 'server-only';
import { getRun } from '../../storage/runs';

/**
 * Send callback notification to webhook URL
 * Runs as a durable step to ensure callback delivery is tracked
 * Failures do not break the main workflow
 */
export async function sendCallbackStep(runId: string): Promise<void> {
  try {
    // Fetch run to get callback URL and final state
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

    // Build callback payload
    const callbackPayload = buildCallbackPayload(run);

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

      if (!response.ok) {
        console.warn(
          `[v0] Callback: Webhook returned ${response.status} for run ${runId}`
        );
      } else {
        console.log(`[v0] Callback: Successfully sent for run ${runId}`);
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);

      if (fetchError instanceof Error) {
        if (fetchError.name === 'AbortError') {
          console.warn(
            `[v0] Callback: Request timeout (30s) for run ${runId}`
          );
        } else {
          console.warn(
            `[v0] Callback: Network error for run ${runId}: ${fetchError.message}`
          );
        }
      } else {
        console.warn(`[v0] Callback: Unknown error for run ${runId}`);
      }
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
 * Build callback payload based on run status
 */
function buildCallbackPayload(run: any): Record<string, unknown> {
  const isCompleted = run.status === 'completed';
  const isFailed = run.status === 'failed';

  if (isCompleted) {
    return {
      run_id: run.id,
      status: 'completed',
      business_name: run.input_json?.business_name || null,
      blog_topic: run.input_json?.blog_topic || run.input_json?.topic || null,
      review_ready: true,
      human_review_required: true,
      outputs: {
        has_research_json: !!run.research_json,
        has_outline_json: !!run.outline_json,
        has_draft_markdown: !!run.draft_markdown,
        has_optimized_json: !!run.optimized_json,
        has_final_output_json: !!run.final_output_json,
      },
      final_output_json: run.final_output_json,
    };
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

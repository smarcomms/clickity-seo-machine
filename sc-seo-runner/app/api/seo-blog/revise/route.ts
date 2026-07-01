import { NextRequest } from 'next/server';
import { start } from 'workflow/api';
import {
  validateApiKey,
  unauthorizedResponse,
  errorResponse,
  successResponse,
} from '@/lib/seo-blog-engine/utils/api-auth';
import { revisionWorkflow, RevisionRequest } from '@/lib/seo-blog-engine/workflow/revision-workflow';

export async function POST(request: NextRequest) {
  try {
    // Validate API key
    if (!validateApiKey(request.headers)) {
      return unauthorizedResponse();
    }

    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse('Invalid JSON body', 400);
    }

    if (typeof body !== 'object' || body === null) {
      return errorResponse('Body must be a JSON object', 400);
    }

    const data = body as Record<string, unknown>;

    // Validate required fields
    if (!data.run_id || typeof data.run_id !== 'string') {
      return errorResponse('run_id is required and must be a string', 400);
    }

    if (!data.revision_mode || typeof data.revision_mode !== 'string') {
      return errorResponse('revision_mode is required and must be a string', 400);
    }

    if (data.revision_mode !== 'moderate_revision' && data.revision_mode !== 'heavy_revision') {
      return errorResponse(
        'revision_mode must be either "moderate_revision" or "heavy_revision"',
        400
      );
    }

    if (!data.reviewer_feedback || typeof data.reviewer_feedback !== 'object' || data.reviewer_feedback === null) {
      return errorResponse('reviewer_feedback is required and must be an object', 400);
    }

    const reviewerFeedback = data.reviewer_feedback as Record<string, unknown>;

    // Validate that at least one reviewer_feedback value is non-empty after trimming
    const hasFeedback = Object.values(reviewerFeedback).some((value) => {
      if (typeof value === 'string') {
        return value.trim().length > 0;
      }
      return false;
    });

    if (!hasFeedback) {
      return errorResponse(
        'reviewer_feedback must contain at least one non-empty string value',
        400
      );
    }

    // Extract optional fields with defaults
    const reviewer_email = typeof data.reviewer_email === 'string' ? data.reviewer_email : '';
    const smc_content_batch_id = typeof data.smc_content_batch_id === 'string' ? data.smc_content_batch_id : undefined;
    const order_id = typeof data.order_id === 'string' ? data.order_id : undefined;
    const review_round = typeof data.review_round === 'number' ? data.review_round : undefined;
    const current_draft_markdown = typeof data.current_draft_markdown === 'string' ? data.current_draft_markdown : undefined;
    const source = typeof data.source === 'string' ? data.source : undefined;

    // Convert reviewer_feedback object to Record<string, string | undefined>
    const typedReviewerFeedback: Record<string, string | undefined> = {};
    for (const [key, value] of Object.entries(reviewerFeedback)) {
      if (typeof value === 'string') {
        typedReviewerFeedback[key] = value;
      } else if (value === undefined || value === null) {
        typedReviewerFeedback[key] = undefined;
      } else {
        // Skip non-string, non-null/undefined values
        continue;
      }
    }

    // Build RevisionRequest
    const revisionRequest: RevisionRequest = {
      run_id: data.run_id as string,
      revision_mode: data.revision_mode as 'moderate_revision' | 'heavy_revision',
      reviewer_email,
      reviewer_feedback: typedReviewerFeedback,
      smc_content_batch_id,
      order_id,
      review_round,
      current_draft_markdown,
      source,
    };

    console.log(
      `[v0] Revision API: Received revision request for run ${revisionRequest.run_id}, mode: ${revisionRequest.revision_mode}`
    );

    // Submit to Workflow SDK for orchestration
    try {
      await start(revisionWorkflow, [revisionRequest]);
      console.log(`[v0] Revision workflow started for run ${revisionRequest.run_id}`);
    } catch (err) {
      console.error(
        `[v0] Workflow error for run ${revisionRequest.run_id}:`,
        err instanceof Error ? err.message : String(err)
      );
      // Continue - workflow may still execute
    }

    // Return 202 Accepted - workflow runs asynchronously
    return successResponse(
      {
        ok: true,
        run_id: revisionRequest.run_id,
        status: 'revision_completed',
        message: 'Revision workflow queued',
      },
      202
    );
  } catch (error) {
    console.error('[v0] Revision API error:', error);
    return errorResponse('Internal server error', 500);
  }
}

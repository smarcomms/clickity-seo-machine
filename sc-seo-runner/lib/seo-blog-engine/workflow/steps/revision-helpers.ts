'use step';

import 'server-only';
import { getRun, updateRevisionAndDraft } from '../../storage/runs';
import { query } from '../../storage/db';
import type { SeoBlogRun } from '../../schemas/seo-blog-output';

/**
 * Step wrapper to fetch run by ID
 * Isolates DB access (pg module) to step execution context
 */
export async function getRunForRevisionStep(
  runId: string
): Promise<SeoBlogRun | null> {
  return getRun(runId);
}

/**
 * Step wrapper to update revision and draft
 * Isolates DB access (pg module) to step execution context
 */
export async function updateRevisionAndDraftStep(
  runId: string,
  revisedMarkdown: string,
  internalReviewMetadata: Record<string, unknown>
): Promise<SeoBlogRun> {
  return updateRevisionAndDraft(runId, revisedMarkdown, internalReviewMetadata);
}

/**
 * Step wrapper to update smc_content_batches status for revised blog
 * Isolates DB access (pg module) to step execution context
 */
export async function updateBatchRevisionPendingStep(
  batchId?: string | null
): Promise<{ ok: boolean; skipped: boolean; reason?: string; error?: string }> {
  if (!batchId) {
    return {
      ok: true,
      skipped: true,
      reason: 'No batch id provided',
    };
  }

  try {
    await query(
      `UPDATE smc_content_batches SET status = $1, updated_at = NOW() WHERE id = $2`,
      ['blog_revised_review_pending', batchId]
    );

    return {
      ok: true,
      skipped: false,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      ok: false,
      skipped: false,
      error: errorMessage,
    };
  }
}

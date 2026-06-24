'use step';

import 'server-only';
import { updateRunStatus, updateRunError, completeRun } from '../../storage/runs';
import { sendCallbackStep } from './callback-step';

/**
 * Mark a run as running (transition from queued to running)
 */
export async function markRunRunningStep(runId: string): Promise<void> {
  console.log(`[v0] Helper: Marking run ${runId} as running`);
  await updateRunStatus(runId, 'researching');
}

/**
 * Mark a run as failed with error message and send callback
 */
export async function markRunFailedStep(
  runId: string,
  errorMessage: string
): Promise<void> {
  console.log(`[v0] Helper: Marking run ${runId} as failed with error: ${errorMessage}`);
  await updateRunError(runId, errorMessage);
  
  // Send callback notification (don't await to avoid blocking on callback failure)
  try {
    await sendCallbackStep(runId);
  } catch (err) {
    console.error(`[v0] Helper: Error sending failure callback:`, err instanceof Error ? err.message : String(err));
  }
}

/**
 * Complete a run with final output and send callback
 */
export async function completeRunStep(
  runId: string,
  finalOutput: Record<string, unknown>
): Promise<void> {
  console.log(`[v0] Helper: Completing run ${runId}`);
  await completeRun(runId, finalOutput);
  
  // Send callback notification (don't await to avoid blocking on callback failure)
  try {
    await sendCallbackStep(runId);
  } catch (err) {
    console.error(`[v0] Helper: Error sending completion callback:`, err instanceof Error ? err.message : String(err));
  }
}

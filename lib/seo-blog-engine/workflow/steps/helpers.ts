'use step';

import 'server-only';
import { updateRunStatus, updateRunError, completeRun } from '../../storage/runs';

/**
 * Mark a run as running (transition from queued to running)
 */
export async function markRunRunningStep(runId: string): Promise<void> {
  console.log(`[v0] Helper: Marking run ${runId} as running`);
  await updateRunStatus(runId, 'researching');
}

/**
 * Mark a run as failed with error message
 */
export async function markRunFailedStep(
  runId: string,
  errorMessage: string
): Promise<void> {
  console.log(`[v0] Helper: Marking run ${runId} as failed with error: ${errorMessage}`);
  await updateRunError(runId, errorMessage);
}

/**
 * Complete a run with final output
 */
export async function completeRunStep(
  runId: string,
  finalOutput: Record<string, unknown>
): Promise<void> {
  console.log(`[v0] Helper: Completing run ${runId}`);
  await completeRun(runId, finalOutput);
}

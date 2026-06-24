'use workflow';

import type { SeoBlogInput } from '../schemas/seo-blog-input';

/**
 * SEO Blog Generation Workflow - Phase 2C-A/B
 * Orchestrates multi-agent content generation pipeline
 * Step functions are invoked directly - they have 'use step' directive
 * 
 * Error handling ensures run state is always persisted:
 * - queued → running → completed|failed
 * - No runs stuck in queued state
 */

// Import step functions (they have 'use step' directive)
import { runResearchStep } from './steps/research-step';
import { runOutlineStep } from './steps/outline-step';
import { runWriterStep } from './steps/writer-step';
import { markRunRunningStep, markRunFailedStep, completeRunStep } from './steps/helpers';

export async function seoBlogWorkflow(
  runId: string,
  input: SeoBlogInput
): Promise<void> {
  console.log(`[v0] SEO Blog Workflow started for run ${runId}`);

  try {
    // Mark run as running (transition from queued)
    console.log(`[v0] Workflow: Marking run as running`);
    await markRunRunningStep(runId);

    // Stage 1: Research - runs as durable step
    console.log(`[v0] Stage 1: Running research step`);
    const researchOutput = await runResearchStep(runId, input);
    console.log(`[v0] Stage 1: Research completed and persisted`);

    // Stage 2: Outline - runs as durable step
    console.log(`[v0] Stage 2: Running outline step`);
    const outlineOutput = await runOutlineStep(runId, input, researchOutput);
    console.log(`[v0] Stage 2: Outline completed and persisted`);

    // Stage 3: Writer - runs as durable step
    console.log(`[v0] Stage 3: Running writer step`);
    const writerOutput = await runWriterStep(
      runId,
      input,
      researchOutput,
      outlineOutput
    );
    console.log(`[v0] Stage 3: Writer completed and persisted`);

    // Complete: Mark workflow as done with human review required
    console.log(`[v0] Workflow: Completing run`);
    const finalOutput = {
      research_json: researchOutput,
      outline_json: outlineOutput,
      draft_markdown: writerOutput.draft_markdown,
      human_review_required: true,
      workflow_status: 'draft_complete_awaiting_review',
      timestamp: new Date().toISOString(),
    };
    await completeRunStep(runId, finalOutput);

    console.log(`[v0] SEO Blog Workflow completed successfully for run ${runId}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[v0] Workflow error for run ${runId}: ${errorMessage}`);
    
    try {
      await markRunFailedStep(runId, errorMessage);
    } catch (failureErr) {
      console.error(`[v0] Failed to mark run as failed:`, failureErr instanceof Error ? failureErr.message : String(failureErr));
    }
    
    // Re-throw to ensure workflow failure is recorded
    throw error;
  }
}

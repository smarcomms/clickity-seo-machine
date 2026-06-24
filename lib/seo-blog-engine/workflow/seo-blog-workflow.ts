'use workflow';

import type { SeoBlogInput } from '../schemas/seo-blog-input';

/**
 * SEO Blog Generation Workflow - Phase 2C-A
 * Orchestrates multi-agent content generation pipeline
 * Step functions are invoked directly - they have 'use step' directive
 */

// Import step functions (they have 'use step' directive)
import { runResearchStep } from './steps/research-step';

declare function Step(name: string, fn: () => Promise<any>): Promise<any>;

export async function seoBlogWorkflow(
  runId: string,
  input: SeoBlogInput
): Promise<void> {
  console.log(`[v0] SEO Blog Workflow started for run ${runId}`);

  // Stage 1: Research - runs as durable step
  console.log(`[v0] Stage 1: Running research step`);
  const researchOutput = await runResearchStep(runId, input);
  console.log(`[v0] Stage 1: Research completed`);

  // Stage 2: Outline (mocked for Phase 2C-A)
  console.log(`[v0] Stage 2: Outline (mocked)`);
  const outlineOutput = {
    status: 'mock',
    outline: ['Introduction', 'Content Section 1', 'Content Section 2', 'Conclusion'],
    timestamp: new Date().toISOString(),
  };

  // Complete: Mark workflow as done with human review required
  console.log(`[v0] Completing workflow`);
  const { completeRun } = await import('../storage/runs');
  await completeRun(runId, {
    research_json: researchOutput,
    outline_json: outlineOutput,
    human_review_required: true,
    workflow_status: 'research_complete_awaiting_review',
    timestamp: new Date().toISOString(),
  });

  console.log(`[v0] SEO Blog Workflow completed for run ${runId}`);
}

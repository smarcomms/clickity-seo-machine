import { NextRequest } from 'next/server';
import { start } from 'workflow/api';
import { SeoBlogInputSchema } from '@/lib/seo-blog-engine/schemas/seo-blog-input';
import {
  validateApiKey,
  unauthorizedResponse,
  errorResponse,
  successResponse,
} from '@/lib/seo-blog-engine/utils/api-auth';
import { createRun } from '@/lib/seo-blog-engine/storage/runs';
import { seoBlogWorkflow } from '@/lib/seo-blog-engine/workflow/seo-blog-workflow';


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

    // Validate input against schema
    const parseResult = SeoBlogInputSchema.safeParse(body);
    if (!parseResult.success) {
      return errorResponse(
        `Validation error: ${parseResult.error.message}`,
        400
      );
    }

    // Log preserved input keys for debugging
    const preservedKeys = Object.keys(parseResult.data).sort();
    console.log(`[v0] SEO Blog Start: preserved input keys: ${preservedKeys.join(', ')}`);

    // Create run in database
    const run = await createRun(parseResult.data);
    console.log(`[v0] Created run ${run.id}`);

    // Submit to Workflow SDK for orchestration
    try {
      await start(seoBlogWorkflow, [run.id, parseResult.data]);
      console.log(`[v0] Workflow started for run ${run.id}`);
    } catch (err) {
      console.error(`[v0] Workflow error for run ${run.id}:`, err instanceof Error ? err.message : String(err));
      // Continue - workflow may still execute
    }

    // Return 202 Accepted - workflow runs asynchronously
    return successResponse(
      {
        status: 'started',
        run_id: run.id,
      },
      202
    );
  } catch (error) {
    console.error('[v0] API error:', error);
    return errorResponse('Internal server error', 500);
  }
}

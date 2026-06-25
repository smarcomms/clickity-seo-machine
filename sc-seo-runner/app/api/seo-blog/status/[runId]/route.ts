import { NextRequest } from 'next/server';
import {
  validateApiKey,
  unauthorizedResponse,
  errorResponse,
  successResponse,
} from '@/lib/seo-blog-engine/utils/api-auth';
import { getRun } from '@/lib/seo-blog-engine/storage/runs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    // Validate API key
    if (!validateApiKey(request.headers)) {
      return unauthorizedResponse();
    }

    const { runId } = await params;

    // Validate runId format (UUID)
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(runId)) {
      return errorResponse('Invalid run ID format', 400);
    }

    // Fetch run from database
    const run = await getRun(runId);
    if (!run) {
      return errorResponse('Run not found', 404);
    }

    // Build outputs object from stage fields
    const outputs: Record<string, unknown> = {};
    if (run.research_json) outputs.research = run.research_json;
    if (run.outline_json) outputs.outline = run.outline_json;
    if (run.draft_markdown) outputs.draft = run.draft_markdown;
    if (run.optimized_json) outputs.optimized = run.optimized_json;
    if (run.final_output_json) outputs.final = run.final_output_json;

    // Return run status and data
    return successResponse({
      run_id: run.id,
      status: run.status,
      input: run.input_json,
      created_at: run.created_at.toISOString(),
      updated_at: run.updated_at.toISOString(),
      completed_at: run.completed_at?.toISOString() || null,
      outputs,
      error_message: run.error_message || null,
    });
  } catch (error) {
    console.error('[v0] API error:', error);
    return errorResponse('Internal server error', 500);
  }
}

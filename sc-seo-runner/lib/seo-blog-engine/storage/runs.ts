import { query } from './db';
import { SeoBlogRun, RunStatus } from '../schemas/seo-blog-output';
import { SeoBlogInput } from '../schemas/seo-blog-input';

/**
 * Create a new SEO blog run
 */
export async function createRun(input: SeoBlogInput): Promise<SeoBlogRun> {
  const result = await query(
    `INSERT INTO seo_blog_runs (
      input_json, callback_url, status
    ) VALUES ($1, $2, 'queued')
    RETURNING *`,
    [JSON.stringify(input), input.callback_url || null]
  );

  return parseRunRow(result.rows[0]);
}

/**
 * Get a run by ID
 */
export async function getRun(runId: string): Promise<SeoBlogRun | null> {
  const result = await query('SELECT * FROM seo_blog_runs WHERE id = $1', [
    runId,
  ]);

  if (result.rows.length === 0) {
    return null;
  }

  return parseRunRow(result.rows[0]);
}

/**
 * Update run status and stage output
 */
export async function updateRunStatus(
  runId: string,
  status: RunStatus,
  stageOutput?: Record<string, unknown>
): Promise<SeoBlogRun> {
  const stageField = getStageField(status);

  const updateParts = ['status = $2', 'updated_at = NOW()'];
  const params: unknown[] = [runId, status];

  if (stageOutput && stageField) {
    updateParts.push(`${stageField} = $${params.length + 1}`);
    params.push(JSON.stringify(stageOutput));
  }

  const query_text = `UPDATE seo_blog_runs 
    SET ${updateParts.join(', ')}
    WHERE id = $1
    RETURNING *`;

  const result = await query(query_text, params);
  return parseRunRow(result.rows[0]);
}

/**
 * Update run with draft markdown
 */
export async function updateRunDraft(
  runId: string,
  draftMarkdown: string
): Promise<SeoBlogRun> {
  const result = await query(
    `UPDATE seo_blog_runs 
    SET draft_markdown = $2, updated_at = NOW()
    WHERE id = $1
    RETURNING *`,
    [runId, draftMarkdown]
  );

  return parseRunRow(result.rows[0]);
}

/**
 * Update run with error
 */
export async function updateRunError(
  runId: string,
  errorMessage: string
): Promise<SeoBlogRun> {
  const result = await query(
    `UPDATE seo_blog_runs 
    SET status = 'failed', error_message = $2, updated_at = NOW()
    WHERE id = $1
    RETURNING *`,
    [runId, errorMessage]
  );

  return parseRunRow(result.rows[0]);
}

/**
 * Complete run with final output
 */
export async function completeRun(
  runId: string,
  finalOutput: Record<string, unknown>
): Promise<SeoBlogRun> {
  const result = await query(
    `UPDATE seo_blog_runs 
    SET status = 'completed', final_output_json = $2, 
        completed_at = NOW(), updated_at = NOW()
    WHERE id = $1
    RETURNING *`,
    [runId, JSON.stringify(finalOutput)]
  );

  return parseRunRow(result.rows[0]);
}

/**
 * Map status to database field name
 */
function getStageField(status: RunStatus): string | null {
  const fieldMap: Record<RunStatus, string | null> = {
    queued: 'research_json',
    researching: 'research_json',
    outlining: 'outline_json',
    writing: 'draft_markdown',
    seo_qa: 'optimized_json',
    brand_qa: 'optimized_json',
    editing: 'draft_markdown',
    revising: 'draft_markdown',
    completed: 'final_output_json',
    failed: null,
  };
  return fieldMap[status];
}

/**
 * Parse database row to SeoBlogRun type
 */
export function parseRunRow(row: any): SeoBlogRun {
  return {
    id: row.id,
    status: row.status as RunStatus,
    input_json: row.input_json,
    research_json: row.research_json,
    outline_json: row.outline_json,
    draft_markdown: row.draft_markdown,
    optimized_json: row.optimized_json,
    final_output_json: row.final_output_json,
    error_message: row.error_message,
    callback_url: row.callback_url,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
    completed_at: row.completed_at ? new Date(row.completed_at) : undefined,
  };
}

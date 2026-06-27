import { query } from './lib/seo-blog-engine/storage/db.js';

const result = await query(
  'SELECT id, input_json FROM seo_blog_runs WHERE id = $1',
  ['8c6a8707-0c10-4829-83dc-90deacab94b3']
);

if (result.rows.length > 0) {
  const row = result.rows[0];
  const input = typeof row.input_json === 'string' ? JSON.parse(row.input_json) : row.input_json;
  console.log('[v0] Saved input_json keys:', Object.keys(input).sort().join(', '));
  console.log('[v0] debug_marker:', input.debug_marker);
  console.log('[v0] blog_context_brief:', JSON.stringify(input.blog_context_brief, null, 2));
  console.log('[v0] order_context:', JSON.stringify(input.order_context, null, 2));
  console.log('[v0] tone:', input.tone);
} else {
  console.log('[v0] No run found');
}

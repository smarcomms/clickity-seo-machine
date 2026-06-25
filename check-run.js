import { Pool } from 'pg';
const runId = '42638da0-fa00-420d-8bfd-31d6a84fdfb9';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const result = await pool.query(
  `SELECT id, status, research_json, outline_json FROM seo_blog_runs WHERE id = $1`,
  [runId]
);
if (result.rows.length) {
  const run = result.rows[0];
  console.log('Database Record Found:');
  console.log('Status:', run.status);
  console.log('research_json present:', !!run.research_json);
  console.log('research_json keys:', run.research_json ? Object.keys(run.research_json) : 'null');
  if (run.research_json) {
    console.log('research_json sample:', JSON.stringify(run.research_json).substring(0, 500));
  }
} else {
  console.log('No record found');
}
await pool.end();

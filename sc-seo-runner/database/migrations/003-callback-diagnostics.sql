-- Add callback diagnostics fields to seo_blog_runs table
ALTER TABLE IF EXISTS seo_blog_runs ADD COLUMN IF NOT EXISTS callback_attempted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE IF EXISTS seo_blog_runs ADD COLUMN IF NOT EXISTS callback_status VARCHAR(50);
ALTER TABLE IF EXISTS seo_blog_runs ADD COLUMN IF NOT EXISTS callback_response_status INTEGER;
ALTER TABLE IF EXISTS seo_blog_runs ADD COLUMN IF NOT EXISTS callback_error TEXT;

-- Create index for callback status queries
CREATE INDEX IF NOT EXISTS idx_seo_blog_runs_callback_status ON seo_blog_runs(callback_status);

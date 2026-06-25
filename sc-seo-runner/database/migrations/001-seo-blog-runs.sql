-- Create seo_blog_runs table
CREATE TABLE IF NOT EXISTS seo_blog_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status VARCHAR(50) NOT NULL DEFAULT 'queued',
  
  -- Input
  input_json JSONB,
  
  -- Workflow stage outputs
  research_json JSONB,
  outline_json JSONB,
  draft_markdown TEXT,
  optimized_json JSONB,
  final_output_json JSONB,
  
  -- Error handling
  error_message TEXT,
  
  -- Callback
  callback_url TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create index on status for efficient polling
CREATE INDEX IF NOT EXISTS idx_seo_blog_runs_status ON seo_blog_runs(status);

-- Create index on created_at for pagination
CREATE INDEX IF NOT EXISTS idx_seo_blog_runs_created_at ON seo_blog_runs(created_at DESC);

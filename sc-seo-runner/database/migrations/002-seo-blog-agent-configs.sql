-- Create seo_blog_agent_configs table
CREATE TABLE IF NOT EXISTS seo_blog_agent_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_key VARCHAR(100) NOT NULL UNIQUE,
  agent_name VARCHAR(100) NOT NULL,
  system_prompt TEXT NOT NULL,
  skill_markdown TEXT,
  model VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  version INT DEFAULT 1,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on agent_key for lookups
CREATE INDEX IF NOT EXISTS idx_seo_blog_agent_configs_key ON seo_blog_agent_configs(agent_key);

-- Seed default agents
INSERT INTO seo_blog_agent_configs (agent_key, agent_name, system_prompt, skill_markdown, is_active, version)
VALUES
  (
    'research',
    'Research Agent',
    'You are a research specialist. Your job is to research the topic, find relevant information, and compile research findings.',
    '# TODO: Step 2 - Add real research prompts from SEO Machine',
    true,
    1
  ),
  (
    'outline',
    'Outline Agent',
    'You are an outline specialist. Your job is to create a comprehensive outline for the blog post based on research.',
    '# TODO: Step 2 - Add real outline prompts from SEO Machine',
    true,
    1
  ),
  (
    'writer',
    'Writer Agent',
    'You are a blog writer. Your job is to write the full blog post based on the outline and research.',
    '# TODO: Step 2 - Add real writer prompts from SEO Machine',
    true,
    1
  ),
  (
    'seo_qa',
    'SEO QA Agent',
    'You are an SEO quality assurance specialist. Your job is to review the content for SEO optimization.',
    '# TODO: Step 2 - Add real SEO QA prompts from SEO Machine',
    true,
    1
  ),
  (
    'brand_qa',
    'Brand QA Agent',
    'You are a brand quality assurance specialist. Your job is to review the content for brand alignment.',
    '# TODO: Step 2 - Add real brand QA prompts from SEO Machine',
    true,
    1
  ),
  (
    'editor',
    'Editor Agent',
    'You are an editor. Your job is to refine the content for clarity, grammar, and style.',
    '# TODO: Step 2 - Add real editor prompts from SEO Machine',
    true,
    1
  ),
  (
    'revision',
    'Revision Agent',
    'You are a revision specialist. Your job is to make final adjustments to the content.',
    '# TODO: Step 2 - Add real revision prompts from SEO Machine',
    true,
    1
  ),
  (
    'meta',
    'Meta Agent',
    'You are a meta specialist. Your job is to generate meta titles, descriptions, and other SEO metadata.',
    '# TODO: Step 2 - Add real meta prompts from SEO Machine',
    true,
    1
  )
ON CONFLICT (agent_key) DO NOTHING;

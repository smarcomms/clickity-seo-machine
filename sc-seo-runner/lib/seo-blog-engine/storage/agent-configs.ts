import { query } from './db';
import { AgentConfig } from '../schemas/seo-blog-output';

/**
 * Get agent config by key
 */
export async function getAgentConfig(
  agentKey: string
): Promise<AgentConfig | null> {
  const result = await query(
    `SELECT * FROM seo_blog_agent_configs WHERE agent_key = $1 AND is_active = true`,
    [agentKey]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return parseAgentRow(result.rows[0]);
}

/**
 * Get all agent configs, ordered by creation
 */
export async function getAllAgentConfigs(): Promise<AgentConfig[]> {
  const result = await query(
    `SELECT * FROM seo_blog_agent_configs WHERE is_active = true ORDER BY created_at ASC`
  );

  return result.rows.map(parseAgentRow);
}

/**
 * Parse database row to AgentConfig type
 */
export function parseAgentRow(row: any): AgentConfig {
  return {
    id: row.id,
    agent_key: row.agent_key,
    agent_name: row.agent_name,
    system_prompt: row.system_prompt,
    skill_markdown: row.skill_markdown,
    model: row.model,
    is_active: row.is_active,
    version: row.version,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
  };
}

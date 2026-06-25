import { z } from 'zod';

/**
 * Run status enum
 */
export const RunStatusEnum = z.enum([
  'queued',
  'researching',
  'outlining',
  'writing',
  'seo_qa',
  'brand_qa',
  'editing',
  'revising',
  'completed',
  'failed',
]);

export type RunStatus = z.infer<typeof RunStatusEnum>;

/**
 * Run record from database
 */
export interface SeoBlogRun {
  id: string;
  status: RunStatus;
  input_json?: Record<string, unknown>;
  research_json?: Record<string, unknown>;
  outline_json?: Record<string, unknown>;
  draft_markdown?: string;
  optimized_json?: Record<string, unknown>;
  final_output_json?: Record<string, unknown>;
  error_message?: string;
  callback_url?: string;
  created_at: Date;
  updated_at: Date;
  completed_at?: Date;
}

/**
 * Agent config from database
 */
export interface AgentConfig {
  id: string;
  agent_key: string;
  agent_name: string;
  system_prompt: string;
  skill_markdown?: string;
  model?: string;
  is_active: boolean;
  version: number;
  created_at: Date;
  updated_at: Date;
}

/**
 * API response schemas
 */
export const ApiStartResponseSchema = z.object({
  status: z.string(),
  run_id: z.string().uuid(),
  final_status: z.string().optional(),
});

export type ApiStartResponse = z.infer<typeof ApiStartResponseSchema>;

export const ApiStatusResponseSchema = z.object({
  run_id: z.string().uuid(),
  status: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  completed_at: z.string().or(z.null()).optional(),
  outputs: z.record(z.string(), z.unknown()).optional(),
  error_message: z.string().or(z.null()).optional(),
});

export type ApiStatusResponse = z.infer<typeof ApiStatusResponseSchema>;

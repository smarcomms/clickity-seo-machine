import { z } from 'zod';

/**
 * Input validation schema for SEO blog generation
 * Supports both minimal payloads (topic + keywords) and full context payloads
 * Either blog_topic or topic must be provided
 * Rich context fields are preserved through to workflow execution
 */

// Schema for nested rich context objects
const OrderContextSchema = z.object({
  order_id: z.string().optional(),
  service: z.string().optional(),
  service_id: z.number().optional(),
  client_email: z.string().optional(),
}).passthrough().optional();

const BlogContextBriefSchema = z.object({
  business_summary: z.string().optional(),
  target_audience: z.string().optional(),
  business_goal: z.string().optional(),
  blog_goal: z.string().optional(),
  services_to_promote: z.array(z.string()).optional(),
  key_messages: z.array(z.string()).optional(),
  must_include: z.array(z.string()).optional(),
  must_avoid: z.array(z.string()).optional(),
  competitors: z.array(z.string()).optional(),
  curated_sources: z.array(z.string()).optional(),
  brand_voice_notes: z.string().optional(),
  cta: z.string().optional(),
  source_summary: z.record(z.string(), z.unknown()).optional(),
}).passthrough().optional();

export const SeoBlogInputSchema = z.object({
  // Required fields
  business_name: z.string().max(255),
  blog_topic: z.string().max(500),
  
  // Optional core fields
  client_name: z.string().max(255).optional(),
  website_url: z.string().url().optional(),
  
  // Keywords
  primary_keyword: z.string().max(255).optional(),
  secondary_keywords: z.array(z.string()).optional(),
  
  // Content parameters
  target_word_count: z.number().min(100).max(10000).optional(),
  
  // Brand & audience guidance - changed tone to accept free text
  audience_notes: z.string().optional(),
  brand_voice_notes: z.string().optional(),
  cta_notes: z.string().optional(),
  tone: z.string().optional(), // Changed from enum to free text string
  dialect: z.string().optional(),
  
  // Target audience and goals
  target_audience: z.string().optional(),
  business_goal: z.string().optional(),
  blog_goal: z.string().optional(),
  
  // Content requirements
  must_include: z.array(z.string()).optional(),
  must_avoid: z.array(z.string()).optional(),
  services_to_promote: z.array(z.string()).optional(),
  key_messages: z.array(z.string()).optional(),
  
  // Competitive and source context
  competitors: z.array(z.string()).optional(),
  curated_sources: z.array(z.string()).optional(),
  
  // Rich nested context objects
  order_context: OrderContextSchema,
  blog_context_brief: BlogContextBriefSchema,
  
  // Call-to-action
  cta: z.string().optional(),
  
  // Testing and debugging
  test_run: z.boolean().optional(),
  debug_marker: z.string().optional(),
  
  // Callback
  callback_url: z.string().url().optional(),
  
  // Legacy fields for backward compatibility
  topic: z.string().max(500).optional(),
  location: z.string().max(255).optional(),
  keywords: z.array(z.string()).optional(),
  internal_link_notes: z.string().optional(),
  seo_focus: z.record(z.string(), z.unknown()).optional(),
  additional_order_notes: z.string().optional(),
}).passthrough(); // Allow additional unknown fields to pass through without stripping

export type SeoBlogInput = z.infer<typeof SeoBlogInputSchema>;

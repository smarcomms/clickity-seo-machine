import { z } from 'zod';

/**
 * Input validation schema for SEO blog generation
 * Supports both minimal payloads (topic + keywords) and full n8n payloads
 * Either blog_topic or topic must be provided
 */
export const SeoBlogInputSchema = z.object({
  // Client info (from n8n)
  client_name: z.string().max(255).optional(),
  business_name: z.string().max(255).optional(),
  website_url: z.string().url().optional(),
  
  // Core content specification - either blog_topic (n8n) or topic (legacy) required
  blog_topic: z.string().max(500).optional(),
  topic: z.string().max(500).optional(),
  
  // Keywords
  primary_keyword: z.string().max(255).optional(),
  secondary_keywords: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
  
  // Content parameters
  target_word_count: z.number().min(100).max(10000).optional(),
  location: z.string().max(255).optional(),
  
  // Brand & audience guidance
  brand_voice_notes: z.string().optional(),
  audience_notes: z.string().optional(),
  tone: z.enum(['professional', 'casual', 'technical', 'friendly']).optional(),
  target_audience: z.string().max(255).optional(),
  
  // SEO & content guidance
  internal_link_notes: z.string().optional(),
  cta_notes: z.string().optional(),
  seo_focus: z.record(z.string(), z.unknown()).optional(),
  
  // Additional context
  additional_order_notes: z.string().optional(),
  
  // Callback
  callback_url: z.string().url().optional(),
}).refine(
  (data) => data.blog_topic || data.topic,
  {
    message: "Either blog_topic or topic is required",
    path: ["blog_topic"],
  }
);

export type SeoBlogInput = z.infer<typeof SeoBlogInputSchema>;

import 'server-only';
import type { SeoBlogInput } from '../../schemas/seo-blog-input';

function cleanString(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim();
}

function formatValue(value: unknown, fallback = 'Not provided'): string {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return fallback;
}

function formatList(values: unknown, fallback = 'None provided'): string {
  if (!Array.isArray(values) || values.length === 0) return fallback;

  const cleaned = values
    .map((item) => (typeof item === 'string' ? item.trim() : String(item)))
    .filter(Boolean);

  if (cleaned.length === 0) return fallback;
  return cleaned.map((item) => `- ${item}`).join('\n');
}

function formatJson(value: unknown, fallback = 'None provided'): string {
  if (!value || typeof value !== 'object') return fallback;
  return JSON.stringify(value, null, 2);
}

export function extractJsonObject(text: string): string {
  const trimmed = text.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) return trimmed;

  const fencedJson = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedJson?.[1]) {
    const candidate = fencedJson[1].trim();
    if (candidate.startsWith('{') && candidate.endsWith('}')) return candidate;
  }

  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON object found in model response');
  }

  return jsonMatch[0];
}

export function buildFullInputContext(input: SeoBlogInput): string {
  const brief: NonNullable<SeoBlogInput['blog_context_brief']> = input.blog_context_brief ?? {};
  const orderContext: NonNullable<SeoBlogInput['order_context']> = input.order_context ?? {};
  const externalResearch = input.external_research ?? null;
  const smcContentBatchId = input.smc_content_batch_id ?? null;
  const targetAudience =
    cleanString(brief.target_audience) ||
    cleanString(input.target_audience) ||
    cleanString(input.audience_notes);

  const businessGoal =
    cleanString(brief.business_goal) || cleanString(input.business_goal);

  const blogGoal = cleanString(brief.blog_goal) || cleanString(input.blog_goal);
  const brandVoice =
    cleanString(brief.brand_voice_notes) ||
    cleanString(input.brand_voice_notes) ||
    cleanString(input.tone);
  const cta =
    cleanString(brief.cta) ||
    cleanString(input.cta) ||
    cleanString(input.cta_notes);

  const servicesToPromote =
    Array.isArray(brief.services_to_promote) && brief.services_to_promote.length > 0
      ? brief.services_to_promote
      : input.services_to_promote;

  const keyMessages =
    Array.isArray(brief.key_messages) && brief.key_messages.length > 0
      ? brief.key_messages
      : input.key_messages;

  const mustInclude =
    Array.isArray(brief.must_include) && brief.must_include.length > 0
      ? brief.must_include
      : input.must_include;

  const mustAvoid =
    Array.isArray(brief.must_avoid) && brief.must_avoid.length > 0
      ? brief.must_avoid
      : input.must_avoid;

  const competitors =
    Array.isArray(brief.competitors) && brief.competitors.length > 0
      ? brief.competitors
      : input.competitors;

  const curatedSources =
    Array.isArray(brief.curated_sources) && brief.curated_sources.length > 0
      ? brief.curated_sources
      : input.curated_sources;

  return `## Full Blog Context Brief
Business Name: ${formatValue(input.business_name)}
Client Name: ${formatValue(input.client_name)}
Website URL: ${formatValue(input.website_url)}
Blog Topic: ${formatValue(input.blog_topic || input.topic)}
Primary Keyword: ${formatValue(input.primary_keyword)}
Secondary Keywords:
${formatList(input.secondary_keywords || input.keywords)}
Target Word Count: ${formatValue(input.target_word_count)}
Tone: ${formatValue(input.tone)}
Dialect: ${formatValue(input.dialect)}
Target Audience: ${formatValue(targetAudience)}
Business Goal: ${formatValue(businessGoal)}
Blog Goal: ${formatValue(blogGoal)}
Brand Voice Notes: ${formatValue(brandVoice)}
CTA: ${formatValue(cta)}
Internal Link Notes: ${formatValue(input.internal_link_notes)}
Additional Order Notes: ${formatValue(input.additional_order_notes)}
SMC Content Batch ID: ${formatValue(smcContentBatchId)}
External Research:
${formatJson(externalResearch)}
Business Summary:
${formatValue(brief.business_summary)}

Services To Promote:
${formatList(servicesToPromote)}

Key Messages:
${formatList(keyMessages)}

Must Include:
${formatList(mustInclude)}

Must Avoid:
${formatList(mustAvoid)}

Competitors:
${formatList(competitors)}

Curated Sources:
${formatList(curatedSources)}

Order Context:
${formatJson(orderContext)}

Source Summary:
${formatJson(brief.source_summary)}

Raw Blog Context Brief:
${formatJson(brief)}`;
}

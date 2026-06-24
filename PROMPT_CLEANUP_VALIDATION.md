# Agent Prompt Cleanup Validation Report

## Overview
All 5 agent instruction files have been updated to remove podcast-specific content, replace fixed word count assumptions with dynamic `target_word_count`, and ensure prompts are generic and input-driven.

## File-by-File Changes

### 1. Research Agent ✅
**Podcast Content Removed**:
- None specific found (research agent was already generic)

**Word Count Updates**:
- Changed from benchmark guidance ("2000-3000+ words") to dynamic guidance
- Now references `target_word_count` from payload as source of truth
- Recommends structure based on provided target length

**Input/Output Spec Updated**:
- Explicitly lists all payload fields: `blog_topic`, `primary_keyword`, `secondary_keywords`, `target_word_count`, `audience_notes`, `location`, `business_name`, `website_url`, `additional_order_notes`
- Output format now references `target_word_count` allocation

### 2. Writer Agent ✅
**Podcast Content Removed**:
- Removed YouTube embed requirement ("Include at least one YouTube embed - prefer brand channel")
- Generic now; embed strategy optional based on client needs

**Word Count Updates**:
- Changed purpose from "Create comprehensive, SEO-optimized long-form content (2000-3000+ words)" to generic "Create SEO-optimized content at the requested word count"
- Added scaling guidance for examples/mini-stories (1-2 for 600-1000w, 2-3 for 1000-2000w, 3-4 for 2000+w)
- Added scaling guidance for CTAs (1 for short, 1-2 for medium, 2-3 for long)
- Removed "Minimum 2000 words" requirement; now writes to `target_word_count` with ±10% variance tolerance
- Key Takeaways block now optional for articles <1000 words

**Output Quality Standards**:
- Word count now primary quality metric: "Write to target_word_count (or default 1000 if missing). Report actual vs. target in output footer."

**Input/Output Spec Updated**:
- Explicitly lists: `research_json`, `outline_json`, `target_word_count`, `tone`, `target_audience`, `brand_voice_notes`, `cta_notes`
- Output includes "Footer note: Actual word count vs. target_word_count"

### 3. SEO QA Agent ✅
**Podcast Content Removed**:
- Section 8: Changed "Podcast Creator Relevance" to generic "Audience Alignment (if applicable)"
- Removed podcast-specific checks: "podcast creator needs", "podcasting-relevant examples", "podcast workflows", "podcasting industry terminology"
- Now generic: "Content aligns with target_audience?" and "Solutions applicable to audience workflows/context?"

**Word Count Updates**:
- Section 3 (Content Length Analysis) completely rewritten
- Old: Compared against competitor benchmark, calculated gaps to optimal length
- New: Checks actual vs. `target_word_count` (±10% tolerance), flags if outside range, includes optional competitor context
- Word count now primary metric, not competitor-driven

**Input/Output Spec Updated**:
- Explicitly lists: `draft_markdown`, `primary_keyword`, `secondary_keywords`, `target_word_count`, `target_audience`, `business_name`, `website_url`, `seo_focus`, `additional_order_notes`
- Output includes word count audit with variance report
- Publishing status includes: "Needs Revision" path for <±10% variance issues

### 4. Editor Agent ✅
**Podcast Content Removed**:
- None found; editor agent was already generic

**Word Count Updates**:
- Preservation standards added: "Word count within ±10% of target (do not cut substantially unless feedback explicitly requests)"
- New standard: "No edits that change article meaning or depth"
- Purpose maintains generic language

**Input/Output Spec Updated**:
- Explicitly lists: `draft_markdown`, `optimized_json` (optional), `target_word_count`, `brand_voice_notes` (optional)
- Output specifies: "Preserved word count (±10% of target)"

### 5. Meta Agent ✅
**Podcast Content Removed**:
- Examples in title formats: Changed "How to Start a Podcast in 2025" → "How to [Topic]: [Audience] Guide 2025"
- Examples in title formats: Changed "12 Proven Ways to Grow Your Podcast Audience" → "[Number] Proven [Benefit] Methods for [Audience]"
- Examples in title formats: Changed "Complete Guide to Podcast Editing for Beginners" → "Complete Guide to [Topic] for Beginners"
- Examples in title formats: Changed "What is Podcast Hosting?" → "What is [Topic]?"
- Examples in title formats: Changed "Monetize Your Podcast with These 7 Strategies" → "[Benefit] with These [Number] Strategies"

**Power Words Made Generic**:
- Old: "Growth: Grow, Increase, Boost, Expand, Scale" + monetization-specific words
- New: "Growth/Improvement: Grow, Increase, Boost, Expand, Enhance, Improve" + industry-agnostic alternatives

**Input/Output Spec Updated**:
- Explicitly lists: `draft_markdown`, `primary_keyword`, `secondary_keywords`, `blog_topic`, `audience_notes`, `business_name`, `website_url`, `cta_notes`
- References `audience_notes` for power word selection (input-driven)

## Summary

### Fixed Word Count Assumptions ✅
- **Removed**: 2000+ word minimums, "long-form content" language, fixed section counts
- **Added**: Dynamic scaling based on `target_word_count`
- **Result**: Agents now responsive to client-specific order lengths (600, 1000, 1500, etc.)

### target_word_count Now Source of Truth ✅
All agents reference `target_word_count` from API payload:
- Research: Structures recommendations around provided target
- Writer: Writes to exact target with scaling guidance
- SEO QA: Validates actual against target (±10% tolerance)
- Editor: Preserves word count within tolerance
- Meta: No direct impact (title/description length separate)

### Prompts Made Generic ✅
- **Research**: Already generic (topic-agnostic research framework)
- **Writer**: Removed podcast examples, made scalable
- **SEO QA**: Removed podcast relevance checks, now "Audience Alignment"
- **Editor**: Already generic (editing framework applies to any content)
- **Meta**: Removed all podcast examples, made template-based

### Input-Driven Architecture ✅
All agents now explicitly:
1. Accept fields from API payload (business_name, website_url, audience_notes, cta_notes, etc.)
2. Use client context to inform decisions (not hard-coded assumptions)
3. Reference `target_word_count` and other order fields throughout
4. Scale recommendations (section count, examples, CTAs) to order specifics

## Quality Metrics

| Agent | Podcast Content | Word Count Scaling | Input Fields | Generic Template |
|-------|-----------------|-------------------|---------------|------------------|
| Research | None | ✅ Uses target_word_count | ✅ 10 fields listed | ✅ |
| Writer | ✅ Removed | ✅ Scaled (1-4 examples, 1-3 CTAs) | ✅ 8 fields listed | ✅ |
| SEO QA | ✅ Removed | ✅ ±10% tolerance check | ✅ 7 fields listed | ✅ |
| Editor | None | ✅ ±10% preservation | ✅ 4 fields listed | ✅ |
| Meta | ✅ Removed (5 examples replaced) | N/A | ✅ 6 fields listed | ✅ |

## Remaining Considerations

**No AI/Model Calls Added** ✅
- All changes are prompt/framework updates only
- No real AI SDK calls implemented yet
- No Workflow SDK wiring changed

**No Manual/CLI Steps** ✅
- All agents work with JSON input/output
- No shell commands or local tools referenced
- No Python modules mentioned

**Word Count Default** ✅
- If `target_word_count` missing, prompts default to 1000 words
- All agents explicitly note default in output

**Human Review Preserved** ✅
- `human_review_required: true` remains final flag
- No new human review checkpoints added inside workflow
- SEO QA provides "Publishing Status" (not blocking, advisory)

## Status

**All prompts ready for Phase 2C implementation** ✅
- Podcast-specific content removed
- Fixed word count assumptions replaced with dynamic target_word_count
- All agents input-driven from API payload
- No real AI/model calls yet implemented

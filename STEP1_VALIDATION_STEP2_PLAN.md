# Step 1 Validation & Step 2 Implementation Plan

## PART 1: STEP 1 VALIDATION REPORT ✅

### 1.1 Database Schema Validation

**Status: ✅ COMPLETE**

Neon tables created successfully:

- **seo_blog_runs**: Stores run records with input_json, research_json, outline_json, draft_markdown, optimized_json, final_output_json, callback_url, and status tracking.
- **seo_blog_agent_configs**: Stores agent configurations with agent_key as primary lookup, system_prompt, skill_markdown, model, is_active, and version tracking.

Both tables indexed on status and created_at for efficient querying.

### 1.2 File Structure Validation

**Status: ✅ COMPLETE**

All required directories and files created:
- 8 agent directories with instructions.md placeholders
- schemas/ with seo-blog-input.ts and seo-blog-output.ts
- storage/ with db.ts, runs.ts, agent-configs.ts
- workflow/ with seo-blog-workflow.ts (mocked)
- utils/ with api-auth.ts, slugify.ts, score-content.ts, format-output.ts
- API routes: POST /api/seo-blog/start and GET /api/seo-blog/status/[runId]

### 1.3 API Routes Validation

**Status: ✅ COMPLETE**

- **POST /api/seo-blog/start**: Creates run, validates API key, calls mocked workflow, returns run_id and final status.
- **GET /api/seo-blog/status/[runId]**: Fetches run state, returns JSON with input, outputs, status, and error_message.

Both routes properly integrated with API key validation, Zod schema validation, Neon persistence, and error handling.

### 1.4 TypeScript Compilation

**Status: ✅ COMPLETE**

- No TypeScript errors
- All imports properly resolved
- Type safety verified across all modules

### 1.5 Dependencies

**Status: ✅ COMPLETE**

Installed:
- `zod` ^3.22.0 - Schema validation
- `pg` ^8.11.0 - Postgres client for Neon
- `@types/pg` ^8.11.0 - TypeScript types for pg

**Reserved for Step 2:**
- `ai` ^6.0.0 - Vercel AI SDK
- `@ai-sdk/anthropic` - Anthropic provider
- `@ai-sdk/openai` - OpenAI provider
- `vercel-workflows` - Vercel Workflow SDK

### 1.6 Mocked Workflow Status

**Status: ✅ COMPLETE**

All 8 workflow stages implemented with mock outputs, each marked with clear `// TODO: Step 2` comments for replacement with real AI logic.

### 1.7 Environment Variables

**Step 1 configured:**
- ✅ DATABASE_URL - Neon connection
- ✅ SEO_BLOG_API_KEY - API authentication

**Step 2 required:**
- AI_MODEL, AI_PROVIDER, ANTHROPIC_API_KEY, OPENAI_API_KEY (as needed)

---

## PART 2: REQUIRED FIXES BEFORE STEP 2

**Status: ✅ NONE REQUIRED**

Step 1 is production-ready for mocking. Ensure these are configured before Step 2:
1. DATABASE_URL set in Vercel environment
2. SEO_BLOG_API_KEY configured
3. API routes tested with curl/Postman

---

## PART 3: PROPOSED STEP 2 IMPLEMENTATION PLAN

### 3.1 Overview

Replace synchronous mocked workflow with:
- **Vercel Workflow SDK** for durable, resumable orchestration
- **AI SDK 6** with provider-agnostic architecture
- **Eve-style agents** loaded from Neon configs or markdown files
- **AI Gateway web search** integration (Perplexity/Parallel Search)
- **10-step workflow** with proper step orchestration

### 3.2 Workflow Architecture

**Main file: `lib/seo-blog-engine/workflow/seo-blog-workflow.ts`**

Using `"use workflow"` directive for Vercel Workflow SDK. 10 sequential steps:

1. **validateInputStep** - Validate input, load agent configs from Neon
2. **researchBriefStep** - Research agent with AI Gateway web search
3. **outlineStep** - Create structured outline (H1/H2/H3 hierarchy)
4. **writeDraftStep** - Write blog markdown section by section
5. **scrubAiLanguageStep** - Remove generic AI phrasing, improve tone
6. **seoQaStep** - Score SEO (keyword use, headings, intent match)
7. **brandQaStep** - Check brand voice, audience, CTA alignment
8. **reviseIfNeededStep** - Conditional revision if score < 75
9. **finalOutputStep** - Generate meta, tags, final JSON output
10. **callbackStep** - Trigger webhook if callback_url provided

Each step marked with `"use step"` for long-running/external work.

### 3.3 Agent Implementation

**8 Agents (matching Step 1 structure):**

1. **research-agent** - Uses AI Gateway web search, analyzes intent/competitors/gaps → research_json
2. **outline-agent** - Creates H1/H2/H3 with word counts, CTA, FAQ ideas → outline_json
3. **writer-agent** - Writes blog section by section → draft_markdown
4. **editor-agent** - Removes AI phrasing, improves tone → updated draft_markdown
5. **seo-qa-agent** - Scores SEO (keywords, headings, meta, intent) → optimized_json
6. **brand-qa-agent** - Checks brand voice, audience, CTA → optimized_json
7. **revision-agent** - Applies fixes if score < 75 → updated draft_markdown
8. **meta-agent** - Generates meta title/description, slug, tags → final_output_json

### 3.4 Configuration Loading (Neon-First Pattern)

For each agent:
1. Check Neon `seo_blog_agent_configs` by agent_key
2. If active config found, use: system_prompt, skill_markdown, model
3. Fallback to GitHub markdown files if no config

This allows runtime prompt tweaks via Neon without redeploys.

### 3.5 Final Output JSON Schema

```json
{
  "run_id": "uuid",
  "status": "completed",
  "client_name": "string",
  "business_name": "string",
  "title": "string",
  "slug": "url-safe-slug",
  "meta_title": "50-60 chars",
  "meta_description": "150-160 chars",
  "primary_keyword": "string",
  "secondary_keywords": ["keyword1", "keyword2", "keyword3"],
  "target_word_count": 2500,
  "draft_markdown": "full blog post",
  "internal_link_suggestions": [
    {"anchor_text": "", "target_url": "", "location": ""}
  ],
  "external_link_suggestions": [
    {"anchor_text": "", "target_url": "", "location": ""}
  ],
  "seo_score": 92,
  "brand_score": 88,
  "readability_score": 85,
  "overall_score": 88,
  "qa_notes": ["note1", "note2"],
  "priority_fixes": [],
  "revision_notes": [],
  "human_review_required": true
}
```

### 3.6 Database Updates

At each major step, update `seo_blog_runs`:
- After researchBriefStep: research_json + status "researching"
- After outlineStep: outline_json + status "outlining"
- After writeDraftStep: draft_markdown + status "writing"
- After seoQaStep/brandQaStep: optimized_json + status "optimized"
- After finalOutputStep: final_output_json + status "completed"
- On any error: error_message + status "failed"

### 3.7 API Route Changes

**POST /api/seo-blog/start** will change from synchronous execution to async workflow submission:

```typescript
// Step 1 (synchronous)
const run = await createRun(input);
await executeSeoBlogWorkflow(run.id);
return { status: "started", run_id: run.id };

// Step 2 (asynchronous)
const run = await createRun(input);
await seoBlogWorkflow.submit({ run_id: run.id, input });
return { status: "started", run_id: run.id };
```

GET route remains unchanged—polls `seo_blog_runs` table for status.

### 3.8 AI SDK Integration Pattern

```typescript
import { generateText, generateObject } from 'ai';
import { initializeModel } from '@/lib/seo-blog-engine/utils/model-loader';

const model = await initializeModel();

// Structured outputs for research, outline, QA
const { object } = await generateObject({
  model,
  system: systemPrompt,
  prompt: userPrompt,
  schema: z.object({ /* schema */ }),
});

// Streaming for long draft content
const { text } = await generateText({
  model,
  system: systemPrompt,
  prompt: userPrompt,
});
```

Model loading reads from `AI_MODEL` env var for provider agnostic support.

### 3.9 SEO Machine Source Integration

Manual content adaptation from SEO Machine `/seomachine-main/`:

**Commands to reference:**
- `.claude/commands/article.md` → research workflow
- `.claude/commands/research.md` → research agent system prompt
- `.claude/commands/write.md` → writer agent system prompt
- `.claude/commands/optimize.md` → seo-qa agent system prompt
- `.claude/commands/scrub.md` → editor agent system prompt

**Agents to reference:**
- `.claude/agents/content-analyzer.md` → seo-qa logic
- `.claude/agents/keyword-mapper.md` → research logic
- `.claude/agents/seo-optimizer.md` → optimization logic
- `.claude/agents/meta-creator.md` → meta agent
- `.claude/agents/internal-linker.md` → internal link suggestions
- `.claude/agents/editor.md` → editor agent refinements

**Python logic to port conceptually to TypeScript:**
- `data_sources/modules/content_scorer.py` → content-scorer.ts
- `data_sources/modules/content_scrubber.py` → content-scrubber.ts
- `data_sources/modules/article_planner.py` → outline planning logic
- `data_sources/modules/section_writer.py` → section writing helpers

---

## PART 4: FILES & PACKAGES CHANGED IN STEP 2

### 4.1 New Packages to Install

```bash
pnpm add ai @ai-sdk/anthropic @ai-sdk/openai
pnpm add -D vercel-workflows
```

### 4.2 New Files to Create

**Utilities:**
- `lib/seo-blog-engine/utils/model-loader.ts` - Provider-agnostic model initialization
- `lib/seo-blog-engine/utils/web-search.ts` - AI Gateway web search integration
- `lib/seo-blog-engine/utils/content-scorer.ts` - SEO/readability scoring
- `lib/seo-blog-engine/utils/content-scrubber.ts` - AI phrasing removal

**Agent Prompts:**
- `lib/seo-blog-engine/agents/[agent-name]-agent/prompt.md` (8 files) - System prompts

**Workflow Steps (10 modules):**
- `lib/seo-blog-engine/steps/validate-input.ts`
- `lib/seo-blog-engine/steps/research-brief.ts`
- `lib/seo-blog-engine/steps/outline.ts`
- `lib/seo-blog-engine/steps/write-draft.ts`
- `lib/seo-blog-engine/steps/scrub-ai-language.ts`
- `lib/seo-blog-engine/steps/seo-qa.ts`
- `lib/seo-blog-engine/steps/brand-qa.ts`
- `lib/seo-blog-engine/steps/revise-if-needed.ts`
- `lib/seo-blog-engine/steps/final-output.ts`
- `lib/seo-blog-engine/steps/callback.ts`

### 4.3 Modified Files

- `lib/seo-blog-engine/workflow/seo-blog-workflow.ts` - Replace mock with Vercel Workflow SDK orchestration
- `app/api/seo-blog/start/route.ts` - Change to async workflow.submit() call
- `lib/seo-blog-engine/storage/runs.ts` - Add step-specific update methods
- `.env.local` or Vercel project settings - Add AI provider keys

---

## PART 5: KEY QUESTIONS FOR STEP 2

### Q1: AI Model Selection

**Recommendation**: Default to Anthropic Claude 3.5 Sonnet (better performance, lower cost).
- Set `AI_MODEL=claude-3-5-sonnet-20241022`
- Allow override via AI_PROVIDER and AI_MODEL env vars

### Q2: Web Search Integration

**Recommendation**: Use Vercel AI Gateway's default (Perplexity Search).
- No additional API keys needed if using Vercel AI Gateway

### Q3: Structured vs. Streaming

**Recommendation**: 
- Research/outline/QA: Structured JSON via `generateObject()` with Zod
- Blog draft: Streaming via `streamText()` for better UX

### Q4: Revision Threshold

**Recommendation**: Make configurable via Neon agent config (default: 75).
- Allows per-client tuning without code changes

### Q5: Error Recovery

**Recommendation**: Step-level retries (3 attempts, exponential backoff).
- Set status "failed" only after all retries exhausted

### Q6: Callback Webhook

**Recommendation**: Lightweight callback with run_id and status only.
- Full blog JSON available via GET status endpoint

### Q7: SEO Machine Prompts

**Recommendation**: Start with GitHub markdown files.
- Migrate optimized prompts to Neon configs for runtime tweaking

### Q8: Internal Link Suggestions

**Recommendation**: Create placeholder for now.
- Step 2 can query Neon for internal links map or use embeddings similarity

---

## Summary

**Step 1 Status**: ✅ **COMPLETE AND VALIDATED**
- Foundation ready for real AI
- Database properly structured  
- API routes functional
- All TypeScript checks passing

**Step 2 Readiness**: ✅ **READY TO BUILD**
- Clear 10-step workflow structure
- 8 agents with defined responsibilities
- Neon-first configuration pattern
- Final output schema defined
- No breaking changes to Step 1

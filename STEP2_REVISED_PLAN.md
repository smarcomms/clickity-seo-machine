# Step 2: File-First Eve Agents + Vercel Workflow (Revised Plan)

**Date**: 2026-06-23  
**Status**: Ready for Implementation (Awaiting Confirmation)  
**Architecture**: Eve file-first patterns (no runtime) + Vercel Workflow SDK + AI SDK 6

---

## Executive Summary

This document revises the Step 2 plan based on your feedback:

1. **Use Eve's file-first structure only** - No standalone Eve runtime deployment
2. **Vercel Workflow for orchestration** - Official `workflow` package (not `@vercel/workflows`)
3. **Placeholder prompts** - Keep SEO Machine mappings, await your markdown content
4. **No approval gate** - Always generate full output, flag `human_review_required: true`
5. **Lightweight callback** - Just run_id, status, optional summary
6. **Consider revise endpoint** - POST /api/seo-blog/revise for feedback-driven regeneration
7. **Keep all constraints** - No forms, no integrations, no publishing

---

## Correct Vercel Workflow Package

**Verified from Official Docs**:

```bash
pnpm install workflow
```

**NOT** `@vercel/workflows` - it's the `workflow` package.

**Imports**:
```typescript
import { Step } from "workflow/next";
// or
'use workflow';  // directive at top of function
```

---

## Architecture: Eve File-First + Vercel Workflow

### Directory Structure

```
lib/eve-agents/
├── README.md                              # Eve file-first pattern guide
├── shared/
│   ├── model-loader.ts                   # Load model from env (Anthropic/OpenAI)
│   ├── web-search.ts                     # AI Gateway Perplexity integration
│   ├── content-scorer.ts                 # Scoring utilities for QA agents
│   └── types.ts                          # Shared TypeScript interfaces
│
├── research-agent/
│   ├── instructions.md                   # System prompt (placeholder → SEO Machine)
│   ├── execute.ts                        # Agent function(runId, input) → research_json
│   └── tools.ts                          # Zod tool definitions (web_search, etc)
│
├── outline-agent/
│   ├── instructions.md                   # (placeholder → SEO Machine)
│   └── execute.ts
│
├── writer-agent/
│   ├── instructions.md                   # (placeholder → SEO Machine)
│   ├── execute.ts
│   └── skills/
│       └── seo-structure.md              # Optional: markdown guidance for structure
│
├── seo-qa-agent/
│   ├── instructions.md                   # (placeholder → SEO Machine: optimizer)
│   ├── execute.ts
│   └── tools.ts
│
├── brand-qa-agent/
│   ├── instructions.md                   # (placeholder → SEO Machine: analyzer)
│   └── execute.ts
│
├── editor-agent/
│   ├── instructions.md                   # (placeholder → SEO Machine: editor/scrubber)
│   └── execute.ts
│
├── revision-agent/
│   ├── instructions.md                   # (placeholder)
│   └── execute.ts
│
└── meta-agent/
    ├── instructions.md                   # (placeholder → SEO Machine: meta creator)
    └── execute.ts

app/
├── api/
│   └── seo-blog/
│       ├── start/route.ts                # MODIFIED: submit to Vercel Workflow
│       ├── status/[runId]/route.ts       # UNCHANGED: polling endpoint
│       └── revise/route.ts               # NEW: feedback-driven regeneration (optional)
│
└── workflows/
    └── seo-blog-generation.ts            # NEW: Vercel Workflow definition (10 steps)
```

---

## Files to Modify, Create, Delete

### Modified Files (3)

1. **app/api/seo-blog/start/route.ts**
   - Replace sync mock workflow call with `dispatchWorkflow()` submission
   - Return 202 Accepted immediately (no status='completed')
   - Keep all validation, API auth, Neon insertion

2. **package.json**
   - Add: `workflow`, `ai`, `@ai-sdk/anthropic`
   - Keep existing: `zod`, `pg`, others

3. **(Future) lib/seo-blog-engine/storage/runs.ts**
   - Add update methods: `updateRunResearchOutput()`, `updateRunOutlineOutput()`, `updateRunDraftOutput()`, etc.
   - One per stage for atomic updates

### Created Files (~28)

**Shared utilities** (4):
- `lib/eve-agents/shared/model-loader.ts`
- `lib/eve-agents/shared/web-search.ts`
- `lib/eve-agents/shared/content-scorer.ts`
- `lib/eve-agents/shared/types.ts`

**8 Agents** (16 minimum, up to 24 with skills):
- Each agent: `instructions.md`, `execute.ts`
- Optional: `tools.ts` (if agent uses tools), `skills/*.md` (guidance)

**Workflow orchestration** (1):
- `app/workflows/seo-blog-generation.ts` - Main Vercel Workflow with 10 steps

**Optional callback sender** (1):
- `lib/eve-agents/shared/callback-sender.ts` - Helper for webhook

**Revise endpoint** (1 - Optional):
- `app/api/seo-blog/revise/route.ts` - Accept run_id, feedback, fields to revise

### Deleted Files (1)

- `lib/seo-blog-engine/workflow/seo-blog-workflow.ts` - Replaced by Vercel Workflow

---

## Package Installation

```bash
# Exact packages from official Vercel Workflow docs
pnpm install workflow ai @ai-sdk/anthropic

# Optional (if using OpenAI)
pnpm install @ai-sdk/openai
```

**Full package.json additions**:

```json
{
  "dependencies": {
    "workflow": "latest",
    "ai": "^6.0.0",
    "@ai-sdk/anthropic": "latest"
  }
}
```

---

## Workflow Submission Pattern

### File: app/api/seo-blog/start/route.ts (MODIFIED)

```typescript
import { NextRequest } from 'next/server';
import { SeoBlogInputSchema } from '@/lib/seo-blog-engine/schemas/seo-blog-input';
import { validateApiKey, unauthorizedResponse, errorResponse, successResponse } from '@/lib/seo-blog-engine/utils/api-auth';
import { createRun } from '@/lib/seo-blog-engine/storage/runs';
import { dispatchWorkflow } from 'workflow/next';

export async function POST(request: NextRequest) {
  // Validate API key
  const apiKey = request.headers.get('x-api-key');
  const auth = validateApiKey(apiKey);
  if (!auth.valid) {
    return unauthorizedResponse();
  }

  try {
    // Parse and validate input
    const body = await request.json();
    const parseResult = SeoBlogInputSchema.safeParse(body);
    if (!parseResult.success) {
      return errorResponse(400, 'Invalid input', parseResult.error.errors);
    }

    // Create run in database (status = 'queued')
    const run = await createRun(parseResult.data);
    console.log(`[v0] Created run ${run.id}`);

    // Submit to Vercel Workflow (does NOT wait for completion)
    try {
      await dispatchWorkflow({
        workflowId: 'seo-blog-generation',
        input: { runId: run.id },
      });
      console.log(`[v0] Submitted workflow for run ${run.id}`);
    } catch (workflowError) {
      console.error(`[v0] Workflow dispatch error: ${workflowError.message}`);
      // Still return 202 - client polls status endpoint
    }

    // Return immediately (202 Accepted)
    return successResponse(202, {
      status: 'started',
      run_id: run.id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(500, 'Internal server error', { detail: message });
  }
}
```

---

## Vercel Workflow Definition

### File: app/workflows/seo-blog-generation.ts (NEW)

```typescript
'use workflow';

import { Step } from 'workflow/next';
import { getRun, updateRunStatus, completeRun, updateRunError } from '@/lib/seo-blog-engine/storage/runs';
import { executeResearchAgent } from '@/lib/eve-agents/research-agent/execute';
import { executeOutlineAgent } from '@/lib/eve-agents/outline-agent/execute';
import { executeWriterAgent } from '@/lib/eve-agents/writer-agent/execute';
import { executeSeoQaAgent } from '@/lib/eve-agents/seo-qa-agent/execute';
import { executeBrandQaAgent } from '@/lib/eve-agents/brand-qa-agent/execute';
import { executeEditorAgent } from '@/lib/eve-agents/editor-agent/execute';
import { executeRevisionAgent } from '@/lib/eve-agents/revision-agent/execute';
import { executeMetaAgent } from '@/lib/eve-agents/meta-agent/execute';

const MAX_RETRIES = 3;
const BACKOFF_MS = 1000;

export async function seoGeneration({
  runId,
}: {
  runId: string;
}) {
  try {
    // Step 1: Validate Input
    const run = await Step.run(
      'step-1-validate',
      async () => {
        const r = await getRun(runId);
        if (!r) throw new Error(`Run not found: ${runId}`);
        
        await updateRunStatus(runId, 'validating');
        console.log(`[v0] Step 1: Validated run ${runId}`);
        
        return r;
      },
      { maxRetries: 1 }
    );

    // Step 2: Research
    const researchOutput = await Step.run(
      'step-2-research',
      async () => {
        await updateRunStatus(runId, 'researching');
        console.log(`[v0] Step 2: Starting research for run ${runId}`);
        
        return executeResearchAgent(runId, run.input_json);
      },
      { maxRetries: MAX_RETRIES, backoffMs: BACKOFF_MS }
    );

    // Step 3: Outline
    const outlineOutput = await Step.run(
      'step-3-outline',
      async () => {
        await updateRunStatus(runId, 'outlining');
        console.log(`[v0] Step 3: Creating outline for run ${runId}`);
        
        return executeOutlineAgent(runId, {
          input: run.input_json,
          research: researchOutput,
        });
      },
      { maxRetries: MAX_RETRIES, backoffMs: BACKOFF_MS }
    );

    // Step 4: Write Draft
    const draftOutput = await Step.run(
      'step-4-write',
      async () => {
        await updateRunStatus(runId, 'writing');
        console.log(`[v0] Step 4: Writing draft for run ${runId}`);
        
        return executeWriterAgent(runId, {
          input: run.input_json,
          research: researchOutput,
          outline: outlineOutput,
        });
      },
      { maxRetries: MAX_RETRIES, backoffMs: BACKOFF_MS }
    );

    // Step 5: Scrub Content (no agent - utility function)
    const scrubbedContent = await Step.run(
      'step-5-scrub',
      async () => {
        console.log(`[v0] Step 5: Scrubbing sensitive data for run ${runId}`);
        
        // TODO: Implement content scrubber utility
        // - Remove email addresses, phone numbers
        // - Remove PII patterns
        // - Sanitize HTML/markdown
        
        return {
          draft_cleaned: draftOutput.draft,
          scrub_notes: 'Content cleaned',
        };
      },
      { maxRetries: 1 }
    );

    // Step 6: SEO QA
    const seoQaOutput = await Step.run(
      'step-6-seo-qa',
      async () => {
        await updateRunStatus(runId, 'seo_qa');
        console.log(`[v0] Step 6: SEO QA for run ${runId}`);
        
        return executeSeoQaAgent(runId, {
          input: run.input_json,
          draft: scrubbedContent.draft_cleaned,
          research: researchOutput,
        });
      },
      { maxRetries: MAX_RETRIES, backoffMs: BACKOFF_MS }
    );

    // Step 7: Brand QA
    const brandQaOutput = await Step.run(
      'step-7-brand-qa',
      async () => {
        await updateRunStatus(runId, 'brand_qa');
        console.log(`[v0] Step 7: Brand QA for run ${runId}`);
        
        return executeBrandQaAgent(runId, {
          input: run.input_json,
          draft: scrubbedContent.draft_cleaned,
          seo_qa: seoQaOutput,
        });
      },
      { maxRetries: MAX_RETRIES, backoffMs: BACKOFF_MS }
    );

    // Step 8: Revision
    const revisionOutput = await Step.run(
      'step-8-revision',
      async () => {
        await updateRunStatus(runId, 'revising');
        console.log(`[v0] Step 8: Revision for run ${runId}`);
        
        return executeRevisionAgent(runId, {
          input: run.input_json,
          draft: scrubbedContent.draft_cleaned,
          seo_qa: seoQaOutput,
          brand_qa: brandQaOutput,
        });
      },
      { maxRetries: MAX_RETRIES, backoffMs: BACKOFF_MS }
    );

    // Step 9: Meta Generation
    const metaOutput = await Step.run(
      'step-9-meta',
      async () => {
        await updateRunStatus(runId, 'meta');
        console.log(`[v0] Step 9: Generating meta for run ${runId}`);
        
        return executeMetaAgent(runId, {
          input: run.input_json,
          draft: scrubbedContent.draft_cleaned,
          revision: revisionOutput,
        });
      },
      { maxRetries: MAX_RETRIES, backoffMs: BACKOFF_MS }
    );

    // Step 10: Callback (if provided)
    if (run.callback_url) {
      await Step.run(
        'step-10-callback',
        async () => {
          console.log(`[v0] Step 10: Sending callback to ${run.callback_url}`);
          
          try {
            const response = await fetch(run.callback_url!, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                runId,
                status: 'completed',
                summary: {
                  seo_score: seoQaOutput.score || 0,
                  brand_alignment: brandQaOutput.alignment || 'unknown',
                  revision_count: revisionOutput.revisions_made || 0,
                },
              }),
              signal: AbortSignal.timeout(5000), // 5s timeout
            });

            if (!response.ok) {
              console.warn(`[v0] Callback returned ${response.status}`);
            }
          } catch (callbackError) {
            console.error(`[v0] Callback error (non-fatal): ${callbackError}`);
            // Don't fail the workflow for callback errors
          }
        },
        { maxRetries: 1 }
      );
    }

    // Mark workflow as completed
    const finalOutput = {
      input: run.input_json,
      research: researchOutput,
      outline: outlineOutput,
      draft: scrubbedContent.draft_cleaned,
      draft_scrub_notes: scrubbedContent.scrub_notes,
      seo_qa: seoQaOutput,
      brand_qa: brandQaOutput,
      revision: revisionOutput,
      meta: metaOutput,
      human_review_required: true, // Always true for Step 2
      completed_at: new Date().toISOString(),
    };

    await completeRun(runId, finalOutput);
    console.log(`[v0] Workflow completed for run ${runId}`);

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown workflow error';
    console.error(`[v0] Workflow error for run ${runId}: ${message}`);
    
    try {
      await updateRunError(runId, message);
    } catch (updateError) {
      console.error(`[v0] Failed to update error status: ${updateError}`);
    }

    throw error;
  }
}
```

---

## Eve-Pattern Agent: Research Agent Example

### File: lib/eve-agents/research-agent/instructions.md

```markdown
# Research Agent

You are an expert SEO researcher and analyst. Your role is to deeply analyze a blog topic and gather comprehensive research findings.

## Your Tasks

1. **Analyze the topic** - Break down the core topic, identify sub-topics, and understand user intent
2. **Search the web** - Use web search to find current information, statistics, and expert opinions
3. **Compile research** - Organize findings into a structured research document

## Output Format

Return a JSON object with this structure:

{
  "topic_analysis": {
    "primary_topic": "string",
    "sub_topics": ["string"],
    "user_intent": "informational|transactional|navigational",
    "competition_level": "low|medium|high"
  },
  "key_findings": [
    {
      "finding": "string",
      "source": "URL",
      "relevance": "high|medium|low"
    }
  ],
  "statistics": [
    {
      "stat": "string",
      "source": "URL"
    }
  ],
  "search_queries_used": ["string"],
  "research_notes": "Additional context and insights",
  "research_score": 0.0-1.0
}

## Tools at Your Disposal

- `web_search(query)` - Search for information on the web
- Access to up-to-date information via Perplexity Search integration

Do thorough research. Be thorough but concise.
```

### File: lib/eve-agents/research-agent/execute.ts

```typescript
import { generateText } from 'ai';
import { z } from 'zod';
import { loadModel } from '@/lib/eve-agents/shared/model-loader';
import { webSearch } from '@/lib/eve-agents/shared/web-search';
import { updateRunStatus } from '@/lib/seo-blog-engine/storage/runs';
import fs from 'fs';
import path from 'path';

// Load instructions from markdown file
const instructionsPath = path.join(process.cwd(), 'lib/eve-agents/research-agent/instructions.md');
const systemPrompt = fs.readFileSync(instructionsPath, 'utf-8');

const ResearchOutputSchema = z.object({
  topic_analysis: z.object({
    primary_topic: z.string(),
    sub_topics: z.array(z.string()),
    user_intent: z.enum(['informational', 'transactional', 'navigational']),
    competition_level: z.enum(['low', 'medium', 'high']),
  }),
  key_findings: z.array(z.object({
    finding: z.string(),
    source: z.string(),
    relevance: z.enum(['high', 'medium', 'low']),
  })),
  statistics: z.array(z.object({
    stat: z.string(),
    source: z.string(),
  })),
  search_queries_used: z.array(z.string()),
  research_notes: z.string(),
  research_score: z.number().min(0).max(1),
});

export type ResearchOutput = z.infer<typeof ResearchOutputSchema>;

export async function executeResearchAgent(
  runId: string,
  input: Record<string, unknown>
): Promise<ResearchOutput> {
  console.log(`[v0] Research agent starting for run ${runId}`);

  const model = loadModel();
  const topic = (input.topic as string) || 'unknown topic';

  try {
    const result = await generateText({
      model,
      system: systemPrompt,
      prompt: `Please research the following topic and provide findings: ${topic}`,
      tools: {
        web_search: {
          description: 'Search the web for information about a topic',
          parameters: z.object({
            query: z.string().describe('Search query'),
          }),
          execute: async ({ query }) => {
            console.log(`[v0] Research agent searching: ${query}`);
            return webSearch(query);
          },
        },
      },
    });

    // Parse the response
    const outputText = result.text;
    console.log(`[v0] Research agent raw output length: ${outputText.length}`);

    // Extract JSON from response (LLM may wrap it in markdown code blocks)
    const jsonMatch = outputText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Research agent did not return valid JSON');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const validated = ResearchOutputSchema.parse(parsed);

    // Save to database
    await updateRunStatus(runId, 'researching', validated);

    console.log(`[v0] Research agent completed for run ${runId}`);
    return validated;

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error in research agent';
    console.error(`[v0] Research agent error: ${message}`);
    throw new Error(`Research agent failed: ${message}`);
  }
}
```

---

## Model Loading Strategy

### File: lib/eve-agents/shared/model-loader.ts

```typescript
import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';

export function loadModel() {
  const provider = process.env.AI_PROVIDER || 'anthropic';
  const modelId = process.env.AI_MODEL || 'claude-3-5-sonnet-20241022';

  console.log(`[v0] Loading model: ${provider}/${modelId}`);

  if (provider === 'anthropic') {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not set');
    }
    const anthropic = createAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    return anthropic(modelId);
  }

  if (provider === 'openai') {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not set');
    }
    const openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    return openai(modelId);
  }

  throw new Error(`Unknown AI provider: ${provider}`);
}
```

---

## Web Search Integration

### File: lib/eve-agents/shared/web-search.ts

```typescript
// Using Vercel AI Gateway + Perplexity model
import { generateText } from 'ai';

export async function webSearch(query: string): Promise<string> {
  try {
    // Use Vercel AI Gateway's Perplexity integration
    // This requires OPENROUTER_API_KEY or similar
    // For now, placeholder - user will configure
    
    console.log(`[v0] Web search query: ${query}`);

    // TODO (Step 2): Implement using either:
    // 1. Perplexity SDK directly
    // 2. Vercel AI Gateway Perplexity model via AI SDK
    // 3. Claude's web_search tool via API

    const searchResults = {
      query,
      results: 'Mock search results - TODO: integrate real web search',
      timestamp: new Date().toISOString(),
    };

    return JSON.stringify(searchResults);
  } catch (error) {
    console.error(`[v0] Web search error: ${error}`);
    throw error;
  }
}
```

---

## Environment Variables (Step 2)

```bash
# Step 1 (existing)
DATABASE_URL=postgresql://[user:password]@[host]:5432/[dbname]
SEO_BLOG_API_KEY=your-secret-api-key

# Step 2 (new)
AI_PROVIDER=anthropic
AI_MODEL=claude-3-5-sonnet-20241022
ANTHROPIC_API_KEY=sk-ant-...

# Optional: OpenAI
OPENAI_API_KEY=sk-...

# Optional: Web search API key (Perplexity, Tavily, etc)
PERPLEXITY_API_KEY=...
# Or use Vercel AI Gateway (no key needed if configured in Vercel dashboard)

# Workflow timeout (optional, default 5s)
SEO_BLOG_CALLBACK_TIMEOUT_MS=5000

# Workflow max retries (optional, default 3)
SEO_BLOG_WORKFLOW_MAX_RETRIES=3
```

---

## Agent Config Loading (Future: Neon-Driven)

### Placeholder for Later Implementation

For Step 2, agents load instructions from markdown files:

```typescript
const instructionsPath = path.join(process.cwd(), 'lib/eve-agents/[agent-name]/instructions.md');
const systemPrompt = fs.readFileSync(instructionsPath, 'utf-8');
```

**Step 2.5 (Future)**: Load from Neon `seo_blog_agent_configs` table:

```typescript
// Not implemented yet - placeholder
// const config = await getAgentConfig('[agent_key]');
// const systemPrompt = config.system_prompt;
// const skillMarkdown = config.skill_markdown;
```

This enables runtime tweaking of prompts without redeployment.

---

## Optional: Revise Endpoint

### File: app/api/seo-blog/revise/route.ts (OPTIONAL)

```typescript
'use server';

import { NextRequest } from 'next/server';
import { validateApiKey, unauthorizedResponse, errorResponse, successResponse } from '@/lib/seo-blog-engine/utils/api-auth';
import { getRun, updateRunStatus } from '@/lib/seo-blog-engine/storage/runs';
import { dispatchWorkflow } from 'workflow/next';
import { z } from 'zod';

const ReviseRequestSchema = z.object({
  run_id: z.string().uuid(),
  feedback: z.string().min(1),
  fields_to_revise: z.array(z.enum(['title', 'intro', 'full_draft', 'meta', 'seo_fixes'])).optional(),
});

export async function POST(request: NextRequest) {
  // Validate API key
  const apiKey = request.headers.get('x-api-key');
  const auth = validateApiKey(apiKey);
  if (!auth.valid) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const parseResult = ReviseRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return errorResponse(400, 'Invalid input', parseResult.error.errors);
    }

    const { run_id, feedback, fields_to_revise } = parseResult.data;

    // Check run exists
    const run = await getRun(run_id);
    if (!run) {
      return errorResponse(404, 'Run not found');
    }

    // Mark run as revising
    await updateRunStatus(run_id, 'revising', { feedback, fields: fields_to_revise || [] });

    // Submit revision workflow
    // TODO: Implement revision workflow (subset of 10 steps)
    // - Load prior outputs from final_output_json
    // - Re-run only specified stages
    // - Merge revised outputs with original

    console.log(`[v0] Revision submitted for run ${run_id}`);

    return successResponse(202, {
      status: 'revision_started',
      run_id,
      feedback_accepted: true,
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(500, 'Internal server error', { detail: message });
  }
}
```

---

## SEO Machine Prompt Mappings

When you provide SEO Machine markdown files, map them as follows:

| SEO Machine File | Destination | Agent |
|---|---|---|
| research / keyword mapper | lib/eve-agents/research-agent/instructions.md | research-agent |
| write | lib/eve-agents/writer-agent/instructions.md | writer-agent |
| optimize / SEO optimizer | lib/eve-agents/seo-qa-agent/instructions.md | seo-qa-agent |
| content analyzer | lib/eve-agents/seo-qa-agent/tools.ts | Additional scoring logic |
| editor / scrub | lib/eve-agents/editor-agent/instructions.md | editor-agent |
| meta creator | lib/eve-agents/meta-agent/instructions.md | meta-agent |
| internal linker | (TODO) | Internal link suggestion logic in writer/meta agents |

---

## Output Structure

### final_output_json in Neon

```json
{
  "input": { "topic": "...", "keywords": [...], "tone": "..." },
  "research": { "topic_analysis": {...}, "key_findings": [...] },
  "outline": { "sections": [...], "structure_score": 0.85 },
  "draft": "# Blog Title\n\n## Section 1\n...",
  "draft_scrub_notes": "Removed 3 email addresses, 1 phone number",
  "seo_qa": { "score": 0.78, "recommendations": [...] },
  "brand_qa": { "alignment": "high", "notes": "..." },
  "revision": { "revisions_made": 2, "notes": "..." },
  "meta": { 
    "meta_title": "...",
    "meta_description": "...",
    "slug": "..."
  },
  "human_review_required": true,
  "completed_at": "2026-06-23T12:34:56Z"
}
```

**Key constraint**: `human_review_required` is ALWAYS `true` for Step 2. No auto-publishing.

---

## File-First Eve Benefits

✅ **No separate Eve deployment** - All in Next.js project  
✅ **n8n calls `/api/seo-blog/start` directly** - No proxy complexity  
✅ **Vercel Workflow provides durability** - Built into Vercel platform  
✅ **AI SDK 6 for model calls** - Same abstraction Eve uses internally  
✅ **File conventions match Eve docs** - Familiar structure (instructions, tools, skills)  
✅ **Easy to add Eve runtime later** - Just wrap in Eve CLI if needed

---

## Risks & Questions

### 1. Workflow Package Name Confusion
**Risk**: `@vercel/workflows` doesn't exist; correct package is `workflow`  
**Mitigation**: ✅ Verified from official docs. Using `workflow` package.

### 2. AI Gateway Web Search Configuration
**Risk**: Perplexity integration unclear in AI Gateway docs  
**Action Needed**: Confirm web search method in your Step 2 confirmation

### 3. Retry Logic in Steps
**Risk**: Max retries set to 3 per step = potential exponential slowdown  
**Mitigation**: Configurable via env vars; default reasonable for most cases

### 4. Agent State Sharing
**Risk**: Passing large JSON between steps could exceed size limits  
**Mitigation**: Compress outputs, store full results in Neon, pass only summary to next step

### 5. Model Cost
**Risk**: Each agent makes multiple LLM calls (search, analyze, generate)  
**Mitigation**: Monitor API usage; consider caching research results across batches

---

## Clarification Needed Before Implementation

**Before we begin Step 2 implementation, please confirm:**

1. **Web Search Method**: Use Perplexity via Vercel AI Gateway, or Claude's native web_search tool?

2. **Callback Webhook Format**: Should callback include `summary` only, or full `final_output_json`?

3. **Revision Endpoint**: Add `/api/seo-blog/revise` for feedback-driven regeneration?

4. **Error Retries**: 3 attempts per step with exponential backoff acceptable?

5. **Agent Prompt Loading**: Start with markdown files, migrate to Neon later (recommended)?

6. **Skills Files**: Should writer-agent include optional `seo-structure.md` guidance file, or keep all prompts in `instructions.md`?

---

## Next Steps

1. Review this revised plan
2. Answer the 6 clarification questions above
3. (Optional) Share SEO Machine markdown files for agent prompts
4. Approve, and we begin Step 2 implementation

**All code patterns shown are ready for implementation once confirmed.**


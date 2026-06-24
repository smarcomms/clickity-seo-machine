# Step 2: Eve Integration + Vercel Workflow Orchestration Plan

**Date**: 2026-06-23  
**Status**: Planning Phase  
**Eve Version**: Latest (@latest from npm)  
**Constraint**: This is an **existing Next.js project**, not a standalone Eve app

---

## Executive Summary

Step 2 replaces the mocked workflow with:
- **Real Eve agents**: 8 specialist subagents (research, outline, writer, seo-qa, brand-qa, editor, revision, meta)
- **Vercel Workflow**: Durable orchestration of the 10-step blog generation process
- **AI Gateway integration**: Model routing through Vercel AI Gateway (Anthropic Claude or OpenAI by default)
- **Web search**: Perplexity Search via AI Gateway for research findings
- **Status persistence**: All stage outputs saved to Neon (`seo_blog_runs` table)

---

## Architecture Decision: Embedded Eve vs Standalone Eve

### Key Question: Can Eve run inside existing Next.js projects?

**Answer**: **Not natively.** Eve is a **standalone agent framework** with its own CLI, dev server, and runtime model. It is **NOT a library** you import into Next.js.

**However**, the solution is **clear**: Use Eve's **file-first patterns** (instructions.md, tools/, skills/, subagents/) inside a `lib/eve-agents/` directory **without installing Eve itself**. This gives us:
- ✅ File-first agent definition (markdown instructions, TypeScript tools)
- ✅ Vercel Workflow handles orchestration (not Eve's durable workflow)
- ✅ AI SDK 6 handles model calls (Eve's abstraction layer)
- ✅ Same subagent structure (multiple agents, each with own prompts/tools)
- ✅ No Eve runtime dependency

**Why not use Eve standalone**: n8n calls `/api/seo-blog/start` (HTTP endpoint in Next.js), not an Eve project root. Eve's HTTP server would be a separate deployment, adding complexity.

---

## Architecture: File-First Subagents + Vercel Workflow

### Directory Structure (New)

```
lib/eve-agents/
├── README.md                           # Documentation of the Eve pattern we're following
├── research-agent/
│   ├── instructions.md
│   ├── tools.ts                       # Zod-validated tools for this agent
│   └── lib/
│       └── web-search.ts              # Shared by research agent
├── outline-agent/
│   ├── instructions.md
│   └── tools.ts
├── writer-agent/
│   ├── instructions.md
│   ├── tools.ts
│   └── skills/
│       └── seo-structure.md           # Markdown procedure/guide
├── seo-qa-agent/
│   ├── instructions.md
│   └── tools.ts
├── brand-qa-agent/
│   ├── instructions.md
│   └── tools.ts
├── editor-agent/
│   ├── instructions.md
│   └── tools.ts
├── revision-agent/
│   ├── instructions.md
│   └── tools.ts
├── meta-agent/
│   ├── instructions.md
│   └── tools.ts
└── shared/
    ├── scoring.ts                     # Content scoring (shared by QA agents)
    ├── model-loader.ts                # Load model from env vars
    └── types.ts                        # Shared interfaces

app/
├── api/
│   └── seo-blog/
│       ├── start/route.ts             # MODIFIED: submit workflow
│       ├── status/[runId]/route.ts    # No change
│       └── workflows/                 # NEW
│           └── generate-blog.ts       # Vercel Workflow definition
└── workflows/
    └── seo-blog-generation.ts         # Workflow step implementations
```

### Step 1 → Step 2 Changes

**Modified Files** (3):
- `app/api/seo-blog/start/route.ts` - Switch from sync mock to Vercel Workflow submission
- `lib/seo-blog-engine/workflow/seo-blog-workflow.ts` - Remove completely (replaced by Vercel Workflow)
- `package.json` - Add dependencies

**Deleted Files** (1):
- `lib/seo-blog-engine/workflow/seo-blog-workflow.ts` - Workflow SDK replaces this

**Unchanged Files**:
- All storage, schemas, API auth, database layer stays the same
- `app/api/seo-blog/status/[runId]/route.ts` - Polling endpoint unchanged
- Database tables unchanged

---

## Vercel Workflow: The 10-Step Orchestration

### Step Flow

```
1. Validate Input
   ↓ (to Neon: status='validating')
2. Research (via research-agent)
   ↓ (save research_json)
3. Outline (via outline-agent)
   ↓ (save outline_json)
4. Write Draft (via writer-agent)
   ↓ (save draft_markdown)
5. Scrub Content (utility: remove sensitive data, etc)
   ↓
6. SEO QA (via seo-qa-agent)
   ↓
7. Brand QA (via brand-qa-agent)
   ↓
8. Revision (via revision-agent)
   ↓ (save optimized_json with all QA notes)
9. Meta Generation (via meta-agent)
   ↓ (save final_output_json)
10. Callback (optional webhook to callback_url if provided)
    ↓
    status='completed' (or 'failed' on error)
```

### Workflow Implementation Pattern

**File**: `app/workflows/seo-blog-generation.ts`

```typescript
// Using Vercel Workflow SDK (use workflow / use step)
"use workflow";

import { Step } from "@vercel/workflows/next";
import { executeResearchAgent } from "@/lib/eve-agents/research-agent/execute";
import { executeOutlineAgent } from "@/lib/eve-agents/outline-agent/execute";
// ... etc for all 8 agents

export async function generateBlogWorkflow(runId: string) {
  // Step 1: Validate
  await Step.run("validate", async () => {
    const run = await getRun(runId);
    if (!run) throw new Error(`Run ${runId} not found`);
    return { valid: true };
  });

  // Step 2: Research
  const researchResult = await Step.run("research", async () => {
    return executeResearchAgent(runId, run.input_json);
  });

  // Step 3: Outline
  const outlineResult = await Step.run("outline", async () => {
    return executeOutlineAgent(runId, researchResult);
  });

  // ... steps 4-9
  
  // Step 10: Callback
  if (run.callback_url) {
    await Step.run("callback", async () => {
      await fetch(run.callback_url, {
        method: "POST",
        body: JSON.stringify({ runId, status: "completed" }),
      });
    });
  }
}
```

### Key Workflow Properties

- **Durable**: Checkpoints after each step. If a step fails, it retries 3x with exponential backoff.
- **Resumable**: If the workflow crashes mid-step, it re-runs from the last checkpoint.
- **Status tracking**: Each step updates Neon with status and stage output.
- **Callback optional**: If callback_url exists, calls it at the end (lightweight notification).

---

## Eve-Pattern Agents (No Eve Runtime)

### Research Agent Pattern

**File**: `lib/eve-agents/research-agent/instructions.md`

```markdown
# Research Agent

You are an expert SEO researcher. Your job is to:

1. Analyze the topic and target keywords
2. Search for relevant information using web search
3. Compile research findings into structured JSON

Output research findings as JSON with:
- key_findings: array of main points
- supporting_sources: array of URLs
- search_terms_used: what searches were run
- topic_analysis: brief analysis
```

**File**: `lib/eve-agents/research-agent/execute.ts`

```typescript
import { generateText } from "ai";
import { instructions } from "./instructions.md";
import { webSearch } from "@/lib/eve-agents/shared/web-search";

export async function executeResearchAgent(
  runId: string,
  input: Record<string, unknown>
) {
  const model = loadModel(); // from env: AI_MODEL, provider API keys

  const result = await generateText({
    model,
    system: instructions,
    prompt: `Research this topic: ${JSON.stringify(input)}`,
    tools: {
      web_search: {
        description: "Search the web for information",
        parameters: z.object({
          query: z.string(),
        }),
        execute: async ({ query }) => webSearch(query),
      },
    },
  });

  // Save to Neon
  await updateRunStatus(runId, "researching", { content: result.text });
  
  return JSON.parse(result.text);
}
```

### Shared Web Search Tool

**File**: `lib/eve-agents/shared/web-search.ts`

```typescript
import { createClient } from "@perplexity/sdk"; // or use AI Gateway

export async function webSearch(query: string) {
  // Option A: Use Perplexity directly via SDK
  // Option B: Use Vercel AI Gateway (Perplexity Search model)
  
  const response = await generateText({
    model: "perplexity/sonar", // via AI Gateway
    prompt: `Search and summarize: ${query}`,
  });

  return {
    query,
    results: response.text,
    timestamp: new Date().toISOString(),
  };
}
```

### All 8 Agents Follow Same Pattern

- **instructions.md** - System prompt
- **execute.ts** - AgentFunction(runId, input) → JSON output
- **tools.ts** - Zod-validated tool definitions (optional)

---

## Package List (New Dependencies)

### Core Workflow & AI

```json
{
  "dependencies": {
    "ai": "^6.0.0",
    "@ai-sdk/anthropic": "^0.2.0",
    "@ai-sdk/openai": "^1.0.0",
    "@vercel/workflows": "^1.0.0"
  },
  "devDependencies": {
    "zod": "^3.20.0"
  }
}
```

### Optional Providers (Pick One or More)

- `@ai-sdk/anthropic` - For Claude models (recommended: claude-opus-4.6)
- `@ai-sdk/openai` - For GPT-4
- Vercel AI Gateway default (routes through gateway, no SDK package needed)

### Note on AI Gateway

- Vercel AI Gateway is **pre-configured** in Vercel projects
- Models like `anthropic/claude-opus-4.6` route through AI Gateway without installing `@ai-sdk/anthropic`
- Or install provider SDK and use `anthropic("claude-opus-4.6")` from `@ai-sdk/anthropic`
- We should use `@ai-sdk/anthropic` explicitly for better control

---

## Model Selection Strategy

### File: `lib/eve-agents/shared/model-loader.ts`

```typescript
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";

export function loadModel() {
  const provider = process.env.AI_PROVIDER || "anthropic";
  const modelId = process.env.AI_MODEL || "claude-3-5-sonnet-20241022";

  if (provider === "anthropic") {
    const anthropic = createAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    return anthropic(modelId);
  } else if (provider === "openai") {
    const openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    return openai(modelId);
  }

  throw new Error(`Unknown provider: ${provider}`);
}
```

### Environment Variables (Step 2)

```
# Database (existing from Step 1)
DATABASE_URL=postgresql://...
SEO_BLOG_API_KEY=...

# AI Provider Selection
AI_PROVIDER=anthropic
AI_MODEL=claude-3-5-sonnet-20241022
ANTHROPIC_API_KEY=sk-ant-...

# Optional: OpenAI fallback
OPENAI_API_KEY=sk-...

# Callback timeout
SEO_BLOG_CALLBACK_TIMEOUT_MS=5000
```

---

## Workflow SDK Integration

### File: `app/api/seo-blog/start/route.ts` (MODIFIED)

```typescript
import { dispatchWorkflow } from "@vercel/workflows/next";

export async function POST(request: NextRequest) {
  // ... existing validation ...

  const run = await createRun(parseResult.data);
  console.log(`[v0] Created run ${run.id}`);

  // Submit to Vercel Workflow
  await dispatchWorkflow({
    workflowId: "generate-blog",
    input: { runId: run.id },
  });

  return successResponse(202, {
    status: "started",
    run_id: run.id,
  });
}
```

### File: `app/workflows/seo-blog-generation.ts` (NEW)

```typescript
"use workflow";

import { Step } from "@vercel/workflows/next";
import { executeResearchAgent } from "@/lib/eve-agents/research-agent/execute";
// ... imports for all 8 agents

export async function generateBlogWorkflow({
  runId,
}: {
  runId: string;
}) {
  const MAX_RETRIES = 3;
  const BACKOFF_MS = 1000;

  try {
    // Step 1: Validate
    const run = await Step.run(
      "validate-input",
      async () => {
        const r = await getRun(runId);
        if (!r) throw new Error(`Run not found: ${runId}`);
        await updateRunStatus(runId, "validating");
        return r;
      },
      { maxRetries: MAX_RETRIES, backoffMs: BACKOFF_MS }
    );

    // Step 2: Research
    const researchOutput = await Step.run(
      "research",
      async () => {
        await updateRunStatus(runId, "researching");
        return executeResearchAgent(runId, run.input_json);
      },
      { maxRetries: MAX_RETRIES, backoffMs: BACKOFF_MS }
    );

    // Step 3: Outline
    const outlineOutput = await Step.run(
      "outline",
      async () => {
        await updateRunStatus(runId, "outlining");
        return executeOutlineAgent(runId, { 
          input: run.input_json, 
          research: researchOutput 
        });
      },
      { maxRetries: MAX_RETRIES, backoffMs: BACKOFF_MS }
    );

    // ... Steps 4-9 following same pattern

    // Step 10: Optional Callback
    if (run.callback_url) {
      await Step.run(
        "send-callback",
        async () => {
          await fetch(run.callback_url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              runId,
              status: "completed",
              finalOutput: { /* summary */ },
            }),
          });
        },
        { maxRetries: 1 }
      );
    }

    // Mark as completed
    await completeRun(runId, { /* final output */ });
  } catch (error) {
    await updateRunError(runId, error.message);
    throw error;
  }
}
```

---

## Storage Updates (Neon)

### New Columns (None - existing schema sufficient)

The Step 1 schema already supports:
- `research_json` → stores agent output from research-agent
- `outline_json` → stores agent output from outline-agent
- `draft_markdown` → stores writer output
- `optimized_json` → stores QA notes from seo-qa + brand-qa
- `final_output_json` → stores meta generation output

### New Storage Methods

**File**: `lib/seo-blog-engine/storage/runs.ts` (ADD METHODS)

```typescript
// For each step to save specific stage output
export async function updateRunResearchOutput(
  runId: string,
  research_json: Record<string, unknown>
): Promise<void> {
  await query(
    `UPDATE seo_blog_runs SET research_json = $2, updated_at = NOW() WHERE id = $1`,
    [runId, JSON.stringify(research_json)]
  );
}

export async function updateRunOutlineOutput(
  runId: string,
  outline_json: Record<string, unknown>
): Promise<void> {
  // Similar pattern
}

// ... one method per stage
```

---

## Risks & Unclear Parts from Eve Docs

### 1. Web Search Integration

**Question**: How does Eve's `load_skill` work with AI Gateway web search?

**Answer from docs**: Eve provides a default `web` tool. For Perplexity Search:
- Either use `defineTool` to wrap Perplexity SDK
- Or use a model that supports web search natively (Claude with web_search tool)

**Action**: Use AI SDK's built-in search, or wrap Perplexity with `defineTool` pattern in `lib/eve-agents/shared/web-search.ts`

### 2. Eve Channels vs Our HTTP Endpoint

**Question**: Do we need Eve's HTTP channel layer?

**Answer**: No. Eve's channels (Slack, Discord, web UI) are optional. We're using our own Next.js API routes. No channels needed.

### 3. Subagent State Sharing

**Question**: Can subagents see the parent workflow state?

**Answer from docs**: 
- Built-in `agent` tool (copy of main agent) shares sandbox & tools
- Declared subagents start with fresh state
- We're not using Eve's subagent structure; we're using our own agent pattern

**Action**: Pass state explicitly via function parameters (input JSON → agent execute function → output JSON → Workflow step)

### 4. Skills vs Tools

**Question**: Should QA agents use skills (markdown playbooks) or tools (TypeScript)?

**Answer**: 
- Skills = on-demand procedures (use when model needs guidance)
- Tools = executable functions (use when model needs to call code)

**Action**: 
- Use tools for all agent-callable functions (web search, content scoring)
- Use optional markdown skills in agent instructions for guidance (e.g., `writer-agent/skills/seo-structure.md`)

### 5. Eve Sessions & Durability

**Question**: Eve uses sessions for durability. Do we need that?

**Answer**: 
- Eve's session model is for multi-turn conversations (user messages, agent responses, streaming)
- We're running a **single orchestrated workflow**
- Vercel Workflow provides durability (steps checkpoint)

**Action**: Don't use Eve's session model. Let Vercel Workflow handle durability.

---

## File-First vs Eve Runtime: Trade-offs

### Why NOT Use Eve Runtime

| Factor | Standalone Eve | File-First Pattern (Recommended) |
|--------|---|---|
| Installation | `npx eve init` creates new project | Add to `lib/eve-agents/` in existing Next.js |
| HTTP Server | Eve HTTP channel (`/eve/v1/session`) | Our existing `/api/seo-blog/` routes |
| Orchestration | Eve's durable session model | Vercel Workflow (`"use workflow"`) |
| Model Calls | Eve abstracts via `generateText` | Direct AI SDK 6 `generateText` |
| Deployment | Deploy Eve project to Vercel | Next.js app, no separate Eve deployment |
| n8n Integration | Would need proxy to Eve HTTP | Direct `/api/seo-blog/start` endpoint |
| **Complexity** | 2 deployments (Eve + Next.js) | 1 deployment (Next.js with embedded agents) |

### Why File-First Pattern Works

- ✅ Keep existing Next.js project structure
- ✅ Use same database, auth, schemas as Step 1
- ✅ n8n calls `/api/seo-blog/start` directly (no proxy)
- ✅ Vercel Workflow handles orchestration (official SDK)
- ✅ AI SDK 6 handles models (same as Eve under the hood)
- ✅ Follow Eve's directory conventions (instructions, tools, skills) without Eve runtime

---

## Recommended Implementation Order

1. **Install dependencies** - Add `ai`, `@ai-sdk/anthropic`, `@vercel/workflows`
2. **Create agent base structure** - 8 directories with instructions.md + execute.ts
3. **Implement research-agent first** - Most complex (web search)
4. **Implement outline-agent** - Simpler (text processing)
5. **Implement writer-agent** - Long-form content generation
6. **Implement QA agents** - (seo-qa, brand-qa, editor, revision, meta) - can be parallel
7. **Create Vercel Workflow** - Orchestrate all 8 in order
8. **Modify `/api/seo-blog/start`** - Submit workflow instead of running mocked sync
9. **Test end-to-end** - Via curl or n8n

---

## Open Questions for User Confirmation

1. **Model choice**: Recommend Claude 3.5 Sonnet (Anthropic) via AI SDK. Agree? Or prefer OpenAI GPT-4?
2. **Web search**: Use Perplexity Search via AI Gateway? Or Claude's native web_search tool?
3. **Callback webhook**: Should callback include full final_output_json or just summary?
4. **Retry strategy**: 3 attempts per step with exponential backoff - acceptable?
5. **Human review gate**: Add approval step before final_output_json, or just flag `human_review_required=true` in output?
6. **Skills vs inline prompts**: Should writer-agent use a `seo-structure.md` skill, or keep all instructions in instructions.md?

---

## Summary

**Step 2 Architecture**:
- Eve-style file-first agents (no Eve runtime)
- Vercel Workflow for 10-step orchestration
- AI SDK 6 for model calls (Anthropic Claude default)
- Perplexity Search for web research
- Neon for persistent output storage
- Existing `/api/seo-blog/` routes (no Eve channels)

**Files Modified**: 3 (start/route.ts, workflow.ts → deleted, package.json)  
**New Files**: ~30 (8 agents × [instructions.md, execute.ts], 5 workflow modules, shared utilities)  
**Database Changes**: None (Step 1 schema sufficient)  
**Risks**: Eve documentation is beta; subagent delegation pattern differs from Eve's native subagents

**Status**: Ready for user approval + clarification on 6 questions above.

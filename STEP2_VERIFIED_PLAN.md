# Step 2: Verified Implementation Plan (from Workflow SDK AI Docs)

## Corrected Package & Import Pattern

### Install Dependencies
```bash
pnpm add workflow @workflow/ai ai
```

### Correct Imports (Verified from Docs)
```typescript
// Workflow directive
"use workflow";
"use step";

// For DurableAgent
import { DurableAgent } from "@workflow/ai/agent";
import { getWritable } from "workflow";
import { start } from "workflow/api";

// For AI SDK model
import { openai } from "@workflow/ai/openai"; // For OpenAI
// OR use string model names with Vercel AI Gateway:
const model = "anthropic/claude-3-5-sonnet-20241022";
```

### Next.js Config (Required)
```typescript
// next.config.mjs
import { withWorkflow } from "workflow/next";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ... rest of your config
};

export default withWorkflow(nextConfig);
```

---

## Correct Start Pattern from `POST /api/seo-blog/start`

### API Route (Verified from Docs)
```typescript
// app/api/seo-blog/start/route.ts
import { start } from "workflow/api"; // [!code highlight]
import { seoBlogWorkflow } from "@/workflows/seo-blog-workflow";
import { createRun } from "@/lib/seo-blog-engine/storage/runs";
import { validateApiKey } from "@/lib/seo-blog-engine/utils/api-auth";

export async function POST(req: Request) {
  // Validate API key
  const apiKey = req.headers.get("x-api-key");
  if (!validateApiKey(apiKey)) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Parse and validate input
  const input = await req.json();
  const parsed = SeoBlogInputSchema.safeParse(input);
  if (!parsed.success) {
    return new Response(JSON.stringify({ errors: parsed.error }), { status: 400 });
  }

  // Create run record in Neon (BEFORE starting workflow)
  const run = await createRun(parsed.data);

  // Start durable workflow (using workflow SDK)
  const workflowRun = await start(seoBlogWorkflow, [run.id, parsed.data]); // [!code highlight]

  // Return immediately with run ID
  return new Response(
    JSON.stringify({
      status: "started",
      run_id: run.id,
      workflow_run_id: workflowRun.id,
    }),
    { status: 202 }
  );
}
```

**Key Points:**
- `start()` from `workflow/api` submits the workflow for execution
- Returns a `Run` object with `.id` and `.readable` (stream)
- Does NOT wait for completion - returns immediately (async execution)
- We create Neon run record BEFORE starting workflow

---

## Correct Workflow Definition (Verified from Docs)

### Workflow Function with DurableAgent
```typescript
// lib/workflows/seo-blog-workflow.ts
import { DurableAgent } from "@workflow/ai/agent"; // [!code highlight]
import { getWritable } from "workflow"; // [!code highlight]
import { updateRunStatus } from "@/lib/seo-blog-engine/storage/runs";
import type { UIMessageChunk } from "ai";

export async function seoBlogWorkflow(
  runId: string,
  input: SeoBlogInput
) {
  "use workflow"; // [!code highlight] - Required directive

  const writable = getWritable<string>(); // [!code highlight] - Persistent stream

  try {
    // Load agent configs from Neon
    const agents = await getAllAgentConfigs(); // From DB

    // Step 1: Research
    await updateRunStatus(runId, "researching");
    const researchAgent = new DurableAgent({
      model: "anthropic/claude-3-5-sonnet-20241022", // String model name for Vercel AI Gateway
      // OR: model: openai("gpt-4-turbo"), // If using provider directly
      instructions: agents.find(a => a.agent_key === "research")?.system_prompt,
      tools: { /* research tools */ },
    });

    const researchResult = await researchAgent.stream({
      messages: [/* research messages */],
      writable,
    });
    await updateRunStatus(runId, "researching", { research_json: researchResult });

    // Step 2: Outline
    await updateRunStatus(runId, "outlining");
    const outlineAgent = new DurableAgent({
      model: "anthropic/claude-3-5-sonnet-20241022",
      instructions: agents.find(a => a.agent_key === "outline")?.system_prompt,
      tools: { /* outline tools */ },
    });

    const outlineResult = await outlineAgent.stream({
      messages: [/* outline messages */],
      writable,
    });
    await updateRunStatus(runId, "outlining", { outline_json: outlineResult });

    // Steps 3-8: Writer, SEO QA, Brand QA, Editor, Revision, Meta
    // ... similar pattern for each agent

    // Final output
    const finalOutput = {
      research_json: researchResult,
      outline_json: outlineResult,
      draft_markdown: draftOutput,
      optimized_json: optimizedOutput,
      final_output_json: metaOutput,
      human_review_required: true,
      scores: {
        seo_score: 85,
        brand_alignment: 90,
        readability_score: 88,
        overall_score: 87.6,
      },
    };

    await updateRunStatus(runId, "completed", finalOutput);
    return finalOutput;

  } catch (error) {
    await updateRunStatus(runId, "failed", { error_message: error.message });
    throw error;
  }
}
```

**Key Points:**
- `"use workflow"` directive required at top of function
- `DurableAgent` automatically makes all LLM calls + tool executions retryable steps
- `getWritable()` provides persistent stream for output
- `agent.stream()` accepts `writable` param for streaming output
- All agent calls inside DurableAgent are automatically retried (3x by default)
- Function is NOT async/await from caller perspective - returns immediately

---

## Correct Tool/Step Definition (Verified from Docs)

### Individual Step Functions
```typescript
// lib/eve-agents/research-agent/tools.ts
import { tool } from "ai";
import { z } from "zod";

// Mark each tool with "use step" for durability
export const searchWeb = tool({
  description: "Search the web for information",
  inputSchema: z.object({
    query: z.string(),
    limit: z.number().optional(),
  }),
  execute: async function ({ query, limit }: { query: string; limit?: number }) {
    "use step"; // [!code highlight] - Makes this tool a durable step

    // Your web search implementation
    const results = await performWebSearch(query, limit);
    return results;
  },
});

export const saveResearchFindings = tool({
  description: "Save research findings to database",
  inputSchema: z.object({
    findings: z.string(),
    sources: z.array(z.string()),
  }),
  execute: async function ({ findings, sources }: { findings: string; sources: string[] }) {
    "use step"; // [!code highlight]

    // Save to Neon
    const result = await db.query(
      `INSERT INTO research_findings (findings, sources) VALUES ($1, $2)`,
      [findings, JSON.stringify(sources)]
    );
    return result;
  },
});
```

**Key Points:**
- Add `"use step"` directive inside `execute` function of each tool
- With `"use step"`, each tool execution:
  - Runs in a separate worker (in production)
  - Automatically retries on failure (up to 3 times)
  - Appears as discrete step in observability
- Combine multiple tools in a single agent for multi-tool LLM loops

---

## AI Calls Inside Workflow Steps

### Option 1: Use Vercel AI Gateway (Recommended)
```typescript
// Use string model names - Vercel AI Gateway handles everything
const agent = new DurableAgent({
  model: "anthropic/claude-3-5-sonnet-20241022", // Works with any provider
  // ...
});
```

**Requires:** Set `GATEWAY_API_KEY` in env vars

### Option 2: Use Provider Directly
```typescript
import { openai } from "@workflow/ai/openai";
import { anthropic } from "@workflow/ai/anthropic";

const agent = new DurableAgent({
  model: openai("gpt-4-turbo"), // Use provider package
  // OR
  model: anthropic("claude-3-5-sonnet-20241022"),
  // ...
});
```

**Requires:** Set `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`

**Recommendation:** Use Vercel AI Gateway (Option 1) for simplicity and provider flexibility.

---

## Architecture Summary (No Changes)

Your existing architecture remains correct:

```
POST /api/seo-blog/start
├─ Create run record in Neon
├─ Call start(seoBlogWorkflow, [runId, input])
└─ Return run_id immediately (202 Accepted)

seoBlogWorkflow (Durable)
├─ Use 8 DurableAgent instances (one per agent type)
├─ Each agent has system_prompt + tools from Neon
├─ Update Neon run state after each agent completes
└─ Save final_output_json with human_review_required: true

GET /api/seo-blog/status/[runId]
└─ Read completed run from Neon (no workflow check needed)

Optional: POST /api/seo-blog/revise
└─ For feedback-driven regeneration of specific fields
```

---

## Changes to Step 2 Plan

### 1. **Workflow Start Method**
- **Change:** Use `start(workflowFn, [...args])` instead of `dispatchWorkflow()`
- **Import:** `import { start } from "workflow/api"`
- **File:** `app/api/seo-blog/start/route.ts`

### 2. **AI Model Specification**
- **Recommendation:** Use Vercel AI Gateway with string model names (simplest)
- **Alternative:** Use `@workflow/ai/openai` or `@workflow/ai/anthropic` provider packages
- **Do NOT mix:** Both patterns in same project

### 3. **Tool Execution**
- **Verified:** Place `"use step"` inside `execute` function, NOT at function level
- **Retries:** Automatic 3x retry, no custom retry code needed
- **Error handling:** Use normal try/catch; workflow SDK handles persistence

### 4. **No Eve Runtime Needed**
- **Confirmed:** File-first Eve conventions work fine without standalone Eve deployment
- **Instructions.md:** Can be loaded from Neon or bundled in code
- **Keep:** Your existing agent file structure in `lib/eve-agents/`

### 5. **Writable Stream Pattern**
- **Use:** `getWritable()` to get persistent output stream
- **Pass:** Stream to `agent.stream({ messages, writable })`
- **Optional:** Can skip writable if you don't need streaming output

### 6. **Database Updates**
- **No schema changes** - your Step 1 schema is sufficient
- **Add helper methods** in storage/runs.ts for stage-specific updates
- **No queue tables** - Workflow SDK handles persistence internally

---

## Verified Packages to Install

```bash
pnpm add workflow @workflow/ai ai
```

**Optional (if using providers directly instead of Vercel AI Gateway):**
```bash
pnpm add @ai-sdk/anthropic @ai-sdk/openai
```

---

## Environment Variables Required

```
# Required
GATEWAY_API_KEY=...          # For Vercel AI Gateway (all providers)
SEO_BLOG_API_KEY=...         # Your API key for /api/seo-blog endpoints
DATABASE_URL=...             # Neon connection string

# Optional (if NOT using Vercel AI Gateway)
OPENAI_API_KEY=...
ANTHROPIC_API_KEY=...
```

---

## Updated Next.js Config

```typescript
// next.config.mjs
import { withWorkflow } from "workflow/next";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ... your existing config
};

export default withWorkflow(nextConfig);
```

---

## Risks & Open Questions

### Verified/Safe:
✅ Workflow SDK officially supports Next.js  
✅ DurableAgent automatically handles retries (no custom code needed)  
✅ `start()` returns immediately - no blocking in API routes  
✅ Neon integration is standard (no special workflow SDK dependencies)  
✅ File-first agents work without standalone Eve deployment  

### Potential Risks:
⚠️ **Workflow SDK is still beta** - API may change, but flight booking example uses stable patterns  
⚠️ **Observability requires `npx workflow web`** - need local dashboard for debugging  
⚠️ **Provider API keys** - if using providers directly instead of Vercel AI Gateway, need individual API keys  
⚠️ **Streaming output** - `getWritable()` stream is persistent but may have latency vs direct streaming  

### Questions Before Implementation:
1. ✅ **Vercel AI Gateway vs Direct Provider?** Recommend Gateway (simpler, one API key, provider agnostic)
2. ✅ **Human Review Gate?** Confirmed: Always set `human_review_required: true`, no workflow gate needed
3. ✅ **Callback Format?** Full JSON saved to Neon, optional webhook via `callback_url` field
4. ✅ **Streaming Output?** `writable` stream provides updates; status endpoint polls Neon
5. ✅ **Revision Endpoint?** Optional; `/api/seo-blog/revise` can handle feedback-driven updates

---

## Summary

**All verified from official Workflow SDK documentation.**

The corrected pattern:
- Install: `workflow`, `@workflow/ai`, `ai`
- Config: `withWorkflow()` in next.config.mjs
- Start workflow: `start(workflowFn, [args])` from `workflow/api`
- Define workflow: Function with `"use workflow"` directive
- Use agents: `DurableAgent` class (auto-retries all steps)
- Define tools: Add `"use step"` inside tool `execute` function
- Stream output: `getWritable()` + `agent.stream({ messages, writable })`
- Models: Use string names with Vercel AI Gateway (recommended)

**Ready to implement Step 2 with confidence.**

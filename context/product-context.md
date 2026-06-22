# Clickity: Marketing Context Document

> **What this is.** A single source of truth for anyone (human or AI) producing marketing for Clickity: the website, landing pages, ads, emails, social, and the free brand strategy tool. Everything here is grounded in Clickity's own source material (brand guidelines, strategy docs, build scope). Where a fact is unconfirmed, stale, or a placeholder, it is flagged. **Do not invent facts to fill gaps.** If something isn't in this document, ask before writing it as fact.
>
> **This is the canonical context file for the SEO Machine workspace.** All other files in `context/` (brand-voice, features, target-keywords, competitor-analysis, etc.) are derived from and must stay consistent with this document. When they conflict, this file wins.

> **Accuracy mandate.** This is customer-facing context. Two sections matter most before you write a single line of copy: the **"Internal only, never in customer-facing copy"** section and the **"Verify before publishing"** section. Read both first.

---

## 1. One-liner and category

**Clickity is an AI-native social media management platform that pairs AI agents with human Brand Managers to deliver measurable business outcomes, not just content.**

**Primary tagline (site headline): "Turn content into revenue."** This is the public-facing line. It's concrete, it leads with the outcome customers actually care about (revenue), and it will age better than internal strategy jargon. Use it as the hero line.

Short forms:

- **Elevator:** Clickity uses AI to handle the 90% of social media work that's execution, and human Brand Managers to ensure the 10% that determines whether it actually works. You get agency-grade outcomes at software speed.
- **Category line:** Not an AI content generator. Not a traditional agency. A platform where every step is either automated or strategically supervised.
- **Category shorthand:** Clickity is a **SEAN, a Software Enabled Agency.** The term has currency in founder/Twitter circles for the model of a tech-leveraged agency, so it's usable as positioning shorthand with an audience that knows it. For a general audience, explain the idea (software speed plus agency judgment) rather than leaning on the acronym.
- **The operating logic (internal framing, not a public slogan):** AI dominates outputs, humans ensure outcomes. This is how the company thinks and why it's built the way it is. Don't lead public copy with this phrasing; lead with "Turn content into revenue." The logic underneath stays the same.

The name plays on **clicks** (the result customers actually want) and on **speed and character** (fast, fun, human, not robotic).

---

## 2. The core positioning thesis

This is the spine of all messaging. Everything traces back to it. Note the distinction: this section is the *operating logic*. The *public expression* of it is the tagline "Turn content into revenue." Revenue is the outcome; the outputs/outcomes framing below is the engine that produces it.

**AI for outputs. Humans for outcomes.**

The reasoning:

- AI can now generate the vast majority of what a social media content creator produces. That work has been commoditized. Competing on "we make posts faster" is a race to the bottom.
- What AI can't do is ensure the result. It can't read a local business's seasonal cash flow, catch a brand drifting off-message, or recognize when engagement is tanking because the visual identity feels dated. That requires judgment and taste.
- So Clickity splits the work deliberately: **AI engines for creative generation, compliance, scheduling, editing, QA, research, and analysis; human Brand Managers for strategic alignment, brand excellence, and outcome assurance at every critical decision point.**

**What customers actually want:** not 30 social posts, but 30 posts that drive foot traffic. Not pretty graphics, but conversion-optimized creative that adapts to performance data. Outcomes, not outputs.

**The promise:** AI-powered execution speed plus human-ensured strategic outcomes equals better results than AI-only tools, delivered faster than traditional agencies.

---

## 3. Who Clickity is for

Primary customers are small-to-mid-sized businesses and brands that need consistent, strategic social presence but can't justify (or get value from) a full agency, and won't get real outcomes from a cheap AI generator.

Concrete profiles drawn from strategy material:

- **Local service businesses** (e.g. an HVAC company with seasonal cash-flow constraints)
- **Real estate agents** and similar personal-brand professionals
- **Local retailers** competing on engagement and visual identity
- **E-commerce brands** that need conversion-optimized, performance-aware creative

**Agencies and resellers** are a second audience, served through Clickity's white-label capability (see Section 6).

**Who it is NOT for, in messaging terms:** people who just want the cheapest possible volume of AI-generated posts. Clickity does not compete on price. It competes on outcomes.

---

## 4. How it works: the customer experience

This is the journey to dramatize in marketing. It's the most concrete differentiator a visitor can feel.

1. **Sign up and immediately enter an AI-guided onboarding conversation** that understands the business. No waiting, no blank dashboard, no "we'll be in touch."
2. **The AI does real homework:** researches the industry, analyzes competitors, audits the existing social presence, and returns intelligent, data-backed recommendations. It suggests optimal posting frequency for the vertical and lifecycle stage, and surfaces channel opportunities the customer hasn't considered (an Instagram-only e-commerce brand might get a reasoned case for Pinterest and TikTok).
3. **Within hours, the system drafts** the brand kit, messaging model, and initial content.
4. **A Brand Manager steps in.** Not to execute, but to ensure, refine, apply judgment, and guarantee the outcome.
5. **First posts land in 2 to 3 days.** Not because anything was rushed, but because AI handled the 90% that doesn't need strategic thinking and a seasoned marketer ensured the 10% that does.

Contrast to anchor against: with a traditional setup, a customer signs up, waits 4 to 7 days, and hopes they made the right choice. Clickity replaces the wait-and-hope with research-backed action within hours.

---

## 5. The human layer: Brand Managers

A deliberate, load-bearing part of the brand. Use the term **Brand Manager**, not "social media manager," to signal strategic scope.

- Brand Managers are strategic, cross-functional marketers, not executors.
- Their job is outcome assurance: strategic review, refinement, client relationship, and continuous optimization driven by AI insights.
- Each Brand Manager oversees far more clients than a traditional model allows, because intelligent automation does the heavy lifting.

Messaging implication: the human in "human-in-the-loop" is a senior, judgment-driven marketer, not a junior content churner. That's the premium.

---

## 6. Product architecture and capabilities

### The conceptual model: three atomic units

Clickity is built around three core units that everything else composes from:

- **Organisation** — the tenant/account that owns everything (supports white-label multi-tenancy).
- **Brief** — the living, compounding brand knowledge base. This is the structural differentiator (see Section 7). It accumulates brand intelligence over time so quality improves the longer a customer is on the platform.
- **Deliverable** — the unit of output (e.g. a social post for a given channel).

> ⚠️ **Terminology to reconcile:** the build backlog implements a **"Project service"** alongside Workspaces, Resources, and Tasks. Confirm whether "Brief" (product/marketing concept) and "Project" (engineering service) are the same thing under different names before using both publicly. Do not present them as two separate features until confirmed.

### Capabilities by release

Clickity is shipping in releases. Marketing should describe **capabilities**, not release numbers or timelines, and must not promise a channel as "available" until it's confirmed live (publishing lands in Release 2, see the verify section).

**Release 1 (commercial infrastructure, the layer a paying customer first touches):**

- AI-guided onboarding flow (the first thing a customer experiences; commercially the most important R1 piece)
- Authentication and authorization, rate limiting, API for core flows
- Multi-tenancy with domain and tenant isolation
- Stripe billing, integrated end to end
- Workspaces, Projects, Resource and Task management, Messaging/Chat
- Admin portal: user and team management, product and services management, user and revenue analytics
- White-label: branded multi-tenant deployments, pass-through / Stripe Connect billing, white-labeled messaging, notifications, and approval flows
- AI gateway with evaluations (built on open models)
- Web app, admin app, mobile app foundation
- Audit trail and analytics services

**Release 2 (channel publishing and the full social engine):**

- File storage, workflow engine, queue / scheduler / reposting, observability, resiliency
- MCP service (for AI agent tooling and integrations)
- Publishing workflows across channels: **Instagram, Facebook, Threads, LinkedIn, Google Business Profile, Pinterest, TikTok, YouTube** (8 channels in scope)
- Human-in-the-loop messaging, notification, and approval flows around publishing
- AI-enabled post analytics
- Meta Boosts / Business Manager integration for paid amplification

**Release 3 (mobile):**

- Full Deliverable and publishing experience brought to mobile across the same channels

### The AI agent layer (what the automation actually is)

Marketing can reference these agent capabilities concretely:

- Creative generation agents (including Canva integration)
- Brand compliance agents
- Editing and QA agents
- Scheduling optimization agents
- Research and competitive analysis agents
- Task and workflow automation agents
- Insight and performance analysis agents

### What Clickity replaces

Clickity consolidates a fragmented operational stack (the kind of tool sprawl agencies and businesses currently juggle: separate systems for project delivery, scheduling, boards, support, and automation) into one AI-native platform. Lead with the customer benefit (one place, everything connected, no lag) rather than naming specific incumbent tools in public copy.

---

## 7. What makes Clickity different (the moat)

Three differentiators, in priority order:

1. **The compounding Brief.** Most AI tools are one-shot and stateless: you prompt, you get an output, the tool forgets you. Clickity's Brief is persistent and compounds. Every interaction enriches the brand's knowledge base, so the content gets more on-brand and more effective the longer you stay. The platform's value accumulates instead of resetting. This is the single hardest thing for a competitor to copy.

2. **Human-ensured outcomes.** AI-only tools will always be cheaper and faster at generating outputs. They structurally cannot guarantee a result. Clickity's Brand Manager checkpoints are the thing the customer is actually paying for: judgment and taste that AI can't replicate.

3. **Reference-dependent quality as a feature.** Good AI content requires strong brand reference material. Clickity treats brand discovery and curation as the core value-add, not an afterthought. The better the brand intelligence, the better everything downstream. This is why onboarding and the Brief matter more than the raw generation.

**Against AI-only generators:** they ship faster mediocrity. AI without judgment is just speed applied to the wrong thing. Avoid the phrase "AI slop" in polished customer copy, but the idea (generic, robotic, no judgment) is the thing to position against.

**Against traditional agencies:** slow, expensive, inconsistent, bottlenecked. Clickity delivers comparable or better strategic outcomes at software speed and scale.

**Competitive landscape (for your awareness, not for copy):** the closest market analogues are Blaze and Holo (both AI content tools, both output-focused). Reference points admired for specific strengths include Attio (data modeling, invisible AI), Granola (onboarding experience), Midday (lead-magnet / build-in-public motion), and Pomelli/Gamma (brand-DNA onboarding). Clickity's wedge against all of them is the outcome focus plus the compounding Brief plus the human layer. **Do not name competitors in public marketing** unless deliberately running comparison content.

---

## 8. Go-to-market motion

- **Product-led growth.** The primary lead-generation mechanism is a **free brand strategy tool** on the marketing site, a genuinely useful standalone experience that demonstrates Clickity's intelligence and feeds people into the platform.
- The marketing site is being built out beyond the current splash page.
- White-label / reseller partnerships and a referral engine are part of the growth model.

---

## 9. Brand identity

### Name

**Clickity** (formerly Smarcomms). Always capitalized as "Clickity." The wordmark in the logo is lowercase ("clickity") and is a custom logotype that must never be re-typed, re-fonted, or altered.

### Tagline

**Turn content into revenue.** This is the site headline and primary public-facing line. Outcome-first, plain-English, durable. Use it as the hero. The strategic "AI for outputs, humans for outcomes" framing is internal logic, not a customer slogan.

### Logo

- The master logo is **icon + logotype**: an orange petal-cluster icon (four rounded forms) next to the custom lowercase "clickity" wordmark.
- Available in **horizontal and vertical** lockups, and in **full-color, all-black, and all-white** versions for different backgrounds.
- Social icon comes in **logo, circular, rounded, and square** variants; pick per medium.
- The logotype is custom-designed and locked. Do not substitute a font, recolor outside the palette, or modify it.
- Respect minimum clearspace (defined by the icon's `x` unit) and the construction grid. Don't crowd the logo.

### Color palette

The entire brand system is a **dark theme**: black canvas, white text, orange as the single accent.

| Role | Color | HEX | RGB | CMYK |
|------|-------|-----|-----|------|
| Primary background | Black | `#000000` | 0, 0, 0 | 0, 0, 0, 100 |
| Text / reverse | White | `#FFFFFF` | 255, 255, 255 | 0, 0, 0, 0 |
| Accent | Orange | `#FE6D08` | 254, 109, 8 | 0, 57, 97, 0 |

Use orange sparingly and intentionally as the highlight (key words, CTAs, the icon, accent details), not as a flood color. Black-dominant layouts with white type and orange accents are the house style.

### Typography

Observable from the brand guidelines (fonts are **not named** in the guide, confirm before locking, see verify section):

- **Display / headings:** an elegant serif, with key accent words set in **italic and colored orange** (e.g. "About *Clickity*"). This serif-with-italic-accent treatment is a signature.
- **Body:** a clean, neutral sans-serif, white on black.
- **Wordmark:** the custom rounded sans logotype (locked, not for general use).

### Brand personality and voice

From the brand guidelines, Clickity represents **speed, creativity, and character**, and helps people create content **quickly, easily, and with a human touch**. The voice is:

- **Friendly, human, expressive, modern, approachable, fun.**
- **Never robotic.** "Smart automation with a human touch" is the explicit brand promise; copy that sounds machine-generated betrays the whole proposition.

Practical writing rules (these align the brand voice with the founder's standards):

- **No em dashes.** Use commas, colons, parentheses, or restructure.
- **No corporate padding or filler.** Frank and clear beats polished and hollow.
- Write like a sharp, helpful human, not like marketing autopilot.
- Confident and direct, but warm. Speed and character, not stiffness.

---

## 10. Messaging do's and don'ts

**Lead with (customer-safe, on-strategy):**

- **"Turn content into revenue"** as the hero line. Revenue is the outcome; everything else supports it.
- Outcomes over outputs. Clicks, engagement, sales, foot traffic, conversions.
- Starting from $99/mo (entry price; see verify section on how to phrase).
- AI speed plus human judgment.
- 2 to 3 day time to first posts.
- Research-backed onboarding within hours.
- A brand that gets smarter the longer you use it (the Brief).
- Brand Managers (strategic), not social media managers (executional).
- Faster than an agency, smarter than an AI tool.

**Avoid in customer-facing copy:**

- Any reference to former staff, "content creators," headcount changes, or the Smarcomms transition story (see Section 11).
- Internal margin, churn, or unit-economics language.
- Naming competitors (unless intentional comparison content).
- "AI slop" or disparaging the customer's past choices in a harsh way.
- A specific, committed public launch date, or claiming a channel is live before it is. "2026" is fine as a loose reference if needed; a hard date is not.
- The `clickity.io` domain, the placeholder email, or the placeholder phone number from the brand PDF.
- Em dashes, and any sentence that reads as AI autopilot.

---

## 11. Internal only, NEVER in customer-facing copy

> **Hard rule.** The strategy/transition document this context draws from is headed **"CONFIDENTIAL, Executive Leadership Only"** and **"The Truth We're Not Telling Customers."** The framing below is for internal understanding of *why* Clickity exists. It must never appear, paraphrased or direct, in any customer-facing asset.

Do not surface, reference, or hint at:

- The Smarcomms-to-Clickity transition narrative as a business turnaround.
- Any mention of the prior team, "75 content creators," "10 Brand Managers," upskilling, or transitioning staff out.
- Self-critical framing about prior quality, "commodity-level talent," churn, or being "squeezed by AI tools."
- Internal financials: margins, unit economics, churn figures, ARR targets. (Note: the **$99/mo price itself is fine to use publicly** as the entry price. What stays internal is the old *narrative* that $99 economics forced low-cost staffing and quality problems. Use the number, never that story.)
- The raw competitive-analysis notes (candid internal commentary on rivals).
- The list of specific incumbent tools being replaced, by name.

These are real and useful for *understanding* the company. They are radioactive in *marketing*. Treat this entire section as context that informs tone and conviction, never as source text.

---

## 12. Verify before publishing

Most of the earlier open questions are now resolved (below). The few genuinely-still-open items are marked OPEN.

- **Domain and contact details. RESOLVED.** The domain is **useclickity.com**, full stop. Ignore the `clickity.io`, `Info@clickity.io`, and `+12 3 456789` placeholders in the brand PDF entirely. *(OPEN: the real public support email and whether any public phone number is used. Don't invent one.)*
- **Pricing. RESOLVED (with caveat).** Use **"starting from $99/mo."** Price may evolve and isn't final, so phrase it as an entry point ("from $99/mo," "starting at $99/mo"), not a fixed or only price. Avoid implying it's locked.
- **Launch date. RESOLVED.** Not a priority. **"2026" is acceptable as a general reference** if a timeframe is genuinely needed. Don't commit to a specific date.
- **Channel availability. RESOLVED (as scope).** The eight channels (Instagram, Facebook, Threads, LinkedIn, Google Business Profile, Pinterest, TikTok, YouTube) are confirmed as the channel set. They ship with publishing in Release 2, so if copy needs to distinguish "available now" from "coming," check current status; otherwise the list stands.
- **SEAN positioning. RESOLVED.** "Software Enabled Agency (SEAN)" is a recognized term in founder/Twitter circles and is usable as positioning shorthand. Explain the concept for general audiences rather than assuming the acronym lands.
- **Tagline. RESOLVED.** The official site headline is **"Turn content into revenue."** "AI for outputs, humans for outcomes" is internal operating logic, not the public slogan.
- **"Brief" vs "Project" naming. OPEN.** Reconcile the product concept ("Brief") with the engineering service name ("Project," see Section 6) before using both publicly.
- **Fonts. OPEN.** The brand guidelines show a serif display and a sans body but do not name the families. Confirm the actual typefaces before specifying them in code or copy.

---

## 13. Canonical facts (quick reference)

| Field | Value | Status |
|-------|-------|--------|
| Product name | Clickity | Confirmed |
| Former name | Smarcomms | Confirmed (internal context only) |
| Category | AI-native social media management platform | Confirmed |
| Core thesis | AI for outputs, humans for outcomes | Confirmed |
| Primary domain | useclickity.com (ignore all other endings) | Confirmed |
| Tagline / site headline | Turn content into revenue | Confirmed |
| Black | `#000000` | Confirmed |
| White | `#FFFFFF` | Confirmed |
| Orange (accent) | `#FE6D08` | Confirmed |
| Theme | Dark (black canvas, white text, orange accent) | Confirmed |
| Time to first posts | 2 to 3 days | Confirmed (strategy doc) |
| Channels | Instagram, Facebook, Threads, LinkedIn, Google Business Profile, Pinterest, TikTok, YouTube | Confirmed scope |
| Human role title | Brand Manager | Confirmed |
| Category shorthand | SEAN (Software Enabled Agency) | Confirmed, usable |
| GTM motion | Product-led growth via free brand strategy tool | Confirmed |
| Pricing | Starting from $99/mo (entry price, may evolve) | Confirmed phrasing |
| Public timeframe | 2026 acceptable as a loose reference | Confirmed |
| "Brief" vs "Project" naming | Reconcile before public use | Open |
| Fonts | Serif display + sans body, families unnamed | Open |

---

## 14. Public proof point

The marketing site publicly states **"+12,000 brands since 2016"** (the agency heritage). This number is public-facing and usable as social proof. The *transition narrative behind it* (Smarcomms → Clickity) is internal-only per Section 11 — use the number, never the story.

---

*Built from Clickity's brand guidelines, strategy material, and build scope. Where this document and a source document disagree on a customer-facing fact, treat this document's flags as the instruction and confirm with Henry.*

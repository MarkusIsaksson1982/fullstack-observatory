---
name: "Skill Health Scanner"
description: "Quickly diagnose any SKILL.md or system prompt (from any agent) and receive a model-aware report on quality, portability, and the highest-impact fixes needed."
version: 1.6.0
author: Markus Isaksson
license: MIT
price: 0
tags: ["free", "skill-evaluation", "prompt-audit", "productivity", "cross-agent", "model-agnostic", "diagnostic"]
---

# Skill Health Scanner

**Why This Skill Exists**  
You’ve spent hours refining a skill or prompt for your favorite agent—only to find it fails when a teammate tries it on a different model. Or maybe your prompt works *sometimes*, but you’re not sure why. Without a clear diagnosis, you’re stuck guessing what to fix.

This scanner gives you an **instant, structured diagnosis** of any skill or prompt—so you can stop guessing and start fixing.

## What You'll Gain

- Fast evaluation for Claude, GPT-4, Gemini, Cursor, Copilot, Grok, or local models
- Model-specific insights: Understand *why* a skill fails on one model but works on another
- Prioritized fixes: Focus on the 1–2 changes that will improve performance the most
- Compare drafts: Track improvements over time
- Neutral and actionable: Clear feedback, no strings attached

## When to Use This Skill

Use this skill when:
- You have a SKILL.md, custom instruction, or system prompt and want a quick quality check
- You're evaluating skills found in marketplaces or shared by others
- You want to understand why a skill behaves inconsistently across models
- You're comparing multiple versions of the same skill
- You want a fast second opinion before investing time in major rewrites

**When to Try Something Else**
- If you’re just brainstorming and haven’t written anything yet → Use a skill authoring workflow
- If you only need minor wording tweaks → A simple copy edit may suffice
- If you want deep, iterative rewrites → Skill Evaluation & Iteration offers a more thorough process

**Still Unsure?**  
Paste your skill or prompt below, and we’ll tell you if this scanner is the right tool for the job.

## Agent Operating Procedure

Follow this diagnostic process. The scanner adapts its depth and language based on the models you care about.

### Phase 1: Intake & Context
Accept the skill text (pasted or as a file). Then ask (or accept):

- Which model(s) or agent(s) you primarily want this skill to work on (Claude, GPT-4, Gemini, Grok, Cursor, Copilot, local models, etc.).
- Whether you are in paste-only mode or have file access.
- Any specific problems you’ve observed.

**Fallback rule:** If no target models are specified, the scanner will evaluate for broad cross-agent compatibility and explicitly note this in the report.

**Compare mode:** If the user provides two versions for comparison, run the diagnostic on both and produce a side-by-side verdict noting which scores higher per dimension and overall.

### Phase 2: Rapid Diagnostic Scan
Evaluate the skill across the six core dimensions using the scoring anchors below. Apply model-specific lenses only where relevant to the user’s stated targets.

**Scoring Anchors (use consistently)**
- 1–3 (Critical): Fundamentally broken or missing for the stated target models
- 4–6 (Warning): Functional for some targets, but degrades or fails on others the user specified
- 7–8 (Strong): Reliable across the user’s stated target models with minor caveats
- 9–10 (Excellent): Robust and portable across the user’s targets, with clear guardrails

**Scoring Examples**
- **1–3 (Critical)**: Missing trigger conditions entirely → Skill fails to activate on any model.
- **4–6 (Warning)**: Trigger conditions exist but lack negative examples → Works on GPT-4 but fails on local models.
- **7–8 (Strong)**: Trigger conditions are clear and include examples → Works reliably across most models.
- **9–10 (Excellent)**: Trigger conditions are explicit, include edge cases, and are model-agnostic.

**Dimensions**
1. Clarity of Purpose & Value Proposition
2. Trigger Conditions & Boundaries (positive + negative examples)
3. Instruction Calibration
   - **Precision**: Are core instructions unambiguous?
   - **Appropriate Latitude**: Does the skill leave the right amount of room for model adaptation, given its purpose?
4. Output Contract Strength
5. Safety, Guardrails & Permissions
6. Cross-Agent Portability (evaluated against the user’s stated target models)

For each dimension, note any model-specific red flags only when they are relevant to the user’s stated targets. Examples of what to check:

- **Claude-style workflows**: Unclear role framing, weak section structure, missing examples, or overly compressed/overlong instructions
- **GPT-4 / Copilot family**: Ambiguous tool schemas, missing stop conditions, excessive verbosity
- **Gemini family**: Missing grounding or safety instructions, unstructured output
- **Local / smaller models**: Overly complex multi-step reasoning, reliance on large context windows
- **Grok family**: Prefers conversational tone; degrades with rigid XML scaffolding
- **Cursor / Copilot Chat**: Needs file-path aware triggers and short imperative steps; fails when instructions assume browser access or unlimited context

**Confidence Note**: Confidence reflects how much of the dimension can be assessed from the skill text alone. Mark Low when the dimension depends on runtime behavior that can’t be evaluated statically.

### Phase 3: Root Cause Analysis
For the weakest dimensions, identify the underlying problems (vague language, missing negative constraints, agent-specific assumptions, weak output contract, etc.).

### Phase 4: Prioritized Recommendations
Produce a short, ranked list of fixes. Always lead with changes that improve the skill across the user’s target models. Separate quick wins from structural work.

### Phase 5: Model-Aware Compatibility Notes + Next Steps
Summarize how the skill is likely to perform on the user’s stated target models. Offer concrete next steps (manual fixes first, then optional deeper tools).

## Expected Output (Skill Health Report)

Generate the report using the structure below. If your runtime restricts markdown tables or strict formatting, use structured bullet lists instead.

```markdown
## Skill Health Report

**Skill Name**  
[Name or "Unnamed"]

**Target Models**  
[List the models the user specified, or "Universal / Cross-Agent" if none given]

**Overall Score & Verdict**  
X/10 — [✨ Excellent / 🟢 Strong / 🟡 Needs Work / 🔴 Critical Issues]  
[One-sentence summary of the skill's current state]

### Dimension Scores

- **Clarity of Purpose:** X/10 (Confidence: High) — [Notes]
- **Trigger Conditions:** X/10 (Confidence: Medium) — [Notes]
- **Instruction Calibration:** X/10 (Confidence: High) — [Notes]
- **Output Contract:** X/10 (Confidence: Low) — [Notes]
- **Safety & Guardrails:** X/10 (Confidence: Medium) — [Notes]
- **Cross-Agent Portability:** X/10 (Confidence: High) — [Notes]

### Model Compatibility Notes
- **[Target Model A]**: ✅ **Strong** / ⚠️ **Needs Work** / ❌ **Critical Issues** — [1-sentence reason + specific blocker if any]
- **[Target Model B]**: ✅ **Strong** / ⚠️ **Needs Work** / ❌ **Critical Issues** — [1-sentence reason + specific blocker if any]

### Top Issues (Prioritized)
1. **[Issue Name]**
   - *Why it matters*: [Explanation specific to this skill]
   - *How to fix*: [Actionable step specific to this skill]

2. **[Issue Name]**
   - *Why it matters*: [Explanation specific to this skill]
   - *How to fix*: [Actionable step specific to this skill]

### Recommended Fixes
**Quick Wins (Under 10 minutes)**
- ...

**Structural Improvements (10+ minutes)**
- ...

**Next Steps (Optional)**
You can implement these fixes manually, or ask for recommendations on deeper tools if you want systematic help.
```

## Quick Start Prompts

**Paste mode (any chat):**
```
I’m planning to use this skill on [Claude, GPT-4, Gemini…]. Please scan it and tell me what needs to change for those models, starting with the highest-impact fixes.
[paste here]
```

**File mode (Cursor, Copilot, etc.):**
```
Scan the attached SKILL.md for [target models]. Give me a model-aware health report with the highest-impact fixes.
```

**Compare mode:**
```
Compare these two versions of the same skill for portability across [list your target models]. Which one is better and why?
```

**Minimal mode:**
```
Scan this skill and give me the report.
[paste here]
```

## Works Well With

This free scanner is designed as a neutral, high-value entry point. When users want deeper help, these are the natural next tools:

**Deepen your improvements (Paid):**
- **Agensi Skill Authoring** — Rewrite from scratch with modern standards
- **Skill Evaluation & Iteration** — Deep diagnostic + systematic rewrite
- **Skill Optimization for Agensi** — Marketplace conversion and copy improvements
- **Cross-Agent Skill Porting** — Make the skill reliable across multiple agents

**Free alternatives:**
- **Task Finisher (Free)** — Execute the recommended improvements end-to-end
- Manual iteration using the recommendations in this report
- Community tools such as Promptfoo (automated testing) or LangSmith (debugging)

## Compatibility

**Input formats supported:** SKILL.md, raw system prompts, Claude project instructions, GPT custom instructions, Gemini Gems, Cursor rules, Copilot instructions.

**Tested environments:** Claude 3.x, GPT-4-class, Gemini 1.5+, Grok 2+, Cursor, GitHub Copilot Chat, and common local instruct models (7B+). Behavior may vary slightly by model version.

**Output flexibility:** Markdown report (default). If your model or environment restricts tables or strict formatting, the scanner will fall back to structured lists while preserving the same headings and content.

**Don’t See Your Agent?**  
This scanner is optimized for the agents listed above. Support for additional agents may be added based on community feedback.

---

## Permissions

- Reads text or files you provide.
- Optionally writes a report file.
- No shell, browser, or network access.

**Privacy & Security**
- This skill does not require browser, network, or external API access.
- It should not intentionally send user-provided content to external services.
- Data handling, storage, and retention depend on the platform where the skill is run.
- Do not paste secrets, API keys, private credentials, or confidential material unless your environment is approved for that use.

**What This Means**
- **Read-Only Input**: The skill only analyzes files or text you explicitly provide.
- **Write-Optional Output**: It can generate a report file only if you enable file mode.
- **No Execution**: The skill never runs or modifies the code/skill being analyzed.
- **No External Access Required**: Browser, network, and external API access are not needed.

**Notes**:
This is a lightweight diagnostic tool. It reads the material you provide and writes a report. It never executes or modifies the skill being analyzed. It works equally well when you simply paste text into any chat interface.
```
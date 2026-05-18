---
name: "Iterating Agensi Skills"
description: "A practical, lightweight framework for reviewing, diagnosing, and systematically improving existing SKILL.md files based on real usage, feedback, and observed weaknesses."
version: 1.2.0
author: Markus Isaksson
license: MIT
price: 0
tags:
  - agensi
  - skill-iteration
  - feedback
  - improvement
  - meta
  - best-practices
  - free
---

# Iterating Agensi Skills

**Why This Skill Exists**  
The first version of a skill is rarely the best version. Skills improve significantly when you observe how they actually perform in practice and then make targeted improvements. Many creators write a skill once and stop. The best skills go through several rounds of refinement. This skill gives you a simple, repeatable way to diagnose problems in existing skills and make meaningful improvements without overcomplicating the process.

## What You'll Gain

- A practical way to review your own or other people’s skills
- The ability to quickly spot the most common weaknesses
- Clear, prioritized ideas for what to improve first
- Better skills over time with less wasted effort
- A lightweight foundation before moving to more powerful paid evaluation tools

## When to Use This Skill

Use this skill when:
- You have written a skill and want to improve it after real use
- A skill is not producing the results you expected
- You received feedback (from users, teammates, or self-review) about a skill
- You are maintaining a collection of skills and want to raise overall quality
- Preparing a skill for wider sharing or publication

**When You DON’T Need This Skill**
- The skill is brand new and hasn’t been used yet (use Agensi Skill Authoring instead)
- You only want to make tiny formatting or wording changes
- The skill is already performing very well for its purpose

## Agent Operating Procedure

When this skill is activated, follow this structured review process.

### Phase 1: Gather Usage Evidence
Collect concrete data on how the skill has actually performed:
- Recent sessions where the skill was used
- Specific problems observed (wrong output, skipped steps, inconsistent behavior, user frustration)
- Any feedback received

**Stop here** and share the key observations with the user before moving to diagnosis.

### Phase 2: Structured Diagnosis
Evaluate the skill against these six core areas:

1. **Clarity of Purpose** — Can a reader immediately understand what problem it solves?
2. **When to Use / When Not to Use** — Are the boundaries explicit and useful?
3. **Agent Operating Procedure** — Are the instructions specific, ordered, and actionable? Are there hard stop conditions?
4. **Expected Output** — Does the skill define a clear, structured output format (template, table, checklist)?
5. **Guardrails & Safety** — Does it prevent common mistakes and request approval for risky actions?
6. **Permissions & Metadata** — Is the Permissions block honest, complete, and up to date?

Identify the 1–2 highest-impact problems.

### Phase 3: Prioritize Improvements
Rank the issues by impact:
- Highest: Missing or weak Expected Output format
- High: Vague instructions or missing stop conditions
- Medium: Weak “When not to use” guidance
- Lower: Minor wording or formatting issues

Focus on the top one or two problems first.

### Phase 4: Make Targeted Changes
Apply focused improvements:
- Add or strengthen the Expected Output template + example
- Convert vague suggestions into direct “You MUST…” instructions
- Add explicit phases with stop conditions
- Tighten the When to Use / When Not to Use section
- Update the Permissions block to current standards

Make one meaningful change at a time and test it.

### Phase 5: Verify and Iterate
Test the revised skill on a real task:
- Did the targeted problem improve?
- Did any new problems appear?
- Document what changed and why

Repeat the cycle as needed.

**Hard Stop:** Do not consider a skill “improved” until the change has been tested on at least one real task and the user has approved the update.

## Expected Output (Fill-in Template)

When reviewing a skill, produce a structured diagnosis:

```markdown
## Skill Review Summary

**Skill Name**  
[Name + current version]

**Primary Observed Problems**
- [List the 1–3 most impactful issues]

**Diagnosis by Area**
| Area                    | Status     | Specific Issue                              | Priority |
|-------------------------|------------|---------------------------------------------|----------|
| Clarity of Purpose      |            |                                             |          |
| When to Use / Not Use   |            |                                             |          |
| Agent Operating Procedure |          |                                             |          |
| Expected Output         |            |                                             |          |
| Guardrails & Safety     |            |                                             |          |
| Permissions & Metadata  |            |                                             |          |

**Recommended Changes (Prioritized)**
1. [Highest impact change + why]
2. ...

**Proposed Next Step**
[What the user should do now]
```

## Quick Start Prompt

```
I have a skill called [Skill Name] that isn’t working as well as I hoped. Here is the current SKILL.md: [paste or reference the file].

Please apply the Iterating Agensi Skills framework. Start with Phase 1 and Phase 2 to diagnose the biggest problems before suggesting fixes.
```

## Works Well With

This is the review and improvement companion within the v1.1 free meta group. Here’s how it connects to the rest of the Agensi ecosystem:

**The core free meta group (v1.1 skills):**
- **Agensi Skill Authoring** (free) — Use this to create the first version of a skill, then switch to Iterating Agensi Skills after real-world use.
- **Agensi Free Skill Explorer with Grok** (free) — Discover good examples worth studying and iterating on.
- **Agensi Skill Publishing Assistant with Grok** (free) — Validate improvements before re-uploading.

**Prompt optimization companion:**
- **PromptMaster with Grok** (free) — When a skill’s prompts need strengthening, optimize them first with PromptMaster.

**Explanation companion:**
- **Concept Explainer with Grok** ($5) — Useful when improving skills whose purpose is to explain complex topics.

**Natural upgrade path:**
- **Skill Evaluation & Iteration with Grok** ($5) — The structured, high-ROI next step. Adds formal scoring, root cause analysis, prioritized rewrite plans, and direct rewrite support.
- **Skill Health Scanner** (free) — Quick automated-style audit before doing a manual deep review.
- **Task Finisher with Grok** (free) — Cleanly close out review-and-rewrite sessions.

**Advanced distribution & scaling:**
- **Professional Skill Documentation & Distribution with Grok** ($7)
- **Cross-Agent Skill Porting with Grok** ($8)
- **Skill Catalog Strategy & Optimization with Grok** ($10)

## Compatibility

Skills on Agensi follow the open SKILL.md standard and work with any compatible agent, including Claude Code, Codex CLI, Cursor, VS Code Copilot, Gemini CLI, and more.

**Compatibility Note**: This skill is specifically optimized for **Grok** inside the **Grok Build CLI / TUI**, but the review process is model-agnostic.

---

## Permissions

**Permission Profile**: Analysis and Documentation (Read + Write)

**Tools Used**

- **Terminal / Shell**: Sometimes – Useful for exploring skill directories and running validation commands.
- **Read Files**: Yes – Required to analyze existing skill files in detail.
- **Write Files**: Yes – Required to create improved versions of skills.
- **Browser**: No
- **Network Access**: No

**Environment Variables**: None required

**Allowed Hosts**: None

**File Scopes**:
- `**/*.md`
- `.agentskills/**`
- `grok/agensi/skills/**`

**Notes**:
This is a general-purpose free skill for anyone who wants to improve skills they have already written. It requires read and write access to skill files.
```
---
name: "Agensi Skill Authoring"
description: "A practical, step-by-step guide to writing clear, effective, and reusable SKILL.md files that follow the Agensi open standard and work reliably across different AI coding agents."
version: 1.2.0
author: Markus Isaksson
license: MIT
price: 0
tags:
  - agensi
  - skill-authoring
  - meta
  - documentation
  - best-practices
  - free
---

# Agensi Skill Authoring

**Why This Skill Exists**  
Writing good skills is harder than it looks. Many SKILL.md files are either too vague to be useful or too rigid to be practical. The best skills strike a balance: they give the agent clear instructions while remaining flexible enough to work across different models and projects. This skill teaches the core patterns that lead to reliable, reusable skills that actually improve agent performance.

## What You'll Gain

- A repeatable process for designing skills that agents follow consistently
- Clear structure and output formats that dramatically improve reliability
- Skills that are easier for other people (and future versions of yourself) to understand and use
- A strong foundation before moving into paid evaluation, iteration, and optimization skills

## When to Use This Skill

Use this skill when:
- Writing your first SKILL.md files
- Creating skills you intend to share, publish, or reuse across projects
- Standardizing how you (or your team) write instructions for AI agents
- Preparing a new skill for the Agensi marketplace or GitHub

**When You DON’T Need This Skill**
- Writing one-off prompts for a single task
- Creating simple checklists or temporary rules
- Iterating on an already well-structured skill (use Skill Evaluation & Iteration instead)

## Agent Operating Procedure

When this skill is activated, follow this structured authoring process.

### Phase 1: Define Purpose and Boundaries
Clearly articulate:
- What specific problem the skill solves
- Who the skill is for (beginner, intermediate, advanced users, or specific roles)
- When the skill **should** be used
- When the skill should **not** be used

**Stop here** and confirm the purpose and scope with the user before proceeding.

### Phase 2: Design the Core Procedure
Break the work into logical, ordered phases or steps the agent must follow. For each phase:
- State what the agent must do
- Include explicit stop conditions where the user should review progress
- Use strong, direct language (“You MUST…”, “Do not proceed until…”)

### Phase 3: Define Expected Output
Design a concrete output format the agent should produce. The strongest skills include:
- A fill-in template (markdown with clear sections)
- A completed example showing the expected quality
- Tables, checklists, or structured formats where helpful

This is often the highest-leverage part of a skill.

### Phase 4: Add Guardrails and Anti-Patterns
Document:
- Common mistakes the agent (or user) tends to make
- Things the agent must **never** do
- Edge cases or situations where the skill should be abandoned

### Phase 5: Write Metadata and Polish
Finalize:
- Clean YAML frontmatter (name, description, version, tags, price, author)
- Clear “Works Well With” section that shows how the skill fits into the broader ecosystem
- Up-to-date Permissions block
- A strong Quick Start prompt

**Hard Stop:** Do not publish or consider the skill complete until all five phases have been completed and the user has reviewed the final draft.

## Expected Output (Fill-in Template)

When helping someone author a new skill, produce a structured draft containing:

```markdown
## Skill Name
[Proposed name]

## Purpose
[Why this skill exists + who it's for]

## When to Use / When Not to Use
- Use when: ...
- Do not use when: ...

## Agent Operating Procedure
### Phase 1: ...
### Phase 2: ...

## Expected Output Template
```markdown
[Template the agent should fill in]
```

## Common Pitfalls
[Table or list of anti-patterns]

## Quick Start Prompt
[Ready-to-copy prompt for users]
```

## Quick Start Prompt

```
I want to write a new SKILL.md file for [briefly describe what the skill should help the agent do].

Please apply the Agensi Skill Authoring framework. Start with Phase 1 (Define Purpose and Boundaries) and help me create a clear, focused purpose statement and the situations where the skill should and should not be used.
```

## Works Well With

This is the foundational free meta skill in the v1.1 group. Here’s how it connects to the rest of the Agensi ecosystem:

**The core free meta group (v1.1 skills):**
- **Iterating Agensi Skills** (free) — The direct companion for reviewing and improving skills after the first draft is written.
- **Agensi Free Skill Explorer with Grok** (free) — Discover good examples before you start authoring.
- **Agensi Skill Publishing Assistant with Grok** (free) — Validate your draft before uploading.

**Prompt optimization companion:**
- **PromptMaster with Grok** (free) — Turn raw ideas into strong, well-structured prompts before feeding them into the authoring process.

**Explanation companion:**
- **Concept Explainer with Grok** ($5) — Especially valuable when the skill you are building is meant to teach or explain complex ideas.

**Natural next steps after authoring:**
- **Skill Evaluation & Iteration with Grok** ($5) — The highest-ROI follow-up for scoring and systematically improving what you’ve written.
- **Task Finisher with Grok** (free) — Use at the end of long authoring sessions for clean handoff and verification.

**Advanced skill creation & distribution:**
- **Professional Skill Documentation & Distribution with Grok** ($7) — Turn raw SKILL.md files into polished marketplace listings and professional GitHub repositories.
- **Cross-Agent Skill Porting with Grok** ($8) — Make your best skills work reliably across Claude, Cursor, Copilot, Gemini, and other agents.
- **Skill Catalog Strategy & Optimization with Grok** ($10) — Analyze your entire skill library and design a coherent, monetizable portfolio.

## Compatibility

Skills on Agensi follow the open SKILL.md standard and work with any compatible agent, including Claude Code, Codex CLI, Cursor, VS Code Copilot, Gemini CLI, and more.

**Compatibility Note**: This skill is specifically optimized for **Grok** inside the **Grok Build CLI / TUI**, but the authoring principles are model-agnostic.

---

## Permissions

**Permission Profile**: Documentation and Skill Creation (Read + Write)

**Tools Used**

- **Terminal / Shell**: Sometimes – Useful for exploring example skills or validating file structures.
- **Read Files**: Yes – Essential for studying existing high-quality skills as reference material.
- **Write Files**: Yes – Required to create and iterate on new SKILL.md files.
- **Browser**: No
- **Network Access**: No

**Environment Variables**: None required

**Allowed Hosts**: None

**File Scopes**:
- `**/*.md`
- `.agentskills/**`
- `grok/agensi/skills/**` (for referencing the user's own skill library)

**Notes**:
This is a general-purpose skill for anyone creating or improving skills using the Agensi format. It requires the ability to read and write markdown files.
```
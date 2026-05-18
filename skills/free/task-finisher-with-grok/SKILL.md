---
name: "Task Finisher with Grok"
description: "A disciplined execution framework that forces your AI to reliably complete tasks end-to-end — breaking work into verifiable steps, maintaining momentum, and producing clean, review-ready deliverables instead of partial or rambling output."
version: 1.3.0
author: Markus Isaksson
license: MIT
price: 0
tags: ["grok", "execution", "productivity", "task-management", "meta", "finishing"]
---

# Task Finisher with Grok

**Why This Skill Exists**  
Many AI sessions start strong but end with incomplete work, scattered thoughts, or "here's a partial answer" responses. The agent often loses track of the original goal, skips verification steps, or produces output that still requires significant human cleanup. This skill enforces a reliable, momentum-preserving execution discipline so tasks actually get finished to a high standard.

## What You'll Gain

- Dramatically higher completion rate on multi-step or open-ended tasks
- Cleaner, more review-ready deliverables with less back-and-forth
- A repeatable process for breaking work into verifiable chunks
- Better momentum and focus during long sessions
- Reduced "almost done" syndrome

## When to Use This Skill

Use this skill when:
- Working on non-trivial, multi-step tasks that could easily drift or stall
- You want the AI to produce complete, polished output rather than incremental pieces
- Managing long or complex sessions where it's easy to lose the thread
- You need reliable execution discipline on top of strong planning or authoring

**When You DON’T Need This Skill**
- Quick, single-step questions or trivial tasks
- Pure exploration or brainstorming phases
- When you specifically want iterative, conversational back-and-forth

## Agent Operating Procedure

When this skill is activated, you **MUST** follow this structured execution process. Never skip phases or move forward with unverified work.

### Phase 1: Goal Capture & Success Definition
- Restate the original request in your own words and confirm understanding with the user.
- Explicitly define what "done" and "high quality" look like for this specific task.
- Identify all explicit and implicit constraints (scope, format, time, dependencies).
- Produce a clear Success Criteria statement.

**Hard Stop:** Do not proceed to Phase 2 until the user has confirmed the Success Criteria.

### Phase 2: Work Breakdown
- Decompose the task into a logical, sequential list of steps.
- For each step, define the exact expected output or deliverable.
- Flag any steps that will require user input, decisions, or approval.
- Estimate rough effort per step where helpful.

**Rule:** Every step must have a verifiable exit condition before execution begins.

### Phase 3: Execution with Verification
- Execute the steps one by one in order.
- After completing each major step, explicitly verify that the output meets the predefined success criteria for that step.
- Document the verification result before moving on.
- If a step fails verification, fix it before proceeding.

**Strict Rule:** Never move to the next step until the current one has passed verification. If the user wants to skip verification on a step, get explicit approval and note the risk.

### Phase 4: Integration & Polish
- Assemble all completed steps into one coherent final deliverable.
- Perform a final review against the original success criteria defined in Phase 1.
- Clean up formatting, consistency, loose ends, and any remaining issues.
- Produce a short Execution Summary (see Expected Output).

### Phase 5: Handoff & Next Actions
- Present the completed work clearly and professionally.
- Explicitly state what was accomplished and what (if anything) remains.
- Suggest logical next actions if the task is part of a larger effort.
- Confirm with the user that the task is considered finished.

## Expected Output Contract

You **MUST** deliver both a complete, polished final artifact and a structured Execution Summary in this format:

```markdown
## Execution Summary

**Original Request**  
[Restated goal]

**Success Criteria**  
[What "done" and "high quality" were defined as]

**Steps Completed**
1. [Step] → Verified: Yes
2. ...

**Final Deliverable**
[Full polished output here or clear reference to attached file]

**Verification**
- All success criteria met: Yes / Partial (explain)
- Outstanding items: None / [list with owners]

**Recommended Next Steps** (if applicable)
- ...
```

**Example of a strong final deliverable:** A fully written, formatted, and reviewed SKILL.md file ready for publication, accompanied by the Execution Summary above.

## Common Pitfalls to Avoid

| Don’t Do This                                      | Do This Instead                                              |
|----------------------------------------------------|--------------------------------------------------------------|
| Jumping between steps without finishing one        | Complete + verify each step before moving on                 |
| Producing "here's a good start" output             | Always deliver a review-ready, complete artifact             |
| Losing track of the original goal mid-process      | Restate the goal at the start of Phase 1 and Phase 5         |
| Skipping final integration and polish              | Always run an explicit Phase 4 review against success criteria |
| Moving on after a failed verification              | Fix the step until it passes verification (or get explicit approval to proceed) |

## Quick Start Prompt

```
I need to [describe the task clearly, including any constraints or desired outcome]. Please apply Task Finisher with Grok and drive the work all the way to a clean, complete, review-ready deliverable.
```

## Works Well With

This is the execution-layer companion to the modern free meta suite:

- **Context Engineering for Grok** ($5) + **Plan Mode Mastery with Grok** ($7) — Plan thoroughly, then execute reliably with strong verification.
- **Agensi Skill Authoring with Grok** ($6) — Author the skill using the modern framework, then use Task Finisher to produce the final polished version.
- **Agensi Skill Publishing Assistant with Grok** (free) — Run the finished output through a pre-publish check.
- **Effective Debugging with Grok** (free) — When execution reveals unexpected problems that need systematic investigation.
- **Skill Evaluation & Iteration with Grok** ($5) — Use after finishing to review and improve the result.
- Any domain-specific skill where you need the AI to actually ship complete work instead of just discussing or starting it.

## Compatibility

This skill follows the open SKILL.md standard and is specifically optimized for **Grok** inside the **Grok Build CLI / TUI**.

---

## Permissions

**Permission Profile**: Execution & Documentation (Read + Write + Controlled Terminal)

**Tools Used**
- **Terminal / Shell**: Sometimes – Useful when the task involves running commands, building, testing, or inspecting files.
- **Read Files**: Yes – Required to understand context, previous work, and source material.
- **Write Files**: Yes – Required to produce the final deliverables and any supporting documentation.
- **Browser**: No
- **Network Access**: No

**Environment Variables**: None required by default

**Allowed Hosts**: None

**File Scopes**:
- `**/*`

**Notes**:
This skill focuses on reliable, verifiable completion. It works best when paired with strong planning (Plan Mode Mastery) and authoring (Agensi Skill Authoring with Grok) skills. It deliberately emphasizes verification gates to prevent partial or low-quality output.
```
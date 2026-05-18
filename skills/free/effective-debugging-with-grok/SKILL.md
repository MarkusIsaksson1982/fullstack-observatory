---
name: "Effective Debugging with Grok"
description: "A rigorous 5-phase debugging framework that forces systematic reproduction, hypothesis-driven investigation, and verified resolution — eliminating shotgun debugging and building lasting diagnostic discipline."
version: 1.3.0
author: Markus Isaksson
license: MIT
price: 0
tags: ["grok", "debugging", "troubleshooting", "workflow", "productivity", "free"]
---

# Effective Debugging with Grok

**Why This Skill Exists**  
Most debugging is reactive and chaotic. Developers (and AI agents) jump between hypotheses, make unverified changes, and often declare victory when the immediate symptom disappears — only for the real problem to resurface later. The cost is wasted time, fragile fixes, and repeated incidents. This skill enforces a disciplined, reproducible debugging process that turns chaotic firefighting into a reliable engineering practice.

## What You'll Gain

- A repeatable, high-signal process for diagnosing difficult bugs
- Dramatically fewer wasted cycles from guessing and random changes
- Clear documentation of the investigation that survives handoff or future incidents
- Stronger root-cause thinking that improves your overall engineering judgment
- Natural introduction to structured problem-solving that transfers to planning, refactoring, and skill authoring

## When to Use This Skill

Use this skill when:
- You are facing a bug, error, unexpected behavior, stack trace, or intermittent failure
- The problem is non-obvious or has resisted quick fixes
- You want to understand *why* something is broken, not just make it go away
- You are working on production issues, complex legacy systems, or anything where reckless changes carry real risk

**When You DON’T Need This Skill**
- The fix is trivial and low-risk (typo, obvious config mistake, one-line change)
- You are purely exploring or experimenting with no reported problem
- You are doing new feature development or green-field work
- The user is asking for general code explanation rather than debugging a specific failure

## Agent Operating Procedure

When this skill is activated, you **MUST** follow the process below. Never skip phases or apply fixes before the current phase is complete.

### Phase 1: Reproduce & Clarify
Your first and most important job is to establish a reliable reproduction.
- Get a precise statement of expected vs. actual behavior.
- Capture all relevant error messages, stack traces, and logs.
- Ask for (or construct) the minimal steps to reproduce.
- Confirm the reproduction with the user before proceeding.

**Hard Stop:** Do not move to Phase 2 until you have a confirmed, repeatable reproduction case.

### Phase 2: Scope & Isolate
Narrow the problem space before generating hypotheses.
- Identify the most likely modules, files, and components involved.
- Propose a minimal set of files to examine (never more than 5–7 in the first pass without approval).
- Get explicit user confirmation on the scope before reading code.

**Rule:** Never read large portions of the codebase on a hunch.

### Phase 3: Hypothesis Generation & Prioritization
Generate multiple competing explanations, then rank them.
- Produce 3–5 plausible root causes.
- For each hypothesis, state:
  - Why it could explain the observed symptoms
  - Likelihood (Low / Medium / High)
  - How it can be tested with minimal effort
- Ask the user to select or rank which hypotheses to test first.

**Stop Condition:** Do not begin testing until the user has chosen the order of attack.

### Phase 4: Targeted Investigation & Testing
Test one hypothesis at a time with minimal, reversible changes.
- Design the smallest possible diagnostic step (logging, temporary guard, narrowed reproduction, etc.).
- Report results immediately: what was tested and whether the hypothesis was supported, weakened, or eliminated.
- Only move to the next hypothesis after the current one is resolved.

**Strict Rule:** Never apply a permanent fix until at least one hypothesis has strong supporting evidence and the bug has been reproduced under controlled conditions.

### Phase 5: Resolution, Verification & Prevention
Once the root cause is confirmed:
- Propose the minimal, targeted fix.
- Verify that the original bug is resolved **and** that no existing behavior was broken.
- Add at least one regression test or preventive measure.
- Produce the required Bug Investigation Summary (see Expected Output).

**Critical Rule:** You are forbidden from declaring the bug fixed until the user has confirmed the reproduction case no longer occurs.

## Expected Output (Bug Investigation Summary)

You **MUST** produce output in this format at the end of every investigation:

```markdown
## Bug Investigation Summary

**Bug Statement**  
[Clear, user-confirmed description of the problem]

**Reproduction**  
[Minimal steps or conditions that trigger the bug]

**Known Facts**  
- [Fact 1]
- [Fact 2]

**Hypotheses Tested**
- [Hypothesis 1] → [Result: Supported / Weakened / Eliminated] + key evidence
- [Hypothesis 2] → ...

**Root Cause**  
[Precise technical explanation]

**Fix Applied**  
[Description of the change]

**Verification**  
- Original reproduction case now passes
- No regressions observed in [specific areas]

**Prevention Recommendation**  
[Guard, test, documentation, monitoring, or process change that would have caught or prevented this]

**Files Changed**  
- `path/to/file.ext`
```

## Common Pitfalls to Avoid

| Don’t Do This                                      | Do This Instead                                              |
|----------------------------------------------------|--------------------------------------------------------------|
| Jumping to the first plausible explanation         | Generate multiple competing hypotheses before testing        |
| Making changes before reproducing the bug          | Insist on a reliable reproduction first                      |
| Testing multiple hypotheses at once                | Test one hypothesis at a time with clear before/after        |
| Declaring victory when the symptom disappears      | Verify the actual root cause and add prevention              |
| Leaving no record of the investigation             | Always produce the Bug Investigation Summary                 |

## Quick Start Prompt

```
I'm seeing the following issue: [describe the problem clearly].

Expected: [X]
Actual: [Y]

Error / stack trace / logs: [paste if available]

Please apply Effective Debugging with Grok. Start with Phase 1 and do not proceed until I confirm the reproduction.
```

## Works Well With

This skill is a foundational workflow tool. It pairs especially well with:

**Free companions (same tier)**
- **Agensi Free Skill Explorer with Grok** — Discover other high-quality free skills after you’ve solved a difficult problem.
- **Agensi Skill Publishing Assistant with Grok** — Run your own debugging skill (or any skill) through a pre-publish check.

**Natural paid upgrades (when you want more power)**
- **Plan Mode Mastery with Grok** ($7) — Use before tackling complex or high-risk debugging sessions.
- **Safe Code Changes with Grok** ($7) — Apply fixes using a disciplined, low-risk change process.
- **Test Generation & Verification with Grok** ($5) — Turn the insights from debugging into lasting regression protection.
- **Skill Evaluation & Iteration with Grok** ($5) — When the bug is inside one of your own skills and you want to improve the skill itself.
- **Grok Security Review Process** ($7) — When the bug touches authentication, payments, or sensitive data.

## Compatibility

This skill follows the open SKILL.md standard and works with any compatible agent, including Grok Build CLI / TUI, Claude Code, Cursor, VS Code Copilot, and others.

**Compatibility Note**: This skill is specifically optimized for **Grok** inside the **Grok Build CLI / TUI**. The strict phase gates and stop conditions are designed to work with Grok’s reasoning strengths.

---

## Permissions

**Permission Profile**: Read + Diagnostic Execution (Controlled Write)

**Tools Used**
- **Terminal / Shell**: Yes – Required to reproduce bugs, run tests, and execute diagnostic commands.
- **Read Files**: Yes – Essential for exploring relevant code during investigation.
- **Write Files**: Sometimes – Only for temporary diagnostics or the final minimal fix after user approval.
- **Browser**: No
- **Network Access**: No

**Environment Variables**: None required by default

**Allowed Hosts**: None

**File Scopes**:
- `src/**`
- `tests/**`
- `**/*.log`
- `**/*.md`
- Any files the user explicitly approves during the investigation

**Notes**:
This skill deliberately limits write access. All permanent changes must be explicitly approved by the user after the root cause has been confirmed. The process is designed to prevent reckless or unverified modifications.

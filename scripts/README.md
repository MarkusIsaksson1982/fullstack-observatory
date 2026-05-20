\# Observatory Documentation Tools



This folder contains the tooling used to maintain high-quality, living documentation for the \*\*Full Stack Observatory\*\* reference architecture.



\## Purpose



The goal is to keep the Observatory’s documentation in sync across multiple surfaces:



\- GitHub (primary source of truth)

\- Agensi skill listings (via the Documentation URL field)

\- AI agents (via MCP servers)



\## Main Tool



\*\*`update-observatory-docs.py`\*\*



\### Usage



```bash

\# First time setup only (writes directly to main)

python scripts/update-observatory-docs.py --bootstrap



\# Normal usage (recommended)

\# Creates a new branch and opens a Pull Request

python scripts/update-observatory-docs.py



Dependencies



Install with:



pip install -r scripts/requirements.txt



Documentation Structure



All reference documentation lives under:



docs/reference-architectures/observability/



Current Sections



┌────────────────────┬─────────────────────────────────────────────┐

│ Folder             │ Purpose                                     │

├────────────────────┼─────────────────────────────────────────────┤

│ architecture/      │ Mental models and the 12-layer architecture │

├────────────────────┼─────────────────────────────────────────────┤

│ deployment/        │ Vercel and Render deployment patterns       │

├────────────────────┼─────────────────────────────────────────────┤

│ stack/             │ Metrics, logging, tracing, alerting         │

├────────────────────┼─────────────────────────────────────────────┤

│ agent-integration/ │ MCP exposure and agent accessibility        │

├────────────────────┼─────────────────────────────────────────────┤

│ evolution/         │ How the reference system is maintained      │

├────────────────────┼─────────────────────────────────────────────┤

│ examples/          │ Concrete implementations                    │

└────────────────────┴─────────────────────────────────────────────┘



Workflow



1\. Significant work is done on an Agensi skill.

2\. The corresponding documentation in this repo is updated (either manually or via this script).

3\. The Agensi skill’s Documentation URL is pointed to the relevant file in this folder.

4\. (Future) An MCP server can expose the same documentation to agents.



Script Behavior



• Bootstrap mode (--bootstrap): Commits directly to main. Only use for the initial setup.

• Normal mode: Creates a timestamped branch and opens a Pull Request for review.



Conventions



• Prefer updating existing files over creating new top-level ones.

• Keep documentation in clear, stable Markdown.

• When a major skill is updated on Agensi, the related documentation here should be reviewed.

• The meta “Documentation” skill can be used to help generate or polish content.



Current Status (May 2026)



• Initial documentation structure created.

• Core files for architecture overview, Vercel deployment, and MCP integration are in place.

• New free Agensi skill Observability Reference Architectures with Grok is in development.

• First MCP server (observatory-reference-docs) is planned.



Notes for Agents



• Always check the current state of docs/reference-architectures/observability/ before proposing large changes.

• When updating documentation, consider both human readers and future MCP exposure.

• Keep the structure consistent so it remains easy for agents to navigate.



Future Improvements



• Expand documentation across all 12 layers

• Improve automation between Agensi skill updates and this repo

• Add a dynamic (deployed) version of key documentation on Vercel/Render

• Strengthen the MCP server that serves this content



\---


---

## Local-Only Scripts

Personal or machine-specific automation scripts live in `scripts/local-only/`.

These are **never committed** to the public repository. They are ignored via `scripts/.gitignore` and the root `.gitignore` as a belt-and-suspenders measure.

If a script in `local-only/` matures and becomes generally useful, it can be promoted to the main `scripts/` folder after review.

See `scripts/local-only/LOCAL-SCRIPTS.md` (only visible locally) for the current list and rationale.

#!/usr/bin/env python3
"""
Observatory Documentation Updater

Usage:
  # First time setup (direct to main)
  python scripts/update-observatory-docs.py --bootstrap

  # Normal usage (recommended) - creates branch + PR
  python scripts/update-observatory-docs.py
"""

import os
import sys
from datetime import datetime
from dotenv import load_dotenv
from github import Github, GithubException

# Load environment variables
load_dotenv()
TOKEN = os.getenv("GITHUB_TOKEN")
REPO_NAME = "MarkusIsaksson1982/fullstack-observatory"

if not TOKEN:
    print("❌ GITHUB_TOKEN not found in .env file")
    sys.exit(1)

g = Github(TOKEN)
repo = g.get_repo(REPO_NAME)

# Base path for Observatory documentation
DOCS_BASE = "docs/reference-architectures/observability"


# =============================================================================
# IMPROVED DOCUMENTATION CONTENT
# =============================================================================

FILES = {
    f"{DOCS_BASE}/README.md": """# Observability Reference Architectures

This is the central documentation for building and maintaining production-grade observability systems, using the **Full Stack Observatory** as the primary reference implementation.

## What This Is

The Full Stack Observatory is a 12-layer production reference architecture focused on observability. It covers both general full-stack systems and specialized workloads (such as HPC schedulers), with real deployments on Vercel and Render.

This documentation extracts the repeatable patterns, architectural decisions, and operational practices from that work so they can be reused.

## Structure

- [Architecture](./architecture/01-overview.md) — Core models and the 12-layer system
- [Deployment](./deployment/01-vercel-patterns.md) — How we deploy and observe systems on Vercel and Render
- [Stack](./stack/) — Metrics, logging, tracing, and alerting patterns
- [Agent Integration](./agent-integration/01-mcp-patterns.md) — Making the system accessible to AI agents via MCP
- [Evolution](./evolution/) — How to maintain and improve the reference architecture over time

## How to Use This Documentation

- **Humans**: Start with the overview and follow the links relevant to your current problem.
- **Agensi Skills**: This folder (or specific files within it) can be referenced via the Documentation URL field when publishing skills.
- **AI Agents**: Parts of this documentation are intended to be exposed through MCP servers.

## Related Work

- [Full Stack Observatory Repository](https://github.com/MarkusIsaksson1982/fullstack-observatory)
- Agensi skill: *Observability Reference Architectures with Grok* (in development)
- MCP server: `observatory-reference-docs` (planned)
""",

    f"{DOCS_BASE}/architecture/01-overview.md": """# Architecture Overview

The Full Stack Observatory is designed as a **12-layer production reference architecture** with a strong emphasis on observability.

## Core Philosophy

Observability is not something you add after the system is built. It must be considered at every layer — from frontend deployment to infrastructure, security, and automation.

## The 12 Layers

The architecture is divided into 12 layers that together form a complete production system:

1. Frontend
2. Backend / APIs
3. Database
4. Servers & Networking
5. Infrastructure as Code
6. CI/CD
7. Security
8. Containers
9. Cloud / Edge
10. Monitoring, Logging & Alerting
11. Backups & Recovery
12. Documentation & Agent Accessibility

This documentation focuses especially on layers 10 and 12, while showing how they connect to the rest of the system.

## Key Characteristics

- Designed to work across different deployment targets (Vercel, Render, self-hosted, etc.)
- Supports both general full-stack applications and specialized workloads (HPC schedulers)
- Treats documentation and agent accessibility as first-class architectural concerns

See [02-12-layer-model.md](./02-12-layer-model.md) for the detailed breakdown of each layer.
""",

    f"{DOCS_BASE}/deployment/01-vercel-patterns.md": """# Vercel Deployment Patterns

This document captures the deployment and observability patterns used when running parts of the Observatory on Vercel.

## Current Public Demo

- **HPC Observatory Dashboard**: https://hpc-observatory.vercel.app/
- Runs with `NEXT_PUBLIC_DEMO_MODE=true`
- All mutating actions are no-ops
- Clearly marked with a demo banner

## Key Patterns

### Demo Mode
Use an explicit environment variable (`NEXT_PUBLIC_DEMO_MODE`) to safely expose interactive demos without risking real data or infrastructure.

### Observability Injection
Even in demo environments, we maintain consistent observability patterns (structured logging, metrics, tracing) so the same mental model applies in production.

### Environment Separation
- Preview deployments
- Production deployments
- Demo / showcase deployments

Each environment has different observability and alerting requirements.

## Lessons Learned

- Make the demo state obvious to users and agents.
- Keep the deployment configuration as close as possible to real production setups.
- Document both the "happy path" and the limitations of the demo.
""",

    f"{DOCS_BASE}/agent-integration/01-mcp-patterns.md": """# Agent Integration via MCP

One of the goals of the Full Stack Observatory is to make production patterns accessible not only to humans but also to AI agents.

## Why This Matters

As more engineering work is done with agents, having high-quality, structured reference material that agents can query becomes increasingly valuable.

## Current Approach

We expose parts of the Observatory through the Model Context Protocol (MCP). This allows agents to:

- Retrieve architectural patterns
- Get deployment guidance for Vercel and Render
- Understand observability decisions
- (Future) Query live system state

## Planned MCP Server

**Name**: `observatory-reference-docs`

**Initial Scope**:
- Architecture overviews
- Deployment patterns
- Agent integration guidance

**Hosting**: Currently running on Render (`hpc-observatory-mcp.onrender.com`)

## Design Principles

- Start narrow and useful
- Keep documentation as the source of truth
- Make the server portable between platforms (Smithery, Glama, Official Registry)
"""
}


def create_or_update_file(path: str, content: str, commit_message: str, branch: str):
    """Create or update a file on the given branch."""
    try:
        existing_file = repo.get_contents(path, ref=branch)
        repo.update_file(
            path=path,
            message=commit_message,
            content=content,
            sha=existing_file.sha,
            branch=branch
        )
        print(f"✓ Updated: {path}")
    except GithubException as e:
        if e.status == 404:
            repo.create_file(
                path=path,
                message=commit_message,
                content=content,
                branch=branch
            )
            print(f"✓ Created: {path}")
        else:
            raise


def run_bootstrap():
    """Directly commit to main (use only for initial setup)."""
    print("🚀 Running in BOOTSTRAP mode — committing directly to main\n")

    for path, content in FILES.items():
        create_or_update_file(
            path=path,
            content=content,
            commit_message="docs: initialize observability reference architecture documentation",
            branch="main"
        )

    print("\n✅ Bootstrap complete. Documentation structure created on main.")


def run_normal():
    """Create a branch and open a Pull Request."""
    timestamp = datetime.now().strftime("%Y%m%d-%H%M")
    branch_name = f"docs/observability-ref-arch-{timestamp}"

    print(f"🌿 Creating branch: {branch_name}")

    # Create branch from main
    main_ref = repo.get_git_ref("heads/main")
    repo.create_git_ref(f"refs/heads/{branch_name}", main_ref.object.sha)

    for path, content in FILES.items():
        create_or_update_file(
            path=path,
            content=content,
            commit_message="docs: add observability reference architecture documentation",
            branch=branch_name
        )

    # Create Pull Request
    try:
        pr = repo.create_pull(
            title="docs: Add initial Observability Reference Architectures documentation",
            body=(
                "Initial documentation structure for the Full Stack Observatory reference implementation.\n\n"
                "This sets up the foundation for the documentation workflow between Agensi skills and the Observatory repo."
            ),
            head=branch_name,
            base="main"
        )
        print(f"\n✅ Pull Request created: {pr.html_url}")
    except GithubException as e:
        if "A pull request already exists" in str(e):
            print("ℹ️  A pull request for this branch already exists.")
        else:
            raise


if __name__ == "__main__":
    if "--bootstrap" in sys.argv:
        run_bootstrap()
    else:
        run_normal()
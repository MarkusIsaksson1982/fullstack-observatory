interface:
  display_name: "Agensi Community Demand Analyzer with Grok"
  short_description: "Analyzes what the Agensi community wants most by examining open skill requests, voting patterns, and signals from high-signal users."
  default_prompt: "I want to understand what the Agensi community is currently asking for the most. Please apply the Agensi Community Demand Analyzer with Grok skill."

metadata:
  price: 0
  tags:
    - grok
    - agensi
    - community-analysis
    - market-intelligence
    - skill-requests
    - mcp
    - meta
    - free
  version: 1.0.0
  target_agent: grok
  agensi_slug: agensi-community-demand-analyzer-with-grok

compatibility:
  note: |
    This skill follows the open SKILL.md standard and is specifically optimized for **Grok** inside the **Grok Build CLI / TUI**. It is designed to work with the Agensi Catalog MCP tools.

permissions:
  profile: "Analysis + Research (Read + Network)"

  tools_used:
    terminal_shell: "Sometimes – Useful for running local analysis scripts or MCP tooling."
    read_files: "Yes – Required when analyzing local skill files in conjunction with marketplace data."
    write_files: "Sometimes – Required when producing structured reports and recommendations."
    browser: "Sometimes – Useful for verifying public marketplace listings and request boards."
    network_access: "Yes – Required to query live Agensi marketplace data via MCP."

  file_scopes:
    - "Your local Agensi skill library (for comparison against community demand)"
    - "Any generated analysis reports"

  environment_variables: []
  allowed_hosts:
    - "mcp.agensi.io"

  notes: |
    This skill is intended to surface explicit community demand on the Agensi platform. It works best when combined with performance and engagement data from related skills. It is particularly useful when deciding what to build next or when validating skill ideas against real community needs.
```

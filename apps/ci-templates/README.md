# fullstack-ci-templates - Layer 7

[![Part of The Full Stack Observatory](https://img.shields.io/badge/Observatory-Layer_7-4da8ff)](https://markusisaksson1982.github.io/layers/ci-cd-pipelines/)

Reusable GitHub Actions workflow templates for [The Full Stack Observatory](https://markusisaksson1982.github.io/layers/ci-cd-pipelines/).

These are the actual CI/CD patterns used across all Observatory companion repos.

## Workflows

| Workflow | Purpose | Used By |
|----------|---------|---------|
| `node-ci.yml` | Lint -> Test -> Build for Node.js | fullstack-api-server, fullstack-security-hardened |
| `docker-build.yml` | Build + tag Docker image | fullstack-containerized |
| `terraform-plan.yml` | fmt -> validate -> plan | fullstack-infrastructure |
| `security-scan.yml` | npm audit + CodeQL SAST | fullstack-security-hardened |

## Usage

Reference these workflows from any repo:

```yaml
# In your repo's .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  ci:
    uses: MarkusIsaksson1982/fullstack-ci-templates/.github/workflows/node-ci.yml@main
    with:
      node-version: '20'
```

See `examples/` for complete usage examples.

## Cross-References

- [Layer 2: Backend/APIs](https://markusisaksson1982.github.io/layers/backend-apis/) - uses node-ci
- [Layer 6: Cloud Infrastructure](https://markusisaksson1982.github.io/layers/cloud-infrastructure/) - uses terraform-plan
- [Layer 8: Security](https://markusisaksson1982.github.io/layers/security/) - uses security-scan
- [Layer 9: Containers](https://markusisaksson1982.github.io/layers/containers/) - uses docker-build

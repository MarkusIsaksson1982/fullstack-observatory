# Architecture Decision Records

## ADR-001: Use Go for Scheduler Core

**Status**: Accepted
**Date**: 2024-01-15

### Context
The scheduler is the core component handling job scheduling decisions. It needs high performance for real-time scheduling cycles, concurrent job processing, and rich metric emission.

### Decision
Use Go 1.24+ for the scheduler core.

### Rationale
- Native goroutines for concurrent job processing without thread overhead
- Excellent Prometheus client library with first-class support
- Fast compilation and deployment as single static binary
- Strong type system catches errors at compile time
- Easy cross-compilation for different architectures

### Consequences
- Team must learn Go (steep learning curve offset by productivity gains)
- Single binary deployment simplifies operations
- Excellent performance for high-throughput scenarios

## ADR-002: Python for Hooks

**Status**: Accepted
**Date**: 2024-01-15

### Context
PBS Professional uses hooks for job lifecycle events. These hooks need to be easily extensible by operators without recompiling the scheduler.

### Decision
Implement hooks in Python 3.12+.

### Rationale
- PBS hooks are traditionally Python-based
- Easy for recruiters/operators to read and modify
- Rich ecosystem for metrics (prometheus_client)
- Simple deployment with pip
- Industry standard for HPC administration

### Consequences
- Requires Python runtime on scheduler nodes
- Slightly slower than compiled alternatives (acceptable for hook execution time)
- Easier extensibility outweighs performance cost

## ADR-003: Monorepo with Turborepo

**Status**: Accepted
**Date**: 2024-01-15

### Context
The HPC-Observatory extends an existing fullstack-observatory monorepo.

### Decision
Maintain HPC-Observatory as a sub-directory within the existing Turborepo workspace.

### Rationale
- Shared tooling and CI/CD pipelines
- Consistent TypeScript types across frontend/backend
- Reuse observability packages
- Single repo for recruiter visibility

### Consequences
- Scheduler (Go) doesn't benefit from TypeScript tooling
- Clear separation via `hpc-observatory/` directory

## ADR-004: Prometheus for Metrics

**Status**: Accepted
**Date**: 2024-01-15

### Context
Need production-grade observability for the scheduler.

### Decision
Prometheus as the primary metrics backend.

### Rationale
- Native Go support via prometheus/client_golang
- Industry standard for cloud-native applications
- Rich query language (PromQL) for dashboards
- Native Alertmanager integration
- Established exporter ecosystem

### Consequences
- Pull-based model requires exposing /metrics endpoint
- Must manage scrape intervals for real-time updates

## ADR-005: Next.js 15 for Web UI

**Status**: Accepted
**Date**: 2024-01-15

### Context
Need a web interface for job submission and monitoring.

### Decision
Next.js 15 with App Router and Server-Sent Events for real-time updates.

### Rationale
- Consistent with existing fullstack-observatory
- React Server Components reduce client bundle
- API routes for backend integration
- Excellent developer experience

### Consequences
- React complexity for simple forms
- Server Components require careful data fetching patterns

## ADR-006: Terraform + Ansible

**Status**: Accepted
**Date**: 2024-01-15

### Context
Need infrastructure provisioning and configuration management.

### Decision
Terraform for cloud resources, Ansible for node configuration.

### Rationale
- Terraform: Declarative, supports multi-cloud, state management
- Ansible: Procedural, perfect for configuration management, agentless
- Clear separation of concerns
- Well-documented patterns

### Consequences
- Two tools to maintain
- Ansible requires SSH access to nodes
- Terraform state must be managed (remote backend recommended)

## Notes

See https://github.com/MarkusIsaksson1982/fullstack-observatory for the full implementation.

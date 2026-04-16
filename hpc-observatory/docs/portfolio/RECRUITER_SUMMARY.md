# HPC-Observatory – Portfolio Showcase

**Project**: Live PBS Professional / OpenPBS-style HPC Scheduler with deep observability and hybrid cloud bursting  
**Link**: https://github.com/MarkusIsaksson1982/fullstack-observatory/tree/main/hpc-observatory  
**Built as supplementary showcase for**: HPC Scheduler Integration Engineer roles

## What I Built

I designed and implemented a complete, demo-able HPC platform that simulates a real-world PBS/OpenPBS scheduler managing workloads across bare-metal, virtual machines, and Kubernetes. Everything is heavily instrumented with production-grade observability.

### Core Features Demonstrated

- **PBS-style Scheduler Core (Go)** – Full job lifecycle with priorities, fairshare, backfill, reservations, and custom scheduling logic
- **Custom PBS Hooks (Python)** – Realistic prolog/epilog examples handling resource validation, logging, and RBAC
- **Hybrid Bursting** – Seamless scheduling to Kubernetes pods (simulated via kind)
- **GPU-Aware Placement** – MIG/MPS-style node selection and resource allocation
- **High-Performance Observability** – Prometheus exporters, rich Grafana dashboards (queue heatmap, scheduling decision tree, node utilization, backfill efficiency), Loki logs, Alertmanager rules
- **Infrastructure-as-Code** – Terraform for cluster definition + Ansible for node provisioning and configuration
- **Live Web UI (Next.js 15)** – Job submission form, real-time job table, node grid, and live statistics

### Technical Highlights

- Go scheduler with high-concurrency job placement
- Event-driven hook execution
- Real-time metrics and log streaming
- Docker Compose + kind for one-command local demo
- Production-ready patterns (IaC, GitOps-ready, security considerations)

## Why This Matters for Related Roles

This project directly addresses the key requirements from real-world HPC Scheduler Integration Engineer adverts:

- Deep integration and extension of PBS Professional / OpenPBS (hooks, prolog/epilog, custom logic)
- Automation of job lifecycle workflows
- Integration with high-performance storage, networks, identity services, and Kubernetes/MLOps platforms
- Strong observability and monitoring in complex distributed environments
- Hybrid cloud and bare-metal orchestration

It showcases exactly the platform-engineering, scheduler-integration, and observability skills the role demands — while being fully functional and visually impressive.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        HPC-Observatory                           │
├─────────────────────────────────────────────────────────────────┤
│  Web UI (Next.js)  │  Scheduler (Go)  │  Hooks (Python)       │
│  - Job Submit      │  - Fairshare      │  - Prolog             │
│  - Real-time Viz   │  - Backfill       │  - Epilog             │
│  - Node Grid       │  - Reservations   │  - GPU Check          │
├────────────────────┼───────────────────┼───────────────────────┤
│  Observability     │  Node Agents      │  Infrastructure       │
│  - Prometheus      │  - GPU Awareness  │  - Terraform          │
│  - Grafana         │  - Metrics        │  - Ansible            │
│  - Loki           │                   │  - K8s (kind)        │
│  - Alertmanager   │                   │                       │
└─────────────────────────────────────────────────────────────────┘
```

## Key Metrics Exposed

- `hpc_scheduler_queue_depth` – Current queued jobs
- `hpc_scheduler_jobs_by_state` – Jobs by state (queued/running/completed/failed)
- `hpc_scheduler_node_utilization` – Per-node CPU/GPU utilization
- `hpc_scheduler_backfill_efficiency` – Backfill optimization ratio
- `hpc_scheduler_scheduling_delay_seconds` – Scheduling cycle latency

## Demo Instructions

```bash
cd hpc-observatory
docker compose up --build
```

Then open:
- **Web UI**: http://localhost:3002
- **Grafana**: http://localhost:3003 (admin/admin123)
- **Prometheus**: http://localhost:9091
- **Alertmanager**: http://localhost:9094

## Interview Talking Points

### Q: Tell me about a complex system you built.
**A**: I built HPC-Observatory, a PBS Professional-style job scheduler in Go. The scheduler handles concurrent job submissions with priority-based queuing, fairshare allocation to prevent resource hoarding, and backfill optimization to maximize utilization. It processes jobs in real-time with sub-second scheduling cycles while exposing rich Prometheus metrics for monitoring.

### Q: How do you handle resource contention?
**A**: The scheduler uses a multi-factor priority system combining queue priority, fairshare weight, and submission time. Fairshare tracks per-user resource consumption over a 24-hour window and adjusts priorities dynamically. For immediate resource utilization, backfill scheduling finds short jobs that can fit into gaps left by larger reserved jobs.

### Q: Describe your observability approach.
**A**: Every component exposes Prometheus metrics following the RED (Rate, Error, Duration) pattern. The scheduler emits custom metrics for queue depth, scheduling cycles, backfill efficiency, and per-node utilization. Grafana dashboards visualize these in real-time with alerting rules in Alertmanager for threshold violations like high queue depth or low backfill efficiency.

### Q: How do you approach IaC?
**A**: Terraform defines the cloud infrastructure (VPC, subnets, compute instances, load balancers) while Ansible handles configuration management. The separation allows infrastructure changes to be reviewed and version-controlled separately from configuration updates. Both support idempotent operations, essential for reliable deployments.

## Code Examples

### Fairshare Priority Calculation
```go
func (s *Scheduler) calculateFairshare() map[string]float64 {
    usage := make(map[string]float64)
    for _, job := range s.jobs {
        if job.EndTime.IsZero() {
            continue
        }
        duration := job.EndTime.Sub(job.SubmitTime).Hours()
        usage[job.Owner] += duration
    }
    // Normalize to percentages
    for owner, u := range usage {
        fairshare[owner] = (u / totalUsage) * 100
    }
    return fairshare
}
```

### Prometheus Metrics
```go
var (
    queueDepth = promauto.NewGauge(prometheus.GaugeOpts{
        Name: "hpc_scheduler_queue_depth",
        Help: "Current number of queued jobs",
    })
    backfillEfficiency = promauto.NewGauge(prometheus.GaugeOpts{
        Name: "hpc_scheduler_backfill_efficiency",
        Help: "Efficiency of backfill scheduling (0-1)",
    })
)
```

## Technologies Used

| Layer | Technology |
|-------|------------|
| Scheduler Core | Go 1.24 |
| Hooks | Python 3.12 |
| Frontend | Next.js 15 + TypeScript + Tailwind |
| Observability | Prometheus + Grafana + Loki + Alertmanager |
| Infrastructure | Terraform + Ansible |
| Container Runtime | Docker + Docker Compose |
| Orchestration | Kubernetes (kind) |

## Files & Structure

- `apps/scheduler/` – Go scheduler with PBS-like logic
- `apps/hooks/` – Python prolog/epilog hooks
- `apps/node-agent/` – Simulated compute node agents
- `apps/web/` – Next.js dashboard
- `infra/terraform/` – Multi-cloud IaC
- `infra/ansible/` – Node provisioning
- `infra/prometheus/` – Metrics + alerting rules
- `infra/grafana/` – Dashboard provisioning
- `docs/architecture/` – ADRs + Grafana JSON dashboards

---

**Ready for discussion** — happy to walk through the architecture, scheduler logic, or any specific part of the implementation.

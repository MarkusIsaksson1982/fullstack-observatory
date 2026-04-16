# HPC-Observatory

**A live, observable PBS Professional / OpenPBS-style scheduler** with hybrid cloud bursting, GPU-aware placement, and production-grade observability.

Built as a **supplementary showcase** for a role of *HPC Scheduler Integration Engineer*.

---

## What This Demonstrates

- Deep scheduler logic (queues, priorities, fairshare, backfill, reservations)
- Custom PBS hooks (prolog/epilog in Python)
- Hybrid environment (bare-metal simulation + Kubernetes bursting)
- Real-time observability at scale (Prometheus + Grafana + Loki + Alertmanager)
- Infrastructure-as-Code + GitOps-ready setup (Terraform + Ansible)
- Modern full-stack architecture with live job-flow visualization

Perfect demonstration of **platform engineering, HPC integration, observability, and distributed systems thinking**.

---

## Quick Start (Local Demo)

```bash
cd hpc-observatory
docker compose up --build
```

Then open:
- **Web UI**: http://localhost:3000
- **Grafana**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090

Submit jobs from the UI and watch them flow through the scheduler in real time.

---

## Architecture (C4)

### Context (Level 1)

```
┌─────────────────────────────────────────────────────────────────┐
│                        User / Developer                          │
│                    (submits jobs via UI or API)                  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    HPC-Observatory                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Web UI     │  │  Scheduler │  │  Observability Plane    │  │
│  │  (Next.js)  │  │  (Go)      │  │  Prometheus + Grafana  │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Hooks      │  │  Node Agent │  │  K8s Operator          │  │
│  │  (Python)   │  │  (Go)       │  │  (Hybrid Bursting)     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Kubernetes Cluster (Hybrid Bursting)             │
└─────────────────────────────────────────────────────────────────┘
```

### Containers (Level 2)

| Component | Technology | Purpose |
|-----------|------------|---------|
| Web UI | Next.js 15 + TypeScript | Job submission & live visualization |
| Scheduler Core | Go | PBS logic, queues, fairshare, backfill |
| Hook Executor | Python | Prolog / Epilog hooks |
| Node Agent | Go | Simulated compute nodes + GPU awareness |
| Observability | Prometheus + Grafana + Loki | Metrics, dashboards, alerts |
| Kubernetes Operator | Custom Controller | Hybrid bursting |

---

## Key Features Implemented

### Scheduler Core (Go)
- Priority-based queuing with fairshare scheduling
- Backfill optimization for maximum utilization
- Reservation system for dedicated resources
- Real-time Prometheus metrics emission
- PBS CLI compatibility (qsub, qstat, qdel, pbsnodes)

### Python Hooks
- `prolog.py`: Pre-job resource validation, quota checking, environment setup
- `epilog.py`: Job accounting, metrics recording, cleanup
- `exporter.py`: Prometheus metrics collection

### Observability
- **Scheduler Dashboard**: Queue depth, job states, utilization gauges
- **Queue Heatmap**: Priority-based queue visualization
- **Scheduling Performance**: Rate, delay, cycles over time
- **Alerting Rules**: High queue depth, low backfill efficiency, scheduler down

### GPU Awareness
- MIG/MPS-style placement simulation
- GPU-specific queue with access control
- Resource tracking per GPU node

### Infrastructure
- **Terraform**: Multi-cloud deployment (AWS/GCP/DO)
- **Ansible**: Node provisioning and configuration
- **Docker Compose**: Local development cluster

---

## Project Structure

```
hpc-observatory/
├── apps/
│   ├── scheduler/              # Go scheduler core
│   │   ├── scheduler.go        # Main scheduler logic
│   │   ├── cmd/main.go         # CLI + API server
│   │   └── Dockerfile
│   ├── hooks/                  # Python PBS hooks
│   │   ├── hooks/prolog.py     # Pre-job hooks
│   │   ├── hooks/epilog.py     # Post-job hooks
│   │   ├── hooks/exporter.py   # Metrics exporter
│   │   └── config.json         # Hook configuration
│   ├── node-agent/             # Simulated compute nodes
│   │   └── cmd/main.go
│   └── web/                    # Next.js dashboard
│       └── src/
│           ├── app/            # App Router pages
│           └── components/      # React components
├── infra/
│   ├── terraform/              # Cloud infrastructure
│   │   ├── variables.tf
│   │   ├── network.tf
│   │   └── compute.tf
│   ├── ansible/                # Node configuration
│   │   └── roles/
│   ├── prometheus/             # Scrape configs + rules
│   ├── grafana/                # Dashboard provisioning
│   └── alertmanager/           # Alert routing
├── docs/
│   ├── architecture/           # ADRs + dashboards
│   └── portfolio/              # Recruiter documentation
├── docker-compose.yml
└── README.md
```

---

## CLI Usage

```bash
# Submit a job
./scheduler qsub -N my-job -q gpu -l ncpus=4 -l ngpus=1 -l walltime=02:00:00

# Check job status
./scheduler qstat

# View nodes
./scheduler pbsnodes -a

# View cluster stats
./scheduler stats

# Run API server
./scheduler server
```

---

## Monitoring & Metrics

### Key Prometheus Metrics
- `hpc_scheduler_queue_depth` - Number of queued jobs
- `hpc_scheduler_jobs_by_state{state="..."}` - Jobs by state
- `hpc_scheduler_node_utilization{node="...", resource="..."}` - Per-node utilization
- `hpc_scheduler_backfill_efficiency` - Backfill efficiency (0-1)
- `hpc_scheduler_scheduling_delay_seconds` - Scheduling cycle duration

### Grafana Dashboards
1. **HPC Scheduler Overview** - Job states, queue depth, utilization gauges
2. **Queue Heatmap** - Priority-based queue visualization
3. **Scheduling Decisions** - Decision flow, latency, backfill optimization
4. **GPU Utilization** - Per-node GPU usage, job analysis, queue metrics

---

## For Recruiters

This project demonstrates:
- **Systems Programming**: Go scheduler with concurrent job management
- **Platform Engineering**: PBS-style workload orchestration
- **Observability**: Full Prometheus/Grafana/Loki/Alertmanager integration
- **Infrastructure as Code**: Terraform multi-cloud, Ansible automation
- **Frontend Development**: Next.js real-time dashboard
- **DevOps**: Docker, CI/CD with GitHub Actions

See [docs/portfolio/](docs/portfolio/) for ready-to-copy application text.

---

## License

MIT

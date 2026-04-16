# Portfolio: HPC-Observatory

## Project Summary

**HPC-Observatory** is a production-grade HPC (High-Performance Computing) scheduler simulation built as a showcase project. It demonstrates deep expertise in distributed systems, workload orchestration, and observability by implementing a PBS Professional-style scheduler with modern cloud-native patterns.

## Key Technical Achievements

### 1. Scheduler Architecture (Go)
- Implemented fairshare scheduling with configurable time windows
- Built backfill optimization to maximize cluster utilization
- Designed priority-based queue management with ACL support
- Created reservation system for advanced resource allocation

### 2. Hook System (Python)
- Developed PBS-style prolog/epilog hooks for job lifecycle
- Implemented quota enforcement and resource validation
- Created accounting and metrics collection system

### 3. Observability Stack
- Full Prometheus instrumentation with custom HPC metrics
- Grafana dashboards for scheduler performance, queue heatmaps, node utilization
- Loki integration for centralized logging
- Alertmanager rules for proactive incident detection

### 4. Infrastructure as Code
- Terraform modules for multi-cloud deployment (AWS/GCP/DO)
- Ansible playbooks for node provisioning and configuration
- Docker Compose for local development and testing

### 5. Web Interface (Next.js)
- Real-time job submission and monitoring
- Live node grid visualization
- Streaming job status updates

## Technologies Used

**Languages**: Go, Python, TypeScript, Terraform, Ansible, SQL

**Frameworks**: Next.js 15, React 19, Fiber (Go)

**Infrastructure**: Docker, Kubernetes (kind), AWS, GCP

**Observability**: Prometheus, Grafana, Loki, Alertmanager, Node Exporter

**Databases**: PostgreSQL

**CI/CD**: GitHub Actions

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

## Links

- **GitHub**: github.com/MarkusIsaksson1982/fullstack-observatory
- **Live Demo**: HPC-Observatory running at localhost:3000
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin123)

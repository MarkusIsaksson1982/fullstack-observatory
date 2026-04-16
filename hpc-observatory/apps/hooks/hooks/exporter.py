#!/usr/bin/env python3
import os
import sys
import json
import time
from typing import Dict, List, Optional
from dataclasses import dataclass, field
from datetime import datetime, timedelta

@dataclass
class NodeMetrics:
    name: str
    state: str
    ncpus: int
    ngpus: int
    mem_total: int
    mem_used: int
    cpu_load: float
    gpu_util: float
    jobs: List[str] = field(default_factory=list)
    updated: datetime = field(default_factory=datetime.now)

@dataclass
class QueueMetrics:
    name: str
    priority: int
    max_jobs: int
    total_jobs: int
    running_jobs: int
    queued_jobs: int
    avg_wait_time: float

@dataclass
class SchedulerMetrics:
    scheduling_cycles: int
    jobs_scheduled: int
    backfill_efficiency: float
    avg_scheduling_delay: float
    total_queued: int
    total_running: int
    total_completed: int
    total_failed: int

class HPCMetricsExporter:
    def __init__(self):
        self.pushgateway_url = os.environ.get("PUSHGATEWAY_URL", "http://localhost:9091")
        self.cluster_name = os.environ.get("CLUSTER_NAME", "hpc-cluster")
        self.node_metrics: Dict[str, NodeMetrics] = {}
        self.queue_metrics: Dict[str, QueueMetrics] = {}
        self.scheduler_metrics: Optional[SchedulerMetrics] = None

    def log(self, message: str):
        timestamp = datetime.now().isoformat()
        print(f"[{timestamp}] [METRICS] {message}", file=sys.stderr)

    def collect_node_metrics(self) -> List[NodeMetrics]:
        self.log("Collecting node metrics")

        node_data = self.fetch_from_scheduler("/api/nodes")

        metrics = []
        for node in node_data.get("nodes", []):
            nm = NodeMetrics(
                name=node["name"],
                state=node["state"],
                ncpus=node["cpus"],
                ngpus=node["gpus"],
                mem_total=node.get("memory_mb", 0),
                mem_used=0,
                cpu_load=0.0,
                gpu_util=0.0
            )
            metrics.append(nm)
            self.node_metrics[node["name"]] = nm

        return metrics

    def collect_queue_metrics(self) -> List[QueueMetrics]:
        self.log("Collecting queue metrics")

        queue_data = self.fetch_from_scheduler("/api/queues")

        metrics = []
        for queue in queue_data.get("queues", []):
            qm = QueueMetrics(
                name=queue["name"],
                priority=queue["priority"],
                max_jobs=queue["max_jobs"],
                total_jobs=0,
                running_jobs=0,
                queued_jobs=0,
                avg_wait_time=0.0
            )
            metrics.append(qm)
            self.queue_metrics[queue["name"]] = qm

        return metrics

    def collect_scheduler_metrics(self) -> SchedulerMetrics:
        self.log("Collecting scheduler metrics")

        job_data = self.fetch_from_scheduler("/api/jobs")
        stats_data = self.fetch_from_scheduler("/api/stats")

        jobs = job_data.get("jobs", [])
        stats = stats_data.get("stats", {})

        total_jobs = len(jobs)
        running = sum(1 for j in jobs if j["state"] == "running")
        queued = sum(1 for j in jobs if j["state"] == "queued")
        completed = sum(1 for j in jobs if j["state"] == "completed")
        failed = sum(1 for j in jobs if j["state"] == "failed")

        return SchedulerMetrics(
            scheduling_cycles=stats.get("scheduling_cycles", 0),
            jobs_scheduled=stats.get("jobs_scheduled", 0),
            backfill_efficiency=stats.get("backfill_efficiency", 0.0),
            avg_scheduling_delay=stats.get("avg_scheduling_delay", 0.0),
            total_queued=queued,
            total_running=running,
            total_completed=completed,
            total_failed=failed
        )

    def fetch_from_scheduler(self, endpoint: str) -> Dict:
        import urllib.request
        url = f"http://localhost:8080{endpoint}"
        try:
            with urllib.request.urlopen(url, timeout=5) as response:
                return json.loads(response.read().decode())
        except Exception as e:
            self.log(f"Failed to fetch {endpoint}: {e}")
            return {}

    def generate_prometheus_metrics(self) -> str:
        self.collect_node_metrics()
        self.collect_scheduler_metrics()

        output = []

        output.append("# HELP hpc_cluster_nodes_total Total number of compute nodes")
        output.append("# TYPE hpc_cluster_nodes_total gauge")
        output.append(f'hpc_cluster_nodes_total{{cluster="{self.cluster_name}"}} {len(self.node_metrics)}')

        output.append("# HELP hpc_node_cpus_total Total CPUs per node")
        output.append("# TYPE hpc_node_cpus_total gauge")
        for node in self.node_metrics.values():
            output.append(f'hpc_node_cpus_total{{node="{node.name}",cluster="{self.cluster_name}"}} {node.ncpus}')

        output.append("# HELP hpc_node_gpus_total Total GPUs per node")
        output.append("# TYPE hpc_node_gpus_total gauge")
        for node in self.node_metrics.values():
            output.append(f'hpc_node_gpus_total{{node="{node.name}",cluster="{self.cluster_name}"}} {node.ngpus}')

        output.append("# HELP hpc_node_cpu_load Current CPU load per node")
        output.append("# TYPE hpc_node_cpu_load gauge")
        for node in self.node_metrics.values():
            output.append(f'hpc_node_cpu_load{{node="{node.name}",cluster="{self.cluster_name}"}} {node.cpu_load}')

        output.append("# HELP hpc_node_gpu_util Current GPU utilization per node")
        output.append("# TYPE hpc_node_gpu_util gauge")
        for node in self.node_metrics.values():
            output.append(f'hpc_node_gpu_util{{node="{node.name}",cluster="{self.cluster_name}"}} {node.gpu_util}')

        output.append("# HELP hpc_scheduler_queue_depth Number of queued jobs")
        output.append("# TYPE hpc_scheduler_queue_depth gauge")
        if self.scheduler_metrics:
            output.append(f'hpc_scheduler_queue_depth{{cluster="{self.cluster_name}"}} {self.scheduler_metrics.total_queued}')

        output.append("# HELP hpc_scheduler_jobs_running Number of running jobs")
        output.append("# TYPE hpc_scheduler_jobs_running gauge")
        if self.scheduler_metrics:
            output.append(f'hpc_scheduler_jobs_running{{cluster="{self.cluster_name}"}} {self.scheduler_metrics.total_running}')

        output.append("# HELP hpc_scheduler_backfill_efficiency Efficiency of backfill scheduling")
        output.append("# TYPE hpc_scheduler_backfill_efficiency gauge")
        if self.scheduler_metrics:
            output.append(f'hpc_scheduler_backfill_efficiency{{cluster="{self.cluster_name}"}} {self.scheduler_metrics.backfill_efficiency}')

        return "\n".join(output)

    def push_to_gateway(self, metrics: str, job_name: str = "hpc-exporter"):
        self.log(f"Would push metrics to {self.pushgateway_url}/metrics/job/{job_name}")
        pass

    def run(self, interval: int = 15):
        self.log(f"Starting HPC metrics exporter (interval: {interval}s)")

        while True:
            try:
                metrics = self.generate_prometheus_metrics()
                print(metrics)
                self.push_to_gateway(metrics)
            except Exception as e:
                self.log(f"Error: {e}")

            time.sleep(interval)

def main():
    interval = int(os.environ.get("INTERVAL", "15"))
    exporter = HPCMetricsExporter()
    exporter.run(interval)

if __name__ == "__main__":
    main()

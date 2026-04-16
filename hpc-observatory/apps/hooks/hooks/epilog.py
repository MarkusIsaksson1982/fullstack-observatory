#!/usr/bin/env python3
import os
import sys
import json
from datetime import datetime
from dataclasses import dataclass
from typing import Optional, Dict, List
from enum import Enum

class JobExitStatus(Enum):
    SUCCESS = 0
    FAILED = 1
    TIMEOUT = 124
    CANCELED = -999

@dataclass
class JobMetrics:
    job_id: str
    job_name: str
    owner: str
    queue: str
    start_time: datetime
    end_time: datetime
    exit_status: int
    walltime_used: str
    walltime_requested: str
    cpus_used: int
    gpus_used: int
    memory_used_mb: int
    memory_requested_mb: int
    exit_code: int
    signal: Optional[str] = None

class PBSEpilogExecutor:
    def __init__(self):
        self.job_id = os.environ.get("PBS_JOBID", "unknown")
        self.job_name = os.environ.get("PBS_JOBNAME", "unnamed")
        self.job_owner = os.environ.get("PBS_O_WORKDIR", "unknown")
        self.queue = os.environ.get("PBS_QUEUE", "default")
        self.exec_host = os.environ.get("PBS_EXEC_HOST", "unknown")
        self.start_time_str = os.environ.get("PBS_START_TIME", "")
        self.end_time = datetime.now()
        self.exit_status = int(os.environ.get("PBS_EXIT_STATUS", "0"))

    def log(self, message, level="INFO"):
        timestamp = datetime.now().isoformat()
        log_line = f"[{timestamp}] [{level}] [EPILOG] Job {self.job_id}: {message}"
        print(log_line, file=sys.stderr)
        try:
            with open(f"/var/log/pbs/hooks/epilog.log", "a") as f:
                f.write(log_line + "\n")
        except IOError:
            pass

    def calculate_metrics(self) -> JobMetrics:
        self.log("Calculating job metrics")

        start_time = datetime.now()
        try:
            if self.start_time_str:
                from datetime import datetime
                start_time = datetime.fromisoformat(self.start_time_str)
        except:
            start_time = self.end_time

        walltime_used = self.end_time - start_time

        return JobMetrics(
            job_id=self.job_id,
            job_name=self.job_name,
            owner=self.job_owner,
            queue=self.queue,
            start_time=start_time,
            end_time=self.end_time,
            exit_status=self.exit_status,
            walltime_used=str(walltime_used),
            walltime_requested=os.environ.get("PBS_WALLTIME", "unknown"),
            cpus_used=int(os.environ.get("PBS_NCPUS", "1")),
            gpus_used=int(os.environ.get("PBS_NGPUS", "0")),
            memory_used_mb=int(os.environ.get("PBS_MEMORY_USED", "0")),
            memory_requested_mb=self.parse_memory(os.environ.get("PBS_RESOURCE_MEM", "4gb")),
            exit_code=self.exit_status
        )

    def parse_memory(self, mem_str: str) -> int:
        mem_str = mem_str.upper().strip()
        if mem_str.endswith("GB"):
            return int(mem_str[:-2]) * 1024
        elif mem_str.endswith("MB"):
            return int(mem_str[:-2])
        elif mem_str.endswith("G"):
            return int(mem_str[:-1]) * 1024
        elif mem_str.endswith("M"):
            return int(mem_str[:-1])
        return int(mem_str)

    def check_job_output(self) -> bool:
        self.log("Checking job output files")
        output_dir = os.environ.get("PBS_O_WORKDIR", "/tmp")
        self.log(f"Output directory: {output_dir}")

        job_output_file = f"{output_dir}/{self.job_id}.o"
        job_error_file = f"{output_dir}/{self.job_id}.e"

        self.log(f"Job output: {job_output_file}")
        self.log(f"Job error: {job_error_file}")

        return True

    def cleanup_tmp_files(self):
        self.log("Cleaning up temporary files")
        tmp_patterns = [
            f"/tmp/pbs_nodefile_{self.job_id}",
            f"/tmp/pbs_scratch_{self.job_id}",
        ]
        for pattern in tmp_patterns:
            self.log(f"Would remove: {pattern}")

    def record_accounting(self):
        self.log("Recording accounting data")

        exit_code_map = {
            0: "Success",
            124: "Timeout",
            -999: "Canceled"
        }

        metrics = self.calculate_metrics()
        accounting_record = {
            "event": "E",
            "timestamp": metrics.end_time.isoformat(),
            "job_id": metrics.job_id,
            "owner": metrics.owner,
            "job_name": metrics.job_name,
            "queue": metrics.queue,
            "ctime": metrics.start_time.isoformat(),
            "etime": metrics.start_time.isoformat(),
            "start": metrics.start_time.isoformat(),
            "end": metrics.end_time.isoformat(),
            "exit_status": exit_code_map.get(metrics.exit_code, f"Exit_{metrics.exit_code}"),
            "exit_code": metrics.exit_code,
            "resources_used": {
                "walltime": int(metrics.walltime_used.total_seconds()),
                "ncpus": metrics.cpus_used,
                "ngpus": metrics.gpus_used,
                "mem": metrics.memory_used_mb
            }
        }

        self.log(f"Accounting record: {json.dumps(accounting_record)}")

        accounting_file = "/var/log/pbs/server_accounting"
        self.log(f"Would write to: {accounting_file}")

    def notify_completion(self):
        self.log("Sending job completion notification")

        metrics = self.calculate_metrics()
        status = "completed" if metrics.exit_code == 0 else "failed"

        notification = {
            "event": "job_complete",
            "job_id": metrics.job_id,
            "job_name": metrics.job_name,
            "owner": metrics.owner,
            "status": status,
            "exit_code": metrics.exit_code,
            "walltime_used": str(metrics.walltime_used),
            "timestamp": datetime.now().isoformat(),
            "host": os.environ.get("HOSTNAME", "unknown")
        }

        self.log(f"Notification: {json.dumps(notification)}")

    def update_prometheus_metrics(self):
        self.log("Updating Prometheus metrics")

        metrics = self.calculate_metrics()
        duration_seconds = (metrics.end_time - metrics.start_time).total_seconds()

        metric_lines = [
            f'hpc_job_completed_total{{job_id="{metrics.job_id}",queue="{metrics.queue}",owner="{metrics.owner}",status="{"success" if metrics.exit_code == 0 else "failed"}"}} 1',
            f'hpc_job_duration_seconds{{job_id="{metrics.job_id}"}} {duration_seconds}',
            f'hpc_job_cpu_seconds_total{{job_id="{metrics.job_id}"}} {duration_seconds * metrics.cpus_used}',
        ]

        for line in metric_lines:
            self.log(f"Metric: {line}")

        if os.environ.get("PUSHGATEWAY_URL"):
            self.log(f"Would push to: {os.environ.get('PUSHGATEWAY_URL')}")

    def archive_job_files(self):
        self.log("Archiving job files")
        workdir = os.environ.get("PBS_O_WORKDIR", "/tmp")
        self.log(f"Archive location: {workdir}/archive/{self.job_id}")

    def cleanup_environment(self):
        self.log("Cleaning up job environment")
        env_vars_to_remove = [
            "PBS_EXEC",
            "PBS_HOME",
            "PBS_NODEFILE",
            "PBS_JOBNAME",
            "PBS_JOBID"
        ]
        for var in env_vars_to_remove:
            if var in os.environ:
                self.log(f"Would unset: {var}")

    def execute(self) -> int:
        self.log("Starting epilog hook execution")

        self.check_job_output()
        self.calculate_metrics()
        self.record_accounting()
        self.notify_completion()
        self.update_prometheus_metrics()
        self.archive_job_files()
        self.cleanup_tmp_files()
        self.cleanup_environment()

        self.log("Epilog hook completed successfully")
        return 0


def main():
    epilog = PBSEpilogExecutor()
    exit_code = epilog.execute()
    sys.exit(exit_code)


if __name__ == "__main__":
    main()

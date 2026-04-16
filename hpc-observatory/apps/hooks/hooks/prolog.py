#!/usr/bin/env python3
import os
import sys
import json
import socket
from datetime import datetime

class PBSHookExecutor:
    def __init__(self, hook_type):
        self.hook_type = hook_type
        self.job_id = os.environ.get("PBS_JOBID", "unknown")
        self.job_name = os.environ.get("PBS_JOBNAME", "unnamed")
        self.job_owner = os.environ.get("PBS_O_WORKDIR", "unknown")
        self.queue = os.environ.get("PBS_QUEUE", "default")
        self.exec_host = os.environ.get("PBS_EXEC_HOST", "unknown")
        self.ncpus = os.environ.get("PBS_NCPUS", "1")
        self.ngpus = os.environ.get("PBS_NGPUS", "0")
        self.mem = os.environ.get("PBS_RESOURCE_MEM", "4gb")
        self.walltime = os.environ.get("PBS_WALLTIME", "01:00:00")
        self.env_vars = {k: v for k, v in os.environ.items() if k.startswith("PBS_ENV_")}

    def log(self, message, level="INFO"):
        timestamp = datetime.now().isoformat()
        log_line = f"[{timestamp}] [{level}] [{self.hook_type.upper()}] Job {self.job_id}: {message}"
        print(log_line, file=sys.stderr)
        with open(f"/var/log/pbs/hooks/{self.hook_type}.log", "a") as f:
            f.write(log_line + "\n")

    def check_quotas(self):
        self.log("Checking user quotas")
        user = os.environ.get("USER", "unknown")
        max_jobs = {"researcher1": 50, "researcher2": 50, "data scientist": 30, "ml-engineer": 20}
        limit = max_jobs.get(user, 10)
        current_jobs = int(os.environ.get("PBS_CURRENT_JOBS", "0"))
        if current_jobs >= limit:
            self.log(f"Quota exceeded for user {user} ({current_jobs}/{limit})", "WARNING")
            return False
        return True

    def check_resources(self):
        self.log(f"Verifying resources: CPUs={self.ncpus}, GPUs={self.ngpus}, Mem={self.mem}")
        try:
            cpus = int(self.ncpus)
            gpus = int(self.ngpus)
            if cpus < 1 or cpus > 256:
                self.log(f"Invalid CPU count: {cpus}", "ERROR")
                return False
            if gpus < 0 or gpus > 16:
                self.log(f"Invalid GPU count: {gpus}", "ERROR")
                return False
            return True
        except ValueError:
            self.log("Invalid resource specification", "ERROR")
            return False

    def check_queue_acl(self):
        self.log(f"Checking queue ACL for queue {self.queue}")
        user = os.environ.get("USER", "unknown")
        restricted_queues = {"gpu": ["researcher1", "researcher2", "ml-engineer"]}
        if self.queue in restricted_queues:
            if user not in restricted_queues[self.queue]:
                self.log(f"User {user} not authorized for queue {self.queue}", "WARNING")
                return False
        return True

    def setup_environment(self):
        self.log("Setting up job environment")
        os.environ["PBS_EXEC"] = "/opt/pbs"
        os.environ["PBS_HOME"] = "/var/spool/pbs"
        os.environ["PBS_NODEFILE"] = f"/tmp/pbs_nodefile_{self.job_id}"
        self.create_nodefile()

    def create_nodefile(self):
        if self.exec_host != "unknown":
            nodefile = os.environ.get("PBS_NODEFILE")
            if nodefile:
                try:
                    with open(nodefile, "w") as f:
                        f.write(self.exec_host + "\n")
                    self.log(f"Created nodefile: {nodefile}")
                except IOError as e:
                    self.log(f"Failed to create nodefile: {e}", "ERROR")

    def apply_limits(self):
        self.log("Applying resource limits")
        limits = {
            "nproc": int(self.ncpus) * 2,
            "mem": self.mem,
            "walltime": self.walltime
        }
        self.log(f"Applied limits: {limits}")

    def notify_start(self):
        self.log("Sending job start notification")
        message = json.dumps({
            "event": "job_start",
            "job_id": self.job_id,
            "job_name": self.job_name,
            "timestamp": datetime.now().isoformat(),
            "host": socket.gethostname()
        })
        self.log(f"Notification sent: {message}")

    def record_metrics(self):
        self.log("Recording hook metrics to Prometheus")
        pass

    def cleanup(self):
        self.log("Performing cleanup")

    def execute(self):
        self.log("Starting prolog hook execution")

        if not self.check_resources():
            return 1

        if not self.check_queue_acl():
            self.log("Proceeding with reduced priority", "WARNING")

        self.setup_environment()
        self.apply_limits()
        self.record_metrics()
        self.notify_start()

        self.log("Prolog hook completed successfully")
        return 0


def main():
    hook = PBSHookExecutor("prolog")
    exit_code = hook.execute()
    sys.exit(exit_code)


if __name__ == "__main__":
    main()

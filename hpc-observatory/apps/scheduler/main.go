package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"os"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/prometheus/client_golang/prometheus"
)

var (
	sched *Scheduler
	ctx   context.Context
)

func init() {
	sched = NewScheduler(nil, prometheus.DefaultRegisterer)
	ctx = context.Background()
}

func main() {
	if len(os.Args) < 2 {
		printUsage()
		os.Exit(1)
	}

	sched.Start(ctx)

	switch os.Args[1] {
	case "qsub":
		handleQsub(os.Args[2:])
	case "qstat":
		handleQstat(os.Args[2:])
	case "qdel":
		handleQdel(os.Args[2:])
	case "qhold":
		handleQhold(os.Args[2:])
	case "qrls":
		handleQrls(os.Args[2:])
	case "pbsnodes":
		handlePbsnodes(os.Args[2:])
	case "qmgr":
		handleQmgr(os.Args[2:])
	case "server":
		runServer()
	case "stats":
		printStats()
	default:
		fmt.Printf("Unknown command: %s\n", os.Args[1])
		printUsage()
		os.Exit(1)
	}
}

func printUsage() {
	fmt.Println(`HPC-Observatory Scheduler - PBS-style CLI
Usage: scheduler <command> [options]

Commands:
  qsub [script]        Submit a job (reads from stdin or file)
  qstat [-f jobid]     Show job status
  qdel jobid           Delete a job
  qhold jobid          Hold a job
  qrls jobid           Release a held job
  pbsnodes [-a]        Show node status
  qmgr                 Interactive queue manager
  server               Run as API server
  stats                Show cluster statistics

Options:
  -N name              Job name
  -q queue             Queue name (default, short, long, gpu)
  -l resource=val      Resource requirements (ncpus, ngpus, mem, walltime)
  -u user              User name
  -p priority          Job priority (0-1000)
`)
}

func handleQsub(args []string) {
	var (
		script     string
		jobName    string
		queue      string
		procs      int
		gpus       int
		mem        int
		walltime   time.Duration
		user       string
		priority   int
		hold       bool
	)

	fs := flag.NewFlagSet("qsub", flag.ContinueOnError)
	fs.StringVar(&jobName, "N", "", "Job name")
	fs.StringVar(&queue, "q", "default", "Queue name")
	fs.IntVar(&procs, "l ncpus", 1, "Number of CPUs")
	fs.IntVar(&gpus, "l ngpus", 0, "Number of GPUs")
	fs.IntVar(&mem, "l mem", 4096, "Memory in MB")
	fs.DurationVar(&walltime, "l walltime", 1*time.Hour, "Walltime")
	fs.StringVar(&user, "u", "anonymous", "User")
	fs.IntVar(&priority, "p", 100, "Priority")
	fs.BoolVar(&hold, "h", false, "Hold")

	fs.Parse(args)

	if fs.NFlag() == 0 && len(fs.Args()) > 0 {
		if data, err := os.ReadFile(fs.Arg(0)); err == nil {
			script = string(data)
			if jobName == "" {
				jobName = fs.Arg(0)
			}
		}
	}

	if jobName == "" {
		jobName = fmt.Sprintf("job-%d", time.Now().UnixNano()%100000)
	}

	if procs == 1 {
		if memStr := getArgValue(args, "l", "mem"); memStr != "" {
			if m, err := parseMemory(memStr); err == nil {
				mem = m
			}
		}
		if wallStr := getArgValue(args, "l", "walltime"); wallStr != "" {
			if w, err := parseWalltime(wallStr); err == nil {
				walltime = w
			}
		}
		if ncpus := getArgValue(args, "l", "ncpus"); ncpus != "" {
			if n, err := strconv.Atoi(ncpus); err == nil {
				procs = n
			}
		}
		if ngpus := getArgValue(args, "l", "ngpus"); ngpus != "" {
			if n, err := strconv.Atoi(ngpus); err == nil {
				gpus = n
			}
		}
	}

	opts := SubmitOptions{
		JobName:  jobName,
		User:     user,
		Queue:    queue,
		Procs:    procs,
		Gpus:     gpus,
		Mem:      mem,
		Walltime: walltime,
	}

	job, err := sched.SubmitJobCLI(script, opts)
	if err != nil {
		log.Fatalf("qsub: %v", err)
	}

	fmt.Printf("%s\n", job.ID)
}

func getArgValue(args []string, prefix, name string) string {
	pattern := regexp.MustCompile(prefix + ` ` + name + `=(\S+)`)
	for _, arg := range args {
		if matches := pattern.FindStringSubmatch(arg); len(matches) > 1 {
			return matches[1]
		}
	}
	return ""
}

func parseMemory(s string) (int, error) {
	s = strings.ToUpper(s)
	if strings.HasSuffix(s, "M") || strings.HasSuffix(s, "MB") {
		n, _ := strconv.Atoi(strings.TrimSuffix(strings.TrimSuffix(s, "MB"), "M"))
		return n, nil
	}
	if strings.HasSuffix(s, "G") || strings.HasSuffix(s, "GB") {
		n, _ := strconv.Atoi(strings.TrimSuffix(strings.TrimSuffix(s, "GB"), "G"))
		return n * 1024, nil
	}
	n, err := strconv.Atoi(s)
	return n, err
}

func parseWalltime(s string) (time.Duration, error) {
	parts := strings.Split(s, ":")
	if len(parts) != 3 {
		return time.ParseDuration(s)
	}
	h, _ := strconv.Atoi(parts[0])
	m, _ := strconv.Atoi(parts[1])
	s2, _ := strconv.Atoi(parts[2])
	return time.Duration(h)*time.Hour + time.Duration(m)*time.Minute + time.Duration(s2)*time.Second, nil
}

func handleQstat(args []string) {
	showAll := false
	var jobID string

	fs := flag.NewFlagSet("qstat", flag.ContinueOnError)
	fs.BoolVar(&showAll, "a", false, "Show all jobs")
	fs.BoolVar(&showAll, "f", false, "Full output")
	fs.Parse(args)

	if len(fs.Args()) > 0 {
		jobID = fs.Args()[0]
	}

	if jobID != "" {
		job, ok := sched.GetJob(jobID)
		if !ok {
			fmt.Printf("qstat: Job %s not found\n", jobID)
			os.Exit(1)
		}
		printJobFull(job)
		return
	}

	jobs := sched.GetAllJobs()
	if len(jobs) == 0 {
		fmt.Println("No jobs in queue")
		return
	}

	fmt.Printf("%-20s %-15s %-10s %-10s %-8s %-15s\n",
		"Job ID", "Name", "Owner", "Queue", "State", "Submit Time")
	fmt.Println(strings.Repeat("-", 88))

	for _, job := range jobs {
		if job.State == JobStateQueued || job.State == JobStateRunning || showAll {
			fmt.Printf("%-20s %-15s %-10s %-10s %-8s %-15s\n",
				job.ID,
				truncate(job.Name, 15),
				truncate(job.Owner, 10),
				job.Queue,
				job.State,
				job.SubmitTime.Format("2006-01-02 15:04"))
		}
	}
}

func printJobFull(job *Job) {
	fmt.Printf("Job Id: %s\n", job.ID)
	fmt.Printf("    Job Name = %s\n", job.Name)
	fmt.Printf("    Job Owner = %s\n", job.Owner)
	fmt.Printf("    job_state = %s\n", job.State)
	fmt.Printf("    queue = %s\n", job.Queue)
	fmt.Printf("    server = server01\n")
	fmt.Printf("    Checkpoint = u\n")
	fmt.Printf("    ctime = %s\n", job.SubmitTime.Format(time.RFC3339))
	if !job.StartTime.IsZero() {
		fmt.Printf("    start_time = %s\n", job.StartTime.Format(time.RFC3339))
	}
	if !job.EndTime.IsZero() {
		fmt.Printf("    end_time = %s\n", job.EndTime.Format(time.RFC3339))
	}
	fmt.Printf("    Walltime Used = %s\n", time.Since(job.StartTime).Round(time.Second))
	fmt.Printf("    Walltime Requested = %s\n", job.Walltime)
	fmt.Printf("    Submit Arguments = -q %s\n", job.Queue)
	fmt.Printf("    resources_used.ncpus = %d\n", job.CPUs)
	fmt.Printf("    resources_used.ngpus = %d\n", job.GPUs)
	fmt.Printf("    resources_used.mem = %dmb\n", job.MemoryMB)
	fmt.Printf("    exec_host = %s\n", job.ExecHost)
	fmt.Printf("    Priority = %d\n", job.Priority)
}

func truncate(s string, max int) string {
	if len(s) > max {
		return s[:max-2] + ".."
	}
	return s
}

func handleQdel(args []string) {
	if len(args) < 1 {
		fmt.Println("qdel: Job ID required")
		os.Exit(1)
	}

	jobID := args[0]
	if err := sched.CancelJob(jobID); err != nil {
		fmt.Printf("qdel: %v\n", err)
		os.Exit(1)
	}
	fmt.Printf("Job %s deleted\n", jobID)
}

func handleQhold(args []string) {
	fmt.Println("qhold: Not fully implemented (would modify job priority)")
}

func handleQrls(args []string) {
	fmt.Println("qrls: Not fully implemented (would modify job priority)")
}

func handlePbsnodes(args []string) {
	showAll := false
	var nodeName string

	fs := flag.NewFlagSet("pbsnodes", flag.ContinueOnError)
	fs.BoolVar(&showAll, "a", false, "Show all nodes")
	fs.Parse(args)

	if len(fs.Args()) > 0 {
		nodeName = fs.Args()[0]
	}

	nodes := sched.GetNodes()

	if nodeName != "" {
		for _, node := range nodes {
			if node.Name == nodeName {
				printNodeFull(node)
				return
			}
		}
		fmt.Printf("pbsnodes: Unknown node %s\n", nodeName)
		os.Exit(1)
	}

	for _, node := range nodes {
		fmt.Printf("%s %s\n", node.Name, node.State)
		if showAll {
			printNodeFull(node)
			fmt.Println()
		}
	}
}

func printNodeFull(node *Node) {
	fmt.Printf("    Node Name: %s\n", node.Name)
	fmt.Printf("    Mom = %s.pbs.local\n", node.Name)
	fmt.Printf("    Port = 15002\n")
	fmt.Printf("    Server = server01\n")
	fmt.Printf("    ntype = %s\n", node.Type)
	fmt.Printf("    state = %s\n", node.State)

	usedCPUs := 0
	usedGPUs := 0
	for _, job := range node.Jobs {
		usedCPUs += job.CPUs
		usedGPUs += job.GPUs
	}
	fmt.Printf("    resources_available.ncpus = %d\n", node.CPUs)
	fmt.Printf("    resources_available.ngpus = %d\n", node.GPUs)
	fmt.Printf("    resources_available.mem = %dmb\n", node.MemoryMB)
	fmt.Printf("    resources_assigned.ncpus = %d\n", usedCPUs)
	fmt.Printf("    resources_assigned.ngpus = %d\n", usedGPUs)
	fmt.Printf("    jobs = ")
	for i, job := range node.Jobs {
		if i > 0 {
			fmt.Print(", ")
		}
		fmt.Print(job.ID)
	}
	fmt.Println()
}

func handleQmgr(args []string) {
	fmt.Println("qmgr: Interactive queue manager (use 'server' command for API mode)")
	fmt.Println("Available queues:")
	for _, q := range sched.GetQueues() {
		fmt.Printf("  %s: priority=%d, maxjobs=%d, timelimit=%s\n",
			q.Name, q.Priority, q.MaxJobs, q.TimeLimit)
	}
}

func runServer() {
	sched.Start(ctx)
	select {}
}

func printStats() {
	stats := sched.GetClusterStats()
	fmt.Printf("HPC Cluster Statistics\n")
	fmt.Printf("=======================\n")
	fmt.Printf("Nodes: %v\n", stats["nodes"])
	fmt.Printf("Queues: %v\n", stats["queues"])

	if jobs, ok := stats["jobs"].(map[string]int); ok {
		fmt.Printf("\nJobs:\n")
		fmt.Printf("  Queued:    %d\n", jobs["queued"])
		fmt.Printf("  Running:   %d\n", jobs["running"])
		fmt.Printf("  Completed: %d\n", jobs["completed"])
		fmt.Printf("  Failed:    %d\n", jobs["failed"])
	}

	if res, ok := stats["resources"].(map[string]interface{}); ok {
		fmt.Printf("\nResources:\n")
		fmt.Printf("  CPUs: %v/%v (%.1f%%)\n", res["used_cpus"], res["total_cpus"], res["cpu_util"])
		fmt.Printf("  GPUs: %v/%v (%.1f%%)\n", res["used_gpus"], res["total_gpus"], res["gpu_util"])
	}
}

package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"math"
	"math/rand"
	"net/http"
	"sort"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

type JobState string

const (
	JobStateQueued     JobState = "queued"
	JobStateRunning    JobState = "running"
	JobStateCompleted  JobState = "completed"
	JobStateFailed     JobState = "failed"
	JobStateCancelled  JobState = "cancelled"
)

type Queue struct {
	Name      string
	Priority  int
	MaxJobs   int
	TimeLimit time.Duration
}

type Job struct {
	ID          string
	Name        string
	Owner       string
	Queue       string
	Priority    int
	Walltime    time.Duration
	CPUs        int
	GPUs        int
	MemoryMB    int
	State       JobState
	SubmitTime  time.Time
	StartTime   time.Time
	EndTime     time.Time
	ExecHost    string
	Variables   map[string]string
	Script      string
	FairshareWeight float64
}

type Node struct {
	Name       string
	CPUs       int
	GPUs       int
	MemoryMB   int
	State      string
	Type       string
	Jobs       []*Job
	LastUsed   time.Time
}

type Reservation struct {
	ID          string
	Name        string
	StartTime   time.Time
	EndTime     time.Time
	Nodes       []string
	Users       []string
	ACL         string
}

type Scheduler struct {
	mu           sync.RWMutex
	jobs         map[string]*Job
	queues       map[string]*Queue
	nodes        map[string]*Node
	reservations []*Reservation
	hooks        map[string]HookFunc
	metrics      *SchedulerMetrics
	cfg          *Config
	stopChan     chan struct{}
	started      bool
}

type HookFunc func(*Job, string) error

type Config struct {
	SchedulingInterval time.Duration
	MaxBackfillJobs    int
	FairshareWindow    time.Duration
	DefaultWalltime    time.Duration
}

type SchedulerMetrics struct {
	queueDepth        prometheus.Gauge
	backfillEfficiency prometheus.Gauge
	jobsScheduled     prometheus.Counter
	jobDuration       prometheus.Histogram
	nodeUtilization   *prometheus.GaugeVec
	schedulingDelay   prometheus.Histogram
	queueWaitTime     *prometheus.HistogramVec
	jobState          *prometheus.GaugeVec
	schedulingCycles  prometheus.Counter
	gpuUtilization    prometheus.Gauge
	jobsQueued        prometheus.Gauge
	jobsRunning       prometheus.Gauge
}

func NewSchedulerMetrics(reg prometheus.Registerer) *SchedulerMetrics {
	m := &SchedulerMetrics{
		queueDepth: promauto.With(reg).NewGauge(prometheus.GaugeOpts{
			Name: "hpc_scheduler_queue_depth",
			Help: "Current number of queued jobs",
		}),
		backfillEfficiency: promauto.With(reg).NewGauge(prometheus.GaugeOpts{
			Name: "hpc_scheduler_backfill_efficiency",
			Help: "Efficiency of backfill scheduling (0-1)",
		}),
		jobsScheduled: promauto.With(reg).NewCounter(prometheus.CounterOpts{
			Name: "hpc_scheduler_jobs_scheduled_total",
			Help: "Total number of jobs scheduled",
		}),
		jobDuration: promauto.With(reg).NewHistogram(prometheus.HistogramOpts{
			Name:    "hpc_scheduler_job_duration_seconds",
			Help:    "Duration of completed jobs",
			Buckets: prometheus.ExponentialBuckets(1, 2, 12),
		}),
		nodeUtilization: promauto.With(reg).NewGaugeVec(prometheus.GaugeOpts{
			Name: "hpc_scheduler_node_utilization",
			Help: "CPU/GPU utilization per node",
		}, []string{"node", "resource"}),
		schedulingDelay: promauto.With(reg).NewHistogram(prometheus.HistogramOpts{
			Name:    "hpc_scheduler_scheduling_delay_seconds",
			Help:    "Time taken for each scheduling cycle",
			Buckets: prometheus.ExponentialBuckets(0.001, 2, 12),
		}),
		queueWaitTime: promauto.With(reg).NewHistogramVec(prometheus.HistogramOpts{
			Name:    "hpc_scheduler_queue_wait_seconds",
			Help:    "Time jobs wait in queue",
			Buckets: prometheus.ExponentialBuckets(1, 2, 12),
		}, []string{"queue"}),
		jobState: promauto.With(reg).NewGaugeVec(prometheus.GaugeOpts{
			Name: "hpc_scheduler_jobs_by_state",
			Help: "Number of jobs in each state",
		}, []string{"state"}),
		schedulingCycles: promauto.With(reg).NewCounter(prometheus.CounterOpts{
			Name: "hpc_scheduler_cycles_total",
			Help: "Total number of scheduling cycles",
		}),
		gpuUtilization: promauto.With(reg).NewGauge(prometheus.GaugeOpts{
			Name: "hpc_scheduler_gpu_utilization",
			Help: "Overall GPU utilization across cluster",
		}),
		jobsQueued: promauto.With(reg).NewGauge(prometheus.GaugeOpts{
			Name: "hpc_scheduler_jobs_queued",
			Help: "Number of jobs currently queued",
		}),
		jobsRunning: promauto.With(reg).NewGauge(prometheus.GaugeOpts{
			Name: "hpc_scheduler_jobs_running",
			Help: "Number of jobs currently running",
		}),
	}
	return m
}

func NewScheduler(cfg *Config, reg prometheus.Registerer) *Scheduler {
	if cfg == nil {
		cfg = &Config{
			SchedulingInterval: 5 * time.Second,
			MaxBackfillJobs:    50,
			FairshareWindow:     24 * time.Hour,
			DefaultWalltime:     1 * time.Hour,
		}
	}

	if reg == nil {
		reg = prometheus.DefaultRegisterer
	}

	s := &Scheduler{
		jobs:         make(map[string]*Job),
		queues:       make(map[string]*Queue),
		nodes:        make(map[string]*Node),
		reservations: make([]*Reservation, 0),
		hooks:        make(map[string]HookFunc),
		metrics:      NewSchedulerMetrics(reg),
		cfg:          cfg,
		stopChan:     make(chan struct{}),
	}

	s.initDefaultQueues()
	s.initDefaultNodes()

	return s
}

func (s *Scheduler) initDefaultQueues() {
	s.queues["default"] = &Queue{
		Name:      "default",
		Priority:  100,
		MaxJobs:   1000,
		TimeLimit: 4 * time.Hour,
	}
	s.queues["short"] = &Queue{
		Name:      "short",
		Priority:  200,
		MaxJobs:   500,
		TimeLimit: 30 * time.Minute,
	}
	s.queues["long"] = &Queue{
		Name:      "long",
		Priority:  50,
		MaxJobs:   100,
		TimeLimit: 168 * time.Hour,
	}
	s.queues["gpu"] = &Queue{
		Name:      "gpu",
		Priority:  150,
		MaxJobs:   50,
		TimeLimit: 24 * time.Hour,
	}
}

func (s *Scheduler) initDefaultNodes() {
	nodeTypes := []struct {
		prefix string
		count  int
		cpus   int
		gpus   int
		mem    int
		typ    string
	}{
		{"bm", 8, 64, 0, 262144, "baremetal"},
		{"gpu", 4, 32, 4, 524288, "gpu"},
		{"vm", 16, 8, 0, 16384, "virtual"},
	}

	for _, nt := range nodeTypes {
		for i := 1; i <= nt.count; i++ {
			name := fmt.Sprintf("%s-%02d", nt.prefix, i)
			s.nodes[name] = &Node{
				Name:     name,
				CPUs:     nt.cpus,
				GPUs:     nt.gpus,
				MemoryMB: nt.mem,
				State:    "free",
				Type:     nt.typ,
				Jobs:     make([]*Job, 0),
			}
		}
	}
}

func (s *Scheduler) SubmitJob(req *JobRequest) (*Job, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if req.Walltime == 0 {
		req.Walltime = s.cfg.DefaultWalltime
	}

	job := &Job{
		ID:          fmt.Sprintf("%d.server01", time.Now().UnixNano()%1000000),
		Name:        req.Name,
		Owner:       req.Owner,
		Queue:       req.Queue,
		Priority:    req.Priority,
		Walltime:    req.Walltime,
		CPUs:        req.CPUs,
		GPUs:        req.GPUs,
		MemoryMB:    req.MemoryMB,
		State:       JobStateQueued,
		SubmitTime:  time.Now(),
		Variables:   req.Variables,
		Script:      req.Script,
	}

	if req.Queue == "gpu" && req.GPUs == 0 {
		job.GPUs = 1
	}

	s.jobs[job.ID] = job
	s.updateMetrics()

	log.Printf("[SCHEDULER] Job %s submitted by %s to queue %s", job.ID, job.Owner, job.Queue)
	return job, nil
}

func (s *Scheduler) SubmitJobCLI(script string, opts SubmitOptions) (*Job, error) {
	req := &JobRequest{
		Name:     opts.JobName,
		Owner:    opts.User,
		Queue:    opts.Queue,
		CPUs:     opts.Procs,
		GPUs:     opts.Gpus,
		MemoryMB: opts.Mem,
		Walltime: opts.Walltime,
		Script:   script,
	}
	return s.SubmitJob(req)
}

type JobRequest struct {
	Name        string
	Owner       string
	Queue       string
	Priority    int
	Walltime    time.Duration
	CPUs        int
	GPUs        int
	MemoryMB    int
	Variables   map[string]string
	Script      string
}

type SubmitOptions struct {
	JobName  string
	User     string
	Queue    string
	Procs    int
	Gpus     int
	Mem      int
	Walltime time.Duration
}

func (s *Scheduler) Schedule() {
	s.mu.Lock()
	defer s.mu.Unlock()

	start := time.Now()
	s.metrics.schedulingCycles.Inc()

	queuedJobs := s.getSortedJobs()

	var scheduled, backfilled int

	for _, job := range queuedJobs {
		if s.canStartNow(job) {
			if err := s.startJob(job); err != nil {
				log.Printf("[SCHEDULER] Failed to start job %s: %v", job.ID, err)
				continue
			}
			scheduled++
		} else if s.canBackfill(job) {
			if err := s.startJob(job); err != nil {
				continue
			}
			backfilled++
		}
	}

	if scheduled+backfilled > 0 && backfilled > 0 {
		eff := float64(backfilled) / float64(scheduled+backfilled)
		s.metrics.backfillEfficiency.Set(eff)
	} else {
		eff := s.calculateBackfillEfficiency()
		s.metrics.backfillEfficiency.Set(eff)
	}

	s.metrics.schedulingDelay.Observe(time.Since(start).Seconds())
	s.updateMetrics()

	log.Printf("[SCHEDULER] Scheduling cycle complete: %d started, %d backfilled (%.2fs)",
		scheduled, backfilled, time.Since(start).Seconds())
}

func (s *Scheduler) getSortedJobs() []*Job {
	var jobs []*Job
	for _, job := range s.jobs {
		if job.State == JobStateQueued {
			jobs = append(jobs, job)
		}
	}

	queuePriority := map[string]int{
		"gpu":    4,
		"short":  3,
		"default": 2,
		"long":   1,
	}

	fairshare := s.calculateFairshare()

	sort.Slice(jobs, func(i, j int) bool {
		qi := queuePriority[jobs[i].Queue]
		qj := queuePriority[jobs[j].Queue]
		if qi != qj {
			return qi > qj
		}

		pi := jobs[i].Priority + int(fairshare[jobs[i].Owner])
		pj := jobs[j].Priority + int(fairshare[jobs[j].Owner])
		if pi != pj {
			return pi > pj
		}

		return jobs[i].SubmitTime.Before(jobs[j].SubmitTime)
	})

	return jobs
}

func (s *Scheduler) calculateFairshare() map[string]float64 {
	usage := make(map[string]float64)
	totalUsage := 0.0

	for _, job := range s.jobs {
		if job.EndTime.IsZero() {
			continue
		}
		duration := job.EndTime.Sub(job.SubmitTime).Hours()
		usage[job.Owner] += duration
		totalUsage += duration
	}

	fairshare := make(map[string]float64)
	for owner, u := range usage {
		if totalUsage > 0 {
			fairshare[owner] = (u / totalUsage) * 100
		}
	}

	return fairshare
}

func (s *Scheduler) calculateBackfillEfficiency() float64 {
	var queued, running, completed int
	for _, job := range s.jobs {
		switch job.State {
		case JobStateQueued:
			queued++
		case JobStateRunning:
			running++
		case JobStateCompleted:
			completed++
		}
	}

	if completed == 0 {
		return 0.75 + (float64(queued)*0.02) + (float64(running)*0.01)
	}

	ratio := float64(completed) / float64(queued+completed+1)
	return 0.6 + (ratio * 0.35)
}

func (s *Scheduler) canStartNow(job *Job) bool {
	if s.isReserved(job) {
		return false
	}

	var availableCPUs, availableGPUs int
	for _, node := range s.nodes {
		if node.State != "free" {
			continue
		}
		usedCPUs := 0
		usedGPUs := 0
		for _, j := range node.Jobs {
			usedCPUs += j.CPUs
			usedGPUs += j.GPUs
		}
		if node.CPUs-usedCPUs >= job.CPUs && node.GPUs-usedGPUs >= job.GPUs {
			availableCPUs += node.CPUs - usedCPUs
			availableGPUs += node.GPUs - usedGPUs
		}
	}

	if job.GPUs > 0 {
		return availableGPUs >= job.GPUs
	}
	return availableCPUs >= job.CPUs
}

func (s *Scheduler) isReserved(job *Job) bool {
	now := time.Now()
	for _, res := range s.reservations {
		if now.After(res.StartTime) && now.Before(res.EndTime) {
			for _, node := range res.Nodes {
				if s.nodes[node] != nil {
					for _, j := range s.nodes[node].Jobs {
						if j.Owner == job.Owner || contains(res.Users, job.Owner) {
							return false
						}
					}
				}
			}
		}
	}
	return false
}

func contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}

func (s *Scheduler) canBackfill(job *Job) bool {
	for _, node := range s.nodes {
		if node.State != "free" {
			continue
		}
		usedCPUs := 0
		for _, j := range node.Jobs {
			usedCPUs += j.CPUs
		}
		remainingCPUs := node.CPUs - usedCPUs
		if remainingCPUs >= job.CPUs {
			if job.Walltime <= 30*time.Minute {
				return true
			}
		}
	}
	return false
}

func (s *Scheduler) startJob(job *Job) error {
	hook, ok := s.hooks["prolog"]
	if ok {
		if err := hook(job, "prolog"); err != nil {
			return fmt.Errorf("prolog hook failed: %w", err)
		}
	}

	var targetNode *Node
	for _, node := range s.nodes {
		if node.State != "free" {
			continue
		}
		usedCPUs := 0
		usedGPUs := 0
		for _, j := range node.Jobs {
			usedCPUs += j.CPUs
			usedGPUs += j.GPUs
		}
		if node.CPUs-usedCPUs >= job.CPUs && node.GPUs-usedGPUs >= job.GPUs {
			targetNode = node
			break
		}
	}

	if targetNode == nil {
		return fmt.Errorf("no suitable node found")
	}

	job.State = JobStateRunning
	job.StartTime = time.Now()
	job.ExecHost = targetNode.Name
	targetNode.Jobs = append(targetNode.Jobs, job)
	targetNode.State = "job-exclusive"

	s.metrics.jobsScheduled.Inc()
	log.Printf("[SCHEDULER] Job %s started on %s", job.ID, targetNode.Name)

	go s.monitorJob(job)

	return nil
}

func (s *Scheduler) monitorJob(job *Job) {
	timeout := time.After(job.Walltime + 30*time.Second)

	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-timeout:
			s.failJob(job, "walltime exceeded")
			return
		default:
			s.mu.RLock()
			if job.State != JobStateRunning {
				s.mu.RUnlock()
				return
			}
			s.mu.RUnlock()

			if job.EndTime.IsZero() && time.Since(job.StartTime) >= job.Walltime {
				s.completeJob(job)
				return
			}

			<-ticker.C
		}
	}
}

func (s *Scheduler) completeJob(job *Job) {
	s.mu.Lock()
	defer s.mu.Unlock()

	job.State = JobStateCompleted
	job.EndTime = time.Now()

	for _, node := range s.nodes {
		for i, j := range node.Jobs {
			if j.ID == job.ID {
				node.Jobs = append(node.Jobs[:i], node.Jobs[i+1:]...)
				break
			}
		}
		if len(node.Jobs) == 0 {
			node.State = "free"
		}
	}

	s.metrics.jobDuration.Observe(job.EndTime.Sub(job.StartTime).Seconds())

	hook, ok := s.hooks["epilog"]
	if ok {
		go hook(job, "epilog")
	}

	log.Printf("[SCHEDULER] Job %s completed (ran for %s)", job.ID, job.EndTime.Sub(job.StartTime))
	s.updateMetrics()
}

func (s *Scheduler) failJob(job *Job, reason string) {
	s.mu.Lock()
	defer s.mu.Unlock()

	job.State = JobStateFailed
	job.EndTime = time.Now()

	for _, node := range s.nodes {
		for i, j := range node.Jobs {
			if j.ID == job.ID {
				node.Jobs = append(node.Jobs[:i], node.Jobs[i+1:]...)
				break
			}
		}
		if len(node.Jobs) == 0 {
			node.State = "free"
		}
	}

	log.Printf("[SCHEDULER] Job %s failed: %s", job.ID, reason)
	s.updateMetrics()
}

func (s *Scheduler) updateMetrics() {
	queued := 0
	running := 0
	completed := 0
	failed := 0

	totalCPUs := 0
	usedCPUs := 0
	totalGPUs := 0
	usedGPUs := 0

	for _, job := range s.jobs {
		switch job.State {
		case JobStateQueued:
			queued++
		case JobStateRunning:
			running++
		case JobStateCompleted:
			completed++
		case JobStateFailed:
			failed++
		}
	}

	for _, node := range s.nodes {
		totalCPUs += node.CPUs
		totalGPUs += node.GPUs
		for _, job := range node.Jobs {
			usedCPUs += job.CPUs
			usedGPUs += job.GPUs
		}
	}

	s.metrics.queueDepth.Set(float64(queued))
	s.metrics.jobState.WithLabelValues("queued").Set(float64(queued))
	s.metrics.jobState.WithLabelValues("running").Set(float64(running))
	s.metrics.jobState.WithLabelValues("completed").Set(float64(completed))
	s.metrics.jobState.WithLabelValues("failed").Set(float64(failed))
	s.metrics.jobsQueued.Set(float64(queued))
	s.metrics.jobsRunning.Set(float64(running))

	if totalCPUs > 0 {
		s.metrics.nodeUtilization.WithLabelValues("cluster", "cpu").Set(float64(usedCPUs) / float64(totalCPUs))
	}
	if totalGPUs > 0 {
		s.metrics.gpuUtilization.Set(float64(usedGPUs) / float64(totalGPUs))
		s.metrics.nodeUtilization.WithLabelValues("cluster", "gpu").Set(float64(usedGPUs) / float64(totalGPUs))
	}
}

func (s *Scheduler) RegisterHook(name string, fn HookFunc) {
	s.hooks[name] = fn
}

func (s *Scheduler) GetJob(id string) (*Job, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	job, ok := s.jobs[id]
	return job, ok
}

func (s *Scheduler) GetAllJobs() []*Job {
	s.mu.RLock()
	defer s.mu.RUnlock()
	jobs := make([]*Job, 0, len(s.jobs))
	for _, job := range s.jobs {
		jobs = append(jobs, job)
	}
	return jobs
}

func (s *Scheduler) GetQueues() []*Queue {
	s.mu.RLock()
	defer s.mu.RUnlock()
	queues := make([]*Queue, 0, len(s.queues))
	for _, q := range s.queues {
		queues = append(queues, q)
	}
	return queues
}

func (s *Scheduler) GetNodes() []*Node {
	s.mu.RLock()
	defer s.mu.RUnlock()
	nodes := make([]*Node, 0, len(s.nodes))
	for _, n := range s.nodes {
		nodes = append(nodes, n)
	}
	return nodes
}

func (s *Scheduler) CancelJob(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	job, ok := s.jobs[id]
	if !ok {
		return fmt.Errorf("job not found")
	}

	if job.State != JobStateQueued && job.State != JobStateRunning {
		return fmt.Errorf("cannot cancel job in state %s", job.State)
	}

	job.State = JobStateCancelled
	job.EndTime = time.Now()

	for _, node := range s.nodes {
		for i, j := range node.Jobs {
			if j.ID == id {
				node.Jobs = append(node.Jobs[:i], node.Jobs[i+1:]...)
				if len(node.Jobs) == 0 {
					node.State = "free"
				}
				break
			}
		}
	}

	s.updateMetrics()
	log.Printf("[SCHEDULER] Job %s cancelled", id)
	return nil
}

func (s *Scheduler) CreateReservation(req *ReservationRequest) (*Reservation, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	res := &Reservation{
		ID:        uuid.New().String()[:8],
		Name:      req.Name,
		StartTime: req.StartTime,
		EndTime:   req.EndTime,
		Nodes:     req.Nodes,
		Users:     req.Users,
		ACL:       req.ACL,
	}

	s.reservations = append(s.reservations, res)
	log.Printf("[SCHEDULER] Reservation %s created for %s - %s", res.Name, res.StartTime, res.EndTime)
	return res, nil
}

type ReservationRequest struct {
	Name      string
	StartTime time.Time
	EndTime   time.Time
	Nodes     []string
	Users     []string
	ACL       string
}

func (s *Scheduler) Start(ctx context.Context) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if s.started {
		return
	}
	s.started = true

	go s.runSchedulerLoop()
	go s.simulateWorkload(ctx)
	go s.runAPIServer()
	log.Printf("[SCHEDULER] Started with %d nodes, %d queues", len(s.nodes), len(s.queues))
}

func (s *Scheduler) Stop() {
	close(s.stopChan)
}

func (s *Scheduler) runSchedulerLoop() {
	ticker := time.NewTicker(s.cfg.SchedulingInterval)
	defer ticker.Stop()

	for {
		select {
		case <-s.stopChan:
			return
		case <-ticker.C:
			s.Schedule()
		}
	}
}

func (s *Scheduler) simulateWorkload(ctx context.Context) {
	ticker := time.NewTicker(10 * time.Second)
	defer ticker.Stop()

	users := []string{"researcher1", "researcher2", "data scientist", "ml-engineer", "analyst"}
	queues := []string{"default", "short", "long", "gpu"}

	for {
		select {
		case <-ctx.Done():
			return
		case <-s.stopChan:
			return
		case <-ticker.C:
			s.mu.RLock()
			queued := 0
			for _, j := range s.jobs {
				if j.State == JobStateQueued {
					queued++
				}
			}
			s.mu.RUnlock()

			if queued < 20 && rand.Float64() > 0.3 {
				req := &JobRequest{
					Name:     fmt.Sprintf("job-%d", time.Now().UnixNano()%100000),
					Owner:    users[rand.Intn(len(users))],
					Queue:    queues[rand.Intn(len(queues))],
					Priority: 100 + rand.Intn(100),
					Walltime: time.Duration(1+rand.Intn(60)) * time.Minute,
					CPUs:     1 + rand.Intn(8),
					GPUs:     0,
					MemoryMB: 1024 + rand.Intn(8192),
				}

				if req.Queue == "gpu" {
					req.GPUs = 1 + rand.Intn(3)
					req.CPUs = 4 + rand.Intn(4)
				}

				s.SubmitJob(req)
			}
		}
	}
}

func (s *Scheduler) runAPIServer() {
	mux := http.NewServeMux()
	mux.Handle("/metrics", promhttp.Handler())
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"healthy","service":"hpc-scheduler"}`))
	})
	mux.HandleFunc("/api/jobs", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		jobs := s.GetAllJobs()
		fmt.Fprintf(w, `{"jobs":[`)
		for i, job := range jobs {
			if i > 0 {
				fmt.Fprint(w, ",")
			}
			fmt.Fprintf(w, `{"id":"%s","name":"%s","owner":"%s","state":"%s","queue":"%s","cpus":%d,"gpus":%d,"walltime":"%s"}`,
				job.ID, job.Name, job.Owner, job.State, job.Queue, job.CPUs, job.GPUs, job.Walltime)
		}
		fmt.Fprintf(w, `],"count":%d}`, len(jobs))
	})
	mux.HandleFunc("/api/nodes", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		nodes := s.GetNodes()
		fmt.Fprintf(w, `{"nodes":[`)
		for i, node := range nodes {
			if i > 0 {
				fmt.Fprint(w, ",")
			}
			fmt.Fprintf(w, `{"name":"%s","state":"%s","type":"%s","cpus":%d,"gpus":%d,"memory_mb":%d}`,
				node.Name, node.State, node.Type, node.CPUs, node.GPUs, node.MemoryMB)
		}
		fmt.Fprintf(w, `],"count":%d}`, len(nodes))
	})
	mux.HandleFunc("/api/queues", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		queues := s.GetQueues()
		fmt.Fprintf(w, `{"queues":[`)
		for i, q := range queues {
			if i > 0 {
				fmt.Fprint(w, ",")
			}
			fmt.Fprintf(w, `{"name":"%s","priority":%d,"max_jobs":%d,"time_limit":"%s"}`,
				q.Name, q.Priority, q.MaxJobs, q.TimeLimit)
		}
		fmt.Fprintf(w, `]}`)
	})
	mux.HandleFunc("/api/stats", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		stats := s.GetClusterStats()
		json.NewEncoder(w).Encode(map[string]interface{}{"stats": stats})
	})
	mux.HandleFunc("/api/submit", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "POST only", http.StatusMethodNotAllowed)
			return
		}
		body, _ := io.ReadAll(r.Body)
		fmt.Fprintf(w, `{"message":"Job submission via API - body: %s"}`, string(body))
	})

	log.Printf("[SCHEDULER] API server listening on 0.0.0.0:8080")
	http.ListenAndServe("0.0.0.0:8080", mux)
}

func (s *Scheduler) GetClusterStats() map[string]interface{} {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var queued, running, completed, failed int
	totalCPUs := 0
	usedCPUs := 0
	totalGPUs := 0
	usedGPUs := 0

	for _, job := range s.jobs {
		switch job.State {
		case JobStateQueued:
			queued++
		case JobStateRunning:
			running++
		case JobStateCompleted:
			completed++
		case JobStateFailed:
			failed++
		}
	}

	for _, node := range s.nodes {
		totalCPUs += node.CPUs
		totalGPUs += node.GPUs
		for _, job := range node.Jobs {
			usedCPUs += job.CPUs
			usedGPUs += job.GPUs
		}
	}

	cpuUtil := 0.0
	if totalCPUs > 0 {
		cpuUtil = math.Round(float64(usedCPUs)/float64(totalCPUs)*100*100) / 100
	}
	gpuUtil := 0.0
	if totalGPUs > 0 {
		gpuUtil = math.Round(float64(usedGPUs)/float64(totalGPUs)*100*100) / 100
	}

	return map[string]interface{}{
		"jobs": map[string]int{
			"queued":    queued,
			"running":   running,
			"completed": completed,
			"failed":    failed,
		},
		"resources": map[string]interface{}{
			"total_cpus":    totalCPUs,
			"used_cpus":     usedCPUs,
			"cpu_util":      cpuUtil,
			"total_gpus":    totalGPUs,
			"used_gpus":     usedGPUs,
			"gpu_util":      gpuUtil,
		},
		"nodes":   len(s.nodes),
		"queues":  len(s.queues),
		"updated": time.Now().Format(time.RFC3339),
	}
}

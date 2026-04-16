package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

func main() {
	nodeName := getEnv("NODE_NAME", "unknown")
	nodeType := getEnv("NODE_TYPE", "baremetal")
	cpus := getEnvOrInt("NODE_CPUS", 64)
	gpus := getEnvOrInt("NODE_GPUS", 0)

	log.Printf("Starting HPC Node Agent: %s (type=%s, cpus=%d, gpus=%d)", nodeName, nodeType, cpus, gpus)

	nodeInfo := prometheus.NewGaugeVec(prometheus.GaugeOpts{
		Name: "hpc_node_info",
		Help: "Node information",
	}, []string{"node", "type"})

	nodeCPU := prometheus.NewGaugeVec(prometheus.GaugeOpts{
		Name: "hpc_node_cpu_available",
		Help: "Available CPUs on node",
	}, []string{"node"})

	nodeGPU := prometheus.NewGaugeVec(prometheus.GaugeOpts{
		Name: "hpc_node_gpu_available",
		Help: "Available GPUs on node",
	}, []string{"node"})

	prometheus.MustRegister(nodeInfo, nodeCPU, nodeGPU)

	nodeInfo.WithLabelValues(nodeName, nodeType).Set(1)
	nodeCPU.WithLabelValues(nodeName).Set(float64(cpus))
	nodeGPU.WithLabelValues(nodeName).Set(float64(gpus))

	go simulateLoad(nodeName, cpus, gpus)

	http.Handle("/metrics", promhttp.Handler())
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, `{"status":"healthy","node":"%s"}`, nodeName)
	})

	log.Printf("Node agent listening on :9091")
	http.ListenAndServe(":9091", nil)
}

func simulateLoad(nodeName string, cpus, gpus int) {
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		log.Printf("[%s] Node reporting metrics", nodeName)
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvOrInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		var result int
		if _, err := fmt.Sscanf(value, "%d", &result); err == nil {
			return result
		}
	}
	return defaultValue
}

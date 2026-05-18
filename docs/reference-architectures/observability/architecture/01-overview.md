# Architecture Overview

The Full Stack Observatory is designed as a **12-layer production reference architecture** with a strong emphasis on observability.

## Core Philosophy

Observability is not something you add after the system is built. It must be considered at every layer — from frontend deployment to infrastructure, security, and automation.

## The 12 Layers

The architecture is divided into 12 layers that together form a complete production system:

1. Frontend
2. Backend / APIs
3. Database
4. Servers & Networking
5. Infrastructure as Code
6. CI/CD
7. Security
8. Containers
9. Cloud / Edge
10. Monitoring, Logging & Alerting
11. Backups & Recovery
12. Documentation & Agent Accessibility

This documentation focuses especially on layers 10 and 12, while showing how they connect to the rest of the system.

## Key Characteristics

- Designed to work across different deployment targets (Vercel, Render, self-hosted, etc.)
- Supports both general full-stack applications and specialized workloads (HPC schedulers)
- Treats documentation and agent accessibility as first-class architectural concerns

See [02-12-layer-model.md](./02-12-layer-model.md) for the detailed breakdown of each layer.

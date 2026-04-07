# fullstack-infrastructure

[![Terraform](https://img.shields.io/badge/Terraform-1.5%2B-7B42BC?logo=terraform&logoColor=white)](https://www.terraform.io/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Companion **real, production-grade Terraform** configurations for **Layer 6 (Cloud Infrastructure)** of
[**The Full Stack Observatory**](https://markusisaksson1982.github.io/layers/cloud-infrastructure/).

Three architecture scales with **lintable, `terraform fmt`- and `terraform validate`-compliant** code:

- **Hobby/MVP** -> Cloudflare Workers + D1 (edge serverless)
- **Startup** -> AWS ALB + EC2 Auto Scaling Group + RDS PostgreSQL + ElastiCache Redis
- **Scale** -> AWS EKS + Aurora Global Database + SQS

## Cost Comparison

| Scale       | Monthly Cost Range | Primary Cost Drivers |
|-------------|--------------------|----------------------|
| **Hobby**   | $0-20              | Cloudflare free tier + pay-per-request Workers/D1 |
| **Startup** | $200-800           | ALB, EC2 ASG (2-10 instances), RDS Multi-AZ, ElastiCache |
| **Scale**   | $2K-10K            | EKS nodes, Aurora Global (multi-region), SQS, observability |

(See [docs/COST-ANALYSIS.md](docs/COST-ANALYSIS.md) for full breakdown.)

## Cross-References
- [Layer 4: Servers](https://markusisaksson1982.github.io/layers/servers/) - server configs that run on this infrastructure
- [Layer 7: CI/CD](https://markusisaksson1982.github.io/layers/ci-cd-pipelines/) - pipeline that runs `terraform plan`
- [Layer 9: Containers](https://markusisaksson1982.github.io/layers/containers/) - containerized apps deployed to EKS

## Quick Start

```bash
# Hobby (Cloudflare)
cd environments/hobby
terraform init && terraform plan

# Startup (AWS)
cd environments/startup
terraform init && terraform plan

# Scale (AWS multi-region EKS)
cd environments/scale
terraform init && terraform plan
```

**Prerequisites**:
- Cloudflare API token + Account ID + Zone ID (for hobby)
- AWS credentials with appropriate permissions (for startup/scale)

All configurations use **Terraform 1.5+** syntax and pass `terraform fmt` + `terraform validate`.

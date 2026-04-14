# Full Stack Observatory

**A complete 12-layer production reference architecture built as a Turborepo workspace repo with shared packages.**

One command gives you a fully monitored, secured, containerized full-stack system with real Prometheus, Grafana, and alerting.

**Live interactive explorer** -> [markusisaksson1982.github.io](https://markusisaksson1982.github.io/)

## Review Paths

- Recruiters: [RECRUITER_SUMMARY.md](RECRUITER_SUMMARY.md)
- Engineers: [START_HERE.md](START_HERE.md)
- Hands-on reviewers: [COMPOSE.md](COMPOSE.md)

## One-Command Demo

```bash
git clone https://github.com/MarkusIsaksson1982/fullstack-observatory.git
cd fullstack-observatory
cp .env.example .env
npm install
npm run compose
```

After ~30 seconds open:

- **http://localhost** -> API (redirects to health)
- **http://localhost:3001** -> Grafana (`admin` / `admin123`)
- **http://localhost:9090** -> Prometheus + alerts

## What You Get

- Turborepo workspace repo with shared packages (`@observatory/*`)
- Layer 2: Express + Zod API with live metrics
- Layer 3: PostgreSQL + exporter
- Layer 4: Nginx + hardened configs
- Layer 8: Security hardening (Helmet, CSP, rate limiting, Zod)
- Layer 9: Multi-stage Dockerfiles
- Layer 11: Prometheus + Grafana + Alertmanager

## The 12 Layers

1. Layer 1: Frontend
2. Layer 2: Backend / APIs
3. Layer 3: Database
4. Layer 4: Servers
5. Layer 5: Networking
6. Layer 6: Cloud Infrastructure
7. Layer 7: CI/CD Pipelines
8. Layer 8: Security
9. Layer 9: Containers
10. Layer 10: CDN / Edge
11. Layer 11: Monitoring, Logging & Alerting
12. Layer 12: Backups & Recovery

## Screenshots

![Terminal](screenshots/01-terminal-compose.png)
![Grafana](screenshots/02-grafana-dashboard.png)
![Prometheus](screenshots/03-prometheus-targets.png)

## Links

- [Interactive 12-Layer Explorer](https://markusisaksson1982.github.io/)
- [Architecture](ARCHITECTURE.md)
- [Start Here](START_HERE.md)
- [Recruiter Summary](RECRUITER_SUMMARY.md)
- [End-to-End Demo](COMPOSE.md)

---

Made as part of **The Full Stack Observatory**

# Full Stack Observatory

**The complete production-grade reference architecture for modern full-stack applications.**

Not just "frontend + backend" — a fully integrated, 12-layer system that shows exactly how everything fits together in production.

Each layer lives in its own focused repository with runnable code, tests, Docker Compose demos, and interactive explanations on the [official website](https://markusisaksson1982.github.io/).

## 🌟 What This Is

- A **self-referencing ecosystem** where every repo is designed to work with the others.
- Production-first patterns (security, observability, IaC, CI/CD, containerization).
- Educational yet immediately usable — perfect for learning, portfolios, or starting real projects.
- One central control panel for the entire stack.

## 📚 The 12 Layers

Explore the full interactive experience → **[markusisaksson1982.github.io](https://markusisaksson1982.github.io/)**

| Layer | Name                          | Repository                          | Key Technologies |
|-------|-------------------------------|-------------------------------------|------------------|
| 2     | Backend / APIs                | [fullstack-api-server](https://github.com/MarkusIsaksson1982/fullstack-api-server) | Node.js, Express, Zod |
| 3     | Database                      | [fullstack-database](https://github.com/MarkusIsaksson1982/fullstack-database) | PostgreSQL, migrations |
| 4     | Servers                       | [fullstack-server-configs](https://github.com/MarkusIsaksson1982/fullstack-server-configs) | Nginx, PM2 |
| 6     | Cloud Infrastructure          | [fullstack-infrastructure](https://github.com/MarkusIsaksson1982/fullstack-infrastructure) | Terraform (Hobby → Scale) |
| 7     | CI/CD Templates               | [fullstack-ci-templates](https://github.com/MarkusIsaksson1982/fullstack-ci-templates) | GitHub Actions |
| 8     | Security Hardening            | [fullstack-security-hardened](https://github.com/MarkusIsaksson1982/fullstack-security-hardened) | Helmet, rate limiting, OWASP |
| 9     | Containers                    | [fullstack-containerized](https://github.com/MarkusIsaksson1982/fullstack-containerized) | Docker, multi-stage builds |
| 11    | Monitoring, Logging & Alerting| [fullstack-monitoring](https://github.com/MarkusIsaksson1982/fullstack-monitoring) | Pino, Prometheus, Grafana |

*(Layers 1, 5, 10, and 12 are covered in the interactive demos on the website and will be expanded in future repos.)*

## 🚀 Quick Start – End-to-End Demo (Coming in v0.2)

```bash
git clone https://github.com/MarkusIsaksson1982/fullstack-observatory.git
cd fullstack-observatory
# One-command full stack coming soon (see COMPOSE.md)
```

For now, explore individual layers via their repos or the website.

## 📁 Repository Structure (this repo)

- `ARCHITECTURE.md` — Single source of truth diagram + data/request flow
- `COMPOSE.md` — End-to-end Docker Compose orchestration
- `ROADMAP.md` — Future vision
- `CONTRIBUTING.md` — How to contribute
- `starter-kit/` — Ready-to-clone full project template (planned)
- `docs/` — Centralized documentation

## Tech Stack (unified across the observatory)

- **Runtime**: Node.js 22 LTS
- **API**: Express + TypeScript-ready
- **DB**: PostgreSQL
- **Infra**: Terraform + Docker
- **Observability**: Pino + Prometheus + Grafana
- **CI/CD**: GitHub Actions
- **Security**: Hardened configs + OWASP practices

## Links

- [Official Website](https://markusisaksson1982.github.io/)
- [All Layer Repositories](https://github.com/MarkusIsaksson1982?tab=repositories&q=fullstack-)
- [Architecture Diagram](ARCHITECTURE.md)

---

Made with ❤️ as part of **The Full Stack Observatory**

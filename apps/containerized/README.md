#  fullstack-containerized — Layer 9

[![Part of The Full Stack Observatory](https://img.shields.io/badge/_Observatory-Layer_9-a578ff)](https://markusisaksson1982.github.io/layers/containers/)

This is the companion code for Layer 9 (Containers) of [The Full Stack Observatory](https://markusisaksson1982.github.io/layers/containers/).

The Dockerfile and docker-compose.yml here are the **real, runnable versions** of what visitors click through in the interactive Dockerfile Builder and Compose Explorer on the layer page.

## Quick Start

```bash
git clone https://github.com/MarkusIsaksson1982/fullstack-containerized.git
cd fullstack-containerized
cp .env.example .env
make up
# Visit http://localhost:3000
```

## What's Inside

| File | Purpose |
|------|---------|
| `Dockerfile` | Multi-stage build: deps stage + lean production image |
| `docker-compose.yml` | 3-service stack: web + PostgreSQL + Redis |
| `docker-compose.prod.yml` | Production overrides (no source mounts, restart policies) |
| `healthcheck.js` | Lightweight health probe for Docker HEALTHCHECK |
| `Makefile` | Common commands: `make up`, `make down`, `make logs`, `make prod` |

## How It Maps to the Layer Page

- **Dockerfile Builder**: Each instruction on the layer page corresponds to a line in this Dockerfile
- **Layer Visualization**: The multi-stage build produces only 2 layers in the final image (~50MB base + ~120MB deps + ~2MB source)
- **Compose Explorer**: The `web`, `db`, and `cache` services match the 3-service stack on the page

## Cross-References

- [Layer 2: Backend/APIs](https://markusisaksson1982.github.io/layers/backend-apis/) — the API this containerizes
- [Layer 4: Servers](https://markusisaksson1982.github.io/layers/servers/) — server configs inside this container
- [Layer 7: CI/CD](https://markusisaksson1982.github.io/layers/ci-cd-pipelines/) — pipeline that builds this image

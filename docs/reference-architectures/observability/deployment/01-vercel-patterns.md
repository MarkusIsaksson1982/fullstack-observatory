# Vercel Deployment Patterns

This document captures the deployment and observability patterns used when running parts of the Observatory on Vercel.

## Current Public Demo

- **HPC Observatory Dashboard**: https://hpc-observatory.vercel.app/
- Runs with `NEXT_PUBLIC_DEMO_MODE=true`
- All mutating actions are no-ops
- Clearly marked with a demo banner

## Key Patterns

### Demo Mode
Use an explicit environment variable (`NEXT_PUBLIC_DEMO_MODE`) to safely expose interactive demos without risking real data or infrastructure.

### Observability Injection
Even in demo environments, we maintain consistent observability patterns (structured logging, metrics, tracing) so the same mental model applies in production.

### Environment Separation
- Preview deployments
- Production deployments
- Demo / showcase deployments

Each environment has different observability and alerting requirements.

## Lessons Learned

- Make the demo state obvious to users and agents.
- Keep the deployment configuration as close as possible to real production setups.
- Document both the "happy path" and the limitations of the demo.

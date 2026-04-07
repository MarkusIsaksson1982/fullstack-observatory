# Container Architecture: Layer 9

## Multi-Stage Builds
In the `Dockerfile`, we use a **Multi-stage build**.
1. **Base**: Installs all dependencies.
2. **Builder**: Where we would compile assets (not strictly needed for this JS demo, but standard for production).
3. **Production**: We copy only the `node_modules` and the source code into a fresh, tiny Alpine image. This keeps our attack surface small and our image size under 100MB.

## Layer Caching
By copying `package.json` and running `npm ci` *before* copying the rest of the source code, Docker caches the "dependencies layer." Unless you change your packages, Docker will skip the slow install process during every rebuild.

## Containers vs. VMs
While a Virtual Machine (VM) includes a full Guest OS, these containers share the host's kernel. This is why our Alpine-based containers start in seconds rather than minutes, fitting perfectly into the "Ephemeral Infrastructure" philosophy of the Observatory.

# fullstack-security-hardened - Layer 8

[![Part of The Full Stack Observatory](https://img.shields.io/badge/Observatory-Layer_8-7a8cff)](https://markusisaksson1982.github.io/layers/security/)

Security-hardened Express.js starter implementing the measures from the
[Layer 8 Security page](https://markusisaksson1982.github.io/layers/security/).

## What's Implemented

| Layer 8 Tool | Implementation |
|---|---|
| Header Analyzer (7 headers) | `src/middleware/helmet.js` and `src/middleware/csp.js` |
| XSS Defense Demo (escape vs raw) | `src/middleware/validateInput.js` |
| CORS Simulator (allowlist) | `src/middleware/cors.js` |

## Quick Start

```bash
git clone https://github.com/MarkusIsaksson1982/fullstack-security-hardened.git
cd fullstack-security-hardened
npm install
cp .env.example .env
npm start
```

Visit `http://localhost:3000/api/health`.

## Verify Security Headers

```bash
curl -s http://localhost:3000/api/headers | jq
curl -sI http://localhost:3000/api/health
```

## Run Security Checks

```bash
npm test
npm run lint
npm run audit:check
```

## API Routes

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Health check and active header summary |
| GET | `/api/headers` | Returns the security headers as JSON |
| POST | `/api/echo` | Validates input and escapes HTML in output |
| GET | `/api/xss-test?input=...` | Returns raw vs escaped input |

## Cross-References

- [Layer 2: Backend/APIs](https://markusisaksson1982.github.io/layers/backend-apis/)
- [Layer 4: Servers](https://markusisaksson1982.github.io/layers/servers/)
- [Layer 7: CI/CD](https://markusisaksson1982.github.io/layers/ci-cd-pipelines/)

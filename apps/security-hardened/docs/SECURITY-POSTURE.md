# Security Posture - Layer 8

[![Part of The Full Stack Observatory](https://img.shields.io/badge/Observatory-Layer_8-7a8cff)](https://markusisaksson1982.github.io/layers/security/)

This document maps each security measure in this repository to the
[OWASP Top 10 (2021)](https://owasp.org/Top10/) categories it helps mitigate.

## Measure to OWASP Mapping

| Security Measure | Implementation | OWASP Category |
|---|---|---|
| Content-Security-Policy | `src/middleware/csp.js` | **A03: Injection** - blocks inline script execution |
| Strict-Transport-Security | `src/middleware/helmet.js` | **A02: Cryptographic Failures** - forces HTTPS |
| X-Content-Type-Options | `src/middleware/helmet.js` | **A05: Security Misconfiguration** - prevents MIME sniffing |
| X-Frame-Options | `src/middleware/helmet.js` | **A04: Insecure Design** - blocks clickjacking |
| Referrer-Policy | `src/middleware/helmet.js` | **A01: Broken Access Control** - limits info leakage |
| Permissions-Policy | `src/middleware/csp.js` | **A05: Security Misconfiguration** - restricts browser APIs |
| Input validation (Zod) | `src/middleware/validateInput.js` | **A03: Injection** - rejects malformed input at the boundary |
| Output encoding (`escapeHtml`) | `src/middleware/validateInput.js` | **A03: Injection** - prevents XSS in rendered output |
| CORS allowlist | `src/middleware/cors.js` | **A01: Broken Access Control** - restricts cross-origin access |
| Rate limiting | `src/middleware/rateLimit.js` | **A04: Insecure Design** - mitigates brute-force and volumetric abuse |
| Body size limit | `src/app.js` | **A05: Security Misconfiguration** - prevents oversized payload abuse |
| Dependency audit | `.github/workflows/security.yml` | **A06: Vulnerable Components** - flags known CVEs |
| `eslint-plugin-security` | `.github/workflows/security.yml` | **A03: Injection** - catches unsafe patterns in source |
| `x-powered-by` disabled | `src/app.js` | **A05: Security Misconfiguration** - reduces passive fingerprinting |

## Defense in Depth

```text
Transport layer:   HSTS, TLS (enforced upstream)
Header layer:      CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
Application layer: CORS allowlist, rate limiting, body size limit
Input layer:       Zod schema validation
Output layer:      HTML entity encoding
Supply chain:      npm audit, eslint-plugin-security
```

## Cross-References

- [Layer 2: Backend/APIs](https://markusisaksson1982.github.io/layers/backend-apis/)
- [Layer 4: Servers](https://markusisaksson1982.github.io/layers/servers/)
- [Layer 7: CI/CD](https://markusisaksson1982.github.io/layers/ci-cd-pipelines/)

# Security Policy

## Known Unresolved Vulnerabilities

As of 2025-07-26, the following moderate vulnerabilities are present in transitive dependencies and cannot be resolved until upstream packages are updated:

---

### 1. `undici` - Use of Insufficiently Random Values
- **Advisory:** [GHSA-c76h-2ccp-4975](https://github.com/advisories/GHSA-c76h-2ccp-4975)
- **Patched in:** `>=5.28.5`
- **Current Version:** `5.28.4` (required by `@cloudflare/next-on-pages` > `vercel` > `@vercel/node`)
- **Risk:** Moderate
- **Mitigation:** Monitor for updates to `@cloudflare/next-on-pages` and `vercel` and update as soon as a patch is released.

---

### 2. `esbuild` - Dev Server Request Vulnerability
- **Advisory:** [GHSA-67mh-4wv8-2f99](https://github.com/advisories/GHSA-67mh-4wv8-2f99)
- **Patched in:** `>=0.25.0`
- **Current Version:** `0.14.47`, `0.15.18` (required by `@cloudflare/next-on-pages` and `vercel`)
- **Risk:** Moderate (primarily affects development server)
- **Mitigation:** Not exposed in production. Monitor for upstream updates.

---

We will update dependencies as soon as upstream patches are available.

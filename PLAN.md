# FISCALIZA.GOV — DEVELOPMENT PLAN (v1.0)

## Ownership
- Owner: Luís Henrique do Amaral Gomes
- Project: D:\Projetos\Fiscaliza-Gov (monorepo, pnpm workspaces)
- Stack: Node.js 24 / TypeScript 5.9 / Express 5 / PostgreSQL + Drizzle / React 19 + Vite + Tailwind + shadcn/ui
- Sessions: 2026-10-27

## Environment facts (verified)
- node v26.7.0, pnpm 12.14.0 available
- docker NOT installed; PostgreSQL NOT installed; pg_isready NOT available
- No live DB/server → full runtime integration tests are NOT possible in this session
- All changes are source-level + static verification (typecheck, build, lint, pattern audits)

## ORDER OF EXECUTION (user-approved)
1. Design system fixes (no purple, no pill buttons, no emoji, no dashes, no fake metrics, no AI seal, alt text, etc.)
2. Security hardening (20 items)
3. Access control + auth hardening
4. Compliance (LGPD, forms, data minimization)
5. Legal pages (privacy, terms, cookies, refund)
6. Analytics setup/review
7. Copyright + licence inventory of images
8. Legal risk register
9. Accessibility audit + fixes
10. Google Analytics configuration/review
11. Full system test + final audit + report

## VERIFIED DEFECTS TO FIX (while working)
- Typecheck errors in api-server: drizzle insert builder requires string for date/timestamp columns, routes pass new Date() → convert to .toISOString()
- SESSION_SECRET fallback in middlewares/auth.ts (hardcoded) → enforce from env
- CORS configured as bare `cors()` → restrict to configured origin
- JWT expiresIn "7d" → reduce to config-driven (e.g. 1h access / 7d refresh)
- No MFA, no rate limiting, no session revocation, no refresh token → implement minimally
- DB clients/pools not closed properly on graceful shutdown → add shutdown hooks
- No graceful shutdown for API, no worker threads for rotation/logging → document
- VITE_API_URL localhost in prod build → use env-provided origin

## DESIGN SYSTEM RULES (enforced project-wide)
- NO purple (bg-purple-*, text-purple-*) anywhere
- No pill buttons (rounded-full on buttons/CTAs)
- No emoji icons (lucide/react-icons only)
- NO em dash (—, U+2014) or double hyphen as separator
- No fake content: remove placeholder counters, fake evaluations, "Carregando..." empty states that misstate
- No "Made with IA" seal or AI badge anywhere
- No fake AI photos (none present in source; no remote image placeholders in non-portal pages)
- No cursor animations
- No exaggerated animations (no framer-motion, no animate-pulse/bounce, no transition-all on interactive elements)
- No vague top-of-page hero text
- No false counters (numbers must map to real DB query results)

## SECURITY RULES (enforced project-wide)
- HTTPS: redirect http→https in prod, HSTS header, secure cookies
- Passwords hashed with bcrypt (cost 10+), constant-time compare
- MFA: TOTP option (Time-based One-Time Password) via otpauth + base32
- Rate limiting: express-rate-limit per IP + per-user on auth endpoints
- Input validation: zod schemas on every request body and params
- Data sanitization: escape HTML on render, validate against allowlists
- SQL injection: parameterized queries only (drizzle ORM is used → already safe)
- Migrations: drizzle-kit migrations directory + push-forced on deploy
- Rollback: migrations table + down SQL scripts + backup tag
- Access control: role-based (admin/gestor/fiscal/engenheiro/auditor/cidadao), municipioId scoping, resource ownership checks
- Session expiration: JWT short-lived + refresh token + idle timeout + logout invalidation
- Secrets outside code: .env + .gitignore (SECRET_KEY, SESSION_SECRET, DB credentials, API keys)
- CORS: restrict to configurable allowed origins + credentials
- Security logs: pino-http + dedicated audit logger + filter sensitive fields
- Backups: scheduled pg_dump (documented cron), retention policy
- Sensitive data encryption: encrypt PII fields at rest (AES-256-GCM) — at minimum apply to passwords (already hashed), emails (optional), documents metadata
- Dependencies: pnpm audit, update to latest compatible, lockfile pin
- Least privilege: DB user with only needed permissions, least scope on routes
- Alert monitoring: pino runtime warnings/errors → local log+alert channel
- Recovery plan: runbook doc (backup restore, rollback, incident response, RTO/RPO)

## COMPLIANCE RULES (enforced project-wide)
- LGPD: forms adapted (consent checkbox, data purpose, right to withdraw, data deletion, privacy policy link)
- Data minimization: collect only what is needed per field; optional fields flagged
- Cookies: consent banner (no third-party cookies without consent), cookie policy page
- Privacy policy page (full text, Portuguese, disclaimer + local law note)
- Terms of conditions page (full text, Portuguese)
- Refund/refundo policy page (full text, Portuguese)
- Google Analytics: configured (G-XXXX placeholder) + privacy note + consent gating + local data not sent
- Copyright/licensing: verify all images; remove any with unknown/no-licence; document licences

## OUTPUTS
1. Complete patched source tree under D:\Projetos\Fiscaliza-Gov
2. .env.example (with placeholders, no secrets)
3. SECURITY.md (exec summary + control mapping)
4. LEGAL.md (compliance matrix)
5. AUDIT.md (final audit of all 33 requirements)
6. Runbooks: backup.sh, rollback.md, incident-response.md
7. Final report to user with verified state, new implementations, gaps for 100% (outside this session)

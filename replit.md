# FISCALIZA.GOV

Plataforma SaaS completa para gestão e fiscalização de obras públicas municipais brasileiras.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at /api)
- `pnpm --filter @workspace/fiscaliza-gov run dev` — run the frontend (port 18831, proxied at /)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — JWT signing secret

## Demo Credentials

- **Admin:** admin@fiscaliza.gov.br / admin123
- **Gestor:** gestor@fiscaliza.gov.br / admin123
- **Fiscal:** fiscal@fiscaliza.gov.br / admin123
- **Engenheiro:** eng@fiscaliza.gov.br / admin123

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 + JWT auth (Bearer token in localStorage)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec → React Query hooks)
- Frontend: React 18 + Vite + TailwindCSS + shadcn/ui
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for all API contracts
- `lib/db/src/schema/` — all Drizzle ORM schema files
- `lib/api-client-react/src/generated/` — auto-generated React Query hooks + Zod schemas
- `lib/api-zod/src/generated/` — auto-generated Zod validation schemas for the server
- `artifacts/api-server/src/routes/` — all Express route handlers
- `artifacts/fiscaliza-gov/src/pages/` — all frontend page components
- `artifacts/fiscaliza-gov/src/components/layout.tsx` — app sidebar/layout

## Architecture decisions

- Contract-first: OpenAPI spec drives both client (hooks) and server (Zod validation) codegen
- JWT Bearer tokens stored in localStorage; `setAuthTokenGetter()` injects them into all API calls
- Multi-tenant by `municipioId`: all queries filter by the authenticated user's municipality
- Portal de Transparência (`/portal`) is fully public — no auth required, hardcoded to municipioId=1 for demo
- Dashboard `/api/dashboard/*` endpoints compute all KPIs server-side to minimize client round-trips
- IA Assistente is rule-based (no external AI API) — queries the DB and produces contextual answers

## Product

- **Painel de Controle** — KPIs executivos: obras em execução, atrasadas, NCs abertas, obras em risco
- **Obras** — CRUD completo com avanço físico, timeline de eventos, curva-S, aditivos contratuais
- **Visitas de Fiscalização** — registro de inspeções com GPS, trabalhadores, atividades, condições
- **Não Conformidades** — registro por severidade (leve/moderada/grave/crítica) com fluxo de resolução
- **Medições** — boletins de medição com fluxo de aprovação em 4 etapas
- **Documentos** — repositório por categoria (contrato, projeto, laudo, etc.)
- **Notificações Formais** — emissão de advertências, embargos, paralisações com prazo de resposta
- **IA Assistente** — chat para consultas sobre obras, prazos, valores e riscos
- **Portal de Transparência** — portal público para cidadãos consultarem obras do município

## User preferences

- All domain language in Portuguese (obra, fiscal, medição, etc.)
- Green primary color (#16a34a) — government/institutional style
- Dark sidebar, light content area

## Gotchas

- After any schema change in `lib/db/`, run `pnpm --filter @workspace/db run push` then restart the API server
- After any OpenAPI spec change, run `pnpm --filter @workspace/api-spec run codegen` before using new hooks
- The bcrypt hash in the seed script must be generated with `node -e "const b = require('./artifacts/api-server/node_modules/bcryptjs'); b.hash('senha', 10).then(console.log)"`
- `inArray()` from drizzle-orm must be used for `WHERE id = ANY(array)` — the `sql\`\`` template with arrays does NOT work in Drizzle

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details

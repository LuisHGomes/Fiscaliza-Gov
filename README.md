# FISCALIZA.GOV

Plataforma para gestão e fiscalização de obras públicas municipais.

## Como rodar

Variáveis de ambiente necessárias:

- `DATABASE_URL` — string de conexão PostgreSQL
- `SESSION_SECRET` — segredo para assinatura JWT

Comandos principais:

```bash
pnpm install
pnpm --filter @workspace/db run push          # aplicar schema (dev)
pnpm --filter @workspace/api-server run dev # API na porta 8080
pnpm --filter @workspace/fiscaliza-gov run dev # frontend (PORT e BASE_PATH)
pnpm run typecheck
pnpm run build
pnpm --filter @workspace/api-spec run codegen # regenerar hooks a partir do OpenAPI
```

## Credenciais de demonstração

| Perfil     | E-mail                    | Senha    |
| ---------- | ------------------------- | -------- |
| Admin      | admin@fiscaliza.gov.br    | admin123 |
| Gestor     | gestor@fiscaliza.gov.br   | admin123 |
| Fiscal     | fiscal@fiscaliza.gov.br   | admin123 |
| Engenheiro | eng@fiscaliza.gov.br      | admin123 |

## Stack

- Monorepo com pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5, autenticação JWT (Bearer no localStorage)
- Banco: PostgreSQL com Drizzle ORM
- Validação: Zod
- Cliente HTTP: hooks gerados via Orval a partir do OpenAPI
- Frontend: React 19, Vite, Tailwind CSS, componentes Radix/shadcn

## Estrutura do repositório

| Caminho | Conteúdo |
| ------- | -------- |
| `lib/api-spec/openapi.yaml` | Contratos da API |
| `lib/db/src/schema/` | Schemas Drizzle |
| `lib/api-client-react/src/generated/` | Hooks React Query |
| `lib/api-zod/src/generated/` | Schemas Zod do servidor |
| `artifacts/api-server/src/routes/` | Rotas Express |
| `artifacts/fiscaliza-gov/src/pages/` | Páginas do frontend |

## Módulos

- **Painel** — indicadores de obras, atrasos, não conformidades e riscos
- **Obras** — cadastro, avanço físico, timeline, curva S, aditivos
- **Visitas** — inspeções com registro de atividades e condições
- **Não conformidades** — severidade e fluxo de resolução
- **Medições** — boletins com aprovação em etapas
- **Documentos** — repositório por categoria
- **Notificações** — advertências, embargos e paralisações
- **Assistente** — consultas contextuais sobre obras e prazos
- **Portal de transparência** — consulta pública (sem autenticação)

## Observações de desenvolvimento

- Após alterar o schema em `lib/db/`, rode `pnpm --filter @workspace/db run push` e reinicie a API.
- Após alterar o OpenAPI, rode `pnpm --filter @workspace/api-spec run codegen` antes de usar novos hooks.
- Filtros multi-tenant usam `municipioId` do usuário autenticado.
- Para arrays no Drizzle, prefira `inArray()` em vez de template SQL com arrays.

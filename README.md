# 🏛️ FISCALIZA.GOV

**Plataforma para gestão e fiscalização de obras públicas municipais**

---

## 🚀 Como Rodar

### ⚡ Opção 1: Docker Compose (Recomendado - Mais Fácil)

**Requisitos:** Docker e Docker Compose

```bash
docker-compose up
```

Pronto! Isso vai:
- ✅ Iniciar PostgreSQL automaticamente
- ✅ Buildar e rodar a API (porta **8080**)
- ✅ Buildar e rodar o frontend (porta **5173**)

Então acesse: **http://localhost:5173**

**Primeira vez:** Pode levar 2-3 minutos na primeira execução. Execuções futuras são instantâneas.

### 🔧 Opção 2: Desenvolvimento Local (Manual)

**Requisitos:**
- Node.js 24+
- pnpm 11+
- PostgreSQL 15+ (rodando localmente ou em outro servidor)

**Passos:**

```bash
# 1. Instalar dependências
pnpm install

# 2. Criar arquivo .env na raiz do projeto
cat > .env << EOF
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fiscaliza_dev
SESSION_SECRET=seu-secret-muito-seguro-aqui-mudar-em-producao
NODE_ENV=development
VITE_API_URL=http://localhost:8080
EOF

# 3. Se for primeira vez, aplicar schema do banco
pnpm --filter @workspace/db run push

# 4. Em um terminal: rodar API
pnpm --filter @workspace/api-server run dev

# 5. Em outro terminal: rodar frontend
pnpm --filter @workspace/fiscaliza-gov run dev

# 6. Opcional: validar tipos TypeScript
pnpm run typecheck
```

A aplicação estará disponível em **http://localhost:5173**

### 🔑 Credenciais de Demonstração

| Perfil     | E-mail                    | Senha    |
| ---------- | ------------------------- | -------- |
| Admin      | admin@fiscaliza.gov.br    | admin123 |
| Gestor     | gestor@fiscaliza.gov.br   | admin123 |
| Fiscal     | fiscal@fiscaliza.gov.br   | admin123 |
| Engenheiro | eng@fiscaliza.gov.br      | admin123 |

---

## 📚 Stack Tecnológico

### Backend
- **Runtime:** Node.js 24, TypeScript 5.9
- **Framework:** Express 5
- **Banco:** PostgreSQL 15+ com Drizzle ORM
- **Autenticação:** JWT (Bearer token no localStorage)
- **Validação:** Zod
- **Logging:** Pino

### Frontend
- **Framework:** React 19
- **Bundler:** Vite
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI + shadcn/ui
- **HTTP Client:** hooks gerados via Orval (React Query)
- **Monorepo:** pnpm workspaces

---

## 📂 Estrutura do Repositório

```
.
├── artifacts/                      # Aplicações
│   ├── api-server/                # API Express
│   │   └── src/routes/            # Endpoints da API
│   ├── fiscaliza-gov/             # Frontend React
│   │   └── src/pages/             # Páginas da aplicação
│   └── mockup-sandbox/            # Ambiente de testes UI
├── lib/                           # Bibliotecas compartilhadas
│   ├── api-spec/                  # Contrato OpenAPI
│   │   └── openapi.yaml           # Especificação da API
│   ├── api-client-react/          # Hooks React Query (gerados)
│   ├── api-zod/                   # Schemas Zod (gerados)
│   └── db/                        # ORM Drizzle
│       └── src/schema/            # Definição das tabelas
├── scripts/                       # Scripts auxiliares
├── docker-compose.yml             # Configuração Docker
├── pnpm-workspace.yaml            # Definição do monorepo
└── README.md                      # Este arquivo
```

---

## 🎯 Módulos do Sistema

- **Painel** — Indicadores de obras, atrasos, não conformidades e riscos
- **Obras** — Cadastro, avanço físico, timeline, curva S, aditivos
- **Visitas** — Inspeções com registro de atividades e condições de segurança
- **Não Conformidades** — Severidade, prioridade e fluxo de resolução
- **Medições** — Boletins de medição com aprovação em múltiplas etapas
- **Documentos** — Repositório de documentos por categoria
- **Notificações** — Advertências, embargos e paralisações
- **Assistente IA** — Consultas contextuais sobre obras, prazos e métricas
- **Portal de Transparência** — Consulta pública de dados (sem autenticação)

---

## 💻 Comandos Úteis

### Desenvolvimento

```bash
# Reinstalar dependências
pnpm install

# Verificação de tipos em todo o projeto
pnpm run typecheck

# Build de produção
pnpm run build

# Formatação de código
pnpm exec prettier --write .
```

### Base de Dados

```bash
# Aplicar migrações (primeira vez ou após alterar schema)
pnpm --filter @workspace/db run push

# Gerar tipos do schema
pnpm --filter @workspace/db run generate

# Acessar interface Drizzle Studio (inspecionar dados)
pnpm --filter @workspace/db run studio
```

### API

```bash
# Rodar em desenvolvimento
pnpm --filter @workspace/api-server run dev

# Build apenas
pnpm --filter @workspace/api-server run build

# Rodar em produção
pnpm --filter @workspace/api-server run start

# Typecheck apenas
pnpm --filter @workspace/api-server run typecheck
```

### Frontend

```bash
# Rodar em desenvolvimento
pnpm --filter @workspace/fiscaliza-gov run dev

# Build para produção
pnpm --filter @workspace/fiscaliza-gov run build

# Preview do build
pnpm --filter @workspace/fiscaliza-gov run preview
```

### OpenAPI / Geração de Código

```bash
# Regenerar hooks React Query e schemas Zod a partir do OpenAPI
pnpm --filter @workspace/api-spec run codegen

# Validar especificação OpenAPI
pnpm --filter @workspace/api-spec run validate
```

---

## 🐛 Troubleshooting

### Docker: "Porta 5432 já em uso"
```bash
# Mude a porta no docker-compose.yml:
# "5432:5432" → "5433:5432"
# E atualize DATABASE_URL no .env
```

### Docker: "Falha ao conectar PostgreSQL"
```bash
# Limpe e reconstrua
docker-compose down -v
docker-compose up --build
```

### "DATABASE_URL não configurada"
Certifique-se que:
1. `.env` existe na raiz do projeto
2. Contém `DATABASE_URL=postgresql://...`
3. PostgreSQL está acessível naquele endereço

### "export: command not found" (Windows)
Já foi corrigido! Execute `pnpm install` novamente para pegar a versão atualizada com `cross-env`.

### API não inicia
1. Verifique se PostgreSQL está rodando
2. Execute `pnpm --filter @workspace/db run push` para aplicar migrações
3. Verifique `DATABASE_URL` no `.env`

### Frontend não conecta na API
1. Certifique-se que a API está rodando (porta 8080)
2. Verifique `VITE_API_URL` no `.env` (deve ser `http://localhost:8080`)
3. Limpe o cache do navegador (Ctrl+Shift+Delete)

---

## 📝 Observações de Desenvolvimento

- **Após alterar schema em `lib/db/`:** Execute `pnpm --filter @workspace/db run push` e reinicie a API
- **Após alterar OpenAPI em `lib/api-spec/`:** Execute `pnpm --filter @workspace/api-spec run codegen` antes de usar novos hooks
- **Multi-tenant:** Filtros usam `municipioId` do usuário autenticado via JWT
- **Arrays no Drizzle:** Prefira `inArray()` em vez de template SQL com arrays
- **Build:** Execute `pnpm run build` para verificar erros de tipo em todo o monorepo

---

## 🔗 Endpoints Úteis

- API health: `http://localhost:8080/health`
- Frontend: `http://localhost:5173`
- Drizzle Studio: `pnpm --filter @workspace/db run studio`

---

## 📞 Suporte

Para dúvidas sobre desenvolvimento ou deploy, consulte a documentação de cada workspace individual nos respectivos `README.md`.

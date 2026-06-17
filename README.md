<div align="center">

# FISCALIZA.GOV

**Plataforma para gestão e fiscalização de obras públicas municipais**

[![Node.js](https://img.shields.io/badge/Node.js-24-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![License](https://img.shields.io/badge/license-unspecified-lightgrey)](#)

</div>

---

## Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Como Rodar](#-como-rodar)
  - [Docker Compose](#opção-1-docker-compose-recomendado)
  - [Desenvolvimento Local](#opção-2-desenvolvimento-local-manual)
  - [Credenciais de Demonstração](#-credenciais-de-demonstração)
- [Stack Tecnológico](#-stack-tecnológico)
- [Estrutura do Repositório](#-estrutura-do-repositório)
- [Módulos do Sistema](#-módulos-do-sistema)
- [Comandos Úteis](#-comandos-úteis)
- [Troubleshooting](#-troubleshooting)
- [Observações de Desenvolvimento](#-observações-de-desenvolvimento)
- [Endpoints Úteis](#-endpoints-úteis)
- [Suporte](#-suporte)

---

## Sobre o Projeto

O **Fiscaliza.gov** é uma plataforma web para acompanhamento de obras públicas municipais, permitindo que gestores, fiscais e engenheiros monitorem cronogramas, registrem visitas e não conformidades, aprovem medições e mantenham um repositório centralizado de documentos — com um portal de transparência aberto à consulta pública.

---

## Como Rodar

### Opção 1: Docker Compose (Recomendado)

> **Requisitos:** Docker e Docker Compose

```bash
docker-compose up
```

Esse comando vai automaticamente:

| Etapa | Ação |
|---|---|
| 1 | Iniciar o PostgreSQL |
| 2 | Buildar e rodar a API na porta **8080** |
| 3 | Buildar e rodar o frontend na porta **5173** |

Depois, acesse: **http://localhost:5173**

> ⏱**Primeira execução:** pode levar 2–3 minutos. Execuções seguintes são quase instantâneas.

<br>

### Opção 2: Desenvolvimento Local (Manual)

> **Requisitos:** Node.js 24+, pnpm 11+, PostgreSQL 15+ (local ou remoto)

**1. Instalar dependências**

```bash
pnpm install
```

**2. Criar o arquivo `.env`** na raiz do projeto

```bash
cat > .env << EOF
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fiscaliza_dev
SESSION_SECRET=seu-secret-muito-seguro-aqui-mudar-em-producao
NODE_ENV=development
VITE_API_URL=http://localhost:8080
EOF
```

**3. Aplicar o schema do banco** (primeira vez)

```bash
pnpm --filter @workspace/db run push
```

**4. Rodar a API** (em um terminal)

```bash
pnpm --filter @workspace/api-server run dev
```

**5. Rodar o frontend** (em outro terminal)

```bash
pnpm --filter @workspace/fiscaliza-gov run dev
```

**6. (Opcional) Validar tipos TypeScript**

```bash
pnpm run typecheck
```

A aplicação estará disponível em **http://localhost:5173**

<br>

### Credenciais de Demonstração

| Perfil | E-mail | Senha |
|---|---|---|
| **Admin** | `admin@fiscaliza.gov.br` | `admin123` |
| **Gestor** | `gestor@fiscaliza.gov.br` | `admin123` |
| **Fiscal** | `fiscal@fiscaliza.gov.br` | `admin123` |
| **Engenheiro** | `eng@fiscaliza.gov.br` | `admin123` |

---

## Stack Tecnológico

<table>
<tr>
<td valign="top" width="50%">

**Backend**
- **Runtime:** Node.js 24, TypeScript 5.9
- **Framework:** Express 5
- **Banco:** PostgreSQL 15+ com Drizzle ORM
- **Autenticação:** JWT (Bearer token no localStorage)
- **Validação:** Zod
- **Logging:** Pino

</td>
<td valign="top" width="50%">

**Frontend**
- **Framework:** React 19
- **Bundler:** Vite
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI + shadcn/ui
- **HTTP Client:** hooks gerados via Orval (React Query)
- **Monorepo:** pnpm workspaces

</td>
</tr>
</table>

---

## Estrutura do Repositório

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

## Módulos do Sistema

| Módulo | Descrição |
|---|---|
| **Painel** | Indicadores de obras, atrasos, não conformidades e riscos |
| **Obras** | Cadastro, avanço físico, timeline, curva S, aditivos |
| **Visitas** | Inspeções com registro de atividades e condições de segurança |
| **Não Conformidades** | Severidade, prioridade e fluxo de resolução |
| **Medições** | Boletins de medição com aprovação em múltiplas etapas |
| **Documentos** | Repositório de documentos por categoria |
| **Notificações** | Advertências, embargos e paralisações |
| **Assistente IA** | Consultas contextuais sobre obras, prazos e métricas |
| **Portal de Transparência** | Consulta pública de dados (sem autenticação) |

---

## Comandos Úteis

### Desenvolvimento

```bash
pnpm install                  # Reinstalar dependências
pnpm run typecheck            # Verificação de tipos em todo o projeto
pnpm run build                # Build de produção
pnpm exec prettier --write .  # Formatação de código
```

### Base de Dados

```bash
pnpm --filter @workspace/db run push       # Aplicar migrações
pnpm --filter @workspace/db run generate   # Gerar tipos do schema
pnpm --filter @workspace/db run studio     # Interface Drizzle Studio
```

### API

```bash
pnpm --filter @workspace/api-server run dev        # Desenvolvimento
pnpm --filter @workspace/api-server run build      # Build apenas
pnpm --filter @workspace/api-server run start      # Produção
pnpm --filter @workspace/api-server run typecheck  # Typecheck apenas
```

### Frontend

```bash
pnpm --filter @workspace/fiscaliza-gov run dev      # Desenvolvimento
pnpm --filter @workspace/fiscaliza-gov run build    # Build para produção
pnpm --filter @workspace/fiscaliza-gov run preview  # Preview do build
```

### OpenAPI / Geração de Código

```bash
pnpm --filter @workspace/api-spec run codegen    # Regenerar hooks e schemas
pnpm --filter @workspace/api-spec run validate   # Validar especificação OpenAPI
```

---

## Troubleshooting

<details>
<summary><strong>Docker: "Porta 5432 já em uso"</strong></summary>
<br>

Mude a porta no `docker-compose.yml`:
```yaml
# "5432:5432" → "5433:5432"
```
E atualize `DATABASE_URL` no `.env` de acordo.

</details>

<details>
<summary><strong>Docker: "Falha ao conectar PostgreSQL"</strong></summary>
<br>

```bash
docker-compose down -v
docker-compose up --build
```

</details>

<details>
<summary><strong>"DATABASE_URL não configurada"</strong></summary>
<br>

Certifique-se que:
1. `.env` existe na raiz do projeto
2. Contém `DATABASE_URL=postgresql://...`
3. PostgreSQL está acessível naquele endereço

</details>

<details>
<summary><strong>"export: command not found" (Windows)</strong></summary>
<br>

Já foi corrigido! Execute `pnpm install` novamente para pegar a versão atualizada com `cross-env`.

</details>

<details>
<summary><strong>API não inicia</strong></summary>
<br>

1. Verifique se PostgreSQL está rodando
2. Execute `pnpm --filter @workspace/db run push` para aplicar migrações
3. Verifique `DATABASE_URL` no `.env`

</details>

<details>
<summary><strong>Frontend não conecta na API</strong></summary>
<br>

1. Certifique-se que a API está rodando (porta 8080)
2. Verifique `VITE_API_URL` no `.env` (deve ser `http://localhost:8080`)
3. Limpe o cache do navegador (Ctrl+Shift+Delete)

</details>

---

## Observações de Desenvolvimento

- **Após alterar schema em `lib/db/`:** execute `pnpm --filter @workspace/db run push` e reinicie a API
- **Após alterar OpenAPI em `lib/api-spec/`:** execute `pnpm --filter @workspace/api-spec run codegen` antes de usar novos hooks
- **Multi-tenant:** filtros usam `municipioId` do usuário autenticado via JWT
- **Arrays no Drizzle:** prefira `inArray()` em vez de template SQL com arrays
- **Build:** execute `pnpm run build` para verificar erros de tipo em todo o monorepo

---

## Endpoints Úteis

| Recurso | URL / Comando |
|---|---|
| API health | `http://localhost:8080/health` |
| Frontend | `http://localhost:5173` |
| Drizzle Studio | `pnpm --filter @workspace/db run studio` |

---

## Suporte

Para dúvidas sobre desenvolvimento ou deploy, consulte a documentação de cada workspace individual nos respectivos `README.md`.

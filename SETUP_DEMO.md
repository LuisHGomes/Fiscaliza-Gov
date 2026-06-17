# 🚀 Como Rodar o Projeto (Versão Demo para Recrutadores)

## ⚡ Opção Mais Fácil: Docker Compose (Recomendado)

Se você tem **Docker** instalado, é só um comando:

```bash
docker-compose up
```

Isso vai:
1. ✅ Iniciar PostgreSQL automaticamente
2. ✅ Rodar a API na porta **8080**
3. ✅ Rodar o frontend na porta **5173**

Então acesse: **http://localhost:5173**

### Credenciais de demo:
- **Email**: admin@fiscaliza.gov.br
- **Senha**: admin123

Pronto! Nenhuma configuração manual necessária.

---

## 🐳 Alternativa: Se quiser rodar manualmente

Caso não queira usar Docker, você vai precisar de:

1. **Node.js 24+** e **pnpm 11+**
2. **PostgreSQL** rodando localmente (ou em outro servidor)

### Passos:

```bash
# 1. Instalar dependências
pnpm install

# 2. Configurar variáveis de ambiente
# Criar arquivo .env na raiz:
echo "DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fiscaliza_dev" > .env
echo "SESSION_SECRET=seu-secret-aqui" >> .env

# 3. Aplicar schema do banco
pnpm --filter @workspace/db run push

# 4. Em um terminal: rodar API
pnpm --filter @workspace/api-server run dev

# 5. Em outro terminal: rodar frontend
pnpm --filter @workspace/fiscaliza-gov run dev
```

---

## ✅ Verificação

Se tudo deu certo, você verá:
- 🟢 API respondendo em `http://localhost:8080/health`
- 🟢 Frontend acessível em `http://localhost:5173`
- 🟢 Login funcionando com as credenciais acima

---

## 🐛 Troubleshooting

### Docker não inicia PostgreSQL?
```bash
# Limpar containers e volumes antigos
docker-compose down -v
docker-compose up --build
```

### Porta 5432 ou 8080 já em uso?
Edite o `docker-compose.yml` e mude as portas (ex: `5433:5432`)

### API não conecta ao banco?
Certifique-se que PostgreSQL está rodando e `DATABASE_URL` está correto no `.env`

---

**Dúvidas?** Verifique o [README.md](README.md) principal para mais detalhes da arquitetura.

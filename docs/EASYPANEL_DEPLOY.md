# 🚀 Deploy no EasyPanel - Body Recomp Backend

Guia completo para fazer deploy da aplicação Body Recomp Backend no EasyPanel.

## 📋 Pré-requisitos

- Conta no [EasyPanel](https://easypanel.io/)
- Repositório GitHub configurado
- Acesso ao painel do EasyPanel

## 🎯 Passos para Deploy

### 1. Criar Novo Projeto

1. Acesse seu painel do EasyPanel
2. Clique em **"New Project"**
3. Nome do projeto: `body-recomp-backend`
4. Clique em **"Create Project"**

### 2. Importar do GitHub

1. No projeto criado, clique em **"Create Service"**
2. Selecione **"From GitHub"**
3. Conecte sua conta GitHub (se ainda não conectou)
4. Selecione o repositório: `souza-vinicius/body-recomp-backend`
5. Branch: `main`

### 3. Configurar Banco de Dados PostgreSQL

1. No mesmo projeto, clique em **"Create Service"** novamente
2. Selecione **"Database"** → **"PostgreSQL"**
3. Configure:
   - **Nome**: `db`
   - **Versão**: `15-alpine`
   - **Password**: Gere uma senha forte ou use a sugerida
   - **Database Name**: `body_recomp_db`
   - **Username**: `body_recomp_user`

4. **Recursos**:
   - Memory Limit: `1GB`
   - CPU Limit: `0.5`
   - Memory Reservation: `512MB`
   - CPU Reservation: `0.25`

5. Clique em **"Create"**

### 4. Configurar Variáveis de Ambiente da API

Volte para o serviço da API e configure as seguintes variáveis:

#### Variáveis Obrigatórias:

```env
DATABASE_URL=postgresql+asyncpg://body_recomp_user:SUA_SENHA_AQUI@body-recomp-backend_db:5432/body_recomp_db
SECRET_KEY=seu_secret_key_super_secreto_aqui_com_no_minimo_32_caracteres
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
DEBUG=false
ALLOWED_ORIGINS=https://seu-dominio.easypanel.host
```

**Nota**: `ALLOWED_ORIGINS` aceita três formatos:
- String única: `ALLOWED_ORIGINS=https://seu-dominio.easypanel.host`
- Múltiplas (vírgula): `ALLOWED_ORIGINS=https://app.com,https://www.app.com`
- JSON array: `ALLOWED_ORIGINS=["https://app.com","https://www.app.com"]`

#### Como gerar SECRET_KEY:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 5. Configurar Build e Deploy

No serviço da API, configure:

**Build**:
- Build Type: `Dockerfile`
- Dockerfile Path: `Dockerfile`

**Deploy**:
- Command: `/app/scripts/init.sh`
- Replicas: `1`
- Zero Downtime: `✅ Habilitado`

**Portas**:
- Container Port: `8000`
- Published Port: `8000`
- Protocol: `TCP`

**Health Check**:
```json
{
  "test": ["CMD", "curl", "-f", "http://localhost:8000/health"],
  "interval": 30,
  "timeout": 10,
  "retries": 3,
  "startPeriod": 40
}
```

**Recursos**:
- Memory Limit: `512MB`
- CPU Limit: `0.5`
- Memory Reservation: `256MB`
- CPU Reservation: `0.25`

### 6. Configurar Domínio

1. Na aba **"Domains"** do serviço da API
2. Clique em **"Add Domain"**
3. Escolha um subdomínio: `body-recomp-api.easypanel.host`
4. Habilite **HTTPS** (SSL automático)
5. Clique em **"Add"**

### 7. Deploy

1. Clique em **"Deploy"** no serviço da API
2. Aguarde o build do Docker
3. Acompanhe os logs em tempo real
4. Quando aparecer "✅ Migrações concluídas!" e "🎯 Iniciando API...", está pronto!

## 🔍 Verificação

### Testar Health Check

```bash
curl https://seu-dominio.easypanel.host/health
```

Resposta esperada:
```json
{
  "status": "healthy"
}
```

### Testar API

```bash
curl https://seu-dominio.easypanel.host/docs
```

Deve abrir a documentação interativa do Swagger UI.

## 📊 Monitoramento

### Logs da Aplicação

1. Acesse o serviço da API no EasyPanel
2. Clique na aba **"Logs"**
3. Visualize logs em tempo real

### Logs do Banco de Dados

1. Acesse o serviço do PostgreSQL
2. Clique na aba **"Logs"**
3. Monitore queries e conexões

### Métricas

O EasyPanel fornece automaticamente:
- **CPU Usage**: Uso de processamento
- **Memory Usage**: Uso de memória
- **Network I/O**: Tráfego de rede
- **Request Rate**: Taxa de requisições

## 🔧 Manutenção

### Atualizar Aplicação

1. Faça push das alterações para o branch `main` no GitHub
2. No EasyPanel, clique em **"Redeploy"**
3. Aguarde o novo build e deploy

### Rollback

1. Na aba **"Deployments"**
2. Selecione uma versão anterior
3. Clique em **"Rollback to this version"**

### Executar Migrações Manualmente

```bash
# No console do EasyPanel (serviço da API)
cd /app/src
alembic upgrade head
```

### Backup do Banco de Dados

```bash
# No console do PostgreSQL
pg_dump -U body_recomp_user body_recomp_db > backup.sql
```

## 🐛 Troubleshooting

### Erro: "Connection refused" ao conectar no banco

**Causa**: API tentando conectar antes do PostgreSQL estar pronto

**Solução**: O script `init.sh` já tem retry logic. Verifique se o nome do serviço do banco está correto: `body-recomp-backend_db`

### Erro: "Alembic migration failed"

**Causa**: Schema do banco incompatível

**Solução**:
```bash
# 1. Acesse o console do PostgreSQL
psql -U body_recomp_user -d body_recomp_db

# 2. Verifique versão do Alembic
SELECT * FROM alembic_version;

# 3. Se necessário, faça downgrade/upgrade
cd /app/src
alembic downgrade -1
alembic upgrade head
```

### Erro: "SECRET_KEY is required"

**Causa**: Variável de ambiente não configurada

**Solução**: Adicione `SECRET_KEY` nas variáveis de ambiente do serviço

### Health Check Failing

**Causa**: Aplicação não está respondendo na porta 8000

**Solução**:
1. Verifique logs da aplicação
2. Confirme que o uvicorn está rodando: `ps aux | grep uvicorn`
3. Teste localmente: `curl http://localhost:8000/health`

### Alto Uso de Memória

**Causa**: Muitas conexões abertas ou cache grande

**Solução**:
1. Ajuste `resources.limits.memory` para `1GB`
2. Configure connection pooling no SQLAlchemy
3. Monitore queries lentas

## 🔐 Segurança

### Checklist de Segurança

- [ ] `DEBUG=false` em produção
- [ ] `SECRET_KEY` forte e único
- [ ] Senha do PostgreSQL complexa
- [ ] HTTPS habilitado
- [ ] `ALLOWED_ORIGINS` configurado corretamente
- [ ] Variáveis sensíveis não commitadas no Git
- [ ] Backup regular do banco de dados
- [ ] Logs sendo monitorados

### CORS

O `ALLOWED_ORIGINS` deve incluir apenas domínios confiáveis:

```env
ALLOWED_ORIGINS=https://app.seusite.com,https://www.seusite.com
```

## 📦 Importação Automática (easypanel.json)

Você pode importar toda a configuração automaticamente:

1. No EasyPanel, clique em **"Import from JSON"**
2. Cole o conteúdo do arquivo `easypanel.json`
3. Ajuste as variáveis de ambiente
4. Clique em **"Import"**

**Nota**: Você ainda precisará configurar manualmente:
- `SECRET_KEY`
- Senha do PostgreSQL
- Domínio customizado

## 📚 Recursos Adicionais

- [Documentação EasyPanel](https://easypanel.io/docs)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [PostgreSQL Best Practices](https://www.postgresql.org/docs/15/index.html)
- [Docker Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)

## 🆘 Suporte

Se encontrar problemas:

1. **Verifique os logs** primeiro
2. **Consulte este guia** de troubleshooting
3. **Abra uma issue** no GitHub com:
   - Descrição do problema
   - Logs relevantes
   - Passos para reproduzir

---

✅ **Deploy concluído com sucesso!** Sua API está rodando em produção no EasyPanel.

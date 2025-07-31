# 🐳 Setup do Banco com Docker

Este guia explica como configurar o PostgreSQL usando Docker e como cadastrar novos alunos.

## 📋 Pré-requisitos

- Docker e Docker Compose instalados
- Node.js (para executar o script de cadastro)

## 🚀 Iniciando o Banco de Dados

### 1. Subir o PostgreSQL
```bash
# Iniciar o banco em background
docker-compose up -d

# Verificar se está rodando
docker-compose ps
```

### 2. Verificar logs (opcional)
```bash
# Ver logs do banco
docker-compose logs postgres

# Seguir logs em tempo real
docker-compose logs -f postgres
```

### 3. Conectar ao banco (opcional)
```bash
# Conectar via psql
docker-compose exec postgres psql -U postgres -d portal_escolar

# Ou usando cliente externo
psql -h localhost -p 5432 -U postgres -d portal_escolar
```

## 👤 Cadastrando Novos Alunos

### 1. Instalar dependências do script
```bash
cd scripts
npm install
```

### 2. Executar o script de cadastro
```bash
# Opção 1: Usando npm
npm run cadastrar

# Opção 2: Diretamente com node
node cadastrar-aluno.js

# Opção 3: Com variáveis de ambiente personalizadas
DB_HOST=localhost DB_PORT=5432 node cadastrar-aluno.js
```

### 3. Exemplo de uso do script
```
🎓 === CADASTRO DE NOVO ALUNO ===

📡 Conectando ao banco de dados...
✅ Conectado com sucesso!

📝 Digite a matrícula do aluno (7 dígitos): 2024010
👤 Digite o nome completo do aluno: Ana Silva Costa
📧 Digite o email do aluno: ana.silva@email.com
🔒 Digite a senha do aluno (mínimo 6 caracteres): ana123
🔒 Confirme a senha: ana123

📋 === DADOS DO ALUNO ===
Matrícula: 2024010
Nome: Ana Silva Costa
Email: ana.silva@email.com
Senha: ******

✅ Confirma o cadastro? (s/n): s

🔐 Criptografando senha...
💾 Salvando no banco de dados...

🎉 === ALUNO CADASTRADO COM SUCESSO! ===
ID: 4
Matrícula: 2024010
Nome: Ana Silva Costa
Email: ana.silva@email.com
Cadastrado em: 27/07/2025 14:30:15

✅ O aluno já pode fazer login no sistema!
```

## 🔧 Comandos Úteis do Docker

### Gerenciamento do Container
```bash
# Parar o banco
docker-compose down

# Parar e remover volumes (CUIDADO: apaga dados!)
docker-compose down -v

# Reiniciar o banco
docker-compose restart

# Ver status
docker-compose ps

# Ver logs
docker-compose logs postgres
```

### Backup e Restore
```bash
# Fazer backup
docker-compose exec postgres pg_dump -U postgres portal_escolar > backup.sql

# Restaurar backup
docker-compose exec -T postgres psql -U postgres portal_escolar < backup.sql
```

## 🛡️ Validações do Script

O script de cadastro inclui as seguintes validações:

### ✅ Matrícula
- Deve ter exatamente 7 dígitos
- Deve ser única no sistema
- Exemplo válido: `2024001`

### ✅ Nome
- Mínimo de 2 caracteres
- Aceita espaços e acentos
- Exemplo: `João da Silva`

### ✅ Email
- Formato válido de email
- Deve ser único no sistema
- Exemplo: `joao@email.com`

### ✅ Senha
- Mínimo de 6 caracteres
- Confirmação obrigatória
- Criptografada com bcrypt (salt rounds: 10)

## 🔐 Variáveis de Ambiente

O script aceita as seguintes variáveis de ambiente:

```bash
DB_HOST=localhost      # Host do banco (padrão: localhost)
DB_PORT=5432          # Porta do banco (padrão: 5432)
DB_NAME=portal_escolar # Nome do banco (padrão: portal_escolar)
DB_USER=postgres      # Usuário do banco (padrão: postgres)
DB_PASSWORD=postgres  # Senha do banco (padrão: postgres)
```

## 🚨 Troubleshooting

### Erro de conexão
```
❌ Erro ao cadastrar aluno: connect ECONNREFUSED 127.0.0.1:5432
💡 Dica: Verifique se o PostgreSQL está rodando.
Para iniciar com Docker: docker-compose up -d
```

**Solução**: Execute `docker-compose up -d` para iniciar o banco.

### Matrícula duplicada
```
❌ Esta matrícula já está cadastrada!
```

**Solução**: Use uma matrícula diferente.

### Email duplicado
```
❌ Este email já está cadastrado!
```

**Solução**: Use um email diferente.

## 📊 Dados de Teste Inclusos

O banco vem com os seguintes usuários pré-cadastrados:

### Administrador
- **Matrícula**: ADMIN001
- **Senha**: admin123
- **Email**: admin@escola.com

### Alunos de Teste
- **Matrícula**: 2024001 | **Senha**: 123456 | **Nome**: João Silva
- **Matrícula**: 2024002 | **Senha**: 123456 | **Nome**: Maria Santos  
- **Matrícula**: 2024003 | **Senha**: 123456 | **Nome**: Pedro Oliveira

Todos os alunos de teste já possuem notas cadastradas para demonstração.
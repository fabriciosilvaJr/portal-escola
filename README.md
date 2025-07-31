# Portal Escolar

Sistema de portal escolar para visualização de notas desenvolvido com NodeJS, PostgreSQL e Angular.

## 🚀 Funcionalidades

### Para Administradores:
- ✅ Upload de notas via CSV
- ✅ Visualização de todas as notas dos alunos
- ✅ Atualização automática de notas (INSERT/UPDATE baseado em matrícula + ano)

### Para Alunos/Pais:
- ✅ Visualização das notas do aluno
- ✅ Gráfico de barras por disciplina
- ✅ Card com melhor nota (verde)
- ✅ Card com pior nota (vermelho)
- ✅ Tabela detalhada com status (Aprovado/Recuperação/Reprovado)

## 🛠️ Tecnologias

- **Backend**: Node.js, TypeScript, Express, PostgreSQL
- **Frontend**: Angular 17, TailwindCSS
- **Banco**: PostgreSQL
- **Autenticação**: JWT

## 📋 Pré-requisitos

- Node.js (versão 18 ou superior)
- PostgreSQL (versão 12 ou superior)
- npm ou yarn

## 🚀 Instalação

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd portal-escolar
```

### 2. Instale as dependências
```bash
npm run install-all
```

### 3. Configure o banco de dados
```bash
# Execute o script SQL no PostgreSQL
psql -U postgres -f database/init.sql
```

### 4. Configure as variáveis de ambiente
Copie o arquivo `.env` no backend e ajuste as configurações:
```bash
cp backend/.env.example backend/.env
```

### 5. Execute o projeto
```bash
npm run dev
```

O backend estará rodando em `http://localhost:3000`
O frontend estará rodando em `http://localhost:4200`

## 🔐 Usuários de Teste

### Administrador:
- **Matrícula**: ADMIN001
- **Senha**: admin123

### Alunos:
- **Matrícula**: 2024001 | **Senha**: 123456
- **Matrícula**: 2024002 | **Senha**: 123456
- **Matrícula**: 2024003 | **Senha**: 123456

## 📊 Formato do CSV

O CSV deve conter as seguintes colunas:
```
matricula,ano,portugues,matematica,historia,geografia,biologia,fisica,quimica,filosofia,sociologia,educacao_fisica,arte,ingles
```

Exemplo:
```csv
matricula,ano,portugues,matematica,historia,geografia,biologia,fisica,quimica,filosofia,sociologia,educacao_fisica,arte,ingles
2024001,2024,8.5,7.2,9.0,8.8,7.5,6.8,7.9,8.2,8.6,9.5,8.8,7.6
2024002,2024,9.2,8.5,8.7,9.1,8.9,8.2,8.8,9.0,8.4,9.8,9.3,8.9
```

## 🏗️ Estrutura do Projeto

```
portal-escolar/
├── backend/
│   ├── src/
│   │   ├── config/          # Configurações (DB)
│   │   ├── middleware/      # Middlewares (Auth)
│   │   ├── routes/          # Rotas da API
│   │   ├── types/           # Interfaces TypeScript
│   │   └── app.ts           # Aplicação principal
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/  # Componentes Angular
│   │   │   ├── services/    # Serviços
│   │   │   ├── guards/      # Guards de rota
│   │   │   └── interceptors/# Interceptors HTTP
│   │   └── styles.css       # Estilos globais
│   └── package.json
├── database/
│   └── init.sql             # Script de inicialização do BD
└── package.json             # Scripts de desenvolvimento
```

## 📝 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Verificar token

### Notas
- `POST /api/notas/upload` - Upload CSV (Admin)
- `GET /api/notas/admin/todas` - Listar todas notas (Admin)
- `GET /api/notas/minhas` - Notas do aluno logado

## 🎯 Funcionalidades Implementadas

- [x] Sistema de autenticação JWT
- [x] Upload de CSV com validação
- [x] INSERT/UPDATE automático baseado em matrícula + ano
- [x] Dashboard administrativo
- [x] Dashboard do aluno com gráficos
- [x] Cards de melhor/pior disciplina
- [x] Responsividade completa
- [x] Tratamento de erros
- [x] Guards de rota
- [x] Interceptors HTTP

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento (roda backend e frontend simultaneamente)
npm run dev

# Instalar dependências de ambos os projetos
npm run install-all

# Executar apenas o backend
npm run backend:dev

# Executar apenas o frontend
npm run frontend:dev

# Build de produção
npm run build
```

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- Desktop
- Tablet
- Mobile

## 🛡️ Segurança

- Autenticação JWT
- Senhas criptografadas com bcrypt
- Guards de rota no frontend
- Middleware de autenticação no backend
- Validação de tipos de usuário

## 📈 Melhorias Futuras

- [ ] Paginação na tabela de notas
- [ ] Filtros por ano/disciplina
- [ ] Gráficos mais avançados
- [ ] Exportação de relatórios
- [ ] Sistema de notificações
- [ ] PWA (Progressive Web App)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request
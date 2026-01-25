# Guia de Deploy de Banco de Dados PostgreSQL (Rápido, Fácil e Grátis)

Para um projeto Next.js, as melhores opções atualmente são **Neon** e **Supabase**. Ambas possuem planos gratuitos excelentes e são extremamente rápidas de configurar.

---

## 🚀 Opção 1: Neon (Recomendado para Next.js/Prisma)
O Neon é um Postgres "Serverless" que escala para zero quando não está em uso, perfeito para o plano gratuito.

### Passo a Passo:
1. **Crie uma conta**: Acesse [neon.tech](https://neon.tech) e faça login (pode usar GitHub).
2. **Crie um Projeto**: Dê um nome (ex: `acs-db`) e escolha a região mais próxima (ex: `aws-sa-east-1` para São Paulo se disponível, ou `us-east-1`).
3. **Copie a Connection String**: 
   - No Dashboard, você verá algo como: `postgresql://alex:password@ep-cool-darkness-123.us-east-1.aws.neon.tech/neondb?sslmode=require`
4. **Configure o seu Projeto**:
   - No seu arquivo `.env` (ou nas variáveis de ambiente da Vercel/Railway), cole a URL:
     ```env
     DATABASE_URL="sua_string_aqui?sslmode=require"
     ```
5. **Aplique o Schema**:
   - No seu terminal local, rode:
     ```bash
     npx prisma db push
     ```
   - (Isso cria todas as tabelas no banco remoto instantaneamente).

---

## 🟢 Opção 2: Supabase
O Supabase oferece um PostgreSQL completo com uma interface web (estilo PgAdmin) muito amigável.

### Passo a Passo:
1. **Crie uma conta**: Acesse [supabase.com](https://supabase.com).
2. **Novo Projeto**: Defina nome, senha do banco e a região (`South America (São Paulo)`).
3. **Pegue a URL de Conexão**:
   - Vá em **Project Settings** -> **Database**.
   - Procure por **Connection String** e selecione o modo **Transaction** (porta 6543) se for usar em Serverless (Vercel), ou **Session** (porta 5432).
4. **URL Format**:
   - Vai ser algo como: `postgresql://postgres:[SENHA]@db.xxxx.supabase.co:5432/postgres`
5. **Configurar e Subir**:
   - Atualize seu `.env` e rode `npx prisma db push`.

---

## 💡 Qual escolher?
- **Neon**: Mais fácil de configurar e gerenciar via CLI. Perfeito para quem quer "puro Postgres".
- **Supabase**: Melhor se você quiser uma interface web integrada para ver os dados (tipo um PgAdmin embutido no navegador).

### Importante: Backup dos Dados Locais
Se você quiser levar os dados que já migramos no seu PC para o banco remoto:
1. Configure o `DATABASE_URL` no `.env` para apontar para o banco novo.
2. Rode o seu script de migração ou API de seed (se configuramos um) contra o banco novo.
   - Ex: Rode `Invoke-WebRequest` para o endpoint `/api/migrate-products` (após subir o código para a nuvem).

> [!TIP]
> **Segurança**: Nunca suba seu arquivo `.env` para o GitHub. Use o arquivo `.gitignore` (que já deve ter o `.env` listado).

---

## 📦 Como Migrar seus Dados Local (PgAdmin) para o Neon

Existem duas formas principais: via terminal (mais rápido) ou via interface do PgAdmin.

### Opção A: Via Terminal (Recomendado)
Use as ferramentas nativas do PostgreSQL (`pg_dump` e `psql`).

1. **Exportar do local**:
   Abra o seu terminal (CMD ou PowerShell) e rode:
   ```bash
   pg_dump -U postgres -d acs --data-only --column-inserts -f backup_dados.sql
   ```
   *(Substitua `acs` pelo nome do seu banco local se for diferente)*.

2. **Importar para o Neon**:
   Use a Connection String do Neon que você colocou no `.env`:
   ```bash
   psql "postgresql://alex:password@ep-cool-darkness-123.us-east-1.aws.neon.tech/neondb" -f backup_dados.sql
   ```

### Opção B: Via PgAdmin 4 (Interface)
1. **Conectar ao Neon no PgAdmin**:
   - Botão direito em **Servers** -> **Register** -> **Server**.
   - **General**: Nome "Neon DB".
   - **Connection**:
     - Host: O host que está na sua string do Neon (ex: `ep-raspy-water...`).
     - Port: 5432.
     - Database: `neondb`.
     - Username: O usuário do Neon.
     - Password: A senha do Neon.
2. **Exportar Local**:
   - Botão direito no seu banco local -> **Backup**.
   - Em **Format**, escolha `Plain`.
   - Em **Dump options**, marque `Only Data` e `Use Column Inserts`.
   - Salve o arquivo `.sql`.
3. **Importar no Neon**:
   - Botão direito no banco do Neon (dentro do PgAdmin) -> **Query Tool**.
   - Clique no ícone de "Pasta" (Open File) e escolha o seu arquivo `.sql`.
   - Clique no ícone de "Raio" (Execute).

> [!IMPORTANT]
> Se você usou o `npx prisma db push` antes, as tabelas já existem. Por isso usamos `--data-only` no export para não tentar criar as tabelas novamente e dar erro de "Already Exists".

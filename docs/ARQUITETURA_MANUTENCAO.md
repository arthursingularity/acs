# 🏗️ Sistema de Manutenção - Documentação Técnica

## Arquitetura e Especificações

---

## 📁 Estrutura de Arquivos

```
src/app/
├── manutencao/
│   ├── page.js                    # Dashboard principal
│   ├── ordens/
│   │   └── page.js                # Gestão de OS
│   ├── painel-tv/
│   │   └── page.js                # Painel para TV
│   ├── tecnicos/
│   │   └── page.js                # Cadastro de técnicos
│   ├── bens/
│   │   └── page.js                # Cadastro de bens
│   ├── configuracoes/
│   │   └── page.js                # Configurações PCS
│   └── mobile/
│       └── page.js                # Interface mobile
│
├── api/manutencao/
│   ├── bens/
│   │   └── route.js               # API de bens
│   ├── tecnicos/
│   │   └── route.js               # API de técnicos
│   ├── ordens/
│   │   └── route.js               # API de ordens
│   ├── pausas/
│   │   └── route.js               # API de pausas
│   ├── motivos-pausa/
│   │   └── route.js               # API de motivos
│   ├── pcs/
│   │   └── route.js               # API de PCS
│   ├── materiais/
│   │   └── route.js               # API de materiais
│   └── dashboard/
│       └── route.js               # API do dashboard

prisma/
├── schema.prisma                   # Modelos do banco
└── seed-manutencao.js             # Dados iniciais

docs/
├── MANUAL_MANUTENCAO.md           # Manual do usuário
└── ARQUITETURA_MANUTENCAO.md      # Este documento
```

---

## 🗄️ Modelos do Banco de Dados

### Diagrama Entidade-Relacionamento

```
┌─────────────┐       ┌─────────────────┐       ┌─────────────┐
│    Bem      │───────│  OrdemServico   │───────│   Tecnico   │
└─────────────┘  1:N  └─────────────────┘  N:1  └─────────────┘
                              │
                              │ 1:N
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
        ┌─────────┐     ┌──────────┐    ┌──────────┐
        │ PausaOS │     │ AnexoOS  │    │MaterialOS│
        └────┬────┘     └──────────┘    └──────────┘
             │
             │ N:1
             ▼
      ┌─────────────┐
      │MotivoPausa  │
      └─────────────┘

┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  ProblemaOS  │   │   CausaOS    │   │  SolucaoOS   │
└──────────────┘   └──────────────┘   └──────────────┘
       │                  │                  │
       └──────────────────┼──────────────────┘
                          │ N:1
                          ▼
                  ┌─────────────────┐
                  │  OrdemServico   │
                  └─────────────────┘
```

### Modelo: Bem

```prisma
model Bem {
  id          String   @id @default(cuid())
  codigo      String   @unique      // Código único do bem
  descricao   String               // Nome/descrição
  centroCusto String               // Centro de custo
  estacao     String?              // Estação de trabalho
  localizacao String?              // Localização física
  qrCode      String?              // QR Code
  status      String   @default("operacional")
  
  ordensServico OrdemServico[]
}
```

### Modelo: Tecnico

```prisma
model Tecnico {
  id            String   @id @default(cuid())
  matricula     String   @unique
  nome          String
  especialidade String              // Elétrica, Mecânica, Geral
  ativo         Boolean  @default(true)
  telefone      String?
  email         String?
  
  ordensServico OrdemServico[]
  pausas        PausaOS[]
}
```

### Modelo: OrdemServico

```prisma
model OrdemServico {
  id                 String    @id @default(cuid())
  numero             Int       @unique @default(autoincrement())
  
  // Abertura
  bemId              String
  centroCusto        String
  estacao            String?
  tipoManutencao     String              // Elétrica, Mecânica, Avaliação
  prioridade         String   @default("normal")
  observacaoAbertura String?
  solicitante        String
  
  // Fluxo
  status             String   @default("aberta")
  tecnicoId          String?
  
  // Datas
  dataAbertura       DateTime  @default(now())
  dataAtribuicao     DateTime?
  dataInicio         DateTime?
  dataFim            DateTime?
  dataEncerramento   DateTime?
  
  // Execução
  problemaId         String?
  causaId            String?
  solucaoId          String?
  observacaoTecnica  String?
  horaExtra          Boolean   @default(false)
  statusFinalBem     String?
  encerradoPor       String?
  
  // Relações
  bem       Bem       @relation(...)
  tecnico   Tecnico?  @relation(...)
  problema  ProblemaOS? @relation(...)
  causa     CausaOS?    @relation(...)
  solucao   SolucaoOS?  @relation(...)
  pausas    PausaOS[]
  anexos    AnexoOS[]
  materiais MaterialOS[]
}
```

### Modelo: PausaOS

```prisma
model PausaOS {
  id              String   @id @default(cuid())
  ordemServicoId  String
  tecnicoId       String
  motivoPausaId   String
  observacao      String?
  dataInicio      DateTime @default(now())
  dataFim         DateTime?
  
  ordemServico    OrdemServico  @relation(...)
  tecnico         Tecnico       @relation(...)
  motivoPausa     MotivoPausa   @relation(...)
}
```

---

## 🔌 APIs RESTful

### Bens (`/api/manutencao/bens`)

| Método | Parâmetros | Descrição |
|--------|------------|-----------|
| GET | `?codigo=`, `?qrCode=`, `?centroCusto=`, `?search=` | Listar/buscar bens |
| POST | `{codigo, descricao, centroCusto, ...}` | Criar bem |
| PUT | `{id, ...campos}` | Atualizar bem |
| DELETE | `?id=` | Remover bem |

### Técnicos (`/api/manutencao/tecnicos`)

| Método | Parâmetros | Descrição |
|--------|------------|-----------|
| GET | `?ativo=`, `?especialidade=` | Listar técnicos |
| POST | `{matricula, nome, especialidade, ...}` | Criar técnico |
| PUT | `{id, ...campos}` | Atualizar técnico |
| DELETE | `?id=` | Desativar técnico |

### Ordens (`/api/manutencao/ordens`)

| Método | Parâmetros | Descrição |
|--------|------------|-----------|
| GET | `?status=`, `?tecnicoId=`, `?bemId=`, `?numero=` | Listar ordens |
| POST | `{bemId, centroCusto, tipoManutencao, solicitante, ...}` | Criar ordem |
| PUT | `{id, acao, ...}` | Atualizar ordem |
| DELETE | `?id=` | Cancelar ordem |

**Ações disponíveis (PUT)**:
- `atribuir` - Atribui técnico
- `iniciar` - Inicia execução
- `pausar` - Pausa execução
- `retomar` - Retoma execução
- `finalizar` - Finaliza tecnicamente
- `encerrar` - Encerra oficialmente

### Dashboard (`/api/manutencao/dashboard`)

| Método | Parâmetros | Descrição |
|--------|------------|-----------|
| GET | `?centroCusto=` | Dados em tempo real |

**Retorno**:
```json
{
  "resumo": {
    "abertas": 5,
    "emFila": 3,
    "emExecucao": 2,
    "pausadas": 1,
    "concluidasTecnica": 4,
    "encerradasHoje": 10
  },
  "tecnicos": [...],
  "ordensEmExecucao": [...],
  "ordensEmFila": [...],
  "ordensPausadas": [...],
  "timestamp": "2026-02-07T18:00:00Z"
}
```

---

## 🔄 Fluxo de Estados

### Ciclo de Vida da OS

```
┌─────────┐
│ ABERTA  │ ← Solicitante cria
└────┬────┘
     │ Supervisor atribui
     ▼
┌─────────┐
│ EM_FILA │ ← Aguardando técnico
└────┬────┘
     │ Técnico inicia
     ▼
┌───────────────┐
│  EM_EXECUCAO  │ ← Trabalhando
└───────┬───────┘
        │
   ┌────┴────┐
   │         │
   ▼         ▼
┌────────┐  Técnico finaliza
│PAUSADA │      │
└───┬────┘      │
    │           │
    └─────┬─────┘
          │
          ▼
┌──────────────────┐
│ CONCLUIDA_TECNICA│ ← PCS preenchido
└────────┬─────────┘
         │ Encerramento automático
         ▼
┌────────────┐
│ ENCERRADA  │ ← Finalizado
└────────────┘
```

### Transições de Status

| De | Para | Ação | Quem |
|----|------|------|------|
| - | aberta | Criação | Solicitante |
| aberta | em_fila | Atribuição | Supervisor |
| em_fila | em_execucao | Iniciar | Técnico |
| em_execucao | pausada | Pausar | Técnico |
| pausada | em_execucao | Retomar | Técnico |
| em_execucao | concluida_tecnica | Finalizar | Técnico |
| concluida_tecnica | encerrada | Encerrar | Sistema |

---

## 📱 Interface Mobile

### Fluxo de Telas

```
┌─────────────────┐
│ Seleção Técnico │
│                 │
│  [ João ]       │
│  [ Carlos ]     │
│  [ Pedro ]      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Lista de OS    │
│                 │
│ #001 - Prensa   │
│ [Iniciar]       │
│                 │
│ #002 - Torno    │
│ [Iniciar]       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Execução     │
│                 │
│   OS #001       │
│   ⏱️ 01:23:45   │
│                 │
│ [Pausar]        │
│ [Finalizar]     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Finalização   │
│                 │
│ Problema: [▼]   │
│ Causa:    [▼]   │
│ Solução:  [▼]   │
│ Observação:     │
│ [___________]   │
│                 │
│ [Confirmar]     │
└─────────────────┘
```

---

## 🎨 Design System

### Cores de Status

```css
/* Status das OS */
--status-aberta: #EAB308;      /* Amarelo */
--status-fila: #3B82F6;        /* Azul */
--status-execucao: #22C55E;    /* Verde */
--status-pausada: #F97316;     /* Laranja */
--status-concluida: #A855F7;   /* Roxo */
--status-encerrada: #6B7280;   /* Cinza */

/* Prioridades */
--prioridade-urgente: #EF4444; /* Vermelho */
--prioridade-alta: #F97316;    /* Laranja */
--prioridade-normal: #3B82F6;  /* Azul */
--prioridade-baixa: #9CA3AF;   /* Cinza */
```

### Componentes Utilizados

- `ModalWrapper` - Modal padrão com header
- `Button` - Botões com variantes
- `Input` - Campos de entrada
- Cards responsivos
- Tabelas com hover
- Badges de status

---

## 🚀 Comandos Úteis

### Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Sincronizar banco de dados
npx prisma db push

# Popular dados iniciais
node prisma/seed-manutencao.js

# Gerar Prisma Client
npx prisma generate

# Visualizar banco no Prisma Studio
npx prisma studio
```

### Produção

```bash
# Build da aplicação
npm run build

# Iniciar em produção
npm start
```

---

## 🔒 Segurança

### Validações Implementadas

- Campos obrigatórios na criação de OS
- Verificação de duplicidade (código de bem, matrícula)
- Soft delete para técnicos (desativação)
- Transações em operações críticas (pausas)

### Melhorias Recomendadas

- [ ] Autenticação por técnico (login)
- [ ] Logs de auditoria
- [ ] Permissões por perfil
- [ ] Timeout de sessão
- [ ] Rate limiting nas APIs

---

## 📊 Indicadores Disponíveis

### Por Período
- Total de OS abertas
- Total de OS encerradas
- Tempo médio de execução
- Tempo médio em pausa

### Por Técnico
- OS executadas
- Horas trabalhadas
- Taxa de retrabalho

### Por Bem
- Frequência de manutenções
- Principais problemas
- Tempo médio entre falhas (MTBF)

### Por Centro de Custo
- Volume de chamados
- Custo estimado
- Ranking de equipamentos

---

## 🔄 Integrações Futuras

### Protheus
- Sincronização de bens do cadastro de ativos
- Baixa automática de materiais
- Encerramento nativo da OS

### Notificações
- WhatsApp/Telegram para técnicos
- E-mail para gestores
- Push notifications mobile

### IoT
- Leitura automática de QR Code
- Sensores de máquina
- Alertas preventivos

---

*Versão: 1.0*
*Atualizado em: Fevereiro/2026*

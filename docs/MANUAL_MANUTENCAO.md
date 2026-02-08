# 🔧 Sistema de Manutenção Industrial

## Manual do Usuário - Guia Completo

---

## 📋 Índice

1. [Visão Geral](#1-visão-geral)
2. [Acesso ao Sistema](#2-acesso-ao-sistema)
3. [Perfis de Usuário](#3-perfis-de-usuário)
4. [Fluxo de Trabalho](#4-fluxo-de-trabalho)
5. [Módulos do Sistema](#5-módulos-do-sistema)
6. [Guia por Perfil](#6-guia-por-perfil)
7. [Perguntas Frequentes](#7-perguntas-frequentes)

---

## 1. Visão Geral

O Sistema de Manutenção Industrial foi desenvolvido para unificar todo o fluxo de manutenção da empresa, desde a solicitação até o encerramento, eliminando controles paralelos em papel e proporcionando rastreabilidade completa.

### Principais Benefícios

- ✅ **Unificação**: Todo o fluxo em um único sistema
- ✅ **Mobilidade**: Acesso via desktop, tablet e celular
- ✅ **Rastreabilidade**: Histórico completo por bem, OS e técnico
- ✅ **Padronização**: Registro técnico com Problema/Causa/Solução
- ✅ **Visibilidade**: Painel TV para gestão em tempo real
- ✅ **Automação**: Encerramento automático integrado

---

## 2. Acesso ao Sistema

### URLs de Acesso

| Módulo | URL | Dispositivo |
|--------|-----|-------------|
| Dashboard Principal | `/manutencao` | Desktop/Tablet |
| Ordens de Serviço | `/manutencao/ordens` | Desktop/Tablet |
| Painel TV | `/manutencao/painel-tv` | TV/Monitor |
| Interface Mobile | `/manutencao/mobile` | Celular |
| Cadastros | `/manutencao/tecnicos`, `/manutencao/bens` | Desktop |
| Configurações | `/manutencao/configuracoes` | Desktop |

---

## 3. Perfis de Usuário

### 3.1 Solicitante (Supervisor de Área/Produção)
- Abre novas ordens de serviço
- Acompanha status das solicitações
- Acessa via desktop, tablet ou celular

### 3.2 Supervisor/PCM (Manutenção)
- Valida e prioriza solicitações
- Atribui técnicos às OS
- Gerencia fila de trabalho
- Encerra ordens de serviço

### 3.3 Técnico de Manutenção
- Recebe OS atribuídas
- Executa manutenção
- Registra Problema/Causa/Solução
- Finaliza OS pelo celular

### 3.4 PPCP
- Participa da governança de prioridade
- Visualiza impacto na produção
- Acompanha janelas de parada

### 3.5 Gestores
- Visualiza Painel TV
- Acompanha indicadores
- Analisa relatórios

---

## 4. Fluxo de Trabalho

### Diagrama do Fluxo

```
┌─────────────────┐
│   SOLICITANTE   │
│  Abre a OS no   │
│     sistema     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  SUPERVISOR/PCM │
│ Valida e atribui│
│    prioridade   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    FILA DE OS   │
│  Aguardando     │
│    execução     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     TÉCNICO     │
│ Inicia execução │
│   (celular)     │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌───────┐ ┌───────┐
│ PAUSA │ │EXECUTA│
│       │ │       │
└───┬───┘ └───┬───┘
    │         │
    └────┬────┘
         ▼
┌─────────────────┐
│     TÉCNICO     │
│   Finaliza OS   │
│  (PCS + Obs)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  ENCERRAMENTO   │
│   AUTOMÁTICO    │
│   (Protheus)    │
└─────────────────┘
```

### Status da Ordem de Serviço

| Status | Cor | Descrição |
|--------|-----|-----------|
| `aberta` | 🟡 Amarelo | Aguardando triagem |
| `em_fila` | 🔵 Azul | Atribuída, aguardando técnico |
| `em_execucao` | 🟢 Verde | Técnico trabalhando |
| `pausada` | 🟠 Laranja | Parada com motivo |
| `concluida_tecnica` | 🟣 Roxo | Finalizada pelo técnico |
| `encerrada` | ⚫ Cinza | Encerrada no sistema |

---

## 5. Módulos do Sistema

### 5.1 Dashboard Principal (`/manutencao`)

**Propósito**: Visão geral do status da manutenção

**Informações exibidas**:
- Cards com contadores (Abertas, Em Fila, Em Execução, etc.)
- Acesso rápido às principais funções
- Status dos técnicos em tempo real

**Como usar**:
1. Acesse a página inicial da manutenção
2. Visualize os contadores de status
3. Clique nos cards de acesso rápido para navegar

---

### 5.2 Ordens de Serviço (`/manutencao/ordens`)

**Propósito**: Gestão completa das ordens de serviço

#### Criar Nova OS

1. Clique no botão **"+ Nova OS"**
2. Preencha os campos obrigatórios:
   - **Bem/Máquina**: Pesquise por código ou descrição
   - **Centro de Custo**: Preenchido automaticamente ao selecionar o bem
   - **Tipo de Manutenção**: Elétrica, Mecânica ou Avaliação
   - **Prioridade**: Baixa, Normal, Alta ou Urgente
   - **Solicitante**: Seu nome
   - **Observação**: Descrição do problema
3. Clique em **"Criar OS"**

#### Filtrar Ordens

1. Use o seletor de filtro na barra de ferramentas
2. Escolha o status desejado:
   - Todas
   - Abertas
   - Na Fila
   - Em Execução
   - Pausadas
   - Concluídas
   - Encerradas

#### Atribuir Técnico

1. Localize a OS com status "Aberta"
2. Clique em **"Atribuir"**
3. Selecione o técnico disponível
4. A OS passa para status "Em Fila"

#### Encerrar OS

1. Localize a OS com status "Concluída"
2. Clique em **"Encerrar"**
3. A OS é encerrada automaticamente

---

### 5.3 Painel TV (`/manutencao/painel-tv`)

**Propósito**: Visualização em tempo real para gestão operacional

**Seções do Painel**:

| Seção | Informação |
|-------|------------|
| **Header** | Relógio, data e botões de controle |
| **Cards de Status** | Contadores de cada status |
| **Status dos Técnicos** | Lista de técnicos com status atual |
| **Fila de OS** | Ordens aguardando execução |
| **Em Execução** | Ordens em andamento |
| **Pausadas** | Ordens com pausa ativa |

**Recursos**:
- Atualização automática a cada 5 segundos
- Modo tela cheia para TV
- Cores indicativas de prioridade e status

---

### 5.4 Interface Mobile (`/manutencao/mobile`)

**Propósito**: Execução de OS pelos técnicos via celular

#### Passo 1: Selecionar Perfil

1. Ao acessar, selecione seu nome na lista de técnicos
2. O sistema lembra sua seleção para próximos acessos

#### Passo 2: Visualizar Fila

1. Veja suas OS atribuídas
2. Cada card mostra:
   - Número da OS
   - Prioridade (cor)
   - Bem/Máquina
   - Centro de Custo
   - Status atual

#### Passo 3: Iniciar Execução

1. Localize a OS desejada
2. Toque em **"▶️ Iniciar"**
3. O cronômetro começa a contar
4. A OS passa para status "Em Execução"

#### Passo 4: Pausar (quando necessário)

1. Durante a execução, toque em **"⏸️ Pausar"**
2. Selecione o motivo:
   - Aguardando Peça
   - Aguardando Janela de Parada
   - Aguardando Terceiro
   - Questão de Segurança
   - Aguardando Ferramenta
   - Intervalo/Refeição
   - Outro
3. A OS passa para status "Pausada"

#### Passo 5: Retomar Execução

1. Na tela de OS pausada, toque em **"▶️ Retomar Execução"**
2. A pausa é finalizada
3. A OS volta para status "Em Execução"

#### Passo 6: Finalizar OS

1. Toque em **"✅ Finalizar"**
2. Preencha os campos obrigatórios:
   - **Problema**: Selecione da lista
   - **Causa**: Selecione da lista
   - **Solução**: Selecione da lista
   - **Observação**: Detalhes adicionais (opcional)
   - **Hora Extra**: Sim/Não
   - **Status Final do Bem**: Operacional ou Com Restrição
3. Toque em **"Confirmar Finalização"**
4. A OS é encerrada automaticamente

---

### 5.5 Cadastro de Técnicos (`/manutencao/tecnicos`)

**Propósito**: Gerenciar técnicos de manutenção

#### Cadastrar Novo Técnico

1. Clique em **"+ Novo Técnico"**
2. Preencha:
   - **Matrícula**: Número único
   - **Nome Completo**: Nome do técnico
   - **Especialidade**: Geral, Elétrica ou Mecânica
   - **Telefone**: Contato (opcional)
   - **E-mail**: E-mail corporativo (opcional)
3. Clique em **"Cadastrar"**

#### Editar Técnico

1. Localize o card do técnico
2. Clique em **"Editar"**
3. Atualize os campos desejados
4. Clique em **"Salvar"**

#### Desativar/Reativar

1. Para desativar: Clique em **"Desativar"**
2. Para reativar: Clique em **"Reativar"**

---

### 5.6 Cadastro de Bens (`/manutencao/bens`)

**Propósito**: Gerenciar máquinas e equipamentos

#### Cadastrar Novo Bem

1. Clique em **"+ Novo Bem"**
2. Preencha:
   - **Código**: Identificador único (usado no QR Code)
   - **QR Code**: Código alternativo (opcional)
   - **Descrição**: Nome do equipamento
   - **Centro de Custo**: Setor responsável
   - **Estação de Trabalho**: Localização na linha
   - **Localização**: Descrição física
   - **Status**: Operacional, Em Manutenção ou Inativo
3. Clique em **"Cadastrar"**

#### Ver Histórico

1. Localize o bem na lista
2. Clique em **"Histórico"**
3. Visualize todas as OS relacionadas ao bem

---

### 5.7 Configurações (`/manutencao/configuracoes`)

**Propósito**: Configurar listas padronizadas

#### Aba: Motivos de Pausa

1. Clique em **"+ Adicionar"**
2. Informe código e descrição
3. Clique em **"Cadastrar"**

**Sugestões pré-definidas**:
- Aguardando Peça
- Aguardando Janela
- Aguardando Terceiro
- Segurança
- Ferramenta
- Outro

#### Aba: Problema / Causa / Solução

Gerencie as três listas padronizadas:

| Lista | Exemplo |
|-------|---------|
| **Problemas** | Falha Elétrica, Falha Mecânica, Vazamento |
| **Causas** | Desgaste, Falta de Lubrificação, Sobrecarga |
| **Soluções** | Substituição de Peça, Ajuste, Limpeza |

---

## 6. Guia por Perfil

### 6.1 Guia do Solicitante

**Objetivo**: Abrir solicitações de manutenção

1. Acesse `/manutencao/ordens`
2. Clique em **"+ Nova OS"**
3. Selecione o bem com problema
4. Escolha o tipo de manutenção
5. Defina a prioridade
6. Descreva o problema
7. Confirme a criação

**Dica**: Se não souber o tipo (Elétrica/Mecânica), escolha "Avaliação"

---

### 6.2 Guia do Supervisor/PCM

**Objetivo**: Gerenciar fila e atribuições

**Rotina Diária**:

1. Acesse o Dashboard (`/manutencao`)
2. Verifique OS abertas (sem atribuição)
3. Para cada OS:
   - Avalie a prioridade
   - Atribua o técnico adequado
4. Monitore o Painel TV (`/manutencao/painel-tv`)
5. Encerre OS concluídas

**Critérios de Prioridade**:

| Prioridade | Quando usar |
|------------|-------------|
| **Urgente** | Parada de linha, segurança |
| **Alta** | Impacto significativo na produção |
| **Normal** | Manutenções regulares |
| **Baixa** | Melhorias, preventivas não críticas |

---

### 6.3 Guia do Técnico

**Objetivo**: Executar manutenções

**Fluxo de Trabalho**:

1. Acesse o mobile (`/manutencao/mobile`)
2. Selecione seu perfil
3. Veja suas OS na fila
4. Inicie a primeira OS por prioridade
5. Execute a manutenção
6. Se precisar pausar, registre o motivo
7. Ao concluir, finalize com PCS

**Boas Práticas**:

- ✅ Sempre registre pausas com motivo correto
- ✅ Seja específico na observação técnica
- ✅ Informe se houve hora extra
- ✅ Indique restrições se houver
- ✅ Não esqueça de finalizar a OS

---

### 6.4 Guia do Gestor

**Objetivo**: Acompanhar indicadores

**Painel TV** (`/manutencao/painel-tv`):
- Use em tela cheia em TV na área de manutenção
- Monitore técnicos disponíveis/ocupados
- Acompanhe fila e gargalos
- Identifique pausas prolongadas

**Dashboard** (`/manutencao`):
- Verifique contadores diários
- Acompanhe backlog
- Analise status dos técnicos

---

## 7. Perguntas Frequentes

### Como identificar um bem por QR Code?

Ao criar uma OS, o campo "Bem/Máquina" aceita pesquisa por código. Se o bem tiver QR Code cadastrado, basta digitar o código lido.

### O que fazer se precisar pausar uma OS?

1. Na interface mobile, toque em "Pausar"
2. Selecione o motivo apropriado
3. A OS fica em status "Pausada"
4. Quando resolver, toque em "Retomar"

### Como funciona o encerramento automático?

Quando o técnico finaliza a OS com o registro de Problema/Causa/Solução, o sistema automaticamente encerra a OS, simulando a integração com o Protheus.

### Um técnico pode ter mais de uma OS?

Sim, mas não simultaneamente. O técnico pode ter várias OS atribuídas (na fila), mas só pode executar uma por vez.

### Como consultar o histórico de manutenções de uma máquina?

1. Acesse `/manutencao/bens`
2. Localize o bem
3. Clique em "Histórico"
4. Visualize todas as OS, incluindo PCS e observações

### Qual a diferença entre "Concluída" e "Encerrada"?

- **Concluída Técnica**: O técnico finalizou a execução
- **Encerrada**: O sistema/supervisor fechou oficialmente a OS

### Como alterar a prioridade de uma OS?

Na tela de detalhes da OS, o supervisor pode editar a prioridade antes da atribuição ou durante a execução.

---

## 📞 Suporte

Em caso de dúvidas ou problemas:
- Contate o administrador do sistema
- Consulte este manual
- Verifique as configurações em `/manutencao/configuracoes`

---

*Documento gerado em: Fevereiro/2026*
*Versão: 1.0*

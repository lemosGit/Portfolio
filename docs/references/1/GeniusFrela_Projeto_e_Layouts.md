# GeniusFrela — Projeto, Portal e Layouts por Serviço

> **Perfeita qualidade mora aqui**

---

## 1. Descrição do projeto (resumo)

A **GeniusFrela** é uma marca de trabalhos digitais e criativos que presta **3 serviços** e tem um **portal** próprio.

O portal tem duas funções:

1. **Divulgar**: mostra os serviços e os trabalhos já feitos, para o cliente conhecer o que fazemos.
2. **Acompanhar**: depois de acertar o projeto, o cliente entra na **Área do Cliente** com um **link mágico** ou com **credenciais**, e acompanha o seu projeto fase a fase.

Cada serviço tem um **layout próprio na Área do Cliente**, com as fases que correspondem ao tipo de projeto pedido.

| # | Serviço | Exemplos | Estado do layout |
|---|---------|----------|------------------|
| 1 | **Desenvolvimento de Soluções Digitais** | Sites, sistemas web, apps mobile e desktop, integrações | ✅ **Em atividade** |
| 2 | **Académico** | Trabalhos escolares e universitários, formatação, revisão | 🟡 Por implementar |
| 3 | **Design** | Logótipos, convites, lonas de festa, camisolas personalizadas | 🟡 Por implementar |

---

## 2. Jornada do cliente

```
Portal (conhecer) → Contacto (WhatsApp / formulário) → Acerto do projeto
      → Criação do projeto no painel admin → Envio de link mágico / credencial
            → Área do Cliente (layout do serviço) → Acompanhamento → Entrega
```

1. **Conhecer**: o cliente navega pelo portal e vê os serviços e o portfólio.
2. **Contactar**: pelo WhatsApp **+244 957 392 400** ou por formulário.
3. **Acertar**: definimos o âmbito, o preço ("a partir de") e o prazo. O atendimento humano é de segunda a sexta, das 18h às 21h.
4. **Criar o projeto**: no painel de administração, escolhemos o **tipo de serviço**. É isto que define o layout e as fases.
5. **Dar acesso**: o cliente recebe por WhatsApp ou email um **link mágico** (entra sem palavra-passe) ou **credenciais**.
6. **Acompanhar**: o cliente vê a fase atual, os ficheiros, as aprovações, os pagamentos e as mensagens.

---

## 3. Estrutura do portal público

| Secção | Conteúdo |
|--------|----------|
| **Início** | Logótipo, slogan, os 3 serviços em destaque e o botão "Fale connosco" |
| **Serviços** | 3 cartões, cada um com a cor do serviço, abrindo uma página própria |
| **Portfólio** | Trabalhos filtrados por serviço (Desenvolvimento / Académico / Design) |
| **Como funciona** | A jornada da secção 2 em 5 passos visuais |
| **Contacto** | WhatsApp, formulário e horário |
| **Área do Cliente** | Botão "Entrar", com link mágico ou credencial |

---

## 4. Estrutura comum da Área do Cliente

Todos os layouts partilham o mesmo esqueleto. Mudam as **fases**, a **cor de destaque** e os **blocos específicos**.

```
┌────────────────────────────────────────────────────────────┐
│  Logo GeniusFrela        Projeto: <nome>       [Cliente ▾] │
├────────────────────────────────────────────────────────────┤
│  Etiqueta do serviço (cor)   ·   Prazo   ·   Estado        │
│  ●━━━━●━━━━●━━━━○━━━━○━━━━○   ← barra de fases (stepper)    │
├──────────────────────────────┬─────────────────────────────┤
│  Fase atual                  │  Pagamentos                 │
│  (descrição + próximo passo) │  (sinal / restante)         │
├──────────────────────────────┼─────────────────────────────┤
│  Bloco específico do serviço │  Aprovações pendentes       │
├──────────────────────────────┴─────────────────────────────┤
│  Ficheiros / entregáveis          │  Mensagens             │
└────────────────────────────────────────────────────────────┘
```

**Blocos comuns:** barra de fases, fase atual, ficheiros, aprovações, pagamentos e mensagens.

---

## 5. Layouts por serviço

### 5.1 Desenvolvimento de Soluções Digitais ✅ (em atividade)

**Tipos de projeto:** site institucional, sistema web, app mobile, app desktop, integração.

**Fases:**

| # | Fase | O que o cliente vê |
|---|------|--------------------|
| 1 | Descoberta e requisitos | Resumo das necessidades, perguntas respondidas |
| 2 | Proposta e orçamento | Documento da proposta, botão "Aprovar" |
| 3 | Design UI/UX | Protótipos e ecrãs para aprovar |
| 4 | Desenvolvimento | Progresso por milestones e tarefas concluídas |
| 5 | Testes e homologação | Link de teste (staging), lista de ajustes |
| 6 | Entrega e publicação | Link final, domínio, credenciais de admin |
| 7 | Suporte | Pedidos de correção e melhorias |

**Blocos específicos:**
- Progresso por **milestones** (%), alinhado com as milestones no GitHub
- **Link de pré-visualização** (staging / demo)
- Registo de alterações (changelog) da versão entregue

**Cores:**

| Papel | Cor | Hex |
|-------|-----|-----|
| Destaque do serviço | Ciano tecnológico | `#22D3EE` |
| Destaque secundário | Azul elétrico | `#3B82F6` |
| Gradiente de cabeçalho | Ciano → Roxo da marca | `#22D3EE → #7C3AED` |

---

### 5.2 Académico 🟡

**Tipos de projeto:** trabalho escolar, trabalho universitário, relatório, formatação ou revisão de documento.

**Fases:**

| # | Fase | O que o cliente vê |
|---|------|--------------------|
| 1 | Pedido e briefing | Tema, nível de ensino, normas (ex.: APA), nº de páginas, prazo |
| 2 | Orçamento e aceite | Valor e prazo, botão "Aceitar" |
| 3 | Estrutura (índice) | Índice proposto para aprovar |
| 4 | Desenvolvimento | Capítulos/secções concluídos (ex.: 3 de 5) |
| 5 | Revisão e formatação | Documento em revisão, normas aplicadas |
| 6 | Entrega final | Ficheiro final (PDF / Word) |
| 7 | Ajustes | Pedido de pequenas correções dentro do prazo acordado |

**Blocos específicos:**
- **Contagem do prazo** em destaque (dias restantes), porque é o fator mais crítico
- Progresso por **capítulos / secções**
- **Ficha do trabalho**: instituição, disciplina, normas, nº de páginas

**Cores:**

| Papel | Cor | Hex |
|-------|-----|-----|
| Destaque do serviço | Âmbar (papel / lápis) | `#F59E0B` |
| Destaque secundário | Azul-marinho académico | `#1E3A8A` |
| Gradiente de cabeçalho | Âmbar → Roxo da marca | `#F59E0B → #7C3AED` |

---

### 5.3 Design 🟡

**Tipos de projeto:** logótipo e identidade, convite (digital/impresso), lona de festa, camisola personalizada.

**Fases:**

| # | Fase | O que o cliente vê |
|---|------|--------------------|
| 1 | Briefing | Tipo de peça, medidas, quantidades, referências, textos |
| 2 | Orçamento e sinal | Valor (design + impressão), pagamento do sinal |
| 3 | Conceito / esboço | Primeira proposta visual |
| 4 | Revisões | Rondas de ajuste (ex.: Ronda 1 de 2), com comentários |
| 5 | Aprovação final da arte | Botão "Aprovar arte para produção" |
| 6 | Produção / impressão | Estado da produção |
| 7 | Entrega / levantamento | Data e local de entrega, ficheiros finais |

**Blocos específicos:**
- **Galeria de provas**: versões lado a lado (V1, V2, V3…)
- **Contador de rondas de revisão** incluídas no preço
- **Ficha técnica**: medidas, material, quantidade, acabamento
- Aviso: *após aprovar a arte, a produção não pode ser alterada*

**Cores:**

| Papel | Cor | Hex |
|-------|-----|-----|
| Destaque do serviço | Magenta criativo | `#EC4899` |
| Destaque secundário | Laranja vibrante | `#F97316` |
| Gradiente de cabeçalho | Magenta → Roxo da marca | `#EC4899 → #7C3AED` |

---

## 6. Paleta base (comum a todo o portal)

A identidade é futurista, com fundo escuro e roxo como cor da marca. Cada serviço acrescenta a sua cor de destaque por cima.

| Papel | Hex |
|-------|-----|
| Fundo | `#0B0F1A` |
| Superfície (cartões) | `#131A2A` |
| Bordas | `#1F2937` |
| Texto principal | `#E6EAF2` |
| Texto secundário | `#94A3B8` |
| **Roxo da marca** | `#7C3AED` |

**Cores de estado** (iguais em todos os serviços):

| Estado | Hex |
|--------|-----|
| Concluído | `#22C55E` |
| Em curso | cor de destaque do serviço |
| A aguardar o cliente | `#EAB308` |
| Atrasado / bloqueado | `#EF4444` |
| Por iniciar | `#475569` |

**Resumo das cores por serviço:**

| Serviço | Destaque | Secundária |
|---------|----------|------------|
| Desenvolvimento | `#22D3EE` | `#3B82F6` |
| Académico | `#F59E0B` | `#1E3A8A` |
| Design | `#EC4899` | `#F97316` |

---

## 7. Nota técnica (para implementação)

- **`service_type`** no projeto: `development` | `academic` | `design`. Define o layout, as fases e as cores.
- **Fases como dados** (tabela `phases` por tipo de serviço), e não fixas no código. Assim, um serviço novo é só configuração.
- **Tema por serviço**: as variáveis CSS (`--accent`, `--accent-2`) mudam conforme o `service_type`.
- **Acesso**: um link mágico de uso único com validade curta, e credenciais como alternativa.
- O layout de **Desenvolvimento** serve de **modelo**. Os layouts de Académico e Design reutilizam o mesmo esqueleto e só mudam as fases, os blocos específicos e as cores.

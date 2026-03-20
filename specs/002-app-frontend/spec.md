# Feature Specification: Frontend da Aplicacao de Recomp Corporal

**Feature Branch**: `002-app-frontend`  
**Created**: 2026-03-15  
**Status**: Draft  
**Input**: User description: "Precisamos implementar o frontend da aplicação"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Entrar e Iniciar o Primeiro Objetivo (Priority: P1)

Uma pessoa usuaria acessa a aplicacao, cria a conta ou entra com suas credenciais, informa seus dados iniciais e conclui o primeiro objetivo de recomposicao corporal sem depender de suporte manual.

**Why this priority**: Sem essa jornada, a aplicacao nao entrega valor real ao usuario final. Esse fluxo transforma a API existente em uma experiencia utilizavel e valida a principal proposta do produto.

**Independent Test**: Pode ser testada do inicio ao fim por uma pessoa nova que cria conta, informa medidas iniciais, define um objetivo de cutting ou bulking e consegue visualizar a confirmacao do objetivo ativo.

**Acceptance Scenarios**:

1. **Given** uma pessoa sem conta, **When** ela se cadastra com seus dados obrigatorios, **Then** ela entra na area autenticada da aplicacao com a propria conta ativa.
2. **Given** uma pessoa autenticada sem medidas iniciais, **When** ela informa seus dados corporais e escolhe um metodo de calculo, **Then** a aplicacao exibe seu percentual de gordura corporal calculado de forma compreensivel.
3. **Given** uma pessoa com medida inicial registrada, **When** ela cria um objetivo de cutting ou bulking, **Then** a aplicacao mostra o objetivo ativo com metas e orientacoes principais.

---

### User Story 2 - Acompanhar o Painel do Objetivo Atual (Priority: P2)

Uma pessoa com objetivo ativo visualiza um painel resumido com seu estado atual, progresso acumulado, proximidade da meta e proximos passos recomendados.

**Why this priority**: Depois da configuracao inicial, o painel passa a ser o principal ponto de retorno do usuario e concentra a percepcao de valor recorrente da aplicacao.

**Independent Test**: Pode ser testada com uma conta que ja tenha objetivo ativo, verificando se o painel mostra o objetivo atual, indicadores principais e links claros para as acoes seguintes.

**Acceptance Scenarios**:

1. **Given** uma pessoa com objetivo ativo, **When** ela acessa a tela inicial autenticada, **Then** ela ve um resumo do objetivo atual, percentual de gordura atual, alvo e status.
2. **Given** uma pessoa com historico de progresso, **When** ela abre o painel, **Then** ela encontra indicadores de evolucao e situacao atual sem precisar navegar por varias telas.
3. **Given** uma pessoa sem objetivo ativo, **When** ela entra na area autenticada, **Then** a aplicacao orienta claramente o que precisa ser feito para iniciar a jornada.

---

### User Story 3 - Registrar Progresso Semanal (Priority: P3)

Uma pessoa com objetivo ativo registra novas medidas semanais, recebe retorno imediato sobre sua evolucao e entende se esta no ritmo esperado ou se precisa ajustar o plano.

**Why this priority**: O acompanhamento recorrente e o mecanismo que sustenta engajamento e adesao ao produto ao longo do tempo.

**Independent Test**: Pode ser testada por uma pessoa com objetivo ativo que registra uma nova medicao apos o periodo minimo esperado e visualiza a nova entrada refletida no progresso.

**Acceptance Scenarios**:

1. **Given** uma pessoa com objetivo ativo, **When** ela registra uma nova medicao valida, **Then** a aplicacao confirma o registro e atualiza o progresso exibido.
2. **Given** uma pessoa que registra progresso fora da regra esperada, **When** ela tenta salvar a nova medicao, **Then** a aplicacao explica o motivo do bloqueio de forma clara.
3. **Given** uma pessoa em bulking proxima do limite definido, **When** ela registra nova medicao, **Then** a aplicacao apresenta o alerta correspondente com linguagem objetiva.

---

### User Story 4 - Consultar Historico e Tendencias (Priority: P4)

Uma pessoa acompanha a propria evolucao ao longo do tempo por meio de historico organizado e visualizacoes que facilitem comparacoes e interpretacao de tendencia.

**Why this priority**: Ver o progresso de forma historica reforca motivacao, ajuda na tomada de decisao e reduz a dependencia de interpretacao tecnica dos numeros.

**Independent Test**: Pode ser testada com uma conta que tenha varias medicoes registradas, verificando se o historico e as tendencias ficam compreensiveis e ordenados.

**Acceptance Scenarios**:

1. **Given** uma pessoa com varias entradas de progresso, **When** ela acessa o historico, **Then** ela ve os registros em ordem clara com os dados mais relevantes de cada periodo.
2. **Given** uma pessoa com dados suficientes para tendencia, **When** ela consulta sua evolucao, **Then** ela entende se esta melhorando, estabilizada ou se afastando da meta.
3. **Given** uma pessoa com poucas entradas, **When** ela abre a visao de tendencias, **Then** a aplicacao informa que ainda nao ha dados suficientes sem apresentar informacao enganosa.

---

### User Story 5 - Visualizar Planos e Recomendacoes (Priority: P5)

Uma pessoa com objetivo ativo consulta seu plano de treino e seu plano alimentar de forma clara, com linguagem acionavel e foco no contexto do objetivo atual.

**Why this priority**: Os planos traduzem calculos e metas em orientacao pratica. Embora nao sejam a porta de entrada do produto, aumentam bastante o valor percebido.

**Independent Test**: Pode ser testada com uma conta que tenha objetivo ativo, confirmando que os planos de treino e alimentacao ficam disponiveis, legiveis e coerentes com o objetivo atual.

**Acceptance Scenarios**:

1. **Given** uma pessoa com objetivo de cutting, **When** ela acessa o plano de treino, **Then** ela encontra orientacoes adequadas para perda de gordura.
2. **Given** uma pessoa com objetivo de bulking, **When** ela acessa o plano alimentar, **Then** ela ve metas nutricionais alinhadas ao ganho controlado.
3. **Given** uma pessoa com objetivo ativo, **When** ela abre as recomendacoes, **Then** ela consegue diferenciar claramente treino, dieta, metas e observacoes importantes.

### Edge Cases

- O que acontece quando a pessoa tenta continuar a jornada sem ter concluido etapas obrigatorias anteriores?
- Como a aplicacao se comporta quando nao existe objetivo ativo, plano disponivel ou historico suficiente para exibir tendencias?
- O que a pessoa ve quando a sessao expira no meio de uma acao importante?
- Como a aplicacao informa erros de validacao sem perder dados que a pessoa acabou de preencher?
- O que acontece quando o retorno do servico demora ou falha temporariamente?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST oferecer uma experiencia de entrada para cadastro, autenticacao e retorno de sessao.
- **FR-002**: O sistema MUST conduzir a pessoa usuaria pelas etapas iniciais necessarias para comecar a jornada sem depender de conhecimento tecnico do dominio.
- **FR-003**: O sistema MUST permitir o registro de medidas iniciais com linguagem clara sobre o que precisa ser informado em cada etapa.
- **FR-004**: O sistema MUST exibir o resultado da composicao corporal inicial de forma compreensivel antes da criacao do objetivo.
- **FR-005**: A pessoa usuaria MUST ser capaz de criar um objetivo de cutting ou bulking a partir da propria medicao inicial.
- **FR-006**: O sistema MUST apresentar um painel autenticado com resumo do objetivo atual, status e proximas acoes disponiveis.
- **FR-007**: O sistema MUST destacar quando a pessoa nao tiver objetivo ativo e orientar o proximo passo recomendado.
- **FR-008**: A pessoa usuaria MUST ser capaz de registrar progresso semanal com confirmacao explicita de sucesso ou motivo de falha.
- **FR-009**: O sistema MUST refletir novos registros de progresso no painel e no historico sem exigir interpretacao manual de dados crus.
- **FR-010**: O sistema MUST apresentar o historico de progresso em ordem cronologica e com contexto suficiente para comparacao entre periodos.
- **FR-011**: O sistema MUST mostrar a tendencia geral da jornada em linguagem compreensivel para pessoas nao tecnicas.
- **FR-012**: O sistema MUST exibir alertas e bloqueios relevantes, incluindo sessao expirada, regras de periodicidade e limites de seguranca.
- **FR-013**: O sistema MUST preservar os dados inseridos pela pessoa usuaria sempre que ocorrer erro recuperavel durante o preenchimento.
- **FR-014**: O sistema MUST disponibilizar o plano de treino e o plano alimentar de acordo com o objetivo ativo atual.
- **FR-015**: O sistema MUST separar visualmente informacoes de treino, nutricao, progresso e configuracoes para reduzir ambiguidade.
- **FR-016**: O sistema MUST oferecer feedback visivel para estados de carregamento, sucesso, vazio e falha.
- **FR-017**: O sistema MUST permitir que a pessoa encerre a sessao com clareza e previsibilidade.
- **FR-018**: O sistema MUST manter consistencia de linguagem, navegacao e apresentacao dos dados em toda a jornada.

### Key Entities *(include if feature involves data)*

- **Sessao de Usuario**: Representa o acesso autenticado da pessoa usuaria, incluindo estado de entrada, permanencia na area autenticada e encerramento da sessao.
- **Perfil Inicial**: Representa os dados basicos e preferencias informados no comeco da jornada, necessarios para iniciar o acompanhamento.
- **Medicao Corporal**: Representa um registro de medidas em um momento especifico, com seus resultados associados e contexto temporal.
- **Objetivo Ativo**: Representa a meta principal em andamento, incluindo tipo de objetivo, situacao atual, alvo e status.
- **Registro de Progresso**: Representa uma atualizacao periodica que alimenta historico, indicadores e alertas de acompanhamento.
- **Plano de Orientacao**: Representa o conjunto de recomendacoes praticas apresentado para treino e alimentacao conforme o objetivo atual.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 90% das pessoas usuarias conseguem concluir cadastro, autenticacao, medicao inicial e criacao do primeiro objetivo sem ajuda externa na primeira tentativa.
- **SC-002**: Pessoas usuarias conseguem registrar uma nova entrada de progresso em menos de 2 minutos apos entrar na area autenticada.
- **SC-003**: 95% das principais telas da jornada autenticada ficam compreensiveis para teste de uso moderado, sem necessidade de explicacao adicional por parte do time do produto.
- **SC-004**: Pelo menos 85% das pessoas em teste conseguem identificar o status do objetivo atual e o proximo passo recomendado em ate 10 segundos na tela principal.
- **SC-005**: 90% das falhas de preenchimento apresentam mensagem acionavel que permite correcao imediata sem perda do que ja foi digitado.
- **SC-006**: Pessoas usuarias com historico de pelo menos 4 registros conseguem identificar sua tendencia geral corretamente em pelo menos 90% dos testes guiados.
- **SC-007**: Pelo menos 80% das pessoas usuarias que possuem objetivo ativo acessam treino, dieta ou progresso a partir do painel principal em no maximo 2 interacoes.

## Assumptions

- O frontend atendera as capacidades ja existentes da aplicacao de recomposicao corporal e nao introduzira um novo dominio de negocio.
- O foco inicial e a experiencia da pessoa usuaria final; painis administrativos, operacao interna e funcionalidades para coaches ficam fora deste escopo.
- A jornada prioritaria considera pessoas autenticadas, com conta propria e dados pessoais relacionados apenas ao proprio acompanhamento.
- Conteudos de treino e dieta serao apresentados como orientacao dentro da aplicacao, sem substituir acompanhamento profissional individual.
- A experiencia deve funcionar em dispositivos de uso cotidiano, com prioridade para leitura clara, fluxo simples e baixo atrito operacional.

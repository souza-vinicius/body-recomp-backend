# Tasks: Frontend da Aplicacao de Recomp Corporal

**Input**: Design documents from `/specs/002-app-frontend/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/frontend-backend.yaml, quickstart.md

**Tests**: Incluidas por exigencia da constituicao do repositorio, que determina abordagem test-first.

**Organization**: Tarefas agrupadas por user story para permitir implementacao, validacao e demonstracao incremental.

## ⚠️ Backend Dependency: Missing `GET /goals` Endpoint

O backend NAO possui endpoint para listar objetivos do usuario ou descobrir o objetivo ativo. Atualmente so existe `GET /goals/{goalId}`, que exige conhecer o ID previamente. Para US2-US5 funcionarem apos reautenticacao, o frontend precisa de uma destas solucoes:

1. **Recomendado**: Adicionar `GET /api/v1/goals` ao backend (retorna objetivos do usuario autenticado)
2. **Workaround**: Persistir o `goalId` no armazenamento local apos criacao e usar `GET /goals/{goalId}`

As tarefas abaixo adotam o workaround (persistencia local de goalId) e incluem atualizacao do contrato. Se o endpoint backend for adicionado, os modulos de API do frontend ja estarao preparados.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicializar o workspace de frontend e a base web/mobile do projeto.

- [x] T001 Create frontend workspace structure in frontend/app, frontend/components, frontend/lib (including lib/validators and lib/utils), frontend/styles, frontend/public, frontend/capacitor, and frontend/tests
- [x] T002 Initialize Next.js 14 + React 18 + TypeScript project configuration in frontend/package.json
- [x] T003 [P] Configure TypeScript and path aliases in frontend/tsconfig.json
- [x] T004 [P] Configure Next.js application settings in frontend/next.config.js
- [x] T005 [P] Configure TailwindCSS and global styles in frontend/tailwind.config.ts, frontend/postcss.config.js, and frontend/styles/globals.css
- [x] T006 [P] Configure Capacitor base app settings in frontend/capacitor.config.ts and frontend/capacitor/package.json
- [x] T007 [P] Add frontend environment examples in frontend/.env.example
- [x] T008 [P] Add frontend workspace README and run commands in frontend/README.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Infraestrutura central que bloqueia todas as jornadas do frontend.

**⚠️ CRITICAL**: Nenhum trabalho de user story deve comecar antes desta fase.

### Test Tooling

- [x] T009 Configure frontend test tooling with Vitest and React Testing Library in frontend/vitest.config.ts and frontend/tests/setup.ts
- [x] T010 [P] Configure Playwright end-to-end test base in frontend/playwright.config.ts and frontend/tests/e2e/.gitkeep

### API & Auth Infrastructure

- [x] T011 Implement API client with automatic token refresh, auth header injection, and RFC 7807 error normalization in frontend/lib/api/client.ts
- [x] T012 [P] Implement API response types and error schema in frontend/lib/api/types.ts
- [x] T013 Implement session storage with goalId persistence in frontend/lib/auth/session-storage.ts
- [x] T014 Implement auth state store (depends on T013 session storage) in frontend/lib/state/auth-store.ts
- [x] T015 Implement route guards and session bootstrap (depends on T014 auth store) in frontend/lib/auth/guards.ts and frontend/lib/auth/bootstrap.ts
- [x] T016 [P] Implement logout action and full session cleanup in frontend/lib/auth/logout.ts

### Config & Validation

- [x] T017 [P] Implement frontend config and endpoint mapping in frontend/lib/config.ts
- [x] T018 [P] Implement client-side validation helpers for measurement ranges and form rules in frontend/lib/validators/index.ts

### Layout & Shared Components

- [x] T019 Create global app providers (depends on T014 auth store) in frontend/app/providers.tsx
- [x] T020 [P] Create public area layout in frontend/app/(public)/layout.tsx
- [x] T021 Create authenticated area layout with navigation shell in frontend/app/(app)/layout.tsx (depends on T019 providers)
- [x] T022 [P] Implement shared feedback components for loading, empty, and error states in frontend/components/feedback/loading-state.tsx, frontend/components/feedback/empty-state.tsx, and frontend/components/feedback/error-state.tsx
- [x] T023 [P] Implement shared form primitives in frontend/components/forms/text-field.tsx, frontend/components/forms/select-field.tsx, and frontend/components/forms/submit-button.tsx
- [x] T024 [P] Implement app shell and navigation components in frontend/components/layout/app-shell.tsx and frontend/components/layout/app-nav.tsx

### Foundation Tests

- [x] T025 Add foundation smoke tests for providers, auth bootstrap, route guards, and logout in frontend/tests/unit/foundation.test.ts

**Checkpoint**: Foundation ready — API client handles auth refresh, session persists goalId, layouts and guards work. User story work can begin.

---

## Phase 3: User Story 1 - Entrar e Iniciar o Primeiro Objetivo (Priority: P1) 🎯 MVP

**Goal**: Permitir cadastro, autenticacao, onboarding inicial, medicao inicial e criacao do primeiro objetivo.

**Independent Test**: Uma pessoa nova consegue criar conta, fazer login, preencher os dados iniciais, registrar a primeira medicao e concluir a criacao do objetivo ativo.

### Tests for User Story 1

- [x] T026 [P] [US1] Add auth form component tests in frontend/tests/unit/auth-forms.test.tsx
- [x] T027 [P] [US1] Add onboarding flow component tests in frontend/tests/unit/onboarding-flow.test.tsx
- [x] T028 [P] [US1] Add onboarding integration tests for registration, login, initial measurement, and goal creation in frontend/tests/integration/onboarding-journey.test.tsx
- [x] T029 [P] [US1] Add Playwright MVP journey test in frontend/tests/e2e/onboarding.spec.ts

### Implementation for User Story 1

- [x] T030 [P] [US1] Implement auth API functions (login, register) in frontend/lib/api/auth.ts
- [x] T031 [P] [US1] Implement user profile API function (GET /users/me) in frontend/lib/api/users.ts
- [x] T032 [P] [US1] Implement measurement creation API function (POST /measurements) in frontend/lib/api/measurements.ts
- [x] T033 [P] [US1] Implement goal API functions (create goal, get goal by ID) in frontend/lib/api/goals.ts
- [x] T034 [P] [US1] Create login page in frontend/app/(public)/login/page.tsx
- [x] T035 [P] [US1] Create registration page in frontend/app/(public)/register/page.tsx
- [x] T036 [P] [US1] Create login form component in frontend/components/domain/auth/login-form.tsx
- [x] T037 [P] [US1] Create registration form component in frontend/components/domain/auth/register-form.tsx
- [x] T038 [P] [US1] Create onboarding profile step component in frontend/components/domain/onboarding/profile-step.tsx
- [x] T039 [P] [US1] Create onboarding measurement step component in frontend/components/domain/onboarding/measurement-step.tsx
- [x] T040 [P] [US1] Create onboarding goal step component in frontend/components/domain/onboarding/goal-step.tsx
- [x] T041 [US1] Implement onboarding page flow and step orchestration in frontend/app/(app)/setup/page.tsx
- [x] T042 [US1] Implement session-aware navigation redirects between public routes, setup flow, and dashboard in frontend/lib/auth/navigation.ts
- [x] T043 [US1] Create measurement result summary card in frontend/components/domain/onboarding/measurement-result-card.tsx
- [x] T044 [US1] Create goal confirmation and success panel with goalId persistence to session storage in frontend/components/domain/onboarding/goal-success-panel.tsx
- [x] T045 [US1] Implement onboarding draft persistence and recoverable error handling in frontend/lib/state/onboarding-draft-store.ts

**Checkpoint**: User Story 1 should be fully functional and independently testable. GoalId is persisted for subsequent stories.

---

## Phase 4: User Story 2 - Acompanhar o Painel do Objetivo Atual (Priority: P2)

**Goal**: Exibir um painel autenticado com objetivo atual, status, dados principais e proximas acoes.

**Independent Test**: Uma pessoa com objetivo ativo entra no sistema e encontra no painel principal o resumo do objetivo, status atual e caminhos claros para progresso, historico e planos.

### Tests for User Story 2

- [x] T046 [P] [US2] Add dashboard summary component tests in frontend/tests/unit/dashboard-summary.test.tsx
- [x] T047 [P] [US2] Add dashboard integration tests for active goal, empty goal, and missing goalId states in frontend/tests/integration/dashboard-page.test.tsx
- [x] T048 [P] [US2] Add Playwright dashboard smoke test in frontend/tests/e2e/dashboard.spec.ts

### Implementation for User Story 2

- [x] T049 [P] [US2] Implement dashboard data loader using persisted goalId and GET /goals/{goalId} in frontend/lib/api/dashboard.ts
- [x] T050 [P] [US2] Create dashboard summary card with goal type, body fat current vs target, and status in frontend/components/domain/dashboard/goal-summary-card.tsx
- [x] T051 [P] [US2] Create KPI indicator cards for key metrics in frontend/components/domain/dashboard/kpi-cards.tsx
- [x] T052 [P] [US2] Create empty goal state panel with redirect to setup flow in frontend/components/domain/dashboard/no-goal-panel.tsx
- [x] T053 [P] [US2] Create primary action shortcuts for progress, history, and plans in frontend/components/domain/dashboard/quick-actions.tsx
- [x] T054 [US2] Compose dashboard page with loading, empty, error, and ready states in frontend/app/(app)/dashboard/page.tsx

**Checkpoint**: User Stories 1 and 2 work independently.

---

## Phase 5: User Story 3 - Registrar Progresso Semanal (Priority: P3)

**Goal**: Permitir registro de progresso semanal com feedback imediato e respeito as regras de negocio existentes.

**Independent Test**: Uma pessoa com objetivo ativo registra nova medicao, recebe confirmacao visual do resultado e entende bloqueios ou alertas quando a submissao nao pode prosseguir.

### Tests for User Story 3

- [x] T055 [P] [US3] Add progress form component tests in frontend/tests/unit/progress-form.test.tsx
- [x] T056 [P] [US3] Add progress submission and feedback integration tests in frontend/tests/integration/progress-entry.test.tsx
- [x] T057 [P] [US3] Add Playwright progress registration test in frontend/tests/e2e/progress-entry.spec.ts

### Implementation for User Story 3

- [x] T058 [P] [US3] Implement progress submission (POST) and history (GET) API functions in frontend/lib/api/progress.ts
- [x] T059 [P] [US3] Create progress measurement form with method-aware field set in frontend/components/domain/progress/progress-entry-form.tsx
- [x] T060 [P] [US3] Create progress success and validation feedback components in frontend/components/domain/progress/progress-submit-feedback.tsx
- [x] T061 [P] [US3] Create bulking ceiling alert component in frontend/components/domain/progress/ceiling-alert.tsx
- [x] T062 [US3] Implement progress form draft persistence and recoverable error handling in frontend/lib/state/progress-draft-store.ts
- [x] T063 [US3] Compose progress page with form, feedback, and ceiling alert in frontend/app/(app)/progress/page.tsx
- [x] T064 [US3] Implement dashboard data invalidation after progress submission in frontend/lib/state/dashboard-store.ts

**Checkpoint**: User Story 3 is independently testable with the existing authenticated journey.

---

## Phase 6: User Story 4 - Consultar Historico e Tendencias (Priority: P4)

**Goal**: Mostrar historico cronologico e tendencia de progresso de forma legivel e acionavel.

**Independent Test**: Uma pessoa com multiplas entradas de progresso abre a area de historico, enxerga os registros em ordem correta e entende a tendencia geral sem precisar interpretar dados crus.

### Tests for User Story 4

- [x] T065 [P] [US4] Add history list component tests in frontend/tests/unit/progress-history.test.tsx
- [x] T066 [P] [US4] Add trend display component tests in frontend/tests/unit/trend-summary.test.tsx
- [x] T067 [P] [US4] Add history and trends integration tests in frontend/tests/integration/history-and-trends.test.tsx
- [x] T068 [P] [US4] Add Playwright history exploration test in frontend/tests/e2e/history.spec.ts

### Implementation for User Story 4

- [x] T069 [P] [US4] Create chronological history list component in frontend/components/domain/history/progress-history-list.tsx
- [x] T070 [P] [US4] Create trend summary cards in frontend/components/domain/history/trend-summary-cards.tsx
- [x] T071 [P] [US4] Create body fat trend chart component in frontend/components/charts/body-fat-trend-chart.tsx
- [x] T072 [P] [US4] Create insufficient-data guidance panel in frontend/components/domain/history/insufficient-data-panel.tsx
- [x] T073 [US4] Compose history page with list, trends, chart, and insufficient-data states in frontend/app/(app)/history/page.tsx

**Checkpoint**: User Story 4 should stand on its own for accounts with progress history.

---

## Phase 7: User Story 5 - Visualizar Planos e Recomendacoes (Priority: P5)

**Goal**: Exibir planos de treino e dieta com separacao clara, linguagem acionavel e coerencia com o objetivo atual.

**Independent Test**: Uma pessoa com objetivo ativo acessa os planos, entende as recomendacoes e diferencia claramente treino, dieta, metas e observacoes.

### Tests for User Story 5

- [x] T074 [P] [US5] Add training plan view component tests in frontend/tests/unit/training-plan-view.test.tsx
- [x] T075 [P] [US5] Add diet plan view component tests in frontend/tests/unit/diet-plan-view.test.tsx
- [x] T076 [P] [US5] Add plan retrieval integration tests in frontend/tests/integration/plans-page.test.tsx
- [x] T077 [P] [US5] Add Playwright plan viewing test in frontend/tests/e2e/plans.spec.ts

### Implementation for User Story 5

- [x] T078 [P] [US5] Implement training and diet plan API functions in frontend/lib/api/plans.ts
- [x] T079 [P] [US5] Create training plan presentation component in frontend/components/domain/plans/training-plan-panel.tsx
- [x] T080 [P] [US5] Create diet plan presentation component in frontend/components/domain/plans/diet-plan-panel.tsx
- [x] T081 [P] [US5] Create macro target summary component in frontend/components/domain/plans/macro-targets.tsx
- [x] T082 [US5] Compose plans page with empty, ready, and unavailable states in frontend/app/(app)/plans/page.tsx

**Checkpoint**: All five user stories are independently functional.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Ajustes compartilhados, robustez final e preparacao para entrega.

- [x] T083 [P] Add session expiration recovery modal and re-auth flow across authenticated pages in frontend/components/feedback/session-expired-modal.tsx
- [x] T084 [P] Create settings page with logout action and session info in frontend/app/(app)/settings/page.tsx
- [x] T085 [P] Add mobile-specific viewport and touch interaction refinements in frontend/styles/globals.css and frontend/components/layout/app-shell.tsx
- [x] T086 [P] Add accessibility and keyboard navigation refinements in frontend/components/forms and frontend/components/layout
- [x] T087 [P] Add cross-story empty/error/loading snapshot tests in frontend/tests/integration/ui-states.test.tsx
- [x] T088 [P] Validate quickstart journeys end-to-end in frontend/tests/e2e/quickstart-smoke.spec.ts
- [x] T089 Update frontend documentation and setup instructions in frontend/README.md and specs/002-app-frontend/quickstart.md
- [x] T090 Update frontend-backend contract to include GET /goals endpoint in specs/002-app-frontend/contracts/frontend-backend.yaml
- [x] T091 Prepare Capacitor build/run workflow documentation in frontend/capacitor/README.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: pode iniciar imediatamente.
- **Phase 2 (Foundational)**: depende de Phase 1 e bloqueia todas as user stories.
- **Phases 3-7 (User Stories)**: dependem da conclusao da Phase 2.
- **Phase 8 (Polish)**: depende das user stories desejadas estarem concluidas.

### User Story Dependencies

- **US1 (P1)**: inicia apos a fundacao; entrega o MVP e persiste goalId para as demais historias.
- **US2 (P2)**: inicia apos a fundacao; usa goalId persistido para carregar objetivo via `GET /goals/{goalId}`.
- **US3 (P3)**: inicia apos a fundacao; usa goalId para submeter progresso via `POST /goals/{goalId}/progress`.
- **US4 (P4)**: inicia apos a fundacao; usa goalId para consultar historico via `GET /goals/{goalId}/progress` e tendencias via `GET /goals/{goalId}/trends`.
- **US5 (P5)**: inicia apos a fundacao; usa goalId para buscar planos via `GET /goals/{goalId}/training-plan` e `GET /goals/{goalId}/diet-plan`.

### Within Each User Story

- Testes devem ser escritos antes da implementacao principal.
- Funcoes de API e estado antes de composicao das telas.
- Componentes base antes de integracao final da pagina.
- Cada historia deve ficar validavel de forma isolada ao fim da fase.

### Parallel Opportunities

- Tarefas marcadas com `[P]` podem rodar em paralelo.
- Componentes independentes dentro da mesma historia podem ser desenvolvidos em paralelo.
- Apos a fundacao, US2-US5 podem ser divididas por pessoas diferentes, desde que US1 entregue a jornada base primeiro para validacao do MVP.

### Foundation Internal Dependencies

- T011 (API client) → T013 (session storage) → T014 (auth store) → T015 (guards/bootstrap) → T019 (providers) → T021 (authenticated layout)
- T012, T016, T017, T018 podem rodar em paralelo com qualquer tarefa.
- T020 (public layout) e tarefas T022-T024 podem rodar em paralelo apos T001.

---

## Parallel Example: User Story 1

```bash
# Testes paralelos da jornada inicial
Task: "Add auth form component tests in frontend/tests/unit/auth-forms.test.tsx"
Task: "Add onboarding flow component tests in frontend/tests/unit/onboarding-flow.test.tsx"
Task: "Add onboarding integration tests in frontend/tests/integration/onboarding-journey.test.tsx"
Task: "Add Playwright MVP journey test in frontend/tests/e2e/onboarding.spec.ts"

# API modules paralelos (arquivos independentes)
Task: "Implement auth API functions in frontend/lib/api/auth.ts"
Task: "Implement user profile API function in frontend/lib/api/users.ts"
Task: "Implement measurement API function in frontend/lib/api/measurements.ts"
Task: "Implement goal API functions in frontend/lib/api/goals.ts"

# Componentes de UI paralelos
Task: "Create login form in frontend/components/domain/auth/login-form.tsx"
Task: "Create registration form in frontend/components/domain/auth/register-form.tsx"
Task: "Create onboarding profile step in frontend/components/domain/onboarding/profile-step.tsx"
Task: "Create onboarding measurement step in frontend/components/domain/onboarding/measurement-step.tsx"
Task: "Create onboarding goal step in frontend/components/domain/onboarding/goal-step.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Phase 1.
2. Completar Phase 2.
3. Completar Phase 3 (US1).
4. Validar a jornada completa de onboarding e primeiro objetivo.
5. Demonstrar o MVP web antes de expandir para as demais areas.

### Incremental Delivery

1. Setup + Foundation.
2. US1 para habilitar a jornada principal.
3. US2 para retorno recorrente ao produto.
4. US3 para captura de progresso.
5. US4 para leitura de historico e tendencia.
6. US5 para planos e recomendacoes.
7. Polish final para web/mobile.

### Suggested MVP Scope

- **MVP recomendado**: US1 apenas.
- **Primeiro incremento util apos MVP**: US2.
- **Entrega de acompanhamento completo**: US3 + US4.
- **Valor complementar**: US5.

---

## Changes from Previous Version

### Problemas Corrigidos

1. **Endpoint `GET /goals` inexistente no backend**: adicionado alerta e estrategia de workaround com persistencia local de goalId. Tarefa T090 inclui atualizacao do contrato.
2. **Token refresh ausente da fundacao**: T011 agora exige explicitamente token refresh automatico, injecao de auth header e normalizacao de erros RFC 7807. Removida duplicacao com Polish.
3. **Logout ausente (FR-017)**: adicionados T016 (acao de logout) na fundacao e T084 (pagina de settings com logout) no polish.
4. **Modulo `onboarding.ts` sem correspondencia no backend**: substituido por `measurements.ts` (T032) e `users.ts` (T031), mapeando diretamente os endpoints reais `POST /measurements` e `GET /users/me`.
5. **Marcadores [P] incorretos na Phase 2**: removidos de tarefas com dependencias implicitas (providers depende de auth store, layouts dependem de providers). Cadeia de dependencias documentada explicitamente.
6. **Testes agrupados demais**: T021 original (2 arquivos de teste) dividido em T026 e T027. T054 original dividido em T065 e T066. Cada tarefa agora mapeia um escopo testavel distinto.
7. **Diretorio `validators/` do plan.md ignorado**: adicionado T018 para criar helpers de validacao client-side.
8. **Rota `settings/` do plan.md ignorada**: adicionada T084 para pagina de settings com logout.
9. **Dependencias entre user stories imprecisas**: secao de dependencias agora documenta explicitamente qual endpoint cada US precisa e como o goalId flui entre as historias.
10. **Dependencias internas da Phase 2 opacas**: adicionada subsecao "Foundation Internal Dependencies" com a cadeia T011→T013→T014→T015→T019→T021.

---

## Notes

- Todas as tarefas seguem o formato `- [ ] T### [P?] [US?] Description with file path`.
- Os caminhos foram definidos para a estrutura `frontend/` descrita em `plan.md`.
- Os testes foram incluidos por exigencia da constituicao do repositorio e pelo plano do feature.
- Rota group `(app)` usada para area autenticada (Next.js convention). Equivale a `(auth)` mencionada no plan.md.
- O API client (T011) ja inclui token refresh e error handling como obrigacao, nao como polish.
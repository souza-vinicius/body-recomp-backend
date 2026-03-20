# Data Model: Frontend da Aplicacao de Recomp Corporal

**Feature**: Frontend da Aplicacao de Recomp Corporal  
**Date**: 2026-03-15  
**Status**: Draft

## Overview

Este documento descreve os principais modelos de dados e estados de interface necessarios para o frontend da aplicacao, com foco em sessao, onboarding, painel, progresso e planos.

---

## 1. UserSession

**Purpose**: Representar o estado autenticado da pessoa usuaria no frontend.

**Fields**:
- `userId`: identificador do usuario autenticado
- `email`: identificador de acesso exibivel quando necessario
- `isAuthenticated`: indica se a area protegida pode ser acessada
- `sessionStatus`: estado atual da sessao (`active`, `expired`, `refreshing`, `signed_out`)
- `lastValidatedAt`: referencia para controle de validade percebida da sessao

**Validation Rules**:
- Nao pode existir sessao autenticada sem `userId`
- `sessionStatus=active` exige `isAuthenticated=true`
- `sessionStatus=signed_out` exige limpeza do contexto autenticado

**State Transitions**:
- `signed_out -> active`: login ou cadastro bem-sucedido
- `active -> refreshing`: renovacao em andamento
- `refreshing -> active`: renovacao concluida
- `active -> expired`: sessao perdeu validade
- `expired -> signed_out`: reautenticacao nao concluida

---

## 2. OnboardingProfile

**Purpose**: Representar os dados coletados nas etapas iniciais para iniciar a jornada.

**Fields**:
- `fullName`
- `dateOfBirth`
- `gender`
- `heightCm`
- `activityLevel`
- `preferredCalculationMethod`
- `stepStatus`: progresso da jornada inicial

**Validation Rules**:
- Campos obrigatorios precisam estar completos antes da etapa seguinte
- O metodo de calculo escolhido determina quais orientacoes e entradas adicionais serao exibidas
- Alteracoes incompletas devem permanecer como rascunho recuperavel ate conclusao ou descarte

---

## 3. MeasurementEntry

**Purpose**: Representar uma medicao corporal submetida ou carregada para exibicao no frontend.

**Fields**:
- `measurementId`
- `measuredAt`
- `weightKg`
- `calculationMethod`
- `bodyFatPercentage`
- `inputValues`: conjunto de medidas exigidas para o metodo selecionado
- `submissionStatus`: (`idle`, `editing`, `submitting`, `saved`, `failed`)

**Validation Rules**:
- Os campos exibidos devem acompanhar o metodo de calculo ativo
- `saved` exige `measurementId` e `bodyFatPercentage`
- Erros recuperaveis nao devem descartar `inputValues`

---

## 4. ActiveGoalView

**Purpose**: Representar o objetivo atual apresentado no painel e em telas relacionadas.

**Fields**:
- `goalId`
- `goalType`
- `status`
- `currentBodyFatPercentage`
- `targetBodyFatPercentage`
- `ceilingBodyFatPercentage`
- `targetCalories`
- `estimatedWeeksToGoal`
- `isOnTrack`
- `primaryCallToAction`

**Validation Rules**:
- Deve haver no maximo um objetivo ativo em exibicao principal por sessao
- `goalType=cutting` utiliza alvo de reducao
- `goalType=bulking` utiliza teto de acompanhamento

---

## 5. ProgressHistoryView

**Purpose**: Representar o conjunto de registros de progresso e seus agregados para historico e tendencias.

**Fields**:
- `goalId`
- `entries`: lista cronologica de registros
- `trendStatus`: (`improving`, `plateau`, `worsening`, `insufficient_data`)
- `progressPercentage`
- `weeklyBodyFatChangeAverage`
- `weeklyWeightChangeAverage`
- `alerts`

**Validation Rules**:
- Entradas devem ser exibidas em ordem cronologica consistente
- `trendStatus=insufficient_data` exige mensagem explicativa na interface
- Alertas devem manter associacao com o contexto do registro ou do objetivo

---

## 6. GuidancePlanView

**Purpose**: Representar os dados de plano de treino e dieta apresentados ao usuario.

**Fields**:
- `goalId`
- `trainingPlanSummary`
- `dietPlanSummary`
- `macroTargets`
- `guidelines`
- `lastUpdatedAt`

**Validation Rules**:
- Deve refletir o objetivo ativo atual
- Se nao houver plano disponivel, a interface precisa explicitar estado vazio ou indisponivel
- Conteudo de treino e dieta deve permanecer visualmente separado

---

## Relationships

- `UserSession` controla acesso a `OnboardingProfile`, `ActiveGoalView`, `ProgressHistoryView` e `GuidancePlanView`
- `OnboardingProfile` precede a criacao de `MeasurementEntry` inicial
- `MeasurementEntry` inicial alimenta `ActiveGoalView`
- `ActiveGoalView` referencia `ProgressHistoryView` e `GuidancePlanView`

---

## UI State Considerations

- Todos os modelos visiveis precisam suportar estados `loading`, `empty`, `ready` e `error`
- Formularios precisam manter rascunho local em erros recuperaveis
- Alertas de autenticacao expirada devem poder interromper qualquer modelo de tela sem corromper seus dados locais

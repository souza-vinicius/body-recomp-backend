# Research: Frontend da Aplicacao de Recomp Corporal

**Feature**: Frontend da Aplicacao de Recomp Corporal  
**Date**: 2026-03-15  
**Status**: Complete

## Overview

Este documento registra as decisoes tecnicas para implementar o frontend web/mobile da aplicacao de recomp corporal, reutilizando a API backend ja existente e priorizando uma experiencia clara para cadastro, jornada inicial, progresso e planos.

---

## 1. Estrutura do Frontend

### Decision: Usar Next.js 14 com App Router como aplicacao principal e organizar a experiencia por areas autenticadas e publicas

**Rationale**:
- Next.js 14 oferece uma base madura para rotas, layouts, carregamento incremental e separacao entre areas publicas e autenticadas.
- App Router favorece fluxos guiados e organizacao por segmentos de navegacao, importante para onboarding, dashboard e historico.
- A mesma base atende web e serve como origem para empacotamento mobile com Capacitor.

**Alternatives Considered**:
- Pages Router: menos alinhado ao modelo atual do framework e menos ergonomico para layouts aninhados.
- SPA pura sem estrutura de framework: exigiria mais decisoes manuais para roteamento, carga inicial e convencoes.

**Implementation Notes**:
- Separar rotas em areas publicas, autenticadas e setup inicial.
- Priorizar layouts persistentes para dashboard e navegacao principal.
- Usar componentes de interface compartilhados entre web e shell mobile.

---

## 2. Estrategia de Integracao com Backend

### Decision: Consumir diretamente a API REST existente do backend e modelar uma camada unica de cliente HTTP tipado no frontend

**Rationale**:
- O backend ja possui contratos REST, autenticacao e regras de negocio implementadas.
- Uma camada central de integracao reduz duplicacao e padroniza tratamento de erro, autenticacao e transformacao de respostas.
- Mantem o frontend como consumidor puro, sem criar backend adicional desnecessario.

**Alternatives Considered**:
- Criar BFF dedicado: adicionaria manutencao e latencia sem necessidade demonstrada no escopo atual.
- Consumir endpoints dispersamente dentro de componentes: aumenta acoplamento e dificulta testes.

**Implementation Notes**:
- Centralizar headers, expiracao de sessao e parse de erros.
- Padronizar retorno de estados: sucesso, vazio, erro, autenticacao expirada.
- Mapear explicitamente os endpoints necessarios para cada jornada principal.

---

## 3. Autenticacao e Persistencia de Sessao

### Decision: Tratar autenticacao no frontend com fluxo de login/cadastro, guarda de rotas autenticadas e persistencia minima de sessao em armazenamento local seguro

**Rationale**:
- A pessoa usuaria precisa reabrir a aplicacao e continuar a jornada com o menor atrito possivel.
- A navegacao protegida precisa ser consistente em web e mobile.
- A interface deve responder de forma previsivel a expiracao de sessao, principalmente em formularios longos.

**Alternatives Considered**:
- Sessao mantida apenas em memoria: degrada a experiencia em recargas ou reabertura do app.
- Persistir dados sensiveis em excesso no cliente: aumenta risco sem necessidade.

**Implementation Notes**:
- Guardar apenas o minimo necessario para restaurar sessao e contexto.
- Redirecionar a pessoa usuaria para reautenticacao quando necessario.
- Preservar rascunhos recuperaveis durante expiracao de sessao quando possivel.

---

## 4. Formularios e Validacao de Jornada

### Decision: Modelar formularios orientados por etapa com validacao imediata e preservacao de dados preenchidos em erros recuperaveis

**Rationale**:
- O onboarding inclui dados pessoais, medidas e configuracao inicial, o que pode gerar abandono se a experiencia for brusca.
- Validacao em contexto reduz retrabalho e evita mensagens genericas demais.
- Preservar o preenchimento melhora a taxa de conclusao quando ocorrer erro de rede ou validacao.

**Alternatives Considered**:
- Formularios unicos extensos: aumentam carga cognitiva e taxa de abandono.
- Validar apenas no envio final: gera correcoes tardias e frustracao.

**Implementation Notes**:
- Quebrar a jornada inicial em blocos coerentes.
- Exibir ajuda contextual para medidas e metodos de calculo.
- Garantir mensagens acionaveis e associadas ao campo correto.

---

## 5. Visualizacao de Progresso e Tendencias

### Decision: Exibir progresso com cards de resumo, historico cronologico e grafico de tendencia simples orientado a leitura rapida

**Rationale**:
- O usuario precisa entender seu progresso sem interpretar dados brutos.
- Cards e graficos simples comunicam rapidamente status atual, tendencia e proximidade da meta.
- A experiencia deve funcionar bem tanto em telas pequenas quanto grandes.

**Alternatives Considered**:
- Dashboards densos com muitos modulos: maior risco de sobrecarga visual.
- Apenas tabela textual: dificulta leitura de tendencia e engajamento.

**Implementation Notes**:
- Destacar status, variacao recente e tendencia geral.
- Suportar estados com poucos dados sem mostrar inferencias fracas.
- Garantir legibilidade em mobile sem exigir zoom.

---

## 6. Estilo Visual e Sistema de Interface

### Decision: Utilizar TailwindCSS para um sistema visual consistente, com componentes reutilizaveis e estados padronizados de feedback

**Rationale**:
- TailwindCSS acelera consistencia visual e facilita composicao responsiva.
- A aplicacao precisa de estados claros de carregamento, vazio, sucesso e erro em muitas telas.
- Componentes reutilizaveis reduzem divergencia entre web e mobile.

**Alternatives Considered**:
- CSS ad hoc por pagina: aumenta inconsistencias e manutencao.
- UI kit pesado externo: pode impor visual genérico e acoplamentos desnecessarios.

**Implementation Notes**:
- Definir tokens visuais para espacamento, cores, tipografia e feedback.
- Criar componentes base de formulario, navegacao e indicadores.
- Garantir contraste e acessibilidade visual adequados.

---

## 7. Experiencia Mobile com Capacitor

### Decision: Tratar Capacitor como casca de distribuicao mobile da mesma aplicacao Next.js, priorizando compatibilidade de navegacao, formularios e sessao

**Rationale**:
- O usuario explicitou necessidade de compilacao para dispositivos moveis.
- Reutilizar a mesma aplicacao reduz duplicacao e acelera entrega.
- O escopo atual nao justifica manter um aplicativo mobile separado.

**Alternatives Considered**:
- Aplicativo React Native independente: maior custo de manutencao com escopo ainda inicial.
- Apenas web responsiva sem empacotamento mobile: nao atende o requisito de distribuicao via Capacitor.

**Implementation Notes**:
- Garantir areas clicaveis confortaveis e formularios amigaveis ao touch.
- Validar comportamento de retorno, abertura inicial e restauracao de sessao.
- Evitar dependencias que assumam apenas ambiente de navegador desktop.

---

## 8. Estrategia de Testes do Frontend

### Decision: Adotar testes por tres camadas: unidade para componentes/estado, integracao para jornadas e E2E para fluxos principais

**Rationale**:
- A feature possui forte foco em jornada e estados de interface.
- Testes unitarios isolam componentes e regras de apresentacao.
- Testes E2E confirmam integracao entre autenticacao, formularios e dados vindos do backend.

**Alternatives Considered**:
- Apenas E2E: cobertura lenta e diagnostico mais dificil.
- Apenas testes de componente: nao garante confianca na jornada completa.

**Implementation Notes**:
- Cobrir P1 e P2 primeiro na fase de tarefas.
- Tratar respostas simuladas e integradas conforme o tipo de teste.
- Validar tambem estados de erro e expiracao de sessao.

---

## Summary of Key Technologies

| Category | Technology | Justification |
|----------|-----------|---------------|
| Framework | Next.js 14.1.0 | Base principal da aplicacao web e roteamento por App Router |
| UI Runtime | React 18.2.0 | Composicao de interface e estado interativo |
| Language | TypeScript 5.3.3 | Tipagem estatica para contratos e componentes |
| Styling | TailwindCSS 3.4.1 | Sistema visual consistente e responsivo |
| Mobile Shell | Capacitor | Empacotamento da mesma aplicacao para dispositivos moveis |
| Testing | Vitest + React Testing Library + Playwright | Cobertura de unidade, integracao e fluxos E2E |

---

**Research Status**: ✅ Complete - todas as decisoes principais foram resolvidas para prosseguir ao design.

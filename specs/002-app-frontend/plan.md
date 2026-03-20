# Implementation Plan: Frontend da Aplicacao de Recomp Corporal

**Branch**: `002-app-frontend` | **Date**: 2026-03-15 | **Spec**: [/Users/vinicius/code/body-recomp-backend/specs/002-app-frontend/spec.md](/Users/vinicius/code/body-recomp-backend/specs/002-app-frontend/spec.md)
**Input**: Feature specification from `/specs/002-app-frontend/spec.md`

## Summary

Implementar a experiencia de frontend da aplicacao de recomp corporal como uma interface web principal e casca mobile reutilizavel, permitindo cadastro, autenticacao, configuracao inicial, acompanhamento de objetivos, registro de progresso e visualizacao de planos sobre a API backend ja existente.

## Technical Context

**Language/Version**: TypeScript 5.3.3  
**Primary Dependencies**: Next.js 14.1.0, React 18.2.0, React DOM 18.2.0, TailwindCSS 3.4.1, Capacitor  
**Storage**: Backend API existente para dados de negocio + armazenamento local seguro para estado de sessao e preferencias de dispositivo  
**Testing**: Vitest, React Testing Library, Playwright  
**Target Platform**: Navegadores modernos em desktop/mobile + shell mobile via Capacitor
**Project Type**: Web application com empacotamento mobile  
**Performance Goals**: primeira tela autenticada visivel em ate 2 segundos em conexoes comuns, navegacao perceptivelmente fluida e interacoes principais sem travamentos visiveis  
**Constraints**: reutilizar a API backend existente, manter consistencia entre web e mobile, suportar estados de erro/carregamento/vazio, preservar fluxo principal sem depender de teclado fisico ou tela grande  
**Scale/Scope**: frontend de produto para 5 jornadas principais, aproximadamente 15-25 telas/estados relevantes e experiencia para milhares de usuarios autenticados

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. API-First Design ✅ PASS
- [x] O frontend consumira contratos de API existentes e mantera alinhamento com OpenAPI.
- [x] A experiencia sera planejada a partir dos recursos REST ja definidos no backend.
- [x] Estados de erro e respostas esperadas serao refletidos nos contratos do feature.

**Status**: Passa, pois a feature depende explicitamente dos contratos REST existentes e inclui contrato de integracao frontend-backend.

### II. Specification-Driven Development ✅ PASS
- [x] O feature possui especificacao com user stories priorizadas.
- [x] Requisitos funcionais e criterios de sucesso estao explicitados.
- [x] O plano tecnico sera documentado antes de implementacao.

**Status**: Passa sem ressalvas.

### III. Test-First Development ✅ PASS
- [x] O planejamento inclui testes de componente, fluxos e validacao end-to-end.
- [x] As jornadas principais podem ser verificadas antes da implementacao final.

**Status**: Passa, desde que a fase de tarefas preserve a ordem de testes antes da implementacao.

### IV. Data Privacy & Security First ✅ PASS
- [x] A autenticacao continua obrigatoria para dados protegidos.
- [x] O frontend respeitara isolamento por sessao do usuario autenticado.
- [x] Segredos permanecem fora do cliente e nao serao embarcados na interface.

**Status**: Passa; o frontend apenas consome autenticacao do backend e nao introduz armazenamento sensivel adicional fora do necessario para sessao.

### V. Simplicity & Maintainability ✅ PASS
- [x] A stack foi fornecida explicitamente pelo usuario e e aderente ao caso de uso.
- [x] A experiencia web e mobile partilhara a maior parte da base de interface.
- [x] O plano evita criar uma nova camada de backend ou duplicar logica de negocio.

**Status**: Passa; nenhuma violacao justificada e necessaria.

**Overall Gate Status**: ✅ **PASS**

## Phase 0: Research

**Output**: [/Users/vinicius/code/body-recomp-backend/specs/002-app-frontend/research.md](/Users/vinicius/code/body-recomp-backend/specs/002-app-frontend/research.md)

**Research Focus**:
- Estrutura de aplicacao Next.js 14 para o produto
- Estrategia de navegacao e protecao de areas autenticadas
- Integracao com a API backend existente
- Form state, feedback visual e resiliencia de erros
- Adaptacao da experiencia para Capacitor
- Estrategia de testes web/mobile

## Phase 1: Design & Contracts

**Outputs**:
- [/Users/vinicius/code/body-recomp-backend/specs/002-app-frontend/data-model.md](/Users/vinicius/code/body-recomp-backend/specs/002-app-frontend/data-model.md)
- [/Users/vinicius/code/body-recomp-backend/specs/002-app-frontend/contracts/frontend-backend.yaml](/Users/vinicius/code/body-recomp-backend/specs/002-app-frontend/contracts/frontend-backend.yaml)
- [/Users/vinicius/code/body-recomp-backend/specs/002-app-frontend/quickstart.md](/Users/vinicius/code/body-recomp-backend/specs/002-app-frontend/quickstart.md)

**Design Goals**:
- Modelar estados de interface, sessao e jornadas principais
- Definir os contratos que o frontend precisa consumir do backend
- Registrar cenarios de validacao manual e funcional das jornadas

## Post-Phase 1 Constitution Re-Check

### I. API-First Design ✅ PASS
- [x] Contratos de integracao documentados para os fluxos do frontend.
- [x] Estados esperados de sucesso, validacao, autenticacao e erro mapeados.

### II. Specification-Driven Development ✅ PASS
- [x] Especificacao, pesquisa, modelo e quickstart alinhados entre si.

### III. Test-First Development ✅ PASS
- [x] Jornadas P1-P5 descritas de forma testavel.
- [x] Quickstart preparado para orientar validacao funcional.

### IV. Data Privacy & Security First ✅ PASS
- [x] Sessao, expiracao e isolamento do usuario contemplados no design.

### V. Simplicity & Maintainability ✅ PASS
- [x] Estrutura unica de frontend com compartilhamento web/mobile.
- [x] Sem camadas desnecessarias alem de UI, estado e integracao.

**Final Gate Status**: ✅ **PASS**

## Project Structure

### Documentation (this feature)

```text
specs/002-app-frontend/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── frontend-backend.yaml
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
tests/
frontend/
├── app/
│   ├── (public)/
│   ├── (auth)/
│   ├── dashboard/
│   ├── progress/
│   ├── plans/
│   └── settings/
├── components/
│   ├── layout/
│   ├── forms/
│   ├── feedback/
│   ├── charts/
│   └── domain/
├── lib/
│   ├── api/
│   ├── auth/
│   ├── state/
│   ├── validators/
│   └── utils/
├── styles/
├── public/
├── capacitor/
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

**Structure Decision**: adicionar um novo workspace de frontend em `frontend/`, mantendo o backend atual intacto em `src/` e `tests/`. A base web e mobile compartilhara a maior parte dos componentes, navegacao e integracao com API, enquanto Capacitor atuara como casca de distribuicao mobile.

## Complexity Tracking

Nenhuma violacao de constituicao identificada.


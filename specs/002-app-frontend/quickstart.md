# Quickstart: Frontend da Aplicacao de Recomp Corporal

**Feature**: Frontend da Aplicacao de Recomp Corporal  
**Date**: 2026-03-15

## Objective

Validar rapidamente se a experiencia principal do frontend cobre cadastro, autenticacao, configuracao inicial, dashboard, progresso, historico e planos sobre a API existente.

## Preconditions

1. Backend em execucao e acessivel localmente.
2. Endpoints de autenticacao, medicao, objetivos, progresso e planos disponiveis.
3. Aplicacao frontend em execucao em ambiente web.
4. Quando aplicavel, shell mobile via Capacitor compilada e iniciando corretamente.

## Primary Validation Flow (P1)

1. Abrir a aplicacao em estado deslogado.
2. Criar conta com dados validos.
3. Confirmar redirecionamento para a area autenticada ou para setup inicial.
4. Preencher dados basicos e escolher metodo de calculo.
5. Registrar medicao inicial.
6. Verificar exibicao do percentual de gordura calculado.
7. Criar um objetivo de cutting ou bulking.
8. Confirmar exibicao do objetivo ativo no painel principal.

## Dashboard Validation (P2)

1. Entrar com uma conta que possua objetivo ativo.
2. Confirmar que o painel mostra status, alvo, dados atuais e proximas acoes.
3. Validar comportamento alternativo para conta sem objetivo ativo.
4. Validar estados de carregamento e vazio do painel.

## Weekly Progress Validation (P3)

1. Abrir a acao de registrar progresso.
2. Inserir nova medicao valida.
3. Confirmar mensagem de sucesso e atualizacao visual no painel.
4. Tentar registrar progresso em condicao invalidada pela regra temporal.
5. Confirmar mensagem clara sem perda do preenchimento relevante.

## History and Trends Validation (P4)

1. Acessar tela de historico com multiplos registros.
2. Confirmar ordem cronologica e legibilidade dos registros.
3. Abrir visao de tendencia e validar status geral.
4. Repetir com conta que tenha dados insuficientes e validar mensagem apropriada.

## Plans Validation (P5)

1. Abrir plano de treino de uma conta com objetivo ativo.
2. Confirmar orientacoes coerentes com o objetivo atual.
3. Abrir plano alimentar.
4. Confirmar exibicao de metas nutricionais e separacao visual adequada.

## Error and Recovery Checks

1. Simular credenciais invalidas no login.
2. Simular expiracao de sessao durante uma acao autenticada.
3. Simular falha temporaria de rede em tela de formulario.
4. Confirmar mensagens acionaveis e preservacao de dados onde aplicavel.

## Mobile Checks

1. Abrir a aplicacao empacotada com Capacitor.
2. Validar navegacao principal por toque.
3. Confirmar legibilidade das telas chave em viewport reduzida.
4. Validar retorno para o dashboard apos reabertura do app quando a sessao ainda for valida.

## Success Signal

A feature e considerada pronta para a fase de tarefas quando todas as jornadas acima puderem ser traduzidas em testes e tarefas implementaveis sem ambiguidades adicionais.
## Setup Instructions

1. `npm install` no diretório `frontend`
2. `npm run dev` para rodar na porta 3000
3. `npm run build` e `npx cap sync` para gerar o shell mobile


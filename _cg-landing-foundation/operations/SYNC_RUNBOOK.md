# SYNC_RUNBOOK

## Objetivo
Padronizar execução manual e agendada do processo de sync na landing.

## Pré-condições
- Dependências instaladas (`npm install --legacy-peer-deps`).
- Variáveis de ambiente configuradas conforme `ENV_MATRIX.md`.
- Contrato `ApiPayloadV1` vigente.

## Fluxo de sync (padrão)
1. Coletar dados da origem configurada.
2. Normalizar para `MeetingNormalized`.
3. Deduplicar por chave determinística.
4. Publicar payload V1 para consumo do front.
5. Atualizar metadados de sincronização (`lastSyncAt`, `sourceStatus`).

## Execução manual (local)
1. Iniciar a aplicação (`npm run dev`).
2. Disparar o mecanismo manual de sync (script/rota interna quando implementado).
3. Consultar endpoint de consumo e validar:
- `version=v1`
- `serverTime` válido
- arrays presentes
- `sourceStatus` coerente

## Evidências mínimas por execução
- Timestamp de início e fim.
- Resultado: sucesso ou falha.
- Contagem de registros processados.
- Motivo da falha sanitizado (quando houver).

## Operação agendada
- O agendamento é externo ao processo web (cron/scheduler de ambiente).
- Frequência por ambiente definida em `ENV_MATRIX.md`.
- Em falha, manter fallback para último snapshot válido.

## Critérios de sucesso operacional
- Pelo menos 1 sync bem-sucedido na janela esperada.
- Nenhuma quebra do contrato V1 após sync.
- Fallback funcionando quando origem indisponível.

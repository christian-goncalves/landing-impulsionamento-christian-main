# SYNC_RUNBOOK

## Objetivo
Padronizar execução manual e agendada do processo de sync na landing.

## Procedimento mínimo
1. Executar sync manual em ambiente local.
2. Validar atualização de `lastSyncAt`.
3. Validar consistência do payload V1.
4. Registrar falha/sucesso com timestamp.

## Operação contínua
- Agendamento periódico conforme ambiente.
- Reprocessamento controlado em caso de falhas transitórias.

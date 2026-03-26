# PHASE_03_STORAGE_FALLBACK

## Meta
Definir persistência lógica e fallback resiliente para manter continuidade de dados no frontend em caso de falha de ingestão.

## Estado da fase
- Status: **DONE**
- Data de referência: 2026-03-26

## Escopo da fase
1. Definir estrutura de snapshot do último dado válido.
2. Definir política de staleness e transição de status.
3. Definir comportamento de recuperação pós-incidente.
4. Definir sinalização operacional para o frontend (`ok|fallback|stale`).

## Modelo de persistência lógica (sem mudança de stack)
- `current_payload`: payload mais recente válido para consumo.
- `last_valid_snapshot`: payload anterior confiável para contingência.
- `sync_meta`: metadados de operação (`lastSyncAt`, `lastSuccessAt`, `lastFailureAt`, `failureReason`).

## Política de fallback
1. Sync bem-sucedido:
- Atualiza `current_payload`.
- Atualiza `last_valid_snapshot`.
- Define `sourceStatus=ok`.

2. Sync com falha:
- Mantém `last_valid_snapshot` como fonte de resposta.
- Define `sourceStatus=fallback`.
- Registra falha sanitizada em `sync_meta`.

3. Falha prolongada:
- Ao exceder `MEETINGS_STALE_THRESHOLD_MINUTES`, elevar para `sourceStatus=stale`.
- Resposta deve manter contrato V1 íntegro.

## Critérios de entrada
- Fase 02 com ingestão/runbook/matriz de ambiente definidos.
- Contrato V1 fechado.

## Entregáveis da fase
- Política de contingência em `operations/INCIDENT_FALLBACK.md`.
- Regras de storage/fallback documentadas.

## Critérios de saída
- Regras de fallback e stale sem ambiguidade.
- Procedimento de recuperação pós-incidente definido.
- Sinalização de status para frontend padronizada.

## Checklist técnico
- [x] Modelo lógico de snapshot definido.
- [x] Política `ok|fallback|stale` definida.
- [x] Recovery flow documentado.
- [x] Critérios de stale parametrizados por ambiente.

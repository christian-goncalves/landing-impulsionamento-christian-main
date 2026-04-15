# VERCEL_DEPLOY_RUNBOOK

## Objetivo
Padronizar deploy da landing na Vercel com preview por PR, producao por merge em `master` e sync agendado.

## Projeto alvo
- Team: `team_gDRTtDILR5B5IHZMUDhhTsvb`
- Projeto: `landing-impulsionamento-christian-main`
- Repositorio: `christian-goncalves/landing-impulsionamento-christian-main`

## Configuracao de ambiente
Configurar em `Preview` e `Production`:
- `SYNC_CRON_SECRET`
- `CRON_SECRET` (usar o mesmo valor de `SYNC_CRON_SECRET` para o Vercel Cron enviar o bearer automaticamente)
- `MEETINGS_STALE_THRESHOLD_MINUTES`
- `MEETINGS_SYNC_INTERVAL_MINUTES`
- `MEETINGS_ENABLE_LEGACY_JSON_FALLBACK`
- `NEXT_PUBLIC_GA4_MEASUREMENT_ID` (quando aplicavel)

Recomendacao de producao:
- `MEETINGS_STALE_THRESHOLD_MINUTES=180`
- `MEETINGS_SYNC_INTERVAL_MINUTES=10`
- `MEETINGS_ENABLE_LEGACY_JSON_FALLBACK=false`

## Scheduler
- Arquivo: `vercel.json`
- Cron: `*/10 * * * *`
- Endpoint: `POST /api/sync/manual`

## Validacao pos-deploy
1. Abrir deployment de preview e validar `GET /api/reunioes-virtuais`.
2. Verificar retorno com `version=v1` e `sourceStatus` valido.
3. Testar seguranca:
- sem `Authorization` -> `401`
- `Authorization` invalido -> `401`
- `Authorization: Bearer <SYNC_CRON_SECRET>` -> `200`
4. Em producao, confirmar execucao do cron em logs e atualizacao de `lastSyncAt`.

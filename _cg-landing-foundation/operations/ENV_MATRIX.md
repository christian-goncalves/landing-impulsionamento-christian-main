# ENV_MATRIX

## Regra global
Diferenças de configuração não podem alterar o contrato `ApiPayloadV1`.

## Variáveis operacionais propostas
- `MEETINGS_SOURCE_URL`
- `MEETINGS_SYNC_TIMEOUT_MS`
- `MEETINGS_SYNC_RETRIES`
- `MEETINGS_SYNC_INTERVAL_MINUTES`
- `MEETINGS_STALE_THRESHOLD_MINUTES`
- `MEETINGS_TIMEZONE` (default `America/Sao_Paulo`)

## Local
- Fonte: ambiente de teste/controlado.
- Intervalo de sync: 10 min (default local).
- Stale threshold: 180 min.
- Observabilidade: logs de console + validação manual de endpoint.

## Homologação
- Fonte: URL homologada estável.
- Intervalo de sync: 10 min.
- Stale threshold: 180 min.
- Observabilidade: logs estruturados + monitoramento de falha consecutiva.

## Produção
- Fonte: URL oficial aprovada.
- Intervalo de sync: 5 a 10 min (conforme capacidade do ambiente).
- Stale threshold: 120 a 180 min.
- Observabilidade: alerta por ausência de sync bem-sucedido e por falha recorrente.

## Política de defaults
- Na ausência de variável explícita, aplicar defaults seguros.
- Defaults não podem reduzir cobertura de fallback/contingência.

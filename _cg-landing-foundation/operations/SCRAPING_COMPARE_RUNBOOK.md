# SCRAPING_COMPARE_RUNBOOK

## Objetivo
Comparar origem HTML (scraping), dataset normalizado e payload operacional para explicar ausências de grupos no frontend.

## Endpoint
- `GET /api/diagnostics/scraping-compare`

## Parâmetros opcionais
- `q`: nome do grupo (comparação sem acento e case-insensitive).
- `day`: dia da semana `0..6` (`0=Dom`).
- `hour`: horário `HH:mm`.
- `tz`: timezone (default `America/Sao_Paulo`).

## Exemplos
- `GET /api/diagnostics/scraping-compare?q=fenix`
- `GET /api/diagnostics/scraping-compare?q=fênix`
- `GET /api/diagnostics/scraping-compare?q=fenix&day=0&hour=14:00`

## Como interpretar `missing_reasons`
- `outside_time_window`: grupo existe no scraping, mas está fora da janela de reuniões do momento.
- `deduplicated`: múltiplas linhas da origem foram consolidadas.
- `parse_discarded`: entradas do grupo foram descartadas no parse (ex.: horário inválido/ausente).
- `not_found_in_source`: grupo não foi encontrado na origem HTML nesta execução.

## Checklist de verificação
- Confirmar `source_raw_summary.total_raw_sessions > 0`.
- Confirmar `normalized_summary.total_sessions > 0`.
- Confirmar `normalized_summary.total_sessions >= payload_window_summary.total_window_sessions`.
- Para busca de grupo, verificar `matches` e validar `missing_reasons` antes de concluir incidente.

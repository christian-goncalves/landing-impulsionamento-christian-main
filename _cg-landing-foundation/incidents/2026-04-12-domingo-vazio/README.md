# Incidente: Domingo Vazio

- Data: 2026-04-12
- Status: correção implementada em desenvolvimento, aguardando gate de promoção para produção.

## Contexto
No endpoint `GET /api/reunioes-virtuais`, sessões elegíveis aos domingos podiam não aparecer quando `dias_semana` vinha no padrão `0..6` (domingo = 0), porque o filtro operacional comparava o dia corrente no padrão `1..7` (domingo = 7).

## Impacto observado
- Listas (`emAndamento`, `iniciandoEmBreve`, `proximas`) indevidamente vazias em cenários de domingo com sessão elegível.
- Segunda a sábado seguiam aparentando normalidade.

## Escopo
- Inclui: normalização interna de dia da semana no filtro operacional `getMeetingsFromGroups`.
- Inclui: evidências reproduzíveis e checklist de validação.
- Não inclui: mudança de contrato `ApiPayloadV1` ou mudança de shape do endpoint público.

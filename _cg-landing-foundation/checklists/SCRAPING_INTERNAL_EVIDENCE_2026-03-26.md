# SCRAPING_INTERNAL_EVIDENCE_2026-03-26

## Escopo da rodada
- Fonte operacional: scraping interno da landing.
- Removida inferência de tipo por `formatos` no frontend.
- Regra canônica aplicada: `is_study=1 -> estudo`, senão `is_open=1 -> aberta`, senão `fechada`.

## Evidências técnicas
- `npm run lint`: concluído sem erros (warnings legados já existentes no projeto).
- `npm run build`: concluído com sucesso.
- `npx tsc --noEmit`: concluído com sucesso.

## Decisão operacional
- Status desta rodada: GO para validação funcional em ambiente local.

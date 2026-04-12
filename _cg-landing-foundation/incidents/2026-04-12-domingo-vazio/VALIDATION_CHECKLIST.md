# Validation Checklist - Gate de Promoção

## Gate técnico (dev)
- [x] Baseline pré-correção criado e tagueado (`pre-fix-sunday-empty-2026-04-12`).
- [x] Correção aplicada no filtro operacional (`getMeetingsFromGroups` via `lib/meetings-filter.ts`).
- [x] Domingo 19:00 com `dias_semana` em `0..6` não fica vazio indevidamente quando há sessão elegível.
- [x] Segunda 19:00 mantém comportamento esperado.
- [x] Sessão cruzando meia-noite (domingo→segunda) permanece correta.
- [x] Build de produção concluído sem erro.

## Gate de contrato
- [x] `GET /api/reunioes-virtuais` preserva shape:
  - `version`, `sourceStatus`, `lastSyncAt`, `emAndamento`, `iniciandoEmBreve`, `proximas`.
- [x] `sourceStatus` e `lastSyncAt` não sofreram alteração de lógica/shape nesta correção.

## Evidências anexadas
- [x] Contadores antes/depois para domingo (`beforeFix=0`, `afterFix=1`).
- [x] Contadores de segunda (`beforeFix=1`, `afterFix=1`).
- [x] Comandos e resultados documentados em `EVIDENCE.md`.

## Gate operacional para produção
- [ ] Comparar dev vs produção no endpoint real antes/depois do deploy.
- [ ] Registrar URL/endpoint efetivamente usado na comparação (se diferente do esperado).
- [ ] Registrar payloads de domingo e segunda coletados em produção.

## Critério de promoção
Somente promover para produção após todos os itens do bloco "Gate operacional para produção" serem marcados como concluídos com evidência explícita.

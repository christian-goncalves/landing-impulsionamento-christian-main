# Evidências Reproduzíveis

## Baseline pré-correção
- Commit baseline: `fcef5cc`
- Tag baseline: `pre-fix-sunday-empty-2026-04-12`
- Comando: `git show --no-patch --oneline pre-fix-sunday-empty-2026-04-12`
- Resultado:
  - `tag pre-fix-sunday-empty-2026-04-12`
  - `fcef5cc docs: baseline pre-fix for sunday empty incident`

## Evidência técnica do bug e da correção
- Comando:
  - `node --experimental-transform-types scripts/weekday-evidence.ts`
- Timestamp de geração do relatório:
  - `2026-04-12T23:24:22.048Z`
- Resultado (contadores):
  - `sundayLegacyEncoding.beforeFixActiveCount = 0`
  - `sundayLegacyEncoding.afterFixActiveCount = 1`
  - `sundayCanonicalEncoding.afterFixActiveCount = 1`
  - `mondayExpected.beforeFixActiveCount = 1`
  - `mondayExpected.afterFixActiveCount = 1`
  - `overnightSundayToMonday.afterFixActiveCount = 1`

## Evidência de validação funcional rápida
- Comando:
  - `node --experimental-transform-types scripts/weekday-filter-check.ts`
- Resultado:
  - `PASS weekday-filter-check`

## Evidência de integridade de build
- Comando:
  - `npm run build`
- Resultado:
  - build concluído com sucesso
  - rota `ƒ /api/reunioes-virtuais` presente

## Contrato de payload (sem alteração)
Chaves mantidas no payload público:
- `version`
- `serverTime`
- `lastSyncAt`
- `sourceStatus`
- `emAndamento`
- `iniciandoEmBreve`
- `proximas`

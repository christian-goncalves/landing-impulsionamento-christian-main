# Incidente: Divergencia AWS vs Vercel no endpoint de reunioes

- Data: 2026-04-15
- Status: diagnostico concluido
- Tipo: novo incidente operacional (nao e repeticao do "domingo vazio")

## Objetivo
Determinar se o comportamento "sem dados" observado em ambiente Vercel era repeticao do incidente de 2026-04-12 ou um problema diferente de consistencia de ambiente/URL.

## Referencias oficiais
- Incidente base: `_cg-landing-foundation/incidents/2026-04-12-domingo-vazio/RCA.md`
- Evidencias base: `_cg-landing-foundation/incidents/2026-04-12-domingo-vazio/EVIDENCE.md`

## Resultado resumido
Nao e o mesmo bug de domingo.

1. Regressao do bug de domingo permanece corrigida:
- `scripts/weekday-filter-check.ts`: PASS
- `scripts/weekday-evidence.ts`: `sundayLegacyEncoding.afterFixActiveCount = 1`

2. Divergencia atual e de ambiente/URL/contrato:
- Dominio final (`na.reuniaovirtual.online`) responde com contrato legado (sem `version`, sem `sourceStatus`).
- Vercel atual responde contrato `v1`.
- Deployment antigo da Vercel (`...1ybsijhty...`) responde `v1` com listas vazias (`sourceStatus=ok`), enquanto o deployment mais novo responde `v1` com dados (`sourceStatus=fallback`).

3. Runtime na Vercel confirma falha de scraping no bootstrap:
- Logs de producao mostram erro em `GET /api/reunioes-virtuais`: "Falha no bootstrap de scraping..."
- Mesmo assim o deployment novo entrega dados via fallback legado.

## Evidencias coletadas

### A) Regressao incidente 2026-04-12
- Comando: `node --experimental-transform-types scripts/weekday-filter-check.ts`
  - Resultado: `PASS weekday-filter-check`
- Comando: `node --experimental-transform-types scripts/weekday-evidence.ts`
  - Resultado chave:
    - `sundayLegacyEncoding.beforeFixActiveCount = 0`
    - `sundayLegacyEncoding.afterFixActiveCount = 1`

### B) Coleta de endpoints no mesmo timestamp (2026-04-15T18:09:55-03:00)
- Dominio final:
  - URL: `https://na.reuniaovirtual.online/api/reunioes-virtuais`
  - `statusCode=200`
  - `emAndamento=1`, `iniciandoEmBreve=1`, `proximas=1`
  - `sourceStatus` ausente

- Deployment Vercel mais novo (com share URL):
  - URL base: `https://landing-impulsionamento-christian-main-7haqalal5.vercel.app/api/reunioes-virtuais`
  - `statusCode=200`
  - `sourceStatus=fallback`
  - `emAndamento=9`, `iniciandoEmBreve=13`, `proximas=33`

- Deployment antigo (com share URL):
  - URL base: `https://landing-impulsionamento-christian-main-1ybsijhty.vercel.app/api/reunioes-virtuais`
  - Resultado observado pelo fetch autenticado do conector Vercel:
    - `status=200`
    - `sourceStatus=ok`
    - `emAndamento=[]`, `iniciandoEmBreve=[]`, `proximas=[]`

### C) Diferenca de contrato (dominio final vs Vercel atual)
- Dominio final (AWS atual): chaves
  - `serverTime, runningCount, startingSoonCount, upcomingCount, runningMeetings, startingSoonMeetings, upcomingMeetings, groupedBadges`
- Vercel atual: chaves
  - `version, serverTime, lastSyncAt, sourceStatus, emAndamento, iniciandoEmBreve, proximas`

### D) Correlacao de runtime
- Ferramenta: `get_runtime_logs` (deployment `dpl_CnDi14tCFaJY9aoZ5Myj7AcGt5fT`)
- Eventos:
  - `GET /api/reunioes-virtuais` com log de erro "Falha no bootstrap de scraping..."
  - Endpoint respondeu `200` e serviu dados em fallback.

## Conclusao tecnica
O incidente de 2026-04-12 continua resolvido.

O problema atual e uma combinacao de:
1. comparacao entre URLs/deployments diferentes (incluindo deployment antigo com payload vazio),
2. dominio final ainda apontando para stack/contrato legado (AWS),
3. scraping com falha no runtime da Vercel, mitigado por fallback legado no deployment novo.

## Impacto para promocao
A divergencia de deployment antigo nao deve ser usada como criterio de bloqueio se a URL canonica de promocao estiver correta.

Hoje, como o dominio final ainda retorna contrato legado, ha inconsistencia de roteamento/promocao entre AWS e Vercel.

## Proximos passos recomendados
1. Definir URL canonica de producao unica (dominio final) e validar que ela aponta para o deployment Vercel promoted.
2. Repetir captura simultanea apenas entre:
   - dominio final canonico
   - alias de producao Vercel
   Esperado: contrato e contagens equivalentes.
3. Abrir follow-up especifico para causa raiz de scraping em runtime Vercel (para sair de `fallback` para `ok`).

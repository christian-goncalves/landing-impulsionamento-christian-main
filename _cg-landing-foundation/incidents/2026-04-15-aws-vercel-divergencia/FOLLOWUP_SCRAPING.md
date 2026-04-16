# Follow-up: Scraping runtime Vercel em `fallback`

- Data: 2026-04-15
- Status: aberto

## Objetivo
Identificar causa raiz da falha intermitente de bootstrap de scraping em runtime Vercel para voltar de `sourceStatus=fallback` para `sourceStatus=ok` de forma estavel.

## Sinais observados
- Logs de producao mostram `GET /api/reunioes-virtuais` com erro `Falha no bootstrap de scraping...`.
- Endpoint responde `200` e mantem dados por fallback legado.
- Impacto atual: servico funcional, mas com degradacao operacional.

## Escopo
- Em escopo:
  - mapear excecao real no bootstrap;
  - confirmar se falha e rede, timeout, parse ou fonte externa;
  - definir correcao minima com rollback seguro.
- Fora de escopo:
  - alteracoes de contrato `v1`;
  - mudancas de roteamento/cutover de dominio.

## Plano de investigacao
1. Capturar stacktrace completa do erro no bootstrap com correlacao por request id.
2. Medir tempos e ponto exato de falha nas etapas de scraping.
3. Reproduzir em ambiente controlado com mesmos env vars de producao.
4. Aplicar correcao minima e validar reducao do erro em logs.

## Criterios de saida
- `sourceStatus=ok` predominante em producao.
- Sem regressao de payload `v1`.
- Erro de bootstrap ausente (ou residual dentro de limite acordado).

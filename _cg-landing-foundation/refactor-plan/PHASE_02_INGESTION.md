# PHASE_02_INGESTION

## Meta
Definir e operacionalizar a estratégia de coleta, normalização e deduplicação na landing, sem alterar stack.

## Estado da fase
- Status: **IN_PROGRESS**
- Data de referência: 2026-03-26

## Direção técnica aprovada
- Manter Next.js/Node/TypeScript já existentes.
- Implementar ingestão em camada própria (serviço) dentro da aplicação landing.
- Expor dados para o front por contrato `ApiPayloadV1`.

## Escopo da fase
1. Fonte de dados e frequência de sincronização por ambiente.
2. Parser defensivo e regras de normalização.
3. Regras de deduplicação determinística.
4. Processo de sync manual e agendado.
5. Critérios de observabilidade mínima.

## Arquitetura funcional da fase
1. **Coleta**
- Buscar payload de origem por HTTP com timeout/retry controlado.
- Rejeitar payload vazio como falha operacional.

2. **Normalização**
- Converter registros de origem para `MeetingNormalized`.
- Garantir timezone `America/Sao_Paulo`.

3. **Deduplicação**
- Gerar chave determinística por grupo + dia + horário + plataforma + id/link.
- Manter apenas um item por chave final.

4. **Publicação para consumo**
- Transformar `MeetingNormalized` -> `ApiPayloadV1` por adaptador dedicado.
- Aplicar ordenação e janelas de exibição do contrato.

## Critérios de entrada
- `ApiPayloadV1` definido e sem ambiguidades.
- Mapeamento Base -> landing documentado.

## Entregáveis da fase
- Regras de ingestão documentadas.
- Runbook operacional completo de sync.
- Matriz de ambiente com parâmetros de operação.

## Critérios de saída
- Sync manual com evidência de sucesso/falha documentável.
- Regras de parser e deduplicação cobrindo casos de borda.
- Parametrização por ambiente definida sem quebrar contrato.

## Checklist técnico da fase
- [x] Estratégia de coleta definida.
- [x] Estratégia de deduplicação definida.
- [x] Runbook de sync detalhado.
- [x] Matriz de ambiente detalhada.
- [ ] Validar execução fim-a-fim em ambiente local.

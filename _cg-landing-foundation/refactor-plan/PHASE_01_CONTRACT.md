# PHASE_01_CONTRACT

## Meta
Definir contrato único e estável para o frontend, baseado no comportamento atual da landing.

## Estado da fase
- Status: **IN_PROGRESS**
- Data de referência: 2026-03-26

## Escopo fechado desta fase
1. Contrato `ApiPayloadV1` definido com validações.
2. Mapeamento Base -> landing documentado.
3. Modelo normalizado intermediário definido.

## Critérios de entrada
- `README.md` lido e aceito.
- DECISION-001 (sem mudança de stack) aprovada.

## Entregáveis
- `contracts/API_PAYLOAD_V1.md`
- `contracts/MAPPING_BASE_TO_LANDING.md`
- `contracts/NORMALIZED_MODEL.md`

## Critérios de saída
- Contrato sem ambiguidade de tipo obrigatório/opcional.
- Casos de borda de meia-noite e fallback cobertos.
- Estratégia de versionamento registrada.

## Checklist técnico da fase
- [x] Estrutura canônica do payload definida.
- [x] Regras campo a campo registradas.
- [x] Invariantes de ordenação registrados.
- [x] Mapeamento de origem para frontend documentado.
- [ ] Revisão final de consistência com implementação da fase 02.

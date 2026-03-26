# MASTER_PLAN

## Objetivo
Executar a refatoração por fases para transformar a landing em uma aplicação com contrato e fluxo de dados estruturado, preservando stack e comportamento funcional esperado.

## Status geral
- Fase 01 (Contrato): DONE
- Fase 02 (Ingestão): IN_PROGRESS
- Fase 03 (Storage/Fallback): DONE
- Fase 04 (Front Adaptation): DONE
- Fase 05 (Validation/Go-Live): IN_PROGRESS

## Fases
1. PHASE 01 - Contrato
- Entrada: decisões aprovadas + estado atual documentado.
- Saída: contrato V1 fechado e mapeamento Base -> landing validado.
- Entregáveis: `contracts/API_PAYLOAD_V1.md`, `contracts/MAPPING_BASE_TO_LANDING.md`, `contracts/NORMALIZED_MODEL.md`.

2. PHASE 02 - Ingestão
- Entrada: contrato V1 aprovado.
- Saída: estratégia de coleta/parse/deduplicação definida e testável.
- Entregáveis: `refactor-plan/PHASE_02_INGESTION.md`, `operations/SYNC_RUNBOOK.md`, `operations/ENV_MATRIX.md`.

3. PHASE 03 - Armazenamento e Fallback
- Entrada: ingestão definida.
- Saída: política de snapshot e contingência especificada.
- Entregáveis: `refactor-plan/PHASE_03_STORAGE_FALLBACK.md`, `operations/INCIDENT_FALLBACK.md`.

4. PHASE 04 - Adaptação de Front
- Entrada: contrato e fallback definidos.
- Saída: plano de adaptação do frontend para consumo do payload V1 sem regressão de UX.
- Entregáveis: `refactor-plan/PHASE_04_FRONT_ADAPTATION.md`.

5. PHASE 05 - Validação e Go-Live
- Entrada: fases 1-4 concluídas.
- Saída: critérios de qualidade validados e checklist go/no-go aprovado.
- Entregáveis: `refactor-plan/PHASE_05_VALIDATION_GO_LIVE.md`, `checklists/GO_NO_GO_CHECKLIST.md`.

## Dependências
- Fases sequenciais com gate de checklist.
- Toda alteração de contrato exige atualização de documentação correspondente.

## Critérios globais de sucesso
- Sem mudança de stack.
- Sem regressão funcional nas seções principais de reuniões.
- Contrato de dados explícito e consistente.

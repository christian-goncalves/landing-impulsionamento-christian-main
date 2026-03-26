# MASTER_PLAN

## Objetivo
Executar a refatoração por fases para transformar a landing em uma aplicação com contrato e fluxo de dados estruturado, preservando stack e comportamento funcional esperado.

## Status geral
- Fase 01 (Contrato): DONE
- Fase 02 (Ingestão): DONE
- Fase 03 (Storage/Fallback): DONE
- Fase 04 (Front Adaptation): DONE
- Fase 05 (Validation/Go-Live): DONE

## Fases
1. PHASE 01 - Contrato
- Entrada: decisões aprovadas + estado atual documentado.
- Saída: contrato V1 fechado e mapeamento Base -> landing validado.

2. PHASE 02 - Ingestão
- Entrada: contrato V1 aprovado.
- Saída: estratégia de coleta/parse/deduplicação definida e testável.

3. PHASE 03 - Armazenamento e Fallback
- Entrada: ingestão definida.
- Saída: política de snapshot e contingência especificada.

4. PHASE 04 - Adaptação de Front
- Entrada: contrato e fallback definidos.
- Saída: plano de adaptação do frontend para consumo do payload V1 sem regressão de UX.

5. PHASE 05 - Validação e Go-Live
- Entrada: fases 1-4 concluídas.
- Saída: critérios de qualidade validados e checklist go/no-go aprovado.

## Critérios globais de sucesso
- Sem mudança de stack.
- Sem regressão funcional nas seções principais de reuniões.
- Contrato de dados explícito e consistente.

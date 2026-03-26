# PHASE_04_FRONT_ADAPTATION

## Meta
Adaptar frontend para consumo contratual (`ApiPayloadV1`) sem regressão visual/funcional e sem mudança de stack.

## Estado da fase
- Status: **DONE**
- Data de referência: 2026-03-26

## Escopo da fase
1. Definir client de dados contratual para substituir dependência de JSON estático.
2. Definir mapeamento de payload para os componentes atuais.
3. Definir estados de loading, erro e contingência.
4. Definir estratégia de rollout gradual no frontend.

## Estratégia de adaptação
- Camada de acesso a dados:
- Criar client com retorno tipado em `ApiPayloadV1`.
- Validar payload mínimo antes de renderizar.

- Compatibilidade com UI atual:
- Manter shape final usado por `MeetingCard` e `meetings-client`.
- Preservar labels e prioridades atuais.

- Contingência de UI:
- `sourceStatus=fallback`: render normal + indicador discreto de contingência.
- `sourceStatus=stale`: render com aviso de desatualização.

## Execução realizada
- `lib/meetings.ts` atualizado com `getMeetingsFromApi` + fallback local temporário.
- `components/meetings-client.tsx` migrado para hook assíncrono único com polling.
- Status indicator adicionado sem redesign da interface.
- Estrutura das seções (`andamento`, `iniciando`, `proximas`) preservada.

## Critérios de entrada
- Política de fallback da fase 03 definida.
- Contrato V1 estável.

## Entregáveis da fase
- Plano de transição do `lib/meetings.ts` para fonte contratual.
- Regras de exibição para estados operacionais.
- Implementação de consumo frontend via API interna.

## Critérios de saída
- Sem regressão nas seções: `emAndamento`, `iniciandoEmBreve`, `proximas`.
- Estados de contingência definidos e documentados.
- Compatibilidade com componentes existentes assegurada.

## Checklist técnico
- [x] Estratégia de client definida.
- [x] Mapeamento para UI atual definido.
- [x] Estados de contingência definidos.
- [x] Plano de rollout frontend definido.
- [x] Implementação concluída e validada em build/lint/runtime.

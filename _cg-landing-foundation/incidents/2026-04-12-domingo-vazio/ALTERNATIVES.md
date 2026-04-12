# Alternativas Avaliadas

## Opção A - Normalizar no filtro operacional (escolhida)
- Descrição: aceitar `dias_semana` em `0..6` e `1..7` no `getMeetingsFromGroups`, mapeando internamente para padrão canônico `1..7`.
- Vantagens:
  - correção localizada
  - sem mudança de contrato da API
  - retrocompatível com dados já existentes
- Riscos:
  - baixo; limitado ao cálculo de elegibilidade temporal

## Opção B - Normalizar na ingestão
- Descrição: converter `dias_semana` para padrão único ao persistir runtime.
- Vantagens:
  - dados armazenados já canônicos
- Riscos:
  - exige revisão adicional do pipeline de scraping/deduplicação
  - maior superfície de mudança para um incidente pontual

## Opção C - Normalizar em ambos (ingestão + filtro)
- Descrição: dupla proteção.
- Vantagens:
  - robustez máxima
- Riscos:
  - custo e escopo maiores do que o necessário para correção imediata

## Decisão
Aplicar **Opção A** agora (filtro), mantendo ingestão inalterada neste patch.

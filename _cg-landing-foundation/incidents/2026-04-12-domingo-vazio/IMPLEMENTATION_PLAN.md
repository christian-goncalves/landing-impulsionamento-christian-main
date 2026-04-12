# Plano de Implementação da Correção

1. Criar baseline documental pré-correção e tag de auditoria.
2. Extrair lógica de elegibilidade para módulo dedicado de filtro (`lib/meetings-filter.ts`).
3. Normalizar `dias_semana` para padrão canônico interno `1..7`:
   - `0 -> 7`
   - `1..7 -> 1..7`
   - valores fora da faixa são descartados da comparação.
4. Preservar regras existentes:
   - classificação `emAndamento`, `iniciandoEmBreve`, `proximas`
   - lógica de sessões cruzando meia-noite
   - limite de 6 itens em `proximas` quando não há `emAndamento` nem `iniciandoEmBreve`
5. Manter contrato público da API sem alterações.
6. Validar cenários de domingo, segunda e meia-noite com script reproduzível.
7. Registrar evidências e checklist de gate de promoção.

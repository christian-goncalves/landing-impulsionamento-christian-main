# CURRENT_STATE

## Panorama atual (as-is)
- Stack do projeto `landing`: Next.js + React + TypeScript.
- Consumo de dados atual: arquivo estático local (`data/na_meetings.json`) via `lib/meetings.ts`.
- Classificação e priorização de reuniões ocorre no frontend.
- Atualização periódica no cliente por `setInterval`.

## Limitações atuais
- Dependência de base estática local para conteúdo.
- Ausência de pipeline formal de ingestão/snapshot no próprio projeto.
- Contrato do frontend acoplado ao formato local atual.

## Restrições
- Não alterar stack original nesta refatoração.

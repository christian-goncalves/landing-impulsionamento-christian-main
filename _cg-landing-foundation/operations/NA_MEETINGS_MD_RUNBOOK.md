# NA_MEETINGS_MD_RUNBOOK

## Objetivo
Gerar uma visualização legível por humanos (`data/na_meetings.md`) a partir da fonte operacional de runtime.

## Comandos
- Geração única: `npm run meetings:md`
- Atualização automática: `npm run meetings:md:watch`

## Entrada e saída
- Entrada primária: `data/runtime/current_groups.json`
- Fallback legado (temporário): `data/na_meetings.json`
- Saída: `data/na_meetings.md`

## Regra da tabela
- 1 linha por ocorrência de reunião (expansão por `dias_semana`).
- Colunas:
  - Evento (sem prefixo `Grupo ` no início do nome).
  - Dia (`Domingo` a `Sábado`).
  - Início (`horario_inicio`).
  - Fim (`horario_fim`).
  - Status (`fechada|estudo|aberta`).
  - ID (`zoom_id`, ou `-` quando nulo/vazio).

## Critérios de conferência rápida
- Total de ocorrências no topo do `.md` deve refletir o total expandido do JSON.
- Eventos com múltiplos dias devem aparecer em múltiplas linhas.
- Caracteres `|` em texto devem permanecer escapados para não quebrar tabela.
- A linha `Fonte:` no topo do `.md` deve indicar `runtime` em operação normal.

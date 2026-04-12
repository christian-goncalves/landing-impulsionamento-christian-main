# RCA - Domingo Vazio

## Causa raiz confirmada
- Campo de dados: `sessao.dias_semana` pode chegar em `0..6`.
- Filtro operacional pré-correção: comparava com `diaSemana` em `1..7` (`now.getDay() === 0 ? 7 : now.getDay()`).
- Consequência: domingo com `dias_semana = [0]` não passava no `includes(7)`.

## Por que segunda a sábado "funcionava"
Nos dois padrões, segunda a sábado coincidem numericamente:
- segunda=1, terça=2, quarta=3, quinta=4, sexta=5, sábado=6.
A divergência prática ficava concentrada no domingo:
- `0..6`: domingo=0
- `1..7`: domingo=7

## Evidência objetiva
No cenário reproduzível de domingo 19:00 com sessão 18:30-19:30:
- antes da correção (`0..6`): `beforeFixActiveCount = 0`
- após correção (`0..6`): `afterFixActiveCount = 1`

Ver detalhes em `EVIDENCE.md`.

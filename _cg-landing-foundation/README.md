# _cg-landing-foundation

## Missão
Centralizar a fonte de verdade de arquitetura atual, decisões técnicas e planejamento de execução da refatoração da aplicação `landing-impulsionamento-main`.

## Escopo
- Documentação arquitetural do estado atual e estado alvo.
- Planejamento por fases da refatoração.
- Contratos de dados e mapeamentos de adaptação.
- Critérios operacionais e checklists de validação/go-live.

## Regra Central
**Sem mudança de stack.**

Esta foundation não autoriza, por padrão, troca de framework, runtime, biblioteca base ou infraestrutura principal. Qualquer exceção exige decisão formal no `architecture/DECISION_LOG.md`.

## Governança
- Toda nova decisão técnica deve ser registrada em `architecture/DECISION_LOG.md` antes da implementação.
- Toda mudança de contrato deve atualizar os arquivos em `contracts/` no mesmo ciclo.
- Toda fase só inicia quando a checklist da fase anterior estiver aprovada.
- Este diretório é a referência primária para arquitetura e execução da refatoração.

## Premissas aprovadas
- Escopo inicial: reuniões agora + padrão reutilizável.
- Apps independentes: sem integração runtime entre `Base` e `landing` nesta etapa.
- Política de dados sensíveis: manter como está atualmente.

## Regra de Leitura (Obrigatória)
Existe apenas **1 arquivo de leitura obrigatória** antes de qualquer prompt/tarefa:
- `README.md` (este arquivo).

Todos os demais arquivos, incluindo `codex/`, são de leitura **sob demanda**, apenas quando necessários para a tarefa.

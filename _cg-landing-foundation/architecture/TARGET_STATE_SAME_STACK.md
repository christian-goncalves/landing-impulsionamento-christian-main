# TARGET_STATE_SAME_STACK

## Objetivo (to-be)
Manter a stack atual e adotar um padrão de arquitetura similar ao da `Base` para coleta, normalização, armazenamento lógico, fallback e entrega de payload ao frontend.

## Direção arquitetural
- Mesmo framework/runtime já existentes no projeto.
- Introdução de contrato explícito e versionado para consumo do frontend.
- Pipeline de dados com fallback de último snapshot válido.
- Governança de decisões e critérios de qualidade por fase.

## Fora de escopo
- Migração de framework.
- Unificação de servidores com a aplicação `Base` nesta etapa.

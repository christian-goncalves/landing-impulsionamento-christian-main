# DECISION_LOG

## Formato padrão
- **ID**:
- **Data**:
- **Contexto**:
- **Decisão**:
- **Impacto**:
- **Status**: proposed | approved | superseded

---

## DECISION-001
- **ID**: DECISION-001
- **Data**: 2026-03-26
- **Contexto**: Planejamento da refatoração para padronizar arquitetura de dados da landing com base no padrão da aplicação Base.
- **Decisão**: A refatoração será realizada **sem mudança de stack**.
- **Impacto**: Implementações devem respeitar Next.js/React/TypeScript já adotados; qualquer mudança estrutural de stack exige nova decisão formal.
- **Status**: approved

## DECISION-002
- **ID**: DECISION-002
- **Data**: 2026-03-26
- **Contexto**: Necessidade de alinhar arquitetura sem acoplamento entre sistemas independentes.
- **Decisão**: `Base` e `landing` permanecem independentes, sem integração runtime nesta etapa.
- **Impacto**: A landing adota o padrão arquitetural, mas executa seu próprio fluxo local de dados.
- **Status**: approved

## DECISION-003
- **ID**: DECISION-003
- **Data**: 2026-03-26
- **Contexto**: Resiliência exigida para indisponibilidade da origem.
- **Decisão**: Aplicar fallback com último snapshot válido.
- **Impacto**: Frontend deve conseguir operar em contingência com indicação de status.
- **Status**: approved

## DECISION-004
- **ID**: DECISION-004
- **Data**: 2026-03-26
- **Contexto**: Necessidade de padronizar o protocolo mínimo de leitura antes de iniciar qualquer tarefa.
- **Decisão**: Apenas `README.md` da foundation é leitura obrigatória; demais arquivos são sob demanda.
- **Impacto**: Reduz overhead operacional e mantém governança mínima obrigatória.
- **Status**: approved

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

## DECISION-005
- **ID**: DECISION-005
- **Data**: 2026-03-26
- **Contexto**: Necessidade de definir modelo operacional de ingestão para a landing, mantendo stack atual.
- **Decisão**: A ingestão seguirá implementação nativa no stack atual (Next.js/Node/TypeScript), com scheduler externo e contrato `ApiPayloadV1` como saída fixa para frontend.
- **Impacto**: Evita acoplamento com a Base em runtime e mantém governança de dados dentro da própria landing.
- **Status**: approved

## DECISION-006
- **ID**: DECISION-006
- **Data**: 2026-03-26
- **Contexto**: Necessidade de formalizar estratégia de persistência lógica e contingência.
- **Decisão**: Adotar modelo de `current_payload` + `last_valid_snapshot` + `sync_meta`, com status operacional `ok|fallback|stale`.
- **Impacto**: Garante continuidade de resposta do frontend em falha de origem sem quebra de contrato.
- **Status**: approved

## DECISION-007
- **ID**: DECISION-007
- **Data**: 2026-03-26
- **Contexto**: Necessidade de migrar consumo de dados do frontend sem regressão de UX.
- **Decisão**: Adaptar frontend para client contratual `ApiPayloadV1`, mantendo shape final compatível com componentes atuais.
- **Impacto**: Permite transição controlada sem alteração de stack e sem reescrever componentes centrais.
- **Status**: approved

## DECISION-008
- **ID**: DECISION-008
- **Data**: 2026-03-26
- **Contexto**: Necessidade de gate formal para liberação da refatoração.
- **Decisão**: Go-live condicionado ao `GO_NO_GO_CHECKLIST` 100% aprovado com evidências de contrato, fallback e regressão de frontend.
- **Impacto**: Reduz risco operacional e formaliza critério objetivo de liberação.
- **Status**: approved


## DECISION-009
- **ID**: DECISION-009
- **Data**: 2026-03-26
- **Contexto**: Inconsistência de classificação de reuniões no frontend ao inferir tipo por texto em `formatos`.
- **Decisão**: A landing passa a executar scraping interno e normalização canônica de acesso: `is_study=1 -> estudo`, senão `is_open=1 -> aberta`, senão `fechada`.
- **Impacto**: `sessao.tipo_acesso` torna-se fonte única de verdade para a UI; elimina dependência de CSV manual como fonte operacional.
- **Status**: approved

## DECISION-010
- **ID**: DECISION-010
- **Data**: 2026-03-26
- **Contexto**: Divergências de status (Fênix/Largo) causadas por fonte legada usada em visualização humana e fallback local.
- **Decisão**: Fonte operacional única passa a ser o runtime de scraping interno (data/runtime/current_groups.json). data/na_meetings.json permanece apenas como legado temporário e fallback opcional por flag.
- **Impacto**: 
a_meetings.md passa a ser gerado do runtime por padrão; classificação e consumo ficam alinhados ao padrão do NA_virtual_clone.
- **Status**: approved

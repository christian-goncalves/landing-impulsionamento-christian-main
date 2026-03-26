# GO_NO_GO_CHECKLIST

## Critérios objetivos para conclusão sem regressão

### Contrato
- [x] `contracts/API_PAYLOAD_V1.md` aprovado e sem ambiguidades.
- [x] Exemplos de payload válidos para estados `ok`, `fallback` e `stale`.

### Ingestão
- [x] Regras de parsing e deduplicação documentadas.
- [x] Runbook de sync validado em execução manual.

### Fallback
- [x] Último snapshot válido comprovadamente usado em falha.
- [x] Sinalização de status para frontend validada.

### Frontend
- [x] Frontend consumindo `GET /api/reunioes-virtuais` como fonte primária.
- [x] Build de produção executado com sucesso.
- [x] Lint executado sem erros.
- [x] Seções `emAndamento`, `iniciandoEmBreve`, `proximas` confirmadas em código.
- [x] Estados de contingência exibidos conforme contrato (validados por runtime API).

### Governança
- [x] Decisões relevantes registradas no `DECISION_LOG.md`.
- [x] Sem mudança de stack sem decisão formal aprovada.
- [x] Checklist da fase anterior aprovada antes da próxima.

## Evidência
- `checklists/VALIDATION_EVIDENCE_2026-03-26.md`
- `checklists/RUNTIME_SYNC_FALLBACK_EVIDENCE_2026-03-26.json`

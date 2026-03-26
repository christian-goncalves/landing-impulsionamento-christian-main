# GO_NO_GO_CHECKLIST

## Critérios objetivos para conclusão sem regressão

### Contrato
- [ ] `contracts/API_PAYLOAD_V1.md` aprovado e sem ambiguidades.
- [ ] Exemplos de payload válidos para estados `ok`, `fallback` e `stale`.

### Ingestão
- [ ] Regras de parsing e deduplicação documentadas.
- [ ] Runbook de sync validado em execução manual.

### Fallback
- [ ] Último snapshot válido comprovadamente usado em falha.
- [ ] Sinalização de status para frontend validada.

### Frontend
- [ ] Seções `emAndamento`, `iniciandoEmBreve`, `proximas` sem regressão funcional.
- [ ] Estados de contingência exibidos conforme contrato.

### Governança
- [ ] Decisões relevantes registradas no `DECISION_LOG.md`.
- [ ] Sem mudança de stack sem decisão formal aprovada.
- [ ] Checklist da fase anterior aprovada antes da próxima.

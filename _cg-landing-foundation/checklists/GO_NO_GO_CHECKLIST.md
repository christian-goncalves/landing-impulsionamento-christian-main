# GO_NO_GO_CHECKLIST

## Critérios objetivos para conclusão sem regressão

### Contrato
- [x] `contracts/API_PAYLOAD_V1.md` aprovado e sem ambiguidades.
- [x] Exemplos de payload válidos para estados `ok`, `fallback` e `stale`.

### Ingestão
- [x] Regras de parsing e deduplicação documentadas.
- [ ] Runbook de sync validado em execução manual.

### Fallback
- [ ] Último snapshot válido comprovadamente usado em falha.
- [ ] Sinalização de status para frontend validada.

### Frontend
- [x] Build de produção executado com sucesso.
- [x] Lint executado sem erros.
- [x] Seções `emAndamento`, `iniciandoEmBreve`, `proximas` confirmadas em código.
- [ ] Estados de contingência exibidos conforme contrato (pendente validação em runtime com fonte contratual).

### Governança
- [x] Decisões relevantes registradas no `DECISION_LOG.md`.
- [x] Sem mudança de stack sem decisão formal aprovada.
- [ ] Checklist da fase anterior aprovada antes da próxima (Phase 02 depende evidência fim-a-fim).

## Evidência
- Arquivo: `checklists/VALIDATION_EVIDENCE_2026-03-26.md`

# INCIDENT_FALLBACK

## Objetivo
Definir resposta operacional para indisponibilidade da origem de dados sem quebrar o contrato `ApiPayloadV1`.

## Política oficial
- Se sync falhar, manter último snapshot válido.
- Expor `sourceStatus=fallback` durante contingência.
- Escalar para `sourceStatus=stale` quando exceder limite de staleness.

## Classificação do incidente
- **Nível 1**: falha isolada de sync com recuperação no próximo ciclo.
- **Nível 2**: 2+ falhas consecutivas, ainda com snapshot válido.
- **Nível 3**: ausência de sync bem-sucedido além do limite stale.

## Fluxo operacional
1. Detectar falha de sync.
2. Registrar erro sanitizado e timestamp em `sync_meta`.
3. Manter resposta com `last_valid_snapshot`.
4. Atualizar `sourceStatus` (`fallback` ou `stale`).
5. Executar retries controlados.
6. Encerrar incidente após sync bem-sucedido.

## Critérios de encerramento
- Nova sincronização concluída com sucesso.
- `sourceStatus` retorna para `ok`.
- `lastSyncAt` atualizado.
- Contrato V1 validado após recuperação.

## Pós-incidente
- Registrar causa raiz resumida.
- Registrar ação corretiva.
- Atualizar `DECISION_LOG.md` se a política mudar.

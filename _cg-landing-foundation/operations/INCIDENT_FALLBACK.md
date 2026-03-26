# INCIDENT_FALLBACK

## Objetivo
Definir resposta operacional para indisponibilidade da origem de dados.

## Política
- Se sync falhar, manter último snapshot válido.
- Expor `sourceStatus=fallback` quando em contingência.
- Escalar para `stale` quando exceder janela máxima de atualização.

## Ações
1. Registrar incidente e erro sanitizado.
2. Confirmar saúde do endpoint de origem.
3. Executar retry manual controlado.
4. Encerrar incidente após sync bem-sucedido.

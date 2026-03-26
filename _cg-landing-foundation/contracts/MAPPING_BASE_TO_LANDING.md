# MAPPING_BASE_TO_LANDING

## Objetivo
Documentar a transformação do padrão de dados da Base para o contrato `ApiPayloadV1` da landing.

## Mapeamento principal
- `Base.serverTime` -> `ApiPayloadV1.serverTime`
- `Base.runningMeetings` -> `ApiPayloadV1.emAndamento`
- `Base.startingSoonMeetings` -> `ApiPayloadV1.iniciandoEmBreve`
- `Base.upcomingMeetings` -> `ApiPayloadV1.proximas`

## Mapeamento por item
- `meeting.name` -> `grupo.nome`
- `meeting.type_label` -> `sessao.tipo_acesso` (com normalização)
- `meeting.format_labels` -> `sessao.formatos`
- `meeting.meeting_platform` -> `sessao.app`
- `meeting.meeting_url` + `meeting_id` -> `zoomLink` e `sessao.zoom_id` quando aplicável
- `start_at/end_at` -> `sessao.horario_inicio/horario_fim` e minutos relativos
- `status_text` -> `statusLabel`

## Gaps já conhecidos
1. Base trabalha com timestamps (`start_at/end_at`), landing renderiza `HH:mm` e minuto relativo.
2. Base pode não fornecer todos os campos textuais usados no card atual (ex.: rótulos já prontos para UI).
3. `dias_semana` não é direto no payload agrupado da Base e exige derivação no adaptador.

## Defaults de adaptação
- `cidade` e `estado`: `null` quando não houver origem confiável.
- `notas`: `null` por padrão.
- `tipo_acesso`: fallback em `fechada` se não houver classificação confiável.

## Regra de implementação
Toda transformação deve acontecer em adaptador dedicado, sem lógica de UI dentro da camada de mapeamento.

# NORMALIZED_MODEL

## Objetivo
Definir modelo intermediário para desacoplar ingestão e payload de frontend.

## Modelo lógico sugerido
```ts
type MeetingNormalized = {
  groupKey: string
  groupName: string
  city: string | null
  state: string | null
  weekday: number[]
  startAtLocal: string // HH:mm
  endAtLocal: string // HH:mm
  timezone: string // default America/Sao_Paulo
  platform: string
  meetingId: string | null
  meetingPassword: string | null
  meetingUrl: string | null
  formatLabels: string[]
  accessType: "aberta" | "fechada" | "estudo"
  notes: string | null
  sourceStatus: "ok" | "fallback" | "stale"
  syncedAt: string | null // ISO-8601
}
```

## Regras
- `groupKey` deve ser determinístico para deduplicação.
- Horários normalizados sempre em timezone explícita.
- Campos ausentes devem virar `null` e não `undefined`.

## Saída
O adaptador `MeetingNormalized -> ApiPayloadV1` é responsável por prioridade, labels e janelas de exibição.


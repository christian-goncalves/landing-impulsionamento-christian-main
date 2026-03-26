import { getMeetings, type MeetingsResult, type SessaoAtiva } from "@/lib/meetings"

export type SourceStatus = "ok" | "fallback" | "stale"

export interface ApiPayloadV1 {
  version: "v1"
  serverTime: string
  lastSyncAt: string | null
  sourceStatus: SourceStatus
  emAndamento: SessaoAtiva[]
  iniciandoEmBreve: SessaoAtiva[]
  proximas: SessaoAtiva[]
}

export function buildPayloadV1(
  sourceStatus: SourceStatus = "ok",
  meetingsResult?: MeetingsResult,
  lastSyncAt?: string | null
): ApiPayloadV1 {
  const result = meetingsResult ?? getMeetings()

  return {
    version: "v1",
    serverTime: new Date().toISOString(),
    lastSyncAt: lastSyncAt ?? null,
    sourceStatus,
    emAndamento: result.emAndamento,
    iniciandoEmBreve: result.iniciandoEmBreve,
    proximas: result.proximas,
  }
}

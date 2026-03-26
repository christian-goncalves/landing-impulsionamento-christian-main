import { NextResponse } from "next/server"
import { buildPayloadV1 } from "@/lib/payload-v1"
import {
  writeCurrentPayload,
  writeLastSnapshot,
  writeSyncState,
} from "@/lib/runtime-store"

export async function POST() {
  const nowIso = new Date().toISOString()
  const payload = buildPayloadV1("ok", undefined, nowIso)

  await writeCurrentPayload(payload)
  await writeLastSnapshot(payload)
  await writeSyncState({
    sourceDown: false,
    failMode: null,
    lastFailureAt: null,
  })

  return NextResponse.json({
    ok: true,
    message: "Sync manual executado com sucesso.",
    lastSyncAt: nowIso,
    counters: {
      emAndamento: payload.emAndamento.length,
      iniciandoEmBreve: payload.iniciandoEmBreve.length,
      proximas: payload.proximas.length,
    },
  })
}

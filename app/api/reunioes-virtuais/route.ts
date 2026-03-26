import { NextResponse } from "next/server"
import { buildPayloadV1 } from "@/lib/payload-v1"
import {
  readCurrentPayload,
  readLastSnapshot,
  readSyncState,
  resolveSourceStatus,
} from "@/lib/runtime-store"

export async function GET() {
  const currentPayload = await readCurrentPayload()
  const snapshotPayload = await readLastSnapshot()
  const syncState = await readSyncState()
  const staleThresholdMinutes = Math.max(
    1,
    Number(process.env.MEETINGS_STALE_THRESHOLD_MINUTES ?? 180)
  )

  if (syncState.sourceDown) {
    const base = snapshotPayload ?? currentPayload ?? buildPayloadV1("fallback")
    const resolvedStatus = resolveSourceStatus(
      syncState.failMode,
      base.lastSyncAt,
      staleThresholdMinutes
    )

    return NextResponse.json({
      ...base,
      serverTime: new Date().toISOString(),
      sourceStatus: resolvedStatus,
    })
  }

  if (currentPayload) {
    return NextResponse.json({
      ...currentPayload,
      serverTime: new Date().toISOString(),
      sourceStatus: "ok",
    })
  }

  return NextResponse.json(buildPayloadV1("ok"))
}

import { NextResponse } from "next/server"
import { buildPayloadV1 } from "@/lib/payload-v1"
import {
  readCurrentGroups,
  readCurrentPayload,
  readLastGroupsSnapshot,
  readLastSnapshot,
  readSyncState,
  resolveSourceStatus,
  writeCurrentGroups,
  writeCurrentPayload,
  writeLastGroupsSnapshot,
  writeLastSnapshot,
  writeSyncState,
} from "@/lib/runtime-store"
import { scrapeNaVirtualMeetings } from "@/lib/na-virtual-scraper"
import { getMeetingsFromGroups } from "@/lib/meetings"

export async function GET() {
  const currentPayload = await readCurrentPayload()
  const snapshotPayload = await readLastSnapshot()
  const currentGroups = await readCurrentGroups()
  const snapshotGroups = await readLastGroupsSnapshot()
  const syncState = await readSyncState()
  const staleThresholdMinutes = Math.max(
    1,
    Number(process.env.MEETINGS_STALE_THRESHOLD_MINUTES ?? 180)
  )

  if (syncState.sourceDown) {
    const base = snapshotPayload ?? currentPayload ?? buildPayloadV1("fallback")
    const groups = snapshotGroups ?? currentGroups
    const resolvedStatus = resolveSourceStatus(
      syncState.failMode,
      base.lastSyncAt,
      staleThresholdMinutes
    )

    if (groups && groups.length > 0) {
      return NextResponse.json(
        buildPayloadV1(resolvedStatus, getMeetingsFromGroups(groups), base.lastSyncAt)
      )
    }

    return NextResponse.json({
      ...base,
      serverTime: new Date().toISOString(),
      sourceStatus: resolvedStatus,
    })
  }

  if (currentGroups && currentGroups.length > 0) {
    return NextResponse.json(
      buildPayloadV1("ok", getMeetingsFromGroups(currentGroups), currentPayload?.lastSyncAt ?? null)
    )
  }

  if (currentPayload && (!currentGroups || currentGroups.length === 0)) {
    try {
      const scrapeResult = await scrapeNaVirtualMeetings()
      const nowIso = new Date().toISOString()
      const payload = buildPayloadV1("ok", scrapeResult.meetingsResult, nowIso)
      await writeCurrentPayload(payload)
      await writeLastSnapshot(payload)
      await writeCurrentGroups(scrapeResult.groups)
      await writeLastGroupsSnapshot(scrapeResult.groups)
      await writeSyncState({
        sourceDown: false,
        failMode: null,
        lastFailureAt: null,
      })
      return NextResponse.json(payload)
    } catch {
      // Se não conseguir migrar automaticamente, cai para payload legado.
    }
  }

  if (currentPayload) {
    return NextResponse.json({
      ...currentPayload,
      serverTime: new Date().toISOString(),
      sourceStatus: "ok",
    })
  }

  // Bootstrap automático do runtime em ambiente limpo.
  try {
    const scrapeResult = await scrapeNaVirtualMeetings()
    const nowIso = new Date().toISOString()
    const payload = buildPayloadV1("ok", scrapeResult.meetingsResult, nowIso)
    await writeCurrentPayload(payload)
    await writeLastSnapshot(payload)
    await writeCurrentGroups(scrapeResult.groups)
    await writeLastGroupsSnapshot(scrapeResult.groups)
    await writeSyncState({
      sourceDown: false,
      failMode: null,
      lastFailureAt: null,
    })

    return NextResponse.json(payload)
  } catch {
    // Mantém resposta contratual mesmo se bootstrap falhar.
  }

  return NextResponse.json(buildPayloadV1("ok"))
}

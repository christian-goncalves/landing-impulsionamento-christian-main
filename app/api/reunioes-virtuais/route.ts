import { NextResponse } from "next/server"
import { buildPayloadV1 } from "@/lib/payload-v1"
import meetingsData from "@/data/na_meetings.json"
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
import { getMeetingsFromGroups, type Grupo } from "@/lib/meetings"

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
  const syncIntervalMinutes = Math.max(
    1,
    Number(process.env.MEETINGS_SYNC_INTERVAL_MINUTES ?? 30)
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

    return NextResponse.json(buildLegacyFallbackPayload(base.lastSyncAt, resolvedStatus))
  }

  if (currentGroups && currentGroups.length > 0) {
    const lastSyncAt = currentPayload?.lastSyncAt ?? snapshotPayload?.lastSyncAt ?? null

    if (shouldAttemptScheduledSync(lastSyncAt, syncIntervalMinutes)) {
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
        await writeSyncState({
          sourceDown: true,
          failMode: "fallback",
          lastFailureAt: new Date().toISOString(),
        })

        return NextResponse.json(
          buildPayloadV1("fallback", getMeetingsFromGroups(currentGroups), lastSyncAt)
        )
      }
    }

    return NextResponse.json(buildPayloadV1("ok", getMeetingsFromGroups(currentGroups), lastSyncAt))
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
    } catch (error) {
      console.error("Falha ao migrar runtime para grupos atuais.", error)
      return NextResponse.json(
        buildLegacyFallbackPayload(
          currentPayload.lastSyncAt ?? snapshotPayload?.lastSyncAt ?? null,
          "fallback"
        )
      )
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
  } catch (error) {
    console.error("Falha no bootstrap de scraping em ambiente limpo.", error)
    return NextResponse.json(buildLegacyFallbackPayload(null, "fallback"))
  }
}

function shouldAttemptScheduledSync(
  lastSyncAt: string | null,
  syncIntervalMinutes: number
): boolean {
  if (!lastSyncAt) {
    return true
  }

  const elapsedMs = Date.now() - new Date(lastSyncAt).getTime()
  if (!Number.isFinite(elapsedMs) || elapsedMs < 0) {
    return true
  }

  return elapsedMs / 60000 >= syncIntervalMinutes
}

function buildLegacyFallbackPayload(
  lastSyncAt: string | null,
  sourceStatus: "fallback" | "stale" = "fallback"
) {
  const groups = (meetingsData as { grupos?: Grupo[] }).grupos ?? []
  if (groups.length === 0) {
    return buildPayloadV1(sourceStatus, undefined, lastSyncAt)
  }

  return buildPayloadV1(sourceStatus, getMeetingsFromGroups(groups), lastSyncAt)
}

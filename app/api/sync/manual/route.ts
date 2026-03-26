import { NextResponse } from "next/server"
import { buildPayloadV1 } from "@/lib/payload-v1"
import {
  writeCurrentPayload,
  writeCurrentGroups,
  writeLastGroupsSnapshot,
  writeQualityReport,
  writeLastSnapshot,
  writeSyncState,
} from "@/lib/runtime-store"
import { buildMetrics, createReport } from "@/lib/scraping-quality"
import { scrapeNaVirtualMeetings } from "@/lib/na-virtual-scraper"

export async function POST() {
  const nowIso = new Date().toISOString()

  try {
    const scrapeResult = await scrapeNaVirtualMeetings()
    const payload = buildPayloadV1("ok", scrapeResult.meetingsResult, nowIso)
    const metrics = buildMetrics(scrapeResult.metrics)
    const qualityReport = createReport(payload, metrics)

    if (qualityReport.status === "fail") {
      await writeQualityReport(qualityReport)
      return NextResponse.json(
        {
          ok: false,
          message: "Sync abortado por falha de contrato no payload.",
          quality: qualityReport,
        },
        { status: 500 }
      )
    }

    await writeCurrentPayload(payload)
    await writeLastSnapshot(payload)
    await writeCurrentGroups(scrapeResult.groups)
    await writeLastGroupsSnapshot(scrapeResult.groups)
    await writeSyncState({
      sourceDown: false,
      failMode: null,
      lastFailureAt: null,
    })
    await writeQualityReport(qualityReport)

    return NextResponse.json({
      ok: true,
      message: "Sync manual executado com sucesso via scraping interno.",
      lastSyncAt: nowIso,
      sourceUrl: scrapeResult.sourceUrl,
      quality: qualityReport,
      counters: {
        emAndamento: payload.emAndamento.length,
        iniciandoEmBreve: payload.iniciandoEmBreve.length,
        proximas: payload.proximas.length,
      },
    })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Falha desconhecida no scraping interno."

    await writeSyncState({
      sourceDown: true,
      failMode: "fallback",
      lastFailureAt: nowIso,
    })

    return NextResponse.json(
      {
        ok: false,
        message,
      },
      { status: 502 }
    )
  }
}

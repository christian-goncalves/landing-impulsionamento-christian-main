import { NextResponse } from "next/server"
import { scrapeNaVirtualMeetings } from "@/lib/na-virtual-scraper"
import { buildPayloadV1 } from "@/lib/payload-v1"
import {
  readCurrentGroups,
  readCurrentPayload,
  readLastGroupsSnapshot,
  readLastSnapshot,
} from "@/lib/runtime-store"
import { buildScrapingComparisonReport } from "@/lib/scraping-compare"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const q = sanitizeNullable(url.searchParams.get("q"))
  const day = sanitizeDay(url.searchParams.get("day"))
  const hour = sanitizeHour(url.searchParams.get("hour"))
  const tz = sanitizeTimezone(url.searchParams.get("tz"))

  try {
    const scrape = await scrapeNaVirtualMeetings()
    const [currentPayload, snapshotPayload, currentGroups, snapshotGroups] = await Promise.all([
      readCurrentPayload(),
      readLastSnapshot(),
      readCurrentGroups(),
      readLastGroupsSnapshot(),
    ])

    const payload =
      currentPayload ??
      snapshotPayload ??
      buildPayloadV1("ok", scrape.meetingsResult, new Date().toISOString())
    const runtimeGroups = currentGroups ?? snapshotGroups ?? scrape.groups

    const report = buildScrapingComparisonReport(scrape, runtimeGroups, payload, {
      q,
      day,
      hour,
      tz,
    })

    return NextResponse.json({
      ok: true,
      operational_payload_source: currentPayload
        ? "current_payload"
        : snapshotPayload
          ? "last_snapshot"
          : "fresh_from_scrape",
      operational_runtime_source: currentGroups
        ? "current_groups"
        : snapshotGroups
          ? "last_groups_snapshot"
          : "fresh_from_scrape",
      report,
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error ? error.message : "Falha ao executar diagnóstico de scraping.",
      },
      { status: 502 }
    )
  }
}

function sanitizeNullable(value: string | null): string | null {
  if (!value) return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function sanitizeDay(value: string | null): number | null {
  if (!value) return null
  const day = Number(value)
  if (!Number.isInteger(day) || day < 0 || day > 6) {
    return null
  }
  return day
}

function sanitizeHour(value: string | null): string | null {
  if (!value) return null
  return /^\d{2}:\d{2}$/.test(value) ? value : null
}

function sanitizeTimezone(value: string | null): string {
  if (!value) return "America/Sao_Paulo"
  return value.trim() || "America/Sao_Paulo"
}

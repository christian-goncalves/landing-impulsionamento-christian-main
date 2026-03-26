import { NextRequest, NextResponse } from "next/server"
import { writeSyncState } from "@/lib/runtime-store"

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const mode = body?.mode === "stale" ? "stale" : "fallback"

  await writeSyncState({
    sourceDown: true,
    failMode: mode,
    lastFailureAt: new Date().toISOString(),
  })

  return NextResponse.json({
    ok: true,
    message: "Falha de origem simulada.",
    mode,
  })
}

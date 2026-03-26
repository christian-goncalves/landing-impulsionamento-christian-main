import { NextResponse } from "next/server"
import { writeSyncState } from "@/lib/runtime-store"

export async function POST() {
  await writeSyncState({
    sourceDown: false,
    failMode: null,
    lastFailureAt: null,
  })

  return NextResponse.json({
    ok: true,
    message: "Origem restaurada.",
  })
}

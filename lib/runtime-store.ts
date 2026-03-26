import { promises as fs } from "node:fs"
import path from "node:path"
import type { ApiPayloadV1, SourceStatus } from "@/lib/payload-v1"

interface SyncState {
  sourceDown: boolean
  failMode: SourceStatus | null
  lastFailureAt: string | null
}

const runtimeDir = path.join(process.cwd(), "data", "runtime")
const currentPayloadFile = path.join(runtimeDir, "current_payload_v1.json")
const lastSnapshotFile = path.join(runtimeDir, "last_valid_snapshot_v1.json")
const syncStateFile = path.join(runtimeDir, "sync_state.json")
const qualityDir = path.join(runtimeDir, "quality")

const defaultSyncState: SyncState = {
  sourceDown: false,
  failMode: null,
  lastFailureAt: null,
}

async function ensureRuntimeDir(): Promise<void> {
  await fs.mkdir(runtimeDir, { recursive: true })
}

async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(filePath, "utf8")
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

async function writeJsonFile(filePath: string, value: unknown): Promise<void> {
  await ensureRuntimeDir()
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), "utf8")
}

export async function readCurrentPayload(): Promise<ApiPayloadV1 | null> {
  return readJsonFile<ApiPayloadV1>(currentPayloadFile)
}

export async function writeCurrentPayload(payload: ApiPayloadV1): Promise<void> {
  await writeJsonFile(currentPayloadFile, payload)
}

export async function readLastSnapshot(): Promise<ApiPayloadV1 | null> {
  return readJsonFile<ApiPayloadV1>(lastSnapshotFile)
}

export async function writeLastSnapshot(payload: ApiPayloadV1): Promise<void> {
  await writeJsonFile(lastSnapshotFile, payload)
}

export async function readSyncState(): Promise<SyncState> {
  const state = await readJsonFile<SyncState>(syncStateFile)
  return state ?? defaultSyncState
}

export async function writeSyncState(state: SyncState): Promise<void> {
  await writeJsonFile(syncStateFile, state)
}

export async function writeQualityReport(
  report: unknown,
  fileName = "latest_quality_report.json"
): Promise<void> {
  await fs.mkdir(qualityDir, { recursive: true })
  const target = path.join(qualityDir, fileName)
  await fs.writeFile(target, JSON.stringify(report, null, 2), "utf8")
}

export function resolveSourceStatus(
  failMode: SourceStatus | null,
  lastSyncAt: string | null,
  staleThresholdMinutes: number
): SourceStatus {
  if (failMode === "fallback" || failMode === "stale") {
    return failMode
  }

  if (!lastSyncAt) {
    return "fallback"
  }

  const elapsedMs = Date.now() - new Date(lastSyncAt).getTime()
  const elapsedMinutes = elapsedMs / 60000

  return elapsedMinutes > staleThresholdMinutes ? "stale" : "fallback"
}

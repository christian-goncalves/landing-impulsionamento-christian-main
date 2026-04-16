import { promises as fs } from "node:fs"
import path from "node:path"
import type { ApiPayloadV1, SourceStatus } from "@/lib/payload-v1"
import type { Grupo } from "@/lib/meetings"

interface SyncState {
  sourceDown: boolean
  failMode: SourceStatus | null
  lastFailureAt: string | null
}

const inMemoryStore = new Map<string, unknown>()

function resolveRuntimeDir(): string {
  const explicitRuntimeDir = process.env.MEETINGS_RUNTIME_DIR?.trim()
  if (explicitRuntimeDir) {
    if (process.env.VERCEL === "1" && explicitRuntimeDir.startsWith("/var/task")) {
      return path.join("/tmp", "na-runtime")
    }
    return explicitRuntimeDir
  }

  // Vercel Serverless filesystem is read-only under /var/task; use /tmp for writable runtime files.
  if (process.env.VERCEL === "1") {
    return path.join("/tmp", "na-runtime")
  }

  return path.join(process.cwd(), "data", "runtime")
}

const runtimeDir = resolveRuntimeDir()
const currentPayloadFile = path.join(runtimeDir, "current_payload_v1.json")
const lastSnapshotFile = path.join(runtimeDir, "last_valid_snapshot_v1.json")
const currentGroupsFile = path.join(runtimeDir, "current_groups.json")
const lastGroupsSnapshotFile = path.join(runtimeDir, "last_groups_snapshot.json")
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
    const parsed = JSON.parse(raw) as T
    inMemoryStore.set(filePath, parsed)
    return parsed
  } catch {
    const fallback = inMemoryStore.get(filePath)
    return (fallback as T | undefined) ?? null
  }
}

async function writeJsonFile(filePath: string, value: unknown): Promise<void> {
  inMemoryStore.set(filePath, value)

  try {
    await ensureRuntimeDir()
    await fs.writeFile(filePath, JSON.stringify(value, null, 2), "utf8")
  } catch (error) {
    const code =
      error && typeof error === "object" && "code" in error
        ? String((error as { code?: string }).code ?? "unknown")
        : "unknown"

    console.error("[runtime-store] write failed, using in-memory fallback", {
      filePath,
      runtimeDir,
      code,
    })
  }
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

export async function readCurrentGroups(): Promise<Grupo[] | null> {
  return readJsonFile<Grupo[]>(currentGroupsFile)
}

export async function writeCurrentGroups(groups: Grupo[]): Promise<void> {
  await writeJsonFile(currentGroupsFile, groups)
}

export async function readLastGroupsSnapshot(): Promise<Grupo[] | null> {
  return readJsonFile<Grupo[]>(lastGroupsSnapshotFile)
}

export async function writeLastGroupsSnapshot(groups: Grupo[]): Promise<void> {
  await writeJsonFile(lastGroupsSnapshotFile, groups)
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
  const target = path.join(qualityDir, fileName)
  inMemoryStore.set(target, report)

  try {
    await fs.mkdir(qualityDir, { recursive: true })
    await fs.writeFile(target, JSON.stringify(report, null, 2), "utf8")
  } catch (error) {
    const code =
      error && typeof error === "object" && "code" in error
        ? String((error as { code?: string }).code ?? "unknown")
        : "unknown"

    console.error("[runtime-store] quality report write failed", {
      target,
      runtimeDir,
      code,
    })
  }
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

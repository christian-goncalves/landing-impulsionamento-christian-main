import type { ApiPayloadV1 } from "@/lib/payload-v1"

export type QualityStatus = "pass" | "warn" | "fail"

export interface ValidationIssue {
  path: string
  message: string
}

export interface ValidationResult {
  valid: boolean
  issues: ValidationIssue[]
}

export interface DiffResult {
  equal: boolean
  differences: string[]
}

export interface ScrapingQualityMetrics {
  raw_total: number
  parsed_ok: number
  parse_errors: number
  deduplicated: number
  discarded: number
  coverage_ratio: number
}

export interface ScrapingQualityReport {
  generated_at: string
  status: QualityStatus
  reasons: string[]
  metrics: ScrapingQualityMetrics
  contract: ValidationResult
}

export function validatePayloadV1(payload: unknown): ValidationResult {
  const issues: ValidationIssue[] = []
  const p = payload as Record<string, unknown>

  if (p?.version !== "v1") {
    issues.push({ path: "version", message: "version deve ser 'v1'." })
  }

  if (typeof p?.serverTime !== "string" || p.serverTime.trim() === "") {
    issues.push({ path: "serverTime", message: "serverTime deve ser string ISO." })
  }

  if (p?.lastSyncAt !== null && typeof p?.lastSyncAt !== "string") {
    issues.push({ path: "lastSyncAt", message: "lastSyncAt deve ser string ISO ou null." })
  }

  if (!["ok", "fallback", "stale"].includes(String(p?.sourceStatus))) {
    issues.push({
      path: "sourceStatus",
      message: "sourceStatus deve ser ok|fallback|stale.",
    })
  }

  if (!Array.isArray(p?.emAndamento)) {
    issues.push({ path: "emAndamento", message: "emAndamento deve ser array." })
  }
  if (!Array.isArray(p?.iniciandoEmBreve)) {
    issues.push({
      path: "iniciandoEmBreve",
      message: "iniciandoEmBreve deve ser array.",
    })
  }
  if (!Array.isArray(p?.proximas)) {
    issues.push({ path: "proximas", message: "proximas deve ser array." })
  }

  const buckets = ["emAndamento", "iniciandoEmBreve", "proximas"] as const
  for (const bucket of buckets) {
    const arr = p?.[bucket]
    if (!Array.isArray(arr)) continue

    arr.forEach((item, index) => {
      const tipo = (item as { sessao?: { tipo_acesso?: unknown } })?.sessao?.tipo_acesso
      if (tipo !== "aberta" && tipo !== "fechada" && tipo !== "estudo") {
        issues.push({
          path: `${bucket}[${index}].sessao.tipo_acesso`,
          message: "tipo_acesso deve ser aberta|fechada|estudo.",
        })
      }
    })
  }

  return {
    valid: issues.length === 0,
    issues,
  }
}

export function compareNormalized(actual: unknown, expected: unknown): DiffResult {
  const diffs: string[] = []

  const a = JSON.stringify(actual)
  const b = JSON.stringify(expected)

  if (a !== b) {
    diffs.push("Conteúdo normalizado diverge do golden esperado.")
  }

  return {
    equal: diffs.length === 0,
    differences: diffs,
  }
}

export function buildMetrics(input: Partial<ScrapingQualityMetrics>): ScrapingQualityMetrics {
  const rawTotal = Math.max(0, input.raw_total ?? 0)
  const parsedOk = Math.max(0, input.parsed_ok ?? 0)

  return {
    raw_total: rawTotal,
    parsed_ok: parsedOk,
    parse_errors: Math.max(0, input.parse_errors ?? 0),
    deduplicated: Math.max(0, input.deduplicated ?? 0),
    discarded: Math.max(0, input.discarded ?? 0),
    coverage_ratio: rawTotal === 0 ? 1 : parsedOk / rawTotal,
  }
}

export function createReport(
  payload: ApiPayloadV1,
  metrics: ScrapingQualityMetrics
): ScrapingQualityReport {
  const contract = validatePayloadV1(payload)
  const reasons: string[] = []

  if (!contract.valid) {
    reasons.push("Falha de contrato ApiPayloadV1.")
  }

  return {
    generated_at: new Date().toISOString(),
    status: contract.valid ? "pass" : "fail",
    reasons,
    metrics,
    contract,
  }
}
